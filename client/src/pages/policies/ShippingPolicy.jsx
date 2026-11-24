import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Truck, ShieldCheck, Clock } from 'lucide-react';

const ShippingPolicy = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div>
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Client Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black">
          Shipping & Delivery Policy
        </h1>
        <div className="w-16 h-0.5 bg-luxury-gold mt-3"></div>
      </div>

      <div className="prose text-xs sm:text-sm text-gray-700 leading-relaxed space-y-6">
        <p>
          At <strong>{settings.storeName || 'RAZA SHOE PALACE'}</strong>, every order is treated as a bespoke commission.
          Our footwear is carefully packaged in signature luxury dust bags and heavy-gauge protective boxes to guarantee pristine doorstep delivery.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">1. Dispatch Timelines</h3>
        <p>
          All in-stock orders are processed and dispatched within 24–48 hours of order confirmation.
          Once dispatched, delivery typically takes 3–5 business days depending on your postal PIN code.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">2. Shipping Charges & Free Threshold</h3>
        <p>
          We are pleased to offer <strong>Complimentary Express Shipping</strong> on all domestic orders with a net subtotal of ₹{settings.freeShippingThreshold || 1999} and above.
          For orders below ₹{settings.freeShippingThreshold || 1999}, a nominal flat shipping fee of ₹{settings.shippingFee || 99} is applicable across India.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">3. Real-Time Tracking</h3>
        <p>
          As soon as your shipment is dispatched from our flagship facility, an automated SMS and email notification containing your courier Airway Bill (AWB) number and live tracking portal link will be shared.
        </p>

        <h3 className="font-serif text-lg font-bold text-luxury-black">4. Cash on Delivery (COD)</h3>
        <p>
          Cash on Delivery is supported for verified addresses across serviceable PIN codes. Please ensure someone is available with exact change or UPI payment at the designated delivery address.
        </p>
      </div>
    </div>
  );
};

export default ShippingPolicy;
