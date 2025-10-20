# Blocky Builder - Modular System 

## Overview
Blocky Builder is now a professional, modular world editor built with a clean separation of concerns. The architecture features a backend server, modular frontend components, and a beautiful landing page system.

## New Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Professional Web Application              │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                Backend Server (Express.js)             │ │
│  │                                                         │ │
│  │  • Static File Serving  • API Routes  • World Storage │ │
│  │  • Port 3000            • JSON APIs   • File Management│ │
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
│  │  assets/             # Game textures                    │ │
│  │  worlds/             # Saved worlds (auto-created)      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Backend Server (`src/server/server.js`)
- **Express.js server** running on port 3000
- **Static file serving** for public assets and modules
- **API routes** for world saving/loading
- **File management** for world persistence
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

#### Renderer.js
- **Canvas rendering** with zoom and pan support
- **Texture loading** and management
- **Minimap rendering** with viewport indicator
- **Grid rendering** with proper layering (behind tiles)
- **Performance optimization** with viewport culling
- **Coordinate system** with integer precision for accurate tile placement
- **Rendering order** - grid first, tiles on top for clean appearance

#### EventSystem.js
- **Mouse input handling** (draw, pan, zoom)
- **Keyboard shortcuts** for all tools
- **Panel management** (minimize/expand)
- **Context menu** system
- **Event delegation** and management

### 4. Tool System (`src/tools/`)

#### ToolManager.js
- **Tool selection** and cycling
- **Tool-specific actions** (draw, erase, fill, etc.)
- **Tool state management** and UI updates
- **Tool usage tracking** for statistics
- **Extensible architecture** for new tools

### 5. Theme System (`public/styles/themes.css`)
- **4 Professional Themes:**
  - 🌙 **Dark Theme** - Classic dark mode
  - ☀️ **Light Theme** - Clean light mode
  - 🕹️ **Retro Theme** - Matrix-style green
  - 🌲 **Forest Theme** - Nature-inspired colors
- **CSS Custom Properties** for easy customization
- **Smooth transitions** between themes
- **Persistent theme selection** via localStorage

### 6. UI Components (`public/editor.html`)
- **Modular toolbar** with minimize/expand
- **Tile palette** with visual selection and proper click handling
- **Minimap** with viewport indicator
- **Statistics panel** with real-time updates
- **Settings modal** with theme selection and background color options
- **Toast notifications** for user feedback
- **Project Setup modal** with mandatory world creation flow
- **New Project button** in header for easy project management
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

### For Developers
- **Easy to extend** - add new tools, themes, features
- **Maintainable code** - each system is separate
- **Plugin-ready** - architecture supports extensions
- **Scalable** - can grow with project needs

### For Future Growth
- **Game integration** - easy to connect to game engines
- **Multiplayer support** - server architecture ready
- **Cloud features** - backend can be extended
- **Mobile support** - responsive design ready

## Recent Fixes and Improvements

### 🐛 **Critical Bug Fixes (Latest)**
- **Fixed tile placement** - Coordinate system now uses integer precision
- **Fixed grid rendering order** - Grid now renders behind tiles instead of through them
- **Fixed world creation** - Proper tile loop order for correct world dimensions
- **Fixed panning** - Corrected pan direction and viewport centering
- **Fixed tile culling** - Disabled problematic culling for reliable rendering
- **Fixed Project Setup modal** - Mandatory flow with proper focus management

### 🎯 **User Experience Improvements**
- **New Project button** in header for easy project management
- **Mandatory Project Setup** - Users must create/load world before editing
- **Background color settings** - Natural preset colors (green, brown, grey, black, white, blue)
- **Enhanced settings system** - Minimap toggle, tooltips toggle, grid settings
- **Focus trap** - Prevents tab navigation escaping modal dialogs
- **Visual feedback** - Toast notifications for all user actions

### 🔧 **Technical Improvements**
- **Integer coordinate system** - Ensures accurate tile placement and retrieval
- **Proper rendering order** - Grid → Tiles → UI for clean appearance
- **Frame-rate limiting** - Smooth panning performance
- **Optimized context operations** - Reduced save/restore calls
- **Enhanced error handling** - Better API response validation
- **Accessibility features** - Proper tabindex and focus management

## Migration from Old Architecture

The old monolithic `world-editor.html` has been completely replaced with:
- **Modular JavaScript** classes in `src/core/` and `src/tools/`
- **Professional HTML** structure in `public/`
- **Organized CSS** with theme system
- **Backend server** for file management
- **Beautiful landing page** for user experience
- **Robust error handling** and user feedback systems
- **Professional UI/UX** with proper accessibility

This new architecture provides a solid foundation for building amazing game worlds with professional-grade tools and extensibility.