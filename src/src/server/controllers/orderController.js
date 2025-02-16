const Order = require('../models/Order');
const Fabric = require('../models/Fabric');

const orderController = {
  createOrder: async (req, res) => {
    try {
      const {
        items,
        shippingAddress,
        paymentDetails,
        subtotal,
        tax,
        shipping,
        total
      } = req.body;

      // Validate items availability
      for (const item of items) {
        if (item.type === 'fabric') {
          const fabric = await Fabric.findById(item.productId);
          if (!fabric) {
            return res.status(404).json({ message: `Fabric not found: ${item.productId}` });
          }

          if (!fabric.isQuantityAvailable(item.quantity)) {
            return res.status(400).json({ message: `Insufficient quantity for fabric: ${fabric.name}` });
          }

          // Reserve the quantity
          await fabric.reserveQuantity(item.quantity);
        }
      }

      // Create order
      const order = new Order({
        userId: req.user._id,
        items,
        shippingAddress,
        paymentDetails,
        subtotal,
        tax,
        shipping,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      });

      await order.save();

      res.status(201).json(order);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ message: 'Error creating order' });
    }
  },

  getOrder: async (req, res) => {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.user._id
      }).populate('items.productId');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ message: 'Error retrieving order' });
    }
  },

  getUserOrders: async (req, res) => {
    try {
      const orders = await Order.find({
        userId: req.user._id
      })
      .sort({ createdAt: -1 })
      .populate('items.productId');

      res.json(orders);
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ message: 'Error retrieving orders' });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.status = status;
      await order.save();

      res.json(order);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ message: 'Error updating order status' });
    }
  },

  cancelOrder: async (req, res) => {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot cancel order in current status' });
      }

      // Release reserved quantities
      for (const item of order.items) {
        if (item.type === 'fabric') {
          const fabric = await Fabric.findById(item.productId);
          if (fabric) {
            fabric.stock.reserved -= item.quantity;
            await fabric.save();
          }
        }
      }

      order.status = 'cancelled';
      await order.save();

      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({ message: 'Error cancelling order' });
    }
  },
  updatePaymentStatus: async (req, res) => {
    try {
      const { paymentStatus } = req.body;
      const order = await Order.findById(req.params.id);
  
      // Validate order existence
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Optional: Add validation for allowed payment statuses
      const allowedStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!allowedStatuses.includes(paymentStatus)) {
        return res.status(400).json({ 
          message: 'Invalid payment status', 
          allowedStatuses 
        });
      }
  
      // Update payment status
      order.paymentStatus = paymentStatus;
      await order.save();
  
      // Optional: Trigger additional actions based on payment status
      if (paymentStatus === 'paid') {
        // Example: Release reserved inventory
        for (const item of order.items) {
          if (item.type === 'fabric') {
            const fabric = await Fabric.findById(item.productId);
            if (fabric) {
              fabric.stock.reserved -= item.quantity;
              await fabric.save();
            }
          }
        }
      }
  
      res.json(order);
    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({ message: 'Error updating payment status' });
    }
  },

  getOrderStats: async (req, res) => {
    try {
      const stats = await Order.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' }
          }
        }
      ]);

      const statusCounts = await Order.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        stats: stats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      });
    } catch (error) {
      console.error('Get order stats error:', error);
      res.status(500).json({ message: 'Error retrieving order statistics' });
    }
  }
};

module.exports = orderController;