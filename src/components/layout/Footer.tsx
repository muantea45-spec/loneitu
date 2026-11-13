import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Eye } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { SocialIconsRow } from '../common/SocialIcons';

const INITIAL_SITE_VIEWS = 100102;
const SITE_VIEWS_CACHE_KEY = 'loneitu_site_views_v1';
const STATS_ENDPOINTS = [
  '/api/stats',
  'https://loneitu.ddvktp.workers.dev/api/stats',
];

export const Footer: React.FC = () => {
  const { aboutData, footerData } = useBlog();
  const hasCountedRef = useRef(false);

  const [siteViews, setSiteViews] = useState<number>(() => {
    try {
      const cached = Number(localStorage.getItem(SITE_VIEWS_CACHE_KEY));
      if (Number.isFinite(cached) && cached >= INITIAL_SITE_VIEWS) {
        return Math.floor(cached);
      }
    } catch { }
    return INITIAL_SITE_VIEWS;
  });

  useEffect(() => {
    if (hasCountedRef.current) return;
    hasCountedRef.current = true;

    let isCancelled = false;

    const recordVisit = async () => {
      let cachedBaseline = INITIAL_SITE_VIEWS;
      try {
        const stored = Number(localStorage.getItem(SITE_VIEWS_CACHE_KEY));
        if (Number.isFinite(stored) && stored >= INITIAL_SITE_VIEWS) {
          cachedBaseline = Math.floor(stored);
        }
      } catch { }

      for (const endpoint of STATS_ENDPOINTS) {
        try {
          const res = await fetch(`${endpoint}?_t=${Date.now()}`, {
            method: 'POST',
            cache: 'no-store',
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const json = await res.json();
            if (json && json.success && typeof json.views === 'number') {
              const nextViews = json.persisted
                ? Math.max(INITIAL_SITE_VIEWS, Math.floor(json.views))
                : Math.max(INITIAL_SITE_VIEWS, Math.floor(json.views), cachedBaseline + 1);
              if (!isCancelled) {
                setSiteViews(nextViews);
                try {
                  localStorage.setItem(SITE_VIEWS_CACHE_KEY, String(nextViews));
                } catch { }
              }
              return;
            }
          }
        } catch {
          // try fallback endpoint
        }
      }

      // Offline / unreachable fallback: increment local counter gracefully
      const offlineViews = cachedBaseline + 1;
      if (!isCancelled) {
        setSiteViews(offlineViews);
        try {
          localStorage.setItem(SITE_VIEWS_CACHE_KEY, String(offlineViews));
        } catch { }
      }
    };

    recordVisit();

    return () => {
      isCancelled = true;
    };
  }, []);

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
        <div className="w-full bg-[#173F26] text-white py-3 px-4 sm:px-6 lg:px-8 border-b border-[#256B3A]/40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              {data.bannerBadge && (
                <span className="px-2 py-0.5 rounded-md bg-[#BFDC28] text-[#143520] text-[10px] font-medium tracking-wide shrink-0">
                  {data.bannerBadge}
                </span>
              )}
              <div>
                {data.bannerTitle && (
                  <h4 className="font-serif font-semibold text-sm text-white leading-snug">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#BFDC28] hover:bg-[#cbe830] text-[#143520] text-xs font-semibold transition-colors shrink-0 cursor-pointer"
              >
                <span>{data.bannerButtonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Column: Brand, Mission Tagline & Contact Email */}
        <div className="flex flex-col items-start text-left w-full md:w-auto">
          <div className="flex items-center justify-start gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img src="/logo.png" alt="Loneitu" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif font-semibold text-xl text-white">Loneitu</span>
            <span className="text-[10px] font-medium text-[#BFDC28] tracking-widest uppercase ml-1">
              · MIZORAM TAN
            </span>
          </div>
          <p className="text-xs text-[#ADC6A7] max-w-xl leading-relaxed text-left">
            {data.tagline || 'Mizoram leilung mil thlai enkawl dan, huan siam dan thar, leh ran vulh dan tha ziah chhuahna journal.'}
          </p>

          {/* Contact Us @ (Email) */}
          {contactEmail && (
            <div className="mt-3 flex items-center justify-start gap-2 text-xs">
              <span className="text-[#ADC6A7] font-normal">Contact:</span>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#1E542E] text-[#BFDC28] hover:bg-[#256B3A] border border-[#256B3A] transition-colors font-mono text-xs"
              >
                <Mail className="w-3.5 h-3.5 text-[#BFDC28] shrink-0" />
                <span>{contactEmail}</span>
              </a>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center md:items-end justify-center w-full md:w-auto gap-3">
          <div className="flex justify-center w-full md:w-auto">
            <SocialIconsRow links={aboutData?.socialLinks} variant="hero" />
          </div>
          <div className="flex items-center justify-center gap-3 text-xs font-medium text-[#D7E3D5] flex-wrap w-full md:w-auto">
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
          {/* Live Site View Count Stats */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1E542E]/70 border border-[#256B3A]/60 text-xs"
            title="Total website views (starting from 100,102 inherited Blogger visits)"
          >
            <Eye className="w-3.5 h-3.5 text-[#BFDC28] shrink-0" />
            <span className="text-[#D7E3D5] font-normal">Views:</span>
            <span className="font-mono font-semibold text-[#BFDC28] tabular-nums">
              {siteViews.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 text-[11px] font-normal text-[#88A682] flex-wrap w-full md:w-auto">
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
