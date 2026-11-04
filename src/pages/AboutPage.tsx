import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Edit, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useBlog } from '../context/BlogContext';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TwitterIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

function formatSocialLink(network: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  switch (network) {
    case 'instagram':
      return `https://instagram.com/${trimmed.replace(/^@/, '')}`;
    case 'facebook':
      return `https://facebook.com/${trimmed}`;
    case 'whatsapp': {
      const digits = trimmed.replace(/[^\d]/g, '');
      return `https://wa.me/${digits}`;
    }
    case 'youtube':
      return trimmed.startsWith('@') ? `https://youtube.com/${trimmed}` : `https://youtube.com/@${trimmed}`;
    case 'twitter':
      return `https://x.com/${trimmed.replace(/^@/, '')}`;
    default:
      return trimmed;
  }
}

export const AboutPage: React.FC = () => {
  const { aboutData, authors, isAdminLoggedIn } = useBlog();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'About & Editorial Manifesto — Loneitu (MIZORAM TAN)';
  }, []);

  const social = aboutData.socialLinks || {};
  const hasAnySocial = Object.values(social).some(v => !!v && v.trim() !== '');

  return (
    <div className="w-full min-h-screen bg-[#FBFBF8] pb-16">
      {/* Admin Quick Edit Bar (only visible when logged in as admin) */}
      {isAdminLoggedIn && (
        <div className="bg-[#BFDC28] text-[#143520] px-4 py-2.5 text-xs font-bold border-b border-[#256B3A]/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#143520] animate-pulse" />
              <span>Admin Mode: You can edit this page directly from the console</span>
            </span>
            <Link
              to="/admin?tab=about"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#143520] text-white hover:bg-[#1E542E] rounded-lg transition-colors cursor-pointer text-xs font-bold"
            >
              <Edit className="w-3.5 h-3.5 text-[#BFDC28]" />
              <span>Edit About Page</span>
            </Link>
          </div>
        </div>
      )}

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
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-16">
        {/* Editorial Vision & Manifesto */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#EBE6D6] shadow-xs space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#256B3A]">
            {aboutData.editorialTag}
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#143520]">
            {aboutData.editorialTitle}
          </h2>

          <div className="text-sm sm:text-base text-[#4A584E] leading-relaxed space-y-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-[#143520]" {...props} />,
                em: ({ node, ...props }) => <em className="italic text-[#143520]" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1.5 my-3" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1.5 my-3" {...props} />,
                li: ({ node, ...props }) => <li className="text-[#4A584E]" {...props} />,
              }}
            >
              {aboutData.editorialBody}
            </ReactMarkdown>

            {aboutData.quote && (
              <blockquote className="border-l-4 border-[#256B3A] pl-4 py-3 my-4 italic text-[#143520] bg-[#F6F4EB] rounded-r-xl">
                "{aboutData.quote}"
              </blockquote>
            )}
          </div>
        </div>

        {/* Social Media & Community Channels Section (Only rendered if at least one link is filled) */}
        {hasAnySocial && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EBE6D6] shadow-xs space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#256B3A]">
                Connect With Us
              </span>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] mt-1">
                Official Channels & Social Communities
              </h3>
              <p className="text-xs sm:text-sm text-[#8F7855] mt-1">
                Stay connected with Loneitu across our digital networks, field discussions, and farmer groups.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {social.instagram && (
                <a
                  href={formatSocialLink('instagram', social.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#E1306C]/30 bg-[#FFF5F8] text-[#C13584] hover:bg-[#FFEBF1] text-xs font-bold transition-all shadow-2xs hover:scale-102"
                >
                  <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {social.facebook && (
                <a
                  href={formatSocialLink('facebook', social.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#1877F2]/30 bg-[#F0F6FF] text-[#1877F2] hover:bg-[#E4EFFF] text-xs font-bold transition-all shadow-2xs hover:scale-102"
                >
                  <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {social.whatsapp && (
                <a
                  href={formatSocialLink('whatsapp', social.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#25D366]/30 bg-[#F0FDF4] text-[#15803D] hover:bg-[#DCFCE7] text-xs font-bold transition-all shadow-2xs hover:scale-102"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Community</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {social.youtube && (
                <a
                  href={formatSocialLink('youtube', social.youtube)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#FF0000]/30 bg-[#FFF5F5] text-[#DC2626] hover:bg-[#FEE2E2] text-xs font-bold transition-all shadow-2xs hover:scale-102"
                >
                  <YouTubeIcon className="w-4 h-4 text-[#FF0000]" />
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {social.twitter && (
                <a
                  href={formatSocialLink('twitter', social.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#DDD4BC] bg-[#F6F4EB] text-[#143520] hover:bg-[#EBE6D6] text-xs font-bold transition-all shadow-2xs hover:scale-102"
                >
                  <TwitterIcon className="w-4 h-4 text-[#143520]" />
                  <span>X / Twitter</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Contributing Agronomists & Researchers */}
        <div className="space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#256B3A]">
              Editorial Advisory
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#143520] mt-1">
              {aboutData.authorsTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#8F7855] mt-1">
              {aboutData.authorsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {authors.map(author => (
              <div
                key={author.id}
                className="bg-white p-6 rounded-2xl border border-[#EBE6D6] shadow-xs flex gap-4 items-start"
              >
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#256B3A]/20 shrink-0"
                />
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-[#143520]">
                    {author.name}
                  </h4>
                  <div className="text-xs font-semibold text-[#256B3A]">
                    {author.role}
                  </div>
                  <div className="text-[11px] text-[#8F7855]">
                    {author.institution}
                  </div>
                  <p className="text-xs text-[#54432C] pt-2 line-clamp-3 leading-relaxed">
                    {author.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
