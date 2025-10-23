# Blocky Builder - Development Scratchpad

## Version 0.09 - January 27, 2025
**Building System Implementation & Coordinate Fixes**

### Major Features Added
- **Complete Building System** - Full building placement, management, and rendering
- **Texture-Based Buildings** - Upload PNG textures and place them as buildings
- **Building Manager UI** - Dedicated panel with drag functionality
- **Building Persistence** - Buildings saved to localStorage and integrated with world system
- **Coordinate System Fixes** - Buildings now place exactly where you click (zoom-aware)

### Technical Fixes
- **Fixed Building Placement** - Buildings now use proper coordinate conversion system
- **Template ID Resolution** - Fixed undefined templateId issues for texture-based buildings
- **Debug Spam Reduction** - Throttled warning messages to reduce console spam
- **New World Clearing** - Buildings properly cleared when creating new worlds
- **Rendering Pipeline** - Complete rendering system with texture caching and fallbacks

### Architecture Updates
- **BuildingManager Class** - New building management system with template support
- **Renderer Integration** - Buildings integrated into main rendering pipeline
- **Event System Integration** - Buildings use proper coordinate conversion from EventSystem
- **World Data Integration** - Buildings integrated with world save/load system

## Version 0.01 - October 15, 2025
**Initial Project Setup**

### Project Initialization
- Created comprehensive documentation suite
- Prepared git repository structure
- Ready for initial GitHub push to: https://github.com/AfyKirby1/Blocky-Builder

### Project Context
This is a standalone HTML-based world editor tool. The entire application runs in a single HTML file with embedded CSS and JavaScript. No build process or dependencies required - just open in browser and use.

### Key Design Decisions
1. **Single-file architecture** - Everything in one HTML file for maximum portability
2. **LocalStorage persistence** - Saves user preferences and custom tiles automatically
3. **Base64 texture storage** - Custom tiles stored as base64 for localStorage compatibility
4. **Canvas-based rendering** - Uses HTML5 Canvas for pixel-perfect rendering
5. **No external dependencies** - Pure vanilla JavaScript for zero setup friction

### File Organization
- Main app: `world-editor.html` (1550 lines)
- Assets: PNG texture files in `assets/` folder
- Docs: README, SUMMARY, ARCHITECTURE, etc.

### Technical Notes
- Zoom range: 10% to 500%
- World size range: 10x10 to 500x500 tiles
- Tile size: 32px (fixed)
- Default world: 125x125 tiles
- Export format: JSON with full metadata

### Features Worth Noting
- **Flood Fill:** Uses stack-based algorithm with visited set for performance
- **Rotation/Flip:** Transform tiles with 90° increments and horizontal flip
- **Auto Color Detection:** Samples center pixel of uploaded texture for fallback color
- **Viewport Indicator:** Minimap shows current view position and zoom level
- **Grid Toggle:** Can be disabled for cleaner view

### Future Considerations
- Could add WebGL renderer for larger worlds
- Might benefit from worker threads for flood fill on huge areas
- Consider IndexedDB for larger custom tile collections
- Could add collaborative editing with WebRTC

---

## Version 0.06 - October 15, 2025
**UI/UX Enhancement Update**

### User Request
User wanted to:
1. Widen the panels to reduce scrolling
2. Add minimize/expand functionality with smooth animations
3. Optimize layout for better space utilization

### Implementation Details
- **Panel Widths:** Left panel 180px → 280px, Right panel 250px → 320px
- **Minimize Functionality:** Added toggle buttons with smooth slide animations
- **CSS Transitions:** 0.3s ease transitions for all panel interactions
- **Keyboard Shortcuts:** Q for left panel, Ctrl+E for right panel
- **Layout Optimization:** Reduced button padding (12px → 8px), font size (14px → 12px), margins (5px → 3px)

### Technical Implementation
- Added `.minimized` CSS classes with width transitions
- Created `toggleLeftPanel()` and `toggleRightPanel()` JavaScript functions
- Updated keyboard event handler to include new shortcuts
- Modified CSS for compact layout throughout
- Added minimize buttons to HTML with proper positioning

### Code Changes
- CSS: Added minimize functionality, transitions, compact styling
- HTML: Added minimize buttons to both panels
- JavaScript: Added panel toggle functions and keyboard shortcuts
- Documentation: Updated CHANGELOG.md and SUMMARY.md

