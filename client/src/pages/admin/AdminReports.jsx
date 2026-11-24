import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Printer, TrendingUp, DollarSign, Package } from 'lucide-react';
import API from '../../services/api';
import { formatCurrency } from '../../utils/format';

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const [repRes, dashRes] = await Promise.all([
        API.get(`/analytics/reports?${params.toString()}`),
        API.get('/analytics/dashboard'),
      ]);

      if (repRes.data?.success) setReports(repRes.data);
      if (dashRes.data?.success) setDashboardStats(dashRes.data);
    } catch (err) {
      console.warn('Could not load reports:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
            Business Intelligence Ledger
          </span>
          <h1 className="font-serif text-2xl font-bold text-luxury-black">
            Financial & Sales Reports
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Aggregated audit statements generated strictly from real database transaction records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-luxury-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors shrink-0 print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Print Audit Report</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white p-4 border border-gray-200 shadow-sm flex flex-wrap items-center gap-3 text-xs print:hidden"
      >
        <span className="font-bold text-luxury-black uppercase tracking-wider flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-luxury-gold" />
          <span>Date Filter:</span>
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border border-gray-200"
        />
        <span>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border border-gray-200"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-luxury-black text-white font-semibold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black"
        >
          Apply Filter
        </button>
      </form>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white border border-gray-200 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">
            Total Gross Revenue (Actual DB)
          </span>
          <span className="text-2xl font-bold font-sans text-emerald-700">
            {formatCurrency(dashboardStats?.stats?.totalRevenue || 0)}
          </span>
        </div>

        <div className="p-5 bg-white border border-gray-200 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">
            Total Orders Registered
          </span>
          <span className="text-2xl font-bold font-sans text-luxury-black">
            {dashboardStats?.stats?.totalOrders || 0}
          </span>
        </div>

        <div className="p-5 bg-white border border-gray-200 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">
            Active Footwear Catalog Lines
          </span>
          <span className="text-2xl font-bold font-sans text-luxury-black">
            {dashboardStats?.stats?.totalProducts || 0}
          </span>
        </div>
      </div>

      {/* Two Column Aggregation Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-luxury-black pb-3 border-b border-gray-100">
            Fulfillment Status Breakdown
          </h3>

          <div className="border border-gray-200 divide-y divide-gray-100 text-xs">
            {reports?.orderStats && reports.orderStats.length > 0 ? (
              reports.orderStats.map((st, i) => (
                <div key={i} className="py-2.5 px-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">{st._id}</span>
                  <div className="text-right">
                    <span className="font-bold text-luxury-black">{st.count} orders</span>
                    <span className="text-gray-400 block text-[10px]">
                      {formatCurrency(st.totalValue)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400">No order statuses recorded.</div>
            )}
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-luxury-black pb-3 border-b border-gray-100">
            Payment Method Breakdown
          </h3>

          <div className="border border-gray-200 divide-y divide-gray-100 text-xs">
            {reports?.paymentStats && reports.paymentStats.length > 0 ? (
              reports.paymentStats.map((pm, i) => (
                <div key={i} className="py-2.5 px-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">{pm._id}</span>
                  <div className="text-right">
                    <span className="font-bold text-luxury-black">{pm.count} orders</span>
                    <span className="text-gray-400 block text-[10px]">
                      {formatCurrency(pm.totalValue)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400">No transactions recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
