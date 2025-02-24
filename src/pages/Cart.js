import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Card, CardContent } from '../components/ui/card/Card';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, total, removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(item.id, item.customizations, newQuantity);
    }
  };

  const handleRemove = (item) => {
    removeFromCart(item.id, item.customizations);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="p-4 text-center" data-testid="empty-cart">
        <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate('/fabric')}
          className="text-blue-600 hover:text-blue-700"
          data-testid="continue-shopping-button"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="cart-container">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.map((item) => (
            <Card 
              key={`${item.id}-${JSON.stringify(item.customizations)}`} 
              className="mb-4"
              data-testid={`cart-item-${item.id}`}
            >
              <CardContent>
                <div className="flex items-center">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                      data-testid={`cart-item-image-${item.id}`}
                    />
                  )}
                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.customizations && (
                      <div className="text-sm text-gray-600 mt-1">
                        {Object.entries(item.customizations).map(([key, value]) => (
                          <div key={key}>
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        className="text-gray-500 hover:text-gray-700"
                        data-testid={`decrease-quantity-${item.id}`}
                      >
                        -
                      </button>
                      <span className="mx-2" data-testid={`item-quantity-${item.id}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className="text-gray-500 hover:text-gray-700"
                        data-testid={`increase-quantity-${item.id}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" data-testid={`item-total-${item.id}`}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-red-600 hover:text-red-700 text-sm mt-2"
                      data-testid={`remove-item-${item.id}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span data-testid="cart-subtotal">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span data-testid="cart-total">${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                  data-testid="checkout-button"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate('/fabric')}
                  className="w-full text-blue-600 hover:text-blue-700"
                  data-testid="continue-shopping-button"
                >
                  Continue Shopping
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;