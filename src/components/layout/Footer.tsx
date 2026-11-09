import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { SocialIconsRow } from '../common/SocialIcons';

export const Footer: React.FC = () => {
  const { aboutData, footerData } = useBlog();

  const data = footerData || {
    tagline: 'Mizoram leilung mil thlai enkawl dan, huan siam dan thar, leh ran vulh dan tha ziah chhuahna journal.',
    copyrightText: 'Loneitu (MIZORAM TAN). Mizoram thlai leh leilung humhalhna.',
    dedicationText: 'Loneitute leh zirtirtute tana duhsakna nen',
    contactEmail: '',
    bannerEnabled: false,
  };

  const contactEmail = (data.contactEmail || '').trim();

  return (
    <footer className="w-full bg-[#143520] text-[#EBF1EA] border-t border-[#1E542E] mt-4 sm:mt-6">
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

      <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Column: Brand, Mission Tagline & Contact Email - STRICTLY ALIGNED TO THE LEFT */}
        <div className="flex flex-col items-start text-left w-full md:w-auto">
          <div className="flex items-center justify-start gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img src="/logo.png" alt="Loneitu" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif font-bold text-2xl text-white">Loneitu</span>
            <span className="text-[10px] font-bold text-[#BFDC28] tracking-widest uppercase ml-1">
              · MIZORAM TAN
            </span>
          </div>
          <p className="text-xs text-[#ADC6A7] max-w-xl leading-relaxed text-left">
            {data.tagline || 'Mizoram leilung mil thlai enkawl dan, huan siam dan thar, leh ran vulh dan tha ziah chhuahna journal.'}
          </p>

          {/* Contact Us @ (Email) - Aligned to the Left */}
          {contactEmail && (
            <div className="mt-3.5 flex items-center justify-start gap-2 text-xs">
              <span className="text-[#ADC6A7] font-medium">Contact Us @</span>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E542E] text-[#BFDC28] hover:bg-[#256B3A] border border-[#256B3A] transition-colors font-mono font-medium text-[11px] shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-[#BFDC28] shrink-0" />
                <span>{contactEmail}</span>
              </a>
            </div>
          )}
        </div>

        {/* Right Column: ONLY Social Media Links & HOME, ABOUT, ARCHIVE are Perfectly Centered on Mobile */}
        <div className="flex flex-col items-center md:items-end justify-center w-full md:w-auto gap-3.5">
          <div className="flex justify-center w-full md:w-auto">
            <SocialIconsRow links={aboutData?.socialLinks} variant="hero" />
          </div>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-[#D7E3D5] flex-wrap w-full md:w-auto">
            <Link to="/" className="hover:text-[#BFDC28] transition-colors">
              Home
            </Link>
            <span>•</span>
            <Link to="/about" className="hover:text-[#BFDC28] transition-colors">
              About
            </Link>
            <span>•</span>
            <Link to="/archive" className="hover:text-[#BFDC28] transition-colors">
              Archive
            </Link>
          </div>
          <div className="flex items-center justify-center gap-3 text-[11px] font-medium text-[#88A682] flex-wrap w-full md:w-auto">
            <Link to="/privacy" className="hover:text-[#BFDC28] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#BFDC28] transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Strictly Horizontally Centered */}
      <div className="border-t border-[#1E542E] py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-xs text-[#88A682] gap-1 text-center">
        <div>
          © 2026 Loneitu - MIZORAM TAN
        </div>
        <div className="text-[11px]">
          Nang malsawmna ni ang che
        </div>
      </div>
    </footer>
  );
};
