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

// Generate logo route (remove authentication for debugging)
router.post('/generate', (req, res) => {
  console.log('Logo Generation Endpoint Reached');
  logoController.generateLogo(req, res);
});

// Other routes without authentication for now
router.post('/upload', logoController.uploadLogo);
router.get('/', logoController.getUserLogos);
router.get('/:id', logoController.getLogo);
router.delete('/:id', logoController.deleteLogo);
router.put('/:id', logoController.updateLogo);

module.exports = router;