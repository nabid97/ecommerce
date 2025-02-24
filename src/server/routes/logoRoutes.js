const express = require('express');
const router = express.Router();
const logoController = require('../controllers/logoController');
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
router.put('/:id', logoController.updateLogo);

module.exports = router;