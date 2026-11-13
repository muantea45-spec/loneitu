import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Calendar, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBlog } from '../../context/BlogContext';
import { formatDate } from '../../utils/formatDate';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function highlightMatch(text: string, search: string): React.ReactNode {
  if (!search.trim() || !text) return text;
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <mark key={i} className="bg-[#BFDC28]/70 text-[#143520] font-bold rounded-xs px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { articles, categories, tags, setFilterTag } = useBlog();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredArticles = query.trim()
    ? articles.filter(art => {
        if (art.status !== 'published') return false;
        const q = query.toLowerCase();
        return (
          art.title.toLowerCase().includes(q) ||
          art.content.toLowerCase().includes(q) ||
          art.category.toLowerCase().includes(q) ||
          art.author.name.toLowerCase().includes(q) ||
          art.tags.some(t => t.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSelectArticle = (slug: string) => {
    onClose();
    navigate(`/article/${slug}`);
  };

  const handleSelectTag = (tagSlug: string) => {
    setFilterTag(tagSlug);
    onClose();
    navigate(`/tag/${tagSlug}`);
  };

  const handleSelectCategory = (catSlug: string) => {
    onClose();
    navigate(`/category/${catSlug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="bg-[#FBFBF8] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#DDD4BC] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#EBE6D6] bg-white">
          <Search className="w-5 h-5 text-[#6F5B3C] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles, soil practices, crops, authors, #tags..."
            className="w-full bg-transparent text-[#13341D] text-base focus:outline-hidden placeholder:text-[#6F5B3C]/70"
          >
          </input>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#6F5B3C] hover:text-[#13341D] p-1.5 mr-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1.5 bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#6F5B3C] font-semibold rounded-lg border border-[#DDD4BC] cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 flex-1">
          {query.trim() === '' ? (
            <div className="space-y-6 py-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6F5B3C] mb-2.5">
                  Categories
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.slug)}
                      className="text-left p-3 rounded-xl border border-[#EBE6D6] hover:border-[#32864A] hover:bg-[#F2F7F3] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#13341D] group-hover:text-[#256B3A]">
                          {cat.name}
                        </div>
                        <div className="text-xs text-[#6F5B3C] line-clamp-1">
                          {cat.description}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#6F5B3C] group-hover:text-[#256B3A] shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6F5B3C] mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 8).map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleSelectTag(tag.slug)}
                      className="text-xs px-2.5 py-1 rounded-md bg-[#EBE6D6] text-[#3B2E1D] hover:bg-[#256B3A] hover:text-white transition-colors cursor-pointer"
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[#6F5B3C]">
                Found {filteredArticles.length} article{filteredArticles.length === 1 ? '' : 's'} matching "{query}"
              </p>
              {filteredArticles.map(art => (
                <div
                  key={art.id}
                  onClick={() => handleSelectArticle(art.slug)}
                  className="p-3.5 rounded-xl border border-[#EBE6D6] hover:border-[#32864A] bg-white hover:bg-[#F2F7F3] transition-all cursor-pointer flex gap-4 group"
                >
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-[#256B3A] uppercase tracking-wider">
                      {highlightMatch(art.category, query)}
                    </span>
                    <h4 className="text-sm font-semibold text-[#13341D] group-hover:text-[#256B3A] line-clamp-1 font-serif">
                      {highlightMatch(art.title, query)}
                    </h4>
                    {art.excerpt && (
                      <p className="text-xs text-[#6F5B3C] line-clamp-2 mt-1 leading-relaxed">
                        {highlightMatch(art.excerpt, query)}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-[#6F5B3C] mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(art.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {art.readingTimeMinutes} min read
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#6F5B3C]">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-[#DDD4BC]" />
              <p className="text-sm font-medium text-[#13341D]">No articles found for "{query}"</p>
              <p className="text-xs text-[#6F5B3C] mt-1">
                Try searching for soil, irrigation, agro-tech, or biochar.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-[#F6F4EB] border-t border-[#EBE6D6] flex items-center justify-between text-xs text-[#6F5B3C]">
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate</span>
          <span>Press <strong>ESC</strong> to dismiss</span>
        </div>
      </div>
    </div>
  );
};

