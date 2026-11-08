import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { AboutEditor } from '../components/admin/AboutEditor';
import { FooterEditor } from '../components/admin/FooterEditor';
import { FarmerManager } from '../components/admin/FarmerManager';
import { RotateCcw, Download, Upload, Database, ShieldCheck, Plus, Trash2, Mail, Crown, Lock, KeyRound, Cloud, RefreshCw } from 'lucide-react';
import { useToast } from '../components/common/Toast';

export const AdminDashboardPage: React.FC = () => {
  const {
    isAdminLoggedIn,
    articles,
    categories,
    tags,
    authors,
    farmers,
    farmerCustomFields,
    resetToInitialData,
    restoreFullDatabase,
    authorizedEmails,
    primaryOwnerEmail,
    setPrimaryOwnerEmail,
    addAuthorizedEmail,
    removeAuthorizedEmail,
    adminSecurityKey,
    setAdminSecurityKey,
    googleClientId,
    setGoogleClientId,
    aboutData,
    footerData,
    isCloudSyncing,
    cloudSyncStatus,
    pushToCloudDatabase,
  } = useBlog();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as AdminTab | null;
  const validTabs: AdminTab[] = ['overview', 'articles', 'new-article', 'edit-article', 'farmers', 'categories', 'tags', 'authors', 'about', 'footer', 'settings'];

  const [currentTab, setCurrentTab] = useState<AdminTab>(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return 'overview';
  });

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== currentTab) {
      setCurrentTab(tabParam);
    }
  }, [tabParam]);

  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [makePrimaryImmediately, setMakePrimaryImmediately] = useState(false);
  const [securityKeyDraft, setSecurityKeyDraft] = useState('');
  const [googleClientIdDraft, setGoogleClientIdDraft] = useState('');

  useEffect(() => {
    setSecurityKeyDraft(adminSecurityKey);
    setGoogleClientIdDraft(googleClientId);
  }, [adminSecurityKey, googleClientId]);

  useEffect(() => {
    document.title = 'Editorial CMS Console — Loneitu (MIZORAM TAN)';
    try {
      window.scrollTo(0, 0);
    } catch {}
  }, [currentTab]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      platform: 'Loneitu (MIZORAM TAN)',
      data: {
        articles,
        categories,
        tags,
        authors,
        aboutData,
        footerData,
        farmers,
        farmerCustomFields,
        authorizedEmails,
        primaryOwnerEmail,
        adminSecurityKey,
      },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loneitu-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Full database snapshot downloaded!', 'success');
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const payload = parsed.data || parsed;

      if (!Array.isArray(payload.articles) || !Array.isArray(payload.categories)) {
        showToast('Invalid backup file. Missing articles or categories data.', 'error');
        return;
      }

      if (
        window.confirm(
          `Restore database from backup? This will replace your current articles (${articles.length} items) with the backup (${payload.articles.length} items) and sync across all devices.`
        )
      ) {
        const ok = await restoreFullDatabase(parsed);
        if (ok) {
          showToast('Database successfully restored and synced to cloud!', 'success');
        } else {
          showToast('Failed to restore database from backup.', 'error');
        }
      }
    } catch {
      showToast('Error reading backup JSON file.', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
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
          farmersCount={farmers.length}
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

          {currentTab === 'farmers' && <FarmerManager />}

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

          {currentTab === 'about' && <AboutEditor />}

          {currentTab === 'footer' && <FooterEditor />}

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

              {/* Multi-Device Cloud Database Sync Card */}
              <div className="p-5 bg-[#F2F7F3] rounded-2xl border border-[#B7CEB4] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#143520]">
                    <Cloud className="w-5 h-5 text-[#256B3A]" />
                    <span>Multi-Device Database Synchronization</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    cloudSyncStatus === 'synced'
                      ? 'bg-[#143520] text-[#BFDC28]'
                      : 'bg-[#C2623D]/20 text-[#A84C2A]'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {cloudSyncStatus === 'synced' ? 'Live Cloud Synced' : 'Ready to Sync'}
                  </span>
                </div>
                <p className="text-xs text-[#4A584E] leading-relaxed">
                  Automatically syncs your administrator whitelist, primary owner, and articles between your Desktop PC and Mobile Phone. Clicking <strong>Sync to Cloud</strong> commits all changes to the central Cloudflare database so your mobile phone can log in immediately.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={isCloudSyncing}
                    onClick={async () => {
                      await pushToCloudDatabase();
                      showToast('Database successfully synced to cloud! Mobile phone can now sign in.', 'success');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#BFDC28] ${isCloudSyncing ? 'animate-spin' : ''}`} />
                    <span>{isCloudSyncing ? 'Syncing...' : 'Sync Database to Cloud Now'}</span>
                  </button>
                </div>
              </div>

              {/* Authorized Admin Emails Whitelist */}
              <div className="p-5 bg-white rounded-2xl border border-[#DDD4BC] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#143520]">
                  <ShieldCheck className="w-5 h-5 text-[#256B3A]" />
                  <span>Authorized Administrator Gmail Accounts (Access Whitelist)</span>
                </div>
                <p className="text-xs text-[#6F5B3C] leading-relaxed">
                  Only the specific Gmail addresses listed here are permitted to log in at <code className="bg-[#F6F4EB] px-1.5 py-0.5 rounded text-[11px] font-mono text-[#143520]">{typeof window !== 'undefined' ? `${window.location.host}/admin` : 'loneitu.pages.dev/admin'}</code>. Any unlisted email is strictly blocked with an Access Denied error.
                </p>

                {/* Whitelist items */}
                <div className="divide-y divide-[#EBE6D6] border border-[#DDD4BC] rounded-xl overflow-hidden bg-white shadow-xs">
                  {authorizedEmails.map(email => {
                    const safePrimary = (primaryOwnerEmail || 'muantea45@gmail.com').toLowerCase();
                    const isPrimary = (email || '').toLowerCase() === safePrimary;
                    return (
                      <div key={email} className="flex items-center justify-between p-3.5 bg-white hover:bg-[#FBFBF8] text-xs transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Mail className="w-4 h-4 text-[#256B3A] shrink-0" />
                          <span className="font-mono text-[#143520] font-semibold truncate">{email}</span>
                          {isPrimary && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#BFDC28]/40 border border-[#BFDC28] text-[#143520] text-[10px] font-bold flex items-center gap-1 shrink-0">
                              <Crown className="w-3 h-3 text-[#54432C]" />
                              Primary Owner
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => {
                                setPrimaryOwnerEmail(email);
                                showToast(`Promoted ${email} to Primary Owner!`, 'success');
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#143520] bg-[#F2F7F3] hover:bg-[#E2EDE3] border border-[#B7CEB4] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Transfer Primary Ownership to this account"
                            >
                              <Crown className="w-3 h-3 text-[#C2623D]" />
                              <span>Make Primary Owner</span>
                            </button>
                          )}
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => {
                                const ok = removeAuthorizedEmail(email);
                                if (ok) {
                                  showToast(`Removed ${email} from authorized whitelist`, 'info');
                                } else {
                                  showToast('Cannot remove the Primary Owner', 'error');
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove authorization"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
                    const emailToAdd = newAdminEmail.trim().toLowerCase();
                    const ok = addAuthorizedEmail(emailToAdd);
                    if (ok || authorizedEmails.some(x => x.toLowerCase() === emailToAdd)) {
                      if (makePrimaryImmediately) {
                        setPrimaryOwnerEmail(emailToAdd);
                        showToast(`Authorized ${emailToAdd} and assigned as Primary Owner!`, 'success');
                      } else {
                        showToast(`Added ${emailToAdd} to authorized admin whitelist!`, 'success');
                      }
                      setNewAdminEmail('');
                      setMakePrimaryImmediately(false);
                    } else {
                      showToast('Email is already on the whitelist or invalid', 'error');
                    }
                  }}
                  className="space-y-2 pt-1"
                >
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={e => setNewAdminEmail(e.target.value)}
                      placeholder="Add trusted Gmail (e.g., coeditor@gmail.com)"
                      className="flex-1 px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden focus:border-[#256B3A]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#BFDC28]" />
                      <span>Authorize</span>
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-[#54432C] cursor-pointer select-none pl-1">
                    <input
                      type="checkbox"
                      checked={makePrimaryImmediately}
                      onChange={e => setMakePrimaryImmediately(e.target.checked)}
                      className="rounded text-[#256B3A] focus:ring-[#256B3A] border-[#DDD4BC]"
                    />
                    <span>Also assign as Primary Owner immediately</span>
                  </label>
                </form>
              </div>

              {/* Owner Security Passkey (2FA Key) Settings */}
              <div className="p-5 bg-white rounded-2xl border border-[#DDD4BC] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#143520]">
                  <KeyRound className="w-5 h-5 text-[#256B3A]" />
                  <span>Owner Secret Passkey (Two-Factor Protection)</span>
                </div>
                <p className="text-xs text-[#6F5B3C] leading-relaxed">
                  This secret key stops anyone who simply knows your Gmail address from logging in. To access the admin console, an editor must supply both their authorized Gmail and this secret passkey.
                </p>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!securityKeyDraft.trim()) {
                      showToast('Security key cannot be empty', 'error');
                      return;
                    }
                    setAdminSecurityKey(securityKeyDraft.trim());
                    showToast('Owner Secret Passkey updated successfully!', 'success');
                  }}
                  className="space-y-3"
                >
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F7855]" />
                      <input
                        type="text"
                        value={securityKeyDraft}
                        onChange={e => setSecurityKeyDraft(e.target.value)}
                        placeholder="Set strong secret passkey"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-mono text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden focus:border-[#256B3A]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Save Passkey
                    </button>
                  </div>
                </form>
              </div>

              {/* Google OAuth 2.0 Integration (Real Phone 2FA) */}
              <div className="p-5 bg-white rounded-2xl border border-[#DDD4BC] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#143520]">
                  {/* Google SVG */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google Cloud OAuth 2.0 (Real Google Sign-In with Phone 2FA)</span>
                </div>
                <p className="text-xs text-[#6F5B3C] leading-relaxed">
                  Connecting a free Google OAuth Client ID unlocks genuine Google Sign-In: Google will prompt for your real Google Account password and send an authentication notification directly to your phone.
                </p>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    setGoogleClientId(googleClientIdDraft.trim());
                    showToast('Google OAuth Client ID saved!', 'success');
                  }}
                  className="space-y-3"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={googleClientIdDraft}
                      onChange={e => setGoogleClientIdDraft(e.target.value)}
                      placeholder="e.g., 123456789-abc.apps.googleusercontent.com"
                      className="flex-1 px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-mono text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden focus:border-[#256B3A]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Save Client ID
                    </button>
                  </div>
                </form>

                <div className="p-3 bg-[#F2F7F3] rounded-xl border border-[#B7CEB4] text-[11px] text-[#4A584E] space-y-1">
                  <div className="font-semibold text-[#143520]">Quick 2-minute setup:</div>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-[#256B3A] underline font-medium">Google Cloud Console &rarr; Credentials</a>.</li>
                    <li>Click <strong>Create Credentials &rarr; OAuth Client ID</strong> (Application type: <em>Web application</em>).</li>
                    <li>Under <em>Authorized JavaScript origins</em>, add: <code className="bg-white px-1 py-0.5 rounded border border-[#DDD4BC]">https://loneitu.pages.dev</code>.</li>
                    <li>Under <em>Authorized redirect URIs</em>, add: <code className="bg-white px-1 py-0.5 rounded border border-[#DDD4BC]">https://loneitu.pages.dev</code>.</li>
                    <li>Copy your generated Client ID and paste it here!</li>
                  </ol>
                </div>
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

              {/* Database Snapshot & Disaster Recovery */}
              <div className="p-5 bg-white rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#143520]">
                    <Database className="w-5 h-5 text-[#256B3A]" />
                    <span>Database Snapshot & Disaster Recovery</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EBF1EA] text-[#256B3A]">
                    {articles.length} articles • {categories.length} sectors
                  </span>
                </div>
                <p className="text-xs text-[#6F5B3C] leading-relaxed">
                  Download a complete, self-contained JSON snapshot of all authored articles, full markdown texts, images, sector categories, tags, agronomist authors, and admin access whitelists. You can upload and restore this file at any time to recover accidentally deleted content.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="px-4 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4 text-[#BFDC28]" />
                    <span>Download Full Backup (.json)</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleRestoreFile}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#143520] border border-[#DDD4BC] text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-4 h-4 text-[#256B3A]" />
                    <span>Restore from Backup (.json)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
