import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BlogProvider } from './context/BlogContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SidebarMenu } from './components/layout/SidebarMenu';
import { BookmarkDrawer } from './components/common/BookmarkDrawer';
import { SearchModal } from './components/common/SearchModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { CategoryArchivePage } from './pages/CategoryArchivePage';
import { TagArchivePage } from './pages/TagArchivePage';
import { AboutPage } from './pages/AboutPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

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

      {/* Main Page Routing */}
      <div className="flex-1">
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
