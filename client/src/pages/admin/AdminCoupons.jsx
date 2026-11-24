import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Ticket,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import API from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage', // 'percentage' | 'fixed'
    discountValue: 10,
    minOrderValue: 999,
    maxDiscount: 1000,
    validUntil: '2028-12-31',
    usageLimit: '',
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await API.get('/coupons');
      if (res.data?.success) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      console.warn('Could not load coupons:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      await API.post('/coupons', {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      });

      await fetchCoupons();
      setModalOpen(false);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 999,
        maxDiscount: 1000,
        validUntil: '2028-12-31',
        usageLimit: '',
        isActive: true,
      });
    } catch (err) {
      setFormError(err.message || 'Failed to create coupon.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${code}'?`)) return;

    try {
      await API.delete(`/coupons/${id}`);
      setCoupons(coupons.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete coupon.');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await API.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      setCoupons(
        coupons.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
      alert(err.message || 'Toggle failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
            Promotional Privileges
          </span>
          <h1 className="font-serif text-2xl font-bold text-luxury-black">
            Discount Coupons ({coupons.length})
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Create percentage or flat monetary discounts with minimum order thresholds and expiry limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-luxury-gold uppercase tracking-wider animate-pulse">
            Loading coupon codes...
          </div>
        ) : coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Privilege Value</th>
                  <th className="py-3 px-4">Min. Spend</th>
                  <th className="py-3 px-4">Max. Discount</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Times Redeemed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-sm text-luxury-black">
                      {c.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-luxury-black">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% OFF`
                        : `${formatCurrency(c.discountValue)} FLAT OFF`}
                    </td>
                    <td className="py-3 px-4 font-sans text-gray-700">
                      {c.minOrderValue ? formatCurrency(c.minOrderValue) : 'None'}
                    </td>
                    <td className="py-3 px-4 font-sans text-gray-700">
                      {c.maxDiscount ? formatCurrency(c.maxDiscount) : 'No cap'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(c.validUntil)}</td>
                    <td className="py-3 px-4 font-bold font-sans">
                      {c.usedCount || 0} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${
                          c.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c._id, c.code)}
                        className="p-1.5 text-gray-400 hover:text-red-600"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gray-500">
            No active discount coupons found. Create your first promotional code above.
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full p-6 border border-luxury-gray space-y-4">
            <h3 className="font-serif text-lg font-bold text-luxury-black">
              Create Promotional Coupon Code
            </h3>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. RAZAWELCOME"
                  className="w-full p-2.5 border border-gray-200 uppercase font-mono font-bold focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'percentage' ? '10%' : '₹500'}
                    className="w-full p-2.5 border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Min Order Spend (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    placeholder="999"
                    className="w-full p-2.5 border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="1000 (Optional)"
                    className="w-full p-2.5 border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full p-2.5 border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Leave blank for unlimited"
                    className="w-full p-2.5 border border-gray-200"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 uppercase tracking-wider font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 bg-luxury-black text-white uppercase tracking-wider font-bold hover:bg-luxury-gold hover:text-luxury-black transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Creating...' : 'Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
