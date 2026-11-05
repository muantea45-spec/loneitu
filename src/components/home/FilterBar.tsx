import React from 'react';
import { Search, X, FolderTree } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

export const FilterBar: React.FC = () => {
  const {
    categories,
    tags,
    articles,
    filterState,
    setFilterCategory,
    setFilterTag,
    setSearchQuery,
    clearFilters,
  } = useBlog();

  const isFiltered =
    filterState.category !== 'all' ||
    filterState.tag !== 'all' ||
    filterState.searchQuery.trim() !== '';

  // Calculate count for each category
  const getCategoryCount = (catName: string) => {
    return articles.filter(
      a => a.status === 'published' && a.category.toLowerCase() === catName.toLowerCase()
    ).length;
  };

  // Calculate count for each tag
  const getTagCount = (tagName: string) => {
    return articles.filter(
      a =>
        a.status === 'published' &&
        a.tags.some(t => t.toLowerCase() === tagName.toLowerCase())
    ).length;
  };

  const activeCategoryObj = categories.find(c => c.slug === filterState.category);

  return (
    <div className="w-full bg-[#F6F4EB] border-y border-[#EBE6D6] py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Filter Controls Row: Search + Category Dropdown + Reset */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F5B3C]" />
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Thlai, leilung, ran vulh, thiamna thar zawnna..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs sm:text-sm text-[#13341D] placeholder:text-[#6F5B3C]/70 focus:outline-hidden focus:border-[#256B3A] focus:ring-1 focus:ring-[#256B3A]"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F5B3C] hover:text-[#13341D] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Selectors: Category + Clear */}
          <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
            {/* Category Select Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-[#DDD4BC] text-xs shadow-2xs">
              <FolderTree className="w-3.5 h-3.5 text-[#256B3A] shrink-0" />
              <label htmlFor="cat-select" className="text-[#6F5B3C] font-semibold hidden sm:inline">
                Category:
              </label>
              <select
                id="cat-select"
                value={filterState.category}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-transparent text-[#13341D] font-semibold focus:outline-hidden cursor-pointer max-w-[170px] sm:max-w-none truncate"
              >
                <option value="all">
                  Category zawng zawng ({articles.filter(a => a.status === 'published').length})
                </option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name} ({getCategoryCount(cat.name)})
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#EBE6D6] hover:bg-[#DDD4BC] text-[#3B2E1D] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                title="Siamṭhat leh"
              >
                <X className="w-3.5 h-3.5" />
                <span>Siamṭhat Leh</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Category Filter Indicator (if selected) */}
        {activeCategoryObj && (
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-xs text-[#6F5B3C] font-semibold">Category thlan bik:</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#143520] text-[#BFDC28]">
              {activeCategoryObj.name}
              <button
                onClick={() => setFilterCategory('all')}
                className="hover:text-white"
                title="Remove category filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        )}

        {/* Tags Bar (without label) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setFilterTag('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
              filterState.tag === 'all'
                ? 'bg-[#256B3A] text-white shadow-xs'
                : 'bg-[#EBE6D6] text-[#4A584E] hover:bg-[#DDD4BC]'
            }`}
          >
            #A_Zavaiin
          </button>
          {tags.map(tag => {
            const isSelected = filterState.tag === tag.slug;
            const count = getTagCount(tag.name);
            return (
              <button
                key={tag.id}
                onClick={() => setFilterTag(isSelected ? 'all' : tag.slug)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#256B3A] text-white shadow-xs'
                    : 'bg-white text-[#1E542E] border border-[#BFDC28]/40 hover:border-[#1E542E] hover:bg-[#DFEDE3]'
                }`}
              >
                <span>#{tag.name}</span>
                {count > 0 && (
                  <span className="text-[9px] opacity-75">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
