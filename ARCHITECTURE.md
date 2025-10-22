# Architecture - DCS GitHub Pages

## Project Overview
Diamond Clad Studios (DCS) is a comprehensive portfolio website hosting multiple game development projects and software tools. The architecture supports both static portfolio presentation and dynamic game applications.

## Detailed File Organization

### Root Level Structure
```
github-pages/
├── _config.yml                    # Jekyll configuration for GitHub Pages
├── index.html                     # Main portfolio landing page
├── login.html                     # Authentication page
├── admin.html                     # Admin panel (protected area)
├── dcs.png                        # Company logo with diamond/industrial design
├── favicon.ico                    # Company favicon (converted from dcs.png)
├── war-room.html                  # Team collaboration workspace
├── dcs-main-server.js             # Unified Express.js server
├── start-dcs-server.bat           # Server startup script
├── war-room-assets/               # Filesystem storage for team assets
├── README.md                      # Project documentation
├── CHANGELOG.md                   # Version tracking and changes
├── SUMMARY.md                     # Project overview and status
├── SCRATCHPAD.md                  # Development notes and session tracking
├── ARCHITECTURE.md                # This architecture documentation
├── test-github-pages.bat          # Local testing script
├── test-github-pages-advanced.bat # Advanced testing script
│
├── RunesOfTirNaNog/               # Main MMORPG Game Project
│   ├── index.html                 # Game landing page
│   ├── landing.html               # Game-specific landing page
│   ├── launch.bat                 # Game launcher script
│   ├── server.py                  # Python game server
│   ├── stop_server.bat            # Server shutdown script
│   ├── favicon.png                # Game favicon
│   │
│   ├── assets/                    # Game assets and resources
│   │   ├── Cave_Texture_1.png     # Cave environment texture
│   │   ├── Ground_Texture_1.png   # Ground environment texture
│   │   ├── Water_Texture.png      # Water environment texture
│   │   ├── Health_1.png           # Health UI element
│   │   ├── Pixel_Perfect_Logo_1.png # Game logo
│   │   ├── menu.html              # Game menu interface
│   │   ├── world-selection.html   # World selection interface
│   │   └── character/             # Character assets
│   │       └── guy_1.png          # Character sprite
│   │
│   ├── audio/                     # Audio management system
│   │   └── AudioManager.js        # Audio control and management
│   │
│   ├── camera/                    # Camera system
│   │   └── Camera.js              # Camera control and positioning
│   │
│   ├── core/                      # Core game systems
│   │   ├── Game.js                # Main game controller
│   │   ├── GameLoop.js            # Game loop and timing
│   │   ├── main.js                # Application entry point
│   │   ├── NetworkManager.js      # Multiplayer networking
│   │   └── SaveSystem.js          # Game save/load system
│   │
│   ├── input/                     # Input handling
│   │   └── Input.js               # Keyboard/mouse input processing
│   │
│   ├── npc/                       # Non-player character system
│   │   ├── NPC.js                 # NPC behavior and AI
│   │   ├── NPCConfig.js           # NPC configuration
│   │   ├── BOB_IMPLEMENTATION.md  # BOB NPC implementation guide
│   │   ├── BOB_TOGGLE_GUIDE.md    # BOB toggle functionality
│   │   └── README.md              # NPC system documentation
│   │
│   ├── player/                    # Player management
│   │   ├── Player.js              # Player entity and behavior
│   │   └── NameTag.js             # Player name display system
│   │
│   ├── server/                    # Multiplayer server components
│   │   ├── multiplayer_server.py  # Main multiplayer server
│   │   ├── test_server.py         # Server testing utilities
│   │   ├── start_server.bat       # Server startup script
│   │   ├── requirements.txt       # Python dependencies
│   │   ├── README.md              # Server documentation
│   │   └── worlds/                # Server-side world data
│   │       └── world.json         # Default world configuration
│   │
│   ├── ui/                        # User interface components
│   │   ├── UI.js                  # Main UI controller
│   │   ├── HealthBar.js           # Health display component
│   │   ├── Inventory.js           # Inventory management UI
│   │   ├── PauseMenu.js           # Game pause menu
│   │   ├── SettingsPanel.js       # Settings interface
│   │   ├── GameplaySettings.js    # Gameplay configuration
│   │   ├── KeybindSettings.js     # Key binding configuration
│   │   └── VideoSettings.js       # Video/graphics settings
│   │
│   ├── utils/                     # Utility functions
│   │   └── SecurityUtils.js       # Security and validation utilities
│   │
│   ├── world/                     # World management
│   │   └── World.js               # World generation and management
│   │
│   ├── worlds/                    # Game world data
│   │   └── tir-na-nog/            # Main game world
│   │       ├── world.json         # World configuration
│   │       └── README.md          # World documentation
│   │
│   ├── docs/                      # Game documentation
│   │   ├── world_generation_design.md # World generation documentation
│   │   └── SECURITY/              # Security audit documentation
│   │       ├── SECURITY_AUDIT.md  # Main security audit
│   │       ├── SECURITY_AUDIT_SUMMARY.md # Audit summary
│   │       ├── SECURITY_AUDIT_VERIFIED.md # Verification results
│   │       ├── SECURITY_FILES_MODIFIED.md # Modified files list
│   │       ├── SECURITY_FINAL_REPORT.md # Final security report
│   │       ├── SECURITY_FIXES_CHECKLIST.md # Fixes checklist
│   │       ├── SECURITY_FIXES_PROGRESS.md # Fix progress tracking
│   │       └── SECURITY_IMPLEMENTATION_SUMMARY.md # Implementation summary
│   │
│   ├── ARCHITECTURE.md            # Game architecture documentation
│   ├── CHANGELOG.md               # Game version history
│   ├── SUMMARY.md                 # Game project summary
│   ├── README.md                  # Game documentation
│   ├── MULTIPLAYER_IMPLEMENTATION_PLAN.md # Multiplayer development plan
│   └── WORLDGEN_UI_ANALYSIS.md    # World generation UI analysis
│
└── Blocky-Builder/                # World Editor Project
    ├── index.html                 # Editor landing page
    ├── launch.bat                 # Editor launcher script
    ├── package.json               # Node.js dependencies and scripts
    ├── package-lock.json          # Dependency lock file
    ├── node_modules/              # Node.js dependencies (excluded from git)
    │
    ├── assets/                    # Editor assets
    │   ├── Cave_Texture_1.png     # Cave texture for editor
    │   ├── Ground_Texture_1.png   # Ground texture for editor
    │   ├── Water_Texture.png      # Water texture for editor
    │   └── npc/                   # NPC builder assets
    │       ├── NPCBuilder.js      # NPC building functionality
    │       ├── NPCBuilderStyles.js # NPC builder styling
    │       └── INTEGRATION_GUIDE.md # NPC integration documentation
    │
    ├── public/                    # Public web assets
    │   ├── editor.html            # Main editor interface
    │   ├── index.html             # Editor landing page
    │   ├── scripts/               # Client-side JavaScript
    │   │   ├── editor.js          # Editor functionality
    │   │   └── landing.js         # Landing page functionality
    │   └── styles/                # Editor styling
    │       ├── editor.css         # Editor interface styles
    │       ├── landing.css        # Landing page styles
    │       └── themes.css         # Editor themes
    │
    ├── src/                       # Server-side source code
    │   ├── core/                  # Core editor systems
    │   │   ├── EventSystem.js     # Event handling system
    │   │   ├── Renderer.js        # Rendering engine
    │   │   └── WorldManager.js    # World management system
    │   ├── server/                # Server components
    │   │   └── server.js          # Express.js server
    │   └── tools/                 # Editor tools
    │       └── ToolManager.js     # Tool management system
    │
    ├── worlds/                    # World files created by editor
    │   ├── aile.json              # Aile world configuration
    │   ├── New_World.json         # New world template
    │   └── world.json             # Default world configuration
    │
    ├── docs/                      # Editor documentation
    │   └── ARCHITECTURE.md        # Editor architecture documentation
    │
    ├── CHANGELOG.md               # Editor version history
    ├── SUMMARY.md                 # Editor project summary
    ├── SCRATCHPAD.md              # Editor development notes
    ├── My_Thoughts.md             # Development thoughts and ideas
    ├── README.md                  # Editor documentation
    └── REQUIREMENTS.md             # Editor requirements and specifications
```

