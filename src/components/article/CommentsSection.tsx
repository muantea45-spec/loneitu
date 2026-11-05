import React, { useState } from 'react';
import type { Comment } from '../../types/blog';
import { MessageSquare, Send, User } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { useBlog } from '../../context/BlogContext';
import { useToast } from '../common/Toast';

interface CommentsSectionProps {
  articleId: string;
  comments: Comment[];
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ articleId, comments }) => {
  const { addComment } = useBlog();
  const { showToast } = useToast();
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) {
      showToast('Please provide your name and your observation.', 'error');
      return;
    }

    addComment(articleId, {
      authorName,
      authorRole: authorRole.trim() || 'Independent Farmer / Agronomist',
      content,
    });

    setAuthorName('');
    setAuthorRole('');
    setContent('');
    showToast('I ngaihdan / field note thehluh a ni e!', 'success');
  };

  return (
    <div className="my-14 pt-10 border-t border-[#EBE6D6]">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-[#256B3A]" />
        <h3 className="font-serif font-bold text-2xl text-[#143520]">
          Loneitute Ngaihdan & Zirchianna ({comments.length})
        </h3>
      </div>

      {/* Form to submit a comment */}
      <form onSubmit={handleSubmit} className="bg-[#F6F4EB] p-6 rounded-2xl border border-[#EBE6D6] mb-8 space-y-4">
        <h4 className="text-sm font-semibold text-[#143520]">
          I Huan / Lo Zirchianna leh Zawhna Ziak Rawh
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6F5B3C] mb-1">
              I Hming / Nihna *
            </label>
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="e.g. Samuel Lalnunmawia, Loneitu"
              className="w-full px-3.5 py-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#6F5B3C]/60 focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6F5B3C] mb-1">
              I Huan / Veng / District (a duh tan)
            </label>
            <input
              type="text"
              value={authorRole}
              onChange={e => setAuthorRole(e.target.value)}
              placeholder="e.g. Serchhip / Champhai Huan"
              className="w-full px-3.5 py-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#6F5B3C]/60 focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6F5B3C] mb-1">
            I Ngaihdan leh Zirchianna *
          </label>
          <textarea
            rows={3}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="I leilung leitha hmuh dan, tui pek dan, thei chin dan emaw zawhna i neihte han ziak ve le..."
            className="w-full px-3.5 py-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#6F5B3C]/60 focus:outline-hidden focus:border-[#256B3A]"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#143520] text-white text-xs font-semibold hover:bg-[#1E542E] transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ngaihdan Thehlut Rawh</span>
          </button>
        </div>
      </form>

      {/* Existing comments list */}
      {comments.length === 0 ? (
        <p className="text-xs text-[#6F5B3C] italic">
          Ngaihdan a la awm rih lo. I thil hmuhchhuah leh zirchianna ziak hmasa ber rawh le!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map(c => (
            <div
              key={c.id}
              className="p-5 bg-white rounded-2xl border border-[#EBE6D6] space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[#13341D]">
                      {c.authorName}
                    </span>
                    {c.authorRole && (
                      <span className="text-[11px] text-[#6F5B3C] ml-2">
                        • {c.authorRole}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-[#6F5B3C] font-mono">
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A584E] leading-relaxed pl-10.5">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

