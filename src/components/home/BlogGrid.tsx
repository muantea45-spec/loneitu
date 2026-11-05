import React, { useState, useEffect, useRef } from 'react';
import { BlogCard } from './BlogCard';
import type { Article, SortOption } from '../../types/blog';
import { BookOpen, RefreshCw, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

interface BlogGridProps {
  articles: Article[];
}

const POSTS_PER_PAGE = 5;

export const BlogGrid: React.FC<BlogGridProps> = ({ articles }) => {
  const { clearFilters, filterState, setSortBy } = useBlog();
  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(articles.length / POSTS_PER_PAGE);

  // If filtered articles count drops and currentPage is out of range, reset to 1
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [articles.length, totalPages, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (articles.length === 0) {
    return (
      <div className="w-full py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
          <div className="w-14 h-14 bg-[#F2F7F3] text-[#256B3A] rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#143520]">
            Thuziak Hmuh A Awm Rih Lo
          </h3>
          <p className="text-xs sm:text-sm text-[#6F5B3C] leading-relaxed">
            I thil zawn leh sector thlan chhungah hian thuziak a awm rih lo a ni. Thlan dang han thlang chhin teh.
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

  // Slice exactly 5 posts per page
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentArticles = articles.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <div ref={gridTopRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Controls Bar without "Thuziak thar" and without Archive button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-3 border-b border-[#EBE6D6]">
        <div>
          <p className="text-xs sm:text-sm text-[#8F7855]">
            Mizoram leilung mil thlai enkawl dan, huan siam dan thar, leh ran vulh dan tha
          </p>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
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
              <option value="reading-desc">Thui Ber</option>
              <option value="reading-asc">Tawi Ber</option>
            </select>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 bg-[#EBF1EA] text-[#1E542E] rounded-full border border-[#B7CEB4] hidden sm:inline-block">
            {articles.length} posts
          </span>
        </div>
      </div>

      {/* Grid container with up to 5 posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentArticles.map(article => (
          <BlogCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination Controls (when posts exceed 5) */}
      {totalPages > 1 && (
        <nav
          aria-label="Article pagination"
          className="flex flex-wrap items-center justify-center gap-2 mt-12 pt-8 border-t border-[#EBE6D6]"
        >
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#DDD4BC] bg-white text-[#143520] hover:bg-[#F6F4EB] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Hmasa</span>
          </button>

          {/* Numbered Page Buttons: Page 1, 2, 3... */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              const isActive = currentPage === pageNumber;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  className={`min-w-9 h-9 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-[#143520] text-[#BFDC28] shadow-sm ring-2 ring-[#143520]/20'
                      : 'bg-white border border-[#DDD4BC] text-[#143520] hover:bg-[#F6F4EB]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Page ${pageNumber}`}
                >
                  <span>Page {pageNumber}</span>
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#DDD4BC] bg-white text-[#143520] hover:bg-[#F6F4EB] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Dawt</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
};
