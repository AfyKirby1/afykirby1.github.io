/**
 * Event System - Handles all user input and events
 * Manages mouse, keyboard, and UI interactions
 */
class EventSystem {
    constructor(canvas, worldManager, renderer, toolManager) {
        console.log('🔍 DEBUG: EventSystem constructor called with canvas:', canvas);
        this.canvas = canvas;
        this.worldManager = worldManager;
        this.renderer = renderer;
        this.toolManager = toolManager;
        
        this.isDrawing = false;
        this.isPanning = false;
        this.isRightDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Performance optimization: frame rate limiting
        this.lastRenderTime = 0;
        this.renderThrottle = 16; // ~60 FPS (16ms)
        this.pendingRender = false;
        
        this.setupEventListeners();
        console.log('🔍 DEBUG: EventSystem setup complete');
    }

    setupEventListeners() {
        console.log('🔍 DEBUG: Setting up event listeners on canvas:', this.canvas);
        
        // Add a simple test event listener to verify canvas is working
        this.canvas.addEventListener('click', (e) => {
            console.log('🔍 DEBUG: CANVAS CLICK DETECTED!', e);
        });
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Window events
        window.addEventListener('resize', () => this.handleResize());
        
        // Note: Canvas resize timing is now handled manually in toggle functions
        // to ensure smooth animations without jumping
        
        console.log('🔍 DEBUG: Event listeners setup complete');
    }

    handleMouseDown(e) {
        const coords = this.renderer.getWorldCoords(e.clientX, e.clientY);
        console.log('Mouse down - Screen coords:', e.clientX, e.clientY, 'World coords:', coords);
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        // Right mouse button - start drag
        if (e.button === 2) {
            this.isRightDragging = true;
            this.canvas.style.cursor = 'grabbing';
            e.preventDefault();
            return;
        }

        // Middle mouse button - cycle zoom presets
        if (e.button === 1) {
            e.preventDefault();
            this.cycleZoomPresets();
            return;
        }

        // Left mouse button - tool action
        if (e.button === 0) { // Left mouse button
            console.log('Left click detected, calling handleToolAction');
            this.isDrawing = true;
            this.toolManager.handleToolAction(coords, e);
        }
    }

    handleMouseMove(e) {
        const coords = this.renderer.getWorldCoords(e.clientX, e.clientY);
        
        // Update mouse position display
        const mousePosElement = document.getElementById('mousePos');
        if (mousePosElement) {
            mousePosElement.textContent = `${coords.x}, ${coords.y}`;
        }

        if (this.isRightDragging) {
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            this.renderer.pan(deltaX, deltaY);
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            
            // Set panning flag for performance optimization
            this.renderer.isPanning = true;
            
            // Throttled rendering for smooth panning
            this.throttledRender();
        } else if (this.isDrawing) {
            // Check if pan tool is selected for left-click panning
            if (this.toolManager.getCurrentTool() === 'pan') {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                this.renderer.pan(deltaX, deltaY);
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                
                // Set panning flag for performance optimization
                this.renderer.isPanning = true;
                
                // Throttled rendering for smooth panning
                this.throttledRender();
            } else {
                this.toolManager.handleToolDrag(coords);
            }
        }
    }

    handleMouseUp(e) {
        this.isPanning = false;
        this.isDrawing = false;
        this.isRightDragging = false;
        
        // Clear panning flag for performance optimization
        this.renderer.isPanning = false;
        
        // Ensure final render after panning stops
        if (this.pendingRender) {
            this.renderer.render();
            this.pendingRender = false;
        }
        
        const currentTool = this.toolManager.getCurrentTool();
        if (currentTool === 'pan') {
            this.canvas.style.cursor = 'grab';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = this.worldManager.zoom * delta;
        this.renderer.zoomTo(newZoom);
        
        const zoomLevelElement = document.getElementById('zoomLevel');
        if (zoomLevelElement) {
            zoomLevelElement.textContent = Math.round(this.worldManager.zoom * 100) + '%';
        }
        
        this.renderer.render();
    }

    handleKeyDown(e) {
        // Don't process tool shortcuts when Project Setup modal is open
        const modal = document.getElementById('projectModal');
        if (modal && modal.style.display === 'flex') {
            return; // Block all tool shortcuts
        }
        
        // Don't process tool shortcuts when typing in input fields
        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.tagName === 'SELECT' ||
            activeElement.contentEditable === 'true'
        )) {
            return; // Block tool shortcuts when typing
        }
        
