// src/utils/validation.ts
import Joi, { Schema, ValidationError, ValidationOptions } from 'joi';
import { Request, Response, NextFunction } from 'express';

// Define interfaces
export interface ValidationSchemas {
  userRegistration: Schema;
  orderCreation: Schema;
  productCreation: Schema;
  logoGeneration: Schema;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ValidationErrorResponse {
  status: string;
  message: string;
  errors: ValidationErrorDetail[];
}

// Validation middleware function type
type ValidateMiddleware = (req: Request, res: Response, next: NextFunction) => void;

const validationSchemas: ValidationSchemas = {
  // User validation schemas
  userRegistration: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one letter and one number',
        'any.required': 'Password is required'
      }),
    companyName: Joi.string()
      .min(2)
      .required()
      .messages({
        'string.min': 'Company name must be at least 2 characters long',
        'any.required': 'Company name is required'
      }),
    phoneNumber: Joi.string()
      .pattern(/^\+?[\d\s-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone number is required'
      })
  }),

  // Order validation schemas
  orderCreation: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
          customizations: Joi.object().optional()
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Order must contain at least one item',
        'any.required': 'Order items are required'
      }),
    shippingAddress: Joi.object({
      name: Joi.string().required(),
      companyName: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
      phoneNumber: Joi.string().required()
    }).required()
  }),

  // Product validation schemas
  productCreation: Joi.object({
    name: Joi.string()
      .min(2)
      .required(),
    description: Joi.string()
      .min(10)
      .required(),
    price: Joi.number()
      .positive()
      .required(),
    colors: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          code: Joi.string().required()
        })
      )
      .min(1)
      .required(),
    minOrderQuantity: Joi.number()
      .positive()
      .required()
  }),

  // Logo validation schemas
  logoGeneration: Joi.object({
    text: Joi.string()
      .min(1)
      .required(),
    color: Joi.string()
      .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .required(),
    size: Joi.string()
      .valid('small', 'medium', 'large')
      .required(),
    style: Joi.string()
      .valid('modern', 'classic', 'minimalist', 'bold', 'elegant')
      .required()
  })
};

const validate = (schema: Schema): ValidateMiddleware => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const options: ValidationOptions = {
      abortEarly: false,
      stripUnknown: true
    };

    const { error } = schema.validate(req.body, options);

    if (error) {
      const errors: ValidationErrorDetail[] = error.details.map((detail: Joi.ValidationErrorItem) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      const errorResponse: ValidationErrorResponse = {
        status: 'error',
        message: 'Validation failed',
        errors
      };

      return res.status(400).json(errorResponse);
    }

    next();
  };
};

const sanitizeInput = (input: string): string => {
  // Remove any HTML tags
  const sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escape special characters
  return sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export {
  validationSchemas,
  validate,
  sanitizeInput
};