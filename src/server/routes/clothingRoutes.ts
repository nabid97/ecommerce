// src/server/routes/clothingRoutes.ts
import express, { Request, Response, NextFunction, Router } from 'express';
import clothingController from '../controllers/clothingController';
import { upload } from '../middleware/upload';

const router: Router = express.Router();

// Debug middleware for logging requests
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`
    ===== Clothing Route Request =====
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    Path: ${req.originalUrl}
    Body: ${JSON.stringify(req.body)}
    ==============================
  `);
  next();
});

// Get available clothing types
router.get('/types', clothingController.getClothingTypes);

// Generate clothing visualization
router.post('/visualize', clothingController.generateVisualization);

// Create clothing order
router.post('/orders', clothingController.createOrder);

export default router;