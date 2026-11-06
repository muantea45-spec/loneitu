import React from 'react';
import type { FarmerRecord } from '../../types/farmer';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUrlResolver';

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
      className="group relative flex flex-col justify-between bg-white dark:bg-[#151D18] rounded-2xl border border-[#E5E0D0] dark:border-slate-800 p-6 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#256B3A]/70 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#143520] via-[#256B3A] to-[#8FA859] opacity-80 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Top: Centered Circular Avatar + Farmer Name */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-[#F0EBE0] dark:border-slate-800">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full p-1 ring-2 ring-[#E5E0D0] dark:ring-slate-800 group-hover:ring-[#256B3A]/30 transition-all overflow-hidden flex items-center justify-center">
              {farmer.avatar ? (
                <img
                  src={resolveImageUrl(farmer.avatar)}
                  alt={farmer.fullName}
                  className="w-full h-full rounded-full object-cover shadow-inner"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400';
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#143520] to-[#256B3A] text-white font-black text-2xl flex items-center justify-center shadow-inner">
                  {farmer.fullName ? farmer.fullName.trim().charAt(0).toUpperCase() : 'F'}
                </div>
              )}
            </div>
            <div 
              className="absolute bottom-0 right-0 bg-[#256B3A] text-white p-1 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900"
              title="Verified Record"
            >
              <BadgeCheck className="w-4 h-4 text-[#BFDC28]" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#143520] dark:text-white group-hover:text-[#256B3A] dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {farmer.fullName}
          </h3>
        </div>

        {/* Body: Display ONLY the uploaded columns and their values */}
        <div className="grid grid-cols-2 gap-2.5 py-4 text-left border-b border-[#F0EBE0] dark:border-slate-800 text-xs">
          {previewEntries.length === 0 ? (
            <div className="col-span-2 text-center text-slate-400 py-3 text-xs">
              No additional columns uploaded
            </div>
          ) : (
            previewEntries.map(([key, val]) => (
              <div 
                key={key} 
                className="bg-[#FBFBF8] dark:bg-slate-900/50 rounded-xl p-2.5 border border-[#EDE8DC] dark:border-slate-800/70"
              >
                <span className="text-[11px] text-[#7C6A53] dark:text-slate-400 font-medium block truncate mb-0.5">
                  {key}
                </span>
                <p className="font-semibold text-[#143520] dark:text-slate-100 truncate" title={String(val)}>
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
            <span className="text-[11px] font-semibold text-[#7C6A53] dark:text-slate-400 bg-[#F6F4EB] dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-[#EDE8DC] dark:border-slate-700">
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
          className="inline-flex items-center gap-1 text-xs font-bold text-[#256B3A] dark:text-emerald-400 hover:text-[#143520] transition-colors shrink-0 group-hover:translate-x-0.5"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
