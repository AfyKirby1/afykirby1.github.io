/**
 * World Manager - Core world state management
 * Handles world dimensions, tiles, and basic state
 */
class WorldManager {
    constructor() {
        this.worldWidth = 125;
        this.worldHeight = 125;
        this.tiles = [];
        this.currentTileType = 'grass';
        this.viewX = 0; // Start at world origin
        this.viewY = 0; // Start at world origin
        this.zoom = 0.3; // Start with a smaller zoom to see more of the world
        this.showGrid = true;
        this.gridColor = 'white'; // Default grid color
        this.betaMode = false; // Beta features disabled by default
        this.showTooltips = true; // Tooltips enabled by default
        
        this.initializeWorld();
    }

    initializeWorld() {
        this.tiles = [];
        for (let y = 0; y < this.worldHeight; y++) {
            for (let x = 0; x < this.worldWidth; x++) {
                this.tiles.push({
                    x: x,
                    y: y,
                    type: 'grass',
                    color: '#4CAF50',
                    rotation: 0,
                    flipped: false
                });
            }
        }
    }

    resizeWorld(newWidth, newHeight) {
        if (newWidth < 10 || newWidth > 500 || newHeight < 10 || newHeight > 500) {
            throw new Error('World size must be between 10 and 500!');
        }

        this.worldWidth = newWidth;
        this.worldHeight = newHeight;
        this.initializeWorld();
    }

    getTileAt(x, y) {
        return this.tiles.find(tile => tile.x === x && tile.y === y);
    }

    setTileAt(x, y, type, color = null) {
        console.log('setTileAt called with:', x, y, type);
        const tile = this.getTileAt(x, y);
        if (tile) {
            // Update existing tile
            console.log('Updating existing tile');
            tile.type = type;
            tile.color = color || this.getTileColor(type);
        } else {
            // Create new tile if it doesn't exist
            console.log('Creating new tile');
            this.tiles.push({
                x: x,
                y: y,
                type: type,
                color: color || this.getTileColor(type),
                rotation: 0,
                flipped: false
            });
        }
        console.log('Total tiles now:', this.tiles.length);
    }

    getTileColor(type) {
        const colors = {
            grass: '#4CAF50',
            water: '#2196F3',
            cave: '#795548',
            wall: '#9E9E9E'
        };
        return colors[type] || '#4CAF50';
    }

    getWorldData() {
        return {
            width: this.worldWidth,
            height: this.worldHeight,
            tiles: this.tiles,
            viewX: this.viewX,
            viewY: this.viewY,
            zoom: this.zoom,
            showGrid: this.showGrid,
            gridColor: this.gridColor
        };
    }

    loadWorldData(data) {
        this.worldWidth = data.width || 125;
        this.worldHeight = data.height || 125;
        this.tiles = data.tiles || [];
        this.viewX = data.viewX || 0;
        this.viewY = data.viewY || 0;
        this.zoom = data.zoom || 1;
        // Don't override showGrid from saved world data - preserve user preference
        // this.showGrid = data.showGrid !== undefined ? data.showGrid : true;
    }

    createWorld(width, height) {
        console.log('Creating world with dimensions:', width, height);
        this.worldWidth = width;
        this.worldHeight = height;
        this.tiles = [];
        
        // Fill with grass tiles
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.tiles.push({
                    x: x,
                    y: y,
                    type: 'grass',
                    color: '#4CAF50',
                    rotation: 0,
                    flipped: false
                });
            }
        }
        
        console.log('World created with', this.tiles.length, 'tiles');
        
        // Reset viewport (centering will be handled by renderer)
        this.viewX = 0;
        this.viewY = 0;
        this.zoom = 0.3;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldManager;
} else {
    window.WorldManager = WorldManager;
}
