import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  List,
  Grid,
  CalendarDays,
  Sparkles,
  ArrowUpDown,
  X,
  Bookmark,
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { formatDate } from '../utils/formatDate';
import type { Article } from '../types/blog';

// Mizo & English Month Data
const MONTHS_DATA = [
  { num: 1, name: 'January', short: 'Jan', mizo: 'Pawlkut thla' },
  { num: 2, name: 'February', short: 'Feb', mizo: 'Ramtuk thla' },
  { num: 3, name: 'March', short: 'Mar', mizo: 'Vau thla' },
  { num: 4, name: 'April', short: 'Apr', mizo: 'Tau thla' },
  { num: 5, name: 'May', short: 'May', mizo: 'Tomir thla' },
  { num: 6, name: 'June', short: 'Jun', mizo: 'Nikir thla' },
  { num: 7, name: 'July', short: 'Jul', mizo: 'Vawkhniakzawn thla' },
  { num: 8, name: 'August', short: 'Aug', mizo: 'Thiitin thla' },
  { num: 9, name: 'September', short: 'Sep', mizo: 'Mimkut thla' },
  { num: 10, name: 'October', short: 'Oct', mizo: 'Khuangchawi thla' },
  { num: 11, name: 'November', short: 'Nov', mizo: 'Tlangkâwng thla' },
  { num: 12, name: 'December', short: 'Dec', mizo: 'Pawltlak thla' },
];

interface DayGroup {
  dateKey: string;      // "YYYY-MM-DD"
  dayNumber: number;    // 1-31
  dayOfWeek: string;    // "Wednesday"
  formattedDate: string; // "November 4, 2026"
  articles: Article[];
}

interface MonthGroup {
  monthNum: number;     // 1-12
  monthName: string;    // "November"
  mizoName: string;     // "Tlangkâwng thla"
  shortName: string;    // "Nov"
  year: number;
  totalArticles: number;
  days: DayGroup[];
}

interface YearGroup {
  year: number;
  totalArticles: number;
  months: MonthGroup[];
}

