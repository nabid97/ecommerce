// src/server/routes/paymentRoutes.ts
import express, { Request, Response, Router, NextFunction, json, raw } from 'express';
import Stripe from 'stripe';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15', // Specify the API version
});

// Create a payment intent
router.post('/create-payment-intent', auth, async (req: Request, res: Response) => {
  try {
    const { items, shipping, tax } = req.body;
    
    // Calculate the order amount
    const calculateOrderAmount = (): number => {
      // Calculate subtotal from items
      const subtotal = items.reduce(
        (sum: number, item: any) => sum + (item.price * item.quantity),
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
    res.status(500).json({ error: (error as Error).message });
  }
});

// Webhook to handle Stripe events (payment succeeded, failed, etc.)
router.post('/webhook', raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', (err as Error).message);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      // Update your order status in the database
      // await updateOrderStatus(paymentIntent.metadata.orderId, 'paid');
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
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

export default router;