### User Experience Improvements
- Significantly less vertical scrolling required
- Quick access to maximize canvas space when needed
- Smooth, professional animations
- Full keyboard control over panel visibility
- Better space utilization throughout interface

### Notes for Future Development
- Panel state could be persisted in localStorage
- Could add panel width customization
- Might add panel docking options
- Consider adding panel themes/skins

---

## Version 0.06 - October 15, 2025 (Updated)
**UI/UX Enhancement Update - Bug Fixes**

### Issues Identified and Fixed
1. **Minimize Buttons Not Visible** - Buttons had `display: none` by default
2. **Right Panel Content Bleeding** - Content was visible when panel was minimized
3. **Button Positioning Issues** - Right panel button was positioned incorrectly
4. **Button Text Logic Errors** - Arrow directions were wrong for right panel

### Technical Fixes Applied
- **Button Visibility:** Changed `display: none` to `display: block` for `.minimize-btn`
- **Right Panel Button Position:** Added specific CSS rule `.right-panel .minimize-btn` with `left: 10px`
- **Content Hiding:** Used comprehensive CSS selector `.right-panel.minimized > *:not(.minimize-btn)` to hide all children except button
- **Overflow Protection:** Added `overflow: hidden` to minimized state
- **Button Text Logic:** Fixed arrow directions in `toggleRightPanel()` function

### CSS Changes Made
```css
.minimize-btn {
    display: block; /* Changed from display: none */
}

.right-panel .minimize-btn {
    left: 10px; /* Position on left side of right panel */
}

.right-panel.minimized {
    overflow: hidden; /* Prevent content bleeding */
}

.right-panel.minimized > *:not(.minimize-btn) {
    display: none; /* Hide all content except button */
}
```

### JavaScript Fixes
- Fixed button text logic in `toggleRightPanel()` function
- Ensured proper arrow direction changes (◀ when expanded, ▶ when minimized)

### Result
- Both minimize buttons now visible and functional
- Right panel properly hides all content when minimized
- No content bleeding through panel boundaries
- Smooth animations work correctly
- Keyboard shortcuts (Q and Ctrl+E) work as expected

---

## Version 0.08 - January 27, 2025
**NPC Builder System Overhaul**

### User Requests and Issues Resolved
1. **NPC Placement Alignment** - Fixed NPCs placing away from cursor
2. **Custom NPC Upload** - Implemented PNG upload system with preview
3. **UI Streamlining** - Removed NPC Management panel, direct NPC Builder access
4. **Drag Functionality** - Added draggable NPC Builder panel with smooth performance
5. **Double File Dialog** - Fixed duplicate file dialog opening issue
6. **Keyboard Conflicts** - Prevented modal input hotkey conflicts
7. **Template Cleanup** - Removed all default templates except user's custom ones
8. **Persistent Storage** - Implemented hybrid localStorage + file system for GitHub Pages
9. **File Management** - Added manual file cleanup instructions for persistent folder
10. **PNG Import Issues** - Fixed template list initialization order problems

### Technical Implementation Details
- **Custom NPC Upload System**: Complete workflow from PNG upload to template creation
- **Drag Performance**: Used `requestAnimationFrame` and CSS `transform` for GPU acceleration
- **Event Handling**: Added `stopPropagation()` to prevent keyboard event conflicts
- **Initialization Order**: Fixed `createTemplateList()` being called before UI elements exist
- **File System Integration**: Created `deploy-npc.js` helper script for GitHub Pages deployment
- **Storage Management**: Hybrid system with localStorage for immediate use and files for persistence

### Key Code Changes
- **NPCBuilder.js**: Major refactor for custom NPC system, drag functionality, and initialization fixes
- **NPCBuilderStyles.js**: Added upload modal styles, drag optimizations, and compact layout
- **ToolManager.js**: Updated NPC tool handler for direct panel access
- **editor.html**: Removed NPC Management section, updated NPC button
- **deploy-npc.js**: New helper script for automated NPC package deployment

### Current Status
- ✅ All user-reported issues resolved
- ✅ Custom NPC upload system fully functional
- ✅ Drag functionality smooth and responsive
- ✅ Persistent storage working for GitHub Pages
- ✅ File cleanup system implemented
- ✅ PNG import issues fixed

### Notes for Future Development
- Consider adding NPC animation system
- Could implement NPC behavior editor
- Might add NPC template sharing system
- Consider adding NPC collision detection