import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Calendar, Heart, ArrowUpRight, Share2, Play } from 'lucide-react';
import type { Article } from '../../types/blog';
import { formatDate } from '../../utils/formatDate';
import { useBlog } from '../../context/BlogContext';
import { ShareModal } from '../common/ShareModal';
import { resolveImageUrl } from '../../utils/imageUrlResolver';
import { getArticleMediaBadge } from '../../utils/mediaEmbed';

interface BlogCardProps {
  article: Article;
}

export const BlogCard: React.FC<BlogCardProps> = ({ article }) => {
  const { likedArticles, toggleLike, setFilterCategory, categories } = useBlog();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const navigate = useNavigate();

  const isLiked = likedArticles.includes(article.id);
  const mediaBadge = getArticleMediaBadge(article);
  const coverSrc = resolveImageUrl(article.coverImage) || mediaBadge?.thumbnailUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80';

  const handleCategoryClick = (e: React.MouseEvent, catName: string) => {
    e.preventDefault();
    e.stopPropagation();
    const found = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    const slug = found ? found.slug : catName.toLowerCase();
    setFilterCategory(slug);
    navigate(`/category/${slug}`);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  return (
    <article className="group bg-white rounded-2xl border border-[#EBE6D6] hover:border-[#C4BBA7] shadow-xs hover:shadow-sm transition-colors duration-150 flex flex-col overflow-hidden">
      {/* Thumbnail Container */}
      <div className="relative overflow-hidden aspect-16/10 bg-[#EBE6D6]">
        <Link to={`/article/${article.slug}`} className="block w-full h-full">
          <img
            src={coverSrc}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </Link>

        {/* Category Pill Floating */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 flex-wrap">
          <button
            onClick={e => handleCategoryClick(e, article.category)}
            className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#143520] text-[#BFDC28] shadow-2xs transition-colors cursor-pointer"
          >
            {article.category}
          </button>
          {mediaBadge && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/75 text-white border border-white/10">
              <Play className="w-2.5 h-2.5 fill-red-500 text-red-500" />
              <span>{mediaBadge.label}</span>
            </span>
          )}
        </div>

        {/* Center Play Button Overlay on Video Articles */}
        {mediaBadge && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-black/60 text-white border border-white/20 flex items-center justify-center shadow-md">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Metadata info */}
          <div className="flex items-center justify-between text-xs text-[#6F5B3C]">
            <span className="flex items-center gap-1.5 font-normal">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5 font-normal">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTimeMinutes} min read
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif font-semibold text-lg sm:text-xl text-[#143520] group-hover:text-[#256B3A] transition-colors leading-snug line-clamp-2">
            <Link to={`/article/${article.slug}`}>
              {article.title}
            </Link>
          </h3>
        </div>

        {/* Bottom author and read action */}
        <div className="mt-5 pt-4 border-t border-[#F6F4EB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-[#256B3A]/30 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#13341D] truncate">
                  {article.author.name}
                </div>
                <div className="text-[11px] text-[#6F5B3C] truncate">
                  {article.author.role}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {/* Like / Applaud Button */}
              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleLike(article.id);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden ${
                  isLiked
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-[#F6F4EB] text-[#6F5B3C] hover:text-[#143520] hover:bg-[#EAE4D3]'
                }`}
                title="Like article"
                aria-label="Like article"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShareClick}
                className="w-8 h-8 rounded-lg bg-[#F6F4EB] hover:bg-[#EAE4D3] text-[#6F5B3C] hover:text-[#143520] flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden"
                title="Share article"
                aria-label="Share article"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {/* Open Article */}
              <Link
                to={`/article/${article.slug}`}
                className="w-8 h-8 rounded-lg bg-[#F6F4EB] hover:bg-[#143520] text-[#143520] hover:text-[#BFDC28] flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[#256B3A] outline-hidden"
                aria-label={`Read ${article.title}`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={article.title}
        excerpt={article.excerpt || article.content}
        url={typeof window !== 'undefined' ? `${window.location.origin}/article/${article.slug}` : undefined}
      />
    </article>
  );
};
