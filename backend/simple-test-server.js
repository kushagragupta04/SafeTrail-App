const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001; // Different port to test

// Allow all origins for testing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Simple test server is working!',
    timestamp: new Date().toISOString(),
    clientIP: req.ip,
    userAgent: req.get('User-Agent')
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Simple test server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🧪 Simple test server running on port ${PORT}`);
  console.log(`📱 Test URL: http://192.168.51.1:${PORT}/test`);
  console.log(`🔗 Health check: http://192.168.51.1:${PORT}/health`);
});
