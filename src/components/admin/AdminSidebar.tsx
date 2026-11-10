import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  FolderTree, 
  Tags, 
  Users, 
  RotateCcw, 
  Info, 
  PanelBottom, 
  Calendar, 
  Contact,
  ChevronDown,
  Check,
  BarChart3,
} from 'lucide-react';

export type AdminTab = 'overview' | 'articles' | 'new-article' | 'edit-article' | 'farmers' | 'analytics' | 'categories' | 'tags' | 'authors' | 'about' | 'footer' | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  articlesCount: number;
  farmersCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  articlesCount,
  farmersCount,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const navItems = [
    {
      id: 'overview' as AdminTab,
      label: 'Editorial Overview',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'articles' as AdminTab,
      label: 'Article Repository',
      shortLabel: 'Articles',
      icon: FileText,
      badge: articlesCount,
    },
    {
      id: 'new-article' as AdminTab,
      label: 'Draft New Article',
      shortLabel: 'Draft',
      icon: PlusCircle,
      highlight: true,
    },
    {
      id: 'farmers' as AdminTab,
      label: 'Registry of Farmers',
      shortLabel: 'Farmers',
      icon: Contact,
      badge: farmersCount,
      highlight: true,
    },
    {
      id: 'analytics' as AdminTab,
      label: 'District Analytics & Reports',
      shortLabel: 'Analytics',
      icon: BarChart3,
      badge: farmersCount,
      highlight: true,
    },
    {
      id: 'categories' as AdminTab,
      label: 'Sector Categories',
      shortLabel: 'Categories',
      icon: FolderTree,
    },
    {
      id: 'tags' as AdminTab,
      label: 'Taxonomy Tags',
      shortLabel: 'Tags',
      icon: Tags,
    },
    {
      id: 'authors' as AdminTab,
      label: 'Staff & Team Members',
      shortLabel: 'Staff',
      icon: Users,
    },
    {
      id: 'about' as AdminTab,
      label: 'Edit About Page',
      shortLabel: 'About',
      icon: Info,
    },
    {
      id: 'footer' as AdminTab,
      label: 'Edit Footer Banner',
      shortLabel: 'Footer',
      icon: PanelBottom,
    },
    {
      id: 'settings' as AdminTab,
      label: 'Seed & Settings',
      shortLabel: 'Settings',
      icon: RotateCcw,
    },
  ];

  const activeItem = navItems.find(item => 
    item.id === currentTab || (item.id === 'new-article' && currentTab === 'edit-article')
  ) || navItems[0];
  const ActiveIcon = activeItem.icon;

  const quickShortcuts: AdminTab[] = ['overview', 'articles', 'farmers', 'analytics', 'new-article'];

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#DDD4BC] p-2.5 md:p-4 shrink-0">
      {/* MOBILE VIEW: Dropdown Selector + 4 Quick Shortcuts (NO HORIZONTAL SCROLL) */}
      <div className="block md:hidden" ref={dropdownRef}>
        {/* Main Section Selector Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#143520] to-[#256B3A] text-white shadow-md active:scale-[0.99] transition-all cursor-pointer"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="flex items-center gap-2.5 truncate">
              <ActiveIcon className="w-4 h-4 text-[#BFDC28] shrink-0" />
              <span className="text-xs font-black truncate tracking-wide">{activeItem.label}</span>
              {activeItem.badge !== undefined && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-black shrink-0">
                  {activeItem.badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-emerald-200 text-[11px] font-bold shrink-0 ml-2">
              <span>Switch</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown Menu of All 10 Sections */}
          {isMobileMenuOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl p-2 border-2 border-emerald-300 shadow-2xl space-y-1 max-h-80 overflow-y-auto animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#143520]/60 border-b border-emerald-100 mb-1 flex items-center justify-between">
                <span>Select Admin Console Section</span>
                <span>{navItems.length} Sections</span>
              </div>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id || (item.id === 'new-article' && currentTab === 'edit-article');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#143520] text-white shadow-xs'
                        : item.highlight
                          ? 'bg-[#F2F7F3] text-[#256B3A] hover:bg-[#DFEDE3]'
                          : 'text-[#54432C] hover:bg-[#F6F4EB] hover:text-[#143520]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#BFDC28]' : 'text-[#256B3A]'}`} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge !== undefined && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#EBE6D6] text-[#6F5B3C]'}`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <Check className="w-3.5 h-3.5 text-[#BFDC28]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4 Quick Access Shortcuts */}
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {quickShortcuts.map(tabId => {
            const item = navItems.find(n => n.id === tabId)!;
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'new-article' && currentTab === 'edit-article');
            return (
              <button
                key={tabId}
                onClick={() => {
                  onSelectTab(tabId);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#143520] text-white shadow-xs'
                    : 'bg-[#F6F4EB] text-[#54432C] hover:bg-[#DFEDE3] hover:text-[#143520]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#BFDC28]' : 'text-[#256B3A]'}`} />
                  {item.badge !== undefined && Number(item.badge) > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 text-[8px] font-black px-1 rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-1 truncate max-w-[65px]">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP VIEW: Left Vertical Sidebar (UNCHANGED) */}
      <div className="hidden md:flex md:flex-col space-y-1 py-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            currentTab === item.id ||
            (item.id === 'new-article' && currentTab === 'edit-article');

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 w-full cursor-pointer whitespace-nowrap ${isActive
                ? 'bg-[#143520] text-white shadow-xs'
                : item.highlight
                  ? 'bg-[#F2F7F3] text-[#256B3A] hover:bg-[#DFEDE3]'
                  : 'text-[#54432C] hover:bg-[#F6F4EB] hover:text-[#143520]'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#BFDC28]' : ''}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ml-2 ${isActive ? 'bg-white/20 text-white' : 'bg-[#EBE6D6] text-[#6F5B3C]'
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="hidden md:block pt-4 mt-4 border-t border-[#EBE6D6] space-y-1">
        <a
          href="/archive"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#6F5B3C] hover:text-[#143520] hover:bg-[#F6F4EB] rounded-xl transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-[#256B3A]" />
          <span>View Public Archive ↗</span>
        </a>
      </div>
    </aside>
  );
};
