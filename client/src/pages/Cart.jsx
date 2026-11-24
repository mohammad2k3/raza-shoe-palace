import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Tag,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
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
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput);
    if (res?.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
      setTimeout(() => setCouponSuccess(''), 4000);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-luxury-ivory rounded-full flex items-center justify-center mx-auto mb-4 border border-luxury-gray">
          <ShoppingBag className="w-8 h-8 text-luxury-gold" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-luxury-black mb-3">
          Your Shopping Bag Is Empty
        </h1>
        <p className="text-xs sm:text-sm text-luxury-muted max-w-md mx-auto mb-8">
          Explore our handcrafted footwear collections and experience sovereign comfort and timeless style.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 px-8 py-4 bg-luxury-black text-white text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold hover:text-luxury-black transition-colors"
        >
          <span>Explore Footwear</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Review Selection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black">
          Shopping Bag ({cartItems.reduce((a, b) => a + b.quantity, 0)})
        </h1>
      </div>

      {/* Free Shipping Progress Notification */}
      <div className="bg-luxury-ivory p-4 border border-luxury-gray mb-8">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
          <span className="flex items-center space-x-1.5 text-luxury-black">
            <Sparkles className="w-4 h-4 text-luxury-gold" />
            <span>
              {isFreeShipping
                ? '✨ You have unlocked Complimentary Express Shipping!'
                : `Add ${formatCurrency(freeShippingRemaining)} more for Complimentary Shipping`}
            </span>
          </span>
          <span className="text-luxury-muted">{freeShippingProgress}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-luxury-gold transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Cart Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-luxury-gray divide-y divide-luxury-gray">
            {cartItems.map((item) => (
              <div key={item.key} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-24 bg-luxury-ivory border border-luxury-gray shrink-0 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-ultra text-luxury-muted font-bold block">
                      {item.brand}
                    </span>
                    <Link
                      to={`/product/${item.slug}`}
                      className="font-serif text-sm sm:text-base font-bold text-luxury-black hover:text-luxury-gold transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center space-x-3 text-xs text-luxury-muted mt-1">
                      <span>Size: <strong className="text-luxury-black">{item.size}</strong></span>
                      <span>·</span>
                      <span>Color: <strong className="text-luxury-black">{item.color}</strong></span>
                    </div>
                    <div className="text-xs font-bold text-luxury-black font-sans mt-1.5">
                      {formatCurrency(item.price)} each
                    </div>
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8 pt-2 sm:pt-0 border-t sm:border-0 border-luxury-gray/50">
                  <div className="flex items-center border border-luxury-gray">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, -1)}
                      className="px-2.5 py-1 text-sm font-bold hover:bg-luxury-ivory"
                    >
                      -
                    </button>
                    <span className="px-3.5 py-1 text-xs font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, 1)}
                      className="px-2.5 py-1 text-sm font-bold hover:bg-luxury-ivory"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-luxury-black font-sans block">
                      {formatCurrency(item.subtotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.key)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center space-x-1 mt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/shop"
              className="text-xs font-bold uppercase tracking-wider text-luxury-black hover:text-luxury-gold transition-colors"
            >
              ← Continue Footwear Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary & Coupon */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="bg-white p-6 border border-luxury-gray space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-luxury-black">
              <Tag className="w-4 h-4 text-luxury-gold" />
              <span>Promotional Privilege Coupon</span>
            </div>

            {coupon ? (
              <div className="p-3 bg-luxury-ivory border border-luxury-gold/50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-luxury-black tracking-wider uppercase block">
                    {coupon.code} Applied
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Saving {formatCurrency(discountAmount)} on this order
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="e.g. RAZAWELCOME"
                  className="flex-1 p-2 text-xs uppercase border border-luxury-gray focus:outline-none focus:border-luxury-gold"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-4 py-2 bg-luxury-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors disabled:opacity-50"
                >
                  {couponLoading ? 'Checking...' : 'Apply'}
                </button>
              </form>
            )}

            {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-[11px] text-emerald-700 font-medium">{couponSuccess}</p>}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white p-6 border border-luxury-gray space-y-4">
            <h3 className="font-serif text-lg font-bold text-luxury-black pb-3 border-b border-luxury-gray">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-luxury-black font-sans">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Privilege</span>
                  <span className="font-sans">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Express Shipping</span>
                <span className="font-sans font-bold text-luxury-black">
                  {isFreeShipping ? 'COMPLIMENTARY' : formatCurrency(shippingFee)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-luxury-gray flex justify-between items-baseline">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-luxury-black block">
                  Total Payable Amount
                </span>
                <span className="text-[10px] text-luxury-muted">Includes all taxes and levies</span>
              </div>
              <span className="text-xl font-bold text-luxury-black font-sans">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-luxury-gold text-luxury-black text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold-light hover:shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed To Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
