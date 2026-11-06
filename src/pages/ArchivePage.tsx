import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useBlog } from '../context/BlogContext';

const MONTHS = [
  { num: '1', name: 'January (Thla 1)' },
  { num: '2', name: 'February (Thla 2)' },
  { num: '3', name: 'March (Thla 3)' },
  { num: '4', name: 'April (Thla 4)' },
  { num: '5', name: 'May (Thla 5)' },
  { num: '6', name: 'June (Thla 6)' },
  { num: '7', name: 'July (Thla 7)' },
  { num: '8', name: 'August (Thla 8)' },
  { num: '9', name: 'September (Thla 9)' },
  { num: '10', name: 'October (Thla 10)' },
  { num: '11', name: 'November (Thla 11)' },
  { num: '12', name: 'December (Thla 12)' },
];

export const ArchivePage: React.FC = () => {
  const { articles } = useBlog();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Loneitu Archive — Loneitu (MIZORAM TAN)';
  }, []);

  // Only consider published articles
  const publishedArticles = useMemo(() => {
    return articles.filter(a => a.status === 'published');
  }, [articles]);

  // Extract available years dynamically from published articles
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

  // Filter articles by title query, year, and month
  const filteredArticles = useMemo(() => {
    return publishedArticles.filter(art => {
      const d = new Date(art.publishedAt);
      const hasValidDate = !isNaN(d.getTime());

      // Year filter
      if (selectedYear !== 'all') {
        if (!hasValidDate || d.getFullYear().toString() !== selectedYear) {
          return false;
        }
      }

      // Month filter
      if (selectedMonth !== 'all') {
        if (!hasValidDate || (d.getMonth() + 1).toString() !== selectedMonth) {
          return false;
        }
      }

      // Title search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!art.title.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [publishedArticles, searchQuery, selectedYear, selectedMonth]);

  return (
    <div className="min-h-screen bg-[#FBFBF8] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Clean Header: Loneitu Archive */}
        <div className="bg-[#143520] text-white rounded-3xl p-6 sm:p-10 border border-[#1E542E] shadow-sm">
          <h1 className="font-serif font-bold text-2xl sm:text-4xl text-white">
            Loneitu Archive
          </h1>
        </div>

        {/* Compact Controls: Search & Date Dropdown Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search article titles..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs sm:text-sm text-[#143520] placeholder-[#6F5B3C]/70 focus:outline-hidden focus:border-[#256B3A] shadow-2xs transition-colors"
            />
            <Search className="w-4 h-4 text-[#6F5B3C] absolute left-3.5 top-3" />
          </div>

          {/* Compact Dropdown Selectors: Year & Month */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Year Selector */}
            <div className="flex-1 sm:flex-initial">
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs font-semibold text-[#143520] focus:outline-hidden focus:border-[#256B3A] shadow-2xs cursor-pointer"
                aria-label="Filter by Year"
              >
                <option value="all">All Years</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr.toString()}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="flex-1 sm:flex-initial">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs font-semibold text-[#143520] focus:outline-hidden focus:border-[#256B3A] shadow-2xs cursor-pointer"
                aria-label="Filter by Month"
              >
                <option value="all">All Months</option>
                {MONTHS.map(m => (
                  <option key={m.num} value={m.num}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Articles List: Title Only */}
        <div className="bg-white rounded-2xl border border-[#DDD4BC] shadow-xs overflow-hidden">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-xs sm:text-sm font-medium text-[#6F5B3C]">
                Article hmuh a ni lo e.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F2EFE6]">
              {filteredArticles.map((art) => (
                <li key={art.id}>
                  <Link
                    to={`/article/${art.slug}`}
                    className="p-4 sm:px-6 hover:bg-[#FAF8F3] transition-colors group flex items-center justify-between gap-4 block"
                  >
                    <span className="font-serif font-bold text-sm sm:text-base text-[#143520] group-hover:text-[#256B3A] transition-colors leading-snug">
                      {art.title}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#8F7855] group-hover:text-[#256B3A] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
