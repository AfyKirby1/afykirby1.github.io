# Changelog - DCS GitHub Pages

All notable changes to this project will be documented in this file.

## [2025-01-21] - Latest Updates

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
