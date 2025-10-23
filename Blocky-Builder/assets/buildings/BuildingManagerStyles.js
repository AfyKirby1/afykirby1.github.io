/* Building Manager Styles */

.building-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 350px;
    height: 100vh;
    background: var(--bg-primary);
    border-left: 2px solid var(--accent-primary);
    z-index: 1000;
    overflow-y: auto;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
}

.building-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: var(--accent-primary);
    color: white;
    border-bottom: 2px solid var(--accent-secondary);
}

.building-panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 5px;
    border-radius: 3px;
    transition: background-color 0.2s;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.building-panel-content {
    padding: 15px;
}

.building-tools {
    display: flex;
    gap: 5px;
    margin-bottom: 15px;
}

.building-tool-btn {
    flex: 1;
    padding: 8px 12px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
}

.building-tool-btn:hover {
    background: var(--accent-secondary);
    color: white;
}

.building-tool-btn.active {
    background: var(--accent-primary);
    color: white;
}

.building-templates-section,
.building-config-section,
.building-instances-section {
    margin-bottom: 20px;
}

.building-templates-section h4,
.building-config-section h4,
.building-instances-section h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: var(--accent-primary);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 5px;
}

.building-upload-section {
    display: flex;
    gap: 5px;
    margin-bottom: 10px;
}

.upload-btn {
    flex: 1;
    padding: 6px 10px;
    background: var(--accent-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    transition: background-color 0.2s;
}

.upload-btn:hover {
    background: var(--accent-secondary);
}

.building-template-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 5px;
}

.building-template-item {
    display: flex;
    align-items: center;
    padding: 8px;
    margin-bottom: 5px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.building-template-item:hover {
    background: var(--accent-secondary);
    color: white;
}

.building-template-item.selected {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-secondary);
}

.building-template-preview {
    width: 40px;
    height: 40px;
    border: 1px solid var(--border-color);
    border-radius: 3px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    background: var(--bg-primary);
}

.building-template-info {
    flex: 1;
}

.building-template-name {
    font-weight: bold;
    font-size: 12px;
}

.building-template-size {
    font-size: 10px;
    color: var(--text-secondary);
}

.building-template-actions {
    display: flex;
    gap: 3px;
}

.building-use-btn,
.building-delete-btn {
    padding: 3px 6px;
    font-size: 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

.building-use-btn {
    background: var(--accent-primary);
    color: white;
}

.building-delete-btn {
    background: #dc3545;
    color: white;
}

.building-config-panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 10px;
}

.building-config-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.config-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.config-field label {
    font-size: 11px;
    font-weight: bold;
    color: var(--text-primary);
}

.config-field input {
    padding: 4px 6px;
    border: 1px solid var(--border-color);
    border-radius: 3px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 11px;
}

.tile-preview-grid {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--border-color);
    padding: 2px;
    border-radius: 3px;
}

.tile-row {
    display: flex;
    gap: 1px;
}

.tile-cell {
    width: 12px;
    height: 12px;
    background: var(--bg-primary);
    border-radius: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    font-weight: bold;
}

.tile-cell.empty {
    background: transparent;
}

.tile-cell.grass {
    background: #4CAF50;
    color: white;
}

.tile-cell.water {
    background: #2196F3;
    color: white;
}

.tile-cell.wall {
    background: #9E9E9E;
    color: white;
}

.tile-cell.cave {
    background: #795548;
    color: white;
}

.building-list {
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 5px;
}

.building-list-item {
    display: flex;
    align-items: center;
    padding: 6px;
    margin-bottom: 3px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 3px;
}

.building-list-info {
    flex: 1;
}

.building-list-name {
    font-weight: bold;
    font-size: 11px;
}

.building-list-position {
    font-size: 9px;
    color: var(--text-secondary);
}

.building-list-actions {
    display: flex;
    gap: 3px;
}

.building-edit-btn,
.building-delete-btn {
    padding: 2px 4px;
    font-size: 9px;
    border: none;
    border-radius: 2px;
    cursor: pointer;
}

.building-edit-btn {
    background: var(--accent-primary);
    color: white;
}

.building-delete-btn {
    background: #dc3545;
    color: white;
}

/* Panel open state */
body.building-panel-open {
    margin-right: 350px;
}

body.building-panel-open .main-container {
    margin-right: 350px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .building-panel {
        width: 100%;
        height: 100vh;
    }
    
    body.building-panel-open {
        margin-right: 0;
    }
    
    body.building-panel-open .main-container {
        margin-right: 0;
    }
}
