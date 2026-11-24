import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const StoreSettingsContext = createContext();

export const StoreSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
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
    currencySymbol: '₹',
    returnWindowDays: 7,
    socialLinks: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      whatsapp: '+919876543210',
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings');
      if (res.data?.success && res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.warn('Could not fetch store settings, using defaults:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <StoreSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => useContext(StoreSettingsContext);
