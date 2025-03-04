import dotenv from 'dotenv';
import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import Stripe from 'stripe';
import { Server } from 'http';

// Initialize dotenv
dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Specify API version for TypeScript
});

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
  // Using require here intentionally for runtime check
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

const app: Application = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());

// Import routes
import fabricRoutes from './src/server/routes/fabricRoutes';
import authRoutes from './src/server/routes/authRoutes';
import logoRoutes from './src/server/routes/logoRoutes';
import orderRoutes from './src/server/routes/orderRoutes';
import clothingRoutes from './src/server/routes/clothingRoutes';

app.use('/assets', express.static(path.join(__dirname, 'src', 'assets')));
app.use('/fabric-images', express.static(path.join(__dirname, 'src', 'assets', 'fabricimages')));
console.log('Serving fabric images from:', path.join(__dirname, 'src', 'assets', 'fabricimages'));

// Add static file serving for uploads directory with CORS headers
app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
  // Enhanced CORS and security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'src', 'uploads')));

console.log('Serving uploads from:', path.join(__dirname, 'src', 'uploads'));
console.log('Uploads directory:', path.join(__dirname, 'src', 'uploads'));
console.log('Full file path:', path.join(__dirname, 'src', 'uploads', 'logos', 'logo-1740943499044.png'));

// Also add a route to serve uploaded images from the src/uploads directory as fallback
app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'src', 'uploads')));

console.log('Serving uploads (fallback) from:', path.join(__dirname, 'src', 'uploads'));

app.get('/api/placeholder/:width/:height', (req: Request, res: Response) => {
  const { width, height } = req.params;
  const text = req.query.text as string || 'Placeholder';
  
  res.set('Content-Type', 'image/svg+xml');
  res.send(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e0e0e0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="20" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `);
});

// Detailed request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
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
interface CorsOptions {
  origin: string[];
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  optionsSuccessStatus: number;
  preflightContinue: boolean;
  maxAge: number;
}

const corsOptions: CorsOptions = {
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
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  
  if (origin && corsOptions.origin.includes(origin)) {
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
app.use((req: Request, res: Response, next: NextFunction) => {
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
interface HealthCheckResponse {
  status: string;
  time: string;
  environment: string;
  uptime: number;
}

app.get('/health', (req: Request, res: Response) => {
  const healthData: HealthCheckResponse = {
    status: 'healthy',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  };
  res.json(healthData);
});

// Debug routes endpoint
interface RouteInfo {
  path: string;
  methods: string[];
}

app.get('/api/routes', (req: Request, res: Response) => {
  const routes: RouteInfo[] = [];
  
  // Type assertion needed to access _router
  const router = (app as any)._router;
  
  if (router && router.stack) {
    router.stack.forEach((middleware: any) => {
      if (middleware.route) {
        routes.push({
          path: middleware.route.path,
          methods: Object.keys(middleware.route.methods)
        });
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler: any) => {
          if (handler.route) {
            routes.push({
              path: handler.route.path,
              methods: Object.keys(handler.route.methods)
            });
          }
        });
      }
    });
  }
  
  res.json(routes);
});

// Stripe Payment Intent Endpoint
interface CartItem {
  price: number;
  quantity: number;
}

interface PaymentIntentRequest {
  items: CartItem[];
  shipping: number;
  tax: number;
}

app.post('/api/create-payment-intent', async (req: Request, res: Response) => {
  try {
    console.log('Payment intent request received:', req.body);
    const { items, shipping, tax } = req.body as PaymentIntentRequest;
    
    const calculateOrderAmount = (): number => {
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
    const err = error as Error;
    console.error('Payment intent error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Stripe Webhook Endpoint
app.post('/api/webhook', async (req: Request, res: Response) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('Webhook skipped: STRIPE_WEBHOOK_SECRET not set');
    return res.json({ received: true });
  }
  
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
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
interface ServerError extends Error {
  status?: number;
}

app.use((err: ServerError, req: Request, res: Response, next: NextFunction) => {
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
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    requestedUrl: req.originalUrl
  });
});

// Start server and database connection
const PORT: number = parseInt(process.env.PORT || '5000', 10);
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost/fabricstore';

const startServer = async (): Promise<void> => {
  try {
    // Try to connect to MongoDB, but don't block server startup if it fails
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✓ MongoDB connected successfully');
    } catch (dbError) {
      const error = dbError as Error;
      console.error('MongoDB connection failed, but server will continue:', error.message);
    }

    // Start Express server
    const server: Server = app.listen(PORT, () => {
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
    const gracefulShutdown = (signal: string): void => {
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
    const error = err as Error;
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

export default app;