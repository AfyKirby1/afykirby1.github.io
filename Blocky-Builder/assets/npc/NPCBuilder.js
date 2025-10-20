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
        this.npcs = [];
        
        // UI elements
        this.npcPanel = null;
        this.templateList = null;
        this.configPanel = null;
        
        // NPC templates
        this.npcTemplates = {
            townie: {
                name: "Townie",
                type: "townie",
                color: "#8B4513",
                behavior: "wander",
                wanderRadius: 50,
                speed: 0.5,
                dialogue: ["Hello there!", "Nice day, isn't it?"],
                icon: "👤"
            },
            merchant: {
                name: "Merchant",
                type: "merchant",
                color: "#4169E1",
                behavior: "idle",
                shopItems: [],
                dialogue: ["Welcome to my shop!", "Looking for something specific?"],
                icon: "🛒"
            },
            guard: {
                name: "Guard",
                type: "guard",
                color: "#696969",
                behavior: "patrol",
                patrolPoints: [],
                speed: 0.7,
                dialogue: ["Halt! Who goes there?", "The town is safe under my watch."],
                icon: "🛡️"
            },
            quest_giver: {
                name: "Quest Giver",
                type: "quest_giver",
                color: "#32CD32",
                behavior: "idle",
                quests: [],
                dialogue: ["I have a task for you.", "The town needs your help!"],
                icon: "⚔️"
            },
            child: {
                name: "Child",
                type: "child",
                color: "#FFB6C1",
                behavior: "wander",
                wanderRadius: 30,
                speed: 0.8,
                dialogue: ["Hi! Want to play?", "I found something cool!"],
                icon: "👶"
            },
            elder: {
                name: "Elder",
                type: "elder",
                color: "#8B008B",
                behavior: "idle",
                dialogue: ["The old ways are fading...", "Wisdom comes with age."],
                icon: "👴"
            }
        };
        
        this.initializeUI();
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
        this.npcPanel.innerHTML = `
            <div class="npc-panel-header">
                <h3>NPC Builder</h3>
                <button id="npc-panel-toggle" class="npc-toggle-btn">−</button>
            </div>
            <div class="npc-panel-content">
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
                </div>
                <div class="npc-template-section">
                    <h4>NPC Templates</h4>
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
    }
    
    createTemplateList() {
        this.templateList = document.getElementById('npc-template-list');
        
        Object.entries(this.npcTemplates).forEach(([key, template]) => {
            const templateItem = document.createElement('div');
            templateItem.className = 'npc-template-item';
            templateItem.dataset.template = key;
            templateItem.innerHTML = `
                <div class="npc-template-icon">${template.icon}</div>
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
        const npc = {
            id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            template: this.selectedNPCTemplate,
            x: x,
            y: y,
            ...config
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
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
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
    }
    
    togglePanel() {
        const content = this.npcPanel.querySelector('.npc-panel-content');
        const toggleBtn = document.getElementById('npc-panel-toggle');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggleBtn.textContent = '−';
        } else {
            content.style.display = 'none';
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
        
        // Draw NPC body
        this.ctx.fillStyle = npc.color;
        this.ctx.fillRect(npc.x - 16, npc.y - 16, 32, 32);
        
        // Draw NPC face
        this.ctx.fillStyle = '#FFE4B5';
        this.ctx.fillRect(npc.x - 12, npc.y - 16, 24, 16);
        
        // Draw eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(npc.x - 8, npc.y - 12, 4, 4);
        this.ctx.fillRect(npc.x + 4, npc.y - 12, 4, 4);
        
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
            templates: this.npcTemplates
        };
    }
    
    loadSaveData(data) {
        if (data.npcs) {
            this.npcs = data.npcs;
            this.updateNPCList();
        }
        
        if (data.templates) {
            this.npcTemplates = { ...this.npcTemplates, ...data.templates };
        }
    }
}

// Export for use in Blocky Builder
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCBuilder;
}
