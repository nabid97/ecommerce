// src/server/controllers/fabricController.js
const Fabric = require('../models/Fabric');

// Sample data for development
const sampleFabrics = [
  {
    id: 'cotton',
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
    id: 'polyester',
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
  },
  // Added missing 'linen' fabric to match client-side data
  {
    id: 'linen',
    name: 'Linen',
    description: 'Light, natural fabric',
    type: 'linen',
    colors: [
      { name: 'White', code: '#FFFFFF', inStock: true },
      { name: 'Beige', code: '#F5F5DC', inStock: true },
      { name: 'Grey', code: '#808080', inStock: true }
    ],
    price: 8.99,
    minOrderQuantity: 30,
    stock: {
      available: 800,
      reserved: 0,
      reorderPoint: 150
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
      // First try to find by MongoDB ObjectId
      let fabric;
      try {
        fabric = await Fabric.findById(req.params.id);
      } catch (err) {
        // If not found, fallback to find by an 'id' field or code field
        fabric = await Fabric.findOne({ $or: [{ id: req.params.id }, { code: req.params.id }] });
      }
      
      // If still not found, check sample data
      if (!fabric) {
        fabric = sampleFabrics.find(f => f.id === req.params.id);
      }
      
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
      
      // First try to find by ObjectId, then by other identifiers
      let fabric;
      try {
        fabric = await Fabric.findById(fabricId);
      } catch (err) {
        // If error occurred (invalid ObjectId), try to find by other fields
        fabric = await Fabric.findOne({ $or: [{ id: fabricId }, { code: fabricId }] });
      }
      
      // If not in database, check sample data
      if (!fabric) {
        fabric = sampleFabrics.find(f => f.id === fabricId);
        
        // Mock the availability check for sample data
        if (fabric) {
          const quantityNum = Number(quantity);
          const isAvailable = fabric.stock.available >= quantityNum;
          
          return res.status(200).json({
            fabricId,
            isAvailable,
            availableQuantity: fabric.stock.available,
            requestedQuantity: quantityNum
          });
        }
      }

      if (!fabric) {
        return res.status(404).json({ message: 'Fabric not found' });
      }

      // For database fabrics with isQuantityAvailable method
      const isAvailable = fabric.isQuantityAvailable 
        ? fabric.isQuantityAvailable(Number(quantity))
        : (fabric.stock.available >= Number(quantity));
      
      res.status(200).json({
        fabricId,
        isAvailable,
        availableQuantity: fabric.availableQuantity || fabric.stock.available - fabric.stock.reserved,
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
      
      // Get fabric by id, handling both ObjectId and string ids
      let fabric;
      try {
        fabric = await Fabric.findById(req.params.id);
      } catch (err) {
        fabric = await Fabric.findOne({ $or: [{ id: req.params.id }, { code: req.params.id }] });
      }
      
      // If not in database, check sample data
      if (!fabric) {
        fabric = sampleFabrics.find(f => f.id === req.params.id);
      }

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
      console.log('Creating order for fabric:', fabricId);
      
      // Find fabric, handling both ObjectId and string ids
      let fabric;
      
      // Handle string IDs by trying both approaches
      try {
        // First try to find by MongoDB ObjectId
        fabric = await Fabric.findById(fabricId);
      } catch (err) {
        console.log('Not a valid ObjectId, trying string ID lookup');
        // If that fails (invalid ObjectId), try by string id
        fabric = await Fabric.findOne({ $or: [{ id: fabricId }, { code: fabricId }] });
      }
      
      // If not in database, check sample data
      if (!fabric) {
        console.log('Fabric not found in database, checking sample data');
        fabric = sampleFabrics.find(f => f.id === fabricId);
      }

      if (!fabric) {
        console.log('Fabric not found:', fabricId);
        return res.status(404).json({ message: 'Fabric not found' });
      }

      // Check availability
      const isAvailable = fabric.isQuantityAvailable 
        ? fabric.isQuantityAvailable(quantity)
        : (fabric.stock.available >= quantity);
        
      if (!isAvailable) {
        return res.status(400).json({ message: 'Insufficient quantity available' });
      }

      // Calculate total price
      const total = fabric.price * quantity * (length || 1);

      // In a real application, you would create an order in the database here
      res.status(201).json({
        message: 'Order created successfully',
        orderId: Date.now().toString(),
        fabric: fabric.name,
        quantity,
        length: length || 1,
        total
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