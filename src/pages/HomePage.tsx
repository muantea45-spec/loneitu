import React, { useEffect } from 'react';
import { HeroFeatured } from '../components/home/HeroFeatured';
import { BlogGrid } from '../components/home/BlogGrid';
import { useBlog } from '../context/BlogContext';

export const HomePage: React.FC = () => {
  const { filteredArticles, articles } = useBlog();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Loneitu — MIZORAM TAN';
  }, []);

  // Sort published articles by publication date (newest first)
  const publishedArticles = [...articles]
    .filter(a => a.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Only display the featured hero section if there is a published article explicitly marked as featured
  const featuredArticle = publishedArticles.find(a => a.isFeatured);

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Featured Lead Hero: only rendered if an article is explicitly marked as featured */}
      {featuredArticle && <HeroFeatured article={featuredArticle} />}

      {/* Dynamic Blog Grid */}
      <main className="flex-1">
        <BlogGrid articles={filteredArticles} />
      </main>
    </div>
  );
};
