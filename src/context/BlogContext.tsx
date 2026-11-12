import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Article, Category, Tag, Author, FilterState, SortOption, Comment, AboutPageData, FooterData } from '../types/blog';
import type { FarmerRecord, FarmerFieldDefinition } from '../types/farmer';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_TAGS, INITIAL_AUTHORS, INITIAL_ABOUT_DATA, INITIAL_FOOTER_DATA, DEFAULT_COMPANY_BANNER } from '../data/initialData';
import { INITIAL_FARMERS } from '../data/initialFarmers';
import { DEFAULT_ADMIN_KEY, DEFAULT_AUTHORIZED_EMAILS, GOOGLE_CLIENT_ID, isDefaultAuthorizedEmail, parseGoogleJwtCredential } from '../config/authConfig';
import { slugify } from '../utils/slugify';
import { calculateReadingTime } from '../utils/readingTime';
import { cleanTextExcerpt } from '../utils/shareUtils';

interface BlogContextType {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  bookmarks: string[];
  likedArticles: string[];
  filterState: FilterState;
  isAdminLoggedIn: boolean;
  adminEmail: string | null;
  primaryOwnerEmail: string;
  authorizedEmails: string[];
  authors: Author[];
  aboutData: AboutPageData;
  updateAboutData: (updates: Partial<AboutPageData>) => void;
  footerData: FooterData;
  updateFooterData: (updates: Partial<FooterData>) => void;
  adminSecurityKey: string;
  googleClientId: string;
  isCloudSyncing: boolean;
  cloudSyncStatus: 'idle' | 'synced' | 'error';
  pushToCloudDatabase: (overrideData?: any) => Promise<void>;

  // Farmer Registry actions
  farmers: FarmerRecord[];
  farmerCustomFields: FarmerFieldDefinition[];
  addFarmer: (data: Partial<FarmerRecord> & { fullName: string }) => FarmerRecord;
  updateFarmer: (id: string, updates: Partial<FarmerRecord>) => void;
  deleteFarmer: (id: string) => void;
  wipeAllFarmers: () => void;
  batchImportFarmers: (records: FarmerRecord[]) => { count: number };
  renameColumn: (oldCol: string, newCol: string) => void;
  deleteColumn: (colName: string) => void;
  addColumn: (newCol: string) => void;
  addFarmerCustomField: (field: FarmerFieldDefinition) => void;
  deleteFarmerCustomField: (key: string) => void;

  // Auth actions
  loginAdminWithGmail: (email: string) => boolean;
  verifyAndLoginAdmin: (email: string, passkey: string) => { ok: boolean; error?: string };
  verifyAndLoginWithGoogleJwt: (jwtToken: string) => { ok: boolean; email?: string; error?: string };
  setAdminSecurityKey: (newKey: string) => void;
  setGoogleClientId: (clientId: string) => void;
  setPrimaryOwnerEmail: (email: string) => void;
  addAuthorizedEmail: (email: string) => boolean;
  removeAuthorizedEmail: (email: string) => boolean;
  isAuthorizedEmail: (email: string) => boolean;
  checkAndRefreshAuthorization: (email: string) => Promise<boolean>;

  // Article CRUD & Actions
  addArticle: (data: Partial<Article> & { title: string; content: string; category: string }) => Article;
  batchAddArticles: (items: Array<Partial<Article> & { title: string; content: string; category: string }>) => { count: number; articles: Article[] };
  updateArticle: (id: string, updates: Partial<Article>) => void;
  bulkUpdateArticleViews: (updates: Array<{ id: string; views: number }>) => number;
  deleteArticle: (id: string) => void;
  toggleFeatured: (id: string) => void;
  toggleStatus: (id: string) => void;
  incrementViews: (id: string) => void;
  toggleLike: (id: string) => void;
  toggleBookmark: (id: string) => void;
  addComment: (articleId: string, commentData: { authorName: string; authorRole?: string; content: string }) => void;

  // Taxonomy actions
  addCategory: (cat: { name: string; description: string; color?: string; icon?: string; slug?: string }) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addTag: (tag: { name: string; description?: string; slug?: string }) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  // Author actions
  addAuthor: (author: Omit<Author, 'id'>) => Author;
  updateAuthor: (id: string, updates: Partial<Author>) => void;
  deleteAuthor: (id: string) => void;

  // Filter & Search controls
  setFilterCategory: (categorySlug: string) => void;
  setFilterTag: (tagSlug: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  clearFilters: () => void;

  // Admin auth
  loginAdmin: (pass: string) => boolean;
  logoutAdmin: () => void;

  // Maintenance & Cloud utilities
  fetchCloudDb: () => Promise<void>;
  resetToInitialData: () => void;
  restoreFullDatabase: (backupData: any) => Promise<boolean>;
  uploadImage: (dataUrl: string, filename?: string) => Promise<string>;
  filteredArticles: Article[];
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ARTICLES: 'loneitu_mizo_articles_v3',
  CATEGORIES: 'loneitu_mizo_categories_v2',
  TAGS: 'loneitu_mizo_tags_v2',
  AUTHORS: 'loneitu_mizo_authors_v2',
  BOOKMARKS: 'loneitu_bookmarks_v2',
  LIKES: 'loneitu_likes_v2',
  ADMIN_AUTH: 'loneitu_admin_auth_v1',
  ADMIN_EMAIL: 'loneitu_admin_email_v1',
  AUTHORIZED_EMAILS: 'loneitu_authorized_admin_emails_v1',
  PRIMARY_OWNER: 'loneitu_primary_owner_email_v1',
  SECURITY_KEY: 'loneitu_admin_security_key_v2',
  GOOGLE_CLIENT_ID: 'loneitu_google_client_id_v2',
  ABOUT_PAGE: 'loneitu_mizo_about_page_v1',
  FOOTER: 'loneitu_mizo_footer_v1',
  FARMERS: 'loneitu_mizo_farmers_v2',
  FARMER_CUSTOM_FIELDS: 'loneitu_farmer_custom_fields_v1',
};

const CLOUD_API_ENDPOINTS = [
  '/api/db',
  'https://loneitu.ddvktp.workers.dev/api/db',
];

const ARTICLE_VIEWS_ENDPOINTS = [
  '/api/article-views',
  'https://loneitu.ddvktp.workers.dev/api/article-views',
];

function broadcastLocalChange(type: string, payload: any) {
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel('loneitu_live_bus');
      channel.postMessage({ type, payload, timestamp: Date.now() });
      channel.close();
    } catch { }
  }
}

async function fetchDatabaseMeta(): Promise<{ updatedAt?: string; featuredId?: string | null; cardCount?: number; timestamp?: number } | null> {
  const t = Date.now();
  for (const endpoint of CLOUD_API_ENDPOINTS) {
    try {
      const url = `${endpoint}?meta=1&_cb=${t}`;
      const res = await fetch(url, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && (json.meta || json.updatedAt)) {
          return json.meta || { updatedAt: json.updatedAt };
        }
      }
    } catch {
      // try fallback endpoint
    }
  }
  return null;
}

async function fetchRemotePublicDatabase(bypassCache = false): Promise<any> {
  const query = bypassCache ? `?scope=public&_cb=${Date.now()}` : '?scope=public';
  for (const endpoint of CLOUD_API_ENDPOINTS) {
    try {
      const url = `${endpoint}${query}`;
      const res = await fetch(url, {
        cache: bypassCache ? 'no-store' : 'default',
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const json = await res.json();
        if (json && json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // try fallback endpoint
    }
  }
  return null;
}

async function fetchRemoteFarmersDatabase(authInfo?: { key?: string; email?: string }): Promise<any> {
  const key = authInfo?.key || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SECURITY_KEY) : null) || '';
  const email = authInfo?.email || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL) : null) || '';
  const headers: Record<string, string> = {};
  if (key) headers['X-Admin-Key'] = key;
  if (email) headers['X-Admin-Email'] = email;

  const t = Date.now();
  for (const endpoint of CLOUD_API_ENDPOINTS) {
    try {
      const url = `${endpoint}?scope=farmers&_cb=${t}`;
      const res = await fetch(url, {
        cache: 'no-store',
        headers,
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const json = await res.json();
        if (json && json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // try fallback endpoint
    }
  }
  return null;
}

async function fetchRemoteDatabase(bypassCache = false): Promise<any> {
  return fetchRemotePublicDatabase(bypassCache);
}

async function syncExactArticleViewsToCloud(
  updates: Array<{ id: string; views: number }>,
  authInfo?: { key?: string; email?: string }
): Promise<void> {
  if (!updates || updates.length === 0) return;
  const key = authInfo?.key || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SECURITY_KEY) : null) || '';
  const email = authInfo?.email || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL) : null) || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) headers['X-Admin-Key'] = key;
  if (email) headers['X-Admin-Email'] = email;

  for (const endpoint of ARTICLE_VIEWS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ setExact: true, updates }),
      });
      if (res.ok) return;
    } catch { }
  }
}

