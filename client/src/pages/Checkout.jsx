import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import API from '../services/api';
import { formatCurrency } from '../utils/format';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, discountAmount, shippingFee, totalAmount, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useStoreSettings();

  // Redirect if cart empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'Razorpay'
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill from saved addresses if available
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setShippingAddress({
        name: defaultAddr.name || user.name,
        phone: defaultAddr.phone || user.phone,
        street: defaultAddr.street || '',
        city: defaultAddr.city || '',
        state: defaultAddr.state || '',
        pincode: defaultAddr.pincode || '',
        landmark: defaultAddr.landmark || '',
      });
    }
  }, [user]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // 1. Create order on backend with inventory verification
      const orderPayload = {
        customerInfo,
        shippingAddress,
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        paymentMethod,
        couponCode: coupon?.code || '',
        notes,
      };

      const res = await API.post('/orders', orderPayload);
      const createdOrder = res.data?.order;

      if (!createdOrder) {
        throw new Error('Failed to generate order.');
      }

      // If COD, order is placed immediately!
      if (paymentMethod === 'COD') {
        clearCart();
        navigate(`/order-success/${createdOrder.orderNumber}`);
        return;
      }

      // If Razorpay, initiate online test payment
      if (paymentMethod === 'Razorpay') {
        try {
          const rzpRes = await API.post(`/orders/${createdOrder._id}/razorpay-order`);
          const { razorpayOrder, keyId } = rzpRes.data;

          if (!window.Razorpay) {
            alert('Razorpay SDK failed to load. Please verify your internet connection or use Cash on Delivery.');
            clearCart();
            navigate(`/order-success/${createdOrder.orderNumber}`);
            return;
          }

          const rzpOptions = {
            key: keyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: settings.storeName || 'RAZA SHOE PALACE',
            description: `Order ${createdOrder.orderNumber} - Footwear Retail`,
            order_id: razorpayOrder.id,
            prefill: {
              name: customerInfo.name,
              email: customerInfo.email,
              contact: customerInfo.phone,
            },
            theme: {
              color: '#151515',
            },
            handler: async function (response) {
              try {
                // Verify signature on backend
                const verifyRes = await API.post(`/orders/${createdOrder._id}/verify-payment`, {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });

                if (verifyRes.data?.success) {
                  clearCart();
                  navigate(`/order-success/${createdOrder.orderNumber}`);
                }
              } catch (verifyErr) {
                alert('Payment verification failed on server: ' + verifyErr.message);
                navigate(`/order-track?orderNumber=${createdOrder.orderNumber}`);
              }
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
                alert('Payment window dismissed. Your order remains pending in your account.');
                clearCart();
                navigate(`/order-track?orderNumber=${createdOrder.orderNumber}`);
              },
            },
          };

          const razorpayPayment = new window.Razorpay(rzpOptions);
          razorpayPayment.open();
        } catch (rzpErr) {
          // If Razorpay not configured, clearly notify and allow COD fallback
          console.warn('Razorpay initiation error:', rzpErr.message);
          setErrorMessage(
            rzpErr.message ||
              'Razorpay gateway is not configured with live test keys. Please select Cash on Delivery to complete your purchase.'
          );
          setLoading(false);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error occurred while placing order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Concierge Dispatch
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black">
          Secure Checkout
        </h1>
      </div>

      {errorMessage && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Contact, Shipping, Payment Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Contact Information */}
          <div className="bg-white p-6 border border-luxury-gray space-y-4">
            <h3 className="font-serif text-lg font-bold text-luxury-black flex items-center space-x-2 pb-3 border-b border-luxury-gray">
              <span>1. Client Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="e.g. Tariq Raza"
                  className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="e.g. tariq@example.com"
                  className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                  Mobile Number (for SMS dispatch updates) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="bg-white p-6 border border-luxury-gray space-y-4">
            <h3 className="font-serif text-lg font-bold text-luxury-black flex items-center space-x-2 pb-3 border-b border-luxury-gray">
              <span>2. Delivery Destination</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                  Street Address / Apartment / Building Suite *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  placeholder="House 42, Galleria High Street"
                  className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    placeholder="400001"
                    className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                  Delivery Notes / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={shippingAddress.landmark}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })}
                  placeholder="Near Landmark Tower or security gate"
                  className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white p-6 border border-luxury-gray space-y-4">
            <h3 className="font-serif text-lg font-bold text-luxury-black pb-3 border-b border-luxury-gray">
              3. Payment Method
            </h3>

            <div className="space-y-3">
              <label
                className={`p-4 border block cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-luxury-black bg-luxury-ivory/60'
                    : 'border-luxury-gray hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-luxury-black"
                    />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-luxury-black block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Pay in cash or UPI at your doorstep upon receiving your footwear box.
                      </span>
                    </div>
                  </div>
                  <Truck className="w-5 h-5 text-luxury-gold" />
                </div>
              </label>

              <label
                className={`p-4 border block cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-luxury-black bg-luxury-ivory/60'
                    : 'border-luxury-gray hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Razorpay"
                      checked={paymentMethod === 'Razorpay'}
                      onChange={() => setPaymentMethod('Razorpay')}
                      className="accent-luxury-black"
                    />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-luxury-black block">
                        Online Payment (Razorpay Test Mode)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Cards, UPI, Netbanking & Wallets with backend cryptographic signature verification.
                      </span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-luxury-gold" />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 border border-luxury-gray space-y-4">
            <h3 className="font-serif text-lg font-bold text-luxury-black pb-3 border-b border-luxury-gray">
              Items Selected ({cartItems.reduce((a, b) => a + b.quantity, 0)})
            </h3>

            <div className="max-h-72 overflow-y-auto divide-y divide-luxury-gray pr-1">
              {cartItems.map((item) => (
                <div key={item.key} className="py-3 flex items-center space-x-3">
                  <img src={item.image} alt={item.name} className="w-12 h-14 object-cover border border-luxury-gray shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-luxury-black truncate">{item.name}</p>
                    <p className="text-[10px] text-luxury-muted">
                      {item.size} · {item.color} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold font-sans text-luxury-black">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-luxury-gray space-y-2 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-luxury-black font-sans">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span className="font-sans">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold text-luxury-black font-sans">
                  {shippingFee === 0 ? 'COMPLIMENTARY' : formatCurrency(shippingFee)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-luxury-gray flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wider font-bold text-luxury-black">
                Final Payable Amount
              </span>
              <span className="text-xl font-bold text-luxury-black font-sans">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-luxury-gold text-luxury-black text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold-light hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Processing Order...' : 'Confirm & Complete Order'}</span>
            </button>
          </div>

          <div className="p-4 bg-luxury-ivory border border-luxury-gray text-xs space-y-2">
            <div className="flex items-center space-x-2 text-luxury-black font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-luxury-gold" />
              <span>Sovereign Quality Guarantee</span>
            </div>
            <p className="text-luxury-muted text-[11px] leading-relaxed">
              Every shipment is inspected, packaged in custom gold-foiled shoe dust bags, and sealed for tamper-proof delivery.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
