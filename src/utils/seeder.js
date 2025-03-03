// /home/nabz/Projects/ecommerce/src/utils/seeder.js
const mongoose = require('mongoose');
const Fabric = require('../server/models/Fabric');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/fabricstore';
    console.log('Attempting to connect to MongoDB at:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Sample fabric data to seed the database
const fabricData = [
  {
    id: 'cotton',
    name: 'Cotton',
    description: 'Soft, breathable natural fabric that is comfortable and versatile.',
    type: 'cotton',
    colors: [
      { name: 'White', code: '#FFFFFF', inStock: true },
      { name: 'Black', code: '#000000', inStock: true },
      { name: 'Navy', code: '#000080', inStock: true },
      { name: 'Grey', code: '#808080', inStock: true }
    ],
    price: 5.99,
    minOrderQuantity: 50,
    availableStyles: [
      { name: 'Plain', description: 'Simple flat weave', additionalCost: 0 },
      { name: 'Twill', description: 'Diagonal ribbed texture', additionalCost: 0.5 },
      { name: 'Jersey', description: 'Stretchy knit fabric', additionalCost: 0.75 }
    ],
    images: [
      { url: '/fabric-images/Cotton.jpg', alt: 'Cotton fabric', isPrimary: true }
    ],
    specifications: {
      weight: 'Medium',
      width: '60 inches',
      composition: '100% Cotton',
      careInstructions: ['Machine wash cold', 'Tumble dry low']
    },
    stock: {
      available: 1000,
      reserved: 0,
      reorderPoint: 200
    },
    status: 'active',
    metadata: {
      searchTags: ['natural', 'breathable', 'soft', 'eco-friendly'],
      categories: ['apparel', 'home decor']
    }
  },
  {
    id: 'polyester',
    name: 'Polyester',
    description: 'Durable synthetic fabric with excellent color retention.',
    type: 'polyester',
    colors: [
      { name: 'White', code: '#FFFFFF', inStock: true },
      { name: 'Black', code: '#000000', inStock: true },
      { name: 'Red', code: '#FF0000', inStock: true },
      { name: 'Blue', code: '#0000FF', inStock: true }
    ],
    price: 4.99,
    minOrderQuantity: 100,
    availableStyles: [
      { name: 'Plain', description: 'Simple flat weave', additionalCost: 0 },
      { name: 'Satin', description: 'Glossy finish with smooth surface', additionalCost: 1.5 },
      { name: 'Textured', description: 'Fabric with raised patterns', additionalCost: 1 }
    ],
    images: [
      { url: '/fabric-images/Polyester.jpg', alt: 'Polyester fabric', isPrimary: true }
    ],
    specifications: {
      weight: 'Light to medium',
      width: '58 inches',
      composition: '100% Polyester',
      careInstructions: ['Machine wash warm', 'Tumble dry medium']
    },
    stock: {
      available: 1500,
      reserved: 0,
      reorderPoint: 300
    },
    status: 'active',
    metadata: {
      searchTags: ['synthetic', 'durable', 'wrinkle-resistant'],
      categories: ['sportswear', 'outdoor', 'uniforms']
    }
  },
  {
    id: 'linen',
    name: 'Linen',
    description: 'Light, natural fabric with excellent breathability.',
    type: 'linen',
    colors: [
      { name: 'White', code: '#FFFFFF', inStock: true },
      { name: 'Beige', code: '#F5F5DC', inStock: true },
      { name: 'Grey', code: '#808080', inStock: true }
    ],
    price: 8.99,
    minOrderQuantity: 30,
    availableStyles: [
      { name: 'Plain', description: 'Simple flat weave', additionalCost: 0 },
      { name: 'Textured', description: 'Fabric with natural texture', additionalCost: 0.5 }
    ],
    images: [
      { url: '/fabric-images/Linen.jpg', alt: 'Linen fabric', isPrimary: true }
    ],
    specifications: {
      weight: 'Light to medium',
      width: '54 inches',
      composition: '100% Linen',
      careInstructions: ['Hand wash cold', 'Lay flat to dry', 'Iron on medium heat']
    },
    stock: {
      available: 800,
      reserved: 0,
      reorderPoint: 150
    },
    status: 'active',
    metadata: {
      searchTags: ['natural', 'breathable', 'summer', 'eco-friendly'],
      categories: ['summer wear', 'home decor', 'luxury']
    }
  },
  {
    id: 'silk',
    name: 'Silk',
    description: 'Luxurious, smooth natural fabric with a beautiful drape.',
    type: 'silk',
    colors: [
      { name: 'White', code: '#FFFFFF', inStock: true },
      { name: 'Cream', code: '#FFF8DC', inStock: true },
      { name: 'Black', code: '#000000', inStock: true },
      { name: 'Red', code: '#B22222', inStock: true }
    ],
    price: 15.99,
    minOrderQuantity: 20,
    availableStyles: [
      { name: 'Charmeuse', description: 'Satin-weave silk with lustrous front', additionalCost: 0 },
      { name: 'Chiffon', description: 'Lightweight, sheer silk', additionalCost: 1 },
      { name: 'Crepe', description: 'Textured silk with matte finish', additionalCost: 1.5 }
    ],
    images: [
      { url: '/fabric-images/Silk.jpg', alt: 'Silk fabric', isPrimary: true }
    ],
    specifications: {
      weight: 'Light',
      width: '45 inches',
      composition: '100% Silk',
      careInstructions: ['Dry clean only', 'Iron on low heat']
    },
    stock: {
      available: 500,
      reserved: 0,
      reorderPoint: 100
    },
    status: 'active',
    metadata: {
      searchTags: ['luxury', 'natural', 'smooth', 'premium'],
      categories: ['evening wear', 'high fashion', 'bridal']
    }
  },
  {
    id: 'wool',
    name: 'Wool',
    description: 'Warm, insulating natural fabric with excellent drape.',
    type: 'wool',
    colors: [
      { name: 'Grey', code: '#808080', inStock: true },
      { name: 'Brown', code: '#8B4513', inStock: true },
      { name: 'Navy', code: '#000080', inStock: true },
      { name: 'Charcoal', code: '#36454F', inStock: true }
    ],
    price: 12.99,
    minOrderQuantity: 25,
    availableStyles: [
      { name: 'Plain', description: 'Simple weave wool', additionalCost: 0 },
      { name: 'Tweed', description: 'Textured wool with flecks of color', additionalCost: 1.5 },
      { name: 'Flannel', description: 'Soft brushed wool', additionalCost: 1 },
      { name: 'Melton', description: 'Dense felted wool', additionalCost: 2 }
    ],
    images: [
      { url: '/fabric-images/Wool.jpg', alt: 'Wool fabric', isPrimary: true }
    ],
    specifications: {
      weight: 'Medium to heavy',
      width: '58 inches',
      composition: '100% Wool',
      careInstructions: ['Dry clean only', 'Store with cedar blocks']
    },
    stock: {
      available: 700,
      reserved: 0,
      reorderPoint: 150
    },
    status: 'active',
    metadata: {
      searchTags: ['natural', 'warm', 'winter', 'premium'],
      categories: ['winter wear', 'suiting', 'outerwear']
    }
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Fabric.deleteMany({});
    console.log('Previous fabric data cleared');
    
    // Insert new data
    await Fabric.insertMany(fabricData);
    console.log(`Successfully seeded database with ${fabricData.length} fabric items`);
    
    // Success
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    if (error.code === 11000) {
      console.error('Duplicate key error - check for duplicate IDs in the seed data');
    }
    process.exit(1);
  }
};

// Function to just view current data without modifying
const viewCurrentData = async () => {
  try {
    await connectDB();
    
    const fabrics = await Fabric.find({});
    console.log(`Current fabric count: ${fabrics.length}`);
    
    if (fabrics.length > 0) {
      console.log('Sample fabric:', JSON.stringify(fabrics[0], null, 2).substring(0, 300) + '...');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error viewing data:', error.message);
    process.exit(1);
  }
};

// Determine what action to take based on command line args
const action = process.argv[2];

if (action === 'view') {
  viewCurrentData();
} else {
  // Default action is to seed the database
  seedDatabase();
}