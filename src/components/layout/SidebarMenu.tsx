import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Sprout, Search, ArrowRight, Tag as TagIcon, Home, Info, FolderTree, Calendar } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { SocialIconsRow } from '../common/SocialIcons';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  onOpenBookmarks?: () => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
}) => {
  const { categories, tags, articles, aboutData } = useBlog();
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FBFBF8] border-l border-[#DDD4BC] shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Top section with scroll */}
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="p-5 border-b border-[#EBE6D6] flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#143520] text-white flex items-center justify-center shadow-xs">
                  <Sprout className="w-5 h-5 text-[#BFDC28]" />
                </div>
                <div>
                  <span className="font-serif font-bold text-xl text-[#143520] block leading-tight">
                    Loneitu
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-[#8F7855] uppercase">
                    MIZORAM TAN
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#8F7855] hover:text-[#13341D] rounded-xl hover:bg-[#F6F4EB] transition-colors cursor-pointer"
                aria-label="Close sidebar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-4 bg-[#F6F4EB] border-b border-[#EBE6D6]">
              <button
                onClick={() => {
                  onClose();
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs font-semibold text-[#13341D] hover:bg-[#EBE6D6] transition-colors cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4 text-[#256B3A]" />
                <span>Zawnna (Search Articles)</span>
              </button>
            </div>

            {/* Main Navigation Links */}
            <div className="p-4 space-y-1 border-b border-[#EBE6D6]">
              <Link
                to="/"
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === '/'
                    ? 'bg-[#EBF1EA] text-[#143520]'
                    : 'text-[#3B2E1D] hover:bg-[#F6F4EB]'
                }`}
              >
                <Home className="w-4 h-4 text-[#256B3A]" />
                <span>Home</span>
              </Link>
              <Link
                to="/archive"
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname.startsWith('/archive')
                    ? 'bg-[#EBF1EA] text-[#143520]'
                    : 'text-[#3B2E1D] hover:bg-[#F6F4EB]'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#256B3A]" />
                <span>Archive</span>
              </Link>
              <Link
                to="/about"
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === '/about'
                    ? 'bg-[#EBF1EA] text-[#143520]'
                    : 'text-[#3B2E1D] hover:bg-[#F6F4EB]'
                }`}
              >
                <Info className="w-4 h-4 text-[#256B3A]" />
                <span>About</span>
              </Link>
            </div>

            {/* Category Archives / Sectors */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F7855] flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-[#256B3A]" />
                  <span>Thlur Bing Zawngte (Sectors)</span>
                </span>
                <span className="text-[10px] font-mono text-[#8F7855]">{categories.length} sectors</span>
              </div>

              <div className="space-y-1.5">
                {categories.map(cat => {
                  const count = articles.filter(
                    a => a.status === 'published' && a.category.toLowerCase() === cat.name.toLowerCase()
                  ).length;

                  return (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#EBE6D6] hover:border-[#32864A] hover:bg-white bg-[#FDFCF9] transition-all group shadow-2xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-[#143520] group-hover:text-[#256B3A] truncate">
                          {cat.name}
                        </div>
                        <div className="text-[11px] text-[#6F5B3C] line-clamp-1 mt-0.5">
                          {cat.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF1EA] text-[#1E542E] font-medium">
                          {count}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8F7855] group-hover:text-[#256B3A] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Popular Practice Tags */}
            <div className="p-4 pt-2 border-t border-[#EBE6D6]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8F7855] mb-2 px-1 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-[#256B3A]" />
                <span>Hmalak Dan Tag-te (Practice Tags)</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <Link
                    key={t.id}
                    to={`/tag/${t.slug}`}
                    onClick={onClose}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-[#EBE6D6] text-[#3B2E1D] hover:bg-[#256B3A] hover:text-white transition-colors"
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Media Links (Simple Brand Logos Only) */}
            {aboutData?.socialLinks && Object.values(aboutData.socialLinks).some(v => !!v && v.trim() !== '') && (
              <div className="p-4 border-t border-[#EBE6D6] bg-[#F6F4EB]/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8F7855] mb-2 px-1">
                  Connect With Loneitu
                </p>
                <SocialIconsRow links={aboutData.socialLinks} variant="light" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

