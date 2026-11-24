import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

const PrivacyPolicy = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div>
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Legal & Trust
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black">
          Privacy Policy
        </h1>
        <div className="w-16 h-0.5 bg-luxury-gold mt-3"></div>
      </div>

      <div className="prose text-xs sm:text-sm text-gray-700 leading-relaxed space-y-6">
        <p>
          At <strong>{settings.storeName || 'RAZA SHOE PALACE'}</strong>, accessible from razashoepalace.com,
          the privacy of our clients is paramount. This Privacy Policy documents the types of information we collect and how we utilize it.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">1. Information We Collect</h3>
        <p>
          When you register or place an order, we collect information including your name, email address, contact phone number,
          delivery address, and payment method details.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">2. Security of Payment Data</h3>
        <p>
          Online transactions are processed securely through certified PCI-DSS compliant gateways (such as Razorpay).
          We never store full credit or debit card numbers on our local database servers.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">3. How We Use Your Information</h3>
        <p>
          Your information is utilized strictly to fulfill footwear orders, transmit dispatch updates, coordinate doorstep returns,
          and provide customer concierge support. We never sell or lease customer information to third-party marketing entities.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">4. Contacting Us</h3>
        <p>
          If you have questions regarding your data or wish to request data removal, please contact our privacy officer at{' '}
          <strong>{settings.email}</strong>.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
