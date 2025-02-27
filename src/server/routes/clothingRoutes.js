// src/server/routes/clothingRoutes.js
const express = require('express');
const router = express.Router();
const clothingController = require('../controllers/clothingController');
const { upload } = require('../middleware/upload');

// Debug middleware for logging requests
router.use((req, res, next) => {
  console.log(`
    ===== Clothing Route Request =====
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    Path: ${req.originalUrl}
    Body: ${JSON.stringify(req.body)}
    ==============================
  `);
  next();
});

// Get available clothing types
router.get('/types', clothingController.getClothingTypes);

// Generate clothing visualization
router.post('/visualize', clothingController.generateVisualization);

// Create clothing order
router.post('/orders', clothingController.createOrder);

module.exports = router;