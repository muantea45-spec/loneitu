import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ExternalLink, LogOut, Shield } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

export const AdminHeader: React.FC = () => {
  const { logoutAdmin } = useBlog();

  return (
    <header className="bg-[#143520] text-white border-b border-[#1E542E] px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#BFDC28] text-[#143520] flex items-center justify-center font-bold">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-white">Loneitu</span>
              <span className="text-[10px] text-[#BFDC28] font-bold tracking-wider ml-1.5 hidden sm:inline">MIZORAM TAN</span>
            </div>
          </Link>
          <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1E542E] text-[#BFDC28] border border-[#256B3A]">
            Editorial CMS Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-[#ADC6A7] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span>Preview Live Publication</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#D7E3D5]">
              <Shield className="w-3.5 h-3.5 text-[#BFDC28]" />
              <span>Chief Editor</span>
            </div>
            <button
              onClick={logoutAdmin}
              className="p-1.5 text-white/70 hover:text-red-300 rounded-lg hover:bg-white/10 transition-colors"
              title="Sign out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

