import React from 'react';

function Header({ onNavigateHome, selectedCategory, setSelectedCategory, onDownloadPDF }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md" style={{ height: '70px' }}>
      <div className="container-fluid px-3 py-2 h-100">
        <div className="d-flex align-items-center justify-content-between w-100 h-100 gap-3">
          {/* Left side: Logo and Home Button */}
          <div className="d-flex align-items-center gap-3 flex-shrink-0">
            <div className="future-logo">
              <h1 style={{ color: '#00a651', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>future</h1>
            </div>
            <button 
              className="home-page-btn"
              onClick={onNavigateHome || (() => window.location.reload())}
              title="Back to Home Page"
            >
              <i className="fas fa-arrow-left" style={{ marginRight: '6px' }}></i>
              Home Page
            </button>
          </div>
          
          {/* Center: Category Navigation */}
          <div className="d-flex align-items-center gap-3 flex-grow-1 justify-content-center">
            <button 
              className={`nav-category-btn ${selectedCategory === '2-8 Buttons Switch' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('2-8 Buttons Switch')}
            >
              2-8 Buttons Switch
            </button>
            <button 
              className={`nav-category-btn ${selectedCategory === '3-12 Button Switch' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('3-12 Button Switch')}
            >
              3-12 Button Switch
            </button>
            <button 
              className={`nav-category-btn ${selectedCategory === '2-8 Room Controller' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('2-8 Room Controller')}
            >
              2-8 Room Controller
            </button>
            <button 
              className={`nav-category-btn ${selectedCategory === 'Design Your Self' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Design Your Self')}
            >
              Design Your Self
            </button>
            <button 
              className={`nav-category-btn ${selectedCategory === 'Focus Mode' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Focus Mode')}
            >
              Focus Mode
            </button>
          </div>
          
          {/* Right side: Save PDF Button */}
          <div className="flex-shrink-0">
            <button
              type="button"
              className="save-pdf-btn"
              onClick={onDownloadPDF}
              title="Save Design as PDF"
            >
              <i className="fas fa-download"></i>
              <span>Save Design PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

