import React, { useState } from 'react';

// Product categories matching the image
const PRODUCT_CATEGORIES = [
  {
    id: '2-8-buttons',
    name: '2-8 Buttons Switch',
    products: [
      { id: 'dora-2x2', columns: 2, rows: 2, label: 'Dora 2×2' },
      { id: 'dora-2x4', columns: 2, rows: 4, label: 'Dora 2×4' },
      { id: 'dora-1x3', columns: 1, rows: 3, label: 'Dora 1×3' },
      { id: 'pblock-2x4', columns: 2, rows: 4, label: 'Pblock 2×4' }
    ]
  },
  {
    id: '3-12-buttons',
    name: '3-12 Button Switch',
    products: [
      { id: 'dora-2x6', columns: 2, rows: 6, label: 'Dora 2×6' },
      { id: 'dora-2x8', columns: 2, rows: 8, label: 'Dora 2×8' },
      { id: 'pblock-2x6', columns: 2, rows: 6, label: 'Pblock 2×6' }
    ]
  },
  {
    id: '2-8-room',
    name: '2-8 Room Controller',
    products: [
      { id: 'dora-thermostat', columns: 2, rows: 4, label: 'Dora Thermostat' }
    ]
  },
  {
    id: 'design-self',
    name: 'Design Your Self',
    products: [
      { id: '2x4', columns: 2, rows: 4, label: '2×4 Grid' },
      { id: '2x6', columns: 2, rows: 6, label: '2×6 Grid' },
      { id: '2x8', columns: 2, rows: 8, label: '2×8 Grid' }
    ]
  }
];

function Header({ onNavigateHome, gridType, setGridType, onDownloadPDF, setSelectedButton, setSelectedButtonPart }) {
  const [activeTab, setActiveTab] = useState('2-8-buttons');
  
  const activeCategory = PRODUCT_CATEGORIES.find(cat => cat.id === activeTab);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md" style={{ height: '140px' }}>
      <div className="container-fluid px-3 py-2 h-100">
        <div className="d-flex flex-column h-100">
          {/* Top Row: Logo, Home Button, Category Tabs, and Save PDF */}
          <div className="d-flex align-items-center justify-content-between w-100 border-bottom" style={{ height: '50px' }}>
            {/* Left side: Logo and Home Button */}
            <div className="d-flex align-items-center gap-3 flex-shrink-0">
              <div className="future-logo">
                <h1 style={{ color: '#00a651', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>future</h1>
              </div>
              <button 
                className="home-page-btn"
                onClick={onNavigateHome || (() => window.location.reload())}
                title="Back to Home Page"
                style={{
                  padding: '0.4rem 1rem',
                  backgroundColor: '#f0f0f0',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                <i className="fas fa-arrow-left" style={{ marginRight: '6px' }}></i>
                Home Page
              </button>
            </div>

            {/* Center: Category Tabs */}
            <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-center">
              {PRODUCT_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  className={`nav-category-btn ${activeTab === category.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(category.id);
                    if (setSelectedButton) setSelectedButton(null);
                    if (setSelectedButtonPart) setSelectedButtonPart(null);
                  }}
                  style={{
                    padding: '0.5rem 1.5rem',
                    backgroundColor: activeTab === category.id ? '#ffeb3b' : 'transparent',
                    color: activeTab === category.id ? '#000' : '#555',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Right side: Save PDF Button */}
            <div className="flex-shrink-0">
              <button
                type="button"
                className="save-pdf-btn"
                onClick={onDownloadPDF}
                title="Save Design as PDF"
                style={{
                  padding: '0.5rem 1.2rem',
                  backgroundColor: '#ff5252',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
              >
                <i className="fas fa-download"></i>
                <span>Save Design PDF</span>
              </button>
            </div>
          </div>

          {/* Product Icons Row */}
          <div className="d-flex align-items-center gap-2 w-100" style={{ height: '90px', padding: '1rem 0', overflowX: 'auto' }}>
            {activeCategory?.products.map(product => {
              const isSelected = gridType === product.id;
              return (
                <button
                  key={product.id}
                  onClick={() => setGridType(product.id)}
                  title={product.label}
                  style={{
                    position: 'relative',
                    width: '50px',
                    height: '50px',
                    padding: '3px',
                    backgroundImage: 'url(/images/background.7mbOcsPG.png)',
                    backgroundSize: '100% 100%',
                    border: isSelected ? '2px solid #1565c0' : '2px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}
                >
                  {/* Grid Visualization with cyan border */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${product.columns}, 1fr)`,
                    gridTemplateRows: `repeat(${Math.min(product.rows, 4)}, 1fr)`,
                    
                    width: '100%',
                    height: '100%',
                    border: '2px solid #1e90ff',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    backgroundColor: 'transparent'
                  }}>
                    {Array.from({ length: product.columns * Math.min(product.rows, 4) }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: isSelected ? '#1976d2' : '#f5f5f5',
                          border: '0.5px solid rgba(0, 0, 0, 0.15)',
                          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.08)'
                        }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
            {activeCategory?.products.length === 0 && (
              <div style={{ padding: '0.5rem', color: '#999', fontSize: '0.9rem' }}>
                Custom design mode - configure your layout below
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

