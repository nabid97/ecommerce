
require('../textEncoder'); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// MongoDB Atlas connection
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;  // ✅ Corrected this line

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

// Async Server Startup Function
const startServer = async () => {
  try {
    // Debugging: Check if environment variables are loaded
    console.log('MONGO_URI:', process.env.MONGO_URI);  // ✅ Add this for debugging

    // Connect to Database
    await connectDB();

    // Initialize express
    const app = express();

    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/api/auth', require('./server/routes/authRoutes'));
    app.use('/api/logos', require('./server/routes/logoRoutes'));
    app.use('/api/orders', require('./server/routes/orderRoutes'));
    app.use('/api/fabrics', require('./server/routes/fabricRoutes'));

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send({ message: 'Something went wrong!' });
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
