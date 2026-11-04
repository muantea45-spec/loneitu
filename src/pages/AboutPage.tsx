import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Edit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useBlog } from '../context/BlogContext';
import { SocialIconsRow } from '../components/common/SocialIcons';

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

          {/* Social Media Logos in Hero (clean logos only, no text labels) */}
          {hasAnySocial && (
            <div className="pt-3 flex justify-center">
              <SocialIconsRow links={aboutData.socialLinks} variant="hero" />
            </div>
          )}
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
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EBE6D6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#256B3A]">
                Connect With Us
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#143520] mt-0.5">
                Official Channels & Social Communities
              </h3>
              <p className="text-xs text-[#8F7855] mt-0.5">
                Stay connected with Loneitu across our digital networks and farmer communities.
              </p>
            </div>
            <div className="pt-2 sm:pt-0 shrink-0">
              <SocialIconsRow links={aboutData.socialLinks} variant="light" />
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
