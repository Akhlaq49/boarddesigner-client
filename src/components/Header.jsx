import React, { useState, useEffect } from 'react';
import SavedDesignsThumbnail from './SavedDesignsThumbnail';

// Product categories matching the image
const PRODUCT_CATEGORIES = [
  {
    id: '2-8-buttons',
    name: '2-8 Buttons Switch',
    products: [
      
    ]
  },
  {
    id: '3-12-buttons',
    name: '3-12 Button Switch',
    products: [
      
    ]
  },
  {
    id: '2-8-room',
    name: '2-8 Room Controller',
    products: [
       ]
  },
  {
    id: 'pblock-level-2',
    name: 'PBlock Level 2',
    products: [
    ]
  },
  {
    id: 'pblock-level-3',
    name: 'PBlock Level 3',
    products: [
    ]
  },
  {
    id: 'pblock-level-4',
    name: 'PBlock Level 4',
    products: [
    ]
  },
  {
    id: 'design-self',
    name: 'Design Your Self',
    products: [
      { id: 'dora-1x1', columns: 1, rows: 1, label: 'Single Square Button' },
      { id: 'dora-2x4', columns: 2, rows: 4, label: 'Dora Keypad 2×4' },
      { id: 'dora-2x8', columns: 2, rows: 6, label: 'Dora XLarge 2×6' },
      { id: 'dora-thermostat', columns: 2, rows: 4, label: 'Dora Thermostat 4+4' },
      { id: 'pblock-2x6', columns: 2, rows: 6, label: 'Pblock 2×6' },
      { id: 'pblock-2x2', columns: 2, rows: 2, label: 'PBlock 2×2 (Max 4 Buttons)' },
      { id: 'pblock-2x2-display', columns: 2, rows: 1, label: 'PBlock 2×2 + Display' },
      { id: 'pblock-3x2', columns: 2, rows: 3, label: 'PBlock 3×2 (Max 6 Buttons)' },
      { id: 'pblock-3x2-display', columns: 2, rows: 2, label: 'PBlock 3×2 + Display' },
      { id: 'pblock-4x2', columns: 2, rows: 4, label: 'PBlock 4×2 (Max 8 Buttons)' },
      { id: 'pblock-4x2-display', columns: 2, rows: 3, label: 'PBlock 4×2 + Display' }
    ]
  }
];

