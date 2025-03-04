// src/server/controllers/fabricController.ts
import { Request, Response } from 'express';
import Fabric from '../models/Fabric';

// Define interfaces for the fabric data
interface FabricColor {
  name: string;
  code: string;
  inStock: boolean;
}

interface FabricImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface FabricStock {
  available: number;
  reserved: number;
  reorderPoint: number;
}

interface FabricData {
  id: string;
  name: string;
  description: string;
  type: string;
  colors: FabricColor[];
  price: number;
  minOrderQuantity: number;
  stock: FabricStock;
  status: 'active' | 'inactive' | 'discontinued';
  images?: FabricImage[];
  _id?: string;
}

// Sample data for development
const sampleFabrics: FabricData[] = [
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
    status: 'active',
    images: [
      { 
        url: '/fabric-images/Cotton.jpg',
        alt: 'Cotton fabric',
        isPrimary: true
      }
    ]
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
    status: 'active',
    images: [
      { 
        url: '/fabric-images/Polyester.jpg',
        alt: 'Polyester fabric',
        isPrimary: true
      }
    ]
  },
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
    status: 'active',
    images: [
      { 
        url: '/fabric-images/Linen.jpg',
        alt: 'Linen fabric',
        isPrimary: true
      }
    ]
  },
  // New Silk fabric
  {
    id: 'silk',
    name: 'Silk',
    description: 'Luxurious, smooth natural fabric',
    type: 'silk',
    colors: [
      { name: 'White', code: '#FFFFFF', inStock: true },
      { name: 'Cream', code: '#FFF8DC', inStock: true },
      { name: 'Black', code: '#000000', inStock: true },
      { name: 'Red', code: '#B22222', inStock: true }
    ],
    price: 15.99,
    minOrderQuantity: 20,
    stock: {
      available: 500,
      reserved: 0,
      reorderPoint: 100
    },
    status: 'active',
    images: [
      { 
        url: '/fabric-images/Silk.jpg',
        alt: 'Silk fabric',
        isPrimary: true
      }
    ]
  },
  // New Wool fabric
  {
    id: 'wool',
    name: 'Wool',
    description: 'Warm, insulating natural fabric',
    type: 'wool',
    colors: [
      { name: 'Grey', code: '#808080', inStock: true },
      { name: 'Brown', code: '#8B4513', inStock: true },
      { name: 'Navy', code: '#000080', inStock: true },
      { name: 'Charcoal', code: '#36454F', inStock: true }
    ],
    price: 12.99,
    minOrderQuantity: 25,
    stock: {
      available: 700,
      reserved: 0,
      reorderPoint: 150
    },
    status: 'active',
    images: [
      { 
        url: '/fabric-images/Wool.jpg',
        alt: 'Wool fabric',
        isPrimary: true
      }
    ]
  }
];

interface FabricControllerInterface {
  getAllFabrics: (req: Request, res: Response) => Promise<void>;
  getFabricById: (req: Request, res: Response) => Promise<void>;
  checkAvailability: (req: Request, res: Response) => Promise<void>;
  getPricing: (req: Request, res: Response) => Promise<void>;
  createOrder: (req: Request, res: Response) => Promise<void>;
  getOrder: (req: Request, res: Response) => Promise<void>;
}

