import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      if (res.data?.success && Array.isArray(res.data.categories)) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.warn('Failed to load categories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading, refreshCategories: fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
