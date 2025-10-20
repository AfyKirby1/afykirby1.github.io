// GameplaySettings Component
// Manages gameplay-related settings (NPCs, difficulty, world features, etc.)

export class GameplaySettings {
    constructor() {
        this.bobEnabled = true; // Bob spawns by default
        this.npcDensity = 1; // NPC spawn density multiplier
    }

    load() {
        // Load settings from localStorage with defaults
        const bobSetting = localStorage.getItem('bobEnabled');
        this.bobEnabled = bobSetting === null ? true : bobSetting === 'true';
        
        const densitySetting = localStorage.getItem('npcDensity');
        this.npcDensity = densitySetting ? parseFloat(densitySetting) : 1;
    }

    save() {
        // Save to localStorage
        localStorage.setItem('bobEnabled', this.bobEnabled.toString());
        localStorage.setItem('npcDensity', this.npcDensity.toString());
        
        // Return confirmation message
        const bobStatus = this.bobEnabled ? 'Enabled' : 'Disabled';
        return `Bob NPC: ${bobStatus}\nNPC Density: ${Math.round(this.npcDensity * 100)}%`;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'settings-section';
        container.innerHTML = `
            <h3>🎮 Gameplay Settings</h3>
            
            <div class="setting-item">
                <label for="bobToggle">
                    <span class="setting-label-text">Bob NPC Character:</span>
                </label>
                <div class="toggle-container">
                    <label class="toggle-switch">
                        <input type="checkbox" id="bobToggle" ${this.bobEnabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                    <span id="bobToggleStatus" class="toggle-status">${this.bobEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <p class="setting-description">
                    Enable/disable Bob, the wandering NPC. Bob will spawn randomly in new worlds when enabled.
                    <br><em>Note: Requires starting a new game to take effect.</em>
                </p>
            </div>

            <div class="setting-item">
                <label for="npcDensity">NPC Spawn Density:</label>
                <div class="slider-container">
                    <input type="range" id="npcDensity" min="0" max="2" value="${this.npcDensity}" step="0.25">
                    <span id="npcDensityValue">${Math.round(this.npcDensity * 100)}%</span>
                </div>
                <p class="setting-description">
                    Controls how many NPCs spawn in the world (0% = none, 100% = default, 200% = double)
                    <br><em>Future feature: Currently only affects Bob.</em>
                </p>
            </div>
        `;

        // Store references and setup event listeners
        setTimeout(() => {
            const bobToggle = document.getElementById('bobToggle');
            const bobStatus = document.getElementById('bobToggleStatus');
            const npcDensitySlider = document.getElementById('npcDensity');
            const npcDensityValue = document.getElementById('npcDensityValue');
            
            // Bob toggle event
            if (bobToggle && bobStatus) {
                bobToggle.addEventListener('change', () => {
                    this.bobEnabled = bobToggle.checked;
                    bobStatus.textContent = this.bobEnabled ? 'Enabled' : 'Disabled';
                    bobStatus.className = 'toggle-status ' + (this.bobEnabled ? 'enabled' : 'disabled');
                });
            }

            // NPC density slider event
            if (npcDensitySlider && npcDensityValue) {
                npcDensitySlider.addEventListener('input', () => {
                    this.npcDensity = parseFloat(npcDensitySlider.value);
                    npcDensityValue.textContent = `${Math.round(this.npcDensity * 100)}%`;
                });
            }
        }, 0);

        return container;
    }

    isBobEnabled() {
        return this.bobEnabled;
    }

    getNpcDensity() {
        return this.npcDensity;
    }

    getStyles() {
        return `
            /* Toggle Switch Styles */
            .toggle-container {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-top: 10px;
            }

            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 60px;
                height: 30px;
            }

            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #2a2a3a;
                border: 2px solid #8b7355;
                border-radius: 30px;
                transition: 0.3s;
            }

            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 22px;
                width: 22px;
                left: 2px;
                bottom: 2px;
                background-color: #8b7355;
                border-radius: 50%;
                transition: 0.3s;
            }

            input:checked + .toggle-slider {
                background-color: #654321;
                border-color: #d4af37;
            }

            input:checked + .toggle-slider:before {
                background-color: #d4af37;
                transform: translateX(30px);
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
            }

            .toggle-status {
                font-size: 16px;
                font-weight: bold;
                color: #8b7355;
                min-width: 80px;
            }

            .toggle-status.enabled {
                color: #d4af37;
            }

            .toggle-status.disabled {
                color: #8b7355;
            }

            .setting-label-text {
                font-size: 18px;
                color: #d4af37;
            }
        `;
    }
}

