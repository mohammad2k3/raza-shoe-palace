import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, Heart, Sparkles, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block">
          Our Artisan Heritage
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-luxury-black">
          The Craft of Sovereign Footwear
        </h1>
        <div className="w-16 h-0.5 bg-luxury-gold mx-auto"></div>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pt-2">
          Founded with a clear conviction: to craft luxury footwear that honors classical British and Italian lasts,
          while engineering orthopedic all-day ease for discerning modern wearers.
        </p>
      </div>

      {/* Story Banner */}
      <div className="aspect-[16/9] sm:aspect-[21/9] bg-luxury-ivory overflow-hidden border border-luxury-gray">
        <img
          src="https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&w=1600&q=85"
          alt="Leather cobbling at Raza Shoe Palace"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Core Philosophies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white border border-luxury-gray space-y-3">
          <div className="w-10 h-10 bg-luxury-ivory rounded-full flex items-center justify-center border border-luxury-gold text-luxury-gold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-luxury-black">Full-Grain Leathers</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            We source exclusively high-grade French and Italian calfskins that age with a rich, unique patina rather than cracking.
          </p>
        </div>

        <div className="p-6 bg-white border border-luxury-gray space-y-3">
          <div className="w-10 h-10 bg-luxury-ivory rounded-full flex items-center justify-center border border-luxury-gold text-luxury-gold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-luxury-black">Goodyear & Stitched Welt</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Every dress shoe features authentic welted or channeled stitching that allows for decades of resoling and steadfast structural integrity.
          </p>
        </div>

        <div className="p-6 bg-white border border-luxury-gray space-y-3">
          <div className="w-10 h-10 bg-luxury-ivory rounded-full flex items-center justify-center border border-luxury-gold text-luxury-gold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-luxury-black">Ergonomic Arch Beds</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Natural cork fillings and latex memory foam inserts conform naturally to your individual foot contour for effortless 12-hour wear.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-10 bg-luxury-black text-white text-center space-y-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold">Experience Raza Shoe Palace</h2>
        <p className="text-xs text-gray-300 max-w-md mx-auto">
          Explore our complete range of formal dress shoes, high-traction athletics, loafers, and sneakers.
        </p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-luxury-gold text-luxury-black text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold-light transition-colors"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
