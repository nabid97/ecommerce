// src/server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');

// Create a payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { items, shipping, tax } = req.body;
    
    // Calculate the order amount
    const calculateOrderAmount = () => {
      // Calculate subtotal from items
      const subtotal = items.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );
      
      // Add shipping and tax
      return Math.round((subtotal + shipping + tax) * 100); // Convert to cents for Stripe
    };

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(),
      currency: 'usd',
      // Verify your integration by passing this parameter in the metadata
      metadata: { integration_check: 'stripe_payment' },
      // Set automatic payment methods to streamline checkout
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Send the client secret to the client
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook to handle Stripe events (payment succeeded, failed, etc.)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      // Update your order status in the database
      // await updateOrderStatus(paymentIntent.metadata.orderId, 'paid');
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      // Update your order status in the database
      // await updateOrderStatus(failedPayment.metadata.orderId, 'payment_failed');
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

module.exports = router;