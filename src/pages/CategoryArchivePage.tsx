import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, FolderTree, BookOpen, Sprout } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { BlogCard } from '../components/home/BlogCard';
import { slugify } from '../utils/slugify';

export const CategoryArchivePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories, articles } = useBlog();

  const category = categories.find(c => c.slug === slug || slugify(c.name) === slug);

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {}
    if (category) {
      document.title = `${category.name} — Agronomy Research & Field Notes`;
    }
  }, [slug, category]);

  if (!category) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-[#DDD4BC] space-y-4">
          <FolderTree className="w-12 h-12 mx-auto text-[#6F5B3C]" />
          <h2 className="font-serif font-bold text-2xl text-[#143520]">
            Agricultural Sector Not Found
          </h2>
          <p className="text-xs text-[#6F5B3C]">
            The requested category could not be resolved in the current taxonomy index.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143520] text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Journal Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const matchingArticles = articles.filter(
    a =>
      a.status === 'published' &&
      (a.category.toLowerCase() === category.name.toLowerCase() ||
        slugify(a.category) === category.slug)
  );

  return (
    <div className="w-full min-h-screen bg-[#FBFBF8] pb-16">
      {/* Sector Archive Hero Banner */}
      <div className="w-full bg-gradient-to-b from-[#143520] to-[#1E542E] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#256B3A]">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#ADC6A7]">
            <Link to="/" className="hover:text-white transition-colors">
              Journal
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#D7E3D5]">Sector Archives</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#BFDC28] font-semibold">{category.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#BFDC28] text-[#143520]">
              <Sprout className="w-3.5 h-3.5" />
              Specialized Agricultural Domain
            </span>
            <span className="text-xs text-[#D7E3D5] px-2.5 py-1 rounded-full bg-white/10 font-mono">
              {matchingArticles.length} active research paper{matchingArticles.length === 1 ? '' : 's'}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {category.name}
          </h1>

          <p className="text-base sm:text-lg text-[#D7E3D5] max-w-3xl leading-relaxed font-light">
            {category.description}
          </p>
        </div>
      </div>

      {/* Grid of Articles in this Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#EBE6D6]">
          <h2 className="font-serif font-bold text-2xl text-[#143520]">
            Curated Studies & Field Protocols
          </h2>
          <Link
            to="/"
            className="text-xs font-semibold text-[#256B3A] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse All Sectors</span>
          </Link>
        </div>

        {matchingArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#DDD4BC] p-8 max-w-md mx-auto space-y-4">
            <BookOpen className="w-10 h-10 mx-auto text-[#6F5B3C]" />
            <h3 className="font-serif font-bold text-lg text-[#143520]">
              No articles currently filed under this sector
            </h3>
            <p className="text-xs text-[#6F5B3C]">
              New investigations for {category.name} are currently being peer-reviewed. Check back soon or browse other agricultural domains.
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

