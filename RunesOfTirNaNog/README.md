# Runes of Tir na nÓg - Enhanced Prototype

**Feature-rich top-down RPG prototype with pixel art graphics and UI systems**

## 🎯 Overview

This is an enhanced prototype demonstrating advanced game development concepts:

- ✅ **60 FPS game loop** with delta time
- ✅ **Top-down camera** that follows the player
- ✅ **WASD movement** with collision detection
- ✅ **Procedural world** generation with pixel art textures
- ✅ **Health bar system** with visual heart indicators
- ✅ **Modular component architecture** for scalability
- ✅ **No external dependencies** (vanilla JavaScript only)
- ✅ **Optimized performance** with viewport culling

## 🚀 Features

### Core Gameplay
- **Player Movement**: Smooth WASD controls
- **Collision Detection**: Prevents walking through walls
- **Camera System**: Follows player with smooth movement
- **World Rendering**: Only renders visible tiles for performance
- **Health Bar**: Visual health display with 10 heart icons at bottom of screen
- **Textured Ground**: Pixel art ground tiles with grass, dirt, and decorative elements
- **Inventory System**: Full RPG-style inventory with 8 equipment slots and 24 item slots
- **Water System**: Random water tiles with pixel art textures and audio feedback
- **Cave System**: Rare cave tiles (2% spawn) with dark cave textures

### Technical
- **Canvas Rendering**: Hardware-accelerated 2D graphics with pixel art support
- **Input Handling**: Keyboard and mouse support with 8-directional movement
- **Performance Monitoring**: Real-time FPS and memory usage display
- **Responsive Design**: Adapts to different screen sizes and zoom levels
- **Modular Architecture**: Clean separation of concerns with component-based design

## 🎮 Controls

### Movement
| Key | Action |
|-----|--------|
| W / ↑ | Move Up ✅ |
| S / ↓ | Move Down ✅ |
| A / ← | Move Left ✅ |
| D / → | Move Right ✅ |
| Shift | Sprint (1.5x speed) ✅ |
| Ctrl | Crouch (0.5x speed) ✅ |

### Game Controls
| Key | Action |
|-----|--------|
| ESC | Pause game ✅ |
| I | Open/Close Inventory ✅ |
| E | Interact with objects 🚧 |
| M | Main menu 🚧 |
| F1 | Toggle debug info ✅ |
| F12 | Take screenshot ✅ |

### Combat & Actions
| Key | Action |
|-----|--------|
| Space | Attack 🚧 |
| Q | Block/Parry 🚧 |
| X | Dodge roll 🚧 |
| F | Use item 🚧 |
| 1-8 | Quick slots 🚧 |

### Camera & UI
| Key | Action |
|-----|--------|
| Mouse | Look around (click & drag) ✅ |
| Scroll Wheel | Zoom in/out ✅ |
| = / + | Zoom in 🚧 |
| - / _ | Zoom out 🚧 |
| 0 | Reset zoom 🚧 |
| C | Toggle camera lock 🚧 |
| J | Quest log 🚧 |
| P | Character panel 🚧 |
| N | World map 🚧 |
| T | Chat/Console 🚧 |

