// src/server/routes/logoRoutes.js
const express = require('express');
const router = express.Router();
const logoController = require('../controllers/logoController');

// Debugging middleware
router.use((req, res, next) => {
  console.log(`
    ===== Logo Route Hit =====
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    Path: ${req.path}
    Headers: ${JSON.stringify(req.headers)}
    Body: ${JSON.stringify(req.body)}
  `);
  next();
});

// Test routes for debugging
router.get('/test', logoController.generateLogoTest);
router.get('/test-direct', logoController.testStabilityDirect);

// Generate logo route
router.post('/generate', logoController.generateLogo);

// Other routes
router.post('/upload', logoController.uploadLogo);
router.get('/', logoController.getUserLogos);
router.get('/:id', logoController.getLogo);
router.delete('/:id', logoController.deleteLogo);
router.put('/:id', logoController.updateLogo);
router.post('/visualize-clothing', logoController.generateClothingVisualization);

module.exports = router;