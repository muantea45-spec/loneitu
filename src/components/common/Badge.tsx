import React from 'react';
import { Sprout, Cpu, Flower2, ShieldCheck, Leaf, Landmark, Tag as TagIcon } from 'lucide-react';

interface BadgeProps {
  label: string;
  type?: 'category' | 'tag' | 'status' | 'default';
  icon?: string;
  color?: string;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  type = 'default',
  icon,
  onClick,
  className = '',
  size = 'md',
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'Sprout':
        return <Sprout className="w-3.5 h-3.5 mr-1" />;
      case 'Cpu':
        return <Cpu className="w-3.5 h-3.5 mr-1" />;
      case 'Flower2':
        return <Flower2 className="w-3.5 h-3.5 mr-1" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-3.5 h-3.5 mr-1" />;
      case 'Leaf':
        return <Leaf className="w-3.5 h-3.5 mr-1" />;
      case 'Landmark':
        return <Landmark className="w-3.5 h-3.5 mr-1" />;
      default:
        if (type === 'tag') return <TagIcon className="w-3 h-3 mr-1 opacity-70" />;
        return null;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  let styleClasses = 'bg-[#EBE6D6] text-[#3B2E1D] hover:bg-[#DDD4BC]';

  if (type === 'category') {
    styleClasses = 'bg-[#143520] text-[#EBF1EA] hover:bg-[#1E542E] shadow-xs';
  } else if (type === 'tag') {
    styleClasses = 'bg-[#F2F7F3] text-[#1E542E] border border-[#BFDC28]/30 hover:border-[#1E542E] hover:bg-[#DFEDE3]';
  } else if (type === 'status') {
    if (label.toLowerCase() === 'published') {
      styleClasses = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    } else {
      styleClasses = 'bg-amber-100 text-amber-800 border border-amber-300';
    }
  }

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center font-medium rounded-full transition-all duration-150 cursor-pointer ${sizeClasses} ${styleClasses} ${className}`}
    >
      {getIcon()}
      <span>{type === 'tag' && !label.startsWith('#') ? `#${label}` : label}</span>
    </Component>
  );
};

