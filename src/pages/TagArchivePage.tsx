import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Tag as TagIcon, BookOpen } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { BlogCard } from '../components/home/BlogCard';
import { slugify } from '../utils/slugify';

export const TagArchivePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { tags, articles } = useBlog();

  const currentSlug = (slug || '').toLowerCase();
  const tag = tags.find(t => t.slug.toLowerCase() === currentSlug || t.name.toLowerCase() === currentSlug);
  const tagName = tag ? tag.name : currentSlug;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `#${tagName} — Agronomic Practice Index`;
  }, [slug, tagName]);

  const matchingArticles = articles.filter(
    a =>
      a.status === 'published' &&
      a.tags.some(
        t => t.toLowerCase() === tagName.toLowerCase() || slugify(t) === currentSlug
      )
  );

  return (
    <div className="w-full min-h-screen bg-[#FBFBF8] pb-16">
      {/* Tag Hero Header */}
      <div className="w-full bg-[#F6F4EB] border-b border-[#EBE6D6] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#8F7855]">
            <Link to="/" className="hover:text-[#143520] transition-colors">
              Journal
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Practice Tags</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#256B3A] font-semibold">#{tagName}</span>
          </nav>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#EBF1EA] text-[#256B3A]">
              <TagIcon className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#143520]">
              #{tagName}
            </h1>
            <span className="text-xs px-3 py-1 rounded-full bg-[#EBE6D6] text-[#3B2E1D] font-mono">
              {matchingArticles.length} publication{matchingArticles.length === 1 ? '' : 's'}
            </span>
          </div>

          <p className="text-sm text-[#54432C] max-w-2xl leading-relaxed">
            {tag?.description ||
              `Empirical investigations, field trials, and case studies focused on #${tagName} methodologies across temperate, tropical, and arid growing regions.`}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#EBE6D6]">
          <h2 className="font-serif font-bold text-2xl text-[#143520]">
            Articles Tagged with #{tagName}
          </h2>
          <Link
            to="/"
            className="text-xs font-semibold text-[#256B3A] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View All Practices</span>
          </Link>
        </div>

        {matchingArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#DDD4BC] p-8 max-w-md mx-auto space-y-4">
            <BookOpen className="w-10 h-10 mx-auto text-[#8F7855]" />
            <h3 className="font-serif font-bold text-lg text-[#143520]">
              No publications currently found with #{tagName}
            </h3>
            <p className="text-xs text-[#6F5B3C]">
              Try exploring related agronomic tags like #SoilHealth, #DripIrrigation, or #Silvopasture.
            </p>
            <Link
              to="/"
              className="inline-block px-4 py-2 bg-[#143520] text-white text-xs font-semibold rounded-xl"
            >
              Back to Journal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matchingArticles.map(art => (
              <BlogCard key={art.id} article={art} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

