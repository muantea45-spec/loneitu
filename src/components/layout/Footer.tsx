import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sprout, ArrowRight } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { SocialIconsRow } from '../common/SocialIcons';

export const Footer: React.FC = () => {
  const { aboutData, footerData } = useBlog();

  const data = footerData || {
    tagline: 'Mizoram leilung mil thlai enkawl dan, huan siam dan thar, leh ran vulh dan tha ziah chhuahna journal.',
    copyrightText: 'Loneitu (MIZORAM TAN). Mizoram thlai leh leilung humhalhna.',
    dedicationText: 'Loneitute leh zirtirtute tana duhsakna nen',
    bannerEnabled: false,
  };

  return (
    <footer className="w-full bg-[#143520] text-[#EBF1EA] border-t border-[#1E542E] mt-20">
      {/* Active Announcement / Notice Banner in Footer (Editable strictly via Admin Console) */}
      {data.bannerEnabled && (data.bannerTitle || data.bannerText) && (
        <div className="w-full bg-gradient-to-r from-[#173F26] via-[#215E34] to-[#173F26] text-white py-4 px-4 sm:px-6 lg:px-8 border-b border-[#256B3A]/60 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              {data.bannerBadge && (
                <span className="px-2.5 py-1 rounded-full bg-[#BFDC28] text-[#143520] text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-2xs">
                  {data.bannerBadge}
                </span>
              )}
              <div>
                {data.bannerTitle && (
                  <h4 className="font-serif font-bold text-sm text-white leading-snug">
                    {data.bannerTitle}
                  </h4>
                )}
                {data.bannerText && (
                  <p className="text-xs text-[#D7E3D5] leading-relaxed mt-0.5">
                    {data.bannerText}
                  </p>
                )}
              </div>
            </div>

            {data.bannerButtonText && data.bannerButtonLink && (
              <a
                href={data.bannerButtonLink}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#BFDC28] hover:bg-[#d4f231] text-[#143520] text-xs font-bold transition-all hover:scale-102 shrink-0 cursor-pointer shadow-xs"
              >
                <span>{data.bannerButtonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

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
            {data.tagline || 'Mizoram leilung mil thlai enkawl dan, huan siam dan thar, leh ran vulh dan tha ziah chhuahna journal.'}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3.5">
          <SocialIconsRow links={aboutData?.socialLinks} variant="hero" />
          <div className="flex items-center gap-4 text-xs font-semibold text-[#D7E3D5]">
            <Link to="/" className="hover:text-[#BFDC28] transition-colors">
              Kawtchhuah (Home)
            </Link>
            <span>•</span>
            <Link to="/about" className="hover:text-[#BFDC28] transition-colors">
              Kan Chanchin (About)
            </Link>
            <span>•</span>
            <Link to="/archive" className="hover:text-[#BFDC28] transition-colors">
              Thuziak Dahkhawm (Archive)
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#1E542E] py-5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#88A682] gap-3">
        <div>
          © {new Date().getFullYear()} {data.copyrightText || 'Loneitu (MIZORAM TAN). Mizoram thlai leh leilung humhalhna.'}
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <span>{data.dedicationText || 'Loneitute leh zirtirtute tana duhsakna nen'}</span>
          <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline ml-1" />
        </div>
      </div>
    </footer>
  );
};
