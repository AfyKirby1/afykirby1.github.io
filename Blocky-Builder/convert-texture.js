#!/usr/bin/env node

/**
 * Blocky Builder - Texture Conversion Script
 * Converts PNG textures to base64 data URLs for GitHub Pages compatibility
 * 
 * Usage:
 *   node convert-texture.js <input-file> [output-file]
 * 
 * Examples:
 *   node convert-texture.js assets/stone.png
 *   node convert-texture.js assets/buildings/castle.png castle-base64.txt
 */

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
            size: imageBuffer.length,
            originalPath: filePath
        };
    } catch (error) {
        console.error(`❌ Error converting ${filePath}:`, error.message);
        return null;
    }
}

function generateTileJsonEntry(result, tileName, tileColor) {
    return {
        [tileName]: {
            name: tileName.charAt(0).toUpperCase() + tileName.slice(1).replace(/_/g, ' '),
            color: tileColor || '#808080',
            texture: result.dataURL
        }
    };
}

function generateBuildingEntry(result, buildingName) {
    return {
        [buildingName]: {
            name: buildingName.charAt(0).toUpperCase() + buildingName.slice(1).replace(/_/g, ' '),
            path: `../assets/buildings/${result.fileName}`,
            size: result.size,
            storageType: 'hardcoded',
            source: 'hardcoded'
        }
    };
}

// Main execution
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
🔧 Blocky Builder Texture Converter

Usage:
  node convert-texture.js <input-file> [options]

Options:
  --tile <name> <color>    Convert as tile texture
  --building <name>        Convert as building texture
  --output <file>          Save to file instead of console

Examples:
  node convert-texture.js assets/stone.png --tile stone_tile "#808080"
  node convert-texture.js assets/buildings/castle.png --building castle
  node convert-texture.js assets/sand.png --tile sand "#F4A460" --output sand-base64.txt
        `);
        process.exit(1);
    }
    
    const inputFile = args[0];
    
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ File not found: ${inputFile}`);
        process.exit(1);
    }
    
    console.log(`🔄 Converting texture: ${inputFile}`);
    
    const result = convertToBase64DataURL(inputFile);
    if (!result) {
        process.exit(1);
    }
    
    console.log(`✅ Converted: ${result.fileName} (${result.size} bytes)`);
    
    // Parse options
    let outputFile = null;
    let tileName = null;
    let tileColor = null;
    let buildingName = null;
    
    for (let i = 1; i < args.length; i++) {
        switch (args[i]) {
            case '--output':
                outputFile = args[++i];
                break;
            case '--tile':
                tileName = args[++i];
                tileColor = args[++i] || '#808080';
                break;
            case '--building':
                buildingName = args[++i];
                break;
        }
    }
    
    let output = '';
    
    if (tileName) {
        console.log(`🎨 Generating tile configuration for: ${tileName}`);
        const tileEntry = generateTileJsonEntry(result, tileName, tileColor);
        output = JSON.stringify(tileEntry, null, 2);
        console.log(`\n📋 Add this to public/tiles.json:`);
    } else if (buildingName) {
        console.log(`🏠 Generating building configuration for: ${buildingName}`);
        const buildingEntry = generateBuildingEntry(result, buildingName);
        output = JSON.stringify(buildingEntry, null, 2);
        console.log(`\n📋 Add this to BuildingManager.js addHardcodedHouseTextures():`);
    } else {
        console.log(`\n📋 Base64 Data URL:`);
        output = result.dataURL;
    }
    
    if (outputFile) {
        fs.writeFileSync(outputFile, output);
        console.log(`💾 Saved to: ${outputFile}`);
    } else {
        console.log(output);
    }
    
    console.log(`\n🎉 Conversion complete!`);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    convertToBase64DataURL,
    generateTileJsonEntry,
    generateBuildingEntry
};
