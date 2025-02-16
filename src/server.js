require('../textEncoder');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Import routes
const authRoutes = require('./src/server/routes/authRoutes');
const logoRoutes = require('./src/server/routes/logoRoutes');
const orderRoutes = require('./src/server/routes/orderRoutes');
const fabricRoutes = require('./src/server/routes/fabricRoutes');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize express
const app = express();

// MongoDB Atlas connection
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('ERROR: MONGO_URI is not defined');
    console.error('Please set MONGO_URI in your .env file');
    throw new Error('MongoDB URI is not defined');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Atlas connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Detailed MongoDB Connection Error:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
    throw error;
  }
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logos', logoRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/fabrics', fabricRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Async Server Startup Function
const startServer = async () => {
  try {
    // Debug environment variables
    if (process.env.NODE_ENV === 'development') {
      console.log('Debug - MONGO_URI:', process.env.MONGO_URI);
    }

    // Connect to Database
    await connectDB();

    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });

    return server;
  } catch (error) {
    console.error('Server startup failed:', error);
    throw error;
  }
};

// Export for testing
module.exports = { app, startServer, connectDB };

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}