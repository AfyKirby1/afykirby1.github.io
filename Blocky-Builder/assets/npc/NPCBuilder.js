/**
 * NPC Builder System for Blocky Builder
 * Handles NPC creation, placement, and configuration in the world builder
 */

class NPCBuilder {
    constructor(canvas, world) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.world = world;
        
        // NPC creation state
        this.isCreatingNPC = false;
        this.selectedNPCTemplate = null;
        this.previewNPC = null;
        this.npcs = []; // Start with empty NPC list
        
        // Drag functionality
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // File processing flag
        this.isProcessingFile = false;
        
        // UI elements
        this.npcPanel = null;
        this.templateList = null;
        this.configPanel = null;
        
        // NPC templates - persistent (localStorage) + session templates
        this.npcTemplates = {};
        this.persistentTemplates = {}; // Templates that persist across sessions
        this.sessionTemplates = {}; // Templates added during current session
        
        // Load persistent templates from localStorage
        this.loadPersistentTemplates();
        
        this.initializeUI();
    }
    
    loadPersistentTemplates() {
        try {
            const saved = localStorage.getItem('blockyBuilder_persistentNPCs');
            if (saved) {
                this.persistentTemplates = JSON.parse(saved);
                console.log('📦 Loaded persistent NPC templates:', Object.keys(this.persistentTemplates));
            }
        } catch (error) {
            console.warn('⚠️ Failed to load persistent NPC templates:', error);
            this.persistentTemplates = {};
        }
        
        // Merge persistent and session templates
        this.updateTemplateList();
    }
    
    savePersistentTemplates() {
        try {
            localStorage.setItem('blockyBuilder_persistentNPCs', JSON.stringify(this.persistentTemplates));
            console.log('💾 Saved persistent NPC templates:', Object.keys(this.persistentTemplates));
        } catch (error) {
            console.warn('⚠️ Failed to save persistent NPC templates:', error);
        }
    }
    
    updateTemplateList() {
        // Merge persistent and session templates
        this.npcTemplates = { ...this.persistentTemplates, ...this.sessionTemplates };
    }
    
    initializeUI() {
        this.createNPCPanel();
        this.createTemplateList();
        this.createConfigPanel();
        this.setupEventListeners();
    }
    
    createNPCPanel() {
        // Create main NPC panel
        this.npcPanel = document.createElement('div');
        this.npcPanel.id = 'npc-builder-panel';
        this.npcPanel.className = 'npc-panel';
        this.npcPanel.style.display = 'none'; // Hide the entire panel by default
        this.npcPanel.innerHTML = `
            <div class="npc-panel-header">
                <h3>NPC Builder</h3>
                <button id="npc-panel-toggle" class="npc-toggle-btn">+</button>
            </div>
            <div class="npc-panel-content" style="display: none;">
                <div class="npc-tools">
                    <button id="npc-create-btn" class="npc-tool-btn active">
                        <span class="npc-tool-icon">➕</span>
                        Create NPC
                    </button>
                    <button id="npc-edit-btn" class="npc-tool-btn">
                        <span class="npc-tool-icon">✏️</span>
                        Edit NPC
                    </button>
                    <button id="npc-delete-btn" class="npc-tool-btn">
                        <span class="npc-tool-icon">🗑️</span>
                        Delete NPC
                    </button>
                    <button id="npc-clear-btn" class="npc-tool-btn" style="background: #dc3545; color: white;">
                        <span class="npc-tool-icon">🧹</span>
                        Clear All
                    </button>
                </div>
                <div class="npc-template-section">
                    <h4>NPC Templates</h4>
                    <div class="npc-template-actions">
                        <button id="npc-add-custom-btn" class="npc-add-custom-btn">
                            <span class="npc-tool-icon">📁</span>
                            Add Custom NPC
                        </button>
                    </div>
                    <div id="npc-template-list" class="npc-template-list"></div>
                </div>
                <div class="npc-config-section">
                    <h4>Configuration</h4>
                    <div id="npc-config-panel" class="npc-config-panel"></div>
                </div>
                <div class="npc-list-section">
                    <h4>Placed NPCs</h4>
                    <div id="npc-list" class="npc-list"></div>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(this.npcPanel);
        
        // Create upload modal
        this.createUploadModal();
    }
    
    createUploadModal() {
        // Create upload modal
        this.uploadModal = document.createElement('div');
        this.uploadModal.id = 'npc-upload-modal';
        this.uploadModal.className = 'npc-upload-modal';
        this.uploadModal.style.display = 'none';
        this.uploadModal.innerHTML = `
            <div class="npc-upload-modal-content">
                <div class="npc-upload-header">
                    <h3>Add Custom NPC</h3>
                    <button id="npc-upload-close" class="npc-upload-close">×</button>
                </div>
                <div class="npc-upload-body">
                    <div class="npc-upload-section">
                        <div class="npc-upload-dropzone" id="npc-dropzone">
                            <div class="npc-upload-icon">📁</div>
                            <div class="npc-upload-text">Click to select PNG file or drag & drop</div>
                            <div class="npc-upload-hint">Recommended size: 32x32 or 64x64 pixels</div>
                        </div>
                        <input type="file" id="npc-file-input" accept=".png" style="display: none;">
                    </div>
                    <div class="npc-upload-preview-section" id="npc-preview-section" style="display: none;">
                        <h4>Preview</h4>
                        <div class="npc-upload-preview">
                            <img id="npc-preview-image" src="" alt="NPC Preview">
                        </div>
                        <div class="npc-upload-details">
                            <div class="npc-upload-field">
                                <label for="npc-custom-name">NPC Name:</label>
                                <input type="text" id="npc-custom-name" placeholder="Enter NPC name" maxlength="20">
                            </div>
                            <div class="npc-upload-field">
                                <label for="npc-custom-behavior">Default Behavior:</label>
                                <select id="npc-custom-behavior">
                                    <option value="idle">Idle</option>
                                    <option value="wander">Wander</option>
                                    <option value="patrol">Patrol</option>
                                    <option value="guard">Guard</option>
                                </select>
                            </div>
                            <div class="npc-upload-field">
                                <label for="npc-custom-dialogue">Default Dialogue:</label>
                                <textarea id="npc-custom-dialogue" rows="2" placeholder="Enter default dialogue lines (one per line)">Hello there!</textarea>
                            </div>
                        </div>
                    </div>
                </div>
                    <div class="npc-upload-footer">
                        <div class="npc-upload-storage-options">
                            <label class="npc-upload-storage-option">
                                <input type="radio" name="npc-storage" value="session" checked>
                                <span>Session Only (temporary)</span>
                            </label>
                            <label class="npc-upload-storage-option">
                                <input type="radio" name="npc-storage" value="persistent">
                                <span>Save Permanently (localStorage)</span>
                            </label>
                        </div>
                        <div class="npc-upload-buttons">
                            <button id="npc-upload-cancel" class="npc-upload-btn npc-upload-cancel">Cancel</button>
                            <button id="npc-upload-confirm" class="npc-upload-btn npc-upload-confirm" disabled>Add NPC</button>
                        </div>
                    </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(this.uploadModal);
        
        // Setup upload modal event listeners
        this.setupUploadModalListeners();
    }
    
    setupUploadModalListeners() {
        // Close modal buttons
        document.getElementById('npc-upload-close').addEventListener('click', () => {
            this.closeUploadModal();
        });
        
        document.getElementById('npc-upload-cancel').addEventListener('click', () => {
            this.closeUploadModal();
        });
        
        // File input handling
        const fileInput = document.getElementById('npc-file-input');
        const dropzone = document.getElementById('npc-dropzone');
        
        // Remove any existing event listeners to prevent duplicates
        dropzone.removeEventListener('click', this.handleDropzoneClick);
        fileInput.removeEventListener('change', this.handleFileInputChange);
        
        // Store handlers as instance methods to prevent duplicates
        this.handleDropzoneClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Only trigger if not already processing
            if (!this.isProcessingFile) {
                this.isProcessingFile = true;
                fileInput.click();
                // Reset flag after a short delay
                setTimeout(() => {
                    this.isProcessingFile = false;
                }, 100);
            }
        };
        
        this.handleFileInputChange = (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleFileSelect(e.target.files[0]);
            }
        };
        
        // Click to open file dialog
        dropzone.addEventListener('click', this.handleDropzoneClick);
        
        // File selection
        fileInput.addEventListener('change', this.handleFileInputChange);
        
        // Drag and drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('npc-upload-dragover');
        });
        
        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.classList.remove('npc-upload-dragover');
        });
        
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('npc-upload-dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'image/png') {
                this.handleFileSelect(file);
            } else {
                alert('Please select a PNG file.');
            }
        });
        
        // Form validation
        document.getElementById('npc-custom-name').addEventListener('input', () => {
            this.validateUploadForm();
        });
        
        // Prevent keyboard events from bubbling up to tool hotkeys
        const modalInputs = [
            'npc-custom-name',
            'npc-custom-behavior', 
            'npc-custom-dialogue'
        ];
        
        modalInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('keydown', (e) => {
                    e.stopPropagation();
                });
                input.addEventListener('keyup', (e) => {
                    e.stopPropagation();
                });
                input.addEventListener('keypress', (e) => {
                    e.stopPropagation();
                });
            }
        });
        
        // Prevent all keyboard events on the modal from bubbling up
        this.uploadModal.addEventListener('keydown', (e) => {
            e.stopPropagation();
        });
        
        this.uploadModal.addEventListener('keyup', (e) => {
            e.stopPropagation();
        });
        
        this.uploadModal.addEventListener('keypress', (e) => {
            e.stopPropagation();
        });
        
        // Confirm button
        document.getElementById('npc-upload-confirm').addEventListener('click', () => {
            this.confirmCustomNPC();
        });
    }
    
    handleFileSelect(file) {
        if (!file || file.type !== 'image/png') {
            alert('Please select a PNG file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById('npc-preview-image');
            const previewSection = document.getElementById('npc-preview-section');
            
            previewImage.src = e.target.result;
            previewSection.style.display = 'block';
            
            // Auto-fill name from filename
            const nameInput = document.getElementById('npc-custom-name');
            if (!nameInput.value) {
                const fileName = file.name.replace('.png', '').replace(/[^a-zA-Z0-9\s]/g, '');
                nameInput.value = fileName || 'Custom NPC';
            }
            
            this.validateUploadForm();
        };
        reader.readAsDataURL(file);
    }
    
    validateUploadForm() {
        const name = document.getElementById('npc-custom-name').value.trim();
        const hasImage = document.getElementById('npc-preview-image').src;
        const confirmBtn = document.getElementById('npc-upload-confirm');
        
        confirmBtn.disabled = !(name && hasImage);
    }
    
    confirmCustomNPC() {
        const name = document.getElementById('npc-custom-name').value.trim();
        const behavior = document.getElementById('npc-custom-behavior').value;
        const dialogue = document.getElementById('npc-custom-dialogue').value.split('\n').filter(line => line.trim());
        const imageSrc = document.getElementById('npc-preview-image').src;
        const storageType = document.querySelector('input[name="npc-storage"]:checked').value;
        
        if (!name || !imageSrc) {
            alert('Please provide a name and select an image.');
            return;
        }
        
        // Create custom NPC template
        const customKey = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const customTemplate = {
            name: name,
            type: 'custom',
            color: '#8B4513', // Default color
            behavior: behavior,
            speed: 0.5,
            dialogue: dialogue,
            icon: '🎨', // Custom icon
            customImage: imageSrc, // Store the image data URL
            isCustom: true,
            storageType: storageType // Track how it was stored
        };
        
        // Add to appropriate storage
        if (storageType === 'persistent') {
            this.persistentTemplates[customKey] = customTemplate;
            this.savePersistentTemplates();
            console.log('💾 Saved NPC permanently:', customTemplate.name);
        } else {
            this.sessionTemplates[customKey] = customTemplate;
            console.log('🔄 Saved NPC for session:', customTemplate.name);
        }
        
        // Update template list
        this.updateTemplateList();
        this.createTemplateList();
        
        // Close modal and reset form
        this.closeUploadModal();
        
        console.log('Custom NPC added:', customTemplate);
    }
    
    closeUploadModal() {
        this.uploadModal.style.display = 'none';
        
        // Remove the modal-open class from NPC panel
        this.npcPanel.classList.remove('npc-modal-open');
        
        // Reset form
        document.getElementById('npc-file-input').value = '';
        document.getElementById('npc-preview-image').src = '';
        document.getElementById('npc-preview-section').style.display = 'none';
        document.getElementById('npc-custom-name').value = '';
        document.getElementById('npc-custom-behavior').value = 'idle';
        document.getElementById('npc-custom-dialogue').value = 'Hello there!';
        document.getElementById('npc-upload-confirm').disabled = true;
        
        // Reset file processing flag
        this.isProcessingFile = false;
    }
    
    openUploadModal() {
        this.uploadModal.style.display = 'flex';
        // Dim the NPC Builder panel when modal is open
        this.npcPanel.classList.add('npc-modal-open');
        
        // Focus the first input field for better UX
        setTimeout(() => {
            const nameInput = document.getElementById('npc-custom-name');
            if (nameInput) {
                nameInput.focus();
            }
        }, 100);
    }
    
    createTemplateList() {
        this.templateList = document.getElementById('npc-template-list');
        
        Object.entries(this.npcTemplates).forEach(([key, template]) => {
            const templateItem = document.createElement('div');
            templateItem.className = 'npc-template-item';
            templateItem.dataset.template = key;
            // Create template icon/image
            let iconHtml;
            if (template.isCustom && template.customImage) {
                iconHtml = `<img src="${template.customImage}" alt="${template.name}" class="npc-template-custom-image">`;
            } else {
                iconHtml = `<div class="npc-template-icon">${template.icon}</div>`;
            }
            
            templateItem.innerHTML = `
                <div class="npc-template-icon-container">${iconHtml}</div>
                <div class="npc-template-info">
                    <div class="npc-template-name">${template.name}</div>
                    <div class="npc-template-type">${template.type}</div>
                </div>
                <div class="npc-template-behavior">${template.behavior}</div>
            `;
            
            templateItem.addEventListener('click', () => {
                this.selectTemplate(key);
            });
            
            this.templateList.appendChild(templateItem);
        });
    }
    
    createConfigPanel() {
        this.configPanel = document.getElementById('npc-config-panel');
        this.updateConfigPanel();
    }
    
    updateConfigPanel() {
        if (!this.selectedNPCTemplate) {
            this.configPanel.innerHTML = '<p class="npc-config-empty">Select a template to configure</p>';
            return;
        }
        
        const template = this.npcTemplates[this.selectedNPCTemplate];
        this.configPanel.innerHTML = `
            <div class="npc-config-form">
                <div class="npc-config-group">
                    <label for="npc-name">Name:</label>
                    <input type="text" id="npc-name" value="${template.name}" placeholder="Enter NPC name">
                </div>
                
                <div class="npc-config-group">
                    <label for="npc-behavior">Behavior:</label>
                    <select id="npc-behavior">
                        <option value="idle" ${template.behavior === 'idle' ? 'selected' : ''}>Idle</option>
                        <option value="wander" ${template.behavior === 'wander' ? 'selected' : ''}>Wander</option>
                        <option value="patrol" ${template.behavior === 'patrol' ? 'selected' : ''}>Patrol</option>
                        <option value="guard" ${template.behavior === 'guard' ? 'selected' : ''}>Guard</option>
                    </select>
                </div>
                
                <div class="npc-config-group">
                    <label for="npc-speed">Speed:</label>
                    <input type="range" id="npc-speed" min="0.1" max="2" step="0.1" value="${template.speed}">
                    <span class="npc-speed-value">${template.speed}</span>
                </div>
                
                <div class="npc-config-group">
                    <label for="npc-color">Color:</label>
                    <input type="color" id="npc-color" value="${template.color}">
                </div>
                
                <div class="npc-config-group npc-wander-config" style="display: ${template.behavior === 'wander' ? 'block' : 'none'}">
                    <label for="npc-wander-radius">Wander Radius:</label>
                    <input type="range" id="npc-wander-radius" min="10" max="200" value="${template.wanderRadius || 50}">
                    <span class="npc-wander-value">${template.wanderRadius || 50}</span>
                </div>
                
                <div class="npc-config-group npc-patrol-config" style="display: ${template.behavior === 'patrol' ? 'block' : 'none'}">
                    <label>Patrol Points:</label>
                    <div class="npc-patrol-points">
                        <button id="npc-add-patrol-point" class="npc-patrol-btn">Add Point</button>
                        <div id="npc-patrol-list" class="npc-patrol-list"></div>
                    </div>
                </div>
                
                <div class="npc-config-group">
                    <label for="npc-dialogue">Dialogue:</label>
                    <textarea id="npc-dialogue" rows="3" placeholder="Enter dialogue lines (one per line)">${template.dialogue.join('\n')}</textarea>
                </div>
                
                <div class="npc-config-actions">
                    <button id="npc-place-btn" class="npc-action-btn primary">Place NPC</button>
                    <button id="npc-cancel-btn" class="npc-action-btn">Cancel</button>
                </div>
            </div>
        `;
        
        this.setupConfigEventListeners();
    }
    
    setupConfigEventListeners() {
        // Behavior change handler
        const behaviorSelect = document.getElementById('npc-behavior');
        if (behaviorSelect) {
            behaviorSelect.addEventListener('change', (e) => {
                this.updateBehaviorConfig(e.target.value);
            });
        }
        
        // Speed slider handler
        const speedSlider = document.getElementById('npc-speed');
        const speedValue = document.querySelector('.npc-speed-value');
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', (e) => {
                speedValue.textContent = e.target.value;
            });
        }
        
        // Wander radius slider handler
        const wanderSlider = document.getElementById('npc-wander-radius');
        const wanderValue = document.querySelector('.npc-wander-value');
        if (wanderSlider && wanderValue) {
            wanderSlider.addEventListener('input', (e) => {
                wanderValue.textContent = e.target.value;
            });
        }
        
        // Place NPC button
        const placeBtn = document.getElementById('npc-place-btn');
        if (placeBtn) {
            placeBtn.addEventListener('click', () => {
                this.startNPCCreation();
            });
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('npc-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelNPCCreation();
            });
        }
        
        // Add patrol point button
        const addPatrolBtn = document.getElementById('npc-add-patrol-point');
        if (addPatrolBtn) {
            addPatrolBtn.addEventListener('click', () => {
                this.addPatrolPoint();
            });
        }
    }
    
    updateBehaviorConfig(behavior) {
        const wanderConfig = document.querySelector('.npc-wander-config');
        const patrolConfig = document.querySelector('.npc-patrol-config');
        
        if (wanderConfig) {
            wanderConfig.style.display = behavior === 'wander' ? 'block' : 'none';
        }
        
        if (patrolConfig) {
            patrolConfig.style.display = behavior === 'patrol' ? 'block' : 'none';
        }
    }
    
    selectTemplate(templateKey) {
        // Remove previous selection
        document.querySelectorAll('.npc-template-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Select new template
        const templateItem = document.querySelector(`[data-template="${templateKey}"]`);
        if (templateItem) {
            templateItem.classList.add('selected');
        }
        
        this.selectedNPCTemplate = templateKey;
        this.updateConfigPanel();
    }
    
    startNPCCreation() {
        if (!this.selectedNPCTemplate) {
            alert('Please select an NPC template first');
            return;
        }
        
        this.isCreatingNPC = true;
        this.canvas.style.cursor = 'crosshair';
        
        // Update UI
        document.getElementById('npc-create-btn').classList.add('active');
        document.getElementById('npc-place-btn').textContent = 'Click to Place';
        
        console.log('NPC creation mode activated. Click on the canvas to place NPC.');
    }
    
    cancelNPCCreation() {
        this.isCreatingNPC = false;
        this.canvas.style.cursor = 'default';
        this.previewNPC = null;
        
        // Update UI
        document.getElementById('npc-create-btn').classList.remove('active');
        document.getElementById('npc-place-btn').textContent = 'Place NPC';
        
        console.log('NPC creation cancelled');
    }
    
    placeNPC(x, y) {
        if (!this.isCreatingNPC || !this.selectedNPCTemplate) {
            return;
        }
        
        const config = this.getNPCConfig();
        const template = this.npcTemplates[this.selectedNPCTemplate];
        const npc = {
            id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            template: this.selectedNPCTemplate,
            x: x,
            y: y,
            ...config,
            // Include custom image data if available
            customImage: template.customImage || null,
            isCustom: template.isCustom || false
        };
        
        this.npcs.push(npc);
        this.updateNPCList();
        this.cancelNPCCreation();
        
        console.log('NPC placed:', npc);
    }
    
    getNPCConfig() {
        const name = document.getElementById('npc-name').value;
        const behavior = document.getElementById('npc-behavior').value;
        const speed = parseFloat(document.getElementById('npc-speed').value);
        const color = document.getElementById('npc-color').value;
        const dialogue = document.getElementById('npc-dialogue').value.split('\n').filter(line => line.trim());
        
        const config = {
            name: name,
            behavior: behavior,
            speed: speed,
            color: color,
            dialogue: dialogue
        };
        
        // Add behavior-specific config
        if (behavior === 'wander') {
            config.wanderRadius = parseInt(document.getElementById('npc-wander-radius').value);
        }
        
        if (behavior === 'patrol') {
            config.patrolPoints = this.getPatrolPoints();
        }
        
        return config;
    }
    
    addPatrolPoint() {
        const patrolList = document.getElementById('npc-patrol-list');
        const pointIndex = patrolList.children.length;
        
        const pointDiv = document.createElement('div');
        pointDiv.className = 'npc-patrol-point';
        pointDiv.innerHTML = `
            <span>Point ${pointIndex + 1}:</span>
            <input type="number" placeholder="X" class="npc-patrol-x" value="0">
            <input type="number" placeholder="Y" class="npc-patrol-y" value="0">
            <button class="npc-patrol-remove">×</button>
        `;
        
        // Remove button handler
        const removeBtn = pointDiv.querySelector('.npc-patrol-remove');
        removeBtn.addEventListener('click', () => {
            pointDiv.remove();
        });
        
        patrolList.appendChild(pointDiv);
    }
    
    getPatrolPoints() {
        const patrolList = document.getElementById('npc-patrol-list');
        const points = [];
        
        Array.from(patrolList.children).forEach(pointDiv => {
            const x = parseInt(pointDiv.querySelector('.npc-patrol-x').value) || 0;
            const y = parseInt(pointDiv.querySelector('.npc-patrol-y').value) || 0;
            points.push({ x, y });
        });
        
        return points;
    }
    
    updateNPCList() {
        const npcList = document.getElementById('npc-list');
        npcList.innerHTML = '';
        
        this.npcs.forEach((npc, index) => {
            const npcItem = document.createElement('div');
            npcItem.className = 'npc-list-item';
            npcItem.innerHTML = `
                <div class="npc-list-icon" style="background-color: ${npc.color}">${this.npcTemplates[npc.template].icon}</div>
                <div class="npc-list-info">
                    <div class="npc-list-name">${npc.name}</div>
                    <div class="npc-list-type">${npc.template} - ${npc.behavior}</div>
                </div>
                <div class="npc-list-actions">
                    <button class="npc-edit-btn" data-index="${index}">✏️</button>
                    <button class="npc-delete-btn" data-index="${index}">🗑️</button>
                </div>
            `;
            
            // Edit button handler
            const editBtn = npcItem.querySelector('.npc-edit-btn');
            editBtn.addEventListener('click', () => {
                this.editNPC(index);
            });
            
            // Delete button handler
            const deleteBtn = npcItem.querySelector('.npc-delete-btn');
            deleteBtn.addEventListener('click', () => {
                this.deleteNPC(index);
            });
            
            npcList.appendChild(npcItem);
        });
    }
    
    editNPC(index) {
        const npc = this.npcs[index];
        this.selectedNPCTemplate = npc.template;
        this.updateConfigPanel();
        
        // Populate config with NPC data
        document.getElementById('npc-name').value = npc.name;
        document.getElementById('npc-behavior').value = npc.behavior;
        document.getElementById('npc-speed').value = npc.speed;
        document.getElementById('npc-color').value = npc.color;
        document.getElementById('npc-dialogue').value = npc.dialogue.join('\n');
        
        if (npc.wanderRadius) {
            document.getElementById('npc-wander-radius').value = npc.wanderRadius;
        }
        
        console.log('Editing NPC:', npc);
    }
    
    deleteNPC(index) {
        if (confirm('Are you sure you want to delete this NPC?')) {
            this.npcs.splice(index, 1);
            this.updateNPCList();
            console.log('NPC deleted');
        }
    }
    
    setupEventListeners() {
        // Canvas click handler for NPC placement
        this.canvas.addEventListener('click', (e) => {
            if (this.isCreatingNPC) {
                // Use the renderer's coordinate conversion to get proper world coordinates
                const worldCoords = window.editor.renderer.getWorldCoords(e.clientX, e.clientY);
                // Convert world coordinates to pixel coordinates for NPC placement
                const x = worldCoords.x * window.editor.renderer.TILE_SIZE;
                const y = worldCoords.y * window.editor.renderer.TILE_SIZE;
                this.placeNPC(x, y);
            }
        });
        
        // Panel toggle
        const toggleBtn = document.getElementById('npc-panel-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.togglePanel();
            });
        }
        
        // Drag functionality for panel header
        this.setupDragFunctionality();
        
        // Tool buttons
        document.getElementById('npc-create-btn').addEventListener('click', () => {
            this.setActiveTool('create');
        });
        
        document.getElementById('npc-edit-btn').addEventListener('click', () => {
            this.setActiveTool('edit');
        });
        
        document.getElementById('npc-delete-btn').addEventListener('click', () => {
            this.setActiveTool('delete');
        });
        
        document.getElementById('npc-clear-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear ALL NPCs? This cannot be undone.')) {
                this.clearAllNPCs();
            }
        });
        
        // Add Custom NPC button
        document.getElementById('npc-add-custom-btn').addEventListener('click', () => {
            this.openUploadModal();
        });
    }
    
    setupDragFunctionality() {
        const header = this.npcPanel.querySelector('.npc-panel-header');
        if (!header) return;
        
        // Make header draggable
        header.style.cursor = 'move';
        header.style.userSelect = 'none';
        
        // Performance optimization variables
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        let animationFrame = null;
        
        // Mouse down handler
        header.addEventListener('mousedown', (e) => {
            // Don't drag if clicking the toggle button
            if (e.target.id === 'npc-panel-toggle') return;
            
            isDragging = true;
            const rect = this.npcPanel.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            // Prevent text selection and default behavior
            e.preventDefault();
            e.stopPropagation();
            
            // Add dragging class for visual feedback
            this.npcPanel.classList.add('npc-dragging');
            
            // Add event listeners for the drag operation
            document.addEventListener('mousemove', handleMouseMove, { passive: true });
            document.addEventListener('mouseup', handleMouseUp);
        });
        
        // Optimized mouse move handler using requestAnimationFrame
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            // Cancel previous animation frame
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            
            // Use requestAnimationFrame for smooth updates
            animationFrame = requestAnimationFrame(() => {
                const x = e.clientX - dragOffset.x;
                const y = e.clientY - dragOffset.y;
                
                // Keep panel within viewport bounds
                const maxX = window.innerWidth - this.npcPanel.offsetWidth;
                const maxY = window.innerHeight - this.npcPanel.offsetHeight;
                
                const clampedX = Math.max(0, Math.min(x, maxX));
                const clampedY = Math.max(0, Math.min(y, maxY));
                
                // Use transform for better performance
                this.npcPanel.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
                this.npcPanel.style.position = 'fixed';
                this.npcPanel.style.left = '0';
                this.npcPanel.style.top = '0';
            });
        };
        
        // Mouse up handler
        const handleMouseUp = () => {
            if (!isDragging) return;
            
            isDragging = false;
            
            // Cancel any pending animation frame
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
            // Remove dragging class
            this.npcPanel.classList.remove('npc-dragging');
            
            // Remove event listeners
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        // Prevent context menu on header
        header.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    togglePanel() {
        const content = this.npcPanel.querySelector('.npc-panel-content');
        const toggleBtn = document.getElementById('npc-panel-toggle');
        
        if (this.npcPanel.style.display === 'none') {
            this.npcPanel.style.display = 'block';
            content.style.display = 'block'; // Show the content too
            toggleBtn.textContent = '−';
        } else {
            this.npcPanel.style.display = 'none';
            toggleBtn.textContent = '+';
        }
    }
    
    setActiveTool(tool) {
        // Remove active class from all tools
        document.querySelectorAll('.npc-tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected tool
        document.getElementById(`npc-${tool}-btn`).classList.add('active');
        
        console.log('Active tool:', tool);
    }
    
    render() {
        // Render all placed NPCs
        this.npcs.forEach(npc => {
            this.renderNPC(npc);
        });
        
        // Render preview NPC if creating
        if (this.previewNPC) {
            this.renderNPC(this.previewNPC, true);
        }
    }
    
    renderNPC(npc, isPreview = false) {
        this.ctx.save();
        
        if (isPreview) {
            this.ctx.globalAlpha = 0.7;
        }
        
        // Check if NPC has custom image
        if (npc.isCustom && npc.customImage) {
            // Draw custom image
            const img = new Image();
            img.onload = () => {
                this.ctx.drawImage(img, npc.x - 16, npc.y - 16, 32, 32);
            };
            img.src = npc.customImage;
        } else {
            // Draw default NPC body
            this.ctx.fillStyle = npc.color;
            this.ctx.fillRect(npc.x - 16, npc.y - 16, 32, 32);
            
            // Draw NPC face
            this.ctx.fillStyle = '#FFE4B5';
            this.ctx.fillRect(npc.x - 12, npc.y - 16, 24, 16);
            
            // Draw eyes
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(npc.x - 8, npc.y - 12, 4, 4);
            this.ctx.fillRect(npc.x + 4, npc.y - 12, 4, 4);
        }
        
        // Draw name tag
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(npc.name, npc.x, npc.y - 20);
        
        // Draw behavior indicator
        this.ctx.fillStyle = '#00FF00';
        this.ctx.beginPath();
        this.ctx.arc(npc.x + 12, npc.y - 12, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    getSaveData() {
        return {
            npcs: this.npcs,
            templates: { ...this.persistentTemplates, ...this.sessionTemplates }
        };
    }
    
    loadSaveData(data) {
        console.log('🔍 Loading save data:', data);
        if (data.npcs) {
            console.log(`📋 Found ${data.npcs.length} NPCs in save data:`, data.npcs.map(npc => `${npc.name} (${npc.id})`));
            this.npcs = data.npcs;
            this.updateNPCList();
            console.log(`✅ Loaded ${data.npcs.length} NPCs from save data`);
        } else {
            console.log('ℹ️ No NPCs found in save data');
        }
        
        if (data.templates) {
            // Only load persistent custom templates, ignore session templates
            Object.entries(data.templates).forEach(([key, template]) => {
                if (template.isCustom && template.storageType === 'persistent') {
                    this.persistentTemplates[key] = template;
                }
            });
            this.savePersistentTemplates(); // Ensure they're saved to localStorage
        }
    }

    clearAllNPCs() {
        console.log(`🧹 Clearing ${this.npcs.length} NPCs:`, this.npcs.map(npc => `${npc.name} (${npc.id})`));
        this.npcs = [];
        this.updateNPCList();
        
        // Also clear NPCs from localStorage
        const savedWorld = localStorage.getItem('blockyBuilderWorld');
        if (savedWorld) {
            try {
                const worldData = JSON.parse(savedWorld);
                console.log(`🗑️ Found ${worldData.npcs ? worldData.npcs.length : 0} NPCs in localStorage:`, worldData.npcs ? worldData.npcs.map(npc => `${npc.name} (${npc.id})`) : 'none');
                worldData.npcs = []; // Clear NPCs from saved data
                localStorage.setItem('blockyBuilderWorld', JSON.stringify(worldData));
                console.log('✅ Cleared NPCs from localStorage');
            } catch (error) {
                console.warn('Failed to clear NPCs from localStorage:', error);
            }
        }
        
        console.log('All NPCs cleared');
    }
}

// Export for use in Blocky Builder
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCBuilder;
} else {
    // Make NPCBuilder available globally for browser
    window.NPCBuilder = NPCBuilder;
}
