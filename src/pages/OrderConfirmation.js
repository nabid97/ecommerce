import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardActions } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get order ID from URL params
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          navigate('/');
          return;
        }

        console.log(`Fetching order details for ID: ${orderId}`);
        
        // Fetch order details from API
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch order details. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Order details fetched:', data);
        
        // Check if we have valid data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid order data received');
        }
        
        setOrderDetails(data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Unable to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, location, navigate]);

  // Explicitly check if we have valid order details data
  const hasValidOrderDetails = orderDetails && 
                              typeof orderDetails === 'object' && 
                              orderDetails.orderId;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // If we don't have valid order details, show fallback content
  if (!hasValidOrderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Alert>
            <AlertDescription>{error || 'Unable to load order details. Please try again later.'}</AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <p className="mb-4">Your order has been processed successfully, but we're having trouble displaying the details.</p>
            <p className="mb-4">Your order ID is: <strong>{orderId}</strong></p>
            <p>Please save this order ID for your reference.</p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstimatedDelivery = () => {
    const orderDate = new Date(orderDetails.orderDate);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 14); // Assuming 14 days delivery time
    return formatDate(deliveryDate);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Order Success Message */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <svg
              className="h-16 w-16 text-green-500 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="mt-2 text-gray-600">
            Thank you for your order. We'll send you shipping confirmation soon.
          </p>
        </div>

        {/* Order Details */}
        <Card variant="bordered" className="mb-6">
          <CardHeader variant="gradient">
            <CardTitle className="text-white">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Order Number</p>
                  <p className="text-gray-600">{orderDetails.orderId}</p>
                </div>
                <div>
                  <p className="font-medium">Order Date</p>
                  <p className="text-gray-600">{formatDate(orderDetails.orderDate)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Items Ordered</h3>
                <div className="space-y-4">
                  {orderDetails.items && orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded mr-4"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          {item.customizations && (
                            <div className="text-sm text-gray-600">
                              {Object.entries(item.customizations || {}).map(([key, value]) => (
                                value && <p key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="font-medium">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${orderDetails.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${orderDetails.shipping?.toFixed(2)}</span>
                  </div>
                  {orderDetails.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${orderDetails.tax?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${orderDetails.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Details */}
        <Card variant="bordered" className="mb-6">
          <CardHeader variant="colored">
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <div className="text-gray-600">
                  <p>{orderDetails.shippingAddress?.name}</p>
                  <p>{orderDetails.shippingAddress?.companyName}</p>
                  <p>{orderDetails.shippingAddress?.address}</p>
                  <p>
                    {orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.state}{' '}
                    {orderDetails.shippingAddress?.zipCode}
                  </p>
                  <p>{orderDetails.shippingAddress?.country}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Estimated Delivery</h3>
                <p className="text-gray-600">{getEstimatedDelivery()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card variant="bordered" className="mb-8">
          <CardHeader variant="primary">
            <CardTitle className="text-white">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center">
                  <div className="flex items-center relative">
                    <div className="rounded-full h-12 w-12 bg-green-500 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">Order Confirmed</h3>
                      <p className="text-sm text-gray-600">{formatDate(orderDetails.orderDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ml-6 border-l-2 border-gray-200 pl-6">
                <div className="relative">
                  <div className="flex items-center">
                    <div className="rounded-full h-12 w-12 bg-blue-500 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">Processing</h3>
                      <p className="text-sm text-gray-600">Your order is being processed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <CardActions align="between">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Print Order Details
          </button>
        </CardActions>
      </div>
    </div>
  );
};

export default OrderConfirmation;