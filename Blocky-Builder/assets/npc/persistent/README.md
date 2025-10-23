# Persistent NPC Storage

This folder stores NPC files that persist across GitHub Pages deployments.

## Quick Deployment Workflow

### For Developers (You):

1. **Upload NPC** - Use "Add Custom NPC" in the NPC Builder
2. **Choose "Save Permanently"** - Select the localStorage option
3. **Download Package** - A single `NPCName_NPC_Package.json` file downloads
4. **Deploy Automatically** - Run: `node deploy-npc.js NPCName_NPC_Package.json`
5. **Commit & Push** - The files are automatically placed in the correct location

### Automated Deployment

Use the included deployment script for easy file placement:

```bash
# Deploy an NPC package
node deploy-npc.js Rat_NPC_Package.json

# The script will:
# 1. Extract JSON and PNG files
# 2. Place them in assets/npc/persistent/
# 3. Show you the git commands to run
```

### Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Open the Package File** - `NPCName_NPC_Package.json`
2. **Extract JSON Content** - Copy from `files.json.content`
3. **Save as** - `assets/npc/persistent/NPCName.json`
4. **Extract Image Data** - Convert `files.image.content` from base64
5. **Save as** - `assets/npc/persistent/NPCName.png`
6. **Commit & Push** - Files are now available to all users

## File Structure

```
persistent/
├── README.md (this file)
├── deploy-npc.js (deployment helper script)
├── Rat.json (example NPC metadata)
├── Rat.png (example NPC image)
└── ... (other NPC files)
```

## JSON Format

NPC metadata files follow this format:

```json
{
  "id": "custom_1234567890_abc123",
  "name": "Rat",
  "type": "custom",
  "color": "#8B4513",
  "behavior": "wander",
  "speed": 0.5,
  "dialogue": ["Hello there!", "Nice day!"],
  "icon": "🎨",
  "isCustom": true,
  "storageType": "persistent",
  "createdAt": "2025-10-22T21:37:00.000Z",
  "version": "1.0"
}
```

## Benefits

- ✅ **Single Download** - One package file instead of multiple files
- ✅ **Automated Deployment** - Script handles file placement
- ✅ **Clear Instructions** - Package includes deployment steps
- ✅ **Immediate Use** - NPCs work in localStorage while deploying
- ✅ **Version Control** - Files tracked in git for persistence
- ✅ **GitHub Pages Compatible** - Works perfectly with static hosting

## Troubleshooting

**Package file not found?**
- Make sure you downloaded the `NPCName_NPC_Package.json` file
- Check that the file is in the Blocky-Builder directory

**Deployment script fails?**
- Ensure Node.js is installed
- Run from the Blocky-Builder directory
- Check file permissions

**NPC not appearing?**
- Verify files are in `assets/npc/persistent/`
- Check that you've committed and pushed to GitHub
- Clear browser cache and reload
