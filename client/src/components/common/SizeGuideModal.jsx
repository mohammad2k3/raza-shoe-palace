import React from 'react';
import { X, Ruler } from 'lucide-react';

const SizeGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sizeChart = [
    { uk: 'UK 6', us: 'US 7', eu: 'EU 40', cm: '25.0 cm', in: '9.8 in' },
    { uk: 'UK 7', us: 'US 8', eu: 'EU 41', cm: '26.0 cm', in: '10.2 in' },
    { uk: 'UK 8', us: 'US 9', eu: 'EU 42', cm: '27.0 cm', in: '10.6 in' },
    { uk: 'UK 9', us: 'US 10', eu: 'EU 43', cm: '28.0 cm', in: '11.0 in' },
    { uk: 'UK 10', us: 'US 11', eu: 'EU 44', cm: '29.0 cm', in: '11.4 in' },
    { uk: 'UK 11', us: 'US 12', eu: 'EU 45', cm: '30.0 cm', in: '11.8 in' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative bg-white max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-luxury-gray"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-luxury-black hover:text-luxury-gold"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-luxury-gold mb-2">
          <Ruler className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-ultra">Footwear Conversion Guide</span>
        </div>

        <h3 className="font-serif text-2xl font-bold text-luxury-black mb-4">
          Men's Standard Footwear Sizing
        </h3>

        <p className="text-xs text-luxury-muted mb-6 leading-relaxed">
          All Raza Shoe Palace dress shoes and sneakers follow authentic British Standard lasts (UK sizing).
          If you are between two sizes, we recommend selecting the larger size for high-arch comfort.
        </p>

        <div className="overflow-x-auto border border-luxury-gray mb-6">
          <table className="w-full text-xs text-left">
            <thead className="bg-luxury-ivory uppercase tracking-wider font-semibold border-b border-luxury-gray">
              <tr>
                <th className="py-2.5 px-4 text-luxury-black">UK Size</th>
                <th className="py-2.5 px-4 text-luxury-black">US Size</th>
                <th className="py-2.5 px-4 text-luxury-black">EU Size</th>
                <th className="py-2.5 px-4 text-luxury-black">Foot Length (CM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-gray">
              {sizeChart.map((row, idx) => (
                <tr key={idx} className="hover:bg-luxury-ivory/50">
                  <td className="py-2.5 px-4 font-bold text-luxury-black">{row.uk}</td>
                  <td className="py-2.5 px-4 text-gray-700">{row.us}</td>
                  <td className="py-2.5 px-4 text-gray-700">{row.eu}</td>
                  <td className="py-2.5 px-4 text-gray-700">{row.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-luxury-ivory p-4 border-l-2 border-luxury-gold text-xs text-gray-700">
          <span className="font-bold text-luxury-black uppercase tracking-wider block mb-1">
            Complimentary Size Exchange
          </span>
          Ordered the wrong size? Don't worry. We offer a 7-day hassle-free doorstep size exchange.
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
