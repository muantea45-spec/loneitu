import React from 'react';
import { Bookmark, X, ArrowRight, Trash2, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBlog } from '../../context/BlogContext';

interface BookmarkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookmarkDrawer: React.FC<BookmarkDrawerProps> = ({ isOpen, onClose }) => {
  const { bookmarks, articles, toggleBookmark } = useBlog();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const bookmarkedArticles = articles.filter(a => bookmarks.includes(a.id));

  const handleOpenArticle = (slug: string) => {
    onClose();
    navigate(`/article/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FBFBF8] shadow-2xl border-l border-[#DDD4BC] flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#EBE6D6] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#F2F7F3] rounded-lg text-[#256B3A]">
                <Bookmark className="w-5 h-5 fill-[#256B3A]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#13341D]">Saved Field Notes</h3>
                <p className="text-xs text-[#6F5B3C]">
                  {bookmarkedArticles.length} article{bookmarkedArticles.length === 1 ? '' : 's'} in your personal reading queue
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#6F5B3C] hover:text-[#13341D] rounded-xl hover:bg-[#F6F4EB] transition-colors focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden cursor-pointer"
              aria-label="Close bookmarks drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {bookmarkedArticles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6F5B3C]">
                <BookOpen className="w-12 h-12 mb-3 text-[#DDD4BC]" />
                <h4 className="font-serif font-semibold text-[#13341D] text-base">Your Reading List is Empty</h4>
                <p className="text-xs text-[#6F5B3C] mt-1 max-w-xs">
                  Click the bookmark icon on any agronomic story, case study, or research paper to save it for offline reading.
                </p>
              </div>
            ) : (
              bookmarkedArticles.map(art => (
                <div
                  key={art.id}
                  className="bg-white border border-[#EBE6D6] hover:border-[#32864A] rounded-xl p-3.5 transition-all shadow-xs group"
                >
                  <div className="flex gap-3">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-20 h-20 rounded-lg object-cover shrink-0 cursor-pointer"
                      onClick={() => handleOpenArticle(art.slug)}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold text-[#256B3A] uppercase tracking-wider block">
                        {art.category}
                      </span>
                      <h4
                        onClick={() => handleOpenArticle(art.slug)}
                        className="text-sm font-semibold text-[#13341D] font-serif hover:text-[#256B3A] line-clamp-2 cursor-pointer mt-0.5"
                      >
                        {art.title}
                      </h4>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F6F4EB]">
                        <span className="text-[11px] text-[#6F5B3C] font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {art.readingTimeMinutes} min read
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleBookmark(art.id)}
                            className="text-[#6F5B3C] hover:text-red-700 p-1.5 transition-colors cursor-pointer"
                            title="Remove from reading queue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenArticle(art.slug)}
                            className="text-xs font-medium text-[#256B3A] hover:text-[#13341D] flex items-center gap-1"
                          >
                            Read <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {bookmarkedArticles.length > 0 && (
            <div className="p-4 bg-[#F6F4EB] border-t border-[#EBE6D6] flex justify-between items-center text-xs text-[#6F5B3C]">
              <span>Saved locally in browser</span>
              <button
                onClick={() => bookmarkedArticles.forEach(a => toggleBookmark(a.id))}
                className="text-red-700 hover:underline"
              >
                Clear all saved
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

