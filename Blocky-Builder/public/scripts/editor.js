// Main Editor Application
class BlockyBuilderEditor {
    constructor() {
        this.worldManager = null;
        this.renderer = null;
        this.eventSystem = null;
        this.toolManager = null;
        this.canvas = null;
        
        this.init();
    }

    async init() {
        try {
            // Get canvas element
            this.canvas = document.getElementById('worldCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }

            // Initialize core systems
            this.worldManager = new WorldManager();
            this.renderer = new Renderer(this.canvas, this.worldManager);
            this.toolManager = new ToolManager(this.worldManager, this.renderer);
            this.eventSystem = new EventSystem(this.canvas, this.worldManager, this.renderer, this.toolManager);
            
            console.log('🔍 DEBUG: EventSystem initialized with canvas:', this.canvas);
            console.log('🔍 DEBUG: Canvas has event listeners:', this.canvas.onmousedown !== null);

            // Setup UI
            this.setupUI();
            
            // Resize canvas to proper dimensions
            this.renderer.resizeCanvas();
            
            // Load saved data
            this.loadSavedData();
            
            // Start rendering loop
            this.startRenderLoop();
            
            // Show success message
            this.showToast('Editor loaded successfully!', 'success');
            
            // Check modal state
            const modal = document.getElementById('projectModal');
            console.log('🔍 DEBUG: Modal state on init:', modal, 'Display:', modal ? modal.style.display : 'not found');
            
            console.log('Blocky Builder Editor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize editor:', error);
            this.showToast('Failed to load editor: ' + error.message, 'error');
        }
    }

    setupUI() {
        // Setup right tile palette
        this.setupRightTilePalette();
        
        // Setup world stats
        this.updateWorldStats();
        
        // Setup theme
        this.applyTheme(localStorage.getItem('selectedTheme') || 'dark');
        
        // Setup background color
        const savedBackgroundColor = localStorage.getItem('blockyBuilder_backgroundColor');
        if (savedBackgroundColor) {
            this.renderer.backgroundColor = savedBackgroundColor;
            // Update the select dropdown
            const backgroundColorSelect = document.getElementById('backgroundColorSelect');
            if (backgroundColorSelect) {
                backgroundColorSelect.value = savedBackgroundColor;
            }
        }
        
        // Load other settings
        const savedShowGrid = localStorage.getItem('blockyBuilder_showGrid');
        if (savedShowGrid !== null) {
            const showGridToggle = document.getElementById('showGridToggle');
            if (showGridToggle) {
                showGridToggle.checked = savedShowGrid === 'true';
                this.worldManager.showGrid = savedShowGrid === 'true';
            }
        }
        
        const savedShowMinimap = localStorage.getItem('blockyBuilder_showMinimap');
        if (savedShowMinimap !== null) {
            const minimapToggle = document.getElementById('minimapToggle');
            const minimapSection = document.getElementById('minimapSection');
            if (minimapToggle && minimapSection) {
                minimapToggle.checked = savedShowMinimap === 'true';
                minimapSection.style.display = savedShowMinimap === 'true' ? 'block' : 'none';
            }
        }
        
        // Setup resize handler
        this.renderer.resizeCanvas();
        
        // Update world name display
        this.updateWorldNameDisplay();
        
        // Initial render
        this.renderer.render();
    }

    setupRightTilePalette() {
        const tileTypes = {
            grass: { name: 'Grass', color: '#4CAF50', texture: 'assets/Ground_Texture_1.png' },
            water: { name: 'Water', color: '#2196F3', texture: 'assets/Water_Texture.png' },
            cave: { name: 'Cave', color: '#795548', texture: 'assets/Cave_Texture_1.png' },
            wall: { name: 'Wall', color: '#9E9E9E', texture: null } // No texture for wall, use color
        };

        const rightPalette = document.getElementById('rightTilePalette');
        
        if (rightPalette) {
            rightPalette.innerHTML = '';
            Object.entries(tileTypes).forEach(([type, data]) => {
                const item = document.createElement('div');
                item.className = 'tile-palette-item';
                item.setAttribute('data-tile-type', type);
                item.style.backgroundColor = data.color;
                item.title = data.name;
                item.onclick = () => this.selectTile(type);
                
                // Use texture image if available, otherwise show color
                if (data.texture) {
                    const img = document.createElement('img');
                    img.src = data.texture;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.onerror = () => {
                        // Fallback to color if texture fails to load
                        item.style.backgroundColor = data.color;
                        item.textContent = data.name.charAt(0);
                    };
                    item.appendChild(img);
                } else {
                    item.textContent = data.name.charAt(0);
                }
                
                if (type === this.worldManager.currentTileType) {
                    item.classList.add('selected');
                }
                
                rightPalette.appendChild(item);
            });
        }
    }

    selectTile(type) {
        this.worldManager.currentTileType = type;
        
        // Update right palette selection
        const rightPalette = document.getElementById('rightTilePalette');
        if (rightPalette) {
            const items = rightPalette.querySelectorAll('.tile-palette-item');
            items.forEach(item => {
                item.classList.remove('selected');
                if (item.getAttribute('data-tile-type') === type) {
                    item.classList.add('selected');
                }
            });
        }
        
        this.showToast(`Selected ${type} tile`, 'info');
    }

    updateWorldStats() {
        const stats = {
            grass: 0,
            water: 0,
            cave: 0,
            wall: 0
        };
        
        this.worldManager.tiles.forEach(tile => {
            if (stats[tile.type] !== undefined) {
                stats[tile.type]++;
            }
        });
        
        const totalTiles = this.worldManager.tiles.length;
        
        // Update stats display
        const elements = {
            grass: document.getElementById('grassCount'),
            water: document.getElementById('waterCount'),
            cave: document.getElementById('caveCount'),
            wall: document.getElementById('wallCount')
        };
        
        Object.entries(elements).forEach(([type, element]) => {
            if (element) {
                const count = stats[type];
                const percentage = totalTiles > 0 ? ((count / totalTiles) * 100).toFixed(1) : '0.0';
                element.textContent = `${this.getTileIcon(type)} ${this.getTileName(type)}: ${count} (${percentage}%)`;
            }
        });
    }

    getTileIcon(type) {
        const icons = {
            grass: '🌱',
            water: '💧',
            cave: '🪨',
            wall: '🧱'
        };
        return icons[type] || '❓';
    }

    getTileName(type) {
        const names = {
            grass: 'Grass',
            water: 'Water',
            cave: 'Cave',
            wall: 'Wall'
        };
        return names[type] || 'Unknown';
    }

    applyTheme(themeName) {
        // Remove existing theme classes
        document.body.classList.remove('theme-light', 'theme-retro', 'theme-forest');
        
        // Apply new theme
        if (themeName !== 'dark') {
            document.body.classList.add(`theme-${themeName}`);
        }
        
        // Update theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = themeName;
        }
        
        // Save theme preference
        localStorage.setItem('selectedTheme', themeName);
    }

