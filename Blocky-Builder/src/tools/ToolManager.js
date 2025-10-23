/**
 * Tool Manager - Handles all tool operations and state
 * Manages tool selection, tool-specific actions, and tool cycling
 */
class ToolManager {
    constructor(worldManager, renderer) {
        this.worldManager = worldManager;
        this.renderer = renderer;
        this.currentTool = 'draw';
        this.tools = ['draw', 'erase', 'fill', 'quickfill', 'pan', 'rotate', 'flip', 'spawn', 'npc'];
        
        this.setupTools();
        // Ensure draw tool is selected on initialization
        this.selectTool('draw');
    }

    setupTools() {
        // Initialize tool-specific data
        this.isDrawing = false;
        this.isQuickFilling = false;
        this.quickFillStartX = 0;
        this.quickFillStartY = 0;
    }

    selectTool(tool) {
        console.log('🔍 DEBUG: ToolManager.selectTool called with tool:', tool);
        
        // Don't allow tool selection when Project Setup modal is open
        const modal = document.getElementById('projectModal');
        console.log('🔍 DEBUG: Modal in ToolManager:', modal, 'Display:', modal ? modal.style.display : 'not found');
        
        // Temporarily disable modal check for debugging
        // if (modal && modal.style.display === 'flex') {
        //     console.log('🔍 DEBUG: ToolManager blocked tool selection - modal open');
        //     return; // Block tool selection
        // }
        
        console.log('🔍 DEBUG: Setting current tool to:', tool);
        this.currentTool = tool;
        
        // Update UI
        this.updateToolButtons();
        this.updateCursor();
        this.updateToolDisplay();
        
        // Show/hide tool-specific UI
        this.updateToolUI();
        
        // Track tool usage
        this.trackToolUsage(tool);
        
        console.log('🔍 DEBUG: Tool selection complete, current tool is now:', this.currentTool);
    }

