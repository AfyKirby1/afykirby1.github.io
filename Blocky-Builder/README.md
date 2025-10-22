# Blocky Builder - Modular World Editor

## 🚀 **NEW MODULAR ARCHITECTURE**

Welcome to the completely refactored Blocky Builder! This is now a professional, extensible world editor with a beautiful landing page and modular architecture.

## 📁 **Project Structure**

```
Blocky-Builder/
├── 📁 src/                          # Source code modules
│   ├── 📁 core/                     # Core systems
│   │   ├── WorldManager.js         # World state management
│   │   ├── Renderer.js             # Canvas rendering
│   │   └── EventSystem.js          # Input handling
│   ├── 📁 tools/                    # Tool system
│   │   └── ToolManager.js          # Tool management
│   ├── 📁 ui/                       # UI components
│   ├── 📁 themes/                   # Theme system
│   └── 📁 server/                   # Backend server
│       └── server.js                # Express server
├── 📁 public/                       # Web assets
│   ├── index.html                  # Landing page
│   ├── editor.html                 # Main editor
│   ├── 📁 styles/                   # CSS files
│   │   ├── landing.css             # Landing page styles
│   │   ├── editor.css              # Editor styles
│   │   └── themes.css              # Theme system
│   └── 📁 scripts/                  # JavaScript files
│       ├── landing.js              # Landing page logic
│       └── editor.js               # Main editor logic
├── 📁 assets/                       # Game assets
├── 📁 worlds/                       # Saved worlds (auto-created)
├── 📁 docs/                         # Documentation
│   └── ARCHITECTURE.md             # System architecture
├── launch.bat                      # Windows launcher
├── package.json                    # Dependencies
└── README.md                       # This file
```

> **✨ Clean Architecture:** The old monolithic `world-editor.html` has been completely replaced with this modular, professional structure!

## 🎯 **Quick Start**

### **Option 1: Easy Launch (Recommended)**
1. **Double-click `launch.bat`**
2. **Wait for server to start**
3. **Open browser to `http://localhost:3000`**
4. **Click "Let's Build!"**

### **Option 2: Manual Launch**
```bash
# Install dependencies
npm install

# Start server
npm start

# Open browser to http://localhost:3000
```

## ✨ **New Features**

### **🎨 Beautiful Landing Page**
- **Animated background** with floating tiles
- **Feature showcase** with interactive cards
- **Theme selector** with 4 beautiful themes
- **Professional design** with smooth animations

### **🎭 Theme System**
- **🌙 Dark Theme** - Classic dark mode
- **☀️ Light Theme** - Clean light mode  
- **🕹️ Retro Theme** - Matrix-style green
- **🌲 Forest Theme** - Nature-inspired colors

### **🏗️ Modular Architecture**
- **Core Systems** - WorldManager, Renderer, EventSystem
- **Tool System** - Extensible tool management
- **Theme System** - Easy customization
- **Plugin Ready** - Easy to extend

### **🚀 Backend Server**
- **Express.js server** for file management
- **World saving/loading** via API
- **Auto-installation** of dependencies
- **Professional launcher** with status updates

### **🔧 Advanced Grid System**
- **Dynamic Grid Colors** - Cycle through White, Black, Green, Brown, Yellow
- **Persistent Settings** - All preferences saved to localStorage
- **Visual Grid Lines** - Thick, visible grid lines that render properly
- **Grid Toggle** - Easy on/off with visual feedback

### **⚙️ Enhanced Settings System**
- **Fixed Settings Persistence** - All settings properly save and load
- **Beta Mode Features** - Experimental tools and settings when enabled
- **Tooltips System** - Helpful hover tooltips (can be disabled)
- **Debug Overlay** - Real-time performance stats in beta mode

### **🧪 Beta Features**
- **Beta Tools Panel** - Magic Wand, Gradient, Pattern, Brush, Debug tools
- **Beta Settings** - Experimental Rendering, Debug Info, Performance Mode
- **Debug Information** - Real-time FPS, tile count, zoom, and system status
- **Experimental Features** - Ready for advanced functionality

## 🎮 **How to Use**

### **1. Landing Page**
- **Choose your theme** from the dropdown
- **Click "Let's Build!"** to start editing
- **Explore features** in the feature cards

### **2. World Editor**
- **Select tools** from the left panel
- **Choose tiles** from the palette
- **Draw your world** on the canvas
- **Use keyboard shortcuts** for efficiency

### **3. Saving & Exporting**
- **Auto-save** to localStorage
- **Export to JSON** for game integration
- **Server-side saving** for persistence

## ⌨️ **Keyboard Shortcuts**

| Key | Action |
|-----|--------|
| `D` | Draw tool |
| `E` | Erase tool |
| `F` | Fill tool |
| `P` | Pan tool |
| `R` | Rotate tool |
| `X` | Flip tool |
| `N` | NPC tool |
| `Tab` | Cycle tools |
| `Q` | Toggle left panel |
| `Ctrl+E` | Toggle right panel |
| `Esc` | Reset view |
| `G` | Toggle grid |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |

## 🎨 **Theme Customization**

The theme system uses CSS custom properties for easy customization:

```css
:root {
    --bg-primary: #0a0a0a;
    --bg-secondary: #1a1a1a;
    --accent-primary: #d4af37;
    --text-primary: #ffffff;
}
```

## 🔧 **Development**

### **Adding New Tools**
1. Create tool class in `src/tools/`
2. Register in `ToolManager.js`
3. Add UI button in `editor.html`
4. Implement tool logic

### **Adding New Themes**
1. Add theme CSS in `themes.css`
2. Add option in theme selector
3. Update `applyTheme()` function

### **Extending Core Systems**
- **WorldManager** - Add new world properties
- **Renderer** - Add new rendering features
- **EventSystem** - Add new input handling

## 🌟 **What's Next**

This modular architecture makes it easy to add:
- **🎮 Game Integration** - Direct game engine integration
- **👥 Multiplayer** - Collaborative editing
- **🔌 Plugins** - Community extensions
- **📱 Mobile Support** - Touch interface
- **☁️ Cloud Sync** - Online world storage
- **🎨 Advanced Tools** - More editing features

## 🐛 **Troubleshooting**

### **Server Won't Start**
- Check if Node.js is installed
- Run `npm install` manually
- Check port 3000 is available

### **Editor Won't Load**
- Check browser console for errors
- Ensure all files are in correct locations
- Try refreshing the page

### **Themes Not Working**
- Clear browser cache
- Check CSS files are loading
- Verify theme names match

## 📞 **Support**

- **Issues**: Check browser console for errors
- **Features**: All core functionality is working
- **Customization**: Modify CSS and JavaScript as needed

---

**🎉 Congratulations! You now have a professional, modular world editor that's ready to grow with your needs!**
