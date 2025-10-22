/**
 * NetworkManager.js - Client-side WebSocket communication for multiplayer
 * Handles connection to server, player synchronization, and game state updates
 */

export class NetworkManager {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.playerId = null;
        this.otherPlayers = {};
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000; // 2 seconds
        this.pingInterval = null;
        this.lastPingTime = 0;
        
        // Connection status callbacks
        this.onConnectionStatusChange = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onPlayerPositionUpdate = null;
        this.onError = null;
        
        // Position update throttling
        this.lastPositionUpdate = 0;
        this.positionUpdateInterval = 100; // Update every 100ms
    }
    
    /**
     * Connect to the multiplayer server
     * @param {string} username - Player's username
     * @param {string} serverUrl - WebSocket server URL (default: wss://web-production-b1ed.up.railway.app/ws)
     */
    async connect(username, serverUrl = 'wss://web-production-b1ed.up.railway.app/ws') {
        try {
            console.log(`Connecting to multiplayer server: ${serverUrl}`);
            
            // Create WebSocket connection
            this.socket = new WebSocket(serverUrl);
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Wait for connection to open
            await this.waitForConnection();
            
            // Send join request
            await this.sendJoinRequest(username);
            
            // Start ping interval
            this.startPingInterval();
            
            console.log('Successfully connected to multiplayer server');
            return true;
            
        } catch (error) {
            console.error('Failed to connect to server:', error);
            console.error('Server URL:', serverUrl);
            console.error('Error details:', error.message);
            console.error('Make sure the WebSocket server is running on wss://web-production-b1ed.up.railway.app/ws');
            this.handleConnectionError(error);
            return false;
        }
    }
    
    /**
     * Wait for WebSocket connection to open
     */
    waitForConnection() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000); // 10 second timeout
            
            this.socket.addEventListener('open', () => {
                clearTimeout(timeout);
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.notifyConnectionStatusChange('connected');
                resolve();
            });
            
            this.socket.addEventListener('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }
    
    /**
     * Set up WebSocket event handlers
     */
    setupEventHandlers() {
        this.socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);
            } catch (error) {
                console.error('Failed to parse server message:', error);
            }
        });
        
        this.socket.addEventListener('close', (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
            this.isConnected = false;
            this.notifyConnectionStatusChange('disconnected');
            this.stopPingInterval();
            
            // Attempt to reconnect if not a clean close
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.attemptReconnect();
            }
        });
        
        this.socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            this.handleConnectionError(error);
        });
    }
    
    /**
     * Send join request to server
     */
    async sendJoinRequest(username) {
        const joinData = {
            type: 'join',
            username: username
        };
        
        await this.sendMessage(joinData);
    }
    
    /**
     * Handle incoming server messages
     */
    handleServerMessage(data) {
        const messageType = data.type;
        
        switch (messageType) {
            case 'join_success':
                this.handleJoinSuccess(data);
                break;
            case 'player_joined':
                this.handlePlayerJoined(data);
                break;
            case 'player_left':
                this.handlePlayerLeft(data);
                break;
            case 'player_position':
                this.handlePlayerPosition(data);
                break;
            case 'pong':
                this.handlePong(data);
                break;
            case 'error':
                this.handleServerError(data);
                break;
            default:
                console.warn('Unknown message type:', messageType);
        }
    }
    
    /**
     * Handle successful join response
     */
    handleJoinSuccess(data) {
        this.playerId = data.player_id;
        this.game_state = data.game_state;
        
        console.log(`Joined server as: ${data.player_data.name} (${this.playerId})`);
        
        // Initialize other players
        if (data.game_state.players) {
            for (const [pid, playerData] of Object.entries(data.game_state.players)) {
                if (pid !== this.playerId) {
                    this.otherPlayers[pid] = playerData;
                }
            }
        }
        
        // Notify game about successful connection
        if (this.onConnectionStatusChange) {
            this.onConnectionStatusChange('connected', data.player_data);
        }
    }
    
    /**
     * Handle new player joining
     */
    handlePlayerJoined(data) {
        const playerId = data.player_id;
        const playerData = data.player_data;
        
        this.otherPlayers[playerId] = playerData;
        
        console.log(`Player joined: ${playerData.name}`);
        
        if (this.onPlayerJoined) {
            this.onPlayerJoined(playerId, playerData);
        }
    }
    
    /**
     * Handle player leaving
     */
    handlePlayerLeft(data) {
        const playerId = data.player_id;
        const playerName = data.player_name;
        
        if (this.otherPlayers[playerId]) {
            delete this.otherPlayers[playerId];
        }
        
        console.log(`Player left: ${playerName}`);
        
        if (this.onPlayerLeft) {
            this.onPlayerLeft(playerId, playerName);
        }
    }
    
    /**
     * Handle player position updates
     */
    handlePlayerPosition(data) {
        const playerId = data.player_id;
        const x = data.x;
        const y = data.y;
        
        if (this.otherPlayers[playerId]) {
            this.otherPlayers[playerId].x = x;
            this.otherPlayers[playerId].y = y;
        }
        
        if (this.onPlayerPositionUpdate) {
            this.onPlayerPositionUpdate(playerId, x, y);
        }
    }
    
    /**
     * Handle pong response
     */
    handlePong(data) {
        const latency = Date.now() - data.timestamp;
        console.log(`Server ping: ${latency}ms`);
    }
    
    /**
     * Handle server error messages
     */
    handleServerError(data) {
        console.error('Server error:', data.message);
        
        if (this.onError) {
            this.onError(data.message);
        }
    }
    
    /**
     * Send player position update to server
     */
    sendPositionUpdate(x, y) {
        const now = Date.now();
        
        // Throttle position updates
        if (now - this.lastPositionUpdate < this.positionUpdateInterval) {
            return;
        }
        
        this.lastPositionUpdate = now;
        
        const positionData = {
            type: 'position_update',
            x: x,
            y: y
        };
        
        this.sendMessage(positionData);
    }
    
    /**
     * Send ping to server
     */
    sendPing() {
        const pingData = {
            type: 'ping',
            timestamp: Date.now()
        };
        
        this.sendMessage(pingData);
    }
    
    /**
     * Send message to server
     */
    async sendMessage(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify(data));
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        } else {
            console.warn('Cannot send message: WebSocket not connected');
        }
    }
    
    /**
     * Start ping interval for connection health
     */
    startPingInterval() {
        this.pingInterval = setInterval(() => {
            if (this.isConnected) {
                this.sendPing();
            }
        }, 30000); // Ping every 30 seconds
    }
    
    /**
     * Stop ping interval
     */
    stopPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }
    
    /**
     * Attempt to reconnect to server
     */
    async attemptReconnect() {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        this.notifyConnectionStatusChange('reconnecting');
        
        setTimeout(async () => {
            try {
                const username = localStorage.getItem('runes_username');
                if (username) {
                    await this.connect(username);
                }
            } catch (error) {
                console.error('Reconnection failed:', error);
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.attemptReconnect();
                } else {
                    this.notifyConnectionStatusChange('disconnected');
                    console.error('Max reconnection attempts reached');
                }
            }
        }, this.reconnectDelay);
    }
    
    /**
     * Handle connection errors
     */
    handleConnectionError(error) {
        console.error('Connection error:', error);
        this.isConnected = false;
        this.notifyConnectionStatusChange('error');
        
        if (this.onError) {
            this.onError('Connection failed');
        }
    }
    
    /**
     * Notify about connection status changes
     */
    notifyConnectionStatusChange(status, data = null) {
        if (this.onConnectionStatusChange) {
            this.onConnectionStatusChange(status, data);
        }
    }
    
    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'Client disconnect');
            this.socket = null;
        }
        
        this.isConnected = false;
        this.playerId = null;
        this.otherPlayers = {};
        this.stopPingInterval();
        
        console.log('Disconnected from multiplayer server');
    }
    
    /**
     * Get current connection status
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            playerId: this.playerId,
            otherPlayers: Object.keys(this.otherPlayers).length,
            reconnectAttempts: this.reconnectAttempts
        };
    }
    
    /**
     * Get other players data
     */
    getOtherPlayers() {
        return this.otherPlayers;
    }
    
    /**
     * Get game state from server
     */
    getGameState() {
        return this.game_state;
    }
}
