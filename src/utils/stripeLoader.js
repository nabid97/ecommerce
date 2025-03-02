// Create a separate file: src/utils/stripeLoader.js

/**
 * This file handles the Stripe initialization in a robust way
 * with detailed error checking and fallbacks
 */

import { loadStripe } from '@stripe/stripe-js';

// Debug environment variables to see what's available
console.log('[Stripe Debug] Environment check:', {
  nodeEnv: process.env.NODE_ENV,
  hasReactAppStripeKey: typeof process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY !== 'undefined',
  hasStripeKey: typeof process.env.STRIPE_PUBLISHABLE_KEY !== 'undefined',
});

// Explicitly check each possible source of the key
let stripeKey = null;
let keySource = null;

if (typeof process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY === 'string' && 
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
  stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  keySource = 'REACT_APP_STRIPE_PUBLISHABLE_KEY';
} else if (typeof process.env.STRIPE_PUBLISHABLE_KEY === 'string' && 
          process.env.STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
  stripeKey = process.env.STRIPE_PUBLISHABLE_KEY;
  keySource = 'STRIPE_PUBLISHABLE_KEY';
} else {
  // Hardcoded fallback key - ONLY for development
  console.warn('[Stripe] No environment variable found for Stripe key. Using hardcoded fallback (DEVELOPMENT ONLY)');
  stripeKey = 'pk_test_51Qw9JaJkWEUWirtQuqP7laPdPbHxttgx9pxpdPI2CxazHZHN1026l94PrrXNYFV2SgsCfp87sYfiIBGgFKRa0Prx00JmPOtbra';
  keySource = 'hardcoded fallback';
}

// Verify that the key is valid
if (!stripeKey || typeof stripeKey !== 'string' || !stripeKey.startsWith('pk_')) {
  console.error('[Stripe] Invalid Stripe publishable key:', {
    keySource,
    keyType: typeof stripeKey,
    keyPrefix: stripeKey ? stripeKey.substring(0, 3) : 'null',
    isString: typeof stripeKey === 'string',
    startsWithPk: stripeKey ? stripeKey.startsWith('pk_') : false
  });
  
  // Throw an error in development, but use the fallback in production
  if (process.env.NODE_ENV === 'development') {
    throw new Error('[Stripe] Invalid or missing Stripe publishable key. See console for details.');
  } else {
    // In production, try to use the hardcoded fallback as a last resort
    stripeKey = 'pk_test_51Qw9JaJkWEUWirtQuqP7laPdPbHxttgx9pxpdPI2CxazHZHN1026l94PrrXNYFV2SgsCfp87sYfiIBGgFKRa0Prx00JmPOtbra';
    console.warn('[Stripe] Using emergency fallback key in production. THIS IS NOT RECOMMENDED!');
  }
}

// Safely log a portion of the key for debugging
console.log(`[Stripe] Initializing with key from ${keySource}: ${stripeKey.substring(0, 8)}...`);

// Initialize Stripe only once
let stripePromise;
try {
  stripePromise = loadStripe(stripeKey);
  console.log('[Stripe] Successfully initialized Stripe');
} catch (error) {
  console.error('[Stripe] Failed to initialize Stripe:', error);
  throw new Error(`[Stripe] Failed to initialize: ${error.message}`);
}

export default stripePromise;