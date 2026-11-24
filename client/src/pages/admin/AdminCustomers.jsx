import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, ShoppingBag, ShieldCheck } from 'lucide-react';
import API from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await API.get('/auth/customers');
        if (res.data?.success) {
          setCustomers(res.data.customers);
        }
      } catch (err) {
        console.warn('Could not load customers:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Client Relationship Directory
        </span>
        <h1 className="font-serif text-2xl font-bold text-luxury-black">
          Registered Client Profiles ({customers.length})
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Review customer contact details, order frequency, and cumulative spend.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 border border-gray-200 shadow-sm max-w-sm text-xs">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client name, email, or mobile..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-luxury-gold"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-luxury-gold uppercase tracking-wider animate-pulse">
            Loading client directory...
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Orders Placed</th>
                  <th className="py-3 px-4">Total Revenue Generated</th>
                  <th className="py-3 px-4">Addresses Saved</th>
                  <th className="py-3 px-4">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cust) => (
                  <tr key={cust._id} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 font-bold text-luxury-black text-sm">
                      {cust.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{cust.email}</td>
                    <td className="py-3 px-4 text-gray-600">{cust.phone || 'Not provided'}</td>
                    <td className="py-3 px-4 font-bold text-luxury-black">
                      {cust.orderCount} orders
                    </td>
                    <td className="py-3 px-4 font-bold font-sans text-emerald-700">
                      {formatCurrency(cust.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {cust.addressesCount} address(es)
                    </td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(cust.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gray-500">
            No customer accounts found matching your query.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
