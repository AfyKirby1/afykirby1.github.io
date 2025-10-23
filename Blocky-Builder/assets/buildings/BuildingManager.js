/**
 * Building Manager System for Blocky Builder
 * Handles building creation, placement, and configuration in the world builder
 */

class BuildingManager {
    constructor(canvas, world) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.world = world;
        
        // Building creation state
        this.isCreatingBuilding = false;
        this.selectedBuildingTemplate = null;
        this.previewBuilding = null;
        this.buildings = []; // Start with empty building list
        this.activeTool = 'select'; // Default tool
        
        // Drag functionality
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.panelDragOffset = { x: 0, y: 0 };
        
        // File processing flag
        this.isProcessingFile = false;
        
        // UI elements
        this.buildingPanel = null;
        this.templateList = null;
        this.configPanel = null;
        
        // Building templates - persistent (localStorage) + session templates
        this.buildingTemplates = {};
        this.persistentTemplates = {}; // Templates that persist across sessions
        this.sessionTemplates = {}; // Templates added during current session
        
        // Building textures - persistent (localStorage) + session textures
        this.buildingTextures = {};
        this.persistentTextures = {}; // Textures that persist across sessions
        this.sessionTextures = {}; // Textures added during current session
        
        // Load persistent templates from localStorage
        this.loadPersistentTemplates();
        
