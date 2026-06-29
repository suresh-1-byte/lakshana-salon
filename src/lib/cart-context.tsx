'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface CartItem {
  name: string;
  category: string;
  member: string;
  duration: string;
}

interface CartContextValue {
  cart:        CartItem[];
  addItem:     (item: CartItem) => void;
  removeItem:  (name: string) => void;
  clearCart:   () => void;
  isInCart:    (name: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setCart((prev) =>
      prev.find((c) => c.name === item.name) ? prev : [...prev, item]
    );
  }, []);

  const removeItem = useCallback((name: string) => {
    setCart((prev) => prev.filter((c) => c.name !== name));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const isInCart = useCallback(
    (name: string) => cart.some((c) => c.name === name),
    [cart]
  );

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
