import React, { useState, useEffect, useRef } from 'react';
import { BlogCard } from './BlogCard';
import type { Article } from '../../types/blog';
import { BookOpen, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

interface BlogGridProps {
  articles: Article[];
}

const POSTS_PER_PAGE_MOBILE = 5;
const POSTS_PER_PAGE_DESKTOP = 6;

export const BlogGrid: React.FC<BlogGridProps> = ({ articles }) => {
  const { clearFilters } = useBlog();
  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const postsPerPage = isDesktop ? POSTS_PER_PAGE_DESKTOP : POSTS_PER_PAGE_MOBILE;
  const totalPages = Math.ceil(articles.length / postsPerPage);

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
            Thuziak thar hmuh tur a awm rih lo.
          </h3>
          <p className="text-xs sm:text-sm text-[#6F5B3C] leading-relaxed">
            I thil zawn chhungah hian thuziak a awm rih lo.
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

  // Slice posts according to viewport (up to 6 for desktop, 5 for mobile)
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentArticles = articles.slice(startIndex, startIndex + postsPerPage);

  return (
    <div ref={gridTopRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Heading: CONTENT - Centered horizontally across all viewports */}
      <div className="mb-8 pb-3 border-b border-[#EBE6D6] text-center">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#143520] tracking-tight uppercase">
          CONTENT
        </h2>
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
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-xl text-xs font-semibold border border-[#DDD4BC] bg-white text-[#143520] hover:bg-[#F6F4EB] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden"
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
                  className={`min-w-[44px] min-h-[44px] px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden ${
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
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-xl text-xs font-semibold border border-[#DDD4BC] bg-white text-[#143520] hover:bg-[#F6F4EB] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden"
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
