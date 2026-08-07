import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantityMeters?: number, selectedColor?: string) => void;
  reorderItems: (items: { productId: string; quantityMeters: number; selectedColor: string; productName?: string }[]) => Promise<void>;
  updateQuantity: (itemId: string, quantityMeters: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalItemsCount: number;
  toastMessage: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Sync with backend API
    fetch('/api/cart')
      .then((res) => res.json())
      .then((data) => {
        if (data.items) setCart(data.items);
      })
      .catch((err) => console.error('Error fetching cart:', err));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = async (product: Product, quantityMeters?: number, selectedColor?: string) => {
    if (!user) {
      showToast('Please sign in first to add products to your cart.');
      window.dispatchEvent(new CustomEvent('require-auth'));
      return;
    }

    const qty = quantityMeters || product.moq || 50;
    const color = selectedColor || product.colors[0]?.name || 'Natural';

    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantityMeters: qty,
          selectedColor: color,
        }),
      });
      const data = await res.json();
      if (data.items) {
        setCart(data.items);
        showToast(`Added ${qty}m of ${product.name} to cart!`);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const reorderItems = async (items: { productId: string; quantityMeters: number; selectedColor: string; productName?: string }[]) => {
    if (!user) {
      showToast('Please sign in first to add products to your cart.');
      window.dispatchEvent(new CustomEvent('require-auth'));
      return;
    }

    try {
      let lastItems = cart;
      for (const item of items) {
        const res = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            quantityMeters: item.quantityMeters,
            selectedColor: item.selectedColor,
          }),
        });
        const data = await res.json();
        if (data.items) {
          lastItems = data.items;
        }
      }
      setCart(lastItems);
      setIsCartOpen(true);
      showToast(`Reordered ${items.length} item(s) to cart for rapid re-procurement!`);
    } catch (err) {
      console.error('Error reordering items:', err);
    }
  };

  const updateQuantity = async (itemId: string, quantityMeters: number) => {
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantityMeters }),
      });
      const data = await res.json();
      if (data.items) setCart(data.items);
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.items) setCart(data.items);
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantityMeters, 0);
  const totalItemsCount = cart.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        reorderItems,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        totalItemsCount,
        toastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
