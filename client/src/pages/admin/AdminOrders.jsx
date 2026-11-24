import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  MapPin,
} from 'lucide-react';
import API from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/format';

const allStatuses = [
  'Order Placed',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Return Requested',
  'Returned',
  'Refunded',
];

const AdminOrders = () => {
  const [searchParams] = useSearchParams();
  const queryOrderNo = searchParams.get('order') || '';

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState(queryOrderNo);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');

  // Order Details / Edit Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [courierInfo, setCourierInfo] = useState({
    courierName: '',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDelivery: '',
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedStatus) params.set('status', selectedStatus);
      if (selectedPaymentStatus) params.set('paymentStatus', selectedPaymentStatus);

      const res = await API.get(`/orders/admin/all?${params.toString()}`);
      if (res.data?.success) {
        setOrders(res.data.orders);
        setTotal(res.data.total);

        // If query order is present, auto-open modal
        if (queryOrderNo) {
          const match = res.data.orders.find((o) => o.orderNumber === queryOrderNo);
          if (match) openOrderModal(match);
        }
      }
    } catch (err) {
      console.warn('Failed to load admin orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, selectedPaymentStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setStatusNote('');
    setCourierInfo({
      courierName: order.trackingInfo?.courierName || 'Blue Dart Express',
      trackingNumber: order.trackingInfo?.trackingNumber || '',
      trackingUrl: order.trackingInfo?.trackingUrl || '',
      estimatedDelivery: order.trackingInfo?.estimatedDelivery
        ? new Date(order.trackingInfo.estimatedDelivery).toISOString().split('T')[0]
        : '',
    });
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdateLoading(true);

    try {
      const res = await API.put(`/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusNote || `Status updated to ${newStatus}`,
        ...courierInfo,
      });

      if (res.data?.success) {
        setSelectedOrder(res.data.order);
        setOrders(orders.map((o) => (o._id === selectedOrder._id ? res.data.order : o)));
        setStatusNote('');
      }
    } catch (err) {
      alert(err.message || 'Status update failed.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePaymentStatusUpdate = async (newPaymentStatus) => {
    if (!selectedOrder) return;
    setUpdateLoading(true);

    try {
      const res = await API.put(`/orders/${selectedOrder._id}/payment-status`, {
        paymentStatus: newPaymentStatus,
      });

      if (res.data?.success) {
        setSelectedOrder(res.data.order);
        setOrders(orders.map((o) => (o._id === selectedOrder._id ? res.data.order : o)));
      }
    } catch (err) {
      alert(err.message || 'Payment status update failed.');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Fulfillment & Logistics Control
        </span>
        <h1 className="font-serif text-2xl font-bold text-luxury-black">
          Client Orders Management ({total})
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Verify payments, manage packaging, assign courier AWB tracking, and process order returns.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order ref, customer, email, or phone..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-luxury-gold"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border border-gray-200 focus:outline-none focus:border-luxury-gold"
          >
            <option value="">All Order Statuses</option>
            {allStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="p-2 border border-gray-200 focus:outline-none focus:border-luxury-gold"
          >
            <option value="">All Payment Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-luxury-gold uppercase tracking-wider animate-pulse">
            Loading order ledger...
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-luxury-black">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-luxury-black block">{order.customerInfo?.name}</span>
                      <span className="text-[10px] text-gray-400">{order.customerInfo?.phone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700">
                        {order.items?.reduce((a, b) => a + b.quantity, 0)} pair(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold font-sans text-luxury-black">
                      {formatCurrency(order.pricing?.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700 block font-medium">{order.paymentMethod}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          order.paymentStatus === 'Completed' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-luxury-gold/20 text-luxury-black border border-luxury-gold/50'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{formatDateTime(order.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openOrderModal(order)}
                        className="px-3 py-1 bg-luxury-black text-white hover:bg-luxury-gold hover:text-luxury-black text-[11px] font-semibold uppercase tracking-wider transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gray-500">
            No orders matching criteria found.
          </div>
        )}
      </div>

      {/* Comprehensive Order Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-3xl w-full p-6 sm:p-8 border border-luxury-gray space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block">
                  Order Operations Management
                </span>
                <h3 className="font-serif text-xl font-bold text-luxury-black">
                  Order Ref: <span className="font-mono">{selectedOrder.orderNumber}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-gray-400 hover:text-luxury-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-luxury-ivory p-4 border border-luxury-gray text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-luxury-muted font-bold block mb-1">
                  Change Delivery Status
                </span>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updateLoading}
                  className="w-full p-2 bg-white border border-gray-300 font-bold focus:outline-none focus:border-luxury-gold"
                >
                  {allStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-luxury-muted font-bold block mb-1">
                  Change Payment Status
                </span>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
                  disabled={updateLoading}
                  className="w-full p-2 bg-white border border-gray-300 font-bold focus:outline-none focus:border-luxury-gold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Courier Dispatch Tracking Fields */}
            <div className="p-4 border border-gray-200 space-y-3 text-xs">
              <h4 className="font-bold text-luxury-black uppercase tracking-wider flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-luxury-gold" />
                <span>Courier Dispatch Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Courier Partner</label>
                  <input
                    type="text"
                    value={courierInfo.courierName}
                    onChange={(e) => setCourierInfo({ ...courierInfo, courierName: e.target.value })}
                    placeholder="e.g. Blue Dart / Delhivery"
                    className="w-full p-2 border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">AWB Tracking Number</label>
                  <input
                    type="text"
                    value={courierInfo.trackingNumber}
                    onChange={(e) => setCourierInfo({ ...courierInfo, trackingNumber: e.target.value })}
                    placeholder="e.g. BLUEDART-897123"
                    className="w-full p-2 border border-gray-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Tracking URL</label>
                  <input
                    type="url"
                    value={courierInfo.trackingUrl}
                    onChange={(e) => setCourierInfo({ ...courierInfo, trackingUrl: e.target.value })}
                    placeholder="https://track.courier.com/..."
                    className="w-full p-2 border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Status Update Note (Visible to Customer)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Quality inspected and handed to Blue Dart courier partner."
                  className="w-full p-2 border border-gray-200"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedOrder.orderStatus)}
                  disabled={updateLoading}
                  className="px-4 py-2 bg-luxury-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                >
                  Save Courier & Status Note
                </button>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
              <div className="p-4 bg-gray-50 border border-gray-200">
                <h5 className="font-bold text-luxury-black uppercase tracking-wider mb-2">Customer Profile</h5>
                <p>Name: <strong>{selectedOrder.customerInfo?.name}</strong></p>
                <p>Email: {selectedOrder.customerInfo?.email}</p>
                <p>Phone: {selectedOrder.customerInfo?.phone}</p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200">
                <h5 className="font-bold text-luxury-black uppercase tracking-wider mb-2">Delivery Address</h5>
                <p>{selectedOrder.shippingAddress?.street}</p>
                <p>
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                </p>
                {selectedOrder.shippingAddress?.landmark && (
                  <p className="text-gray-500">Landmark: {selectedOrder.shippingAddress.landmark}</p>
                )}
              </div>
            </div>

            {/* Items Manifest */}
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-luxury-black mb-2">
                Order Items Manifest
              </h5>
              <div className="border border-gray-200 divide-y divide-gray-100 text-xs">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={item.image} alt="" className="w-10 h-12 object-cover border border-gray-200" />
                      <div>
                        <span className="font-bold text-luxury-black block">{item.name}</span>
                        <span className="text-[10px] text-gray-500">
                          Size: {item.size} · Color: {item.color} · Qty: {item.quantity} · {formatCurrency(item.price)} each
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

            {/* Price breakdown */}
            <div className="pt-2 text-right text-xs space-y-1">
              <p>Subtotal: <span className="font-bold font-sans">{formatCurrency(selectedOrder.pricing?.subtotal)}</span></p>
              {selectedOrder.pricing?.discount > 0 && (
                <p className="text-emerald-700">
                  Discount ({selectedOrder.couponApplied?.code}): -{formatCurrency(selectedOrder.pricing?.discount)}
                </p>
              )}
              <p>Shipping: <span className="font-bold font-sans">{formatCurrency(selectedOrder.pricing?.shippingFee)}</span></p>
              <p className="text-sm font-bold text-luxury-black pt-1 border-t border-gray-200">
                Total Payable Amount: <span className="font-sans">{formatCurrency(selectedOrder.pricing?.totalAmount)}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
