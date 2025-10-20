# Runes of Tir na nÓg - Architecture Documentation

## 🏗️ System Architecture Overview

This document outlines the technical architecture and design patterns used in the Runes of Tir na nÓg game prototype.

## 📋 Architecture Principles

### 1. Modular Component Design
- **Separation of Concerns**: Each system has a single responsibility
- **Loose Coupling**: Components communicate through well-defined interfaces
- **High Cohesion**: Related functionality is grouped together

### 2. Performance-First Design
- **Viewport Culling**: Only render visible game objects
- **Efficient Rendering**: Canvas 2D with optimized draw calls
- **Memory Management**: Proper cleanup and resource management

### 3. Scalable Architecture
- **Extensible Systems**: Easy to add new features without breaking existing code
- **Plugin Architecture**: New components can be added modularly
- **Configuration-Driven**: Behavior controlled through parameters

## 🎯 Core Systems Architecture

### Game Loop Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GameLoop.js   │───▶│    Game.js      │───▶│  Component      │
│                 │    │                 │    │   Systems       │
│ • 60 FPS Timer  │    │ • Coordination  │    │                 │
│ • Delta Time    │    │ • State Mgmt    │    │ • Player        │
│ • Frame Sync    │    │ • Event Handle  │    │ • World         │
└─────────────────┘    └─────────────────┘    │ • Camera        │
                                              │ • UI            │
                                              │ • Input         │
                                              └─────────────────┘
```

### Component Communication Flow
```
Input System ──┐
               ├──▶ Game Coordinator ──▶ Update Loop ──▶ Render Loop
World System ──┤                         │                │
Player System ─┤                         ▼                ▼
Camera System ─┤                    Update Components  Render Components
UI System ─────┤
Settings System ─┤
Inventory System ─┤
Controls System ─┘
```

## 🔧 Component Architecture Details

### 1. Game Core (`/core/`)

#### Game.js - Main Coordinator
```javascript
class Game {
    constructor() {
        this.world = new World();
        this.player = new Player();
        this.camera = new Camera();
        this.ui = new UI();
        this.input = new Input(this.canvas);
        this.inventory = new Inventory(this);
        this.pauseMenu = new PauseMenu(this);
        this.gameLoop = new GameLoop();
    }
    
    update(deltaTime) {
        // Coordinate all system updates
        this.player.update(this.input, this.world, this.audioManager);
        this.camera.update(playerPos, worldDims, this.input);
        this.ui.update(playerPos.x, playerPos.y, deltaTime, this.camera.zoom);
    }
    
    render(alpha) {
        // Coordinate all rendering
        this.world.render(ctx, this.camera);
        this.player.render(ctx);
    }
    
    setupEventListeners() {
        // Enhanced keybind system integration
        document.addEventListener('keydown', (e) => {
            if (this.input.isPausePressed()) this.togglePause();
            if (this.input.isInventoryPressed() || e.code === 'KeyI') {
                this.inventory.toggle();
            }
        });
    }
}
```

**Responsibilities:**
- System initialization and coordination
- Game state management
- Enhanced keybind event handling
- Inventory system integration
- Performance monitoring

#### GameLoop.js - Frame Management
```javascript
class GameLoop {
    constructor(update, render) {
        this.update = update;
        this.render = render;
        this.isRunning = false;
    }
    
    start() {
        // RequestAnimationFrame loop
    }
    
    stop() {
        // Clean shutdown
    }
}
```

**Responsibilities:**
- 60 FPS frame rate management
- Delta time calculation
- Animation frame synchronization

### 2. UI System (`/ui/`)

#### UI.js - UI Manager
```javascript
class UI {
    constructor() {
        this.healthBar = new HealthBar();
        this.fps = 60;
        this.memoryUsage = 0;
        this.zoomLevel = 1.0;
    }
    
    update(playerX, playerY, deltaTime, zoomLevel) {
        // Store zoom level for potential future use
        this.zoomLevel = zoomLevel;
        
        // Calculate FPS for internal tracking
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
            
            if (performance.memory) {
                this.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
            }
        }
        this.frameCount++;
    }
}
```

**Responsibilities:**
- Health visualization with heart icons
- Internal performance tracking (FPS, memory)
- UI state management
- Clean interface (debug panels removed)

#### HealthBar.js - Health Display
```javascript
class HealthBar {
    constructor() {
        this.maxHealth = 10;
        this.currentHealth = 10;
        this.heartImage = null;
    }
    
    setHealth(current, maximum) {
        // Update health display
    }
    
