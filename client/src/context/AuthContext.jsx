import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('raza_token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('raza_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('raza_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const adminLogin = async (email, password) => {
    const res = await API.post('/auth/admin-login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('raza_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password, phone) => {
    const res = await API.post('/auth/register', { name, email, password, phone });
    if (res.data?.token) {
      localStorage.setItem('raza_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('raza_token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await API.put('/auth/profile', data);
    if (res.data?.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const addAddress = async (addressData) => {
    const res = await API.post('/auth/address', addressData);
    if (res.data?.addresses && user) {
      setUser({ ...user, addresses: res.data.addresses });
    }
    return res.data;
  };

  const deleteAddress = async (addressId) => {
    const res = await API.delete(`/auth/address/${addressId}`);
    if (res.data?.addresses && user) {
      setUser({ ...user, addresses: res.data.addresses });
    }
    return res.data;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
