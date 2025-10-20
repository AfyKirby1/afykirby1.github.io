import { SecurityUtils } from '../utils/SecurityUtils.js';

export class World {
    constructor(config = null, customWorldData = null) {
        // ✅ SECURITY FIX (VULN-010): Validate config before using
        if (config && !this.validateConfig(config)) {
            console.error('Invalid world config detected, using safe defaults');
            config = null;
        }
        
        // Use config if provided and valid, otherwise use defaults
        this.config = config || this.getDefaultConfig();

        this.tiles = [];
        this.tileSize = 16;
        this.groundTexture = null;
        this.waterTexture = null;
        this.caveTexture = null;
        
        // Check if loading from custom world data
        if (customWorldData) {
            this.loadFromCustomData(customWorldData);
        } else {
            // Set dimensions based on world size
            const sizes = {
                small: { width: 2500, height: 1500 },
                medium: { width: 3500, height: 2250 },
                large: { width: 5000, height: 3500 }
            };
            
            const worldSize = sizes[this.config.worldSize] || sizes.medium;
            this.width = worldSize.width;
            this.height = worldSize.height;
            
            // Initialize seeded random
            this.initSeededRandom(this.config.seed);
            
            this.loadTextures();
            this.generateWorld();
        }
        
        // Load textures if not already loaded
        if (!customWorldData) {
            // Already called in else block above
        } else {
            this.loadTextures();
        }
    }

    // Load world from custom JSON data (from world editor)
    loadFromCustomData(data) {
        console.log('Loading custom world:', data.metadata?.name || 'Unknown');
        
        // Set world dimensions from custom data
        this.width = data.worldWidth * this.tileSize;
        this.height = data.worldHeight * this.tileSize;
        
        // Convert editor tiles to game tiles format
        this.tiles = data.tiles.map(tile => ({
            x: tile.x * this.tileSize,
            y: tile.y * this.tileSize,
            type: tile.type,
            color: tile.color,
            textureVariant: Math.random() // Add some variety
        }));
        
        console.log(`Custom world loaded: ${this.width}x${this.height} (${this.tiles.length} tiles)`);
    }

