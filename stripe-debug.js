// stripe-debug.js
// A simple script to debug Stripe initialization issues

// Load environment variables first
require('dotenv').config();

console.log('\n===== STRIPE DEBUG INFORMATION =====');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('STRIPE_SECRET_KEY present:', process.env.STRIPE_SECRET_KEY ? 'YES' : 'NO');

// Safe way to show part of the key without exposing it fully
if (process.env.STRIPE_SECRET_KEY) {
  const key = process.env.STRIPE_SECRET_KEY;
  const firstChars = key.substring(0, 7);
  const lastChars = key.substring(key.length - 4);
  console.log(`Key format: ${firstChars}...${lastChars} (length: ${key.length})`);
} else {
  console.log('WARNING: STRIPE_SECRET_KEY is not set in environment!');
}

// Fallback key used in server.js
const fallbackKey = 'sk_test_51Qw9JaJkWEUWirtQd3lx62XDRkZOivj3FTdIPOt4OpQ8iBKJoN89HlKsFn5sKsXIxoJCRFym2Ar2qbB36dlwNs7G00DThz6401';
console.log('Fallback key length:', fallbackKey.length);
console.log('First 7 chars of fallback:', fallbackKey.substring(0, 7));

// Try to initialize Stripe with environment variable
try {
  console.log('\nAttempting to initialize Stripe with process.env.STRIPE_SECRET_KEY...');
  const Stripe = require('stripe');
  const stripeWithEnv = Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✓ Success! Stripe initialized with environment variable');
} catch (error) {
  console.error('✗ Failed to initialize with environment variable:', error.message);
}

// Try to initialize with fallback key
try {
  console.log('\nAttempting to initialize Stripe with fallback key...');
  const Stripe = require('stripe');
  const stripeWithFallback = Stripe(fallbackKey);
  console.log('✓ Success! Stripe initialized with fallback key');
} catch (error) {
  console.error('✗ Failed to initialize with fallback key:', error.message);
}

// Check .env file
const fs = require('fs');
try {
  console.log('\nChecking for .env file...');
  if (fs.existsSync('.env')) {
    console.log('✓ .env file exists');
    const envContent = fs.readFileSync('.env', 'utf8');
    const hasStripeKey = envContent.includes('STRIPE_SECRET_KEY');
    console.log(hasStripeKey ? 
      '✓ .env file contains STRIPE_SECRET_KEY' : 
      '✗ .env file does NOT contain STRIPE_SECRET_KEY');
  } else {
    console.log('✗ .env file does NOT exist');
  }
} catch (err) {
  console.error('Error checking .env file:', err.message);
}

console.log('\n===== RECOMMENDATIONS =====');
console.log('1. Create a .env file in your project root with the line:');
console.log('   STRIPE_SECRET_KEY=sk_test_51Qw...');
console.log('2. Make sure dotenv is installed: npm install dotenv --save');
console.log('3. Make sure require("dotenv").config() is called at the top of server.js');
console.log('=========================\n');