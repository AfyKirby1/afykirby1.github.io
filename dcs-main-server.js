const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// Create war-room directories if they don't exist
const WAR_ROOM_DIR = path.join(__dirname, 'war-room-assets');
const WAR_ROOM_MUSIC_DIR = path.join(__dirname, 'war-room-music');
const BLOCKY_TILES_DIR = path.join(__dirname, 'Blocky-Builder/assets/tiles');
const BLOCKY_WORLDS_DIR = path.join(__dirname, 'Blocky-Builder/worlds');
const ensureWarRoomDir = async () => {
    try {
        await fs.access(WAR_ROOM_DIR);
    } catch {
        await fs.mkdir(WAR_ROOM_DIR, { recursive: true });
        console.log('Created war-room-assets directory');
    }
};
const ensureWarRoomMusicDir = async () => {
    try {
        await fs.access(WAR_ROOM_MUSIC_DIR);
    } catch {
        await fs.mkdir(WAR_ROOM_MUSIC_DIR, { recursive: true });
        console.log('Created war-room-music directory');
    }
};

const ensureBlockyTilesDir = async () => {
    try {
        await fs.access(BLOCKY_TILES_DIR);
    } catch {
        await fs.mkdir(BLOCKY_TILES_DIR, { recursive: true });
        console.log('Created Blocky-Builder tiles directory');
    }
};

const ensureBlockyWorldsDir = async () => {
    try {
        await fs.access(BLOCKY_WORLDS_DIR);
    } catch {
        await fs.mkdir(BLOCKY_WORLDS_DIR, { recursive: true });
        console.log('Created Blocky-Builder worlds directory');
    }
};

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await ensureWarRoomDir();
        cb(null, WAR_ROOM_DIR);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const extension = path.extname(file.originalname);
        const filename = `${uniqueSuffix}${extension}`;
        cb(null, filename);
    }
});

const imageUpload = multer({ 
    storage: imageStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 10 // Max 10 files at once
    },
    fileFilter: (req, file, cb) => {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Configure multer for music uploads
const musicStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await ensureWarRoomMusicDir();
        cb(null, WAR_ROOM_MUSIC_DIR);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const extension = path.extname(file.originalname);
        const filename = `${uniqueSuffix}${extension}`;
        cb(null, filename);
    }
});

const musicUpload = multer({ 
    storage: musicStorage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for music files
        files: 10 // Max 10 files at once
    },
    fileFilter: (req, file, cb) => {
        // Check if file is audio
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    }
});

// Configure multer for tile texture uploads
const tileStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await ensureBlockyTilesDir();
        cb(null, BLOCKY_TILES_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const tileUpload = multer({ 
    storage: tileStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for tile textures
        files: 10 // Max 10 files at once
    },
    fileFilter: (req, file, cb) => {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for tile textures!'), false);
        }
    }
});

// Middleware
app.use(express.json({ limit: '5mb' })); // Increased from default ~100kb to 5MB
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Enable CORS for local development (must be before other middleware)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// API Routes (must come before static file serving)

// Upload image endpoint
app.post('/api/war-room/upload-image', imageUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const result = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadDate: new Date().toISOString()
        };

        console.log(`Uploaded image: ${req.file.originalname} -> ${req.file.filename}`);
        res.json(result);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Serve image endpoint
app.get('/api/war-room/image/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(WAR_ROOM_DIR, filename);
        
        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Set appropriate headers
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        
        // Stream the file
        const fileStream = require('fs').createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Serve image error:', error);
        res.status(500).json({ error: 'Failed to serve image' });
    }
});