    // Static method to load world from JSON file
    static async loadFromFile(worldPath) {
        // ✅ SECURITY FIX (VULN-012): Validate path format to prevent path traversal
        const pathRegex = /^worlds\/[a-z0-9-_]+\/world\.json$/i;
        if (!pathRegex.test(worldPath)) {
            console.error('🚨 SECURITY: Invalid world path format:', worldPath);
            console.error('Path must match: worlds/{name}/world.json');
            return null;
        }
        
        try {
            const response = await fetch(worldPath);
            if (!response.ok) {
                throw new Error(`Failed to load world: ${response.statusText}`);
            }
            const data = await response.json();
            
            // ✅ SECURITY FIX (VULN-012): Validate loaded world data
            if (!SecurityUtils.validateCustomWorld(data)) {
                console.error('Invalid custom world data structure');
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error loading custom world:', error);
            return null;
        }
    }

    // Simple LCG (Linear Congruential Generator) for seeded random
    initSeededRandom(seed) {
        // Convert seed string to number
        let hash = 0;
        if (seed) {
            for (let i = 0; i < seed.length; i++) {
                hash = ((hash << 5) - hash) + seed.charCodeAt(i);
                hash = hash & hash; // Convert to 32-bit integer
            }
        }
        this.seed = Math.abs(hash);
    }

    // Seeded random number generator (0 to 1)
    seededRandom() {
        // LCG parameters (from Numerical Recipes)
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }

    loadTextures() {
        // Load ground texture
        this.groundTexture = new Image();
        this.groundTexture.src = 'assets/Ground_Texture_1.png';
        this.groundTexture.onload = () => {
            console.log('Ground texture loaded successfully');
        };
        this.groundTexture.onerror = () => {
            console.error('Failed to load ground texture');
        };

        // Load water texture
        this.waterTexture = new Image();
        this.waterTexture.src = 'assets/Water_Texture.png';
        this.waterTexture.onload = () => {
            console.log('Water texture loaded successfully');
        };
        this.waterTexture.onerror = () => {
            console.error('Failed to load water texture');
        };

        // Load cave texture
        this.caveTexture = new Image();
        this.caveTexture.src = 'assets/Cave_Texture_1.png';
        this.caveTexture.onload = () => {
            console.log('Cave texture loaded successfully');
        };
        this.caveTexture.onerror = () => {
            console.error('Failed to load cave texture');
        };
    }

    generateWorld() {
        const tilesX = this.width / this.tileSize;
        const tilesY = this.height / this.tileSize;
        
        // Get percentages from config
        const percentages = this.config.tilePercentages;
        
        // Convert percentages to cumulative thresholds (0-1 range)
        const caveThreshold = percentages.cave / 100;
        const wallThreshold = caveThreshold + (percentages.wall / 100);
        const waterThreshold = wallThreshold + (percentages.water / 100);
        const grassThreshold = 1.0; // Everything else is grass (should be 100% total)
        
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                const random = this.seededRandom();
                let tileType, tileColor;
                
                // Use cumulative probability thresholds
                if (random < caveThreshold) {
                    // Cave tiles
                    tileType = 'cave';
                    tileColor = '#603000'; // Dark brown for cave
                } else if (random < wallThreshold) {
                    // Wall tiles
                    tileType = 'wall';
                    tileColor = '#8b5a2b';
                } else if (random < waterThreshold) {
                    // Water tiles
                    tileType = 'water';
                    tileColor = '#4169E1'; // Royal blue for water
                } else {
                    // Grass tiles (everything remaining)
                    tileType = 'grass';
                    tileColor = '#4a7c59';
                }
                
                this.tiles.push({
                    x: x * this.tileSize,
                    y: y * this.tileSize,
                    type: tileType,
                    color: tileColor,
                    textureVariant: this.seededRandom() // For future texture variations
                });
            }
        }
    }

    canMove(x, y, size) {
        if (x < 0 || y < 0 || x + size > this.width || y + size > this.height) {
            return false;
        }
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const checkX = tileX + i;
                const checkY = tileY + j;
                if (checkX >= 0 && checkY >= 0 && checkX < this.width / this.tileSize && checkY < this.height / this.tileSize) {
                    const tileIndex = checkY * (this.width / this.tileSize) + checkX;
                    if (tileIndex < this.tiles.length) {
                        const tile = this.tiles[tileIndex];
                        if (tile && tile.type === 'wall') {
                            const tileLeft = checkX * this.tileSize;
                            const tileTop = checkY * this.tileSize;
                            if (x < tileLeft + this.tileSize && x + size > tileLeft && y < tileTop + this.tileSize && y + size > tileTop) {
                                return false;
                            }
                        }
                        // Water and cave tiles allow movement (no collision)
                    }
                }
            }
        }
        return true;
    }

    render(ctx, camera, player = null) {
        // Since camera transform is already applied, we need to render tiles
        // that would be visible in the current viewport after transform

        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        // Get render distance setting from localStorage (defaults to 32)
        const renderDistanceTiles = parseInt(localStorage.getItem('renderDistance')) || 32;
        const useFixedRenderDistance = renderDistanceTiles < 128; // Use fixed if not set to max

        if (useFixedRenderDistance) {
            // Fixed render distance mode - only render X tiles around player
            const playerWorldX = player ? player.x : camera.x + (canvasWidth / camera.zoom / 2);
            const playerWorldY = player ? player.y : camera.y + (canvasHeight / camera.zoom / 2);
            
            const halfDistance = (renderDistanceTiles * this.tileSize) / 2;
            
            // Extend render area by 20% for fog transition zone
            const fogExtension = halfDistance * 0.2;
            const paddedLeft = playerWorldX - halfDistance - fogExtension;
            const paddedTop = playerWorldY - halfDistance - fogExtension;
            const paddedRight = playerWorldX + halfDistance + fogExtension;
            const paddedBottom = playerWorldY + halfDistance + fogExtension;
            
            const startX = Math.floor(paddedLeft / this.tileSize);
            const startY = Math.floor(paddedTop / this.tileSize);
            const endX = Math.ceil(paddedRight / this.tileSize);
            const endY = Math.ceil(paddedBottom / this.tileSize);
            
            this.renderTiles(ctx, camera, startX, startY, endX, endY, renderDistanceTiles);
        } else {
            // Dynamic render distance - render based on viewport
            const screenWorldWidth = canvasWidth / camera.zoom;
            const screenWorldHeight = canvasHeight / camera.zoom;

            const worldLeft = camera.x;
            const worldTop = camera.y;
            const worldRight = camera.x + screenWorldWidth;
            const worldBottom = camera.y + screenWorldHeight;

            // Add small padding (2 tiles) to prevent edge artifacts
            const extraPadding = this.tileSize * 2;
            const paddedLeft = worldLeft - extraPadding;
            const paddedTop = worldTop - extraPadding;
            const paddedRight = worldRight + extraPadding;
            const paddedBottom = worldBottom + extraPadding;
            
            const startX = Math.floor(paddedLeft / this.tileSize);
            const startY = Math.floor(paddedTop / this.tileSize);
            const endX = Math.ceil(paddedRight / this.tileSize);
            const endY = Math.ceil(paddedBottom / this.tileSize);
            
            this.renderTiles(ctx, camera, startX, startY, endX, endY, 128);
        }
    }

    renderTiles(ctx, camera, startX, startY, endX, endY, renderDistanceTiles = 32) {
        // Clamp to world bounds for actual world tiles
        const maxTilesX = Math.floor(this.width / this.tileSize);
        const maxTilesY = Math.floor(this.height / this.tileSize);

        // Get fog settings
        const fogIntensity = parseInt(localStorage.getItem('fogIntensity')) || 75;
        
        // Calculate player position for fog center
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        // Use actual player position if available, otherwise fall back to camera center
        const playerWorldX = (camera.playerX !== undefined) ? camera.playerX : camera.x + (canvasWidth / camera.zoom / 2);
        const playerWorldY = (camera.playerY !== undefined) ? camera.playerY : camera.y + (canvasHeight / camera.zoom / 2);
        const playerTileX = Math.floor(playerWorldX / this.tileSize);
        const playerTileY = Math.floor(playerWorldY / this.tileSize);
        
        // Calculate fog fade distances
        const maxDistance = renderDistanceTiles / 2;
        const fogStartDistance = maxDistance * 0.6; // Start fog at 60% of render distance
        const fogHeavyDistance = maxDistance * 0.9; // Heavy fog at 90%
        const fogExtendDistance = maxDistance * 1.2; // Extend fog zone by 20% beyond render distance

        // Render tiles including those beyond world bounds for seamless coverage
        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const tileX = x * this.tileSize;
                const tileY = y * this.tileSize;

                // Calculate distance from player for fog effect
                const distanceX = Math.abs(x - playerTileX);
                const distanceY = Math.abs(y - playerTileY);
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                // Check if we're in the pure fog zone (beyond render distance)
                if (distance > maxDistance && distance <= fogExtendDistance && fogIntensity > 0) {
                    // Pure fog zone - just render black gradient
                    const fogProgress = (distance - maxDistance) / (fogExtendDistance - maxDistance);
                    const fogOpacity = Math.min(fogProgress, 1.0) * (fogIntensity / 100);
                    
                    ctx.fillStyle = `rgba(0, 0, 0, ${fogOpacity})`;
                    ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                    continue; // Skip tile rendering, just fog
                }

                // Skip rendering if beyond fog extend distance
                if (distance > fogExtendDistance) {
                    continue;
                }

                // Check if tile is within world bounds
                if (x >= 0 && y >= 0 && x < maxTilesX && y < maxTilesY) {
                    const tile = this.tiles[y * maxTilesX + x];
                    if (tile) {
                        // Render tile with texture or color
                        if (tile.type === 'grass' && this.groundTexture) {
                            // Save context state
                            ctx.save();
                            
                            // Enable pixelated rendering for retro look
                            ctx.imageSmoothingEnabled = false;
                            ctx.imageSmoothingQuality = 'low';
                            
                            // Render grass tile with texture
                            ctx.drawImage(this.groundTexture, tileX, tileY, this.tileSize, this.tileSize);
                            
                            // Restore context state
                            ctx.restore();
                        } else if (tile.type === 'water' && this.waterTexture) {
                            // Save context state
                            ctx.save();
                            
                            // Enable pixelated rendering for retro look
                            ctx.imageSmoothingEnabled = false;
                            ctx.imageSmoothingQuality = 'low';
                            
                            // Render water tile with texture
                            ctx.drawImage(this.waterTexture, tileX, tileY, this.tileSize, this.tileSize);
                            
                            // Restore context state
                            ctx.restore();
                        } else if (tile.type === 'cave' && this.caveTexture) {
                            // Save context state
                            ctx.save();
                            
                            // Enable pixelated rendering for retro look
                            ctx.imageSmoothingEnabled = false;
                            ctx.imageSmoothingQuality = 'low';
                            
                            // Render cave tile with texture
                            ctx.drawImage(this.caveTexture, tileX, tileY, this.tileSize, this.tileSize);
                            
                            // Restore context state
                            ctx.restore();
                        } else {
                            // Render wall or fallback with solid color
                            ctx.fillStyle = tile.color;
                            ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                        }
                    } else {
                        // Fallback to textured grass if tile is null
                        if (this.groundTexture) {
                            ctx.save();
                            ctx.imageSmoothingEnabled = false;
                            ctx.imageSmoothingQuality = 'low';
                            ctx.drawImage(this.groundTexture, tileX, tileY, this.tileSize, this.tileSize);
                            ctx.restore();
                        } else {
                            ctx.fillStyle = '#4a7c59';
                            ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                        }
                    }
                } else {
                    // Render background tile for areas beyond world bounds (water)
                    if (this.waterTexture) {
                        ctx.save();
                        ctx.imageSmoothingEnabled = false;
                        ctx.imageSmoothingQuality = 'low';
                        ctx.drawImage(this.waterTexture, tileX, tileY, this.tileSize, this.tileSize);
                        ctx.restore();
                    } else {
                        ctx.fillStyle = '#1e90ff'; // Water color for seamless background
                        ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                    }
                }

                // Apply fog effect if intensity > 0 (distance already calculated above)
                if (fogIntensity > 0 && distance > fogStartDistance) {
                    // Calculate fog opacity based on distance
                    const fogProgress = (distance - fogStartDistance) / (maxDistance - fogStartDistance);
                    const fogOpacity = Math.min(fogProgress, 1.0) * (fogIntensity / 100);
                    
                    // Apply fog overlay
                    ctx.fillStyle = `rgba(0, 0, 0, ${fogOpacity})`;
                    ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                }

                // Add grid lines for pattern (only on actual tiles, not pure fog zone)
                if (distance <= maxDistance) {
                    ctx.strokeStyle = '#2a3a2a'; // Dark green grid lines
                    ctx.lineWidth = 1;
                    ctx.strokeRect(tileX, tileY, this.tileSize, this.tileSize);
                }
            }
        }
    }


    getTileAt(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        if (tileX >= 0 && tileY >= 0 && tileX < this.width / this.tileSize && tileY < this.height / this.tileSize) {
            const tileIndex = tileY * (this.width / this.tileSize) + tileX;
            return this.tiles[tileIndex];
        }
        return null;
    }

    getDimensions() {
        return { width: this.width, height: this.height };
    }

    getTileTypeAt(x, y) {
        const tile = this.getTileAt(x, y);
        return tile ? tile.type : 'grass';
    }

    isPlayerOnWater(x, y) {
        const tile = this.getTileAt(x, y);
        return tile && tile.type === 'water';
    }

    /**
     * ✅ SECURITY FIX (VULN-010): Get default safe configuration
     */
    getDefaultConfig() {
        return {
            worldSize: 'medium',
            seed: 'DEFAULT',
            tilePercentages: {
                grass: 85,
                water: 10,
                wall: 3,
                cave: 2
            }
        };
    }

    /**
     * ✅ SECURITY FIX (VULN-010): Validate world configuration
     * Prevents crashes from malicious or corrupted config data
     */
    validateConfig(config) {
        try {
            // Basic structure check
            if (!config || typeof config !== 'object') {
                console.error('Config must be an object');
                return false;
            }
            
            // Validate world size
            const validSizes = ['small', 'medium', 'large'];
            if (!validSizes.includes(config.worldSize)) {
                console.error(`Invalid world size: ${config.worldSize}`);
                return false;
            }
            
            // Validate seed format (alphanumeric, hyphens, underscores, max 50 chars)
            if (config.seed !== undefined) {
                if (typeof config.seed !== 'string') {
                    console.error('Seed must be a string');
                    return false;
                }
                
                if (!/^[a-zA-Z0-9-_]{1,50}$/.test(config.seed)) {
                    console.error('Invalid seed format (alphanumeric, -, _ only, max 50 chars)');
                    return false;
                }
            }
            
            // Validate tile percentages
            const percentages = config.tilePercentages;
            if (!percentages || typeof percentages !== 'object') {
                console.error('tilePercentages must be an object');
                return false;
            }
            
            // Check each required tile type
            const requiredTypes = ['grass', 'water', 'wall', 'cave'];
            let total = 0;
            
            for (const type of requiredTypes) {
                const value = percentages[type];
                
                // Type check
                if (typeof value !== 'number') {
                    console.error(`${type} percentage must be a number`);
                    return false;
                }
                
                // Range check
                if (!Number.isFinite(value) || value < 0 || value > 100) {
                    console.error(`${type} percentage out of bounds: ${value}`);
                    return false;
                }
                
                total += value;
            }
            
            // Total must equal 100%
            if (Math.abs(total - 100) > 0.01) { // Allow tiny floating point errors
                console.error(`Tile percentages must total 100%, got ${total}%`);
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('Config validation error:', error);
            return false;
        }
    }
}
