import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Article, Category, Tag, Author, FilterState, SortOption, Comment } from '../types/blog';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_TAGS, INITIAL_AUTHORS } from '../data/initialData';
import { DEFAULT_AUTHORIZED_EMAILS, DEFAULT_ADMIN_KEY, isDefaultAuthorizedEmail, parseGoogleJwtCredential } from '../config/authConfig';
import { slugify } from '../utils/slugify';
import { calculateReadingTime } from '../utils/readingTime';

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
  adminSecurityKey: string;
  googleClientId: string;
  isCloudSyncing: boolean;
  cloudSyncStatus: 'idle' | 'synced' | 'error';
  pushToCloudDatabase: (overrideData?: any) => Promise<void>;
  
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
  
  // Article CRUD & Actions
  addArticle: (data: Partial<Article> & { title: string; content: string; category: string }) => Article;
  updateArticle: (id: string, updates: Partial<Article>) => void;
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

  // Maintenance
  resetToInitialData: () => void;
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
};

export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial states from localStorage with graceful fallback
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      return stored ? JSON.parse(stored) : INITIAL_ARTICLES;
    } catch {
      return INITIAL_ARTICLES;
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
          const list = parsed.map((e: string) => e.trim().toLowerCase());
          DEFAULT_AUTHORIZED_EMAILS.forEach(defaultEmail => {
            const normalized = defaultEmail.trim().toLowerCase();
            if (!list.includes(normalized)) {
              list.push(normalized);
            }
          });
          return list;
        }
      }
      return DEFAULT_AUTHORIZED_EMAILS;
    } catch {
      return DEFAULT_AUTHORIZED_EMAILS;
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

  // Pull latest database from cloud on load (syncs Desktop <-> Mobile automatically)
  useEffect(() => {
    let isMounted = true;
    const fetchCloudDb = async () => {
      try {
        const res = await fetch('/api/db');
        if (!res.ok) return;
        const result = await res.json();
        if (result && result.data && isMounted) {
          const cloudData = result.data;
          if (Array.isArray(cloudData.authorizedEmails) && cloudData.authorizedEmails.length > 0) {
            setAuthorizedEmails(prev => Array.from(new Set([...prev, ...cloudData.authorizedEmails])));
          }
          if (cloudData.primaryOwnerEmail) {
            setPrimaryOwnerEmailState(cloudData.primaryOwnerEmail);
          }
          if (cloudData.adminSecurityKey) {
            setAdminSecurityKeyState(cloudData.adminSecurityKey);
          }
          if (Array.isArray(cloudData.articles) && cloudData.articles.length > 0) {
            setArticles(cloudData.articles);
          }
          setCloudSyncStatus('synced');
        }
      } catch (e) {
        console.warn('Initial cloud db fetch skipped', e);
      }
    };
    fetchCloudDb();
    return () => {
      isMounted = false;
    };
  }, []);

  const pushToCloudDatabase = async (overrideData?: any) => {
    setIsCloudSyncing(true);
    try {
      const payload = {
        authorizedEmails: overrideData?.authorizedEmails || authorizedEmails,
        primaryOwnerEmail: overrideData?.primaryOwnerEmail || primaryOwnerEmail,
        adminSecurityKey: overrideData?.adminSecurityKey || adminSecurityKey,
        articles: overrideData?.articles || articles,
        updatedAt: new Date().toISOString(),
      };
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
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

  const setPrimaryOwnerEmail = (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) return;
    let updatedEmails = authorizedEmails;
    if (!authorizedEmails.includes(normalized)) {
      updatedEmails = [...authorizedEmails, normalized];
      setAuthorizedEmails(updatedEmails);
    }
    setPrimaryOwnerEmailState(normalized);
    pushToCloudDatabase({ primaryOwnerEmail: normalized, authorizedEmails: updatedEmails });
  };

  const isAuthorizedEmail = (email: string): boolean => {
    const normalized = email.trim().toLowerCase();
    return (
      normalized === primaryOwnerEmail.toLowerCase() ||
      authorizedEmails.some(e => e.trim().toLowerCase() === normalized) ||
      isDefaultAuthorizedEmail(normalized)
    );
  };

  const addAuthorizedEmail = (email: string): boolean => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) return false;
    if (isAuthorizedEmail(normalized)) return false;
    const updated = [...authorizedEmails, normalized];
    setAuthorizedEmails(updated);
    pushToCloudDatabase({ authorizedEmails: updated });
    return true;
  };

  const removeAuthorizedEmail = (email: string): boolean => {
    const normalized = email.trim().toLowerCase();
    // Cannot delete the current primary journal owner
    if (normalized === primaryOwnerEmail.toLowerCase()) return false;
    const updated = authorizedEmails.filter(e => e.toLowerCase() !== normalized);
    setAuthorizedEmails(updated);
    pushToCloudDatabase({ authorizedEmails: updated });
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
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        localStorage.getItem(STORAGE_KEYS.GOOGLE_CLIENT_ID) ||
        ''
      );
    } catch {
      return '';
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
    if (password === 'admin' || password === 'agri2026' || password === 'roots' || password === 'admin123') {
      setIsAdminLoggedIn(true);
      setAdminEmail(primaryOwnerEmail);
      return true;
    }
    return false;
  };

  const loginAdminWithGmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    // Whitelist Authorization Check
    if (isAuthorizedEmail(trimmed)) {
      setIsAdminLoggedIn(true);
      setAdminEmail(trimmed);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
  };

  // Article Actions
  const addArticle = (data: Partial<Article> & { title: string; content: string; category: string }): Article => {
    const rawSlug = data.slug || slugify(data.title);
    let finalSlug = rawSlug;
    let counter = 1;
    while (articles.some(a => a.slug === finalSlug)) {
      finalSlug = `${rawSlug}-${counter}`;
      counter++;
    }

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      title: data.title,
      slug: finalSlug,
      excerpt: '',
      content: data.content,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
      category: data.category,
      tags: data.tags && data.tags.length > 0 ? data.tags : ['LeiTha'],
      author: data.author || authors[0] || INITIAL_AUTHORS[0],
      publishedAt: new Date().toISOString(),
      readingTimeMinutes: calculateReadingTime(data.content),
      status: data.status || 'published',
      isFeatured: Boolean(data.isFeatured),
      views: 1,
      likes: 0,
      comments: [],
    };

    setArticles(prev => [newArticle, ...prev]);
    return newArticle;
  };

  const updateArticle = (id: string, updates: Partial<Article>) => {
    setArticles(prev =>
      prev.map(art => {
        if (art.id !== id) return art;
        const updated = { ...art, ...updates, updatedAt: new Date().toISOString() };
        if (updates.content && !updates.readingTimeMinutes) {
          updated.readingTimeMinutes = calculateReadingTime(updates.content);
        }
        return updated;
      })
    );
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const toggleFeatured = (id: string) => {
    setArticles(prev =>
      prev.map(a => (a.id === id ? { ...a, isFeatured: !a.isFeatured } : a))
    );
  };

  const toggleStatus = (id: string) => {
    setArticles(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, status: a.status === 'published' ? 'draft' : 'published' }
          : a
      )
    );
  };

  const incrementViews = (id: string) => {
    setArticles(prev =>
      prev.map(a => (a.id === id ? { ...a, views: (a.views || 0) + 1 } : a))
    );
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

    setArticles(prev =>
      prev.map(art => {
        if (art.id !== articleId) return art;
        return {
          ...art,
          comments: [...(art.comments || []), newComment],
        };
      })
    );
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
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const oldCat = categories.find(c => c.id === id);
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
    // If category name changed, propagate to all articles using this category
    if (oldCat && updates.name && updates.name.toLowerCase() !== oldCat.name.toLowerCase()) {
      const oldName = oldCat.name.toLowerCase();
      const newName = updates.name;
      setArticles(prev =>
        prev.map(art =>
          art.category.toLowerCase() === oldName
            ? { ...art, category: newName }
            : art
        )
      );
    }
  };

  const deleteCategory = (id: string) => {
    const catToDelete = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    if (catToDelete) {
      const remaining = categories.filter(c => c.id !== id);
      const fallback = remaining[0]?.name || 'General';
      setArticles(prev =>
        prev.map(art =>
          art.category.toLowerCase() === catToDelete.name.toLowerCase()
            ? { ...art, category: fallback }
            : art
        )
      );
    }
  };

  const addTag = (tag: { name: string; description?: string; slug?: string }): Tag => {
    const cleanName = tag.name.replace(/^#/, '').trim();
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: cleanName,
      slug: tag.slug || slugify(cleanName),
      description: tag.description || `Articles tagged with #${cleanName}`,
    };
    setTags(prev => [...prev, newTag]);
    return newTag;
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    const oldTag = tags.find(t => t.id === id);
    setTags(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
    // If tag name changed, propagate to all articles using this tag
    if (oldTag && updates.name && updates.name.toLowerCase() !== oldTag.name.toLowerCase()) {
      const oldName = oldTag.name.toLowerCase();
      const newName = updates.name;
      setArticles(prev =>
        prev.map(art => ({
          ...art,
          tags: art.tags.map(t => (t.toLowerCase() === oldName ? newName : t)),
        }))
      );
    }
  };

  const deleteTag = (id: string) => {
    const tagToDelete = tags.find(t => t.id === id);
    if (!tagToDelete) return;
    setTags(prev => prev.filter(t => t.id !== id));
    // Also remove from articles tags list
    setArticles(prev =>
      prev.map(a => ({
        ...a,
        tags: a.tags.filter(t => t.toLowerCase() !== tagToDelete.name.toLowerCase() && t.toLowerCase() !== tagToDelete.slug.toLowerCase()),
      }))
    );
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
    setAuthors(prev => [...prev, newAuthor]);
    return newAuthor;
  };

  const updateAuthor = (id: string, updates: Partial<Author>) => {
    setAuthors(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updates } : a))
    );
    // Propagate to articles by this author
    if (updates.name || updates.role || updates.avatar) {
      setArticles(prev =>
        prev.map(art => {
          if (art.author.id === id) {
            return {
              ...art,
              author: { ...art.author, ...updates },
            };
          }
          return art;
        })
      );
    }
  };

  const deleteAuthor = (id: string) => {
    setAuthors(prev => prev.filter(a => a.id !== id));
  };

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
    setBookmarks([]);
    setLikedArticles([]);
    localStorage.removeItem(STORAGE_KEYS.ARTICLES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.TAGS);
    localStorage.removeItem(STORAGE_KEYS.AUTHORS);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.LIKES);
  };

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
        adminSecurityKey,
        googleClientId,
        isCloudSyncing,
        cloudSyncStatus,
        pushToCloudDatabase,
        loginAdminWithGmail,
        verifyAndLoginAdmin,
        verifyAndLoginWithGoogleJwt,
        setAdminSecurityKey,
        setGoogleClientId,
        setPrimaryOwnerEmail,
        addAuthorizedEmail,
        removeAuthorizedEmail,
        isAuthorizedEmail,
        addArticle,
        updateArticle,
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
        resetToInitialData,
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
