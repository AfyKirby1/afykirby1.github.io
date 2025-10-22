const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// Create war-room directory if it doesn't exist
const WAR_ROOM_DIR = path.join(__dirname, 'war-room-assets');
const ensureWarRoomDir = async () => {
    try {
        await fs.access(WAR_ROOM_DIR);
    } catch {
        await fs.mkdir(WAR_ROOM_DIR, { recursive: true });
        console.log('Created war-room-assets directory');
    }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
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

const upload = multer({ 
    storage: storage,
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

// Middleware
app.use(express.json());

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
app.post('/api/war-room/upload-image', upload.single('image'), async (req, res) => {
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Static file serving (must come after API routes)
app.use(express.static(__dirname));

// Serve specific directories with proper routing
app.use('/RunesOfTirNaNog', express.static(path.join(__dirname, 'RunesOfTirNaNog')));
app.use('/Blocky-Builder', express.static(path.join(__dirname, 'Blocky-Builder')));

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
    console.log(`🌐 Main Website: http://localhost:${PORT}`);
    console.log(`🎮 Runes of Tir na Nog: http://localhost:${PORT}/RunesOfTirNaNog/`);
    console.log(`🛠️ Blocky Builder: http://localhost:${PORT}/Blocky-Builder/`);
    console.log(`⚔️ The War Room: http://localhost:${PORT}/war-room.html`);
    console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin.html`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down DCS Main Server...');
    process.exit(0);
});