    updateDisplay() {
        // Render hearts with scaling
    }
}
```

**Responsibilities:**
- Health visualization with heart icons
- Debug information display
- UI state management
- DOM manipulation

#### Inventory.js - Inventory System
```javascript
class Inventory {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.items = Array(24).fill(null);
        this.equipment = {
            helmet: null,
            necklace: null,
            chest: null,
            legs: null,
            boots: null,
            ring1: null,
            ring2: null,
            weapon: null
        };
    }
    
    toggle() {
        // Toggle inventory visibility and pause game
    }
    
    addItem(item) {
        // Add item to first available slot
    }
    
    updateItemsDisplay() {
        // Update visual display of items
    }
}
```

**Key Features:**
- **Equipment Slots**: 8 equipment slots (helmet, necklace, chest, legs, boots, 2 rings, weapon)
- **Item Storage**: 24-slot grid for general inventory items
- **Interactive UI**: Drag-and-drop, tooltips, and click interactions
- **Game Pause Integration**: Automatically pauses game when inventory is open
- **RPG-Style Design**: Beautiful medieval-themed styling with gold accents
- **Stats Display**: Shows character stats affected by equipment
- **Gold & Weight**: Tracks player resources and inventory capacity

**Key Binding:**
- Press `I` to open/close inventory

**Responsibilities:**
- Item management and storage
- Equipment slot management
- Item tooltip display
- Inventory UI rendering
- Game state coordination (pause/resume)

#### PauseMenu.js - Pause Menu System
```javascript
class PauseMenu {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
    }
    
    toggle() {
        // Toggle pause menu
    }
    
    quitToMenu() {
        // Save and return to menu
    }
}
```

**Responsibilities:**
- Pause/resume game functionality
- Navigation back to main menu
- Auto-save on quit

#### Interactive Controls System - In-Game Controls Reference
```javascript
class GameControls {
    constructor() {
        this.isOpen = false;
        this.keybinds = this.loadKeybinds();
    }
    
    init() {
        this.setupEventListeners();
        this.populateControls();
    }
    
    populateControls() {
        // Dynamic controls display with status indicators
        // ✅ Implemented | 🚧 Coming Soon
    }
    
    toggleControls() {
        // Show/hide scrollable controls window
    }
}
```

**Key Features:**
- **Interactive Bubble**: Golden gamepad icon in bottom-right corner
- **Scrollable Window**: Comprehensive controls display with categories
- **Status Indicators**: Clear distinction between implemented and planned features
- **Keybind Integration**: Loads current keybinds from settings
- **Medieval Theme**: Consistent with game aesthetic
- **Non-Intrusive**: Only shows when requested

**Responsibilities:**
- On-demand controls reference
- Dynamic keybind display
- User-friendly interface
- Clean game view when closed

### 3. World System (`/world/`)

#### World.js - World Management
```javascript
class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.groundTexture = null;
    }
    
    generateWorld() {
        // Procedural tile generation
    }
    
    render(ctx, camera) {
        // Viewport-culled rendering
    }
}
```

**Responsibilities:**
- Procedural world generation
- Tile-based collision detection
- Texture loading and management
- Viewport culling optimization

### 4. Player System (`/player/`)

#### Player.js - Player Character
```javascript
class Player {
    constructor(gameWidth, gameHeight) {
        this.x = gameWidth / 2;
        this.y = gameHeight / 2;
        this.speed = 3;
        this.direction = 'down';
        this.nameTag = new NameTag('Bob', this.x, this.y);
    }
    
    update(input, world, audioManager) {
        // Enhanced input system integration
        const movement = input.getMovementInput();
        this.vx = movement.x * this.speed;
        this.vy = movement.y * this.speed;
        
        // Handle sprinting and crouching
        if (input.isSprintPressed()) {
            this.vx *= 1.5;
            this.vy *= 1.5;
        }
        if (input.isCrouchPressed()) {
            this.vx *= 0.5;
            this.vy *= 0.5;
        }
    }
    
    render(ctx) {
        // Player sprite rendering with animation
    }
}
```

**Responsibilities:**
- Enhanced movement with sprint/crouch support
- Input system integration
- Collision detection with world
- Animation state management
- Name tag display

### 5. Camera System (`/camera/`)

#### Camera.js - Camera Management
```javascript
class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.zoom = 1.0;
    }
    
    update(playerX, playerY, worldWidth, worldHeight, input) {
        // Camera following and constraints
    }
    
    applyTransform(ctx) {
        // Canvas transformation
    }
}
```

**Responsibilities:**
- Camera following and smoothing
- Zoom level management
- Canvas transformation
- Boundary constraints

### 6. Input System (`/input/`)

#### Input.js - Enhanced Input Management
```javascript
class Input {
    constructor(canvas) {
        this.keys = {};
        this.mouse = { x: 0, y: 0, isDragging: false };
        this.keybinds = this.loadKeybinds();
        this.keyActions = {};
    }
    
