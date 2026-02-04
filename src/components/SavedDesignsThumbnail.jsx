import React from 'react';

function SavedDesignsThumbnail({ design, onLoad }) {
  const renderThumbnailPreview = () => {
    const { gridType, dropZones, frameColor, fullColor, wallColor } = design;
    
    // Grid configuration matching Frame.jsx
    const GRID_CONFIGS = {
      'dora-2x2': { columns: 2, rows: 2 },
      'dora-2plus1': { columns: 2, rows: 2 },
      'dora-2Lplus1': { columns: 2, rows: 4 },
      'dora-4plus1L': { columns: 2, rows: 4 },
      'dora-4plus2L': { columns: 2, rows: 4 },
      'dora-2plus2plus1': { columns: 2, rows: 4 },
      'dora-2plus1plus1': { columns: 2, rows: 3 },
      'dora-1L2plus1': { columns: 2, rows: 4 },
      'dora-2x4': { columns: 2, rows: 4 },
      'dora-1x4': { columns: 1, rows: 4 },
      'dora-1x5': { columns: 1, rows: 5 },
      'dora-1x6': { columns: 1, rows: 6 },
      'dora-1x7': { columns: 1, rows: 7 },
      'dora-1x8': { columns: 1, rows: 8 },
      'dora-1x3': { columns: 1, rows: 3 },
      'dora-6plus3T': { columns: 2, rows: 6 },
      'dora-2x6': { columns: 2, rows: 6 },
      'dora-2x8': { columns: 2, rows: 8 },
      'pblock-2x6': { columns: 2, rows: 6 },
      'dora-thermostat': { columns: 2, rows: 4 },
      'pblock-2x4': { columns: 2, rows: 4 },
      '2x4': { columns: 2, rows: 4 },
      '2x6': { columns: 2, rows: 6 },
      '2x8': { columns: 2, rows: 8 }
    };
    
    const config = GRID_CONFIGS[gridType] || { columns: 2, rows: 4 };
    
    // Check if this design has a digital display
    const hasDisplay = gridType === 'dora-thermostat';
    
    // Limit display to 6 rows for thumbnail
    const displayRows = Math.min(config.rows, 6);
    const displayCols = config.columns;
    
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
    
    // Generate all zones similar to Frame component
    const allZones = [];
    
    for (let row = 1; row <= config.rows; row++) {
      for (let col = 1; col <= displayCols; col++) {
        const zoneId = displayCols === 1 
          ? `button${row}`
          : `button${(row - 1) * displayCols + col}`;
        allZones.push({
          id: zoneId,
          row,
          col,
          visible: row <= config.rows && col <= displayCols
        });
      }
    }
    
    // Render zones
    const gridCells = [];
    const processedZones = new Set();
    
    allZones.forEach(zone => {
      if (!zone.visible || processedZones.has(zone.id)) return;
      
      const zoneData = dropZones[zone.id];
      const isMerged = zoneData?.isMerged || zoneData?.mergedInto;
      const isPrimary = zoneData?.isPrimary;
      
      if (isMerged) {
        processedZones.add(zone.id);
        return;
      }
      
      // Mark zones covered by this button as processed
      if (isPrimary && zoneData?.dimensions) {
        const colSpan = zoneData.dimensions.colSpan || 1;
        const rowSpan = zoneData.dimensions.rowSpan || 1;
        for (let r = 0; r < rowSpan; r++) {
          for (let c = 0; c < colSpan; c++) {
            const coveredZoneId = displayCols === 1
              ? `button${zone.row + r}`
              : `button${(zone.row - 1 + r) * displayCols + (zone.col + c)}`;
            processedZones.add(coveredZoneId);
          }
        }
      } else {
        processedZones.add(zone.id);
      }
      
      // Build zone style
      const zoneStyle = {
        gridColumn: zone.col,
        gridRow: zone.row
      };
      
      if (isPrimary && zoneData?.dimensions) {
        const colSpan = zoneData.dimensions.colSpan || 1;
        const rowSpan = zoneData.dimensions.rowSpan || 1;
        if (colSpan > 1) {
          zoneStyle.gridColumn = `${zone.col} / span ${colSpan}`;
        }
        if (rowSpan > 1) {
          zoneStyle.gridRow = `${zone.row} / span ${rowSpan}`;
        }
        
        // Button with color
        const buttonColor = zoneData.color || fullColor || frameColor || 'polar-white';
        zoneStyle.backgroundColor = getColorValue(buttonColor);
        zoneStyle.borderColor = getColorValue(buttonColor);
      } else {
        // Empty zone
        const defaultColor = fullColor || frameColor || 'polar-white';
        zoneStyle.backgroundColor = getColorValue(defaultColor);
        zoneStyle.borderColor = getColorValue(defaultColor);
      }
      
      // Add border and styling
      zoneStyle.border = '0.5px solid rgba(0, 0, 0, 0.2)';
      zoneStyle.borderRadius = '1px';
      zoneStyle.display = 'flex';
      zoneStyle.alignItems = 'center';
      zoneStyle.justifyContent = 'center';
      zoneStyle.fontSize = '5px';
      zoneStyle.overflow = 'hidden';
      zoneStyle.position = 'relative';
      
      // Render text/icon if present
      const hasIcon = zoneData?.s0?.type === 'icon' || zoneData?.s1?.type === 'icon' || zoneData?.s2?.type === 'icon';
      const hasText = zoneData?.s0?.type === 'text' || zoneData?.s1?.type === 'text' || zoneData?.s2?.type === 'text';
      
      if (hasText) {
        zoneStyle.color = zoneData?.s0?.color || zoneData?.s1?.color || zoneData?.s2?.color || '#fff';
      }
      
      gridCells.push(
        <div key={zone.id} style={zoneStyle}>
          {hasText && (
            <span style={{ fontSize: '4px', textAlign: 'center', lineHeight: '1' }}>
              {zoneData?.s0?.value || zoneData?.s1?.value || zoneData?.s2?.value || ''}
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
    });
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        gap: '2px'
      }}>
        {hasDisplay && (
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#1a1a1a',
            borderRadius: '1px',
            border: '0.5px solid #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3px',
            color: '#4CAF50',
            fontWeight: 'bold',
            overflow: 'hidden'
          }}>
            88.5°F
          </div>
        )}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${displayCols}, 1fr)`,
          gridTemplateRows: `repeat(${displayRows}, 1fr)`,
          width: '100%',
          flex: 1,
          gap: '0.5px',
          backgroundColor: '#ddd',
          padding: '2px',
          border: '1px solid #1e90ff',
          borderRadius: '2px'
        }}>
          {gridCells}
        </div>
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
