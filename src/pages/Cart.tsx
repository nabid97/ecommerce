// src/pages/Cart.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Card, CardHeader, CardTitle, CardContent, CardActions, CardFooter } from '../components/ui/card/Card';
import { cardInteractions } from '../components/ui/card/Card.styles';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, total, removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = (item: any, newQuantity: number): void => {
    if (newQuantity >= 1) {
      updateQuantity(item.id, item.customizations, newQuantity);
    }
  };

  const handleRemove = (item: any): void => {
    removeFromCart(item.id, item.customizations);
  };

  const handleCheckout = (): void => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="p-4 text-center" data-testid="empty-cart">
        <Card variant="bordered" size="md">
          <CardHeader variant="colored">
            <CardTitle>Shopping Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8">
              <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
              <CardActions align="center">
                <button
                  onClick={() => navigate('/fabric')}
                  className="text-blue-600 hover:text-blue-700 px-4 py-2 border border-blue-600 rounded"
                  data-testid="continue-shopping-button"
                >
                  Continue Shopping
                </button>
              </CardActions>
            </div>
          </CardContent>
        </Card>
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
              data-testid={`cart-item-${item.id}`}
              variant="flat"
              size="sm"
              className={`mb-4 ${cardInteractions.hoverable}`}
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
                            {key}: {String(value)}
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
          <Card variant="bordered" size="md">
            <CardHeader variant="primary">
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
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
                <CardActions align="center">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    data-testid="checkout-button"
                  >
                    Proceed to Checkout
                  </button>
                </CardActions>
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