async function saveRemoteDatabase(payload: any, authInfo?: { key?: string; email?: string }): Promise<boolean> {
  const t = Date.now();
  let saved = false;

  const key = authInfo?.key || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SECURITY_KEY) : null) || '';
  const email = authInfo?.email || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL) : null) || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (key) headers['X-Admin-Key'] = key;
  if (email) headers['X-Admin-Email'] = email;

  for (const endpoint of CLOUD_API_ENDPOINTS) {
    try {
      const url = `${endpoint}?_cb=${t}`;
      const res = await fetch(url, {
        method: 'POST',
        cache: 'no-store',
        headers,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        saved = true;
        break;
      }
    } catch {
      // try fallback endpoint
    }
  }
  return saved;
}

const UPLOAD_API_ENDPOINTS = [
  'https://loneitu.ddvktp.workers.dev/api/upload',
  '/api/upload',
];

async function uploadImageToCloud(dataUrl: string, filename?: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    return dataUrl;
  }
  for (const endpoint of UPLOAD_API_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.url) {
          const resolved = json.url.startsWith('http')
            ? json.url
            : `https://loneitu.ddvktp.workers.dev${json.url}`;
          return resolved;
        }
      }
    } catch {
      // try next endpoint
    }
  }
  return dataUrl;
}

function sanitizeViewsCount(views: unknown, fallback = 1): number {
  if (typeof views === 'number' && Number.isFinite(views) && views >= 0) {
    return Math.floor(views);
  }
  return fallback;
}

function normalizeArticleExcerpts(items: Article[]): Article[] {
  if (!Array.isArray(items)) return [];
  return items.map(a => {
    const raw = (a.excerpt || '').trim();
    if (!raw || raw.includes('<') || raw.toLowerCase().startsWith('div') || raw.toLowerCase().startsWith('<div')) {
      return { ...a, excerpt: cleanTextExcerpt(a.excerpt || a.content, 160) };
    }
    return a;
  });
}

