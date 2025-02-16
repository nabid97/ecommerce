const express = require('express');
const router = express.Router();
const fabricController = require('../controllers/fabricController');
const { auth, adminAuth } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', fabricController.getAllFabrics);
router.get('/:id', fabricController.getFabricById);
router.get('/check-availability', fabricController.checkAvailability);

// Admin routes - require admin authentication
router.use(adminAuth);

// Create new fabric
router.post('/',
  upload.array('images', 5), // Allow up to 5 images
  handleUploadError,
  fabricController.createFabric
);

// Update fabric
router.put('/:id',
  upload.array('images', 5),
  handleUploadError,
  fabricController.updateFabric
);

// Delete fabric
router.delete('/:id', fabricController.deleteFabric);

// Update stock
router.put('/:id/stock', fabricController.updateStock);

module.exports = router;