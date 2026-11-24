import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Check, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency, calculateDiscountPercent } from '../../utils/format';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();

  // Extract unique sizes and colors
  const sizes = [...new Set(product.variants?.map((v) => v.size) || [])];
  const colors = [...new Set(product.variants?.map((v) => v.color) || [])];

  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(colors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Find variant matching current selection
  const selectedVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const variantStock = selectedVariant ? selectedVariant.stock : 0;
  const isAvailable = variantStock > 0;
  const discountPercent = calculateDiscountPercent(product.regularPrice, product.salePrice);
  const effectivePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.regularPrice;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setFeedback('Please choose size and color.');
      return;
    }
    const result = addToCart(product, selectedSize, selectedColor, quantity, variantStock);
    if (result.success) {
      setFeedback('Added to your shopping bag!');
      setTimeout(() => {
        setFeedback('');
        onClose();
      }, 1200);
    } else {
      setFeedback(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative bg-white max-w-3xl w-full shadow-2xl border border-luxury-gray overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-luxury-black hover:text-luxury-gold bg-white/80 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images Section */}
          <div className="bg-luxury-ivory p-6 flex flex-col justify-between">
            <div className="aspect-[4/5] overflow-hidden mb-3">
              <img
                src={product.images?.[activeImageIndex] || product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 border ${
                      activeImageIndex === idx ? 'border-luxury-black' : 'border-luxury-gray'
                    } overflow-hidden shrink-0`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-ultra text-luxury-muted font-bold block mb-1">
                {product.brand}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-luxury-black mb-3">
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline space-x-3 mb-4">
                <span className="text-xl font-bold text-luxury-black font-sans">
                  {formatCurrency(effectivePrice)}
                </span>
                {product.salePrice && (
                  <>
                    <span className="text-sm text-luxury-muted line-through">
                      {formatCurrency(product.regularPrice)}
                    </span>
                    <span className="text-xs text-luxury-gold font-bold uppercase tracking-wider">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs text-gray-600 line-clamp-3 mb-5 leading-relaxed">
                {product.shortDescription || product.description}
              </p>

              {/* Color Selector */}
              {colors.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-luxury-black uppercase tracking-wider">Color:</span>
                    <span className="text-luxury-muted">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1.5 text-xs uppercase tracking-wider border font-medium transition-all ${
                          selectedColor === c
                            ? 'border-luxury-black bg-luxury-black text-white'
                            : 'border-luxury-gray bg-white text-luxury-black hover:border-luxury-gold'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-luxury-black uppercase tracking-wider">Size:</span>
                    <span className="text-luxury-muted">
                      {isAvailable ? `${variantStock} units available` : 'Out of stock'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((s) => {
                      const v = product.variants?.find((item) => item.size === s && item.color === selectedColor);
                      const hasStock = v ? v.stock > 0 : false;

                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          disabled={!hasStock}
                          className={`py-2 text-xs font-semibold uppercase tracking-wider border text-center transition-all ${
                            selectedSize === s
                              ? 'border-luxury-black bg-luxury-black text-white'
                              : hasStock
                              ? 'border-luxury-gray bg-white text-luxury-black hover:border-luxury-gold'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-luxury-black">Qty:</span>
                <div className="flex items-center border border-luxury-gray">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-sm font-bold hover:bg-luxury-ivory"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(variantStock, q + 1))}
                    disabled={quantity >= variantStock}
                    className="px-3 py-1 text-sm font-bold hover:bg-luxury-ivory disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              {feedback && (
                <div className="mb-3 text-xs font-medium text-luxury-gold text-center">
                  {feedback}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="w-full py-3.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold hover:text-luxury-black transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAvailable ? 'Add To Bag' : 'Sold Out'}</span>
              </button>

              <div className="mt-3 text-center">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-luxury-black hover:text-luxury-gold transition-colors"
                >
                  <span>View Complete Specifications & Reviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
