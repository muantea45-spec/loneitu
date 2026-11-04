import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Search, Bookmark, Menu, Calendar } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenSidebarMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenBookmarks,
  onOpenSidebarMenu,
}) => {
  const { bookmarks } = useBlog();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
        isScrolled
          ? 'bg-[#FBFBF8]/95 backdrop-blur-md border-[#EBE6D6] shadow-xs'
          : 'bg-[#FBFBF8] border-[#EBE6D6]'
      }`}
    >
      {/* Main Navbar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E542E] to-[#143520] text-[#F7FAF6] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
            <Sprout className="w-6 h-6 text-[#BFDC28]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-2xl tracking-tight text-[#143520]">
                Lone<span className="text-[#32864A]">itu</span>
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#8F7855] -mt-0.5">
              MIZORAM TAN
            </p>
          </div>
        </Link>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Chronological Archive Trigger */}
          <Link
            to="/archive"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#143520] hover:text-[#256B3A] bg-[#F6F4EB] hover:bg-[#EBE6D6] rounded-xl border border-[#DDD4BC] transition-colors"
            title="Thuziak Dahkhawm (Chronological Post Archive)"
          >
            <Calendar className="w-4 h-4 text-[#256B3A]" />
            <span>Archive</span>
          </Link>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#6F5B3C] bg-[#F6F4EB] hover:bg-[#EBE6D6] rounded-xl border border-[#DDD4BC] transition-colors cursor-pointer"
            title="Search articles (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-[#256B3A]" />
            <span className="hidden sm:inline text-xs text-[#8F7855]">Search...</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 bg-white rounded border border-[#DDD4BC] text-[#8F7855]">
              ⌘K
            </kbd>
          </button>

          {/* Bookmarks Counter Trigger */}
          <button
            onClick={onOpenBookmarks}
            className="relative p-2.5 rounded-xl text-[#143520] hover:bg-[#F6F4EB] border border-transparent hover:border-[#DDD4BC] transition-colors cursor-pointer"
            title="View saved field notes"
            aria-label="Bookmarks"
          >
            <Bookmark className="w-5 h-5 text-[#256B3A]" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C2623D] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale">
                {bookmarks.length}
              </span>
            )}
          </button>

          {/* Universal Sidebar Menu Trigger (Desktop & Mobile) */}
          <button
            onClick={onOpenSidebarMenu}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[#143520] hover:text-white bg-[#F6F4EB] hover:bg-[#143520] border border-[#DDD4BC] hover:border-[#143520] font-semibold text-xs transition-all duration-200 cursor-pointer shadow-2xs group"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-4 h-4 text-[#256B3A] group-hover:text-[#BFDC28]" />
            <span className="font-semibold text-xs">Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
