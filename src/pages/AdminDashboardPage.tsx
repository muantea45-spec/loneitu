import React, { useState, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar, type AdminTab } from '../components/admin/AdminSidebar';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ArticleList } from '../components/admin/ArticleList';
import { ArticleEditor } from '../components/admin/ArticleEditor';
import { CategoryManager } from '../components/admin/CategoryManager';
import { TagManager } from '../components/admin/TagManager';
import { AuthorManager } from '../components/admin/AuthorManager';
import { RotateCcw, Download, Database, ShieldCheck, Plus, Trash2, Mail } from 'lucide-react';
import { useToast } from '../components/common/Toast';

export const AdminDashboardPage: React.FC = () => {
  const {
    isAdminLoggedIn,
    articles,
    categories,
    tags,
    resetToInitialData,
    authorizedEmails,
    addAuthorizedEmail,
    removeAuthorizedEmail,
  } = useBlog();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    document.title = 'Editorial CMS Console — Loneitu (MIZORAM TAN)';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentTab]);

  if (!isAdminLoggedIn) {
    return <AdminLoginPage />;
  }

  const handleStartNewArticle = () => {
    setEditingArticleId(null);
    setCurrentTab('new-article');
  };

  const handleEditArticle = (articleId: string) => {
    setEditingArticleId(articleId);
    setCurrentTab('edit-article');
  };

  const handleEditorSaved = () => {
    setCurrentTab('articles');
    setEditingArticleId(null);
  };

  const handleExportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      articles,
      categories,
      tags,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loneitu-database-export-${Date.now()}.json`;
    a.click();
    showToast('Database export downloaded!', 'success');
  };

  const handleResetSeed = () => {
    if (window.confirm('Reset all articles, categories, and tags back to original pristine demonstration seed data?')) {
      resetToInitialData();
      showToast('System reset to original demo seed dataset!', 'info');
      setCurrentTab('overview');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF8] flex flex-col">
      <AdminHeader />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row min-w-0 overflow-x-hidden">
        {/* Sidebar */}
        <AdminSidebar
          currentTab={currentTab}
          onSelectTab={tab => {
            if (tab === 'new-article') {
              setEditingArticleId(null);
            }
            setCurrentTab(tab);
          }}
          articlesCount={articles.length}
        />

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {currentTab === 'overview' && (
            <DashboardOverview
              onNewArticle={handleStartNewArticle}
              onEditArticle={handleEditArticle}
              onViewArticles={() => setCurrentTab('articles')}
            />
          )}

          {currentTab === 'articles' && (
            <ArticleList
              onNewArticle={handleStartNewArticle}
              onEditArticle={handleEditArticle}
            />
          )}

          {(currentTab === 'new-article' || currentTab === 'edit-article') && (
            <ArticleEditor
              articleId={editingArticleId}
              onSaved={handleEditorSaved}
              onCancel={() => setCurrentTab('articles')}
            />
          )}

          {currentTab === 'categories' && <CategoryManager />}

          {currentTab === 'tags' && <TagManager />}

          {currentTab === 'authors' && <AuthorManager />}

          {currentTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-[#DDD4BC] shadow-xs p-8 max-w-2xl space-y-6">
              <div>
                <h2 className="font-serif font-bold text-2xl text-[#143520]">
                  Admin Console Settings & Security
                </h2>
                <p className="text-xs text-[#8F7855] mt-0.5">
                  Manage administrator access whitelists, database snapshots, and demo datasets
                </p>
              </div>

              {/* Authorized Admin Emails Whitelist */}
              <div className="p-5 bg-white rounded-2xl border border-[#DDD4BC] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#143520]">
                  <ShieldCheck className="w-5 h-5 text-[#256B3A]" />
                  <span>Authorized Administrator Gmail Accounts (Access Whitelist)</span>
                </div>
                <p className="text-xs text-[#6F5B3C] leading-relaxed">
                  Only the specific Gmail addresses listed here are permitted to log in at <code className="bg-[#F6F4EB] px-1.5 py-0.5 rounded text-[11px] font-mono text-[#143520]">loneitu.pages.dev/admin</code>. Any unlisted email is strictly blocked with an Access Denied error.
                </p>

                {/* Whitelist items */}
                <div className="divide-y divide-[#F6F4EB] border border-[#EBE6D6] rounded-xl overflow-hidden">
                  {authorizedEmails.map(email => {
                    const isPrimary = email.toLowerCase() === 'muantea45@gmail.com';
                    return (
                      <div key={email} className="flex items-center justify-between p-3 bg-white hover:bg-[#FBFBF8] text-xs">
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-3.5 h-3.5 text-[#256B3A]" />
                          <span className="font-mono text-[#143520] font-semibold">{email}</span>
                          {isPrimary && (
                            <span className="px-2 py-0.5 rounded-full bg-[#BFDC28]/40 text-[#143520] text-[10px] font-bold">
                              Primary Owner
                            </span>
                          )}
                        </div>
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => {
                              removeAuthorizedEmail(email);
                              showToast(`Removed ${email} from authorized whitelist`, 'info');
                            }}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remove authorization"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add new email input */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
                      showToast('Please enter a valid Gmail address', 'error');
                      return;
                    }
                    const ok = addAuthorizedEmail(newAdminEmail);
                    if (ok) {
                      showToast(`Added ${newAdminEmail} to authorized admin whitelist!`, 'success');
                      setNewAdminEmail('');
                    } else {
                      showToast('Email is already on the whitelist or invalid', 'error');
                    }
                  }}
                  className="flex gap-2 pt-1"
                >
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={e => setNewAdminEmail(e.target.value)}
                    placeholder="Add trusted Gmail (e.g., coeditor@gmail.com)"
                    className="flex-1 px-3.5 py-2 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden focus:border-[#256B3A]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#BFDC28]" />
                    <span>Authorize</span>
                  </button>
                </form>
              </div>

              {/* Reset to Seed Data */}
              <div className="p-5 bg-[#F6F4EB] rounded-2xl border border-[#DDD4BC] space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#143520]">
                  <RotateCcw className="w-4 h-4 text-[#C2623D]" />
                  <span>Restore Demonstration Seed Data</span>
                </div>
                <p className="text-xs text-[#6F5B3C] leading-relaxed">
                  Restores the full suite of peer-reviewed demonstration articles, sector categories, tags, and sample field comments back to default initial values.
                </p>
                <button
                  onClick={handleResetSeed}
                  className="px-4 py-2.5 rounded-xl bg-[#C2623D] hover:bg-[#A84C2A] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset Everything to Seed Data
                </button>
              </div>

              {/* Export JSON */}
              <div className="p-5 bg-[#F2F7F3] rounded-2xl border border-[#B7CEB4] space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#143520]">
                  <Download className="w-4 h-4 text-[#256B3A]" />
                  <span>Export Database JSON Snapshot</span>
                </div>
                <p className="text-xs text-[#4A584E] leading-relaxed">
                  Download a complete JSON export of all currently authored articles, categories, practice tags, and reader engagement metrics.
                </p>
                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-[#BFDC28]" />
                  <span>Download .json Backup</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