    startRenderLoop() {
        const render = () => {
            this.renderer.render();
            requestAnimationFrame(render);
        };
        render();
    }

    loadSavedData() {
        // Load theme
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            this.applyTheme(savedTheme);
        }
        
        // Load world data if available
        const savedWorld = localStorage.getItem('blockyBuilderWorld');
        if (savedWorld) {
            try {
                const worldData = JSON.parse(savedWorld);
                this.worldManager.loadWorldData(worldData);
                this.updateWorldStats();
                this.showToast('World loaded from save', 'success');
            } catch (error) {
                console.warn('Failed to load saved world:', error);
            }
        }
    }

    saveWorld() {
        try {
            const worldData = this.worldManager.getWorldData();
            
            // Save to localStorage for immediate access
            localStorage.setItem('blockyBuilderWorld', JSON.stringify(worldData));
            
            // Also save to server for persistence
            const filename = this.worldManager.worldName || 'world';
            this.saveWorldToServer(worldData, filename);
            
            this.showToast('World saved successfully!', 'success');
        } catch (error) {
            this.showToast('Failed to save world: ' + error.message, 'error');
        }
    }

    async saveWorldToServer(worldData, filename) {
        try {
            const response = await fetch('/api/save-world', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    worldData: worldData,
                    filename: filename
                })
            });
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Failed to save to server');
            }
            
            console.log('World saved to server:', result.path);
        } catch (error) {
            console.warn('Failed to save world to server:', error);
            // Don't show error to user since localStorage save succeeded
        }
    }

    exportWorld() {
        try {
            const worldData = this.worldManager.getWorldData();
            const dataStr = JSON.stringify(worldData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = 'world.json';
            link.click();
            
            this.showToast('World exported successfully!', 'success');
        } catch (error) {
            this.showToast('Failed to export world: ' + error.message, 'error');
        }
    }

    updateWorldNameDisplay() {
        const worldNameElement = document.getElementById('worldNameDisplay');
        if (worldNameElement && this.worldManager) {
            const worldName = this.worldManager.worldName || 'Unnamed World';
            worldNameElement.textContent = worldName;
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');
        
        // Set icon and message based on type
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        
        icon.textContent = icons[type] || icons.info;
        messageEl.textContent = message;
        
        // Show toast
        toast.classList.add('show');
        
        // Auto hide
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
function selectTool(tool) {
    console.log('🔍 DEBUG: selectTool called with tool:', tool);
    console.log('🔍 DEBUG: Body classes:', document.body.classList.toString());
    console.log('🔍 DEBUG: Body has modal-open class:', document.body.classList.contains('modal-open'));
    
    // Don't allow tool selection when Project Setup modal is open
    const modal = document.getElementById('projectModal');
    console.log('🔍 DEBUG: Modal element:', modal);
    console.log('🔍 DEBUG: Modal display style:', modal ? modal.style.display : 'modal not found');
    
    // Temporarily disable modal check for debugging
    // if (modal && (modal.style.display === 'flex' || modal.style.display === 'block')) {
    //     console.log('🔍 DEBUG: Tool selection blocked - modal is open with display:', modal.style.display);
    //     return; // Block tool selection
    // }
    
    if (window.editor && window.editor.toolManager) {
        console.log('🔍 DEBUG: Calling toolManager.selectTool');
        window.editor.toolManager.selectTool(tool);
    } else {
        console.log('🔍 DEBUG: Editor or toolManager not available');
    }
}

function toggleLeftPanel() {
    if (window.editor && window.editor.eventSystem) {
        window.editor.eventSystem.toggleLeftPanel();
    }
}

function toggleRightPanel() {
    if (window.editor && window.editor.eventSystem) {
        window.editor.eventSystem.toggleRightPanel();
    }
}

function goHome() {
    window.location.href = '/';
}

function saveWorld() {
    if (window.editor) {
        window.editor.saveWorld();
    }
}

function importWorld() {
    // Directly open the file selection dialog for importing world files
    document.getElementById('worldFileInput').click();
}

function exportWorld() {
    if (window.editor) {
        window.editor.exportWorld();
    }
}

function openSettingsPanel() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeSettingsPanel() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function changeTheme() {
    const themeSelect = document.getElementById('themeSelect');
    const selectedTheme = themeSelect.value;
    
    if (window.editor) {
        window.editor.applyTheme(selectedTheme);
        window.editor.showToast(`Theme changed to ${selectedTheme}`, 'success');
    }
}

function changeBackgroundColor() {
    const backgroundColorSelect = document.getElementById('backgroundColorSelect');
    const selectedColor = backgroundColorSelect.value;
    
    if (window.editor && window.editor.renderer) {
        window.editor.renderer.backgroundColor = selectedColor;
        window.editor.renderer.render();
        window.editor.showToast(`Background color changed`, 'success');
        
        // Save to localStorage
        localStorage.setItem('blockyBuilder_backgroundColor', selectedColor);
    }
}

function changeTileSize() {
    const tileSizeSelect = document.getElementById('tileSizeSelect');
    const newSize = parseInt(tileSizeSelect.value);
    
    if (window.editor && window.editor.renderer) {
        window.editor.renderer.TILE_SIZE = newSize;
        window.editor.renderer.render();
        window.editor.showToast(`Tile size changed to ${newSize}px`, 'success');
    }
}

function resetSettings() {
    if (confirm('Reset all settings to defaults?')) {
        localStorage.removeItem('selectedTheme');
        localStorage.removeItem('blockyBuilder_backgroundColor');
        localStorage.removeItem('blockyBuilderWorld');
        
        if (window.editor) {
            window.editor.applyTheme('dark');
            window.editor.renderer.backgroundColor = '#0a0a0a';
            window.editor.renderer.render();
            
            // Reset UI elements
            const backgroundColorSelect = document.getElementById('backgroundColorSelect');
            if (backgroundColorSelect) {
                backgroundColorSelect.value = '#0a0a0a';
            }
            
            window.editor.showToast('Settings reset to defaults!', 'success');
        }
    }
}

function toggleBetaMode() {
    window.editor.showToast('BETA mode toggle coming soon!', 'info');
}

function toggleAutoSave() {
    window.editor.showToast('Auto-save toggle coming soon!', 'info');
}

function toggleGridSetting() {
    const showGridToggle = document.getElementById('showGridToggle');
    if (window.editor && window.editor.worldManager) {
        window.editor.worldManager.showGrid = showGridToggle.checked;
        window.editor.renderer.render();
        window.editor.showToast(`Grid ${showGridToggle.checked ? 'enabled' : 'disabled'}`, 'success');
        
        // Save to localStorage
        localStorage.setItem('blockyBuilder_showGrid', showGridToggle.checked);
    }
}

function toggleMinimap() {
    const minimapToggle = document.getElementById('minimapToggle');
    const minimapSection = document.getElementById('minimapSection');
    if (minimapSection) {
        minimapSection.style.display = minimapToggle.checked ? 'block' : 'none';
        window.editor.showToast(`Minimap ${minimapToggle.checked ? 'enabled' : 'disabled'}`, 'success');
        
        // Save to localStorage
        localStorage.setItem('blockyBuilder_showMinimap', minimapToggle.checked);
    }
}

function toggleTooltips() {
    window.editor.showToast('Tooltips toggle coming soon!', 'info');
}

function undo() {
    window.editor.showToast('Undo functionality coming soon!', 'info');
}

function redo() {
    window.editor.showToast('Redo functionality coming soon!', 'info');
}

function openStatisticsPanel() {
    window.editor.showToast('Statistics panel coming soon!', 'info');
}

function openNPCPanel() {
    window.editor.showToast('NPC panel coming soon!', 'info');
}

function addNewNPC() {
    window.editor.showToast('Add NPC functionality coming soon!', 'info');
}

function undo() {
    window.editor.showToast('Undo functionality coming soon!', 'info');
}

function redo() {
    window.editor.showToast('Redo functionality coming soon!', 'info');
}

// Enhanced Project Panel Functions
function showProjectPanel() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Add modal-open class to body to disable background elements
        document.body.classList.add('modal-open');
        
        loadWorldList();
        updateWorldPreview();
        setupSizeInputListeners();
        
        // Focus management - prevent tab navigation behind modal
        setTimeout(() => {
            // Disable all focusable elements outside the modal
            const allFocusableElements = document.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
            const modalFocusableElements = modal.querySelectorAll('input, button, [tabindex="0"]');
            
            // Store original tabindex values and pointer-events
            const originalTabIndexes = new Map();
            const originalPointerEvents = new Map();
            
            allFocusableElements.forEach(element => {
                if (!modal.contains(element)) {
                    originalTabIndexes.set(element, element.getAttribute('tabindex'));
                    element.setAttribute('tabindex', '-1');
                    // Also disable click events
                    originalPointerEvents.set(element, element.style.pointerEvents);
                    element.style.pointerEvents = 'none';
                }
            });
            
            // Also disable pointer events on canvas specifically
            const canvas = document.getElementById('worldCanvas');
            if (canvas) {
                originalPointerEvents.set(canvas, canvas.style.pointerEvents);
                canvas.style.pointerEvents = 'none';
            }
            
            // Store the maps for later restoration
            modal.originalTabIndexes = originalTabIndexes;
            modal.originalPointerEvents = originalPointerEvents;
            
            modal.focus();
            
            // Trap focus within modal using a more robust approach
            const firstElement = modalFocusableElements[0];
            const lastElement = modalFocusableElements[modalFocusableElements.length - 1];
            
            // Remove any existing event listeners
            modal.removeEventListener('keydown', handleModalKeydown);
            
            // Add new event listener
            modal.addEventListener('keydown', handleModalKeydown);
            
            function handleModalKeydown(e) {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    
                    if (e.shiftKey) {
                        // Shift+Tab - go backwards
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                        } else {
                            // Find previous element
                            const currentIndex = Array.from(modalFocusableElements).indexOf(document.activeElement);
                            if (currentIndex > 0) {
                                modalFocusableElements[currentIndex - 1].focus();
                            }
                        }
                    } else {
                        // Tab - go forwards
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                        } else {
                            // Find next element
                            const currentIndex = Array.from(modalFocusableElements).indexOf(document.activeElement);
                            if (currentIndex < modalFocusableElements.length - 1) {
                                modalFocusableElements[currentIndex + 1].focus();
                            }
                        }
                    }
                } else if (e.key === 'Escape') {
                    // Prevent Escape key from closing the mandatory setup modal
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
            
            // Focus the first element
            if (firstElement) {
                firstElement.focus();
            }
        }, 100);
    }
}

