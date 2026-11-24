import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Search,
} from 'lucide-react';
import { useCategories } from '../context/CategoryContext';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';

const standardSizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
const standardColors = ['Black', 'Brown', 'White', 'Tan', 'Red', 'Navy'];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states initialized from URL params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page')) || 1;
  const inStockParam = searchParams.get('inStock') === 'true';
  const hasDiscountParam = searchParams.get('hasDiscount') === 'true';
  const sizeParam = searchParams.get('size') || '';
  const colorParam = searchParams.get('color') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  // Local state for search bar inside shop
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [priceRange, setPriceRange] = useState({ min: minPriceParam, max: maxPriceParam });

  useEffect(() => {
    setSearchTerm(searchParam);
  }, [searchParam]);

  // Fetch products whenever searchParams changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(searchParams);
        if (!queryParams.has('limit')) queryParams.set('limit', '12');

        const res = await API.get(`/products?${queryParams.toString()}`);
        if (res.data?.success) {
          setProducts(res.data.products || []);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.warn('Failed to load shop products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  // Helpers to update URL search params
  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === false) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchTerm.trim());
  };

  const handlePriceApply = () => {
    const next = new URLSearchParams(searchParams);
    if (priceRange.min) next.set('minPrice', priceRange.min);
    else next.delete('minPrice');

    if (priceRange.max) next.set('maxPrice', priceRange.max);
    else next.delete('maxPrice');

    next.set('page', '1');
    setSearchParams(next);
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setPriceRange({ min: '', max: '' });
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = [
    categoryParam,
    searchParam,
    inStockParam,
    hasDiscountParam,
    sizeParam,
    colorParam,
    minPriceParam,
    maxPriceParam,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title & Breadcrumb */}
      <div className="mb-8">
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Handcrafted Footwear Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black">
          {categoryParam
            ? categories.find((c) => c.slug === categoryParam)?.name || 'Footwear Collection'
            : 'Explore All Shoes'}
        </h1>
        <p className="text-xs sm:text-sm text-luxury-muted mt-1">
          Showing {products.length} of {total} artisan footwear designs
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-luxury-gray">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-luxury-ivory border border-luxury-gray text-xs font-bold uppercase tracking-wider text-luxury-black"
          >
            <SlidersHorizontal className="w-4 h-4 text-luxury-gold" />
            <span>Filters ({activeFiltersCount})</span>
          </button>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-luxury-muted hover:text-luxury-black flex items-center space-x-1 underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}
        </div>

        {/* Search inside shop */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search footwear..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-luxury-ivory border border-luxury-gray focus:outline-none focus:border-luxury-gold"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-luxury-muted" />
        </form>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-luxury-muted uppercase tracking-wider font-semibold">Sort By:</span>
          <select
            value={sortParam}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="text-xs font-semibold py-2 px-3 bg-white border border-luxury-gray focus:outline-none focus:border-luxury-gold tracking-wide"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Client Rating & Popularity</option>
            <option value="best-selling">Best Sellers</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-8 pr-4">
          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-ultra text-luxury-black pb-2 mb-3 border-b border-luxury-gray">
              Categories
            </h3>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => updateParam('category', '')}
                className={`w-full text-left py-1.5 px-2 font-medium flex justify-between items-center transition-colors ${
                  !categoryParam
                    ? 'bg-luxury-black text-white font-bold'
                    : 'text-luxury-black hover:bg-luxury-ivory'
                }`}
              >
                <span>All Footwear</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left py-1.5 px-2 font-medium flex justify-between items-center transition-colors ${
                    categoryParam === cat.slug
                      ? 'bg-luxury-black text-white font-bold'
                      : 'text-gray-700 hover:bg-luxury-ivory hover:text-luxury-black'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.productCount !== undefined && (
                    <span className="text-[10px] opacity-75">({cat.productCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-ultra text-luxury-black pb-2 mb-3 border-b border-luxury-gray">
              UK Shoe Size
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {standardSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateParam('size', sizeParam === s ? '' : s)}
                  className={`py-2 text-xs font-semibold uppercase tracking-wider border text-center transition-all ${
                    sizeParam === s
                      ? 'bg-luxury-black text-white border-luxury-black'
                      : 'bg-white text-luxury-black border-luxury-gray hover:border-luxury-gold'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-ultra text-luxury-black pb-2 mb-3 border-b border-luxury-gray">
              Primary Color
            </h3>
            <div className="flex flex-wrap gap-2">
              {standardColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateParam('color', colorParam === c ? '' : c)}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wider border font-medium transition-all ${
                    colorParam === c
                      ? 'bg-luxury-black text-white border-luxury-black'
                      : 'bg-white text-luxury-black border-luxury-gray hover:border-luxury-gold'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-ultra text-luxury-black pb-2 mb-3 border-b border-luxury-gray">
              Price (INR)
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-1/2 p-2 text-xs border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
              <span className="text-luxury-muted">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-1/2 p-2 text-xs border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
            </div>
            <button
              type="button"
              onClick={handlePriceApply}
              className="w-full py-1.5 bg-luxury-ivory border border-luxury-gray text-xs font-semibold uppercase tracking-wider hover:bg-luxury-black hover:text-white transition-colors"
            >
              Apply Price
            </button>
          </div>

          {/* Availability & Offers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-ultra text-luxury-black pb-2 mb-3 border-b border-luxury-gray">
              Availability & Privileges
            </h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateParam('inStock', e.target.checked)}
                  className="rounded text-luxury-black focus:ring-luxury-gold accent-luxury-black"
                />
                <span>In Stock Only</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDiscountParam}
                  onChange={(e) => updateParam('hasDiscount', e.target.checked)}
                  className="rounded text-luxury-black focus:ring-luxury-gold accent-luxury-black"
                />
                <span>Special Promotional Pricing</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-luxury-ivory animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 pt-6 border-t border-luxury-gray flex items-center justify-center space-x-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => updateParam('page', pageNum)}
                        className={`w-9 h-9 text-xs font-bold transition-all ${
                          pageParam === pageNum
                            ? 'bg-luxury-black text-white'
                            : 'bg-white border border-luxury-gray text-luxury-black hover:border-luxury-gold'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center bg-luxury-ivory border border-luxury-gray">
              <h3 className="font-serif text-xl font-bold text-luxury-black mb-2">
                No matching footwear found
              </h3>
              <p className="text-xs text-luxury-muted max-w-sm mx-auto mb-6">
                We could not find products matching your selected criteria. Try adjusting or clearing your active filters.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-6 py-2.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-luxury-gray">
                <h3 className="font-serif text-lg font-bold text-luxury-black">Refine Collection</h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-luxury-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Category</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => {
                        updateParam('category', categoryParam === c.slug ? '' : c.slug);
                        setMobileFilterOpen(false);
                      }}
                      className={`p-2 border text-left truncate ${
                        categoryParam === c.slug
                          ? 'bg-luxury-black text-white'
                          : 'border-luxury-gray bg-luxury-ivory text-luxury-black'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Size */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Size</h4>
                <div className="grid grid-cols-3 gap-2">
                  {standardSizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        updateParam('size', sizeParam === s ? '' : s);
                        setMobileFilterOpen(false);
                      }}
                      className={`py-2 text-xs border font-semibold ${
                        sizeParam === s
                          ? 'bg-luxury-black text-white'
                          : 'border-luxury-gray bg-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-luxury-gray flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    resetAllFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="flex-1 py-3 border border-luxury-gray text-xs font-semibold uppercase tracking-wider text-luxury-black"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider"
                >
                  Show Results ({total})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
