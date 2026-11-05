import React from 'react';
import type { FarmerRecord } from '../../types/farmer';
import { ArrowRight, BadgeCheck } from 'lucide-react';

interface FarmerCardProps {
  farmer: FarmerRecord;
  onSelect?: (farmer: FarmerRecord) => void;
}

export const FarmerCard: React.FC<FarmerCardProps> = ({ farmer, onSelect }) => {
  // Collect uploaded entries, excluding duplicated name fields
  const allEntries = farmer.data ? Object.entries(farmer.data) : [];
  const displayEntries = allEntries.filter(([key]) => {
    const k = key.toLowerCase().trim();
    return !['name', 'farmer name', 'full name', 'hming', 'avatar', 'photo', 'picture', 'thlalak'].includes(k);
  });

  // Show up to 6 uploaded columns cleanly on the card without internal scrolling
  const previewEntries = displayEntries.slice(0, 6);
  const extraCount = displayEntries.length - previewEntries.length;

  return (
    <div 
      onClick={() => onSelect?.(farmer)}
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#256B3A]/40 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#256B3A] via-[#3E8B54] to-[#C9A84C] opacity-80 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Top: Centered Circular Avatar + Farmer Name */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full p-1 ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-[#256B3A]/30 transition-all">
              <img
                src={farmer.avatar}
                alt={farmer.fullName}
                className="w-full h-full rounded-full object-cover shadow-inner"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400';
                }}
              />
            </div>
            <div 
              className="absolute bottom-0 right-0 bg-[#256B3A] text-white p-1 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900"
              title="Verified Record"
            >
              <BadgeCheck className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#256B3A] dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {farmer.fullName}
          </h3>
        </div>

        {/* Body: Display ONLY the uploaded columns and their values */}
        <div className="grid grid-cols-2 gap-2.5 py-4 text-left border-b border-slate-100 dark:border-slate-800/80 text-xs">
          {previewEntries.length === 0 ? (
            <div className="col-span-2 text-center text-slate-400 py-3 text-xs">
              No additional columns uploaded
            </div>
          ) : (
            previewEntries.map(([key, val]) => (
              <div 
                key={key} 
                className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-2.5 border border-slate-100/60 dark:border-slate-800/60"
              >
                <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium block truncate mb-0.5">
                  {key}
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={String(val)}>
                  {String(val)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom: Extra columns count + Action Link */}
      <div className="pt-4 flex items-center justify-between gap-2 mt-auto">
        <div>
          {extraCount > 0 && (
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              +{extraCount} more columns
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(farmer);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#256B3A] dark:text-emerald-400 hover:text-[#184826] transition-colors shrink-0 group-hover:translate-x-0.5"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
