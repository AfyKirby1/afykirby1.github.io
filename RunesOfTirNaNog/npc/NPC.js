/**
 * NPC Module - Chronicles of the Forgotten Realm
 * Handles Non-Player Characters (NPCs) including townies, merchants, quest givers, etc.
 */

class NPC {
    constructor(config) {
        // Basic Properties
        this.id = config.id || `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = config.name || "Unknown NPC";
        this.type = config.type || "townie"; // townie, merchant, quest_giver, guard, etc.
        this.description = config.description || "A mysterious figure.";
        
        // Position and Movement
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.width = config.width || 32;
        this.height = config.height || 32;
        this.speed = config.speed || 1;
        this.direction = config.direction || 0; // 0-7 for 8 directions
        
        // Visual Properties
        this.sprite = config.sprite || null;
        this.color = config.color || "#8B4513"; // Default brown color
        this.animationFrame = 0;
        this.animationSpeed = config.animationSpeed || 0.1;
        this.scale = config.scale || 1;
        this.usePlayerModel = config.usePlayerModel || false; // Use player-style rendering
        
        // Player model properties (for Bob)
        if (this.usePlayerModel) {
            this.size = 12;
            this.legAngle = 0;
            this.legSwingSpeed = Math.PI * 2 / 0.5;
            this.playerDirection = 'down'; // down, up, left, right
        }
        
        // Behavior Properties
        this.behavior = config.behavior || "idle"; // idle, patrol, wander, follow, etc.
        this.patrolPoints = config.patrolPoints || [];
        this.currentPatrolIndex = 0;
        this.wanderRadius = config.wanderRadius || 100;
        this.homeX = this.x;
        this.homeY = this.y;
        
        // Interaction Properties
        this.interactable = config.interactable !== false;
        this.dialogue = config.dialogue || [];
        this.currentDialogueIndex = 0;
        this.shopItems = config.shopItems || [];
        this.quests = config.quests || [];
        
        // State Properties
        this.isVisible = config.isVisible !== false;
        this.isActive = config.isActive !== false;
        this.health = config.health || 100;
        this.maxHealth = config.maxHealth || 100;
        this.level = config.level || 1;
        
        // AI Properties
        this.aiState = "idle";
        this.lastActionTime = 0;
        this.actionCooldown = config.actionCooldown || 1000;
        this.detectionRadius = config.detectionRadius || 50;
        this.reactionTime = config.reactionTime || 500;
        
        // Animation Properties
        this.animationTimer = 0;
        this.isMoving = false;
        this.lastMoveTime = 0;
        
        console.log(`NPC created: ${this.name} (${this.type}) at (${this.x}, ${this.y})`);
    }
    
    /**
     * Update NPC logic
     */
    update(deltaTime, game) {
        if (!this.isActive) return;
        
        this.animationTimer += deltaTime;
        this.lastActionTime += deltaTime;
        
        // Update AI behavior
        this.updateAI(deltaTime, game);
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Update position if moving
        if (this.isMoving) {
            this.updateMovement(deltaTime);
        }
    }
    
    /**
     * Update AI behavior based on current state
     */
    updateAI(deltaTime, game) {
        if (this.lastActionTime < this.actionCooldown) return;
        
        switch (this.behavior) {
            case "idle":
                this.handleIdleBehavior(deltaTime, game);
                break;
            case "patrol":
                this.handlePatrolBehavior(deltaTime, game);
                break;
            case "wander":
                this.handleWanderBehavior(deltaTime, game);
                break;
            case "follow":
                this.handleFollowBehavior(deltaTime, game);
                break;
            case "guard":
                this.handleGuardBehavior(deltaTime, game);
                break;
        }
        
        this.lastActionTime = 0;
    }
    
    /**
     * Handle idle behavior - NPC stays in place
     */
    handleIdleBehavior(deltaTime, game) {
        // Occasionally look around or fidget
        if (Math.random() < 0.01) {
            this.direction = Math.floor(Math.random() * 8);
        }
    }
    
    /**
     * Handle patrol behavior - NPC moves between defined points
     */
    handlePatrolBehavior(deltaTime, game) {
        if (this.patrolPoints.length === 0) {
            this.behavior = "idle";
            return;
        }
        
        const targetPoint = this.patrolPoints[this.currentPatrolIndex];
        const distance = this.getDistanceTo(targetPoint.x, targetPoint.y);
        
        if (distance < 5) {
            // Reached patrol point, move to next
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
            this.isMoving = false;
        } else {
            // Move towards patrol point
            this.moveTowards(targetPoint.x, targetPoint.y, deltaTime);
        }
    }
    
    /**
     * Handle wander behavior - NPC randomly wanders within radius
     */
    handleWanderBehavior(deltaTime, game) {
        if (!this.isMoving) {
            // Choose random point within wander radius
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.wanderRadius;
            const targetX = this.homeX + Math.cos(angle) * distance;
            const targetY = this.homeY + Math.sin(angle) * distance;
            
            this.moveTowards(targetX, targetY, deltaTime);
        }
    }
    
    /**
     * Handle follow behavior - NPC follows the player
     */
    handleFollowBehavior(deltaTime, game) {
        if (!game.player) return;
        
        const distance = this.getDistanceTo(game.player.x, game.player.y);
        
        if (distance > this.detectionRadius) {
            this.moveTowards(game.player.x, game.player.y, deltaTime);
        } else {
            this.isMoving = false;
        }
    }
    
    /**
     * Handle guard behavior - NPC guards a specific area
     */
    handleGuardBehavior(deltaTime, game) {
        const distanceFromHome = this.getDistanceTo(this.homeX, this.homeY);
        
        if (distanceFromHome > this.wanderRadius) {
            // Return to guard post
            this.moveTowards(this.homeX, this.homeY, deltaTime);
        } else {
            // Look around for threats
            if (Math.random() < 0.02) {
                this.direction = Math.floor(Math.random() * 8);
            }
        }
    }
    
    /**
     * Move NPC towards target coordinates
     */
    moveTowards(targetX, targetY, deltaTime) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
            const moveX = (dx / distance) * this.speed * deltaTime * 0.1;
            const moveY = (dy / distance) * this.speed * deltaTime * 0.1;
            
            this.x += moveX;
            this.y += moveY;
            
            // Update direction based on movement
            this.direction = this.getDirectionFromVector(dx, dy);
            this.isMoving = true;
            this.lastMoveTime = Date.now();
            
            // Update player model direction
            if (this.usePlayerModel) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.playerDirection = dx > 0 ? 'right' : 'left';
                } else {
                    this.playerDirection = dy > 0 ? 'down' : 'up';
                }
            }
        } else {
            this.isMoving = false;
        }
    }
    
    /**
     * Update movement animation
     */
    updateMovement(deltaTime) {
        // Check if NPC has been stationary for too long
        if (Date.now() - this.lastMoveTime > 100) {
            this.isMoving = false;
        }
        
        // Update player model leg animation if using player model
        if (this.usePlayerModel && this.isMoving) {
            if (this.playerDirection === 'left' || this.playerDirection === 'right') {
                this.legAngle += this.legSwingSpeed * (deltaTime / 1000);
            }
        } else if (this.usePlayerModel) {
            this.legAngle = 0;
        }
    }
    
    /**
     * Update animation frames
     */
    updateAnimation(deltaTime) {
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame = (this.animationFrame + 1) % 4; // 4-frame animation
            this.animationTimer = 0;
        }
    }
    
    /**
     * Render NPC on canvas
     */
    render(ctx, camera) {
        if (!this.isVisible) return;
        
        // Calculate screen position
        const screenX = (this.x - camera.x) * camera.zoom;
        const screenY = (this.y - camera.y) * camera.zoom;
        
        // Check if NPC is visible on screen
        if (screenX < -50 || screenX > ctx.canvas.width + 50 ||
            screenY < -50 || screenY > ctx.canvas.height + 50) {
            return;
        }
        
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(camera.zoom * this.scale, camera.zoom * this.scale);
        
        // Use player model rendering for Bob
        if (this.usePlayerModel) {
            this.renderPlayerModel(ctx);
        } else {
            // Standard NPC rendering
            // Draw NPC body
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            
            // Draw NPC face/direction indicator
            ctx.fillStyle = "#FFE4B5"; // Skin color
            ctx.fillRect(-this.width/4, -this.height/2, this.width/2, this.height/2);
            
            // Draw eyes
            ctx.fillStyle = "#000";
            const eyeOffset = this.isMoving ? Math.sin(this.animationFrame * 0.5) * 2 : 0;
            ctx.fillRect(-this.width/6, -this.height/3 + eyeOffset, 3, 3);
            ctx.fillRect(this.width/12, -this.height/3 + eyeOffset, 3, 3);
            
            // Draw direction indicator (simple arrow)
            ctx.fillStyle = "#654321";
            ctx.beginPath();
            ctx.moveTo(0, -this.height/2 - 5);
            ctx.lineTo(-3, -this.height/2 - 10);
            ctx.lineTo(3, -this.height/2 - 10);
            ctx.closePath();
            ctx.fill();
        }
        
        // Draw name tag
        if (this.name && camera.zoom > 0.5) {
            ctx.fillStyle = "#d4af37"; // Gold color for Bob
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            const nameY = this.usePlayerModel ? -this.size - 5 : -this.height/2 - 15;
            ctx.fillText(this.name, 0, nameY);
        }
        
        // Draw interaction indicator
        if (this.interactable && camera.zoom > 0.3) {
            ctx.fillStyle = "#00FF00";
            ctx.beginPath();
            const indicatorY = this.usePlayerModel ? -this.size - 15 : -this.height/2 - 20;
            ctx.arc(0, indicatorY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Render using player character model (for Bob)
     */
    renderPlayerModel(ctx) {
        const size = this.size;
        const centerX = 0;
        const centerY = 0;
        
        // Body
        ctx.fillStyle = '#f4e4bc';
        ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
        
        // Head
        const headRadius = size * 0.4;
        ctx.fillStyle = '#f4e4bc';
        ctx.beginPath();
        ctx.arc(centerX, centerY - size * 0.3, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Eyes
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(centerX - 2, centerY - size * 0.4, 1, 0, Math.PI * 2);
        ctx.arc(centerX + 2, centerY - size * 0.4, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms based on direction
        const armLength = size * 0.3;
        const armWidth = 3;
        ctx.fillStyle = '#f4e4bc';
        
        switch (this.playerDirection) {
            case 'up':
                ctx.fillRect(centerX - size / 2 - armWidth, centerY - 2, armWidth, armLength);
                ctx.fillRect(centerX + size / 2, centerY - 2, armWidth, armLength);
                break;
            case 'down':
                ctx.fillRect(centerX - size / 2 - armWidth, centerY - armLength + 2, armWidth, armLength);
                ctx.fillRect(centerX + size / 2, centerY - armLength + 2, armWidth, armLength);
                break;
            case 'left':
                ctx.fillRect(centerX - size / 2 - armLength, centerY - 2, armLength, armWidth);
                ctx.fillRect(centerX + size / 2 - armLength, centerY - 2, armLength, armWidth);
                break;
            case 'right':
                ctx.fillRect(centerX - size / 2, centerY - 2, armLength, armWidth);
                ctx.fillRect(centerX + size / 2, centerY - 2, armLength, armWidth);
                break;
        }
        
        // Legs
        ctx.fillStyle = '#f4e4bc';
        const legWidth = 3;
        const legHeight = size * 0.4;
        
        if (this.playerDirection === 'left' || this.playerDirection === 'right') {
            const swingAngle = Math.sin(this.legAngle) * Math.PI / 4;
            const legOffset = Math.sin(swingAngle) * 2;
            ctx.fillRect(centerX - 4 + legOffset, centerY + size / 2 - 2, legWidth, legHeight);
            ctx.fillRect(centerX + 1 - legOffset, centerY + size / 2 - 2, legWidth, legHeight);
        } else {
            ctx.fillRect(centerX - 4, centerY + size / 2 - 2, legWidth, legHeight);
            ctx.fillRect(centerX + 1, centerY + size / 2 - 2, legWidth, legHeight);
        }
    }
    
    /**
     * Get distance to target coordinates
     */
    getDistanceTo(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Get direction from vector
     */
    getDirectionFromVector(dx, dy) {
        const angle = Math.atan2(dy, dx);
        const normalizedAngle = (angle + Math.PI) / (Math.PI / 4);
        return Math.floor(normalizedAngle) % 8;
    }
    
    /**
     * Handle interaction with player
     */
    interact(player) {
        if (!this.interactable) return null;
        
        console.log(`Player interacting with ${this.name}`);
        
        // Return interaction result based on NPC type
        switch (this.type) {
            case "merchant":
                return this.openShop(player);
            case "quest_giver":
                return this.giveQuest(player);
            case "townie":
                return this.startDialogue(player);
            default:
                return this.startDialogue(player);
        }
    }
    
    /**
     * Start dialogue with NPC
     */
    startDialogue(player) {
        if (this.dialogue.length === 0) {
            return {
                type: "dialogue",
                npc: this.name,
                message: "Hello there! I don't have much to say right now."
            };
        }
        
        const dialogue = this.dialogue[this.currentDialogueIndex];
        this.currentDialogueIndex = (this.currentDialogueIndex + 1) % this.dialogue.length;
        
        return {
            type: "dialogue",
            npc: this.name,
            message: dialogue
        };
    }
    
    /**
     * Open shop interface
     */
    openShop(player) {
        return {
            type: "shop",
            npc: this.name,
            items: this.shopItems
        };
    }
    
    /**
     * Give quest to player
     */
    giveQuest(player) {
        if (this.quests.length === 0) {
            return {
                type: "dialogue",
                npc: this.name,
                message: "I don't have any quests for you right now."
            };
        }
        
        return {
            type: "quest",
            npc: this.name,
            quest: this.quests[0] // Give first available quest
        };
    }
    
    /**
     * Set NPC position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.homeX = x;
        this.homeY = y;
    }
    
    /**
     * Add patrol point
     */
    addPatrolPoint(x, y) {
        this.patrolPoints.push({ x, y });
    }
    
    /**
     * Set dialogue
     */
    setDialogue(dialogueArray) {
        this.dialogue = dialogueArray;
    }
    
    /**
     * Add shop item
     */
    addShopItem(item) {
        this.shopItems.push(item);
    }
    
    /**
     * Add quest
     */
    addQuest(quest) {
        this.quests.push(quest);
    }
    
    /**
     * Get NPC data for saving
     */
    getSaveData() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            x: this.x,
            y: this.y,
            behavior: this.behavior,
            patrolPoints: this.patrolPoints,
            dialogue: this.dialogue,
            shopItems: this.shopItems,
            quests: this.quests,
            isActive: this.isActive,
            isVisible: this.isVisible
        };
    }
    
    /**
     * Load NPC data from save
     */
    loadSaveData(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.x = data.x;
        this.y = data.y;
        this.behavior = data.behavior;
        this.patrolPoints = data.patrolPoints || [];
        this.dialogue = data.dialogue || [];
        this.shopItems = data.shopItems || [];
        this.quests = data.quests || [];
        this.isActive = data.isActive;
        this.isVisible = data.isVisible;
    }
}

/**
 * NPC Manager - Handles all NPCs in the game
 */
class NPCManager {
    constructor() {
        this.npcs = new Map();
        this.interactionRadius = 30;
        this.lastInteractionTime = 0;
        this.interactionCooldown = 500; // 500ms cooldown between interactions
    }
    
    /**
     * Add NPC to manager
     */
    addNPC(npc) {
        this.npcs.set(npc.id, npc);
        console.log(`Added NPC: ${npc.name} (${npc.id})`);
    }
    
    /**
     * Remove NPC from manager
     */
    removeNPC(npcId) {
        const npc = this.npcs.get(npcId);
        if (npc) {
            this.npcs.delete(npcId);
            console.log(`Removed NPC: ${npc.name} (${npcId})`);
            return true;
        }
        return false;
    }
    
    /**
     * Get NPC by ID
     */
    getNPC(npcId) {
        return this.npcs.get(npcId);
    }
    
    /**
     * Get all NPCs
     */
    getAllNPCs() {
        return Array.from(this.npcs.values());
    }
    
    /**
     * Update all NPCs
     */
    update(deltaTime, game) {
        this.npcs.forEach(npc => {
            npc.update(deltaTime, game);
        });
    }
    
    /**
     * Render all NPCs
     */
    render(ctx, camera) {
        this.npcs.forEach(npc => {
            npc.render(ctx, camera);
        });
    }
    
    /**
     * Check for interactions with player
     */
    checkInteractions(player) {
        if (Date.now() - this.lastInteractionTime < this.interactionCooldown) {
            return null;
        }
        
        const nearbyNPCs = this.getNPCsNearPlayer(player, this.interactionRadius);
        
        if (nearbyNPCs.length > 0) {
            // Find closest NPC
            let closestNPC = nearbyNPCs[0];
            let closestDistance = closestNPC.getDistanceTo(player.x, player.y);
            
            for (let i = 1; i < nearbyNPCs.length; i++) {
                const distance = nearbyNPCs[i].getDistanceTo(player.x, player.y);
                if (distance < closestDistance) {
                    closestNPC = nearbyNPCs[i];
                    closestDistance = distance;
                }
            }
            
            this.lastInteractionTime = Date.now();
            return closestNPC.interact(player);
        }
        
        return null;
    }
    
    /**
     * Get NPCs near player
     */
    getNPCsNearPlayer(player, radius) {
        const nearbyNPCs = [];
        
        this.npcs.forEach(npc => {
            if (npc.interactable && npc.isActive) {
                const distance = npc.getDistanceTo(player.x, player.y);
                if (distance <= radius) {
                    nearbyNPCs.push(npc);
                }
            }
        });
        
        return nearbyNPCs;
    }
    
    /**
     * Create a townie NPC
     */
    createTownie(config) {
        const townieConfig = {
            type: "townie",
            behavior: "wander",
            wanderRadius: 50,
            speed: 0.5,
            color: "#8B4513",
            dialogue: [
                "Hello there, traveler!",
                "The weather is lovely today.",
                "Have you seen any interesting sights?",
                "Welcome to our town!"
            ],
            ...config
        };
        
        const townie = new NPC(townieConfig);
        this.addNPC(townie);
        return townie;
    }
    
    /**
     * Create a merchant NPC
     */
    createMerchant(config) {
        const merchantConfig = {
            type: "merchant",
            behavior: "idle",
            color: "#4169E1",
            shopItems: [],
            dialogue: [
                "Welcome to my shop!",
                "I have the finest goods in town.",
                "Looking for something specific?",
                "Come back anytime!"
            ],
            ...config
        };
        
        const merchant = new NPC(merchantConfig);
        this.addNPC(merchant);
        return merchant;
    }
    
    /**
     * Create a quest giver NPC
     */
    createQuestGiver(config) {
        const questGiverConfig = {
            type: "quest_giver",
            behavior: "idle",
            color: "#32CD32",
            quests: [],
            dialogue: [
                "I have a task for you, brave adventurer.",
                "The town needs your help!",
                "Are you up for a challenge?",
                "Thank you for your service."
            ],
            ...config
        };
        
        const questGiver = new NPC(questGiverConfig);
        this.addNPC(questGiver);
        return questGiver;
    }
    
    /**
     * Create a guard NPC
     */
    createGuard(config) {
        const guardConfig = {
            type: "guard",
            behavior: "guard",
            color: "#696969",
            wanderRadius: 30,
            speed: 0.8,
            dialogue: [
                "Halt! Who goes there?",
                "The town is safe under my watch.",
                "Keep your wits about you, traveler.",
                "Move along, citizen."
            ],
            ...config
        };
        
        const guard = new NPC(guardConfig);
        this.addNPC(guard);
        return guard;
    }
    
    /**
     * Get save data for all NPCs
     */
    getSaveData() {
        const npcData = [];
        this.npcs.forEach(npc => {
            npcData.push(npc.getSaveData());
        });
        return npcData;
    }
    
    /**
     * Load NPCs from save data
     */
    loadSaveData(npcDataArray) {
        this.npcs.clear();
        
        npcDataArray.forEach(npcData => {
            const npc = new NPC(npcData);
            npc.loadSaveData(npcData);
            this.addNPC(npc);
        });
    }
}

// Export for use in other modules
export { NPC, NPCManager };
