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
      className="group relative flex flex-col justify-between bg-gradient-to-b from-[#F7F8FA] via-[#EEF1F5] to-[#E3E7ED] dark:from-[#F7F8FA] dark:via-[#EEF1F5] dark:to-[#E3E7ED] rounded-2xl border border-[#D5D9E2] dark:border-[#D5D9E2] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#94A3B8] transition-all duration-300 cursor-pointer overflow-hidden text-slate-900 dark:text-slate-900"
    >
      {/* Decorative top accent line in slate-grey gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#94A3B8] via-[#CBD5E1] to-[#64748B] opacity-90" />

      <div>
        {/* Top: Centered Circular Avatar + Farmer Name */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-[#D5D9E2] dark:border-[#D5D9E2]">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full p-1 ring-2 ring-[#CBD5E1] dark:ring-[#CBD5E1] group-hover:ring-[#94A3B8] transition-all overflow-hidden flex items-center justify-center bg-white shadow-2xs">
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
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] dark:from-[#E2E8F0] dark:to-[#CBD5E1] text-[#334155] dark:text-[#334155] font-black text-2xl flex items-center justify-center shadow-inner">
                  {farmer.fullName ? farmer.fullName.trim().charAt(0).toUpperCase() : 'F'}
                </div>
              )}
            </div>
            <div 
              className="absolute bottom-0 right-0 bg-[#256B3A] text-white p-1 rounded-full shadow-sm ring-2 ring-white dark:ring-white"
              title="Verified Record"
            >
              <BadgeCheck className="w-4 h-4 text-[#BFDC28]" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#0F172A] group-hover:text-[#1E293B] transition-colors line-clamp-1">
            {farmer.fullName}
          </h3>
        </div>

        {/* Body: Display ONLY the uploaded columns and their values */}
        <div className="grid grid-cols-2 gap-2.5 py-4 text-left border-b border-[#D5D9E2] dark:border-[#D5D9E2] text-xs">
          {previewEntries.length === 0 ? (
            <div className="col-span-2 text-center text-slate-500 py-3 text-xs">
              No additional columns uploaded
            </div>
          ) : (
            previewEntries.map(([key, val]) => (
              <div 
                key={key} 
                className="bg-white/95 dark:bg-white/95 rounded-xl p-2.5 border border-[#D5D9E2]/80 dark:border-[#D5D9E2]/80 shadow-2xs"
              >
                <span className="text-[11px] text-[#64748B] dark:text-[#64748B] font-semibold block truncate mb-0.5">
                  {key}
                </span>
                <p className="font-bold text-[#0F172A] dark:text-[#0F172A] truncate" title={String(val)}>
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
            <span className="text-[11px] font-semibold text-[#475569] dark:text-[#475569] bg-[#E2E8F0]/80 dark:bg-[#E2E8F0]/80 px-2.5 py-0.5 rounded-md border border-[#CBD5E1] dark:border-[#CBD5E1]">
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
          className="inline-flex items-center gap-1 text-xs font-bold text-[#1E293B] dark:text-[#1E293B] hover:text-[#0F172A] transition-colors shrink-0 group-hover:translate-x-0.5 cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
