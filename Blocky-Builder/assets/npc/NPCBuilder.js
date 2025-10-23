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
        
        // Simple file saving
        
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
        
        // Load NPCs from persistent folder
        this.loadNPCsFromPersistentFolder();
        
        // Clean up any orphaned localStorage entries
        this.cleanupOrphanedStorage();
        
        // Merge persistent and session templates
        this.updateTemplateList();
        
        // Note: createTemplateList() will be called after UI is initialized
    }
    
    async loadNPCsFromPersistentFolder() {
        try {
            // List of known persistent NPCs to load
            const persistentNPCs = ['Rat', 'Blacksmith'];
            
            for (const npcName of persistentNPCs) {
                try {
                    // Use relative path - works both locally and on GitHub Pages
                    const jsonUrl = `../assets/npc/persistent/${npcName}.json`;
                    
                    const response = await fetch(jsonUrl);
                    if (response.ok) {
                        const npcData = await response.json();
                        
                        // Load image using relative path
                        const imgUrl = `../assets/npc/persistent/${npcName}.png`;
                        const imgResponse = await fetch(imgUrl);
                        
                        if (imgResponse.ok) {
                            const blob = await imgResponse.blob();
                            const reader = new FileReader();
                            reader.onload = () => {
                                npcData.customImage = reader.result;
                            };
                            reader.readAsDataURL(blob);
                        }
                        
                        // Add to persistent templates
                        const key = `persistent_${npcName.toLowerCase()}`;
                        this.persistentTemplates[key] = {
                            ...npcData,
                            storageType: 'persistent',
                            source: 'file_system'
                        };
                        
                        console.log(`✅ Loaded persistent NPC: ${npcName}`);
                    } else {
                        console.log(`⚠️ NPC ${npcName} not found`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to load persistent NPC ${npcName}:`, error);
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to load NPCs from persistent folder:', error);
        }
    }
    
    cleanupOrphanedStorage() {
        try {
            const currentTemplateKeys = Object.keys(this.persistentTemplates);
            const keysToRemove = [];
            
            // Find localStorage keys that don't match current templates
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('persistent_npc_')) {
                    // Extract the template name from the key
                    const templateName = key.replace('persistent_npc_', '');
                    
                    // Check if this template still exists in our current templates
                    const stillExists = currentTemplateKeys.some(templateKey => {
                        const template = this.persistentTemplates[templateKey];
                        if (template) {
                            const sanitizedName = template.name.replace(/[^a-zA-Z0-9]/g, '_');
                            return sanitizedName === templateName;
                        }
                        return false;
                    });
                    
                    if (!stillExists) {
                        keysToRemove.push(key);
                    }
                }
            }
            
            // Remove orphaned keys
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🧹 Cleaned up orphaned localStorage entry: ${key}`);
            });
            
            if (keysToRemove.length > 0) {
                console.log(`🧹 Cleaned up ${keysToRemove.length} orphaned localStorage entries`);
            }
            
        } catch (error) {
            console.warn('⚠️ Failed to clean up orphaned storage:', error);
        }
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
    
    async saveNPCToFiles(template, key) {
        try {
            // Create NPC data object
            const npcData = {
                id: key,
                name: template.name,
                type: template.type,
                color: template.color,
                behavior: template.behavior,
                speed: template.speed,
                dialogue: template.dialogue,
                icon: template.icon,
                isCustom: template.isCustom,
                customImage: template.customImage,
                width: template.width || 32,
                height: template.height || 32,
                storageType: template.storageType,
                createdAt: new Date().toISOString(),
                version: "1.0"
            };
            
            // Save JSON file
            const sanitizedName = template.name.replace(/[^a-zA-Z0-9]/g, '_');
            const jsonContent = JSON.stringify(npcData, null, 2);
            
            // Download JSON file
            this.downloadFile(jsonContent, `${sanitizedName}.json`, 'application/json');
            
            // Download PNG file if image exists
            if (template.customImage) {
                const imageBlob = this.dataURLToBlob(template.customImage);
                this.downloadFile(imageBlob, `${sanitizedName}.png`, 'image/png');
            }
            
            console.log('📁 NPC files downloaded:', template.name);
        } catch (error) {
            console.error('❌ Failed to save NPC files:', error);
        }
    }
    
    async createNPCPackage(npcName, npcData, imageBlob) {
        const sanitizedName = npcName.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Convert image blob to base64 data URL
        const imageDataUrl = await this.blobToBase64(imageBlob);
        
        // Update npcData with proper image reference
        npcData.customImage = imageDataUrl;
        
        // Save to localStorage for immediate use
        await this.saveToLocalStorage(sanitizedName, npcData, imageBlob);
        
        // Download files for manual upload
        this.downloadFile(JSON.stringify(npcData, null, 2), `${sanitizedName}.json`, 'application/json');
        this.downloadFile(imageBlob, `${sanitizedName}.png`, 'image/png');
        
        console.log(`💾 NPC "${npcName}" saved locally and files downloaded`);
    }
    
    async saveToLocalStorage(sanitizedName, npcData, imageBlob) {
        const persistentKey = `persistent_npc_${sanitizedName}`;
        
        // Convert image blob to base64 data URL
        const imageDataUrl = await this.blobToBase64(imageBlob);
        
        // Update NPC data to include the image
        npcData.customImage = imageDataUrl;
        
        const storageData = {
            json: JSON.stringify(npcData, null, 2),
            image: imageDataUrl,
            timestamp: Date.now()
        };
        
        localStorage.setItem(persistentKey, JSON.stringify(storageData));
        
        // Also save to the main persistent templates
        const templateKey = `persistent_${sanitizedName.toLowerCase()}`;
        this.persistentTemplates[templateKey] = {
            ...npcData,
            storageType: 'persistent',
            source: 'localStorage'
        };
        
        this.savePersistentTemplates();
        this.updateTemplateList();
        this.createTemplateList();
    }
    
    blobToBase64(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }
    
    showDeploymentSuccess(npcName) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            max-width: 300px;
        `;
        
        toast.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">✅ NPC Deployed Successfully!</div>
            <div>NPC "${npcName}" is now available on GitHub Pages and will be accessible to all users.</div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 5000);
    }
    
    showGitHubTokenPrompt() {
        if (this.githubDeployer) {
            this.githubDeployer.createTokenSetupUI();
        }
    }
    
    showManualDeploymentInstructions(npcName) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h3>Manual Deployment Required</h3>
                <p>NPC "${npcName}" has been saved locally and a package file has been downloaded.</p>
                
                <h4>To make it available on GitHub Pages:</h4>
                <ol style="text-align: left; margin: 15px 0;">
                    <li>Check your Downloads folder for <code>${npcName.replace(/[^a-zA-Z0-9]/g, '_')}_NPC_Package.json</code></li>
                    <li>Run: <code>node deploy-npc.js ${npcName.replace(/[^a-zA-Z0-9]/g, '_')}_NPC_Package.json</code></li>
                    <li>Commit and push the files to GitHub</li>
                    <li>The NPC will be available to all users!</li>
                </ol>
                
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                    <strong>Alternative:</strong> Set up GitHub token for automatic deployment:
                    <button id="setup-github-token" style="margin-left: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px;">Setup GitHub Token</button>
                </div>
                
                <div style="text-align: right; margin-top: 20px;">
                    <button id="close-manual-instructions" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px;">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('close-manual-instructions').onclick = () => {
            document.body.removeChild(modal);
        };
        
        document.getElementById('setup-github-token').onclick = () => {
            document.body.removeChild(modal);
            if (this.githubDeployer) {
                this.githubDeployer.createTokenSetupUI();
            }
        };
    }
    
    dataURLToBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }
    
    downloadFile(data, filename, mimeType) {
        const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
    
    initializeUI() {
        this.createNPCPanel();
        this.createConfigPanel();
        this.setupEventListeners();
        
        // Create template list after UI is initialized
        this.createTemplateList();
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
                        <button id="npc-load-custom-btn" class="npc-load-custom-btn">
                            <span class="npc-tool-icon">📂</span>
                            Load NPC File
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
                                    <option value="hostile">Hostile</option>
                                    <option value="defensive">Defensive</option>
                                    <option value="aggressive">Aggressive</option>
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
    
    async confirmCustomNPC() {
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
            width: 32, // Default width for custom NPCs
            height: 32, // Default height for custom NPCs
            storageType: storageType // Track how it was stored
        };
        
        // Add to appropriate storage
        if (storageType === 'persistent') {
            this.persistentTemplates[customKey] = customTemplate;
            this.savePersistentTemplates();
            // Also save as downloadable files
            await this.saveNPCToFiles(customTemplate, customKey);
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
    
    openLoadModal() {
        // Create file input for JSON files
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadNPCFromFile(file);
            }
            // Clean up
            document.body.removeChild(input);
        });
        
        document.body.appendChild(input);
        input.click();
    }
    
    loadNPCFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const npcData = JSON.parse(e.target.result);
                
                // Validate the NPC data
                if (!npcData.name || !npcData.type) {
                    alert('Invalid NPC file format. Missing required fields.');
                    return;
                }
                
                // Create template from loaded data
                const customKey = `loaded_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const customTemplate = {
                    name: npcData.name,
                    type: npcData.type || 'custom',
                    color: npcData.color || '#8B4513',
                    behavior: npcData.behavior || 'idle',
                    speed: npcData.speed || 0.5,
                    dialogue: npcData.dialogue || ['Hello there!'],
                    icon: npcData.icon || '🎨',
                    customImage: npcData.customImage || null, // Use customImage from loaded data
                    isCustom: true,
                    width: npcData.width || 32, // Include width from loaded data
                    height: npcData.height || 32, // Include height from loaded data
                    storageType: 'session', // Loaded NPCs are session-only by default
                    loadedFromFile: true,
                    originalData: npcData
                };
                
                // Add to session templates
                this.sessionTemplates[customKey] = customTemplate;
                this.updateTemplateList();
                this.createTemplateList();
                
                console.log('📂 NPC loaded from file:', customTemplate.name);
                alert(`NPC "${customTemplate.name}" loaded successfully! Note: You'll need to upload the image separately if it wasn't included.`);
                
            } catch (error) {
                console.error('❌ Failed to load NPC file:', error);
                alert('Failed to load NPC file. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    }
    
    createTemplateList() {
        this.templateList = document.getElementById('npc-template-list');
        
        // Safety check: ensure the template list element exists
        if (!this.templateList) {
            console.warn('⚠️ Template list element not found, skipping template list creation');
            return;
        }
        
        // Clear existing template items to prevent duplication
        this.templateList.innerHTML = '';
        
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
                <div class="npc-template-actions">
                    <button class="npc-template-delete-btn" data-template="${key}" title="Delete NPC">
                        🗑️
                    </button>
                </div>
            `;
            
            templateItem.addEventListener('click', () => {
                this.selectTemplate(key);
            });
            
            // Add delete button event listener
            const deleteBtn = templateItem.querySelector('.npc-template-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent template selection
                this.deleteTemplate(key, template.name);
            });
            
            this.templateList.appendChild(templateItem);
        });
    }
    
    deleteTemplate(templateKey, templateName) {
        if (confirm(`Are you sure you want to delete "${templateName}"? This will remove it from both persistent and session storage.`)) {
            // Remove from persistent templates if it exists there
            if (this.persistentTemplates[templateKey]) {
                delete this.persistentTemplates[templateKey];
                this.savePersistentTemplates();
                
                // Also clean up individual localStorage entries
                this.cleanupPersistentStorage(templateKey, templateName);
                
                console.log(`🗑️ Deleted persistent NPC: ${templateName}`);
            }
            
            // Remove from session templates if it exists there
            if (this.sessionTemplates[templateKey]) {
                delete this.sessionTemplates[templateKey];
                console.log(`🗑️ Deleted session NPC: ${templateName}`);
            }
            
            // Update template list
            this.updateTemplateList();
            this.createTemplateList();
            
            // Clear selection if this template was selected
            if (this.selectedNPCTemplate === templateKey) {
                this.selectedNPCTemplate = null;
                this.updateConfigPanel();
            }
            
            console.log(`✅ NPC "${templateName}" deleted successfully`);
        }
    }
    
    cleanupPersistentStorage(templateKey, templateName) {
        try {
            // Clean up individual NPC storage entries
            const sanitizedName = templateName.replace(/[^a-zA-Z0-9]/g, '_');
            const persistentKey = `persistent_npc_${sanitizedName}`;
            
            // Remove the individual NPC storage entry
            localStorage.removeItem(persistentKey);
            console.log(`🧹 Cleaned up localStorage entry: ${persistentKey}`);
            
            // Also clean up any old storage keys that might match
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('persistent_npc_') && key.includes(sanitizedName)) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove any matching keys
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🧹 Cleaned up additional localStorage entry: ${key}`);
            });
            
        } catch (error) {
            console.warn('⚠️ Failed to clean up persistent storage:', error);
        }
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
                        <option value="hostile" ${template.behavior === 'hostile' ? 'selected' : ''}>Hostile</option>
                        <option value="defensive" ${template.behavior === 'defensive' ? 'selected' : ''}>Defensive</option>
                        <option value="aggressive" ${template.behavior === 'aggressive' ? 'selected' : ''}>Aggressive</option>
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
                
                <div class="npc-config-group npc-combat-config" style="display: ${['hostile', 'defensive', 'aggressive'].includes(template.behavior) ? 'block' : 'none'}">
                    <h4>⚔️ Combat Properties</h4>
                    <div class="npc-combat-grid">
                        <div class="npc-combat-field">
                            <label for="npc-health">Health:</label>
                            <input type="number" id="npc-health" min="1" max="1000" value="${template.health || 50}">
                        </div>
                        <div class="npc-combat-field">
                            <label for="npc-max-health">Max Health:</label>
                            <input type="number" id="npc-max-health" min="1" max="1000" value="${template.maxHealth || 50}">
                        </div>
                        <div class="npc-combat-field">
                            <label for="npc-attack-damage">Damage:</label>
                            <input type="number" id="npc-attack-damage" min="1" max="100" value="${template.attackDamage || 10}">
                        </div>
                        <div class="npc-combat-field">
                            <label for="npc-attack-cooldown">Cooldown (ms):</label>
                            <input type="number" id="npc-attack-cooldown" min="100" max="5000" step="100" value="${template.attackCooldown || 1000}">
                        </div>
                        <div class="npc-combat-field span-2">
                            <label for="npc-detection-radius">Detection Radius:</label>
                            <input type="range" id="npc-detection-radius" min="10" max="200" value="${template.detectionRadius || 80}">
                            <span class="npc-detection-value">${template.detectionRadius || 80} px</span>
                        </div>
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
        
        // Detection radius slider handler
        const detectionSlider = document.getElementById('npc-detection-radius');
        const detectionValue = document.querySelector('.npc-detection-value');
        if (detectionSlider && detectionValue) {
            detectionSlider.addEventListener('input', (e) => {
                detectionValue.textContent = `${e.target.value} px`;
            });
        }
        
        // Health validation handler
        const healthInput = document.getElementById('npc-health');
        const maxHealthInput = document.getElementById('npc-max-health');
        if (healthInput && maxHealthInput) {
            const validateHealth = () => {
                const health = parseInt(healthInput.value) || 1;
                const maxHealth = parseInt(maxHealthInput.value) || 1;
                if (health > maxHealth) {
                    healthInput.value = maxHealth;
                }
            };
            
            healthInput.addEventListener('input', validateHealth);
            maxHealthInput.addEventListener('input', validateHealth);
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
        const combatConfig = document.querySelector('.npc-combat-config');
        
        if (wanderConfig) {
            wanderConfig.style.display = behavior === 'wander' ? 'block' : 'none';
        }
        
        if (patrolConfig) {
            patrolConfig.style.display = behavior === 'patrol' ? 'block' : 'none';
        }
        
        if (combatConfig) {
            combatConfig.style.display = ['hostile', 'defensive', 'aggressive'].includes(behavior) ? 'block' : 'none';
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
            isCustom: template.isCustom || false,
            // Add default dimensions for custom NPCs
            width: template.width || 32,
            height: template.height || 32
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
        
        // Add combat properties for hostile/defensive/aggressive behaviors
        if (['hostile', 'defensive', 'aggressive'].includes(behavior)) {
            config.health = parseInt(document.getElementById('npc-health').value) || 50;
            config.maxHealth = parseInt(document.getElementById('npc-max-health').value) || 50;
            config.detectionRadius = parseInt(document.getElementById('npc-detection-radius').value) || 80;
            config.attackDamage = parseInt(document.getElementById('npc-attack-damage').value) || 10;
            config.attackCooldown = parseInt(document.getElementById('npc-attack-cooldown').value) || 1000;
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
        
        // Populate combat properties if they exist
        if (npc.health !== undefined) {
            document.getElementById('npc-health').value = npc.health;
        }
        if (npc.maxHealth !== undefined) {
            document.getElementById('npc-max-health').value = npc.maxHealth;
        }
        if (npc.detectionRadius !== undefined) {
            document.getElementById('npc-detection-radius').value = npc.detectionRadius;
        }
        if (npc.attackDamage !== undefined) {
            document.getElementById('npc-attack-damage').value = npc.attackDamage;
        }
        if (npc.attackCooldown !== undefined) {
            document.getElementById('npc-attack-cooldown').value = npc.attackCooldown;
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
        // Canvas click handler removed - NPC placement is now handled through ToolManager
        // This prevents duplicate event handling and conflicts with tile placement
        
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
        
        // Load Custom NPC button
        document.getElementById('npc-load-custom-btn').addEventListener('click', () => {
            this.openLoadModal();
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
        if (!this.npcPanel) {
            console.error('NPC panel not found!');
            return;
        }
        
        const content = this.npcPanel.querySelector('.npc-panel-content');
        const toggleBtn = document.getElementById('npc-panel-toggle');
        
        const isHidden = this.npcPanel.style.display === 'none' || 
                         this.npcPanel.style.display === '' || 
                         !this.npcPanel.style.display;
        
        if (isHidden) {
            this.npcPanel.style.display = 'block';
            if (content) content.style.display = 'block'; // Show the content too
            if (toggleBtn) toggleBtn.textContent = '−';
        } else {
            this.npcPanel.style.display = 'none';
            if (toggleBtn) toggleBtn.textContent = '+';
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
    
    // NPC rendering is now handled by the main Renderer
    // This method is kept for potential future use but is not called
    
    renderNPC(npc, isPreview = false) {
        this.ctx.save();
        
        if (isPreview) {
            this.ctx.globalAlpha = 0.7;
        }
        
        // NPCs are already stored in pixel coordinates
        const pixelX = npc.x;
        const pixelY = npc.y;
        
        // Check if NPC has custom image
        if (npc.isCustom && npc.customImage) {
            // Try to draw cached image first
            if (npc.cachedImage && npc.cachedImage.complete && npc.cachedImage.naturalWidth > 0) {
                this.ctx.drawImage(npc.cachedImage, pixelX - 16, pixelY - 16, 32, 32);
            } else {
                // Create and cache image element if not already done
                if (!npc.cachedImage) {
                    npc.cachedImage = new Image();
                    npc.cachedImage.onload = () => {
                        // Image loaded successfully, will be drawn on next render
                    };
                    npc.cachedImage.onerror = () => {
                        console.warn('Failed to load custom NPC image:', npc.name);
                    };
                    npc.cachedImage.src = npc.customImage;
                }
                
                // Draw fallback while image is loading
                this.ctx.fillStyle = npc.color || '#8B4513';
                this.ctx.fillRect(pixelX - 16, pixelY - 16, 32, 32);
                
                // Draw custom indicator
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(pixelX - 12, pixelY - 12, 24, 8);
            }
        } else {
            // Draw default NPC body
            this.ctx.fillStyle = npc.color;
            this.ctx.fillRect(pixelX - 16, pixelY - 16, 32, 32);
            
            // Draw NPC face
            this.ctx.fillStyle = '#FFE4B5';
            this.ctx.fillRect(pixelX - 12, pixelY - 16, 24, 16);
            
            // Draw eyes
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(pixelX - 8, pixelY - 12, 4, 4);
            this.ctx.fillRect(pixelX + 4, pixelY - 12, 4, 4);
        }
        
        // Draw name tag
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(npc.name, pixelX, pixelY - 20);
        
        // Draw behavior indicator
        this.ctx.fillStyle = '#00FF00';
        this.ctx.beginPath();
        this.ctx.arc(pixelX + 12, pixelY - 12, 3, 0, Math.PI * 2);
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
        
        // Clear existing NPCs before loading new ones
        this.npcs = [];
        
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
    
    /**
     * Load NPCs from world save data
     */
    loadSaveData(worldData) {
        if (!worldData.npcs || !Array.isArray(worldData.npcs)) {
            console.log('ℹ️ No NPCs found in world data to load');
            return;
        }
        
        console.log(`📂 Loading ${worldData.npcs.length} NPCs from world data`);
        
        // Clear existing NPCs
        this.npcs = [];
        
        // Load each NPC from world data
        worldData.npcs.forEach(npcData => {
            try {
                // Keep pixel coordinates as-is for NPCBuilder
                const npc = {
                    id: npcData.id,
                    name: npcData.name,
                    type: npcData.type || 'townie',
                    x: npcData.x, // Store as pixel coordinates for NPCBuilder
                    y: npcData.y,
                    dialogue: npcData.dialogue || ['Hello there!'],
                    behavior: npcData.behavior || 'idle',
                    wanderRadius: npcData.wanderRadius || 50,
                    patrolPoints: npcData.patrolPoints || [],
                    color: npcData.color || '#8B4513',
                    interactable: npcData.interactable !== false,
                    // Include custom image fields if present
                    customImage: npcData.customImage || null,
                    isCustom: npcData.isCustom || false,
                    width: npcData.width || 32,
                    height: npcData.height || 32,
                    // Include combat properties if present
                    health: npcData.health,
                    maxHealth: npcData.maxHealth,
                    detectionRadius: npcData.detectionRadius,
                    attackDamage: npcData.attackDamage,
                    attackCooldown: npcData.attackCooldown
                };
                
                this.npcs.push(npc);
                console.log(`✅ Loaded NPC: ${npc.name} at tile (${tileX}, ${tileY})`);
                
            } catch (error) {
                console.error(`❌ Failed to load NPC:`, npcData, error);
            }
        });
        
        // Update the NPC list display
        this.updateNPCList();
        
        console.log(`✅ Successfully loaded ${this.npcs.length} NPCs from world data`);
    }
}

// Export for use in Blocky Builder
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCBuilder;
} else {
    // Make NPCBuilder available globally for browser
    window.NPCBuilder = NPCBuilder;
}
