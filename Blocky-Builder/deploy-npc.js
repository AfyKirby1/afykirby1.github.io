#!/usr/bin/env node

/**
 * NPC Deployment Helper
 * 
 * This script helps deploy NPC packages to the persistent folder.
 * Usage: node deploy-npc.js <package-file>
 * 
 * The package file should be a JSON file created by the NPC Builder
 * when you choose "Save Permanently".
 */

const fs = require('fs');
const path = require('path');

function deployNPC(packageFile) {
    try {
        // Read the package file
        const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        
        const { metadata, files } = packageData;
        const { sanitizedName } = metadata;
        
        // Create the persistent directory if it doesn't exist
        const persistentDir = path.join(__dirname, 'assets', 'npc', 'persistent');
        if (!fs.existsSync(persistentDir)) {
            fs.mkdirSync(persistentDir, { recursive: true });
        }
        
        // Save the JSON file
        const jsonPath = path.join(persistentDir, files.json.filename);
        fs.writeFileSync(jsonPath, files.json.content);
        console.log(`✅ Saved JSON: ${jsonPath}`);
        
        // Convert base64 image to PNG file
        const imagePath = path.join(persistentDir, files.image.filename);
        const base64Data = files.image.content.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(imagePath, imageBuffer);
        console.log(`✅ Saved PNG: ${imagePath}`);
        
        console.log(`\n🎉 NPC "${metadata.npcName}" deployed successfully!`);
        console.log(`📁 Files saved to: ${persistentDir}`);
        console.log(`\nNext steps:`);
        console.log(`1. git add assets/npc/persistent/`);
        console.log(`2. git commit -m "Add NPC: ${metadata.npcName}"`);
        console.log(`3. git push origin main`);
        console.log(`\nThe NPC will be available to all users after deployment!`);
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        console.log('\nUsage: node deploy-npc.js <package-file>');
        console.log('Example: node deploy-npc.js Rat_NPC_Package.json');
    }
}

// Get the package file from command line arguments
const packageFile = process.argv[2];

if (!packageFile) {
    console.log('❌ Please provide a package file');
    console.log('Usage: node deploy-npc.js <package-file>');
    console.log('Example: node deploy-npc.js Rat_NPC_Package.json');
    process.exit(1);
}

if (!fs.existsSync(packageFile)) {
    console.log(`❌ Package file not found: ${packageFile}`);
    process.exit(1);
}

deployNPC(packageFile);
