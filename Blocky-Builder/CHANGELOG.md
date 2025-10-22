# Changelog

All notable changes to Blocky Builder will be documented in this file.

## [V 0.07] - 2025-10-22

### 🔧 Grid System & Settings Overhaul

#### Grid System Fixes
- **Fixed Grid Rendering Order** - Grid now renders on top of tiles instead of behind them, making grid lines visible
- **Improved Grid Visibility** - Increased line thickness from 1px to 2px and made lines fully opaque
- **Enhanced Grid Colors** - Added dynamic grid color system with 5 color options
- **Grid Color Cycling** - Click-to-cycle button in settings: White → Black → Green → Brown → Yellow
- **Persistent Grid Preferences** - Grid color and visibility settings saved to localStorage

#### Settings System Fixes
- **Fixed Minimap Persistence** - Minimap checkbox now properly syncs with saved preferences on page refresh
- **Fixed Beta Mode Functionality** - Beta mode toggle now actually shows/hides beta features instead of placeholder message
- **Fixed Tooltips System** - Tooltips now work properly with hover functionality on UI elements
- **Settings State Management** - All settings now properly load from localStorage on startup

#### Beta Features Implementation
- **Beta Tools Panel** - Added 5 experimental tools when beta mode is enabled:
  - 🪄 Magic Wand - Select similar tiles
  - 🌈 Gradient - Create smooth transitions
  - 🔲 Pattern - Apply repeating patterns
  - 🖌️ Brush - Paint with custom brushes
  - 🐛 Debug - Show debug information
- **Beta Settings Panel** - Added 3 beta settings when beta mode is enabled:
  - Experimental Rendering - Enable advanced rendering features
  - Show Debug Info - Display real-time debug overlay
  - Performance Mode - Enable performance optimizations
- **Debug Info Overlay** - Real-time display showing FPS, tile count, zoom, view position, and system status
- **Beta State Persistence** - Beta mode and all beta settings save to localStorage

#### Technical Improvements
- **WorldManager Enhancements** - Added gridColor, betaMode, and showTooltips properties
- **Renderer Improvements** - Added experimental rendering and performance mode flags
- **UI State Management** - Proper initialization and synchronization of all UI elements with saved preferences
- **Code Cleanup** - Removed excessive debug logging for production-ready code

#### User Experience Improvements
- **Visual Feedback** - All toggles now provide immediate visual feedback and success messages
- **Tooltips Integration** - Helpful tooltips on all major UI elements (can be disabled in settings)
- **Settings Organization** - Better grouping of settings with clear visual hierarchy
- **Persistent Preferences** - All user preferences maintained across browser sessions

## [V 0.06] - 2025-10-15

### 🎨 UI/UX Enhancement Update

#### Panel Improvements
- **Wider Panels** - Left panel increased from 180px to 280px, right panel from 250px to 320px
- **Reduced Scrolling** - More content visible without vertical scrolling
- **Compact Layout** - Reduced button padding and section spacing for better space utilization
- **Smooth Animations** - 0.3s ease transitions for all panel interactions

#### Minimize/Expand Functionality
- **Toggle Buttons** - Small circular buttons in top corners of each panel (left panel: top-right, right panel: top-left)
- **Smooth Slide Animation** - Panels slide in/out with smooth transitions
- **Keyboard Shortcuts** - Q key toggles left panel, Ctrl+E toggles right panel
- **Visual Feedback** - Button arrows change direction based on panel state
- **Space Optimization** - Minimized panels take only 50px width
- **Complete Content Hiding** - All panel content properly hidden when minimized (no bleeding)
- **Overflow Protection** - Prevents content from bleeding through panel boundaries

#### Layout Optimizations
- **Compact Tool Sections** - Reduced margins and padding throughout
- **Smaller Button Text** - Font size reduced from 14px to 12px for better fit
- **Tighter Spacing** - Button margins reduced from 5px to 3px
- **Better Organization** - Improved visual hierarchy with cleaner section headers
- **Panel Organization** - Moved Statistics and Shortcuts sections to right panel for better grouping

#### Enhanced Shortcuts
- **Q** - Toggle left panel minimize/expand
- **Ctrl+E** - Toggle right panel minimize/expand
- **Updated Help** - Shortcuts section now includes panel controls

#### User Experience
- **Less Scrolling** - Wider panels show more content at once
- **Quick Access** - Minimize panels for maximum canvas space
- **Smooth Interactions** - All panel changes are animated
- **Keyboard Friendly** - Full keyboard control over panel visibility
- **Clean Minimized State** - No content bleeding when panels are minimized

---

## [V 0.05] - 2025-10-15

### 🖱️ Enhanced Mouse Controls Update

