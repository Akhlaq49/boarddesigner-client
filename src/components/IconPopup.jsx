import React from 'react';

function IconPopup({ show, onClose, icons, onSelectIcon }) {
  if (!show) return null;

  return (
    <div className="icon-popup-modal">
      <div className="icon-popup-overlay" onClick={onClose}></div>
      <div className="icon-popup-content">
        <div className="icon-popup-header">
          <h3 className="text-lg font-semibold">Select Icon</h3>
          <button type="button" className="icon-popup-close" onClick={onClose} aria-label="Close">
            <span>&times;</span>
          </button>
        </div>
        <div className="icon-popup-body">
          <div className="icon-grid grid grid-cols-6 gap-3 max-h-96 overflow-y-auto p-4">
            {icons.map((icon, index) => (
              <div
                key={index}
                className="icon-item cursor-pointer"
                onClick={() => onSelectIcon(icon)}
              >
                <img src={`/ican/images/${icon}`} alt={icon} className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IconPopup;

