import React, { useEffect } from 'react';
import { Sprout } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useBlog } from '../context/BlogContext';
import { SocialIconsRow } from '../components/common/SocialIcons';

export const AboutPage: React.FC = () => {
  const { aboutData } = useBlog();

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
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E542E] text-[#BFDC28] border border-[#256B3A] text-xs font-semibold uppercase tracking-wider">
            <Sprout className="w-4 h-4" />
            <span>{aboutData.badge || 'LONEITU EDITORIAL BOARD & MANIFESTO'}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            {aboutData.heroTitle || 'Mizoram Thlai leh Leilung Humhalhna'}
          </h1>
          <p className="text-sm sm:text-base text-[#D7E3D5] max-w-2xl mx-auto leading-relaxed">
            {aboutData.heroDescription || 'Tlangram lo neih dan phung hrisel, buh leh thlai thar tam dan, huan enkawl dan changkang leh ran vulh dan tha ziah chhuahna hmunpui.'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Editorial Body / Manifesto */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#DDD4BC] shadow-xs space-y-6">
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
      </div>
    </div>
  );
};
