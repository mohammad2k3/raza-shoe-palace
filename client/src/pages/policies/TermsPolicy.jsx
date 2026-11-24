import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

const TermsPolicy = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div>
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Legal & Conditions
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black">
          Terms of Service
        </h1>
        <div className="w-16 h-0.5 bg-luxury-gold mt-3"></div>
      </div>

      <div className="prose text-xs sm:text-sm text-gray-700 leading-relaxed space-y-6">
        <p>
          Welcome to <strong>{settings.storeName || 'RAZA SHOE PALACE'}</strong>. By browsing or purchasing through this website,
          you agree to adhere to and be bound by the following Terms and Conditions of service.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">1. Accuracy of Footwear Representation</h3>
        <p>
          We strive to photograph and describe our leathers, colors, and textures with absolute fidelity.
          Because genuine leathers are natural materials, slight variations in grain and tone are characteristics of artisan uniqueness.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">2. Orders and Pricing</h3>
        <p>
          All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes.
          We reserve the right to refuse or cancel any order in case of inaccuracies in pricing or unforeseen stock discrepancies.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">3. Governing Law</h3>
        <p>
          These Terms of Service and any separate agreements shall be governed by and construed in accordance with the laws of India,
          with jurisdiction under the courts of Mumbai, Maharashtra.
        </p>
      </div>
    </div>
  );
};

export default TermsPolicy;
