// Main Editor Application
class BlockyBuilderEditor {
    constructor() {
        this.worldManager = null;
        this.renderer = null;
        this.eventSystem = null;
        this.toolManager = null;
        this.canvas = null;
        this.npcBuilder = null;
        
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
            
            // Initialize NPC Builder
            this.initializeNPCBuilder();
            
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
        
        // Setup tile creation event listeners
        document.getElementById('add-tile-btn').addEventListener('click', () => this.openAddTileModal());
        document.getElementById('closeTileModal').addEventListener('click', () => this.closeAddTileModal());
        document.getElementById('addTileForm').addEventListener('submit', (e) => this.handleSaveTile(e));
        
        // Setup tile preview updates
        document.getElementById('tileColor').addEventListener('input', () => this.updateTilePreview());
        document.getElementById('tileTexture').addEventListener('change', () => this.updateTilePreview());
        
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
        const showGridToggle = document.getElementById('showGridToggle');
        if (showGridToggle) {
            // Use saved value if available, otherwise keep current value (don't override)
            if (savedShowGrid !== null) {
                const showGridValue = savedShowGrid === 'true';
                showGridToggle.checked = showGridValue;
                this.worldManager.showGrid = showGridValue;
            } else {
                // No saved preference - sync checkbox with current worldManager value
                showGridToggle.checked = this.worldManager.showGrid;
            }
        }
        
        // Load grid color setting
        const savedGridColor = localStorage.getItem('blockyBuilder_gridColor');
        if (savedGridColor) {
            this.worldManager.gridColor = savedGridColor;
            this.updateGridColorButton();
        }
        
        const savedShowMinimap = localStorage.getItem('blockyBuilder_showMinimap');
        const minimapToggle = document.getElementById('minimapToggle');
        const minimapSection = document.getElementById('minimapSection');
        if (minimapToggle && minimapSection) {
            if (savedShowMinimap !== null) {
                // Load saved preference
                const showMinimapValue = savedShowMinimap === 'true';
                minimapToggle.checked = showMinimapValue;
                minimapSection.style.display = showMinimapValue ? 'block' : 'none';
            } else {
                // No saved preference - use default (minimap visible by default)
                minimapToggle.checked = true;
                minimapSection.style.display = 'block';
            }
        }
        
        // Load beta mode setting
        const savedBetaMode = localStorage.getItem('blockyBuilder_betaMode');
        const betaModeToggle = document.getElementById('betaModeToggle');
        if (betaModeToggle) {
            if (savedBetaMode !== null) {
                const betaModeValue = savedBetaMode === 'true';
                betaModeToggle.checked = betaModeValue;
                this.worldManager.betaMode = betaModeValue;
            } else {
                // No saved preference - use default (beta mode off)
                betaModeToggle.checked = false;
                this.worldManager.betaMode = false;
            }
            
            // Show/hide beta sections based on loaded setting
            const betaToolsSection = document.getElementById('betaToolsSection');
            const betaSettingsSection = document.getElementById('betaSettingsSection');
            const shouldShow = this.worldManager.betaMode;
            
            if (betaToolsSection) betaToolsSection.style.display = shouldShow ? 'block' : 'none';
            if (betaSettingsSection) betaSettingsSection.style.display = shouldShow ? 'block' : 'none';
        }
        
        // Load tooltips setting
        const savedShowTooltips = localStorage.getItem('blockyBuilder_showTooltips');
        const tooltipsToggle = document.getElementById('tooltipsToggle');
        if (tooltipsToggle) {
            if (savedShowTooltips !== null) {
                const showTooltipsValue = savedShowTooltips === 'true';
                tooltipsToggle.checked = showTooltipsValue;
                this.worldManager.showTooltips = showTooltipsValue;
            } else {
                // No saved preference - use default (tooltips on)
                tooltipsToggle.checked = true;
                this.worldManager.showTooltips = true;
            }
        }
        
        // Setup resize handler
        this.renderer.resizeCanvas();
        
        // Update world name display
        this.updateWorldNameDisplay();
        
        // Initial render
        this.renderer.render();
        
        // Enable tooltips if setting is on
        if (this.worldManager.showTooltips) {
            this.enableTooltips();
        }
    }