### Audio & Utility
| Key | Action |
|-----|--------|
| K | Toggle audio ✅ |
| ] / } | Volume up 🚧 |
| [ / { | Volume down 🚧 |
| ` | Developer console 🚧 |
| F11 | Toggle fullscreen 🚧 |

> **Note**: All keybinds can be customized in the Settings menu!
> 
> **Status Legend**: ✅ Implemented | 🚧 Coming Soon

## 🎒 Inventory System

The game features a comprehensive RPG-style inventory system with equipment management and item storage.

### Equipment Slots
- **Helmet** - Head armor protection
- **Necklace** - Accessory for special bonuses
- **Chest** - Body armor protection
- **Weapon** - Main weapon slot
- **Rings (2)** - Two ring slots for special effects
- **Legs** - Leg armor protection
- **Boots** - Foot armor protection

### Item Storage
- **24 Item Slots** - General inventory grid for storing items
- **Item Tooltips** - Hover over items to see detailed information
- **Visual Feedback** - Click items to select/use them
- **Sample Items** - Includes Health Potions, Iron Sword, Leather Armor, and Gold Ring

### Character Stats
The inventory displays your character's current stats:
- **⚔️ Attack** - Damage output
- **🛡️ Defense** - Damage reduction
- **💨 Speed** - Movement speed

### Resources
- **💰 Gold** - Currency tracking (currently 1,250 gold)
- **⚖️ Weight** - Inventory capacity tracking (12/50)

### UI Features
- Beautiful medieval-themed design with golden borders
- Pixel-perfect rendering matching game aesthetic
- Automatically pauses game when open
- Responsive layout that adapts to screen size
- Smooth animations and transitions

## ⚙️ Settings System

The game features a comprehensive settings menu with multiple categories:

### Video Settings
- **Render Distance**: Adjust how many tiles are rendered around the player (16x16 to 128x128)
- **Edge Fog Intensity**: Control fog effect at render distance edges (0% to 100%)

### Keybind Settings
- **Movement Controls**: WASD, Arrow Keys, Sprint, Crouch
- **Game Controls**: Pause, Inventory, Interact, Menu
- **Camera Controls**: Zoom in/out, Reset zoom, Camera lock
- **UI Controls**: Quest log, Character panel, Map, Chat
- **Combat Controls**: Attack, Block, Dodge, Use item
- **Quick Slots**: 8 customizable quick access slots
- **Utility Controls**: Screenshot, Debug, Console, Fullscreen
- **Audio Controls**: Toggle audio, Volume up/down

### Customization Features
- **Click to Rebind**: Click any keybind button to set a new key
- **Visual Feedback**: Animated buttons during key capture
- **Reset to Defaults**: One-click restore to original keybinds
- **Persistent Storage**: Settings saved automatically to browser storage
- **Category Navigation**: Easy switching between Video and Keybind settings

## 📊 Performance

- **File Size**: Optimized modular components (~15KB total)
- **Memory Usage**: < 10MB in browser with textures loaded
- **CPU Usage**: Minimal (60 FPS target maintained)
- **Network**: Zero external requests (all assets local)
- **Rendering**: Viewport culling for optimal performance
- **Texture Loading**: Asynchronous with fallback systems

## 🔧 Technical Details

### Architecture
```
/game/
├── index.html          # Main game page
├── core/
│   ├── Game.js         # Main game coordinator
│   ├── GameLoop.js     # 60 FPS game loop
│   └── main.js         # Game initialization
├── ui/
│   ├── UI.js           # UI management
│   ├── HealthBar.js    # Health bar component
│   ├── Inventory.js    # Inventory & equipment system
│   └── PauseMenu.js    # Pause menu system
├── player/
│   ├── Player.js       # Player character
│   └── NameTag.js      # Player name display
├── world/
│   └── World.js        # World generation and rendering
├── camera/
│   └── Camera.js       # Camera system
├── input/
│   └── Input.js        # Input handling
├── audio/
│   └── AudioManager.js # Audio system with water sounds
├── assets/
│   ├── Health_1.png    # Heart icon for health bar
│   ├── Ground_Texture_1.png # Pixel art ground texture tile
│   ├── Water_Texture.png # Pixel art water texture tile
│   └── Cave_Texture_1.png # Pixel art cave texture tile
└── README.md           # This file
```

### Engine Components
- **Game Loop**: RequestAnimationFrame-based 60 FPS with delta time
- **Rendering**: Canvas 2D with viewport culling and pixel art textures
- **Input**: Event-driven keyboard and mouse handling
- **Collision**: Tile-based detection with forgiving boundaries
- **Camera**: Smooth following with zoom and boundary constraints
- **Textures**: Pixel-perfect image rendering with retro aesthetics
- **UI System**: Modular health bar and debug information display
- **World Generation**: Procedural tile generation with texture support
- **Audio System**: Web Audio API with water sound effects and footstep audio

## 🧪 Testing Health Bar

The health bar can be tested using browser console commands:

```javascript
// Set health levels
testHealth.setFull()    // 10/10 hearts
testHealth.setHalf()    // 5/10 hearts  
testHealth.setLow()     // 2/10 hearts
testHealth.setEmpty()   // 0/10 hearts

// Dynamic changes
testHealth.damage(2)    // Take 2 damage
testHealth.heal(1)      // Heal 1 health
```

## 🎨 Ground Texture System

The game now features a pixel art ground texture system:

- **Textured Tiles**: Ground tiles now use the `Ground_Texture_1.png` pixel art texture
- **Pixel-Perfect Rendering**: Maintains retro aesthetics with crisp pixel art
- **Seamless Coverage**: Textures extend beyond world bounds for infinite appearance
- **Performance Optimized**: Only renders visible tiles with viewport culling

### Testing Ground System
```javascript
// Regenerate world with new texture system
regenerateWorld()       // Generate new world layout with textures
```

## 🔊 Audio System

The game features a Web Audio API-based sound system:

- **Water Sounds**: Procedurally generated water splashing sounds when walking on water tiles
- **Footstep Audio**: Basic footstep sounds for ground movement
- **Volume Control**: Adjustable audio levels
- **Audio Toggle**: Enable/disable audio system

### Testing Audio System
```javascript
// Audio testing commands
testAudio.playWater()        // Play water sound effect
testAudio.playFootstep()     // Play footstep sound
testAudio.setVolume(0.7)     // Set volume (0-1)
testAudio.toggleAudio()      // Toggle audio on/off
```

## 🕳️ Cave System

The game features rare cave tiles scattered throughout the world:

- **Cave Tiles**: 2% spawn rate with dark cave textures
- **Walkable**: Players can traverse cave tiles without collision
- **Pixel Art**: Dark brown and gray cave textures with rocky formations
- **Rare Spawn**: Makes cave discoveries feel special and rewarding

### World Tile Distribution
- **85%** - Grass tiles (with ground texture)
- **10%** - Water tiles (with water texture + audio)
- **3%** - Wall tiles (collision blocks)
- **2%** - Cave tiles (with cave texture)

## 🚀 Next Steps

This enhanced prototype establishes a solid foundation. Future phases will add:

1. **Combat System** - Turn-based battles with health integration
2. **Quest System** - Story and objectives with UI integration
3. **Inventory** - Item management with visual representations
4. **Audio** - Music and sound effects
5. **Save System** - Progress persistence
6. **More Textures** - Additional tile types and environment variety
7. **NPCs** - Interactive characters with dialogue systems
8. **Enemies** - AI-controlled opponents with pathfinding

## 💡 Design Philosophy

- **Lightweight First**: Prove concepts work before adding complexity
- **Performance Focused**: 60 FPS target, minimal resource usage
- **Iterative Development**: Each phase adds one major system
- **Web Native**: Browser-only, no downloads required

---

*"Sometimes the best way to start is with something so simple, it can't possibly fail."*
