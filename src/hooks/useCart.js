import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem('boardDesignerCart');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('boardDesignerCart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

export const useCart = () => {
  const [cart, setCart] = useState(loadCartFromStorage);

  // Save cart whenever it changes
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  // Listen for storage changes (from other tabs/windows or manual clears)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'boardDesignerCart') {
        const newCart = e.newValue ? JSON.parse(e.newValue) : [];
        setCart(newCart);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add design to cart with UUID
  const addToCart = useCallback((design) => {
    const cartItem = {
      id: uuidv4(),
      ...design,
      addedAt: new Date().toISOString()
    };
    setCart(prevCart => [...prevCart, cartItem]);
    return cartItem;
  }, []);

  // Remove design from cart by ID
  const removeFromCart = useCallback((itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart([]);
    // Dispatch custom event for same-window sync
    window.dispatchEvent(new CustomEvent('cartCleared'));
  }, []);

  // Get cart summary
  const getCartSummary = useCallback(() => {
    return {
      count: cart.length,
      items: cart
    };
  }, [cart]);

  // Export cart as JSON
  const exportCartAsJSON = useCallback(() => {
    const jsonString = JSON.stringify(cart, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cart-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [cart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartSummary,
    exportCartAsJSON
  };
};
