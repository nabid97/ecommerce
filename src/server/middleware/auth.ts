// src/server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies the JWT token from the request header and attaches the user to the request
 */
const auth = async (req, res, next) => {
  try {
    console.log('Running auth middleware');
    
    // Extract token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'None');
    
    // Extract the token part
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided in request');
      return next(); // Continue without authentication - will result in no req.user
    }
    
    try {
      // Verify the token with JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded.userId);
      
      // Find the user by ID
      const user = await User.findOne({ _id: decoded.userId });
      
      if (!user) {
        console.log('User not found for ID:', decoded.userId);
        return next(); // Continue without user - will result in no req.user
      }
      
      // Attach user and token to request
      req.token = token;
      req.user = user;
      console.log('User attached to request:', user._id.toString());
      
      next();
    } catch (jwtError) {
      // Token verification failed - likely expired or invalid
      console.log('JWT verification failed:', jwtError.message);
      next(); // Continue without user - will result in no req.user
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(); // Continue without user in case of unexpected errors
  }
};

/**
 * Stricter authentication middleware that requires authentication
 * Use this for routes that should only be accessible to authenticated users
 */
const requireAuth = async (req, res, next) => {
  try {
    console.log('Running requireAuth middleware');
    
    // Extract token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('Token from headers:', token ? token.substring(0, 15) + '...' : 'None');
    
    if (!token) {
      console.log('No token provided in request - access denied');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      // Verify the token with JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user by ID
      const user = await User.findOne({ _id: decoded.userId });
      
      if (!user) {
        console.log('User not found for ID:', decoded.userId);
        return res.status(401).json({ message: 'Authentication failed - user not found' });
      }
      
      // Attach user and token to request
      req.token = token;
      req.user = user;
      console.log('User authenticated:', user._id.toString());
      
      next();
    } catch (jwtError) {
      // Token verification failed
      console.log('JWT verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Authentication failed - invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Admin authentication middleware
 * Verifies the user is authenticated and has admin privileges
 */
const adminAuth = async (req, res, next) => {
  try {
    // First verify that the user is authenticated
    await requireAuth(req, res, () => {
      // Check if the user is an admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      // User is authenticated and is an admin
      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

module.exports = { auth, requireAuth, adminAuth };