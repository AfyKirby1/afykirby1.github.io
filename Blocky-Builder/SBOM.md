# Software Bill of Materials (SBOM)

**Project:** Blocky Builder - World Editor  
**Version:** 0.09  
**Generated:** January 27, 2025  
**Security Notice:** This project uses minimal external packages with security considerations

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
| FileReader API | File import | Low - User-initiated only |
| LocalStorage API | Data persistence | Low - Origin-restricted |
| Blob API | File export | Low - Client-side only |
| URL API | File download | Low - Temporary URLs |

## External Dependencies

### Backend Dependencies (package.json)
| Package | Version | Purpose | Security Risk |
|---------|---------|---------|---------------|
| express | ^4.18.2 | Web server framework | Low - Well-maintained |
| multer | ^2.0.2 | File upload handling | Low - Well-maintained |
| nodemon | ^3.0.1 | Development tool | Low - Dev dependency only |

### Frontend Dependencies
✅ **No npm packages**  
✅ **No CDN links**  
✅ **No third-party libraries**  
✅ **No frameworks**  
✅ **No build tools required**

## Asset Files
| File | Type | Size (approx) | Source |
|------|------|---------------|--------|
| Ground_Texture_1.png | PNG Image | ~5KB | Custom asset |
| Water_Texture.png | PNG Image | ~5KB | Custom asset |
| Cave_Texture_1.png | PNG Image | ~5KB | Custom asset |
| texture-*.png | PNG Image | Variable | User uploaded textures |
| Rat.png | PNG Image | ~2KB | NPC asset |
| Blacksmith.png | PNG Image | ~2KB | NPC asset |

## Security Profile

### Attack Surface: MINIMAL
- **Limited network requests** - Only for world save/load via API
- **Server communication** - Express.js server for file management
- **No external scripts** - All frontend code embedded in files
- **No user authentication** - No sensitive data handling
- **No database** - Uses browser's LocalStorage and file system storage

### Data Privacy: HIGH
- All data stays on user's machine
- No telemetry or analytics
- No cookies
- No tracking

### Browser Compatibility Requirements
- Modern browser with ES6 support (Chrome 51+, Firefox 54+, Safari 10+, Edge 15+)
- HTML5 Canvas support
- LocalStorage support
- FileReader API support

## License
Not specified - to be determined by project owner

## Maintenance Schedule
- **Next SBOM Review:** Upon any dependency addition or major update
- **Security Audit:** Not applicable (no dependencies)
- **Version Updates:** Tracked in CHANGELOG.md

---

**Last Updated:** January 27, 2025  
**Maintainer:** Project Owner  
**Contact:** motorcycler14@yahoo.com

