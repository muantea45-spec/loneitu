import React, { useState, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import { FarmerCard } from '../components/farmer/FarmerCard';
import { FarmerDetailModal } from '../components/farmer/FarmerDetailModal';
import type { FarmerRecord } from '../types/farmer';
import { 
  Search, 
  X, 
  LayoutGrid, 
  List, 
  ShieldCheck, 
  Eye,
  Users
} from 'lucide-react';

export const FarmerRegistryPage: React.FC = () => {
  const { farmers } = useBlog();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'newest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerRecord | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Farmer Registry — Loneitu (MIZORAM TAN)';
  }, []);

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

  // Filter & sort farmers
  const filteredFarmers = farmers
    .filter(f => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const mName = f.fullName.toLowerCase().includes(q);
      const mData = Object.values(f.data || {}).some(val => 
        String(val).toLowerCase().includes(q)
      );
      return mName || mData;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.fullName.localeCompare(b.fullName);
      }
      return new Date(b.registrationDate || 0).getTime() - new Date(a.registrationDate || 0).getTime();
    });

  return (
    <div className="w-full min-h-screen bg-[#FBFBF8] dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#143520] via-[#1b482b] to-[#256B3A] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-emerald-200 backdrop-blur-md mb-3 border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Official Department Registry System</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Mizoram Farmer Registry
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base mt-3 leading-relaxed">
              Transparent, verified farmer database dynamically reflecting all uploaded registry columns and profile records.
            </p>

            <div className="flex items-center gap-4 mt-6 text-xs font-semibold text-emerald-200 flex-wrap">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <Users className="w-4 h-4 text-emerald-300" />
                {farmers.length} Total Registered Records
              </span>
              {allColumns.length > 0 && (
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                  {allColumns.length} Uploaded Attributes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, father's name, village, etc..."
              className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#256B3A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & View Modes */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#256B3A]"
            >
              <option value="newest">Recently Registered</option>
              <option value="name">Name (A-Z)</option>
            </select>

            {/* Grid / Table View Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-xs text-[#256B3A]' : 'text-slate-400'}`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-xs text-[#256B3A]' : 'text-slate-400'}`}
                title="Detailed Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            Showing <strong>{filteredFarmers.length}</strong> of <strong>{farmers.length}</strong> records
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#256B3A] dark:text-emerald-400 font-semibold hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Results Content */}
        {filteredFarmers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {farmers.length === 0 ? 'Farmer Registry is currently empty' : 'No matching records found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {farmers.length === 0
                ? 'Spreadsheets can be batch-imported through the Admin Console.'
                : 'Try adjusting your search query.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Multi-column Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarmers.map(farmer => (
              <FarmerCard
                key={farmer.id}
                farmer={farmer}
                onSelect={(f) => setSelectedFarmer(f)}
              />
            ))}
          </div>
        ) : (
          /* Dynamic Table View (Displays ONLY the uploaded columns) */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">Farmer Profile</th>
                    {allColumns.map(col => (
                      <th key={col} className="py-3.5 px-4 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFarmers.map(farmer => (
                    <tr
                      key={farmer.id}
                      onClick={() => setSelectedFarmer(farmer)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={farmer.avatar}
                            alt={farmer.fullName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400';
                            }}
                          />
                          <span className="font-bold text-slate-900 dark:text-white">{farmer.fullName}</span>
                        </div>
                      </td>

                      {allColumns.map(col => (
                        <td key={col} className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                          {farmer.data && farmer.data[col] !== undefined ? String(farmer.data[col]) : '-'}
                        </td>
                      ))}

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFarmer(farmer);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#256B3A] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        <FarmerDetailModal
          farmer={selectedFarmer}
          onClose={() => setSelectedFarmer(null)}
        />
      </div>
    </div>
  );
};
