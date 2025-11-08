const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Check if DATABASE_URL is available
const USE_DATABASE = !!process.env.DATABASE_URL;
let pool = null;

// PostgreSQL connection (if available)
if (USE_DATABASE) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    });

    // Initialize database
    async function initializeDatabase() {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS orders (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    phone VARCHAR(50) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    area VARCHAR(100),
                    status VARCHAR(50) DEFAULT 'new',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('PostgreSQL database initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }
    initializeDatabase();
} else {
    // Fallback to JSON file storage
    const DATA_FILE = path.join(__dirname, 'data', 'orders.json');
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }
    console.log('Using JSON file storage (PostgreSQL not configured)');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Multer configuration for video uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const videoId = req.body.videoId || 'video';
        const ext = path.extname(file.originalname);
        const filename = `${videoId}_${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Только видео файлы разрешены'));
        }
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        if (USE_DATABASE && pool) {
            const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
            res.json({ success: true, data: result.rows });
        } else {
            // JSON fallback
            const data = fs.readFileSync(path.join(__dirname, 'data', 'orders.json'), 'utf8');
            const orders = JSON.parse(data);
            res.json({ success: true, data: orders });
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
    try {
        if (USE_DATABASE && pool) {
            const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Order not found' });
            }
            res.json({ success: true, data: result.rows[0] });
        } else {
            // JSON fallback
            const data = fs.readFileSync(path.join(__dirname, 'data', 'orders.json'), 'utf8');
            const orders = JSON.parse(data);
            const order = orders.find(o => o.id === parseInt(req.params.id));
            if (!order) {
                return res.status(404).json({ success: false, error: 'Order not found' });
            }
            res.json({ success: true, data: order });
        }
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new order
app.post('/api/orders', async (req, res) => {
    try {
        const { name, phone, email, area } = req.body;
        
        if (!name || !phone || !email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name, phone and email are required' 
            });
        }
        
        if (USE_DATABASE && pool) {
            const result = await pool.query(
                'INSERT INTO orders (name, phone, email, area, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, phone, email, area || 'Не указана', 'new']
            );
            res.status(201).json({ success: true, data: result.rows[0] });
        } else {
            // JSON fallback
            const DATA_FILE = path.join(__dirname, 'data', 'orders.json');
            const orders = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const newOrder = {
                id: Date.now(),
                name,
                phone,
                email,
                area: area || 'Не указана',
                status: 'new',
                date: new Date().toISOString(),
                timestamp: Date.now(),
                created_at: new Date().toISOString()
            };
            orders.push(newOrder);
            fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
            res.status(201).json({ success: true, data: newOrder });
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update order status
app.patch('/api/orders/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ 
                success: false, 
                error: 'Status is required' 
            });
        }
        
        if (USE_DATABASE && pool) {
            const result = await pool.query(
                'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
                [status, req.params.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Order not found' });
            }
            res.json({ success: true, data: result.rows[0] });
        } else {
            // JSON fallback
            const DATA_FILE = path.join(__dirname, 'data', 'orders.json');
            const orders = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
            if (orderIndex === -1) {
                return res.status(404).json({ success: false, error: 'Order not found' });
            }
            orders[orderIndex].status = status;
            fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
            res.json({ success: true, data: orders[orderIndex] });
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update order comment
app.patch('/api/orders/:id/comment', async (req, res) => {
    try {
        const { comment } = req.body;
        
        if (USE_DATABASE && pool) {
            // Check if comment column exists, if not add it
            try {
                await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS comment TEXT');
            } catch (e) {
                // Column might already exist
            }
            
            const result = await pool.query(
                'UPDATE orders SET comment = $1 WHERE id = $2 RETURNING *',
                [comment || '', req.params.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Order not found' });
            }
            res.json({ success: true, data: result.rows[0] });
        } else {
            // JSON fallback
            const DATA_FILE = path.join(__dirname, 'data', 'orders.json');
            const orders = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
            if (orderIndex === -1) {
                return res.status(404).json({ success: false, error: 'Order not found' });
            }
            orders[orderIndex].comment = comment || '';
            fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
            res.json({ success: true, data: orders[orderIndex] });
        }
    } catch (error) {
        console.error('Error updating order comment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        if (USE_DATABASE && pool) {
            const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [req.params.id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Order not found' });
            }
            res.json({ success: true, message: 'Order deleted' });
        } else {
            // JSON fallback
            const DATA_FILE = path.join(__dirname, 'data', 'orders.json');
            const orders = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const filteredOrders = orders.filter(o => o.id !== parseInt(req.params.id));
            if (orders.length === filteredOrders.length) {
                return res.status(404).json({ success: false, error: 'Order not found' });
            }
            fs.writeFileSync(DATA_FILE, JSON.stringify(filteredOrders, null, 2));
            res.json({ success: true, message: 'Order deleted' });
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        if (USE_DATABASE && pool) {
            const totalResult = await pool.query('SELECT COUNT(*) FROM orders');
            const newResult = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'new'");
            const processingResult = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'processing'");
            const completedResult = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'completed'");
            
            const stats = {
                total: parseInt(totalResult.rows[0].count),
                new: parseInt(newResult.rows[0].count),
                processing: parseInt(processingResult.rows[0].count),
                completed: parseInt(completedResult.rows[0].count)
            };
            res.json({ success: true, data: stats });
        } else {
            // JSON fallback
            const DATA_FILE = path.join(__dirname, 'data', 'orders.json');
            const orders = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const stats = {
                total: orders.length,
                new: orders.filter(o => o.status === 'new').length,
                processing: orders.filter(o => o.status === 'processing').length,
                completed: orders.filter(o => o.status === 'completed').length
            };
            res.json({ success: true, data: stats });
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin authentication
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.post('/api/admin/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Video management endpoints
const VIDEOS_CONFIG_FILE = path.join(__dirname, 'data', 'videos.json');

// Get all videos configuration
app.get('/api/videos', (req, res) => {
    try {
        if (fs.existsSync(VIDEOS_CONFIG_FILE)) {
            const data = fs.readFileSync(VIDEOS_CONFIG_FILE, 'utf8');
            const videos = JSON.parse(data);
            res.json({ success: true, data: videos });
        } else {
            res.json({ success: true, data: {} });
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update video path
app.put('/api/videos/:videoId', (req, res) => {
    try {
        const { videoId } = req.params;
        const { path: videoPath, selector } = req.body;
        
        if (!videoPath) {
            return res.status(400).json({ success: false, error: 'Path is required' });
        }
        
        // Load current config
        let videos = {};
        if (fs.existsSync(VIDEOS_CONFIG_FILE)) {
            const data = fs.readFileSync(VIDEOS_CONFIG_FILE, 'utf8');
            videos = JSON.parse(data);
        }
        
        // Update video config
        videos[videoId] = {
            path: videoPath,
            selector: selector,
            updatedAt: new Date().toISOString()
        };
        
        // Save config
        const dataDir = path.dirname(VIDEOS_CONFIG_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(VIDEOS_CONFIG_FILE, JSON.stringify(videos, null, 2));
        
        // Update HTML file
        updateVideoInHTML(selector, videoPath);
        
        res.json({ success: true, data: videos[videoId] });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload video file
app.post('/api/videos/upload', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        
        const videoPath = `images/${req.file.filename}`;
        res.json({ success: true, path: videoPath, filename: req.file.filename });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper function to update video in HTML
function updateVideoInHTML(selector, newPath) {
    try {
        const htmlPath = path.join(__dirname, 'index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Simple regex replacement for video sources
        // This is a basic implementation - could be improved with proper HTML parsing
        const videoSourceRegex = new RegExp(`(<source\\s+src=["'])([^"']+)(["']\\s+type=["']video/mp4["']>)`, 'g');
        
        // For now, we'll update all matching selectors
        // In a production app, you'd use a proper HTML parser
        if (selector) {
            // Extract the class/id from selector and update accordingly
            if (selector.includes('film-strip-1')) {
                htmlContent = htmlContent.replace(
                    /(<div class="film-strip film-strip-1">[\s\S]*?<source src=")([^"]+)(" type="video\/mp4">)/,
                    `$1${newPath}$3`
                );
            } else if (selector.includes('film-strip-2')) {
                htmlContent = htmlContent.replace(
                    /(<div class="film-strip film-strip-2">[\s\S]*?<source src=")([^"]+)(" type="video\/mp4">)/,
                    `$1${newPath}$3`
                );
            } else if (selector.includes('film-strip-3')) {
                htmlContent = htmlContent.replace(
                    /(<div class="film-strip film-strip-3">[\s\S]*?<source src=")([^"]+)(" type="video\/mp4">)/,
                    `$1${newPath}$3`
                );
            } else if (selector.includes('feature-img-1')) {
                htmlContent = htmlContent.replace(
                    /(<div class="feature-img feature-img-1">[\s\S]*?<source src=")([^"]+)(" type="video\/mp4">)/,
                    `$1${newPath}$3`
                );
            } else if (selector.includes('feature-img-2')) {
                htmlContent = htmlContent.replace(
                    /(<div class="feature-img feature-img-2">[\s\S]*?<source src=")([^"]+)(" type="video\/mp4">)/,
                    `$1${newPath}$3`
                );
            } else if (selector.includes('feature-img-3')) {
                htmlContent = htmlContent.replace(
                    /(<div class="feature-img feature-img-3">[\s\S]*?<source src=")([^"]+)(" type="video\/mp4">)/,
                    `$1${newPath}$3`
                );
            } else if (selector.includes('feature-1')) {
                htmlContent = htmlContent.replace(
                    /(<div class="principle-card feature-1">[\s\S]*?<source src=")([^"]+)(" type="video\/mp4">)/,
                    `$1${newPath}$3`
                );
            } else if (selector.includes('feature-2')) {
                htmlContent = htmlContent.replace(
                    /(<div class="principle-card feature-2">[\s\S]*?<source src=")([^"]+)(" type="video\/mp4">)/,
                    `$1${newPath}$3`
                );
            } else if (selector.includes('feature-3')) {
                htmlContent = htmlContent.replace(
                    /(<div class="principle-card feature-3">[\s\S]*?<source src=")([^"]+)(" type="video\/mp4">)/,
                    `$1${newPath}$3`
                );
            } else if (selector.includes('layer-bottom')) {
                htmlContent = htmlContent.replace(
                    /(<div class="layer-visual layer-bottom">[\s\S]*?<source src=")([^"]+)(" type="video\/mp4">)/,
                    `$1${newPath}$3`
                );
            }
        }
        
        fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    } catch (error) {
        console.error('Error updating HTML:', error);
        throw error;
    }
}

// Text management endpoints
const TEXTS_CONFIG_FILE = path.join(__dirname, 'data', 'texts.json');

// Get all texts configuration
app.get('/api/texts', (req, res) => {
    try {
        if (fs.existsSync(TEXTS_CONFIG_FILE)) {
            const data = fs.readFileSync(TEXTS_CONFIG_FILE, 'utf8');
            const texts = JSON.parse(data);
            res.json({ success: true, data: texts });
        } else {
            res.json({ success: true, data: {} });
        }
    } catch (error) {
        console.error('Error loading texts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update texts
app.put('/api/texts', (req, res) => {
    try {
        const { texts } = req.body;
        
        if (!texts || typeof texts !== 'object') {
            return res.status(400).json({ success: false, error: 'Texts object is required' });
        }
        
        // Save texts config
        const dataDir = path.dirname(TEXTS_CONFIG_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(TEXTS_CONFIG_FILE, JSON.stringify(texts, null, 2));
        
        // Update HTML file
        updateTextsInHTML(texts);
        
        res.json({ success: true, message: 'Texts updated successfully' });
    } catch (error) {
        console.error('Error updating texts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper function to update texts in HTML
function updateTextsInHTML(texts) {
    try {
        const htmlPath = path.join(__dirname, 'index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        Object.keys(texts).forEach(textId => {
            const textData = texts[textId];
            const { text, selector } = textData;
            
            if (!text || !selector) return;
            
            // Escape special regex characters in text
            const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // Update based on selector type
            if (selector.includes('h1') || selector.includes('.hero-title')) {
                htmlContent = htmlContent.replace(
                    /(<h1[^>]*class="hero-title"[^>]*>)(.*?)(<\/h1>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('p') && selector.includes('.hero-subtitle')) {
                htmlContent = htmlContent.replace(
                    /(<p[^>]*class="hero-subtitle"[^>]*>)(.*?)(<\/p>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.btn-calculate')) {
                htmlContent = htmlContent.replace(
                    /(<button[^>]*class="[^"]*btn-calculate[^"]*"[^>]*>)(.*?)(<\/button>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.hero-cta .btn-large')) {
                htmlContent = htmlContent.replace(
                    /(<button[^>]*class="[^"]*btn-large[^"]*btn-outline[^"]*"[^>]*>)(.*?)(<\/button>)/s,
                    (match, open, oldText, close) => {
                        if (match.includes('hero-cta')) {
                            return open + text + close;
                        }
                        return match;
                    }
                );
            } else if (selector.includes('.btn-center')) {
                htmlContent = htmlContent.replace(
                    /(<button[^>]*class="btn-center"[^>]*>)(.*?)(<\/button>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.btn-test-drive')) {
                htmlContent = htmlContent.replace(
                    /(<button[^>]*class="btn-test-drive"[^>]*>)(.*?)(<\/button>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.order-form button[type="submit"]')) {
                htmlContent = htmlContent.replace(
                    /(<button[^>]*type="submit"[^>]*class="[^"]*btn-primary[^"]*btn-large[^"]*"[^>]*>)(.*?)(<\/button>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.tech-main-title')) {
                htmlContent = htmlContent.replace(
                    /(<h2[^>]*class="tech-main-title"[^>]*>)(.*?)(<\/h2>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.tech-subtitle-large')) {
                htmlContent = htmlContent.replace(
                    /(<p[^>]*class="tech-subtitle-large"[^>]*>)(.*?)(<\/p>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.tech-subtitle-small')) {
                htmlContent = htmlContent.replace(
                    /(<p[^>]*class="tech-subtitle-small"[^>]*>)(.*?)(<\/p>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.section-heading') && !selector.includes('#application')) {
                htmlContent = htmlContent.replace(
                    /(<h2[^>]*class="section-heading"[^>]*>)(.*?)(<\/h2>)/s,
                    (match, open, oldText, close) => {
                        // Only replace if it's in principle section (first occurrence)
                        if (match.includes('Как LED')) {
                            return open + text + close;
                        }
                        return match;
                    }
                );
            } else if (selector.includes('#application .section-heading')) {
                htmlContent = htmlContent.replace(
                    /(<h2[^>]*class="section-heading"[^>]*>)(.*?)(<\/h2>)/s,
                    (match, open, oldText, close) => {
                        if (match.includes('Решение для')) {
                            return open + text + close;
                        }
                        return match;
                    }
                );
            } else if (selector.includes('.section-link')) {
                htmlContent = htmlContent.replace(
                    /(<p[^>]*class="section-link"[^>]*>)(.*?)(<\/p>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.test-drive-cta h2')) {
                htmlContent = htmlContent.replace(
                    /(<h2[^>]*>)(.*?Хотите попробовать\?.*?)(<\/h2>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.test-drive-cta p')) {
                htmlContent = htmlContent.replace(
                    /(<p[^>]*>)(.*?Закажите бесплатный тест-драйв.*?)(<\/p>)/s,
                    (match, open, oldText, close) => {
                        if (match.includes('test-drive-cta')) {
                            return open + text + close;
                        }
                        return match;
                    }
                );
            } else if (selector.includes('.faq .section-title')) {
                htmlContent = htmlContent.replace(
                    /(<h2[^>]*class="section-title"[^>]*>)(.*?Часто задаваемые вопросы.*?)(<\/h2>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.order-section .section-title')) {
                htmlContent = htmlContent.replace(
                    /(<h2[^>]*class="section-title"[^>]*>)(.*?Получите расчет стоимости.*?)(<\/h2>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.tech-feature-card:nth-child(1) h3')) {
                htmlContent = htmlContent.replace(
                    /(<h3[^>]*>)(.*?Прозрачность до 95%.*?)(<\/h3>)/s,
                    (match, open, oldText, close) => {
                        // First tech feature card
                        const matches = htmlContent.match(/<h3[^>]*>.*?<\/h3>/g);
                        if (matches && matches[0] === match) {
                            return open + text + close;
                        }
                        return match;
                    }
                );
            } else if (selector.includes('.tech-feature-card:nth-child(2) h3')) {
                htmlContent = htmlContent.replace(
                    /(<h3[^>]*>)(.*?Монтаж прямо на стекло.*?)(<\/h3>)/s,
                    `$1${text}$3`
                );
            } else if (selector.includes('.tech-feature-card:nth-child(3) h3')) {
                htmlContent = htmlContent.replace(
                    /(<h3[^>]*>)(.*?Подвесной монтаж.*?)(<\/h3>)/s,
                    `$1${text}$3`
                );
            }
        });
        
        fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    } catch (error) {
        console.error('Error updating HTML texts:', error);
        throw error;
    }
}

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        if (USE_DATABASE && pool) {
            await pool.query('SELECT 1');
            res.json({ status: 'ok', database: 'connected', type: 'postgresql' });
        } else {
            // Check JSON file
            const DATA_FILE = path.join(__dirname, 'data', 'orders.json');
            if (fs.existsSync(DATA_FILE)) {
                res.json({ status: 'ok', database: 'connected', type: 'json' });
            } else {
                res.json({ status: 'ok', database: 'ready', type: 'json' });
            }
        }
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
