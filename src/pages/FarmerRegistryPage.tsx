import React, { useState, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import { FarmerCard } from '../components/farmer/FarmerCard';
import { FarmerDetailModal } from '../components/farmer/FarmerDetailModal';
import type { FarmerRecord } from '../types/farmer';
import { 
  Search, 
  Filter, 
  X, 
  LayoutGrid, 
  List, 
  ShieldCheck, 
  Sprout, 
  MapPin, 
  BadgeCheck,
  Eye
} from 'lucide-react';

export const FarmerRegistryPage: React.FC = () => {
  const { farmers } = useBlog();

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [practiceFilter, setPracticeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'land' | 'yield' | 'newest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerRecord | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Farmer Registry — Loneitu (MIZORAM TAN)';
  }, []);

  // Filter & sort farmers
  const filteredFarmers = farmers
    .filter(f => {
      if (districtFilter !== 'all' && f.district.toLowerCase() !== districtFilter.toLowerCase()) {
        return false;
      }
      if (practiceFilter !== 'all' && !f.farmingType.toLowerCase().includes(practiceFilter.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = f.fullName.toLowerCase().includes(q);
        const mId = f.farmerId.toLowerCase().includes(q);
        const mVillage = f.village.toLowerCase().includes(q);
        const mCrop = f.primaryCrops.toLowerCase().includes(q);
        const mDistrict = f.district.toLowerCase().includes(q);
        return mName || mId || mVillage || mCrop || mDistrict;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.fullName.localeCompare(b.fullName);
      }
      if (sortBy === 'land') {
        const aSize = typeof a.landSizeAcre === 'number' ? a.landSizeAcre : parseFloat(String(a.landSizeAcre)) || 0;
        const bSize = typeof b.landSizeAcre === 'number' ? b.landSizeAcre : parseFloat(String(b.landSizeAcre)) || 0;
        return bSize - aSize;
      }
      if (sortBy === 'yield') {
        const aYield = typeof a.annualYieldKg === 'number' ? a.annualYieldKg : parseFloat(String(a.annualYieldKg)) || 0;
        const bYield = typeof b.annualYieldKg === 'number' ? b.annualYieldKg : parseFloat(String(b.annualYieldKg)) || 0;
        return bYield - aYield;
      }
      return new Date(b.registrationDate || 0).getTime() - new Date(a.registrationDate || 0).getTime();
    });

  const totalFilteredAcres = filteredFarmers.reduce((sum, f) => {
    const acres = typeof f.landSizeAcre === 'number' ? f.landSizeAcre : parseFloat(String(f.landSizeAcre)) || 0;
    return sum + acres;
  }, 0);

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
              Explore verified producer records across Champhai, Aizawl, Serchhip, Mamit, and all 11 districts—complete with landholding sizes, certified organic practices, and official production metrics.
            </p>

            <div className="flex items-center gap-4 mt-6 text-xs font-semibold text-emerald-200 flex-wrap">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <Sprout className="w-4 h-4 text-emerald-300" />
                {farmers.length} Total Verified Producers
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <MapPin className="w-4 h-4 text-emerald-300" />
                11 Statewide Districts
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, village, or crop..."
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

          {/* Filters & View Modes */}
          <div className="flex flex-wrap items-center gap-3">
            {/* District dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#256B3A]"
              >
                <option value="all">All Districts</option>
                <option value="Champhai">Champhai</option>
                <option value="Aizawl">Aizawl</option>
                <option value="Serchhip">Serchhip</option>
                <option value="Kolasib">Kolasib</option>
                <option value="Mamit">Mamit</option>
                <option value="Lunglei">Lunglei</option>
                <option value="Siaha">Siaha</option>
                <option value="Lawngtlai">Lawngtlai</option>
                <option value="Saitual">Saitual</option>
                <option value="Khawzawl">Khawzawl</option>
                <option value="Hnahthial">Hnahthial</option>
              </select>
            </div>

            {/* Practice dropdown */}
            <select
              value={practiceFilter}
              onChange={(e) => setPracticeFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#256B3A]"
            >
              <option value="all">All Practices</option>
              <option value="Organic">Organic Farming</option>
              <option value="Natural">Natural Farming</option>
              <option value="Regenerative">Regenerative Agriculture</option>
              <option value="Integrated">Integrated Agri-Horti</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#256B3A]"
            >
              <option value="newest">Recently Registered</option>
              <option value="name">Full Name (A-Z)</option>
              <option value="land">Land Size (High to Low)</option>
              <option value="yield">Annual Yield (High to Low)</option>
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
            Showing <strong>{filteredFarmers.length}</strong> of <strong>{farmers.length}</strong> farmers 
            ({totalFilteredAcres.toFixed(1)} Acres cultivated)
          </span>
          {(districtFilter !== 'all' || practiceFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setDistrictFilter('all');
                setPracticeFilter('all');
                setSearchQuery('');
              }}
              className="text-[#256B3A] dark:text-emerald-400 font-semibold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Content */}
        {filteredFarmers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
            <Sprout className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No matching farmers found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the district and practice filters.
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
          /* Detailed Table View */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Farmer Profile</th>
                    <th className="py-3.5 px-4">District & Village</th>
                    <th className="py-3.5 px-4">Practice & Crops</th>
                    <th className="py-3.5 px-4">Landholding</th>
                    <th className="py-3.5 px-4">Yield (Kg)</th>
                    <th className="py-3.5 px-4">PM-Kisan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFarmers.map(farmer => (
                    <tr
                      key={farmer.id}
                      onClick={() => setSelectedFarmer(farmer)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
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
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{farmer.fullName}</p>
                            <p className="font-mono text-[11px] text-slate-400">{farmer.farmerId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{farmer.village}</p>
                        <p className="text-[11px] text-slate-400">{farmer.district}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#256B3A] dark:text-emerald-400">{farmer.farmingType}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px]" title={farmer.primaryCrops}>
                          {farmer.primaryCrops}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {farmer.landSizeAcre} Acres
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {typeof farmer.annualYieldKg === 'number' ? farmer.annualYieldKg.toLocaleString() : farmer.annualYieldKg}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          {farmer.pmKisanEnrolled || 'Yes'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          <BadgeCheck className="w-3.5 h-3.5 text-[#256B3A]" />
                          {farmer.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
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
