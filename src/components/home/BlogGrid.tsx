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
  const totalPages = Math.ceil(articles.length / postsPerPage) || 1;
  const effectivePage = Math.min(Math.max(1, currentPage), totalPages);

  const handlePageChange = (page: number) => {
    const targetPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(targetPage);
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
  const startIndex = (effectivePage - 1) * postsPerPage;
  const currentArticles = articles.slice(startIndex, startIndex + postsPerPage);

  // Helper to compute compact mobile pages (up to 2 page options at a time)
  const getMobilePages = (): number[] => {
    if (totalPages <= 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (effectivePage <= 2) {
      return [1, 2];
    }
    if (effectivePage >= totalPages) {
      return [totalPages - 1, totalPages];
    }
    return [effectivePage, effectivePage + 1];
  };

  // Helper to compute clean desktop pages with ellipsis
  const getDesktopPages = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (effectivePage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (effectivePage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', effectivePage - 1, effectivePage, effectivePage + 1, '...', totalPages];
  };

  const mobilePages = getMobilePages();
  const desktopPages = getDesktopPages();

  return (
    <div ref={gridTopRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Heading: CONTENT - Centered horizontally across all viewports */}
      <div className="mb-8 pb-3 border-b border-[#EBE6D6] text-center">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#143520] tracking-tight uppercase">
          CONTENT
        </h2>
      </div>

      {/* Grid container with articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentArticles.map(article => (
          <BlogCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav
          aria-label="Article pagination"
          className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-[#EBE6D6]"
        >
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => handlePageChange(effectivePage - 1)}
            disabled={effectivePage === 1}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-xl text-xs font-semibold border border-[#DDD4BC] bg-white text-[#143520] hover:bg-[#F6F4EB] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Hmasa</span>
          </button>

          {/* MOBILE VIEW: Shows up to 2 page options (e.g. Page 1, Page 2) followed by Next arrow */}
          <div className="flex md:hidden items-center gap-1.5">
            {mobilePages.map(pageNumber => {
              const isActive = effectivePage === pageNumber;
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

          {/* DESKTOP VIEW: Full windowed pagination with ellipsis */}
          <div className="hidden md:flex items-center gap-1.5">
            {desktopPages.map((pageItem, index) => {
              if (pageItem === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-xs font-bold text-[#8F7855] select-none"
                  >
                    ...
                  </span>
                );
              }
              const pageNumber = pageItem as number;
              const isActive = effectivePage === pageNumber;
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
            onClick={() => handlePageChange(effectivePage + 1)}
            disabled={effectivePage === totalPages}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-xl text-xs font-semibold border border-[#DDD4BC] bg-white text-[#143520] hover:bg-[#F6F4EB] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden"
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
