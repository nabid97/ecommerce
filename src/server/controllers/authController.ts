// src/server/controllers/authController.ts
import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

interface RegisterRequest {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// Register user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: RegisterRequest = req.body;

  try {
    const user = new User({ email, password });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginRequest = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '7d' }
    );
    
    res.status(200).json({ 
      message: 'User logged in successfully',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in user', error });
  }
};