// Download image endpoint (full quality)
app.get('/api/war-room/download-image/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(WAR_ROOM_DIR, filename);
        
        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Get original filename from metadata (if stored) or use current filename
        const stats = await fs.stat(filePath);
        
        // Set download headers
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Stream the file for download
        const fileStream = require('fs').createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

// Delete image endpoint
app.delete('/api/war-room/delete-image/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(WAR_ROOM_DIR, filename);
        
        // Check if file exists and delete
        try {
            await fs.access(filePath);
            await fs.unlink(filePath);
            console.log(`Deleted image: ${filename}`);
            res.json({ success: true, message: 'Image deleted successfully' });
        } catch {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// List all images endpoint
app.get('/api/war-room/images', async (req, res) => {
    try {
        await ensureWarRoomDir();
        const files = await fs.readdir(WAR_ROOM_DIR);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });
        
        const imageList = await Promise.all(imageFiles.map(async (file) => {
            const filePath = path.join(WAR_ROOM_DIR, file);
            const stats = await fs.stat(filePath);
            return {
                filename: file,
                size: stats.size,
                uploadDate: stats.birthtime.toISOString()
            };
        }));
        
        res.json(imageList);
    } catch (error) {
        console.error('List images error:', error);
        res.status(500).json({ error: 'Failed to list images' });
    }
});

// Music upload endpoint
app.post('/api/war-room/upload-music', musicUpload.single('music'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No music file provided' });
        }

        const result = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadDate: new Date().toISOString()
        };

        console.log(`Uploaded music: ${req.file.originalname} -> ${req.file.filename}`);
        res.json(result);
    } catch (error) {
        console.error('Music upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Serve music endpoint
app.get('/api/war-room/music/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(WAR_ROOM_MUSIC_DIR, filename);
        
        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ error: 'Music file not found' });
        }

        // Set appropriate headers
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.aac': 'audio/aac'
        };
        
        const mimeType = mimeTypes[ext] || 'audio/mpeg';
        res.setHeader('Content-Type', mimeType);
        
        // Stream the file
        const fileStream = require('fs').createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Serve music error:', error);
        res.status(500).json({ error: 'Failed to serve music file' });
    }
});

// Download music endpoint (full quality)
app.get('/api/war-room/download-music/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(WAR_ROOM_MUSIC_DIR, filename);
        
        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ error: 'Music file not found' });
        }

        // Set download headers
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Stream the file for download
        const fileStream = require('fs').createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Music download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

// Delete music endpoint
app.delete('/api/war-room/delete-music/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(WAR_ROOM_MUSIC_DIR, filename);
        
        // Check if file exists and delete
        try {
            await fs.access(filePath);
            await fs.unlink(filePath);
            console.log(`Deleted music file: ${filename}`);
            res.json({ success: true, message: 'Music file deleted successfully' });
        } catch {
            res.status(404).json({ error: 'Music file not found' });
        }
    } catch (error) {
        console.error('Delete music error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// List all music files endpoint
app.get('/api/war-room/music', async (req, res) => {
    try {
        await ensureWarRoomMusicDir();
        const files = await fs.readdir(WAR_ROOM_MUSIC_DIR);
        const musicFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].includes(ext);
        });
        
        const musicList = await Promise.all(musicFiles.map(async (file) => {
            const filePath = path.join(WAR_ROOM_MUSIC_DIR, file);
            const stats = await fs.stat(filePath);
            return {
                filename: file,
                originalName: file, // You might want to store original names in metadata
                size: stats.size,
                uploadDate: stats.birthtime.toISOString()
            };
        }));
        
        res.json(musicList);
    } catch (error) {
        console.error('List music error:', error);
        res.status(500).json({ error: 'Failed to list music files' });
    }
});

// War Room Data Storage
const WAR_ROOM_DATA_FILE = path.join(__dirname, 'war-room-data.json');

// Load war room data from file
const loadWarRoomData = async () => {
    try {
        await fs.access(WAR_ROOM_DATA_FILE);
        const data = await fs.readFile(WAR_ROOM_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        // Return default data structure if file doesn't exist
        return {
            checklist: [],
            notes: {}
        };
    }
};

// Save war room data to file
const saveWarRoomData = async (data) => {
    await fs.writeFile(WAR_ROOM_DATA_FILE, JSON.stringify(data, null, 2));
};

// Checklist API endpoints
app.get('/api/war-room/checklist', async (req, res) => {
    try {
        const data = await loadWarRoomData();
        res.json(data.checklist || []);
    } catch (error) {
        console.error('Error loading checklist:', error);
        res.status(500).json({ error: 'Failed to load checklist' });
    }
});

app.post('/api/war-room/checklist', async (req, res) => {
    try {
        const { text, completed } = req.body;
        const data = await loadWarRoomData();
        
        if (!data.checklist) data.checklist = [];
        
        data.checklist.push({
            id: Date.now().toString(),
            text,
            completed: completed || false,
            createdAt: new Date().toISOString()
        });
        
        await saveWarRoomData(data);
        res.json({ success: true, message: 'Task added successfully' });
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ error: 'Failed to add task' });
    }
});

