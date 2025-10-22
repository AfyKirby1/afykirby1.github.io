// Game Component - Runes of Tir na nÓg
// Main game coordinator that manages all game systems

import { Player } from '../player/Player.js';
import { Input } from '../input/Input.js';
import { World } from '../world/World.js';
import { Camera } from '../camera/Camera.js';
import { UI } from '../ui/UI.js';
import { GameLoop } from './GameLoop.js';
import PauseMenu from '../ui/PauseMenu.js';
import { AudioManager } from '../audio/AudioManager.js';
import { SaveSystem } from './SaveSystem.js';
import { Inventory } from '../ui/Inventory.js';
import { SecurityUtils } from '../utils/SecurityUtils.js';
import { NetworkManager } from './NetworkManager.js';
// NPC system imports - comment out if not using NPCs
import { NPCManager } from '../npc/NPC.js';
import { NPCFactory } from '../npc/NPCConfig.js';

export class Game {
    constructor(worldConfig = null, saveData = null, customWorldData = null) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Resize canvas to fill the game container
        this.resizeCanvas();
        
        // Use canvas internal dimensions for rendering
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Track save slot and playtime
        this.saveSlot = null;
        this.playtime = 0;
        this.playStartTime = Date.now();

        // Initialize game systems
        if (saveData) {
            // Load from save data
            this.loadFromSaveData(saveData);
        } else if (customWorldData) {
            // Load from custom world file
            console.log('🎮 Game: Loading from custom world data');
            this.world = new World(null, customWorldData);
            this.player = new Player(this.world.width, this.world.height);
            this.camera = new Camera(this.width, this.height);
        } else {
            // Create new world with config
            console.log('🎮 Game: Using default world generation');
            this.world = new World(worldConfig);
            this.player = new Player(this.world.width, this.world.height);
            this.camera = new Camera(this.width, this.height);
        }
        
        this.input = new Input(this.canvas);
        this.ui = new UI();
        this.audioManager = new AudioManager();
        this.inventory = new Inventory(this);
        
        // Initialize multiplayer system
        this.networkManager = new NetworkManager(this);
        this.isMultiplayer = false;
        this.otherPlayers = {};
        
        // Initialize NPC system (if available)
        this.npcManager = null;
        this.npcFactory = null;
        if (typeof NPCManager !== 'undefined' && NPCManager) {
            this.npcManager = new NPCManager();
            this.npcFactory = new NPCFactory(this.npcManager);
        }
        
        this.gameLoop = new GameLoop(
            (deltaTime) => this.update(deltaTime),
            (alpha) => this.render(alpha)
        );

        this.isPaused = false;
        this.pauseMenu = new PauseMenu(this);
        this.setupEventListeners();
        
        // Initialize health bar
        this.initializeHealthBar();
        
        // Inject inventory styles
        this.injectInventoryStyles();
        
        // Initialize NPCs
        this.initializeNPCs();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Start the game loop
        this.gameLoop.start();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Set canvas size to fill entire container (no borders)
        const availableWidth = containerRect.width;
        const availableHeight = containerRect.height;
        
