const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
<<<<<<< HEAD
const helmet = require('helmet');
const compression = require('compression');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51Qw9JaJkWEUWirtQd3lx62XDRkZOivj3FTdIPOt4OpQ8iBKJoN89HlKsFn5sKsXIxoJCRFym2Ar2qbB36dlwNs7G00DThz6401');
require('dotenv').config();

// Log Stripe configuration
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY 
  ? 'Key is present (starts with: ' + process.env.STRIPE_SECRET_KEY.substring(0, 7) + '...)' 
  : 'Key is missing'
);

const app = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());

// Import routes
const fabricRoutes = require(path.join(__dirname, 'src/server/routes/fabricRoutes'));
const authRoutes = require(path.join(__dirname, 'src/server/routes/authRoutes'));
const logoRoutes = require(path.join(__dirname, 'src/server/routes/logoRoutes'));

// Detailed request logging middleware
=======
require('dotenv').config();

const app = express();

// Import routes - using path.join for cross-platform compatibility
const fabricRoutes = require(path.join(__dirname, 'src/server/routes/fabricRoutes'));

// Detailed request logging middleware to help debug CORS issues
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
app.use((req, res, next) => {
  console.log(`
    ===== Incoming Request =====
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    URL: ${req.url}
<<<<<<< HEAD
    Origin: ${req.headers.origin || 'No Origin'}
    IP: ${req.ip}
=======
    Origin: ${req.headers.origin}
    Headers: ${JSON.stringify(req.headers)}
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
    ===========================
  `);
  next();
});

<<<<<<< HEAD
// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5001',   // Frontend
    'http://127.0.0.1:5001',   // Frontend alternative
    'http://localhost:3000',   // Common React port
    'http://localhost:3001',   // Fallback React port
    'http://localhost:5000'    // Backend port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With'
  ],
  credentials: true,
=======
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
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

<<<<<<< HEAD
// Additional CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (corsOptions.origin.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
=======
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
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

<<<<<<< HEAD
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});

// Special handler for Stripe webhook - must be before JSON body parser
app.post('/api/webhook', express.raw({type: 'application/json'}));

// Parse JSON and URL-encoded bodies
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') {
    next();
  } else {
    express.json({
      limit: '10mb',
      strict: true
    })(req, res, next);
  }
});
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Mount routes
app.use('/api/fabrics', fabricRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logos', logoRoutes);
=======
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
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    time: new Date().toISOString(),
<<<<<<< HEAD
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Debug routes endpoint
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});

// Stripe Payment Intent Endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    console.log('Payment intent request received:', req.body);
    const { items, shipping, tax } = req.body;
    
    const calculateOrderAmount = () => {
      const subtotal = items.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );
      
      return Math.round((subtotal + shipping + tax) * 100);
    };

    const amount = calculateOrderAmount();
    console.log('Calculated amount:', amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhook Endpoint
app.post('/api/webhook', async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('Webhook skipped: STRIPE_WEBHOOK_SECRET not set');
    return res.json({ received: true });
  }
  
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Event handling
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

=======
    environment: process.env.NODE_ENV || 'development'
  });
});

>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
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

<<<<<<< HEAD
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    requestedUrl: req.originalUrl
  });
});

// Start server and database connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/fabricstore';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB connected successfully');

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`
        ===== Server Configuration =====
        • PORT: ${PORT}
        • Environment: ${process.env.NODE_ENV || 'development'}
        • MongoDB URI: ${MONGODB_URI}
        • Stripe API: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}
        ===============================
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
};

startServer();
=======
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
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb

module.exports = app;