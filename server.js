require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 


// Environment variables check 
console.log('\n====== ENVIRONMENT VARIABLES CHECK ======');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`PORT: ${process.env.PORT || 'not set'}`);

// Check Stability API key without revealing the full key
if (process.env.STABILITY_API_KEY) {
  const key = process.env.STABILITY_API_KEY;
  console.log(`STABILITY_API_KEY: ${key.substring(0, 5)}...${key.substring(key.length - 3)}`);
} else {
  console.log('STABILITY_API_KEY: not set - This is required for logo generation!');
}

// Other environment variables if needed
console.log(`AWS_S3_BUCKET: ${process.env.AWS_S3_BUCKET || 'not set'}`);
console.log('====== END OF ENV CHECK ======\n');

// Additional package check
try {
  const FormData = require('form-data');
  console.log('✓ form-data package is installed');
} catch (err) {
  console.error('✗ form-data package is missing. Install it with: npm install form-data --save');
}
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
const orderRoutes = require(path.join(__dirname, 'src/server/routes/orderRoutes'));
app.use('/assets', express.static(path.join(__dirname, 'src', 'assets')));
app.use('/fabric-images', express.static(path.join(__dirname, 'src', 'assets', 'fabricimages')));
console.log('Serving fabric images from:', path.join(__dirname, 'src', 'assets', 'fabricimages'));
const clothingRoutes = require(path.join(__dirname, 'src/server/routes/clothingRoutes'));

// Detailed request logging middleware
app.use((req, res, next) => {
  console.log(`
    ===== Incoming Request =====
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    URL: ${req.url}
    Origin: ${req.headers.origin || 'No Origin'}
    IP: ${req.ip}
    ===========================
  `);
  next();
});

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
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Additional CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (corsOptions.origin.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

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
app.use('/api/orders', orderRoutes);
app.use('/api/clothing', clothingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    time: new Date().toISOString(),
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
    // Try to connect to MongoDB, but don't block server startup if it fails
    try {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✓ MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection failed, but server will continue:', dbError.message);
    }

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

module.exports = app;