## Project Architecture Analysis

### Frontend Architecture
- **Portfolio Landing Page**: Static HTML with modern glass-morphism design
- **Authentication System**: Frontend login with localStorage session management
- **Game Applications**: Full-featured web-based games with client-server architecture
- **World Editor**: Interactive web-based editor with Node.js backend
- **Responsive Design**: Mobile-first approach with flexible layouts across all components

## Design System

### Visual Design
- **Theme**: Glass-morphism with aurora backgrounds
- **Color Palette**: 
  - Primary: Translucent whites and blues
  - Accent: Electric blue (#40a4ff, #0066cc)
  - Background: Aurora gradient (teal, green, purple, blue)
- **Typography**: Segoe UI font family throughout
- **Effects**: Backdrop blur, subtle shadows, particle animations

### Component Architecture
- **Login System**: Frontend authentication with localStorage
- **Spark Effects**: CSS animations with JavaScript particle system
- **Responsive Grid**: CSS Grid and Flexbox layouts
- **Interactive Elements**: Hover effects and smooth transitions

## Technical Implementation

### Multi-Project Architecture
The DCS portfolio supports multiple distinct project types:

#### 1. Portfolio Website (Root Level)
- **Technology Stack**: Vanilla HTML5, CSS3, JavaScript ES6+
- **Design System**: Glass-morphism with aurora gradient backgrounds
- **Authentication**: Frontend-only with localStorage session management
- **Performance**: Optimized particle systems and CSS animations
- **Server Integration**: Unified Express.js server for dynamic features

#### 2. Runes of Tir na Nog (MMORPG Game)
- **Client-Side**: HTML5 Canvas-based game engine
- **Server-Side**: Python-based multiplayer server
- **Architecture**: Real-time multiplayer with WebSocket-like communication
- **Game Systems**: 
  - Core game loop and rendering engine
  - Player management and NPC systems
  - World generation and management
  - Audio and camera systems
  - Comprehensive UI system
- **Security**: Extensive security audit documentation and implementation

#### 3. Blocky-Builder (World Editor)
- **Frontend**: Interactive web-based editor with HTML5 Canvas
- **Backend**: Node.js/Express.js server
- **Architecture**: Client-server model for collaborative editing
- **Features**: 
  - Real-time world editing
  - Asset management system
  - NPC builder integration
  - Export/import functionality

#### 4. The War Room (Team Collaboration)
- **Frontend**: Interactive workspace with checklists and asset management
- **Backend**: Integrated with unified DCS server
- **Architecture**: Filesystem-based storage with REST API
- **Features**:
  - Interactive development checklists
  - Team notes and idea sharing
  - Full-quality image upload/download
  - Progress tracking and export functionality

### CSS Architecture
- **Methodology**: Component-based styling with consistent design tokens
- **Animations**: Hardware-accelerated keyframe animations with CSS transforms
- **Responsive Design**: Mobile-first approach with flexible grid layouts
- **Performance**: Optimized selectors and efficient animation loops
- **Design System**: 
  - Aurora gradient backgrounds (45deg, #1a4d5c, #2d5a3f, #4a2d52, #1e3a5f)
  - Glass-morphism effects with backdrop-filter
  - Electric blue accent colors (#40a4ff, #0066cc)
  - Segoe UI typography throughout

### JavaScript Architecture
- **Portfolio Features**:
  - Dynamic particle generation and animation systems
  - Login system with form validation and credential checking
  - Spark effect animations for logo branding
  - Modern event handling with DOM manipulation
- **Game Systems**:
  - Modular game engine architecture
  - Real-time networking and synchronization
  - Audio management and spatial sound
  - Input handling and camera controls
- **Editor Systems**:
  - Tool management and world editing
  - Real-time collaboration features
  - Asset pipeline and management

### Security Implementation
- **Content Security Policy**: Restrictive CSP headers across all pages
- **Input Validation**: Frontend form validation with sanitization
- **Authentication**: Session management with localStorage (demo implementation)
- **Game Security**: Comprehensive security audit with documented fixes
- **Server Security**: Python and Node.js server security best practices

### Performance Considerations
- **Image Optimization**: Compressed assets and optimized loading strategies
- **CSS Optimization**: Efficient selectors, hardware acceleration, and minimal repaints
- **JavaScript Performance**: Optimized particle systems and efficient DOM manipulation
- **Loading Strategy**: Progressive enhancement with critical path optimization
- **Caching**: Static asset caching through GitHub Pages CDN
- **Bundle Size**: Minimal dependencies and optimized code splitting

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **CSS Features**: Backdrop-filter, CSS Grid, Flexbox, CSS Custom Properties
- **JavaScript**: ES6+ features with graceful degradation
- **Canvas API**: Full HTML5 Canvas support for games and editor
- **WebSocket**: Real-time communication support

### Deployment Architecture
- **Hosting Platform**: GitHub Pages with Jekyll integration
- **Build Process**: No build step required (vanilla HTML/CSS/JS)
- **CDN Distribution**: GitHub Pages global CDN for fast content delivery
- **Version Control**: Git-based deployment with automatic updates
- **Domain**: Custom domain support through GitHub Pages

### Development Workflow
- **Local Development**: Direct file editing with live browser testing
- **Testing Scripts**: Batch files for local testing and validation
- **Documentation**: Comprehensive documentation following user-specified rules
- **Version Control**: Git-based workflow with detailed changelog tracking

## Data Flow Architecture

### Portfolio Website
```
User Request → GitHub Pages → Static HTML/CSS/JS → Browser Rendering
Login Flow → Frontend Validation → localStorage → Admin Panel Access
```

### Game Application (Runes of Tir na Nog)
```
Game Client → WebSocket Connection → Python Server → Database/World State
Player Input → Client Processing → Server Validation → Multiplayer Sync
```

### World Editor (Blocky-Builder)
```
Editor Client → HTTP/WebSocket → Node.js Server → File System/World Data
Real-time Collaboration → Server Broadcasting → Multiple Client Updates
```

## Future Architecture Considerations
- **Backend Integration**: Migration to dedicated backend services for authentication
- **Database Systems**: User management, session storage, and game data persistence
- **Build System**: Potential migration to modern build tools (Webpack, Vite)
- **Component Library**: Reusable UI components across projects
- **Microservices**: Separation of game servers, editor services, and portfolio
- **Cloud Integration**: AWS/Azure deployment for scalable game infrastructure
- **API Development**: RESTful APIs for cross-project data sharing
- **Progressive Web App**: Enhanced mobile experience with offline capabilities
