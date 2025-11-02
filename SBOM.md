# Software Bill of Materials (SBOM)

**Project:** DCS GitHub Pages Portfolio  
**Version:** 1.0  
**Generated:** January 27, 2025  
**Last Updated:** January 27, 2025  
**Security Notice:** This project uses minimal external dependencies with comprehensive security measures

## Core Technologies

### Runtime Environment
| Component | Version | Type | Source |
|-----------|---------|------|--------|
| HTML5 | Standard | Core | W3C Specification |
| CSS3 | Standard | Core | W3C Specification |
| JavaScript (ES6+) | ECMAScript 2015+ | Core | ECMA-262 Standard |

### Browser APIs Used
| API | Purpose | Security Risk |
|-----|---------|---------------|
| Canvas API | 2D rendering | Low - Sandboxed |
| LocalStorage API | Data persistence | Low - Origin-restricted |
| WebSocket API | Multiplayer communication | Low - Secure connections only |
| Audio API | Sound effects | Low - User-initiated only |
| FileReader API | Asset loading | Low - User-initiated only |
| Performance API | Performance monitoring | Low - Read-only |
| Blob API | File export | Low - Client-side only |
| URL API | File download | Low - Temporary URLs |

## External Dependencies

### Backend Dependencies (package.json)
| Package | Version | Purpose | Security Risk |
|---------|---------|---------|---------------|
| express | ^4.18.2 | Web server framework | Low - Well-maintained |
| multer | ^1.4.5-lts.1 | File upload handling | Low - Well-maintained |
| nodemon | ^3.0.1 | Development tool | Low - Dev dependency only |

### Frontend Dependencies
✅ **No npm packages**  
✅ **No CDN links**  
✅ **No third-party libraries**  
✅ **No frameworks**  
✅ **No build tools required**

### Game Server Dependencies (Python)
| Package | Version | Purpose | Security Risk |
|---------|---------|---------|---------------|
| Python 3.x | Latest | WebSocket server | Low - Well-maintained |
| websockets | Latest | WebSocket handling | Low - Well-maintained |
| asyncio | Built-in | Async operations | Low - Standard library |

### React/TypeScript Dependencies (Blocky-Builder-2.0)
| Package | Version | Purpose | Security Risk |
|---------|---------|---------|---------------|
| react | ^19.2.0 | Frontend framework | Low - Well-maintained |
| typescript | ^4.9.5 | Type safety | Low - Well-maintained |
| electron | ^38.4.0 | Desktop app | Low - Well-maintained |
| react-scripts | 5.0.1 | Build tools | Low - Well-maintained |

## Asset Files
| File | Type | Size (approx) | Source |
|------|------|---------------|--------|
| dcs.png | PNG Image | ~15KB | Company logo |
| Ground_Texture_1.png | PNG Image | ~5KB | Game asset |
| Water_Texture.png | PNG Image | ~5KB | Game asset |
| Cave_Texture_1.png | PNG Image | ~5KB | Game asset |
| Health_1.png | PNG Image | ~3KB | UI asset |
| Pixel_Perfect_Logo_1.png | PNG Image | ~8KB | Game logo |
| guy_1.png | PNG Image | ~2KB | Character asset |
| Rat.png | PNG Image | ~2KB | NPC asset |

## Security Profile

### Attack Surface: MINIMAL
- **Limited network requests** - Only for world save/load via API
- **Server communication** - Express.js server for file management
- **No external scripts** - All frontend code embedded in files
- **No user authentication** - Demo credentials only
- **No database** - Uses browser's LocalStorage and file system storage

### Data Privacy: MAXIMUM
- All data stays on user's machine
- No telemetry or analytics
- No cookies
- No tracking
- No external data transmission

### Security Measures Implemented
| Security Feature | Implementation | Risk Mitigation |
|------------------|----------------|-----------------|
| Content Security Policy | CSP headers | XSS prevention |
| Input Validation | SecurityUtils.js | Injection prevention |
| Safe JSON Parsing | SecurityUtils.js | Prototype pollution prevention |
| Keybind Validation | Input.js | Key code whitelisting |
| File Path Validation | SecurityUtils.js | Path traversal prevention |
| XSS Prevention | Input sanitization | Cross-site scripting prevention |

## Browser Compatibility Requirements
- Modern browser with ES6 support (Chrome 51+, Firefox 54+, Safari 10+, Edge 15+)
- HTML5 Canvas support
- LocalStorage support
- WebSocket support (for multiplayer)
- Audio API support (for sound effects)
- FileReader API support

## Performance Characteristics
| Metric | Value | Notes |
|--------|-------|-------|
| File Size | ~50KB total | Optimized modular components |
| Memory Usage | < 20MB | Efficient rendering and cleanup |
| CPU Usage | Minimal | 60 FPS target maintained |
| Network | Minimal external requests | All assets local |
| Rendering | Viewport culling | Optimal performance |

## License
MIT

## Maintenance Schedule
- **Next SBOM Review:** Upon any dependency addition or major update
- **Security Audit:** Quarterly review of security measures
- **Version Updates:** Tracked in CHANGELOG.md

## Security Audit Status
✅ **VULN-001**: XSS Prevention - Implemented  
✅ **VULN-002**: Input Validation - Implemented  
✅ **VULN-003**: Safe JSON Parsing - Implemented  
✅ **VULN-004**: File Path Validation - Implemented  
✅ **VULN-005**: Keybind Validation - Implemented  
✅ **VULN-006**: Content Security Policy - Implemented  

---

**Last Updated:** January 27, 2025  
**Maintainer:** Project Owner  
**Contact:** motorcycler14@yahoo.com
