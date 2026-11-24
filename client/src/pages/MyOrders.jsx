import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package, Truck, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders/my-orders');
        if (res.data?.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.warn('Could not fetch customer orders:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-luxury-gold uppercase tracking-wider animate-pulse">
        Retrieving order history...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-luxury-gray">
        <div>
          <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
            Order Portfolio
          </span>
          <h1 className="font-serif text-3xl font-bold text-luxury-black">
            My Purchase History
          </h1>
        </div>

        <Link
          to="/shop"
          className="text-xs font-bold uppercase tracking-wider text-luxury-black hover:text-luxury-gold transition-colors"
        >
          Explore Catalog →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center bg-luxury-ivory border border-luxury-gray">
          <Package className="w-10 h-10 text-luxury-gold mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-luxury-black mb-2">No Past Orders Found</h3>
          <p className="text-xs text-luxury-muted max-w-sm mx-auto mb-6">
            You haven't placed an order yet. Treat yourself to our handcrafted footwear collection today.
          </p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-luxury-gray overflow-hidden">
              {/* Order Header */}
              <div className="p-4 sm:p-5 bg-luxury-ivory/60 border-b border-luxury-gray flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-ultra text-luxury-muted font-bold block">
                    Order Number
                  </span>
                  <span className="font-mono font-bold text-luxury-black text-sm">{order.orderNumber}</span>
                  <span className="text-gray-500 block text-[11px] mt-0.5">
                    Placed on {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-ultra text-luxury-muted font-bold block">
                      Total
                    </span>
                    <span className="font-bold font-sans text-sm text-luxury-black">
                      {formatCurrency(order.pricing?.totalAmount)}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 font-bold uppercase tracking-wider text-[11px] ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-luxury-gold/20 text-luxury-black border border-luxury-gold/50'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="p-4 sm:p-6 divide-y divide-luxury-gray">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <img src={item.image} alt="" className="w-14 h-16 object-cover border border-luxury-gray shrink-0" />
                      <div>
                        <h4 className="font-serif text-sm font-bold text-luxury-black">{item.name}</h4>
                        <p className="text-xs text-luxury-muted mt-0.5">
                          Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold font-sans text-luxury-black">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-gray-50 border-t border-luxury-gray flex items-center justify-between text-xs">
                <span className="text-luxury-muted">
                  Paid via <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                </span>

                <div className="flex items-center space-x-3">
                  <Link
                    to={`/order-success/${order.orderNumber}`}
                    className="text-luxury-muted hover:text-luxury-black font-semibold"
                  >
                    View Receipt
                  </Link>

                  <Link
                    to={`/order-track?orderNumber=${order.orderNumber}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-luxury-black text-white font-semibold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Shipment</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
