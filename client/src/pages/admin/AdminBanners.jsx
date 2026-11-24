import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import API from '../../services/api';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tagline: '',
    imageUrl: '',
    buttonText: 'Shop Now',
    link: '/shop',
    type: 'hero', // 'hero' | 'promo'
    displayOrder: 1,
    isActive: true,
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await API.get('/banners/admin/all');
      if (res.data?.success) {
        setBanners(res.data.banners);
      }
    } catch (err) {
      console.warn('Could not load banners:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      tagline: '',
      imageUrl: '',
      buttonText: 'Shop Now',
      link: '/shop',
      type: 'hero',
      displayOrder: banners.length + 1,
      isActive: true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      subtitle: b.subtitle || '',
      tagline: b.tagline || '',
      imageUrl: b.imageUrl,
      buttonText: b.buttonText || 'Shop Now',
      link: b.link || '/shop',
      type: b.type || 'hero',
      displayOrder: b.displayOrder || 0,
      isActive: b.isActive !== undefined ? b.isActive : true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingBanner) {
        await API.put(`/banners/${editingBanner._id}`, formData);
      } else {
        await API.post('/banners', formData);
      }

      await fetchBanners();
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBanner = async (id, title) => {
    if (!window.confirm(`Delete banner '${title}'?`)) return;
    try {
      await API.delete(`/banners/${id}`);
      setBanners(banners.filter((b) => b._id !== id));
    } catch (err) {
      alert(err.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
            Visual Storytelling
          </span>
          <h1 className="font-serif text-2xl font-bold text-luxury-black">
            Homepage & Promotional Banners ({banners.length})
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage high-resolution footwear hero slides and seasonal sale promotional sections.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b._id} className="bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-[16/9] bg-luxury-ivory overflow-hidden">
              <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex space-x-2">
                <span className="px-2 py-0.5 bg-luxury-black text-luxury-gold text-[10px] font-bold uppercase">
                  {b.type}
                </span>
                <span className="px-2 py-0.5 bg-white/90 text-luxury-black text-[10px] font-bold">
                  Order #{b.displayOrder}
                </span>
              </div>
              <span
                className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${
                  b.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {b.isActive ? 'Active' : 'Hidden'}
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                {b.tagline && (
                  <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-ultra block">
                    {b.tagline}
                  </span>
                )}
                <h3 className="font-serif text-base font-bold text-luxury-black line-clamp-1">
                  {b.title}
                </h3>
                {b.subtitle && (
                  <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{b.subtitle}</p>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  Button: <strong>{b.buttonText}</strong> → Link: <code>{b.link}</code>
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => openEditModal(b)}
                  className="p-1.5 text-gray-400 hover:text-luxury-gold"
                  title="Edit Banner"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBanner(b._id, b.title)}
                  className="p-1.5 text-gray-400 hover:text-red-600"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full p-6 border border-luxury-gray space-y-4">
            <h3 className="font-serif text-lg font-bold text-luxury-black">
              {editingBanner ? 'Edit Banner' : 'Create New Banner'}
            </h3>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Step Into Style."
                  className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="HANDCRAFTED EXCELLENCE"
                    className="w-full p-2.5 border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Banner Placement Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 font-semibold"
                  >
                    <option value="hero">Hero Top Slide</option>
                    <option value="promo">Mid-Page Promotional Banner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  High-Res Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Supporting Editorial Subtitle
                </label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="The 2026 Sovereign Footwear Collection..."
                  className="w-full p-2.5 border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Shop New Arrivals"
                    className="w-full p-2.5 border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Destination Link
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/shop?newArrival=true"
                    className="w-full p-2.5 border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full p-2.5 border border-gray-200"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="accent-luxury-black"
                    />
                    <span className="font-semibold">Active on Storefront</span>
                  </label>
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
                  {formLoading ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
