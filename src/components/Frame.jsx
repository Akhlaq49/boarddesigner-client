import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';

// Product categories with proper configurations
const GRID_CONFIGS = {
  // 2-4 Buttons Switch
  'dora-2x2': { columns: 2, rows: 2, visibleZones: 4, label: 'Dora 2×2', category: '2-4 Buttons Switch', hasDisplay: false },
  'dora-2x4': { columns: 2, rows: 4, visibleZones: 8, label: 'Dora Keypad 2×4', category: '2-4 Buttons Switch', hasDisplay: false },
  
  // 3-12 Button Switch
  'dora-1x3': { columns: 1, rows: 3, visibleZones: 3, label: 'Dora 1×3', category: '3-12 Button Switch', hasDisplay: false },
  'pblock-2x6': { columns: 2, rows: 6, visibleZones: 12, label: 'Pblock 2×6', category: '3-12 Button Switch', hasDisplay: false },
  
  // 2-8 Room Controller
  'dora-2x6': { columns: 2, rows: 6, visibleZones: 12, label: 'Dora 2×6', category: '2-8 Room Controller', hasDisplay: false },
  'dora-2x8': { columns: 2, rows: 8, visibleZones: 16, label: 'Dora XLarge 2×8', category: '2-8 Room Controller', hasDisplay: false },
  
  // Design Your Self
  'dora-thermostat': { columns: 2, rows: 4, visibleZones: 8, label: 'Dora Thermostat 4+4', category: 'Design Your Self', hasDisplay: true },
  'pblock-2x4': { columns: 2, rows: 4, visibleZones: 8, label: 'Pblock 2×4', category: 'Design Your Self', hasDisplay: false },
  
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
          : `button${(row - 1) * 2 + col}`;
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
    const maxRows = Math.max(8, config.rows); // Support up to 8 rows
    const maxCols = Math.max(2, config.columns); // Support 1 or 2 columns
    
    for (let row = 1; row <= maxRows; row++) {
      for (let col = 1; col <= maxCols; col++) {
        // For single column layouts (1x3, focus-mode), use simpler ID
        const zoneId = config.columns === 1 
          ? `button${row}`
          : `button${(row - 1) * 2 + col}`;
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
      zones: zonesToMerge,
      color: buttonData.color || null // Include color from drag data
    };

    placeButtonInZones(zonesToMerge, buttonDataWithMerge);
    setSelectedButton(zoneId);
    showFeedback('Button placed successfully!', 'success');
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
        dimensions,
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

      showFeedback('Generating PDF...', 'info');

      // Dynamically import html2canvas and jsPDF
      const html2canvas = (await import('html2canvas')).default;
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

      try {
        // Hide action buttons before capture
        const removeButtons = frameElement.querySelectorAll('.remove-button');
        const colorButtons = frameElement.querySelectorAll('.button-color-btn');
        removeButtons.forEach(btn => btn.style.display = 'none');
        colorButtons.forEach(btn => btn.style.display = 'none');

        // Temporarily adjust layout for cleaner PDF
        const layout = frameElement.querySelector('.layout');
        const originalGap = layout?.style.gap || '';
        const originalBorderColor = layout?.style.borderColor || '';
        if (layout) {
          layout.style.gap = '1px';
          layout.style.borderColor = 'transparent';
        }

        // Hide borders on drop zones and buttons
        const dropZones = frameElement.querySelectorAll('.drop-zone');
        const originalBorders = new Map();
        dropZones.forEach(zone => {
          originalBorders.set(zone, {
            border: zone.style.border,
            borderWidth: zone.style.borderWidth,
            boxShadow: zone.style.boxShadow,
            padding: zone.style.padding
          });
          zone.style.border = 'none';
          zone.style.boxShadow = 'none';
          zone.style.padding = '0';
        });

        const droppedButtons = frameElement.querySelectorAll('.dropped-button');
        const originalButtonBorders = new Map();
        droppedButtons.forEach(btn => {
          originalButtonBorders.set(btn, {
            border: btn.style.border,
            boxShadow: btn.style.boxShadow
          });
          btn.style.border = 'none';
          btn.style.boxShadow = 'none';
        });

        // Remove button-content styling
        const buttonContents = frameElement.querySelectorAll('.button-content');
        const originalButtonContents = new Map();
        buttonContents.forEach(content => {
          originalButtonContents.set(content, {
            padding: content.style.padding,
            border: content.style.border,
            boxShadow: content.style.boxShadow
          });
          content.style.padding = '0';
          content.style.border = 'none';
          content.style.boxShadow = 'none';
        });

        // Wait for layout changes to apply
        await new Promise(resolve => setTimeout(resolve, 200));

        // Convert SVG icons to high-quality canvas elements for PDF rendering
        const images = frameElement.querySelectorAll('img.button-icon');
        const originalElements = new Map();

        for (const img of images) {
          try {
            const src = img.src;
            if (src && (src.includes('.svg') || src.includes('/ican/'))) {
              // Get computed dimensions
              const rect = img.getBoundingClientRect();
              
              // Create a high-resolution canvas to render the SVG
              const scale = 4; // 4x for crisp quality
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = rect.width * scale;
              tempCanvas.height = rect.height * scale;
              const ctx = tempCanvas.getContext('2d');
              
              // Keep transparent background
              ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
              
              // Create an image from the SVG
              const svgImg = new Image();
              svgImg.crossOrigin = 'anonymous';
              
              await new Promise((resolve, reject) => {
                svgImg.onload = () => {
                  // Draw the SVG image with high quality
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = 'high';
                  ctx.drawImage(svgImg, 0, 0, tempCanvas.width, tempCanvas.height);
                  
                  // Replace img with high-quality PNG data URL (with transparency)
                  const dataUrl = tempCanvas.toDataURL('image/png');
                  originalElements.set(img, { src: img.src });
                  img.src = dataUrl;
                  resolve();
                };
                svgImg.onerror = () => resolve(); // Continue even if one fails
                svgImg.src = src;
              });
            }
          } catch (err) {
            console.warn('Failed to convert icon:', err);
          }
        }

        // Wait for all conversions to complete
        await new Promise(resolve => setTimeout(resolve, 300));

        // Capture the frame with high quality
        const canvas = await html2canvas(frameElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
          foreignObjectRendering: false,
          removeContainer: false,
          imageTimeout: 0
        });

        console.log('Canvas captured:', canvas.width, 'x', canvas.height);

        // Restore original images
        originalElements.forEach((data, img) => {
          img.src = data.src;
        });

        // Restore gap
        if (layout) {
          layout.style.gap = originalGap;
          layout.style.borderColor = originalBorderColor;
        }

        // Restore borders
        dropZones.forEach(zone => {
          const original = originalBorders.get(zone);
          zone.style.border = original?.border || '';
          zone.style.borderWidth = original?.borderWidth || '';
          zone.style.boxShadow = original?.boxShadow || '';
          zone.style.padding = original?.padding || '';
        });

        droppedButtons.forEach(btn => {
          const original = originalButtonBorders.get(btn);
          btn.style.border = original?.border || '';
          btn.style.boxShadow = original?.boxShadow || '';
        });

        // Restore button-content styling
        buttonContents.forEach(content => {
          const original = originalButtonContents.get(content);
          content.style.padding = original?.padding || '';
          content.style.border = original?.border || '';
          content.style.boxShadow = original?.boxShadow || '';
        });

        // Restore buttons after capture
        removeButtons.forEach(btn => btn.style.display = '');
        colorButtons.forEach(btn => btn.style.display = '');

        // Check if canvas has content
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          throw new Error('Failed to capture frame - canvas is empty');
        }

        // Calculate PDF dimensions from canvas
        // Canvas is at 2x scale, so divide by 2 to get screen size
        const screenWidth = canvas.width / 2;
        const screenHeight = canvas.height / 2;
        
        // Convert pixels to mm (96 DPI = 25.4 mm/inch)
        const pxToMM = 25.4 / 96;
        let widthMM = screenWidth * pxToMM;
        let heightMM = screenHeight * pxToMM;
        
        // Scale to fit nicely on PDF
        const scale = 0.9; // 90% of original size for good proportion
        widthMM = widthMM * scale;
        heightMM = heightMM * scale;

        // Calculate PDF page size with proper margins
        const pageMarginMM = 15;
        const infoHeightMM = 50; // Space for information section
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

        // Add design screenshot
        const imgData = canvas.toDataURL('image/png');
        const topMargin = pageMarginMM;
        const leftMargin = (pageWidthMM - widthMM) / 2;
        
        pdf.addImage(imgData, 'PNG', leftMargin, topMargin + 15, widthMM, heightMM);

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

        // Collect button details for display
        const buttonDetails = [];
        Object.keys(dropZones).forEach((zoneId, index) => {
          const zone = dropZones[zoneId];
          if (zone && zone.isPrimary) {
            const s1Center = zone.s1?.type === 'icon' ? zone.s1.value : (zone.s1?.type === 'text' ? zone.s1.value : '');
            const buttonColor = zone.color || fullColor || 'Default';
            buttonDetails.push({
              number: index + 1,
              color: buttonColor,
              center: s1Center
            });
          }
        });

        // Display buttons
        buttonDetails.forEach((btn) => {
          if (currentY > pageHeightMM - pageMarginMM - 5) {
            pdf.addPage();
            currentY = pageMarginMM;
          }
          
          // Button number and color with color code
          pdf.setFont(undefined, 'bold');
          pdf.text(`Button ${btn.number}`, pageMarginMM + 3, currentY);
          
          pdf.setFont(undefined, 'normal');
          const colorCode = btn.color !== 'Default' ? `${btn.color} (${getColorValue(btn.color)})` : btn.color;
          pdf.text(`: ${colorCode}`, pageMarginMM + 24, currentY);
          currentY += 4;

          // Center content
          if (btn.center) {
            pdf.setFontSize(8);
            pdf.text(`— Center`, pageMarginMM + 5, currentY);
            pdf.text(`: ${btn.center}`, pageMarginMM + 24, currentY);
            currentY += 4;
          }
          
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
        // Restore gap on error
        const layout = frameElement?.querySelector('.layout');
        if (layout) {
          layout.style.gap = '';
        }

        // Restore borders on error
        const dropZonesError = frameElement?.querySelectorAll('.drop-zone');
        dropZonesError?.forEach(zone => {
          zone.style.border = '';
          zone.style.boxShadow = '';
          zone.style.padding = '';
        });

        const droppedButtonsError = frameElement?.querySelectorAll('.dropped-button');
        droppedButtonsError?.forEach(btn => {
          btn.style.border = '';
          btn.style.boxShadow = '';
        });

        const buttonContentsError = frameElement?.querySelectorAll('.button-content');
        buttonContentsError?.forEach(content => {
          content.style.padding = '';
          content.style.border = '';
          content.style.boxShadow = '';
        });
        
        // Restore buttons on error
        const removeButtons = frameElement?.querySelectorAll('.remove-button');
        const colorButtons = frameElement?.querySelectorAll('.button-color-btn');
        removeButtons?.forEach(btn => btn.style.display = '');
        colorButtons?.forEach(btn => btn.style.display = '');
        console.error('Error generating PDF:', error);
        showFeedback(`Failed to generate PDF: ${error.message}`, 'error');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      showFeedback(`Failed to generate PDF: ${error.message}`, 'error');
    }
  }, [config, dropZones, frameColor, fullColor, getColorValue, getTextureImage, gridType, showFeedback, generateProductCode]);

  // Register PDF download handler with parent
  useEffect(() => {
    if (setDownloadPDFHandler) {
      setDownloadPDFHandler(() => handleDownloadPDF);
    }
  }, [setDownloadPDFHandler, handleDownloadPDF]);

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
                className="button-icon"
                style={{ objectFit: 'contain' }}
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
                style={{ objectFit: 'contain' }}
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
                style={{ objectFit: 'contain' }}
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

