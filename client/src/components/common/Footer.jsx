import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { useCategories } from '../../context/CategoryContext';
import API from '../../services/api';

const Footer = () => {
  const { settings } = useStoreSettings();
  const { categories } = useCategories();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null); // 'loading' | 'success' | 'error'
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;

    setNewsletterStatus('loading');
    setNewsletterMessage('');

    try {
      const res = await API.post('/newsletter/subscribe', { email: newsletterEmail });
      setNewsletterStatus('success');
      setNewsletterMessage(res.data?.message || 'Thank you for subscribing to Raza Shoe Palace!');
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterMessage(err.message || 'Subscription failed. Please try again.');
    }
  };

  return (
    <footer className="bg-luxury-black text-gray-300 font-sans border-t border-luxury-charcoal">
      {/* Brand Value Pillars */}
      <div className="border-b border-luxury-charcoal py-10 bg-luxury-charcoal/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-luxury-black border border-luxury-gold/40 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-luxury-gold" />
            </div>
            <div>
              <h4 className="font-semibold text-white tracking-wider text-sm uppercase">Complimentary Express Delivery</h4>
              <p className="text-xs text-gray-400 mt-0.5">Free insured shipping on orders over ₹{settings.freeShippingThreshold || 1999}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-luxury-black border border-luxury-gold/40 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-luxury-gold" />
            </div>
            <div>
              <h4 className="font-semibold text-white tracking-wider text-sm uppercase">{settings.returnWindowDays || 7}-Day Hassle-Free Returns</h4>
              <p className="text-xs text-gray-400 mt-0.5">Simple doorstep return and size exchange service</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-luxury-black border border-luxury-gold/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-luxury-gold" />
            </div>
            <div>
              <h4 className="font-semibold text-white tracking-wider text-sm uppercase">100% Handcrafted Authenticity</h4>
              <p className="text-xs text-gray-400 mt-0.5">Certified premium grade materials and artisan finishing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-luxury text-white">
                {settings.storeName || 'RAZA SHOE PALACE'}
              </span>
              <span className="block text-[10px] tracking-ultra text-luxury-gold uppercase font-semibold">
                {settings.tagline || 'Step Into Style.'}
              </span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Established with an unyielding commitment to artisan craftsmanship, modern elegance, and all-day comfort.
              Our collections are tailored for distinguished gentlemen and discerning footwear connoisseurs.
            </p>

            {/* Business Contact Details */}
            <div className="pt-2 space-y-2 text-xs text-gray-400">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
                <span>
                  {settings.address}, {settings.city}, {settings.state} - {settings.pincode}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-luxury-gold shrink-0" />
                <span>{settings.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-luxury-gold shrink-0" />
                <span>{settings.email}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-3">
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-luxury-charcoal flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-luxury-charcoal flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-luxury-charcoal flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Categories */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-ultra mb-4 pb-1 border-b border-luxury-charcoal">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs">
              {categories.map((cat) => (
                <li key={cat._id}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="text-gray-400 hover:text-luxury-gold transition-colors block py-0.5"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop" className="text-luxury-gold hover:underline block py-0.5 font-medium">
                  Browse All Footwear →
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-ultra mb-4 pb-1 border-b border-luxury-charcoal">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/account/orders" className="hover:text-luxury-gold transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/policies/shipping" className="hover:text-luxury-gold transition-colors">
                  Shipping & Dispatch
                </Link>
              </li>
              <li>
                <Link to="/policies/returns" className="hover:text-luxury-gold transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-luxury-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-luxury-gold transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-luxury-gold transition-colors">
                  Store Locator
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-ultra mb-4 pb-1 border-b border-luxury-charcoal">
              The Sovereign Gazette
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Be the first to receive invitations to private footwear releases, seasonal galas, and bespoke care guides.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-luxury-charcoal/80 border border-luxury-charcoal text-white text-xs px-3.5 py-2.5 pr-10 focus:outline-none focus:border-luxury-gold transition-colors"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-luxury-gold text-luxury-black hover:bg-luxury-gold-light transition-colors flex items-center justify-center disabled:opacity-50"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {newsletterStatus === 'success' && (
                <div className="flex items-center space-x-1.5 text-[11px] text-green-400 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{newsletterMessage}</span>
                </div>
              )}

              {newsletterStatus === 'error' && (
                <p className="text-[11px] text-red-400 pt-1">{newsletterMessage}</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-luxury-charcoal/80 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {settings.storeName || 'RAZA SHOE PALACE'}. All Rights Reserved.</p>
          <p className="text-[11px] text-gray-500">
            Crafted for discerning footwear enthusiasts. Razorpay secure checkout enabled.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
