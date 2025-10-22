# Changelog - Runes of Tir na nÓg

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-01-27

### Added
- **Grid Toggle Feature**: Added ability to show/hide grid lines overlay in Video Settings
- **Real-time Settings Sync**: Grid toggle changes apply immediately without requiring game restart
- **Settings Persistence**: Grid setting is saved to localStorage and restored on game start

### Fixed
- **Quit to Menu Navigation**: Fixed "Quit to Menu" button to navigate to main menu (`assets/menu.html`) instead of landing page
- **Main Page Navigation**: Fixed Runes of Tir Na Nog button to point to internal landing page instead of GitHub Pages URL
- **Custom World Loading**: Fixed world path resolution from `../worlds/` to `worlds/` for proper server file structure
- **Custom World Loading**: Fixed "Invalid tile type: mana" error by adding "mana" to valid tile types in SecurityUtils.js
- **World Validation**: Updated security validation to support mana tiles in custom worlds

### Changed
- **Internal Testing**: Updated main page button to use local path `RunesOfTirNaNog/landing.html` for internal testing
- **World Path Resolution**: Changed custom world loading path from `../worlds/${sanitized}/world.json` to `worlds/${sanitized}/world.json`
- **Security Validation**: Extended valid tile types from `['grass', 'water', 'wall', 'cave']` to `['grass', 'water', 'wall', 'cave', 'mana']`
- **Custom World Support**: Enhanced support for custom worlds with mana tiles
- **Error Messages**: Improved error messages to include server port information

## [v1.2] - 2025-10-16

### Added
- **Multiplayer UI System**: Complete username management and server connection UI
- **Inventory System**: Full RPG-style inventory with 8 equipment slots and 24 item slots
- **Health Bar System**: 10-heart health display with pixel-perfect rendering
- **Ground Texture System**: Pixel art ground textures with seamless coverage
- **Enhanced UI System**: Real-time debug information and performance monitoring

### Features
- **Equipment Slots**: Helmet, necklace, chest, weapon, 2 rings, legs, boots
- **Item Storage**: 24-slot grid for general inventory items
- **Character Stats**: Attack, defense, and speed stat display
- **Resource Tracking**: Gold and weight/capacity display
- **Medieval Theme**: Golden borders and shadows throughout UI
- **Game Pause Integration**: Automatic pause when inventory opens

### Technical
- **Modular Architecture**: Clean separation of concerns
- **Performance Optimized**: Viewport culling and 60 FPS target
- **Pixel Art Support**: Crisp rendering for retro aesthetics
- **Testing Framework**: Console commands for debugging
- **Responsive Design**: Adapts to screen sizes and zoom levels

## [v1.1] - 2025-10-12

### Fixed
- **Menu Background Animation**: Eliminated jarring diagonal shift with visible jump-back
- **Smooth Animations**: 19 floating shapes with seamless loops
- **Zero Artifacts**: No black boxes or edge glitches at any viewport size

### Added
- **Professional Quality**: Fade transitions for smooth appearance
- **Random Directions**: Mix of upward/downward movements
- **Preserved Particles**: Golden pixel particles remain untouched

## [v1.0] - 2025-10-10

### Initial Release
- **Core Game Loop**: 60 FPS game loop with delta time
- **Player Movement**: 8-directional WASD movement
- **Camera System**: Smooth following with zoom and mouse look
- **World Generation**: Procedural tile-based world
- **Basic UI**: Health display and pause functionality
- **Input System**: Keyboard and mouse handling
- **Asset Loading**: Texture loading with fallback systems

---

**Format**: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
**Versioning**: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