        this.initializeUI();
    }
    
    loadPersistentTemplates() {
        try {
            // Load persistent templates from localStorage
            const savedTemplates = localStorage.getItem('blockyBuilder_persistentBuildings');
            if (savedTemplates) {
                this.persistentTemplates = JSON.parse(savedTemplates);
                console.log(`📦 Loaded ${Object.keys(this.persistentTemplates).length} persistent building templates`);
            } else {
                this.persistentTemplates = {};
            }
            
            // Load persistent textures from localStorage
            const savedTextures = localStorage.getItem('blockyBuilder_buildingTextures');
            if (savedTextures) {
                this.persistentTextures = JSON.parse(savedTextures);
                console.log(`🖼️ Loaded ${Object.keys(this.persistentTextures).length} persistent building textures`);
            } else {
                this.persistentTextures = {};
            }
            
        } catch (error) {
            console.warn('⚠️ Failed to load persistent templates:', error);
            this.persistentTemplates = {};
            this.persistentTextures = {};
        }
        
        // Initialize session templates
        this.sessionTemplates = {};
        this.sessionTextures = {};
        
        // Load Buildings from persistent folder (now empty)
        this.loadBuildingsFromPersistentFolder();
        
        // Clean up any orphaned localStorage entries
        this.cleanupOrphanedStorage();
        
        // Merge persistent and session templates
        this.updateTemplateList();
        
        // Pre-load existing textures
        this.preloadExistingTextures();
        
        // Load existing buildings from localStorage
        this.loadBuildings();
    }
    
    preloadExistingTextures() {
        const allTextures = { ...this.persistentTextures, ...this.sessionTextures };
        Object.values(allTextures).forEach(texture => {
            this.preloadBuildingTexture(texture.path);
        });
    }
    
    async loadBuildingsFromPersistentFolder() {
        try {
            // No hardcoded building templates - only load what users upload
            console.log('📦 No persistent building templates to load - users can upload their own');
        } catch (error) {
            console.warn('⚠️ Failed to load Buildings from persistent folder:', error);
        }
    }
    
    cleanupOrphanedStorage() {
        // Remove any localStorage entries that don't have corresponding files
        const keysToRemove = [];
        Object.keys(this.persistentTemplates).forEach(key => {
            const template = this.persistentTemplates[key];
            if (template.source === 'localStorage' && !template.customImage) {
                keysToRemove.push(key);
            }
        });
        
        keysToRemove.forEach(key => {
            delete this.persistentTemplates[key];
        });
        
        if (keysToRemove.length > 0) {
            this.savePersistentTemplates();
        }
    }
    
    savePersistentTemplates() {
        try {
            localStorage.setItem('blockyBuilder_persistentBuildings', JSON.stringify(this.persistentTemplates));
        } catch (error) {
            console.warn('⚠️ Failed to save persistent Building templates:', error);
        }
    }
    
    updateTemplateList() {
        this.buildingTemplates = { ...this.persistentTemplates, ...this.sessionTemplates };
    }
    
    initializeUI() {
        this.createBuildingPanel();
        this.createTemplateList();
        this.setupEventListeners();
    }
    
    createBuildingPanel() {
        // Create building panel HTML
        const panelHTML = `
            <div id="buildingPanel" class="building-panel" style="display: none;">
                <div class="building-panel-header">
                    <h3>🏗️ Building Manager</h3>
                    <button class="close-btn" onclick="window.editor.buildingManager.togglePanel()">✕</button>
                </div>
                
                <div class="building-panel-content">
                    <div class="building-tools">
                        <button class="building-tool-btn active" id="building-select-btn" onclick="window.editor.buildingManager.setActiveTool('select')">Select</button>
                        <button class="building-tool-btn" id="building-delete-btn" onclick="window.editor.buildingManager.setActiveTool('delete')">Delete</button>
                    </div>
                    
                    <div class="building-templates-section">
                        <h4>Building Templates</h4>
                        <div class="building-upload-section">
                            <button class="upload-btn" onclick="window.editor.buildingManager.showTemplateUploadModal()">📁 Upload Template</button>
                            <button class="upload-btn" onclick="window.editor.buildingManager.showTextureUploadModal()">🖼️ Upload Texture</button>
                        </div>
                        <div id="buildingTemplateList" class="building-template-list">
                            <!-- Templates will be populated here -->
                        </div>
                    </div>
                    
                    <div class="building-config-section">
                        <h4>Building Configuration</h4>
                        <div id="buildingConfigPanel" class="building-config-panel">
                            <p>Select a building template to configure</p>
                        </div>
                    </div>
                    
                    <div class="building-instances-section">
                        <h4>Placed Buildings</h4>
                        <div id="buildingList" class="building-list">
                            <!-- Placed buildings will be listed here -->
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Building Template Upload Modal -->
            <div id="buildingTemplateUploadModal" class="building-upload-modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📁 Upload Building Template</h3>
                        <button class="close-btn" onclick="window.editor.buildingManager.hideTemplateUploadModal()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="upload-area" onclick="document.getElementById('templateFileInput').click()">
                            <div class="upload-icon">📁</div>
                            <p>Click to select JSON file or drag & drop</p>
                            <p class="upload-hint">Building template JSON file</p>
                        </div>
                        <input type="file" id="templateFileInput" accept=".json" style="display: none;">
                        
                        <div class="preview-section" id="templatePreview" style="display: none;">
                            <h4>Preview</h4>
                            <div id="templatePreviewContent"></div>
                        </div>
                        
                        <div class="form-section">
                            <div class="form-group">
                                <label for="templateName">Template Name:</label>
                                <input type="text" id="templateName" placeholder="Enter template name">
                            </div>
                            
                            <div class="form-group">
                                <label for="templateDescription">Description:</label>
                                <textarea id="templateDescription" placeholder="Enter template description"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Save Options:</label>
                                <div class="radio-group">
                                    <label>
                                        <input type="radio" name="templateSaveType" value="session" checked>
                                        Session Only (temporary)
                                    </label>
                                    <label>
                                        <input type="radio" name="templateSaveType" value="permanent">
                                        Save Permanently (localStorage)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancel" onclick="window.editor.buildingManager.hideTemplateUploadModal()">Cancel</button>
                        <button class="btn-save" onclick="window.editor.buildingManager.processTemplateUpload()">Add Template</button>
                    </div>
                </div>
            </div>
            
            <!-- Building Texture Upload Modal -->
            <div id="buildingTextureUploadModal" class="building-upload-modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🖼️ Upload Building Texture</h3>
                        <button class="close-btn" onclick="window.editor.buildingManager.hideTextureUploadModal()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="upload-area" onclick="document.getElementById('textureFileInput').click()">
                            <div class="upload-icon">🖼️</div>
                            <p>Click to select PNG file or drag & drop</p>
                            <p class="upload-hint">Recommended size: 32x32 or 64x64 pixels</p>
                        </div>
                        <input type="file" id="textureFileInput" accept="image/*" style="display: none;">
                        
                        <div class="preview-section" id="texturePreview" style="display: none;">
                            <h4>Preview</h4>
                            <div id="texturePreviewContent"></div>
                        </div>
                        
                        <div class="form-section">
                            <div class="form-group">
                                <label for="textureName">Texture Name:</label>
                                <input type="text" id="textureName" placeholder="Enter texture name">
                            </div>
                            
                            <div class="form-group">
                                <label for="textureDescription">Description:</label>
                                <textarea id="textureDescription" placeholder="Enter texture description"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Save Options:</label>
                                <div class="radio-group">
                                    <label>
                                        <input type="radio" name="textureSaveType" value="session" checked>
                                        Session Only (temporary)
                                    </label>
                                    <label>
                                        <input type="radio" name="textureSaveType" value="permanent">
                                        Save Permanently (localStorage)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancel" onclick="window.editor.buildingManager.hideTextureUploadModal()">Cancel</button>
                        <button class="btn-save" onclick="window.editor.buildingManager.processTextureUpload()">Add Texture</button>
                    </div>
                </div>
            </div>
        `;
        
        // Insert panel into the page
        document.body.insertAdjacentHTML('beforeend', panelHTML);
        this.buildingPanel = document.getElementById('buildingPanel');
        this.templateList = document.getElementById('buildingTemplateList');
        this.configPanel = document.getElementById('buildingConfigPanel');
        
        // Setup file upload handlers
        this.setupFileUploadHandlers();
        
        // Load saved panel position
        this.loadPanelPosition();
    }
    
    setupFileUploadHandlers() {
        // Template file input
        const templateFileInput = document.getElementById('templateFileInput');
        if (templateFileInput) {
            templateFileInput.addEventListener('change', (e) => {
                this.handleTemplateFileSelect(e);
            });
        }
        
        // Texture file input
        const textureFileInput = document.getElementById('textureFileInput');
        if (textureFileInput) {
            textureFileInput.addEventListener('change', (e) => {
                this.handleTextureFileSelect(e);
            });
        }
    }
    
    setupEventListeners() {
        // Setup canvas event listeners for building placement
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => {
                this.handleCanvasClick(e);
            });
            
            this.canvas.addEventListener('mousemove', (e) => {
                this.handleCanvasMouseMove(e);
            });
            
            this.canvas.addEventListener('mousedown', (e) => {
                this.handleCanvasMouseDown(e);
            });
            
            this.canvas.addEventListener('mouseup', (e) => {
                this.handleCanvasMouseUp(e);
            });
        }
        
        // Setup panel dragging after panel is created
        this.setupPanelDragging();
    }
    
    setupPanelDragging() {
        if (!this.buildingPanel) return;
        
        const header = this.buildingPanel.querySelector('.building-panel-header');
        if (!header) return;
        
        // Mouse events for dragging
        header.addEventListener('mousedown', (e) => {
            this.startPanelDrag(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            this.handlePanelDrag(e);
        });
        
        document.addEventListener('mouseup', (e) => {
            this.endPanelDrag(e);
        });
        
        // Touch events for mobile dragging
        header.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startPanelDrag(e.touches[0]);
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handlePanelDrag(e.touches[0]);
        });
        
        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.endPanelDrag(e);
        });
    }
    
    startPanelDrag(e) {
        this.isDragging = true;
        this.buildingPanel.classList.add('building-dragging');
        
        const rect = this.buildingPanel.getBoundingClientRect();
        this.panelDragOffset.x = e.clientX - rect.left;
        this.panelDragOffset.y = e.clientY - rect.top;
        
        // Prevent text selection during drag
        e.preventDefault();
    }
    
    handlePanelDrag(e) {
        if (!this.isDragging || !this.buildingPanel) return;
        
        const newX = e.clientX - this.panelDragOffset.x;
        const newY = e.clientY - this.panelDragOffset.y;
        
        // Constrain to viewport bounds
        const maxX = window.innerWidth - this.buildingPanel.offsetWidth;
        const maxY = window.innerHeight - this.buildingPanel.offsetHeight;
        
        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));
        
        this.buildingPanel.style.left = constrainedX + 'px';
        this.buildingPanel.style.top = constrainedY + 'px';
        this.buildingPanel.style.right = 'auto';
    }
    
    endPanelDrag(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.buildingPanel.classList.remove('building-dragging');
        
        // Save position to localStorage for persistence
        this.savePanelPosition();
    }
    
    savePanelPosition() {
        if (!this.buildingPanel) return;
        
        const rect = this.buildingPanel.getBoundingClientRect();
        const position = {
            x: rect.left,
            y: rect.top
        };
        
        localStorage.setItem('blockyBuilder_buildingPanelPosition', JSON.stringify(position));
    }
    
    loadPanelPosition() {
        try {
            const saved = localStorage.getItem('blockyBuilder_buildingPanelPosition');
            if (saved) {
                const position = JSON.parse(saved);
                
                // Validate position is within viewport
                const maxX = window.innerWidth - this.buildingPanel.offsetWidth;
                const maxY = window.innerHeight - this.buildingPanel.offsetHeight;
                
                const constrainedX = Math.max(0, Math.min(position.x, maxX));
                const constrainedY = Math.max(0, Math.min(position.y, maxY));
                
                this.buildingPanel.style.left = constrainedX + 'px';
                this.buildingPanel.style.top = constrainedY + 'px';
                this.buildingPanel.style.right = 'auto';
            }
        } catch (error) {
            console.warn('Failed to load panel position:', error);
        }
    }
    
    handleCanvasClick(e) {
        // Handle building placement clicks
        if (this.activeTool === 'place' && this.selectedBuildingTemplate) {
            // Use the same coordinate conversion as other tools
            const coords = window.editor.renderer.getWorldCoords(e.clientX, e.clientY);
            console.log(`🔍 DEBUG: Building click - Screen coords: (${e.clientX}, ${e.clientY}), World coords: (${coords.x}, ${coords.y})`);
            
            this.placeBuilding(coords.x, coords.y);
            
            // Reset to select tool after placement
            this.setActiveTool('select');
            this.selectedBuildingTemplate = null;
            this.isCreatingBuilding = false;
            
            // Clear selection
            document.querySelectorAll('.building-template-item').forEach(item => {
                item.classList.remove('selected');
            });
        }
    }
    
    handleCanvasMouseMove(e) {
        // Handle building preview during placement
        if (this.activeTool === 'place' && this.selectedBuildingTemplate) {
            // Update preview position
        }
    }
    
    handleCanvasMouseDown(e) {
        // Handle building selection/dragging
        if (this.activeTool === 'select') {
            // Check if clicking on a building
        }
    }
    
    handleCanvasMouseUp(e) {
        // Handle building drag end
        if (this.isDragging) {
            this.isDragging = false;
        }
    }
    
    placeBuilding(x, y) {
        if (!this.selectedBuildingTemplate) return;
        
        const buildingId = `building_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // For texture-based buildings, use the template's id directly
        // For template-based buildings, find the key in buildingTemplates
        let templateKey;
        if (this.selectedBuildingTemplate.isTexture) {
            templateKey = this.selectedBuildingTemplate.id;
        } else {
            templateKey = Object.keys(this.buildingTemplates).find(key => 
                this.buildingTemplates[key] === this.selectedBuildingTemplate
            );
        }
        
        const building = {
            id: buildingId,
            templateId: templateKey,
            x: x,
            y: y,
            rotation: 0
        };
        
        this.buildings.push(building);
        this.updateBuildingList();
        this.saveBuildings();
        
        console.log(`🏗️ Placed building: ${this.selectedBuildingTemplate.name} at (${x}, ${y})`);
    }
    
    async handleTemplateUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (this.isProcessingFile) {
            console.warn('⚠️ Already processing a file, please wait');
            return;
        }
        
        this.isProcessingFile = true;
        
        try {
            const text = await file.text();
            const buildingData = JSON.parse(text);
            
            // Validate building data structure
            if (!buildingData.name || !buildingData.width || !buildingData.height || !buildingData.tiles) {
                throw new Error('Invalid building template format');
            }
            
            // Generate unique key
            const key = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Add to session templates
            this.sessionTemplates[key] = {
                ...buildingData,
                storageType: 'session',
                source: 'upload'
            };
            
            this.updateTemplateList();
            this.createTemplateList();
            
            console.log(`✅ Loaded building template: ${buildingData.name}`);
            
            if (window.editor && window.editor.showToast) {
                window.editor.showToast(`Building template "${buildingData.name}" loaded successfully!`, 'success');
            }
            
        } catch (error) {
            console.error('❌ Failed to load building template:', error);
            if (window.editor && window.editor.showToast) {
                window.editor.showToast(`Failed to load building template: ${error.message}`, 'error');
            }
        } finally {
            this.isProcessingFile = false;
            event.target.value = ''; // Clear file input
        }
    }
    
    async handleTextureUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (this.isProcessingFile) {
            console.warn('⚠️ Already processing a file, please wait');
            return;
        }
        
        this.isProcessingFile = true;
        
        try {
            // Upload texture to server
            const formData = new FormData();
            formData.append('texture', file);
            
            const response = await fetch('/api/upload-building-texture', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`✅ Building texture uploaded: ${result.path}`);
                if (window.editor && window.editor.showToast) {
                    window.editor.showToast(`Building texture uploaded successfully!`, 'success');
                }
            } else {
                throw new Error(result.message || 'Upload failed');
            }
            
        } catch (error) {
            console.error('❌ Failed to upload building texture:', error);
            if (window.editor && window.editor.showToast) {
                window.editor.showToast(`Failed to upload building texture: ${error.message}`, 'error');
            }
        } finally {
            this.isProcessingFile = false;
            event.target.value = ''; // Clear file input
        }
    }
    
    createTemplateList() {
        if (!this.templateList) return;
        
        this.templateList.innerHTML = '';
        
        // Show uploaded textures
        const allTextures = { ...this.persistentTextures, ...this.sessionTextures };
        Object.entries(allTextures).forEach(([key, texture]) => {
            const textureItem = document.createElement('div');
            textureItem.className = 'building-template-item';
            textureItem.setAttribute('data-texture-key', key);
            textureItem.style.cursor = 'pointer';
            
            textureItem.innerHTML = `
                <div class="building-template-preview">
                    <img src="${texture.path}" alt="${texture.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="building-template-info">
                    <div class="building-template-name">${texture.name}</div>
                    <div class="building-template-size">Texture</div>
                </div>
                <div class="building-template-actions">
                    <button class="building-delete-btn" onclick="window.editor.buildingManager.deleteTexture('${key}')">🗑️</button>
                </div>
            `;
            
            // Add click handler for direct placement
            textureItem.addEventListener('click', (e) => {
                if (e.target.classList.contains('building-delete-btn')) return; // Don't trigger on delete button
                this.selectTextureForPlacement(key);
            });
            
            this.templateList.appendChild(textureItem);
        });
        
        // Show uploaded templates
        Object.entries(this.buildingTemplates).forEach(([key, template]) => {
            const templateItem = document.createElement('div');
            templateItem.className = 'building-template-item';
            templateItem.setAttribute('data-template-key', key);
            templateItem.style.cursor = 'pointer';
            
            templateItem.innerHTML = `
                <div class="building-template-preview" style="background-color: ${template.color || '#8B4513'}">
                    ${template.texture ? `<img src="${template.texture}" alt="${template.name}" style="width: 100%; height: 100%; object-fit: cover;">` : '🏗️'}
                </div>
                <div class="building-template-info">
                    <div class="building-template-name">${template.name}</div>
                    <div class="building-template-size">${template.width}×${template.height}</div>
                </div>
                <div class="building-template-actions">
                    <button class="building-delete-btn" onclick="window.editor.buildingManager.deleteTemplate('${key}')">🗑️</button>
                </div>
            `;
            
            // Add click handler for direct placement
            templateItem.addEventListener('click', (e) => {
                if (e.target.classList.contains('building-delete-btn')) return; // Don't trigger on delete button
                this.selectTemplateForPlacement(key);
            });
            
            this.templateList.appendChild(templateItem);
        });
        
        // Show message if no items
        if (Object.keys(allTextures).length === 0 && Object.keys(this.buildingTemplates).length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'building-template-empty';
            emptyItem.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #95a5a6;">
                    <p>No building templates or textures uploaded yet.</p>
                    <p>Use the upload buttons above to add some!</p>
                </div>
            `;
            this.templateList.appendChild(emptyItem);
        }
    }
    
    selectTemplateForPlacement(templateKey) {
        this.selectedBuildingTemplate = this.buildingTemplates[templateKey];
        this.isCreatingBuilding = true;
        this.activeTool = 'place';
        
        // Update UI
        document.querySelectorAll('.building-template-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[data-template-key="${templateKey}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        // Update tool buttons
        document.querySelectorAll('.building-tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Update config panel
        this.updateConfigPanel();
        
        console.log(`Selected building template for placement: ${this.selectedBuildingTemplate.name}`);
        
        // Show instruction
        this.showNotification(`Click on the grid to place ${this.selectedBuildingTemplate.name}`, 'info');
    }
    
    selectTextureForPlacement(textureKey) {
        const allTextures = { ...this.persistentTextures, ...this.sessionTextures };
        const texture = allTextures[textureKey];
        if (!texture) return;
        
        // Create a simple template from the texture
        this.selectedBuildingTemplate = {
            id: textureKey,
            name: texture.name,
            width: 1,
            height: 1,
            tiles: [{ x: 0, y: 0, type: 'grass' }],
            texture: texture.path,
            isTexture: true
        };
        
        this.isCreatingBuilding = true;
        this.activeTool = 'place';
        
        // Update UI
        document.querySelectorAll('.building-template-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[data-texture-key="${textureKey}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        // Update tool buttons
        document.querySelectorAll('.building-tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        console.log(`Selected building texture for placement: ${texture.name}`);
        
        // Show instruction
        this.showNotification(`Click on the grid to place ${texture.name}`, 'info');
    }
    
    deleteTemplate(templateKey) {
        if (confirm('Are you sure you want to delete this building template?')) {
            if (this.sessionTemplates[templateKey]) {
                delete this.sessionTemplates[templateKey];
            } else if (this.persistentTemplates[templateKey]) {
                delete this.persistentTemplates[templateKey];
                this.savePersistentTemplates();
            }
            
            this.updateTemplateList();
            this.createTemplateList();
            
            console.log(`Deleted building template: ${templateKey}`);
        }
    }
    
    selectTexture(textureKey) {
        const allTextures = { ...this.persistentTextures, ...this.sessionTextures };
        const texture = allTextures[textureKey];
        if (!texture) return;
        
        console.log(`Selected building texture: ${texture.name}`);
        // TODO: Implement texture selection for building creation
    }
    
    deleteTexture(textureKey) {
        if (confirm('Are you sure you want to delete this building texture?')) {
            if (this.sessionTextures[textureKey]) {
                delete this.sessionTextures[textureKey];
            } else if (this.persistentTextures[textureKey]) {
                delete this.persistentTextures[textureKey];
                this.savePersistentTextures();
            }
            
            this.createTemplateList();
            
            console.log(`Deleted building texture: ${textureKey}`);
        }
    }
    
    savePersistentTextures() {
        try {
            localStorage.setItem('blockyBuilder_buildingTextures', JSON.stringify(this.persistentTextures));
        } catch (error) {
            console.warn('⚠️ Failed to save persistent building textures:', error);
        }
    }
    
    updateConfigPanel() {
        if (!this.configPanel || !this.selectedBuildingTemplate) return;
        
        const template = this.selectedBuildingTemplate;
        
        this.configPanel.innerHTML = `
            <div class="building-config-form">
                <div class="config-field">
                    <label>Name:</label>
                    <input type="text" id="buildingName" value="${template.name}" readonly>
                </div>
                <div class="config-field">
                    <label>Size:</label>
                    <input type="text" id="buildingSize" value="${template.width}×${template.height}" readonly>
                </div>
                <div class="config-field">
                    <label>Category:</label>
                    <input type="text" id="buildingCategory" value="${template.category || 'misc'}" readonly>
                </div>
                <div class="config-field">
                    <label>Tiles:</label>
                    <div class="tile-preview-grid">
                        ${this.generateTilePreview(template)}
                    </div>
                </div>
            </div>
        `;
    }
    
    generateTilePreview(template) {
        if (!template.tiles) return '<p>No tile data</p>';
        
        const grid = Array(template.height).fill().map(() => Array(template.width).fill(null));
        
        template.tiles.forEach(tile => {
            if (tile.x >= 0 && tile.x < template.width && tile.y >= 0 && tile.y < template.height) {
                grid[tile.y][tile.x] = tile.type;
            }
        });
        
        return grid.map(row => 
            `<div class="tile-row">${row.map(cell => 
                `<div class="tile-cell ${cell || 'empty'}">${cell ? cell.charAt(0).toUpperCase() : ''}</div>`
            ).join('')}</div>`
        ).join('');
    }
    
    setActiveTool(tool) {
        // Remove active class from all tools
        document.querySelectorAll('.building-tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected tool
        document.getElementById(`building-${tool}-btn`).classList.add('active');
        
        console.log('Active building tool:', tool);
    }
    
    togglePanel() {
        if (!this.buildingPanel) return;
        
        const isVisible = this.buildingPanel.style.display !== 'none';
        
        if (isVisible) {
            this.buildingPanel.style.display = 'none';
        } else {
            this.buildingPanel.style.display = 'block';
            this.loadPanelPosition(); // Load saved position when showing
            this.updateBuildingList();
        }
    }
    
    updateBuildingList() {
        const buildingList = document.getElementById('buildingList');
        if (!buildingList) return;
        
        buildingList.innerHTML = '';
        
        this.buildings.forEach((building, index) => {
            // Try to get template from buildingTemplates first
            let template = this.buildingTemplates[building.templateId];
            
            // If not found, check if it's a texture-based building
            if (!template) {
                const allTextures = { ...this.persistentTextures, ...this.sessionTextures };
                const texture = allTextures[building.templateId];
                
                if (texture) {
                    template = {
                        id: building.templateId,
                        name: texture.name,
                        width: 1,
                        height: 1,
                        tiles: [{ x: 0, y: 0, type: 'grass' }],
                        texture: texture.path,
                        isTexture: true
                    };
                }
            }
            
            const buildingItem = document.createElement('div');
            buildingItem.className = 'building-list-item';
            
            buildingItem.innerHTML = `
                <div class="building-list-info">
                    <div class="building-list-name">${template ? template.name : 'Unknown'}</div>
                    <div class="building-list-position">(${building.x}, ${building.y})</div>
                </div>
                <div class="building-list-actions">
                    <button class="building-edit-btn" data-index="${index}">✏️</button>
                    <button class="building-delete-btn" data-index="${index}">🗑️</button>
                </div>
            `;
            
            // Edit button handler
            const editBtn = buildingItem.querySelector('.building-edit-btn');
            editBtn.addEventListener('click', () => {
                this.editBuilding(index);
            });
            
            // Delete button handler
            const deleteBtn = buildingItem.querySelector('.building-delete-btn');
            deleteBtn.addEventListener('click', () => {
                this.deleteBuilding(index);
            });
            
            buildingList.appendChild(buildingItem);
        });
    }
    
    editBuilding(index) {
        const building = this.buildings[index];
        console.log('Editing building:', building);
        // TODO: Implement building editing
    }
    
    deleteBuilding(index) {
        if (confirm('Are you sure you want to delete this building?')) {
            this.buildings.splice(index, 1);
            this.updateBuildingList();
            console.log('Deleted building at index:', index);
        }
    }
    
    clearAllBuildings() {
        console.log(`🧹 Clearing ${this.buildings.length} Buildings:`, this.buildings.map(b => b.id));
        
        // Clear from localStorage
        const localStorageKey = 'blockyBuilderBuildings';
        const storedBuildings = localStorage.getItem(localStorageKey);
        
        if (storedBuildings) {
            try {
                const parsedBuildings = JSON.parse(storedBuildings);
                console.log(`🗑️ Found ${parsedBuildings.length} Buildings in localStorage:`, parsedBuildings.map(b => b.id));
                
                localStorage.removeItem(localStorageKey);
                console.log('✅ Cleared Buildings from localStorage');
            } catch (error) {
                console.warn('⚠️ Failed to parse stored Buildings:', error);
            }
        } else {
            console.log('🗑️ Found 0 Buildings in localStorage: none');
        }
        
        // Clear from memory
        this.buildings = [];
        console.log('All Buildings cleared');
    }
    
    // Building placement methods (duplicate removed - using the first placeBuilding method)
    
    saveBuildings() {
        try {
            localStorage.setItem('blockyBuilderBuildings', JSON.stringify(this.buildings));
        } catch (error) {
            console.warn('⚠️ Failed to save Buildings:', error);
        }
    }
    
    loadBuildings() {
        try {
            const saved = localStorage.getItem('blockyBuilderBuildings');
            if (saved) {
                this.buildings = JSON.parse(saved);
                console.log(`📦 Loaded ${this.buildings.length} Buildings from localStorage`);
                
                // Debug: Log building details once on load
                if (this.buildings.length > 0) {
                    console.log(`🔍 DEBUG: Loaded buildings:`, this.buildings);
                }
                
                // Update the UI to show loaded buildings
                if (this.templateList) {
                    this.updateBuildingList();
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to load Buildings:', error);
            this.buildings = [];
        }
    }
    
    // World data integration
    getWorldData() {
        return {
            buildings: this.buildings
        };
    }
    
    loadWorldData(worldData) {
        if (worldData.buildings) {
            this.buildings = worldData.buildings;
            this.updateBuildingList();
            console.log(`📂 Loaded ${this.buildings.length} Buildings from world data`);
        }
    }
    
    // Modal methods
    showTemplateUploadModal() {
        const modal = document.getElementById('buildingTemplateUploadModal');
        if (modal) {
            modal.style.display = 'flex';
            // Reset form
            document.getElementById('templateName').value = '';
            document.getElementById('templateDescription').value = '';
            document.querySelector('input[name="templateSaveType"][value="session"]').checked = true;
            document.getElementById('templatePreview').style.display = 'none';
        }
    }
    
    hideTemplateUploadModal() {
        const modal = document.getElementById('buildingTemplateUploadModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    showTextureUploadModal() {
        const modal = document.getElementById('buildingTextureUploadModal');
        if (modal) {
            modal.style.display = 'flex';
            // Reset form
            document.getElementById('textureName').value = '';
            document.getElementById('textureDescription').value = '';
            document.querySelector('input[name="textureSaveType"][value="session"]').checked = true;
            document.getElementById('texturePreview').style.display = 'none';
        }
    }
    
    hideTextureUploadModal() {
        const modal = document.getElementById('buildingTextureUploadModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    handleTemplateFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Show preview
        const preview = document.getElementById('templatePreview');
        const previewContent = document.getElementById('templatePreviewContent');
        
        if (preview && previewContent) {
            preview.style.display = 'block';
            
            // Read and display template content
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const templateData = JSON.parse(e.target.result);
                    previewContent.innerHTML = `
                        <div class="template-preview">
                            <h5>${templateData.name || 'Unnamed Template'}</h5>
                            <p><strong>Size:</strong> ${templateData.width || 0} x ${templateData.height || 0}</p>
                            <p><strong>Tiles:</strong> ${templateData.tiles ? templateData.tiles.length : 0}</p>
                            <p><strong>Category:</strong> ${templateData.category || 'None'}</p>
                        </div>
                    `;
                } catch (error) {
                    previewContent.innerHTML = '<p style="color: red;">Invalid JSON file</p>';
                }
            };
            reader.readAsText(file);
        }
        
        // Auto-fill name if empty
        const nameInput = document.getElementById('templateName');
        if (nameInput && !nameInput.value) {
            nameInput.value = file.name.replace('.json', '');
        }
    }
    
    handleTextureFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Show preview
        const preview = document.getElementById('texturePreview');
        const previewContent = document.getElementById('texturePreviewContent');
        
        if (preview && previewContent) {
            preview.style.display = 'block';
            
            // Create image preview
            const reader = new FileReader();
            reader.onload = (e) => {
                previewContent.innerHTML = `
                    <div class="texture-preview">
                        <img src="${e.target.result}" alt="Texture preview" style="max-width: 64px; max-height: 64px; image-rendering: pixelated;">
                        <p><strong>File:</strong> ${file.name}</p>
                        <p><strong>Size:</strong> ${file.size} bytes</p>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
        
        // Auto-fill name if empty
        const nameInput = document.getElementById('textureName');
        if (nameInput && !nameInput.value) {
            nameInput.value = file.name.replace(/\.[^/.]+$/, '');
        }
    }
    
    async processTemplateUpload() {
        const fileInput = document.getElementById('templateFileInput');
        const nameInput = document.getElementById('templateName');
        const descriptionInput = document.getElementById('templateDescription');
        const saveType = document.querySelector('input[name="templateSaveType"]:checked').value;
        
        if (!fileInput.files[0]) {
            this.showNotification('Please select a template file', 'error');
            return;
        }
        
        if (!nameInput.value.trim()) {
            this.showNotification('Please enter a template name', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        
        try {
            console.log('📁 Uploading building template:', file.name);
            
            const formData = new FormData();
            formData.append('template', file);
            
            const response = await fetch('/api/upload-building-template', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Building template uploaded:', result.path);
                
                // Read the template content
                const templateContent = await file.text();
                const templateData = JSON.parse(templateContent);
                
                // Generate unique ID
                const templateId = `template_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
                
                // Create template object
                const template = {
                    ...templateData,
                    id: templateId,
                    name: nameInput.value.trim(),
                    description: descriptionInput.value.trim(),
                    storageType: saveType,
                    source: 'upload',
                    uploadedAt: new Date().toISOString()
                };
                
                // Save based on type
                if (saveType === 'permanent') {
                    this.persistentTemplates[templateId] = template;
                    this.savePersistentTemplates();
                } else {
                    this.sessionTemplates[templateId] = template;
                }
                
                this.updateTemplateList();
                this.createTemplateList();
                this.hideTemplateUploadModal();
                this.showNotification('Building template uploaded successfully!', 'success');
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('❌ Failed to upload building template:', error);
            this.showNotification(`Failed to upload template: ${error.message}`, 'error');
        }
    }
    
    async processTextureUpload() {
        const fileInput = document.getElementById('textureFileInput');
        const nameInput = document.getElementById('textureName');
        const descriptionInput = document.getElementById('textureDescription');
        const saveType = document.querySelector('input[name="textureSaveType"]:checked').value;
        
        if (!fileInput.files[0]) {
            this.showNotification('Please select a texture file', 'error');
            return;
        }
        
        if (!nameInput.value.trim()) {
            this.showNotification('Please enter a texture name', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        
        try {
            console.log('🖼️ Uploading building texture:', file.name);
            
            const formData = new FormData();
            formData.append('texture', file);
            
            const response = await fetch('/api/upload-building-texture', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Building texture uploaded:', result.path);
                
                // Generate unique ID
                const textureId = `texture_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
                
                // Create texture object
                const texture = {
                    id: textureId,
                    name: nameInput.value.trim(),
                    description: descriptionInput.value.trim(),
                    path: result.path,
                    filename: file.name,
                    storageType: saveType,
                    source: 'upload',
                    uploadedAt: new Date().toISOString()
                };
                
                // Save based on type
                if (saveType === 'permanent') {
                    this.persistentTextures[textureId] = texture;
                    this.savePersistentTextures();
                } else {
                    this.sessionTextures[textureId] = texture;
                }
                
                // Update template list to show the new texture
                this.createTemplateList();
                
                // Pre-load the texture for immediate rendering
                this.preloadBuildingTexture(texture.path);
                
                this.hideTextureUploadModal();
                this.showNotification('Building texture uploaded successfully!', 'success');
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('❌ Failed to upload building texture:', error);
            this.showNotification(`Failed to upload texture: ${error.message}`, 'error');
        }
    }
    
    preloadBuildingTexture(texturePath) {
        if (!window.editor || !window.editor.renderer) return;
        
        const img = new Image();
        img.onload = () => {
            window.editor.renderer.buildingSpriteCache.set(texturePath, img);
            console.log(`✅ Pre-loaded building texture: ${texturePath}`);
        };
        img.onerror = () => {
            console.warn(`⚠️ Failed to pre-load building texture: ${texturePath}`);
        };
        img.src = texturePath;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `building-notification building-notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Export for use in Blocky Builder
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuildingManager;
}

// Make BuildingManager globally available
window.BuildingManager = BuildingManager;
