import React, { useState, useEffect } from 'react';

// Icon categories and their descriptions
const ICON_CATEGORIES = {
  'AC': 'Air Conditioner',
  'BC': 'Building Control', 
  'C&CM': 'Communication',
  'C&H': 'Cooling & Heating',
  'C': 'Control',
  'CB': 'Window draperies',
  'D': 'Dimming',
  'E&R': 'Entertainment',
  'G&S': 'Garden & Security',
  'H&HS': 'HVAC',
  'H&S': 'Home Security',
  'IU': 'Interface Unit',
  'KC': 'Kitchen Control',
  'LL': 'Lighting',
  'M&H': 'Music & Home',
  'M&T': 'Music & Theatre',
  'OB': 'Office Building',
  'S&G': 'Safety & Garden',
  'SCS': 'Smart Control System'
};

// Function to extract readable icon name from filename
function getIconDisplayInfo(iconFilename) {
  if (!iconFilename) return null;
  
  // Remove .svg extension and decode URI
  let name = iconFilename.replace('.svg', '').replace('%20', ' ');
  
  // Find category prefix
  const categoryPrefix = Object.keys(ICON_CATEGORIES).find(prefix => 
    name.startsWith(prefix + '-') || name.startsWith(prefix)
  );
  
  const description = categoryPrefix ? ICON_CATEGORIES[categoryPrefix] : 'Icon';
  
  return {
    name: name,
    description: description
  };
}

