// src/server/controllers/fabricController.js
const Fabric = require('../models/Fabric');

// Sample data for development
const sampleFabrics = [
  {
    name: 'Cotton',
    description: 'Soft, breathable natural fabric',
    type: 'cotton',
    colors: [
      { name: 'White', code: '#FFFFFF', inStock: true },
      { name: 'Black', code: '#000000', inStock: true }
    ],
    price: 5.99,
    minOrderQuantity: 50,
    stock: {
      available: 1000,
      reserved: 0,
      reorderPoint: 200
    },
    status: 'active'
  },
  {
    name: 'Polyester',
    description: 'Durable synthetic fabric',
    type: 'polyester',
    colors: [
      { name: 'Navy', code: '#000080', inStock: true },
      { name: 'Red', code: '#FF0000', inStock: true }
    ],
    price: 4.99,
    minOrderQuantity: 100,
    stock: {
      available: 1500,
      reserved: 0,
      reorderPoint: 300
    },
    status: 'active'
  }
];

const fabricController = {
  // Get all fabrics
  getAllFabrics: async (req, res) => {
    try {
      console.log('Fetching all fabrics');
      let fabrics;
      
      // Try to get fabrics from database
      try {
        fabrics = await Fabric.find({ status: 'active' });
      } catch (dbError) {
        console.log('Database error, using sample data:', dbError);
        fabrics = sampleFabrics;
      }

      // If no fabrics found in DB, use sample data
      if (!fabrics || fabrics.length === 0) {
        console.log('No fabrics found in DB, using sample data');
        fabrics = sampleFabrics;
      }

      res.status(200).json(fabrics);
    } catch (error) {
      console.error('Error in getAllFabrics:', error);
      res.status(500).json({ 
        message: 'Error fetching fabrics',
        error: error.message 
      });
    }
  },

  // Get fabric by ID
  getFabricById: async (req, res) => {
    try {
      const fabric = await Fabric.findById(req.params.id);
      
      if (!fabric) {
        return res.status(404).json({ message: 'Fabric not found' });
      }

      res.status(200).json(fabric);
    } catch (error) {
      console.error('Error in getFabricById:', error);
      res.status(500).json({ 
        message: 'Error fetching fabric',
        error: error.message 
      });
    }
  },

  // Check fabric availability
  checkAvailability: async (req, res) => {
    try {
      const { fabricId, quantity } = req.query;
      const fabric = await Fabric.findById(fabricId);

      if (!fabric) {
        return res.status(404).json({ message: 'Fabric not found' });
      }

      const isAvailable = fabric.isQuantityAvailable(Number(quantity));
      
      res.status(200).json({
        fabricId,
        isAvailable,
        availableQuantity: fabric.availableQuantity,
        requestedQuantity: Number(quantity)
      });
    } catch (error) {
      console.error('Error in checkAvailability:', error);
      res.status(500).json({ 
        message: 'Error checking availability',
        error: error.message 
      });
    }
  },

  // Get fabric pricing
  getPricing: async (req, res) => {
    try {
      const { length, quantity } = req.query;
      const fabric = await Fabric.findById(req.params.id);

      if (!fabric) {
        return res.status(404).json({ message: 'Fabric not found' });
      }

      const total = fabric.price * Number(length) * Number(quantity);
      
      res.status(200).json({
        fabricId: req.params.id,
        pricePerUnit: fabric.price,
        length: Number(length),
        quantity: Number(quantity),
        total
      });
    } catch (error) {
      console.error('Error in getPricing:', error);
      res.status(500).json({ 
        message: 'Error calculating pricing',
        error: error.message 
      });
    }
  },

  // Create order for fabric
  createOrder: async (req, res) => {
    try {
      const { fabricId, quantity, length } = req.body;
      const fabric = await Fabric.findById(fabricId);

      if (!fabric) {
        return res.status(404).json({ message: 'Fabric not found' });
      }

      if (!fabric.isQuantityAvailable(quantity)) {
        return res.status(400).json({ message: 'Insufficient quantity available' });
      }

      // In a real application, you would create an order in the database here
      res.status(201).json({
        message: 'Order created successfully',
        orderId: Date.now().toString(),
        fabric: fabric.name,
        quantity,
        length,
        total: fabric.price * quantity * length
      });
    } catch (error) {
      console.error('Error in createOrder:', error);
      res.status(500).json({ 
        message: 'Error creating order',
        error: error.message 
      });
    }
  },

  // Get order details
  getOrder: async (req, res) => {
    try {
      // In a real application, you would fetch the order from the database
      res.status(200).json({
        message: 'This is a mock order response',
        orderId: req.params.id
      });
    } catch (error) {
      console.error('Error in getOrder:', error);
      res.status(500).json({ 
        message: 'Error fetching order',
        error: error.message 
      });
    }
  }
};

module.exports = fabricController;