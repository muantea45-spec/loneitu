import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useBlog } from '../context/BlogContext';

export const ArchivePage: React.FC = () => {
  const { articles } = useBlog();
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Loneitu Archive — Loneitu (MIZORAM TAN)';
  }, []);

  // Only consider published articles
  const publishedArticles = useMemo(() => {
    return articles.filter(a => a.status === 'published');
  }, [articles]);

  // Filter articles by title query
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) {
      return publishedArticles;
    }
    const q = searchQuery.toLowerCase();
    return publishedArticles.filter(art =>
      art.title.toLowerCase().includes(q)
    );
  }, [publishedArticles, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FBFBF8] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Clean Header: Loneitu Archive */}
        <div className="bg-[#143520] text-white rounded-3xl p-6 sm:p-10 border border-[#1E542E] shadow-sm">
          <h1 className="font-serif font-bold text-2xl sm:text-4xl text-white">
            Loneitu Archive
          </h1>
        </div>

        {/* Clean Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search article titles..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#DDD4BC] rounded-2xl text-xs sm:text-sm text-[#143520] placeholder-[#6F5B3C]/70 focus:outline-hidden focus:border-[#256B3A] shadow-2xs transition-colors"
          />
          <Search className="w-4 h-4 text-[#6F5B3C] absolute left-4 top-3.5" />
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
