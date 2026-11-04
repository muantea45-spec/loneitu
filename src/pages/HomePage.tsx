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

  // Prominently display the newest blog post at the top of the main landing view/hero area
  const latestArticle = publishedArticles[0] || articles[0];

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Featured Lead Hero: displaying the latest post while preserving layout and position */}
      {latestArticle && <HeroFeatured article={latestArticle} />}

      {/* Dynamic Blog Grid */}
      <main className="flex-1">
        <BlogGrid articles={filteredArticles} />
      </main>
    </div>
  );
};

