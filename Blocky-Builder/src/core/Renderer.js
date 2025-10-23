/**
 * Renderer - Handles all canvas rendering operations
 * Manages viewport, zoom, and drawing operations
 */
class Renderer {
    constructor(canvas, worldManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.worldManager = worldManager;
        this.TILE_SIZE = 16;
        this.textures = new Map();
        this.texturesLoaded = false;
        this.backgroundColor = '#0a0a0a'; // Default background color
        this.isPanning = false; // Performance optimization flag
        this.experimentalRendering = false; // Beta feature flag
        this.performanceMode = false; // Performance optimization flag
        
        // NPC sprite cache for custom images
        this.npcSpriteCache = new Map();
        
        // Building sprite cache for custom images
        this.buildingSpriteCache = new Map();
        
        this.loadTextures();
    }

    async loadTextures() {
        const textureFiles = {
            grass: '../assets/Ground_Texture_1.png',
            water: '../assets/Water_Texture.png',
            cave: '../assets/Cave_Texture_1.png'
        };

        // Load custom tiles from tiles.json
        try {
            const response = await fetch('../tiles.json');
            if (response.ok) {
                const customTiles = await response.json();
                Object.entries(customTiles).forEach(([type, data]) => {
                    if (data.texture) {
                        textureFiles[type] = data.texture;
                    }
                });
            }
        } catch (error) {
            console.warn('Could not load custom tiles.json:', error);
        }

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
        
        // Ensure we have valid dimensions
        if (rect.width <= 0 || rect.height <= 0) {
            console.warn('Canvas has invalid dimensions, skipping resize');
            return;
        }
        
        const dpr = window.devicePixelRatio || 1;
        
        // Match canvas to container size (in device pixels)
        this.canvas.width = Math.round(rect.width * dpr);
        this.canvas.height = Math.round(rect.height * dpr);
        
        // Reset transform and apply DPR scaling (avoid compounding scale across resizes)
        if (typeof this.ctx.setTransform === 'function') {
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        } else {
            // Fallback for very old browsers
            this.ctx.resetTransform && this.ctx.resetTransform();
            this.ctx.scale(dpr, dpr);
        }
        
        // Render immediately to reflect new size
        this.render();
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
        
        // Apply zoom and pan (use CSS pixel space after DPR scaling)
        const dpr = window.devicePixelRatio || 1;
        const canvasCssWidth = this.canvas.width / dpr;
        const canvasCssHeight = this.canvas.height / dpr;
        this.ctx.translate(canvasCssWidth / 2, canvasCssHeight / 2);
        this.ctx.scale(this.worldManager.zoom, this.worldManager.zoom);
        this.ctx.translate(-worldCenterX + this.worldManager.viewX, -worldCenterY + this.worldManager.viewY);

        // Render tiles first
        this.renderTiles();

        // Render grid ON TOP of tiles - now in transformed coordinate space
        if (this.worldManager.showGrid && !this.isPanning) {
            this.renderGrid();
        }

        // Render NPCs
        this.renderNPCs();

        // Render Buildings
        this.renderBuildings();

        // Render spawn points
        this.renderSpawnPoints();

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
        
        // World boundary debug stroke removed (was drawing a red rectangle)
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
        const dpr = window.devicePixelRatio || 1;
        const canvasCssWidth = this.canvas.width / dpr;
        const canvasCssHeight = this.canvas.height / dpr;
        const worldX = Math.floor(((canvasX - canvasCssWidth / 2) / this.worldManager.zoom + worldCenterX - this.worldManager.viewX) / this.TILE_SIZE);
        const worldY = Math.floor(((canvasY - canvasCssHeight / 2) / this.worldManager.zoom + worldCenterY - this.worldManager.viewY) / this.TILE_SIZE);
        
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

    renderBuildings() {
        if (!window.editor || !window.editor.buildingManager) return;
        
        const buildings = window.editor.buildingManager.buildings;
        if (!buildings || buildings.length === 0) return;
        
        buildings.forEach(building => {
            this.renderBuilding(building);
        });
    }

    renderBuilding(building) {
        // Try to get template from buildingTemplates first
        let template = window.editor.buildingManager.buildingTemplates[building.templateId];
        
        // If not found, check if it's a texture-based building
        if (!template) {
            const allTextures = { 
                ...window.editor.buildingManager.persistentTextures, 
                ...window.editor.buildingManager.sessionTextures 
            };
            
            const texture = allTextures[building.templateId];
            
            if (texture) {
                // Create a simple template for texture-based buildings
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
        
        if (!template) {
            // Throttle warning to every 2 seconds to reduce spam
            const now = Date.now();
            const warningKey = `building_template_warning_${building.templateId || 'undefined'}`;
            
            if (!this.lastWarningTime) {
                this.lastWarningTime = {};
            }
            
            if (!this.lastWarningTime[warningKey] || now - this.lastWarningTime[warningKey] > 2000) {
                console.warn(`Building template not found for ID: ${building.templateId}`);
                this.lastWarningTime[warningKey] = now;
            }
            return;
        }
        
        const tileSize = this.TILE_SIZE;
        const x = building.x * tileSize;
        const y = building.y * tileSize;
        
        this.ctx.save();
        
        // For texture-based buildings, draw the texture directly
        if (template.isTexture && template.texture) {
            // Check if texture is already cached
            if (this.buildingSpriteCache.has(template.texture)) {
                const img = this.buildingSpriteCache.get(template.texture);
                this.ctx.drawImage(img, x, y, template.width * tileSize, template.height * tileSize);
            } else {
                // Load and cache the texture
                const img = new Image();
                img.onload = () => {
                    this.buildingSpriteCache.set(template.texture, img);
                    // Redraw the scene to show the loaded texture
                    if (window.editor && window.editor.renderer) {
                        window.editor.renderer.render();
                    }
                };
                img.onerror = () => {
                    console.error(`Failed to load building texture: ${template.texture}`);
                };
                img.src = template.texture;
                
                // Draw a fallback rectangle while image loads
                this.ctx.fillStyle = '#8B4513'; // Brown color for buildings
                this.ctx.fillRect(x, y, template.width * tileSize, template.height * tileSize);
            }
        } else {
            // Draw building tiles for template-based buildings
            if (template.tiles) {
                template.tiles.forEach(tile => {
                    const tileX = x + (tile.x * tileSize);
                    const tileY = y + (tile.y * tileSize);
                    
                    // Draw tile background
                    this.ctx.fillStyle = this.worldManager.getTileColor(tile.type);
                    this.ctx.fillRect(tileX, tileY, tileSize, tileSize);
                    
                    // Draw tile texture if available
                    const texture = this.textures.get(tile.type);
                    if (texture && this.texturesLoaded) {
                        this.ctx.drawImage(texture, tileX, tileY, tileSize, tileSize);
                    }
                });
            }
        }
        
        // Draw building outline
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, template.width * tileSize, template.height * tileSize);
        
        // Draw building name (if zoomed in enough)
        if (this.worldManager.zoom > 0.5) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(template.name, x + (template.width * tileSize) / 2, y - 20);
        }
        
        this.ctx.restore();
    }

    renderNPCs() {
        // Check if NPC Builder is available and has NPCs
        if (window.editor && window.editor.npcBuilder && window.editor.npcBuilder.npcs) {
            window.editor.npcBuilder.npcs.forEach(npc => {
                this.renderNPC(npc);
            });
        }
    }

    // Preload NPC sprite into cache
    preloadNPCSprite(npcId, imageSrc) {
        if (this.npcSpriteCache.has(npcId)) {
            return; // Already cached
        }
        
        const img = new Image();
        img.onload = () => {
            this.npcSpriteCache.set(npcId, img);
            console.log('NPC sprite cached:', npcId);
        };
        img.onerror = () => {
            console.warn('Failed to preload NPC sprite:', npcId);
        };
        img.src = imageSrc;
    }
    
    // Get cached NPC sprite
    getCachedNPCSprite(npcId) {
        return this.npcSpriteCache.get(npcId);
    }

    renderNPC(npc) {
        this.ctx.save();
        
        // Check if NPC has custom image (from NPC Builder)
        if (npc.isCustom && npc.customImage) {
            // Try to get cached sprite first
            const cachedSprite = this.getCachedNPCSprite(npc.id || npc.name);
            
            if (cachedSprite) {
                // Draw cached sprite
                this.ctx.drawImage(cachedSprite, npc.x - 16, npc.y - 16, 32, 32);
            } else {
                // Preload sprite for next frame and draw placeholder
                this.preloadNPCSprite(npc.id || npc.name, npc.customImage);
                
                // Draw placeholder for custom NPCs
                this.ctx.fillStyle = npc.color || '#8B4513';
                this.ctx.fillRect(npc.x - 16, npc.y - 16, 32, 32);
                
                // Draw custom indicator (golden stripe)
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(npc.x - 12, npc.y - 12, 24, 8);
                
                // Draw NPC border
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(npc.x - 16, npc.y - 16, 32, 32);
            }
        } else {
            // Draw default NPC sprite
            this.renderDefaultNPC(npc);
        }
        
        // Draw NPC name above
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(npc.name, npc.x, npc.y - 20);
        
        // Draw behavior indicator (small colored dot)
        const behaviorColors = {
            'idle': '#00FF00',      // Green
            'wander': '#00FF00',    // Green
            'patrol': '#00FF00',    // Green
            'guard': '#FFFF00',     // Yellow
            'hostile': '#FF0000',   // Red
            'defensive': '#FF8800', // Orange
            'aggressive': '#CC0000' // Dark Red
        };
        this.ctx.fillStyle = behaviorColors[npc.behavior] || '#00FF00';
        this.ctx.beginPath();
        this.ctx.arc(npc.x + 12, npc.y - 12, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw health bar if NPC has health properties
        this.renderNPCHealthBar(npc);
        
        this.ctx.restore();
    }
    
    renderNPCHealthBar(npc) {
        // Only render health bar if NPC has health and maxHealth properties
        if (npc.health === undefined || npc.maxHealth === undefined) {
            return;
        }
        
        const healthPercentage = npc.health / npc.maxHealth;
        const barWidth = 40;
        const barHeight = 6;
        const barX = npc.x - barWidth / 2;
        const barY = npc.y - 35; // Above NPC name
        
        this.ctx.save();
        
        // Draw health bar background (black border)
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
        
        // Draw health bar background (dark red)
        this.ctx.fillStyle = '#330000';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Draw health bar fill (red to green gradient based on health)
        if (healthPercentage > 0) {
            const fillWidth = barWidth * healthPercentage;
            const red = Math.floor(255 * (1 - healthPercentage));
            const green = Math.floor(255 * healthPercentage);
            this.ctx.fillStyle = `rgb(${red}, ${green}, 0)`;
            this.ctx.fillRect(barX, barY, fillWidth, barHeight);
        }
        
        // Draw health text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${npc.health}/${npc.maxHealth}`, npc.x, barY + barHeight / 2);
        
        this.ctx.restore();
    }
    
    renderDefaultNPC(npc) {
        // Draw NPC body
        this.ctx.fillStyle = npc.color || '#8B4513';
        this.ctx.fillRect(npc.x - 16, npc.y - 16, 32, 32);
        
        // Draw NPC face
        this.ctx.fillStyle = '#FFE4B5';
        this.ctx.fillRect(npc.x - 12, npc.y - 16, 24, 16);
        
        // Draw eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(npc.x - 8, npc.y - 12, 4, 4);
        this.ctx.fillRect(npc.x + 4, npc.y - 12, 4, 4);
        
        // Draw NPC border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(npc.x - 16, npc.y - 16, 32, 32);
    }

    renderSpawnPoints() {
        if (!this.worldManager.spawnPoints || this.worldManager.spawnPoints.length === 0) {
            return;
        }

        this.worldManager.spawnPoints.forEach(spawnPoint => {
            this.renderSpawnPoint(spawnPoint);
        });
    }

    renderSpawnPoint(spawnPoint) {
        const x = spawnPoint.x * this.TILE_SIZE + this.TILE_SIZE / 2;
        const y = spawnPoint.y * this.TILE_SIZE + this.TILE_SIZE / 2;
        
        this.ctx.save();
        
        // Draw spawn point circle
        this.ctx.fillStyle = spawnPoint.color;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        // Draw outer ring
        this.ctx.beginPath();
        this.ctx.arc(x, y, 12, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw inner circle
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw spawn point icon based on type
        this.ctx.fillStyle = spawnPoint.color;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const icons = {
            'player': '👤',
            'enemy': '👹',
            'npc': '🧙',
            'item': '📦'
        };
        
        const icon = icons[spawnPoint.type] || '📍';
        this.ctx.fillText(icon, x, y);
        
        // Draw spawn point name (if zoomed in enough)
        if (this.worldManager.zoom > 0.5) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(spawnPoint.name, x, y + 15);
        }
        
        this.ctx.restore();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
} else {
    window.Renderer = Renderer;
}
