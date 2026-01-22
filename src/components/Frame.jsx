import React, { useMemo, useState, useCallback, useRef } from 'react';

const GRID_CONFIGS = {
  '2x4': { columns: 2, rows: 4, visibleZones: 8 },
  '2x8': { columns: 2, rows: 8, visibleZones: 16 },
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
      zones: zonesToMerge,
      color: buttonData.color || null // Include color from drag data
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

      // Dynamically import html2canvas and jsPDF
      const html2canvas = (await import('html2canvas')).default;
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

      // Scroll frame into view and wait for rendering
      frameElement.scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise(resolve => setTimeout(resolve, 300));

      // Hide action buttons before capture
      const removeButtons = frameElement.querySelectorAll('.remove-button');
      const colorButtons = frameElement.querySelectorAll('.button-color-btn');
      const originalDisplay = new Map();
      removeButtons.forEach(btn => {
        originalDisplay.set(btn, btn.style.display);
        btn.style.display = 'none';
      });
      colorButtons.forEach(btn => {
        originalDisplay.set(btn, btn.style.display);
        btn.style.display = 'none';
      });

      try {
        // Wait a bit more for any animations/transitions to complete
        await new Promise(resolve => setTimeout(resolve, 200));

        // Helper function to convert SVG icon to PNG canvas element (most reliable for Chrome)
        const convertSvgIconToCanvas = async (imgElement) => {
          try {
            const svgUrl = imgElement.src;
            if (!svgUrl || svgUrl.startsWith('data:image/png')) return null; // Already converted
            
            const response = await fetch(svgUrl, { 
              mode: 'cors',
              cache: 'no-cache'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const svgText = await response.text();
            
            // Clean SVG
            let cleanedSvg = svgText.trim();
            if (!cleanedSvg.includes('xmlns=')) {
              cleanedSvg = cleanedSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            cleanedSvg = cleanedSvg.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            
            // Create SVG data URL
            const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanedSvg)}`;
            
            // Convert to canvas/PNG
            return new Promise((resolve) => {
              const svgImg = new Image();
              svgImg.crossOrigin = 'anonymous';
              svgImg.onload = () => {
                try {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d', { alpha: true });
                  
                  // Enable high-quality rendering
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = 'high';
                  
                  // Get exact displayed size from computed styles
                  const computedStyle = window.getComputedStyle(imgElement);
                  const displayWidth = parseFloat(computedStyle.width) || imgElement.offsetWidth || imgElement.naturalWidth || 100;
                  const displayHeight = parseFloat(computedStyle.height) || imgElement.offsetHeight || imgElement.naturalHeight || 100;
                  
                  // Use 3x resolution for better quality
                  const scale = 3;
                  canvas.width = displayWidth * scale;
                  canvas.height = displayHeight * scale;
                  
                  // Scale context for high DPI
                  ctx.scale(scale, scale);
                  
                  // Don't draw white background - keep transparent or use filter for white icons
                  // Apply white filter to SVG (icons should be white)
                  ctx.filter = 'brightness(0) invert(1)';
                  
                  // Draw SVG at original size (context is already scaled)
                  ctx.drawImage(svgImg, 0, 0, displayWidth, displayHeight);
                  
                  // Reset filter
                  ctx.filter = 'none';
                  
                  // Replace img element with canvas - maintain exact position and alignment
                  const parent = imgElement.parentElement;
                  
                  // Copy all attributes from original image
                  Array.from(imgElement.attributes).forEach(attr => {
                    if (attr.name !== 'src') {
                      canvas.setAttribute(attr.name, attr.value);
                    }
                  });
                  
                  // Match ALL computed styling from original image exactly
                  canvas.style.width = computedStyle.width || `${displayWidth}px`;
                  canvas.style.height = computedStyle.height || `${displayHeight}px`;
                  canvas.style.minWidth = computedStyle.minWidth || '';
                  canvas.style.minHeight = computedStyle.minHeight || '';
                  canvas.style.maxWidth = computedStyle.maxWidth || '';
                  canvas.style.maxHeight = computedStyle.maxHeight || '';
                  canvas.style.display = computedStyle.display || '';
                  canvas.style.visibility = computedStyle.visibility || 'visible';
                  canvas.style.opacity = computedStyle.opacity || '1';
                  canvas.style.objectFit = computedStyle.objectFit || 'contain';
                  canvas.style.objectPosition = computedStyle.objectPosition || 'center';
                  canvas.style.margin = computedStyle.margin || '0';
                  canvas.style.padding = computedStyle.padding || '0';
                  canvas.style.verticalAlign = computedStyle.verticalAlign || 'middle';
                  canvas.style.textAlign = computedStyle.textAlign || '';
                  canvas.style.position = computedStyle.position || 'static';
                  canvas.style.left = computedStyle.left || '';
                  canvas.style.top = computedStyle.top || '';
                  canvas.style.right = computedStyle.right || '';
                  canvas.style.bottom = computedStyle.bottom || '';
                  canvas.style.float = computedStyle.float || '';
                  canvas.style.clear = computedStyle.clear || '';
                  canvas.style.marginTop = computedStyle.marginTop || '';
                  canvas.style.marginRight = computedStyle.marginRight || '';
                  canvas.style.marginBottom = computedStyle.marginBottom || '';
                  canvas.style.marginLeft = computedStyle.marginLeft || '';
                  canvas.style.paddingTop = computedStyle.paddingTop || '';
                  canvas.style.paddingRight = computedStyle.paddingRight || '';
                  canvas.style.paddingBottom = computedStyle.paddingBottom || '';
                  canvas.style.paddingLeft = computedStyle.paddingLeft || '';
                  canvas.style.transform = computedStyle.transform || '';
                  canvas.style.transformOrigin = computedStyle.transformOrigin || '';
                  canvas.style.boxSizing = computedStyle.boxSizing || 'content-box';
                  
                  // Copy inline styles from original
                  if (imgElement.style.cssText) {
                    const inlineStyles = imgElement.style.cssText.split(';').filter(s => s.trim() && !s.includes('width') && !s.includes('height'));
                    inlineStyles.forEach(style => {
                      if (style.trim()) {
                        const [prop, value] = style.split(':').map(s => s.trim());
                        if (prop && value) {
                          canvas.style.setProperty(prop, value);
                        }
                      }
                    });
                  }
                  
                  canvas.className = imgElement.className;
                  canvas.setAttribute('data-original-src', svgUrl);
                  canvas.setAttribute('alt', imgElement.alt || 'icon');
                  
                  // Replace image with canvas at exact same position using replaceChild
                  // This maintains exact DOM position and alignment
                  parent.replaceChild(canvas, imgElement);
                  
                  resolve(canvas);
                } catch (error) {
                  console.warn('Failed to convert SVG to canvas:', error);
                  resolve(null);
                }
              };
              svgImg.onerror = () => {
                console.warn('Failed to load SVG for canvas conversion');
                resolve(null);
              };
              svgImg.src = svgDataUrl;
              setTimeout(() => resolve(null), 3000); // Timeout
            });
          } catch (error) {
            console.warn('Failed to convert SVG icon:', error);
            return null;
          }
        };

        // Helper function to convert image URL to data URL (for non-SVG images)
        // SVG icons are handled separately via canvas conversion
        const imageUrlToDataUrl = async (url) => {
          try {
            // Handle relative URLs
            let absoluteUrl = url;
            if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('blob:')) {
              absoluteUrl = url.startsWith('/') 
                ? `${window.location.origin}${url}`
                : `${window.location.origin}/${url}`;
            }
            
            // Skip SVG files - they're handled via canvas conversion
            if (absoluteUrl.toLowerCase().endsWith('.svg') || absoluteUrl.includes('/ican/images/')) {
              // For SVG, return as SVG data URL (fallback for background images)
              try {
                const response = await fetch(absoluteUrl, { 
                  mode: 'cors',
                  cache: 'no-cache'
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const svgText = await response.text();
                let cleanedSvg = svgText.trim();
                if (!cleanedSvg.includes('xmlns=')) {
                  cleanedSvg = cleanedSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                }
                return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanedSvg)}`;
              } catch (error) {
                console.warn('Failed to convert SVG to data URL:', error);
                return null;
              }
            }
            
            // For other image types, fetch as blob
            const response = await fetch(absoluteUrl, { 
              mode: 'cors',
              cache: 'no-cache',
              credentials: 'same-origin'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (error) {
            console.warn('Failed to convert image to data URL:', url, error);
            return null;
          }
        };

        // Store original src/backgroundImage values to restore later
        const originalValues = new Map();
        
        // Process icon images - convert to data URLs directly on elements
        // First, find all images including those in button content areas
        const images = frameElement.querySelectorAll('img');
        const imagePromises = [];
        
        for (const img of images) {
          // Ensure image is visible
          img.style.display = '';
          img.style.visibility = 'visible';
          img.style.opacity = '1';
          
          // Wait for image to load
          const loadPromise = new Promise(async (resolve) => {
            if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
              resolve();
              return;
            }
            
            // Set up load handlers
            const onLoad = () => {
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
              resolve();
            };
            const onError = () => {
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
              console.warn('Image failed to load:', img.src);
              resolve(); // Continue even if fails
            };
            
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
            
            // Timeout after 8 seconds
            setTimeout(() => {
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
              resolve();
            }, 8000);
            
            // If image already has src, trigger load check
            if (img.src) {
              // Force reload check
              const currentSrc = img.src;
              if (!currentSrc.startsWith('data:')) {
                img.src = '';
                setTimeout(() => {
                  img.src = currentSrc;
                }, 100);
              }
            }
          });
          
          imagePromises.push(loadPromise.then(async () => {
            // Wait a bit more for rendering, especially for SVG
            await new Promise(resolve => setTimeout(resolve, 300));
            
            if (img.src && !img.src.startsWith('data:') && !img.src.startsWith('blob:')) {
              // Check if it's an SVG icon
              const isSvg = img.src.toLowerCase().includes('.svg') || img.src.includes('/ican/images/');
              
              if (isSvg) {
                // For SVG icons, convert directly to canvas element (most reliable for Chrome)
                const canvas = await convertSvgIconToCanvas(img);
                if (canvas) {
                  // Store canvas for restoration
                  originalValues.set(canvas, { type: 'canvas', originalImg: img });
                  // Wait a bit for canvas to render
                  await new Promise(resolve => setTimeout(resolve, 200));
                } else {
                  // Fallback: try data URL conversion
                  originalValues.set(img, { type: 'src', value: img.src });
                  const dataUrl = await imageUrlToDataUrl(img.src);
                  if (dataUrl) {
                    img.src = dataUrl;
                    await new Promise(resolve => setTimeout(resolve, 200));
                  }
                }
              } else {
                // For non-SVG images, convert to data URL
                originalValues.set(img, { type: 'src', value: img.src });
                const dataUrl = await imageUrlToDataUrl(img.src);
                if (dataUrl) {
                  img.src = dataUrl;
                  // Force reflow
                  img.style.display = 'none';
                  await new Promise(resolve => setTimeout(resolve, 50));
                  img.style.display = '';
                }
              }
            }
          }));
        }
        
        // Wait for all images to be processed
        await Promise.all(imagePromises);

        // Process background images (textures) - convert to data URLs directly
        const allElements = frameElement.querySelectorAll('*');
        for (const el of allElements) {
          const style = window.getComputedStyle(el);
          if (style.backgroundImage && style.backgroundImage !== 'none') {
            const urlMatch = style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
              const bgUrl = urlMatch[1];
              if (!bgUrl.startsWith('data:') && !bgUrl.startsWith('blob:')) {
                // Store original
                originalValues.set(el, { 
                  type: 'backgroundImage', 
                  value: style.backgroundImage,
                  backgroundSize: style.backgroundSize,
                  backgroundPosition: style.backgroundPosition,
                  backgroundRepeat: style.backgroundRepeat
                });
                
                // Convert to data URL and apply directly
                const dataUrl = await imageUrlToDataUrl(bgUrl);
                if (dataUrl) {
                  el.style.backgroundImage = `url(${dataUrl})`;
                  el.style.backgroundSize = style.backgroundSize || 'cover';
                  el.style.backgroundPosition = style.backgroundPosition || 'center';
                  el.style.backgroundRepeat = style.backgroundRepeat || 'no-repeat';
                }
              }
            }
          }
        }

        // Wait for all images to be fully loaded and rendered
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Final verification - ensure all images are loaded and visible
        const allImages = frameElement.querySelectorAll('img');
        for (const img of allImages) {
          // Ensure visibility
          img.style.display = '';
          img.style.visibility = 'visible';
          img.style.opacity = '1';
          
          // Check parent visibility
          let parent = img.parentElement;
          while (parent && parent !== frameElement) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
              parent.style.display = '';
              parent.style.visibility = 'visible';
            }
            parent = parent.parentElement;
          }
          
          // Verify image is loaded
          if (!img.complete || img.naturalWidth === 0) {
            await new Promise((resolve) => {
              const checkComplete = () => {
                if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                  resolve();
                } else {
                  setTimeout(checkComplete, 200);
                }
              };
              img.onload = () => resolve();
              img.onerror = () => resolve();
              setTimeout(() => resolve(), 5000);
              checkComplete();
            });
          }
        }
        
        // Additional wait for all rendering to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Final wait to ensure all SVG icons are rendered in Chrome
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Capture the frame as canvas with high quality settings
        const canvas = await html2canvas(frameElement, {
          scale: 3, // Higher scale for better quality
          useCORS: true,
          allowTaint: true, // Allow tainted canvas for better image rendering
          backgroundColor: '#ffffff',
          logging: false,
          removeContainer: false,
          imageTimeout: 30000, // Increased timeout
          foreignObjectRendering: false, // Better compatibility
          ignoreElements: (element) => {
            // Don't ignore images, but ensure they're visible
            return false;
          },
          onclone: (clonedDoc, element) => {
            // Ensure all images and styles are properly captured
            const clonedFrame = clonedDoc.querySelector(`#${frameElement.id || 'key'}`) || 
                               clonedDoc.querySelector('.frame-container-2x4, .frame-container-2x8, .frame-container-2x6') ||
                               element;
            
            if (clonedFrame) {
              // Hide action buttons in cloned document
              const clonedRemoveButtons = clonedFrame.querySelectorAll('.remove-button');
              const clonedColorButtons = clonedFrame.querySelectorAll('.button-color-btn');
              clonedRemoveButtons.forEach(btn => {
                btn.style.display = 'none';
                btn.style.visibility = 'hidden';
                btn.style.opacity = '0';
                btn.style.width = '0';
                btn.style.height = '0';
                btn.style.padding = '0';
                btn.style.margin = '0';
              });
              clonedColorButtons.forEach(btn => {
                btn.style.display = 'none';
                btn.style.visibility = 'hidden';
                btn.style.opacity = '0';
                btn.style.width = '0';
                btn.style.height = '0';
                btn.style.padding = '0';
                btn.style.margin = '0';
              });
              
              // Process all images in the cloned document
              const clonedImages = clonedFrame.querySelectorAll('img');
              clonedImages.forEach(img => {
                // Ensure image is visible and properly styled
                img.style.display = '';
                img.style.visibility = 'visible';
                img.style.opacity = '1';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                
                // Special handling for SVG icons
                const isSvgIcon = img.src && (img.src.includes('.svg') || img.src.includes('/ican/images/') || img.src.includes('svg+xml'));
                
                // If it's a data URL, ensure it's loaded
                if (img.src && img.src.startsWith('data:')) {
                  // For SVG data URLs in Chrome, force reload by cloning
                  if (isSvgIcon) {
                    const currentSrc = img.src;
                    const parent = img.parentElement;
                    const nextSibling = img.nextSibling;
                    
                    // Create new image element with data URL
                    const newImg = document.createElement('img');
                    newImg.src = currentSrc;
                    newImg.alt = img.alt || 'icon';
                    newImg.className = img.className;
                    newImg.style.cssText = img.style.cssText;
                    newImg.style.display = '';
                    newImg.style.visibility = 'visible';
                    newImg.style.opacity = '1';
                    
                    // Replace old image
                    if (nextSibling) {
                      parent.insertBefore(newImg, nextSibling);
                    } else {
                      parent.appendChild(newImg);
                    }
                    img.remove();
                  } else {
                    // Force browser to recognize the data URL
                    const currentSrc = img.src;
                    img.removeAttribute('src');
                    img.setAttribute('src', currentSrc);
                  }
                } else if (isSvgIcon && img.src) {
                  // If SVG icon doesn't have data URL yet, try to get it from original
                  // This shouldn't happen if conversion worked, but as fallback
                  console.warn('SVG icon without data URL in clone:', img.src);
                }
                
                // Ensure parent containers are visible
                const targetImg = isSvgIcon && img.parentElement ? img.parentElement.querySelector('img') : img;
                let parent = targetImg ? targetImg.parentElement : img.parentElement;
                while (parent && parent !== clonedFrame) {
                  const parentStyle = window.getComputedStyle(parent);
                  if (parentStyle.display === 'none') {
                    parent.style.display = '';
                  }
                  if (parentStyle.visibility === 'hidden') {
                    parent.style.visibility = 'visible';
                  }
                  if (parentStyle.opacity === '0') {
                    parent.style.opacity = '1';
                  }
                  parent = parent.parentElement;
                }
              });

              // Ensure all background images are preserved
              const allElements = clonedFrame.querySelectorAll('*');
              allElements.forEach(el => {
                // Skip action buttons
                if (el.classList.contains('remove-button') || el.classList.contains('button-color-btn')) {
                  return;
                }
                
                const style = window.getComputedStyle(el);
                
                // Preserve background images
                if (style.backgroundImage && style.backgroundImage !== 'none') {
                  el.style.backgroundImage = style.backgroundImage;
                  el.style.backgroundSize = style.backgroundSize || 'cover';
                  el.style.backgroundPosition = style.backgroundPosition || 'center';
                  el.style.backgroundRepeat = style.backgroundRepeat || 'no-repeat';
                }
                
                // Ensure visibility - especially for button content areas (s0, s1, s2)
                if (el.classList.contains('s0') || el.classList.contains('s1') || el.classList.contains('s2') || 
                    el.classList.contains('button-content') || el.classList.contains('dropped-button')) {
                  el.style.display = '';
                  el.style.visibility = 'visible';
                  el.style.opacity = '1';
                }
                
                if (style.display === 'none' && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
                  el.style.display = '';
                }
                
                if (style.visibility === 'hidden') {
                  el.style.visibility = 'visible';
                }
                
                if (style.opacity === '0') {
                  el.style.opacity = '1';
                }
              });
            }
          }
        });

        // Restore original image sources and background images
        originalValues.forEach((original, element) => {
          if (original.type === 'canvas' && original.originalImg) {
            // Restore canvas back to image
            const canvas = element;
            const img = original.originalImg;
            const parent = canvas.parentElement;
            const nextSibling = canvas.nextSibling;
            canvas.remove();
            img.style.display = '';
            if (nextSibling) {
              parent.insertBefore(img, nextSibling);
            } else {
              parent.appendChild(img);
            }
          } else if (original.type === 'src' && element.tagName === 'IMG') {
            element.src = original.value;
          } else if (original.type === 'backgroundImage') {
            element.style.backgroundImage = original.value;
            if (original.backgroundSize) element.style.backgroundSize = original.backgroundSize;
            if (original.backgroundPosition) element.style.backgroundPosition = original.backgroundPosition;
            if (original.backgroundRepeat) element.style.backgroundRepeat = original.backgroundRepeat;
          }
        });

        // Restore buttons
        removeButtons.forEach(btn => {
          const original = originalDisplay.get(btn);
          btn.style.display = original !== undefined ? original : '';
        });
        colorButtons.forEach(btn => {
          const original = originalDisplay.get(btn);
          btn.style.display = original !== undefined ? original : '';
        });

        // Calculate dimensions - canvas is scaled, so divide by scale to get actual size
        const scale = 3;
        const actualWidth = canvas.width / scale;
        const actualHeight = canvas.height / scale;
        
        // Convert pixels to mm (assuming 96 DPI: 1px = 0.264583mm)
        const widthMM = actualWidth * 0.264583;
        const heightMM = actualHeight * 0.264583;

        // Collect configuration information
        const configInfo = {
          gridType: gridType,
          gridConfig: config,
          frameColor: frameColor || 'None',
          fullColor: fullColor || 'None',
          buttons: []
        };

        // Collect button information
        Object.keys(dropZones).forEach(zoneId => {
          const zone = dropZones[zoneId];
          if (zone && zone.isPrimary) {
            const buttonInfo = {
              zone: zoneId,
              size: zone.dimensions ? `${zone.dimensions.colSpan}×${zone.dimensions.rowSpan}` : '1×1',
              color: zone.color || 'Default',
              iconS0: zone.s0?.type === 'icon' ? zone.s0.value : null,
              textS0: zone.s0?.type === 'text' ? zone.s0.value : null,
              iconS1: zone.s1?.type === 'icon' ? zone.s1.value : null,
              textS1: zone.s1?.type === 'text' ? zone.s1.value : null,
              iconS2: zone.s2?.type === 'icon' ? zone.s2.value : null,
              textS2: zone.s2?.type === 'text' ? zone.s2.value : null
            };
            configInfo.buttons.push(buttonInfo);
          }
        });

        // Calculate PDF page size (A4 landscape or portrait with space for info)
        const infoHeightMM = 60; // Space for information section
        const totalHeightMM = heightMM + infoHeightMM;
        const pageWidthMM = Math.max(widthMM, 210); // A4 width or frame width, whichever is larger
        const pageHeightMM = Math.max(totalHeightMM, 297); // A4 height or total height

        // Create PDF with proper dimensions
        const pdf = new jsPDF({
          orientation: pageWidthMM > pageHeightMM ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [pageWidthMM, pageHeightMM],
          compress: true
        });

        // Add company name header at the top
        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        const companyName = 'Your Company Name'; // Company name - can be customized
        const centerX = pageWidthMM / 2;
        pdf.text(companyName, centerX, 5, { align: 'center' });
        
        // Add frame image to PDF (below company name)
        const imgData = canvas.toDataURL('image/png', 1.0);
        const frameTopMargin = 12; // Space for company name
        pdf.addImage(imgData, 'PNG', (pageWidthMM - widthMM) / 2, frameTopMargin, widthMM, heightMM, undefined, 'FAST');

        // Add information section below the frame
        let yPos = heightMM + frameTopMargin + 15;
        const leftMargin = 10;
        const lineHeight = 6;
        const fontSize = 10;
        const smallFontSize = 8;

        // Title
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Board Design Configuration', leftMargin, yPos);
        yPos += lineHeight + 2;

        // Grid Type
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Grid Type: ${gridType} (${config.columns} columns × ${config.rows} rows)`, leftMargin, yPos);
        yPos += lineHeight;

        // Colors
        pdf.text(`Frame Color: ${configInfo.frameColor}`, leftMargin, yPos);
        yPos += lineHeight;
        pdf.text(`Full Color: ${configInfo.fullColor}`, leftMargin, yPos);
        yPos += lineHeight + 2;

        // Buttons section
        if (configInfo.buttons.length > 0) {
          pdf.setFontSize(fontSize);
          pdf.setFont(undefined, 'bold');
          pdf.text('Button Configuration:', leftMargin, yPos);
          yPos += lineHeight;

          pdf.setFontSize(smallFontSize);
          pdf.setFont(undefined, 'normal');
          configInfo.buttons.forEach((btn, index) => {
            if (yPos > pageHeightMM - 20) {
              pdf.addPage();
              yPos = 10;
            }
            
            let btnText = `${btn.zone}: Size ${btn.size}, Color: ${btn.color}`;
            const details = [];
            if (btn.iconS0) details.push(`S0 Icon: ${btn.iconS0}`);
            if (btn.textS0) details.push(`S0 Text: ${btn.textS0}`);
            if (btn.iconS1) details.push(`S1 Icon: ${btn.iconS1}`);
            if (btn.textS1) details.push(`S1 Text: ${btn.textS1}`);
            if (btn.iconS2) details.push(`S2 Icon: ${btn.iconS2}`);
            if (btn.textS2) details.push(`S2 Text: ${btn.textS2}`);
            
            pdf.text(btnText, leftMargin, yPos);
            yPos += lineHeight - 1;
            if (details.length > 0) {
              pdf.text(details.join(', '), leftMargin + 5, yPos);
              yPos += lineHeight;
            }
            yPos += 1;
          });
        } else {
          pdf.setFontSize(smallFontSize);
          pdf.text('No buttons configured', leftMargin, yPos);
          yPos += lineHeight;
        }

        // Date/Time
        yPos += lineHeight;
        const now = new Date();
        const dateStr = now.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        pdf.setFontSize(smallFontSize);
        pdf.setFont(undefined, 'italic');
        pdf.text(`Generated: ${dateStr}`, leftMargin, yPos);

        // Download PDF
        pdf.save(`board-design-${gridType}-${Date.now()}.pdf`);
        
        showFeedback('PDF downloaded successfully!', 'success');
      } catch (error) {
        // Restore buttons on error
        removeButtons.forEach(btn => {
          const original = originalDisplay.get(btn);
          btn.style.display = original !== undefined ? original : '';
        });
        colorButtons.forEach(btn => {
          const original = originalDisplay.get(btn);
          btn.style.display = original !== undefined ? original : '';
        });
        throw error;
      }
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
                className="button-icon"
                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
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
                style={{ width: '48px', height: '48px', objectFit: 'contain' }}
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
                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
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
      {/* Grid Type Selector and Download Button */}
      <div className="d-flex flex-row align-items-center justify-content-center gap-4 mb-4" style={{ width: '100%', flexWrap: 'wrap' }}>
        <div className="grid-type-selector d-flex flex-row align-items-center justify-content-center gap-4">
          {['2x4', '2x8', '2x6'].map(type => (
            <button
              key={type}
              type="button"
              className={`grid-type-btn ${gridType === type ? 'active' : ''}`}
              onClick={() => setGridType(type)}
              title={`${type === '2x4' ? '2 Columns × 4 Rows' : type === '2x8' ? '2 Columns × 8 Rows' : '2 Columns × 6 Rows'}`}
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

      {/* Frame Container with Digital Interface and Grid */}
      <div
        ref={frameRef}
        id="key"
        className={`frame-container-${gridType} ${gridType === '2x6' ? 'with-digital-interface' : ''}`}
        style={{ display: 'flex', flexDirection: 'column', width: '320px' }}
      >
        {/* Digital Interface for 2x6 layout */}
        {gridType === '2x6' && (
          <div className="digital-interface">
            <div className="digital-interface-row digital-interface-top">
              <div className="digital-icon power-icon">○</div>
              <div className="digital-icon home-icon">⌂</div>
              <div className="digital-temp-target">24°C</div>
              <div className="digital-button plus-button">+</div>
            </div>
            <div className="digital-interface-row digital-interface-middle">
              <div className="digital-icon mode-icon">M</div>
              <div className="digital-temp-display">18.2°C</div>
              <div className="digital-button minus-button">−</div>
            </div>
            <div className="digital-interface-row digital-interface-bottom">
              <div className="digital-icon fan-icon">⚙</div>
              <div className="digital-fan-speed">
                <div className="fan-bar filled"></div>
                <div className="fan-bar filled"></div>
                <div className="fan-bar filled"></div>
                <div className="fan-bar"></div>
                <div className="fan-bar"></div>
              </div>
              <div className="digital-heating">
                <span className="heating-waves">〰</span>
              </div>
              <div className="digital-checkmark">✓</div>
            </div>
          </div>
        )}

        {/* Device Layout - Drop Zone */}
        <div
          className={`layout polar-white custom basic layout-${gridType} ${gridType === '2x6' ? 'with-digital-interface' : ''}`}
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
    </div>
  );
}

export default Frame;