    updateToolButtons() {
        this.tools.forEach(tool => {
            const btn = document.getElementById(tool + 'Btn');
            if (btn) {
                btn.classList.remove('active');
            }
        });
        
        const activeBtn = document.getElementById(this.currentTool + 'Btn');
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    updateCursor() {
        const cursorMap = {
            pan: 'grab',
            spawn: 'cell',
            npc: 'crosshair',
            default: 'crosshair'
        };
        
        const cursor = cursorMap[this.currentTool] || cursorMap.default;
        this.renderer.canvas.style.cursor = cursor;
    }

    updateToolDisplay() {
        const toolElement = document.getElementById('currentTool');
        if (toolElement) {
            toolElement.textContent = this.currentTool.charAt(0).toUpperCase() + this.currentTool.slice(1);
        }
    }

    updateToolUI() {
        // Tool-specific UI updates
        if (this.currentTool === 'npc') {
            this.updateNPCPreviews();
        }
    }

    cycleTools() {
        const currentIndex = this.tools.indexOf(this.currentTool);
        const nextIndex = (currentIndex + 1) % this.tools.length;
        this.selectTool(this.tools[nextIndex]);
    }

    handleToolAction(coords, event) {
        const { x, y } = coords;
        console.log('handleToolAction called with coords:', coords, 'current tool:', this.currentTool);
        console.log('World bounds:', this.worldManager.worldWidth, this.worldManager.worldHeight);
        
        if (x < 0 || x >= this.worldManager.worldWidth || y < 0 || y >= this.worldManager.worldHeight) {
            console.log('Coordinates out of bounds, returning');
            return;
        }

        switch (this.currentTool) {
            case 'draw':
                console.log('Calling handleDrawAction');
                this.handleDrawAction(x, y);
                break;
            case 'erase':
                this.handleEraseAction(x, y);
                break;
            case 'fill':
                this.handleFillAction(x, y);
                break;
            case 'quickfill':
                this.handleQuickFillAction(x, y);
                break;
            case 'pan':
                this.handlePanAction();
                break;
            case 'rotate':
                this.handleRotateAction(x, y);
                break;
            case 'flip':
                this.handleFlipAction(x, y);
                break;
            case 'spawn':
                this.handleSpawnAction(x, y);
                break;
            case 'npc':
                this.handleNPCAction(x, y);
                break;
        }
    }

    handleToolDrag(coords) {
        const { x, y } = coords;
        
        if (x < 0 || x >= this.worldManager.worldWidth || y < 0 || y >= this.worldManager.worldHeight) {
            return;
        }

        switch (this.currentTool) {
            case 'draw':
                this.handleDrawAction(x, y);
                break;
            case 'erase':
                this.handleEraseAction(x, y);
                break;
            case 'quickfill':
                // Update quick fill preview
                this.updateQuickFillPreview(x, y);
                break;
        }
    }

    handleDrawAction(x, y) {
        console.log('handleDrawAction called with:', x, y, 'tile type:', this.worldManager.currentTileType);
        this.worldManager.setTileAt(x, y, this.worldManager.currentTileType);
        console.log('Tile set, calling render');
        this.renderer.render();
    }

    handleEraseAction(x, y) {
        this.worldManager.setTileAt(x, y, 'grass');
        this.renderer.render();
    }

    handleFillAction(x, y) {
        const startTile = this.worldManager.getTileAt(x, y);
        if (startTile && startTile.type !== this.worldManager.currentTileType) {
            this.floodFill(x, y, this.worldManager.currentTileType);
            this.renderer.render();
        }
    }

    handleQuickFillAction(x, y) {
        if (!this.isQuickFilling) {
            this.isQuickFilling = true;
            this.quickFillStartX = x;
            this.quickFillStartY = y;
        } else {
            this.quickFillRect(this.quickFillStartX, this.quickFillStartY, x, y);
            this.isQuickFilling = false;
            this.renderer.render();
        }
    }

    handlePanAction() {
        // Pan action is handled by EventSystem - no need to set flags here
        // The EventSystem will detect pan tool and handle dragging appropriately
    }

    handleRotateAction(x, y) {
        const tile = this.worldManager.getTileAt(x, y);
        if (tile) {
            tile.rotation = (tile.rotation + 90) % 360;
            this.renderer.render();
        }
    }

    handleFlipAction(x, y) {
        const tile = this.worldManager.getTileAt(x, y);
        if (tile) {
            tile.flipped = !tile.flipped;
            this.renderer.render();
        }
    }

    handleSpawnAction(x, y) {
        // Open spawn creation modal
        this.openSpawnModal(x, y);
    }

    handleNPCAction(x, y) {
        // Handle NPC placement or interaction
        this.handleNPCClick(x, y);
    }

    floodFill(startX, startY, newType) {
        const startTile = this.worldManager.getTileAt(startX, startY);
        if (!startTile || startTile.type === newType) return;

        const targetType = startTile.type;
        const stack = [[startX, startY]];
        const visited = new Set();

        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            if (x < 0 || x >= this.worldManager.worldWidth || y < 0 || y >= this.worldManager.worldHeight) continue;

            const tile = this.worldManager.getTileAt(x, y);
            if (!tile || tile.type !== targetType) continue;

            visited.add(key);
            this.worldManager.setTileAt(x, y, newType);

            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }

    quickFillRect(startX, startY, endX, endY) {
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (x >= 0 && x < this.worldManager.worldWidth && y >= 0 && y < this.worldManager.worldHeight) {
                    this.worldManager.setTileAt(x, y, this.worldManager.currentTileType);
                }
            }
        }
    }

    updateQuickFillPreview(x, y) {
        // Implement quick fill preview
    }

    openSpawnModal(x, y) {
        // Implement spawn modal opening
        console.log('Open spawn modal at', x, y);
    }

    handleNPCClick(x, y) {
        // Handle NPC tool click - either open NPC Builder or place NPC if in creation mode
        if (window.editor && window.editor.npcBuilder) {
            // Check if we're in NPC creation mode
            if (window.editor.npcBuilder.isCreatingNPC) {
                // Convert world coordinates to pixel coordinates for NPC placement
                const pixelX = x * window.editor.renderer.TILE_SIZE;
                const pixelY = y * window.editor.renderer.TILE_SIZE;
                window.editor.npcBuilder.placeNPC(pixelX, pixelY);
            } else {
                // Open NPC Builder panel if not in creation mode
                window.editor.npcBuilder.togglePanel();
            }
        } else {
            console.warn('NPC Builder not available');
        }
    }

    updateNPCPreviews() {
        // Implement NPC preview updates
    }

    trackToolUsage(tool) {
        // Track tool usage for statistics
        console.log('Tool used:', tool);
    }

    getCurrentTool() {
        return this.currentTool;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolManager;
} else {
    window.ToolManager = ToolManager;
}
