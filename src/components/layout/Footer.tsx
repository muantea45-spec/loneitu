import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, Sprout } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#143520] text-[#EBF1EA] border-t border-[#1E542E] mt-20">
      <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#BFDC28] text-[#143520] flex items-center justify-center font-bold shadow-xs">
              <Sprout className="w-5 h-5 text-[#143520]" />
            </div>
            <span className="font-serif font-bold text-2xl text-white">Loneitu</span>
            <span className="text-[10px] font-bold text-[#BFDC28] tracking-widest uppercase ml-1">
              MIZORAM TAN
            </span>
          </div>
          <p className="text-xs text-[#ADC6A7] max-w-xl leading-relaxed">
            Mizoram leilung mil thlai enkawl dan, huan siam dan thar, leh ran vulh dan tha ziah chhuahna journal.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-[#D7E3D5]">
          <Link to="/" className="hover:text-[#BFDC28] transition-colors">
            Kawtchhuah (Home)
          </Link>
          <span>•</span>
          <Link to="/about" className="hover:text-[#BFDC28] transition-colors">
            Kan Chanchin (About)
          </Link>
          <span>•</span>
          <Link to="/admin" className="hover:text-[#BFDC28] flex items-center gap-1 transition-colors">
            <Shield className="w-3.5 h-3.5 text-[#BFDC28]" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#1E542E] py-5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#88A682] gap-3">
        <div>
          © {new Date().getFullYear()} Loneitu (MIZORAM TAN). Mizoram thlai leh leilung humhalhna.
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <span>Loneitute leh zirtirtute tana duhsakna nen</span>
          <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline ml-1" />
        </div>
      </div>
    </footer>
  );
};
