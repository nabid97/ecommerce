// src/server/controllers/orderController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order, { IOrder } from '../models/Order';
import Fabric, { IFabric } from '../models/Fabric';

// Extend Request to include user from auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
  };
}

interface OrderItem {
  type: string;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  customizations?: Record<string, any>;
}

interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: {
    name: string;
    companyName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
  };
  paymentDetails?: {
    method?: string;
    transactionId?: string;
    amount?: number;
    currency?: string;
  };
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface UpdateOrderStatusRequest {
  status: string;
}

const orderController = {
  createOrder: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        items,
        shippingAddress,
        paymentDetails,
        subtotal,
        tax,
        shipping,
        total
      } = req.body as CreateOrderRequest;

      // Validate items availability
      for (const item of items) {
        if (item.type === 'fabric') {
          const fabric = await Fabric.findById(item.productId);
          if (!fabric) {
            res.status(404).json({ message: `Fabric not found: ${item.productId}` });
            return;
          }

          if (!fabric.isQuantityAvailable(item.quantity)) {
            res.status(400).json({ message: `Insufficient quantity for fabric: ${fabric.name}` });
            return;
          }

          // Reserve the quantity
          await fabric.reserveQuantity(item.quantity);
        }
      }

      // Create order
      const order = new Order({
        userId: req.user?._id,
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

  getOrder: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.user?._id
      }).populate('items.productId');

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      res.json(order);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ message: 'Error retrieving order' });
    }
  },

  getUserOrders: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orders = await Order.find({
        userId: req.user?._id
      })
      .sort({ createdAt: -1 })
      .populate('items.productId');

      res.json(orders);
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ message: 'Error retrieving orders' });
    }
  },

  updateOrderStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.body as UpdateOrderStatusRequest;
      const order = await Order.findById(req.params.id);

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      order.status = status;
      await order.save();

      res.json(order);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ message: 'Error updating order status' });
    }
  },

  cancelOrder: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.user?._id
      });

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      if (order.status !== 'pending') {
        res.status(400).json({ message: 'Cannot cancel order in current status' });
        return;
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

  getOrderStats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await Order.aggregate([
        { $match: { userId: req.user?._id } },
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
        { $match: { userId: req.user?._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        stats: stats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
        statusCounts: statusCounts.reduce((acc: Record<string, number>, curr) => {
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

export default orderController;