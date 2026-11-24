import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import API from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/format';

const standardSteps = [
  'Order Placed',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const OrderTrack = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderNo = searchParams.get('orderNumber') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNo);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cancel order modal state
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const fetchOrder = async (queryNumber) => {
    if (!queryNumber || !queryNumber.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await API.get(`/orders/${queryNumber.trim()}`);
      if (res.data?.success && res.data.order) {
        setOrder(res.data.order);
      }
    } catch (err) {
      setOrder(null);
      setError(err.message || 'No order found with this reference number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNo) {
      fetchOrder(initialOrderNo);
    }
  }, [initialOrderNo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchParams({ orderNumber: orderNumber.trim() });
      fetchOrder(orderNumber.trim());
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelLoading(true);
    try {
      const res = await API.post(`/orders/${order._id}/cancel`, { reason: cancelReason });
      if (res.data?.success) {
        setOrder(res.data.order);
        setCancelModalOpen(false);
        setCancelReason('');
        alert('Order has been cancelled successfully.');
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Find step index in standard progression
  const currentStepIndex = order ? standardSteps.indexOf(order.orderStatus) : -1;
  const isCancelled = order?.orderStatus === 'Cancelled';
  const isReturnRequested = order?.orderStatus === 'Return Requested';

  const canCancel = order && ['Order Placed', 'Order Confirmed', 'Processing'].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Search Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Live Status Concierge
        </span>
        <h1 className="font-serif text-3xl font-bold text-luxury-black mb-4">
          Track Your Footwear Shipment
        </h1>
        <p className="text-xs text-luxury-muted mb-6">
          Enter your order reference code (e.g. RSP-202611-XXXX) to review live courier tracking and history.
        </p>

        <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Enter Order Number"
            required
            className="w-full px-4 py-3 pl-10 text-xs font-mono tracking-wider border border-luxury-gray uppercase focus:outline-none focus:border-luxury-gold"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-luxury-muted" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-luxury-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {loading && (
        <div className="p-12 text-center text-xs text-luxury-gold uppercase tracking-wider animate-pulse">
          Retrieving order tracking timeline...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs text-center max-w-md mx-auto">
          {error}
        </div>
      )}

      {/* Order Progress Details */}
      {order && !loading && (
        <div className="space-y-8 bg-white border border-luxury-gray p-6 sm:p-8">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-luxury-gray gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-ultra text-luxury-muted font-bold block">
                Order Reference
              </span>
              <span className="font-mono text-lg font-bold text-luxury-black">{order.orderNumber}</span>
              <span className="text-xs text-luxury-muted block mt-0.5">
                Placed on {formatDateTime(order.createdAt)}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  isCancelled
                    ? 'bg-red-100 text-red-800'
                    : order.orderStatus === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-luxury-gold/20 text-luxury-black border border-luxury-gold'
                }`}
              >
                {order.orderStatus}
              </span>

              {canCancel && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Timeline Visualizer */}
          {!isCancelled && (
            <div className="py-6">
              <h3 className="text-xs font-bold uppercase tracking-ultra text-luxury-black mb-6">
                Progress Status
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center">
                {standardSteps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-colors ${
                          isCurrent
                            ? 'bg-luxury-gold text-luxury-black ring-4 ring-luxury-gold/20'
                            : isDone
                            ? 'bg-luxury-black text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold ${
                          isDone ? 'text-luxury-black' : 'text-gray-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Courier Tracking Info if dispatched */}
          {order.trackingInfo?.courierName && (
            <div className="p-4 bg-luxury-ivory border border-luxury-gray space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-luxury-black">
                <Truck className="w-4 h-4 text-luxury-gold" />
                <span>Courier Dispatch Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-700">
                <div>
                  <span className="text-luxury-muted block text-[10px]">Courier Partner</span>
                  <span className="font-semibold">{order.trackingInfo.courierName}</span>
                </div>
                <div>
                  <span className="text-luxury-muted block text-[10px]">AWB Tracking No</span>
                  <span className="font-mono font-bold">{order.trackingInfo.trackingNumber || 'Pending'}</span>
                </div>
                {order.trackingInfo.trackingUrl && (
                  <div>
                    <span className="text-luxury-muted block text-[10px]">Live Portal</span>
                    <a
                      href={order.trackingInfo.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-luxury-gold font-bold hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Track on Courier Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status History Logs */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-ultra text-luxury-black mb-3">
                Milestone Activity Log
              </h3>
              <div className="space-y-3 border-l-2 border-luxury-gold pl-4 text-xs">
                {order.statusHistory.map((h, idx) => (
                  <div key={idx} className="relative">
                    <span className="font-bold text-luxury-black uppercase tracking-wider">{h.status}</span>
                    <span className="text-[10px] text-luxury-muted ml-2">{formatDateTime(h.changedAt)}</span>
                    {h.note && <p className="text-gray-600 text-[11px] mt-0.5">{h.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-ultra text-luxury-black mb-3">
              Shipment Items
            </h3>
            <div className="border border-luxury-gray divide-y divide-luxury-gray text-xs">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt="" className="w-12 h-14 object-cover border border-luxury-gray" />
                    <div>
                      <span className="font-bold text-luxury-black block">{item.name}</span>
                      <span className="text-[11px] text-luxury-muted">
                        {item.size} · {item.color} · Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold font-sans">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-6 border border-luxury-gray space-y-4">
            <h3 className="font-serif text-lg font-bold text-luxury-black">Cancel Order Confirmation</h3>
            <p className="text-xs text-luxury-muted">
              Are you sure you want to cancel this order? Variant inventory will be immediately restocked.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={3}
              className="w-full p-2.5 text-xs border border-luxury-gray focus:outline-none focus:border-luxury-gold"
            />
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 border border-luxury-gray text-xs uppercase tracking-wider font-semibold"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs uppercase tracking-wider font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrack;