const fabricController: FabricControllerInterface = {
  // Get all fabrics
  getAllFabrics: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Fetching all fabrics');
      let fabrics: any[] = [];
      
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
        error: (error as Error).message 
      });
    }
  },

  // Get fabric by ID
  getFabricById: async (req: Request, res: Response): Promise<void> => {
    try {
      const fabricId = req.params.id;
      console.log(`Looking for fabric with ID: ${fabricId}`);
      
      // First try to find by MongoDB ObjectId
      let fabric: any = null;
      try {
        fabric = await Fabric.findById(fabricId);
      } catch (err) {
        // If not found, fallback to find by an 'id' field or code field
        try {
          fabric = await Fabric.findOne({ $or: [{ id: fabricId }, { code: fabricId }] });
        } catch (mongoError) {
          console.log('MongoDB error, will check sample data:', mongoError);
        }
      }
      
      // If still not found, check sample data
      if (!fabric) {
        console.log('Fabric not found in DB, checking sample data');
        fabric = sampleFabrics.find(f => f.id.toLowerCase() === fabricId.toLowerCase());
        console.log('Sample data search result:', fabric ? `Found: ${fabric.name}` : 'Not found');
      }
      
      if (!fabric) {
        return res.status(404).json({ message: 'Fabric not found' });
      }

      res.status(200).json(fabric);
    } catch (error) {
      console.error('Error in getFabricById:', error);
      res.status(500).json({ 
        message: 'Error fetching fabric',
        error: (error as Error).message 
      });
    }
  },

  // Check fabric availability
  checkAvailability: async (req: Request, res: Response): Promise<void> => {
    try {
      const fabricId = req.query.fabricId as string;
      const quantity = parseInt(req.query.quantity as string);
      console.log(`Checking availability for fabric ID: ${fabricId}, quantity: ${quantity}`);
      
      // First try to find by ObjectId, then by other identifiers
      let fabric: any = null;
      try {
        fabric = await Fabric.findById(fabricId);
      } catch (err) {
        // If error occurred (invalid ObjectId), try to find by other fields
        try {
          fabric = await Fabric.findOne({ $or: [{ id: fabricId }, { code: fabricId }] });
        } catch (mongoError) {
          console.log('MongoDB error, will check sample data:', mongoError);
        }
      }
      
      // If not in database, check sample data
      if (!fabric) {
        console.log('Fabric not found in DB, checking sample data');
        fabric = sampleFabrics.find(f => f.id.toLowerCase() === fabricId.toLowerCase());
        console.log('Sample data search result:', fabric ? `Found: ${fabric.name}` : 'Not found');
        
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
        error: (error as Error).message 
      });
    }
  },

  // Get fabric pricing
  getPricing: async (req: Request, res: Response): Promise<void> => {
    try {
      const fabricId = req.params.id;
      const length = parseFloat(req.query.length as string);
      const quantity = parseInt(req.query.quantity as string);
      console.log(`Getting pricing for fabric ID: ${fabricId}, length: ${length}, quantity: ${quantity}`);
      
      // Get fabric by id, handling both ObjectId and string ids
      let fabric: any = null;
      try {
        fabric = await Fabric.findById(fabricId);
      } catch (err) {
        try {
          fabric = await Fabric.findOne({ $or: [{ id: fabricId }, { code: fabricId }] });
        } catch (mongoError) {
          console.log('MongoDB error, will check sample data:', mongoError);
        }
      }
      
      // If not in database, check sample data
      if (!fabric) {
        console.log('Fabric not found in DB, checking sample data');
        fabric = sampleFabrics.find(f => f.id.toLowerCase() === fabricId.toLowerCase());
        console.log('Sample data search result:', fabric ? `Found: ${fabric.name}` : 'Not found');
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
        error: (error as Error).message 
      });
    }
  },

  // Create order for fabric
  createOrder: async (req: Request, res: Response): Promise<void> => {
    try {
      const { fabricId, quantity, length } = req.body;
      console.log('Creating order for fabric:', fabricId);
      
      // Find fabric, handling both ObjectId and string ids
      let fabric: any = null;
      
      // Handle string IDs by trying both approaches
      try {
        // First try to find by MongoDB ObjectId
        fabric = await Fabric.findById(fabricId);
      } catch (err) {
        console.log('Not a valid ObjectId, trying string ID lookup');
        // If that fails (invalid ObjectId), try by string id
        try {
          fabric = await Fabric.findOne({ $or: [{ id: fabricId }, { code: fabricId }] });
        } catch (mongoError) {
          console.log('MongoDB error, will check sample data:', mongoError);
        }
      }
      
      // If not in database, check sample data - case-insensitive comparison
      if (!fabric) {
        console.log('Fabric not found in database, checking sample data');
        fabric = sampleFabrics.find(f => f.id.toLowerCase() === fabricId.toLowerCase());
        console.log('Sample data search result:', fabric ? `Found: ${fabric.name}` : 'Not found');
      }

      if (!fabric) {
        console.log('Fabric not found:', fabricId);
        console.log('Available fabrics:', sampleFabrics.map(f => f.id));
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
        error: (error as Error).message 
      });
    }
  },

  // Get order details
  getOrder: async (req: Request, res: Response): Promise<void> => {
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
        error: (error as Error).message 
      });
    }
  }
};

export default fabricController;