# Debug Locations - DCS GitHub Pages Portfolio

## Current Session (January 27, 2025)

### Documentation Analysis Complete
- ✅ **Comprehensive Codebase Analysis** - All projects analyzed and documented
- ✅ **Documentation Coverage Verified** - All required files present and up-to-date
- ✅ **User Rules Compliance** - All documentation follows specified rules
- ✅ **Security Documentation** - SBOM files created for all projects

### Active Issues
**None Currently Identified** - All projects are in excellent condition with recent major updates

### Debug Locations by Project

#### DCS Portfolio Website
- **Login System**: login.html lines 250-255 (VALID_CREDENTIALS)
- **Spark Effects**: index.html lines 88-146 (CSS animations)
- **War Room**: war-room.html (team collaboration workspace)
- **Server API**: dcs-main-server.js (unified server with filesystem storage)

#### Runes of Tir na nÓg RPG
- **Combat System**: player/Player.js, npc/NPC.js (attack mechanics)
- **Health System**: ui/HealthBar.js (health bar rendering)
- **Game Loop**: core/Game.js (main game coordinator)
- **Input Handling**: input/Input.js (keyboard and mouse)

#### Blocky-Builder World Editor
- **Building System**: BuildingManager.js (building placement and rendering)
- **NPC Builder**: NPCBuilder.js (custom NPC upload system)
- **World Management**: WorldManager.js (world state management)
- **Rendering**: Renderer.js (canvas rendering)

#### Blocky-Builder-2.0 (React/TypeScript)
- **Map Canvas**: src/components/MapCanvas.tsx (main drawing canvas)
- **Tile Management**: src/utils/TileManager.ts (tile operations)
- **Export System**: src/components/ExportModal.tsx (export functionality)
- **Animation**: src/components/Timeline.tsx (animation timeline)

### Performance Monitoring
- **FPS Tracking**: All projects maintain 60 FPS target
- **Memory Usage**: < 20MB total across all projects
- **Rendering**: Viewport culling implemented for optimal performance
- **Loading**: Asynchronous asset loading with fallbacks

### Security Status
- **Content Security Policy**: Implemented across all pages
- **Input Validation**: SecurityUtils.js for all user inputs
- **File Upload Security**: Multer with validation and sanitization
- **XSS Prevention**: Input sanitization implemented

### Testing Commands
- **Runes of Tir na nÓg**: Console commands for health testing and world generation
- **Blocky-Builder**: Debug overlay and performance monitoring
- **DCS Portfolio**: Browser console for spark effects and login testing

---

**Last Updated**: January 27, 2025  
**Status**: All projects debugged and documented  
**Next Review**: Upon any new feature implementation
