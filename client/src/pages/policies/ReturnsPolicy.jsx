import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { RotateCcw, ShieldCheck } from 'lucide-react';

const ReturnsPolicy = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div>
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Client Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black">
          Returns & Exchange Policy
        </h1>
        <div className="w-16 h-0.5 bg-luxury-gold mt-3"></div>
      </div>

      <div className="prose text-xs sm:text-sm text-gray-700 leading-relaxed space-y-6">
        <p>
          We want you to feel complete confidence in your fit and aesthetic.
          <strong> {settings.storeName || 'RAZA SHOE PALACE'}</strong> provides a comprehensive{' '}
          <strong>{settings.returnWindowDays || 7}-Day Doorstep Return & Size Exchange</strong> guarantee.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">1. Eligible Window</h3>
        <p>
          You may request an exchange or return within {settings.returnWindowDays || 7} days from the date of confirmed delivery.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">2. Return Criteria</h3>
        <p>
          To qualify for a full exchange or refund:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Footwear must be in unworn, brand new condition with no sole scratches, scuffs, or creases.</li>
          <li>We strongly advise trying shoes on carpeted surfaces initially.</li>
          <li>Original brand shoe box, protective dust covers, and authentic tags must be returned intact.</li>
        </ul>

        <h3 className="font-serif text-lg font-bold text-luxury-black">3. Doorstep Pickup</h3>
        <p>
          Once your return request is logged via your customer account or by calling our support line ({settings.phone}),
          our logistics partner will arrange a doorstep inspection and reverse pickup.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">4. Refunds</h3>
        <p>
          Refunds for prepaid orders are credited back to the original payment source within 3–5 banking days after product inspection.
          For COD orders, refunds can be initiated via direct bank transfer or store credit.
        </p>
      </div>
    </div>
  );
};

export default ReturnsPolicy;
