import React, { useState } from 'react';
import { X, Link2, Check, Share2, ExternalLink } from 'lucide-react';
import { WhatsAppIcon, FacebookIcon, TwitterIcon } from './SocialIcons';
import {
  shareToWhatsApp,
  shareToFacebook,
  shareToTwitter,
  shareToLinkedIn,
  copyArticleLink,
  cleanTextExcerpt,
} from '../../utils/shareUtils';
import { useToast } from './Toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  excerpt?: string;
  url?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  excerpt,
  url,
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const cleanExcerpt = cleanTextExcerpt(excerpt, 140);

  const handleCopy = async () => {
    const success = await copyArticleLink(targetUrl);
    if (success) {
      setCopied(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: cleanExcerpt ? `${title} — ${cleanExcerpt}` : title,
          url: targetUrl,
        });
        onClose();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#DDD4BC] shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE6D6]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center shadow-2xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#143520] leading-none">
                Share Article
              </h3>
              <p className="text-[10px] text-[#8F7855] mt-1">
                Share this post across your network
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8F7855] hover:text-[#143520] hover:bg-[#F6F4EB] rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Article Summary preview */}
        <div className="p-3 bg-[#FAF8F3] rounded-2xl border border-[#DDD4BC]/70 space-y-1">
          <div className="font-serif font-bold text-xs text-[#143520] line-clamp-2 leading-snug">
            {title}
          </div>
          {cleanExcerpt && (
            <p className="text-[11px] text-[#6F5B3C] line-clamp-2 leading-relaxed">
              {cleanExcerpt}
            </p>
          )}
        </div>

        {/* Share Action Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={() => {
              shareToWhatsApp(title, excerpt, targetUrl);
              onClose();
            }}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#143520] hover:text-white border border-[#25D366]/30 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <WhatsAppIcon className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-tight">WhatsApp</div>
              <div className="text-[10px] text-[#6F5B3C] group-hover:text-white/90">Chat & Status</div>
            </div>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => {
              shareToFacebook(targetUrl);
              onClose();
            }}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#143520] hover:text-white border border-[#1877F2]/30 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <FacebookIcon className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-tight">Facebook</div>
              <div className="text-[10px] text-[#6F5B3C] group-hover:text-white/90">Feed & Groups</div>
            </div>
          </button>

          {/* Twitter / X */}
          <button
            type="button"
            onClick={() => {
              shareToTwitter(title, targetUrl);
              onClose();
            }}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-black/5 hover:bg-black text-[#143520] hover:text-white border border-black/15 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-2xs">
              <TwitterIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-tight">X / Twitter</div>
              <div className="text-[10px] text-[#6F5B3C] group-hover:text-white/90">Post & Tag</div>
            </div>
          </button>

          {/* LinkedIn */}
          <button
            type="button"
            onClick={() => {
              shareToLinkedIn(targetUrl);
              onClose();
            }}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#143520] hover:text-white border border-[#0A66C2]/30 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              in
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-tight">LinkedIn</div>
              <div className="text-[10px] text-[#6F5B3C] group-hover:text-white/90">Network Post</div>
            </div>
          </button>
        </div>

        {/* Copy Link input */}
        <div className="pt-2 border-t border-[#EBE6D6] space-y-2">
          <div className="flex items-center gap-1.5 p-1.5 bg-[#F6F4EB] rounded-2xl border border-[#DDD4BC]">
            <input
              type="text"
              readOnly
              value={targetUrl}
              className="flex-1 bg-transparent px-2.5 text-xs text-[#54432C] focus:outline-hidden truncate font-mono select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#143520] hover:bg-[#1E542E] text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Native OS share if supported */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2 text-center text-xs font-semibold text-[#256B3A] hover:text-[#143520] hover:underline flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>More share options (System sheet)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

