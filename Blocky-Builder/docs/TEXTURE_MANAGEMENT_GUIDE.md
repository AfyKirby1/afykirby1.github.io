# Blocky Builder - Texture Management Guide

## Overview
This guide explains how to add new textures for both buildings and tiles in Blocky Builder, including how to hardcode them for GitHub Pages deployment.

## Table of Contents
1. [Building Textures](#building-textures)
2. [Tile Textures](#tile-textures)
3. [Hardcoding for GitHub Pages](#hardcoding-for-github-pages)
4. [File Organization](#file-organization)
5. [Best Practices](#best-practices)

---

## Building Textures

### Adding New Building Textures

#### Step 1: Prepare Your Texture
- Create a PNG image (recommended size: 32x32px or 64x64px)
- Name it descriptively (e.g., `castle.png`, `tower.png`, `shop.png`)
- Place it in `assets/buildings/` folder

#### Step 2: Update BuildingManager.js
Add your texture to the `addHardcodedHouseTextures()` method:

```javascript
addHardcodedHouseTextures() {
    const hardcodedTextures = {
        'house_1': {
            name: 'House 1',
            path: '../assets/buildings/house_1.png',
            size: 2867,
            storageType: 'hardcoded',
            source: 'hardcoded'
        },
        'house_2': {
            name: 'House 2',
            path: '../assets/buildings/house_2.png', 
            size: 2867,
            storageType: 'hardcoded',
            source: 'hardcoded'
        },
        // Add your new building here:
        'castle': {
            name: 'Castle',
            path: '../assets/buildings/castle.png',
            size: 4096, // Update with actual file size
            storageType: 'hardcoded',
            source: 'hardcoded'
        }
    };
    
    this.persistentTextures = { ...this.persistentTextures, ...hardcodedTextures };
    console.log('🏠 Added hardcoded house textures for GitHub Pages compatibility');
}
```

#### Step 3: Test Your Building
1. Open Blocky Builder in browser
2. Check Building Manager panel
3. Your new building should appear in the Building Templates list
4. Click to select and place it in the world

---

## Tile Textures

### Adding New Tile Textures

#### Step 1: Prepare Your Texture
- Create a PNG image (recommended size: 32x32px)
- Name it descriptively (e.g., `stone.png`, `sand.png`, `brick.png`)
- Place it in `assets/` folder (main assets directory)

#### Step 2: Convert to Base64
Use the provided conversion script or manually convert:

```bash
# Run the conversion script
node convert-tile-to-base64.js
```

Or manually convert using online tools or Node.js:
```javascript
const fs = require('fs');
const imageBuffer = fs.readFileSync('assets/stone.png');
const base64String = imageBuffer.toString('base64');
const dataURL = `data:image/png;base64,${base64String}`;
```

#### Step 3: Update tiles.json
Add your tile to `public/tiles.json`:

```json
{
  "vertical_trail": {
    "name": "Vertical Trail",
    "color": "#ffffff",
    "texture": "data:image/png;base64,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"
  },
  "connector_trail": {
    "name": "Connector Trail",
    "color": "#22ec4b",
    "texture": "data:image/png;base64,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"
  },
  "stone": {
    "name": "Stone",
    "color": "#808080",
    "texture": "data:image/png;base64,YOUR_BASE64_DATA_HERE"
  }
}
```

#### Step 4: Test Your Tile
1. Open Blocky Builder in browser
2. Check Tile Palette panel
3. Your new tile should appear in the palette
4. Click to select and paint with it

---

## Hardcoding for GitHub Pages

### Why Hardcode Textures?
GitHub Pages doesn't support server-side file serving, so textures must be embedded directly in the code as base64 data URLs.

### Building Textures (Already Hardcoded)
Building textures are automatically hardcoded in `BuildingManager.js` and work immediately on GitHub Pages.

### Tile Textures (Requires Conversion)
Tile textures need to be converted to base64 and embedded in `tiles.json`.

### Conversion Script
Create `convert-tile-to-base64.js`:

```javascript
const fs = require('fs');
const path = require('path');

function convertToBase64DataURL(filePath) {
    try {
        const imageBuffer = fs.readFileSync(filePath);
        const base64String = imageBuffer.toString('base64');
        const fileName = path.basename(filePath);
        const dataURL = `data:image/png;base64,${base64String}`;
        
        return {
            fileName,
            dataURL,
            size: imageBuffer.length
        };
    } catch (error) {
        console.error(`Error converting ${filePath}:`, error.message);
        return null;
    }
}

// Usage example:
const result = convertToBase64DataURL('assets/stone.png');
if (result) {
    console.log(`Base64 Data URL for ${result.fileName}:`);
    console.log(result.dataURL);
    console.log(`Size: ${result.size} bytes`);
}
```

---

## File Organization

### Directory Structure
```
Blocky-Builder/
├── assets/
│   ├── buildings/           # Building texture files
│   │   ├── house_1.png
│   │   ├── house_2.png
│   │   └── castle.png      # New buildings go here
│   ├── Ground_Texture_1.png # Built-in tile textures
│   ├── Water_Texture.png
│   ├── Cave_Texture_1.png
│   └── stone.png           # New tile textures go here
├── public/
│   └── tiles.json          # Hardcoded tile definitions
└── assets/buildings/
    └── BuildingManager.js   # Hardcoded building definitions
```

### Naming Conventions
- **Buildings**: Use descriptive names (`castle.png`, `tower.png`, `shop.png`)
- **Tiles**: Use descriptive names (`stone.png`, `sand.png`, `brick.png`)
- **IDs**: Use snake_case (`house_1`, `vertical_trail`, `stone_tile`)

---

## Best Practices

### Performance
- Keep texture files small (under 5KB recommended)
- Use PNG format for transparency support
- Optimize images before adding to project

### Organization
- Separate buildings and tiles clearly
- Use consistent naming conventions
- Document your additions in team notes

### Testing
- Always test locally before pushing to git
- Verify textures appear in correct panels
- Check that hardcoded textures work on GitHub Pages

### Git Workflow
1. Add your texture files
2. Update the appropriate configuration files
3. Test locally
4. Commit changes with descriptive messages
5. Push to git

### Example Git Commands
```bash
# Add new files
git add assets/buildings/castle.png
git add assets/stone.png
git add public/tiles.json
git add assets/buildings/BuildingManager.js

# Commit with descriptive message
git commit -m "Add castle building texture and stone tile texture

- Added castle.png to buildings folder
- Added stone.png to assets folder  
- Updated BuildingManager.js with castle texture
- Updated tiles.json with stone tile base64 data"

# Push to repository
git push origin main
```

---

## Troubleshooting

### Common Issues

#### Texture Not Appearing
- Check file path is correct
- Verify texture is added to correct configuration file
- Ensure base64 conversion is complete for tiles

#### GitHub Pages Not Loading Textures
- Verify textures are hardcoded (not file paths)
- Check base64 data URLs are complete
- Test locally first

#### Performance Issues
- Reduce texture file sizes
- Optimize PNG compression
- Consider using fewer textures

### Getting Help
- Check console for error messages
- Verify file paths and naming
- Test with existing working textures as reference

---

## Summary

### For Buildings:
1. Add PNG file to `assets/buildings/`
2. Update `BuildingManager.js` with texture definition
3. Test in Building Manager panel

### For Tiles:
1. Add PNG file to `assets/`
2. Convert to base64 data URL
3. Add to `tiles.json` with proper structure
4. Test in Tile Palette panel

### For GitHub Pages:
- Building textures: Already hardcoded ✅
- Tile textures: Must be converted to base64 ✅
- Test locally before pushing ✅

This system ensures all textures work seamlessly on GitHub Pages while maintaining clean organization and easy maintenance for your team.
