import React from 'react';
import type { FarmerRecord } from '../../types/farmer';
import { 
  MapPin, 
  Sprout, 
  CheckCircle2, 
  TrendingUp, 
  Droplets, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  BadgeCheck
} from 'lucide-react';

interface FarmerCardProps {
  farmer: FarmerRecord;
  onSelect?: (farmer: FarmerRecord) => void;
}

export const FarmerCard: React.FC<FarmerCardProps> = ({ farmer, onSelect }) => {
  const isOrganic = farmer.farmingType.toLowerCase().includes('organic');
  const isNatural = farmer.farmingType.toLowerCase().includes('natural') || farmer.farmingType.toLowerCase().includes('regenerative');

  return (
    <div 
      onClick={() => onSelect?.(farmer)}
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#256B3A]/40 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Decorative subtle gradient glow on top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#256B3A] via-[#3E8B54] to-[#C9A84C] opacity-80 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Top Section: Circular Avatar + Identity Hierarchy */}
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
            {farmer.status === 'Verified' && (
              <div 
                className="absolute bottom-0 right-0 bg-[#256B3A] text-white p-1 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900"
                title="Verified Farmer Registry Record"
              >
                <BadgeCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#256B3A] dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {farmer.fullName}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {farmer.farmerId}
            </span>
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#256B3A] shrink-0" />
              <span className="line-clamp-1">{farmer.village}, {farmer.district}</span>
            </div>
          </div>
        </div>

        {/* Body Section: Clean 2-Column Key-Value Metadata Grid (No internal scroll) */}
        <div className="grid grid-cols-2 gap-3 py-4 text-left border-b border-slate-100 dark:border-slate-800/80 text-xs">
          {/* Land Size */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-2.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
              <Sprout className="w-3.5 h-3.5 text-[#256B3A]" />
              Land Size
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {farmer.landSizeAcre} {typeof farmer.landSizeAcre === 'number' || !String(farmer.landSizeAcre).toLowerCase().includes('acre') ? 'Acres' : ''}
            </p>
          </div>

          {/* Farming Practice */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-2.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#256B3A]" />
              Practice
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={farmer.farmingType}>
              {farmer.farmingType}
            </p>
          </div>

          {/* Primary Crops */}
          <div className="col-span-2 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-2.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Primary Crops
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1" title={farmer.primaryCrops}>
              {farmer.primaryCrops}
            </p>
          </div>

          {/* Annual Yield */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-2.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Annual Yield
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {typeof farmer.annualYieldKg === 'number' ? farmer.annualYieldKg.toLocaleString() : farmer.annualYieldKg} Kg
            </p>
          </div>

          {/* Irrigation Source */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-2.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              Irrigation
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={farmer.irrigationSource || 'Rainfed'}>
              {farmer.irrigationSource || 'Rainfed'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Quick Tags & Action Pill */}
      <div className="pt-4 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isOrganic && (
            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
              Organic
            </span>
          )}
          {isNatural && !isOrganic && (
            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
              Natural
            </span>
          )}
          <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-3 h-3 mr-0.5 text-[#256B3A]" />
            PM-Kisan: {farmer.pmKisanEnrolled || 'Yes'}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(farmer);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#256B3A] dark:text-emerald-400 hover:text-[#184826] transition-colors shrink-0 group-hover:translate-x-0.5"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