function setWorldSize(width, height) {
    document.getElementById('worldWidth').value = width;
    document.getElementById('worldHeight').value = height;
    updateWorldPreview();
    
    // Update preset button states
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the matching preset button
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        if (btn.textContent.includes(`${width}×${height}`)) {
            btn.classList.add('active');
        }
    });
}

function updateWorldPreview() {
    const width = parseInt(document.getElementById('worldWidth').value) || 125;
    const height = parseInt(document.getElementById('worldHeight').value) || 125;
    const totalTiles = width * height;
    
    document.getElementById('previewSize').textContent = `${width} × ${height} tiles`;
    document.getElementById('previewTiles').textContent = `${totalTiles.toLocaleString()} total tiles`;
}

function setupSizeInputListeners() {
    const widthInput = document.getElementById('worldWidth');
    const heightInput = document.getElementById('worldHeight');
    
    if (widthInput && heightInput) {
        widthInput.addEventListener('input', updateWorldPreview);
        heightInput.addEventListener('input', updateWorldPreview);
        
        // Clear preset selection when manually editing
        widthInput.addEventListener('input', () => {
            document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        });
        heightInput.addEventListener('input', () => {
            document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        });
    }
}

function closeProjectPanel() {
    console.log('🔍 DEBUG: closeProjectPanel called');
    const modal = document.getElementById('projectModal');
    if (modal) {
        // Restore original tabindex values
        if (modal.originalTabIndexes) {
            modal.originalTabIndexes.forEach((originalTabIndex, element) => {
                if (originalTabIndex === null) {
                    element.removeAttribute('tabindex');
                } else {
                    element.setAttribute('tabindex', originalTabIndex);
                }
            });
        }
        
        // Restore original pointer events
        if (modal.originalPointerEvents) {
            modal.originalPointerEvents.forEach((originalPointerEvents, element) => {
                element.style.pointerEvents = originalPointerEvents;
            });
        }
        
        modal.style.display = 'none';
        
        // Remove modal-open class from body to re-enable background elements
        document.body.classList.remove('modal-open');
        console.log('🔍 DEBUG: Modal closed, modal-open class removed');
        console.log('🔍 DEBUG: Body classes after modal close:', document.body.classList.toString());
        console.log('🔍 DEBUG: Canvas pointer-events restored');
    }
}

