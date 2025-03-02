// src/server/routes/logoRoutes.js
const express = require('express');
const router = express.Router();
const logoController = require('../controllers/logoController');
const { auth } = require('../middleware/auth'); // Import authentication middleware

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

// Public routes - no authentication required
// Test routes for debugging
router.get('/test', logoController.generateLogoTest);
router.get('/test-direct', logoController.testStabilityDirect);

// Generate logo route (can work for both authenticated and anonymous users)
router.post('/generate', logoController.generateLogo);

// Visualization routes
router.post('/visualize-clothing', logoController.generateClothingVisualization);
router.post('/simple-clothing-viz', logoController.simpleClothingVisualization);

// S3 configuration check
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

// User-specific routes - require authentication
// IMPORTANT: This is the route you should call from the MyLogos component
router.get('/user', auth, logoController.getUserLogos); // Add dedicated route for user's logos

// General logo endpoints
router.post('/upload', auth, logoController.uploadLogo); // Require auth for uploads
router.get('/', logoController.getUserLogos); // Keep as fallback for all logos
router.get('/:id', logoController.getLogo);
router.delete('/:id', auth, logoController.deleteLogo); // Require auth for deletion
router.put('/:id', auth, logoController.updateLogo); // Require auth for updates

module.exports = router;