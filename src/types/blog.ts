export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  institution?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string; // Tailwind color or hex code
  icon: string; // icon identifier
  articleCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface Comment {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorRole?: string;
  content: string;
  createdAt: string;
  avatar?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string; // Markdown formatted
  coverImage: string;
  category: string; // category id or name
  tags: string[]; // tag slugs or names
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  readingTimeMinutes: number;
  status: 'published' | 'draft';
  isFeatured: boolean;
  views: number;
  likes: number;
  comments: Comment[];
}

export type SortOption = 'newest' | 'oldest' | 'reading-asc' | 'reading-desc' | 'popular';

export interface FilterState {
  category: string; // 'all' or category slug
  tag: string; // 'all' or tag slug
  searchQuery: string;
  sortBy: SortOption;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  youtube?: string;
  twitter?: string;
}

export interface AboutPageData {
  badge: string;
  heroTitle: string;
  heroDescription: string;
  editorialTag: string;
  editorialTitle: string;
  editorialBody: string;
  quote?: string;
  authorsTitle: string;
  authorsSubtitle: string;
  socialLinks?: SocialLinks;
}

export interface FooterData {
  tagline: string;
  copyrightText: string;
  dedicationText: string;
  bannerEnabled?: boolean;
  bannerBadge?: string;
  bannerTitle?: string;
  bannerText?: string;
  bannerButtonText?: string;
  bannerButtonLink?: string;
}

