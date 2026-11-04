import React, { useEffect } from 'react';
import { Sprout } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useBlog } from '../context/BlogContext';
import { SocialIconsRow } from '../components/common/SocialIcons';

export const AboutPage: React.FC = () => {
  const { aboutData, authors } = useBlog();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'About & Editorial Manifesto — Loneitu (MIZORAM TAN)';
  }, []);

  const social = aboutData.socialLinks || {};
  const hasAnySocial = Object.values(social).some(v => !!v && v.trim() !== '');

  return (
    <div className="w-full min-h-screen bg-[#FBFBF8] pb-16">
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

          <div className="text-sm sm:text-base text-[#4A584E] leading-relaxed space-y-4 text-justify [text-align:justify]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-justify [text-align:justify]" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-[#143520]" {...props} />,
                em: ({ node, ...props }) => <em className="italic text-[#143520]" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1.5 my-3 text-justify [text-align:justify]" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1.5 my-3 text-justify [text-align:justify]" {...props} />,
                li: ({ node, ...props }) => <li className="text-[#4A584E] text-justify [text-align:justify]" {...props} />,
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
