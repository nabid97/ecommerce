import React, { createContext, useContext, useState, useEffect, FC } from 'react';
import { CartContextProps, ChildrenProps } from '../types/components';
import { CartItem } from '../types/models';

const CartContext = createContext<CartContextProps | null>(null);

export const CartProvider: FC<ChildrenProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [total, setTotal] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    calculateTotals();
  }, [cart]);

  const calculateTotals = (): void => {
    const totals = cart.reduce(
      (acc, item) => {
        // For fabric items, we use the price directly as it already includes length and quantity
        const itemTotal = item.price * item.quantity;
        acc.total += itemTotal;
        acc.itemCount += item.quantity;
        return acc;
      },
      { total: 0, itemCount: 0 }
    );
  
    setTotal(totals.total);
    setItemCount(totals.itemCount);
  };

  const addToCart = (item: CartItem): void => {
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

  const removeFromCart = (itemId: string, customizations?: Record<string, any>): void => {
    setCart(prevCart => 
      prevCart.filter(item => 
        !(item.id === itemId && 
          JSON.stringify(item.customizations) === JSON.stringify(customizations))
      )
    );
  };

  const updateQuantity = (itemId: string, customizations: Record<string, any> | undefined, quantity: number): void => {
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

  const clearCart = (): void => {
    setCart([]);
  };

  const isInCart = (itemId: string, customizations?: Record<string, any>): boolean => {
    return cart.some(item => 
      item.id === itemId && 
      JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );
  };

  const getItemQuantity = (itemId: string, customizations?: Record<string, any>): number => {
    const item = cart.find(item => 
      item.id === itemId && 
      JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );
    return item ? item.quantity : 0;
  };

  const value: CartContextProps = {
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

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;