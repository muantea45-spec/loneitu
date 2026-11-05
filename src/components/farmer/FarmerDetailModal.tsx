import React, { useState } from 'react';
import type { FarmerRecord } from '../../types/farmer';
import { 
  X, 
  MapPin, 
  Phone, 
  Sprout, 
  CreditCard, 
  ShieldCheck, 
  BadgeCheck, 
  Calendar,
  Layers,
  Share2,
  Printer,
  Check
} from 'lucide-react';

interface FarmerDetailModalProps {
  farmer: FarmerRecord | null;
  onClose: () => void;
}

export const FarmerDetailModal: React.FC<FarmerDetailModalProps> = ({ farmer, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!farmer) return null;

  const handleShare = () => {
    const text = `Loneitu Farmer Registry: ${farmer.fullName} (${farmer.farmerId})\nLocation: ${farmer.village}, ${farmer.district}, Mizoram\nFarming: ${farmer.farmingType}\nPrimary Crops: ${farmer.primaryCrops}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const customEntries = farmer.customAttributes ? Object.entries(farmer.customAttributes) : [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header: Centered Circular Avatar & Profile */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full p-1 ring-4 ring-[#256B3A]/20 shadow-md">
              <img
                src={farmer.avatar}
                alt={farmer.fullName}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400';
                }}
              />
            </div>
            {farmer.status === 'Verified' && (
              <div 
                className="absolute bottom-1 right-1 bg-[#256B3A] text-white p-1.5 rounded-full shadow-md ring-2 ring-white dark:ring-slate-900"
                title="Verified Registry Record"
              >
                <BadgeCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF1EA] text-[#143520] dark:bg-emerald-950 dark:text-emerald-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#256B3A]" />
            <span>Mizoram State Farmer Registry</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {farmer.fullName}
          </h2>

          <p className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
            Registry ID: <span className="text-[#256B3A] dark:text-emerald-400 font-bold">{farmer.farmerId}</span>
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-300 flex-wrap justify-center">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#256B3A]" />
              {farmer.village}, {farmer.district}, {farmer.state}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              {farmer.phone}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              Registered: {farmer.registrationDate}
            </span>
          </div>
        </div>

        {/* Section 1: Agricultural Details */}
        <div className="py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#256B3A]" />
            Agricultural Profile
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Total Land Size</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{farmer.landSizeAcre} Acres</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Ownership Status</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{farmer.landOwnership}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Farming Practice</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{farmer.farmingType}</p>
            </div>

            <div className="col-span-2 md:col-span-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Primary Cultivated Crops</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{farmer.primaryCrops}</p>
            </div>

            {farmer.secondaryCrops && (
              <div className="col-span-2 md:col-span-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Secondary / Inter-crops</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{farmer.secondaryCrops}</p>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Soil Condition</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{farmer.soilType || 'N/A'}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Irrigation Setup</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{farmer.irrigationSource || 'Rainfed'}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Annual Yield</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {typeof farmer.annualYieldKg === 'number' ? farmer.annualYieldKg.toLocaleString() : farmer.annualYieldKg} Kg
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Government Schemes */}
        <div className="py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Financial & Scheme Entitlements
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Annual Farm Revenue</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{farmer.annualIncomeInr || 'N/A'}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-0.5">PM-Kisan DBT Status</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{farmer.pmKisanEnrolled || 'Yes'}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Bank Name</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{farmer.bankName || 'Mizoram Rural Bank'}</p>
            </div>

            {farmer.accountNumber && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Account Number</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{farmer.accountNumber}</p>
              </div>
            )}

            {farmer.ifscCode && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">IFSC Code</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{farmer.ifscCode}</p>
              </div>
            )}

            {farmer.aadhaarNumber && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Aadhaar / ID</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{farmer.aadhaarNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Dynamic Schema Attributes (Custom Columns from Excel) */}
        {customEntries.length > 0 && (
          <div className="py-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Dynamic Attributes (Flexible Schema)
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {customEntries.map(([key, val]) => (
                <div key={key} className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 p-3 rounded-xl">
                  <span className="text-purple-600 dark:text-purple-400 font-medium block mb-0.5">{key}</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{String(val)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes / Special Remarks */}
        {farmer.notes && (
          <div className="py-4 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1 font-semibold">Special Notes & Accreditations</span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
              "{farmer.notes}"
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied Details' : 'Share Record'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Form</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#256B3A] text-white hover:bg-[#1b4d2a] transition-colors shadow-sm ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
