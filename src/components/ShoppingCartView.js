import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardActions } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { cardInteractions } from '../components/ui/card/Card.styles';

const ShoppingCartView = () => {
  const navigate = useNavigate();
  const { cart, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const [error, setError] = useState('');

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      // Check if quantity is available
      const response = await fetch(`/api/fabrics/${item.id}/check-availability?quantity=${newQuantity}`);
      const data = await response.json();

      if (!data.available) {
        setError(`Only ${data.remainingQuantity} items available`);
        return;
      }

      updateQuantity(item.id, item.customizations, newQuantity);
      setError('');
    } catch (err) {
      setError('Error updating quantity');
    }
  };

  const calculateSubtotal = (item) => {
    return item.price * item.quantity;
  };

  const calculateShipping = () => {
    // Example shipping calculation
    return total > 1000 ? 0 : 50;
  };

  const calculateTax = () => {
    return total * 0.1; // 10% tax
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      {error && (
        <Alert className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {cart.length === 0 ? (
            <Card variant="bordered">
              <CardHeader variant="transparent">
                <CardTitle>Shopping Cart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
                  <CardActions align="center">
                    <button
                      onClick={() => navigate('/products')}
                      className="text-blue-600 hover:text-blue-700 px-4 py-2 rounded border border-blue-600"
                    >
                      Continue Shopping
                    </button>
                  </CardActions>
                </div>
              </CardContent>
            </Card>
          ) : (
            cart.map((item) => (
              <Card 
                key={`${item.id}-${JSON.stringify(item.customizations)}`} 
                className={`mb-4 ${cardInteractions.hoverable}`}
                variant="flat"
                size="sm"
              >
                <CardContent>
                  <div className="flex items-center">
                    <div className="w-24 h-24">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(item.id, item.customizations)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      {item.customizations && (
                        <div className="text-sm text-gray-600 mt-1">
                          {Object.entries(item.customizations).map(([key, value]) => (
                            <div key={key} className="capitalize">
                              {key}: {value}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center mt-2">
                        <div className="flex border rounded">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            className="px-3 py-1 border-r hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="px-3 py-1 border-l hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="ml-4 font-semibold">
                          ${calculateSubtotal(item).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card variant="bordered" size="md">
            <CardHeader variant="primary">
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>
                      ${(total + calculateShipping() + calculateTax()).toFixed(2)}
                    </span>
                  </div>
                </div>

                <CardActions align="center">
                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout
                  </button>
                </CardActions>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full text-blue-600 hover:text-blue-700 text-center"
                >
                  Continue Shopping
                </button>

                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full text-red-600 hover:text-red-700 text-center mt-4"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartView;