import React, { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BlogProvider } from './context/BlogContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SidebarMenu } from './components/layout/SidebarMenu';
import { BookmarkDrawer } from './components/common/BookmarkDrawer';
import { SearchModal } from './components/common/SearchModal';

// Fast Initial Load: Primary homepage is statically imported
import { HomePage } from './pages/HomePage';

// Code Splitting: Lazy-load heavier routes to keep initial bundle ultra-fast
const ArticleDetailPage = React.lazy(() => import('./pages/ArticleDetailPage').then(m => ({ default: m.ArticleDetailPage })));
const CategoryArchivePage = React.lazy(() => import('./pages/CategoryArchivePage').then(m => ({ default: m.CategoryArchivePage })));
const TagArchivePage = React.lazy(() => import('./pages/TagArchivePage').then(m => ({ default: m.TagArchivePage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 text-[#143520]">
    <div className="w-8 h-8 border-3 border-[#256B3A]/20 border-t-[#256B3A] rounded-full animate-spin mb-3" />
    <span className="text-xs font-semibold text-[#8F7855] tracking-wide">Chhiar zung zung rawh le...</span>
  </div>
);

const AppLayout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF8] text-[#1E2922]">
      {/* Public Navbar (omitted on admin pages for distraction-free console) */}
      {!isAdminRoute && (
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
          onOpenSidebarMenu={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Main Page Routing with Suspense code-splitting */}
      <div className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/thuziak-thar" element={<HomePage />} />
            <Route path="/article/:slug" element={<ArticleDetailPage />} />
            <Route path="/category/:slug" element={<CategoryArchivePage />} />
            <Route path="/tag/:slug" element={<TagArchivePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </div>

      {/* Public Footer */}
      {!isAdminRoute && <Footer />}

      {/* Modals & Drawers */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <BookmarkDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
      />

      <SidebarMenu
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
      />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <BlogProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </BlogProvider>
    </BrowserRouter>
  );
}

export default App;
