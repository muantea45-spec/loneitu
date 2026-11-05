import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Sprout, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useBlog } from '../context/BlogContext';
import { SocialIconsRow } from '../components/common/SocialIcons';
import { INITIAL_ABOUT_DATA } from '../data/initialData';

function getStaffCardDetails(card: any) {
  const name = card.name || card.title || '';
  const designation = card.designation || card.columnValues?.['col-location'] || card.subtitle || '';
  const portfolio = card.portfolio || card.columnValues?.['col-contact'] || '';
  const qualification = card.qualification || card.columnValues?.['col-status'] || card.badge || '';
  const experience = card.experience || card.columnValues?.['col-1793872810199'] || card.columnValues?.['col-desc'] || card.description || '';
  const avatar = card.avatar || card.image || '';
  return { name, designation, portfolio, qualification, experience, avatar };
}

export const AboutPage: React.FC = () => {
  const { aboutData } = useBlog();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'About & Editorial Manifesto — Loneitu (MIZORAM TAN)';
  }, []);

  const social = aboutData.socialLinks || {};
  const hasAnySocial = Object.values(social).some(v => !!v && v.trim() !== '');

  const customCardsSection = aboutData.customCardsSection || INITIAL_ABOUT_DATA.customCardsSection;

  const filteredCards = useMemo(() => {
    return customCardsSection?.cards || [];
  }, [customCardsSection]);

  const handleCarouselScroll = useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const firstChild = container.firstElementChild as HTMLElement;
    if (!firstChild) return;
    const cardWidth = firstChild.offsetWidth + 16; // 16px is gap-4
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveCardIndex(Math.max(0, Math.min(newIndex, filteredCards.length - 1)));
  }, [filteredCards.length]);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleCarouselScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleCarouselScroll);
  }, [handleCarouselScroll]);

  const scrollToCard = (index: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const children = container.querySelectorAll<HTMLElement>('[data-staff-card]');
    if (children[index]) {
      children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setActiveCardIndex(index);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBF8] pb-2 sm:pb-3 overflow-x-hidden">
      {/* Hero Header */}
      <div className="w-full bg-[#143520] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#256B3A]">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#BFDC28]/20 border border-[#BFDC28]/40 text-[#BFDC28] text-xs font-bold uppercase tracking-wider mx-auto">
            <Sprout className="w-4 h-4" />
            <span>{aboutData.badge}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {aboutData.heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-[#D7E3D5] leading-relaxed max-w-2xl mx-auto font-light">
            {aboutData.heroDescription}
          </p>

          {/* Social Media Logos in Hero (clean logos only, no text labels) */}
          {hasAnySocial && (
            <div className="pt-3 flex justify-center">
              <SocialIconsRow links={aboutData.socialLinks} variant="hero" />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-16 w-full max-w-full overflow-x-hidden sm:overflow-x-visible">
        {/* Editorial Vision & Manifesto */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#EBE6D6] shadow-xs space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#256B3A]">
            {aboutData.editorialTag}
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#143520]">
            {aboutData.editorialTitle}
          </h2>

          <div className="text-sm sm:text-base text-[#4A584E] leading-relaxed space-y-4 text-justify [text-align:justify]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                p: ({ node, ...props }) => <p className="mb-5 leading-relaxed text-justify [text-align:justify] whitespace-pre-line" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-[#143520]" {...props} />,
                em: ({ node, ...props }) => <em className="italic text-[#143520]" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1.5 my-3 text-justify [text-align:justify]" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1.5 my-3 text-justify [text-align:justify]" {...props} />,
                li: ({ node, ...props }) => <li className="text-[#4A584E] text-justify [text-align:justify]" {...props} />,
                table: ({ node, ...props }) => (
                  <div className="w-full overflow-x-auto my-6 rounded-2xl border border-[#DDD4BC] shadow-xs bg-white">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-full" style={{ tableLayout: 'auto', ...props.style }} {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-[#143520] text-[#BFDC28] font-bold uppercase tracking-wider text-[11px] sm:text-xs" {...props} />
                ),
                tbody: ({ node, ...props }) => (
                  <tbody className="divide-y divide-[#EBE6D6]" {...props} />
                ),
                tr: ({ node, ...props }) => (
                  <tr className="hover:bg-[#F6F4EB]/70 transition-colors" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="py-3 px-4 sm:py-3.5 sm:px-5 font-bold border-b border-[#256B3A]/40 align-top" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="py-2.5 px-4 sm:py-3 sm:px-5 text-[#3B2E1D] align-top" {...props} />
                ),
                h1: ({ node, ...props }) => <h1 className="font-serif font-bold text-2xl text-[#143520] mt-6 mb-3" {...props} />,
                h2: ({ node, ...props }) => <h2 className="font-serif font-bold text-xl text-[#143520] mt-5 mb-2.5" {...props} />,
                h3: ({ node, ...props }) => <h3 className="font-serif font-bold text-lg text-[#143520] mt-4 mb-2" {...props} />,
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-[#256B3A] pl-4 py-2.5 my-4 italic text-[#143520] bg-[#F6F4EB] rounded-r-xl" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-[#256B3A] font-semibold hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                code: ({ node, inline, ...props }: any) => inline ? (
                  <code className="px-1.5 py-0.5 rounded bg-[#F6F4EB] text-[#143520] font-mono text-xs border border-[#DDD4BC]" {...props} />
                ) : (
                  <pre className="p-4 rounded-xl bg-[#143520] text-emerald-100 font-mono text-xs overflow-x-auto my-3"><code {...props} /></pre>
                ),
                hr: () => <hr className="my-6 border-t border-[#DDD4BC]" />
              }}
            >
              {aboutData.editorialBody}
            </ReactMarkdown>

            {aboutData.quote && (
              <blockquote className="border-l-4 border-[#256B3A] pl-4 py-3 my-4 italic text-[#143520] bg-[#F6F4EB] rounded-r-xl text-justify [text-align:justify]">
                "{aboutData.quote}"
              </blockquote>
            )}
          </div>
        </div>

        {/* 3. Custom Dynamic Card View Section */}
        {customCardsSection && customCardsSection.enabled !== false && customCardsSection.cards && customCardsSection.cards.length > 0 && (
          <div className="space-y-4 pt-2">
            {/* Mobile Slide Hint (when multiple cards exist) */}
            {filteredCards.length > 1 && (
              <div className="flex sm:hidden items-center justify-between px-1 text-[11px] text-[#6F5B3C] font-semibold">
                <span>← Swipe cards to view staff →</span>
                <span className="font-bold text-[#256B3A]">{filteredCards.length} Members</span>
              </div>
            )}

            {/* Slideable on MOBILE view to spare space & responsive grid on tablet/desktop */}
            <div className="space-y-4 w-full overflow-hidden sm:overflow-visible">
              <div
                ref={carouselRef}
                className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0 scrollbar-none touch-pan-x overscroll-x-contain"
              >
                  {filteredCards.map(card => {
                    const details = getStaffCardDetails(card);
                    return (
                      <div
                        key={card.id}
                        data-staff-card="true"
                        className="min-w-[85vw] max-w-[88vw] snap-center shrink-0 sm:min-w-0 sm:max-w-none sm:shrink group bg-white rounded-3xl border border-[#EBE6D6] hover:border-[#256B3A]/40 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col p-5 sm:p-6 space-y-4"
                      >
                        {/* Top Row: NAME on Left + Small Circular Avatar at Top-Right */}
                        <div className="flex items-center justify-between gap-3 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h4
                              title={details.name}
                              className="font-serif font-bold text-lg sm:text-xl lg:text-[19px] text-[#143520] group-hover:text-[#1E542E] transition-colors leading-tight tracking-tight whitespace-nowrap truncate"
                            >
                              {details.name}
                            </h4>
                          </div>

                          {/* Small Circular Avatar at the right corner */}
                          <div className="shrink-0 relative">
                            {details.avatar ? (
                              <img
                                src={details.avatar}
                                alt={details.name}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-[#256B3A]/30 shadow-xs"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EBF1EA] ring-2 ring-[#256B3A]/20 flex items-center justify-center text-[#256B3A] font-bold text-sm sm:text-base shadow-2xs">
                                {details.name ? details.name.charAt(0).toUpperCase() : 'L'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Aligned Fields: DESIGNATION, PORTFOLIO, QUALIFICATION */}
                        <div className="pt-2.5 border-t border-[#EBE6D6] space-y-2 text-xs">
                          {details.designation && (
                            <div className="grid grid-cols-[115px_1fr] sm:grid-cols-[130px_1fr] gap-2.5 items-baseline py-1.5 border-b border-[#F2ECE1]">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F5B3C] shrink-0 text-left">
                                DESIGNATION:
                              </span>
                              <span className="font-semibold text-[#143520] text-left break-words">
                                {details.designation}
                              </span>
                            </div>
                          )}

                          {details.portfolio && (
                            <div className="grid grid-cols-[115px_1fr] sm:grid-cols-[130px_1fr] gap-2.5 items-baseline py-1.5 border-b border-[#F2ECE1]">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F5B3C] shrink-0 text-left">
                                PORTFOLIO:
                              </span>
                              <span className="font-semibold text-[#143520] text-left break-words">
                                {details.portfolio}
                              </span>
                            </div>
                          )}

                          {details.qualification && (
                            <div className="grid grid-cols-[115px_1fr] sm:grid-cols-[130px_1fr] gap-2.5 items-baseline py-1.5 border-b border-[#F2ECE1]">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F5B3C] shrink-0 text-left">
                                QUALIFICATION:
                              </span>
                              <span className="font-semibold text-[#143520] text-left break-words">
                                {details.qualification}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* PROFESSIONAL EXPERIENCE: All text in a new line, perfectly aligned in the whole width */}
                        {details.experience && (
                          <div className="pt-2.5 border-t border-[#EBE6D6]">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F5B3C] block mb-1.5 text-left">
                              PROFESSIONAL EXPERIENCE:
                            </span>
                            <p className="w-full text-justify [text-align:justify] text-xs text-[#54432C] leading-relaxed whitespace-pre-line">
                              {details.experience}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Dot Indicators & Carousel Navigation Bar */}
                {filteredCards.length > 1 && (
                  <div className="flex sm:hidden items-center justify-between px-2 pt-1">
                    <button
                      onClick={() => scrollToCard(Math.max(0, activeCardIndex - 1))}
                      disabled={activeCardIndex === 0}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white border border-[#DDD4BC] text-[#143520] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F6F4EB] transition-colors shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden"
                      aria-label="Previous staff member"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Interactive Dots Pagination */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-white/80 backdrop-blur-xs rounded-full border border-[#DDD4BC] shadow-2xs">
                      {filteredCards.map((card, i) => {
                        const isActive = activeCardIndex === i;
                        return (
                          <button
                            key={card.id || i}
                            onClick={() => scrollToCard(i)}
                            aria-label={`Go to staff card ${i + 1}`}
                            className="p-1.5 -m-0.5 rounded-full flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden"
                          >
                            <span
                              className={`transition-all duration-300 rounded-full block ${
                                isActive
                                  ? 'w-6 h-2.5 bg-[#256B3A] shadow-xs'
                                  : 'w-2.5 h-2.5 bg-[#DDD4BC] hover:bg-[#6F5B3C]'
                              }`}
                            />
                          </button>
                        );
                      })}
                      <span className="text-[10px] font-bold text-[#6F5B3C] ml-1 select-none">
                        {activeCardIndex + 1}/{filteredCards.length}
                      </span>
                    </div>

                    <button
                      onClick={() => scrollToCard(Math.min(filteredCards.length - 1, activeCardIndex + 1))}
                      disabled={activeCardIndex === filteredCards.length - 1}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white border border-[#DDD4BC] text-[#143520] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F6F4EB] transition-colors shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden"
                      aria-label="Next staff member"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
          </div>
        )}

        {/* Connect With Us Section (Clean single title & social links) */}
        {hasAnySocial && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE6D6] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#143520]">
              Connect With Us
            </h3>
            <div className="shrink-0">
              <SocialIconsRow links={aboutData.socialLinks} variant="light" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