function Header({ onNavigateHome, gridType, setGridType, onDownloadPDF, setSelectedButton, setSelectedButtonPart, onOpenSaveDesign, activeTab, setActiveTab }) {
  const [savedDesigns28, setSavedDesigns28] = useState([]);
  const [savedDesigns312, setSavedDesigns312] = useState([]);
  const [savedDesigns28Room, setSavedDesigns28Room] = useState([]);
  const [savedDesignsPblockL2, setSavedDesignsPblockL2] = useState([]);
  const [savedDesignsPblockL3, setSavedDesignsPblockL3] = useState([]);
  const [savedDesignsPblockL4, setSavedDesignsPblockL4] = useState([]);
  
  // Load saved designs on mount
  useEffect(() => {
    loadSavedDesigns();
  }, []);
  
  // Listen for storage changes to refresh saved designs
  useEffect(() => {
    const handleStorageChange = () => {
      loadSavedDesigns();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event from SaveDesign component
    window.addEventListener('designsSaved', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('designsSaved', handleStorageChange);
    };
  }, []);
  
  const loadSavedDesigns = async () => {
    try {
      const response = await fetch(`/designs.json?ts=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to load designs');
      const data = await response.json();
      const allDesigns = data.designs || [];
      
      const designs28 = allDesigns.filter(d => d.category === '2-8');
      const designs312 = allDesigns.filter(d => d.category === '3-12');
      const designs28Room = allDesigns.filter(d => d.category === '2-8-room');
      const designsPblockL2 = allDesigns.filter(d => d.category === 'pblock-level-2');
      const designsPblockL3 = allDesigns.filter(d => d.category === 'pblock-level-3');
      const designsPblockL4 = allDesigns.filter(d => d.category === 'pblock-level-4');
     
      setSavedDesigns28(designs28);
      setSavedDesigns312(designs312);
      setSavedDesigns28Room(designs28Room);
      setSavedDesignsPblockL2(designsPblockL2);
      setSavedDesignsPblockL3(designsPblockL3);
      setSavedDesignsPblockL4(designsPblockL4);
    } catch (error) {
      console.error('Error loading saved designs:', error);
    }
  };
  
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
            
            {/* Right side: Save Design and Save PDF Buttons */}
            <div className="flex-shrink-0" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                type="button"
                className="save-design-btn"
                onClick={onOpenSaveDesign}
                title="Save Design Configuration"
                style={{
                  padding: '0.5rem 1.2rem',
                  backgroundColor: '#2196F3',
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
                <i className="fas fa-save"></i>
                <span>Save Design</span>
              </button>
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
            <>
              {/* Show saved designs first if in relevant categories */}
              {activeCategory?.id === '2-8-buttons' && savedDesigns28.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '0.75rem', borderRight: '2px solid #ddd', marginRight: '0.75rem' }}>
                  {savedDesigns28.map((design, idx) => (
                    <SavedDesignsThumbnail
                      key={`design-28-${idx}`}
                      design={design}
                      onLoad={(design) => {
                        window.dispatchEvent(new CustomEvent('loadSavedDesign', {
                          detail: design
                        }));
                      }}
                    />
                  ))}
                </div>
              )}
              {activeCategory?.id === '3-12-buttons' && savedDesigns312.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '0.75rem', borderRight: '2px solid #ddd', marginRight: '0.75rem' }}>
                  {savedDesigns312.map((design, idx) => (
                    <SavedDesignsThumbnail
                      key={`design-312-${idx}`}
                      design={design}
                      onLoad={(design) => {
                        window.dispatchEvent(new CustomEvent('loadSavedDesign', {
                          detail: design
                        }));
                      }}
                    />
                  ))}
                </div>
              )}
              {activeCategory?.id === '2-8-room' && savedDesigns28Room.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '0.75rem', borderRight: '2px solid #ddd', marginRight: '0.75rem' }}>
                  {savedDesigns28Room.map((design, idx) => (
                    <SavedDesignsThumbnail
                      key={`design-28-room-${idx}`}
                      design={design}
                      onLoad={(design) => {
                        window.dispatchEvent(new CustomEvent('loadSavedDesign', {
                          detail: design
                        }));
                      }}
                    />
                  ))}
                </div>
              )}
              {activeCategory?.id === 'pblock-level-2' && savedDesignsPblockL2.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '0.75rem', borderRight: '2px solid #ddd', marginRight: '0.75rem' }}>
                  {savedDesignsPblockL2.map((design, idx) => (
                    <SavedDesignsThumbnail
                      key={`design-pblock-l2-${idx}`}
                      design={design}
                      onLoad={(design) => {
                        window.dispatchEvent(new CustomEvent('loadSavedDesign', {
                          detail: design
                        }));
                      }}
                    />
                  ))}
                </div>
              )}
              {activeCategory?.id === 'pblock-level-3' && savedDesignsPblockL3.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '0.75rem', borderRight: '2px solid #ddd', marginRight: '0.75rem' }}>
                  {savedDesignsPblockL3.map((design, idx) => (
                    <SavedDesignsThumbnail
                      key={`design-pblock-l3-${idx}`}
                      design={design}
                      onLoad={(design) => {
                        window.dispatchEvent(new CustomEvent('loadSavedDesign', {
                          detail: design
                        }));
                      }}
                    />
                  ))}
                </div>
              )}
              {activeCategory?.id === 'pblock-level-4' && savedDesignsPblockL4.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '0.75rem', borderRight: '2px solid #ddd', marginRight: '0.75rem' }}>
                  {savedDesignsPblockL4.map((design, idx) => (
                    <SavedDesignsThumbnail
                      key={`design-pblock-l4-${idx}`}
                      design={design}
                      onLoad={(design) => {
                        window.dispatchEvent(new CustomEvent('loadSavedDesign', {
                          detail: design
                        }));
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Show regular products */}
              {activeCategory?.products && (
              <>
              {activeCategory?.products.map(product => {
              const isSelected = gridType === product.id;
              const displayRows = Math.min(product.rows, 6);
              const hasDisplay = product.id === 'dora-thermostat';
              
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
                  {/* Product Preview Thumbnail */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    gap: '1px',
                    padding: '2px'
                  }}>
                    {hasDisplay && (
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#1a1a1a',
                        borderRadius: '0.5px',
                        border: '0.5px solid #000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2px',
                        color: '#4CAF50',
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        88°F
                      </div>
                    )}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${product.columns}, 1fr)`,
                      gridTemplateRows: `repeat(${displayRows}, 1fr)`,
                      width: '100%',
                      height: '100%',
                      gap: '0.5px',
                      flex: 1
                    }}>
                      {Array.from({ length: product.columns * displayRows }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            backgroundColor: isSelected ? '#1976d2' : '#f0f0f0',
                            border: '0.5px solid rgba(0, 0, 0, 0.2)',
                            borderRadius: '0.5px'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
              </>
              )}
              {activeCategory && !activeCategory.products && (
                <div style={{ padding: '0.5rem', color: '#999', fontSize: '0.9rem' }}>
                  Custom design mode - configure your layout below
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

