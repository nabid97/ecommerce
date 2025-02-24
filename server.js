const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Import routes - using path.join for cross-platform compatibility
const fabricRoutes = require(path.join(__dirname, 'src/server/routes/fabricRoutes'));

// Detailed request logging middleware to help debug CORS issues
app.use((req, res, next) => {
  console.log(`
    ===== Incoming Request =====
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    URL: ${req.url}
    Origin: ${req.headers.origin}
    Headers: ${JSON.stringify(req.headers)}
    ===========================
  `);
  next();
});

// Configure CORS middleware
const corsOptions = {
  // Origin configuration
  origin: (origin, callback) => {
    // Allow all localhost ports commonly used in development
    const allowedOrigins = [
      'http://localhost:5001',  // Frontend
      'http://127.0.0.1:5001', // Frontend alternative
      'http://localhost:3000',  // Common React port
      'http://localhost:3001'   // Fallback React port
    ];

    // Handle requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  // Allow credentials (important for cookies and auth headers)
  credentials: true,
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ],
  // Preflight request caching time in seconds
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Additional headers middleware for extra CORS support
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Only set allowed origins that match our list
  if (corsOptions.origin && typeof corsOptions.origin === 'function') {
    corsOptions.origin(origin, (err, allowed) => {
      if (allowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    });
  }
  
  // Set standard CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api/fabrics', fabricRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    origin: req.headers.origin
  });

  res.status(err.status || 500).json({
    message: 'An unexpected error occurred',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
    ===== Server Configuration =====
    • PORT: ${PORT}
    • Environment: ${process.env.NODE_ENV || 'development'}
    • MongoDB URI: ${process.env.MONGODB_URI || 'default_mongodb_uri'}
    • Allowed Origins: ${corsOptions.origin.toString()}
    ===============================
  `);

  // Initialize database connection
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/fabricstore', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // On database connection error, gracefully shut down the server
    process.exit(1);
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });
});

module.exports = app;