    loadKeybinds() {
        // Load from localStorage or use comprehensive defaults
        return {
            moveUp: 'KeyW', moveDown: 'KeyS', moveLeft: 'KeyA', moveRight: 'KeyD',
            sprint: 'ShiftLeft', crouch: 'ControlLeft', pause: 'Escape', inventory: 'KeyI',
            interact: 'KeyE', menu: 'KeyM', debug: 'F1', screenshot: 'F12',
            // ... 40+ total keybinds across 8 categories
        };
    }
    
    getMovementInput() {
        // Return normalized movement vector
        let x = 0, y = 0;
        if (this.isActionPressed('moveUp') || this.isActionPressed('moveUpAlt')) y -= 1;
        if (this.isActionPressed('moveDown') || this.isActionPressed('moveDownAlt')) y += 1;
        if (this.isActionPressed('moveLeft') || this.isActionPressed('moveLeftAlt')) x -= 1;
        if (this.isActionPressed('moveRight') || this.isActionPressed('moveRightAlt')) x += 1;
        return { x, y };
    }
    
    isActionPressed(action) {
        const keyCode = this.keybinds[action];
        return keyCode ? this.keys[keyCode] || false : false;
    }
    
    // Specific action checks
    isPausePressed() { return this.isActionPressed('pause'); }
    isInventoryPressed() { return this.isActionPressed('inventory'); }
    isSprintPressed() { return this.isActionPressed('sprint'); }
    isCrouchPressed() { return this.isActionPressed('crouch'); }
    isDebugPressed() { return this.isActionPressed('debug'); }
    isScreenshotPressed() { return this.isActionPressed('screenshot'); }
    isToggleAudioPressed() { return this.isActionPressed('toggleAudio'); }
}
```

**Key Features:**
- **Comprehensive Keybinds**: 40+ configurable keybinds across 8 categories
- **Action-Based Input**: Abstract key checking with `isActionPressed()`
- **Movement Vector**: Normalized movement input with `getMovementInput()`
- **Persistent Storage**: Keybinds saved to localStorage
- **Dynamic Updates**: Keybinds refresh when settings change
- **Fallback Support**: Direct key checking for critical functions

**Responsibilities:**
- Enhanced keyboard input handling with keybind system
- Mouse input processing
- Input state management
- Event delegation with action abstraction
- Settings integration

### 7. Settings System (`/ui/`)

#### SettingsPanel.js - Settings Management
```javascript
class SettingsPanel {
    constructor() {
        this.isOpen = false;
        this.currentCategory = 'video';
        this.categories = {
            video: null,
            keybinds: null
        };
    }
    
    createModal() {
        // Modal with category navigation
        // Video and Keybind tabs
    }
    
    switchCategory(category) {
        // Switch between Video and Keybind settings
    }
    
    registerCategory(name, component) {
        // Register settings components
    }
}
```

#### KeybindSettings.js - Keybind Management
```javascript
class KeybindSettings {
    constructor() {
        this.keybinds = this.loadKeybinds();
        this.activeKeybindElement = null;
    }
    
    loadKeybinds() {
        // Load from localStorage or use defaults
    }
    
    render() {
        // Render keybind grid with categories
        // Movement, Game Controls, Camera, UI, Combat, Quick Slots, Utility, Audio
    }
    
    startKeyCapture(element) {
        // Handle key rebinding with visual feedback
    }
}
```

#### VideoSettings.js - Video Configuration
```javascript
class VideoSettings {
    constructor() {
        this.settings = this.loadSettings();
    }
    
    render() {
        // Render distance and edge fog controls
    }
    
    save() {
        // Save to localStorage
    }
}
```

**Key Features:**
- **Category Navigation**: Switch between Video and Keybind settings
- **Comprehensive Keybinds**: 8 categories with 40+ total keybinds
- **Visual Feedback**: Animated buttons during key capture
- **Persistent Storage**: All settings saved to localStorage
- **Reset Functionality**: Restore defaults with one click
- **Medieval Theme**: Consistent with game aesthetic

**Responsibilities:**
- Settings modal management
- Keybind customization and storage
- Video settings configuration
- User preference persistence
- Category navigation

## 🎨 Rendering Architecture

### Canvas Rendering Pipeline
```
1. Clear Canvas (Black Background)
    ↓
2. Apply Camera Transform
    ↓
3. Render World Tiles (Viewport Culled)
    ↓
4. Render Player
    ↓
5. Restore Transform
    ↓
6. Render UI Overlay (Health Bar + Controls Bubble)
```

### UI Rendering Strategy
```
1. Health Bar (Top Center)
    ↓
2. Interactive Controls Bubble (Bottom Right)
    ↓
