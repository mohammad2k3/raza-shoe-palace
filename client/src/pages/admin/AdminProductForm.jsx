import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Boxes,
} from 'lucide-react';
import API from '../../services/api';
import { useCategories } from '../../context/CategoryContext';

const AdminProductForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { categories } = useCategories();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('Raza Palace Collection');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');

  // Flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images list
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Variants array: { size, color, colorCode, stock, sku }
  const [variants, setVariants] = useState([
    { size: 'UK 7', color: 'Black', colorCode: '#151515', stock: 10, sku: '' },
    { size: 'UK 8', color: 'Black', colorCode: '#151515', stock: 15, sku: '' },
    { size: 'UK 9', color: 'Black', colorCode: '#151515', stock: 10, sku: '' },
    { size: 'UK 10', color: 'Black', colorCode: '#151515', stock: 5, sku: '' },
  ]);

  // Specifications: { key, value }
  const [specifications, setSpecifications] = useState([
    { key: 'Upper Material', value: 'Full-Grain Calfskin Leather' },
    { key: 'Sole Construction', value: 'Goodyear Welted with Rubber Traction' },
    { key: 'Lining', value: 'Supple Breathable Leather' },
    { key: 'Insole', value: 'Ergonomic Memory Arch Support' },
  ]);

  // If editing, fetch product details
  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await API.get(`/products/${id}`);
          if (res.data?.success && res.data.product) {
            const p = res.data.product;
            setName(p.name);
            setSku(p.sku);
            setBrand(p.brand);
            setCategory(p.category?._id || p.category);
            setSubcategory(p.subcategory || '');
            setShortDescription(p.shortDescription || '');
            setDescription(p.description);
            setRegularPrice(p.regularPrice);
            setSalePrice(p.salePrice || '');
            setIsFeatured(p.isFeatured);
            setIsNewArrival(p.isNewArrival);
            setIsBestSeller(p.isBestSeller);
            setIsActive(p.isActive);
            setImages(p.images || []);
            if (p.variants?.length > 0) setVariants(p.variants);
            if (p.specifications?.length > 0) setSpecifications(p.specifications);
          }
        } catch (err) {
          setErrorMessage(err.message || 'Failed to load product details.');
        } finally {
          setFetchLoading(false);
        }
      };

      fetchProduct();
    } else if (categories.length > 0 && !category) {
      setCategory(categories[0]._id);
    }
  }, [id, isEditing, categories]);

  // Handle image upload from computer
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      const res = await API.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.urls) {
        setImages([...images, ...res.data.urls]);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Variant Helpers
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { size: 'UK 8', color: 'Black', colorCode: '#151515', stock: 5, sku: '' },
    ]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  // Specifications Helpers
  const handleAddSpec = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !regularPrice || !category) {
      setErrorMessage('Product title, category, and regular price are mandatory.');
      return;
    }

    if (variants.length === 0) {
      setErrorMessage('Please configure at least one size/color variant with inventory stock.');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Please provide at least one product photograph.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        sku: sku ? sku.trim() : undefined,
        brand,
        category,
        subcategory,
        shortDescription,
        description,
        regularPrice: Number(regularPrice),
        salePrice: salePrice ? Number(salePrice) : null,
        images,
        variants: variants.map((v) => ({
          ...v,
          stock: Number(v.stock) || 0,
        })),
        specifications: specifications.filter((s) => s.key && s.value),
        isFeatured,
        isNewArrival,
        isBestSeller,
        isActive,
      };

      if (isEditing) {
        await API.put(`/products/${id}`, payload);
        setSuccessMessage('Footwear details updated successfully!');
      } else {
        await API.post('/products', payload);
        setSuccessMessage('New footwear design created and active in store!');
        setTimeout(() => navigate('/admin/products'), 1500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  // Find subcategories of selected category
  const selectedCatObj = categories.find((c) => c._id === category);
  const availableSubcategories = selectedCatObj?.subcategories || [];

  if (fetchLoading) {
    return (
      <div className="p-12 text-center text-xs text-luxury-gold uppercase tracking-wider animate-pulse">
        Loading product information...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/products"
            className="p-2 border border-gray-200 hover:bg-gray-100 rounded-sm text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block">
              {isEditing ? 'Modify Existing Model' : 'New Footwear Addition'}
            </span>
            <h1 className="font-serif text-2xl font-bold text-luxury-black">
              {isEditing ? `Edit: ${name}` : 'Create Footwear Product'}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving Design...' : isEditing ? 'Update Footwear' : 'Publish Product'}
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Identity & Categorization */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-luxury-black pb-3 border-b border-gray-100">
            1. General Footwear Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Sovereign Cap-Toe Oxford"
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Raza Heritage / AeroStride"
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Base SKU (Optional - Auto Generated if Empty)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="RSP-OXF-001"
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold uppercase font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Subcategory (Optional)
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Oxfords, Running Shoes, Loafers"
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-luxury-black pb-3 border-b border-gray-100">
            2. Pricing Architecture (INR)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Regular Retail Price (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                placeholder="6999"
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Promotional Sale Price (₹) (Optional)
              </label>
              <input
                type="number"
                min={0}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="5499 (Leave blank if no discount)"
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Variant-Wise Inventory Matrix */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-serif text-base font-bold text-luxury-black flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-luxury-gold" />
                <span>3. Size & Color Variant Inventory Matrix</span>
              </h3>
              <p className="text-xs text-gray-500">
                Maintain distinct physical inventory for each size and color permutation.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-luxury-ivory border border-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-luxury-black hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Size (e.g. UK 8)</th>
                  <th className="py-2.5 px-3">Color</th>
                  <th className="py-2.5 px-3">Hex / Swatch</th>
                  <th className="py-2.5 px-3">Available Stock *</th>
                  <th className="py-2.5 px-3">Variant SKU</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((v, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        required
                        value={v.size}
                        onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                        placeholder="UK 8"
                        className="w-24 p-1.5 border border-gray-200"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        required
                        value={v.color}
                        onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                        placeholder="Black"
                        className="w-28 p-1.5 border border-gray-200"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={v.colorCode || '#151515'}
                          onChange={(e) => handleVariantChange(idx, 'colorCode', e.target.value)}
                          className="w-7 h-7 p-0 border border-gray-200 cursor-pointer"
                        />
                        <span className="font-mono text-[10px] text-gray-500">{v.colorCode}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min={0}
                        required
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                        className="w-20 p-1.5 border border-gray-200 font-bold font-sans"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={v.sku || ''}
                        onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                        placeholder="Auto generated"
                        className="w-36 p-1.5 border border-gray-200 uppercase font-mono text-[11px]"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Imagery */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-serif text-base font-bold text-luxury-black flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-luxury-gold" />
                <span>4. Product Photography & Visuals</span>
              </h3>
              <p className="text-xs text-gray-500">
                Upload multiple footwear angles to Cloudinary/local storage or enter image URLs.
              </p>
            </div>
          </div>

          {/* Upload input and URL input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-sm text-center flex flex-col items-center justify-center space-y-2 hover:border-luxury-gold transition-colors">
              <Upload className="w-6 h-6 text-gray-400" />
              <label className="cursor-pointer font-bold text-luxury-black uppercase tracking-wider hover:underline">
                <span>{uploadingImage ? 'Uploading...' : 'Upload Image Files'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] text-gray-400">JPEG, PNG, WEBP up to 5MB</span>
            </div>

            <div className="space-y-2">
              <label className="block font-semibold uppercase tracking-wider text-gray-700">
                Or Add Image Web URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 p-2 border border-gray-200 focus:outline-none focus:border-luxury-gold"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-luxury-black text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square border border-gray-200 overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-luxury-black/80 text-white text-[9px] uppercase tracking-wider text-center py-0.5">
                      Main Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Descriptions & Specifications */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-luxury-black pb-3 border-b border-gray-100">
            5. Descriptions & Material Specifications
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Short Highlight Sentence
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Full-grain French calfskin with Goodyear welted Argentine leather sole."
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Detailed Product Story & Construction *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the footwear leather, last shape, arch ergonomics, stitching details, and styling recommendations..."
                className="w-full p-2.5 border border-gray-200 focus:outline-none focus:border-luxury-gold"
              />
            </div>

            {/* Specifications Key-Value */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold uppercase tracking-wider text-gray-700">
                  Technical Specifications
                </span>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="text-xs text-luxury-gold font-bold hover:underline"
                >
                  + Add Specification
                </button>
              </div>

              <div className="space-y-2">
                {specifications.map((s, idx) => (
                  <div key={idx} className="flex space-x-2">
                    <input
                      type="text"
                      value={s.key}
                      onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                      placeholder="e.g. Upper Material"
                      className="w-1/3 p-2 border border-gray-200"
                    />
                    <input
                      type="text"
                      value={s.value}
                      onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                      placeholder="e.g. 100% Genuine French Calfskin"
                      className="flex-1 p-2 border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Display Badges & Visibility */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-luxury-black pb-3 border-b border-gray-100">
            6. Featured Badges & Store Visibility
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <label className="flex items-center space-x-2 p-3 border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-luxury-black"
              />
              <span className="font-semibold text-luxury-black">Live / Active</span>
            </label>

            <label className="flex items-center space-x-2 p-3 border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-luxury-black"
              />
              <span className="font-semibold text-luxury-black">Featured Collection</span>
            </label>

            <label className="flex items-center space-x-2 p-3 border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="accent-luxury-black"
              />
              <span className="font-semibold text-luxury-black">New Arrival</span>
            </label>

            <label className="flex items-center space-x-2 p-3 border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="accent-luxury-black"
              />
              <span className="font-semibold text-luxury-black">Best Seller</span>
            </label>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="flex justify-end space-x-4 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 border border-gray-300 text-xs font-semibold uppercase tracking-wider"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-luxury-black text-white text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold hover:text-luxury-black transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving Design...' : isEditing ? 'Save Changes' : 'Publish Footwear Model'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
