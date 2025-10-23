# Changelog - DCS GitHub Pages

All notable changes to this project will be documented in this file.

## [2025-01-27] - Major Feature Updates

### Added - Blocky-Builder World Editor (v0.09)
- **Complete Building System** - Full building placement, management, and rendering system
- **Building Manager UI** - Dedicated panel with drag functionality and template management
- **Texture-Based Buildings** - Upload PNG textures and place them as buildings
- **Building Persistence** - Buildings saved to localStorage and integrated with world system
- **Coordinate System Fixes** - Buildings now place exactly where you click (zoom-aware)
- **Building Rendering Pipeline** - Complete rendering system with texture caching and fallbacks
- **Template ID Resolution** - Fixed undefined templateId issues for texture-based buildings

### Added - Runes of Tir na nÓg RPG (v2.0)
- **Complete Combat System** - Player and NPC attacks with RuneScape Classic-style animations
- **Health Bar System** - Above-character health bars for player (10 HP) and NPCs (5-6 HP)
- **Floating Damage Numbers** - Animated red damage numbers that float upward and fade out
- **Hostile NPC Behavior** - Rats chase and attack players with detection radius and attack cooldowns
- **Visual Attack Effects** - Simple brown weapon swings and claw attacks with gold hit sparkles
- **Player Size Enhancement** - Increased from 12px to 18px for better visibility
- **NPC Visual Cleanup** - Removed green interaction dots, improved name positioning
- **Keybind Conflict Resolution** - Fixed Spacebar triggering both attack and chat

### Fixed
- **Building Placement Issues** - Buildings now place exactly where you click with proper coordinate conversion
- **Template Management** - Fixed undefined templateId issues for texture-based buildings
- **Debug Spam Reduction** - Throttled warning messages to reduce console spam
- **New World Clearing** - Buildings properly cleared when creating new worlds (like NPCs)
- **Spacebar Keybind Conflict** - Fixed Spacebar triggering both attack and chat - now only attacks

### Changed
- **Building System Integration** - Buildings now use proper coordinate conversion from EventSystem
- **Rendering Pipeline** - Complete building rendering system with texture caching and fallbacks
- **Project Management** - Buildings integrated with world save/load system
- **Visual Improvements** - Enhanced player visibility and NPC presentation

## [2025-01-22] - Previous Updates

### Added
- **Image Viewer Modal**: Full-featured image viewer for Asset Gallery
  - Click-to-view functionality for all gallery images
  - Full-screen modal with dark overlay and blur effects
  - Navigation controls (previous/next arrows)
  - Keyboard navigation (arrow keys, escape)
  - Download and delete actions within viewer
  - Professional Instagram-like viewing experience
  - Responsive design with hover zoom effects

### Fixed
- **Delete Notes Functionality**: Fixed notes not deleting after confirmation
- **Cached Notes Issues**: Resolved old cached notes loading in text boxes
- **Hardcoded Content**: Removed hardcoded "Game Development Notes" content
- **Notes Cache Management**: Added "Clear Notes Cache" option in Quick Actions

### Changed
- **Admin Panel Layout**: Reorganized admin tools with War Room as prominent banner
- **World Builder Integration**: Linked World Builder to Blocky-Builder project
- **Tool Card Ordering**: Moved World Builder to first position, removed Advanced Settings and Debug Tools

## [2025-01-21] - Previous Updates

### Fixed
- **War Room Panel Layout**: Fixed panel positioning and organization issues
- **Quick Actions Integration**: Moved Quick Actions from panel to dropdown menu in top navigation bar
- **Asset Panel Sizing**: Widened Asset Gallery and Music Library panels for better content display
- **Notes Pane Resizing**: Fixed real-time resizing functionality for Team Notes panel
  - Resolved CSS conflicts preventing live height updates during drag operations
  - Simplified resizing logic to ensure immediate visual feedback
  - Fixed panel positioning issues after page reload
  - Improved resizer handle visibility and interaction

### Changed
- **Panel Layout**: Reorganized War Room grid from 4-column to 3-column layout
  - Checklist and Quick Actions now share the top row
  - Asset panels (Gallery and Music Library) positioned on the right side
  - Team Notes panel spans both rows in the center
- **Navigation Enhancement**: Quick Actions now accessible via dropdown in header
- **Responsive Design**: Updated all breakpoints for new 3-column layout

### Added
- **Login System Integration**: Added login button to main index.html page
- **Modern Glass-morphism Design**: Updated login.html and admin.html to match main site aesthetic
- **DCS Logo Integration**: Integrated company logo with blue spark effects
- **Updated Tagline**: Changed subtitle to "A couple gems locked away, just waiting to be discovered"
- **Favicon Implementation**: Converted DCS logo PNG to ICO format and set as favicon across all pages
- **The War Room**: Complete team collaboration workspace with checklists, notes, and asset management
- **Filesystem Image Storage**: Full-quality image upload/download system with proper file management
- **Integrated Server Architecture**: Unified DCS server serving all projects and War Room functionality

### Changed
- **Main Page Layout**: Moved DCS logo to top position, removed "Runes of Tir na Nog" title
- **Design Consistency**: Unified styling across all pages with glass-morphism theme
- **Login Button**: Made subtle and modern to match site aesthetic
- **Background Effects**: Added aurora gradient and shimmer effects to login/admin pages

### Styling Updates
- **Blue Spark Effects**: Added animated blue spark particles around DCS logo
- **Glass-morphism Elements**: Consistent translucent backgrounds with backdrop blur
- **Modern Typography**: Switched to Segoe UI font family throughout
- **Responsive Design**: Enhanced mobile responsiveness for all new elements

### Security
- **Content Security Policy**: Maintained CSP headers across all pages
- **Login Credentials**: Hardcoded demo credentials (to be replaced with backend auth)

### Technical Details
- **Login Credentials**: 
  - admin/admin123
  - ry/password123
  - friend1/friend123
  - friend2/friend123
- **File Structure**: Added login.html, admin.html, and war-room.html to root directory
- **JavaScript Enhancements**: Added spark particle animations, login system, and War Room functionality
- **Server Architecture**: 
  - dcs-main-server.js: Unified Express.js server
  - start-dcs-server.bat: Integrated startup script
  - war-room-assets/: Filesystem storage for team assets
- **API Endpoints**: Complete REST API for image upload/download/management
- **Image Storage**: Full-quality filesystem storage with unique filename generation

## Previous Versions
- Initial project setup with Runes of Tir na Nog game
- Blocky-Builder world editor integration
- Multi-project portfolio structure
