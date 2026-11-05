import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, LogOut, Mail, Crown } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

export const AdminHeader: React.FC = () => {
  const { logoutAdmin, adminEmail, primaryOwnerEmail } = useBlog();
  const safePrimary = (primaryOwnerEmail || 'muantea45@gmail.com').toLowerCase();
  const safeAdmin = (adminEmail || safePrimary).toLowerCase();
  const isPrimary = safeAdmin === safePrimary;

  return (
    <header className="bg-[#143520] text-white border-b border-[#1E542E] px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              <img src="/logo.png" alt="Loneitu" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-white">Loneitu</span>
              <span className="text-[9px] font-bold text-[#BFDC28] tracking-widest uppercase block -mt-1">MIZORAM TAN</span>
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

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#D7E3D5] bg-[#1E542E] px-3 py-1.5 rounded-full border border-[#256B3A]">
              <span className="w-2 h-2 rounded-full bg-[#BFDC28] animate-pulse" />
              <Mail className="w-3.5 h-3.5 text-[#BFDC28]" />
              <span className="font-mono text-[11px]">{adminEmail || primaryOwnerEmail}</span>
              {isPrimary && (
                <span className="flex items-center gap-0.5 text-[10px] text-[#BFDC28] font-bold bg-[#143520] px-1.5 py-0.5 rounded-full border border-[#256B3A]/80" title="Primary Journal Owner">
                  <Crown className="w-2.5 h-2.5 text-[#BFDC28]" />
                  <span>Owner</span>
                </span>
              )}
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

