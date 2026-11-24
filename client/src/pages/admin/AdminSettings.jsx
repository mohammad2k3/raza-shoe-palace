import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import API from '../../services/api';
import { useStoreSettings } from '../../context/StoreSettingsContext';

const AdminSettings = () => {
  const { settings, refreshSettings } = useStoreSettings();

  const [formData, setFormData] = useState({
    storeName: 'RAZA SHOE PALACE',
    tagline: 'Step Into Style.',
    email: 'contact@razashoepalace.com',
    phone: '+91 98765 43210',
    address: 'Main Market Road, Footwear Galleria, Suite 101',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    shippingFee: 99,
    freeShippingThreshold: 1999,
    announcementText: '✨ Step Into Style — Free Express Shipping on orders above ₹1,999 | Handcrafted Quality',
    announcementActive: true,
    returnWindowDays: 7,
    socialLinks: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
    },
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || 'RAZA SHOE PALACE',
        tagline: settings.tagline || 'Step Into Style.',
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        city: settings.city || '',
        state: settings.state || '',
        pincode: settings.pincode || '',
        shippingFee: settings.shippingFee || 99,
        freeShippingThreshold: settings.freeShippingThreshold || 1999,
        announcementText: settings.announcementText || '',
        announcementActive: settings.announcementActive !== undefined ? settings.announcementActive : true,
        returnWindowDays: settings.returnWindowDays || 7,
        socialLinks: {
          instagram: settings.socialLinks?.instagram || '',
          facebook: settings.socialLinks?.facebook || '',
          twitter: settings.socialLinks?.twitter || '',
        },
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await API.put('/settings', formData);
      await refreshSettings();
      setSuccessMessage('Store business settings updated and propagated to customer storefront.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update store settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
            Core Enterprise Configuration
          </span>
          <h1 className="font-serif text-2xl font-bold text-luxury-black">
            Store Business Settings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Update store name, contact channels, shipping thresholds, and live announcement banner.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Brand & Store Identity */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-luxury-black pb-3 border-b border-gray-100">
            Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Store Business Name
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              />
            </div>
          </div>
        </div>

        {/* Live Announcement Bar */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-serif text-base font-bold text-luxury-black flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-luxury-gold" />
              <span>Header Announcement Bar</span>
            </h3>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.announcementActive}
                onChange={(e) => setFormData({ ...formData, announcementActive: e.target.checked })}
                className="accent-luxury-black"
              />
              <span className="font-semibold text-luxury-black">Active on Storefront</span>
            </label>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Announcement Message
            </label>
            <input
              type="text"
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              placeholder="✨ Step Into Style — Free Express Shipping on orders above ₹1,999 | Use Code: RAZAWELCOME"
              className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
            />
          </div>
        </div>

        {/* Shipping & Delivery Thresholds */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-luxury-black pb-3 border-b border-gray-100">
            Shipping & Return Logistics Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.shippingFee}
                onChange={(e) => setFormData({ ...formData, shippingFee: Number(e.target.value) })}
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.freeShippingThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })
                }
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Doorstep Return Window (Days)
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.returnWindowDays}
                onChange={(e) =>
                  setFormData({ ...formData, returnWindowDays: Number(e.target.value) })
                }
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              />
            </div>
          </div>
        </div>

        {/* Business Contact Channels */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-luxury-black pb-3 border-b border-gray-100">
            Retail Store Contact & Flagship Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Concierge Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Support Telephone
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 border border-gray-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Flagship Address
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 border border-gray-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-2.5 border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full p-2.5 border border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-luxury-black pb-3 border-b border-gray-100">
            Social Media Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.socialLinks.facebook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Twitter / X URL
              </label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-gray-200"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
