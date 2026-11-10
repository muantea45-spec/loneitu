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
      className={`sticky top-0 z-40 w-full max-w-full overflow-x-hidden transition-all duration-200 border-b ${
        isScrolled
          ? 'bg-[#F7F7F7]/95 backdrop-blur-md border-[#E5E5E5] shadow-xs'
          : 'bg-[#F7F7F7] border-[#E5E5E5]'
      }`}
    >
      {/* Main Navbar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-22 sm:h-24 flex items-center justify-between">
        {/* Brand / Logo with uploaded artwork & typography (+25% enlarged) */}
        <Link to="/" className="flex items-center gap-3.5 sm:gap-4 group py-1" aria-label="Loneitu - MIZORAM TAN">
          <img
            src="/logo.png"
            alt="Loneitu"
            className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] object-contain group-hover:scale-105 transition-transform duration-200 shrink-0"
          />
          <div className="flex flex-col items-center justify-center leading-none text-center">
            <span className="font-serif font-bold text-[29px] sm:text-[31px] tracking-tight text-[#143520] leading-none block">
              Lone<span className="text-[#32864A]">itu</span>
            </span>
            <span className="text-[11px] sm:text-[11.5px] uppercase font-bold tracking-[0.22em] mr-[-0.22em] text-[#256B3A] leading-none mt-2 block">
              MIZORAM TAN
            </span>
          </div>
        </Link>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal Sidebar Menu Trigger (Desktop & Mobile) */}
          <button
            onClick={onOpenSidebarMenu}
            className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-[#143520] hover:text-white bg-[#F6F4EB] hover:bg-[#143520] border border-[#DDD4BC] hover:border-[#143520] font-semibold text-xs transition-all duration-200 cursor-pointer shadow-2xs group focus-visible:ring-2 focus-visible:ring-[#256B3A] focus-visible:ring-offset-2 outline-hidden"
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
