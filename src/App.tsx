import React, { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { BlogProvider, useBlog } from './context/BlogContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SidebarMenu } from './components/layout/SidebarMenu';
import { SearchModal } from './components/common/SearchModal';
import { OfflineBanner } from './components/common/OfflineBanner';
import { PullToRefresh } from './components/common/PullToRefresh';

// Fast Initial Load: Primary homepage is statically imported
import { HomePage } from './pages/HomePage';

// Code Splitting: Lazy-load heavier routes to keep initial bundle ultra-fast
const ArticleDetailPage = React.lazy(() => import('./pages/ArticleDetailPage').then(m => ({ default: m.ArticleDetailPage })));
const CategoryArchivePage = React.lazy(() => import('./pages/CategoryArchivePage').then(m => ({ default: m.CategoryArchivePage })));
const TagArchivePage = React.lazy(() => import('./pages/TagArchivePage').then(m => ({ default: m.TagArchivePage })));
const ArchivePage = React.lazy(() => import('./pages/ArchivePage').then(m => ({ default: m.ArchivePage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 text-[#143520]">
    <div className="w-8 h-8 border-3 border-[#256B3A]/20 border-t-[#256B3A] rounded-full animate-spin mb-3" />
    <span className="text-xs font-semibold text-[#6F5B3C] tracking-wide">Chhiar zung zung rawh le...</span>
  </div>
);

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#DDD4BC] shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="font-serif font-bold text-xl text-[#143520]">
              Page Refresh Required
            </h2>
            <p className="text-xs text-[#6F5B3C] leading-relaxed">
              Khawngaihin page hi refresh la, i lut nawn leh dawn nia.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Refresh Page
              </button>
              <a
                href="/"
                className="px-5 py-2.5 rounded-xl bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#143520] font-bold text-xs transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppLayout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { fetchCloudDb } = useBlog();

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <PullToRefresh onRefresh={fetchCloudDb} disabled={isAdminRoute}>
      <div className="min-h-screen flex flex-col bg-[#FBFBF8] text-[#1E2922]">
        {/* Public Navbar (omitted on admin pages for distraction-free console) */}
        {!isAdminRoute && (
          <Navbar
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSidebarMenu={() => setIsSidebarOpen(true)}
          />
        )}

        {/* Main Page Routing with Suspense and ErrorBoundary */}
        <div className="flex-1">
          <AppErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/thuziak-thar" element={<HomePage />} />
                <Route path="/article/:slug" element={<ArticleDetailPage />} />
                <Route path="/category/:slug" element={<CategoryArchivePage />} />
                <Route path="/tag/:slug" element={<TagArchivePage />} />
                <Route path="/archive" element={<ArchivePage />} />
                <Route path="/archive/:year" element={<ArchivePage />} />
                <Route path="/archive/:year/:month" element={<ArchivePage />} />
                <Route path="/archive/:year/:month/:day" element={<ArchivePage />} />
                <Route path="/archives" element={<ArchivePage />} />
                <Route path="/farmers" element={<Navigate to="/admin" replace />} />
                <Route path="/farmer-registry" element={<Navigate to="/admin" replace />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/admin/*" element={<AdminDashboardPage />} />
                <Route path="/dev" element={<Navigate to="/" replace />} />
                <Route path="/dev/*" element={<Navigate to="/" replace />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Suspense>
          </AppErrorBoundary>
        </div>

        {/* Public Footer */}
        {!isAdminRoute && <Footer />}

        {/* Modals & Drawers */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        <SidebarMenu
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Offline Field Connectivity Monitor */}
        <OfflineBanner />
      </div>
    </PullToRefresh>
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
