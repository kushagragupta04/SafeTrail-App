const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const incidentRoutes = require('./src/routes/incidents');
const safetyRoutes = require('./src/routes/safety');
const emergencyRoutes = require('./src/routes/emergency');
const mlRoutes = require('./src/routes/ml');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://10.0.2.2:3000', // Android emulator
    'http://10.0.2.2:5000', // Android emulator for API
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'http://10.67.62.161:5000', // Your computer's WiFi IP for phone
    'http://10.67.62.161:3000', // Your computer's WiFi IP for website
    'http://192.168.51.1:5000', // Current WiFi IP for phone
    'http://192.168.51.1:3000', // Current WiFi IP for website
    // Add your website URL here if different
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Tourist Safety API is running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint under /api prefix for mobile app
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Tourist Safety API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/ml', mlRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourist-safety', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API URL: http://localhost:${PORT}`);
  console.log(`📱 API URL (Android emulator): http://10.0.2.2:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Server listening on all network interfaces`);
});

module.exports = app;
