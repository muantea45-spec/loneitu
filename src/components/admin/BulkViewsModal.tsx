import React, { useState, useEffect } from 'react';
import { X, Eye, Check, Sparkles, ClipboardPaste, Search } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { useToast } from '../common/Toast';

interface BulkViewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function normalizeTitleForMatch(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const BulkViewsModal: React.FC<BulkViewsModalProps> = ({ isOpen, onClose }) => {
  const { articles, bulkUpdateArticleViews } = useBlog();
  const { showToast } = useToast();

  const [viewsDraft, setViewsDraft] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      articles.forEach(a => {
        initial[a.id] = String(a.views ?? 0);
      });
      setViewsDraft(initial);
      setSearch('');
      setPasteText('');
      setShowPasteBox(false);
    }
  }, [isOpen, articles]);

  if (!isOpen) return null;

  const filteredArticles = articles.filter(a => {
    if (!search.trim()) return true;
    return a.title.toLowerCase().includes(search.toLowerCase());
  });

  const handleApplyPastedStats = () => {
    const lines = pasteText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      showToast('Paste lines containing Article Title and Views count first.', 'info');
      return;
    }

    const parsedPairs: Array<{ title: string; views: number }> = [];
    for (const line of lines) {
      // Match trailing number (allowing commas like 12,450) separated by tab, pipe, comma, colon, dash, or multiple spaces
      const match = line.match(/^(.+?)(?:\t+|\s*[|:,—–-]\s*|\s{2,}|\s+)([\d,]+)\s*(?:views?)?$/i);
      if (match) {
        const rawTitle = match[1].trim();
        const rawNum = Number(match[2].replace(/,/g, ''));
        if (rawTitle && Number.isFinite(rawNum) && rawNum >= 0) {
          parsedPairs.push({ title: rawTitle, views: Math.floor(rawNum) });
        }
      }
    }

    if (parsedPairs.length === 0) {
      showToast('Could not detect Title + Views pairs. Format each line like: Article Title | 2450', 'error');
      return;
    }

    const nextDraft = { ...viewsDraft };
    let matchedCount = 0;

    parsedPairs.forEach(pair => {
      const targetNorm = normalizeTitleForMatch(pair.title);
      if (!targetNorm) return;

      // Exact normalized match first, then substring match fallback
      let matchArt = articles.find(a => normalizeTitleForMatch(a.title) === targetNorm);
      if (!matchArt) {
        matchArt = articles.find(a => {
          const artNorm = normalizeTitleForMatch(a.title);
          return artNorm.includes(targetNorm) || targetNorm.includes(artNorm);
        });
      }

      if (matchArt) {
        nextDraft[matchArt.id] = String(pair.views);
        matchedCount++;
      }
    });

    setViewsDraft(nextDraft);
    if (matchedCount > 0) {
      showToast(`Matched and filled ${matchedCount} article${matchedCount === 1 ? '' : 's'}! Review & click Save Views.`, 'success');
      setShowPasteBox(false);
    } else {
      showToast('No article titles matched the pasted text. You can still type counts manually below.', 'info');
    }
  };

  const handleSave = () => {
    const updates: Array<{ id: string; views: number }> = [];
    articles.forEach(art => {
      const raw = viewsDraft[art.id];
      if (raw === undefined || raw.trim() === '') return;
      const num = Math.floor(Number(raw.replace(/,/g, '')) || 0);
      if (num >= 0 && num !== art.views) {
        updates.push({ id: art.id, views: num });
      }
    });

    if (updates.length === 0) {
      showToast('No view counts changed.', 'info');
      onClose();
      return;
    }

    const count = bulkUpdateArticleViews(updates);
    showToast(`Updated view counts for ${count} article${count === 1 ? '' : 's'} and synced to cloud!`, 'success');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-[#DDD4BC] shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#EBE6D6] pb-3 shrink-0">
          <div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#143520] flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[#EBF1EA] text-[#256B3A]">
                <Eye className="w-5 h-5" />
              </div>
              <span>Inherit & Sync Blogger Views</span>
            </h3>
            <p className="text-xs text-[#6F5B3C] mt-1">
              Set historical view counts from <strong>Blogger → Stats → Posts</strong> across your articles in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8F7855] hover:text-[#143520] hover:bg-[#F6F4EB] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search + Paste Helper Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8F7855]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter articles by title..."
              className="w-full pl-8 pr-3 py-2 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPasteBox(prev => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              showPasteBox
                ? 'bg-[#143520] text-[#BFDC28] border-[#143520]'
                : 'bg-[#FAF8F3] hover:bg-[#F6F4EB] text-[#143520] border-[#DDD4BC]'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Paste Blogger Stats</span>
          </button>
        </div>

        {/* Quick Paste Box */}
        {showPasteBox && (
          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#DDD4BC] space-y-2.5 shrink-0">
            <label className="block text-[11px] font-bold text-[#143520]">
              Paste lines with Article Title & Views (separated by tab, `|`, comma, or `-`)
            </label>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              rows={4}
              placeholder={`Example:\nKiwi Cultivation Guide in Champhai | 4820\nDragonfruit Farming Techniques\t1,950`}
              className="w-full px-3 py-2 bg-white border border-[#DDD4BC] rounded-xl text-xs font-mono text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasteBox(false)}
                className="px-3 py-1.5 text-xs font-semibold text-[#6F5B3C] hover:bg-[#EBE6D6] rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApplyPastedStats}
                className="px-4 py-1.5 rounded-lg bg-[#256B3A] hover:bg-[#1E542E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#BFDC28]" />
                <span>Match & Fill Counts</span>
              </button>
            </div>
          </div>
        )}

        {/* Editable Articles List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#EBE6D6] border border-[#DDD4BC] rounded-2xl bg-white min-h-[200px]">
          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6F5B3C]">
              No matching articles found.
            </div>
          ) : (
            filteredArticles.map(art => {
              const currentDraft = viewsDraft[art.id] ?? String(art.views ?? 0);
              const isChanged = Number(currentDraft || 0) !== (art.views ?? 0);
              return (
                <div
                  key={art.id}
                  className={`px-3.5 py-2.5 flex items-center justify-between gap-3 ${
                    isChanged ? 'bg-[#F2F7F3]/70' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-serif font-bold text-xs sm:text-sm text-[#143520] truncate">
                      {art.title}
                    </div>
                    <div className="text-[10.5px] text-[#8F7855]">
                      Current: {(art.views ?? 0).toLocaleString()} views • /{art.slug}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={currentDraft}
                      onChange={e =>
                        setViewsDraft(prev => ({
                          ...prev,
                          [art.id]: e.target.value,
                        }))
                      }
                      className="w-28 px-2.5 py-1.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-mono text-[#13341D] text-right focus:outline-hidden focus:border-[#256B3A]"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EBE6D6] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#DDD4BC] text-xs font-semibold text-[#54432C] hover:bg-[#F6F4EB] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4 text-[#BFDC28]" />
            <span>Save & Sync Views</span>
          </button>
        </div>
      </div>
    </div>
  );
};
