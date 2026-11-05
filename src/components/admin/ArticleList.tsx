import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Tag as TagIcon,
  User,
  FolderTree,
} from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { formatDate } from '../../utils/formatDate';
import { useToast } from '../common/Toast';

interface ArticleListProps {
  onNewArticle: () => void;
  onEditArticle: (articleId: string) => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  onNewArticle,
  onEditArticle,
}) => {
  const { articles, deleteArticle, toggleFeatured, toggleStatus } = useBlog();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = articles.filter(art => {
    if (statusFilter === 'published' && art.status !== 'published') return false;
    if (statusFilter === 'draft' && art.status !== 'draft') return false;
    if (statusFilter === 'featured' && !art.isFeatured) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.slug.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        (art.author?.name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteArticle(id);
      showToast('Article deleted successfully', 'info');
    }
  };

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/article/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    showToast('Article link copied to clipboard!', 'success');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DDD4BC] shadow-xs overflow-hidden w-full max-w-full">
      {/* Top Header & Search Controls */}
      <div className="p-4 sm:p-6 border-b border-[#EBE6D6] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520]">
              Article Repository ({articles.length})
            </h2>
            <p className="text-xs text-[#8F7855] mt-0.5">
              Manage publication status, featured stories, and content drafts
            </p>
          </div>
          <button
            onClick={onNewArticle}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#143520] text-white text-xs font-semibold hover:bg-[#1E542E] transition-colors shrink-0 shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 text-[#BFDC28]" />
            <span>Create New Article</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F7855]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search title, slug, sector, author..."
              className="w-full pl-9 pr-3 py-2 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
            {(['all', 'published', 'draft', 'featured'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors shrink-0 cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-[#143520] text-white'
                    : 'bg-[#F6F4EB] text-[#54432C] hover:bg-[#EBE6D6]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Viewport Table (No horizontal overflow) */}
      <div className="w-full overflow-x-hidden">
        <table className="w-full table-fixed text-left text-xs">
          <thead className="bg-[#F6F4EB] text-[#6F5B3C] uppercase text-[10px] tracking-wider border-b border-[#EBE6D6]">
            <tr>
              {/* Primary Article Info - always visible with flexible width */}
              <th className="px-3 sm:px-5 py-3 w-auto min-w-0">Article</th>
              {/* Secondary Metadata - selectively hidden on intermediate breakpoints */}
              <th className="hidden md:table-cell px-3 py-3 w-36 lg:w-44">Sector</th>
              <th className="hidden md:table-cell px-2 py-3 w-16 text-center">Featured</th>
              <th className="px-2 sm:px-3 py-3 w-24 sm:w-28 text-center">Status</th>
              <th className="hidden xl:table-cell px-2 py-3 w-24 text-center">Metrics</th>
              <th className="hidden sm:table-cell px-3 py-3 w-24 text-[#8F7855]">Date</th>
              <th className="px-3 py-3 w-24 sm:w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F6F4EB]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-[#8F7855]">
                  No articles found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map(art => {
                const isExpanded = expandedId === art.id;

                return (
                  <React.Fragment key={art.id}>
                    <tr
                      className={`hover:bg-[#FBFBF8] transition-colors ${
                        isExpanded ? 'bg-[#F9F7F1]' : ''
                      }`}
                    >
                      {/* Article Details with Thumbnail, Truncated Title & Slug */}
                      <td className="px-3 sm:px-5 py-3 w-auto min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <img
                            src={art.coverImage}
                            alt=""
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover shrink-0 border border-[#DDD4BC]"
                          />
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/article/${art.slug}`}
                              className="font-serif font-bold text-xs sm:text-sm text-[#143520] hover:text-[#256B3A] truncate block"
                              title={art.title}
                            >
                              {art.title}
                            </Link>
                            <div className="flex items-center gap-2 text-[11px] text-[#8F7855] mt-0.5 min-w-0">
                              <span className="truncate">by {art.author?.name || 'Editorial Team'}</span>
                              <span className="hidden sm:inline text-[#DDD4BC]">•</span>
                              <span className="font-mono text-[10px] text-[#8F7855]/70 truncate hidden sm:inline">
                                /{art.slug}
                              </span>
                            </div>
                            {/* Mobile inline badges when tablet columns are hidden */}
                            <div className="flex md:hidden items-center gap-1.5 mt-1">
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#EBF1EA] text-[#1E542E] truncate max-w-[120px]">
                                {art.category}
                              </span>
                              <span className="text-[10px] text-[#8F7855] sm:hidden">
                                {formatDate(art.publishedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sector (hidden on small tablet) */}
                      <td className="hidden md:table-cell px-3 py-3 w-36 lg:w-44 overflow-hidden">
                        <span
                          className="px-2.5 py-1 rounded-full bg-[#EBF1EA] text-[#1E542E] text-[11px] font-medium border border-[#B7CEB4]/40 truncate block text-center"
                          title={art.category}
                        >
                          {art.category}
                        </span>
                      </td>

                      {/* Featured Toggle */}
                      <td className="hidden md:table-cell px-2 py-3 w-16 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            toggleFeatured(art.id);
                            showToast(
                              art.isFeatured
                                ? `Removed from Featured`
                                : `Marked as Featured lead`,
                              'success'
                            );
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            art.isFeatured
                              ? 'bg-amber-100 text-amber-600'
                              : 'text-[#DDD4BC] hover:text-amber-500'
                          }`}
                          title={art.isFeatured ? 'Featured on home screen (Click to unfeature)' : 'Mark as featured lead'}
                        >
                          <Star
                            className={`w-4 h-4 mx-auto ${
                              art.isFeatured ? 'fill-amber-500 text-amber-500' : ''
                            }`}
                          />
                        </button>
                      </td>

                      {/* Status Toggle Badge */}
                      <td className="px-2 sm:px-3 py-3 w-24 sm:w-28 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(art.id)}
                          className={`inline-flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold cursor-pointer transition-colors w-full ${
                            art.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title="Click to toggle published / draft"
                        >
                          <CheckCircle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{art.status.toUpperCase()}</span>
                        </button>
                      </td>

                      {/* Metrics (hidden on standard desktop) */}
                      <td className="hidden xl:table-cell px-2 py-3 w-24 text-center text-[#6F5B3C]">
                        <div className="text-[11px]">
                          <div>{art.views || 0} views</div>
                          <div className="text-[10px] text-[#8F7855]">{art.likes || 0} likes</div>
                        </div>
                      </td>

                      {/* Date (hidden on mobile) */}
                      <td className="hidden sm:table-cell px-3 py-3 w-24 text-[#8F7855] whitespace-nowrap text-[11px]">
                        {formatDate(art.publishedAt)}
                      </td>

                      {/* Actions & Expand Toggle */}
                      <td className="px-2 sm:px-3 py-3 w-24 sm:w-28 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <Link
                            to={`/article/${art.slug}`}
                            className="p-1 sm:p-1.5 text-[#54432C] hover:text-[#143520] hover:bg-[#F6F4EB] rounded-lg transition-colors"
                            title="View live article"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => onEditArticle(art.id)}
                            className="p-1 sm:p-1.5 text-[#256B3A] hover:bg-[#EBF1EA] rounded-lg transition-colors cursor-pointer"
                            title="Edit article"
                          >
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(art.id, art.title)}
                            className="p-1 sm:p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete article"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleExpand(art.id)}
                            className="p-1 sm:p-1.5 text-[#8F7855] hover:text-[#143520] hover:bg-[#EBE6D6] rounded-lg transition-colors cursor-pointer"
                            title={isExpanded ? 'Collapse row details' : 'Expand full details'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#256B3A]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Row Details (Drawer) for complete metadata without table overflow */}
                    {isExpanded && (
                      <tr className="bg-[#F6F4EB]/80 border-y border-[#DDD4BC]/60">
                        <td colSpan={7} className="p-4 sm:p-5">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            {/* URL & Direct Navigation */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#DDD4BC]">
                              <div className="font-semibold text-[#143520] flex items-center gap-1.5">
                                <ExternalLink className="w-3.5 h-3.5 text-[#256B3A]" />
                                <span>Direct Article Link</span>
                              </div>
                              <div className="flex items-center gap-2 bg-[#F6F4EB] p-2 rounded-lg font-mono text-[11px] text-[#54432C] truncate">
                                <span className="truncate flex-1">/article/{art.slug}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(art.slug)}
                                  className="text-[#256B3A] hover:text-[#143520] shrink-0 p-1"
                                  title="Copy URL"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-[#8F7855]">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {art.readingTimeMinutes} min read
                                </span>
                                <span>•</span>
                                <span>Published: {formatDate(art.publishedAt)}</span>
                              </div>
                            </div>

                            {/* Author & Taxonomy Details */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#DDD4BC]">
                              <div className="font-semibold text-[#143520] flex items-center gap-1.5">
                                <FolderTree className="w-3.5 h-3.5 text-[#256B3A]" />
                                <span>Sector & Contributor</span>
                              </div>
                              <div className="text-[11px] text-[#54432C]">
                                <span className="text-[#8F7855]">Sector:</span>{' '}
                                <span className="font-medium text-[#143520]">{art.category}</span>
                              </div>
                              <div className="text-[11px] text-[#54432C] flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#8F7855]" />
                                <span>{art.author?.name || 'Editorial Team'}{art.author?.role ? ` (${art.author.role})` : ''}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 pt-1">
                                <TagIcon className="w-3 h-3 text-[#8F7855] self-center mr-0.5" />
                                {art.tags.map(t => (
                                  <span
                                    key={t}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#F2F7F3] text-[#1E542E] border border-[#BFDC28]/30"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Metrics & Quick Controls */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#DDD4BC]">
                              <div className="font-semibold text-[#143520]">
                                Reader Engagement & Lead Feature
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-[#F6F4EB] rounded-lg">
                                  <div className="font-bold text-sm text-[#143520]">{art.views || 0}</div>
                                  <div className="text-[10px] text-[#8F7855]">Views</div>
                                </div>
                                <div className="p-2 bg-[#F6F4EB] rounded-lg">
                                  <div className="font-bold text-sm text-[#143520]">{art.likes || 0}</div>
                                  <div className="text-[10px] text-[#8F7855]">Likes</div>
                                </div>
                                <div className="p-2 bg-[#F6F4EB] rounded-lg">
                                  <div className="font-bold text-sm text-[#143520]">
                                    {art.comments?.length || 0}
                                  </div>
                                  <div className="text-[10px] text-[#8F7855]">Comments</div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  toggleFeatured(art.id);
                                  showToast(
                                    art.isFeatured
                                      ? `Removed from Featured`
                                      : `Marked as Featured lead`,
                                    'success'
                                  );
                                }}
                                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                  art.isFeatured
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-[#F6F4EB] text-[#54432C] border-[#DDD4BC] hover:bg-[#EBE6D6]'
                                }`}
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    art.isFeatured ? 'fill-amber-500 text-amber-500' : ''
                                  }`}
                                />
                                <span>
                                  {art.isFeatured
                                    ? 'Featured as Hero Lead'
                                    : 'Promote to Hero Lead'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
