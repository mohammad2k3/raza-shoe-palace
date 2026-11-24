import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6">
      <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block">
        404 — Page Not Found
      </span>
      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-luxury-black">
        A Step Off The Path
      </h1>
      <p className="text-xs sm:text-sm text-luxury-muted max-w-md mx-auto">
        The destination you requested does not exist or may have been relocated. Allow us to guide you back to our curated collections.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-8 py-3.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold hover:text-luxury-black transition-colors"
        >
          <span>Return to Homepage</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
