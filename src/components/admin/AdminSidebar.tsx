import React from 'react';
import { LayoutDashboard, FileText, PlusCircle, FolderTree, Tags, Users, RotateCcw, Info, PanelBottom } from 'lucide-react';

export type AdminTab = 'overview' | 'articles' | 'new-article' | 'edit-article' | 'categories' | 'tags' | 'authors' | 'about' | 'footer' | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  articlesCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  articlesCount,
}) => {
  const navItems = [
    {
      id: 'overview' as AdminTab,
      label: 'Editorial Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'articles' as AdminTab,
      label: 'Article Repository',
      icon: FileText,
      badge: articlesCount,
    },
    {
      id: 'new-article' as AdminTab,
      label: 'Draft New Article',
      icon: PlusCircle,
      highlight: true,
    },
    {
      id: 'categories' as AdminTab,
      label: 'Sector Categories',
      icon: FolderTree,
    },
    {
      id: 'tags' as AdminTab,
      label: 'Taxonomy Tags',
      icon: Tags,
    },
    {
      id: 'authors' as AdminTab,
      label: 'Authors & Contributors',
      icon: Users,
    },
    {
      id: 'about' as AdminTab,
      label: 'Edit About Page',
      icon: Info,
    },
    {
      id: 'footer' as AdminTab,
      label: 'Edit Footer Banner',
      icon: PanelBottom,
    },
    {
      id: 'settings' as AdminTab,
      label: 'Seed & Settings',
      icon: RotateCcw,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#DDD4BC] p-2.5 md:p-4 shrink-0">
      <div className="flex md:flex-col overflow-x-auto no-scrollbar gap-1.5 md:space-y-1 py-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            currentTab === item.id ||
            (item.id === 'new-article' && currentTab === 'edit-article');

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center justify-between px-3.5 py-2 md:py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 shrink-0 md:w-full cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#143520] text-white shadow-xs'
                  : item.highlight
                  ? 'bg-[#F2F7F3] text-[#256B3A] hover:bg-[#DFEDE3]'
                  : 'text-[#54432C] hover:bg-[#F6F4EB] hover:text-[#143520]'
              }`}
            >
              <div className="flex items-center gap-2 md:gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#BFDC28]' : ''}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ml-2 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#EBE6D6] text-[#6F5B3C]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