function createNewWorld() {
    const width = parseInt(document.getElementById('worldWidth').value);
    const height = parseInt(document.getElementById('worldHeight').value);
    const name = document.getElementById('worldName').value || 'New World';
    
    if (width < 10 || width > 500 || height < 10 || height > 500) {
        window.editor.showToast('World dimensions must be between 10 and 500 tiles!', 'error');
        return;
    }
    
    // Create new world with specified dimensions
    window.editor.worldManager.createWorld(width, height);
    window.editor.worldManager.worldName = name;
    
    // Reset viewport and center on world
    window.editor.worldManager.viewX = 0;
    window.editor.worldManager.viewY = 0;
    window.editor.worldManager.zoom = 0.3;
    
    // Center the viewport on the world
    window.editor.renderer.centerOnWorld();
    window.editor.updateWorldStats();
    window.editor.updateWorldNameDisplay();
    
    // Update zoom display manually
    const zoomLevelElement = document.getElementById('zoomLevel');
    if (zoomLevelElement) {
        zoomLevelElement.textContent = Math.round(window.editor.worldManager.zoom * 100) + '%';
    }
    
    // Save the new world to both localStorage and server
    window.editor.saveWorld();
    
    closeProjectPanel();
    window.editor.showToast(`Created new world "${name}" (${width}x${height})`, 'success');
}

