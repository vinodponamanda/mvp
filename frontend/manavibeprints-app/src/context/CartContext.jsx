import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('mvp_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to parse cart items from localStorage:', e);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('mvp_delivery_info');
      return saved ? JSON.parse(saved) : { fee: 0, distanceKm: 0, address: '', gpsLat: null, gpsLng: null, isEligible: true };
    } catch (e) {
      return { fee: 0, distanceKm: 0, address: '', gpsLat: null, gpsLng: null, isEligible: true };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mvp_cart_items', JSON.stringify(items));
    } catch (err) {
      console.warn('LocalStorage quota limit reached, saving sanitized lightweight cart:', err);
      try {
        const lightweight = items.map(item => ({
          ...item,
          previewMockupUrl: (item.previewMockupUrl && item.previewMockupUrl.length > 50000) ? '' : item.previewMockupUrl,
          customizations: item.customizations?.map(c => ({
            ...c,
            compositeMockupUrl: (c.compositeMockupUrl && c.compositeMockupUrl.length > 50000) ? '' : c.compositeMockupUrl,
            designJson: ''
          }))
        }));
        localStorage.setItem('mvp_cart_items', JSON.stringify(lightweight));
      } catch (err2) {
        console.warn('Cannot persist cart to localStorage, in-memory state active:', err2);
      }
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('mvp_delivery_info', JSON.stringify(deliveryInfo));
    } catch (err) {
      console.warn('Failed to save delivery info to localStorage:', err);
    }
  }, [deliveryInfo]);

  // Add customized item to cart
  const addItem = (cartItem) => {
    // Generate unique internal cart ID
    const itemWithId = {
      ...cartItem,
      cartItemId: `${cartItem.productId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    setItems((prev) => [...prev, itemWithId]);
    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          // Re-calculate unit price based on volume tiers if available
          let unitPrice = item.unitPrice;
          if (item.volumeTiers && item.volumeTiers.length > 0) {
            const matchedTier = item.volumeTiers.find(
              (t) => newQty >= t.minQuantity && (!t.maxQuantity || newQty <= t.maxQuantity)
            );
            if (matchedTier) {
              unitPrice = matchedTier.unitPrice + (item.fabricAdjustment || 0) + (item.sizeAdjustment || 0) + (item.extraSidesCost || 0);
            }
          }
          return {
            ...item,
            quantity: newQty,
            unitPrice,
            totalPrice: unitPrice * newQty
          };
        }
        return item;
      })
    );
  };

  const removeItem = (cartItemId) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const finalTotal = subtotal + (deliveryInfo?.fee || 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        totalItemsCount,
        finalTotal,
        deliveryInfo,
        setDeliveryInfo,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
