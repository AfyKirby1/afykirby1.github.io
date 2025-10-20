# NPC Builder Integration Guide for Blocky Builder

## Overview
This guide explains how to integrate the NPC Builder system into your Blocky Builder map maker. The NPC Builder provides a comprehensive interface for creating, placing, and configuring NPCs while building your world.

## Files Created
- `NPCBuilder.js` - Main NPC Builder class with full functionality
- `NPCBuilderStyles.js` - Complete CSS styling for the interface
- `NPC.js` - Core NPC system (from previous work)
- `NPCConfig.js` - NPC configurations and factory

## Integration Steps

### 1. Add Files to Blocky Builder
Copy these files to your Blocky Builder project:
```
blocky-builder/
├── npc/
│   ├── NPCBuilder.js
│   ├── NPCBuilderStyles.js
│   ├── NPC.js
│   └── NPCConfig.js
```

### 2. Include in HTML
Add these script tags to your Blocky Builder HTML:
```html
<!-- NPC Builder System -->
<script src="npc/NPCBuilderStyles.js"></script>
<script src="npc/NPCBuilder.js"></script>
```

### 3. Initialize in JavaScript
In your main Blocky Builder JavaScript file:

```javascript
// Initialize NPC Builder
let npcBuilder = null;

function initializeNPCBuilder() {
    const canvas = document.getElementById('yourCanvasId'); // Replace with your canvas ID
    const world = yourWorldObject; // Replace with your world object
    
    // Inject styles
    injectNPCBuilderStyles();
    
    // Create NPC Builder instance
    npcBuilder = new NPCBuilder(canvas, world);
    
    console.log('NPC Builder initialized');
}

// Call when Blocky Builder loads
document.addEventListener('DOMContentLoaded', () => {
    initializeNPCBuilder();
});
```

### 4. Add NPC Rendering
In your render loop:

```javascript
function render() {
    // Your existing rendering code...
    
    // Render NPCs
    if (npcBuilder) {
        npcBuilder.render();
    }
    
    requestAnimationFrame(render);
}
```

### 5. Handle Canvas Events
Make sure your canvas click events work with NPC placement:

```javascript
canvas.addEventListener('click', (e) => {
    // Your existing click handling...
    
    // Let NPC Builder handle clicks if in NPC creation mode
    if (npcBuilder && npcBuilder.isCreatingNPC) {
        // NPC Builder will handle this click
        return;
    }
    
    // Your other click handling...
});
```

## Features

### NPC Templates
- **Townie**: Regular citizens with wandering behavior
- **Merchant**: Shopkeepers with inventory systems
- **Guard**: Security NPCs with patrol behavior
- **Quest Giver**: Characters that provide quests
- **Child**: Playful NPCs with limited wander range
- **Elder**: Wise NPCs with idle behavior

### Configuration Options
- **Name**: Custom NPC name
- **Behavior**: Idle, Wander, Patrol, Guard
- **Speed**: Movement speed (0.1 - 2.0)
- **Color**: Visual appearance
- **Dialogue**: Custom conversation lines
- **Wander Radius**: For wandering NPCs
- **Patrol Points**: For patrolling NPCs

### Tools
- **Create**: Place new NPCs on the map
- **Edit**: Modify existing NPCs
- **Delete**: Remove NPCs from the map

## Usage

### Creating NPCs
1. **Select Template**: Click on an NPC template (Townie, Merchant, etc.)
2. **Configure**: Adjust name, behavior, speed, color, and dialogue
3. **Place**: Click "Place NPC" then click on the canvas where you want the NPC
4. **Done**: NPC is added to your world

### Editing NPCs
1. **Select NPC**: Click the edit button (✏️) next to an NPC in the list
2. **Modify**: Change any configuration options
3. **Save**: Changes are applied immediately

### Deleting NPCs
1. **Select NPC**: Click the delete button (🗑️) next to an NPC
2. **Confirm**: Confirm deletion in the popup
3. **Removed**: NPC is removed from the world

## Customization

### Adding New NPC Templates
```javascript
// In NPCBuilder.js, add to npcTemplates object:
custom_npc: {
    name: "Custom NPC",
    type: "custom",
    color: "#FF6B6B",
    behavior: "idle",
    dialogue: ["Custom dialogue here!"],
    icon: "🎭"
}
```

### Modifying Styles
Edit `NPCBuilderStyles.js` to change:
- Colors and gradients
- Panel positioning
- Button styles
- Animation effects

### Adding New Behaviors
```javascript
// In NPCBuilder.js, add new behavior options:
<option value="custom" ${template.behavior === 'custom' ? 'selected' : ''}>Custom</option>
```

## Save/Load Integration

### Saving NPC Data
```javascript
function saveWorld() {
    const worldData = {
        // Your existing world data...
        npcs: npcBuilder ? npcBuilder.getSaveData() : null
    };
    
    localStorage.setItem('blockyBuilderWorld', JSON.stringify(worldData));
}
```

### Loading NPC Data
```javascript
function loadWorld() {
    const worldData = JSON.parse(localStorage.getItem('blockyBuilderWorld'));
    
    if (worldData.npcs && npcBuilder) {
        npcBuilder.loadSaveData(worldData.npcs);
    }
}
```

## Export Integration

### Export NPCs to Game
```javascript
function exportToGame() {
    const gameData = {
        // Your existing game data...
        npcs: npcBuilder ? npcBuilder.npcs : []
    };
    
    // Export to your game format
    return gameData;
}
```

## Troubleshooting

### Common Issues
1. **Panel Not Showing**: Check that styles are injected
2. **Clicks Not Working**: Ensure canvas event handling is correct
3. **NPCs Not Rendering**: Verify render loop includes npcBuilder.render()
4. **Styles Not Loading**: Check file paths and script inclusion

### Debug Mode
```javascript
// Enable debug logging
window.npcBuilder = npcBuilder;
console.log('NPC Builder available as window.npcBuilder');
```

## Advanced Features

### Custom NPC Types
You can extend the system to support:
- Animated NPCs with sprite sheets
- NPCs with custom interactions
- NPCs with complex AI behaviors
- NPCs with inventory systems

### Integration with Other Systems
- **Quest System**: Connect NPCs to quest givers
- **Shop System**: Link merchants to shop interfaces
- **Dialogue System**: Integrate with advanced dialogue trees
- **AI System**: Connect to pathfinding and behavior systems

## Performance Considerations

### Optimization Tips
- Limit NPC count for large worlds
- Use object pooling for NPC rendering
- Implement LOD (Level of Detail) for distant NPCs
- Cache NPC configurations

### Memory Management
- Clear unused NPC data when switching worlds
- Implement NPC cleanup for deleted objects
- Monitor memory usage with many NPCs

## Future Enhancements

### Planned Features
- **NPC Relationships**: NPCs that interact with each other
- **Dynamic Behaviors**: NPCs that change behavior based on conditions
- **Visual Editor**: Drag-and-drop NPC placement
- **Batch Operations**: Select and modify multiple NPCs
- **Import/Export**: Share NPC configurations between projects

The NPC Builder system is designed to be modular and extensible, making it easy to integrate with your existing Blocky Builder while providing powerful NPC creation capabilities.
