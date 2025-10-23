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
        
        // Spawn points system
        this.spawnPoints = [];
        this.nextSpawnId = 1;
        
        // Buildings system
        this.buildings = [];
        
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
        
        // Clear spawn points that are outside the new world bounds
        this.spawnPoints = this.spawnPoints.filter(spawn => 
            spawn.x >= 0 && spawn.x < newWidth && spawn.y >= 0 && spawn.y < newHeight
        );
        console.log(`🗑️ Filtered spawn points for resized world (${newWidth}x${newHeight})`);
        
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
            wall: '#9E9E9E',
            vertical_trail: '#ffffff'
        };
        return colors[type] || '#4CAF50';
    }

    getWorldData() {
        return {
            width: this.worldWidth,
            height: this.worldHeight,
            tiles: this.tiles,
            spawnPoints: this.spawnPoints,
            buildings: this.buildings,
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
        
        // Load spawn points if they exist
        if (data.spawnPoints) {
            this.loadSpawnPoints(data.spawnPoints);
        } else {
            // Reset spawn points if none in data
            this.spawnPoints = [];
            this.nextSpawnId = 1;
        }
        
        // Load buildings if they exist
        if (data.buildings) {
            this.buildings = data.buildings;
        } else {
            // Reset buildings if none in data
            this.buildings = [];
        }
    }

    createWorld(width, height) {
        console.log('Creating world with dimensions:', width, height);
        this.worldWidth = width;
        this.worldHeight = height;
        this.tiles = [];
        
        // Clear all spawn points when creating a new world
        this.spawnPoints = [];
        this.nextSpawnId = 1;
        console.log('🗑️ Cleared all spawn points for new world');
        
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

    // Spawn Point Management Methods
    addSpawnPoint(x, y, type = 'player', name = '') {
        const spawnPoint = {
            id: this.nextSpawnId++,
            x: x,
            y: y,
            type: type, // 'player', 'enemy', 'npc', 'item'
            name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Spawn ${this.nextSpawnId - 1}`,
            color: this.getSpawnColor(type)
        };
        
        this.spawnPoints.push(spawnPoint);
        console.log(`📍 Added ${type} spawn point at (${x}, ${y})`);
        return spawnPoint;
    }

    removeSpawnPoint(id) {
        const index = this.spawnPoints.findIndex(spawn => spawn.id === id);
        if (index !== -1) {
            const removed = this.spawnPoints.splice(index, 1)[0];
            console.log(`🗑️ Removed spawn point: ${removed.name}`);
            return removed;
        }
        return null;
    }

    getSpawnPointsByType(type) {
        return this.spawnPoints.filter(spawn => spawn.type === type);
    }

    getSpawnPointAt(x, y) {
        return this.spawnPoints.find(spawn => spawn.x === x && spawn.y === y);
    }

    getSpawnColor(type) {
        const colors = {
            'player': '#00FF00', // Green
            'enemy': '#FF0000',  // Red
            'npc': '#0000FF',    // Blue
            'item': '#FFFF00'    // Yellow
        };
        return colors[type] || '#FFFFFF';
    }

    // Export spawn points data for game integration
    exportSpawnPoints() {
        return {
            spawnPoints: this.spawnPoints,
            spawnCount: this.spawnPoints.length,
            spawnTypes: [...new Set(this.spawnPoints.map(spawn => spawn.type))]
        };
    }

    // Load spawn points from saved data
    loadSpawnPoints(spawnData) {
        if (spawnData && spawnData.spawnPoints) {
            this.spawnPoints = spawnData.spawnPoints;
            this.nextSpawnId = Math.max(...this.spawnPoints.map(spawn => spawn.id), 0) + 1;
            console.log(`📍 Loaded ${this.spawnPoints.length} spawn points`);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldManager;
} else {
    window.WorldManager = WorldManager;
}
