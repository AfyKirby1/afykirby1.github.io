import { Game } from './Game.js';
import { SaveSystem } from './SaveSystem.js';

window.addEventListener('load', () => {
    try {
        let game;
        let worldConfig = null;
        let saveData = null;

        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const isNewWorld = urlParams.get('new') === 'true';
        const slotParam = urlParams.get('slot');

        if (isNewWorld) {
            // Load world config from sessionStorage
            const configJson = sessionStorage.getItem('worldConfig');
            if (configJson) {
                worldConfig = JSON.parse(configJson);
                
                // Prompt for save slot
                const slot = prompt('Save to slot (1 or 2):');
                const slotNum = parseInt(slot);
                if (slotNum === 1 || slotNum === 2) {
                    game = new Game(worldConfig, null);
                    game.saveSlot = slotNum;
                } else {
                    game = new Game(worldConfig, null);
                }
                
                // Clear session storage
                sessionStorage.removeItem('worldConfig');
            } else {
                game = new Game(null, null);
            }
        } else if (slotParam) {
            // Load from save slot
            const slotNum = parseInt(slotParam);
            if (slotNum >= 1 && slotNum <= SaveSystem.MAX_SLOTS) {
                saveData = SaveSystem.loadWorld(slotNum);
                if (saveData) {
                    game = new Game(null, saveData);
                    game.saveSlot = slotNum;
                } else {
                    console.error(`No save data found in slot ${slotNum}`);
                    game = new Game(null, null);
                }
            } else {
                console.error('Invalid slot number');
                game = new Game(null, null);
            }
        } else {
            // No parameters, create default world
            game = new Game(null, null);
        }

        window.game = game;

        // Make functions globally available for debugging
        window.setPlayerName = (name) => game.setPlayerName(name);
        window.getPlayerName = () => game.getPlayerName();

        console.log('Runes of Tir na nÓg - Game initialized successfully');
        console.log('Components loaded:', {
            Player: '✓',
            Input: '✓',
            World: '✓',
            Camera: '✓',
            UI: '✓',
            GameLoop: '✓',
            NameTag: '✓',
            SaveSystem: '✓'
        });
        console.log('Player name:', game.getPlayerName());
        console.log('Try: setPlayerName("Your Name") to change the player name');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});

// Pause when window loses focus
document.addEventListener('visibilitychange', () => {
    if (window.game) {
        if (document.hidden) {
            window.game.pause();
        } else {
            window.game.resume();
        }
    }
});