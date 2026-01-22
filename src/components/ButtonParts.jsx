import React, { useState } from 'react';

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
  getTextureImage
}) {
  const [activeTab, setActiveTab] = useState('parts');
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
  };

  const handleTextChange = (position, value) => {
    setTextValues(prev => ({ ...prev, [position]: value }));
    if (value && selectedButton) {
      applyTextToButton(selectedButton, position, value);
    }
  };

  const handleDragStart = (e, buttonType) => {
    const dimensions = {
      1: { colSpan: 1, rowSpan: 1 },
      2: { colSpan: 2, rowSpan: 1 },
      3: { colSpan: 1, rowSpan: 2 },
      4: { colSpan: 2, rowSpan: 2 }
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

  return (
    <div className="h-full">
      <div className="relative x-tab-group">
        <div className="flex relative overflow-hidden max-w-full max-h-full">
          <div className="relative overflow-auto w-full">
            <div className="relative flex min-w-full w-fit border-b border-secondary-200 dark:border-secondary-700">
              <button
                type="button"
                className={`x-tab ${activeTab === 'parts' ? 'active' : ''}`}
                onClick={() => setActiveTab('parts')}
              >
                <div className="font-medium">Button Parts</div>
              </button>
              <button
                type="button"
                className={`x-tab ${activeTab === 'label' ? 'active' : ''}`}
                onClick={() => setActiveTab('label')}
              >
                <div className="font-medium">Icon & Text</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Button Parts Tab Panel */}
      {activeTab === 'parts' && (
        <div role="tabpanel" className="py-2 animate-fade-in">
          <div className="grid grid-cols-2 grid-rows-5 gap-3">
            <button
              type="button"
              className="custom-button-1 polar-white draggable-btn"
              draggable
              onDragStart={(e) => handleDragStart(e, 1)}
              onDragEnd={handleDragEnd}
              data-button-type="1"
              style={(fullColor || selectedColor) ? { 
                backgroundColor: getColorValue(fullColor || selectedColor),
                backgroundImage: getTextureImage(fullColor || selectedColor) ? `url(${getTextureImage(fullColor || selectedColor)})` : undefined
              } : {}}
            ></button>
            <button
              type="button"
              className="custom-button-3 row-span-2 polar-white ring-2 ring-secondary-700 dark:ring-secondary-200 draggable-btn"
              draggable
              onDragStart={(e) => handleDragStart(e, 3)}
              onDragEnd={handleDragEnd}
              data-button-type="3"
              style={(fullColor || selectedColor) ? { 
                backgroundColor: getColorValue(fullColor || selectedColor),
                backgroundImage: getTextureImage(fullColor || selectedColor) ? `url(${getTextureImage(fullColor || selectedColor)})` : undefined
              } : {}}
            ></button>
            <button
              type="button"
              className="custom-button-2 col-span-2 polar-white draggable-btn"
              draggable
              onDragStart={(e) => handleDragStart(e, 2)}
              onDragEnd={handleDragEnd}
              data-button-type="2"
              style={(fullColor || selectedColor) ? { 
                backgroundColor: getColorValue(fullColor || selectedColor),
                backgroundImage: getTextureImage(fullColor || selectedColor) ? `url(${getTextureImage(fullColor || selectedColor)})` : undefined
              } : {}}
            ></button>
            <button
              type="button"
              className="custom-button-4 col-span-2 row-span-2 polar-white draggable-btn"
              draggable
              onDragStart={(e) => handleDragStart(e, 4)}
              onDragEnd={handleDragEnd}
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
            {/* Right / Top Position */}
            <fieldset className="mb-5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
              <legend className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Right / Top</legend>
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
                      />
                      <div className={`radio-circle ${positionTypes.s0 === type ? 'checked' : ''}`}></div>
                      <div className="text-sm pl-2 font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="h-10 mt-2">
                {positionTypes.s0 === 'icon' && (
                  <button
                    type="button"
                    className="open-icon-popup-btn x-button raised px-4 py-2 text-sm transition-all hover:scale-105"
                    onClick={() => handleOpenIconPopup('s0')}
                  >
                    <i className="fas fa-image mr-2"></i>
                    <span>Select Icon</span>
                  </button>
                )}
                {positionTypes.s0 === 'text' && (
                  <input
                    type="text"
                    placeholder="Enter text here..."
                    className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={textValues.s0}
                    onChange={(e) => handleTextChange('s0', e.target.value)}
                  />
                )}
              </div>
            </fieldset>

            {/* Center Position */}
            <fieldset className="mb-5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
              <legend className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Center</legend>
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
                  <input
                    type="text"
                    placeholder="Enter text here..."
                    className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={textValues.s1}
                    onChange={(e) => handleTextChange('s1', e.target.value)}
                  />
                )}
              </div>
            </fieldset>

            {/* Left / Bottom Position */}
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
                      />
                      <div className={`radio-circle ${positionTypes.s2 === type ? 'checked' : ''}`}></div>
                      <div className="text-sm pl-2 font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="h-10 mt-2">
                {positionTypes.s2 === 'icon' && (
                  <button
                    type="button"
                    className="open-icon-popup-btn x-button raised px-4 py-2 text-sm transition-all hover:scale-105"
                    onClick={() => handleOpenIconPopup('s2')}
                  >
                    <i className="fas fa-image mr-2"></i>
                    <span>Select Icon</span>
                  </button>
                )}
                {positionTypes.s2 === 'text' && (
                  <input
                    type="text"
                    placeholder="Enter text here..."
                    className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={textValues.s2}
                    onChange={(e) => handleTextChange('s2', e.target.value)}
                  />
                )}
              </div>
            </fieldset>
          </div>
        </div>
      )}
    </div>
  );
}

export default ButtonParts;

