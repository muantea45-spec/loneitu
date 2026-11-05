import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Calendar, Heart, ArrowUpRight, Share2 } from 'lucide-react';
import type { Article } from '../../types/blog';
import { formatDate } from '../../utils/formatDate';
import { useBlog } from '../../context/BlogContext';
import { ShareModal } from '../common/ShareModal';

interface BlogCardProps {
  article: Article;
}

export const BlogCard: React.FC<BlogCardProps> = ({ article }) => {
  const { likedArticles, toggleLike, setFilterCategory, categories } = useBlog();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const navigate = useNavigate();

  const isLiked = likedArticles.includes(article.id);

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
    <article className="group bg-white rounded-2xl border border-[#EBE6D6] hover:border-[#32864A] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail Container */}
      <div className="relative overflow-hidden aspect-16/10 bg-[#EBE6D6]">
        <Link to={`/article/${article.slug}`} className="block w-full h-full">
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Category Pill Floating */}
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={e => handleCategoryClick(e, article.category)}
            className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#143520]/90 hover:bg-[#143520] text-[#BFDC28] backdrop-blur-md shadow-sm transition-colors cursor-pointer"
          >
            {article.category}
          </button>
        </div>

        {/* Action icons floating top right: Share and Like */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Universal Share button */}
          <button
            type="button"
            onClick={handleShareClick}
            className="p-2 rounded-full backdrop-blur-md bg-black/45 text-white hover:bg-[#143520] shadow-xs transition-all hover:scale-105 cursor-pointer"
            title="Share article (WhatsApp, Facebook, X, etc.)"
            aria-label="Share article"
          >
            <Share2 className="w-3.5 h-3.5 text-white" />
          </button>

          {/* Like button */}
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              toggleLike(article.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
              isLiked
                ? 'bg-rose-50 text-rose-600 shadow-sm'
                : 'bg-black/45 text-white hover:bg-black/65'
            }`}
            title="Applaud research"
            aria-label="Like article"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Metadata info: Min capitalized */}
          <div className="flex items-center justify-between text-xs text-[#8F7855]">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Min {article.readingTimeMinutes} chhiar
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-xl text-[#143520] group-hover:text-[#256B3A] transition-colors leading-snug line-clamp-2">
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
                className="w-7 h-7 rounded-full object-cover ring-1 ring-[#256B3A]/40 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#13341D] truncate">
                  {article.author.name}
                </div>
                <div className="text-[10px] text-[#8F7855] truncate">
                  {article.author.role}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                type="button"
                onClick={handleShareClick}
                className="w-8 h-8 rounded-full bg-[#F6F4EB] hover:bg-[#143520] text-[#143520] hover:text-[#BFDC28] flex items-center justify-center transition-all cursor-pointer"
                title="Share article"
                aria-label="Share article"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <Link
                to={`/article/${article.slug}`}
                className="w-8 h-8 rounded-full bg-[#F6F4EB] group-hover:bg-[#143520] text-[#143520] group-hover:text-[#BFDC28] flex items-center justify-center transition-all duration-200"
                aria-label={`Read ${article.title}`}
              >
                <ArrowUpRight className="w-4 h-4" />
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
