// src/server/routes/authRoutes.ts
import express, { Request, Response } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// POST /register
router.post('/register', registerUser);

// POST /login
router.post('/login', loginUser);

// GET /me - Get current user profile
router.get('/me', requireAuth, (req: Request, res: Response) => {
  // The user is attached to the request by the requireAuth middleware
  // Note: TypeScript requires casting here since we've extended the Request type
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Return user data without sensitive fields
  res.json({
    id: user._id,
    email: user.email
    // Add any other user fields you want to expose
  });
});

// POST /logout
router.post('/logout', (req: Request, res: Response) => {
  // Note: In a stateless JWT-based authentication, server-side logout
  // is mainly symbolic. The client should delete the token.
  res.json({ message: 'Logged out successfully' });
});

export default