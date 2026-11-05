import React, { useState } from 'react';
import type { FarmerRecord } from '../../types/farmer';
import { 
  X, 
  BadgeCheck, 
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
    const entries = farmer.data ? Object.entries(farmer.data) : [];
    const fieldsText = entries.map(([k, v]) => `${k}: ${v}`).join('\n');
    const text = `Farmer Registry Profile: ${farmer.fullName}\n\n${fieldsText}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const uploadedEntries = farmer.data ? Object.entries(farmer.data) : [];

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

        {/* Top Header: Centered Circular Avatar & Farmer Name */}
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
            <div 
              className="absolute bottom-1 right-1 bg-[#256B3A] text-white p-1.5 rounded-full shadow-md ring-2 ring-white dark:ring-slate-900"
              title="Verified Record"
            >
              <BadgeCheck className="w-4 h-4" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {farmer.fullName}
          </h2>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-2">
            <span>{uploadedEntries.length} Uploaded Columns</span>
          </div>
        </div>

        {/* Dynamic Fields Section: Displays ONLY the uploaded columns and values */}
        <div className="py-6 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {uploadedEntries.length === 0 ? (
              <p className="col-span-2 text-center text-slate-400 py-6">
                No uploaded column data available for this record.
              </p>
            ) : (
              uploadedEntries.map(([key, val]) => (
                <div 
                  key={key} 
                  className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800"
                >
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 block mb-1">
                    {key}
                  </span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white break-words">
                    {String(val)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied Details' : 'Share Profile'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-[#256B3A] text-white hover:bg-[#1b4d2a] transition-colors shadow-sm ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
