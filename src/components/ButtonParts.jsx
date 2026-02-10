import React, { useState, useEffect } from 'react';

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
  const [textColors, setTextColors] = useState({
    s0: '#ffffff',
    s1: '#ffffff',
    s2: '#ffffff'
  });

  const handlePositionTypeChange = (position, type) => {
    setPositionTypes(prev => ({ ...prev, [position]: type }));
    if (type === 'empty' && selectedButton) {
      // Remove icon/text from this slot
      applyTextToButton(selectedButton, position, '', '');
      if (applyIconToButton) applyIconToButton(selectedButton, position, '');
    }
  };

  const handleTextChange = (position, value) => {
    setTextValues(prev => ({ ...prev, [position]: value }));
    if (selectedButton) {
      applyTextToButton(selectedButton, position, value, textColors[position]);
    }
  };

  const handleTextColorChange = (position, color) => {
    setTextColors(prev => ({ ...prev, [position]: color }));
    if (selectedButton && textValues[position]) {
      applyTextToButton(selectedButton, position, textValues[position], color);
    }
  };

  // Sync text values and colors when button is selected
  useEffect(() => {
    if (labelOnly && activeTab !== 'label') {
      setActiveTab('label');
    }
    if (selectedButton && dropZones[selectedButton]) {
      const zone = dropZones[selectedButton];
      const primaryZoneId = zone.isPrimary ? selectedButton : (zone.mergedInto || selectedButton);
      const primaryZone = dropZones[primaryZoneId] || zone;
      
      // Update position types
      const newPositionTypes = { s0: 'empty', s1: 'empty', s2: 'empty' };
      const newTextValues = { s0: '', s1: '', s2: '' };
      const newTextColors = { s0: '#ffffff', s1: '#ffffff', s2: '#ffffff' };
      
      ['s0', 's1', 's2'].forEach(pos => {
        if (primaryZone[pos]) {
          if (primaryZone[pos].type === 'icon') {
            newPositionTypes[pos] = 'icon';
          } else if (primaryZone[pos].type === 'text') {
            newPositionTypes[pos] = 'text';
            newTextValues[pos] = primaryZone[pos].value || '';
            newTextColors[pos] = primaryZone[pos].color || '#ffffff';
          }
        }
      });
      
      setPositionTypes(newPositionTypes);
      setTextValues(newTextValues);
      setTextColors(newTextColors);
    } else {
      // Reset when no button is selected
      setPositionTypes({ s0: 'empty', s1: 'empty', s2: 'empty' });
      setTextValues({ s0: '', s1: '', s2: '' });
      setTextColors({ s0: '#ffffff', s1: '#ffffff', s2: '#ffffff' });
    }
  }, [activeTab, labelOnly, selectedButton, dropZones]);

  // Check if selected button is a button with dots (PBlock or other dot buttons)
  const selectedZone = selectedButton ? dropZones[selectedButton] : null;
  const selectedButtonType = selectedZone?.dimensions?.buttonType ?? selectedZone?.buttonType ?? selectedZone?.type;
  const isPBlockButton = !!selectedZone && [5, 6, 7, 8, 9, 10, 11].includes(selectedButtonType);
  // Small button: only 1x1 (single cell)
  const isSmallButton = !!selectedZone && (
    (selectedZone.colSpan === 1 && selectedZone.rowSpan === 1) ||
    selectedButtonType === 1 || selectedButtonType === 7 || selectedButtonType === 8 || selectedButtonType === 11
  );

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
                    setSelectedButton(null);
                    setSelectedButtonPart(null);
                  }}
                >
                  <div className="font-medium">Icon & Text</div>
                </button>
                <button
                  type="button"
                  className={`x-tab ${activeTab === 'pblock' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('pblock');
                    setSelectedButton(null);
                    setSelectedButtonPart(null);
                  }}
                >
                  <div className="font-medium">PBlock Buttons</div>
                </button>
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
        <div role="tabpanel" className="py-2 animate-fade-in">
          <div className="relative flex flex-col icon-text-config">
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
            <fieldset className="mb-5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
              <legend className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {isPBlockButton ? 'First Zone' : 'Right / Top'}
              </legend>
              <div className="flex flex-row items-center gap-4">
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
                        disabled={isSmallButton}
                      />
                      <div className={`radio-circle ${positionTypes.s0 === type ? 'checked' : ''} ${isSmallButton ? 'opacity-50' : ''}`}></div>
                      <div className="text-sm pl-2 font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="h-10 mt-2">
                {positionTypes.s0 === 'icon' && !isSmallButton && (
                  <button
                    type="button"
                    className="open-icon-popup-btn x-button raised px-4 py-2 text-sm transition-all hover:scale-105"
                    onClick={() => handleOpenIconPopup('s0')}
                  >
                    <i className="fas fa-image mr-2"></i>
                    <span>Select Icon</span>
                  </button>
                )}
                {positionTypes.s0 === 'text' && !isSmallButton && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Enter text here..."
                      className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={textValues.s0}
                      onChange={(e) => handleTextChange('s0', e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Color:</label>
                      <select
                        value={textColors.s0}
                        onChange={(e) => handleTextColorChange('s0', e.target.value)}
                        className="w-20 px-2 py-1 text-xs border rounded"
                        title="Select text color"
                      >
                        <option value="#000000">Black</option>
                        <option value="#ffffff">White</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </fieldset>

            {/* Center Position */}
            <fieldset className="mb-5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
              <legend className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {isPBlockButton ? 'Second Zone' : 'Center'}
              </legend>
              <div className="flex flex-row items-center gap-4">
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
              <div className="h-10 mt-2">
                {positionTypes.s1 === 'icon' && (
                  <button
                    type="button"
                    className="open-icon-popup-btn x-button raised px-4 py-2 text-sm transition-all hover:scale-105"
                    onClick={() => handleOpenIconPopup('s1')}
                  >
                    <i className="fas fa-image mr-2"></i>
                    <span>Select Icon</span>
                  </button>
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
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Color:</label>
                      <select
                        value={textColors.s1}
                        onChange={(e) => handleTextColorChange('s1', e.target.value)}
                        className="w-20 px-2 py-1 text-xs border rounded"
                        title="Select text color"
                      >
                        <option value="#000000">Black</option>
                        <option value="#ffffff">White</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </fieldset>

            {/* Left / Bottom Position - Hidden for PBlock buttons */}
            {!isPBlockButton && (
              <fieldset className="mb-5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                <legend className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Left / Bottom</legend>
              <div className="flex flex-row items-center gap-4">
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
                        disabled={isSmallButton}
                      />
                      <div className={`radio-circle ${positionTypes.s2 === type ? 'checked' : ''} ${isSmallButton ? 'opacity-50' : ''}`}></div>
                      <div className="text-sm pl-2 font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="h-10 mt-2">
                {positionTypes.s2 === 'icon' && !isSmallButton && (
                  <button
                    type="button"
                    className="open-icon-popup-btn x-button raised px-4 py-2 text-sm transition-all hover:scale-105"
                    onClick={() => handleOpenIconPopup('s2')}
                  >
                    <i className="fas fa-image mr-2"></i>
                    <span>Select Icon</span>
                  </button>
                )}
                {positionTypes.s2 === 'text' && !isSmallButton && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Enter text here..."
                      className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={textValues.s2}
                      onChange={(e) => handleTextChange('s2', e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Color:</label>
                      <select
                        value={textColors.s2}
                        onChange={(e) => handleTextColorChange('s2', e.target.value)}
                        className="w-20 px-2 py-1 text-xs border rounded"
                        title="Select text color"
                      >
                        <option value="#000000">Black</option>
                        <option value="#ffffff">White</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </fieldset>
            )}
          </div>
        </div>
      )}

      {/* PBlock Buttons Tab Panel */}
      {activeTab === 'pblock' && (
        <div role="tabpanel" className="py-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
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