function showLoadWorld() {
    showProjectPanel();
}

function loadWorldList() {
    const worldList = document.getElementById('worldList');
    if (!worldList) return;
    
    worldList.innerHTML = '<div class="loading">Loading worlds...</div>';
    
    // Fetch worlds from server
    fetch('/api/worlds')
        .then(response => response.json())
        .then(response => {
            // Handle server response format
            const worlds = response.worlds || response || [];
            
            if (!Array.isArray(worlds)) {
                console.error('Invalid worlds response:', response);
                worldList.innerHTML = '<div class="loading">Error loading worlds</div>';
                return;
            }
            
            worldList.innerHTML = '';
            
            // Check for cached world first
            const cachedWorld = localStorage.getItem('blockyBuilderWorld');
            if (cachedWorld) {
                try {
                    const worldData = JSON.parse(cachedWorld);
                    const cachedButton = document.createElement('button');
                    cachedButton.className = 'world-load-btn cached-world';
                    cachedButton.onclick = () => loadCachedWorld();
                    
                    const buttonContent = document.createElement('div');
                    buttonContent.className = 'world-btn-content';
                    
                    const name = document.createElement('div');
                    name.className = 'world-btn-name';
                    name.textContent = `${worldData.worldName || 'Cached World'} (Local)`;
                    
                    const details = document.createElement('div');
                    details.className = 'world-btn-details';
                    details.textContent = `Last edited: Recently • ${worldData.worldWidth || 'Unknown'}x${worldData.worldHeight || 'Unknown'} tiles`;
                    
                    buttonContent.appendChild(name);
                    buttonContent.appendChild(details);
                    cachedButton.appendChild(buttonContent);
                    worldList.appendChild(cachedButton);
                } catch (e) {
                    console.warn('Failed to parse cached world:', e);
                }
            }
            
            if (worlds.length === 0) {
                if (!cachedWorld) {
                    worldList.innerHTML = '<div class="loading">No saved worlds found</div>';
                }
                return;
            }
            
            worlds.forEach(world => {
                const button = document.createElement('button');
                button.className = 'world-load-btn';
                button.onclick = () => loadWorldFromServer(world.name);
                
                const buttonContent = document.createElement('div');
                buttonContent.className = 'world-btn-content';
                
                const name = document.createElement('div');
                name.className = 'world-btn-name';
                name.textContent = world.name;
                
                const details = document.createElement('div');
                details.className = 'world-btn-details';
                const modifiedDate = new Date(world.modified || world.lastModified).toLocaleDateString();
                details.textContent = `Modified: ${modifiedDate}`;
                
                buttonContent.appendChild(name);
                buttonContent.appendChild(details);
                button.appendChild(buttonContent);
                worldList.appendChild(button);
            });
        })
        .catch(error => {
            console.error('Error loading worlds:', error);
            // Check if there's a locally cached world as fallback
            const cachedWorld = localStorage.getItem('blockyBuilderWorld');
            if (cachedWorld) {
                try {
                    const worldData = JSON.parse(cachedWorld);
                    worldList.innerHTML = `
                        <button class="world-load-btn cached-world" onclick="loadCachedWorld()">
                            <div class="world-btn-content">
                                <div class="world-btn-name">Cached World (Local)</div>
                                <div class="world-btn-details">Last edited: Recently</div>
                            </div>
                        </button>
                    `;
                } catch (e) {
                    worldList.innerHTML = '<div class="loading">Error loading worlds</div>';
                }
            } else {
                worldList.innerHTML = '<div class="loading">Error loading worlds</div>';
            }
        });
}

