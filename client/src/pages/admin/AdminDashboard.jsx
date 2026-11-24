import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Layers,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import API from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/analytics/dashboard');
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Could not load dashboard stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-gray-200 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockCount: 0,
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      subtitle: 'Completed order receipts',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subtitle: `${stats.pendingOrders} pending fulfillment`,
      icon: ShoppingBag,
      color: 'text-luxury-black',
      bg: 'bg-luxury-ivory',
    },
    {
      title: 'Footwear Catalog',
      value: stats.totalProducts,
      subtitle: `Across ${stats.totalCategories} dynamic categories`,
      icon: Package,
      color: 'text-luxury-gold',
      bg: 'bg-amber-50',
    },
    {
      title: 'Registered Clients',
      value: stats.totalCustomers,
      subtitle: 'Verified customer accounts',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Executive Telemetry
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black">
          Operations Dashboard
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Live statistics aggregated strictly from real MongoDB database transactions.
        </p>
      </div>

      {/* Low Stock Warning Banner if any */}
      {stats.lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Low Inventory Notice
              </h4>
              <p className="text-xs text-amber-800">
                {stats.lowStockCount} footwear product(s) have variants with 5 or fewer pairs remaining.
              </p>
            </div>
          </div>
          <Link
            to="/admin/inventory"
            className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-colors shrink-0"
          >
            Review Inventory
          </Link>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-5 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">
                  {card.title}
                </span>
                <span className="text-2xl font-bold font-sans text-luxury-black block">
                  {card.value}
                </span>
                <span className="text-[11px] text-gray-400 mt-1 block">{card.subtitle}</span>
              </div>
              <div className={`w-12 h-12 rounded-full ${card.bg} flex items-center justify-center ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Monthly Revenue Graph & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Activity Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-luxury-gold" />
              <h3 className="font-serif text-base font-bold text-luxury-black">
                Recent Monthly Sales Revenue
              </h3>
            </div>
            <span className="text-xs text-gray-400">Database Historical Data</span>
          </div>

          {data?.monthlySales && data.monthlySales.length > 0 ? (
            <div className="space-y-3 pt-2">
              {data.monthlySales.map((month, idx) => {
                const maxRev = Math.max(...data.monthlySales.map((m) => m.revenue), 1);
                const percent = Math.min(100, Math.round((month.revenue / maxRev) * 100));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-luxury-black">{month.name}</span>
                      <span className="font-mono text-gray-600">
                        {month.orders} orders · <strong>{formatCurrency(month.revenue)}</strong>
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-luxury-black hover:bg-luxury-gold transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-gray-400">
              No previous monthly order data recorded yet.
            </div>
          )}
        </div>

        {/* Best Selling Footwear */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-serif text-base font-bold text-luxury-black">
              Top Selling Designs
            </h3>
            <Link to="/admin/products" className="text-xs text-luxury-gold hover:underline">
              View All
            </Link>
          </div>

          {data?.topProducts && data.topProducts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.topProducts.map((p, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={p.productImage} alt="" className="w-10 h-12 object-cover border border-gray-200" />
                    <div>
                      <p className="text-xs font-bold text-luxury-black line-clamp-1">{p.productName}</p>
                      <p className="text-[10px] text-gray-400">{p.totalUnitsSold} units sold</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-sans text-luxury-black">
                    {formatCurrency(p.totalSales)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-gray-400">
              Units will rank here as customer orders are placed.
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-serif text-base font-bold text-luxury-black">Recent Orders</h3>
            <p className="text-xs text-gray-400">Latest transactions requiring packaging or courier dispatch</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-luxury-gold hover:underline"
          >
            <span>All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recentOrders && data.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-luxury-black">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-luxury-black block">{order.customerInfo?.name}</span>
                      <span className="text-[10px] text-gray-400">{order.customerInfo?.phone}</span>
                    </td>
                    <td className="py-3 px-4 font-bold font-sans">
                      {formatCurrency(order.pricing?.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700">{order.paymentMethod}</span>{' '}
                      <span
                        className={`text-[10px] font-semibold ${
                          order.paymentStatus === 'Completed' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        ({order.paymentStatus})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-gray-100 text-luxury-black font-semibold uppercase text-[10px]">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/orders?order=${order.orderNumber}`}
                        className="text-xs font-semibold text-luxury-gold hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            No customer orders placed yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
