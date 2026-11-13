import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
  onOpenBookmarks?: () => void;
  onOpenSidebarMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
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
          ? 'bg-[#F7F7F7]/95 backdrop-blur-md border-[#E5E5E5] shadow-xs'
          : 'bg-[#F7F7F7] border-[#E5E5E5]'
      }`}
    >
      {/* Main Navbar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-16 sm:h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 py-1" aria-label="Loneitu - MIZORAM TAN">
          <img
            src="/logo.png"
            alt="Loneitu"
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0"
          />
          <div className="flex flex-col items-start justify-center leading-none">
            <span className="font-serif font-semibold text-2xl sm:text-[26px] tracking-tight text-[#143520] leading-none block">
              Loneitu
            </span>
            <span className="text-[10px] uppercase font-medium tracking-[0.16em] text-[#6F5B3C] leading-none mt-1 block">
              MIZORAM TAN
            </span>
          </div>
        </Link>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal Sidebar Menu Trigger */}
          <button
            onClick={onOpenSidebarMenu}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-[#143520] hover:bg-[#EAE4D3] bg-[#F6F4EB] border border-[#DDD4BC] font-medium text-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#256B3A] focus-visible:ring-offset-2 outline-hidden"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-4 h-4 text-[#143520]" />
            <span>Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
