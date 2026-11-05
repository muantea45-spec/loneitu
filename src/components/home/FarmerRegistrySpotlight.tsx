import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../../context/BlogContext';
import { FarmerCard } from '../farmer/FarmerCard';
import { FarmerDetailModal } from '../farmer/FarmerDetailModal';
import type { FarmerRecord } from '../../types/farmer';
import { ShieldCheck, ArrowRight, Users, Sparkles } from 'lucide-react';

export const FarmerRegistrySpotlight: React.FC = () => {
  const { farmers } = useBlog();
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerRecord | null>(null);

  // Take up to 6 verified records to showcase on homepage
  const spotlightFarmers = farmers.slice(0, 6);

  // Collect all unique columns across all records
  const allColumns = Array.from(
    new Set(
      farmers.flatMap(f => {
        const fromCols = f.columns || [];
        const fromData = Object.keys(f.data || {});
        return [...fromCols, ...fromData];
      })
    )
  ).filter(c => !['name', 'farmer name', 'full name', 'hming', 'avatar', 'photo'].includes(c.toLowerCase().trim()));

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/60 dark:border-slate-800/80">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF1EA] text-[#143520] dark:bg-emerald-950/70 dark:text-emerald-300 mb-3 border border-emerald-200/50 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-[#256B3A]" />
            <span>Mizoram State Agricultural Registry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Farmer Registry
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
            Verified records of agriculturalists across Mizoram. Profiles reflect the exact columns uploaded through the registry system.
          </p>
        </div>

        {/* View Full Directory Link */}
        <Link
          to="/farmers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#143520] text-white hover:bg-[#1E542E] transition-all duration-200 shadow-sm hover:shadow-md shrink-0 self-start md:self-auto group"
        >
          <span>View All Records ({farmers.length})</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 mb-10 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs text-[#256B3A]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{farmers.length} Records</p>
            <p className="text-[11px] text-slate-500">Registered</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs text-emerald-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{allColumns.length} Columns</p>
            <p className="text-[11px] text-slate-500">Uploaded Attributes</p>
          </div>
        </div>

        <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs text-amber-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{farmers.length === 0 ? 'Empty' : 'Live'}</p>
            <p className="text-[11px] text-slate-500">Database Status</p>
          </div>
        </div>
      </div>

      {/* Responsive Multi-Column Card Grid (Displays ONLY uploaded columns) */}
      {spotlightFarmers.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200/70 dark:border-slate-800">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Farmer Registry is currently empty</p>
          <p className="text-xs text-slate-400 mt-1">Uploaded farmer records will appear here as soon as an Excel file is imported in the Admin Console.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spotlightFarmers.map(farmer => (
            <FarmerCard
              key={farmer.id}
              farmer={farmer}
              onSelect={(f) => setSelectedFarmer(f)}
            />
          ))}
        </div>
      )}

      {/* Interactive Detail Modal */}
      <FarmerDetailModal
        farmer={selectedFarmer}
        onClose={() => setSelectedFarmer(null)}
      />
    </section>
  );
};
