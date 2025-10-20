/**
 * NPC Builder Styles for Blocky Builder
 * Comprehensive styling for the NPC creation and management interface
 */

const NPCBuilderStyles = `
/* NPC Builder Panel */
.npc-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #ecf0f1;
    border: 1px solid #34495e;
    overflow: hidden;
    transition: all 0.3s ease;
}

.npc-panel-header {
    background: linear-gradient(135deg, #8A2BE2 0%, #00BFFF 100%);
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #34495e;
}

.npc-panel-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.npc-toggle-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.npc-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.npc-panel-content {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
}

/* NPC Tools */
.npc-tools {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
}

.npc-tool-btn {
    flex: 1;
    background: transparent;
    border: 2px solid #34495e;
    color: #bdc3c7;
    padding: 10px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.npc-tool-btn:hover {
    border-color: #8A2BE2;
    color: #8A2BE2;
    transform: translateY(-2px);
}

.npc-tool-btn.active {
    background: linear-gradient(135deg, #8A2BE2 0%, #00BFFF 100%);
    border-color: #8A2BE2;
    color: white;
    box-shadow: 0 4px 12px rgba(138, 43, 226, 0.3);
}

.npc-tool-icon {
    font-size: 16px;
}

/* NPC Template List */
.npc-template-section {
    margin-bottom: 20px;
}

.npc-template-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #8A2BE2;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.npc-template-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.npc-template-item {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid #34495e;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
}

.npc-template-item:hover {
    border-color: #8A2BE2;
    background: rgba(138, 43, 226, 0.1);
    transform: translateY(-2px);
}

.npc-template-item.selected {
    border-color: #8A2BE2;
    background: rgba(138, 43, 226, 0.2);
    box-shadow: 0 4px 12px rgba(138, 43, 226, 0.3);
}

.npc-template-icon {
    font-size: 24px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
}

.npc-template-info {
    flex: 1;
}

.npc-template-name {
    font-size: 13px;
    font-weight: 600;
    color: #ecf0f1;
    margin-bottom: 2px;
}

.npc-template-type {
    font-size: 11px;
    color: #95a5a6;
    text-transform: capitalize;
}

.npc-template-behavior {
    font-size: 10px;
    color: #8A2BE2;
    font-weight: 500;
    text-transform: capitalize;
}

/* NPC Configuration Panel */
.npc-config-section {
    margin-bottom: 20px;
}

.npc-config-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #8A2BE2;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.npc-config-panel {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 15px;
    border: 1px solid #34495e;
}

.npc-config-empty {
    text-align: center;
    color: #95a5a6;
    font-style: italic;
    margin: 20px 0;
}

.npc-config-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.npc-config-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.npc-config-group label {
    font-size: 12px;
    font-weight: 600;
    color: #bdc3c7;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.npc-config-group input,
.npc-config-group select,
.npc-config-group textarea {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid #34495e;
    border-radius: 6px;
    padding: 8px 12px;
    color: #ecf0f1;
    font-size: 13px;
    transition: all 0.3s ease;
}

.npc-config-group input:focus,
.npc-config-group select:focus,
.npc-config-group textarea:focus {
    outline: none;
    border-color: #8A2BE2;
    background: rgba(138, 43, 226, 0.1);
    box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2);
}

.npc-config-group input[type="range"] {
    padding: 0;
    height: 6px;
    background: #34495e;
    border-radius: 3px;
}

.npc-config-group input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #8A2BE2 0%, #00BFFF 100%);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.npc-config-group input[type="color"] {
    width: 40px;
    height: 32px;
    padding: 2px;
    border-radius: 6px;
    cursor: pointer;
}

.npc-speed-value,
.npc-wander-value {
    font-size: 11px;
    color: #8A2BE2;
    font-weight: 600;
    margin-left: 8px;
}

/* Patrol Points Configuration */
.npc-patrol-points {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.npc-patrol-btn {
    background: linear-gradient(135deg, #8A2BE2 0%, #00BFFF 100%);
    border: none;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.npc-patrol-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(138, 43, 226, 0.3);
}

.npc-patrol-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.npc-patrol-point {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #34495e;
}

.npc-patrol-point span {
    font-size: 11px;
    color: #95a5a6;
    min-width: 50px;
}

.npc-patrol-point input {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid #34495e;
    border-radius: 4px;
    padding: 4px 8px;
    color: #ecf0f1;
    font-size: 11px;
}

.npc-patrol-remove {
    background: #e74c3c;
    border: none;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    transition: all 0.3s ease;
}

.npc-patrol-remove:hover {
    background: #c0392b;
    transform: scale(1.1);
}

/* NPC Actions */
.npc-config-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.npc-action-btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.npc-action-btn.primary {
    background: linear-gradient(135deg, #8A2BE2 0%, #00BFFF 100%);
    color: white;
}

.npc-action-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(138, 43, 226, 0.4);
}

.npc-action-btn:not(.primary) {
    background: rgba(255, 255, 255, 0.1);
    color: #bdc3c7;
    border: 1px solid #34495e;
}

.npc-action-btn:not(.primary):hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ecf0f1;
}

/* NPC List */
.npc-list-section {
    margin-bottom: 20px;
}

.npc-list-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #8A2BE2;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.npc-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
}

.npc-list-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #34495e;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s ease;
}

.npc-list-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #8A2BE2;
    transform: translateY(-1px);
}

.npc-list-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.npc-list-info {
    flex: 1;
}

.npc-list-name {
    font-size: 13px;
    font-weight: 600;
    color: #ecf0f1;
    margin-bottom: 2px;
}

.npc-list-type {
    font-size: 11px;
    color: #95a5a6;
    text-transform: capitalize;
}

.npc-list-actions {
    display: flex;
    gap: 6px;
}

.npc-list-actions button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid #34495e;
    color: #bdc3c7;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.npc-list-actions button:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ecf0f1;
    transform: scale(1.1);
}

.npc-list-actions .npc-edit-btn:hover {
    background: #3498db;
    border-color: #3498db;
    color: white;
}

.npc-list-actions .npc-delete-btn:hover {
    background: #e74c3c;
    border-color: #e74c3c;
    color: white;
}

/* Scrollbar Styling */
.npc-panel-content::-webkit-scrollbar,
.npc-list::-webkit-scrollbar {
    width: 6px;
}

.npc-panel-content::-webkit-scrollbar-track,
.npc-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.npc-panel-content::-webkit-scrollbar-thumb,
.npc-list::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #8A2BE2 0%, #00BFFF 100%);
    border-radius: 3px;
}

.npc-panel-content::-webkit-scrollbar-thumb:hover,
.npc-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #7B1FA2 0%, #0099CC 100%);
}

/* Responsive Design */
@media (max-width: 768px) {
    .npc-panel {
        width: 300px;
        right: 10px;
        top: 10px;
    }
    
    .npc-template-list {
        grid-template-columns: 1fr;
    }
    
    .npc-tools {
        flex-direction: column;
    }
    
    .npc-config-actions {
        flex-direction: column;
    }
}

/* Animation Classes */
.npc-panel.fade-in {
    animation: npcPanelFadeIn 0.5s ease-out;
}

@keyframes npcPanelFadeIn {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.npc-template-item.pulse {
    animation: npcTemplatePulse 0.6s ease-in-out;
}

@keyframes npcTemplatePulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
    .npc-panel {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border-color: #404040;
    }
    
    .npc-panel-header {
        background: linear-gradient(135deg, #6A1B9A 0%, #0277BD 100%);
    }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
    .npc-panel {
        border: 2px solid #ffffff;
    }
    
    .npc-template-item,
    .npc-list-item {
        border: 2px solid #ffffff;
    }
    
    .npc-tool-btn.active {
        border: 3px solid #ffffff;
    }
}
`;

// Function to inject styles
function injectNPCBuilderStyles() {
    if (document.getElementById('npc-builder-styles')) {
        return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'npc-builder-styles';
    styleElement.textContent = NPCBuilderStyles;
    document.head.appendChild(styleElement);
}

// Export styles and injection function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NPCBuilderStyles, injectNPCBuilderStyles };
}