#### Right-Click Context Menu
- **Quick Actions Menu** - Right-click any tile for instant actions
- **Fill with Current Tile** - Flood fill from right-clicked location
- **Pick Tile** - Eyedropper tool to select tile under cursor
- **Add Spawn Point** - Place spawn points via context menu
- **Toggle Walkable** - Quick walkable state toggle
- **Rotate/Flip** - Transform tiles without switching tools
- **Center View** - Jump camera to any tile
- **Copy Coordinates** - Clipboard integration for tile positions
- **Tile Info Display** - Context menu shows tile name and coordinates

#### Advanced Mouse Navigation
- **Right-Click Drag** - Pan the map without selecting Pan tool
- **Middle-Click Zoom** - Cycle through 3 preset zoom levels (50%, 100%, 200%)
- **Scroll Wheel** - Smooth continuous zoom (unchanged)
- **Works Everywhere** - Right-drag panning works with any tool active

#### User Experience
- **Context-Aware Menu** - Shows current tile information
- **Quick Workflow** - Common actions accessible without toolbar
- **Smart Positioning** - Menu appears at cursor location
- **Auto-Close** - Click anywhere to dismiss menu

---

## [V 0.04] - 2025-10-15

### 🎮 Game Preview Mode Update

#### Game Preview System
- **Preview Mode Toggle** - Test your world with a playable character
- **Blue Bubble Character** - Beautiful animated character with glow effects
- **Spawn System** - Character spawns at player spawn points
- **Walkable Collision** - Respects walkable/non-walkable tile settings
- **Visual Feedback** - Tiles flash red when movement is blocked

#### Movement Controls
- **On-Screen Arrows** - Large clickable directional buttons
- **WASD Controls** - Keyboard movement support
- **Arrow Keys** - Alternative keyboard controls
- **Respawn Button** - Return to spawn point (center button)
- **Space Bar** - Quick respawn with keyboard
- **Position Display** - Shows current coordinates and tile type

#### Preview Features
- **Camera Follow** - Auto-centers on character when entering preview
- **Spawn Point Priority** - Uses player spawn if available, else any spawn
- **Boundary Checking** - Cannot move outside world bounds
- **Real-time Testing** - Test game rules without leaving editor

---

## [V 0.03] - 2025-10-15

### 🎮 Game Integration & Advanced Features Update

#### Game Rules Editor
- **Spawn Point System** - Place and manage spawn points for players, enemies, NPCs, and items
- **Walkable Areas** - Define which tile types are walkable/non-walkable
- **Game Rules Panel** - Comprehensive interface for managing all game logic
- **Visual Spawn Markers** - Color-coded markers (green=player, red=enemy, blue=NPC, yellow=item)
- **Export with Rules** - JSON exports now include complete game logic data

#### Tile Search & Filter System
- **Real-time Search** - Search tiles by name or type
- **Category Filters** - Filter by Terrain, Structures, Custom, or Favorites
- **Favorite Tiles** - Star your frequently used tiles for quick access
- **Smart Filtering** - Combines search and category filters seamlessly

#### Version Control System
- **Checkpoint System** - Save up to 20 named versions of your world
- **Load Previous Versions** - Restore any saved checkpoint
- **Checkpoint Management** - View, load, and delete saved versions
- **Auto-save Support** - Ctrl+S keyboard shortcut for quick checkpoints
- **Full State Preservation** - Checkpoints save world data AND game rules

#### Statistics & Analytics
- **Session Tracking** - Monitor session time and total edits
- **Tool Usage Stats** - See your most frequently used tools
- **Tile Usage Analytics** - Track which tiles you use most
- **Favorite Tile Tracking** - View your favorited tiles
- **Performance Metrics** - Real-time statistics display

#### Enhanced Export/Import
- **Game Rules Export** - Spawn points and walkable data included
- **Statistics Export** - World analysis data in exports
- **Version 2.0 Format** - Enhanced JSON format with backward compatibility
- **Import Game Rules** - Restore game logic when loading worlds

#### UI/UX Improvements
- **Search Bar** - Instant tile search in palette
- **Filter Buttons** - Quick category switching
- **Spawn Point Tool** - Dedicated tool with keyboard shortcut (S)
- **Stats Panel** - Beautiful statistics display
- **Version Browser** - Clean checkpoint management interface

#### Keyboard Shortcuts Added
- **S** - Spawn Point tool
- **Ctrl+S** - Save checkpoint
- **Ctrl+W** - Toggle walkable for current tile

---

## [V 0.02] - 2025-10-15

### 🚀 Major Feature Update

