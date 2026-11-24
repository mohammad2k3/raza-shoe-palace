import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Ruler,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  CheckCircle,
  MapPin,
  Share2,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { formatCurrency, calculateDiscountPercent, formatDate } from '../utils/format';
import ProductCard from '../components/common/ProductCard';
import SizeGuideModal from '../components/common/SizeGuideModal';

const ProductDetail = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useStoreSettings();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected variant state
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Delivery checker state
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  // Notification / Feedback
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Review submission state
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  // Load product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await API.get(`/products/${identifier}`);
        if (res.data?.success && res.data.product) {
          const prod = res.data.product;
          setProduct(prod);

          // Initialize size and color from variants
          if (prod.variants && prod.variants.length > 0) {
            setSelectedSize(prod.variants[0].size);
            setSelectedColor(prod.variants[0].color);
          }

          // Fetch related
          try {
            const relRes = await API.get(`/products/${prod._id}/related`);
            if (relRes.data?.products) {
              setRelatedProducts(relRes.data.products);
            }
          } catch (e) {}

          // Fetch reviews
          try {
            const revRes = await API.get(`/reviews/product/${prod._id}`);
            if (revRes.data?.reviews) {
              setReviews(revRes.data.reviews);
            }
          } catch (e) {}
        }
      } catch (err) {
        setError(err.message || 'Footwear design not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [identifier]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[4/5] bg-luxury-ivory" />
          <div className="space-y-6">
            <div className="h-6 bg-luxury-ivory w-1/3" />
            <div className="h-10 bg-luxury-ivory w-2/3" />
            <div className="h-8 bg-luxury-ivory w-1/4" />
            <div className="h-24 bg-luxury-ivory w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl font-bold text-luxury-black mb-3">Product Unavailable</h2>
        <p className="text-xs text-luxury-muted mb-6">{error || 'This shoe model could not be located.'}</p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
        >
          Return to Footwear Catalog
        </Link>
      </div>
    );
  }

  // Extract unique sizes and colors
  const sizes = [...new Set(product.variants?.map((v) => v.size) || [])];
  const colors = [...new Set(product.variants?.map((v) => v.color) || [])];

  // Current selected variant stock
  const currentVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const currentStock = currentVariant ? currentVariant.stock : 0;
  const isAvailable = currentStock > 0;

  const discountPercent = calculateDiscountPercent(product.regularPrice, product.salePrice);
  const effectivePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.regularPrice;

  // Handlers
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setFeedback({ text: 'Please select both your size and color preference.', type: 'error' });
      return;
    }
    const result = addToCart(product, selectedSize, selectedColor, quantity, currentStock);
    if (result.success) {
      setFeedback({ text: result.message, type: 'success' });
      setTimeout(() => setFeedback({ text: '', type: '' }), 3000);
    } else {
      setFeedback({ text: result.message, type: 'error' });
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      setFeedback({ text: 'Please select both size and color preference.', type: 'error' });
      return;
    }
    const result = addToCart(product, selectedSize, selectedColor, quantity, currentStock);
    if (result.success) {
      navigate('/checkout');
    } else {
      setFeedback({ text: result.message, type: 'error' });
    }
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeResult({ valid: false, message: 'Please enter a valid 6-digit postal PIN code.' });
      return;
    }

    // Realistic delivery estimation calculation (3 to 5 days from today)
    const deliverDate = new Date();
    deliverDate.setDate(deliverDate.getDate() + 3);
    const dateFormatted = deliverDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    setPincodeResult({
      valid: true,
      message: `Delivery available to ${pincode.trim()} by ${dateFormatted}. Cash on Delivery & Express Courier active.`,
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewMessage('Please log in with your verified customer account to write a review.');
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage('');

    try {
      const res = await API.post('/reviews', {
        productId: product._id,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
      });

      if (res.data?.success) {
        setReviewMessage('Thank you! Your verified customer review has been recorded.');
        setReviews([res.data.review, ...reviews]);
        setNewReview({ rating: 5, title: '', comment: '' });
      }
    } catch (err) {
      setReviewMessage(err.message || 'Could not post review. Verified purchase required.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-luxury-muted mb-8 uppercase tracking-wider">
        <Link to="/" className="hover:text-luxury-black">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-luxury-black">Footwear</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-luxury-black">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-luxury-black font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Presentation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-luxury-ivory overflow-hidden relative border border-luxury-gray">
            <img
              src={product.images?.[activeImageIndex] || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-luxury-black text-luxury-gold text-xs font-bold uppercase tracking-wider px-3 py-1.5">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 aspect-square border-2 shrink-0 overflow-hidden transition-all ${
                    activeImageIndex === idx ? 'border-luxury-black' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Variant Selection */}
        <div className="space-y-6">
          {/* Brand & SKU */}
          <div className="flex items-center justify-between text-xs uppercase tracking-ultra">
            <span className="text-luxury-muted font-bold">{product.brand}</span>
            <span className="text-luxury-muted">SKU: {currentVariant?.sku || product.sku}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-luxury-gold">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(product.rating || 5) ? 'fill-luxury-gold' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-luxury-black">
              {product.rating || 5.0} ({reviews.length} Verified Reviews)
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-4 pb-4 border-b border-luxury-gray">
            <span className="text-2xl sm:text-3xl font-bold text-luxury-black font-sans">
              {formatCurrency(effectivePrice)}
            </span>
            {product.salePrice && (
              <>
                <span className="text-base text-luxury-muted line-through font-sans">
                  {formatCurrency(product.regularPrice)}
                </span>
                <span className="text-xs text-luxury-gold font-bold uppercase tracking-wider bg-luxury-black px-2.5 py-1">
                  Save {discountPercent}%
                </span>
              </>
            )}
            <span className="text-xs text-gray-400 font-sans">(Inclusive of all taxes)</span>
          </div>

          {/* Color Selection */}
          {colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Color: <span className="font-bold text-luxury-black">{selectedColor}</span></span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 text-xs uppercase tracking-wider border font-medium transition-all ${
                      selectedColor === c
                        ? 'border-luxury-black bg-luxury-black text-white font-bold'
                        : 'border-luxury-gray bg-white text-luxury-black hover:border-luxury-gold'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider text-luxury-black">
                  Select Size (UK): <span className="font-bold">{selectedSize}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center space-x-1 text-xs text-luxury-gold hover:underline font-semibold"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Conversion Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                {sizes.map((s) => {
                  const v = product.variants?.find((item) => item.size === s && item.color === selectedColor);
                  const hasStock = v ? v.stock > 0 : false;

                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      disabled={!hasStock}
                      className={`py-3 text-xs font-bold uppercase tracking-wider border text-center transition-all ${
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

              {/* Stock Status Indicator */}
              <div className="mt-3 text-xs">
                {isAvailable ? (
                  currentStock <= 5 ? (
                    <span className="text-amber-700 font-semibold flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                      <span>Hurry! Only {currentStock} pairs remaining in this size/color combination.</span>
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center space-x-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>In Stock — Ready for immediate courier dispatch</span>
                    </span>
                  )
                ) : (
                  <span className="text-red-600 font-semibold">
                    Currently out of stock for this size/color selection.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4 pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-luxury-black">Quantity:</span>
            <div className="flex items-center border border-luxury-gray">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3.5 py-1.5 text-sm font-bold hover:bg-luxury-ivory"
              >
                -
              </button>
              <span className="px-5 py-1.5 text-xs font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                disabled={quantity >= currentStock}
                className="px-3.5 py-1.5 text-sm font-bold hover:bg-luxury-ivory disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {feedback.text && (
            <div
              className={`p-3 text-xs font-semibold ${
                feedback.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Action Buttons: Add to Bag, Buy Now, Wishlist */}
          <div className="space-y-3 pt-2">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="flex-1 py-4 bg-luxury-black text-white text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold hover:text-luxury-black transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAvailable ? 'Add To Bag' : 'Out Of Stock'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="p-4 border border-luxury-gray text-luxury-black hover:text-red-500 hover:border-red-300 transition-colors"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-red-500 text-red-500' : ''}`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!isAvailable}
              className="w-full py-4 bg-luxury-gold text-luxury-black text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold-light transition-all disabled:opacity-50"
            >
              Buy Now With Express Checkout
            </button>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="p-4 bg-luxury-ivory border border-luxury-gray space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-luxury-black">
              <MapPin className="w-4 h-4 text-luxury-gold" />
              <span>Check Delivery Pincode</span>
            </div>
            <form onSubmit={handlePincodeCheck} className="flex space-x-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit postal code"
                maxLength={6}
                className="flex-1 px-3 py-2 text-xs bg-white border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-luxury-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
              >
                Verify
              </button>
            </form>
            {pincodeResult && (
              <p
                className={`text-xs mt-1 font-medium ${
                  pincodeResult.valid ? 'text-emerald-800' : 'text-red-600'
                }`}
              >
                {pincodeResult.message}
              </p>
            )}
          </div>

          {/* Assurance Pillars */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-luxury-gray text-xs text-gray-700">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-luxury-gold shrink-0" />
              <span>Free Shipping above ₹{settings.freeShippingThreshold || 1999}</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-luxury-gold shrink-0" />
              <span>{settings.returnWindowDays || 7}-Day Doorstep Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-luxury-gold shrink-0" />
              <span>Razorpay Verified Payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-luxury-gold shrink-0" />
              <span>100% Genuine Handcrafted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description & Specifications */}
      <div className="mt-16 sm:mt-24 border-t border-luxury-gray pt-12 space-y-12">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
            Artisan Craftsmanship
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black mb-4">
            Product Story & Construction
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Specifications Table */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="max-w-3xl">
            <h3 className="font-serif text-lg font-bold text-luxury-black mb-4">
              Material & Technical Specifications
            </h3>
            <div className="border border-luxury-gray divide-y divide-luxury-gray text-xs">
              {product.specifications.map((spec, idx) => (
                <div key={idx} className="grid grid-cols-3 py-3 px-4 hover:bg-luxury-ivory/50">
                  <span className="font-bold text-luxury-black uppercase tracking-wider">{spec.key}</span>
                  <span className="col-span-2 text-gray-700">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Genuine Verified Customer Reviews Section */}
      <div className="mt-16 sm:mt-24 border-t border-luxury-gray pt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
              Client Feedback
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black">
              Verified Purchaser Reviews ({reviews.length})
            </h2>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-6 bg-luxury-ivory border border-luxury-gray space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-luxury-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-luxury-gold' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-luxury-muted">{formatDate(rev.createdAt)}</span>
                </div>

                <h4 className="font-bold text-sm text-luxury-black">{rev.title}</h4>
                <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>

                <div className="flex items-center justify-between pt-3 border-t border-luxury-gray text-xs">
                  <span className="font-bold text-luxury-black">{rev.userName}</span>
                  {rev.isVerifiedPurchase && (
                    <span className="text-emerald-700 text-[11px] font-semibold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-luxury-ivory text-center mb-12 border border-luxury-gray">
            <p className="text-xs text-luxury-muted">
              Be the first verified buyer to share your commendation for this pair.
            </p>
          </div>
        )}

        {/* Submit Review Box */}
        <div className="max-w-2xl bg-white p-6 sm:p-8 border border-luxury-gray space-y-4">
          <h3 className="font-serif text-lg font-bold text-luxury-black">Write a Verified Review</h3>
          <p className="text-xs text-luxury-muted leading-relaxed">
            Only customers who have purchased and received this footwear design can submit a review.
          </p>

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-black mb-1">
                Your Rating:
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="p-1 text-luxury-gold"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= newReview.rating ? 'fill-luxury-gold' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-black mb-1">
                Review Headline
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                placeholder="e.g. Exceptional calfskin quality and all-day comfort"
                required
                className="w-full p-2.5 text-xs border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-black mb-1">
                Detailed Thoughts
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience regarding leather texture, sizing fit, and arch support..."
                rows={4}
                required
                className="w-full p-2.5 text-xs border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
            </div>

            {reviewMessage && (
              <p className="text-xs font-semibold text-luxury-gold">{reviewMessage}</p>
            )}

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-6 py-3 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors disabled:opacity-50"
            >
              {reviewSubmitting ? 'Verifying Purchase...' : 'Submit Verified Review'}
            </button>
          </form>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 sm:mt-24 border-t border-luxury-gray pt-12">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
              Curated Complements
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black">
              You May Also Appreciate
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sizing Guide Modal */}
      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
};

export default ProductDetail;