3. Modal Overlays (Inventory, Pause Menu, Settings, Controls Window)
    ↓
4. Dynamic Content (On-demand displays)
```

### Texture Rendering Strategy
```javascript
// Pixel-perfect rendering setup
ctx.save();
ctx.imageSmoothingEnabled = false;
ctx.imageSmoothingQuality = 'low';
ctx.drawImage(texture, x, y, width, height);
ctx.restore();
```

## 📊 Performance Architecture

### Viewport Culling System
```javascript
// Calculate visible area with padding
const screenWorldWidth = canvasWidth / camera.zoom;
const screenWorldHeight = canvasHeight / camera.zoom;
const extraPadding = Math.max(screenWorldWidth, screenWorldHeight) * 2;

// Only render tiles in visible area
for (let x = startX; x < endX; x++) {
    for (let y = startY; y < endY; y++) {
        // Render tile
    }
}
```

### Memory Management
- **Texture Loading**: Asynchronous with fallback systems
- **Tile Generation**: On-demand with caching
- **Event Cleanup**: Proper event listener removal
- **Canvas Optimization**: Efficient draw calls

## 🔄 Data Flow Architecture

### Update Cycle
```
Input Events → Game.update() → Component Updates → State Changes
```

### Render Cycle
```
Game.render() → Camera Transform → World Render → Player Render → UI Render
```

### Event Flow
```
User Input → Input System → Game Coordinator → Affected Components
```

## 🧪 Testing Architecture

### Debug Systems
```javascript
// Global testing functions
window.testHealth = {
    setFull: () => game.ui.updateHealth(10, 10),
    damage: (amount) => game.ui.healthBar.removeHealth(amount),
    heal: (amount) => game.ui.healthBar.addHealth(amount)
};

window.regenerateWorld = () => game.world.generateWorld();
```

### Performance Monitoring
- **Internal Tracking**: FPS and memory usage tracked internally
- **Clean Interface**: Debug panels removed for cleaner gameplay
- **On-Demand Info**: Performance data available through controls bubble
- **Optimized Rendering**: Viewport culling and efficient draw calls

## 🔧 Configuration Architecture

### Game Configuration
```javascript
const GAME_CONFIG = {
    WORLD: {
        WIDTH: 3500,
        HEIGHT: 2250,
        TILE_SIZE: 50
    },
    PLAYER: {
        SPEED: 200,
        SIZE: 32
    },
    CAMERA: {
        ZOOM_MIN: 0.5,
        ZOOM_MAX: 2.0,
        FOLLOW_SPEED: 5
    }
};
```

## 🚀 Extensibility Architecture

### Adding New Components
1. Create new component class in appropriate directory
2. Import and initialize in Game.js constructor
3. Add update/render calls in game loop
4. Implement proper cleanup methods

### Adding New Features
1. Extend existing components or create new ones
2. Update configuration as needed
3. Add testing functions for debugging
4. Update documentation

## 📝 Code Organization Principles

### File Structure
- **One Class Per File**: Clear separation and maintainability
- **Descriptive Naming**: Clear purpose from file names
- **Consistent Imports**: Standardized import patterns
- **Modular Exports**: Clean export interfaces

### Code Style
- **ES6+ Features**: Modern JavaScript practices
- **Consistent Formatting**: Readable and maintainable code
- **Comprehensive Comments**: Clear documentation
- **Error Handling**: Graceful failure modes

---

**Architecture Version**: v2.0
**Last Updated**: Enhanced with Interactive Controls & Settings System
**Status**: Production-ready with comprehensive UI/UX improvements

## 🆕 Recent Architecture Updates

### Enhanced UI/UX System
- **Interactive Controls Bubble**: On-demand controls reference
- **Clean Interface**: Removed debug panels for immersive gameplay
- **Comprehensive Settings**: Video and Keybind customization
- **Status Indicators**: Clear implementation status (✅ Implemented | 🚧 Coming Soon)

### Advanced Input System
- **40+ Configurable Keybinds**: 8 categories of customizable controls
- **Action-Based Input**: Abstract key checking with `isActionPressed()`
- **Enhanced Movement**: Sprint/crouch support with normalized vectors
- **Persistent Storage**: All keybinds saved to localStorage

### Modular Settings Architecture
- **Category Navigation**: Switch between Video and Keybind settings
- **Visual Feedback**: Animated key capture with pulse effects
- **Reset Functionality**: One-click restore to defaults
- **Medieval Theme**: Consistent styling throughout

### Inventory Integration
- **RPG-Style System**: 8 equipment slots + 24 item slots
- **Game Pause Integration**: Automatic pause when inventory opens
- **Keybind Integration**: 'I' key with fallback support
- **Beautiful UI**: Medieval-themed design with golden accents
