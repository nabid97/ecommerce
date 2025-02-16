const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create new order
router.post('/', orderController.createOrder);

// Get specific order
router.get('/:id', orderController.getOrder);

// Get all user's orders
router.get('/', orderController.getUserOrders);

// Update order status (admin only)
router.put('/:id/status', adminAuth, orderController.updateOrderStatus);

// Update payment status (admin only)
router.put('/:id/payment', adminAuth, orderController.updatePaymentStatus);

// Cancel order
router.post('/:id/cancel', orderController.cancelOrder);

// Get order statistics
router.get('/stats/summary', orderController.getOrderStats);

module.exports = router;