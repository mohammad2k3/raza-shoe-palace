import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight, Eye } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../utils/format';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-luxury-ivory rounded-full flex items-center justify-center mx-auto mb-4 border border-luxury-gray">
          <Heart className="w-8 h-8 text-luxury-gold" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-luxury-black mb-3">
          Your Wishlist is Empty
        </h1>
        <p className="text-xs sm:text-sm text-luxury-muted max-w-md mx-auto mb-8">
          Save your favorite footwear designs here as you browse our collections and return whenever you are ready.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 px-8 py-4 bg-luxury-black text-white text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold hover:text-luxury-black transition-colors"
        >
          <span>Discover Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Saved Favorites
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black">
          Client Wishlist ({wishlist.length})
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((item) => (
          <div key={item._id} className="group relative bg-white border border-luxury-gray flex flex-col justify-between">
            <div className="aspect-[4/5] bg-luxury-ivory overflow-hidden relative">
              <img
                src={item.images?.[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                type="button"
                onClick={() => removeFromWishlist(item._id)}
                className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-red-50 text-red-500 shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <span className="text-[10px] uppercase tracking-ultra text-luxury-muted font-bold block mb-1">
                {item.brand}
              </span>
              <Link
                to={`/product/${item.slug}`}
                className="font-serif text-sm font-bold text-luxury-black hover:text-luxury-gold line-clamp-1 mb-2"
              >
                {item.name}
              </Link>

              <div className="mt-auto pt-2 flex items-baseline space-x-2">
                <span className="text-sm font-bold text-luxury-black font-sans">
                  {formatCurrency(item.salePrice || item.regularPrice)}
                </span>
                {item.salePrice && (
                  <span className="text-xs text-luxury-muted line-through font-sans">
                    {formatCurrency(item.regularPrice)}
                  </span>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-luxury-gray">
                <Link
                  to={`/product/${item.slug}`}
                  className="w-full py-2 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors block text-center"
                >
                  Select Size & Buy
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
