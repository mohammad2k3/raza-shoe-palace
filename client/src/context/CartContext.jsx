import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useStoreSettings } from './StoreSettingsContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { settings } = useStoreSettings();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('raza_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('raza_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('raza_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('raza_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('raza_coupon');
    }
  }, [coupon]);

  // Add to cart with variant validation
  const addToCart = (product, size, color, quantity = 1, availableStock = 99) => {
    if (!product || !size || !color) {
      return { success: false, message: 'Please select both a size and color.' };
    }

    const itemKey = `${product._id}-${size}-${color}`;
    const effectivePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.regularPrice;

    let updated = [...cartItems];
    const existingIndex = updated.findIndex((item) => item.key === itemKey);

    if (existingIndex > -1) {
      const newQty = updated[existingIndex].quantity + quantity;
      if (newQty > availableStock) {
        return {
          success: false,
          message: `Cannot add more than available stock (${availableStock} units).`,
        };
      }
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].subtotal = newQty * effectivePrice;
    } else {
      if (quantity > availableStock) {
        return {
          success: false,
          message: `Only ${availableStock} units available for this size/color.`,
        };
      }
      updated.push({
        key: itemKey,
        productId: product._id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        image: product.images?.[0] || '',
        price: effectivePrice,
        regularPrice: product.regularPrice,
        size,
        color,
        quantity,
        maxStock: availableStock,
        subtotal: quantity * effectivePrice,
      });
    }

    setCartItems(updated);
    return { success: true, message: `Added "${product.name}" (${size}, ${color}) to cart.` };
  };

  // Remove from cart
  const removeFromCart = (itemKey) => {
    setCartItems((prev) => prev.filter((item) => item.key !== itemKey));
  };

  // Update quantity
  const updateQuantity = (itemKey, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.key === itemKey) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (item.maxStock && newQty > item.maxStock) return item;
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.price,
            };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Apply discount coupon
  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      setCouponError('Please enter a coupon code.');
      return false;
    }
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await API.post('/coupons/validate', {
        code: code.trim(),
        subtotal,
      });

      if (res.data?.success) {
        setCoupon(res.data.coupon);
        setCouponError('');
        setCouponLoading(false);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      setCoupon(null);
      setCouponError(err.message || 'Invalid coupon.');
      setCouponLoading(false);
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  // Calculations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);

  // Re-calculate coupon discount dynamically against current subtotal
  let discountAmount = 0;
  if (coupon && subtotal > 0) {
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }
  }

  const freeShippingThreshold = settings?.freeShippingThreshold || 1999;
  const standardShippingFee = settings?.shippingFee || 99;

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const isFreeShipping = afterDiscount >= freeShippingThreshold || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : standardShippingFee;
  const totalAmount = subtotal === 0 ? 0 : afterDiscount + shippingFee;

  const freeShippingRemaining = Math.max(0, freeShippingThreshold - afterDiscount);
  const freeShippingProgress = Math.min(100, Math.round((afterDiscount / freeShippingThreshold) * 100));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        coupon,
        couponError,
        couponLoading,
        isFreeShipping,
        freeShippingThreshold,
        freeShippingRemaining,
        freeShippingProgress,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