app.put('/api/war-room/checklist', async (req, res) => {
    try {
        const { text, completed } = req.body;
        const data = await loadWarRoomData();
        
        if (!data.checklist) data.checklist = [];
        
        const taskIndex = data.checklist.findIndex(task => task.text === text);
        if (taskIndex !== -1) {
            data.checklist[taskIndex].completed = completed;
            data.checklist[taskIndex].updatedAt = new Date().toISOString();
            await saveWarRoomData(data);
            res.json({ success: true, message: 'Task updated successfully' });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete('/api/war-room/checklist', async (req, res) => {
    try {
        const { text } = req.body;
        const data = await loadWarRoomData();
        
        if (!data.checklist) data.checklist = [];
        
        const taskIndex = data.checklist.findIndex(task => task.text === text);
        if (taskIndex !== -1) {
            data.checklist.splice(taskIndex, 1);
            await saveWarRoomData(data);
            res.json({ success: true, message: 'Task deleted successfully' });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Clear completed tasks endpoint
app.post('/api/war-room/checklist/clear-completed', async (req, res) => {
    try {
        const data = await loadWarRoomData();
        
        if (!data.checklist) data.checklist = [];
        
        // Remove all completed tasks
        const initialCount = data.checklist.length;
        data.checklist = data.checklist.filter(task => !task.completed);
        const removedCount = initialCount - data.checklist.length;
        
        await saveWarRoomData(data);
        console.log(`Cleared ${removedCount} completed tasks`);
        res.json({ success: true, message: `Cleared ${removedCount} completed tasks` });
    } catch (error) {
        console.error('Error clearing completed tasks:', error);
        res.status(500).json({ error: 'Failed to clear completed tasks' });
    }
});

// Notes API endpoints
app.get('/api/war-room/notes', async (req, res) => {
    try {
        const data = await loadWarRoomData();
        res.json(data.notes || {});
    } catch (error) {
        console.error('Error loading notes:', error);
        res.status(500).json({ error: 'Failed to load notes' });
    }
});

app.post('/api/war-room/notes', async (req, res) => {
    try {
        const notes = req.body;
        const data = await loadWarRoomData();
        
        data.notes = notes;
        data.notesUpdatedAt = new Date().toISOString();
        
        await saveWarRoomData(data);
        res.json({ success: true, message: 'Notes saved successfully' });
    } catch (error) {
        console.error('Error saving notes:', error);
        res.status(500).json({ error: 'Failed to save notes' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== BLOCKY BUILDER APIs =====

// Tile texture upload endpoint
app.post('/api/upload-tile-texture', tileUpload.single('texture'), (req, res) => {
    if (!req.file) {
        return res.json({ success: false, message: 'No file uploaded.' });
    }
    // Return the relative path to be used by the frontend
    res.json({ success: true, path: `../assets/tiles/${req.file.filename}` });
});

// Add tile metadata endpoint
app.post('/api/add-tile', (req, res) => {
    const { id, data } = req.body;
    const tilesPath = path.join(__dirname, 'Blocky-Builder', 'public', 'tiles.json');

    fsSync.readFile(tilesPath, 'utf8', (err, fileData) => {
        let tiles = {};
        if (!err) {
            try {
                tiles = JSON.parse(fileData);
            } catch (e) {
                // Ignore if JSON is invalid, we'll overwrite it
            }
        }
        
        tiles[id] = data;

        fsSync.writeFile(tilesPath, JSON.stringify(tiles, null, 2), (writeErr) => {
            if (writeErr) {
                return res.json({ success: false, message: 'Failed to save tile data.' });
            }
            res.json({ success: true, message: 'Tile added successfully.' });
        });
    });
});

// World management APIs
app.post('/api/save-world', (req, res) => {
    console.log('🔍 DEBUG: Save world API called');
    try {
        // Validate request body
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ success: false, message: 'Invalid request body' });
        }
        
        const { worldData, filename } = req.body;
        
        if (!worldData) {
            return res.status(400).json({ success: false, message: 'World data is required' });
        }
        
        // Create worlds directory if it doesn't exist
        ensureBlockyWorldsDir().then(() => {
            const safeFilename = (filename || 'world').replace(/[^a-zA-Z0-9-_]/g, '_');
            const filePath = path.join(BLOCKY_WORLDS_DIR, `${safeFilename}.json`);
            
            fsSync.writeFileSync(filePath, JSON.stringify(worldData, null, 2));
            
            res.json({ success: true, message: 'World saved successfully', path: filePath });
        });
    } catch (error) {
        console.error('Save world error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/load-world/:filename', (req, res) => {
    console.log('🔍 DEBUG: Load world API called for:', req.params.filename);
    try {
        const { filename } = req.params;
        const filePath = path.join(BLOCKY_WORLDS_DIR, `${filename}.json`);
        
        if (!fsSync.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'World not found' });
        }
        
        const worldData = JSON.parse(fsSync.readFileSync(filePath, 'utf8'));
        res.json({ success: true, data: worldData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/worlds', (req, res) => {
    try {
        if (!fsSync.existsSync(BLOCKY_WORLDS_DIR)) {
            return res.json({ success: true, worlds: [] });
        }
        
        const files = fsSync.readdirSync(BLOCKY_WORLDS_DIR)
            .filter(file => file.endsWith('.json'))
            .map(file => ({
                name: path.basename(file, '.json'),
                filename: file,
                modified: fsSync.statSync(path.join(BLOCKY_WORLDS_DIR, file)).mtime
            }));
        
        res.json({ success: true, worlds: files });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Static file serving (must come after API routes)
app.use(express.static(__dirname));

// Serve specific directories with proper routing
app.use('/RunesOfTirNaNog', express.static(path.join(__dirname, 'RunesOfTirNaNog')));
app.use('/Blocky-Builder', express.static(path.join(__dirname, 'Blocky-Builder')));

// Serve Blocky-Builder public directory (for tiles.json and other assets)
app.use('/Blocky-Builder/public', express.static(path.join(__dirname, 'Blocky-Builder/public')));
app.use('/Blocky-Builder/assets', express.static(path.join(__dirname, 'Blocky-Builder/assets')));
app.use('/Blocky-Builder/src', express.static(path.join(__dirname, 'Blocky-Builder/src')));

// Specific route for tiles.json to handle the 404 error
app.get('/Blocky-Builder/tiles.json', (req, res) => {
    const tilesPath = path.join(__dirname, 'Blocky-Builder', 'public', 'tiles.json');
    if (fsSync.existsSync(tilesPath)) {
        res.sendFile(tilesPath);
    } else {
        // Return empty tiles object if file doesn't exist
        res.json({});
    }
});

// Handle SPA routing for main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
        }
    }
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 DCS Main Server running on http://localhost:${PORT}`);
    console.log(`📁 War Room assets directory: ${WAR_ROOM_DIR}`);
    console.log(`🎵 War Room music directory: ${WAR_ROOM_MUSIC_DIR}`);
    console.log(`🎨 Blocky Builder tiles directory: ${BLOCKY_TILES_DIR}`);
    console.log(`💾 Blocky Builder worlds directory: ${BLOCKY_WORLDS_DIR}`);
    console.log(`🌐 Main Website: http://localhost:${PORT}`);
    console.log(`🎮 Runes of Tir na Nog: http://localhost:${PORT}/RunesOfTirNaNog/`);
    console.log(`🛠️ Blocky Builder: http://localhost:${PORT}/Blocky-Builder/`);
    console.log(`⚔️ The War Room: http://localhost:${PORT}/war-room.html`);
    console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin.html`);
    console.log(`\n🎨 Tile Palette Upload: Upload custom tile textures via API`);
    console.log(`💾 World Management: Save/load worlds via API endpoints`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down DCS Main Server...');
    process.exit(0);
});
