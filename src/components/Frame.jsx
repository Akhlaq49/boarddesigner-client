import React, { useMemo, useState, useCallback, useRef } from 'react';

const GRID_CONFIGS = {
  '2x4': { columns: 2, rows: 4, visibleZones: 8 },
  '1x8': { columns: 1, rows: 8, visibleZones: 8 },
  '2x6': { columns: 2, rows: 6, visibleZones: 12 }
};

function Frame({
  gridType,
  setGridType,
  dropZones,
  selectedButton,
  setSelectedButton,
  updateDropZone,
  clearDropZone,
  getButtonDimensions,
  placeButtonInZones,
  showFeedback,
  frameColor,
  fullColor,
  getColorValue,
  getTextureImage,
  setShowButtonColorPopup,
  setButtonColorTarget
}) {
  const config = GRID_CONFIGS[gridType] || GRID_CONFIGS['2x4'];
  const [highlightedZones, setHighlightedZones] = useState([]);
  const frameRef = useRef(null);

  const allZones = useMemo(() => {
    const zones = [];
    for (let row = 1; row <= 8; row++) {
      for (let col = 1; col <= 2; col++) {
        const zoneId = `button${(row - 1) * 2 + col}`;
        zones.push({
          id: zoneId,
          row,
          col,
          visible: row <= config.rows && col <= config.columns
        });
      }
    }
    return zones;
  }, [config]);

  const getZonesToMerge = useCallback((startZone, dimensions) => {
    const zones = [];
    for (let r = startZone.row; r < startZone.row + dimensions.rowSpan; r++) {
      for (let c = startZone.col; c < startZone.col + dimensions.colSpan; c++) {
        const z = allZones.find(z => z.row === r && z.col === c);
        if (z) {
          // Check if zone is visible or already merged
          const isMerged = dropZones[z.id]?.mergedInto;
          if (!z.visible && !isMerged) {
            return null; // Zone doesn't exist or is hidden
          }
          zones.push(z.id);
        } else {
          return null; // Zone doesn't exist
        }
      }
    }
    return zones.length === (dimensions.colSpan * dimensions.rowSpan) ? zones : null;
  }, [allZones, dropZones]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, zoneId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const zone = allZones.find(z => z.id === zoneId);
    if (!zone) return;

    // Try to get button data from drag
    let buttonData;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) {
        buttonData = JSON.parse(data);
      }
    } catch (err) {
      // Ignore parse errors, will handle in drop
    }

    if (!buttonData) {
      const buttonType = parseInt(e.dataTransfer.getData('buttonType'));
      if (buttonType) {
        buttonData = { buttonType };
      } else {
        return;
      }
    }

    const dimensions = getButtonDimensions(buttonData.buttonType);
    const zonesToMerge = getZonesToMerge(zone, dimensions);
    
    if (zonesToMerge) {
      setHighlightedZones(zonesToMerge);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the drop zone area
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setHighlightedZones([]);
    }
  };

  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    e.stopPropagation();
    
    setHighlightedZones([]);
    
    let buttonData;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) {
        buttonData = JSON.parse(data);
      } else {
        // Fallback to buttonType
        const buttonType = parseInt(e.dataTransfer.getData('buttonType'));
        if (buttonType) {
          const dimensions = getButtonDimensions(buttonType);
          buttonData = {
            buttonType,
            colSpan: dimensions.colSpan,
            rowSpan: dimensions.rowSpan
          };
        }
      }
    } catch (err) {
      const buttonType = parseInt(e.dataTransfer.getData('buttonType'));
      if (buttonType) {
        const dimensions = getButtonDimensions(buttonType);
        buttonData = {
          buttonType,
          colSpan: dimensions.colSpan,
          rowSpan: dimensions.rowSpan
        };
      } else {
        showFeedback('Error parsing drop data', 'error');
        return;
      }
    }

    if (!buttonData) {
      showFeedback('No button data found', 'error');
      return;
    }

    const zone = allZones.find(z => z.id === zoneId);
    if (!zone) return;

    const dimensions = {
      colSpan: buttonData.colSpan || 1,
      rowSpan: buttonData.rowSpan || 1
    };

    // Check if button fits
    if (zone.col + dimensions.colSpan - 1 > config.columns || 
        zone.row + dimensions.rowSpan - 1 > config.rows) {
      showFeedback(`Button doesn't fit here (needs ${dimensions.colSpan}×${dimensions.rowSpan}, only ${config.columns}×${config.rows} available)`, 'error');
      return;
    }

    // Get zones to merge
    const zonesToMerge = getZonesToMerge(zone, dimensions);
    if (!zonesToMerge) {
      showFeedback('Cannot merge zones', 'error');
      return;
    }

    // Check if zones are available (allow replacing)
    const occupiedZones = zonesToMerge.filter(zId => {
      const existing = dropZones[zId];
      return existing && !existing.isMerged;
    });

    // Clear occupied zones first
    occupiedZones.forEach(zId => {
      const existing = dropZones[zId];
      if (existing && existing.zones) {
        existing.zones.forEach(z => clearDropZone(z));
      } else {
        clearDropZone(zId);
      }
    });

    // Place button with merge info using the hook function
    const buttonDataWithMerge = {
      type: buttonData.buttonType,
      dimensions,
      zones: zonesToMerge
    };

    placeButtonInZones(zonesToMerge, buttonDataWithMerge);
    setSelectedButton(zoneId);
    showFeedback('Button placed successfully!', 'success');
  };

  const handleZoneClick = (zoneId) => {
    if (dropZones[zoneId]) {
      setSelectedButton(zoneId);
    }
  };

  const handleRemove = (e, zoneId) => {
    e.stopPropagation();
    const zone = dropZones[zoneId];
    if (zone && zone.zones) {
      // Clear all merged zones
      zone.zones.forEach(z => clearDropZone(z));
    } else {
      clearDropZone(zoneId);
    }
    if (selectedButton === zoneId) {
      setSelectedButton(null);
    }
    showFeedback('Button removed', 'success');
  };

  const handleColorClick = (e, zoneId) => {
    e.stopPropagation();
    setButtonColorTarget(zoneId);
    setShowButtonColorPopup(true);
  };

  const handleDownloadPDF = async () => {
    try {
      const frameElement = frameRef.current;
      if (!frameElement) {
        showFeedback('Frame not found', 'error');
        return;
      }

      // Check if frame has dimensions and is visible
      const rect = frameElement.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(frameElement);
      
      if (rect.width === 0 || rect.height === 0) {
        showFeedback(`Frame has no dimensions (${rect.width}x${rect.height})`, 'error');
        return;
      }
      
      if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
        showFeedback('Frame is not visible', 'error');
        return;
      }

      showFeedback('Generating PDF...', 'info');

      // Clone the frame element and hide buttons
      const clonedFrame = frameElement.cloneNode(true);
      
      // Remove buttons completely from the clone
      const removeButtons = clonedFrame.querySelectorAll('.remove-button');
      removeButtons.forEach(btn => btn.remove());
      
      const colorButtons = clonedFrame.querySelectorAll('.button-color-btn');
      colorButtons.forEach(btn => btn.remove());
      
      // Convert relative image URLs to absolute URLs for the Python server
      const convertImageUrls = (element) => {
        // Convert img src attributes
        const images = element.querySelectorAll('img');
        images.forEach(img => {
          const src = img.getAttribute('src');
          if (src && (src.startsWith('/images/') || src.startsWith('/ican/images/'))) {
            img.setAttribute('src', `${window.location.origin}${src}`);
          }
        });
        
        // Convert background-image URLs in inline styles
        const allElements = element.querySelectorAll('*');
        allElements.forEach(el => {
          const bgImage = el.style.backgroundImage;
          if (bgImage && bgImage.includes('url(')) {
            const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
            if (urlMatch && urlMatch[1]) {
              let imgUrl = urlMatch[1];
              if (imgUrl.startsWith('/images/') || imgUrl.startsWith('/ican/images/')) {
                el.style.backgroundImage = bgImage.replace(imgUrl, `${window.location.origin}${imgUrl}`);
              }
            }
          }
        });
      };
      
      convertImageUrls(clonedFrame);
      
      // Apply computed styles as inline styles for better rendering in PDF
      const applyComputedStyles = (element) => {
        const computed = window.getComputedStyle(element);
        
        // Apply all important visual styles
        const stylesToApply = {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          border: computed.border,
          borderColor: computed.borderColor,
          borderWidth: computed.borderWidth,
          borderStyle: computed.borderStyle,
          borderRadius: computed.borderRadius,
          padding: computed.padding,
          margin: computed.margin,
          width: computed.width,
          height: computed.height,
          display: computed.display,
          gridColumn: computed.gridColumn,
          gridRow: computed.gridRow,
          backgroundImage: computed.backgroundImage,
          backgroundSize: computed.backgroundSize,
          backgroundPosition: computed.backgroundPosition,
          backgroundRepeat: computed.backgroundRepeat,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          textAlign: computed.textAlign
        };
        
        Object.entries(stylesToApply).forEach(([prop, value]) => {
          if (value && value !== 'none' && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
            element.style.setProperty(prop, value);
          }
        });
        
        // Recursively apply to children
        Array.from(element.children).forEach(child => {
          applyComputedStyles(child);
        });
      };
      
      applyComputedStyles(clonedFrame);
      
      // Get the HTML content of the cloned frame
      const frameHTML = clonedFrame.outerHTML;
      
      // Send to Python server for PDF generation
      const response = await fetch('http://localhost:5000/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: frameHTML,
          width: rect.width,
          height: rect.height,
          gridType: gridType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `board-design-${gridType}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showFeedback('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showFeedback(`Failed to generate PDF: ${error.message}`, 'error');
    }
  };

  const renderZoneContent = (zoneId) => {
    const zone = dropZones[zoneId];
    if (!zone || !zone.isPrimary) return null; // Only render in primary zone

    const buttonStyle = {};
    if (zone.dimensions.colSpan > 1) {
      buttonStyle.gridColumn = `span ${zone.dimensions.colSpan}`;
    }
    if (zone.dimensions.rowSpan > 1) {
      buttonStyle.gridRow = `span ${zone.dimensions.rowSpan}`;
    }

    // Apply colors and textures to button
    const textureImage = zone.color 
      ? getTextureImage(zone.color)
      : fullColor 
        ? getTextureImage(fullColor)
        : null;
    
    if (textureImage) {
      buttonStyle.backgroundImage = `url(${textureImage})`;
      buttonStyle.backgroundColor = zone.color 
        ? getColorValue(zone.color)
        : fullColor 
          ? getColorValue(fullColor)
          : '#ffffff';
    } else {
      if (zone.color) {
        // Individual button color takes precedence
        buttonStyle.backgroundColor = getColorValue(zone.color);
        buttonStyle.borderColor = getColorValue(zone.color);
      } else if (fullColor) {
        // Full color applied to all
        buttonStyle.backgroundColor = getColorValue(fullColor);
        buttonStyle.borderColor = getColorValue(fullColor);
      } else if (frameColor) {
        // Frame color only affects border
        buttonStyle.borderColor = getColorValue(frameColor);
      }
    }

    return (
      <div className="dropped-button" style={buttonStyle}>
        <div className="button-content">
          <span className="s0">
            {zone.s0?.type === 'icon' && zone.s0?.value && (
              <img 
                src={`/ican/images/${zone.s0.value}`} 
                alt="icon" 
                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                onError={(e) => {
                  console.error('Failed to load icon:', zone.s0.value);
                  e.target.style.display = 'none';
                }}
              />
            )}
            {zone.s0?.type === 'text' && zone.s0?.value && <span>{zone.s0.value}</span>}
          </span>
          <span className="s1">
            {zone.s1?.type === 'icon' && zone.s1?.value && (
              <img 
                src={`/ican/images/${zone.s1.value}`} 
                alt="icon" 
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                onError={(e) => {
                  console.error('Failed to load icon:', zone.s1.value);
                  e.target.style.display = 'none';
                }}
              />
            )}
            {zone.s1?.type === 'text' && zone.s1?.value && <span>{zone.s1.value}</span>}
          </span>
          <span className="s2">
            {zone.s2?.type === 'icon' && zone.s2?.value && (
              <img 
                src={`/ican/images/${zone.s2.value}`} 
                alt="icon" 
                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                onError={(e) => {
                  console.error('Failed to load icon:', zone.s2.value);
                  e.target.style.display = 'none';
                }}
              />
            )}
            {zone.s2?.type === 'text' && zone.s2?.value && <span>{zone.s2.value}</span>}
          </span>
        </div>
        <button
          className="remove-button"
          onClick={(e) => handleRemove(e, zoneId)}
          title="Remove"
        >
          ×
        </button>
        <button
          className="button-color-btn"
          onClick={(e) => handleColorClick(e, zoneId)}
          title="Change Color"
        >
          🎨
        </button>
      </div>
    );
  };

  return (
    <div className="w-100 d-flex flex-column align-items-center">
      {/* Grid Type Selector and Download Button */}
      <div className="d-flex flex-row align-items-center justify-content-center gap-4 mb-4" style={{ width: '100%', flexWrap: 'wrap' }}>
        <div className="grid-type-selector d-flex flex-row align-items-center justify-content-center gap-4">
          {['2x4', '1x8', '2x6'].map(type => (
            <button
              key={type}
              type="button"
              className={`grid-type-btn ${gridType === type ? 'active' : ''}`}
              onClick={() => setGridType(type)}
              title={`${type === '2x4' ? '2 Columns × 4 Rows' : type === '1x8' ? '1 Column × 8 Rows' : '2 Columns × 6 Rows'}`}
            >
              {/* SVG icons would go here - simplified for now */}
              <span>{type}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="x-button raised"
          onClick={handleDownloadPDF}
          title="Download Frame as PDF"
          style={{ marginLeft: 'auto' }}
        >
          <i className="fas fa-download" style={{ marginRight: '8px' }}></i>
          Download PDF
        </button>
      </div>

      {/* Device Layout - Drop Zone */}
      <div
        ref={frameRef}
        id="key"
        className={`layout polar-white custom basic layout-${gridType}`}
        data-place="frame"
        data-grid-type={gridType}
        style={{
          borderColor: frameColor ? getColorValue(frameColor) : undefined,
          backgroundColor: fullColor ? getColorValue(fullColor) : undefined,
          backgroundImage: fullColor && getTextureImage(fullColor) 
            ? `url(${getTextureImage(fullColor)})` 
            : undefined
        }}
      >
        {allZones.map(zone => {
          const zoneData = dropZones[zone.id];
          const isMerged = zoneData?.isMerged;
          const isPrimary = zoneData?.isPrimary;
          const isHighlighted = highlightedZones.includes(zone.id);
          const shouldShow = zone.visible && !isMerged;

          if (!shouldShow && !isMerged) return null;

          const zoneStyle = {
            ...(isPrimary && zoneData?.dimensions ? {
              gridColumn: zoneData.dimensions.colSpan > 1 ? `span ${zoneData.dimensions.colSpan}` : undefined,
              gridRow: zoneData.dimensions.rowSpan > 1 ? `span ${zoneData.dimensions.rowSpan}` : undefined
            } : {}),
            ...(frameColor ? { borderColor: getColorValue(frameColor) } : {}),
            ...(fullColor ? { 
              backgroundColor: getColorValue(fullColor),
              borderColor: getColorValue(fullColor)
            } : {})
          };

          return (
            <div
              key={zone.id}
              data-place={zone.id}
              data-grid-row={zone.row}
              data-grid-col={zone.col}
              className={`polar-white part-${zone.id.replace('button', '')} drop-zone ${!shouldShow ? 'hidden' : ''} ${isMerged ? 'merged-hidden' : ''} ${isPrimary ? 'has-content' : ''} ${isHighlighted ? 'drag-over' : ''} ${selectedButton === zone.id ? 'selected' : ''}`}
              style={zoneStyle}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, zone.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, zone.id)}
              onClick={() => handleZoneClick(zone.id)}
            >
              {!isPrimary && (
                <>
                  <span className="s0"></span>
                  <span className="s1"></span>
                  <span className="s2"></span>
                </>
              )}
              {renderZoneContent(zone.id)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Frame;

