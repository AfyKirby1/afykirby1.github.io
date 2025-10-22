/**
 * Renderer - Handles all canvas rendering operations
 * Manages viewport, zoom, and drawing operations
 */
class Renderer {
    constructor(canvas, worldManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.worldManager = worldManager;
        this.TILE_SIZE = 32;
        this.textures = new Map();
        this.texturesLoaded = false;
        this.backgroundColor = '#0a0a0a'; // Default background color
        this.isPanning = false; // Performance optimization flag
        this.experimentalRendering = false; // Beta feature flag
        this.performanceMode = false; // Performance optimization flag
        
        this.loadTextures();
    }

    async loadTextures() {
        const textureFiles = {
            grass: '../assets/Ground_Texture_1.png',
            water: '../assets/Water_Texture.png',
            cave: '../assets/Cave_Texture_1.png'
        };

        const loadPromises = Object.entries(textureFiles).map(([type, path]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.textures.set(type, img);
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load texture: ${path}`);
                    resolve(); // Continue without this texture
                };
                img.src = path;
            });
        });

        await Promise.all(loadPromises);
        this.texturesLoaded = true;
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    render() {
        // Ensure canvas is properly sized
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            this.resizeCanvas();
        }

        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        
        // Center the world in the viewport with pan offset
        const worldCenterX = (this.worldManager.worldWidth * this.TILE_SIZE) / 2;
        const worldCenterY = (this.worldManager.worldHeight * this.TILE_SIZE) / 2;
        
        // Apply zoom and pan
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.worldManager.zoom, this.worldManager.zoom);
        this.ctx.translate(-worldCenterX + this.worldManager.viewX, -worldCenterY + this.worldManager.viewY);

        // Render tiles first
        this.renderTiles();

        // Render grid ON TOP of tiles - now in transformed coordinate space
        if (this.worldManager.showGrid && !this.isPanning) {
            this.renderGrid();
        }

        this.ctx.restore();

        // Render minimap
        this.renderMinimap();
    }

    renderTiles() {
        const tileSize = this.TILE_SIZE;
        let renderedCount = 0;
        
        // DISABLE CULLING - RENDER ALL TILES
        this.worldManager.tiles.forEach(tile => {
            const x = tile.x * tileSize;
            const y = tile.y * tileSize;
            renderedCount++;
            
            // Optimize: only save/restore if transformations are needed
            const needsTransform = tile.rotation !== 0 || tile.flipped;
            if (needsTransform) {
                this.ctx.save();
                this.ctx.translate(x + tileSize / 2, y + tileSize / 2);
                
                if (tile.rotation !== 0) {
                    this.ctx.rotate((tile.rotation * Math.PI) / 180);
                }
                if (tile.flipped) {
                    this.ctx.scale(-1, 1);
                }
                
                // Draw texture or color
                const texture = this.textures.get(tile.type);
                if (texture && this.texturesLoaded) {
                    this.ctx.drawImage(texture, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                } else {
                    this.ctx.fillStyle = tile.color;
                    this.ctx.fillRect(-tileSize / 2, -tileSize / 2, tileSize, tileSize);
                }
                
                this.ctx.restore();
            } else {
                // Direct drawing without transformations
                const texture = this.textures.get(tile.type);
                if (texture && this.texturesLoaded) {
                    this.ctx.drawImage(texture, x, y, tileSize, tileSize);
                } else {
                    this.ctx.fillStyle = tile.color;
                    this.ctx.fillRect(x, y, tileSize, tileSize);
                }
            }
        });
    }

    renderGrid() {
        const tileSize = this.TILE_SIZE;
        const worldWidth = this.worldManager.worldWidth * tileSize;
        const worldHeight = this.worldManager.worldHeight * tileSize;
        
        // Get grid color from worldManager
        const gridColorMap = {
            'white': 'rgba(255, 255, 255, 1.0)',
            'black': 'rgba(0, 0, 0, 1.0)',
            'green': 'rgba(0, 255, 0, 1.0)',
            'brown': 'rgba(139, 69, 19, 1.0)',
            'yellow': 'rgba(255, 255, 0, 1.0)'
        };
        
        // Draw grid lines across the entire visible world
        this.ctx.strokeStyle = gridColorMap[this.worldManager.gridColor] || 'rgba(255, 255, 255, 1.0)';
        this.ctx.lineWidth = 2; // Thicker lines

        // Draw vertical grid lines (every tileSize pixels)
        for (let x = 0; x <= worldWidth; x += tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, worldHeight);
            this.ctx.stroke();
        }

        // Draw horizontal grid lines (every tileSize pixels)
        for (let y = 0; y <= worldHeight; y += tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(worldWidth, y);
            this.ctx.stroke();
        }
        
        // Draw world boundary
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 1.0)'; // Bright red boundary
        this.ctx.lineWidth = 4; // Thicker boundary
        this.ctx.strokeRect(0, 0, worldWidth, worldHeight);
    }

    enableExperimentalRendering() {
        this.experimentalRendering = true;
        console.log('Experimental rendering enabled');
    }

    disableExperimentalRendering() {
        this.experimentalRendering = false;
        console.log('Experimental rendering disabled');
    }

    enablePerformanceMode() {
        this.performanceMode = true;
        console.log('Performance mode enabled');
    }

    disablePerformanceMode() {
        this.performanceMode = false;
        console.log('Performance mode disabled');
    }

    renderMinimap() {
        const minimap = document.getElementById('minimap');
        if (!minimap) return;

        const minimapCtx = minimap.getContext('2d');
        const minimapWidth = minimap.width;
        const minimapHeight = minimap.height;
        const pixelSize = Math.max(1, Math.floor(Math.min(minimapWidth / this.worldManager.worldWidth, minimapHeight / this.worldManager.worldHeight)));

        // Clear minimap
        minimapCtx.fillStyle = '#1a1a1a';
        minimapCtx.fillRect(0, 0, minimapWidth, minimapHeight);

        // Draw world
        this.worldManager.tiles.forEach(tile => {
            const x = tile.x * pixelSize;
            const y = tile.y * pixelSize;
            minimapCtx.fillStyle = tile.color;
            minimapCtx.fillRect(x, y, pixelSize, pixelSize);
        });

        // Draw viewport indicator - calculate based on centered viewport with pan
        const worldCenterX = (this.worldManager.worldWidth * this.TILE_SIZE) / 2;
        const worldCenterY = (this.worldManager.worldHeight * this.TILE_SIZE) / 2;
        
        // Calculate viewport position relative to world center with pan offset
        const viewportWidth = (this.canvas.width / this.worldManager.zoom) * pixelSize / this.TILE_SIZE;
        const viewportHeight = (this.canvas.height / this.worldManager.zoom) * pixelSize / this.TILE_SIZE;
        
        // Viewport is centered with pan offset
        const viewportX = (worldCenterX / this.TILE_SIZE) * pixelSize - viewportWidth / 2 + (this.worldManager.viewX / this.TILE_SIZE) * pixelSize;
        const viewportY = (worldCenterY / this.TILE_SIZE) * pixelSize - viewportHeight / 2 + (this.worldManager.viewY / this.TILE_SIZE) * pixelSize;

        minimapCtx.strokeStyle = '#d4af37';
        minimapCtx.lineWidth = 2;
        minimapCtx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    }

    isTileVisible(x, y, tileSize) {
        // More generous visibility check to render more of the world
        const screenX = (x - this.worldManager.viewX) * this.worldManager.zoom;
        const screenY = (y - this.worldManager.viewY) * this.worldManager.zoom;
        const screenTileSize = tileSize * this.worldManager.zoom;
        
        // Add extra margin to ensure we render tiles that might be partially visible
        const margin = screenTileSize * 2;
        
        return screenX > -margin && screenX < this.canvas.width + margin &&
               screenY > -margin && screenY < this.canvas.height + margin;
    }

    getWorldCoords(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = screenX - rect.left;
        const canvasY = screenY - rect.top;
        
        // Calculate world center position
        const worldCenterX = (this.worldManager.worldWidth * this.TILE_SIZE) / 2;
        const worldCenterY = (this.worldManager.worldHeight * this.TILE_SIZE) / 2;
        
        // Convert screen coordinates to world coordinates
        // This is the inverse of the rendering transformation:
        // 1. Remove canvas center offset
        // 2. Apply inverse zoom
        // 3. Remove world center and view offset
        const worldX = Math.floor(((canvasX - this.canvas.width / 2) / this.worldManager.zoom + worldCenterX - this.worldManager.viewX) / this.TILE_SIZE);
        const worldY = Math.floor(((canvasY - this.canvas.height / 2) / this.worldManager.zoom + worldCenterY - this.worldManager.viewY) / this.TILE_SIZE);
        
        // Ensure coordinates are integers
        return { x: Math.floor(worldX), y: Math.floor(worldY) };
    }

    centerOnTile(x, y) {
        this.worldManager.viewX = x * this.TILE_SIZE - this.canvas.width / 2;
        this.worldManager.viewY = y * this.TILE_SIZE - this.canvas.height / 2;
    }

    zoomTo(zoomLevel) {
        this.worldManager.zoom = Math.max(0.1, Math.min(5, zoomLevel));
    }

    pan(deltaX, deltaY) {
        // Since we're using centered viewport, we need to adjust the pan differently
        // The pan should move the world center relative to the screen center
        this.worldManager.viewX += deltaX;
        this.worldManager.viewY += deltaY;
    }

    centerOnWorld() {
        // Ensure the world is centered in the viewport
        this.worldManager.viewX = 0;
        this.worldManager.viewY = 0;
        
        // Force a render to update the view
        this.render();
    }

    centerOnTile(x, y) {
        // Center the viewport on a specific tile
        const worldCenterX = (this.worldManager.worldWidth * this.TILE_SIZE) / 2;
        const worldCenterY = (this.worldManager.worldHeight * this.TILE_SIZE) / 2;
        
        this.worldManager.viewX = (x * this.TILE_SIZE) - worldCenterX;
        this.worldManager.viewY = (y * this.TILE_SIZE) - worldCenterY;
        
        this.render();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
} else {
    window.Renderer = Renderer;
}
