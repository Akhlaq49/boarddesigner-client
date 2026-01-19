import React from 'react';

const COLORS = [
  { name: 'polar-white', value: '#ffffff' },
  { name: 'royal-silver', value: '#cbd5e1' },
  { name: 'anthracite-gray', value: '#475569' },
  { name: 'meteor-black', value: '#1e293b' },
  { name: 'texture-black', value: '#0f172a' },
  { name: 'pure-gold', value: '#fbbf24' },
  { name: 'antique-copper', value: '#b45309' },
  { name: 'antique-bronze', value: '#78350f' },
  { name: 'red-cherry', value: '#dc2626' },
  { name: 'green-leaf', value: '#16a34a' }
];

function ButtonColorPopup({ show, onClose, onSelectColor }) {
  if (!show) return null;

  return (
    <div className="button-color-popup">
      <div className="button-color-overlay" onClick={onClose}></div>
      <div className="button-color-content">
        <div className="button-color-header">
          <h3 className="text-lg font-semibold">Select Button Color</h3>
          <button type="button" className="button-color-close" onClick={onClose} aria-label="Close">
            <span>&times;</span>
          </button>
        </div>
        <div className="button-color-body">
          <div className="flex flex-col gap-2 color-palette-list p-4">
            {COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                className="color-btn"
                style={{ backgroundColor: color.value }}
                onClick={() => onSelectColor(color.name)}
                title={color.name}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ButtonColorPopup;

