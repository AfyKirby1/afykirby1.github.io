/**
 * GitHub NPC Deployer
 * Automatically deploys NPCs to GitHub Pages using GitHub API
 */

class GitHubNPCDeployer {
    constructor() {
        this.githubToken = null;
        this.repoOwner = 'afykirby1';
        this.repoName = 'github-pages';
        this.baseUrl = 'https://api.github.com';
        
        // Load GitHub token from localStorage if available
        this.loadGitHubToken();
    }
    
    loadGitHubToken() {
        this.githubToken = localStorage.getItem('github_token');
        if (this.githubToken) {
            console.log('🔑 GitHub token loaded from localStorage');
        }
    }
    
    setGitHubToken(token) {
        this.githubToken = token;
        localStorage.setItem('github_token', token);
        console.log('🔑 GitHub token saved');
    }
    
    async deployNPC(npcPackage) {
        if (!this.githubToken) {
            throw new Error('GitHub token required. Please set it first.');
        }
        
        try {
            const { metadata, files } = npcPackage;
            const { sanitizedName } = metadata;
            
            console.log(`🚀 Deploying NPC "${metadata.npcName}" to GitHub...`);
            
            // Deploy JSON file
            await this.deployFile(
                `Blocky-Builder/assets/npc/persistent/${files.json.filename}`,
                files.json.content,
                `Add NPC: ${metadata.npcName} (JSON)`
            );
            
            // Deploy image file if it has valid content
            if (files.image.content && typeof files.image.content === 'string' && files.image.content.startsWith('data:')) {
                await this.deployFile(
                    `Blocky-Builder/assets/npc/persistent/${files.image.filename}`,
                    files.image.content,
                    `Add NPC: ${metadata.npcName} (Image)`
                );
            } else {
                console.warn(`⚠️ No valid image content found for ${metadata.npcName}`);
            }
            
            console.log(`✅ NPC "${metadata.npcName}" deployed successfully!`);
            return true;
            
        } catch (error) {
            console.error('❌ Failed to deploy NPC:', error);
            throw error;
        }
    }
    
    async deployFile(path, content, commitMessage) {
        const url = `${this.baseUrl}/repos/${this.repoOwner}/${this.repoName}/contents/${path}`;
        
        // Check if file already exists
        const existingFile = await this.getFileInfo(path);
        
        const payload = {
            message: commitMessage,
            content: this.encodeContent(content),
            branch: 'main'
        };
        
        // If file exists, include the SHA for update
        if (existingFile) {
            payload.sha = existingFile.sha;
        }
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.githubToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
        }
        
        const result = await response.json();
        console.log(`📁 File deployed: ${path}`);
        return result;
    }
    
    async getFileInfo(path) {
        const url = `${this.baseUrl}/repos/${this.repoOwner}/${this.repoName}/contents/${path}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            } else if (response.status === 404) {
                return null; // File doesn't exist
            } else {
                throw new Error(`Failed to check file: ${response.statusText}`);
            }
        } catch (error) {
            console.warn(`⚠️ Could not check file ${path}:`, error);
            return null;
        }
    }
    
    encodeContent(content) {
        // If it's already base64 encoded (data URL), extract the base64 part
        if (typeof content === 'string' && content.startsWith('data:')) {
            return content.split(',')[1];
        }
        
        // Otherwise, encode as base64
        return btoa(content);
    }
    
    async testConnection() {
        if (!this.githubToken) {
            throw new Error('No GitHub token set');
        }
        
        const url = `${this.baseUrl}/repos/${this.repoOwner}/${this.repoName}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${this.githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API connection failed: ${response.statusText}`);
        }
        
        const repo = await response.json();
        console.log(`✅ Connected to repository: ${repo.full_name}`);
        return true;
    }
    
    // Helper method to create a GitHub token setup UI
    createTokenSetupUI() {
        const modal = document.createElement('div');
        modal.className = 'github-token-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 500px; width: 90%;">
                <h3>GitHub Token Setup</h3>
                <p>To automatically deploy NPCs to GitHub Pages, you need a GitHub Personal Access Token.</p>
                
                <ol style="text-align: left; margin: 15px 0;">
                    <li>Go to <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings → Developer settings → Personal access tokens</a></li>
                    <li>Click "Generate new token (classic)"</li>
                    <li>Give it a name like "Blocky Builder NPC Deployer"</li>
                    <li>Select the "repo" scope</li>
                    <li>Click "Generate token"</li>
                    <li>Copy the token and paste it below</li>
                </ol>
                
                <div style="margin: 15px 0;">
                    <label for="github-token-input">GitHub Token:</label>
                    <input type="password" id="github-token-input" style="width: 100%; padding: 8px; margin-top: 5px;" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx">
                </div>
                
                <div style="text-align: right; margin-top: 20px;">
                    <button id="github-token-cancel" style="margin-right: 10px; padding: 8px 16px;">Cancel</button>
                    <button id="github-token-save" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px;">Save Token</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('github-token-cancel').onclick = () => {
            document.body.removeChild(modal);
        };
        
        document.getElementById('github-token-save').onclick = async () => {
            const token = document.getElementById('github-token-input').value.trim();
            if (!token) {
                alert('Please enter a GitHub token');
                return;
            }
            
            try {
                this.setGitHubToken(token);
                await this.testConnection();
                document.body.removeChild(modal);
                alert('GitHub token saved successfully! NPCs can now be deployed automatically.');
            } catch (error) {
                alert(`Failed to save token: ${error.message}`);
            }
        };
        
        // Focus the input
        setTimeout(() => {
            document.getElementById('github-token-input').focus();
        }, 100);
    }
}

// Export for use in Blocky Builder
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubNPCDeployer;
} else {
    window.GitHubNPCDeployer = GitHubNPCDeployer;
}
