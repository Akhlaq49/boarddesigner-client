import React from 'react';

function IconPopup({ show, onClose, icons, onSelectIcon }) {
  if (!show) return null;

  return (
    <div className="icon-popup-modal animate-fade-in">
      <div className="icon-popup-overlay" onClick={onClose}></div>
      <div className="icon-popup-content animate-slide-up">
        <div className="icon-popup-header">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i className="fas fa-image text-blue-600"></i>
            Select Icon
          </h3>
          <button 
            type="button" 
            className="icon-popup-close transition-all hover:bg-gray-100 hover:scale-110 rounded-full p-1" 
            onClick={onClose} 
            aria-label="Close"
          >
            <span>&times;</span>
          </button>
        </div>
        <div className="icon-popup-body">
          <div className="icon-grid grid grid-cols-6 gap-3 max-h-96 overflow-y-auto p-4">
            {icons.map((icon, index) => (
              <div
                key={index}
                className="icon-item cursor-pointer"
                onClick={() => {
                  onSelectIcon(icon);
                  onClose();
                }}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <img src={`/ican/images/${icon}`} alt={icon} className="object-contain w-full h-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IconPopup;

