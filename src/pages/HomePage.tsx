import React, { useEffect } from 'react';
import { CompanyBanner } from '../components/home/CompanyBanner';
import { BlogGrid } from '../components/home/BlogGrid';
import { useBlog } from '../context/BlogContext';

export const HomePage: React.FC = () => {
  const { filteredArticles } = useBlog();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Loneitu — MIZORAM TAN';
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Hardcoded full-width Company About Us Banner in place of Featured */}
      <CompanyBanner />

      {/* Dynamic Blog Grid */}
      <main className="flex-1">
        <BlogGrid articles={filteredArticles} />
      </main>
    </div>
  );
};
