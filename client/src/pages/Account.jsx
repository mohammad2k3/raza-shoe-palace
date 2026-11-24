import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Lock,
  Plus,
  Trash2,
  Package,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Account = () => {
  const { user, isAdmin, updateProfile, addAddress, deleteAddress } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profile update state
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Address modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: user.name,
    phone: user.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false,
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');
    try {
      await updateProfile({ name: profileName, phone: profilePhone });
      setProfileMessage('Profile details updated successfully.');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      setProfileMessage(err.message || 'Update failed.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(newAddress);
      setAddressModalOpen(false);
      setNewAddress({
        name: user.name,
        phone: user.phone || '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        isDefault: false,
      });
    } catch (err) {
      alert(err.message || 'Failed to save address.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-luxury-gray gap-4">
        <div>
          <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
            Client Concierge
          </span>
          <h1 className="font-serif text-3xl font-bold text-luxury-black">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">{user.email}</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/account/orders"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-luxury-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>My Orders</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-luxury-gold text-luxury-black text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold-light transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Settings */}
        <div className="bg-white p-6 border border-luxury-gray space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-luxury-black pb-3 border-b border-luxury-gray">
            <User className="w-4 h-4 text-luxury-gold" />
            <span>Personal Profile</span>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-2.5 border border-luxury-gray bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
            </div>

            {profileMessage && (
              <p className="text-xs text-emerald-700 font-semibold">{profileMessage}</p>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors disabled:opacity-50"
            >
              {profileLoading ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Saved Addresses */}
        <div className="lg:col-span-2 bg-white p-6 border border-luxury-gray space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-luxury-gray">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-luxury-black">
              <MapPin className="w-4 h-4 text-luxury-gold" />
              <span>Saved Shipping Addresses</span>
            </div>

            <button
              type="button"
              onClick={() => setAddressModalOpen(true)}
              className="inline-flex items-center space-x-1 text-xs text-luxury-gold hover:underline font-bold uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {user.addresses && user.addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`p-4 border text-xs space-y-1 relative ${
                    addr.isDefault ? 'border-luxury-black bg-luxury-ivory/50' : 'border-luxury-gray'
                  }`}
                >
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-ultra block">
                      Default Shipping Address
                    </span>
                  )}
                  <p className="font-bold text-luxury-black text-sm">{addr.name}</p>
                  <p className="text-gray-700">{addr.street}</p>
                  <p className="text-gray-700">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  {addr.landmark && <p className="text-gray-500">Landmark: {addr.landmark}</p>}
                  <p className="text-luxury-muted mt-1">Phone: {addr.phone}</p>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr._id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-luxury-ivory border border-luxury-gray text-xs text-luxury-muted">
              No delivery addresses saved yet. Add your preferred destination for one-click checkout.
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 border border-luxury-gray space-y-4">
            <h3 className="font-serif text-xl font-bold text-luxury-black">Add Delivery Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Receiver Name</label>
                  <input
                    type="text"
                    required
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="w-full p-2 border border-luxury-gray"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full p-2 border border-luxury-gray"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Street Address / Suite</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="w-full p-2 border border-luxury-gray"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full p-2 border border-luxury-gray"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full p-2 border border-luxury-gray"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full p-2 border border-luxury-gray"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={newAddress.landmark}
                  onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                  className="w-full p-2 border border-luxury-gray"
                />
              </div>

              <label className="flex items-center space-x-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="accent-luxury-black"
                />
                <span>Set as default delivery destination</span>
              </label>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="flex-1 py-2.5 border border-luxury-gray uppercase tracking-wider font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-luxury-black text-white uppercase tracking-wider font-bold hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
