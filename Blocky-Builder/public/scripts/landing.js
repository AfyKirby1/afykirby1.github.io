// Landing Page JavaScript
class LandingPage {
    constructor() {
        this.currentTheme = localStorage.getItem('selectedTheme') || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.startAnimations();
    }

    setupEventListeners() {
        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.currentTheme;
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.startEditor();
            }
        });
    }

    startAnimations() {
        // Add staggered animation delays to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.style.animationDelay = `${0.5 + index * 0.1}s`;
        });

        // Add random delays to floating tiles
        const floatingTiles = document.querySelectorAll('.floating-tile');
        floatingTiles.forEach((tile, index) => {
            const randomDelay = Math.random() * 5;
            tile.style.animationDelay = `-${randomDelay}s`;
        });
    }

    applyTheme(themeName) {
        // Remove existing theme classes
        document.body.classList.remove('theme-light', 'theme-retro', 'theme-forest');
        
        // Apply new theme
        if (themeName !== 'dark') {
            document.body.classList.add(`theme-${themeName}`);
        }

        // Update theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = themeName;
        }

        // Save theme preference
        localStorage.setItem('selectedTheme', themeName);
        this.currentTheme = themeName;

        // Add theme transition effect
        document.body.style.transition = 'all 0.5s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 500);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Add entrance animation
            const content = modal.querySelector('.modal-content');
            content.style.animation = 'slideIn 0.3s ease';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${this.getToastIcon(type)}</div>
            <div class="toast-message">${message}</div>
        `;

        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            border: 2px solid var(--accent-primary);
            border-radius: 8px;
            padding: 15px 20px;
            color: var(--text-primary);
            font-family: inherit;
            font-size: 14px;
            z-index: 10000;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px var(--shadow-color);
            min-width: 300px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 100);

        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// Global functions for HTML onclick handlers
function startEditor() {
    // Show loading state
    const button = document.querySelector('.cta-button');
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="button-icon">⏳</span>Loading Editor...';
    button.disabled = true;

    // Simulate loading time
    setTimeout(() => {
        // Redirect to editor
        window.location.href = '/editor';
    }, 1000);
}

function changeTheme() {
    const themeSelect = document.getElementById('themeSelect');
    const selectedTheme = themeSelect.value;
    
    if (window.landingPage) {
        window.landingPage.applyTheme(selectedTheme);
        window.landingPage.showToast(`Theme changed to ${selectedTheme}`, 'success');
    }
}

function showAbout() {
    if (window.landingPage) {
        window.landingPage.showModal('aboutModal');
    }
}

function showHelp() {
    if (window.landingPage) {
        window.landingPage.showModal('helpModal');
    }
}

function showSettings() {
    if (window.landingPage) {
        window.landingPage.showToast('Settings panel coming soon!', 'info');
    }
}

function closeModal(modalId) {
    if (window.landingPage) {
        window.landingPage.closeModal(modalId);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.landingPage = new LandingPage();
    
    // Add some interactive effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click effect to CTA button
    const ctaButton = document.querySelector('.cta-button');
    ctaButton.addEventListener('click', (e) => {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = ctaButton.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        ctaButton.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Handle window resize
window.addEventListener('resize', () => {
    // Recalculate animations if needed
    const floatingTiles = document.querySelectorAll('.floating-tile');
    floatingTiles.forEach(tile => {
        // Reset animation to prevent layout issues
        tile.style.animationPlayState = 'paused';
        setTimeout(() => {
            tile.style.animationPlayState = 'running';
        }, 100);
    });
});
