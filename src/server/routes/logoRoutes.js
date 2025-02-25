const express = require('express');
const router = express.Router();
const logoController = require('../controllers/logoController');
<<<<<<< HEAD

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
=======
const { auth } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// All routes require authentication
router.use(auth);

// Generate logo
router.post('/generate', logoController.generateLogo);

// Upload logo
router.post('/upload', 
  upload.single('logo'),
  handleUploadError,
  logoController.uploadLogo
);

// Get specific logo
router.get('/:id', logoController.getLogo);

// Get all user's logos
router.get('/', logoController.getUserLogos);

// Delete logo
router.delete('/:id', logoController.deleteLogo);

// Update logo configuration
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
router.put('/:id', logoController.updateLogo);

module.exports = router;