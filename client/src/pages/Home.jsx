import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Star,
  CheckCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useCategories } from '../context/CategoryContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';

const Home = () => {
  const { categories } = useCategories();
  const { settings } = useStoreSettings();

  const [heroBanners, setHeroBanners] = useState([]);
  const [promoBanner, setPromoBanner] = useState(null);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [verifiedReviews, setVerifiedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        // Fetch hero banners
        const bannerRes = await API.get('/banners?type=hero');
        if (bannerRes.data?.banners) {
          setHeroBanners(bannerRes.data.banners);
        }

        // Fetch promo banner
        const promoRes = await API.get('/banners?type=promo');
        if (promoRes.data?.banners?.length > 0) {
          setPromoBanner(promoRes.data.banners[0]);
        }

        // Fetch New Arrivals
        const newRes = await API.get('/products?newArrival=true&limit=4');
        if (newRes.data?.products) {
          setNewArrivals(newRes.data.products);
        }

        // Fetch Best Sellers
        const bestRes = await API.get('/products?bestSeller=true&limit=4');
        if (bestRes.data?.products) {
          setBestSellers(bestRes.data.products);
        }

        // Fetch recent verified reviews
        try {
          const revRes = await API.get('/reviews/admin/all');
          if (revRes.data?.reviews) {
            const approved = revRes.data.reviews
              .filter((r) => r.status === 'approved' && r.isVerifiedPurchase)
              .slice(0, 3);
            setVerifiedReviews(approved);
          }
        } catch (e) {}
      } catch (err) {
        console.warn('Error loading homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const activeHero = heroBanners[0] || {
    title: 'Step Into Style.',
    subtitle: 'The 2026 Sovereign Footwear Collection',
    tagline: 'HANDCRAFTED ARTISTRY',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1600&q=85',
    buttonText: 'Shop New Arrivals',
    link: '/shop',
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* A. HERO SECTION */}
      <section className="relative bg-luxury-black text-white min-h-[580px] sm:min-h-[660px] flex items-center overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeHero.imageUrl}
            alt="Raza Shoe Palace Hero Collection"
            className="w-full h-full object-cover object-center opacity-45 transform scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-luxury-black/75 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-luxury-charcoal/80 border border-luxury-gold/40 text-luxury-gold text-xs uppercase tracking-ultra font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeHero.tagline || 'Step Into Style.'}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
              {activeHero.title || 'Step Into Style.'}
            </h1>

            <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed max-w-lg">
              {activeHero.subtitle ||
                'Discover footwear that brings together comfort, confidence, and timeless style. Hand-lasted from full-grain leathers and high-resilience soles.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to={activeHero.link || '/shop'}
                className="px-8 py-4 bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-luxury hover:bg-luxury-gold-light hover:shadow-lg transition-all text-center"
              >
                {activeHero.buttonText || 'Shop Collection'}
              </Link>
              <Link
                to="/shop"
                className="px-8 py-4 bg-transparent border border-white/40 text-white font-semibold text-xs uppercase tracking-luxury hover:bg-white hover:text-luxury-black transition-all text-center"
              >
                Explore All Styles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* B. DYNAMIC CATEGORY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
            Curated Lines
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black">
            Shop By Footwear Category
          </h2>
          <div className="w-16 h-0.5 bg-luxury-gold mx-auto mt-3"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="group flex flex-col text-center"
            >
              <div className="aspect-square bg-luxury-ivory overflow-hidden relative border border-luxury-gray mb-3 transition-luxury group-hover:border-luxury-gold group-hover:shadow-md">
                <img
                  src={
                    cat.image ||
                    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-luxury-black/10 group-hover:bg-transparent transition-colors" />
              </div>
              <h3 className="font-serif text-sm font-bold text-luxury-black group-hover:text-luxury-gold transition-colors">
                {cat.name}
              </h3>
              {cat.productCount !== undefined && (
                <span className="text-[11px] text-luxury-muted mt-0.5">
                  {cat.productCount} {cat.productCount === 1 ? 'Design' : 'Designs'}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* C. FEATURED NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-luxury-gray">
            <div>
              <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
                Fresh From The Atelier
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/shop?newArrival=true"
              className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-luxury-black hover:text-luxury-gold transition-colors mt-2 sm:mt-0"
            >
              <span>View All New Releases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* D. PROMOTIONAL BANNER */}
      {promoBanner && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-luxury-charcoal text-white overflow-hidden border border-luxury-charcoal/80">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              <div className="p-8 sm:p-14 lg:p-16 space-y-6 z-10">
                <span className="text-xs font-bold uppercase tracking-ultra text-luxury-gold">
                  {promoBanner.tagline || 'LIMITED SEASONAL PRIVILEGE'}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {promoBanner.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
                  {promoBanner.subtitle}
                </p>
                <div className="pt-2">
                  <Link
                    to={promoBanner.link || '/shop'}
                    className="inline-block px-8 py-3.5 bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-luxury hover:bg-luxury-gold-light transition-colors"
                  >
                    {promoBanner.buttonText || 'Discover Now'}
                  </Link>
                </div>
              </div>

              <div className="h-64 sm:h-96 lg:h-full relative overflow-hidden">
                <img
                  src={promoBanner.imageUrl}
                  alt={promoBanner.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* E. BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-luxury-gray">
            <div>
              <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
                Client Favorites
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black">
                Best Sellers
              </h2>
            </div>
            <Link
              to="/shop?bestSeller=true"
              className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-luxury-black hover:text-luxury-gold transition-colors mt-2 sm:mt-0"
            >
              <span>Explore All Best Sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* F. BRAND STORY */}
      <section className="bg-luxury-ivory py-16 sm:py-24 border-y border-luxury-gray/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] bg-white border border-luxury-gray overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&w=1200&q=80"
                alt="Raza Shoe Palace Artisans"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 border border-luxury-gray text-center">
                <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block">
                  CRAFTSMANSHIP PLEDGE
                </span>
                <p className="text-xs font-bold text-luxury-black mt-0.5">
                  Hand-Cut French & Italian Leathers · Ergonomic Memory Arch Beds
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-ultra font-bold">
                <Award className="w-4 h-4" />
                <span>The Heritage of Raza Shoe Palace</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black leading-tight">
                Where Traditional Cobbling Meets Modern Executive Style.
              </h2>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                At RAZA SHOE PALACE, footwear is never merely an accessory — it is the cornerstone of posture,
                confidence, and poise. Every pair is conceived with strict attention to foot anatomy, premium
                breathable linings, and long-lasting soles engineered to carry you through high-stakes boardrooms,
                weekend escapes, and evening galas.
              </p>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                We believe in uncompromising quality: no shortcuts, no synthetic compromises on our core leathers,
                and an unwavering promise of transparent pricing and doorstep concierge care.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white border border-luxury-gray">
                  <h4 className="font-serif font-bold text-lg text-luxury-black">100% Genuine</h4>
                  <p className="text-xs text-luxury-muted mt-1">Full-grain leathers & tested athletic meshes</p>
                </div>
                <div className="p-4 bg-white border border-luxury-gray">
                  <h4 className="font-serif font-bold text-lg text-luxury-black">Direct Factory Store</h4>
                  <p className="text-xs text-luxury-muted mt-1">Artisan luxury without retail markups</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* G. VERIFIED CUSTOMER REVIEWS */}
      {verifiedReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
              Genuine Verified Feedback
            </span>
            <h2 className="font-serif text-3xl font-bold text-luxury-black">
              Client Commendations
            </h2>
            <p className="text-xs text-luxury-muted mt-2">
              Reviews submitted exclusively by verified purchasers following delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {verifiedReviews.map((rev) => (
              <div key={rev._id} className="p-6 bg-white border border-luxury-gray flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1 text-luxury-gold mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-luxury-gold' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <h4 className="font-bold text-sm text-luxury-black mb-1">"{rev.title}"</h4>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-luxury-gray/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-luxury-black block">{rev.userName}</span>
                    <span className="text-[10px] text-luxury-muted">Verified Client</span>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-700 text-[10px] font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified Purchase</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