function loadWorldFromServer(worldName) {
    fetch(`/api/load-world/${worldName}`)
        .then(response => response.json())
        .then(response => {
            // Handle server response format
            const worldData = response.data || response;
            
            if (!worldData) {
                throw new Error('No world data received');
            }
            
            // Load world data
            window.editor.worldManager.loadWorldData(worldData);
            
            // Set the world name from the loaded data or use the filename as fallback
            window.editor.worldManager.worldName = worldData.worldName || worldName;
            
            // Cache the loaded world locally for future access
            localStorage.setItem('blockyBuilderWorld', JSON.stringify(worldData));
            
            // Reset viewport and center on world
            window.editor.worldManager.viewX = 0;
            window.editor.worldManager.viewY = 0;
            window.editor.worldManager.zoom = 0.3;
            
            // Center the viewport on the world
            window.editor.renderer.centerOnWorld();
            window.editor.updateWorldStats();
            window.editor.updateWorldNameDisplay();
            
            // Update zoom display manually
            const zoomLevelElement = document.getElementById('zoomLevel');
            if (zoomLevelElement) {
                zoomLevelElement.textContent = Math.round(window.editor.worldManager.zoom * 100) + '%';
            }
            
            closeProjectPanel();
            window.editor.showToast(`Loaded world "${worldName}" from server`, 'success');
        })
        .catch(error => {
            console.error('Error loading world from server:', error);
            window.editor.showToast(`Error loading world "${worldName}" from server`, 'error');
        });
}

