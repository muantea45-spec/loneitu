import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Search,
  ArrowRight,
  ArrowUpDown,
  Share2,
  BookOpen,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { formatDate } from '../utils/formatDate';
import { ShareModal } from '../components/common/ShareModal';
import type { Article } from '../types/blog';

const MONTHS_DATA = [
  { num: 1, name: 'January', short: 'Jan' },
  { num: 2, name: 'February', short: 'Feb' },
  { num: 3, name: 'March', short: 'Mar' },
  { num: 4, name: 'April', short: 'Apr' },
  { num: 5, name: 'May', short: 'May' },
  { num: 6, name: 'June', short: 'Jun' },
  { num: 7, name: 'July', short: 'Jul' },
  { num: 8, name: 'August', short: 'Aug' },
  { num: 9, name: 'September', short: 'Sep' },
  { num: 10, name: 'October', short: 'Oct' },
  { num: 11, name: 'November', short: 'Nov' },
  { num: 12, name: 'December', short: 'Dec' },
];

export const ArchivePage: React.FC = () => {
  const { articles } = useBlog();
  const [shareArticle, setShareArticle] = useState<Article | null>(null);
  const routeParams = useParams<{ year?: string; month?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters & Sorting state
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return routeParams.year || searchParams.get('year') || 'all';
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return routeParams.month || searchParams.get('month') || 'all';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Sync route and query params if they change
  useEffect(() => {
    if (routeParams.year) setSelectedYear(routeParams.year);
    if (routeParams.month) setSelectedMonth(routeParams.month);
  }, [routeParams]);

  // Keep search params in sync with active filter
  const updateFilters = (newYear: string, newMonth: string) => {
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);

    const params = new URLSearchParams();
    if (newYear !== 'all') params.set('year', newYear);
    if (newMonth !== 'all') params.set('month', newMonth);
    setSearchParams(params, { replace: true });
  };

  // Only consider published articles
  const publishedArticles = useMemo(() => {
    return articles.filter(a => a.status === 'published');
  }, [articles]);

  // Extract all available years from articles
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    publishedArticles.forEach(a => {
      const d = new Date(a.publishedAt);
      if (!isNaN(d.getTime())) {
        yearsSet.add(d.getFullYear());
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [publishedArticles]);

  // Filter and sort articles for the compact ledger view
  const filteredArticles = useMemo(() => {
    const filtered = publishedArticles.filter(art => {
      const d = new Date(art.publishedAt);
      if (isNaN(d.getTime())) return false;

      const artYear = d.getFullYear().toString();
      const artMonthNum = (d.getMonth() + 1).toString();
      const artMonthPadded = artMonthNum.padStart(2, '0');

      // Year filter
      if (selectedYear !== 'all' && artYear !== selectedYear) {
        return false;
      }

      // Month filter
      if (selectedMonth !== 'all') {
        const monthMatch =
          selectedMonth === artMonthNum ||
          selectedMonth === artMonthPadded ||
          MONTHS_DATA.find(m => m.short.toLowerCase() === selectedMonth.toLowerCase())?.num.toString() === artMonthNum;
        if (!monthMatch) return false;
      }

      // Keyword search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesCategory = art.category.toLowerCase().includes(q);
        const matchesAuthor = art.author.name.toLowerCase().includes(q);
        const matchesTags = art.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCategory && !matchesAuthor && !matchesTags) {
          return false;
        }
      }

      return true;
    });

    // Sort by publication date
    return filtered.sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime();
      const timeB = new Date(b.publishedAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [publishedArticles, selectedYear, selectedMonth, searchQuery, sortOrder]);

  const handleResetFilters = () => {
    setSelectedYear('all');
    setSelectedMonth('all');
    setSearchQuery('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const isFiltered = selectedYear !== 'all' || selectedMonth !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-[#FBFBF8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Banner */}
        <div className="bg-[#143520] text-white rounded-3xl p-6 sm:p-8 border border-[#1E542E] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E542E] text-[#BFDC28] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#256B3A]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Chanchinbu Dahkhawm (Journal Ledger)</span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Loneitu Archive
            </h1>
            <p className="text-xs sm:text-sm text-[#ADC6A7] mt-1 max-w-xl">
              Compact index & chronological publication ledger. Browse research dispatches, farming guides, and reports sorted by year and month.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-[#1E542E]/70 border border-[#256B3A] text-center">
              <span className="text-[10px] uppercase font-bold text-[#BFDC28] block tracking-wider">Total Records</span>
              <span className="text-xl font-mono font-black text-white">{filteredArticles.length} / {publishedArticles.length}</span>
            </div>
          </div>
        </div>

        {/* Simple Controls Bar: Year, Month, Sort, Search */}
        <div className="bg-white rounded-2xl p-4 border border-[#DDD4BC] shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Year Selector */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold text-[#6F5B3C] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#256B3A]" />
                <span>Kum (Year)</span>
              </label>
              <select
                value={selectedYear}
                onChange={e => updateFilters(e.target.value, selectedMonth)}
                className="w-full px-3 py-2 bg-[#FAF8F3] hover:bg-[#F2EFE6] border border-[#DDD4BC] rounded-xl text-xs font-semibold text-[#143520] transition-colors outline-hidden cursor-pointer"
              >
                <option value="all">Kum Zawng Zawng (All Years)</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr.toString()}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="lg:col-span-4">
              <label className="block text-[11px] font-bold text-[#6F5B3C] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#256B3A]" />
                <span>Thla (Month)</span>
              </label>
              <select
                value={selectedMonth}
                onChange={e => updateFilters(selectedYear, e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F3] hover:bg-[#F2EFE6] border border-[#DDD4BC] rounded-xl text-xs font-semibold text-[#143520] transition-colors outline-hidden cursor-pointer"
              >
                <option value="all">All Months</option>
                {MONTHS_DATA.map(m => (
                  <option key={m.num} value={m.num.toString()}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold text-[#6F5B3C] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Search className="w-3 h-3 text-[#256B3A]" />
                <span>Zawng rawh (Search)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Thupui, ziaktu, sector..."
                  className="w-full pl-8 pr-3 py-2 bg-[#FAF8F3] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] placeholder-[#8F7855] focus:bg-white focus:border-[#256B3A] transition-colors outline-hidden"
                />
                <Search className="w-3.5 h-3.5 text-[#8F7855] absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Sort Toggle & Reset */}
            <div className="lg:col-span-2 flex items-end gap-2 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                className="flex-1 py-2 px-3 rounded-xl border border-[#DDD4BC] bg-[#FAF8F3] hover:bg-[#EBE6D6] text-[#143520] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Toggle Sort Direction"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#256B3A]" />
                <span>{sortOrder === 'desc' ? 'A Thar Ber' : 'A Hlun Ber'}</span>
              </button>

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer shrink-0"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Compact Index / Ledger View Table */}
        <div className="bg-white rounded-2xl border border-[#DDD4BC] shadow-xs overflow-hidden">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F3] text-[#8F7855] flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#143520]">
                A vang khawp mai! Article hmuh a ni lo.
              </h3>
              <p className="text-xs text-[#6F5B3C] mt-1 max-w-sm mx-auto">
                I thlanchhuah kum, thla, emaw zawnna hian article a hmu lo e. Filter-te hi siam tha la emaw reset rawh le.
              </p>
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Show All Archives
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F3] text-[#54432C] border-b border-[#EBE6D6] font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-32 whitespace-nowrap">Tar Lan Ni (Date)</th>
                    <th className="py-3 px-4 min-w-[280px]">Thupui (Article Title)</th>
                    <th className="py-3 px-4 w-36 whitespace-nowrap">Category</th>
                    <th className="py-3 px-4 w-44 whitespace-nowrap">Ziaktu (Author)</th>
                    <th className="py-3 px-4 w-36 text-right whitespace-nowrap">Chhiarna (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EFE6]">
                  {filteredArticles.map((art, idx) => {
                    return (
                      <tr
                        key={art.id}
                        className={`hover:bg-[#FAF8F3] transition-colors group ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#FBFBF8]/60'
                        }`}
                      >
                        {/* Publication Date */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#8F7855] whitespace-nowrap">
                          {formatDate(art.publishedAt)}
                        </td>

                        {/* Article Title */}
                        <td className="py-3.5 px-4">
                          <Link
                            to={`/article/${art.slug}`}
                            className="font-serif font-bold text-xs sm:text-sm text-[#143520] group-hover:text-[#256B3A] transition-colors leading-snug line-clamp-2"
                            title={art.title}
                          >
                            {art.title}
                          </Link>
                        </td>

                        {/* Sector / Category Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EBF1EA] text-[#1E542E] font-bold text-[10.5px] border border-emerald-200/60 shadow-2xs">
                            {art.category}
                          </span>
                        </td>

                        {/* Author */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={art.author.avatar}
                              alt={art.author.name}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#DDD4BC]"
                            />
                            <span className="font-semibold text-[#143520] text-xs">
                              {art.author.name}
                            </span>
                          </div>
                        </td>

                        {/* Actions: Reading Time & Read Button & Share */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <span className="text-[10px] text-[#8F7855] hidden sm:inline flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#256B3A]" />
                              <span>{art.readingTimeMinutes}m</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => setShareArticle(art)}
                              className="p-1.5 rounded-lg text-[#6F5B3C] hover:text-[#143520] hover:bg-[#EBE6D6] transition-colors cursor-pointer"
                              title="Share article"
                            >
                              <Share2 className="w-3.5 h-3.5 text-[#256B3A]" />
                            </button>

                            <Link
                              to={`/article/${art.slug}`}
                              className="inline-flex items-center justify-center p-1.5 px-2.5 rounded-lg bg-[#143520] text-[#BFDC28] hover:bg-[#1E542E] transition-all shadow-2xs group-hover:translate-x-0.5 cursor-pointer"
                              title="Read article"
                              aria-label="Read article"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal Dialog */}
      {shareArticle && (
        <ShareModal
          isOpen={!!shareArticle}
          onClose={() => setShareArticle(null)}
          title={shareArticle.title}
          excerpt={shareArticle.excerpt || shareArticle.content}
          url={typeof window !== 'undefined' ? `${window.location.origin}/article/${shareArticle.slug}` : undefined}
        />
      )}
    </div>
  );
};
