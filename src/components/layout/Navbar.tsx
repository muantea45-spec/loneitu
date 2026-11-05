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
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-22 sm:h-24 flex items-center justify-between">
        {/* Brand / Logo with uploaded artwork & typography (+25% enlarged) */}
        <Link to="/" className="flex items-center gap-3.5 sm:gap-4 group py-1" aria-label="Loneitu - MIZORAM TAN">
          <img
            src="/logo.png"
            alt="Loneitu"
            className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200 shrink-0"
          />
          <div className="flex flex-col items-start justify-center leading-none">
            <span className="font-serif font-bold text-[29px] sm:text-[31px] tracking-tight text-[#143520] leading-none block">
              Lone<span className="text-[#32864A]">itu</span>
            </span>
            <span className="text-[12px] uppercase font-bold tracking-[0.25em] text-[#256B3A] leading-none mt-2 block">
              MIZORAM TAN
            </span>
          </div>
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
