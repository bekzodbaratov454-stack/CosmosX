const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(morgan('dev'));

// Rate limiting - only for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS - allow all origins in dev
app.use(cors({ origin: '*', credentials: true }));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files - uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React frontend build
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));
app.use('/api/media', require('./routes/media'));
app.use('/api/facts', require('./routes/facts'));
app.use('/api/comments', require('./routes/comments'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CosmosX API ishlamoqda 🚀', timestamp: new Date() });
});

// All non-API routes -> React app
app.get('*', (req, res) => {
  const indexPath = path.join(frontendBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <html><body style="background:#020617;color:#e2e8f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column">
        <h1 style="color:#6366f1">🚀 CosmosX API ishlamoqda!</h1>
        <p>Frontend build qilish uchun:</p>
        <code style="background:#0f172a;padding:12px 20px;border-radius:8px;color:#a5b4fc">
          cd frontend &amp;&amp; npm run build
        </code>
        <p style="margin-top:20px">Keyin backend ni qayta ishga tushiring.</p>
        <a href="/api/health" style="color:#6366f1">API Health Check</a>
      </body></html>
    `);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await require('./utils/seedAdmin')();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log(`🚀 CosmosX Server: http://localhost:${PORT}`);
      console.log(`⚙️  Admin Panel:   http://localhost:${PORT}/admin`);
      console.log(`🔑 Admin login:   admin@cosmos.uz`);
      console.log('========================================');
      console.log('');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
