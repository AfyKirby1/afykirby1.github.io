const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/src', express.static(path.join(__dirname, '../../src')));
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'editor.html'));
});

// API Routes for world data
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
        
        const worldsDir = path.join(__dirname, '../../worlds');
        
        // Create worlds directory if it doesn't exist
        if (!fs.existsSync(worldsDir)) {
            fs.mkdirSync(worldsDir, { recursive: true });
        }
        
        const safeFilename = (filename || 'world').replace(/[^a-zA-Z0-9-_]/g, '_');
        const filePath = path.join(worldsDir, `${safeFilename}.json`);
        
        fs.writeFileSync(filePath, JSON.stringify(worldData, null, 2));
        
        res.json({ success: true, message: 'World saved successfully', path: filePath });
    } catch (error) {
        console.error('Save world error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/load-world/:filename', (req, res) => {
    console.log('🔍 DEBUG: Load world API called for:', req.params.filename);
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../../worlds', `${filename}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'World not found' });
        }
        
        const worldData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json({ success: true, data: worldData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/worlds', (req, res) => {
    try {
        const worldsDir = path.join(__dirname, '../../worlds');
        
        if (!fs.existsSync(worldsDir)) {
            return res.json({ success: true, worlds: [] });
        }
        
        const files = fs.readdirSync(worldsDir)
            .filter(file => file.endsWith('.json'))
            .map(file => ({
                name: path.basename(file, '.json'),
                filename: file,
                modified: fs.statSync(path.join(worldsDir, file)).mtime
            }));
        
        res.json({ success: true, worlds: files });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Serve editor files
app.get('/editor/*', (req, res) => {
    const filePath = path.join(__dirname, '../../public', req.path);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Blocky Builder Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${path.join(__dirname, '../../public')}`);
    console.log(`🎨 Serving assets from: ${path.join(__dirname, '../../assets')}`);
    console.log(`💾 Worlds saved to: ${path.join(__dirname, '../../worlds')}`);
    console.log(`\n🎮 Open your browser and go to: http://localhost:${PORT}`);
    console.log(`✨ Ready to build amazing worlds!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down Blocky Builder Server...');
    process.exit(0);
});
