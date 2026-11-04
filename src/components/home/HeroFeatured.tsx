import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ArrowRight, Sparkles, Bookmark, Heart } from 'lucide-react';
import type { Article } from '../../types/blog';
import { formatDate } from '../../utils/formatDate';
import { useBlog } from '../../context/BlogContext';
import { WhatsAppIcon } from '../common/SocialIcons';
import { shareToWhatsApp } from '../../utils/shareUtils';

interface HeroFeaturedProps {
  article: Article;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({ article }) => {
  const { bookmarks, toggleBookmark, likedArticles, toggleLike } = useBlog();
  const isBookmarked = bookmarks.includes(article.id);
  const isLiked = likedArticles.includes(article.id);

  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-b from-[#143520] via-[#1E542E] to-[#143520] text-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#256B3A]">
      {/* Subtle organic background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#BFDC28_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Lead Info */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#BFDC28] text-[#143520]">
                <Sparkles className="w-3.5 h-3.5" />
                Thuziak thar (Featured)
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-[#D7E3D5] backdrop-blur-xs font-medium">
                {article.category}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.18] hover:text-[#DFEDE3] transition-colors">
              <Link to={`/article/${article.slug}`}>
                {article.title}
              </Link>
            </h1>

            {/* Author and Metadata Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
              <div className="flex items-center gap-3">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#BFDC28]"
                />
                <div>
                  <div className="font-semibold text-white text-sm">
                    {article.author.name}
                  </div>
                  <div className="text-xs text-[#ADC6A7]">
                    {article.author.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#ADC6A7]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  min {article.readingTimeMinutes} chhiar
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={`/article/${article.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#BFDC28] text-[#143520] font-bold text-sm hover:bg-[#d5f33d] transition-all duration-200 shadow-md group cursor-pointer"
              >
                <span>A Kimchangin Chhiar Rawh</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const fullUrl = `${window.location.origin}/article/${article.slug}`;
                    shareToWhatsApp(article.title, article.excerpt || article.content, fullUrl);
                  }}
                  className="px-3.5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20be5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-102 cursor-pointer"
                  title="Share directly to WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => toggleLike(article.id)}
                  className={`p-3 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                    isLiked
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                  title="Applaud research"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span>{article.likes}</span>
                </button>

                <button
                  onClick={() => toggleBookmark(article.id)}
                  className={`p-3 rounded-xl border transition-colors text-xs font-semibold ${
                    isBookmarked
                      ? 'bg-[#BFDC28]/20 border-[#BFDC28] text-[#BFDC28]'
                      : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                  title={isBookmarked ? 'Saved to reading queue' : 'Save article'}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#BFDC28]' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Featured Image Frame */}
          <div className="lg:col-span-5 relative group">
            <Link to={`/article/${article.slug}`} className="block relative overflow-hidden rounded-2xl shadow-2xl border-2 border-white/10 group-hover:border-[#BFDC28]/50 transition-all duration-300">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-[360px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

