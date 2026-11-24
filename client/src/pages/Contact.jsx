import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

const Contact = () => {
  const { settings } = useStoreSettings();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block">
          Client Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black">
          Contact Raza Shoe Palace
        </h1>
        <p className="text-xs sm:text-sm text-luxury-muted">
          We welcome your inquiries regarding custom sizing, private appointments, order dispatches, or bespoke consultations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information & Store Location */}
        <div className="bg-luxury-ivory p-6 sm:p-8 border border-luxury-gray space-y-6">
          <h3 className="font-serif text-xl font-bold text-luxury-black pb-3 border-b border-luxury-gray">
            Retail Flagship & Concierge
          </h3>

          <div className="space-y-4 text-xs text-gray-700">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-luxury-black uppercase tracking-wider block">Address</span>
                <p>{settings.address}</p>
                <p>
                  {settings.city}, {settings.state} - {settings.pincode}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-luxury-gold shrink-0" />
              <div>
                <span className="font-bold text-luxury-black uppercase tracking-wider block">Telephone</span>
                <p>{settings.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-luxury-gold shrink-0" />
              <div>
                <span className="font-bold text-luxury-black uppercase tracking-wider block">Email Concierge</span>
                <p>{settings.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-luxury-gold shrink-0" />
              <div>
                <span className="font-bold text-luxury-black uppercase tracking-wider block">Store Hours</span>
                <p>Monday - Saturday: 10:30 AM – 9:00 PM</p>
                <p>Sunday: 11:00 AM – 8:00 PM</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-luxury-gray text-xs space-y-1">
            <span className="font-bold text-luxury-black uppercase tracking-wider block">
              Bespoke Fitting Consultations
            </span>
            <p className="text-luxury-muted">
              For personalized shoe fittings and wide-last requests, please contact our telephone line or write to us directly.
            </p>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white p-6 sm:p-8 border border-luxury-gray space-y-4">
          <h3 className="font-serif text-xl font-bold text-luxury-black pb-3 border-b border-luxury-gray">
            Send an Inquiry
          </h3>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Thank you! Your message has been received. Our concierge will reply within 24 business hours.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tariq Raza"
                className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tariq@example.com"
                className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
                Message / Footwear Inquiry *
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How may our concierge assist you?"
                className="w-full p-2.5 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold hover:text-luxury-black transition-colors flex items-center justify-center space-x-2"
            >
              <span>Transmit Inquiry</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
