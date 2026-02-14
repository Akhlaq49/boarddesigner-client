import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';

const CartView = ({ isOpen, onClose, cart, onRemoveItem, onClearCart, isNewWindow }) => {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [printing, setPrinting] = useState(false);
  const printRef = useRef(null);

  if (!isOpen) return null;

  // Get grid dimensions based on grid type
  const getGridSettings = (gridType) => {
    const settings = {
      '2-8-buttons': { cols: 2, rows: 4 },
      '3-12-buttons': { cols: 3, rows: 4 },
      '2-8-room': { cols: 2, rows: 4 },
      'design-self': { cols: 2, rows: 4 },
      'pblock-level-2': { cols: 2, rows: 2 },
      'pblock-level-3': { cols: 2, rows: 3 },
      'pblock-level-4': { cols: 2, rows: 4 }
    };
    return settings[gridType] || { cols: 2, rows: 4 };
  };

  const renderDesignPreview = (item) => {
    // If we have a captured design image, display that
    if (item.designImage) {
      return (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            border: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <img 
            src={item.designImage} 
            alt={item.name}
            style={{
              maxWidth: '400px',
              maxHeight: '250px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '4px'
            }}
          />
        </div>
      );
    }

    // Fallback to grid preview if no image
    const settings = getGridSettings(item.gridType);
    
    // Convert dropZones to array if it's an object
    let zonesArray = [];
    if (item.dropZones) {
      if (Array.isArray(item.dropZones)) {
        zonesArray = item.dropZones;
      } else if (typeof item.dropZones === 'object') {
        zonesArray = Object.values(item.dropZones);
      }
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${settings.cols}, 1fr)`,
          gap: '8px',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          minHeight: '160px',
          border: '1px solid #ddd'
        }}
      >
        {Array.from({ length: settings.cols * settings.rows }).map((_, idx) => {
          const zone = zonesArray.find(z => z && z.id === `button${idx}`);
          const bgColor = zone?.color 
            ? getColorValue(zone.color) 
            : (item.frameColor ? getColorValue(item.frameColor) : '#f0f0f0');

          return (
            <div
              key={idx}
              style={{
                backgroundColor: bgColor,
                border: '1px solid #ccc',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '30px',
                fontSize: '10px',
                color: getTextColor(bgColor),
                fontWeight: 'bold'
              }}
            >
              {zone ? '●' : '○'}
            </div>
          );
        })}
      </div>
    );
  };

  const getColorValue = (colorName) => {
    const colorMap = {
      'polar-white': '#ffffff',
      'royal-silver': '#cbd5e1',
      'anthracite-gray': '#475569',
      'meteor-black': '#1e293b',
      'texture-black': '#0f172a',
      'pure-gold': '#c59158',
      'antique-copper': '#b45309',
      'antique-bronze': '#78350f',
      'red-cherry': '#dc2626',
      'green-leaf': '#16a34a'
    };
    return colorMap[colorName] || '#ffffff';
  };

  const getTextColor = (bgColor) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const handlePrintAll = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 500);
  };

  const handleExportPDF = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Add designs before exporting.');
      return;
    }

    setExportingPDF(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      let pageNumber = 1;

      // Title page
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('Design Cart Catalog', margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(100);
      pdf.text(`Total Designs: ${cart.length}`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Exported: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 15;

      pdf.setTextColor(0);

      // Add each design to PDF
      for (let i = 0; i < cart.length; i++) {
        const item = cart[i];

        // Check page break
        if (yPosition > pageHeight - margin - 100) {
          pdf.addPage();
          pageNumber += 1;
          yPosition = margin;
        }

        // Design number and name
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Design #${i + 1}: ${item.name}`, margin, yPosition);
        yPosition += 10;

        // Add design image if available
        if (item.designImage) {
          try {
            // Create a temporary image to get actual dimensions
            const img = new Image();
            img.src = item.designImage;
            
            // Calculate size - make frame smaller (50% of content width)
            const maxWidth = contentWidth * 0.5;
            const maxHeight = 80;
            
            // Maintain aspect ratio
            let imgWidth = maxWidth;
            let imgHeight = maxHeight;
            
            if (img.width && img.height) {
              const aspectRatio = img.width / img.height;
              if (aspectRatio > maxWidth / maxHeight) {
                imgWidth = maxWidth;
                imgHeight = maxWidth / aspectRatio;
              } else {
                imgHeight = maxHeight;
                imgWidth = maxHeight * aspectRatio;
              }
            }
            
            // Check if image fits on current page
            if (yPosition + imgHeight > pageHeight - margin - 40) {
              pdf.addPage();
              pageNumber += 1;
              yPosition = margin;
            }

            // Center the image
            const xOffset = margin + (contentWidth - imgWidth) / 2;
            pdf.addImage(item.designImage, 'PNG', xOffset, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 8;
          } catch (error) {
            console.error('Error adding image to PDF:', error);
          }
        }

        // Frame Information
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0);
        
        if (yPosition > pageHeight - margin - 30) {
          pdf.addPage();
          pageNumber += 1;
          yPosition = margin;
        }
        
        pdf.text('Frame Information', margin, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Button Type: ${item.gridType || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        pdf.text(`Frame Color: ${item.frameColor || 'N/A'}`, margin, yPosition);
        yPosition += 8;

        // Button Details
        pdf.setFont(undefined, 'bold');
        pdf.text('Button Details', margin, yPosition);
        yPosition += 6;

        // Convert dropZones to array
        let zonesArray = [];
        if (item.dropZones) {
          if (Array.isArray(item.dropZones)) {
            zonesArray = item.dropZones;
          } else if (typeof item.dropZones === 'object') {
            zonesArray = Object.values(item.dropZones);
          }
        }

        // Filter to show only buttons that have content or are primary zones
        const configuredButtons = zonesArray.filter(zone => zone && (zone.isPrimary || zone.s0 || zone.s1 || zone.s2));

        if (configuredButtons.length === 0) {
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'italic');
          pdf.setTextColor(100);
          pdf.text('No buttons configured', margin + 5, yPosition);
          yPosition += 6;
        } else {
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(0);

          for (let idx = 0; idx < configuredButtons.length; idx++) {
            const zone = configuredButtons[idx];
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage();
              pageNumber += 1;
              yPosition = margin;
            }

            // Extract button number from zone.id
            const buttonNum = zone.id ? parseInt(zone.id.replace('button', '')) + 1 : idx + 1;
            const buttonColor = zone.color || item.fullColor || item.frameColor || 'Default';
            const colorHex = buttonColor !== 'Default' ? getColorValue(buttonColor) : 'N/A';
            
            // Button number and color
            pdf.setFont(undefined, 'bold');
            pdf.text(`Button ${buttonNum}`, margin, yPosition);
            pdf.setFont(undefined, 'normal');
            const colorCode = buttonColor !== 'Default' ? `${buttonColor} (${colorHex})` : buttonColor;
            pdf.text(`: ${colorCode}`, margin + 25, yPosition);
            yPosition += 4;
            
            // Get content for each section
            const s0Content = zone.s0?.type === 'icon' ? `Icon: ${zone.s0.value}` : (zone.s0?.type === 'text' ? `Text: ${zone.s0.value}` : '');
            const s1Content = zone.s1?.type === 'icon' ? `Icon: ${zone.s1.value}` : (zone.s1?.type === 'text' ? `Text: ${zone.s1.value}` : '');
            const s2Content = zone.s2?.type === 'icon' ? `Icon: ${zone.s2.value}` : (zone.s2?.type === 'text' ? `Text: ${zone.s2.value}` : '');
            
            // Top content (s0)
            if (s0Content) {
              pdf.setFontSize(8);
              pdf.text(`  Top: ${s0Content}`, margin + 5, yPosition);
              yPosition += 3;
            }
            
            // Center content (s1)
            if (s1Content) {
              pdf.setFontSize(8);
              pdf.text(`  Center: ${s1Content}`, margin + 5, yPosition);
              yPosition += 3;
            }
            
            // Bottom content (s2)
            if (s2Content) {
              pdf.setFontSize(8);
              pdf.text(`  Bottom: ${s2Content}`, margin + 5, yPosition);
              yPosition += 3;
            }
            
            pdf.setFontSize(10);
            yPosition += 2;
          }
        }

        yPosition += 5;

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`Page ${pageNumber}`, pageWidth - margin - 15, pageHeight - 10);

        // Spacing between designs
        yPosition += 5;
      }

      pdf.save(`Board_Designer_Cart_${new Date().toISOString().split('T')[0]}.pdf`);
      alert(`PDF exported successfully with ${cart.length} design(s)`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  // Render cart content (shared between window and modal modes)
  const renderCartContent = () => (
    <>
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <svg
            className="w-16 h-16 mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <p className="text-lg">Your cart is empty</p>
          <p className="text-sm">Add designs to see them here</p>
        </div>
      ) : (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Catalog Header */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#333' }}>
              Design Cart Catalog
            </h2>
            <p style={{ marginBottom: 0, color: '#666', fontSize: '0.9rem' }}>
              Total Designs: <strong>{cart.length}</strong> | 
              Last Updated: <strong>{new Date().toLocaleString()}</strong>
            </p>
          </div>

          {/* Design Items */}
          <div className="space-y-6">
            {cart.map((item, index) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0'
                }}
              >
                {/* Item Header */}
                <div style={{ padding: '1.5rem', backgroundColor: '#f8f8f8', borderBottom: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      backgroundColor: '#9C27B0',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}>
                      #{index + 1}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#333' }}>
                      {item.name}
                    </h3>
                  </div>
                </div>

                {/* Item Content */}
                <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                  {/* Left: Design Preview */}
                  <div style={{ flex: '0 0 400px' }}>
                    {renderDesignPreview(item)}
                  </div>

                  {/* Right: Button Details */}
                  <div style={{ flex: '1', minWidth: '0' }}>
                    {/* Frame Information */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0f7ff', borderRadius: '6px', borderLeft: '3px solid #2196F3' }}>
                      <h4 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#000', fontSize: '1rem', fontWeight: 'bold' }}>
                        Frame Information
                      </h4>
                      <div style={{ fontSize: '0.95rem', color: '#333' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Button Type:</strong> {item.gridType || 'N/A'}
                        </div>
                        <div>
                          <strong>Frame Color:</strong> {item.frameColor || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Button Details */}
                    <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#000', fontSize: '1.1rem', fontWeight: 'bold' }}>
                      Button Details
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(() => {
                        // Convert dropZones to array
                        let zonesArray = [];
                        if (item.dropZones) {
                          if (Array.isArray(item.dropZones)) {
                            zonesArray = item.dropZones;
                          } else if (typeof item.dropZones === 'object') {
                            zonesArray = Object.values(item.dropZones);
                          }
                        }

                        // Filter to show only buttons that have content or are primary zones
                        const configuredButtons = zonesArray.filter(zone => zone && (zone.isPrimary || zone.s0 || zone.s1 || zone.s2));
                        
                        if (configuredButtons.length === 0) {
                          return (
                            <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>
                              No buttons configured
                            </p>
                          );
                        }

                        return configuredButtons.map((zone, idx) => {
                          // Extract button number from zone.id (e.g., "button0" -> 1)
                          const buttonNum = zone.id ? parseInt(zone.id.replace('button', '')) + 1 : idx + 1;
                          const buttonColor = zone.color || item.fullColor || item.frameColor || 'Default';
                          const colorHex = buttonColor !== 'Default' ? getColorValue(buttonColor) : 'N/A';
                          
                          // Get content for each section
                          const s0Content = zone.s0?.type === 'icon' ? `Icon: ${zone.s0.value}` : (zone.s0?.type === 'text' ? `Text: ${zone.s0.value}` : '');
                          const s1Content = zone.s1?.type === 'icon' ? `Icon: ${zone.s1.value}` : (zone.s1?.type === 'text' ? `Text: ${zone.s1.value}` : '');
                          const s2Content = zone.s2?.type === 'icon' ? `Icon: ${zone.s2.value}` : (zone.s2?.type === 'text' ? `Text: ${zone.s2.value}` : '');
                          
                          return (
                            <div
                              key={idx}
                              style={{
                                padding: '0.5rem 0',
                                fontSize: '0.95rem',
                                color: '#000',
                                borderBottom: idx < configuredButtons.length - 1 ? '1px solid #f0f0f0' : 'none',
                                paddingBottom: '0.75rem',
                                marginBottom: '0.5rem'
                              }}
                            >
                              <div style={{ marginBottom: '0.25rem' }}>
                                <strong>Button {buttonNum}</strong>
                                <span style={{ margin: '0 0.5rem' }}>:</span>
                                {buttonColor !== 'Default' ? `${buttonColor} (${colorHex})` : buttonColor}
                              </div>
                              {s0Content && (
                                <div style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#555' }}>
                                  Top: {s0Content}
                                </div>
                              )}
                              {s1Content && (
                                <div style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#555' }}>
                                  Center: {s1Content}
                                </div>
                              )}
                              {s2Content && (
                                <div style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#555' }}>
                                  Bottom: {s2Content}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Item Footer */}
                <div style={{
                  padding: '1rem 1.5rem',
                  backgroundColor: '#f8f8f8',
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ff5252',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#ff1744'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#ff5252'}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <style>{`
        @media print {
          * {
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .no-print {
            display: none !important;
          }
          
          div[role="presentation"] {
            display: none !important;
          }
          
          .fixed {
            position: static !important;
          }
          
          .overflow-y-auto {
            overflow: visible !important;
            height: auto !important;
          }
          
          @page {
            size: A4;
            margin: 1cm;
          }
          
          .space-y-6 > * + * {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {isNewWindow ? (
        // Full screen window mode
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
          {/* Header matching main app header */}
          <header style={{
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Left: Title with Cart Count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                  <i className="fas fa-shopping-cart" style={{ marginRight: '0.75rem', color: '#9C27B0' }}></i>
                  Design Cart
                  <span style={{
                    marginLeft: '0.75rem',
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {cart.length}
                  </span>
                </h2>
              </div>

              {/* Right: Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
                {cart.length > 0 && (
                  <>
                    <button
                      onClick={handlePrintAll}
                      disabled={printing}
                      style={{
                        padding: '0.5rem 1.2rem',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: printing ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'background-color 0.2s',
                        opacity: printing ? 0.6 : 1
                      }}
                    >
                      <i className="fas fa-print"></i>
                      <span>{printing ? 'Preparing...' : 'Print All'}</span>
                    </button>
                    <button
                      onClick={handleExportPDF}
                      disabled={exportingPDF}
                      style={{
                        padding: '0.5rem 1.2rem',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: exportingPDF ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'background-color 0.2s',
                        opacity: exportingPDF ? 0.6 : 1
                      }}
                    >
                      <i className="fas fa-download"></i>
                      <span>{exportingPDF ? 'Exporting...' : 'Export PDF'}</span>
                    </button>
                    <button
                      onClick={onClearCart}
                      style={{
                        padding: '0.5rem 1.2rem',
                        backgroundColor: '#f44336',
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
                      <i className="fas fa-trash"></i>
                      <span>Clear All</span>
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.5rem 1.2rem',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
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
                  <i className="fas fa-times"></i>
                  <span>Close</span>
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6" ref={printRef}>
            {renderCartContent()}
          </div>
        </div>
      ) : (
        // Modal mode (original)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[95vw] h-[95vh] overflow-hidden flex flex-col">
            {/* Header matching main app header */}
            <header style={{
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e0e0e0',
              borderRadius: '0.5rem 0.5rem 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left: Title with Cart Count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                    <i className="fas fa-shopping-cart" style={{ marginRight: '0.75rem', color: '#9C27B0' }}></i>
                    Design Cart
                    <span style={{
                      marginLeft: '0.75rem',
                      backgroundColor: '#9C27B0',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {cart.length}
                    </span>
                  </h2>
                </div>

                {/* Right: Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
                  {cart.length > 0 && (
                    <>
                      <button
                        onClick={handlePrintAll}
                        disabled={printing}
                        style={{
                          padding: '0.5rem 1.2rem',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: printing ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'background-color 0.2s',
                          opacity: printing ? 0.6 : 1
                        }}
                      >
                        <i className="fas fa-print"></i>
                        <span>{printing ? 'Preparing...' : 'Print All'}</span>
                      </button>
                      <button
                        onClick={handleExportPDF}
                        disabled={exportingPDF}
                        style={{
                          padding: '0.5rem 1.2rem',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: exportingPDF ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'background-color 0.2s',
                          opacity: exportingPDF ? 0.6 : 1
                        }}
                      >
                        <i className="fas fa-download"></i>
                        <span>{exportingPDF ? 'Exporting...' : 'Export PDF'}</span>
                      </button>
                      <button
                        onClick={onClearCart}
                        style={{
                          padding: '0.5rem 1.2rem',
                          backgroundColor: '#f44336',
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
                        <i className="fas fa-trash"></i>
                        <span>Clear All</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={onClose}
                    style={{
                      padding: '0.5rem 1.2rem',
                      backgroundColor: '#f0f0f0',
                      color: '#333',
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
                    <i className="fas fa-times"></i>
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6" ref={printRef} style={{ backgroundColor: '#fafafa' }}>
              {renderCartContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartView;