export const ArchivePage: React.FC = () => {
  const { articles, bookmarks, toggleBookmark } = useBlog();
  const routeParams = useParams<{ year?: string; month?: string; day?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return routeParams.year || searchParams.get('year') || 'all';
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return routeParams.month || searchParams.get('month') || 'all';
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return routeParams.day || searchParams.get('date') || 'all';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [viewMode, setViewMode] = useState<'timeline' | 'cards' | 'compact'>('timeline');

  // Expanded accordion sections in timeline view
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  // Sync route and query params if they change
  useEffect(() => {
    if (routeParams.year) setSelectedYear(routeParams.year);
    if (routeParams.month) setSelectedMonth(routeParams.month);
    if (routeParams.day) setSelectedDate(routeParams.day);
  }, [routeParams]);

  // Keep search params in sync with active filter
  const updateFilters = (newYear: string, newMonth: string, newDate: string) => {
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    setSelectedDate(newDate);

    const params = new URLSearchParams();
    if (newYear !== 'all') params.set('year', newYear);
    if (newMonth !== 'all') params.set('month', newMonth);
    if (newDate !== 'all') params.set('date', newDate);
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

  // Auto-expand the newest year and month upon load
  useEffect(() => {
    if (availableYears.length > 0) {
      setExpandedYears(prev => ({
        ...prev,
        [availableYears[0]]: true,
      }));
    }
  }, [availableYears]);

  // Hierarchical chronological grouping
  const archiveHierarchy = useMemo<YearGroup[]>(() => {
    // 1. Filter articles according to search query and date filters
    const filtered = publishedArticles.filter(art => {
      const d = new Date(art.publishedAt);
      if (isNaN(d.getTime())) return false;

      const artYear = d.getFullYear().toString();
      const artMonthNum = (d.getMonth() + 1).toString();
      const artMonthPadded = artMonthNum.padStart(2, '0');
      const artDayNum = d.getDate().toString();
      const artDayPadded = artDayNum.padStart(2, '0');
      const artDateKey = `${artYear}-${artMonthPadded}-${artDayPadded}`;

      // Year filter
      if (selectedYear !== 'all' && artYear !== selectedYear) {
        return false;
      }

      // Month filter (handles both "11" and "Nov" or month number)
      if (selectedMonth !== 'all') {
        const monthMatch =
          selectedMonth === artMonthNum ||
          selectedMonth === artMonthPadded ||
          MONTHS_DATA.find(m => m.short.toLowerCase() === selectedMonth.toLowerCase())?.num.toString() === artMonthNum;
        if (!monthMatch) return false;
      }

      // Date / Day filter
      if (selectedDate !== 'all') {
        if (selectedDate.includes('-')) {
          // Exact YYYY-MM-DD
          if (artDateKey !== selectedDate) return false;
        } else {
          // Just day number
          if (selectedDate !== artDayNum && selectedDate !== artDayPadded) return false;
        }
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

    // 2. Sort articles
    filtered.sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime();
      const timeB = new Date(b.publishedAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    // 3. Group into Year -> Month -> Day
    const yearMap = new Map<number, Map<number, Map<string, Article[]>>>();

    filtered.forEach(art => {
      const d = new Date(art.publishedAt);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthPadded = month.toString().padStart(2, '0');
      const dayPadded = d.getDate().toString().padStart(2, '0');
      const dateKey = `${year}-${monthPadded}-${dayPadded}`;

      if (!yearMap.has(year)) {
        yearMap.set(year, new Map());
      }
      const monthMap = yearMap.get(year)!;
      if (!monthMap.has(month)) {
        monthMap.set(month, new Map());
      }
      const dayMap = monthMap.get(month)!;
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, []);
      }
      dayMap.get(dateKey)!.push(art);
    });

    // 4. Construct sorted hierarchy objects
    const result: YearGroup[] = [];

    const sortedYears = Array.from(yearMap.keys()).sort((a, b) =>
      sortOrder === 'desc' ? b - a : a - b
    );

    sortedYears.forEach(year => {
      const monthMap = yearMap.get(year)!;
      const sortedMonths = Array.from(monthMap.keys()).sort((a, b) =>
        sortOrder === 'desc' ? b - a : a - b
      );

      let yearTotal = 0;
      const monthGroups: MonthGroup[] = [];

      sortedMonths.forEach(monthNum => {
        const dayMap = monthMap.get(monthNum)!;
        const monthMeta = MONTHS_DATA.find(m => m.num === monthNum) || {
          num: monthNum,
          name: `Month ${monthNum}`,
          short: `M${monthNum}`,
          mizo: '',
        };

        const sortedDateKeys = Array.from(dayMap.keys()).sort((a, b) =>
          sortOrder === 'desc' ? b.localeCompare(a) : a.localeCompare(b)
        );

        let monthTotal = 0;
        const dayGroups: DayGroup[] = [];

        sortedDateKeys.forEach(dateKey => {
          const arts = dayMap.get(dateKey)!;
          monthTotal += arts.length;
          yearTotal += arts.length;

          const dateObj = new Date(dateKey + 'T00:00:00');
          const dayNumber = dateObj.getDate();
          const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });

          dayGroups.push({
            dateKey,
            dayNumber,
            dayOfWeek,
            formattedDate,
            articles: arts,
          });
        });

        monthGroups.push({
          monthNum,
          monthName: monthMeta.name,
          mizoName: monthMeta.mizo,
          shortName: monthMeta.short,
          year,
          totalArticles: monthTotal,
          days: dayGroups,
        });
      });

      result.push({
        year,
        totalArticles: yearTotal,
        months: monthGroups,
      });
    });

    return result;
  }, [publishedArticles, selectedYear, selectedMonth, selectedDate, searchQuery, sortOrder]);

  // Total matching articles across the current filter
  const totalMatchingArticles = useMemo(() => {
    return archiveHierarchy.reduce((acc, y) => acc + y.totalArticles, 0);
  }, [archiveHierarchy]);

  // Counts for each year button
  const yearCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    publishedArticles.forEach(a => {
      const y = new Date(a.publishedAt).getFullYear();
      counts[y] = (counts[y] || 0) + 1;
    });
    return counts;
  }, [publishedArticles]);

  // Counts for each month in the currently selected year (or all years)
  const monthCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    publishedArticles.forEach(a => {
      const d = new Date(a.publishedAt);
      if (selectedYear === 'all' || d.getFullYear().toString() === selectedYear) {
        const m = d.getMonth() + 1;
        counts[m] = (counts[m] || 0) + 1;
      }
    });
    return counts;
  }, [publishedArticles, selectedYear]);

  // Toggle year collapse
  const toggleYearCollapse = (year: number) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  // Toggle month collapse
  const toggleMonthCollapse = (key: string) => {
    setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    updateFilters('all', 'all', 'all');
    setSearchQuery('');
  };

  const isFilterActive =
    selectedYear !== 'all' || selectedMonth !== 'all' || selectedDate !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="w-full min-h-screen bg-[#FBFBF8] pb-24">
      {/* Hero Banner */}
      <div className="w-full bg-gradient-to-b from-[#143520] via-[#1A4529] to-[#143520] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#256B3A] shadow-inner">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#ADC6A7]">
            <Link to="/" className="hover:text-white transition-colors">
              Kawtchhuah (Home)
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#5B8564]" />
            <span className="text-[#BFDC28] font-semibold">Thuziak Dahkhawm (Archive)</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#256B3A]/60 border border-[#BFDC28]/40 text-[#BFDC28] text-xs font-semibold tracking-wide">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>CHRONOLOGICAL PUBLICATION INDEX</span>
              </div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                Thuziak Dahkhawm (Post Archive)
              </h1>
              <p className="text-sm text-[#D7E3D5] leading-relaxed">
                Mizoram thlai leh leilung chungchanga thuziak leh field trial report zawng zawng te, kum (year), thla (month), leh ni (date) bika remfel leh dahkhawmna.
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-3 gap-3 bg-[#112D1B]/80 p-4 rounded-2xl border border-[#256B3A]/50 backdrop-blur-xs shrink-0">
              <div className="text-center px-2">
                <div className="font-serif font-bold text-2xl text-[#BFDC28]">
                  {publishedArticles.length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#ADC6A7] mt-0.5">
                  Published Posts
                </div>
              </div>
              <div className="text-center px-2 border-x border-[#256B3A]/60">
                <div className="font-serif font-bold text-2xl text-white">
                  {availableYears.length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#ADC6A7] mt-0.5">
                  Years Span
                </div>
              </div>
              <div className="text-center px-2">
                <div className="font-serif font-bold text-2xl text-white">
                  {totalMatchingArticles}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#ADC6A7] mt-0.5">
                  Showing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Archive Interactive Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-[#DDD4BC] p-5 sm:p-6 shadow-xs space-y-5">
          {/* Top row: Search + Sort + View Mode */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search archived articles by title, sector, author, or keyword..."
                className="w-full pl-10 pr-10 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder-[#8F7855] focus:outline-hidden focus:border-[#256B3A] focus:bg-white transition-colors"
              />
              <Search className="w-4 h-4 text-[#8F7855] absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-[#8F7855] hover:text-[#13341D]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controls right */}
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              {/* Sort Order Toggle */}
              <button
                type="button"
                onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#F6F4EB] hover:bg-[#EBE6D6] border border-[#DDD4BC] rounded-xl text-xs font-semibold text-[#143520] transition-colors cursor-pointer"
                title="Change chronological order"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#256B3A]" />
                <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-[#F6F4EB] p-1 rounded-xl border border-[#DDD4BC]">
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'timeline'
                      ? 'bg-[#143520] text-white shadow-xs'
                      : 'text-[#6F5B3C] hover:text-[#143520]'
                  }`}
                  title="Timeline / Grouped Tree View"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-[#143520] text-white shadow-xs'
                      : 'text-[#6F5B3C] hover:text-[#143520]'
                  }`}
                  title="Card Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'compact'
                      ? 'bg-[#143520] text-white shadow-xs'
                      : 'text-[#6F5B3C] hover:text-[#143520]'
                  }`}
                  title="Compact Index / Ledger View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Reset filter button if active */}
              {isFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-amber-700" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Year selector row */}
          <div className="pt-2 border-t border-[#EBE6D6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F7855] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#256B3A]" />
                <span>Kum Thlan (Filter by Year)</span>
              </span>
              {selectedYear !== 'all' && (
                <span className="text-[11px] text-[#256B3A] font-semibold">
                  Year: {selectedYear}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => updateFilters('all', selectedMonth, selectedDate)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedYear === 'all'
                    ? 'bg-[#143520] text-white shadow-xs scale-102'
                    : 'bg-[#F6F4EB] text-[#54432C] hover:bg-[#EBE6D6] border border-[#DDD4BC]'
                }`}
              >
                Kum Zawng Zawng (All Years) ({publishedArticles.length})
              </button>

              {availableYears.map(yr => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => updateFilters(yr.toString(), selectedMonth, selectedDate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedYear === yr.toString()
                      ? 'bg-[#143520] text-white shadow-xs scale-102'
                      : 'bg-[#F6F4EB] text-[#54432C] hover:bg-[#EBE6D6] border border-[#DDD4BC]'
                  }`}
                >
                  <span>{yr}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedYear === yr.toString()
                        ? 'bg-[#BFDC28] text-[#143520]'
                        : 'bg-[#DDD4BC] text-[#3B2E1D]'
                    }`}
                  >
                    {yearCounts[yr] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Month selector row */}
          <div className="pt-2 border-t border-[#EBE6D6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F7855] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#256B3A]" />
                <span>Thla Thlan (Filter by Month)</span>
              </span>
              {selectedMonth !== 'all' && (
                <span className="text-[11px] text-[#256B3A] font-semibold">
                  Thla: {MONTHS_DATA.find(m => m.num.toString() === selectedMonth || m.short.toLowerCase() === selectedMonth.toLowerCase())?.name || selectedMonth}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => updateFilters(selectedYear, 'all', selectedDate)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedMonth === 'all'
                    ? 'bg-[#256B3A] text-white shadow-xs'
                    : 'bg-[#F6F4EB] text-[#54432C] hover:bg-[#EBE6D6] border border-[#DDD4BC]'
                }`}
              >
                All Months
              </button>

              {MONTHS_DATA.map(m => {
                const count = monthCounts[m.num] || 0;
                const isSelected = selectedMonth === m.num.toString() || selectedMonth.toLowerCase() === m.short.toLowerCase();

                return (
                  <button
                    key={m.num}
                    type="button"
                    onClick={() => updateFilters(selectedYear, m.num.toString(), selectedDate)}
                    disabled={count === 0 && selectedYear !== 'all'}
                    title={`${m.name} (${m.mizo})`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#256B3A] text-white shadow-xs ring-1 ring-[#143520]'
                        : count > 0
                        ? 'bg-[#F6F4EB] text-[#143520] hover:bg-[#EBE6D6] border border-[#DDD4BC]'
                        : 'bg-transparent text-[#B5A895] cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>{m.short}</span>
                    {count > 0 && (
                      <span
                        className={`text-[9px] px-1 rounded-full ${
                          isSelected ? 'bg-white text-[#256B3A]' : 'bg-[#DDD4BC]/70 text-[#54432C]'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker row */}
          <div className="pt-2 border-t border-[#EBE6D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F7855]">
                Ni Bika Zawn (Specific Date):
              </span>
              <input
                type="date"
                value={selectedDate.includes('-') ? selectedDate : ''}
                onChange={e => updateFilters(selectedYear, selectedMonth, e.target.value || 'all')}
                className="px-3 py-1.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
              />
              {selectedDate !== 'all' && (
                <button
                  type="button"
                  onClick={() => updateFilters(selectedYear, selectedMonth, 'all')}
                  className="text-xs text-red-600 hover:underline cursor-pointer"
                >
                  Clear date filter
                </button>
              )}
            </div>

            <div className="text-xs text-[#8F7855]">
              Showing <span className="font-bold text-[#143520]">{totalMatchingArticles}</span> articles
            </div>
          </div>
        </div>

        {/* Empty State */}
        {archiveHierarchy.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#DDD4BC] p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <Calendar className="w-12 h-12 text-[#8F7855] mx-auto opacity-60" />
            <h3 className="font-serif font-bold text-xl text-[#143520]">
              He hun chhunga thuziak hmuh a ni lo
            </h3>
            <p className="text-xs text-[#6F5B3C] leading-relaxed">
              No archived publications match your current date, year, or search criteria.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#BFDC28]" />
              <span>Chhiar Zawng Zawng En Rawh (Show All Archives)</span>
            </button>
          </div>
        )}

        {/* 1. TIMELINE / GROUPED TREE VIEW */}
        {viewMode === 'timeline' && archiveHierarchy.length > 0 && (
          <div className="space-y-10">
            {archiveHierarchy.map(yearGroup => {
              const isYearExpanded = expandedYears[yearGroup.year] !== false;

              return (
                <div key={yearGroup.year} className="space-y-6">
                  {/* Year Header Card */}
                  <div
                    onClick={() => toggleYearCollapse(yearGroup.year)}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#DDD4BC] shadow-xs cursor-pointer hover:border-[#256B3A] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#143520] text-[#BFDC28] flex items-center justify-center font-serif font-bold text-lg shadow-xs">
                        {yearGroup.year}
                      </div>
                      <div>
                        <h2 className="font-serif font-bold text-xl text-[#143520] group-hover:text-[#256B3A] transition-colors">
                          Kum {yearGroup.year} Chanchinbu Dahkhawm
                        </h2>
                        <p className="text-xs text-[#8F7855]">
                          {yearGroup.totalArticles} published research papers & field dispatches
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#EBF1EA] text-[#1E542E] font-bold">
                        {yearGroup.totalArticles} articles
                      </span>
                      {isYearExpanded ? (
                        <ChevronDown className="w-5 h-5 text-[#8F7855] group-hover:text-[#143520]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#8F7855] group-hover:text-[#143520]" />
                      )}
                    </div>
                  </div>

                  {/* Year Content (Months & Days) */}
                  {isYearExpanded && (
                    <div className="pl-4 sm:pl-6 border-l-2 border-[#256B3A]/30 space-y-8 ml-4">
                      {yearGroup.months.map(monthGroup => {
                        const monthKey = `${yearGroup.year}-${monthGroup.monthNum}`;
                        const isMonthExpanded = expandedMonths[monthKey] !== false;

                        return (
                          <div key={monthGroup.monthNum} className="space-y-4">
                            {/* Month Header */}
                            <div
                              onClick={() => toggleMonthCollapse(monthKey)}
                              className="flex items-center justify-between p-3.5 bg-[#FAF8F3] rounded-xl border border-[#DDD4BC]/70 cursor-pointer hover:bg-white transition-all group"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#256B3A]" />
                                <span className="font-serif font-bold text-base text-[#143520] group-hover:text-[#256B3A]">
                                  {monthGroup.monthName} {yearGroup.year}
                                </span>
                                {monthGroup.mizoName && (
                                  <span className="text-xs text-[#8F7855] italic hidden sm:inline">
                                    ({monthGroup.mizoName})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-[#6F5B3C]">
                                  {monthGroup.totalArticles} articles
                                </span>
                                {isMonthExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-[#8F7855]" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-[#8F7855]" />
                                )}
                              </div>
                            </div>

                            {/* Days in Month */}
                            {isMonthExpanded && (
                              <div className="pl-4 sm:pl-6 space-y-6">
                                {monthGroup.days.map(dayGroup => (
                                  <div key={dayGroup.dateKey} className="space-y-3">
                                    {/* Date Badge */}
                                    <div className="flex items-center gap-2">
                                      <div className="px-2.5 py-1 rounded-md bg-[#EBE6D6] text-[#3B2E1D] text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
                                        <Calendar className="w-3 h-3 text-[#256B3A]" />
                                        <span>{dayGroup.formattedDate}</span>
                                      </div>
                                      <span className="text-[11px] text-[#8F7855]">
                                        ({dayGroup.dayOfWeek})
                                      </span>
                                    </div>

                                    {/* Articles on this specific date */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {dayGroup.articles.map(article => (
                                        <div
                                          key={article.id}
                                          className="bg-white rounded-2xl border border-[#DDD4BC] p-4.5 hover:border-[#256B3A] hover:shadow-md transition-all group flex flex-col justify-between"
                                        >
                                          <div className="space-y-2.5">
                                            {/* Category & Date */}
                                            <div className="flex items-center justify-between text-[11px]">
                                              <span className="px-2 py-0.5 rounded-md bg-[#EBF1EA] text-[#1E542E] font-semibold">
                                                {article.category}
                                              </span>
                                              <span className="text-[#8F7855] flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{article.readingTimeMinutes} min read</span>
                                              </span>
                                            </div>

                                            {/* Title */}
                                            <Link
                                              to={`/article/${article.slug}`}
                                              className="block font-serif font-bold text-base text-[#143520] group-hover:text-[#256B3A] transition-colors leading-snug"
                                            >
                                              {article.title}
                                            </Link>

                                            {/* Excerpt */}
                                            {article.excerpt && (
                                              <p className="text-xs text-[#6F5B3C] line-clamp-2 leading-relaxed">
                                                {article.excerpt}
                                              </p>
                                            )}
                                          </div>

                                          {/* Footer: Author + Link */}
                                          <div className="pt-3.5 mt-3 border-t border-[#F6F4EB] flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <img
                                                src={article.author.avatar}
                                                alt={article.author.name}
                                                className="w-6 h-6 rounded-full object-cover border border-[#DDD4BC]"
                                              />
                                              <span className="text-xs font-medium text-[#13341D]">
                                                {article.author.name}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              <button
                                                type="button"
                                                onClick={() => toggleBookmark(article.id)}
                                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                                  bookmarks.includes(article.id)
                                                    ? 'bg-[#256B3A] text-white border-[#256B3A]'
                                                    : 'text-[#8F7855] hover:text-[#143520] border-transparent'
                                                }`}
                                                title="Save field note"
                                              >
                                                <Bookmark className="w-3.5 h-3.5" />
                                              </button>
                                              <Link
                                                to={`/article/${article.slug}`}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-[#256B3A] group-hover:translate-x-1 transition-transform"
                                              >
                                                <span>Read</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                              </Link>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 2. CARD GRID VIEW */}
        {viewMode === 'cards' && archiveHierarchy.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archiveHierarchy.flatMap(y =>
              y.months.flatMap(m =>
                m.days.flatMap(d =>
                  d.articles.map(article => (
                    <article
                      key={article.id}
                      className="bg-white rounded-2xl border border-[#DDD4BC] overflow-hidden hover:border-[#256B3A] hover:shadow-lg transition-all flex flex-col justify-between group"
                    >
                      {article.coverImage && (
                        <div className="h-44 w-full overflow-hidden bg-[#EFECE1]">
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1EA] text-[#1E542E] font-semibold text-[11px]">
                              {article.category}
                            </span>
                            <span className="text-[#8F7855] font-semibold text-[11px] flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#256B3A]" />
                              <span>{formatDate(article.publishedAt)}</span>
                            </span>
                          </div>

                          <Link
                            to={`/article/${article.slug}`}
                            className="block font-serif font-bold text-lg text-[#143520] group-hover:text-[#256B3A] transition-colors leading-snug"
                          >
                            {article.title}
                          </Link>

                          {article.excerpt && (
                            <p className="text-xs text-[#6F5B3C] line-clamp-3 leading-relaxed">
                              {article.excerpt}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-[#F6F4EB] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={article.author.avatar}
                              alt={article.author.name}
                              className="w-7 h-7 rounded-full object-cover border border-[#DDD4BC]"
                            />
                            <div>
                              <div className="text-xs font-bold text-[#143520]">
                                {article.author.name}
                              </div>
                              <div className="text-[10px] text-[#8F7855]">
                                {article.readingTimeMinutes} min read
                              </div>
                            </div>
                          </div>

                          <Link
                            to={`/article/${article.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#256B3A] group-hover:translate-x-1 transition-transform"
                          >
                            <span>Read</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))
                )
              )
            )}
          </div>
        )}

        {/* 3. COMPACT INDEX / LEDGER VIEW */}
        {viewMode === 'compact' && archiveHierarchy.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#DDD4BC] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F3] text-[#6F5B3C] border-b border-[#EBE6D6] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Publication Date</th>
                    <th className="py-3 px-4">Article Title</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4 text-right">Read</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6F4EB]">
                  {archiveHierarchy.flatMap(y =>
                    y.months.flatMap(m =>
                      m.days.flatMap(d =>
                        d.articles.map(art => (
                          <tr key={art.id} className="hover:bg-[#FBFBF8] transition-colors group">
                            <td className="py-3 px-4 font-mono text-[11px] text-[#8F7855] whitespace-nowrap">
                              {d.formattedDate}
                            </td>
                            <td className="py-3 px-4">
                              <Link
                                to={`/article/${art.slug}`}
                                className="font-serif font-bold text-sm text-[#143520] group-hover:text-[#256B3A] transition-colors"
                              >
                                {art.title}
                              </Link>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full bg-[#EBF1EA] text-[#1E542E] font-medium text-[10px]">
                                {art.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-[#54432C]">
                              {art.author.name}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <Link
                                to={`/article/${art.slug}`}
                                className="inline-flex items-center gap-1 font-bold text-[#256B3A] hover:underline"
                              >
                                <span>Open</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        ))
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
