import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';

// Product categories with proper configurations
const GRID_CONFIGS = {
  // Single Button
  'dora-1x1': { columns: 1, rows: 1, visibleZones: 1, label: 'Single Square Button', category: 'Design Your Self', hasDisplay: false },
  
  // 2-4 Buttons Switch
  'dora-2x2': { columns: 2, rows: 2, visibleZones: 4, label: 'Dora 2×2', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-2plus1': { columns: 2, rows: 2, visibleZones: 3, label: 'Dora 2+1', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-2Lplus1': { columns: 2, rows: 4, visibleZones: 3, label: 'Dora 2L+1', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-4plus1L': { columns: 2, rows: 4, visibleZones: 5, label: 'Dora 4+1L', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-4plus2L': { columns: 2, rows: 4, visibleZones: 7, label: 'Dora 4+1L+2', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-2plus2plus1': { columns: 2, rows: 4, visibleZones: 5, label: 'Dora 2+2+1', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-2plus1plus1': { columns: 2, rows: 3, visibleZones: 4, label: 'Dora 2+1+1', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-1L2plus1': { columns: 2, rows: 4, visibleZones: 4, label: 'Dora 1L+2+1', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-2x4': { columns: 2, rows: 4, visibleZones: 8, label: 'Dora Keypad 2×4', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-1x4': { columns: 1, rows: 4, visibleZones: 4, label: 'Dora 1×4', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-1x5': { columns: 1, rows: 5, visibleZones: 5, label: 'Dora 1×5', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-1x6': { columns: 1, rows: 6, visibleZones: 6, label: 'Dora 1×6', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-1x7': { columns: 1, rows: 7, visibleZones: 7, label: 'Dora 1×7', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-1x8': { columns: 1, rows: 8, visibleZones: 8, label: 'Dora 1×8', category: '2-4 Buttons Switch', hasDisplay: false },
  
  // 3-12 Button Switch
  'dora-1x3': { columns: 1, rows: 3, visibleZones: 3, label: 'Dora 1×3', category: '3-12 Button Switch', hasDisplay: false },
  //'dora-3plus2T': { columns: 3, rows: 3, visibleZones: 7, label: 'Dora 3+2T', category: '3-12 Button Switch', hasDisplay: false },
  'dora-6plus3T': { columns: 2, rows: 6, visibleZones: 9, label: 'Dora 6+3T', category: '3-12 Button Switch', hasDisplay: false },
  'dora-2x6': { columns: 2, rows: 6, visibleZones: 12, label: 'Dora 2×6', category: '3-12 Button Switch', hasDisplay: false },
  'dora-2x8': { columns: 2, rows: 6, visibleZones: 12, label: 'Dora XLarge 2×6', category: '3-12 Button Switch', hasDisplay: false },
  'pblock-2x6': { columns: 2, rows: 6, visibleZones: 12, label: 'Pblock 2×6', category: '3-12 Button Switch', hasDisplay: false },
  
  // 2-8 Room Controller
  // Note: Currently empty, room controller products can be added here
  
  // Design Your Self
  'dora-thermostat': { columns: 2, rows: 4, visibleZones: 8, label: 'Dora Thermostat 4+4', category: 'Design Your Self', hasDisplay: true },
  'pblock-2x4': { columns: 2, rows: 4, visibleZones: 8, label: 'Pblock 2×4', category: 'Design Your Self', hasDisplay: false },
  'pblock-2x2': { columns: 2, rows: 2, visibleZones: 4, label: 'PBlock 2×2 (Max 4 Buttons)', category: 'Design Your Self', hasDisplay: false },
  'pblock-2x2-display': { columns: 2, rows: 1, visibleZones: 2, label: 'PBlock 2×2 + Display', category: 'Design Your Self', hasDisplay: true },
  'pblock-3x2': { columns: 2, rows: 3, visibleZones: 6, label: 'PBlock 3×2 (Max 6 Buttons)', category: 'Design Your Self', hasDisplay: false },
  'pblock-3x2-display': { columns: 2, rows: 2, visibleZones: 4, label: 'PBlock 3×2 + Display', category: 'Design Your Self', hasDisplay: true },
  'pblock-4x2': { columns: 2, rows: 4, visibleZones: 8, label: 'PBlock 4×2 (Max 8 Buttons)', category: 'Design Your Self', hasDisplay: false },
  'pblock-4x2-display': { columns: 2, rows: 3, visibleZones: 6, label: 'PBlock 4×2 + Display', category: 'Design Your Self', hasDisplay: true },
  
  // Focus Mode
  'focus-mode': { columns: 1, rows: 1, visibleZones: 1, label: 'Focus Mode', category: 'Focus Mode', hasDisplay: false },
  
  // Legacy support (will be deprecated)
  '2x4': { columns: 2, rows: 4, visibleZones: 8, label: '2×4', category: 'Legacy', hasDisplay: false },
  '2x8': { columns: 2, rows: 8, visibleZones: 16, label: '2×8', category: 'Legacy', hasDisplay: false },
  '2x6': { columns: 2, rows: 6, visibleZones: 12, label: '2×6', category: 'Legacy', hasDisplay: false }
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
  setButtonColorTarget,
  selectedButtonPart,
  setSelectedButtonPart,
  selectedColor,
  selectedCategory,
  setSelectedCategory,
  setDownloadPDFHandler
}) {
  const config = GRID_CONFIGS[gridType] || GRID_CONFIGS['dora-2x4'];
  const [highlightedZones, setHighlightedZones] = useState([]);
  const [draggingDot, setDraggingDot] = useState(null);
  const [dotPositions, setDotPositions] = useState({});
  const frameRef = useRef(null);  
  // Product code generation logic
  const generateProductCode = useCallback(() => {
    const hasDisplay = config.hasDisplay;
    const rows = config.rows;
    const columns = config.columns;
    let rowCodes = [];
    
    // Iterate through each row to count buttons
    for (let row = 1; row <= rows; row++) {
      let buttonCount = 0;
      for (let col = 1; col <= columns; col++) {
        // Handle both single and double column layouts
        const zoneId = columns === 1 
          ? `button${row}`
          : `button${(row - 1) * columns + col}`;
        const zone = dropZones[zoneId];
        if (zone && zone.isPrimary) {
          buttonCount++;
        }
      }
      // 0 = no buttons, 1 = 1 button, 2 = 2 buttons
      rowCodes.push(buttonCount.toString());
    }
    
    // Build the code string
    const buttonConfig = rowCodes.join('');
    const displayPrefix = hasDisplay ? 'D' : '';
    const baseCode = displayPrefix + buttonConfig;
    
    // Material prefix (MM1 = metal, MM2 = plastic) - default to MM2 for now
    const materialCode = 'MM2';
    
    // Product series code
    let seriesCode = 'PB'; // Pblock
    if (gridType.includes('dora')) {
      seriesCode = 'DR'; // Dora
    }
    
    // Full product code format: MM2-DR/PB-D221-114-1RS
    // For now, return simplified version, can be extended with color codes
    return { materialCode, seriesCode, baseCode, buttonConfig, hasDisplay };
  }, [config, dropZones, gridType]);  
  // Get selectedColor and fullColor from props or context if needed
  // For now, we'll get it from the button data when placing

  const allZones = useMemo(() => {
    const zones = [];
    const maxRows = config.rows; // Use exact row count from config
    const maxCols = config.columns; // Use exact column count from config
    
    // Special handling for 6+3T layout (left: all 1x1, right: all 1x2)
    if (gridType === 'dora-6plus3T') {
      // Left column: 6 buttons (1x1 each)
      zones.push({ id: 'button1', row: 1, col: 1, visible: true });
      zones.push({ id: 'button3', row: 2, col: 1, visible: true });
      zones.push({ id: 'button5', row: 3, col: 1, visible: true });
      zones.push({ id: 'button7', row: 4, col: 1, visible: true });
      zones.push({ id: 'button9', row: 5, col: 1, visible: true });
      zones.push({ id: 'button11', row: 6, col: 1, visible: true });
      // Right column: 3 large buttons (1x2 each, spanning two rows)
      zones.push({ id: 'button2', row: 1, col: 2, rowSpan: 2, visible: true });
      zones.push({ id: 'button4', row: 2, col: 2, visible: false, mergedInto: 'button2' });
      zones.push({ id: 'button6', row: 3, col: 2, rowSpan: 2, visible: true });
      zones.push({ id: 'button8', row: 4, col: 2, visible: false, mergedInto: 'button6' });
      zones.push({ id: 'button10', row: 5, col: 2, rowSpan: 2, visible: true });
      zones.push({ id: 'button12', row: 6, col: 2, visible: false, mergedInto: 'button10' });
      return zones;
    }

    // Special handling for 3+2T layout (3 on top row, 2 on middle, 2 on bottom)
    if (gridType === 'dora-3plus2T') {
       // Left column: 6 buttons (1x1 each)
      zones.push({ id: 'button1', row: 1, col: 1, visible: true });
      zones.push({ id: 'button3', row: 2, col: 1, visible: true });
      zones.push({ id: 'button5', row: 3, col: 1, visible: true });
      zones.push({ id: 'button7', row: 4, col: 1, visible: true });
      zones.push({ id: 'button9', row: 5, col: 1, visible: true });
      zones.push({ id: 'button11', row: 6, col: 1, visible: true });
      // Right column: 3 large buttons (1x2 each, spanning two rows)
      zones.push({ id: 'button2', row: 1, col: 2, rowSpan: 2, visible: true });
      zones.push({ id: 'button4', row: 2, col: 2, visible: false, mergedInto: 'button2' });
      zones.push({ id: 'button6', row: 3, col: 2, rowSpan: 2, visible: true });
      zones.push({ id: 'button8', row: 4, col: 2, visible: false, mergedInto: 'button6' });
      zones.push({ id: 'button10', row: 5, col: 2, rowSpan: 2, visible: true });
      zones.push({ id: 'button12', row: 6, col: 2, visible: false, mergedInto: 'button10' });
      return zones;
    }


    
    // Special handling for 2L+1 layout (3 buttons: 2 large buttons on top each spanning 2 rows, 1 wide bottom spanning 2 rows)
    if (gridType === 'dora-2Lplus1') {
      // Left side: Large button spanning 2 rows
      zones.push({ id: 'button1', row: 1, col: 1, visible: true, rowSpan: 2 });
      zones.push({ id: 'button3', row: 2, col: 1, visible: false, mergedInto: 'button1' });
      // Right side: Large button spanning 2 rows
      zones.push({ id: 'button2', row: 1, col: 2, visible: true, rowSpan: 2 });
      zones.push({ id: 'button4', row: 2, col: 2, visible: false, mergedInto: 'button2' });
      // Bottom rows: 1 wide button spanning both columns and 2 rows
      zones.push({ id: 'button5', row: 3, col: 1, visible: true, colSpan: 2, rowSpan: 2 });
      zones.push({ id: 'button6', row: 3, col: 2, visible: false, mergedInto: 'button5' });
      zones.push({ id: 'button7', row: 4, col: 1, visible: false, mergedInto: 'button5' });
      zones.push({ id: 'button8', row: 4, col: 2, visible: false, mergedInto: 'button5' });
      return zones;
    }
    
    // Special handling for 4+1L layout (5 buttons: 4 stacked on left, 1 large on right spanning 4 rows)
    if (gridType === 'dora-4plus1L') {
      // Left side: 4 buttons stacked
      zones.push({ id: 'button1', row: 1, col: 1, visible: true });
      zones.push({ id: 'button3', row: 2, col: 1, visible: true });
      zones.push({ id: 'button5', row: 3, col: 1, visible: true });
      zones.push({ id: 'button7', row: 4, col: 1, visible: true });
      // Right side: Large button spanning 4 rows
      zones.push({ id: 'button2', row: 1, col: 2, visible: true, rowSpan: 4 });
      zones.push({ id: 'button4', row: 2, col: 2, visible: false, mergedInto: 'button2' });
      zones.push({ id: 'button6', row: 3, col: 2, visible: false, mergedInto: 'button2' });
      zones.push({ id: 'button8', row: 4, col: 2, visible: false, mergedInto: 'button2' });
      return zones;
    }
    
    // Special handling for 4+2L layout (7 buttons: 4 on left each 1 row, 1 large top right spanning 2 rows, 2 bottom right each 1 row)
    if (gridType === 'dora-4plus2L') {
      // Left side: 4 buttons stacked, each 1 row
      zones.push({ id: 'button1', row: 1, col: 1, visible: true });
      zones.push({ id: 'button3', row: 2, col: 1, visible: true });
      zones.push({ id: 'button5', row: 3, col: 1, visible: true });
      zones.push({ id: 'button7', row: 4, col: 1, visible: true });
      // Right side top: Large button spanning 2 rows
      zones.push({ id: 'button2', row: 1, col: 2, visible: true, rowSpan: 2 });
      zones.push({ id: 'button4', row: 2, col: 2, visible: false, mergedInto: 'button2' });
      // Right side bottom: 2 buttons, each 1 row
      zones.push({ id: 'button6', row: 3, col: 2, visible: true });
      zones.push({ id: 'button8', row: 4, col: 2, visible: true });
      return zones;
    }
    
    // Special handling for 2+2+1 layout (5 buttons: 2 on top row, 2 on second row, 1 wide bottom spanning 2 rows)
    if (gridType === 'dora-2plus2plus1') {
      // Top row: 2 buttons
      zones.push({ id: 'button1', row: 1, col: 1, visible: true });
      zones.push({ id: 'button2', row: 1, col: 2, visible: true });
      // Second row: 2 buttons
      zones.push({ id: 'button3', row: 2, col: 1, visible: true });
      zones.push({ id: 'button4', row: 2, col: 2, visible: true });
      // Bottom rows: 1 wide button spanning both columns and 2 rows
      zones.push({ id: 'button5', row: 3, col: 1, visible: true, colSpan: 2, rowSpan: 2 });
      zones.push({ id: 'button6', row: 3, col: 2, visible: false, mergedInto: 'button5' });
      zones.push({ id: 'button7', row: 4, col: 1, visible: false, mergedInto: 'button5' });
      zones.push({ id: 'button8', row: 4, col: 2, visible: false, mergedInto: 'button5' });
      return zones;
    }
    
    // Special handling for 1L+2+1 layout (4 buttons: 1 large left spanning 2 rows, 2 right stacked, 1 wide bottom spanning 2 rows)
    if (gridType === 'dora-1L2plus1') {
      // Left side: Large button spanning 2 rows
      zones.push({ id: 'button1', row: 1, col: 1, visible: true, rowSpan: 2 });
      zones.push({ id: 'button3', row: 2, col: 1, visible: false, mergedInto: 'button1' });
      // Right side top: Button
      zones.push({ id: 'button2', row: 1, col: 2, visible: true });
      // Right side middle: Button
      zones.push({ id: 'button4', row: 2, col: 2, visible: true });
      // Bottom rows: 1 wide button spanning both columns and 2 rows
      zones.push({ id: 'button5', row: 3, col: 1, visible: true, colSpan: 2, rowSpan: 2 });
      zones.push({ id: 'button6', row: 3, col: 2, visible: false, mergedInto: 'button5' });
      zones.push({ id: 'button7', row: 4, col: 1, visible: false, mergedInto: 'button5' });
      zones.push({ id: 'button8', row: 4, col: 2, visible: false, mergedInto: 'button5' });
      return zones;
    }
    
    // Special handling for 2+1+1 layout (4 buttons: 2 on top, 1 wide middle, 1 wide bottom)
    if (gridType === 'dora-2plus1plus1') {
      // Top row: 2 buttons
      zones.push({ id: 'button1', row: 1, col: 1, visible: true });
      zones.push({ id: 'button2', row: 1, col: 2, visible: true });
      // Middle row: 1 wide button spanning both columns
      zones.push({ id: 'button3', row: 2, col: 1, visible: true, colSpan: 2 });
      zones.push({ id: 'button4', row: 2, col: 2, visible: false, mergedInto: 'button3' });
      // Bottom row: 1 wide button spanning both columns
      zones.push({ id: 'button5', row: 3, col: 1, visible: true, colSpan: 2 });
      zones.push({ id: 'button6', row: 3, col: 2, visible: false, mergedInto: 'button5' });
      return zones;
    }
    
    // Special handling for 2+1 layout (3 buttons: 2 on top, 1 wide bottom)
    if (gridType === 'dora-2plus1') {
      // Top row: 2 buttons
      zones.push({ id: 'button1', row: 1, col: 1, visible: true });
      zones.push({ id: 'button2', row: 1, col: 2, visible: true });
      // Bottom row: 1 wide button spanning both columns
      zones.push({ id: 'button3', row: 2, col: 1, visible: true, colSpan: 2 });
      // Hidden zone for proper grid structure
      zones.push({ id: 'button4', row: 2, col: 2, visible: false, mergedInto: 'button3' });
      return zones;
    }
    
    // Special handling for PBlock 2x2 with Display (display on top, buttons on row 1)
    if (gridType === 'pblock-2x2-display') {
      // Row 1: 2 buttons
      zones.push({ id: 'button1', row: 1, col: 1, visible: true });
      zones.push({ id: 'button2', row: 1, col: 2, visible: true });
      return zones;
    }
    
    // Special handling for PBlock 3x2 with Display (display on top, buttons on rows 1-2)
    if (gridType === 'pblock-3x2-display') {
      // Row 1: 2 buttons
      zones.push({ id: 'button1', row: 1, col: 1, visible: true });
      zones.push({ id: 'button2', row: 1, col: 2, visible: true });
      // Row 2: 2 buttons
      zones.push({ id: 'button3', row: 2, col: 1, visible: true });
      zones.push({ id: 'button4', row: 2, col: 2, visible: true });
      return zones;
    }
    
    // Special handling for PBlock 4x2 with Display (display on top, buttons on rows 1-3)
    if (gridType === 'pblock-4x2-display') {
      // Row 1: 2 buttons
      zones.push({ id: 'button1', row: 1, col: 1, visible: true });
      zones.push({ id: 'button2', row: 1, col: 2, visible: true });
      // Row 2: 2 buttons
      zones.push({ id: 'button3', row: 2, col: 1, visible: true });
      zones.push({ id: 'button4', row: 2, col: 2, visible: true });
      // Row 3: 2 buttons
      zones.push({ id: 'button5', row: 3, col: 1, visible: true });
      zones.push({ id: 'button6', row: 3, col: 2, visible: true });
      return zones;
    }
    
    for (let row = 1; row <= maxRows; row++) {
      for (let col = 1; col <= maxCols; col++) {
        // For single column layouts (1x3, focus-mode), use simpler ID
        const zoneId = config.columns === 1 
          ? `button${row}`
          : `button${(row - 1) * config.columns + col}`;
        zones.push({
          id: zoneId,
          row,
          col,
          visible: row <= config.rows && col <= config.columns
        });
      }
    }
    return zones;
  }, [config, gridType]);

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
      dimensions: {
        ...dimensions,
        buttonType: buttonData.buttonType // Include buttonType in dimensions
      },
      zones: zonesToMerge,
      color: buttonData.color || null // Include color from drag data
    };

    placeButtonInZones(zonesToMerge, buttonDataWithMerge);
    setSelectedButton(zoneId);
    showFeedback('Button placed successfully!', 'success');
  };

  const handleFrameDrop = (e) => {
    e.preventDefault();
    if (e.target.closest('.drop-zone')) {
      return;
    }
    setHighlightedZones([]);
    showFeedback('Please drop the button on a valid zone', 'info');
  };

  const handleFrameDragOver = (e) => {
    e.preventDefault();
  };

  const handleZoneClick = (zoneId) => {
    // If a button part is selected (click-to-apply mode), place it
    if (selectedButtonPart) {
      const buttonType = selectedButtonPart;
      const dimensions = getButtonDimensions(buttonType);
      
      const zone = allZones.find(z => z.id === zoneId);
      if (!zone) return;
      
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
      
      // Place button with merge info
      const buttonDataWithMerge = {
        type: buttonType,
        dimensions: {
          ...dimensions,
          buttonType: buttonType // Include buttonType in dimensions
        },
        zones: zonesToMerge,
        color: selectedColor || fullColor || null // Include selected color in click-to-apply
      };
      
      placeButtonInZones(zonesToMerge, buttonDataWithMerge);
      setSelectedButton(zoneId);
      // Keep selectedButtonPart active so user can place multiple buttons
      showFeedback('Button placed successfully! Click another zone to place more.', 'success');
      return; // Exit early to prevent normal selection
    } else if (dropZones[zoneId]) {
      // Normal selection mode
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

  const handleDownloadPDF = useCallback(async () => {
    try {
      const frameElement = frameRef.current;
      if (!frameElement) {
        showFeedback('Frame not found', 'error');
        return;
      }

      // NOTE: Do NOT call showFeedback before capture — it triggers React re-renders
      // via setState + a 3-second auto-dismiss timer, which can recreate the DOM
      // during the async capture process and undo our icon processing.

      // Dynamically import html2canvas and jsPDF
      const html2canvas = (await import('html2canvas')).default;
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

      try {
        // === LIVE-DOM CAPTURE ===
        // Instead of cloning (which loses CSS context and causes layout displacement),
        // we modify the live DOM, capture it, and immediately restore.
        // Key: all async work (image loading) is done BEFORE touching the DOM.
        // The swap -> capture -> restore happens with NO awaits in between,
        // so React has no opportunity to re-render and undo our changes.

        const frameWidth = frameElement.offsetWidth;
        const frameHeight = frameElement.offsetHeight;

        // --- Phase 1: Pre-load all icon white versions (async, no DOM changes) ---
        const liveIcons = frameElement.querySelectorAll('img.button-icon');
        console.log('Pre-loading', liveIcons.length, 'icons for PDF capture');

        // Map: img element -> { whiteSrc, originalSrc, originalStyles }
        const iconData = new Map();

        for (const img of liveIcons) {
          try {
            const src = img.getAttribute('src') || img.src;

            const loadedImg = await new Promise((resolve, reject) => {
              const testImg = new Image();
              testImg.crossOrigin = 'anonymous';
              testImg.onload = () => resolve(testImg);
              testImg.onerror = () => reject(new Error('Failed to load: ' + src));
              testImg.src = src;
              setTimeout(() => reject(new Error('Timeout loading: ' + src)), 5000);
            });

            // Render at minimum 200×200 for quality
            const c = document.createElement('canvas');
            const ctx = c.getContext('2d');
            const minSize = 200;
            const w = Math.max(loadedImg.naturalWidth || minSize, minSize);
            const h = Math.max(loadedImg.naturalHeight || minSize, minSize);
            c.width = w;
            c.height = h;
            ctx.drawImage(loadedImg, 0, 0, w, h);

            // brightness(0) + invert(1) via pixel manipulation -> pure white
            const imageData = ctx.getImageData(0, 0, w, h);
            const pixels = imageData.data;
            for (let i = 0; i < pixels.length; i += 4) {
              if (pixels[i + 3] > 0) {
                pixels[i] = 255;
                pixels[i + 1] = 255;
                pixels[i + 2] = 255;
              }
            }
            ctx.putImageData(imageData, 0, 0);

            iconData.set(img, {
              whiteSrc: c.toDataURL('image/png'),
              originalSrc: src,
              originalFilter: img.style.filter,
              originalWebkitFilter: img.style.webkitFilter
            });
          } catch (err) {
            console.warn('Failed to pre-load icon for PDF:', err);
          }
        }

        // --- Phase 2: Synchronous swap, capture, restore (no awaits between swap and restore) ---

        // Inject CSS override to disable filter (html2canvas ignores CSS filter)
        // and remove overflow clipping on inner button containers so icons
        // aren't trimmed (especially pblock with 2 icons per button).
        // IMPORTANT: Do NOT override overflow on .drop-zone or .frame-container-*
        // as that displaces grid items.
        const styleOverride = document.createElement('style');
        styleOverride.id = 'pdf-capture-style-override';
        styleOverride.textContent = `
          .button-icon, img.button-icon,
          .button-content .button-icon, .dropped-button .button-icon,
          .button-content img.button-icon, .dropped-button img.button-icon {
            filter: none !important;
            -webkit-filter: none !important;
          }
          .dropped-button .button-content,
          .button-content {
            overflow: visible !important;
          }
          .button-content .s0,
          .button-content .s1,
          .button-content .s2 {
            overflow: visible !important;
          }
        `;
        document.head.appendChild(styleOverride);

        // Hide action buttons
        const removeBtns = frameElement.querySelectorAll('.remove-button');
        const colorBtns = frameElement.querySelectorAll('.button-color-btn');
        removeBtns.forEach(btn => btn.style.display = 'none');
        colorBtns.forEach(btn => btn.style.display = 'none');

        // Swap icon sources to pre-rendered white versions
        for (const [img, data] of iconData) {
          img.src = data.whiteSrc;
          img.style.filter = 'none';
          img.style.webkitFilter = 'none';
        }

        // Small delay for data-URL images to render, then capture
        await new Promise(r => setTimeout(r, 100));

        const captureScale = 2;
        let canvas;
        try {
          canvas = await html2canvas(frameElement, {
            scale: captureScale,
            useCORS: true,
            allowTaint: false,
            backgroundColor: null,
            logging: false,
            foreignObjectRendering: false,
            removeContainer: false,
            imageTimeout: 15000,
            timeout: 60000,
            width: frameWidth,
            height: frameHeight,
            scrollX: -window.scrollX,
            scrollY: -window.scrollY
          });
        } finally {
          // --- Phase 3: Restore everything (always runs, even if capture fails) ---
          document.head.removeChild(styleOverride);
          removeBtns.forEach(btn => btn.style.display = '');
          colorBtns.forEach(btn => btn.style.display = '');
          for (const [img, data] of iconData) {
            img.src = data.originalSrc;
            img.style.filter = data.originalFilter;
            img.style.webkitFilter = data.originalWebkitFilter;
          }
        }

        console.log('Canvas captured, size:', canvas.width, 'x', canvas.height);

        // Create a PNG screenshot (web) and store it for reuse in the PDF
        let screenshotDataUrl = '';
        try {
          if (!canvas || canvas.width === 0 || canvas.height === 0) {
            throw new Error('Canvas is empty or invalid');
          }
          screenshotDataUrl = canvas.toDataURL('image/png');
          console.log('Screenshot data URL created, length:', screenshotDataUrl.length);
        } catch (err) {
          console.error('Failed to generate screenshot PNG:', err);
          showFeedback('Failed to generate PDF screenshot', 'error');
        }
        if (screenshotDataUrl) {
          const previewId = 'pdf-screenshot-preview';
          let previewImg = document.getElementById(previewId);
          if (!previewImg) {
            previewImg = document.createElement('img');
            previewImg.id = previewId;
            previewImg.style.position = 'fixed';
            previewImg.style.left = '-99999px';
            previewImg.style.top = '0';
            previewImg.style.width = `${canvas.width}px`;
            previewImg.style.height = `${canvas.height}px`;
            previewImg.style.opacity = '0';
            previewImg.style.pointerEvents = 'none';
            document.body.appendChild(previewImg);
          }
          previewImg.src = screenshotDataUrl;
        }

        // Check if canvas has content
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          throw new Error('Failed to capture frame - canvas is empty');
        }

        // Calculate PDF dimensions from canvas
        // Canvas is at captureScale, so divide by it to get screen size
        const screenWidth = canvas.width / captureScale;
        const screenHeight = canvas.height / captureScale;
        
        // Convert pixels to mm (96 DPI = 25.4 mm/inch)
        const pxToMM = 25.4 / 96;
        let widthMM = screenWidth * pxToMM;
        let heightMM = screenHeight * pxToMM;
        
        // Don't scale down - keep original size to preserve spacing and symmetry
        // (removing the 0.9 scale factor that was distorting button spacing)

        // Calculate PDF page size with proper margins
        const pageMarginMM = 15;
        const infoHeightMM = 120; // Space for information section - increased for button details
        const totalHeightMM = heightMM + infoHeightMM + pageMarginMM * 2;
        const pageWidthMM = Math.max(widthMM + pageMarginMM * 2, 210); // A4 width
        const pageHeightMM = Math.max(totalHeightMM, 297); // A4 height

        // Create PDF
        const pdf = new jsPDF({
          orientation: pageWidthMM > pageHeightMM ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [pageWidthMM, pageHeightMM],
          compress: true,
          precision: 16
        });

        // Add background color for header section
        pdf.setFillColor(245, 245, 245);
        pdf.rect(0, 0, pageWidthMM, 15, 'F');

        // Add header with smooth styling
        pdf.setFontSize(20);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('KNX Switch Designer', pageWidthMM / 2, 9.5, { align: 'center' });

        // Add top border line
        pdf.setDrawColor(150, 120, 90);
        pdf.setLineWidth(0.5);
        pdf.line(pageMarginMM, 15, pageWidthMM - pageMarginMM, 15);

        // Calculate image positioning
        const topMargin = pageMarginMM;
        const leftMargin = (pageWidthMM - widthMM) / 2;

        // Add design screenshot
        try {
          const imgData = screenshotDataUrl;
          if (!imgData || imgData.length === 0) {
            throw new Error('Screenshot data is empty');
          }
          console.log('Adding image to PDF, dimensions:', widthMM, 'x', heightMM);
          pdf.addImage(imgData, 'PNG', leftMargin, topMargin + 15, widthMM, heightMM);
          console.log('Image added successfully to PDF');
        } catch (err) {
          console.error('Error adding image to PDF:', err);
          showFeedback('Failed to add design image to PDF: ' + err.message, 'error');
          // Add a text placeholder if image fails
          pdf.setTextColor(200, 200, 200);
          pdf.text('Design Screenshot Failed', leftMargin + widthMM / 2, topMargin + heightMM / 2 + 15, { align: 'center' });
        }

        // Add design info section
        const infoPosY = topMargin + heightMM + 20;

        // Add design info details
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(40, 40, 40);
        let currentY = infoPosY + 10;
        
        // Product Code Generation
        const productCodeData = generateProductCode();
        const fullProductCode = `${productCodeData.materialCode}-${productCodeData.seriesCode}-${productCodeData.baseCode}`;
        
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.text('Product Code', pageMarginMM + 3, currentY);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(': ' + fullProductCode, pageMarginMM + 35, currentY);
        currentY += 6;
        
        // Product Category
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'bold');
        pdf.text('Product Type', pageMarginMM + 3, currentY);
        pdf.setFont(undefined, 'normal');
        pdf.text(': ' + (config.label || gridType), pageMarginMM + 35, currentY);
        currentY += 5;
        
        // Display Status
        pdf.setFont(undefined, 'bold');
        pdf.text('Display', pageMarginMM + 3, currentY);
        pdf.setFont(undefined, 'normal');
        pdf.text(': ' + (productCodeData.hasDisplay ? 'Yes' : 'No'), pageMarginMM + 35, currentY);
        currentY += 5;
        
        // Frame Color with explicit code
        pdf.setFont(undefined, 'bold');
        pdf.text('Frame Color', pageMarginMM + 3, currentY);
        pdf.setFont(undefined, 'normal');
        const frameColorCode = frameColor ? `${frameColor} (${getColorValue(frameColor)})` : 'Default';
        pdf.text(': ' + frameColorCode, pageMarginMM + 35, currentY);
        currentY += 5;
        
        // Full Color
        if (fullColor) {
          pdf.setFont(undefined, 'bold');
          pdf.text('Full Color', pageMarginMM + 3, currentY);
          pdf.setFont(undefined, 'normal');
          const fullColorCode = `${fullColor} (${getColorValue(fullColor)})`;
          pdf.text(': ' + fullColorCode, pageMarginMM + 35, currentY);
          currentY += 5;
        }
        
        currentY += 2;

        // Create new page for button details
        pdf.addPage();
        currentY = pageMarginMM + 5;

        // Add Button Details heading
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Button Details', pageMarginMM + 3, currentY);
        currentY += 8;

        // Collect button details for display - collect all zones with content
        const buttonDetails = [];
        const zoneKeys = Object.keys(dropZones).sort((a, b) => {
          const numA = parseInt(a.replace('button', ''));
          const numB = parseInt(b.replace('button', ''));
          return numA - numB;
        });
        
        zoneKeys.forEach((zoneId, index) => {
          const zone = dropZones[zoneId];
          if (zone) {
            const s0Content = zone.s0?.type === 'icon' ? `Icon: ${zone.s0.value}` : (zone.s0?.type === 'text' ? `Text: ${zone.s0.value}` : '');
            const s1Content = zone.s1?.type === 'icon' ? `Icon: ${zone.s1.value}` : (zone.s1?.type === 'text' ? `Text: ${zone.s1.value}` : '');
            const s2Content = zone.s2?.type === 'icon' ? `Icon: ${zone.s2.value}` : (zone.s2?.type === 'text' ? `Text: ${zone.s2.value}` : '');
            
            // Only add to details if zone has any content or is a primary zone
            if (zone.isPrimary || s0Content || s1Content || s2Content) {
              const details = {
                number: index + 1,
                color: zone.color || fullColor || 'Default',
                s0: s0Content,
                s1: s1Content,
                s2: s2Content
              };
              buttonDetails.push(details);
            }
          }
        });

        // Add a new page for button details to ensure space
        if (buttonDetails.length > 0 && currentY > pageHeightMM - 60) {
          pdf.addPage();
          currentY = pageMarginMM + 5;
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(60, 60, 60);
          pdf.text('Button Details (continued)', pageMarginMM + 3, currentY);
          currentY += 5;
        }

        // Display buttons
        buttonDetails.forEach((btn) => {
          // Check if we need a new page
          if (currentY > pageHeightMM - pageMarginMM - 5) {
            pdf.addPage();
            currentY = pageMarginMM;
          }
          
          // Button number and color with color code
          pdf.setFont(undefined, 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(40, 40, 40);
          pdf.text(`Button ${btn.number}`, pageMarginMM + 3, currentY);
          
          pdf.setFont(undefined, 'normal');
          const colorCode = btn.color !== 'Default' ? `${btn.color} (${getColorValue(btn.color)})` : btn.color;
          pdf.text(`: ${colorCode}`, pageMarginMM + 24, currentY);
          currentY += 4;

          // Top content (s0)
          if (btn.s0 && typeof btn.s0 === 'string' && btn.s0.trim().length > 0) {
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(40, 40, 40);
            const s0Text = `  Top: ${btn.s0}`;
            pdf.text(s0Text, pageMarginMM + 5, currentY);
            currentY += 3;
          }

          // Center content (s1)
          if (btn.s1 && typeof btn.s1 === 'string' && btn.s1.trim().length > 0) {
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(40, 40, 40);
            const s1Text = `  Center: ${btn.s1}`;
            pdf.text(s1Text, pageMarginMM + 5, currentY);
            currentY += 3;
          }

          // Bottom content (s2)
          if (btn.s2 && typeof btn.s2 === 'string' && btn.s2.trim().length > 0) {
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(40, 40, 40);
            const s2Text = `  Bottom: ${btn.s2}`;
            pdf.text(s2Text, pageMarginMM + 5, currentY);
            currentY += 3;
          }
          
          currentY += 2;
          currentY += 1;
        });

        // Generated timestamp
        if (currentY > pageHeightMM - pageMarginMM - 10) {
          pdf.addPage();
          currentY = pageMarginMM;
        }
        
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'italic');
        pdf.setTextColor(100, 100, 100);
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        pdf.text(`Generated: ${dateStr}`, pageMarginMM + 3, currentY + 2);

        // Save PDF
        pdf.save(`board-design-${gridType}-${Date.now()}.pdf`);
        showFeedback('PDF downloaded successfully!', 'success');
      } catch (error) {
        // Clean up style override if it exists
        const leftoverStyle = document.getElementById('pdf-capture-style-override');
        if (leftoverStyle) document.head.removeChild(leftoverStyle);
        console.error('Error generating PDF:', error);
        showFeedback(`Failed to generate PDF: ${error.message}`, 'error');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      showFeedback(`Failed to generate PDF: ${error.message}`, 'error');
    }
  }, [config, frameColor, fullColor, getColorValue, gridType, showFeedback, generateProductCode, dropZones]);

  // Register PDF download handler with parent
  useEffect(() => {
    if (setDownloadPDFHandler) {
      setDownloadPDFHandler(() => handleDownloadPDF);
    }
  }, [setDownloadPDFHandler, handleDownloadPDF]);

  // Dot drag-and-drop handlers
  const handleDotMouseDown = useCallback((e, zoneId, dotKey) => {
    e.stopPropagation();
    e.preventDefault();
    const startTime = Date.now();
    const startX = e.clientX;
    const startY = e.clientY;
    
    setDraggingDot({ zoneId, dotKey, startTime, startX, startY });
  }, []);

  const handleDotMouseUp = useCallback((e, zoneId, dotKey) => {
    if (draggingDot && draggingDot.zoneId === zoneId && draggingDot.dotKey === dotKey) {
      const duration = Date.now() - draggingDot.startTime;
      const distance = Math.sqrt(
        Math.pow(e.clientX - draggingDot.startX, 2) + 
        Math.pow(e.clientY - draggingDot.startY, 2)
      );
      
      // If click was short and didn't move much, treat as click to select
      if (duration < 300 && distance < 5) {
        setSelectedButton(zoneId);
        // User can now use Icon & Text tab to add icon to this position
        showFeedback(`Zone selected. Use Icon & Text tab to add content to ${dotKey}`, 'info');
      }
    }
    setDraggingDot(null);
  }, [draggingDot, showFeedback, setSelectedButton]);

  const handleDotMouseMove = useCallback((e, zoneId) => {
    if (!draggingDot || draggingDot.zoneId !== zoneId) return;
    
    const button = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - button.left) / button.width) * 100;
    const y = ((e.clientY - button.top) / button.height) * 100;
    
    // Clamp values between 25% and 75% to prevent icons from being clipped at button edges
    // Provides adequate margin for 35px icons in PDF capture (scaled from 40px in web view)
    const clampedX = Math.max(25, Math.min(75, x));
    const clampedY = Math.max(25, Math.min(75, y));
    
    setDotPositions(prev => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        [draggingDot.dotKey]: { x: clampedX, y: clampedY }
      }
    }));
  }, [draggingDot]);

  const handleDotMouseLeave = useCallback(() => {
    setDraggingDot(null);
  }, []);

  const renderZoneContent = (zoneId) => {
    const zone = dropZones[zoneId];
    if (!zone || !zone.isPrimary) return null; // Only render in primary zone

    // Determine icon size - use fixed pixels so icons are same size on all button sizes
    const iconStyle = {
      objectFit: 'contain',
      maxWidth: '40px',
      maxHeight: '40px',
      width: '40px',
      height: '40px'
    };

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

    // Check if button type has dots (5, 6, 7, 8, 9, 10, 11)
    const buttonType = zone.dimensions?.buttonType;
    const isButtonWithDots = [5, 6, 7, 8, 9, 10, 11].includes(buttonType);

    // Get custom dot positions or use defaults
    const customPositions = dotPositions[zoneId] || {};
    
    // Default positions for each button type
    const getDefaultDotPosition = (type, dotKey) => {
      const defaults = {
        5: { s0: { x: 50, y: 30 }, s1: { x: 50, y: 70 } },
        6: { s0: { x: 30, y: 50 }, s1: { x: 70, y: 50 } },
        7: { s0: { x: 50, y: 50 } },
        8: { s0: { x: 30, y: 30 }, s1: { x: 30, y: 70 } },
        9: { s0: { x: 30, y: 50 }, s1: { x: 70, y: 50 } },
        10: { s0: { x: 50, y: 30 }, s1: { x: 50, y: 70 } },
        11: { s0: { x: 50, y: 35 }, s1: { x: 50, y: 65 } }
      };
      return defaults[type]?.[dotKey] || { x: 50, y: 50 };
    };

    const renderDot = (dotKey) => {
      const position = customPositions[dotKey] || getDefaultDotPosition(buttonType, dotKey);
      const zoneData = zone[dotKey];
      const hasContent = (zoneData?.type === 'icon' && zoneData?.value) || (zoneData?.type === 'text' && zoneData?.value);
      
      return (
        <span
          key={dotKey}
          className={dotKey}
          style={{
            position: 'absolute',
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: hasContent ? '40px' : '20px',
            minHeight: hasContent ? '40px' : '20px',
            cursor: draggingDot?.zoneId === zoneId && draggingDot?.dotKey === dotKey ? 'grabbing' : 'grab',
            zIndex: 10
          }}
          onMouseDown={(e) => handleDotMouseDown(e, zoneId, dotKey)}
          onMouseUp={(e) => handleDotMouseUp(e, zoneId, dotKey)}
        >
          {zoneData?.type === 'icon' && zoneData?.value ? (
            <img 
              src={`/ican/images/${zoneData.value}`} 
              alt="icon" 
              className="button-icon"
              style={{
                filter: 'brightness(0) invert(1)',
                WebkitFilter: 'brightness(0) invert(1)',
                objectFit: 'contain',
                maxWidth: '40px',
                maxHeight: '40px',
                width: '40px',
                height: '40px',
                pointerEvents: 'none',
                display: 'block'
              }}
              onError={(e) => {
                console.error('Failed to load icon:', zoneData.value);
                e.target.style.display = 'none';
              }}
            />
          ) : zoneData?.type === 'text' && zoneData?.value ? (
            <span style={{ color: zoneData?.color || '#ffffff', fontSize: '14px', fontWeight: '500', pointerEvents: 'none', whiteSpace: 'nowrap' }}>{zoneData.value}</span>
          ) : (
            <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(0,0,0,0.4)', border: '2px solid rgba(0,0,0,0.6)', pointerEvents: 'none' }}></div>
          )}
        </span>
      );
    };

    return (
      <div 
        className="dropped-button" 
        style={buttonStyle}
        onMouseMove={(e) => handleDotMouseMove(e, zoneId)}
        onMouseLeave={handleDotMouseLeave}
      >
        <div className="button-content" style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* Render draggable dots for buttons with dots */}
          {isButtonWithDots && (
            <>
              {renderDot('s0')}
              {(buttonType !== 7) && renderDot('s1')}
            </>
          )}
          {/* Render original content for standard buttons */}
          {!isButtonWithDots && (
            <>
              <span className="s0">
                {zone.s0?.type === 'icon' && zone.s0?.value && (
                  <img 
                    src={`/ican/images/${zone.s0.value}`} 
                    alt="icon" 
                    className="button-icon"
                    style={iconStyle}
                    onError={(e) => {
                      console.error('Failed to load icon:', zone.s0.value);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                {zone.s0?.type === 'text' && zone.s0?.value && (
                  <span style={{ color: zone.s0?.color || '#ffffff' }}>{zone.s0.value}</span>
                )}
              </span>
              <span className="s1">
                {zone.s1?.type === 'icon' && zone.s1?.value && (
                  <img 
                    src={`/ican/images/${zone.s1.value}`} 
                    alt="icon" 
                    className="button-icon"
                    style={iconStyle}
                    onError={(e) => {
                      console.error('Failed to load icon:', zone.s1.value);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                {zone.s1?.type === 'text' && zone.s1?.value && (
                  <span style={{ color: zone.s1?.color || '#ffffff' }}>{zone.s1.value}</span>
                )}
              </span>
              <span className="s2">
                {zone.s2?.type === 'icon' && zone.s2?.value && (
                  <img 
                    src={`/ican/images/${zone.s2.value}`} 
                    alt="icon" 
                    className="button-icon"
                    style={iconStyle}
                    onError={(e) => {
                      console.error('Failed to load icon:', zone.s2.value);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                {zone.s2?.type === 'text' && zone.s2?.value && (
                  <span style={{ color: zone.s2?.color || '#ffffff' }}>{zone.s2.value}</span>
                )}
              </span>
            </>
          )}
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
      {/* Product Selector with Visual Icons - Matching Reference Design */}
      <div className="d-flex flex-column align-items-center justify-content-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        {/* Product Configuration Selector */}
        
        
      </div>

      {/* Frame Container with Digital Interface and Grid */}
      <div
        ref={frameRef}
        id="key"
        className={`frame-container-${gridType} ${config.hasDisplay ? 'with-digital-interface' : ''}`}
        style={{ 
          backgroundColor: frameColor ? getColorValue(frameColor) : '#000'
        }}
      >
        {/* Digital Interface for Thermostat models */}
        {config.hasDisplay && (
          <div className="digital-interface">
            <img 
              src="/images/thermostat-interface.png" 
              alt="Thermostat Digital Interface" 
              className="digital-interface-image"
            />
          </div>
        )}

        {/* Device Layout - Drop Zone */}
        <div
          className={`layout polar-white custom basic layout-${gridType} ${config.hasDisplay ? 'with-digital-interface' : ''}`}
        data-place="frame"
        data-grid-type={gridType}
        style={{
          borderColor: (frameColor || fullColor) ? getColorValue(frameColor || fullColor) : undefined
        }}
        onDragOver={handleFrameDragOver}
        onDrop={handleFrameDrop}
      >
        {allZones.map(zone => {
          const zoneData = dropZones[zone.id];
          const isMerged = zoneData?.isMerged || zone.mergedInto;
          const isPrimary = zoneData?.isPrimary;
          const isHighlighted = highlightedZones.includes(zone.id);
          const shouldShow = zone.visible && !isMerged;

          if (!shouldShow && !isMerged) return null;

          const zoneStyle = {
            // Position the zone in the grid
            ...(zone.col && zone.row ? {
              gridColumn: zone.col,
              gridRow: zone.row
            } : {}),
            // Apply row/col span
            ...(isPrimary && zoneData?.dimensions ? {
              gridColumn: zone.col && zoneData.dimensions.colSpan > 1 ? `${zone.col} / span ${zoneData.dimensions.colSpan}` : (zone.col ? zone.col : undefined),
              gridRow: zone.row && zoneData.dimensions.rowSpan > 1 ? `${zone.row} / span ${zoneData.dimensions.rowSpan}` : (zone.row ? zone.row : undefined)
            } : (zone.colSpan || zone.rowSpan) ? {
              gridColumn: zone.col && zone.colSpan ? `${zone.col} / span ${zone.colSpan}` : (zone.col ? zone.col : undefined),
              gridRow: zone.row && zone.rowSpan ? `${zone.row} / span ${zone.rowSpan}` : (zone.row ? zone.row : undefined)
            } : {}),
            // Apply fullColor to empty zones
            ...(!isPrimary && fullColor ? {
              backgroundColor: getColorValue(fullColor),
              backgroundImage: getTextureImage(fullColor) ? `url(${getTextureImage(fullColor)})` : undefined,
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
    </div>
  );
}

export default Frame;

