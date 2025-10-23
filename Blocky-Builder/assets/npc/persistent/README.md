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
├── Rat.json (example hostile NPC metadata)
├── Rat.png (example NPC image)
└── ... (other NPC files)
```

## JSON Format

### Basic NPC Format

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

### Combat NPC Format

For NPCs with combat capabilities, include these additional properties:

```json
{
  "id": "custom_1234567890_abc123",
  "name": "Hostile Rat",
  "type": "custom",
  "color": "#8B4513",
  "behavior": "hostile",
  "speed": 0.2,
  "health": 50,
  "maxHealth": 50,
  "detectionRadius": 80,
  "attackDamage": 10,
  "attackCooldown": 1000,
  "dialogue": ["Squeek!", "Grrr!"],
  "icon": "🎨",
  "isCustom": true,
  "storageType": "persistent",
  "createdAt": "2025-10-22T21:37:00.000Z",
  "version": "1.0"
}
```

## Behavior Types

### Peaceful Behaviors
- **`idle`** - NPC stays in place, doesn't move
- **`wander`** - NPC moves randomly within a radius
- **`patrol`** - NPC follows a defined patrol route
- **`guard`** - NPC stays in one area but watches for threats

### Combat Behaviors
- **`hostile`** - NPC actively seeks and attacks players
- **`defensive`** - NPC attacks only when attacked first
- **`aggressive`** - NPC has larger detection radius and attacks more frequently

## Combat Properties

### Health System
- **`health`** - Current health points (1-1000)
- **`maxHealth`** - Maximum health points (1-1000)
- Health bars are displayed above NPCs in the editor

### Detection & Attack
- **`detectionRadius`** - How far the NPC can detect players (10-200 pixels)
- **`attackDamage`** - Damage dealt per attack (1-100)
- **`attackCooldown`** - Time between attacks in milliseconds (100-5000ms)

### Visual Indicators
- **Red dot** - Hostile NPCs
- **Orange dot** - Defensive NPCs  
- **Dark red dot** - Aggressive NPCs
- **Health bar** - Shows current/max health above NPC

## Example NPCs

### Hostile Rat
```json
{
  "behavior": "hostile",
  "speed": 0.2,
  "health": 50,
  "maxHealth": 50,
  "detectionRadius": 80,
  "attackDamage": 10,
  "attackCooldown": 1000
}
```

### Defensive Guard
```json
{
  "behavior": "defensive",
  "speed": 0.3,
  "health": 100,
  "maxHealth": 100,
  "detectionRadius": 60,
  "attackDamage": 15,
  "attackCooldown": 1500
}
```

### Aggressive Boss
```json
{
  "behavior": "aggressive",
  "speed": 0.4,
  "health": 200,
  "maxHealth": 200,
  "detectionRadius": 120,
  "attackDamage": 25,
  "attackCooldown": 800
}
```

## Benefits

- ✅ **Single Download** - One package file instead of multiple files
- ✅ **Automated Deployment** - Script handles file placement
- ✅ **Clear Instructions** - Package includes deployment steps
- ✅ **Immediate Use** - NPCs work in localStorage while deploying
- ✅ **Version Control** - Files tracked in git for persistence
- ✅ **GitHub Pages Compatible** - Works perfectly with static hosting
- ✅ **Combat Ready** - Full combat system with health, damage, and detection
- ✅ **Visual Feedback** - Health bars and behavior indicators in editor

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

**Combat properties not working?**
- Ensure NPC has `health` and `maxHealth` properties
- Check that behavior is set to `hostile`, `defensive`, or `aggressive`
- Verify all combat properties are included in the JSON file
