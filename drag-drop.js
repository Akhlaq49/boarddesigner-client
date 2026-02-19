/**
 * Clean Drag and Drop Implementation for MM Technology interior
 * Handles dragging button parts onto the device layout
 */

class DragDropManager {
    constructor() {
        this.draggedElement = null;
        this.dragOverElement = null;
        this.currentDragData = null;
        this.highlightedZones = [];
        this.currentGridType = '2x4';
        this.gridConfigs = {
            '2x4': { columns: 2, rows: 4 },
            '1x8': { columns: 1, rows: 8 },
            '2x6': { columns: 2, rows: 6 }
        };
        // Store bound handlers for proper cleanup
        this.dropZoneHandlers = new WeakMap();
        // Selected button for icon/text editing
        this.selectedButton = null;
        // Current icon position for popup
        this.currentIconPosition = null;
        this.init();
    }

    init() {
        this.setupDraggableButtons();
        this.setupDropZones();
        this.setupEventListeners();
        this.setupGridTypeSelector();
        this.setupColorPalette();
        this.setupIconTextTab();
        this.loadIcons();
        this.updateGridLayout(this.currentGridType);
    }

    /**
     * Setup color palette functionality
     */
    setupColorPalette() {
        // Handle color button clicks
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const colorName = e.target.getAttribute('data-color-name');
                this.selectColor(colorName);
            });
        });

        // Handle FRAME button clicks
        const frameButtons = document.querySelectorAll('.frame-color-btn');
        frameButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = e.target.getAttribute('data-color');
                const colorName = e.target.closest('.pattern-select').getAttribute('data-color');
                this.applyColor(colorName || color, 'frame');
            });
        });

        // Handle ALL button clicks
        const allButtons = document.querySelectorAll('.all-color-btn');
        allButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = e.target.getAttribute('data-color');
                const colorName = e.target.closest('.pattern-select').getAttribute('data-color');
                this.applyColor(colorName || color, 'full');
            });
        });
    }

    /**
     * Select a color (highlight it)
     */
    selectColor(colorName) {
        // Remove active class from all pattern selects
        document.querySelectorAll('.pattern-select').forEach(select => {
            select.classList.remove('active');
        });

        // Add active class to selected color
        const selectedSelect = document.querySelector(`[data-color="${colorName}"]`);
        if (selectedSelect) {
            selectedSelect.classList.add('active');
        }
    }

    /**
     * Apply color to buttons, frame, or overall
     */
    applyColor(colorName, applyType) {
        // Update button states
        document.querySelectorAll('.frame-color-btn, .all-color-btn').forEach(btn => {
            if (btn && btn.classList) {
                btn.classList.remove('active');
            }
        });

        const activeButtons = document.querySelectorAll(`[data-color="${colorName}"].${applyType === 'frame' ? 'frame-color-btn' : 'all-color-btn'}`);
        activeButtons.forEach(btn => {
            if (btn && btn.classList) {
                btn.classList.add('active');
            }
        });

        // Apply color based on type
        if (applyType === 'frame') {
            this.applyFrameColor(colorName);
        } else if (applyType === 'full') {
            this.applyFullColor(colorName);
        }

        this.showFeedback(`${colorName} applied to ${applyType === 'frame' ? 'frame' : 'all'}`, 'success');
    }

    /**
     * Apply color to frame/border only
     */
    applyFrameColor(colorName) {
        const layout = document.getElementById('key');
        if (!layout) return;
        const colorValue = this.getColorValue(colorName);
        
        // Remove all color classes from layout
        this.removeColorClasses(layout);
        
        // Clear full color if set
        layout.removeAttribute('data-full-color');
        layout.style.backgroundColor = '';
        
        // Apply color to frame border
        layout.style.borderColor = colorValue;
        if (layout.classList) {
            layout.classList.add('frame-colored');
        }
        layout.setAttribute('data-frame-color', colorName);

        // Apply to all drop zones borders (preserve their functionality)
        document.querySelectorAll('.drop-zone').forEach(zone => {
            // Only update border color, don't interfere with other styles
            zone.style.borderColor = colorValue;
            // Ensure pointer-events are enabled
            zone.style.pointerEvents = 'auto';
            zone.style.cursor = 'default';
        });

        // Re-setup drop zones to ensure event listeners work
        this.setupDropZones();

        // Apply to dropped buttons borders
        document.querySelectorAll('.dropped-button').forEach(btn => {
            btn.style.borderColor = colorValue;
        });
    }

    /**
     * Apply color to everything (full)
     */
    applyFullColor(colorName) {
        const layout = document.getElementById('key');
        if (!layout) return;
        const colorClass = this.getColorClass(colorName);
        const colorValue = this.getColorValue(colorName);
        
        // Remove all color classes
        this.removeColorClasses(layout);
        
        // Clear frame color if set
        layout.removeAttribute('data-frame-color');
        layout.style.borderColor = '';
        
        // Add new color class
        if (layout.classList) {
            layout.classList.add(colorClass);
        }
        layout.style.backgroundColor = colorValue;
        layout.setAttribute('data-full-color', colorName);

        // Apply to all drop zones (preserve their drag-and-drop functionality)
        document.querySelectorAll('.drop-zone').forEach(zone => {
            // Remove old color classes
            zone.classList.remove(...this.getAllColorClasses());
            // Add new color class
            zone.classList.add(colorClass);
            // Apply colors via inline styles
            zone.style.backgroundColor = colorValue;
            zone.style.borderColor = colorValue;
            // CRITICAL: Ensure drop zones remain interactive
            zone.style.pointerEvents = 'auto';
            zone.style.cursor = 'default';
        });

        // Re-setup drop zones to ensure event listeners work
        this.setupDropZones();

        // Apply to dropped buttons
        document.querySelectorAll('.dropped-button').forEach(btn => {
            btn.style.backgroundColor = colorValue;
            btn.style.borderColor = colorValue;
        });

        // Apply to draggable buttons in sidebar
        document.querySelectorAll('.draggable-btn').forEach(btn => {
            btn.classList.remove(...this.getAllColorClasses());
            btn.classList.add(colorClass);
            btn.style.backgroundColor = colorValue;
        });
    }

    /**
     * Get color class name
     */
    getColorClass(colorName) {
        return colorName.replace(/-/g, '-');
    }

    /**
     * Get all color class names
     */
    getAllColorClasses() {
        return [
            'polar-white', 'royal-silver', 'anthracite-gray', 'meteor-black',
            'texture-black', 'pure-gold', 'antique-copper', 'antique-bronze',
            'red-cherry', 'green-leaf'
        ];
    }

    /**
     * Remove all color classes
     */
    removeColorClasses(element) {
        if (!element) return;
        this.getAllColorClasses().forEach(cls => {
            if (element.classList) {
                element.classList.remove(cls);
            }
        });
    }

    /**
     * Get color value (hex/rgb)
     */
    getColorValue(colorName) {
        const colorMap = {
            'polar-white': '#ffffff',
            'royal-silver': '#cbd5e1',
            'anthracite-gray': '#475569',
            'meteor-black': '#1e293b',
            'texture-black': '#0f172a',
            'pure-gold': '#fbbf24',
            'antique-copper': '#b45309',
            'antique-bronze': '#78350f',
            'red-cherry': '#dc2626',
            'green-leaf': '#16a34a'
        };
        return colorMap[colorName] || '#ffffff';
    }

    /**
     * Setup Icon & Text tab functionality
     */
    setupIconTextTab() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabValue = e.currentTarget.getAttribute('data-value');
                const tabGroup = e.currentTarget.closest('.x-tab-group') || (e.currentTarget.closest('[class*="tab"]') && e.currentTarget.closest('[class*="tab"]').parentElement) || null;
                this.switchTab(tabValue, tabGroup);
            });
        });
        
        // Color palette tab switching (separate handler)
        const colorTabs = document.querySelectorAll('.color-tab');
        colorTabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabValue = e.currentTarget.getAttribute('data-value');
                const tabGroup = e.currentTarget.closest('.x-tab-group') || (e.currentTarget.closest('[class*="tab"]') && e.currentTarget.closest('[class*="tab"]').parentElement) || null;
                this.switchColorTab(tabValue, tabGroup);
            });
        });

        // Radio button changes
        const radioInputs = document.querySelectorAll('input[type="radio"][name^="s"]');
        radioInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const position = e.target.name;
                const type = e.target.value;
                this.handlePositionTypeChange(position, type);
            });
        });

        // Icon popup open buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.open-icon-popup-btn')) {
                const btn = e.target.closest('.open-icon-popup-btn');
                const position = btn.getAttribute('data-position');
                this.openIconPopup(position);
            }
        });

        // Icon selection from popup
        document.addEventListener('click', (e) => {
            if (e.target.closest('.icon-item')) {
                const iconItem = e.target.closest('.icon-item');
                const iconPath = iconItem.getAttribute('data-icon-path');
                const position = this.currentIconPosition;
                if (position) {
                    this.selectIcon(position, iconPath);
                    this.closeIconPopup();
                }
            }
        });

        // Icon popup close
        document.addEventListener('click', (e) => {
            if (e.target.closest('.icon-popup-close') || e.target.closest('.icon-popup-overlay')) {
                this.closeIconPopup();
            }
        });

        // Button color popup
        document.addEventListener('click', (e) => {
            if (e.target.closest('.button-color-btn')) {
                const dropZone = e.target.closest('.drop-zone');
                if (dropZone && dropZone.classList.contains('has-content')) {
                    this.selectButton(dropZone, false);
                    this.openButtonColorPopup();
                }
            }
        });

        // Button color popup close
        document.addEventListener('click', (e) => {
            if (e.target.closest('.button-color-close') || e.target.closest('.button-color-overlay')) {
                this.closeButtonColorPopup();
            }
        });

        // Text input changes
        const textInputs = document.querySelectorAll('.text-input input');
        textInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const position = e.target.closest('.text-input').getAttribute('data-position');
                const text = e.target.value;
                this.updateButtonText(position, text);
            });
        });
    }

    /**
     * Switch between tabs (scoped to specific tab group)
     */
    switchTab(tabValue, tabGroup) {
        let container = null;
        
        if (tabGroup) {
            // Find the parent container (x-card) that contains both tabs and panels
            container = tabGroup.closest('.x-card') || tabGroup.parentElement;
        } else {
            // Fallback: find the container by finding the button
            const button = document.querySelector(`.tab-button[data-value="${tabValue}"]`);
            if (button) {
                container = button.closest('.x-card');
            }
        }
        
        if (!container) return;
        
        // Update tab buttons within this container
        container.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
            if (btn.getAttribute('data-value') === tabValue) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            }
        });

        // Update tab panels within this container (they are siblings of x-tab-group)
        container.querySelectorAll('[role="tabpanel"]').forEach(panel => {
            panel.classList.add('hidden');
            if (panel.getAttribute('data-tab') === tabValue) {
                panel.classList.remove('hidden');
            }
        });
    }
    
    /**
     * Switch between color palette tabs (separate handler)
     */
    switchColorTab(tabValue, tabGroup) {
        let container = null;
        
        if (tabGroup) {
            // Find the parent container (x-card) that contains both tabs and panels
            container = tabGroup.closest('.x-card') || tabGroup.parentElement;
        } else {
            // Fallback: find the container by finding the button
            const button = document.querySelector(`.color-tab[data-value="${tabValue}"]`);
            if (button) {
                container = button.closest('.x-card');
            }
        }
        
        if (!container) return;
        
        // Update color tab buttons within this container
        container.querySelectorAll('.color-tab').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
            if (btn.getAttribute('data-value') === tabValue) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            }
        });

        // Update color tab panels within this container (they are siblings of x-tab-group)
        container.querySelectorAll('[role="tabpanel"][data-tab]').forEach(panel => {
            panel.classList.add('hidden');
            if (panel.getAttribute('data-tab') === tabValue) {
                panel.classList.remove('hidden');
            }
        });
    }

    /**
     * Handle position type change (Empty/Icon/Text)
     */
    handlePositionTypeChange(position, type) {
        const iconSelector = document.querySelector(`.icon-selector[data-position="${position}"]`);
        const textInput = document.querySelector(`.text-input[data-position="${position}"]`);

        // Hide all
        if (iconSelector) iconSelector.classList.add('hidden');
        if (textInput) textInput.classList.add('hidden');

        // Show relevant one
        if (type === 'icon' && iconSelector) {
            iconSelector.classList.remove('hidden');
        } else if (type === 'text' && textInput) {
            textInput.classList.remove('hidden');
        } else if (type === 'empty') {
            // Clear icon/text for this position
            this.clearButtonContent(position);
        }
    }

    /**
     * Load icons from the images folder
     */
    loadIcons() {
        // Icon file list - filter to only SVG files
        this.iconFiles = [
            'AC-01.svg', 'AC-05.svg', 'AC-10.svg', 'AC-23.svg', 'AC-30.svg',
            'BC-01.svg', 'BC-02.svg', 'BC-04.svg', 'BC-06.svg', 'BC-11.svg', 'BC-14.svg',
            'C-06.svg', 'C-07.svg',
            'CB-8.svg', 'CB-16.svg', 'CB-32.svg', 'CB-44.svg', 'CB-48.svg', 'CB-49.svg',
            'CB-52.svg', 'CB-68.svg', 'CB-70.svg', 'CB-71.svg', 'CB-75.svg', 'CB-87.svg',
            'CB-88.svg', 'CB-90.svg',
            'C&H-03.svg', 'C&H-11.svg',
            'D-02.svg', 'D-03.svg', 'D-10.svg', 'D-15.svg', 'D-19.svg', 'D-27.svg',
            'E&R-01.svg',
            'G&S-10.svg', 'G&S-18.svg',
            'H&HS-08.svg', 'H&HS-15.svg', 'H&HS-19.svg',
            'H&S-03.svg',
            'IU-03.svg', 'IU-04.svg', 'IU-10.svg',
            'KC-01.svg', 'KC-04.svg', 'KC-11.svg', 'KC-12.svg',
            'LL-01.svg', 'LL-03.svg', 'LL-22.svg', 'LL-27.svg', 'LL-32.svg', 'LL-35.svg',
            'LL-42.svg', 'LL-43.svg', 'LL-48.svg', 'LL-59.svg', 'LL-61.svg', 'LL-62.svg',
            'LL-68.svg', 'LL-73.svg', 'LL-78.svg', 'LL-84.svg', 'LL-94.svg', 'LL-99.svg',
            'M&H-02.svg',
            'M&T-02.svg', 'M&T-05.svg', 'M&T-06.svg', 'M&T-20.svg',
            'OB-14.svg', 'OB-21.svg',
            'S&G-02.svg', 'S&G-03.svg', 'S&G-06.svg', 'S&G-08.svg',
            'SCS-01.svg', 'SCS-02.svg', 'SCS-05.svg', 'SCS-06.svg', 'SCS-07.svg',
            'SCS-09.svg', 'SCS-17.svg', 'SCS-19.svg', 'SCS-23.svg'
        ];
    }

    /**
     * Open icon selection popup
     */
    openIconPopup(position) {
        this.currentIconPosition = position;
        const modal = document.getElementById('icon-popup-modal');
        const iconGrid = modal.querySelector('.icon-grid');
        
        if (!iconGrid || !this.iconFiles) return;
        
        // Populate icon grid if empty
        if (iconGrid.children.length === 0) {
            iconGrid.innerHTML = '';
            this.iconFiles.forEach(iconFile => {
                const iconItem = document.createElement('div');
                iconItem.className = 'icon-item cursor-pointer p-2 border rounded hover:bg-gray-100 transition flex items-center justify-center';
                iconItem.setAttribute('data-icon-path', `ican/images/${iconFile}`);
                iconItem.setAttribute('title', iconFile);
                
                const img = document.createElement('img');
                img.src = `ican/images/${iconFile}`;
                img.alt = iconFile;
                img.className = 'w-8 h-8 object-contain';
                iconItem.appendChild(img);
                iconGrid.appendChild(iconItem);
            });
        }
        
        modal.classList.remove('hidden');
    }

    /**
     * Close icon selection popup
     */
    closeIconPopup() {
        const modal = document.getElementById('icon-popup-modal');
        modal.classList.add('hidden');
        this.currentIconPosition = null;
    }

    /**
     * Open button color selection popup
     */
    openButtonColorPopup() {
        const modal = document.getElementById('button-color-popup');
        const colorList = modal.querySelector('.color-palette-list');
        
        if (!colorList) return;
        
        // Populate color list if empty
        if (colorList.children.length === 0) {
            const colors = ['polar-white', 'royal-silver', 'anthracite-gray', 'meteor-black', 
                          'texture-black', 'pure-gold', 'antique-copper', 'antique-bronze', 
                          'red-cherry', 'green-leaf'];
            
            colors.forEach(colorName => {
                const colorItem = document.createElement('div');
                colorItem.className = 'pattern-select relative';
                colorItem.setAttribute('data-color', colorName);
                
                const colorBtn = document.createElement('button');
                colorBtn.type = 'button';
                colorBtn.className = `btn pattern h-9 ${colorName} color-btn w-full`;
                colorBtn.setAttribute('data-color-name', colorName);
                colorBtn.setAttribute('title', colorName.replace(/-/g, ' '));
                
                colorItem.appendChild(colorBtn);
                colorList.appendChild(colorItem);
            });
        }
        
        // Add click handlers for color selection
        colorList.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const colorName = e.target.getAttribute('data-color-name');
                this.applyColorToSelectedButton(colorName);
                this.closeButtonColorPopup();
            });
        });
        
        modal.classList.remove('hidden');
    }

    /**
     * Close button color popup
     */
    closeButtonColorPopup() {
        const modal = document.getElementById('button-color-popup');
        modal.classList.add('hidden');
    }

    /**
     * Apply color to selected button only
     */
    applyColorToSelectedButton(colorName) {
        if (!this.selectedButton) {
            this.showFeedback('Please select a button first', 'info');
            return;
        }
        
        const button = this.selectedButton.querySelector('.dropped-button');
        if (!button) return;
        
        const colorValue = this.getColorValue(colorName);
        if (colorValue) {
            button.style.backgroundColor = colorValue;
            button.style.borderColor = colorValue;
            this.selectedButton.setAttribute('data-button-color', colorName);
            this.showFeedback(`Color applied to selected button`, 'success');
        }
    }

    /**
     * Populate icon grid for a position (deprecated - now using popup)
     */
    populateIconGrid(position) {
        const iconGrid = document.querySelector(`.icon-selector[data-position="${position}"] .icon-grid`);
        if (!iconGrid || !this.iconFiles) return;

        iconGrid.innerHTML = '';
        
        this.iconFiles.forEach(iconFile => {
            const iconItem = document.createElement('div');
            iconItem.className = 'icon-item cursor-pointer p-2 border rounded hover:bg-gray-100 transition';
            iconItem.setAttribute('data-icon-path', `ican/images/${iconFile}`);
            iconItem.setAttribute('data-position', position);
            iconItem.setAttribute('title', iconFile);
            
            const img = document.createElement('img');
            img.src = `ican/images/${iconFile}`;
            img.alt = iconFile;
            img.className = 'w-full h-8 object-contain';
            img.onerror = function() {
                this.style.display = 'none';
            };
            
            iconItem.appendChild(img);
            iconGrid.appendChild(iconItem);
        });
    }

    /**
     * Select an icon for a position
     */
    selectIcon(position, iconPath) {
        // Only apply to selected button
        if (!this.selectedButton) {
            this.showFeedback('Please select a button first', 'info');
            return;
        }
        
        // Store selected icon
        this.selectedIcons = this.selectedIcons || {};
        this.selectedIcons[position] = iconPath;
        
        // Clear text for this position
        if (this.selectedTexts) {
            delete this.selectedTexts[position];
        }

        // Apply to selected button only
        this.applyIconToSelectedButton(position, iconPath);
        
        // Highlight selected icon
        document.querySelectorAll('.icon-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-green-500');
        });
        const selectedItem = document.querySelector(`.icon-item[data-icon-path="${iconPath}"][data-position="${position}"]`);
        if (selectedItem) {
            selectedItem.classList.add('ring-2', 'ring-green-500');
        }
    }

    /**
     * Apply icon to selected button only
     */
    applyIconToSelectedButton(position, iconPath) {
        if (!this.selectedButton) {
            return;
        }
        
        const button = this.selectedButton.querySelector('.dropped-button');
        if (button) {
            const span = button.querySelector(`.${position}`);
            if (span) {
                // Clear existing content
                span.innerHTML = '';
                // Add icon
                const img = document.createElement('img');
                img.src = iconPath;
                img.className = 'icon-img w-6 h-6 object-contain';
                span.appendChild(img);
                this.showFeedback(`Icon applied to ${position} of selected button`, 'success');
            }
        }
    }

    /**
     * Update button text for selected button only
     */
    updateButtonText(position, text) {
        // Only apply to selected button
        if (!this.selectedButton) {
            this.showFeedback('Please select a button first', 'info');
            return;
        }
        
        const button = this.selectedButton.querySelector('.dropped-button');
        if (button) {
            const span = button.querySelector(`.${position}`);
            if (span) {
                // Clear existing content
                span.innerHTML = '';
                // Add text if provided
                if (text) {
                    span.textContent = text;
                    span.className = `${position} text-sm`;
                    this.showFeedback('Text applied to selected button', 'success');
                }
            }
        }
    }

    /**
     * Clear button content for a position (selected button only)
     */
    clearButtonContent(position) {
        // Only clear from selected button
        if (!this.selectedButton) {
            return;
        }
        
        const button = this.selectedButton.querySelector('.dropped-button');
        if (button) {
            const span = button.querySelector(`.${position}`);
            if (span) {
                span.innerHTML = '';
            }
        }
    }

    /**
     * Setup grid type selector
     */
    setupGridTypeSelector() {
        const gridTypeButtons = document.querySelectorAll('.grid-type-btn');
        gridTypeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gridType = e.currentTarget.getAttribute('data-grid-type');
                this.switchGridType(gridType);
            });
        });
    }

    /**
     * Switch grid type
     */
    switchGridType(gridType) {
        // Update active button
        document.querySelectorAll('.grid-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-grid-type') === gridType) {
                btn.classList.add('active');
            }
        });

        // Clear all existing content
        this.clearAllDropZones();

        // Update grid layout
        this.updateGridLayout(gridType);
        this.currentGridType = gridType;

        // Reinitialize drop zones
        this.setupDropZones();

        this.showFeedback(`Switched to ${gridType} layout`, 'info');
    }

    /**
     * Update grid layout based on type
     */
    updateGridLayout(gridType) {
        const layout = document.getElementById('key');
        const config = this.gridConfigs[gridType];

        // Remove all layout classes
        layout.classList.remove('layout-2x4', 'layout-1x8', 'layout-2x6');
        // Add new layout class
        layout.classList.add(`layout-${gridType}`);
        layout.setAttribute('data-grid-type', gridType);

        // Show/hide drop zones based on grid type
        const allZones = document.querySelectorAll('.drop-zone');
        allZones.forEach((zone, index) => {
            const zonePlace = zone.getAttribute('data-place');
            const zoneRow = parseInt(zone.getAttribute('data-grid-row')) || 1;
            const zoneCol = parseInt(zone.getAttribute('data-grid-col')) || 1;

            // Reset merged state
            zone.classList.remove('merged-hidden', 'has-content');
            zone.removeAttribute('data-merged-into');
            zone.style.gridColumn = '';
            zone.style.gridRow = '';

            // Clear any dropped buttons
            const droppedButton = zone.querySelector('.dropped-button');
            if (droppedButton) {
                droppedButton.remove();
            }

            // Show/hide zones based on grid type
            if (gridType === '2x4') {
                // Show zones in rows 1-4, columns 1-2 (8 zones total)
                if (zoneRow <= 4 && zoneCol <= 2) {
                    zone.classList.remove('hidden');
                } else {
                    zone.classList.add('hidden');
                }
            } else if (gridType === '1x8') {
                // Show zones in column 1, rows 1-8 (8 zones total), hide column 2
                if (zoneCol === 1 && zoneRow <= 8) {
                    zone.classList.remove('hidden');
                } else {
                    zone.classList.add('hidden');
                }
            } else if (gridType === '2x6') {
                // Show zones in rows 1-6, columns 1-2 (12 zones total)
                if (zoneRow <= 6 && zoneCol <= 2) {
                    zone.classList.remove('hidden');
                } else {
                    zone.classList.add('hidden');
                }
            }
        });
    }

    /**
     * Clear all drop zones
     */
    clearAllDropZones() {
        document.querySelectorAll('.drop-zone').forEach(zone => {
            this.clearDropZone(zone);
        });
    }

    /**
     * Setup draggable buttons from the sidebar
     */
    setupDraggableButtons() {
        const draggableButtons = document.querySelectorAll('.draggable-btn');
        
        draggableButtons.forEach(button => {
            button.addEventListener('dragstart', this.handleDragStart.bind(this));
            button.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
    }

    /**
     * Setup drop zones in the device layout
     */
    setupDropZones() {
        const dropZones = document.querySelectorAll('.drop-zone');
        
        dropZones.forEach(zone => {
            // Remove existing listeners if they exist
            const existingHandlers = this.dropZoneHandlers.get(zone);
            if (existingHandlers) {
                zone.removeEventListener('dragover', existingHandlers.dragover);
                zone.removeEventListener('dragenter', existingHandlers.dragenter);
                zone.removeEventListener('dragleave', existingHandlers.dragleave);
                zone.removeEventListener('drop', existingHandlers.drop);
            }
            
            // Create bound handlers
            const handlers = {
                dragover: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleDragOver(e);
                },
                dragenter: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleDragEnter(e);
                },
                dragleave: (e) => {
                    this.handleDragLeave(e);
                },
                drop: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleDrop(e);
                }
            };
            
            // Store handlers for later removal
            this.dropZoneHandlers.set(zone, handlers);
            
            // Add event listeners
            zone.addEventListener('dragover', handlers.dragover, { passive: false });
            zone.addEventListener('dragenter', handlers.dragenter, { passive: false });
            zone.addEventListener('dragleave', handlers.dragleave);
            zone.addEventListener('drop', handlers.drop);
            
            // Ensure pointer events are enabled
            zone.style.pointerEvents = 'auto';
            zone.style.cursor = 'default';
        });
    }

    /**
     * Setup additional event listeners
     */
    setupEventListeners() {
        // Prevent default drag behavior on images
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });
    }

    /**
     * Handle drag start event
     */
    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        
        // Store the button type and classes
        const buttonType = e.target.getAttribute('data-button-type');
        const buttonClasses = Array.from(e.target.classList);
        
        // Calculate button dimensions
        const colSpan = this.getColSpan(buttonClasses);
        const rowSpan = this.getRowSpan(buttonClasses);
        
        // Store data in the drag event
        const dragData = {
            buttonType: buttonType,
            classes: buttonClasses.filter(cls => 
                cls.startsWith('custom-button-') || 
                cls.startsWith('polar-white') ||
                cls.startsWith('row-span-') ||
                cls.startsWith('col-span-')
            ),
            colSpan: colSpan,
            rowSpan: rowSpan
        };
        
        this.currentDragData = dragData;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        
        // Create a custom drag image
        const dragImage = e.target.cloneNode(true);
        dragImage.style.opacity = '0.8';
        dragImage.style.transform = 'rotate(5deg)';
        document.body.appendChild(dragImage);
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }

    /**
     * Get column span from classes
     */
    getColSpan(classes) {
        const colSpanClass = classes.find(cls => cls.startsWith('col-span-'));
        if (colSpanClass) {
            return parseInt(colSpanClass.replace('col-span-', '')) || 1;
        }
        return 1;
    }

    /**
     * Get row span from classes
     */
    getRowSpan(classes) {
        const rowSpanClass = classes.find(cls => cls.startsWith('row-span-'));
        if (rowSpanClass) {
            return parseInt(rowSpanClass.replace('row-span-', '')) || 1;
        }
        return 1;
    }

    /**
     * Handle drag end event
     */
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        
        // Remove drag-over class from all drop zones
        this.clearAllHighlights();
        
        this.draggedElement = null;
        this.dragOverElement = null;
        this.currentDragData = null;
        this.highlightedZones = [];
    }

    /**
     * Handle drag enter event
     */
    handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        
        if (this.isValidDropZone(dropZone) && this.currentDragData) {
            this.highlightMergeZones(dropZone, this.currentDragData);
            this.dragOverElement = dropZone;
        }
    }

    /**
     * Handle drag over event
     */
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        
        const dropZone = e.currentTarget;
        if (this.isValidDropZone(dropZone) && this.currentDragData) {
            this.highlightMergeZones(dropZone, this.currentDragData);
        }
    }

    /**
     * Handle drag leave event
     */
    handleDragLeave(e) {
        const dropZone = e.currentTarget;
        
        // Only remove drag-over if we're actually leaving the drop zone
        if (!dropZone.contains(e.relatedTarget)) {
            this.clearAllHighlights();
        }
    }

    /**
     * Handle drop event
     */
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = e.currentTarget;
        this.clearAllHighlights();
        
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const zonesToMerge = this.getZonesToMerge(dropZone, data);
            
            if (zonesToMerge && zonesToMerge.length > 0) {
                this.placeButtonInMergedZones(dropZone, zonesToMerge, data);
                this.showFeedback('Button placed successfully!', 'success');
            } else {
                // Only show error if it's a real validation issue, not just a bounds check
                const startPos = this.getGridPosition(dropZone);
                const colSpan = data.colSpan || 1;
                const rowSpan = data.rowSpan || 1;
                const config = this.gridConfigs[this.currentGridType];
                
                // Check if it's a bounds issue
                if (startPos.row + rowSpan - 1 > config.rows || startPos.col + colSpan - 1 > config.columns) {
                    this.showFeedback(`Button doesn't fit here (needs ${colSpan}×${rowSpan}, only ${config.columns}×${config.rows} available)`, 'error');
                } else {
                    // Silent fail for other issues (zone conflicts, etc.)
                    // Don't show error message for valid attempts that just can't merge
                }
            }
        } catch (error) {
            console.error('Error parsing drop data:', error);
            this.showFeedback('Error placing button', 'error');
        }
        
        return false;
    }

    /**
     * Check if a drop zone is valid for dropping
     */
    isValidDropZone(dropZone) {
        // Allow hidden zones (they can be part of a merge)
        // The merge validation will handle checking if zones are available
        
        // Check if drop zone is already merged into another button (not itself)
        if (dropZone.hasAttribute('data-merged-into')) {
            const mergedInto = dropZone.getAttribute('data-merged-into');
            const dropZonePlace = dropZone.getAttribute('data-place');
            // Allow if it's merged into itself (shouldn't happen, but be safe)
            if (mergedInto !== dropZonePlace) {
                // Check if we can still use it as a starting point for a new merge
                // (e.g., if it's the start zone of an existing merge, we can replace it)
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get grid position of a drop zone
     */
    getGridPosition(dropZone) {
        const row = parseInt(dropZone.getAttribute('data-grid-row')) || 1;
        const col = parseInt(dropZone.getAttribute('data-grid-col')) || 1;
        return { row, col };
    }

    /**
     * Get all zones that need to be merged for a button
     */
    getZonesToMerge(startZone, buttonData) {
        const startPos = this.getGridPosition(startZone);
        const colSpan = buttonData.colSpan || 1;
        const rowSpan = buttonData.rowSpan || 1;
        
        const config = this.gridConfigs[this.currentGridType];
        const maxRows = config.rows;
        const maxCols = config.columns;
        
        // Check if the button fits within bounds from the start position
        if (startPos.row + rowSpan - 1 > maxRows || startPos.col + colSpan - 1 > maxCols) {
            return null; // Out of bounds
        }
        
        const zones = [];
        const allZones = Array.from(document.querySelectorAll('.drop-zone'));
        
        // Calculate which grid cells are needed
        for (let r = 0; r < rowSpan; r++) {
            for (let c = 0; c < colSpan; c++) {
                const targetRow = startPos.row + r;
                const targetCol = startPos.col + c;
                
                // Find the zone at this position (including hidden zones)
                const zone = allZones.find(z => {
                    const pos = this.getGridPosition(z);
                    return pos.row === targetRow && pos.col === targetCol;
                });
                
                if (!zone) {
                    return null; // Zone doesn't exist
                }
                
                // Check if zone is already merged into another button
                // We'll allow it and clear the existing merge during placement
                // This allows replacing existing buttons
                
                // Allow zones with content - we'll clear them during placement
                // This allows replacing existing buttons with new ones
                
                zones.push(zone);
            }
        }
        
        return zones.length === (colSpan * rowSpan) ? zones : null;
    }

    /**
     * Highlight zones that will be merged
     */
    highlightMergeZones(startZone, buttonData) {
        this.clearAllHighlights();
        
        const zonesToMerge = this.getZonesToMerge(startZone, buttonData);
        
        if (zonesToMerge && zonesToMerge.length > 0) {
            zonesToMerge.forEach(zone => {
                zone.classList.add('drag-over');
                this.highlightedZones.push(zone);
            });
        }
    }

    /**
     * Clear all highlight classes
     */
    clearAllHighlights() {
        this.highlightedZones.forEach(zone => {
            zone.classList.remove('drag-over');
        });
        this.highlightedZones = [];
        
        // Also clear any remaining drag-over classes
        document.querySelectorAll('.drop-zone.drag-over').forEach(zone => {
            zone.classList.remove('drag-over');
        });
    }

    /**
     * Place button in merged zones
     */
    placeButtonInMergedZones(startZone, zonesToMerge, buttonData) {
        // First, unmerge any existing buttons that overlap with these zones
        zonesToMerge.forEach(zone => {
            // If this zone is the start of another merge, clear it first
            if (zone.hasAttribute('data-merged-zones')) {
                this.clearDropZone(zone);
            }
            // If this zone is part of another merge, we need to clear the parent merge
            if (zone.hasAttribute('data-merged-into')) {
                const mergedInto = zone.getAttribute('data-merged-into');
                const parentZone = document.querySelector(`[data-place="${mergedInto}"]`);
                if (parentZone) {
                    this.clearDropZone(parentZone);
                }
            }
            // Clear any dropped buttons in these zones
            const droppedButton = zone.querySelector('.dropped-button');
            if (droppedButton) {
                droppedButton.remove();
            }
        });
        
        // Hide all zones except the start zone
        zonesToMerge.forEach((zone) => {
            if (zone !== startZone) {
                zone.classList.add('merged-hidden');
                zone.setAttribute('data-merged-into', startZone.getAttribute('data-place'));
            }
        });
        
        // Remove hidden class from start zone if it was hidden
        startZone.classList.remove('hidden');
        
        // Apply grid span to start zone
        const colSpan = buttonData.colSpan || 1;
        const rowSpan = buttonData.rowSpan || 1;
        
        // Remove any existing span classes
        startZone.classList.remove(...Array.from(startZone.classList).filter(cls => 
            cls.startsWith('col-span-') || cls.startsWith('row-span-')
        ));
        
        // Remove any existing inline grid styles
        startZone.style.gridColumn = '';
        startZone.style.gridRow = '';
        
        // Apply new spans
        if (colSpan > 1) {
            startZone.style.gridColumn = `span ${colSpan}`;
            startZone.classList.add(`col-span-${colSpan}`);
        }
        
        if (rowSpan > 1) {
            startZone.style.gridRow = `span ${rowSpan}`;
            startZone.classList.add(`row-span-${rowSpan}`);
        }
        
        // Create a visual representation of the dropped button
        // Colors are automatically applied in createButtonElement
        const buttonElement = this.createButtonElement(buttonData);
        
        // Add the button to the start zone
        startZone.appendChild(buttonElement);
        startZone.classList.add('has-content');
        
        // Make button selectable
        this.makeButtonSelectable(startZone);
        
        // Auto-select the newly placed button
        this.selectButton(startZone);
        
        // Store the button data and merged zones info
        startZone.setAttribute('data-button-type', buttonData.buttonType);
        startZone.setAttribute('data-button-classes', buttonData.classes.join(' '));
        startZone.setAttribute('data-merged-zones', zonesToMerge.map(z => z.getAttribute('data-place')).join(','));
        startZone.setAttribute('data-col-span', colSpan);
        startZone.setAttribute('data-row-span', rowSpan);
        
        // Add animation
        buttonElement.style.animation = 'dropAnimation 0.3s ease';
        
        // Log the action
        this.logButtonPlacement(startZone, buttonData);
    }

    /**
     * Place button in the drop zone (single zone, for backward compatibility)
     */
    placeButtonInZone(dropZone, buttonData) {
        const zonesToMerge = this.getZonesToMerge(dropZone, buttonData);
        if (zonesToMerge && zonesToMerge.length > 0) {
            this.placeButtonInMergedZones(dropZone, zonesToMerge, buttonData);
        } else {
            // Fallback to single zone placement
            this.clearDropZone(dropZone);
            const buttonElement = this.createButtonElement(buttonData);
            dropZone.appendChild(buttonElement);
            dropZone.classList.add('has-content');
            dropZone.setAttribute('data-button-type', buttonData.buttonType);
            dropZone.setAttribute('data-button-classes', buttonData.classes.join(' '));
            buttonElement.style.animation = 'dropAnimation 0.3s ease';
            
            // Make button selectable
            this.makeButtonSelectable(dropZone);
            
            // Auto-select the newly placed button
            this.selectButton(dropZone);
            
            this.logButtonPlacement(dropZone, buttonData);
        }
    }

    /**
     * Create a button element from button data
     */
    createButtonElement(buttonData) {
        const button = document.createElement('div');
        button.className = 'dropped-button';
        button.setAttribute('data-button-type', buttonData.buttonType);
        
        // Apply relevant classes for styling
        buttonData.classes.forEach(cls => {
            if (cls.startsWith('custom-button-') || cls.startsWith('polar-white')) {
                button.classList.add(cls);
            }
        });
        
        // Apply current color settings if any
        const layout = document.getElementById('key');
        const fullColor = layout.getAttribute('data-full-color');
        const frameColor = layout.getAttribute('data-frame-color');
        
        if (fullColor) {
            button.style.backgroundColor = this.getColorValue(fullColor);
            button.style.borderColor = this.getColorValue(fullColor);
        } else if (frameColor) {
            button.style.borderColor = this.getColorValue(frameColor);
        }
        
        // Add visual indicator with icon
        const icon = this.getButtonIcon(buttonData.buttonType);
        
        // Create spans for s0, s1, s2 positions
        const buttonContent = document.createElement('div');
        buttonContent.className = 'button-content';
        
        const s0 = document.createElement('span');
        s0.className = 's0';
        const s1 = document.createElement('span');
        s1.className = 's1';
        const s2 = document.createElement('span');
        s2.className = 's2';
        
        buttonContent.appendChild(s0);
        buttonContent.appendChild(s1);
        buttonContent.appendChild(s2);
        button.appendChild(buttonContent);
        
        // Apply any existing icon/text configurations
        this.applyExistingIconTextConfig(button);
        
        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-button';
        removeBtn.setAttribute('aria-label', 'Remove button');
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeButtonFromZone(button.parentElement);
        });
        button.appendChild(removeBtn);
        
        // Add color button
        const colorBtn = document.createElement('button');
        colorBtn.className = 'button-color-btn';
        colorBtn.setAttribute('aria-label', 'Change button color');
        colorBtn.innerHTML = '<i class="fas fa-palette"></i>';
        colorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Selection will be handled by the global click handler
        });
        button.appendChild(colorBtn);
        
        return button;
    }

    /**
     * Get icon for button type (optional enhancement)
     */
    getButtonIcon(buttonType) {
        const icons = {
            '1': 'fas fa-circle',
            '2': 'fas fa-square',
            '3': 'fas fa-ellipsis-h',
            '4': 'fas fa-th-large'
        };
        return icons[buttonType] || null;
    }

    /**
     * Apply existing icon/text configuration to a button
     */
    applyExistingIconTextConfig(button) {
        // Don't auto-apply - user will configure manually
        // This function is kept for future use if needed
    }

    /**
     * Make a button selectable
     */
    makeButtonSelectable(dropZone) {
        // Add click handler for selection (using arrow function to preserve context)
        const handleClick = (e) => {
            // Don't select if clicking on remove button or during drag
            if (e.target.closest('.remove-button') || this.draggedElement) {
                return;
            }
            // Don't select if clicking during drag operation
            if (e.target.closest('.draggable-btn')) {
                return;
            }
            this.selectButton(dropZone, true);
        };
        
        // Remove existing listener if any
        if (dropZone._selectHandler) {
            dropZone.removeEventListener('click', dropZone._selectHandler);
        }
        dropZone._selectHandler = handleClick;
        dropZone.addEventListener('click', handleClick);
    }

    /**
     * Select a button
     */
    selectButton(dropZone, showFeedback = false) {
        // Remove selection from all buttons
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('selected');
        });
        
        // Add selection to clicked button
        if (dropZone && dropZone.classList.contains('has-content')) {
            dropZone.classList.add('selected');
            this.selectedButton = dropZone;
            if (showFeedback) {
                this.showFeedback('Button selected', 'info');
            }
        } else {
            this.selectedButton = null;
        }
    }

    /**
     * Clear a drop zone
     */
    clearDropZone(dropZone) {
        const existingButton = dropZone.querySelector('.dropped-button');
        if (existingButton) {
            existingButton.remove();
        }
        dropZone.classList.remove('has-content');
        dropZone.removeAttribute('data-button-type');
        dropZone.removeAttribute('data-button-classes');
        
        // Unmerge zones if this was a merged button
        const mergedZones = dropZone.getAttribute('data-merged-zones');
        if (mergedZones) {
            const zoneNames = mergedZones.split(',');
            zoneNames.forEach(zoneName => {
                const zone = document.querySelector(`[data-place="${zoneName}"]`);
                if (zone && zone !== dropZone) {
                    zone.classList.remove('merged-hidden');
                    zone.removeAttribute('data-merged-into');
                    // Restore original hidden state if it was originally hidden
                    // (We don't track this, so we'll leave it visible - can be enhanced if needed)
                }
            });
            dropZone.removeAttribute('data-merged-zones');
        }
        
        // Remove grid span styles
        dropZone.style.gridColumn = '';
        dropZone.style.gridRow = '';
        dropZone.removeAttribute('data-col-span');
        dropZone.removeAttribute('data-row-span');
        
        // Remove span classes that were added dynamically
        const spanClasses = Array.from(dropZone.classList).filter(cls => 
            (cls.startsWith('col-span-') || cls.startsWith('row-span-')) && 
            !cls.match(/^col-span-[12]$/) && !cls.match(/^row-span-[12]$/)
        );
        dropZone.classList.remove(...spanClasses);
    }

    /**
     * Remove button from drop zone
     */
    removeButtonFromZone(dropZone) {
        this.clearDropZone(dropZone);
        this.logButtonRemoval(dropZone);
    }

    /**
     * Log button placement (for debugging or state management)
     */
    logButtonPlacement(dropZone, buttonData) {
        const place = dropZone.getAttribute('data-place');
        console.log(`Button ${buttonData.buttonType} placed in ${place}`, {
            dropZone: place,
            buttonType: buttonData.buttonType,
            classes: buttonData.classes
        });
    }

    /**
     * Log button removal
     */
    logButtonRemoval(dropZone) {
        const place = dropZone.getAttribute('data-place');
        console.log(`Button removed from ${place}`);
        this.showFeedback('Button removed', 'info');
    }

    /**
     * Show feedback message to user
     */
    showFeedback(message, type = 'info') {
        // Remove existing feedback if any
        const existingFeedback = document.querySelector('.drag-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = `drag-feedback drag-feedback-${type}`;
        feedback.textContent = message;
        document.body.appendChild(feedback);

        // Animate in
        setTimeout(() => {
            feedback.classList.add('show');
        }, 10);

        // Remove after delay
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                if (feedback.parentElement) {
                    feedback.remove();
                }
            }, 300);
        }, 2000);
    }

    /**
     * Get current layout state (useful for saving)
     */
    getLayoutState() {
        const state = {};
        document.querySelectorAll('.drop-zone').forEach(zone => {
            const place = zone.getAttribute('data-place');
            const buttonType = zone.getAttribute('data-button-type');
            if (buttonType) {
                state[place] = {
                    buttonType: buttonType,
                    classes: zone.getAttribute('data-button-classes')?.split(' ') || []
                };
            }
        });
        return state;
    }

    /**
     * Load layout state (useful for restoring)
     */
    loadLayoutState(state) {
        Object.keys(state).forEach(place => {
            const dropZone = document.querySelector(`[data-place="${place}"]`);
            if (dropZone) {
                this.placeButtonInZone(dropZone, state[place]);
            }
        });
    }
}

// Initialize drag and drop when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dragDropManager = new DragDropManager();
    });
} else {
    window.dragDropManager = new DragDropManager();
}

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DragDropManager;
}