        // Set canvas size to fill container
        this.canvas.width = availableWidth;
        this.canvas.height = availableHeight;
        this.canvas.style.width = availableWidth + 'px';
        this.canvas.style.height = availableHeight + 'px';
    }

    handleResize() {
        this.resizeCanvas();
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Update camera with new dimensions
        this.camera.canvasWidth = this.width;
        this.camera.canvasHeight = this.height;
    }

    setupEventListeners() {
        // Use the enhanced input system for keybind handling
        document.addEventListener('keydown', (e) => {
            // Handle keybind actions first, then update if needed
            if (this.input.isPausePressed() || e.code === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                this.togglePause();
                return;
            } else if (this.input.isInventoryPressed() || e.code === 'KeyI') {
                e.preventDefault();
                e.stopPropagation();
                if (this.inventory) {
                    this.inventory.toggle();
                }
                return;
            } else if (this.input.isDebugPressed()) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDebugMode();
                return;
            } else if (this.input.isScreenshotPressed()) {
                e.preventDefault();
                e.stopPropagation();
                this.takeScreenshot();
                return;
            } else if (this.input.isToggleAudioPressed()) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleAudio();
                return;
            } else if (e.code === 'KeyE' || e.code === 'Space') {
                e.preventDefault();
                e.stopPropagation();
                this.handleInteraction();
                return;
            }
            
            // Only update keybinds if no action was handled
            this.input.updateKeybinds();
        });

        // Pause when window loses focus (and auto-save)
        window.addEventListener('blur', () => {
            if (!this.isPaused) {
                this.pauseMenu.show();
                this.pause();
                this.autoSave();
            }
        });

        // Resume when window gains focus
        window.addEventListener('focus', () => {
            if (this.isPaused) {
                this.pauseMenu.hide();
                this.resume();
            }
        });

        // Auto-save before window closes
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });
    }

    togglePause() {
        this.pauseMenu.toggle();
    }

    quitToMenu() {
        // Stop the game loop
        this.gameLoop.stop();

        // Redirect to main menu
        window.location.href = '../index.html';
    }

    pause() {
        console.log('Game: pause() method called, current paused state:', this.isPaused);
        if (!this.isPaused) {
            this.isPaused = true;
            this.gameLoop.stop();
            console.log('Game: Game loop stopped, paused state:', this.isPaused);
        } else {
            console.log('Game: Already paused, no need to pause again');
        }
    }

    resume() {
        console.log('Game: resume() method called, current paused state:', this.isPaused);
        if (this.isPaused) {
            this.isPaused = false;
            this.gameLoop.start();
            console.log('Game: Game loop started, paused state:', this.isPaused);
        } else {
            console.log('Game: Already running, no need to resume');
        }
    }

    update(deltaTime) {
        if (this.isPaused) return;

        // Update player with input, world collision, and audio
        this.player.update(this.input, this.world, this.audioManager);

        // Update camera to follow player with mouse controls
        const playerPos = this.player.getPosition();
        const worldDims = this.world.getDimensions();
        this.camera.update(playerPos.x, playerPos.y, worldDims.width, worldDims.height, this.input);

        // Send position update to multiplayer server
        this.sendPositionUpdate();

        // Update NPCs (if available)
        if (this.npcManager) {
            this.npcManager.update(deltaTime, this);
        }
        
        // Update UI with camera zoom info and debug data (if available)
        const cameraDebug = this.camera.getDebugInfo(playerPos.x, playerPos.y);
        this.ui.update(playerPos.x, playerPos.y, deltaTime, this.camera.getZoomLevel(), cameraDebug);
    }

    render(alpha) {
        // Clear canvas with black background for better texture contrast
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Apply camera transform
        this.camera.applyTransform(this.ctx);

        // Render world with massive coverage
        this.world.render(this.ctx, this.camera, this.player);

        // Render NPCs (if available)
        if (this.npcManager) {
            this.npcManager.render(this.ctx, this.camera);
        }

        // Render player
        this.player.render(this.ctx);

        // Render other players in multiplayer
        this.renderOtherPlayers();

        // Restore camera transform
        this.camera.restoreTransform(this.ctx);
    }


    setPlayerName(name) {
        // ✅ SECURITY FIX (VULN-007): Validate and sanitize player names
        const validName = SecurityUtils.validatePlayerName(name);
        
        if (!validName) {
            console.error('Invalid player name. Use letters, numbers, spaces, and basic punctuation only (1-20 chars).');
            console.log('Attempted name:', name);
            return false;
        }
        
        this.player.setName(validName);
        console.log(`Player name set to: ${validName}`);
        return true;
    }

    getPlayerName() {
        return this.player.getName();
    }

    // Multiplayer methods
    async connectToMultiplayer() {
        const username = localStorage.getItem('runes_username');
        if (!username) {
            console.error('No username found. Please set a username first.');
            return false;
        }

        try {
            // Set up network manager callbacks
            this.setupNetworkCallbacks();
            
            // Connect to server
            const success = await this.networkManager.connect(username);
            
            if (success) {
                this.isMultiplayer = true;
                console.log('Connected to multiplayer server');
                return true;
            } else {
                console.error('Failed to connect to multiplayer server');
                return false;
            }
        } catch (error) {
            console.error('Multiplayer connection error:', error);
            return false;
        }
    }

    disconnectFromMultiplayer() {
        if (this.networkManager) {
            this.networkManager.disconnect();
            this.isMultiplayer = false;
            this.otherPlayers = {};
            console.log('Disconnected from multiplayer server');
        }
    }

    setupNetworkCallbacks() {
        // Connection status changes
        this.networkManager.onConnectionStatusChange = (status, data) => {
            console.log(`Multiplayer status: ${status}`);
            
            // Update UI or show notifications based on status
            switch (status) {
                case 'connected':
                    console.log('Successfully connected to multiplayer');
                    break;
                case 'disconnected':
                    console.log('Disconnected from multiplayer');
                    break;
                case 'reconnecting':
                    console.log('Attempting to reconnect...');
                    break;
                case 'error':
                    console.error('Multiplayer connection error');
                    break;
            }
        };

        // Player joined
        this.networkManager.onPlayerJoined = (playerId, playerData) => {
            console.log(`Player joined: ${playerData.name}`);
            this.otherPlayers[playerId] = playerData;
        };

        // Player left
        this.networkManager.onPlayerLeft = (playerId, playerName) => {
            console.log(`Player left: ${playerName}`);
            delete this.otherPlayers[playerId];
        };

        // Player position updates
        this.networkManager.onPlayerPositionUpdate = (playerId, x, y) => {
            if (this.otherPlayers[playerId]) {
                this.otherPlayers[playerId].x = x;
                this.otherPlayers[playerId].y = y;
            }
        };

        // Error handling
        this.networkManager.onError = (errorMessage) => {
            console.error('Multiplayer error:', errorMessage);
        };
    }

    renderOtherPlayers() {
        if (!this.isMultiplayer) return;

        const otherPlayers = this.networkManager.getOtherPlayers();
        
        for (const [playerId, playerData] of Object.entries(otherPlayers)) {
            // Calculate screen position
            const screenX = playerData.x - this.camera.x;
            const screenY = playerData.y - this.camera.y;
            
            // Only render if player is on screen
            if (screenX > -50 && screenX < this.width + 50 && 
                screenY > -50 && screenY < this.height + 50) {
                
                // Render other player
                this.ctx.save();
                this.ctx.fillStyle = playerData.color || '#4ade80';
                this.ctx.fillRect(screenX - 6, screenY - 6, 12, 12);
                
                // Render player name
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(playerData.name, screenX, screenY - 10);
                this.ctx.restore();
            }
        }
    }

    sendPositionUpdate() {
        if (this.isMultiplayer && this.networkManager) {
            this.networkManager.sendPositionUpdate(this.player.x, this.player.y);
        }
    }

    initializeHealthBar() {
        // Initialize health bar with full health
        this.ui.updateHealth(10, 10);
        
        // ✅ SECURITY FIX (VULN-014): Only expose debug functions in development mode
        if (window.DEBUG_MODE === true) {
            // Add test functionality for debugging
            window.testHealth = {
                setFull: () => this.ui.updateHealth(10, 10),
                setHalf: () => this.ui.updateHealth(5, 10),
                setLow: () => this.ui.updateHealth(2, 10),
                setEmpty: () => this.ui.updateHealth(0, 10),
                damage: (amount = 1) => {
                    const current = this.ui.healthBar.getCurrentHealth();
                    this.ui.updateHealth(Math.max(0, current - amount), 10);
                },
                heal: (amount = 1) => {
                    const current = this.ui.healthBar.getCurrentHealth();
                    this.ui.updateHealth(Math.min(10, current + amount), 10);
                }
            };
            
            console.log('Health bar initialized. Use testHealth methods to test:');
            console.log('- testHealth.setFull() - Full health');
            console.log('- testHealth.setHalf() - Half health');
            console.log('- testHealth.setLow() - Low health');
            console.log('- testHealth.setEmpty() - No health');
            console.log('- testHealth.damage(2) - Take 2 damage');
            console.log('- testHealth.heal(1) - Heal 1 health');
            
            // Add world regeneration for testing
            window.regenerateWorld = () => {
                this.world.generateWorld();
                console.log('World regenerated with new texture system');
            };
            
            // Add audio testing functions
            window.testAudio = {
                playWater: () => this.audioManager.playWaterSound(),
                playFootstep: () => this.audioManager.playFootstepSound(),
                setVolume: (volume) => this.audioManager.setVolume(volume),
                toggleAudio: () => {
                    const newState = !this.audioManager.isEnabled;
                    this.audioManager.setEnabled(newState);
                    console.log('Audio', newState ? 'enabled' : 'disabled');
                }
            };
            
            console.log('Audio system initialized. Use testAudio methods:');
            console.log('- testAudio.playWater() - Play water sound');
            console.log('- testAudio.playFootstep() - Play footstep sound');
            console.log('- testAudio.setVolume(0.5) - Set volume (0-1)');
            console.log('- testAudio.toggleAudio() - Toggle audio on/off');
            
            console.log('🔧 DEBUG MODE ENABLED - Debug functions available');
        } else {
            console.log('✅ Production mode - Debug functions disabled for security');
        }
    }
    
    initializeNPCs() {
        // Skip NPC initialization in multiplayer mode
        const urlParams = new URLSearchParams(window.location.search);
        const isMultiplayer = urlParams.get('multiplayer') === 'true';
        
        if (isMultiplayer) {
            console.log('NPC system disabled in multiplayer mode');
            return;
        }
        
        if (!this.npcManager || !this.npcFactory) {
            console.log('NPC system not available - skipping NPC initialization');
            return;
        }
        
        // Check if Bob is enabled in world generator settings (default: true)
        const bobEnabled = localStorage.getItem('bobEnabled');
        const shouldSpawnBob = bobEnabled === null ? true : bobEnabled === 'true';
        
        if (shouldSpawnBob) {
            // Create Bob somewhere in the world (spawns at random location)
            const worldDims = this.world.getDimensions();
            this.npcFactory.createBobInWorld(worldDims.width, worldDims.height);
            console.log('✅ Bob NPC spawned (world generator setting: enabled)');
        } else {
            console.log('❌ Bob NPC not spawned (world generator setting: disabled)');
        }
        
        // Future NPC spawning based on density setting
        // const npcDensity = parseFloat(localStorage.getItem('npcDensity') || '1');
        
        // Create townies
        // this.npcFactory.createTownies(200, 200, 100);
        
        // Create guards
        // this.npcFactory.createGuards();
        
        // Create special NPCs
        // this.npcFactory.createSpecialNPCs();
        
        console.log(`Initialized ${this.npcManager.getAllNPCs().length} NPCs`);
    }
    
    handleInteraction() {
        if (!this.npcManager) {
            return;
        }
        
        const interaction = this.npcManager.checkInteractions(this.player);
        if (interaction) {
            this.handleNPCInteraction(interaction);
        }
    }
    
    handleNPCInteraction(interaction) {
        switch (interaction.type) {
            case "dialogue":
                this.showDialogue(interaction.npc, interaction.message);
                break;
            case "shop":
                this.openShop(interaction.npc, interaction.items);
                break;
            case "quest":
                this.showQuest(interaction.npc, interaction.quest);
                break;
        }
    }
    
    showDialogue(npcName, message) {
        // Simple dialogue display - can be enhanced with proper UI
        console.log(`${npcName}: ${message}`);
        
        // Create temporary dialogue display
        const dialogueDiv = document.createElement('div');
        dialogueDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #8A2BE2;
            max-width: 400px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        // ✅ SECURITY FIX (VULN-002, VULN-015): Use DOM creation instead of innerHTML
        // Create title element
        const titleElement = document.createElement('h3');
        titleElement.style.cssText = 'color: #8A2BE2; margin: 0 0 10px 0;';
        titleElement.textContent = SecurityUtils.sanitizeText(npcName); // Sanitized
        
        // Create message element
        const messageElement = document.createElement('p');
        messageElement.style.cssText = 'margin: 0 0 15px 0;';
        messageElement.textContent = SecurityUtils.sanitizeText(message); // Sanitized
        
        // Create close button (no inline onclick)
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = `
            background: #8A2BE2;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
        `;
        closeButton.addEventListener('click', () => dialogueDiv.remove());
        
        // Assemble dialogue
        dialogueDiv.appendChild(titleElement);
        dialogueDiv.appendChild(messageElement);
        dialogueDiv.appendChild(closeButton);
        
        document.body.appendChild(dialogueDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (dialogueDiv.parentElement) {
                dialogueDiv.remove();
            }
        }, 5000);
    }
    
    openShop(npcName, items) {
        console.log(`Opening shop with ${npcName}:`, items);
        // TODO: Implement shop UI
        this.showDialogue(npcName, "Welcome to my shop! (Shop UI coming soon)");
    }
    
    showQuest(npcName, quest) {
        console.log(`Quest from ${npcName}:`, quest);
        // TODO: Implement quest UI
        this.showDialogue(npcName, `Quest: ${quest.title} - ${quest.description}`);
    }

    injectInventoryStyles() {
        // Check if styles already exist
        if (document.getElementById('inventory-styles')) {
            return;
        }
        
        // Create and inject inventory styles
        const styleElement = document.createElement('style');
        styleElement.id = 'inventory-styles';
        styleElement.textContent = this.inventory.getStyles();
        document.head.appendChild(styleElement);
        
        console.log('Inventory initialized. Press "I" to open inventory.');
    }

    toggleDebugMode() {
        // Toggle debug mode for UI
        if (this.ui && this.ui.toggleDebug) {
            this.ui.toggleDebug();
        }
        console.log('Debug mode toggled');
    }

    takeScreenshot() {
        // Create a screenshot of the current game state
        try {
            const canvas = this.canvas;
            const link = document.createElement('a');
            link.download = `runes-screenshot-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            console.log('Screenshot saved!');
        } catch (error) {
            console.error('Failed to take screenshot:', error);
        }
    }

    toggleAudio() {
        // Toggle audio on/off
        if (this.audioManager) {
            const newState = !this.audioManager.isEnabled;
            this.audioManager.setEnabled(newState);
            console.log('Audio', newState ? 'enabled' : 'disabled');
        }
    }

    // Serialize game state for saving
    serializeGameState() {
        // Update playtime
        const currentPlaytime = this.playtime + Math.floor((Date.now() - this.playStartTime) / 1000);
        
        return {
            config: this.world.config,
            worldData: {
                tiles: this.world.tiles,
                width: this.world.width,
                height: this.world.height
            },
            playerState: {
                position: { x: this.player.x, y: this.player.y },
                health: this.ui.healthBar.getCurrentHealth(),
                name: this.player.nameTag ? this.player.nameTag.name : 'Player'
            },
            cameraState: {
                zoom: this.camera.zoom
            },
            metadata: {
                playtime: currentPlaytime,
                lastSaved: Date.now(),
                version: '1.0.0'
            }
        };
    }

    // Load game state from save data
    loadFromSaveData(saveData) {
        // Restore world
        this.world = new World(saveData.config);
        this.world.tiles = saveData.worldData.tiles;
        
        // Restore player
        this.player = new Player(this.width, this.height);
        if (saveData.playerState.position) {
            this.player.x = saveData.playerState.position.x;
            this.player.y = saveData.playerState.position.y;
        }
        
        // Restore camera
        this.camera = new Camera(this.width, this.height);
        if (saveData.cameraState && saveData.cameraState.zoom) {
            this.camera.zoom = saveData.cameraState.zoom;
        }
        
        // Restore metadata
        this.playtime = saveData.metadata?.playtime || 0;
        this.playStartTime = Date.now();
        
        console.log('Game loaded from save data');
    }

    // Auto-save to current slot
    autoSave() {
        if (this.saveSlot) {
            const gameState = this.serializeGameState();
            const success = SaveSystem.saveWorld(this.saveSlot, gameState);
            if (success) {
                console.log(`Auto-saved to slot ${this.saveSlot}`);
            }
        }
    }

    // Manual save (called from pause menu)
    saveGame() {
        // If no slot assigned, prompt for slot
        if (!this.saveSlot) {
            // Ask user for slot (1 or 2)
            const slot = prompt('Save to slot (1 or 2):');
            const slotNum = parseInt(slot);
            if (slotNum === 1 || slotNum === 2) {
                this.saveSlot = slotNum;
            } else {
                console.error('Invalid slot number');
                return false;
            }
        }
        
        const gameState = this.serializeGameState();
        const success = SaveSystem.saveWorld(this.saveSlot, gameState);
        
        if (success) {
            console.log(`Game saved to slot ${this.saveSlot}`);
            return true;
        }
        return false;
    }
}
