import React from 'react';
import { FileText, Eye, FolderTree, Tags, Plus, CheckCircle, Edit3 } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { formatDate } from '../../utils/formatDate';

interface DashboardOverviewProps {
  onNewArticle: () => void;
  onEditArticle: (articleId: string) => void;
  onViewArticles: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNewArticle,
  onEditArticle,
  onViewArticles,
}) => {
  const { articles, categories, tags } = useBlog();

  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalLikes = articles.reduce((sum, a) => sum + (a.likes || 0), 0);

  const stats = [
    {
      title: 'Total Articles',
      value: articles.length,
      subtext: `${publishedCount} published · ${draftCount} drafts`,
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Taxonomy Sectors',
      value: categories.length,
      subtext: 'Active agricultural domains',
      icon: FolderTree,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Agronomic Tags',
      value: tags.length,
      subtext: 'Cross-cutting practice tags',
      icon: Tags,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      title: 'Field Readership',
      value: totalViews.toLocaleString(),
      subtext: `${totalLikes} research applauds`,
      icon: Eye,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#143520] to-[#1E542E] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-[#256B3A]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#BFDC28]">
            Agronomic Editorial Desk
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
            Loneitu CMS Console — MIZORAM TAN
          </h2>
          <p className="text-xs sm:text-sm text-[#D7E3D5] mt-1 max-w-xl">
            Draft, publish, and curate research papers, field trials, and rural agronomy case studies directly to the live publication.
          </p>
        </div>
        <button
          onClick={onNewArticle}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#BFDC28] text-[#143520] font-bold text-xs sm:text-sm hover:bg-[#d5f33d] transition-colors shrink-0 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-[#DDD4BC] shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-[#8F7855] font-medium">{s.title}</p>
                <h3 className="font-serif font-bold text-2xl text-[#143520] mt-1">
                  {s.value}
                </h3>
                <p className="text-[11px] text-[#6F5B3C] mt-1">{s.subtext}</p>
              </div>
              <div className={`p-3 rounded-xl border ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Articles Table Preview */}
      <div className="bg-white rounded-2xl border border-[#DDD4BC] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#EBE6D6] flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#143520]">
              Recent Articles & Field Notes
            </h3>
            <p className="text-xs text-[#8F7855]">
              Latest updates in the editorial publication queue
            </p>
          </div>
          <button
            onClick={onViewArticles}
            className="text-xs font-semibold text-[#256B3A] hover:underline"
          >
            View All ({articles.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F4EB] text-[#6F5B3C] uppercase text-[10px] tracking-wider border-b border-[#EBE6D6]">
              <tr>
                <th className="px-5 py-3">Article Title</th>
                <th className="px-5 py-3">Sector</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Author</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F4EB]">
              {articles.slice(0, 5).map(art => (
                <tr key={art.id} className="hover:bg-[#FBFBF8] transition-colors">
                  <td className="px-5 py-3.5 font-medium text-[#13341D] max-w-xs truncate">
                    <div className="flex items-center gap-2">
                      {art.isFeatured && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#BFDC28]/40 text-[#143520]">
                          Featured
                        </span>
                      )}
                      <span className="truncate">{art.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#54432C]">
                    <span className="px-2 py-0.5 rounded-full bg-[#EBF1EA] text-[#1E542E] text-[11px] font-medium">
                      {art.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        art.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {art.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#54432C]">
                    {art.author?.name || 'Editorial Team'}
                  </td>
                  <td className="px-5 py-3.5 text-[#8F7855]">
                    {formatDate(art.publishedAt)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => onEditArticle(art.id)}
                      className="p-1.5 text-[#256B3A] hover:bg-[#EBF1EA] rounded-lg transition-colors inline-flex items-center gap-1 font-medium"
                      title="Edit article"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
