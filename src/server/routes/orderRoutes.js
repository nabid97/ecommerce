// src/server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

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
    
    // In a real application, you would save this to your database
    // For now, we'll just mock a successful response
    
    // Extract data from the request
    const { items, shippingInfo, subtotal, tax, shipping, total, paymentDetails } = req.body;
    
    // Create mock order ID
    const orderId = `ORD-${Date.now()}`;
    
    // Send success response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId,
      orderDate: new Date().toISOString(),
      items,
      shippingAddress: shippingInfo,
      subtotal,
      tax,
      shipping,
      total,
      status: 'processing',
      paymentStatus: 'paid',
      paymentDetails
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
    // Mock order data
    const order = {
      orderId: req.params.id,
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
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order',
      error: error.message 
    });
  }
});

module.exports = router;