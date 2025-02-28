import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { useCart } from '../contexts/CartContext';

// IMPORTANT: Replace this with your actual publishable key
// Do not use variables, just paste your key directly as a string
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY); // ← Replace with your actual publishable key

// Stripe payment form component
const CheckoutForm = ({ clientSecret, orderData, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: orderData.shippingInfo.name,
            email: orderData.shippingInfo.email,
            address: {
              line1: orderData.shippingInfo.address,
              city: orderData.shippingInfo.city,
              state: orderData.shippingInfo.state,
              postal_code: orderData.shippingInfo.zipCode,
              country: orderData.shippingInfo.country,
            },
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Payment succeeded, call the success callback
        onSuccess(result.paymentIntent);
      }
    } catch (err) {
      setError('An error occurred while processing your payment.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Card Details
        </label>
        <div className="p-3 border rounded bg-white">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>
      
      {error && (
        <Alert className="mb-4" variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </div>
        ) : (
          'Pay Now'
        )}
      </button>
    </form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    companyName: '',
    phoneNumber: ''
  });
  
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [orderData, setOrderData] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate totals from the cart
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    // Free shipping for orders over $500
    return calculateSubtotal() > 500 ? 0 : 25;
  };

  const calculateTax = () => {
    // 8% tax rate
    return calculateSubtotal() * 0.08;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const validateForm = () => {
    // Validate required fields
    const requiredFields = [
      'name', 'email', 'address', 'city', 'state', 
      'zipCode', 'country', 'companyName', 'phoneNumber'
    ];
    
    for (const field of requiredFields) {
      if (!shippingInfo[field]) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    return true;
  };

  const createPaymentIntent = async () => {
    if (!validateForm()) {
      return;
    }
    
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    setPageLoading(true);
    setError('');

    try {
      // Make sure this URL matches your server route - use the full URL to avoid any path issues
      console.log('Creating payment intent for items:', cart);
      
      const response = await fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price, 
            customizations: item.customizations
          })),
          shipping: calculateShipping(),
          tax: calculateTax()
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create payment intent';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Payment intent created successfully:', data);
      setClientSecret(data.clientSecret);
      
      // Store the order data for creating the order after payment
      setOrderData({
        items: cart,
        shippingInfo,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        shipping: calculateShipping(),
        total: calculateTotal()
      });
      
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setPageLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      console.log('Payment successful, creating order...', paymentIntent);
      
      // Create the final order with payment information
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: orderData.items,
          shippingInfo: orderData.shippingInfo,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          shipping: orderData.shipping,
          total: orderData.total,
          paymentDetails: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            method: 'Credit Card',
            last4: paymentIntent.payment_method_details?.card?.last4 || '****'
          }
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order creation response error:', errorData);
        throw new Error(errorData.message || 'Failed to create order');
      }
  
      const orderResponse = await response.json();
      console.log('Order created successfully:', orderResponse);
      
      // Clear the cart
      clearCart();
      
      // Redirect to order confirmation page
      navigate(`/order-confirmation?orderId=${orderResponse.orderId || orderResponse._id || Date.now()}`);
      
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Your payment was successful, but we had trouble creating your order. Please contact support.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              {cart.length === 0 ? (
                <p>Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        {item.customizations && (
                          <div className="text-sm text-gray-600">
                            {Object.entries(item.customizations).map(([key, value]) => (
                              value && <p key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {key === 'length' ? `${value} meters` : value}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="pt-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>Shipping</span>
                      <span>{calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>Tax (8%)</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Shipping & Payment Information */}
        <div className="space-y-6">
          {clientSecret ? (
            /* Show Stripe payment form if we have a client secret */
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    clientSecret={clientSecret} 
                    orderData={orderData}
                    onSuccess={handlePaymentSuccess} 
                  />
                </Elements>
              </CardContent>
            </Card>
          ) : (
            /* Show shipping form initially */
            <>
              <Card>
                <CardContent>
                  <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={shippingInfo.name}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={shippingInfo.companyName}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={shippingInfo.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">State</label>
                        <input
                          type="text"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">ZIP Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={shippingInfo.country}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <button
                onClick={createPaymentIntent}
                disabled={pageLoading || cart.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {pageLoading ? 'Loading...' : 'Proceed to Payment'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;