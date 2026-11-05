import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Bookmark, Search, ArrowRight, Tag as TagIcon } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  onOpenBookmarks,
}) => {
  const { categories, tags, bookmarks } = useBlog();
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-12">
        <div className="w-screen max-w-sm bg-[#FBFBF8] border-l border-[#DDD4BC] shadow-2xl flex flex-col justify-between">
          {/* Top section */}
          <div>
            <div className="p-4 border-b border-[#EBE6D6] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-[#DDD4BC] flex items-center justify-center shadow-xs overflow-hidden">
                  <img src="/logo.png" alt="Mizo Farm Solutions" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-serif font-bold text-lg text-[#143520] block leading-none">Loneitu</span>
                  <span className="text-[9px] font-bold tracking-widest text-[#8F7855] uppercase">MIZORAM TAN</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#8F7855] hover:text-[#13341D] rounded-lg hover:bg-[#F6F4EB]"
                aria-label="Close mobile menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 gap-2 p-4 bg-[#F6F4EB] border-b border-[#EBE6D6]">
              <button
                onClick={() => {
                  onClose();
                  onOpenSearch();
                }}
                className="flex items-center justify-center gap-2 p-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs font-medium text-[#13341D] hover:bg-[#EBE6D6]"
              >
                <Search className="w-4 h-4 text-[#256B3A]" />
                <span>Search</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenBookmarks();
                }}
                className="flex items-center justify-center gap-2 p-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs font-medium text-[#13341D] hover:bg-[#EBE6D6]"
              >
                <Bookmark className="w-4 h-4 text-[#256B3A]" />
                <span>Saved ({bookmarks.length})</span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-1">
              <Link
                to="/"
                onClick={onClose}
                className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname === '/'
                    ? 'bg-[#EBF1EA] text-[#143520]'
                    : 'text-[#3B2E1D] hover:bg-[#F6F4EB]'
                }`}
              >
                Journal Front Page
              </Link>
              <Link
                to="/about"
                onClick={onClose}
                className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname === '/about'
                    ? 'bg-[#EBF1EA] text-[#143520]'
                    : 'text-[#3B2E1D] hover:bg-[#F6F4EB]'
                }`}
              >
                About & Editorial Mission
              </Link>
            </div>

            {/* Category Archives */}
            <div className="px-4 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8F7855] mb-2 px-3">
                Agricultural Sectors
              </p>
              <div className="space-y-1">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#4A584E] hover:text-[#143520] hover:bg-[#F6F4EB] transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8F7855]" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="px-4 py-3 border-t border-[#EBE6D6] mt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8F7855] mb-2 px-1 flex items-center gap-1">
                <TagIcon className="w-3 h-3" />
                <span>Popular Tags</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 6).map(t => (
                  <Link
                    key={t.id}
                    to={`/tag/${t.slug}`}
                    onClick={onClose}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-[#EBE6D6] text-[#3B2E1D] hover:bg-[#256B3A] hover:text-white transition-colors"
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