    async setupRightTilePalette() {
        const defaultTileTypes = {
            grass: { name: 'Grass', color: '#4CAF50', texture: '../assets/Ground_Texture_1.png' },
            water: { name: 'Water', color: '#2196F3', texture: '../assets/Water_Texture.png' },
            cave: { name: 'Cave', color: '#795548', texture: '../assets/Cave_Texture_1.png' },
            wall: { name: 'Wall', color: '#9E9E9E', texture: null } // No texture for wall, use color
        };

        let customTileTypes = {};
        try {
            const response = await fetch('../tiles.json');
            if (response.ok) {
                customTileTypes = await response.json();
            }
        } catch (error) {
            console.warn('Could not load custom tiles.json:', error);
        }

        const tileTypes = { ...defaultTileTypes, ...customTileTypes };

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

    updateGridColorButton() {
        const button = document.getElementById('gridColorButton');
        if (button) {
            const colorIcons = {
                'white': '⚪',
                'black': '⚫',
                'green': '🟢',
                'brown': '🟤',
                'yellow': '🟡'
            };
            const colorNames = {
                'white': 'White',
                'black': 'Black',
                'green': 'Green',
                'brown': 'Brown',
                'yellow': 'Yellow'
            };
            
            button.textContent = `${colorIcons[this.worldManager.gridColor]} ${colorNames[this.worldManager.gridColor]}`;
        }
    }

    enableTooltips() {
        // Add tooltips to various UI elements
        const tooltips = [
            { selector: '#showGridToggle', text: 'Toggle grid lines on/off' },
            { selector: '#gridColorButton', text: 'Click to cycle through grid colors' },
            { selector: '#minimapToggle', text: 'Show/hide the minimap' },
            { selector: '#betaModeToggle', text: 'Enable experimental BETA features' },
            { selector: '#tooltipsToggle', text: 'Show/hide tooltips on hover' },
            { selector: '.tile-option', text: 'Click to select this tile type' },
            { selector: '.tool-btn', text: 'Click to select this tool' }
        ];

        tooltips.forEach(tooltip => {
            const elements = document.querySelectorAll(tooltip.selector);
            elements.forEach(element => {
                element.setAttribute('title', tooltip.text);
            });
        });
    }

    disableTooltips() {
        // Remove tooltips from UI elements
        const selectors = ['#showGridToggle', '#gridColorButton', '#minimapToggle', '#betaModeToggle', '#tooltipsToggle', '.tile-option', '.tool-btn'];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.removeAttribute('title');
            });
        });
    }

    showDebugInfo() {
        // Add debug info display
        let debugInfo = document.getElementById('debugInfo');
        if (!debugInfo) {
            debugInfo = document.createElement('div');
            debugInfo.id = 'debugInfo';
            debugInfo.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #00ff00;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                z-index: 1000;
                border: 1px solid #00ff00;
            `;
            document.body.appendChild(debugInfo);
        }
        
        // Update debug info periodically
        this.debugInterval = setInterval(() => {
            if (debugInfo && this.worldManager) {
                debugInfo.innerHTML = `
                    <div>FPS: ${Math.round(1000 / (Date.now() - (this.lastFrameTime || Date.now())))}</div>
                    <div>Tiles: ${this.worldManager.tiles.length}</div>
                    <div>Zoom: ${this.worldManager.zoom.toFixed(2)}</div>
                    <div>View: (${this.worldManager.viewX.toFixed(0)}, ${this.worldManager.viewY.toFixed(0)})</div>
                    <div>Grid: ${this.worldManager.showGrid ? 'ON' : 'OFF'}</div>
                    <div>Beta: ${this.worldManager.betaMode ? 'ON' : 'OFF'}</div>
                `;
                this.lastFrameTime = Date.now();
            }
        }, 100);
    }

    hideDebugInfo() {
        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo) {
            debugInfo.remove();
        }
        if (this.debugInterval) {
            clearInterval(this.debugInterval);
            this.debugInterval = null;
        }
    }

    enablePerformanceMode() {
        // Enable performance optimizations
        if (this.renderer) {
            this.renderer.enablePerformanceMode();
        }
        this.showToast('Performance optimizations enabled', 'info');
    }

    disablePerformanceMode() {
        // Disable performance optimizations
        if (this.renderer) {
            this.renderer.disablePerformanceMode();
        }
        this.showToast('Performance optimizations disabled', 'info');
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
                
                // Load NPCs into NPCBuilder if available
                if (this.npcBuilder && worldData.npcs) {
                    console.log(`🎯 Loading ${worldData.npcs.length} NPCs into NPCBuilder:`, worldData.npcs.map(npc => `${npc.name} (${npc.id})`));
                    this.npcBuilder.loadSaveData(worldData);
                    console.log(`✅ Loaded ${worldData.npcs.length} NPCs from saved world`);
                } else if (this.npcBuilder) {
                    console.log('ℹ️ No NPCs found in world data to load');
                }
                
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
            console.log('Server save not available (GitHub Pages mode) - using localStorage only');
            // Don't show error to user since localStorage save succeeded
        }
    }

    exportWorld() {
        try {
            const worldData = this.worldManager.getWorldData();
            
            // Add NPCs to world data
            if (this.npcBuilder && this.npcBuilder.npcs && this.npcBuilder.npcs.length > 0) {
                worldData.npcs = this.npcBuilder.npcs.map(npc => {
                    const exportedNPC = {
                        id: npc.id,
                        name: npc.name,
                        type: npc.type,
                        x: npc.x,
                        y: npc.y,
                        dialogue: npc.dialogue,
                        behavior: npc.behavior,
                        wanderRadius: npc.wanderRadius,
                        patrolPoints: npc.patrolPoints,
                        color: npc.color,
                        interactable: true,
                        // Add combat properties if they exist
                        health: npc.health,
                        maxHealth: npc.maxHealth,
                        detectionRadius: npc.detectionRadius,
                        attackDamage: npc.attackDamage,
                        attackCooldown: npc.attackCooldown
                    };
                    
                    // Add custom image fields if NPC is custom
                    if (npc.isCustom || npc.type === 'custom') {
                        exportedNPC.isCustom = true;
                        exportedNPC.customImage = npc.customImage || `assets/npc/persistent/${npc.name}.png`;
                        exportedNPC.width = npc.width || 32;
                        exportedNPC.height = npc.height || 32;
                        console.log(`🎨 Exporting custom NPC: ${npc.name} with image: ${exportedNPC.customImage}`);
                    }
                    
                    return exportedNPC;
                });
                console.log(`✅ Exported ${worldData.npcs.length} NPCs with world data`);
            } else {
                console.log('ℹ️ No NPCs to export');
            }
            
            // Add spawn points to world data
            if (this.worldManager.spawnPoints && this.worldManager.spawnPoints.length > 0) {
                worldData.spawnPoints = this.worldManager.exportSpawnPoints();
                console.log(`✅ Exported ${worldData.spawnPoints.spawnCount} spawn points with world data`);
            } else {
                console.log('ℹ️ No spawn points to export');
            }
            
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

    // Global function for file input onchange
    loadWorldFromFile(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const worldData = JSON.parse(e.target.result);
                console.log('📁 Loading world from file:', file.name);
                
                // Load world data into WorldManager
                this.worldManager.loadWorldData(worldData);
                
                // Load NPCs into NPCBuilder if available
                if (this.npcBuilder && worldData.npcs) {
                    console.log(`🎯 Loading ${worldData.npcs.length} NPCs from imported world:`, worldData.npcs.map(npc => `${npc.name} (${npc.id})`));
                    this.npcBuilder.loadSaveData(worldData);
                    console.log(`✅ Loaded ${worldData.npcs.length} NPCs from imported world`);
                } else if (this.npcBuilder) {
                    console.log('ℹ️ No NPCs found in imported world data');
                }
                
                this.updateWorldStats();
                this.showToast(`World "${file.name}" imported successfully!`, 'success');
                
                // Clear the file input so the same file can be imported again
                input.value = '';
                
            } catch (error) {
                console.error('❌ Failed to import world:', error);
                this.showToast('Failed to import world: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    initializeNPCBuilder() {
        try {
            // Check if NPCBuilder class is available
            if (typeof NPCBuilder === 'undefined') {
                console.warn('⚠️ NPCBuilder class not found - NPC system disabled');
                return;
            }
            
            // Inject NPC Builder styles
            if (typeof injectNPCBuilderStyles === 'function') {
                injectNPCBuilderStyles();
            }
            
            // Create NPCBuilder instance
            this.npcBuilder = new NPCBuilder(this.canvas, this.worldManager);
            
            console.log('✅ NPCBuilder initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize NPCBuilder:', error);
            this.npcBuilder = null;
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

    // Tile creation methods
    openAddTileModal() {
        document.getElementById('addTileModal').style.display = 'flex';
    }

    closeAddTileModal() {
        document.getElementById('addTileModal').style.display = 'none';
        // Reset form
        document.getElementById('addTileForm').reset();
        // Reset preview
        this.resetTilePreview();
    }

    updateTilePreview() {
        const preview = document.getElementById('tilePreview');
        const colorInput = document.getElementById('tileColor');
        const textureInput = document.getElementById('tileTexture');
        
        if (!preview) return;
        
        // Clear existing content
        preview.innerHTML = '';
        
        // Check if a texture file is selected
        if (textureInput.files && textureInput.files[0]) {
            const file = textureInput.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                preview.appendChild(img);
            };
            
            reader.readAsDataURL(file);
        } else {
            // Show fallback color
            preview.style.backgroundColor = colorInput.value;
            const colorText = document.createElement('div');
            colorText.textContent = colorInput.value;
            colorText.style.color = this.getContrastColor(colorInput.value);
            colorText.style.fontSize = '10px';
            colorText.style.fontWeight = 'bold';
            colorText.style.textAlign = 'center';
            preview.appendChild(colorText);
        }
    }

    resetTilePreview() {
        const preview = document.getElementById('tilePreview');
        if (preview) {
            preview.innerHTML = '<div class="tile-preview-placeholder">Select a texture to see preview</div>';
            preview.style.backgroundColor = '';
        }
    }

    getContrastColor(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return black or white based on luminance
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    async handleSaveTile(e) {
        e.preventDefault();
        const tileName = document.getElementById('tileName').value;
        const tileColor = document.getElementById('tileColor').value;
        const tileTextureFile = document.getElementById('tileTexture').files[0];

        if (!tileName || !tileColor || !tileTextureFile) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        try {
            // 1. Upload the texture file
            const formData = new FormData();
            formData.append('texture', tileTextureFile);

            const uploadResponse = await fetch('/api/upload-tile-texture', {
                method: 'POST',
                body: formData,
            });
            const uploadResult = await uploadResponse.json();

            if (!uploadResult.success) {
                this.showToast('Error uploading texture: ' + uploadResult.message, 'error');
                return;
            }

            // 2. Save the tile metadata
            const tileData = {
                name: tileName,
                color: tileColor,
                texture: uploadResult.path,
            };
            
            const tileId = tileName.toLowerCase().replace(/\s+/g, '_');

            const saveResponse = await fetch('/api/add-tile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tileId, data: tileData }),
            });
            const saveResult = await saveResponse.json();

            if (saveResult.success) {
                this.showToast('Tile saved successfully!', 'success');
                this.closeAddTileModal();
                this.setupRightTilePalette(); // Refresh the palette
            } else {
                this.showToast('Error saving tile: ' + saveResult.message, 'error');
            }
        } catch (error) {
            console.error('Error saving tile:', error);
            this.showToast('Error saving tile: ' + error.message, 'error');
        }
    }
}

// Global functions for HTML onclick handlers
function selectTool(tool) {
    // Don't allow tool selection when Project Setup modal is open
    const modal = document.getElementById('projectModal');
    if (modal && (modal.style.display === 'flex' || modal.style.display === 'block')) {
        return; // Block tool selection
    }
    
    if (window.editor && window.editor.toolManager) {
        window.editor.toolManager.selectTool(tool);
    } else {
        console.warn('ToolManager not available');
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
    const betaModeToggle = document.getElementById('betaModeToggle');
    if (window.editor && window.editor.worldManager) {
        window.editor.worldManager.betaMode = betaModeToggle.checked;
        window.editor.showToast(`BETA mode ${betaModeToggle.checked ? 'enabled' : 'disabled'}`, 'success');
        
        // Save to localStorage
        localStorage.setItem('blockyBuilder_betaMode', betaModeToggle.checked);
        
        // Show/hide beta sections
        const betaToolsSection = document.getElementById('betaToolsSection');
        const betaSettingsSection = document.getElementById('betaSettingsSection');
        
        if (betaModeToggle.checked) {
            // Enable beta features
            if (betaToolsSection) betaToolsSection.style.display = 'block';
            if (betaSettingsSection) betaSettingsSection.style.display = 'block';
            window.editor.showToast('BETA features: Advanced tools, experimental rendering, debug info', 'info');
        } else {
            // Disable beta features
            if (betaToolsSection) betaToolsSection.style.display = 'none';
            if (betaSettingsSection) betaSettingsSection.style.display = 'none';
            window.editor.showToast('BETA features disabled', 'info');
        }
    }
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
    const tooltipsToggle = document.getElementById('tooltipsToggle');
    if (window.editor && window.editor.worldManager) {
        window.editor.worldManager.showTooltips = tooltipsToggle.checked;
        window.editor.showToast(`Tooltips ${tooltipsToggle.checked ? 'enabled' : 'disabled'}`, 'success');
        
        // Save to localStorage
        localStorage.setItem('blockyBuilder_showTooltips', tooltipsToggle.checked);
        
        // Apply tooltips changes
        if (tooltipsToggle.checked) {
            // Enable tooltips on UI elements
            window.editor.enableTooltips();
        } else {
            // Disable tooltips
            window.editor.disableTooltips();
        }
    }
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

function toggleStatisticsPanel() {
    const statisticsSection = document.getElementById('statisticsSection');
    const checkbox = document.getElementById('statisticsPanelToggle');
    if (statisticsSection && checkbox) {
        statisticsSection.style.display = checkbox.checked ? 'block' : 'none';
        window.editor.showToast(`Statistics panel ${checkbox.checked ? 'shown' : 'hidden'}`, 'success');
    }
}

function toggleShortcutsPanel() {
    const shortcutsSection = document.getElementById('shortcutsSection');
    const checkbox = document.getElementById('shortcutsPanelToggle');
    if (shortcutsSection && checkbox) {
        shortcutsSection.style.display = checkbox.checked ? 'block' : 'none';
        window.editor.showToast(`Shortcuts panel ${checkbox.checked ? 'shown' : 'hidden'}`, 'success');
    }
}

function openNPCPanel() {
    if (window.editor.npcBuilder) {
        window.editor.npcBuilder.togglePanel();
    } else {
        window.editor.showToast('NPC Builder not initialized', 'error');
    }
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
    
    // Clear all NPCs when creating a new world
    if (window.editor.npcBuilder) {
        window.editor.npcBuilder.clearAllNPCs();
    }
    
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
    
    // Try server first, fallback to localStorage
    fetch('/api/worlds')
        .then(response => {
            if (!response.ok) {
                throw new Error('Server not available');
            }
            return response.json();
        })
        .then(response => {
            // Handle server response format
            const worlds = response.worlds || response || [];
            
            if (!Array.isArray(worlds)) {
                console.error('Invalid worlds response:', response);
                throw new Error('Invalid server response');
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
            console.log('Server not available (GitHub Pages mode) - showing cached world only');
            
            // Fallback to localStorage only
            worldList.innerHTML = '';
            
            // Check for cached world
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
                    worldList.appendChild(buttonContent);
                } catch (e) {
                    worldList.innerHTML = '<div class="loading">No saved worlds found</div>';
                }
            } else {
                worldList.innerHTML = '<div class="loading">No saved worlds found</div>';
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
            
            // Load NPCs into NPCBuilder if available
            if (window.editor.npcBuilder && worldData.npcs) {
                console.log(`🎯 Loading ${worldData.npcs.length} NPCs from server world:`, worldData.npcs.map(npc => `${npc.name} (${npc.id})`));
                window.editor.npcBuilder.loadSaveData(worldData);
                console.log(`✅ Loaded ${worldData.npcs.length} NPCs from server world`);
            } else if (window.editor.npcBuilder) {
                console.log('ℹ️ No NPCs found in server world data');
            } else {
                console.warn('⚠️ NPCBuilder not initialized, cannot load NPCs');
            }
            
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
        
        // Load NPCs into NPCBuilder if available
        if (window.editor.npcBuilder && worldData.npcs) {
            console.log(`🎯 Loading ${worldData.npcs.length} NPCs from cached world:`, worldData.npcs.map(npc => `${npc.name} (${npc.id})`));
            window.editor.npcBuilder.loadSaveData(worldData);
            console.log(`✅ Loaded ${worldData.npcs.length} NPCs from cached world`);
        } else if (window.editor.npcBuilder) {
            console.log('ℹ️ No NPCs found in cached world data');
        } else {
            console.warn('⚠️ NPCBuilder not initialized, cannot load NPCs');
        }
        
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
            
            // Load NPCs into NPCBuilder if available
            if (window.editor.npcBuilder && worldData.npcs) {
                console.log(`🎯 Loading ${worldData.npcs.length} NPCs from imported world:`, worldData.npcs.map(npc => `${npc.name} (${npc.id})`));
                window.editor.npcBuilder.loadSaveData(worldData);
                console.log(`✅ Loaded ${worldData.npcs.length} NPCs from imported world`);
            } else if (window.editor.npcBuilder) {
                console.log('ℹ️ No NPCs found in imported world data');
            } else {
                console.warn('⚠️ NPCBuilder not initialized, cannot load NPCs');
            }
            
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

function toggleExperimentalRendering() {
    const toggle = document.getElementById('experimentalRenderingToggle');
    if (window.editor) {
        window.editor.showToast(`Experimental Rendering ${toggle.checked ? 'enabled' : 'disabled'}`, 'success');
        localStorage.setItem('blockyBuilder_experimentalRendering', toggle.checked);
        
        if (toggle.checked) {
            // Enable experimental rendering features
            window.editor.renderer.enableExperimentalRendering();
        } else {
            // Disable experimental rendering features
            window.editor.renderer.disableExperimentalRendering();
        }
    }
}

function toggleDebugInfo() {
    const toggle = document.getElementById('debugInfoToggle');
    if (window.editor) {
        window.editor.showToast(`Debug Info ${toggle.checked ? 'enabled' : 'disabled'}`, 'success');
        localStorage.setItem('blockyBuilder_debugInfo', toggle.checked);
        
        if (toggle.checked) {
            // Show debug info
            window.editor.showDebugInfo();
        } else {
            // Hide debug info
            window.editor.hideDebugInfo();
        }
    }
}

function togglePerformanceMode() {
    const toggle = document.getElementById('performanceModeToggle');
    if (window.editor) {
        window.editor.showToast(`Performance Mode ${toggle.checked ? 'enabled' : 'disabled'}`, 'success');
        localStorage.setItem('blockyBuilder_performanceMode', toggle.checked);
        
        if (toggle.checked) {
            // Enable performance optimizations
            window.editor.enablePerformanceMode();
        } else {
            // Disable performance optimizations
            window.editor.disablePerformanceMode();
        }
    }
}

function cycleGridColor() {
    if (window.editor && window.editor.worldManager) {
        const colors = ['white', 'black', 'green', 'brown', 'yellow'];
        const currentIndex = colors.indexOf(window.editor.worldManager.gridColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        
        window.editor.worldManager.gridColor = colors[nextIndex];
        window.editor.updateGridColorButton();
        window.editor.renderer.render();
        window.editor.showToast(`Grid color changed to ${colors[nextIndex]}`, 'success');
        
        // Save to localStorage
        localStorage.setItem('blockyBuilder_gridColor', colors[nextIndex]);
    }
}

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new BlockyBuilderEditor();
    
    // Show project setup modal immediately for better UX
    setTimeout(() => {
        showProjectPanel();
    }, 100); // Reduced delay for more immediate feel
});
