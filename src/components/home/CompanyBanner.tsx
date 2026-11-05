import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, MapPin } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { DEFAULT_COMPANY_BANNER } from '../../data/initialData';

export const CompanyBanner: React.FC = () => {
  const { aboutData } = useBlog();
  const banner = aboutData.companyBanner || DEFAULT_COMPANY_BANNER;

  if (banner.enabled === false) {
    return null;
  }

  const paragraphs = banner.paragraphs && banner.paragraphs.length > 0
    ? banner.paragraphs
    : DEFAULT_COMPANY_BANNER.paragraphs!;

  const heading = banner.heading || DEFAULT_COMPANY_BANNER.heading || 'ABOUT US';
  const companyName = banner.companyName || DEFAULT_COMPANY_BANNER.companyName || 'Mizo Farm Solutions';
  const badge = banner.badge || DEFAULT_COMPANY_BANNER.badge || 'Champhai-based Registered Society';
  const showCompanyName = banner.showCompanyName !== false;
  const picture = banner.picture;

  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-br from-[#143520] via-[#1A442A] to-[#12301D] text-white pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-14 lg:pb-16 px-4 sm:px-6 lg:px-8 border-b-2 border-[#256B3A]/60 shadow-md">
      {/* Subtle organic agrarian background texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#BFDC28_1.2px,transparent_1.2px)] [background-size:28px_28px] pointer-events-none" />

      {/* Decorative ambient gradient glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#256B3A]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#BFDC28]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className={`grid grid-cols-1 ${picture ? 'lg:grid-cols-12 gap-8 lg:gap-12 items-center' : ''}`}>
          {/* Main Content Column */}
          <div className={`${picture ? 'lg:col-span-7 xl:col-span-8' : 'w-full'} flex flex-col justify-center space-y-4`}>
            
            {/* Company Badge / Tag Pill (Option to display the Company's) */}
            {showCompanyName && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#BFDC28] text-[#143520] shadow-sm">
                  <Building2 className="w-3.5 h-3.5 text-[#143520]" />
                  <span>{companyName}</span>
                </span>

                {badge && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-white/10 text-[#DFEDE3] border border-white/15">
                    <MapPin className="w-3 h-3 text-[#BFDC28]" />
                    <span>{badge}</span>
                  </span>
                )}
              </div>
            )}

            {/* Heading: ABOUT US */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              {heading}
            </h2>

            {/* Paragraphs Copy */}
            <div className="space-y-3.5 pt-1 text-sm sm:text-[15px] lg:text-base text-[#E5EFE7] leading-relaxed">
              {paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className="text-justify [text-align:justify] sm:[text-align:left] font-normal text-white/90"
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Footer Navigation CTA link */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#BFDC28] hover:bg-[#d4f23b] text-[#143520] font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm cursor-pointer group"
              >
                <span>Read Full About & Team Profile</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Corner Picture on Desktop View */}
          {picture && (
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 justify-center items-center">
              <div className="relative w-full max-w-md group">
                {/* Glow ring */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#BFDC28]/30 to-[#256B3A]/40 blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
                
                {/* Image Card Container */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-[#0F2918] aspect-4/3 max-h-[380px]">
                  <img
                    src={picture}
                    alt={companyName}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Photo Caption Badge */}
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-white/95 font-medium px-3.5 py-2 rounded-xl bg-black/55 backdrop-blur-md border border-white/10 flex items-center justify-between">
                    <span className="font-semibold truncate">{companyName}</span>
                    <span className="text-[10.5px] text-[#BFDC28] font-bold uppercase shrink-0 ml-2">
                      Champhai, Mizoram
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
