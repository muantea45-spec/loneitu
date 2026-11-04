import React from 'react';
import { Link } from 'react-router-dom';
import { BlogCard } from './BlogCard';
import type { Article, SortOption } from '../../types/blog';
import { BookOpen, RefreshCw, ArrowUpDown, Calendar } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

interface BlogGridProps {
  articles: Article[];
}

export const BlogGrid: React.FC<BlogGridProps> = ({ articles }) => {
  const { clearFilters, filterState, setSortBy } = useBlog();

  if (articles.length === 0) {
    return (
      <div className="w-full py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
          <div className="w-14 h-14 bg-[#F2F7F3] text-[#256B3A] rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#143520]">
            Thuziak thar Hmuh A Awm Rih Lo
          </h3>
          <p className="text-xs sm:text-sm text-[#6F5B3C] leading-relaxed">
            I thil zawn leh sector thlan chhungah hian thuziak thar a awm rih lo a ni. Thlan dang han thlang chhin teh.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143520] text-white text-xs font-semibold hover:bg-[#1E542E] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Siamṭhat Leh (Reset Filters)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-3 border-b border-[#EBE6D6]">
        <div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#143520]">
            Thuziak thar
          </h2>
          <p className="text-xs sm:text-sm text-[#8F7855] mt-1">
            Mizoram leilung mil thlai enkawl dan, huan siam dan thar, leh ran vulh dan tha
          </p>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <Link
            to="/archive"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#143520] rounded-xl border border-[#DDD4BC] text-xs font-semibold transition-colors shadow-2xs"
            title="Browse all posts by Year, Month, and Date"
          >
            <Calendar className="w-3.5 h-3.5 text-[#256B3A]" />
            <span>Chanchinbu Dahkhawm (Archive)</span>
          </Link>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#DDD4BC] text-xs shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#256B3A] shrink-0" />
            <select
              value={filterState.sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-[#13341D] font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="newest">A Thar Ber</option>
              <option value="oldest">A Hmasa Ber</option>
              <option value="popular">Chhiar Hlawh Ber</option>
              <option value="reading-asc">Chhiar Rang Ber</option>
              <option value="reading-desc">Chhiar Rei Ber</option>
            </select>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 bg-[#EBF1EA] text-[#1E542E] rounded-full border border-[#B7CEB4] hidden sm:inline-block">
            Thuziak thar {articles.length}
          </span>
        </div>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map(article => (
          <BlogCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

