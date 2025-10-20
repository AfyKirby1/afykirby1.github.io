export class HealthBar {
    constructor() {
        this.maxHealth = 10;
        this.currentHealth = 10;
        this.heartImage = null;
        this.heartSize = 32; // Base size for the first heart
        this.heartSpacing = 5; // Space between hearts
        this.loadHeartImage();
    }

    loadHeartImage() {
        this.heartImage = new Image();
        this.heartImage.src = 'assets/Health_1.png';
        this.heartImage.onload = () => {
            console.log('Heart image loaded successfully');
        };
        this.heartImage.onerror = () => {
            console.error('Failed to load heart image');
        };
    }

    setHealth(current, maximum = 10) {
        this.currentHealth = Math.max(0, Math.min(current, maximum));
        this.maxHealth = maximum;
        this.updateDisplay();
    }

    updateDisplay() {
        const healthBar = document.getElementById('health-bar');
        if (!healthBar) return;

        // Clear existing hearts
        healthBar.innerHTML = '';

        // Create hearts based on current health
        for (let i = 0; i < this.maxHealth; i++) {
            const heartContainer = document.createElement('div');
            heartContainer.className = 'heart-container';
            
            const heart = document.createElement('img');
            heart.src = 'assets/Health_1.png';
            heart.className = 'health-heart';
            heart.alt = 'Heart';
            
            // First heart is largest, others gradually smaller
            const scale = i === 0 ? 1.0 : 1.0 - (i * 0.08);
            const size = Math.floor(this.heartSize * scale);
            
            heart.style.width = `${size}px`;
            heart.style.height = `${size}px`;
            
            // Dimmed hearts for lost health
            if (i >= this.currentHealth) {
                heart.style.filter = 'brightness(0.3) grayscale(0.5)';
                heart.style.opacity = '0.5';
            }
            
            heartContainer.appendChild(heart);
            healthBar.appendChild(heartContainer);
        }
    }

    render(ctx, camera) {
        // Future canvas-based rendering if needed
        // For now, using DOM-based display
    }

    getCurrentHealth() {
        return this.currentHealth;
    }

    getMaxHealth() {
        return this.maxHealth;
    }

    addHealth(amount) {
        this.setHealth(this.currentHealth + amount);
    }

    removeHealth(amount) {
        this.setHealth(this.currentHealth - amount);
    }

    isFull() {
        return this.currentHealth >= this.maxHealth;
    }

    isEmpty() {
        return this.currentHealth <= 0;
    }
}