export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial states from localStorage with graceful fallback
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      return stored ? normalizeArticleExcerpts(JSON.parse(stored)) : normalizeArticleExcerpts(INITIAL_ARTICLES);
    } catch {
      return normalizeArticleExcerpts(INITIAL_ARTICLES);
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return stored ? JSON.parse(stored) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [tags, setTags] = useState<Tag[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TAGS);
      return stored ? JSON.parse(stored) : INITIAL_TAGS;
    } catch {
      return INITIAL_TAGS;
    }
  });

  const [authors, setAuthors] = useState<Author[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTHORS);
      return stored ? JSON.parse(stored) : INITIAL_AUTHORS;
    } catch {
      return INITIAL_AUTHORS;
    }
  });

  const [aboutData, setAboutData] = useState<AboutPageData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ABOUT_PAGE);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...INITIAL_ABOUT_DATA,
          ...parsed,
          companyBanner: parsed.companyBanner
            ? { ...DEFAULT_COMPANY_BANNER, ...parsed.companyBanner }
            : DEFAULT_COMPANY_BANNER,
        };
      }
      return INITIAL_ABOUT_DATA;
    } catch {
      return INITIAL_ABOUT_DATA;
    }
  });

  const [footerData, setFooterData] = useState<FooterData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FOOTER);
      return stored ? JSON.parse(stored) : INITIAL_FOOTER_DATA;
    } catch {
      return INITIAL_FOOTER_DATA;
    }
  });

  const cleanFarmerAvatars = (list: FarmerRecord[]): FarmerRecord[] => {
    return list.map(f => ({
      ...f,
      avatar: (f.avatar && !f.avatar.includes('unsplash.com')) ? f.avatar : ''
    }));
  };

  const [farmers, setFarmers] = useState<FarmerRecord[]>(() => {
    try {
      // Public readers never hold the 3.16 MB farmer registry in localStorage
      if (localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) !== 'true') {
        localStorage.removeItem(STORAGE_KEYS.FARMERS);
        return [];
      }
      const stored = localStorage.getItem(STORAGE_KEYS.FARMERS);
      const parsed = stored ? JSON.parse(stored) : INITIAL_FARMERS;
      return Array.isArray(parsed) ? cleanFarmerAvatars(parsed) : [];
    } catch {
      return [];
    }
  });

  const [farmerCustomFields, setFarmerCustomFields] = useState<FarmerFieldDefinition[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FARMER_CUSTOM_FIELDS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [likedArticles, setLikedArticles] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LIKES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [filterState, setFilterState] = useState<FilterState>({
    category: 'all',
    tag: 'all',
    searchQuery: '',
    sortBy: 'newest',
  });

  // Sync to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    } catch (e) {
      console.error('Failed to sync articles', e);
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to sync categories', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    } catch (e) {
      console.error('Failed to sync tags', e);
    }
  }, [tags]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(authors));
    } catch (e) {
      console.error('Failed to sync authors', e);
    }
  }, [authors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ABOUT_PAGE, JSON.stringify(aboutData));
    } catch (e) {
      console.error('Failed to sync about data locally', e);
    }
  }, [aboutData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOOTER, JSON.stringify(footerData));
    } catch (e) {
      console.error('Failed to sync footer data locally', e);
    }
  }, [footerData]);

  useEffect(() => {
    try {
      if (isAdminLoggedIn) {
        localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
      }
    } catch (e) {
      console.error('Failed to sync farmers locally', e);
    }
  }, [farmers, isAdminLoggedIn]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FARMER_CUSTOM_FIELDS, JSON.stringify(farmerCustomFields));
    } catch (e) {
      console.error('Failed to sync farmer custom fields locally', e);
    }
  }, [farmerCustomFields]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to sync bookmarks', e);
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likedArticles));
    } catch (e) {
      console.error('Failed to sync likes', e);
    }
  }, [likedArticles]);

  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, isAdminLoggedIn ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to sync auth', e);
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    try {
      if (adminEmail) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, adminEmail);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_EMAIL);
      }
    } catch (e) {
      console.error('Failed to sync admin email', e);
    }
  }, [adminEmail]);

  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'synced' | 'error'>('idle');

  const [primaryOwnerEmail, setPrimaryOwnerEmailState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PRIMARY_OWNER) || 'muantea45@gmail.com';
    } catch {
      return 'muantea45@gmail.com';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRIMARY_OWNER, primaryOwnerEmail);
    } catch (e) {
      console.error('Failed to sync primary owner email', e);
    }
  }, [primaryOwnerEmail]);

  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTHORIZED_EMAILS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = parsed.map((e: string) => e.trim().toLowerCase()).filter(Boolean);
          DEFAULT_AUTHORIZED_EMAILS.forEach(def => {
            const defNorm = def.trim().toLowerCase();
            if (!list.includes(defNorm)) {
              list.push(defNorm);
            }
          });
          return list;
        }
      }
      return DEFAULT_AUTHORIZED_EMAILS.map(e => e.trim().toLowerCase());
    } catch {
      return DEFAULT_AUTHORIZED_EMAILS.map(e => e.trim().toLowerCase());
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTHORIZED_EMAILS, JSON.stringify(authorizedEmails));
    } catch (e) {
      console.error('Failed to sync authorized emails', e);
    }
  }, [authorizedEmails]);

  const [adminSecurityKey, setAdminSecurityKeyState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SECURITY_KEY) || DEFAULT_ADMIN_KEY;
    } catch {
      return DEFAULT_ADMIN_KEY;
    }
  });

  // Track the exact timestamp of local mutations to prevent race-condition overwrites
  const lastMutationTimeRef = useRef<number>(0);
  const lastKnownRemoteUpdatedAtRef = useRef<string>('');

  // Reference tracking latest state to prevent stale closures during cloud sync
  const latestDbStateRef = useRef({
    authorizedEmails,
    primaryOwnerEmail,
    adminSecurityKey,
    articles,
    categories,
    tags,
    authors,
    aboutData,
    footerData,
    farmers,
    farmerCustomFields,
  });

  useEffect(() => {
    latestDbStateRef.current = {
      authorizedEmails,
      primaryOwnerEmail,
      adminSecurityKey,
      articles,
      categories,
      tags,
      authors,
      aboutData,
      footerData,
      farmers,
      farmerCustomFields,
    };
  }, [authorizedEmails, primaryOwnerEmail, adminSecurityKey, articles, categories, tags, authors, aboutData, footerData, farmers, farmerCustomFields]);

  const lastPublicSyncTimeRef = useRef<number>(0);

  // Pull farmers registry only when an admin session is active
  const fetchFarmersDb = async () => {
    if (!isAdminLoggedIn) return;
    try {
      const farmersData = await fetchRemoteFarmersDatabase();
      if (!farmersData) return;

      if (Date.now() - lastMutationTimeRef.current < 2500) {
        return;
      }

      if (Array.isArray(farmersData.farmers)) {
        const cleaned = cleanFarmerAvatars(farmersData.farmers);
        setFarmers(cleaned);
        try {
          localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(cleaned));
        } catch { }
      }

      if (Array.isArray(farmersData.farmerCustomFields)) {
        setFarmerCustomFields(farmersData.farmerCustomFields);
        try {
          localStorage.setItem(STORAGE_KEYS.FARMER_CUSTOM_FIELDS, JSON.stringify(farmersData.farmerCustomFields));
        } catch { }
      }
    } catch (e) {
      console.warn('Admin farmers fetch skipped', e);
    }
  };

  // Pull latest public database from cloud on load and when switching devices
  const fetchCloudDb = async (forceFullSync = false) => {
    try {
      const bypassCache = Boolean(isAdminLoggedIn || forceFullSync);
      const cloudData = await fetchRemotePublicDatabase(bypassCache);
      if (!cloudData) return;

      lastPublicSyncTimeRef.current = Date.now();
      if (cloudData.updatedAt) {
        lastKnownRemoteUpdatedAtRef.current = cloudData.updatedAt;
      }

      // Concurrency guard: If user performed an action in the last 2.5 seconds, do NOT let a stale response overwrite it
      if (Date.now() - lastMutationTimeRef.current < 2500) {
        return;
      }

      if (Array.isArray(cloudData.authorizedEmails)) {
        const cleanList = cloudData.authorizedEmails
          .map((e: string) => e.trim().toLowerCase())
          .filter(Boolean);
        const owner = (cloudData.primaryOwnerEmail || 'muantea45@gmail.com').trim().toLowerCase();
        if (!cleanList.includes(owner)) {
          cleanList.unshift(owner);
        }
        setAuthorizedEmails(cleanList);
        try {
          localStorage.setItem(STORAGE_KEYS.AUTHORIZED_EMAILS, JSON.stringify(cleanList));
        } catch { }
      }

      if (cloudData.primaryOwnerEmail) {
        const owner = cloudData.primaryOwnerEmail.trim().toLowerCase();
        setPrimaryOwnerEmailState(owner);
        try {
          localStorage.setItem(STORAGE_KEYS.PRIMARY_OWNER, owner);
        } catch { }
      }

      if (cloudData.adminSecurityKey) {
        setAdminSecurityKeyState(cloudData.adminSecurityKey);
        try {
          localStorage.setItem(STORAGE_KEYS.SECURITY_KEY, cloudData.adminSecurityKey);
        } catch { }
      }

      if (Array.isArray(cloudData.articles) && cloudData.articles.length > 0) {
        const normalizedArticles = normalizeArticleExcerpts(cloudData.articles);
        const newArticlesStr = JSON.stringify(normalizedArticles);
        const oldArticlesStr = JSON.stringify(latestDbStateRef.current.articles);
        if (newArticlesStr !== oldArticlesStr) {
          latestDbStateRef.current.articles = normalizedArticles;
          setArticles(normalizedArticles);
          try {
            localStorage.setItem(STORAGE_KEYS.ARTICLES, newArticlesStr);
          } catch { }
        }
      }

      if (Array.isArray(cloudData.categories) && cloudData.categories.length > 0) {
        setCategories(cloudData.categories);
        try {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cloudData.categories));
        } catch { }
      }

      if (Array.isArray(cloudData.tags) && cloudData.tags.length > 0) {
        setTags(cloudData.tags);
        try {
          localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(cloudData.tags));
        } catch { }
      }

      if (Array.isArray(cloudData.authors) && cloudData.authors.length > 0) {
        setAuthors(cloudData.authors);
        try {
          localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(cloudData.authors));
        } catch { }
      }

      if (cloudData.aboutData && typeof cloudData.aboutData === 'object') {
        const mergedAbout = {
          ...INITIAL_ABOUT_DATA,
          ...cloudData.aboutData,
          companyBanner: cloudData.aboutData.companyBanner
            ? { ...DEFAULT_COMPANY_BANNER, ...cloudData.aboutData.companyBanner }
            : DEFAULT_COMPANY_BANNER,
        };
        const newStr = JSON.stringify(mergedAbout);
        const oldStr = JSON.stringify(latestDbStateRef.current.aboutData);
        if (newStr !== oldStr) {
          setAboutData(mergedAbout);
          try {
            localStorage.setItem(STORAGE_KEYS.ABOUT_PAGE, newStr);
          } catch { }
        }
      }

      if (cloudData.footerData && typeof cloudData.footerData === 'object') {
        const newFooterStr = JSON.stringify(cloudData.footerData);
        const oldFooterStr = JSON.stringify(latestDbStateRef.current.footerData);
        if (newFooterStr !== oldFooterStr) {
          setFooterData(cloudData.footerData);
          try {
            localStorage.setItem(STORAGE_KEYS.FOOTER, newFooterStr);
          } catch { }
        }
      }

      if (isAdminLoggedIn && Array.isArray(cloudData.farmers)) {
        const cleaned = cleanFarmerAvatars(cloudData.farmers);
        setFarmers(cleaned);
        try {
          localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(cleaned));
        } catch { }
      }

      if (Array.isArray(cloudData.farmerCustomFields)) {
        setFarmerCustomFields(cloudData.farmerCustomFields);
        try {
          localStorage.setItem(STORAGE_KEYS.FARMER_CUSTOM_FIELDS, JSON.stringify(cloudData.farmerCustomFields));
        } catch { }
      }

      if (isAdminLoggedIn) {
        await fetchFarmersDb();
      }

      setCloudSyncStatus('synced');
    } catch (e) {
      console.warn('Initial cloud db fetch skipped', e);
    }
  };

  // Sync database cleanly: edge-cached one-shot fetch for public readers, live 4s polling only for logged-in admins
  useEffect(() => {
    let isMounted = true;
    fetchCloudDb(isAdminLoggedIn);

    if (!isAdminLoggedIn) {
      // Public visitors: only refresh if returning after > 3 minutes to protect Worker/KV quota at 30k+ visits/day
      const handlePublicResume = () => {
        if (
          document.visibilityState === 'visible' &&
          isMounted &&
          Date.now() - lastPublicSyncTimeRef.current > 180000
        ) {
          fetchCloudDb(false);
        }
      };
      window.addEventListener('visibilitychange', handlePublicResume);
      return () => {
        isMounted = false;
        window.removeEventListener('visibilitychange', handlePublicResume);
      };
    }

    let isChecking = false;
    const checkFastSync = async () => {
      if (!isMounted || isChecking || document.visibilityState !== 'visible') return;
      if (Date.now() - lastMutationTimeRef.current < 2500) return;

      isChecking = true;
      try {
        const meta = await fetchDatabaseMeta();
        if (meta && meta.updatedAt && meta.updatedAt !== lastKnownRemoteUpdatedAtRef.current) {
          lastKnownRemoteUpdatedAtRef.current = meta.updatedAt;
          await fetchCloudDb(true);
        }
      } catch {
        // silent fallback
      } finally {
        isChecking = false;
      }
    };

    const handleSyncOnVisible = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        checkFastSync();
      }
    };

    window.addEventListener('visibilitychange', handleSyncOnVisible);
    window.addEventListener('focus', handleSyncOnVisible);

    const interval = setInterval(checkFastSync, 4000);

    return () => {
      isMounted = false;
      window.removeEventListener('visibilitychange', handleSyncOnVisible);
      window.removeEventListener('focus', handleSyncOnVisible);
      clearInterval(interval);
    };
  }, [isAdminLoggedIn]);

  // Multi-tab broadcast channel listener for 0ms cross-tab updates
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('loneitu_live_bus');
    channel.onmessage = (event) => {
      if (!event.data) return;
      const { type, payload } = event.data;
      if (type === 'AUTH_EMAILS' && Array.isArray(payload)) {
        setAuthorizedEmails(payload);
        try { localStorage.setItem(STORAGE_KEYS.AUTHORIZED_EMAILS, JSON.stringify(payload)); } catch { }
      } else if (type === 'ARTICLES' && Array.isArray(payload)) {
        setArticles(payload);
        try { localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(payload)); } catch { }
      } else if (type === 'ABOUT_DATA' && payload && typeof payload === 'object') {
        setAboutData(payload);
        try { localStorage.setItem(STORAGE_KEYS.ABOUT_PAGE, JSON.stringify(payload)); } catch { }
      } else if (type === 'FARMERS' && Array.isArray(payload)) {
        const cleaned = cleanFarmerAvatars(payload);
        setFarmers(cleaned);
        try { localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(cleaned)); } catch { }
      }
    };
    return () => {
      channel.close();
    };
  }, []);

  const pushToCloudDatabase = async (overrideData?: any) => {
    setIsCloudSyncing(true);
    try {
      const current = latestDbStateRef.current;
      const now = new Date().toISOString();
      lastKnownRemoteUpdatedAtRef.current = now;

      // Fast partial payload optimization for sub-50ms cloud writes
      let payload: any;
      if (overrideData && !overrideData.farmers && Object.keys(overrideData).length <= 2) {
        payload = {
          ...overrideData,
          updatedAt: now,
        };
      } else {
        payload = {
          authorizedEmails: overrideData?.authorizedEmails ?? current.authorizedEmails,
          primaryOwnerEmail: overrideData?.primaryOwnerEmail ?? current.primaryOwnerEmail,
          adminSecurityKey: overrideData?.adminSecurityKey ?? current.adminSecurityKey,
          articles: overrideData?.articles ?? current.articles,
          categories: overrideData?.categories ?? current.categories,
          tags: overrideData?.tags ?? current.tags,
          authors: overrideData?.authors ?? current.authors,
          aboutData: overrideData?.aboutData ?? current.aboutData,
          footerData: overrideData?.footerData ?? current.footerData,
          farmers: overrideData?.farmers ?? current.farmers,
          farmerCustomFields: overrideData?.farmerCustomFields ?? current.farmerCustomFields,
          updatedAt: now,
        };
      }

      latestDbStateRef.current = {
        ...current,
        ...payload,
      };

      const success = await saveRemoteDatabase(payload);
      if (success) {
        setCloudSyncStatus('synced');
      } else {
        setCloudSyncStatus('error');
      }
    } catch (e) {
      console.warn('Cloud sync write failed', e);
      setCloudSyncStatus('error');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const updateAboutData = (updates: Partial<AboutPageData>) => {
    const updated = { ...latestDbStateRef.current.aboutData, ...updates };
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.aboutData = updated;
    setAboutData(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.ABOUT_PAGE, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to sync about data locally', e);
    }
    pushToCloudDatabase({ aboutData: updated });
    broadcastLocalChange('ABOUT_DATA', updated);
  };

  const updateFooterData = (updates: Partial<FooterData>) => {
    const updated = { ...latestDbStateRef.current.footerData, ...updates };
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.footerData = updated;
    setFooterData(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.FOOTER, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to sync footer data locally', e);
    }
    pushToCloudDatabase({ footerData: updated });
    broadcastLocalChange('FOOTER_DATA', updated);
  };

  const setPrimaryOwnerEmail = (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) return;
    let updatedEmails = authorizedEmails;
    if (!authorizedEmails.includes(normalized)) {
      updatedEmails = [...authorizedEmails, normalized];
      setAuthorizedEmails(updatedEmails);
      try { localStorage.setItem(STORAGE_KEYS.AUTHORIZED_EMAILS, JSON.stringify(updatedEmails)); } catch { }
    }
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.primaryOwnerEmail = normalized;
    latestDbStateRef.current.authorizedEmails = updatedEmails;
    setPrimaryOwnerEmailState(normalized);
    try { localStorage.setItem(STORAGE_KEYS.PRIMARY_OWNER, normalized); } catch { }
    pushToCloudDatabase({ primaryOwnerEmail: normalized, authorizedEmails: updatedEmails });
    broadcastLocalChange('AUTH_EMAILS', updatedEmails);
  };

  const isAuthorizedEmail = (email: string): boolean => {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();
    const safePrimary = (primaryOwnerEmail || 'muantea45@gmail.com').trim().toLowerCase();
    return (
      normalized === 'hriata.cherput@gmail.com' ||
      normalized === 'muantea45@gmail.com' ||
      normalized === safePrimary ||
      isDefaultAuthorizedEmail(normalized) ||
      (Array.isArray(authorizedEmails) && authorizedEmails.some(e => (e || '').trim().toLowerCase() === normalized))
    );
  };

  const checkAndRefreshAuthorization = async (email: string): Promise<boolean> => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) return false;

    // 1. Instant check in memory
    if (isAuthorizedEmail(normalized)) {
      return true;
    }

    // 2. Real-time check against central cloud auth scope to pick up new admins without leaking registry
    try {
      for (const endpoint of CLOUD_API_ENDPOINTS) {
        try {
          const res = await fetch(`${endpoint}?scope=verify-email&email=${encodeURIComponent(normalized)}&_cb=${Date.now()}`, {
            cache: 'no-store',
          });
          if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
            const json = await res.json();
            if (json && json.success) {
              if (json.authorized || isDefaultAuthorizedEmail(normalized)) {
                const merged = Array.from(new Set([...authorizedEmails, normalized]));
                setAuthorizedEmails(merged);
                try {
                  localStorage.setItem(STORAGE_KEYS.AUTHORIZED_EMAILS, JSON.stringify(merged));
                } catch { }
                return true;
              }
              return false;
            }
          }
        } catch {
          // try fallback endpoint
        }
      }

      const cloudData = await fetchRemoteDatabase(true);
      if (cloudData) {
        const remoteAuthEmails: string[] = Array.isArray(cloudData.authorizedEmails)
          ? cloudData.authorizedEmails.map((e: string) => e.trim().toLowerCase())
          : [];
        const remoteOwner = (cloudData.primaryOwnerEmail || '').trim().toLowerCase();

        if (
          remoteAuthEmails.includes(normalized) ||
          remoteOwner === normalized ||
          isDefaultAuthorizedEmail(normalized)
        ) {
          const merged = Array.from(new Set([...authorizedEmails, ...remoteAuthEmails, normalized]));
          setAuthorizedEmails(merged);
          try {
            localStorage.setItem(STORAGE_KEYS.AUTHORIZED_EMAILS, JSON.stringify(merged));
          } catch { }
          return true;
        }
      }
    } catch (err) {
      console.warn('Real-time auth check failed to contact cloud database', err);
    }

    return isAuthorizedEmail(normalized);
  };

  const addAuthorizedEmail = (email: string): boolean => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) return false;
    if (authorizedEmails.some(e => e.toLowerCase() === normalized)) return false;

    const updated = [...authorizedEmails.filter(e => e.toLowerCase() !== normalized), normalized];
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.authorizedEmails = updated;
    setAuthorizedEmails(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTHORIZED_EMAILS, JSON.stringify(updated));
    } catch { }

    pushToCloudDatabase({ authorizedEmails: updated });
    broadcastLocalChange('AUTH_EMAILS', updated);
    return true;
  };

  const removeAuthorizedEmail = (email: string): boolean => {
    const normalized = email.trim().toLowerCase();
    // Cannot delete the current primary journal owner
    if (normalized === primaryOwnerEmail.toLowerCase()) return false;

    const updated = authorizedEmails.filter(e => e.toLowerCase() !== normalized);
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.authorizedEmails = updated;
    setAuthorizedEmails(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTHORIZED_EMAILS, JSON.stringify(updated));
    } catch { }

    pushToCloudDatabase({ authorizedEmails: updated });
    broadcastLocalChange('AUTH_EMAILS', updated);
    return true;
  };

  const setAdminSecurityKey = (newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    setAdminSecurityKeyState(trimmed);
    try {
      localStorage.setItem(STORAGE_KEYS.SECURITY_KEY, trimmed);
    } catch (e) {
      console.error('Failed to sync security key', e);
    }
    pushToCloudDatabase({ adminSecurityKey: trimmed });
  };

  const [googleClientId, setGoogleClientIdState] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(STORAGE_KEYS.GOOGLE_CLIENT_ID) ||
        GOOGLE_CLIENT_ID ||
        ''
      );
    } catch {
      return GOOGLE_CLIENT_ID || '';
    }
  });

  const setGoogleClientId = (clientId: string) => {
    const trimmed = clientId.trim();
    setGoogleClientIdState(trimmed);
    try {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_CLIENT_ID, trimmed);
    } catch (e) {
      console.error('Failed to sync google client id', e);
    }
  };

  // Auth methods
  const verifyAndLoginAdmin = (email: string, passkey: string): { ok: boolean; error?: string } => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) {
      return { ok: false, error: 'Please enter a valid Gmail address.' };
    }
    if (!isAuthorizedEmail(normalized)) {
      return { ok: false, error: 'Access Denied: This account is not authorized on Loneitu.' };
    }
    if (passkey.trim() !== adminSecurityKey.trim()) {
      return { ok: false, error: 'Invalid Security Key. Access rejected.' };
    }
    setIsAdminLoggedIn(true);
    setAdminEmail(normalized);
    return { ok: true };
  };

  const verifyAndLoginWithGoogleJwt = (jwtToken: string): { ok: boolean; email?: string; error?: string } => {
    const payload = parseGoogleJwtCredential(jwtToken);
    if (!payload || !payload.email) {
      return { ok: false, error: 'Unable to verify Google Identity credential.' };
    }
    if (!payload.email_verified) {
      return { ok: false, error: 'Google account email is not verified.' };
    }
    const normalized = payload.email.trim().toLowerCase();
    if (!isAuthorizedEmail(normalized)) {
      return { ok: false, error: `Access Denied: Google account "${payload.email}" is not an authorized administrator.` };
    }
    setIsAdminLoggedIn(true);
    setAdminEmail(normalized);
    return { ok: true, email: normalized };
  };

  const loginAdmin = (password: string) => {
    if (adminSecurityKey && password.trim() && password.trim() === adminSecurityKey.trim()) {
      setIsAdminLoggedIn(true);
      setAdminEmail(primaryOwnerEmail);
      return true;
    }
    return false;
  };

  const loginAdminWithGmail = (email: string) => {
    const trimmed = (email || '').trim().toLowerCase();
    const isAllowed =
      trimmed === 'hriata.cherput@gmail.com' ||
      trimmed === 'muantea45@gmail.com' ||
      isAuthorizedEmail(trimmed);

    if (isAllowed) {
      setIsAdminLoggedIn(true);
      setAdminEmail(trimmed);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
        localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, trimmed);
      } catch { }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
    setFarmers([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.FARMERS);
    } catch { }
  };

  // Article Actions
  const addArticle = (data: Partial<Article> & { title: string; content: string; category: string }): Article => {
    const currentArticles = latestDbStateRef.current.articles || articles;
    const rawSlug = data.slug || slugify(data.title);
    let finalSlug = rawSlug;
    let counter = 1;
    while (currentArticles.some(a => a.slug === finalSlug)) {
      finalSlug = `${rawSlug}-${counter}`;
      counter++;
    }

    const newArticle: Article = {
      id: `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: data.title,
      slug: finalSlug,
      excerpt: cleanTextExcerpt(data.excerpt || data.content, 160),
      content: data.content,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
      category: data.category,
      tags: data.tags || [],
      author: data.author || authors[0] || INITIAL_AUTHORS[0],
      publishedAt: data.publishedAt || new Date().toISOString(),
      readingTimeMinutes: calculateReadingTime(data.content),
      status: data.status || 'published',
      isFeatured: Boolean(data.isFeatured),
      views: sanitizeViewsCount(data.views, 1),
      likes: 0,
      comments: [],
    };

    let baseArticles = currentArticles;
    if (data.isFeatured) {
      baseArticles = currentArticles.map(a => (a.isFeatured ? { ...a, isFeatured: false } : a));
    }
    const updatedArticles = [newArticle, ...baseArticles];
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.articles = updatedArticles;
    setArticles(updatedArticles);
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
    } catch { }
    pushToCloudDatabase({ articles: updatedArticles });
    syncExactArticleViewsToCloud([{ id: newArticle.id, views: newArticle.views }]);
    broadcastLocalChange('ARTICLES', updatedArticles);
    return newArticle;
  };

  const batchAddArticles = (
    items: Array<Partial<Article> & { title: string; content: string; category: string }>
  ): { count: number; articles: Article[] } => {
    if (!Array.isArray(items) || items.length === 0) {
      return { count: 0, articles: [] };
    }

    const currentArticles = [...(latestDbStateRef.current.articles || articles)];
    const existingSlugs = new Set(currentArticles.map(a => a.slug));
    const newArticles: Article[] = [];
    const timestamp = Date.now();

    items.forEach((data, index) => {
      const rawSlug = data.slug || slugify(data.title);
      let finalSlug = rawSlug;
      let counter = 1;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${rawSlug}-${counter}`;
        counter++;
      }
      existingSlugs.add(finalSlug);

      const uniqueId = `art-${timestamp}-${index}-${Math.random().toString(36).substring(2, 7)}`;
      const newArticle: Article = {
        id: uniqueId,
        title: data.title,
        slug: finalSlug,
        excerpt: cleanTextExcerpt(data.excerpt || data.content, 160),
        content: data.content,
        coverImage:
          data.coverImage ||
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
        category: data.category,
        tags: data.tags || [],
        author: data.author || authors[0] || INITIAL_AUTHORS[0],
        publishedAt: data.publishedAt || new Date().toISOString(),
        readingTimeMinutes: calculateReadingTime(data.content),
        status: data.status || 'published',
        isFeatured: Boolean(data.isFeatured),
        views: sanitizeViewsCount(data.views, 1),
        likes: 0,
        comments: [],
      };
      newArticles.push(newArticle);
    });

    const updatedArticles = [...newArticles, ...currentArticles];
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.articles = updatedArticles;
    setArticles(updatedArticles);
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
    } catch { }
    pushToCloudDatabase({ articles: updatedArticles });
    broadcastLocalChange('ARTICLES', updatedArticles);

    return { count: newArticles.length, articles: newArticles };
  };

  const updateArticle = (id: string, updates: Partial<Article>) => {
    const updatedArticles = articles.map(art => {
      if (art.id !== id) {
        if (updates.isFeatured && art.isFeatured) {
          return { ...art, isFeatured: false };
        }
        return art;
      }
      const rawExcerpt = updates.excerpt !== undefined ? updates.excerpt : art.excerpt;
      const cleanExcerpt = cleanTextExcerpt(rawExcerpt || updates.content || art.content, 160);
      const updated = { ...art, ...updates, excerpt: cleanExcerpt, updatedAt: new Date().toISOString() };
      if (updates.content && !updates.readingTimeMinutes) {
        updated.readingTimeMinutes = calculateReadingTime(updates.content);
      }
      return updated;
    });
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.articles = updatedArticles;
    setArticles(updatedArticles);
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
    } catch { }
    pushToCloudDatabase({ articles: updatedArticles });
    if (updates.views !== undefined) {
      syncExactArticleViewsToCloud([{ id, views: sanitizeViewsCount(updates.views, 0) }]);
    }
    broadcastLocalChange('ARTICLES', updatedArticles);
  };

  const bulkUpdateArticleViews = (updates: Array<{ id: string; views: number }>): number => {
    if (!Array.isArray(updates) || updates.length === 0) return 0;
    const viewsMap = new Map<string, number>();
    updates.forEach(item => {
      if (item && item.id) {
        viewsMap.set(item.id, sanitizeViewsCount(item.views, 0));
      }
    });
    if (viewsMap.size === 0) return 0;

    let changedCount = 0;
    const syncedPairs: Array<{ id: string; views: number }> = [];
    const baseArticles = latestDbStateRef.current.articles || articles;
    const updatedArticles = baseArticles.map(art => {
      const nextViews = viewsMap.get(art.id);
      if (nextViews === undefined || nextViews === art.views) return art;
      changedCount++;
      syncedPairs.push({ id: art.id, views: nextViews });
      return { ...art, views: nextViews };
    });

    if (changedCount === 0) return 0;
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.articles = updatedArticles;
    setArticles(updatedArticles);
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
    } catch { }
    pushToCloudDatabase({ articles: updatedArticles });
    syncExactArticleViewsToCloud(syncedPairs);
    broadcastLocalChange('ARTICLES', updatedArticles);
    return changedCount;
  };

  const deleteArticle = (id: string) => {
    const updatedArticles = articles.filter(a => a.id !== id);
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.articles = updatedArticles;
    setArticles(updatedArticles);
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
    } catch { }
    pushToCloudDatabase({ articles: updatedArticles });
    broadcastLocalChange('ARTICLES', updatedArticles);
  };

  const toggleFeatured = (id: string) => {
    const target = articles.find(a => a.id === id);
    const willBeFeatured = target ? !target.isFeatured : false;
    const updatedArticles = articles.map(a => {
      if (a.id === id) {
        return { ...a, isFeatured: willBeFeatured };
      }
      // If marking this article as featured lead, un-feature any previous featured lead
      if (willBeFeatured && a.isFeatured) {
        return { ...a, isFeatured: false };
      }
      return a;
    });
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.articles = updatedArticles;
    setArticles(updatedArticles);
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
    } catch { }
    pushToCloudDatabase({ articles: updatedArticles });
    broadcastLocalChange('ARTICLES', updatedArticles);
  };

  const toggleStatus = (id: string) => {
    const updatedArticles = articles.map(a =>
      a.id === id
        ? { ...a, status: (a.status === 'published' ? 'draft' : 'published') as 'draft' | 'published' }
        : a
    );
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.articles = updatedArticles;
    setArticles(updatedArticles);
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
    } catch { }
    pushToCloudDatabase({ articles: updatedArticles });
    broadcastLocalChange('ARTICLES', updatedArticles);
  };

  const incrementViews = (id: string) => {
    const currentList = latestDbStateRef.current.articles || articles;
    const target = currentList.find(a => a.id === id);
    const baseViews = target && typeof target.views === 'number' && Number.isFinite(target.views) ? target.views : 0;

    setArticles(prev => {
      const next = prev.map(a => (a.id === id ? { ...a, views: (a.views || 0) + 1 } : a));
      latestDbStateRef.current.articles = next;
      try {
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(next));
      } catch { }
      return next;
    });

    // Global persistent KV sync layered cleanly on top of inherited Blogger views
    (async () => {
      for (const endpoint of ARTICLE_VIEWS_ENDPOINTS) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId: id, baseViews }),
          });
          if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
            const json = await res.json();
            if (json && json.success && typeof json.views === 'number' && Number.isFinite(json.views)) {
              const serverViews = Math.floor(json.views);
              setArticles(prev => {
                const next = prev.map(a =>
                  a.id === id ? { ...a, views: Math.max(a.views || 0, serverViews) } : a
                );
                latestDbStateRef.current.articles = next;
                try {
                  localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(next));
                } catch { }
                return next;
              });
              return;
            }
          }
        } catch {
          // try fallback endpoint
        }
      }
    })();
  };

  const toggleLike = (id: string) => {
    const isLiked = likedArticles.includes(id);
    if (isLiked) {
      setLikedArticles(prev => prev.filter(item => item !== id));
      setArticles(prev =>
        prev.map(a => (a.id === id ? { ...a, likes: Math.max(0, a.likes - 1) } : a))
      );
    } else {
      setLikedArticles(prev => [...prev, id]);
      setArticles(prev =>
        prev.map(a => (a.id === id ? { ...a, likes: a.likes + 1 } : a))
      );
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const addComment = (articleId: string, commentData: { authorName: string; authorRole?: string; content: string }) => {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      authorName: commentData.authorName.trim(),
      authorRole: commentData.authorRole?.trim() || 'Loneitu / Zirchiangtu',
      content: commentData.content.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedArticles = articles.map(art => {
      if (art.id !== articleId) return art;
      return {
        ...art,
        comments: [...(art.comments || []), newComment],
      };
    });
    lastMutationTimeRef.current = Date.now();
    latestDbStateRef.current.articles = updatedArticles;
    setArticles(updatedArticles);
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
    } catch { }
    pushToCloudDatabase({ articles: updatedArticles });
    broadcastLocalChange('ARTICLES', updatedArticles);
  };

  // Taxonomy actions
  const addCategory = (cat: { name: string; description: string; color?: string; icon?: string; slug?: string }): Category => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: cat.name,
      slug: cat.slug || slugify(cat.name),
      description: cat.description,
      color: cat.color || '#2D6A4F',
      icon: cat.icon || 'Sprout',
    };
    const updatedCats = [...categories, newCat];
    setCategories(updatedCats);
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCats));
    } catch { }
    pushToCloudDatabase({ categories: updatedCats });
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const oldCat = categories.find(c => c.id === id);
    const updatedCats = categories.map(c => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updatedCats);
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCats));
    } catch { }

    let updatedArticles = articles;
    if (oldCat && updates.name && updates.name.toLowerCase() !== oldCat.name.toLowerCase()) {
      const oldName = oldCat.name.toLowerCase();
      const newName = updates.name;
      updatedArticles = articles.map(art =>
        art.category.toLowerCase() === oldName
          ? { ...art, category: newName }
          : art
      );
      setArticles(updatedArticles);
      try {
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
      } catch { }
    }
    pushToCloudDatabase({ categories: updatedCats, articles: updatedArticles });
  };

  const deleteCategory = (id: string) => {
    const catToDelete = categories.find(c => c.id === id);
    const remaining = categories.filter(c => c.id !== id);
    setCategories(remaining);
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(remaining));
    } catch { }

    let updatedArticles = articles;
    if (catToDelete) {
      const fallback = remaining[0]?.name || 'General';
      updatedArticles = articles.map(art =>
        art.category.toLowerCase() === catToDelete.name.toLowerCase()
          ? { ...art, category: fallback }
          : art
      );
      setArticles(updatedArticles);
      try {
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
      } catch { }
    }
    pushToCloudDatabase({ categories: remaining, articles: updatedArticles });
  };

  const addTag = (tag: { name: string; description?: string; slug?: string }): Tag => {
    const cleanName = tag.name.replace(/^#/, '').trim();
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: cleanName,
      slug: tag.slug || slugify(cleanName),
      description: tag.description || `Articles tagged with #${cleanName}`,
    };
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    try {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(updatedTags));
    } catch { }
    pushToCloudDatabase({ tags: updatedTags });
    return newTag;
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    const oldTag = tags.find(t => t.id === id);
    const updatedTags = tags.map(t => (t.id === id ? { ...t, ...updates } : t));
    setTags(updatedTags);
    try {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(updatedTags));
    } catch { }

    let updatedArticles = articles;
    if (oldTag && updates.name && updates.name.toLowerCase() !== oldTag.name.toLowerCase()) {
      const oldName = oldTag.name.toLowerCase();
      const newName = updates.name;
      updatedArticles = articles.map(art => ({
        ...art,
        tags: art.tags.map(t => (t.toLowerCase() === oldName ? newName : t)),
      }));
      setArticles(updatedArticles);
      try {
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
      } catch { }
    }
    pushToCloudDatabase({ tags: updatedTags, articles: updatedArticles });
  };

  const deleteTag = (id: string) => {
    const tagToDelete = tags.find(t => t.id === id);
    if (!tagToDelete) return;
    const remainingTags = tags.filter(t => t.id !== id);
    setTags(remainingTags);
    try {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(remainingTags));
    } catch { }

    const updatedArticles = articles.map(a => ({
      ...a,
      tags: a.tags.filter(
        t =>
          t.toLowerCase() !== tagToDelete.name.toLowerCase() &&
          t.toLowerCase() !== tagToDelete.slug.toLowerCase()
      ),
    }));
    setArticles(updatedArticles);
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
    } catch { }
    pushToCloudDatabase({ tags: remainingTags, articles: updatedArticles });
  };

  // Author actions
  const addAuthor = (auth: Omit<Author, 'id'>): Author => {
    const newAuthor: Author = {
      id: `auth-${Date.now()}`,
      name: auth.name.trim(),
      role: auth.role.trim(),
      avatar: auth.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: auth.bio.trim(),
      institution: auth.institution?.trim() || 'Mizoram Agronomy Collective',
    };
    const updatedAuthors = [...authors, newAuthor];
    setAuthors(updatedAuthors);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(updatedAuthors));
    } catch { }
    pushToCloudDatabase({ authors: updatedAuthors });
    return newAuthor;
  };

  const updateAuthor = (id: string, updates: Partial<Author>) => {
    const updatedAuthors = authors.map(a => (a.id === id ? { ...a, ...updates } : a));
    setAuthors(updatedAuthors);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(updatedAuthors));
    } catch { }

    let updatedArticles = articles;
    if (updates.name || updates.role || updates.avatar) {
      updatedArticles = articles.map(art => {
        if (art.author.id === id) {
          return {
            ...art,
            author: { ...art.author, ...updates },
          };
        }
        return art;
      });
      setArticles(updatedArticles);
      try {
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));
      } catch { }
    }
    pushToCloudDatabase({ authors: updatedAuthors, articles: updatedArticles });
  };

  const deleteAuthor = (id: string) => {
    const remainingAuthors = authors.filter(a => a.id !== id);
    setAuthors(remainingAuthors);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(remainingAuthors));
    } catch { }
    pushToCloudDatabase({ authors: remainingAuthors });
  };

  // Farmer Registry actions
  const addFarmer = useCallback((recordData: Partial<FarmerRecord> & { fullName: string }): FarmerRecord => {
    lastMutationTimeRef.current = Date.now();
    const newId = `farmer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: FarmerRecord = {
      id: newId,
      fullName: recordData.fullName.trim(),
      avatar: (recordData.avatar && !recordData.avatar.includes('unsplash.com')) ? recordData.avatar : '',
      registrationDate: recordData.registrationDate || new Date().toISOString().split('T')[0],
      status: recordData.status || 'Verified',
      data: recordData.data || {},
      columns: recordData.columns || Object.keys(recordData.data || {}),
    };

    setFarmers(prev => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmers: updated });
      broadcastLocalChange('FARMERS', updated);
      return updated;
    });

    return newRecord;
  }, []);

  const updateFarmer = useCallback((id: string, updates: Partial<FarmerRecord>) => {
    lastMutationTimeRef.current = Date.now();
    setFarmers(prev => {
      const updated = prev.map(f => (f.id === id ? { ...f, ...updates } : f));
      try {
        localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmers: updated });
      broadcastLocalChange('FARMERS', updated);
      return updated;
    });
  }, []);

  const deleteFarmer = useCallback((id: string) => {
    lastMutationTimeRef.current = Date.now();
    setFarmers(prev => {
      const updated = prev.filter(f => f.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmers: updated });
      broadcastLocalChange('FARMERS', updated);
      return updated;
    });
  }, []);

  const wipeAllFarmers = useCallback(() => {
    lastMutationTimeRef.current = Date.now();
    setFarmers([]);
    setFarmerCustomFields([]);
    try {
      localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify([]));
      localStorage.removeItem(STORAGE_KEYS.FARMER_CUSTOM_FIELDS);
    } catch { }
    pushToCloudDatabase({ farmers: [], farmerCustomFields: [] });
    broadcastLocalChange('FARMERS', []);
  }, []);

  const batchImportFarmers = useCallback((records: FarmerRecord[]) => {
    lastMutationTimeRef.current = Date.now();
    setFarmers(prev => {
      const updated = [...records, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmers: updated });
      broadcastLocalChange('FARMERS', updated);
      return updated;
    });

    return { count: records.length };
  }, []);

  const renameColumn = useCallback((oldCol: string, newCol: string) => {
    const trimmedNew = newCol.trim();
    if (!trimmedNew || oldCol === trimmedNew) return;
    lastMutationTimeRef.current = Date.now();
    setFarmers(prev => {
      const updated = prev.map(farmer => {
        const newData = { ...(farmer.data || {}) };
        if (Object.prototype.hasOwnProperty.call(newData, oldCol)) {
          newData[trimmedNew] = newData[oldCol];
          delete newData[oldCol];
        }
        const newCols = (farmer.columns || []).map(c => c === oldCol ? trimmedNew : c);
        if (!newCols.includes(trimmedNew) && farmer.columns && farmer.columns.length > 0) {
          newCols.push(trimmedNew);
        }
        return {
          ...farmer,
          data: newData,
          columns: newCols
        };
      });
      try {
        localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmers: updated });
      broadcastLocalChange('FARMERS', updated);
      return updated;
    });

    setFarmerCustomFields(prev => {
      const updated = prev.map(f => f.key === oldCol ? { ...f, key: trimmedNew, label: trimmedNew } : f);
      try {
        localStorage.setItem(STORAGE_KEYS.FARMER_CUSTOM_FIELDS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmerCustomFields: updated });
      return updated;
    });
  }, []);

  const deleteColumn = useCallback((colName: string) => {
    lastMutationTimeRef.current = Date.now();
    setFarmers(prev => {
      const updated = prev.map(farmer => {
        const newData = { ...(farmer.data || {}) };
        delete newData[colName];
        const newCols = (farmer.columns || []).filter(c => c !== colName);
        return {
          ...farmer,
          data: newData,
          columns: newCols
        };
      });
      try {
        localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmers: updated });
      broadcastLocalChange('FARMERS', updated);
      return updated;
    });

    setFarmerCustomFields(prev => {
      const updated = prev.filter(f => f.key !== colName);
      try {
        localStorage.setItem(STORAGE_KEYS.FARMER_CUSTOM_FIELDS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmerCustomFields: updated });
      return updated;
    });
  }, []);

  const addColumn = useCallback((newCol: string) => {
    const trimmed = newCol.trim();
    if (!trimmed) return;
    lastMutationTimeRef.current = Date.now();
    setFarmers(prev => {
      const updated = prev.map(farmer => {
        const newData = { ...(farmer.data || {}) };
        if (newData[trimmed] === undefined) {
          newData[trimmed] = '';
        }
        const currentCols = farmer.columns || [];
        const newCols = currentCols.includes(trimmed) ? currentCols : [...currentCols, trimmed];
        return {
          ...farmer,
          data: newData,
          columns: newCols
        };
      });
      try {
        localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmers: updated });
      broadcastLocalChange('FARMERS', updated);
      return updated;
    });

    setFarmerCustomFields(prev => {
      if (prev.some(f => f.key === trimmed)) return prev;
      const updated = [...prev, { key: trimmed, label: trimmed }];
      try {
        localStorage.setItem(STORAGE_KEYS.FARMER_CUSTOM_FIELDS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmerCustomFields: updated });
      return updated;
    });
  }, []);

  const addFarmerCustomField = useCallback((field: FarmerFieldDefinition) => {
    setFarmerCustomFields(prev => {
      if (prev.some(f => f.key === field.key)) return prev;
      const updated = [...prev, field];
      try {
        localStorage.setItem(STORAGE_KEYS.FARMER_CUSTOM_FIELDS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmerCustomFields: updated });
      return updated;
    });
  }, []);

  const deleteFarmerCustomField = useCallback((key: string) => {
    setFarmerCustomFields(prev => {
      const updated = prev.filter(f => f.key !== key);
      try {
        localStorage.setItem(STORAGE_KEYS.FARMER_CUSTOM_FIELDS, JSON.stringify(updated));
      } catch { }
      pushToCloudDatabase({ farmerCustomFields: updated });
      return updated;
    });
  }, []);

  // Filter setters
  const setFilterCategory = (categorySlug: string) => {
    setFilterState(prev => ({ ...prev, category: categorySlug }));
  };

  const setFilterTag = (tagSlug: string) => {
    setFilterState(prev => ({ ...prev, tag: tagSlug }));
  };

  const setSearchQuery = (searchQuery: string) => {
    setFilterState(prev => ({ ...prev, searchQuery }));
  };

  const setSortBy = (sortBy: SortOption) => {
    setFilterState(prev => ({ ...prev, sortBy }));
  };

  const clearFilters = () => {
    setFilterState({
      category: 'all',
      tag: 'all',
      searchQuery: '',
      sortBy: 'newest',
    });
  };

  const resetToInitialData = () => {
    setArticles(INITIAL_ARTICLES);
    setCategories(INITIAL_CATEGORIES);
    setTags(INITIAL_TAGS);
    setAuthors(INITIAL_AUTHORS);
    setAboutData(INITIAL_ABOUT_DATA);
    setFooterData(INITIAL_FOOTER_DATA);
    setFarmers(INITIAL_FARMERS);
    setFarmerCustomFields([]);
    setBookmarks([]);
    setLikedArticles([]);
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(INITIAL_TAGS));
      localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(INITIAL_AUTHORS));
      localStorage.setItem(STORAGE_KEYS.ABOUT_PAGE, JSON.stringify(INITIAL_ABOUT_DATA));
      localStorage.setItem(STORAGE_KEYS.FOOTER, JSON.stringify(INITIAL_FOOTER_DATA));
      localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(INITIAL_FARMERS));
      localStorage.removeItem(STORAGE_KEYS.FARMER_CUSTOM_FIELDS);
      localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
      localStorage.removeItem(STORAGE_KEYS.LIKES);
    } catch { }
    pushToCloudDatabase({
      articles: INITIAL_ARTICLES,
      categories: INITIAL_CATEGORIES,
      tags: INITIAL_TAGS,
      authors: INITIAL_AUTHORS,
      aboutData: INITIAL_ABOUT_DATA,
      footerData: INITIAL_FOOTER_DATA,
      farmers: INITIAL_FARMERS,
      farmerCustomFields: [],
    });
  };

  const restoreFullDatabase = useCallback(async (backupData: any): Promise<boolean> => {
    if (!backupData || typeof backupData !== 'object') {
      return false;
    }
    const payload = backupData.data || backupData;
    if (!Array.isArray(payload.articles)) {
      return false;
    }

    try {
      if (Array.isArray(payload.articles)) setArticles(payload.articles);
      if (Array.isArray(payload.categories)) setCategories(payload.categories);
      if (Array.isArray(payload.tags)) setTags(payload.tags);
      if (Array.isArray(payload.authors)) setAuthors(payload.authors);
      if (payload.aboutData) setAboutData(payload.aboutData);
      if (payload.footerData) setFooterData(payload.footerData);
      if (Array.isArray(payload.farmers)) setFarmers(payload.farmers);
      if (Array.isArray(payload.farmerCustomFields)) setFarmerCustomFields(payload.farmerCustomFields);
      if (Array.isArray(payload.authorizedEmails) && payload.authorizedEmails.length > 0) {
        setAuthorizedEmails(payload.authorizedEmails);
      }
      if (payload.primaryOwnerEmail) {
        setPrimaryOwnerEmailState(payload.primaryOwnerEmail);
      }
      if (payload.adminSecurityKey) {
        setAdminSecurityKeyState(payload.adminSecurityKey);
      }

      const fullSnapshot = {
        articles: payload.articles || articles,
        categories: payload.categories || categories,
        tags: payload.tags || tags,
        authors: payload.authors || authors,
        aboutData: payload.aboutData || aboutData,
        footerData: payload.footerData || footerData,
        farmers: payload.farmers || farmers,
        farmerCustomFields: payload.farmerCustomFields || farmerCustomFields,
        authorizedEmails: payload.authorizedEmails || authorizedEmails,
        primaryOwnerEmail: payload.primaryOwnerEmail || primaryOwnerEmail,
        adminSecurityKey: payload.adminSecurityKey || adminSecurityKey,
        lastUpdated: Date.now(),
      };

      await saveRemoteDatabase(fullSnapshot, {
        key: fullSnapshot.adminSecurityKey,
        email: fullSnapshot.primaryOwnerEmail,
      });
      broadcastLocalChange('database_restored', fullSnapshot);
      return true;
    } catch (e) {
      console.error('Failed to restore database from backup', e);
      return false;
    }
  }, [articles, categories, tags, authors, aboutData, footerData, farmers, farmerCustomFields, authorizedEmails, primaryOwnerEmail, adminSecurityKey]);

  const uploadImage = useCallback(async (dataUrl: string, filename?: string): Promise<string> => {
    return uploadImageToCloud(dataUrl, filename);
  }, []);

  // Derived filtered articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter(art => {
        // In public list, only show published unless in admin context
        if (art.status !== 'published') return false;

        // Category filter
        if (filterState.category !== 'all') {
          const matchCat = categories.find(c => c.slug === filterState.category);
          const targetName = matchCat ? matchCat.name.toLowerCase() : filterState.category.toLowerCase();
          if (art.category.toLowerCase() !== targetName && slugify(art.category) !== filterState.category) {
            return false;
          }
        }

        // Tag filter
        if (filterState.tag !== 'all') {
          const targetTag = filterState.tag.toLowerCase();
          const hasTag = art.tags.some(
            t => t.toLowerCase() === targetTag || slugify(t) === targetTag
          );
          if (!hasTag) return false;
        }

        // Search query filter
        if (filterState.searchQuery.trim()) {
          const q = filterState.searchQuery.toLowerCase();
          const matchesTitle = art.title.toLowerCase().includes(q);
          const matchesAuthor = art.author.name.toLowerCase().includes(q);
          const matchesCategory = art.category.toLowerCase().includes(q);
          const matchesTag = art.tags.some(t => t.toLowerCase().includes(q));
          const matchesContent = art.content.toLowerCase().includes(q);

          if (!matchesTitle && !matchesAuthor && !matchesCategory && !matchesTag && !matchesContent) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === 'newest') {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }
        if (filterState.sortBy === 'oldest') {
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        }
        if (filterState.sortBy === 'reading-asc') {
          return a.readingTimeMinutes - b.readingTimeMinutes;
        }
        if (filterState.sortBy === 'reading-desc') {
          return b.readingTimeMinutes - a.readingTimeMinutes;
        }
        if (filterState.sortBy === 'popular') {
          return (b.views + b.likes * 5) - (a.views + a.likes * 5);
        }
        return 0;
      });
  }, [articles, categories, filterState]);

  return (
    <BlogContext.Provider
      value={{
        articles,
        categories,
        tags,
        bookmarks,
        likedArticles,
        filterState,
        isAdminLoggedIn,
        adminEmail,
        primaryOwnerEmail,
        authorizedEmails,
        authors,
        aboutData,
        updateAboutData,
        footerData,
        updateFooterData,
        adminSecurityKey,
        googleClientId,
        isCloudSyncing,
        cloudSyncStatus,
        pushToCloudDatabase,
        farmers,
        farmerCustomFields,
        addFarmer,
        updateFarmer,
        deleteFarmer,
        wipeAllFarmers,
        batchImportFarmers,
        renameColumn,
        deleteColumn,
        addColumn,
        addFarmerCustomField,
        deleteFarmerCustomField,
        loginAdminWithGmail,
        verifyAndLoginAdmin,
        verifyAndLoginWithGoogleJwt,
        setAdminSecurityKey,
        setGoogleClientId,
        setPrimaryOwnerEmail,
        addAuthorizedEmail,
        removeAuthorizedEmail,
        isAuthorizedEmail,
        checkAndRefreshAuthorization,
        addArticle,
        batchAddArticles,
        updateArticle,
        bulkUpdateArticleViews,
        deleteArticle,
        toggleFeatured,
        toggleStatus,
        incrementViews,
        toggleLike,
        toggleBookmark,
        addComment,
        addCategory,
        updateCategory,
        deleteCategory,
        addTag,
        updateTag,
        deleteTag,
        addAuthor,
        updateAuthor,
        deleteAuthor,
        setFilterCategory,
        setFilterTag,
        setSearchQuery,
        setSortBy,
        clearFilters,
        loginAdmin,
        logoutAdmin,
        fetchCloudDb,
        resetToInitialData,
        restoreFullDatabase,
        uploadImage,
        filteredArticles,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