#### New Features
- **Undo/Redo System** - Full history with Ctrl+Z/Ctrl+Y shortcuts
- **Brush Size Options** - 1x1, 3x3, 5x5, 7x7 brush sizes for efficient painting
- **Keyboard Shortcuts** - Complete keyboard navigation and tool switching
- **PNG Export** - Export worlds as high-quality PNG images for sharing
- **Tile Categories** - Organized tile palette with Terrain, Structures, and Custom categories
- **Performance Optimization** - Viewport culling for smooth rendering on large worlds
- **Enhanced UI** - Tooltips, better error messages, and improved accessibility

#### Keyboard Shortcuts
- **Tiles:** 1=Grass, 2=Water, 3=Cave
- **Tools:** D=Draw, E=Erase, F=Fill, P=Pan, R=Rotate, X=Flip
- **Navigation:** Tab=Cycle Tools, Esc=Reset View, G=Toggle Grid
- **History:** Ctrl+Z=Undo, Ctrl+Y=Redo

#### Brush System
- Multiple brush sizes for efficient world building
- Visual brush size indicator in UI
- Brush size persists across sessions

#### Export Options
- JSON export for game integration
- PNG export for sharing and previews
- Custom tile collections export/import

#### Performance Improvements
- Viewport culling reduces rendering load
- Optimized for worlds up to 500x500 tiles
- Smooth 60fps interaction on modern browsers

#### UI/UX Enhancements
- Tooltips on all interactive elements
- Disabled state styling for undo/redo buttons
- Organized tile palette with categories
- Better visual feedback and error handling

---

## [V 0.01] - 2025-10-15

### ✨ Initial Release

#### Core Features
- Visual grid editor with 125x125 default world size
- Adjustable world dimensions (10x10 to 500x500)
- Real-time texture loading and rendering
- Pixelated texture rendering for retro aesthetic

#### Tools Implemented
- **Draw Tool** - Paint tiles with click and drag
- **Erase Tool** - Remove tiles (reset to grass)
- **Fill Tool** - Flood fill connected tiles
- **Pan Tool** - Navigate large worlds
- **Rotate Tool** - Rotate tiles in 90° increments
- **Flip Tool** - Horizontal flip for tile variety

#### Tile System
- Default tiles: Grass, Water, Cave
- Custom tile upload system with PNG support
- Auto color detection from uploaded textures
- Emoji icon support for tile identification
- Tile palette with texture previews
- Custom tile management (add, delete, export, import)

#### UI Components
- Left toolbar with tools and settings
- Center canvas with zoom and pan controls
- Right panel with tile palette and minimap
- Info display showing current tool, tile, position, zoom
- Bottom canvas controls for zoom operations

#### Minimap
- Real-time world overview with color-coded tiles
- Viewport indicator showing current view position
- Automatically scales to fit world size

#### Import/Export
- Export worlds to JSON format with metadata
- Import previously saved worlds
- Export custom tile collections
- Import custom tile collections with conflict handling
- Base64 texture encoding for portability

#### Persistence
- LocalStorage for user preferences
- Saves world dimensions, tool selection, tile selection
- Stores custom tiles with base64 textures
- Grid visibility preference
- Settings persist across sessions

#### Statistics Panel
- Live tile count for each type
- Percentage breakdown of tile usage
- Updates in real-time as you edit

#### View Controls
- Zoom range: 10% to 500%
- Mouse wheel zoom support
- Reset view button
- Grid toggle (auto-hides when zoomed out)
- Pan with middle-click or Pan tool

#### Performance
- Texture caching system
- Efficient flood fill algorithm
- Grid conditional rendering
- Optimized for worlds up to 500x500 tiles
- Smooth rendering with canvas transforms

#### Quality of Life
- Keyboard shortcuts for common actions
- Clear world and fill grass quick actions
- Confirmation dialogs for destructive operations
- World resize with data preservation option
- Automatic world size validation

### 📦 Assets Included
- Ground_Texture_1.png (Grass texture)
- Water_Texture.png (Water texture)
- Cave_Texture_1.png (Cave texture)

### 🛠️ Technical Details
- Single-file HTML application (1550 lines)
- Zero external dependencies
- Pure vanilla JavaScript (ES6+)
- HTML5 Canvas for rendering
- LocalStorage for data persistence
- Fully offline-capable

### 🎨 UI/UX
- Dark medieval theme with gold accents
- Responsive layout adapting to window size
- Intuitive tool selection with visual feedback
- Pixelated rendering style for retro games
- Professional gradient buttons and borders

### 📝 Documentation
- Comprehensive README with usage guide
- Architecture documentation
- SBOM for security tracking
- Development scratchpad
- This changelog

---

## Future Releases (Planned)

### [V 0.02] - TBD
- Undo/redo functionality
- Brush size options
- Layer support

### [V 0.03] - TBD
- Selection tools (rectangle, magic wand)
- Copy/paste functionality
- Tile categories and search

---

**Version Format:** V 0.XX  
**Release Type:** Working features only, no known issues  
**Changelog Style:** Keep A Changelog format

