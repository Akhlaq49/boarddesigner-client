import React, { useState } from 'react';

const COLORS = [
  { name: 'polar-white', value: '#ffffff', label: 'Polar White' },
  { name: 'royal-silver', value: '#cbd5e1', label: 'Royal Silver' },
  { name: 'anthracite-gray', value: '#475569', label: 'Anthracite Gray' },
  { name: 'meteor-black', value: '#1e293b', label: 'Meteor Black' },
  { name: 'texture-black', value: '#0f172a', label: 'Texture Black' },
  { name: 'pure-gold', value: '#fbbf24', label: 'Pure Gold' },
  { name: 'antique-copper', value: '#b45309', label: 'Antique Copper' },
  { name: 'antique-bronze', value: '#78350f', label: 'Antique Bronze' },
  { name: 'red-cherry', value: '#dc2626', label: 'Red Cherry' },
  { name: 'green-leaf', value: '#16a34a', label: 'Green Leaf' }
];

function ColorPalette({
  selectedColor,
  setSelectedColor,
  applyFrameColor,
  applyFullColor,
  showFeedback
}) {
  const [activeTab, setActiveTab] = useState('textures');
  const [activeColor, setActiveColor] = useState('royal-silver');

  const handleColorClick = (colorName) => {
    setSelectedColor(colorName);
    setActiveColor(colorName);
  };

  const handleFrameClick = (colorName) => {
    applyFrameColor(colorName);
  };

  const handleAllClick = (colorName) => {
    applyFullColor(colorName);
  };

  return (
    <div className="h-full">
      <div className="relative x-tab-group">
        <div className="flex relative overflow-hidden max-w-full max-h-full">
          <div className="relative overflow-auto w-full">
            <div className="relative flex min-w-full w-fit border-b border-secondary-200 dark:border-secondary-700">
              <button
                type="button"
                className={`x-tab color-tab ${activeTab === 'textures' ? 'active' : ''}`}
                onClick={() => setActiveTab('textures')}
              >
                <div className="font-medium">Textures</div>
              </button>
              <button
                type="button"
                className={`x-tab color-tab ${activeTab === 'wall' ? 'active' : ''}`}
                onClick={() => setActiveTab('wall')}
              >
                <div className="font-medium">Wall Color</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'textures' && (
        <div role="tabpanel" className="py-2">
          <div className="flex flex-col gap-2 color-palette-list">
            {COLORS.map(color => (
              <div
                key={color.name}
                className={`pattern-select relative ${activeColor === color.name ? 'active' : ''}`}
                data-color={color.name}
              >
                <button
                  type="button"
                  className={`btn pattern h-9 ${color.name} color-btn`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleColorClick(color.name)}
                  title={color.label}
                  data-color-name={color.name}
                ></button>
                <div className="color-actions">
                  <button
                    type="button"
                    className="x-button frame-color-btn"
                    onClick={() => handleFrameClick(color.name)}
                    data-place="frame"
                    data-color={color.name}
                  >
                    <span>FRAME</span>
                  </button>
                  <button
                    type="button"
                    className="x-button all-color-btn"
                    onClick={() => handleAllClick(color.name)}
                    data-place="full"
                    data-color={color.name}
                  >
                    <span>ALL</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'wall' && (
        <div role="tabpanel" className="py-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Wall color options coming soon...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPalette;

