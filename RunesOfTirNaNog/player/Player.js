import { NameTag } from './NameTag.js';

export class Player {
    constructor(gameWidth, gameHeight) {
        this.x = gameWidth / 2;
        this.y = gameHeight / 2;
        this.size = 12;
        this.speed = 3;
        this.color = '#ff6b6b';
        this.direction = 'down';
        this.frame = 0;
        this.frameCount = 0;
        this.vx = 0;
        this.vy = 0;
        this.legAngle = 0;
        this.legSwingSpeed = Math.PI * 2 / 0.5;
        this.isOnWater = false;
        this.waterSoundCooldown = 0;
        this.nameTag = new NameTag('Thor', this.x, this.y, {
            color: '#d4af37',
            backgroundColor: 'rgba(139,90,43,0.8)',
            borderColor: '#ffd700',
            fontSize: 12
        });
        
        // Load character image
        this.characterImage = new Image();
        this.characterImage.onload = () => {
            console.log('Character image loaded successfully');
        };
        this.characterImage.onerror = () => {
            console.error('Failed to load character image');
        };
        this.characterImage.src = 'assets/character/guy_1.png';
    }

    update(input, collisionChecker, audioManager = null) {
        this.vx = 0;
        this.vy = 0;

        // Use the enhanced input system for movement
        const movement = input.getMovementInput();
        this.vx = movement.x * this.speed;
        this.vy = movement.y * this.speed;

        // Update direction based on movement
        if (movement.x < 0) this.direction = 'left';
        if (movement.x > 0) this.direction = 'right';
        if (movement.y < 0) this.direction = 'up';
        if (movement.y > 0) this.direction = 'down';

        // Handle sprinting
        if (input.isSprintPressed()) {
            this.vx *= 1.5;
            this.vy *= 1.5;
        }

        // Handle crouching
        if (input.isCrouchPressed()) {
            this.vx *= 0.5;
            this.vy *= 0.5;
        }

        // Normalize diagonal movement
        if (this.vx !== 0 && this.vy !== 0) {
            const normalizedSpeed = this.speed / Math.sqrt(2);
            this.vx = Math.sign(this.vx) * normalizedSpeed;
            this.vy = Math.sign(this.vy) * normalizedSpeed;
        }

        const newX = this.x + this.vx;
        const newY = this.y + this.vy;
        const isMoving = this.vx !== 0 || this.vy !== 0;

        // Check if player is on water
        const wasOnWater = this.isOnWater;
        this.isOnWater = collisionChecker.isPlayerOnWater ? 
            collisionChecker.isPlayerOnWater(this.x, this.y) : false;

        if (isMoving && collisionChecker.canMove(newX, newY, this.size)) {
            this.x = newX;
            this.y = newY;
            
            // Play water sound if stepping on water
            if (this.isOnWater && this.waterSoundCooldown <= 0 && audioManager) {
                audioManager.playWaterSound();
                this.waterSoundCooldown = 15; // Cooldown in frames (15/60 = 0.25 seconds)
            }
            
            this.frameCount++;
            if (this.frameCount >= 8) {
                this.frame = (this.frame + 1) % 4;
                this.frameCount = 0;
            }
            if (this.direction === 'left' || this.direction === 'right') {
                this.legAngle += this.legSwingSpeed * (1 / 60);
            }
        } else {
            this.frame = 0;
            this.frameCount = 0;
            this.legAngle = 0;
        }

        // Update cooldown
        if (this.waterSoundCooldown > 0) {
            this.waterSoundCooldown--;
        }

        this.nameTag.setPosition(this.x, this.y);
        this.nameTag.update();
    }

    render(ctx) {
        const centerX = this.x;
        const centerY = this.y;
        const size = this.size;

        // Render character image if loaded, otherwise fallback to drawn character
        if (this.characterImage.complete && this.characterImage.naturalWidth > 0) {
            // Calculate image dimensions to fit within the character size
            const imageSize = size * 1.5; // Make it slightly larger than the old character
            
            // Draw the character image centered
            ctx.drawImage(
                this.characterImage,
                centerX - imageSize / 2,
                centerY - imageSize / 2,
                imageSize,
                imageSize
            );
        } else {
            // Fallback to old drawn character if image isn't loaded yet
            this.renderFallbackCharacter(ctx, centerX, centerY, size);
        }

        // Always render the name tag
        this.nameTag.render(ctx);
    }

    renderFallbackCharacter(ctx, centerX, centerY, size) {
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

        switch (this.direction) {
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

        if (this.direction === 'left' || this.direction === 'right') {
            const swingAngle = Math.sin(this.legAngle) * Math.PI / 4;
            const legOffset = Math.sin(swingAngle) * 2;
            ctx.fillRect(centerX - 4 + legOffset, centerY + size / 2 - 2, legWidth, legHeight);
            ctx.fillRect(centerX + 1 - legOffset, centerY + size / 2 - 2, legWidth, legHeight);
        } else {
            ctx.fillRect(centerX - 4, centerY + size / 2 - 2, legWidth, legHeight);
            ctx.fillRect(centerX + 1, centerY + size / 2 - 2, legWidth, legHeight);
        }
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setName(name) {
        this.nameTag.setName(name);
    }

    getName() {
        return this.nameTag.name;
    }
}