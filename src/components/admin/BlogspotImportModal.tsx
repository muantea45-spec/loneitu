import React, { useState } from 'react';
import {
  X,
  Globe,
  Download,
  Check,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Eye,
} from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { useToast } from '../common/Toast';
import { formatDate } from '../../utils/formatDate';

interface BlogspotPost {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  tags: string[];
  authorName?: string;
  originalUrl?: string;
  views?: number;
}

interface BlogspotImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportToEditor?: (post: BlogspotPost) => void;
}

export const BlogspotImportModal: React.FC<BlogspotImportModalProps> = ({
  isOpen,
  onClose,
  onImportToEditor,
}) => {
  const { authors, categories, addArticle, batchAddArticles } = useBlog();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'single' | 'feed'>('single');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single post result
  const [singlePost, setSinglePost] = useState<BlogspotPost | null>(null);
  const [singleViews, setSingleViews] = useState<string>('');

  // Feed posts results
  const [feedTitle, setFeedTitle] = useState('');
  const [feedPosts, setFeedPosts] = useState<BlogspotPost[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [feedViewsMap, setFeedViewsMap] = useState<Record<number, string>>({});

  // Configuration for imported articles
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>(() => authors[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    () => categories[0]?.name || 'Leilung leh Thlai Enkawl'
  );
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');

  if (!isOpen) return null;

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSinglePost(null);
    setSingleViews('');
    setFeedPosts([]);
    setSelectedIndices(new Set());
    setFeedViewsMap({});

    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Please enter a Blogspot URL');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/import-blogspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanUrl,
          mode: tab,
          maxResults: 40,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch Blogspot content.');
      }

      if (data.mode === 'single' && data.post) {
        setSinglePost(data.post);
        showToast('Blogspot article fetched successfully!', 'success');
      } else if (data.mode === 'feed' && Array.isArray(data.posts)) {
        setFeedTitle(data.blogTitle || 'Blogspot Feed');
        setFeedPosts(data.posts);
        // Default: select all
        setSelectedIndices(new Set(data.posts.map((_: any, idx: number) => idx)));
        showToast(`Loaded ${data.posts.length} articles from ${data.blogTitle || 'blog'}`, 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with Blogspot proxy');
      showToast(err.message || 'Fetch failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectIndex = (idx: number) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === feedPosts.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(feedPosts.map((_, idx) => idx)));
    }
  };

  const parseOptionalViews = (raw?: string): number | undefined => {
    if (!raw || !raw.trim()) return undefined;
    const n = Number(raw.trim());
    if (!Number.isFinite(n) || n < 0) return undefined;
    return Math.floor(n);
  };

  const handlePublishSingleDirectly = () => {
    if (!singlePost) return;
    const author = authors.find(a => a.id === selectedAuthorId) || authors[0];
    const inheritedViews = parseOptionalViews(singleViews);

    addArticle({
      title: singlePost.title,
      content: singlePost.content,
      excerpt: singlePost.excerpt,
      coverImage: singlePost.coverImage,
      category: selectedCategory,
      tags: singlePost.tags.length > 0 ? singlePost.tags : ['Blogspot'],
      author,
      status: 'published',
      isFeatured: false,
      views: inheritedViews,
    });

    showToast(`Published "${singlePost.title}" to Loneitu Journal!`, 'success');
    onClose();
  };

  const handleOpenSingleInEditor = () => {
    if (!singlePost) return;
    if (onImportToEditor) {
      onImportToEditor({
        ...singlePost,
        views: parseOptionalViews(singleViews),
      });
    }
    showToast('Loaded article into editor canvas', 'info');
    onClose();
  };

  const handleBatchImport = async () => {
    if (selectedIndices.size === 0) {
      showToast('Please select at least one article to import', 'error');
      return;
    }

    setIsImporting(true);
    setImportProgress(`Importing ${selectedIndices.size} articles into repository...`);

    const selectedEntries = feedPosts
      .map((post, idx) => ({ post, idx }))
      .filter(({ idx }) => selectedIndices.has(idx));
    const author = authors.find(a => a.id === selectedAuthorId) || authors[0];

    try {
      const itemsToImport = selectedEntries.map(({ post, idx }) => ({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        category: selectedCategory,
        tags: post.tags.length > 0 ? post.tags : ['Blogspot'],
        author,
        status: 'published' as const,
        isFeatured: false,
        publishedAt: post.publishedAt || new Date().toISOString(),
        views: parseOptionalViews(feedViewsMap[idx]),
      }));

      const result = batchAddArticles(itemsToImport);

      showToast(`Successfully imported ${result.count} articles into journal repository!`, 'success');
      onClose();
    } catch (err: any) {
      showToast(`Error during batch import: ${err.message}`, 'error');
    } finally {
      setIsImporting(false);
      setImportProgress('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-[#DDD4BC] shadow-2xl space-y-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE6D6] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center shadow-2xs">
              <Globe className="w-5 h-5 text-[#256B3A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#143520] leading-none">
                  Import from Blogspot
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#BFDC28]/30 text-[#143520] uppercase tracking-wide">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-[#6F5B3C] font-medium mt-1">
                Pull articles, cover images, and HTML formatting directly into Loneitu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-[#6F5B3C] hover:text-[#143520] hover:bg-[#F6F4EB] rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center gap-1 bg-[#F6F4EB] p-1 rounded-2xl border border-[#DDD4BC] shrink-0">
          <button
            type="button"
            onClick={() => {
              setTab('single');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'single'
                ? 'bg-white text-[#143520] shadow-xs'
                : 'text-[#6F5B3C] hover:text-[#143520]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Single Article URL</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('feed');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'feed'
                ? 'bg-white text-[#143520] shadow-xs'
                : 'text-[#6F5B3C] hover:text-[#143520]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch Blog Import</span>
          </button>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleFetch} className="space-y-3 shrink-0">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              {tab === 'single' ? 'Blogspot Post URL' : 'Blogspot Domain / Homepage'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={
                  tab === 'single'
                    ? 'https://mizofarming.blogspot.com/2024/05/pesticide-guide.html'
                    : 'https://mizofarming.blogspot.com'
                }
                className="flex-1 px-4 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden focus:border-[#256B3A] font-mono"
              />
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#BFDC28]" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-[#BFDC28]" />
                    <span>Fetch Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[#8F7855]">
            Supports both <code className="bg-[#FAF8F3] px-1 py-0.5 rounded border border-[#DDD4BC]">.blogspot.com</code> and <code className="bg-[#FAF8F3] px-1 py-0.5 rounded border border-[#DDD4BC]">.blogspot.in</code> domains.
          </p>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Content Results Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Metadata selectors (Author & Category) shown once content is fetched */}
          {(singlePost || feedPosts.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#FAF8F3] rounded-2xl border border-[#DDD4BC]/70">
              <div>
                <label className="block text-[11px] font-bold text-[#6F5B3C] mb-1">
                  Assign Author
                </label>
                <select
                  value={selectedAuthorId}
                  onChange={e => setSelectedAuthorId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] font-medium focus:outline-hidden"
                >
                  {authors.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#6F5B3C] mb-1">
                  Assign Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] font-medium focus:outline-hidden"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* SINGLE POST PREVIEW CARD */}
          {singlePost && (
            <div className="border border-[#DDD4BC] rounded-2xl p-4 bg-white space-y-4 shadow-xs">
              <div className="flex gap-4 items-start">
                {singlePost.coverImage ? (
                  <img
                    src={singlePost.coverImage}
                    alt={singlePost.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 border border-[#DDD4BC]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-[#F6F4EB] border border-[#DDD4BC] flex items-center justify-center shrink-0 text-[#8F7855]">
                    <FileText className="w-8 h-8" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-[#8F7855]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(singlePost.publishedAt)}
                    </span>
                    {singlePost.authorName && (
                      <span>• Original: {singlePost.authorName}</span>
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#143520] line-clamp-2">
                    {singlePost.title}
                  </h4>
                  <p className="text-xs text-[#6F5B3C] line-clamp-2 leading-relaxed">
                    {singlePost.excerpt}
                  </p>
                  {singlePost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {singlePost.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-[#F6F4EB] px-2 py-0.5 rounded-md text-[#54432C] border border-[#DDD4BC]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Inherit Historical Blogger Views */}
              <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#DDD4BC]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#143520]">
                    <Eye className="w-3.5 h-3.5 text-[#256B3A]" />
                    <span>Inherit Blogger Views (Optional)</span>
                  </label>
                  <p className="text-[10.5px] text-[#8F7855]">
                    Enter views from Blogger → Stats → Posts so your article keeps its existing read count.
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={singleViews}
                  onChange={e => setSingleViews(e.target.value)}
                  placeholder="e.g. 2450"
                  className="w-full sm:w-36 px-3 py-1.5 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] font-mono focus:outline-hidden focus:border-[#256B3A] shrink-0"
                />
              </div>

              {/* Single Post Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-[#EBE6D6]">
                {onImportToEditor && (
                  <button
                    type="button"
                    onClick={handleOpenSingleInEditor}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#DDD4BC] hover:bg-[#F6F4EB] text-xs font-bold text-[#143520] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#256B3A]" />
                    <span>Open in Editor to Review</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePublishSingleDirectly}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#BFDC28]" />
                  <span>Directly Publish to Journal</span>
                </button>
              </div>
            </div>
          )}

          {/* FEED BATCH PREVIEW LIST */}
          {feedPosts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-bold text-[#143520]">
                  Found {feedPosts.length} posts from "{feedTitle}"
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs text-[#256B3A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {selectedIndices.size === feedPosts.length ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Select All ({feedPosts.length})</span>
                    </>
                  )}
                </button>
              </div>

              <div className="divide-y divide-[#EBE6D6] border border-[#DDD4BC] rounded-2xl overflow-hidden bg-white max-h-72 overflow-y-auto">
                {feedPosts.map((post, idx) => {
                  const isSelected = selectedIndices.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelectIndex(idx)}
                      className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#FAF8F3]' : 'hover:bg-[#F6F4EB]/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#256B3A] rounded cursor-pointer"
                      />
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#DDD4BC]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#F6F4EB] border border-[#DDD4BC] flex items-center justify-center shrink-0 text-[#8F7855]">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-serif font-bold text-xs text-[#143520] truncate">
                          {post.title}
                        </h5>
                        <div className="flex items-center gap-2 text-[10px] text-[#8F7855] mt-0.5">
                          <span>{formatDate(post.publishedAt)}</span>
                          {post.tags.length > 0 && (
                            <span>• {post.tags.slice(0, 2).join(', ')}</span>
                          )}
                        </div>
                      </div>
                      <div
                        className="shrink-0 flex items-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <Eye className="w-3 h-3 text-[#8F7855]" />
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={feedViewsMap[idx] ?? ''}
                          onChange={e =>
                            setFeedViewsMap(prev => ({
                              ...prev,
                              [idx]: e.target.value,
                            }))
                          }
                          placeholder="Views"
                          title="Enter historical Blogger view count (optional)"
                          className="w-20 px-2 py-1 bg-white border border-[#DDD4BC] rounded-lg text-[11px] font-mono text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Batch Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#6F5B3C]">
                  {selectedIndices.size} of {feedPosts.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleBatchImport}
                  disabled={isImporting || selectedIndices.size === 0}
                  className="px-5 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#BFDC28]" />
                      <span>{importProgress || 'Importing...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-[#BFDC28]" />
                      <span>Import Selected ({selectedIndices.size})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
