import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  ArrowRight,
} from 'lucide-react';
import API from '../../services/api';
import { useCategories } from '../../context/CategoryContext';

const AdminCategories = () => {
  const { refreshCategories } = useCategories();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    displayOrder: 0,
    isActive: true,
    subcategories: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Safe Deletion & Reassignment State
  const [safeDeleteModal, setSafeDeleteModal] = useState({
    open: false,
    category: null,
    productCount: 0,
    targetCategoryId: '',
  });

  const fetchCategoriesList = async () => {
    try {
      setLoading(true);
      const res = await API.get('/categories/admin/all');
      if (res.data?.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.warn('Failed to load categories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      displayOrder: categories.length + 1,
      isActive: true,
      subcategories: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      displayOrder: cat.displayOrder || 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
      subcategories: cat.subcategories?.map((s) => s.name).join(', ') || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      // Parse comma-separated subcategories
      const subcategoryArray = formData.subcategories
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-'), isActive: true }));

      const payload = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        displayOrder: Number(formData.displayOrder) || 0,
        isActive: formData.isActive,
        subcategories: subcategoryArray,
      };

      if (editingCategory) {
        await API.put(`/categories/${editingCategory._id}`, payload);
      } else {
        await API.post('/categories', payload);
      }

      await fetchCategoriesList();
      await refreshCategories(); // Sync storefront navbar & filters
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  // Safe Deletion Handler
  const handleDeleteClick = async (cat) => {
    try {
      // Attempt standard delete
      await API.delete(`/categories/${cat._id}`);
      await fetchCategoriesList();
      await refreshCategories();
    } catch (err) {
      // If products associated, backend returns requiresReassignment
      if (err.message.includes('product') || cat.productCount > 0) {
        setSafeDeleteModal({
          open: true,
          category: cat,
          productCount: cat.productCount || 1,
          targetCategoryId: categories.find((c) => c._id !== cat._id)?._id || '',
        });
      } else {
        alert(err.message);
      }
    }
  };

  const handleReassignAndDelete = async () => {
    if (!safeDeleteModal.category || !safeDeleteModal.targetCategoryId) return;

    try {
      await API.post(`/categories/${safeDeleteModal.category._id}/reassign-and-delete`, {
        targetCategoryId: safeDeleteModal.targetCategoryId,
      });
      setSafeDeleteModal({ open: false, category: null, productCount: 0, targetCategoryId: '' });
      await fetchCategoriesList();
      await refreshCategories();
    } catch (err) {
      alert(err.message || 'Reassignment failed.');
    }
  };

  const handleArchiveInstead = async () => {
    if (!safeDeleteModal.category) return;
    try {
      await API.put(`/categories/${safeDeleteModal.category._id}`, { isActive: false });
      setSafeDeleteModal({ open: false, category: null, productCount: 0, targetCategoryId: '' });
      await fetchCategoriesList();
      await refreshCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
            Dynamic Taxonomy Architecture
          </span>
          <h1 className="font-serif text-2xl font-bold text-luxury-black">
            Footwear Categories ({categories.length})
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Categories created here immediately appear in the customer navigation bar, shop filters, and collections.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-luxury-gold uppercase tracking-wider animate-pulse">
            Loading dynamic categories...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug Identifier</th>
                  <th className="py-3 px-4">Subcategories</th>
                  <th className="py-3 px-4">Assigned Products</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-gray-500">
                      #{cat.displayOrder}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={cat.image || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'}
                          alt=""
                          className="w-10 h-10 object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-luxury-black text-sm block">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-gray-400 line-clamp-1">
                            {cat.description || 'No description provided'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cat.subcategories && cat.subcategories.length > 0 ? (
                          cat.subcategories.map((sub, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded-sm">
                              {sub.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-[10px] italic">None configured</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold font-sans text-luxury-black">
                        {cat.productCount || 0} Products
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {cat.isActive ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Visible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-gray-400 text-[10px] font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Archived</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-gray-400 hover:text-luxury-gold"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(cat)}
                          className="p-1.5 text-gray-400 hover:text-red-600"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full p-6 border border-luxury-gray space-y-4">
            <h3 className="font-serif text-lg font-bold text-luxury-black">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Dynamic Category'}
            </h3>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Italian Loafers"
                  className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Category Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Subcategories (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.subcategories}
                  onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                  placeholder="Penny Loafers, Horsebit Loafers, Driving Shoes"
                  className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
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
                    <span className="font-semibold">Active in Navigation</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Short Editorial Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief tagline or description of this footwear line..."
                  className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
                />
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
                  {formLoading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Category Deletion & Reassignment Modal */}
      {safeDeleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full p-6 border border-luxury-gray space-y-4">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-serif text-lg font-bold text-luxury-black">
                Safe Category Deletion Protection
              </h3>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              The category <strong>"{safeDeleteModal.category?.name}"</strong> currently has{' '}
              <strong>{safeDeleteModal.productCount}</strong> footwear product(s) assigned to it.
              To prevent accidental catalog data loss, please select a destination category to reassign these products to, or archive the category instead.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Reassign Products To Category:
                </label>
                <select
                  value={safeDeleteModal.targetCategoryId}
                  onChange={(e) =>
                    setSafeDeleteModal({ ...safeDeleteModal, targetCategoryId: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 font-semibold"
                >
                  {categories
                    .filter((c) => c._id !== safeDeleteModal.category?._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                Selecting <strong>"Reassign & Delete"</strong> will automatically update all {safeDeleteModal.productCount} products to the selected target category before permanently removing "{safeDeleteModal.category?.name}".
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3">
              <button
                type="button"
                onClick={() =>
                  setSafeDeleteModal({ open: false, category: null, productCount: 0, targetCategoryId: '' })
                }
                className="py-2.5 px-4 border border-gray-300 text-xs uppercase tracking-wider font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchiveInstead}
                className="py-2.5 px-4 bg-gray-100 text-luxury-black hover:bg-gray-200 text-xs uppercase tracking-wider font-semibold"
              >
                Archive Category (Hide)
              </button>
              <button
                type="button"
                onClick={handleReassignAndDelete}
                className="py-2.5 px-4 bg-red-600 text-white text-xs uppercase tracking-wider font-bold hover:bg-red-700"
              >
                Reassign & Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
