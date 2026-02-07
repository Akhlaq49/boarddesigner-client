import { useState, useCallback } from 'react';

const COLORS = {
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

const TEXTURE_IMAGES = {
  'polar-white': '/images/polar-white.C_BHS7yz.webp',
  'royal-silver': '/images/royal-silver.DCV-2Hhk.webp',
  'anthracite-gray': '/images/anthracite-gray.C5T6qsn_.webp',
  'meteor-black': '/images/meteor-black.gUXuWB01.webp',
  'texture-black': '/images/texture-black.Cm2809Or.webp',
  'pure-gold': '/images/pure-gold.Be-uofrm.webp',
  'antique-copper': '/images/antique-copper.rqO417XN.webp',
  'antique-bronze': '/images/antique-bronze.4-jEtX_3.webp',
  'red-cherry': '/images/red-cherry.Dfq_s_0J.webp',
  'green-leaf': '/images/green-leaf.DRw9hQSI.webp'
};

const ICON_FILES = [
  '0CB-60.svg',
  'AC-01.svg', 'AC-03.svg', 'AC-04.svg', 'AC-05.svg', 'AC-06.svg', 'AC-07.svg', 'AC-07-8.svg', 'AC-09.svg',
  'AC-10.svg', 'AC-11.svg', 'AC-12.svg', 'AC-13.svg', 'AC-14.svg', 'AC-15.svg', 'AC-16.svg', 'AC-17.svg',
  'AC-18.svg', 'AC-20.svg', 'AC-21.svg', 'AC-22.svg', 'AC-23.svg', 'AC-24.svg', 'AC-25.svg', 'AC-26.svg',
  'AC-27.svg', 'AC-28.svg', 'AC-29.svg', 'AC-30.svg', 'AC-31.svg', 'AC-32.svg', 'AC-33.svg', 'AC-34.svg',
  'Asset%20356.svg',
  'BC-01.svg', 'BC-02.svg', 'BC-03.svg', 'BC-04.svg', 'BC-05.svg', 'BC-06.svg', 'BC-07.svg', 'BC-08.svg',
  'BC-09.svg', 'BC-10.svg', 'BC-11.svg', 'BC-12.svg', 'BC-13.svg', 'BC-14.svg', 'BC-15.svg',
  'C&CM-01.svg', 'C&CM-02.svg', 'C&CM-03.svg', 'C&CM-04.svg',
  'C&H-01.svg', 'C&H-02.svg', 'C&H-03.svg', 'C&H-04.svg', 'C&H-05.svg', 'C&H-06.svg', 'C&H-07.svg',
  'C&H-08.svg', 'C&H-09.svg', 'C&H-10.svg', 'C&H-11.svg', 'C&H-12.svg', 'C&H-13.svg', 'C&H-14.svg',
  'C&H-15.svg', 'C&H-16.svg', 'C&H-17.svg',
  'C-01.svg', 'C-02.svg', 'C-02_1.svg', 'C-03.svg', 'C-04.svg', 'C-05.svg', 'C-06.svg', 'C-07.svg',
  'C-08.svg', 'C-09.svg',
  'CB-1.svg', 'CB-2.svg', 'CB-3.svg', 'CB-4.svg', 'CB-5.svg', 'CB-6.svg', 'CB-7.svg', 'CB-8.svg', 'CB-9.svg',
  'CB-10.svg', 'CB-11.svg', 'CB-12.svg', 'CB-13.svg', 'CB-14.svg', 'CB-15.svg', 'CB-16.svg', 'CB-17.svg',
  'CB-18.svg', 'CB-19.svg', 'CB-20.svg', 'CB-21.svg', 'CB-22.svg', 'CB-23.svg', 'CB-24.svg', 'CB-25.svg',
  'CB-26.svg', 'CB-27.svg', 'CB-28.svg', 'CB-29.svg', 'CB-30.svg', 'CB-31.svg', 'CB-32.svg', 'CB-33.svg',
  'CB-34.svg', 'CB-35.svg', 'CB-36.svg', 'CB-37.svg', 'CB-38.svg', 'CB-39.svg', 'CB-40.svg', 'CB-41.svg',
  'CB-42.svg', 'CB-43.svg', 'CB-44.svg', 'CB-45.svg', 'CB-46.svg', 'CB-47.svg', 'CB-48.svg', 'CB-49.svg',
  'CB-50.svg', 'CB-51.svg', 'CB-52.svg', 'CB-53.svg', 'CB-54.svg', 'CB-55.svg', 'CB-56.svg', 'CB-57.svg',
  'CB-58.svg', 'CB-59.svg', 'CB-61.svg', 'CB-62.svg', 'CB-63.svg', 'CB-64.svg', 'CB-65.svg', 'CB-66.svg',
  'CB-67.svg', 'CB-68.svg', 'CB-69.svg', 'CB-70.svg', 'CB-71.svg', 'CB-72.svg', 'CB-73.svg', 'CB-74.svg',
  'CB-75.svg', 'CB-76.svg', 'CB-77.svg', 'CB-78.svg', 'CB-79.svg', 'CB-80.svg', 'CB-81.svg', 'CB-82.svg',
  'CB-83.svg', 'CB-84.svg', 'CB-85.svg', 'CB-86.svg', 'CB-87.svg', 'CB-88.svg', 'CB-89.svg', 'CB-90.svg',
  'D-01.svg', 'D-02.svg', 'D-03.svg', 'D-04.svg', 'D-05.svg', 'D-06.svg', 'D-07.svg', 'D-08.svg',
  'D-09.svg', 'D-10.svg', 'D-11.svg', 'D-12.svg', 'D-13.svg', 'D-14.svg', 'D-15.svg', 'D-16.svg',
  'D-17.svg', 'D-18.svg', 'D-19.svg', 'D-20.svg', 'D-21.svg', 'D-22.svg', 'D-23.svg', 'D-24.svg',
  'D-25.svg', 'D-26.svg', 'D-27.svg', 'D-28.svg', 'D-29.svg', 'D-30.svg',
  'E&R-01.svg', 'E&R-02.svg', 'E&R-03.svg', 'E&R-04.svg',
  'G&S-01.svg', 'G&S-02.svg', 'G&S-03.svg', 'G&S-04.svg', 'G&S-05.svg', 'G&S-06.svg', 'G&S-07.svg',
  'G&S-08.svg', 'G&S-09.svg', 'G&S-10.svg', 'G&S-11.svg', 'G&S-12.svg', 'G&S-13.svg', 'G&S-14.svg',
  'G&S-15.svg', 'G&S-16.svg', 'G&S-17.svg', 'G&S-18.svg', 'G&S-19.svg', 'G&S-20.svg',
  'H&HS-01.svg', 'H&HS-02.svg', 'H&HS-03.svg', 'H&HS-04.svg', 'H&HS-05.svg', 'H&HS-06.svg', 'H&HS-07.svg',
  'H&HS-08.svg', 'H&HS-09.svg', 'H&HS-10.svg', 'H&HS-11.svg', 'H&HS-12.svg', 'H&HS-13.svg', 'H&HS-14.svg',
  'H&HS-15.svg', 'H&HS-16.svg', 'H&HS-17.svg', 'H&HS-18.svg', 'H&HS-19.svg', 'H&HS-20.svg', 'H&HS-21.svg',
  'H&HS-22.svg',
  'H&S-01.svg', 'H&S-02.svg', 'H&S-03.svg', 'H&S-04.svg',
  'IU-01.svg', 'IU-02.svg', 'IU-03.svg', 'IU-04.svg', 'IU-05.svg', 'IU-06.svg', 'IU-07.svg', 'IU-08.svg',
  'IU-09.svg', 'IU-10.svg', 'IU-11.svg', 'IU-12.svg',
  'KC-01.svg', 'KC-02.svg', 'KC-03.svg', 'KC-04.svg', 'KC-05.svg', 'KC-06.svg', 'KC-07.svg', 'KC-08.svg',
  'KC-09.svg', 'KC-10.svg', 'KC-11.svg', 'KC-12.svg', 'KC-13.svg', 'KC-14.svg', 'KC-15.svg',
  'LL-01.svg', 'LL-02.svg', 'LL-03.svg', 'LL-04.svg', 'LL-05.svg', 'LL-06.svg', 'LL-07.svg', 'LL-08.svg',
  'LL-09.svg', 'LL-10.svg', 'LL-11.svg', 'LL-12.svg', 'LL-13.svg', 'LL-14.svg', 'LL-15.svg', 'LL-16.svg',
  'LL-17.svg', 'LL-18.svg', 'LL-19.svg', 'LL-20.svg', 'LL-21.svg', 'LL-22.svg', 'LL-23.svg', 'LL-24.svg',
  'LL-25.svg', 'LL-26.svg', 'LL-27.svg', 'LL-28.svg', 'LL-29.svg', 'LL-30.svg', 'LL-31.svg', 'LL-32.svg',
  'LL-33.svg', 'LL-34.svg', 'LL-35.svg', 'LL-36.svg', 'LL-37.svg', 'LL-38.svg', 'LL-39.svg', 'LL-40.svg',
  'LL-41.svg', 'LL-42.svg', 'LL-43.svg', 'LL-44.svg', 'LL-45.svg', 'LL-46.svg', 'LL-47.svg', 'LL-48.svg',
  'LL-49.svg', 'LL-50.svg', 'LL-51.svg', 'LL-52.svg', 'LL-53.svg', 'LL-54.svg', 'LL-55.svg', 'LL-56.svg',
  'LL-57.svg', 'LL-58.svg', 'LL-59.svg', 'LL-60.svg', 'LL-61.svg', 'LL-62.svg', 'LL-63.svg', 'LL-64.svg',
  'LL-65.svg', 'LL-66.svg', 'LL-67.svg', 'LL-68.svg', 'LL-69.svg', 'LL-70.svg', 'LL-71.svg', 'LL-72.svg',
  'LL-73.svg', 'LL-74.svg', 'LL-75.svg', 'LL-76.svg', 'LL-77.svg', 'LL-78.svg', 'LL-79.svg', 'LL-80.svg',
  'LL-81.svg', 'LL-82.svg', 'LL-83.svg', 'LL-84.svg', 'LL-85.svg', 'LL-86.svg', 'LL-87.svg', 'LL-88.svg',
  'LL-89.svg', 'LL-90.svg', 'LL-91.svg', 'LL-92.svg', 'LL-93.svg', 'LL-94.svg', 'LL-95.svg', 'LL-96.svg',
  'LL-97.svg', 'LL-98.svg', 'LL-99.svg',
  'M&H-01.svg', 'M&H-02.svg', 'M&H-03.svg', 'M&H-04.svg', 'M&H-05.svg', 'M&H-06.svg', 'M&H-07.svg',
  'M&H-08.svg', 'M&H-09.svg', 'M&H-10.svg', 'M&H-11.svg', 'M&H-12.svg', 'M&H-13.svg', 'M&H-14.svg',
  'M&H-15.svg',
  'M&T-01.svg', 'M&T-02.svg', 'M&T-03.svg', 'M&T-04.svg', 'M&T-05.svg', 'M&T-06.svg', 'M&T-07.svg',
  'M&T-08.svg', 'M&T-09.svg', 'M&T-10.svg', 'M&T-11.svg', 'M&T-12.svg', 'M&T-13.svg', 'M&T-14.svg',
  'M&T-15.svg', 'M&T-16.svg', 'M&T-17.svg', 'M&T-18.svg', 'M&T-19.svg', 'M&T-20.svg', 'M&T-21.svg',
  'OB-01.svg', 'OB-02.svg', 'OB-03.svg', 'OB-04.svg', 'OB-05.svg', 'OB-06.svg', 'OB-07.svg', 'OB-08.svg',
  'OB-09.svg', 'OB-10.svg', 'OB-11.svg', 'OB-12.svg', 'OB-13.svg', 'OB-14.svg', 'OB-15.svg', 'OB-16.svg',
  'OB-17.svg', 'OB-18.svg', 'OB-19.svg', 'OB-20.svg', 'OB-21.svg',
  'S&G-01.svg', 'S&G-02.svg', 'S&G-03.svg', 'S&G-04.svg', 'S&G-05.svg', 'S&G-06.svg', 'S&G-07.svg',
  'S&G-08.svg',
  'SCS-008.svg', 'SCS-01.svg', 'SCS-02.svg', 'SCS-03.svg', 'SCS-04.svg', 'SCS-05.svg', 'SCS-06.svg',
  'SCS-07.svg', 'SCS-09.svg', 'SCS-10.svg', 'SCS-11.svg', 'SCS-12.svg', 'SCS-13.svg', 'SCS-14.svg',
  'SCS-15.svg', 'SCS-16.svg', 'SCS-17.svg', 'SCS-18.svg', 'SCS-19.svg', 'SCS-20.svg', 'SCS-21.svg',
  'SCS-22.svg', 'SCS-23.svg', 'SCS-24.svg',
  'thermostat.DI5g8u2h.svg'
];

export function useDragDrop() {
  const [gridType, setGridType] = useState('2x4');
  const [selectedButton, setSelectedButton] = useState(null);
  const [dropZones, setDropZones] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const [frameColor, setFrameColor] = useState(null);
  const [fullColor, setFullColor] = useState(null);
  const [showIconPopup, setShowIconPopup] = useState(false);
  const [currentIconPosition, setCurrentIconPosition] = useState(null);
  const [showButtonColorPopup, setShowButtonColorPopup] = useState(false);
  const [buttonColorTarget, setButtonColorTarget] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '', show: false });
  const [boardWidth, setBoardWidth] = useState(50); // Percentage of available width
  const [colorPaletteWidth, setColorPaletteWidth] = useState(25); // Percentage of available width
  const [wallColor, setWallColor] = useState('#e8e8e8'); // Default background color
  const [selectedButtonPart, setSelectedButtonPart] = useState(null); // For click-to-apply functionality

  const showFeedback = useCallback((message, type = 'info') => {
    setFeedback({ message, type, show: true });
    setTimeout(() => setFeedback({ message: '', type: '', show: false }), 3000);
  }, []);

  const getColorValue = useCallback((colorName) => COLORS[colorName] || '#ffffff', []);
  
  const getTextureImage = useCallback((colorName) => TEXTURE_IMAGES[colorName] || null, []);

  const getButtonDimensions = (buttonType) => {
    const dimensions = {
      1: { colSpan: 1, rowSpan: 1 },
      2: { colSpan: 2, rowSpan: 1 },
      3: { colSpan: 1, rowSpan: 2 },
      4: { colSpan: 2, rowSpan: 2 },
      5: { colSpan: 1, rowSpan: 2 },
      6: { colSpan: 2, rowSpan: 1 },
      7: { colSpan: 1, rowSpan: 1 },
      // PBlock buttons
      8: { colSpan: 1, rowSpan: 1 }, // PBlock Single Button
      9: { colSpan: 2, rowSpan: 1 }, // PBlock Wide Button
      10: { colSpan: 1, rowSpan: 2 }, // PBlock Tall Button
      11: { colSpan: 1, rowSpan: 1 } // PBlock Square Button (2 vertical dots)
    };
    return dimensions[buttonType] || { colSpan: 1, rowSpan: 1 };
  };

  const updateDropZone = useCallback((zoneId, data) => {
    setDropZones(prev => ({ ...prev, [zoneId]: data }));
  }, []);

  const clearDropZone = useCallback((zoneId) => {
    setDropZones(prev => {
      const newZones = { ...prev };
      delete newZones[zoneId];
      return newZones;
    });
  }, []);

  const loadDesign = useCallback((designData) => {
    setGridType(designData.gridType);
    setDropZones(designData.dropZones);
    if (designData.frameColor) setFrameColor(designData.frameColor);
    if (designData.fullColor) setFullColor(designData.fullColor);
    if (designData.wallColor) setWallColor(designData.wallColor);
    setSelectedButton(null);
    setSelectedButtonPart(null);
    setSelectedColor(null);
    setShowIconPopup(false);
    setCurrentIconPosition(null);
    setShowButtonColorPopup(false);
    setButtonColorTarget(null);
    showFeedback('Design loaded successfully', 'success');
  }, [showFeedback]);

  const resetSelections = useCallback(() => {
    setSelectedButton(null);
    setSelectedButtonPart(null);
    setSelectedColor(null);
    setShowIconPopup(false);
    setCurrentIconPosition(null);
    setShowButtonColorPopup(false);
    setButtonColorTarget(null);
  }, []);

  const resetDesign = useCallback(() => {
    setDropZones({});
    setFrameColor(null);
    setFullColor(null);
    resetSelections();
  }, [resetSelections]);

  const placeButtonInZones = useCallback((zones, buttonData) => {
    if (!zones || zones.length === 0) return;
    
    const primaryZone = zones[0];
    
    // Update primary zone with button data
    updateDropZone(primaryZone, {
      ...buttonData,
      isPrimary: true,
      primaryZone,
      // Initialize icon/text positions
      s0: null,
      s1: null,
      s2: null
    });

    // Mark other zones as merged
    zones.slice(1).forEach(zoneId => {
      updateDropZone(zoneId, {
        ...buttonData,
        isPrimary: false,
        isMerged: true,
        mergedInto: primaryZone
      });
    });
  }, [updateDropZone]);

  const applyFrameColor = useCallback((colorName) => {
    setFrameColor(colorName);
    showFeedback(`${colorName} applied to frame`, 'success');
  }, [showFeedback]);

  const applyFullColor = useCallback((colorName) => {
    setFullColor(colorName);
    
    // Update all existing buttons with the new color
    setDropZones(prevZones => {
      const updatedZones = { ...prevZones };
      Object.keys(updatedZones).forEach(zoneId => {
        if (updatedZones[zoneId] && updatedZones[zoneId].buttonType) {
          updatedZones[zoneId] = {
            ...updatedZones[zoneId],
            color: colorName
          };
        }
      });
      return updatedZones;
    });
    
    showFeedback(`${colorName} applied to all`, 'success');
  }, [showFeedback]);

  const applyIconToButton = useCallback((buttonId, position, iconPath) => {
    if (!buttonId) {
      showFeedback('Please select a button first', 'info');
      return;
    }
    const zone = dropZones[buttonId];
    if (!zone) {
      showFeedback('Button not found', 'error');
      return;
    }

    // Ensure iconPath is just the filename (not full path)
    const iconFileName = iconPath.includes('/') ? iconPath.split('/').pop() : iconPath;
    
    // Find the primary zone (the one that isPrimary or the buttonId itself)
    const primaryZoneId = zone.isPrimary ? buttonId : (zone.mergedInto || buttonId);
    const primaryZone = dropZones[primaryZoneId] || zone;
    
    // Create updated zone data - clear text if it exists, set icon
    const updatedZone = { ...primaryZone };
    updatedZone[position] = { type: 'icon', value: iconFileName };
    
    // Apply icon to primary zone only (icons are rendered only in primary zone)
    updateDropZone(primaryZoneId, updatedZone);

    showFeedback(`Icon applied to ${position}`, 'success');
  }, [dropZones, updateDropZone, showFeedback]);

  const applyTextToButton = useCallback((buttonId, position, text, color = '#ffffff') => {
    if (!buttonId) {
      showFeedback('Please select a button first', 'info');
      return;
    }
    const zone = dropZones[buttonId];
    if (!zone) {
      showFeedback('Button not found', 'error');
      return;
    }

    // Find the primary zone (the one that isPrimary or the buttonId itself)
    const primaryZoneId = zone.isPrimary ? buttonId : (zone.mergedInto || buttonId);
    const primaryZone = dropZones[primaryZoneId] || zone;
    
    // Create updated zone data - clear icon if it exists, set text with color
    const updatedZone = { ...primaryZone };
    if (text) {
      updatedZone[position] = { type: 'text', value: text, color: color };
    } else {
      // Clear the position if text is empty
      delete updatedZone[position];
    }
    
    updateDropZone(primaryZoneId, updatedZone);
    showFeedback('Text applied', 'success');
  }, [dropZones, updateDropZone, showFeedback]);

  const applyButtonColor = useCallback((buttonId, colorName) => {
    const zone = dropZones[buttonId];
    if (!zone) {
      showFeedback('Button not found', 'error');
      return;
    }

    // If this is a merged button, apply color to all merged zones
    if (zone.zones && zone.zones.length > 0) {
      zone.zones.forEach(zId => {
        const z = dropZones[zId];
        if (z) {
          updateDropZone(zId, {
            ...z,
            color: colorName
          });
        }
      });
    } else {
      // Single zone button
      updateDropZone(buttonId, {
        ...zone,
        color: colorName
      });
    }

    showFeedback('Color applied to button', 'success');
  }, [dropZones, updateDropZone, showFeedback]);

  const applyWallColor = useCallback((color) => {
    setWallColor(color);
    
    // Create wall texture pattern using CSS
    // Extract RGB values from color string
    let r = 128, g = 128, b = 128;
    if (color.startsWith('rgba') || color.startsWith('rgb')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
      }
    } else if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    }
    
    // Create very subtle darker flecks for organic texture (like the image)
    // Very low contrast, tiny random-looking imperfections - fine-grained texture
    // Note: Fleck color variables are calculated inline in generateFleckLayer function
    
    // Create organic, fine-grained texture using a noise-like pattern
    // Multiple layers of tiny radial gradients at various positions create organic flecks
    // This simulates the fine-grained, randomly distributed texture from the image
    
    // Generate many small fleck positions (distributed across the surface)
    const generateFleckLayer = (count, opacity, size, baseOffset) => {
      const flecks = [];
      for (let i = 0; i < count; i++) {
        // Pseudo-random but deterministic distribution
        const x = ((i * 37 + baseOffset) % 97) + ((i * 13) % 3);
        const y = ((i * 23 + baseOffset * 2) % 98) + ((i * 7) % 2);
        const pos = `${x}% ${y}%`;
        
        // Vary fleck darkness slightly for organic look (deterministic)
        const darkOffset = (i % 4);
        const fleckColor = `rgba(${Math.max(0, r - 3 - darkOffset)}, ${Math.max(0, g - 3 - darkOffset)}, ${Math.max(0, b - 3 - darkOffset)}, ${opacity})`;
        
        flecks.push(`radial-gradient(circle at ${pos}, ${fleckColor} 0%, ${fleckColor} ${size}, transparent ${parseFloat(size) * 2.5}%)`);
      }
      return flecks;
    };
    
    // Create multiple layers of flecks for depth
    const layer1 = generateFleckLayer(40, 0.05, '0.35%', 0); // Medium flecks
    const layer2 = generateFleckLayer(30, 0.04, '0.25%', 17); // Smaller flecks
    const layer3 = generateFleckLayer(25, 0.03, '0.2%', 31);  // Tiny flecks
    
    // Combine all layers
    const allFlecks = [...layer1, ...layer2, ...layer3];
    
    // Wall texture pattern - organic, fine-grained texture
    const wallTexture = allFlecks.join(',\n      ') + ',\n      ' + color;
    
    // Apply to document body background
    document.body.style.backgroundColor = color;
    document.body.style.backgroundImage = wallTexture;
    
    // Background properties for all layers
    const totalLayers = allFlecks.length;
    const bgSize = Array(totalLayers).fill('200% 200%').join(', ') + ', cover'; // Large size to spread flecks
    const bgPos = Array(totalLayers).fill('0 0').join(', ') + ', center';
    const bgBlend = Array(totalLayers).fill('normal').join(', ') + ', normal';
    const bgRepeat = Array(totalLayers).fill('no-repeat').join(', ') + ', no-repeat';
    
    document.body.style.backgroundSize = bgSize;
    document.body.style.backgroundPosition = bgPos;
    document.body.style.backgroundBlendMode = bgBlend;
    document.body.style.backgroundRepeat = bgRepeat;
    
    // Also apply to wrapper if it exists
    const wrapper = document.querySelector('.wrapper');
    if (wrapper) {
      wrapper.style.backgroundColor = color;
      wrapper.style.backgroundImage = wallTexture;
      wrapper.style.backgroundSize = bgSize;
      wrapper.style.backgroundPosition = bgPos;
      wrapper.style.backgroundBlendMode = bgBlend;
      wrapper.style.backgroundRepeat = bgRepeat;
    }
    showFeedback('Wall color applied', 'success');
  }, [showFeedback]);

  return {
    gridType,
    setGridType,
    selectedButton,
    setSelectedButton,
    dropZones,
    updateDropZone,
    clearDropZone,
    loadDesign,
    resetDesign,
    selectedColor,
    setSelectedColor,
    frameColor,
    fullColor,
    icons: ICON_FILES,
    showIconPopup,
    setShowIconPopup,
    currentIconPosition,
    setCurrentIconPosition,
    showButtonColorPopup,
    setShowButtonColorPopup,
    buttonColorTarget,
    setButtonColorTarget,
    feedback,
    showFeedback,
    applyFrameColor,
    applyFullColor,
    applyIconToButton,
    applyTextToButton,
    applyButtonColor,
    getButtonDimensions,
    placeButtonInZones,
    getColorValue,
    getTextureImage,
    boardWidth,
    setBoardWidth,
    colorPaletteWidth,
    setColorPaletteWidth,
    wallColor,
    applyWallColor,
    selectedButtonPart,
    setSelectedButtonPart
  };
}

