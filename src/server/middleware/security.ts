// src/server/middleware/security.ts
import { Request, Response, NextFunction, Application } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss-clean';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import Joi from 'joi';
import express from 'express';

// Type definitions
interface ErrorResponse {
  status: string;
  message: string;
  errors?: string[];
}

interface ValidationSchema {
  login: Joi.ObjectSchema;
  register: Joi.ObjectSchema;
  order: Joi.ObjectSchema;
  [key: string]: Joi.ObjectSchema;
}

interface CorsOptions {
  origin: string | string[];
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

// Rate limiting
const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// API specific limiter
const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many API requests from this IP, please try again later.'
});

// CORS options
const corsOptions: CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);

  const errorResponse: ErrorResponse = {
    status: 'error',
    message: 'Internal server error'
  };

  if (err.name === 'ValidationError' && 'errors' in err) {
    errorResponse.status = 'error';
    errorResponse.message = 'Validation Error';
    errorResponse.errors = Object.values((err as any).errors).map((e: any) => e.message);
    res.status(400).json(errorResponse);
    return;
  }

  if (err.name === 'UnauthorizedError') {
    errorResponse.status = 'error';
    errorResponse.message = 'Unauthorized access';
    res.status(401).json(errorResponse);
    return;
  }

  // Default error
  res.status((err as any).status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
};

// Request validation middleware
const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }
    next();
  };
};

// Apply security middleware
const applySecurityMiddleware = (app: Application): void => {
  // Basic security headers
  app.use(helmet());

  // CORS
  app.use(cors(corsOptions));

  // Rate limiting
  app.use('/api/', apiLimiter);
  app.use(limiter);

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp());

  // Body parser with size limits
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Error handling
  app.use(errorHandler);

  // Add security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Timeout middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(30000); // 30 seconds timeout
    next();
  });
};

// Input validation schemas
const schemas: ValidationSchema = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    companyName: Joi.string().required(),
    phoneNumber: Joi.string().required()
  }),
  order: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        customizations: Joi.object()
      })
    ).required(),
    shippingAddress: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required()
    }).required()
  })
};

export {
  applySecurityMiddleware,
  validateRequest,
  schemas,
  errorHandler,
  corsOptions
};