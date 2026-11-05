import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenBookmarks?: () => void;
  onOpenSidebarMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenSidebarMenu,
}) => {
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
        {/* Brand / Logo replaced with the new picture */}
        <Link to="/" className="flex items-center group py-1" aria-label="Mizo Farm Solutions">
          <img
            src="/logo.png"
            alt="Mizo Farm Solutions"
            className="h-14 sm:h-16 w-auto max-w-[220px] sm:max-w-none object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Universal Sidebar Menu Trigger (Desktop & Mobile) - Archive is inside MENU */}
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
