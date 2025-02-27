// src/server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// In-memory order storage for demo purposes
// In a real app, this would be stored in a database
const orderStorage = {};

// Debugging middleware
router.use((req, res, next) => {
  console.log(`
    ===== Order Route Hit =====
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    Path: ${req.path}
    Body: ${JSON.stringify(req.body)}
  `);
  next();
});

// Create new order
router.post('/', async (req, res) => {
  try {
    console.log('Creating new order with data:', req.body);
    
    // Extract data from the request
    const { items, shippingInfo, subtotal, tax, shipping, total, paymentDetails } = req.body;
    
    // Create order ID
    const orderId = `ORD-${Date.now()}`;
    
    // Store order in our in-memory storage
    orderStorage[orderId] = {
      orderId,
      orderDate: new Date().toISOString(),
      items,
      shippingAddress: shippingInfo, // Save the actual shipping info from checkout
      subtotal,
      tax,
      shipping,
      total,
      status: 'processing',
      paymentStatus: 'paid',
      paymentDetails
    };
    
    console.log('Order saved to storage:', orderStorage[orderId]);
    
    // Send success response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      ...orderStorage[orderId]
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create order',
      error: error.message 
    });
  }
});

// Get specific order
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log(`Fetching order details for ID: ${orderId}`);
    
    // Check if order exists in our storage
    if (orderStorage[orderId]) {
      console.log('Found order in storage:', orderStorage[orderId]);
      return res.status(200).json(orderStorage[orderId]);
    }
    
    // If order not found in storage, return a mock order (only as fallback)
    console.log('Order not found in storage, returning mock data');
    const mockOrder = {
      orderId: orderId,
      orderDate: new Date().toISOString(),
      items: [
        {
          id: '1',
          name: 'Cotton Fabric',
          price: 5.99,
          quantity: 2,
          image: '/api/placeholder/100/100',
          customizations: {
            color: 'white',
            length: 2
          }
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        companyName: 'Acme Inc',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      },
      subtotal: 11.98,
      tax: 0.96,
      shipping: 5.00,
      total: 17.94,
      status: 'processing'
    };
    
    res.status(200).json(mockOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order',
      error: error.message 
    });
  }
});

// List all stored orders (for debugging)
router.get('/', async (req, res) => {
  try {
    const orderIds = Object.keys(orderStorage);
    res.status(200).json({ 
      count: orderIds.length,
      orderIds 
    });
  } catch (error) {
    console.error('Error listing orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to list orders',
      error: error.message 
    });
  }
});

module.exports = router;