function loadCachedWorld() {
    try {
        const cachedWorld = localStorage.getItem('blockyBuilderWorld');
        if (!cachedWorld) {
            window.editor.showToast('No cached world found', 'error');
            return;
        }
        
        const worldData = JSON.parse(cachedWorld);
        
        // Load world data
        window.editor.worldManager.loadWorldData(worldData);
        
        // Set the world name from the loaded data
        window.editor.worldManager.worldName = worldData.worldName || 'Cached World';
        
        // Reset viewport and center on world
        window.editor.worldManager.viewX = 0;
        window.editor.worldManager.viewY = 0;
        window.editor.worldManager.zoom = 0.3;
        
        // Center the viewport on the world
        window.editor.renderer.centerOnWorld();
        window.editor.updateWorldStats();
        window.editor.updateWorldNameDisplay();
        
        // Update zoom display manually
        const zoomLevelElement = document.getElementById('zoomLevel');
        if (zoomLevelElement) {
            zoomLevelElement.textContent = Math.round(window.editor.worldManager.zoom * 100) + '%';
        }
        
        closeProjectPanel();
        window.editor.showToast('Loaded cached world', 'success');
    } catch (error) {
        console.error('Error loading cached world:', error);
        window.editor.showToast('Error loading cached world', 'error');
    }
}

// Legacy function for backwards compatibility
function loadWorld(worldName) {
    loadWorldFromServer(worldName);
}

function refreshWorldList() {
    loadWorldList();
}

function loadWorldFromFile(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const worldData = JSON.parse(e.target.result);
            
            // Load world data
            window.editor.worldManager.loadWorldData(worldData);
            
            // Set the world name from the loaded data or use filename as fallback
            window.editor.worldManager.worldName = worldData.worldName || file.name.replace('.json', '');
            
            // Reset viewport to world origin (centering handled in renderer)
            window.editor.worldManager.viewX = 0;
            window.editor.worldManager.viewY = 0;
            window.editor.worldManager.zoom = 0.3;
            
            // Update UI
            window.editor.renderer.render();
            window.editor.updateWorldStats();
            window.editor.updateWorldNameDisplay();
            
            // Update zoom display manually
            const zoomLevelElement = document.getElementById('zoomLevel');
            if (zoomLevelElement) {
                zoomLevelElement.textContent = Math.round(window.editor.worldManager.zoom * 100) + '%';
            }
            
            closeProjectPanel();
            window.editor.showToast(`Loaded world from file: ${file.name}`, 'success');
        } catch (error) {
            console.error('Error loading world file:', error);
            window.editor.showToast('Error loading world file: Invalid format', 'error');
        }
    };
    reader.readAsText(file);
}

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 DEBUG: DOM loaded, initializing editor...');
    window.editor = new BlockyBuilderEditor();
    
    // Show project setup modal immediately for better UX
    setTimeout(() => {
        console.log('🔍 DEBUG: Showing project panel...');
        showProjectPanel();
    }, 100); // Reduced delay for more immediate feel
});
