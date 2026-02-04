import React from 'react';

function SavedDesignsThumbnail({ design, onLoad }) {
  // Create a visual preview of the design grid
  const renderThumbnailPreview = () => {
    const { gridType, dropZones, frameColor, fullColor } = design;
    
    // Parse grid dimensions from gridType
    let cols = 2, rows = 4;
    if (gridType === '2x4') { cols = 2; rows = 4; }
    else if (gridType === '2x6') { cols = 2; rows = 6; }
    else if (gridType === '2x8') { cols = 2; rows = 8; }
    else if (gridType === 'dora-3plus2T') { cols = 3; rows = 3; }
    else if (gridType === 'dora-6plus3T') { cols = 2; rows = 6; }
    else if (gridType === 'dora-2x6') { cols = 2; rows = 6; }
    else if (gridType === 'dora-2x8') { cols = 2; rows = 8; }
    else if (gridType === 'dora-2x4') { cols = 2; rows = 4; }
    else if (gridType.startsWith('dora-') || gridType.startsWith('pblock-')) {
      const match = gridType.match(/(\d+)x(\d+)/);
      if (match) {
        cols = parseInt(match[1]);
        rows = parseInt(match[2]);
      }
    }
    
    // Limit display to 6 rows for thumbnail
    const displayRows = Math.min(rows, 6);
    
    // Map color names to hex values
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
    
    const getColorValue = (colorName) => colorMap[colorName] || '#f5f5f5';
    
    // Build a grid representation considering merged buttons
    const gridCells = [];
    const processedZones = new Set();
    
    for (let row = 0; row < displayRows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        const zoneId = `zone-${index}`;
        
        if (processedZones.has(zoneId)) {
          continue; // Already rendered as part of a merged button
        }
        
        const zone = dropZones[zoneId];
        
        if (zone && zone.isPrimary) {
          // This is a primary zone (button)
          const colSpan = zone.colSpan || 1;
          const rowSpan = zone.rowSpan || 1;
          const buttonColor = zone.color || fullColor || frameColor || 'polar-white';
          const bgColor = getColorValue(buttonColor);
          
          // Mark all zones covered by this button as processed
          for (let r = 0; r < rowSpan; r++) {
            for (let c = 0; c < colSpan; c++) {
              const coveredIndex = (row + r) * cols + (col + c);
              processedZones.add(`zone-${coveredIndex}`);
            }
          }
          
          // Render the button with text/icon if present
          const hasIcon = zone.s0?.type === 'icon' || zone.s1?.type === 'icon' || zone.s2?.type === 'icon';
          const hasText = zone.s0?.type === 'text' || zone.s1?.type === 'text' || zone.s2?.type === 'text';
          
          gridCells.push(
            <div
              key={zoneId}
              style={{
                gridColumn: `${col + 1} / span ${colSpan}`,
                gridRow: `${row + 1} / span ${rowSpan}`,
                backgroundColor: bgColor,
                border: '0.5px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '5px',
                color: hasText ? (zone.s0?.color || zone.s1?.color || zone.s2?.color || '#fff') : 'transparent',
                fontWeight: 'bold',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {hasText && (
                <span style={{ fontSize: '4px', textAlign: 'center', lineHeight: '1' }}>
                  {zone.s0?.value || zone.s1?.value || zone.s2?.value || ''}
                </span>
              )}
              {hasIcon && !hasText && (
                <div style={{ 
                  width: '6px', 
                  height: '6px', 
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  borderRadius: '50%'
                }} />
              )}
            </div>
          );
        } else if (zone && zone.isMerged) {
          // Skip - this is part of a merged button
          processedZones.add(zoneId);
        } else {
          // Empty zone
          const defaultColor = fullColor || frameColor || 'polar-white';
          processedZones.add(zoneId);
          
          gridCells.push(
            <div
              key={zoneId}
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
                backgroundColor: getColorValue(defaultColor),
                border: '0.5px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '1px'
              }}
            />
          );
        }
      }
    }
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${displayRows}, 1fr)`,
        width: '100%',
        height: '100%',
        gap: '0.5px',
        backgroundColor: '#ddd',
        padding: '2px',
        border: '1px solid #1e90ff',
        borderRadius: '2px'
      }}>
        {gridCells}
      </div>
    );
  };

  return (
    <button
      onClick={() => onLoad(design)}
      title={`${design.name}\nSaved: ${design.timestamp}`}
      style={{
        position: 'relative',
        width: '50px',
        height: '50px',
        padding: '3px',
        backgroundImage: 'url(/images/background.7mbOcsPG.png)',
        backgroundSize: '100% 100%',
        border: '2px solid #e0e0e0',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#4CAF50';
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e0e0e0';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      {renderThumbnailPreview()}
    </button>
  );
}

export default SavedDesignsThumbnail;
