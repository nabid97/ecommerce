import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    calculateTotals();
  }, [cart]);

  const calculateTotals = () => {
    const totals = cart.reduce(
      (acc, item) => {
        acc.total += item.price * item.quantity;
        acc.itemCount += item.quantity;
        return acc;
      },
      { total: 0, itemCount: 0 }
    );

    setTotal(totals.total);
    setItemCount(totals.itemCount);
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        cartItem => cartItem.id === item.id && 
        JSON.stringify(cartItem.customizations) === JSON.stringify(item.customizations)
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return updatedCart;
      }

      return [...prevCart, item];
    });
  };

  const removeFromCart = (itemId, customizations) => {
    setCart(prevCart => 
      prevCart.filter(item => 
        !(item.id === itemId && 
          JSON.stringify(item.customizations) === JSON.stringify(customizations))
      )
    );
  };

  const updateQuantity = (itemId, customizations, quantity) => {
    if (quantity < 1) return;

    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId && 
            JSON.stringify(item.customizations) === JSON.stringify(customizations)) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (itemId, customizations) => {
    return cart.some(item => 
      item.id === itemId && 
      JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );
  };

  const getItemQuantity = (itemId, customizations) => {
    const item = cart.find(item => 
      item.id === itemId && 
      JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );
    return item ? item.quantity : 0;
  };

  const value = {
    cart,
    total,
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;