# Blocky Builder - Modular Architecture Documentation

## Overview
Blocky Builder is a professional, modular world editor built with a clean separation of concerns. The architecture features a backend server, modular frontend components, and comprehensive building/NPC systems.

## Current Version: V 0.09 - Building System Implementation Complete
**Date:** January 27, 2025

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Professional Web Application              │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                Backend Server (Express.js)             │ │
│  │                                                         │ │
│  │  • Static File Serving  • API Routes  • World Storage │ │
│  │  • Port 3001            • JSON APIs   • File Management│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                Frontend Architecture                   │ │
│  │                                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │ Landing Page │  │ World Editor │  │ Theme System │  │ │
│  │  │ (index.html) │  │(editor.html) │  │ (themes.css) │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │ │
│  │                                                         │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │           Modular Core Systems                 │  │ │
│  │  │                                                  │  │ │
│  │  │  • WorldManager.js    • Renderer.js            │  │ │
│  │  │  • EventSystem.js      • ToolManager.js         │  │ │
│  │  │  • BuildingManager.js  • NPCBuilder.js          │  │ │
│  │  │  • Theme System        • UI Components          │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              File Structure                            │ │
│  │                                                         │ │
│  │  src/                                                   │ │
│  │  ├── core/          # Core systems                     │ │
│  │  ├── tools/         # Tool management                  │ │
│  │  ├── ui/            # UI components                    │ │
│  │  ├── themes/        # Theme system                     │ │
│  │  └── server/        # Backend server                  │ │
│  │                                                         │ │
│  │  public/                                                │ │
│  │  ├── index.html     # Landing page                     │ │
│  │  ├── editor.html    # Main editor                      │ │
│  │  ├── styles/        # CSS files                       │ │
│  │  └── scripts/       # JavaScript files                │ │
│  │                                                         │ │
│  │  assets/             # Game textures & systems         │ │
│  │  ├── buildings/      # Building system                 │ │
│  │  ├── npc/           # NPC system                      │ │
│  │  └── tiles/         # Tile textures                   │ │
│  │                                                         │ │
│  │  worlds/             # Saved worlds (auto-created)      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Backend Server (`src/server/server.js`)
- **Express.js server** running on port 3001
- **Static file serving** for public assets and modules
- **API routes** for world saving/loading
- **File management** for world persistence
- **Multer integration** for file uploads
- **Professional launcher** with `launch.bat`

### 2. Landing Page (`public/index.html`)
- **Beautiful animated interface** with floating tiles
- **Theme selector** with 4 professional themes
- **Feature showcase** highlighting editor capabilities
- **Professional design** with smooth animations
- **"Let's Build!" button** to launch editor

### 3. Core Systems (`src/core/`)

#### WorldManager.js
- **World state management** (dimensions, tiles, viewport)
- **Tile operations** (get, set, resize)
- **World data serialization** for saving/loading
- **Grid management** and world bounds
- **Spawn points system** with ID management
- **Buildings integration** with world data

#### Renderer.js
- **Canvas rendering** with zoom and pan support
- **Texture loading** and management
- **Minimap rendering** with viewport indicator
- **Grid rendering** with proper layering (behind tiles)
- **Performance optimization** with viewport culling
- **Coordinate system** with integer precision for accurate tile placement
- **Rendering order** - grid first, tiles on top for clean appearance
- **NPC sprite caching** for custom images
- **Building sprite caching** for custom images
- **Background color management** with natural presets

#### EventSystem.js
- **Mouse input handling** (draw, pan, zoom)
- **Keyboard shortcuts** for all tools
- **Panel management** (minimize/expand)
- **Context menu** system
- **Event delegation** and management
- **Performance optimization** with frame rate limiting
- **Right-click drag panning** without tool switching
- **Middle-click zoom presets** cycling

### 4. Tool System (`src/tools/`)

#### ToolManager.js
- **Tool selection** and cycling
- **Tool-specific actions** (draw, erase, fill, etc.)
- **Tool state management** and UI updates
- **Tool usage tracking** for statistics
- **Extensible architecture** for new tools
- **NPC and Building tool integration**
- **Beta tools support** with conditional display

### 5. Building System (`assets/buildings/`)

