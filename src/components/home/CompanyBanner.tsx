import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { DEFAULT_COMPANY_BANNER } from '../../data/initialData';

export const CompanyBanner: React.FC = () => {
  const { aboutData } = useBlog();
  const banner = aboutData?.companyBanner || DEFAULT_COMPANY_BANNER;

  if (banner?.enabled === false) {
    return null;
  }

  const rawParagraphs = banner?.paragraphs && Array.isArray(banner.paragraphs) && banner.paragraphs.length > 0
    ? banner.paragraphs
    : (DEFAULT_COMPANY_BANNER.paragraphs || []);

  const paragraphs = rawParagraphs.filter(Boolean);

  const heading = banner?.heading || DEFAULT_COMPANY_BANNER.heading || 'ABOUT US';
  const companyName = banner?.companyName || DEFAULT_COMPANY_BANNER.companyName || 'Mizo Farm Solutions';
  const badge = banner?.badge || DEFAULT_COMPANY_BANNER.badge || 'Champhai-based Registered Society';
  const showCompanyName = banner?.showCompanyName !== false;
  const picture = banner?.picture;

  return (
    <section className="w-full relative overflow-hidden bg-[#143520] text-white py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#256B3A]/30">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className={`grid grid-cols-1 ${picture ? 'lg:grid-cols-12 gap-8 lg:gap-12 items-center' : ''}`}>
          {/* Main Content Column */}
          <div className={`${picture ? 'lg:col-span-7 xl:col-span-8' : 'w-full'} flex flex-col justify-center space-y-4`}>
            
            {showCompanyName ? (
              <div className="space-y-2 w-full">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-white leading-tight text-left">
                  {companyName}
                </h1>

                <div className="flex flex-wrap items-center justify-start gap-2.5 sm:gap-3">
                  <h2 className="font-sans text-xs sm:text-sm font-semibold tracking-wide text-[#BFDC28]">
                    {heading}
                  </h2>

                  {badge && (
                    <>
                      <span className="text-white/30 hidden sm:inline-block">•</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-sans font-medium text-white/85 bg-white/10 border border-white/15">
                        <MapPin className="w-3.5 h-3.5 text-[#BFDC28] shrink-0" />
                        <span>{badge}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-white leading-tight text-left">
                {heading}
              </h2>
            )}

            {/* Paragraphs Copy */}
            <div className="space-y-3 pt-1 text-sm sm:text-[15px] text-white/85 leading-relaxed text-left">
              {paragraphs.map((p, idx) => (
                <p key={idx} className="font-normal">
                  {p}
                </p>
              ))}
            </div>

            {/* Footer Navigation CTA link */}
            <div className="pt-2 flex flex-wrap items-center justify-start gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#BFDC28] hover:bg-[#cbe830] text-[#143520] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <span>About Mizo Farm Solutions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Corner Picture on Desktop View */}
          {picture && (
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 justify-center items-center">
              <div className="relative w-full max-w-md">
                {/* Image Card Container */}
                <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-md bg-[#0F2918] aspect-4/3 max-h-[380px]">
                  <img
                    src={picture}
                    alt={companyName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Photo Caption Badge */}
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-white/95 font-medium px-3 py-2 rounded-lg bg-black/60 backdrop-blur-xs border border-white/10 flex items-center justify-between">
                    <span className="font-semibold truncate">{companyName}</span>
                    <span className="text-[11px] text-[#BFDC28] font-medium shrink-0 ml-2">
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
