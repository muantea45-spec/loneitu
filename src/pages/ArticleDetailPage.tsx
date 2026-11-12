import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Calendar,
  Clock,
  ArrowLeft,
  ChevronRight,
  Eye,
  BookOpen,
  Share2,
  Play
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { formatDate } from '../utils/formatDate';
import { ReadingProgress } from '../components/layout/ReadingProgress';
import { TableOfContents } from '../components/article/TableOfContents';
import { AuthorBio } from '../components/article/AuthorBio';
import { ShareButtons } from '../components/article/ShareButtons';
import { RelatedPosts } from '../components/article/RelatedPosts';
import { ShareModal } from '../components/common/ShareModal';
import { resolveImageUrl } from '../utils/imageUrlResolver';
import { getArticleMediaBadge } from '../utils/mediaEmbed';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { articles, incrementViews, setFilterTag } = useBlog();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const navigate = useNavigate();

  const article = articles.find(a => a.slug === slug);
  const mediaBadge = article ? getArticleMediaBadge(article) : null;
  const coverSrc = article
    ? resolveImageUrl(article.coverImage) || mediaBadge?.thumbnailUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80'
    : '';

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch { }
    if (article) {
      incrementViews(article.id);
      document.title = `${article.title} — Loneitu (MIZORAM TAN)`;
    }
  }, [slug]);

  if (!article) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
          <BookOpen className="w-12 h-12 mx-auto text-[#6F5B3C]" />
          <h2 className="font-serif font-bold text-2xl text-[#143520]">
            Field Article Not Found
          </h2>
          <p className="text-xs sm:text-sm text-[#6F5B3C]">
            The article you requested could not be located in the current publication index. It may have been archived or renamed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143520] text-white text-xs font-semibold hover:bg-[#1E542E]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Journal Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleTagClick = (tag: string) => {
    setFilterTag(tag.toLowerCase());
    navigate(`/tag/${tag.toLowerCase()}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBF8] pb-16">
      {/* Top Reading Progress Bar */}
      <ReadingProgress />

      {/* Header Container */}
      <div className="w-full bg-[#F6F4EB] border-b border-[#EBE6D6] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-[#6F5B3C] font-medium">
            <Link to="/" className="hover:text-[#143520] transition-colors">
              Journal
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#256B3A] font-semibold">{article.category}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px] sm:max-w-xs text-[#6F5B3C]">
              {article.title}
            </span>
          </nav>

          {/* Category Pill */}
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#143520] text-[#BFDC28]">
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#143520] leading-[1.2]">
            {article.title}
          </h1>

          {/* Author & Publication Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#DDD4BC]">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#256B3A]/30"
              />
              <div>
                <div className="font-semibold text-sm text-[#143520]">
                  {article.author.name}
                </div>
                <div className="text-xs text-[#6F5B3C] font-medium">
                  {article.author.role}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#6F5B3C]">
              <Link
                to={`/archive?year=${new Date(article.publishedAt).getFullYear()}&month=${new Date(article.publishedAt).getMonth() + 1}`}
                className="flex items-center gap-1.5 hover:text-[#256B3A] hover:underline transition-colors"
                title="View in Date Archive"
              >
                <Calendar className="w-3.5 h-3.5 text-[#256B3A]" />
                <span>{formatDate(article.publishedAt)}</span>
              </Link>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#256B3A]" />
                Min {article.readingTimeMinutes} read
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#256B3A]" />
                {(article.views ?? 1).toLocaleString()} views
              </span>

              {/* Universal Share button in article header */}
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold shadow-2xs transition-all hover:scale-102 cursor-pointer"
                title="Share this article"
              >
                <Share2 className="w-3.5 h-3.5 text-[#BFDC28]" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Width Content Container with Ergonomic Constraints */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Cover Image banner */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative aspect-16/9 rounded-3xl overflow-hidden shadow-lg border border-[#DDD4BC] bg-[#EBE6D6]">
            <img
              src={coverSrc}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80';
              }}
            />
            {mediaBadge && (
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-lg">
                  <Play className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  <span>{mediaBadge.label}</span>
                </span>
              </div>
            )}
          </div>
          <div className="text-[11px] text-[#6F5B3C] text-right mt-2 italic">
            Field photography: Verified agrarian site documentation
          </div>
        </div>

        {/* Content Layout: 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto">
          {/* Left Column: Sticky Table of Contents on Desktop (4 cols) */}
          <aside className="lg:col-span-4 order-2 lg:order-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              <TableOfContents content={article.content} />

              {/* Quick Author Snippet */}
              <div className="p-5 bg-white rounded-2xl border border-[#EBE6D6] space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6F5B3C]">
                  Lead Investigator
                </div>
                <div className="font-serif font-bold text-sm text-[#143520]">
                  {article.author.name}
                </div>
                <p className="text-xs text-[#6F5B3C] line-clamp-3 leading-relaxed">
                  {article.author.bio}
                </p>
              </div>

              {/* Tag Cloud in Sidebar */}
              <div className="p-5 bg-white rounded-2xl border border-[#EBE6D6] space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6F5B3C]">
                  Field Practice Tags
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {article.tags.map(t => (
                    <button
                      key={t}
                      onClick={() => handleTagClick(t)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#F2F7F3] text-[#1E542E] hover:bg-[#256B3A] hover:text-white transition-colors cursor-pointer"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Markdown Article Body (8 cols) */}
          <main className="lg:col-span-8 order-1 lg:order-2">
            <article className="prose-agri bg-white p-6 sm:p-10 rounded-3xl border border-[#EBE6D6] shadow-xs">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ node: _node, ...props }) => (
                    <p className="leading-[1.8] text-base sm:text-lg mb-6 text-justify [text-align:justify] text-[#2D3A31]" {...props} />
                  ),
                  h2: ({ node: _node, ...props }) => {
                    const text = String(props.children);
                    const id = text
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/\s+/g, '-');
                    return <h2 id={id} {...props} />;
                  },
                  h3: ({ node: _node, ...props }) => {
                    const text = String(props.children);
                    const id = text
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/\s+/g, '-');
                    return <h3 id={id} {...props} />;
                  },
                  img: ({ node: _node, ...props }) => (
                    <figure className="my-8 block">
                      <div className="overflow-hidden rounded-2xl border border-[#DDD4BC] bg-[#F6F4EB] shadow-xs">
                        <img
                          {...props}
                          className="w-full max-h-[600px] object-cover block"
                          loading="lazy"
                        />
                      </div>
                      {props.alt && (
                        <figcaption className="text-center text-xs text-[#6F5B3C] mt-2.5 italic">
                          {props.alt}
                        </figcaption>
                      )}
                    </figure>
                  ),
                  iframe: ({ node: _node, ...props }) => {
                    const src = props.src || '';
                    const isInstagram = src.includes('instagram.com');
                    const isShorts = src.includes('/shorts/') || (props.title && String(props.title).toLowerCase().includes('shorts'));
                    return (
                      <div className={`my-8 ${isInstagram ? 'max-w-[440px] mx-auto' : isShorts ? 'max-w-[380px] mx-auto' : 'w-full max-w-3xl mx-auto'}`}>
                        <div className={`overflow-hidden rounded-2xl border border-[#DDD4BC] bg-black shadow-md ${isInstagram ? 'h-[620px]' : isShorts ? 'aspect-[9/16]' : 'aspect-video'}`}>
                          <iframe
                            {...props}
                            className="w-full h-full border-0"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    );
                  },
                }}
              >
                {article.content}
              </ReactMarkdown>
            </article>

            {/* Share & Like actions */}
            <ShareButtons title={article.title} articleId={article.id} />

            {/* Full Author Bio Card */}
            <AuthorBio author={article.author} />

            {/* Related Research Articles */}
            <RelatedPosts currentArticle={article} allArticles={articles} />
          </main>
        </div>
      </div>

      {/* Universal Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={article.title}
        excerpt={article.excerpt || article.content}
        url={typeof window !== 'undefined' ? `${window.location.origin}/article/${article.slug}` : undefined}
      />
    </div>
  );
};
