// src/server/routes/fabricRoutes.ts
import express, { Request, Response, NextFunction, Router } from 'express';
import fabricController from '../controllers/fabricController';

const router: Router = express.Router();

// Debug middleware to log all requests
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`
    ===== Fabric Route Hit =====
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    Path: ${req.originalUrl}
    Query: ${JSON.stringify(req.query)}
    Body: ${JSON.stringify(req.body)}
    ==========================
  `);
  next();
});

// IMPORTANT: Fixed the route order so the specific routes come before the more generic ones
// Express matches routes in the order they are defined!

// GET availability check - must come before /:id to avoid being caught by that route
router.get('/check-availability', (req: Request, res: Response) => {
  console.log('Handling availability check request');
  fabricController.checkAvailability(req, res);
});

// POST create order - must come before /:id to avoid being caught by that route
router.post('/orders', (req: Request, res: Response) => {
  console.log('Handling create order request');
  fabricController.createOrder(req, res);
});

// GET order details - must come before /:id to avoid being caught by that route
router.get('/orders/:id', (req: Request, res: Response) => {
  console.log(`Handling GET request for order ID: ${req.params.id}`);
  fabricController.getOrder(req, res);
});

// GET all fabrics
router.get('/', (req: Request, res: Response) => {
  console.log('Handling GET request for all fabrics');
  fabricController.getAllFabrics(req, res);
});

// GET pricing for a fabric
router.get('/:id/pricing', (req: Request, res: Response) => {
  console.log(`Handling pricing request for fabric ID: ${req.params.id}`);
  fabricController.getPricing(req, res);
});

// GET single fabric by ID - this should be last since it's the most generic
router.get('/:id', (req: Request, res: Response) => {
  console.log(`Handling GET request for fabric ID: ${req.params.id}`);
  fabricController.getFabricById(req, res);
});

// Error handling middleware
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Fabric Route Error:', err);
  res.status(500).json({
    message: 'An error occurred in the fabric route',
    error: err.message,
    path: req.originalUrl
  });
});

export default router;