        // Tool shortcuts
        switch (e.key.toLowerCase()) {
            case 'd':
                e.preventDefault();
                this.toolManager.selectTool('draw');
                break;
            case 'e':
                e.preventDefault();
                this.toolManager.selectTool('erase');
                break;
            case 'f':
                e.preventDefault();
                this.toolManager.selectTool('fill');
                break;
            case 'p':
                e.preventDefault();
                this.toolManager.selectTool('pan');
                break;
            case 'r':
                e.preventDefault();
                this.toolManager.selectTool('rotate');
                break;
            case 'x':
                e.preventDefault();
                this.toolManager.selectTool('flip');
                break;
            case 's':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    // Save checkpoint
                    this.saveCheckpoint();
                } else {
                    e.preventDefault();
                    this.toolManager.selectTool('spawn');
                }
                break;
            case 'delete':
            case 'backspace':
                e.preventDefault();
                this.toolManager.selectTool('deletespawn');
                break;
            case 'n':
                e.preventDefault();
                this.toolManager.selectTool('npc');
                break;
            case 'b':
                e.preventDefault();
                this.toolManager.selectTool('building');
                break;
            case 'tab':
                e.preventDefault();
                this.toolManager.cycleTools();
                break;
            case 'escape':
                e.preventDefault();
                this.resetView();
                break;
            case 'g':
                e.preventDefault();
                this.toggleGrid();
                break;
            case 'q':
                e.preventDefault();
                this.toggleLeftPanel();
                break;
            case 'e':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleRightPanel();
                }
                break;
        }

        // Undo/Redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            this.undo();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            this.redo();
        }
    }

    handleKeyUp(e) {
        // Handle key up events if needed
    }

    handleResize() {
        this.renderer.resizeCanvas();
        this.renderer.render();
    }

    cycleZoomPresets() {
        const presets = [0.25, 0.5, 1, 2, 4];
        const currentZoom = this.worldManager.zoom;
        const currentIndex = presets.findIndex(preset => Math.abs(preset - currentZoom) < 0.1);
        const nextIndex = (currentIndex + 1) % presets.length;
        
        this.renderer.zoomTo(presets[nextIndex]);
        
        const zoomLevelElement = document.getElementById('zoomLevel');
        if (zoomLevelElement) {
            zoomLevelElement.textContent = Math.round(this.worldManager.zoom * 100) + '%';
        }
        
        this.renderer.render();
    }

    resetView() {
        // Reset view to world origin and center
        this.worldManager.viewX = 0;
        this.worldManager.viewY = 0;
        this.worldManager.zoom = 0.3; // Show more of the world
        
        const zoomLevelElement = document.getElementById('zoomLevel');
        if (zoomLevelElement) {
            zoomLevelElement.textContent = '30%';
        }
        
        // Center the viewport on the world
        this.renderer.centerOnWorld();
    }

    toggleGrid() {
        this.worldManager.showGrid = !this.worldManager.showGrid;
        this.renderer.render();
    }

    // Performance optimization: throttled rendering
    throttledRender() {
        const now = performance.now();
        if (now - this.lastRenderTime >= this.renderThrottle) {
            this.renderer.render();
            this.lastRenderTime = now;
            this.pendingRender = false;
        } else {
            this.pendingRender = true;
        }
    }

    toggleLeftPanel() {
        const panel = document.getElementById('leftToolbar');
        const btn = panel.querySelector('.minimize-btn');

        // Measure canvas center before DOM changes
        const canvas = this.canvas;
        const before = canvas.getBoundingClientRect();
        const beforeCenterX = before.left + before.width / 2;

        if (panel.classList.contains('minimized')) {
            panel.classList.remove('minimized');
            btn.textContent = '◀';
            btn.title = 'Minimize Panel';
        } else {
            panel.classList.add('minimized');
            btn.textContent = '▶';
            btn.title = 'Expand Panel';
        }

        // After layout updates, compute the canvas center shift and compensate
        requestAnimationFrame(() => {
            const after = canvas.getBoundingClientRect();
            const afterCenterX = after.left + after.width / 2;
            const deltaCenterX = afterCenterX - beforeCenterX; // +right, -left shift in CSS px

            // Compensate view so the same world point stays under the same screen coordinate
            if (deltaCenterX !== 0) {
                this.worldManager.viewX += deltaCenterX / Math.max(0.0001, this.worldManager.zoom);
            }

            this.renderer.resizeCanvas();
        });
    }

    toggleRightPanel() {
        const panel = document.getElementById('rightPanel');
        const btn = panel.querySelector('.minimize-btn');

        // Measure canvas center before DOM changes
        const canvas = this.canvas;
        const before = canvas.getBoundingClientRect();
        const beforeCenterX = before.left + before.width / 2;

        if (panel.classList.contains('minimized')) {
            panel.classList.remove('minimized');
            btn.textContent = '◀';
            btn.title = 'Minimize Panel';
        } else {
            panel.classList.add('minimized');
            btn.textContent = '▶';
            btn.title = 'Expand Panel';
        }

        // After layout updates, compute the canvas center shift and compensate
        requestAnimationFrame(() => {
            const after = canvas.getBoundingClientRect();
            const afterCenterX = after.left + after.width / 2;
            const deltaCenterX = afterCenterX - beforeCenterX; // +right, -left shift in CSS px

            if (deltaCenterX !== 0) {
                this.worldManager.viewX += deltaCenterX / Math.max(0.0001, this.worldManager.zoom);
            }

            this.renderer.resizeCanvas();
        });
    }

    undo() {
        // Implement undo functionality
        console.log('Undo');
    }

    redo() {
        // Implement redo functionality
        console.log('Redo');
    }

    saveCheckpoint() {
        // Implement checkpoint save
        console.log('Save checkpoint');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventSystem;
} else {
    window.EventSystem = EventSystem;
}
