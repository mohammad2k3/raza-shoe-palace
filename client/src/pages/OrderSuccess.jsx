import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Printer,
  Truck,
  MapPin,
  Clock,
} from 'lucide-react';
import API from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${orderNumber}`);
        if (res.data?.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.warn('Could not load order:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-luxury-ivory rounded-full mx-auto mb-4" />
        <div className="h-6 bg-luxury-ivory w-1/2 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Success Hero */}
      <div className="text-center mb-10 pb-8 border-b border-luxury-gray">
        <div className="w-16 h-16 bg-luxury-black text-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4 border border-luxury-gold/50 shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Order Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black mb-2">
          Thank You For Choosing Raza Shoe Palace
        </h1>
        <p className="text-xs sm:text-sm text-luxury-muted max-w-md mx-auto">
          Your order has been recorded in our system. A confirmation receipt has been generated.
        </p>
      </div>

      {/* Invoice Card */}
      <div className="bg-white border border-luxury-gray p-6 sm:p-8 space-y-6 shadow-sm print:shadow-none print:border-none">
        {/* Header with Order No & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-luxury-gray gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-ultra text-luxury-muted font-bold block">
              Official Order Reference
            </span>
            <span className="font-mono text-base font-bold text-luxury-black">
              {order?.orderNumber || orderNumber}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-luxury-gray text-xs font-semibold uppercase tracking-wider text-luxury-black hover:bg-luxury-ivory transition-colors print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <Link
              to={`/order-track?orderNumber=${order?.orderNumber || orderNumber}`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-luxury-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors print:hidden"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Live Status</span>
            </Link>
          </div>
        </div>

        {/* Customer & Delivery Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-700">
          <div>
            <h4 className="font-bold text-luxury-black uppercase tracking-wider mb-1">Delivery Destination</h4>
            <p className="font-medium text-luxury-black">{order?.shippingAddress?.name}</p>
            <p>{order?.shippingAddress?.street}</p>
            <p>
              {order?.shippingAddress?.city}, {order?.shippingAddress?.state} - {order?.shippingAddress?.pincode}
            </p>
            <p className="text-luxury-muted mt-1">Contact: {order?.shippingAddress?.phone}</p>
          </div>

          <div>
            <h4 className="font-bold text-luxury-black uppercase tracking-wider mb-1">Payment & Dispatch</h4>
            <p>Method: <strong className="text-luxury-black">{order?.paymentMethod}</strong></p>
            <p>
              Payment Status:{' '}
              <span
                className={`font-semibold ${
                  order?.paymentStatus === 'Completed' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {order?.paymentStatus}
              </span>
            </p>
            <p>
              Order Status: <strong className="text-luxury-black">{order?.orderStatus}</strong>
            </p>
            <p className="text-luxury-muted mt-1">Placed: {formatDate(order?.createdAt)}</p>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-luxury-black mb-3">
            Footwear Manifest
          </h4>
          <div className="border border-luxury-gray divide-y divide-luxury-gray text-xs">
            {order?.items?.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={item.image} alt="" className="w-12 h-14 object-cover border border-luxury-gray shrink-0" />
                  <div>
                    <span className="font-bold text-luxury-black block">{item.name}</span>
                    <span className="text-[11px] text-luxury-muted">
                      Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                    </span>
                  </div>
                </div>
                <span className="font-bold font-sans text-luxury-black">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pt-2 border-t border-luxury-gray space-y-1.5 text-xs text-right">
          <div className="flex justify-between max-w-xs ml-auto">
            <span className="text-luxury-muted">Subtotal:</span>
            <span className="font-bold font-sans">{formatCurrency(order?.pricing?.subtotal)}</span>
          </div>
          {order?.pricing?.discount > 0 && (
            <div className="flex justify-between max-w-xs ml-auto text-emerald-700">
              <span>Privilege Discount ({order?.couponApplied?.code}):</span>
              <span className="font-sans">-{formatCurrency(order?.pricing?.discount)}</span>
            </div>
          )}
          <div className="flex justify-between max-w-xs ml-auto">
            <span className="text-luxury-muted">Shipping:</span>
            <span className="font-bold font-sans">
              {order?.pricing?.shippingFee === 0 ? 'COMPLIMENTARY' : formatCurrency(order?.pricing?.shippingFee)}
            </span>
          </div>
          <div className="flex justify-between max-w-xs ml-auto pt-2 border-t border-luxury-gray text-sm">
            <span className="font-bold uppercase tracking-wider text-luxury-black">Total Paid:</span>
            <span className="font-bold font-sans text-luxury-black">
              {formatCurrency(order?.pricing?.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center print:hidden">
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 px-8 py-3.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
