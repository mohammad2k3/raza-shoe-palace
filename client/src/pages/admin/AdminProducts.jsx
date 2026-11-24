import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import API from '../../services/api';
import { useCategories } from '../../context/CategoryContext';
import { formatCurrency } from '../../utils/format';

const AdminProducts = () => {
  const { categories } = useCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedCategory) params.set('category', selectedCategory);
      if (stockStatus) params.set('stockStatus', stockStatus);

      const res = await API.get(`/products/admin/all?${params.toString()}`);
      if (res.data?.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.warn('Failed to load products for admin:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, stockStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/products/${productToDelete._id}`);
      setProducts(products.filter((p) => p._id !== productToDelete._id));
      setProductToDelete(null);
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
            Inventory & Catalog Management
          </span>
          <h1 className="font-serif text-2xl font-bold text-luxury-black">
            All Footwear Products ({products.length})
          </h1>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Footwear Design</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by shoe title, brand, or SKU..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-luxury-gold"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-gray-200 focus:outline-none focus:border-luxury-gold"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            className="p-2 border border-gray-200 focus:outline-none focus:border-luxury-gold"
          >
            <option value="">All Stock Levels</option>
            <option value="lowStock">Low Stock (≤ 5 pairs)</option>
            <option value="outOfStock">Out of Stock (0 pairs)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-luxury-gold uppercase tracking-wider animate-pulse">
            Loading footwear records...
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Design</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Variants & Stock</th>
                  <th className="py-3 px-4">Badges</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((prod) => {
                  const totalStock = prod.totalStock ?? prod.variants?.reduce((a, v) => a + (v.stock || 0), 0);
                  const isOutOfStock = totalStock === 0;
                  const isLowStock = totalStock > 0 && totalStock <= 5;

                  return (
                    <tr key={prod._id} className="hover:bg-gray-50/80">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={prod.images?.[0] || ''}
                            alt=""
                            className="w-12 h-14 object-cover border border-gray-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-luxury-black text-sm block line-clamp-1">
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-gray-400">{prod.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {prod.category?.name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-gray-600">
                        {prod.sku}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold font-sans text-luxury-black block">
                          {formatCurrency(prod.salePrice || prod.regularPrice)}
                        </span>
                        {prod.salePrice && (
                          <span className="text-[10px] text-gray-400 line-through font-sans">
                            {formatCurrency(prod.regularPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-bold font-sans ${
                              isOutOfStock
                                ? 'text-red-600'
                                : isLowStock
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {totalStock} units
                          </span>
                          <span className="text-[10px] text-gray-400">
                            ({prod.variants?.length || 0} variants)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {prod.isFeatured && (
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[9px] font-bold uppercase">
                              Featured
                            </span>
                          )}
                          {prod.isNewArrival && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold uppercase">
                              New
                            </span>
                          )}
                          {prod.isBestSeller && (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold uppercase">
                              Best Seller
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {prod.isActive ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-gray-400 text-[10px] font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Hidden</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/product/${prod.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-luxury-black"
                            title="View on Storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${prod._id}`}
                            className="p-1.5 text-gray-400 hover:text-luxury-gold"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(prod)}
                            className="p-1.5 text-gray-400 hover:text-red-600"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gray-500">
            No footwear designs found. Add your first product to display it on the store!
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-6 border border-luxury-gray space-y-4">
            <h3 className="font-serif text-lg font-bold text-luxury-black">Delete Footwear Model</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently remove <strong>"{productToDelete.name}"</strong>?
              Past completed orders containing this product will maintain their historical pricing and details safely.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 border border-gray-300 text-xs uppercase tracking-wider font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs uppercase tracking-wider font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
