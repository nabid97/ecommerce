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


// Add the missing route for clothing visualization
router.post('/visualize-clothing', logoController.generateClothingVisualization);
// Add this after the generate route
router.get('/check-s3', (req, res) => {
  const s3Config = {
    bucket: process.env.AWS_S3_BUCKET || 'ecommerce-website-generated-logo-2025',
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyConfigured: !!process.env.AWS_ACCESS_KEY_ID,
    secretKeyConfigured: !!process.env.AWS_SECRET_ACCESS_KEY
  };
  
  res.json({
    message: 'S3 Configuration',
    config: s3Config
  });
});
// Other routes
router.post('/upload', logoController.uploadLogo);
router.get('/', logoController.getUserLogos);
router.get('/:id', logoController.getLogo);
router.delete('/:id', logoController.deleteLogo);
router.put('/:id', logoController.updateLogo);
router.post('/simple-clothing-viz', logoController.simpleClothingVisualization);


module.exports = router;