import React from 'react';
import { Share2, Link as LinkIcon, Heart, Bookmark } from 'lucide-react';
import { useToast } from '../common/Toast';
import { useBlog } from '../../context/BlogContext';

interface ShareButtonsProps {
  title: string;
  articleId: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, articleId }) => {
  const { showToast } = useToast();
  const { bookmarks, toggleBookmark, likedArticles, toggleLike, articles } = useBlog();

  const article = articles.find(a => a.id === articleId);
  const likesCount = article?.likes || 0;
  const isLiked = likedArticles.includes(articleId);
  const isBookmarked = bookmarks.includes(articleId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Article link copied to clipboard!', 'success');
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Insightful agronomy read: "${title}" via Loneitu (MIZORAM TAN):`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-[#EBE6D6] my-8">
      {/* Social / Sharing buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#8F7855] mr-1 flex items-center gap-1">
          <Share2 className="w-3.5 h-3.5" /> Share:
        </span>
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-xl bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#3B2E1D] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Copy link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Copy</span>
        </button>
        <button
          onClick={handleShareTwitter}
          className="px-3 py-2 rounded-xl bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#3B2E1D] text-xs font-medium transition-colors cursor-pointer"
        >
          X / Twitter
        </button>
        <button
          onClick={handleShareLinkedIn}
          className="px-3 py-2 rounded-xl bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#3B2E1D] text-xs font-medium transition-colors cursor-pointer"
        >
          LinkedIn
        </button>
      </div>

      {/* Interactive likes & bookmark */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => toggleLike(articleId)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            isLiked
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#3B2E1D]'
          }`}
          title="Applaud research"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : 'text-[#8F7855]'}`} />
          <span>{likesCount} Likes</span>
        </button>

        <button
          onClick={() => toggleBookmark(articleId)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-[#143520] text-[#BFDC28]'
              : 'bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#3B2E1D]'
          }`}
          title={isBookmarked ? 'Saved to reading queue' : 'Save article'}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#BFDC28]' : 'text-[#8F7855]'}`} />
          <span>{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
};