function ButtonParts({
  selectedButton,
  setSelectedButton,
  showIconPopup,
  setShowIconPopup,
  setCurrentIconPosition,
  applyIconToButton,
  applyTextToButton,
  showFeedback,
  fullColor,
  selectedColor,
  getColorValue,
  getTextureImage,
  dropZones,
  selectedButtonPart,
  setSelectedButtonPart,
  labelOnly = false
}) {
  const [activeTab, setActiveTab] = useState(labelOnly ? 'label' : 'parts');
  const [positionTypes, setPositionTypes] = useState({
    s0: 'empty',
    s1: 'empty',
    s2: 'empty'
  });
  const [textValues, setTextValues] = useState({
    s0: '',
    s1: '',
    s2: ''
  });

  const handlePositionTypeChange = (position, type) => {
    setPositionTypes(prev => ({ ...prev, [position]: type }));
    
    // If type is 'empty', clear the icon/text from the button
    if (type === 'empty' && selectedButton) {
      applyTextToButton(selectedButton, position, '');
    }
  };

  const handleTextChange = (position, value) => {
    setTextValues(prev => ({ ...prev, [position]: value }));
    if (selectedButton) {
      applyTextToButton(selectedButton, position, value);
    }
  };

  // Sync text values when button is selected
  useEffect(() => {
    if (labelOnly && activeTab !== 'label') {
      setActiveTab('label');
    }
    if (selectedButton && dropZones[selectedButton]) {
      const zone = dropZones[selectedButton];
      const primaryZoneId = zone.isPrimary ? selectedButton : (zone.mergedInto || selectedButton);
      const primaryZone = dropZones[primaryZoneId] || zone;
      
      // Update position types and text values
      const newPositionTypes = { s0: 'empty', s1: 'empty', s2: 'empty' };
      const newTextValues = { s0: '', s1: '', s2: '' };
      
      ['s0', 's1', 's2'].forEach(pos => {
        if (primaryZone[pos]) {
          if (primaryZone[pos].type === 'icon') {
            newPositionTypes[pos] = 'icon';
          } else if (primaryZone[pos].type === 'text') {
            newPositionTypes[pos] = 'text';
            newTextValues[pos] = primaryZone[pos].value || '';
          }
        }
      });
      
      setPositionTypes(newPositionTypes);
      setTextValues(newTextValues);
    } else {
      // Reset when no button is selected
      setPositionTypes({ s0: 'empty', s1: 'empty', s2: 'empty' });
      setTextValues({ s0: '', s1: '', s2: '' });
    }
  }, [activeTab, labelOnly, selectedButton, dropZones]);

  // Check if selected button is a button with dots (PBlock or other dot buttons)
  const selectedZone = selectedButton ? dropZones[selectedButton] : null;
  const selectedButtonType = selectedZone?.dimensions?.buttonType ?? selectedZone?.buttonType ?? selectedZone?.type;
  const isPBlockButton = !!selectedZone && [5, 6, 7, 8, 9, 10, 11].includes(selectedButtonType);
  const isSingleCellButton = !!selectedZone && selectedZone?.dimensions?.colSpan === 1 && selectedZone?.dimensions?.rowSpan === 1;
  const disableOuterPositions = !isPBlockButton && isSingleCellButton;

  const handleDragStart = (e, buttonType) => {
    const dimensions = {
      1: { colSpan: 1, rowSpan: 1 },
      2: { colSpan: 2, rowSpan: 1 },
      3: { colSpan: 1, rowSpan: 2 },
      4: { colSpan: 2, rowSpan: 2 },
      5: { colSpan: 1, rowSpan: 2 },
      6: { colSpan: 2, rowSpan: 1 },
      7: { colSpan: 1, rowSpan: 1 },
      8: { colSpan: 1, rowSpan: 1 }, // PBlock Single Button
      9: { colSpan: 2, rowSpan: 1 }, // PBlock Wide Button
      10: { colSpan: 1, rowSpan: 2 }, // PBlock Tall Button
      11: { colSpan: 1, rowSpan: 1 }  // PBlock Square Button (2 vertical dots)
    }[buttonType] || { colSpan: 1, rowSpan: 1 };

    const data = {
      buttonType,
      colSpan: dimensions.colSpan,
      rowSpan: dimensions.rowSpan,
      color: selectedColor || fullColor || null // Include selected color in drag data
    };

    e.dataTransfer.setData('text/plain', JSON.stringify(data));
    e.dataTransfer.setData('buttonType', buttonType); // Fallback
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleOpenIconPopup = (position) => {
    if (!selectedButton) {
      showFeedback('Please select a button first', 'info');
      return;
    }
    setCurrentIconPosition(position);
    setShowIconPopup(true);
  };

  const handleButtonPartClick = (buttonType) => {
    // Click-to-apply: select button part, then user can click on a zone to place it
    setSelectedButtonPart(buttonType);
    showFeedback(`Button ${buttonType} selected. Click on a zone to place it.`, 'info');
  };

  return (
    <div className="h-full">
      {!labelOnly && (
        <div className="relative x-tab-group">
          <div className="flex relative overflow-hidden max-w-full max-h-full">
            <div className="relative overflow-auto w-full">
              <div className="relative flex min-w-full w-fit border-b border-secondary-200 dark:border-secondary-700">
                <button
                  type="button"
                  className={`x-tab ${activeTab === 'parts' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('parts');
                    setSelectedButton(null);
                    setSelectedButtonPart(null);
                  }}
                >
                  <div className="font-medium">Button Parts</div>
                </button>
                <button
                  type="button"
                  className={`x-tab ${activeTab === 'label' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('label');
                    setSelectedButtonPart(null);
                  }}
                >
                  <div className="font-medium">Icon & Text</div>
                </button>
                {/* <button
                  type="button"
                  className={`x-tab ${activeTab === 'pblock' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('pblock');
                    setSelectedButton(null);
                    setSelectedButtonPart(null);
                  }}
                >
                  <div className="font-medium">PBlock Buttons</div>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Button Parts Tab Panel */}
      {activeTab === 'parts' && (
        <div role="tabpanel" className="py-2 animate-fade-in">
          <div className="grid grid-cols-2 grid-rows-5 gap-3">
            <button
              type="button"
              className={`custom-button-1 polar-white draggable-btn ${selectedButtonPart === 1 ? 'selected-part' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, 1)}
              onDragEnd={handleDragEnd}
              onClick={() => handleButtonPartClick(1)}
              data-button-type="1"
              style={(fullColor || selectedColor) ? { 
                backgroundColor: getColorValue(fullColor || selectedColor),
                backgroundImage: getTextureImage(fullColor || selectedColor) ? `url(${getTextureImage(fullColor || selectedColor)})` : undefined
              } : {}}
            ></button>
            <button
              type="button"
              className={`custom-button-3 row-span-2 polar-white ring-2 ring-secondary-700 dark:ring-secondary-200 draggable-btn ${selectedButtonPart === 3 ? 'selected-part' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, 3)}
              onDragEnd={handleDragEnd}
              onClick={() => handleButtonPartClick(3)}
              data-button-type="3"
              style={(fullColor || selectedColor) ? { 
                backgroundColor: getColorValue(fullColor || selectedColor),
                backgroundImage: getTextureImage(fullColor || selectedColor) ? `url(${getTextureImage(fullColor || selectedColor)})` : undefined
              } : {}}
            ></button>
            <button
              type="button"
              className={`custom-button-2 col-span-2 polar-white draggable-btn ${selectedButtonPart === 2 ? 'selected-part' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, 2)}
              onDragEnd={handleDragEnd}
              onClick={() => handleButtonPartClick(2)}
              data-button-type="2"
              style={(fullColor || selectedColor) ? { 
                backgroundColor: getColorValue(fullColor || selectedColor),
                backgroundImage: getTextureImage(fullColor || selectedColor) ? `url(${getTextureImage(fullColor || selectedColor)})` : undefined
              } : {}}
            ></button>
            <button
              type="button"
              className={`custom-button-4 col-span-2 row-span-2 polar-white draggable-btn ${selectedButtonPart === 4 ? 'selected-part' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, 4)}
              onDragEnd={handleDragEnd}
              onClick={() => handleButtonPartClick(4)}
              data-button-type="4"
              style={(fullColor || selectedColor) ? { 
                backgroundColor: getColorValue(fullColor || selectedColor),
                backgroundImage: getTextureImage(fullColor || selectedColor) ? `url(${getTextureImage(fullColor || selectedColor)})` : undefined
              } : {}}
            ></button>
          </div>
          <div className="flex flex-row gap-2 my-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div><i className="fas fa-info-circle text-blue-600 dark:text-blue-400"></i></div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Drag and drop parts over the device.</div>
          </div>
        </div>
      )}

      {/* Icon & Text Tab Panel */}
      {activeTab === 'label' && (
        <div role="tabpanel" className="py-2 animate-fade-in" style={{ position: 'relative', minHeight: '500px' }}>
          <div className="flex flex-col icon-text-config h-full" style={{ position: 'relative', zIndex: 1 }}>
            {/* Helper text for PBlock buttons */}
            {isPBlockButton && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 mt-0.5"></i>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Tip:</strong> You can add different icons/text to BOTH zones. Use "First Zone" for the first square and "Second Zone" for the second square.
                  </div>
                </div>
              </div>
            )}
            {/* Right / Top Position */}
            <fieldset className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
              <legend className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {isPBlockButton ? 'First Zone' : 'Right / Top'}
              </legend>
              <div className="flex flex-row items-center">
                {['empty', 'icon', 'text'].map(type => (
                  <label key={type} className="x-radio inline-block relative cursor-pointer">
                    <div className="flex items-center">
                      <input
                        name="s0"
                        type="radio"
                        className="invisible absolute"
                        value={type}
                        checked={positionTypes.s0 === type}
                        onChange={() => handlePositionTypeChange('s0', type)}
                        disabled={disableOuterPositions || (!isPBlockButton && selectedZone && selectedZone.size === 'small')}
                      />
                      <div className={`radio-circle ${positionTypes.s0 === type ? 'checked' : ''}`}></div>
                      <div className="text-sm pl-2 font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="min-h-10 mt-2">
                {positionTypes.s0 === 'icon' && (
                  <>
                    {selectedZone?.s0?.value ? (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                        <img 
                          src={`/ican/images/${selectedZone.s0.value}`} 
                          alt="Selected icon" 
                          className="w-6 h-6 object-contain"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {getIconDisplayInfo(selectedZone.s0.value)?.name || selectedZone.s0.value.replace('.svg', '')}
                          </span>
                          <span className="text-xs text-gray-600">
                            {getIconDisplayInfo(selectedZone.s0.value)?.description}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="open-icon-popup-btn x-button raised px-4 py-2 text-sm transition-all hover:scale-105"
                        onClick={() => handleOpenIconPopup('s0')}
                        disabled={disableOuterPositions}
                      >
                        <i className="fas fa-image mr-2"></i>
                        <span>Select Icon</span>
                      </button>
                    )}
                  </>
                )}
                {positionTypes.s0 === 'text' && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Enter text here..."
                      className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={textValues.s0}
                      onChange={(e) => handleTextChange('s0', e.target.value)}
                      disabled={disableOuterPositions}
                    />
                  </div>
                )}
              </div>
              {disableOuterPositions && (
                <div className="mt-2 text-xs text-gray-500"></div>
              )}
            </fieldset>

            {/* Center Position */}
            <fieldset className=" p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
              <legend className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {isPBlockButton ? 'Second Zone' : 'Center'}
              </legend>
              <div className="flex flex-row items-center">
                {['empty', 'icon', 'text'].map(type => (
                  <label key={type} className="x-radio inline-block relative cursor-pointer">
                    <div className="flex items-center">
                      <input
                        name="s1"
                        type="radio"
                        className="invisible absolute"
                        value={type}
                        checked={positionTypes.s1 === type}
                        onChange={() => handlePositionTypeChange('s1', type)}
                      />
                      <div className={`radio-circle ${positionTypes.s1 === type ? 'checked' : ''}`}></div>
                      <div className="text-sm pl-2 font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="min-h-10 mt-2">
                {positionTypes.s1 === 'icon' && (
                  <>
                    {selectedZone?.s1?.value ? (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                        <img 
                          src={`/ican/images/${selectedZone.s1.value}`} 
                          alt="Selected icon" 
                          className="w-6 h-6 object-contain"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {getIconDisplayInfo(selectedZone.s1.value)?.name || selectedZone.s1.value.replace('.svg', '')}
                          </span>
                          <span className="text-xs text-gray-600">
                            {getIconDisplayInfo(selectedZone.s1.value)?.description}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="open-icon-popup-btn x-button raised px-4 py-2 text-sm transition-all hover:scale-105"
                        onClick={() => handleOpenIconPopup('s1')}
                      >
                        <i className="fas fa-image mr-2"></i>
                        <span>Select Icon</span>
                      </button>
                    )}
                  </>
                )}
                {positionTypes.s1 === 'text' && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Enter text here..."
                      className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={textValues.s1}
                      onChange={(e) => handleTextChange('s1', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </fieldset>

            {/* Left / Bottom Position - Hidden for PBlock buttons */}
            {!isPBlockButton && (
              <fieldset className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                <legend className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Left / Bottom</legend>
              <div className="flex flex-row items-center">
                {['empty', 'icon', 'text'].map(type => (
                  <label key={type} className="x-radio inline-block relative cursor-pointer">
                    <div className="flex items-center">
                      <input
                        name="s2"
                        type="radio"
                        className="invisible absolute"
                        value={type}
                        checked={positionTypes.s2 === type}
                        onChange={() => handlePositionTypeChange('s2', type)}
                        disabled={disableOuterPositions || (!isPBlockButton && selectedZone && selectedZone.size === 'small')}
                      />
                      <div className={`radio-circle ${positionTypes.s2 === type ? 'checked' : ''}`}></div>
                      <div className="text-sm pl-2 font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="min-h-10 mt-2">
                {positionTypes.s2 === 'icon' && (
                  <>
                    {selectedZone?.s2?.value ? (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                        <img 
                          src={`/ican/images/${selectedZone.s2.value}`} 
                          alt="Selected icon" 
                          className="w-6 h-6 object-contain"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {getIconDisplayInfo(selectedZone.s2.value)?.name || selectedZone.s2.value.replace('.svg', '')}
                          </span>
                          <span className="text-xs text-gray-600">
                            {getIconDisplayInfo(selectedZone.s2.value)?.description}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="open-icon-popup-btn x-button raised px-4 py-2 text-sm transition-all hover:scale-105"
                        onClick={() => handleOpenIconPopup('s2')}
                        disabled={disableOuterPositions}
                      >
                        <i className="fas fa-image mr-2"></i>
                        <span>Select Icon</span>
                      </button>
                    )}
                  </>
                )}
                {positionTypes.s2 === 'text' && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Enter text here..."
                      className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={textValues.s2}
                      onChange={(e) => handleTextChange('s2', e.target.value)}
                      disabled={disableOuterPositions}
                    />
                  </div>
                )}
              </div>
              {disableOuterPositions && (
                <div className="mt-2 text-xs text-gray-500"></div>
              )}
            </fieldset>
            )}
          </div>
          {/* Overlay when no button is selected */}
          {!selectedButton && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(100, 116, 139, 0.85)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px'
            }}>
              <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>Select Button</div>
            </div>
          )}
        </div>
      )}

      {/* PBlock Buttons Tab Panel */}
      {activeTab === 'pblock' && (
        <div role="tabpanel" className="py-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-3" style={{ width: '204px', height: '280px' }}>
            <button
              type="button"
              className={`custom-button-1 polar-white draggable-btn ${selectedButtonPart === 8 ? 'selected-part' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, 8)}
              onDragEnd={handleDragEnd}
              onClick={() => handleButtonPartClick(8)}
              data-button-type="8"
              title="PBlock Single Button"
              style={(fullColor || selectedColor) ? { 
                backgroundColor: getColorValue(fullColor || selectedColor),
                backgroundImage: getTextureImage(fullColor || selectedColor) ? `url(${getTextureImage(fullColor || selectedColor)})` : undefined
              } : {}}
            >
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 8px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(0,0,0,0.4)', border: '2px solid rgba(0,0,0,0.6)' }}></div>
                <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(0,0,0,0.4)', border: '2px solid rgba(0,0,0,0.6)' }}></div>
              </div>
            </button>
            <button
              type="button"
              className={`custom-button-11 polar-white draggable-btn ${selectedButtonPart === 11 ? 'selected-part' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, 11)}
              onDragEnd={handleDragEnd}
              onClick={() => handleButtonPartClick(11)}
              data-button-type="11"
              title="Square Button (2 vertical positions)"
              style={(fullColor || selectedColor) ? { 
                backgroundColor: getColorValue(fullColor || selectedColor),
                backgroundImage: getTextureImage(fullColor || selectedColor) ? `url(${getTextureImage(fullColor || selectedColor)})` : undefined
              } : {}}
            >
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(0,0,0,0.4)', border: '2px solid rgba(0,0,0,0.6)' }}></div>
                <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(0,0,0,0.4)', border: '2px solid rgba(0,0,0,0.6)' }}></div>
              </div>
            </button>
            <button
              type="button"
              className={`custom-button-2 col-span-2 polar-white draggable-btn ${selectedButtonPart === 9 ? 'selected-part' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, 9)}
              onDragEnd={handleDragEnd}
              onClick={() => handleButtonPartClick(9)}
              data-button-type="9"
              title="PBlock Wide Button (2 positions)"
              style={(fullColor || selectedColor) ? { 
                backgroundColor: getColorValue(fullColor || selectedColor),
                backgroundImage: getTextureImage(fullColor || selectedColor) ? `url(${getTextureImage(fullColor || selectedColor)})` : undefined
              } : {}}
            >
              <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(0,0,0,0.4)', border: '2px solid rgba(0,0,0,0.6)' }}></div>
                <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(0,0,0,0.4)', border: '2px solid rgba(0,0,0,0.6)' }}></div>
              </div>
            </button>
          </div>
          <div className="flex flex-row gap-2 my-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div><i className="fas fa-info-circle text-blue-600 dark:text-blue-400"></i></div>
            <div className="text-xs text-blue-700 dark:text-blue-300">PBlock buttons with editable square zones. Click zones to add icons/text, drag to reposition.</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ButtonParts;

