import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency, calculateDiscountPercent } from '../../utils/format';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product._id);
  const discountPercent = calculateDiscountPercent(product.regularPrice, product.salePrice);
  const totalStock = product.totalStock ?? product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0);
  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const displayImage = product.images?.[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80';
  const hoverImage = product.images?.[1] || displayImage;

  return (
    <>
      <div className="group relative bg-white flex flex-col h-full border border-transparent hover:border-luxury-gray/80 transition-all duration-300">
        {/* Image Frame */}
        <div className="relative aspect-[4/5] bg-luxury-ivory overflow-hidden">
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="absolute top-3 left-3 z-10 bg-luxury-black text-luxury-gold text-[10px] font-bold tracking-wider uppercase px-2 py-1">
              -{discountPercent}% OFF
            </span>
          )}

          {/* New Arrival Badge */}
          {product.isNewArrival && discountPercent === 0 && (
            <span className="absolute top-3 left-3 z-10 bg-white/95 text-luxury-black text-[10px] font-bold tracking-wider uppercase px-2 py-1 border border-luxury-gray">
              New Arrival
            </span>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-luxury-black hover:text-red-500 hover:scale-110 transition-all"
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {/* Product Image Link */}
          <Link to={`/product/${product.slug}`} className="block w-full h-full">
            <img
              src={displayImage}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </Link>

          {/* Quick Action Overlay on Desktop */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              className="flex-1 py-2 px-3 bg-white text-luxury-black text-xs font-semibold uppercase tracking-wider hover:bg-luxury-gold transition-colors flex items-center justify-center space-x-1.5 shadow-md"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 flex flex-col flex-1">
          {/* Brand & Stock Status */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider mb-1">
            <span className="text-luxury-muted font-medium">{product.brand || 'Raza Palace'}</span>
            {isOutOfStock ? (
              <span className="text-red-600 font-semibold">Sold Out</span>
            ) : isLowStock ? (
              <span className="text-amber-600 font-medium">Only {totalStock} Left</span>
            ) : (
              <span className="text-emerald-700 font-medium">In Stock</span>
            )}
          </div>

          {/* Product Name */}
          <Link
            to={`/product/${product.slug}`}
            className="font-serif text-sm font-bold text-luxury-black hover:text-luxury-gold transition-colors line-clamp-1 mb-2"
          >
            {product.name}
          </Link>

          {/* Price */}
          <div className="mt-auto flex items-baseline space-x-2">
            {product.salePrice ? (
              <>
                <span className="text-sm font-bold text-luxury-black font-sans">
                  {formatCurrency(product.salePrice)}
                </span>
                <span className="text-xs text-luxury-muted line-through font-sans">
                  {formatCurrency(product.regularPrice)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-luxury-black font-sans">
                {formatCurrency(product.regularPrice)}
              </span>
            )}
          </div>

          {/* Available Sizes list preview */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-luxury-gray/50 flex items-center space-x-1 overflow-x-auto text-[10px] text-luxury-muted">
              <span className="font-semibold text-luxury-black">Sizes:</span>
              {[...new Set(product.variants.map((v) => v.size))].slice(0, 5).map((size, idx) => (
                <span key={idx} className="bg-luxury-ivory px-1.5 py-0.5 border border-luxury-gray/80">
                  {size}
                </span>
              ))}
              {[...new Set(product.variants.map((v) => v.size))].length > 5 && (
                <span>+{product.variants.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
};

export default ProductCard;