#### BuildingManager.js
- **Building placement** and management system
- **Texture-based buildings** with PNG upload support
- **Template system** for both texture and template-based buildings
- **Persistent storage** with localStorage integration
- **Building Manager UI** with drag functionality
- **Coordinate system integration** with proper zoom/pan handling
- **Building rendering** with texture caching and fallbacks
- **Building outlines** with golden borders
- **Template ID resolution** for texture-based buildings
- **Debug spam reduction** with throttled warnings

#### BuildingManagerStyles.js
- **Building panel styling** with drag functionality
- **Upload modal styles** for template and texture uploads
- **Template list styling** with hover effects
- **Configuration panel styling** with form elements

### 6. NPC System (`assets/npc/`)

#### NPCBuilder.js
- **NPC creation** and placement system
- **Custom PNG upload** with preview system
- **Template management** with persistent storage
- **Drag functionality** with GPU acceleration
- **File package system** for GitHub Pages deployment
- **Persistent storage** with hybrid localStorage + file system
- **Template cleanup** with orphaned entry removal

#### NPCBuilderStyles.js
- **NPC panel styling** with drag functionality
- **Upload modal styles** for PNG uploads
- **Template list styling** with compact layout
- **Drag optimizations** with CSS transforms

### 7. Theme System (`public/styles/themes.css`)
- **4 Professional Themes:**
  - 🌙 **Dark Theme** - Classic dark mode
  - ☀️ **Light Theme** - Clean light mode
  - 🕹️ **Retro Theme** - Matrix-style green
  - 🌲 **Forest Theme** - Nature-inspired colors
- **CSS Custom Properties** for easy customization
- **Smooth transitions** between themes
- **Persistent theme selection** via localStorage

### 8. UI Components (`public/editor.html`)
- **Modular toolbar** with minimize/expand
- **Tile palette** with visual selection and proper click handling
- **Minimap** with viewport indicator
- **Statistics panel** with real-time updates
- **Settings modal** with theme selection and background color options
- **Toast notifications** for user feedback
- **Project Setup modal** with mandatory world creation flow
- **New Project button** in header for easy project management
- **Building Manager panel** with template management
- **NPC Builder panel** with template management
- **Focus management** and accessibility features

## Data Flow

```
User Input → EventSystem → ToolManager → WorldManager → Renderer → Canvas
     ↓
LocalStorage ← API Server ← World Data ← Serialization
```

## Key Features

### 🎨 **Professional Landing Page**
- Animated background with floating game elements
- Feature showcase with interactive cards
- Theme selector with live preview
- Professional design with smooth animations

### 🏗️ **Modular Architecture**
- Clean separation of concerns
- Easy to extend and maintain
- Plugin-ready architecture
- Scalable design patterns

### 🎭 **Theme System**
- 4 beautiful themes with smooth transitions
- CSS custom properties for easy customization
- Persistent theme selection
- Professional visual design

### 🚀 **Backend Integration**
- Express.js server for professional deployment
- API routes for world management
- File persistence and loading
- Easy deployment and scaling

### ⚡ **Performance Optimized**
- Viewport culling for large worlds
- Efficient rendering with requestAnimationFrame
- Modular loading for faster startup
- Optimized event handling
- Frame-rate limiting during panning
- Disabled culling for reliable tile rendering

### 🏗️ **Building System (V 0.09)**
- **Complete Building System** - Full building placement, management, and rendering
- **Texture-Based Buildings** - Upload PNG textures and place them as buildings
- **Building Manager UI** - Dedicated panel with drag functionality
- **Building Persistence** - Buildings saved to localStorage and integrated with world system
- **Coordinate System Fixes** - Buildings place exactly where you click (zoom-aware)
- **Building Rendering Pipeline** - Complete rendering system with texture caching and fallbacks
- **Template ID Resolution** - Fixed undefined templateId issues for texture-based buildings
- **Building Outlines** - Golden outline borders for placed buildings
- **Debug Spam Reduction** - Throttled warning messages to reduce console spam

### 🧙 **NPC System (V 0.08)**
- **Custom NPC Upload System** - PNG upload with preview and template management
- **Draggable NPC Builder Panel** - Smooth drag functionality with GPU acceleration
- **Persistent NPC Storage** - Hybrid localStorage + file system for GitHub Pages
- **NPC Template Management** - Custom NPC templates with deletion and cleanup
- **GitHub Pages Integration** - Deployment script and persistent folder structure

## Development Workflow

### Adding New Tools
1. Create tool class in `src/tools/`
2. Register in `ToolManager.js`
3. Add UI button in `editor.html`
4. Implement tool logic and rendering

