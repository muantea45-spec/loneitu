import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Share2 } from 'lucide-react';
import type { Article } from '../../types/blog';
import { formatDate } from '../../utils/formatDate';
import { useBlog } from '../../context/BlogContext';
import { ShareModal } from '../common/ShareModal';

interface HeroFeaturedProps {
  article: Article;
}

function getPlainTextExcerpt(article: Article): string {
  if (article.excerpt && article.excerpt.trim()) {
    return article.excerpt.trim();
  }
  return (article.content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*`_~>[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({ article }) => {
  const { likedArticles, toggleLike } = useBlog();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const isLiked = likedArticles.includes(article.id);
  const excerptText = getPlainTextExcerpt(article);

  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-b from-[#143520] via-[#1E542E] to-[#143520] text-white pt-3 pb-6 sm:pt-4 sm:pb-8 lg:pt-5 lg:pb-10 px-4 sm:px-6 lg:px-8 border-b border-[#256B3A]">
      {/* Subtle organic background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#BFDC28_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Left Lead Info */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3.5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#BFDC28] text-[#143520] shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Featured
              </span>
            </div>

            {/* Article Title */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-[1.2] hover:text-[#DFEDE3] transition-colors">
              <Link to={`/article/${article.slug}`}>
                {article.title}
              </Link>
            </h1>

            {/* In the same line: Author on the left, Share and Love on the right (small) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 pb-2 border-t border-white/15">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#BFDC28] shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-white text-xs sm:text-sm truncate">
                    {article.author.name}
                  </div>
                  <div className="text-[10.5px] text-[#ADC6A7] flex items-center gap-2">
                    <span>{formatDate(article.publishedAt)}</span>
                    <span>•</span>
                    <span>Min {article.readingTimeMinutes} chhiar</span>
                  </div>
                </div>
              </div>

              {/* Share and Love Options - small size in the same line */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/20 transition-all hover:scale-102 cursor-pointer shadow-2xs"
                  title="Share article"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#BFDC28]" />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleLike(article.id)}
                  className={`px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${isLiked
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                    }`}
                  title="Love this article"
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span>{article.likes}</span>
                </button>
              </div>
            </div>

            {/* Excerpt of 3 lines */}
            <p className="text-xs sm:text-sm text-[#D7E3D5] leading-relaxed line-clamp-3">
              {excerptText}
            </p>

            {/* A KIMCHANGIN CHHIAR RAWH option */}
            <div className="pt-1">
              <Link
                to={`/article/${article.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#BFDC28] text-[#143520] font-bold text-xs sm:text-sm hover:bg-[#d5f33d] transition-all duration-200 shadow-md group cursor-pointer tracking-wider"
              >
                <span>A KIMCHANGIN CHHIAR RAWH</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Featured Image Frame */}
          <div className="lg:col-span-5 relative group">
            <Link to={`/article/${article.slug}`} className="block relative overflow-hidden rounded-2xl shadow-2xl border-2 border-white/10 group-hover:border-[#BFDC28]/50 transition-all duration-300">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-[300px] sm:h-[360px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </Link>
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={article.title}
        excerpt={excerptText}
        url={typeof window !== 'undefined' ? `${window.location.origin}/article/${article.slug}` : undefined}
      />
    </section>
  );
};
