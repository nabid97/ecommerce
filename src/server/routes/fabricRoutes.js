// src/server/routes/fabricRoutes.js
const express = require('express');
const router = express.Router();
const fabricController = require('../controllers/fabricController');

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`
    ===== Fabric Route Hit =====
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    Path: ${req.originalUrl}
    Query: ${JSON.stringify(req.query)}
    Body: ${JSON.stringify(req.body)}
    ==========================
  `);
  next();
});

// IMPORTANT: Fixed the route order so the specific routes come before the more generic ones
// Express matches routes in the order they are defined!

// GET availability check - must come before /:id to avoid being caught by that route
router.get('/check-availability', (req, res) => {
  console.log('Handling availability check request');
  fabricController.checkAvailability(req, res);
});

// POST create order - must come before /:id to avoid being caught by that route
router.post('/orders', (req, res) => {
  console.log('Handling create order request');
  fabricController.createOrder(req, res);
});

// GET order details - must come before /:id to avoid being caught by that route
router.get('/orders/:id', (req, res) => {
  console.log(`Handling GET request for order ID: ${req.params.id}`);
  fabricController.getOrder(req, res);
});

// GET all fabrics
router.get('/', (req, res) => {
  console.log('Handling GET request for all fabrics');
  fabricController.getAllFabrics(req, res);
});

// GET pricing for a fabric
router.get('/:id/pricing', (req, res) => {
  console.log(`Handling pricing request for fabric ID: ${req.params.id}`);
  fabricController.getPricing(req, res);
});

// GET single fabric by ID - this should be last since it's the most generic
router.get('/:id', (req, res) => {
  console.log(`Handling GET request for fabric ID: ${req.params.id}`);
  fabricController.getFabricById(req, res);
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Fabric Route Error:', err);
  res.status(500).json({
    message: 'An error occurred in the fabric route',
    error: err.message,
    path: req.originalUrl
  });
});

module.exports = router;