### Adding New Themes
1. Add theme CSS in `themes.css`
2. Add option in theme selector
3. Update `applyTheme()` function
4. Test theme transitions

### Extending Core Systems
- **WorldManager** - Add new world properties
- **Renderer** - Add new rendering features
- **EventSystem** - Add new input handling
- **ToolManager** - Add new tool types

### Adding New Building Types
1. Create building template in `BuildingManager.js`
2. Add texture loading in `Renderer.js`
3. Implement building-specific logic
4. Add UI controls in building panel

### Adding New NPC Types
1. Create NPC template in `NPCBuilder.js`
2. Add sprite loading in `Renderer.js`
3. Implement NPC-specific behavior
4. Add UI controls in NPC panel

## Deployment

### Local Development
```bash
# Install dependencies
npm install

# Start server
npm start

# Or use launcher
launch.bat
```

### Production Deployment
- Deploy to any Node.js hosting service
- Configure environment variables
- Set up file storage for worlds
- Configure domain and SSL

## Benefits of New Architecture

### For Users
- **Professional experience** with landing page
- **Theme customization** for personal preference
- **Better performance** with modular code
- **Easier navigation** with clear structure
- **Complete building system** with texture-based buildings
- **Advanced NPC system** with custom uploads

### For Developers
- **Easy to extend** - add new tools, themes, features
- **Maintainable code** - each system is separate
- **Plugin-ready** - architecture supports extensions
- **Scalable** - can grow with project needs
- **Building system integration** - easy to add new building types
- **NPC system integration** - easy to add new NPC types

### For Future Growth
- **Game integration** - easy to connect to game engines
- **Multiplayer support** - server architecture ready
- **Cloud features** - backend can be extended
- **Mobile support** - responsive design ready

## Recent Fixes and Improvements

### 🐛 **Critical Bug Fixes (V 0.09)**
- **Fixed building placement** - Coordinate system now uses integer precision
- **Fixed grid rendering order** - Grid now renders behind tiles instead of through them
- **Fixed world creation** - Proper tile loop order for correct world dimensions
- **Fixed panning** - Corrected pan direction and viewport centering
- **Fixed tile culling** - Disabled problematic culling for reliable rendering
- **Fixed Project Setup modal** - Mandatory flow with proper focus management
- **Fixed building coordinate conversion** - Buildings use proper coordinate system from EventSystem
- **Fixed template ID resolution** - Fixed undefined templateId issues for texture-based buildings
- **Fixed debug spam** - Throttled warning messages to reduce console spam

### 🎯 **User Experience Improvements**
- **New Project button** in header for easy project management
- **Mandatory Project Setup** - Users must create/load world before editing
- **Background color settings** - Natural preset colors (green, brown, grey, black, white, blue)
- **Enhanced settings system** - Minimap toggle, tooltips toggle, grid settings
- **Focus trap** - Prevents tab navigation escaping modal dialogs
- **Visual feedback** - Toast notifications for all user actions
- **Building Manager UI** - Dedicated panel with drag functionality and template management
- **Building outlines** - Golden outline borders for placed buildings

### 🔧 **Technical Improvements**
- **Integer coordinate system** - Ensures accurate tile placement and retrieval
- **Proper rendering order** - Grid → Tiles → Buildings → UI for clean appearance
- **Frame-rate limiting** - Smooth panning performance
- **Optimized context operations** - Reduced save/restore calls
- **Enhanced error handling** - Better API response validation
- **Accessibility features** - Proper tabindex and focus management
- **Building rendering pipeline** - Complete rendering system with texture caching and fallbacks
- **Building persistence** - Buildings integrated with world save/load system

## Migration from Old Architecture

The old monolithic `world-editor.html` has been completely replaced with:
- **Modular JavaScript** classes in `src/core/` and `src/tools/`
- **Professional HTML** structure in `public/`
- **Organized CSS** with theme system
- **Backend server** for file management
- **Beautiful landing page** for user experience
- **Robust error handling** and user feedback systems
- **Professional UI/UX** with proper accessibility
- **Complete building system** with texture-based buildings
- **Advanced NPC system** with custom uploads

This new architecture provides a solid foundation for building amazing game worlds with professional-grade tools and extensibility.

---

**Architecture Version:** v0.09  
**Last Updated:** January 27, 2025  
**Status:** Complete building system implementation with coordinate fixes and professional UI integration