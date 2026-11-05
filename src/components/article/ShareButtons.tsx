import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Heart, Check } from 'lucide-react';
import { useToast } from '../common/Toast';
import { useBlog } from '../../context/BlogContext';
import { WhatsAppIcon, FacebookIcon } from '../common/SocialIcons';
import { shareToWhatsApp, shareToFacebook, shareToTwitter, shareToLinkedIn, copyArticleLink } from '../../utils/shareUtils';
import { ShareModal } from '../common/ShareModal';

interface ShareButtonsProps {
  title: string;
  articleId: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, articleId }) => {
  const { showToast } = useToast();
  const { likedArticles, toggleLike, articles } = useBlog();
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const article = articles.find(a => a.id === articleId);
  const likesCount = article?.likes || 0;
  const isLiked = likedArticles.includes(articleId);

  const handleCopyLink = async () => {
    const ok = await copyArticleLink();
    if (ok) {
      setCopied(true);
      showToast('Article link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    shareToWhatsApp(title, article?.excerpt || article?.content);
  };

  const handleShareFacebook = () => {
    shareToFacebook();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-[#EBE6D6] my-8">
      {/* Social / Sharing buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Main Share Button with Logo */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all hover:scale-102 cursor-pointer"
          title="Share to WhatsApp, Facebook, X, etc."
        >
          <Share2 className="w-3.5 h-3.5 text-[#BFDC28]" />
          <span>Share</span>
        </button>

        {/* WhatsApp Direct Option */}
        <button
          onClick={handleShareWhatsApp}
          className="p-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#1e8341] hover:text-white transition-colors cursor-pointer"
          title="Share to WhatsApp"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </button>

        {/* Facebook Direct Option */}
        <button
          onClick={handleShareFacebook}
          className="p-2 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white transition-colors cursor-pointer"
          title="Share to Facebook"
        >
          <FacebookIcon className="w-4 h-4" />
        </button>

        <button
          onClick={handleCopyLink}
          className="p-2 rounded-xl bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#3B2E1D] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Copy link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        <button
          onClick={() => shareToTwitter(title)}
          className="px-3 py-2 rounded-xl bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#3B2E1D] text-xs font-medium transition-colors cursor-pointer"
        >
          X
        </button>

        <button
          onClick={() => shareToLinkedIn()}
          className="px-3 py-2 rounded-xl bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#3B2E1D] text-xs font-medium transition-colors cursor-pointer"
        >
          LinkedIn
        </button>
      </div>

      {/* Interactive like button */}
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
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={title}
        excerpt={article?.excerpt || article?.content}
        url={typeof window !== 'undefined' && article ? `${window.location.origin}/article/${article.slug}` : undefined}
      />
    </div>
  );
};
