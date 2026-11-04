import React from 'react';
import type { Author } from '../../types/blog';
import { Award, Building } from 'lucide-react';

interface AuthorBioProps {
  author: Author;
}

export const AuthorBio: React.FC<AuthorBioProps> = ({ author }) => {
  return (
    <div className="bg-[#F6F4EB] rounded-2xl border border-[#EBE6D6] p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
      <img
        src={author.avatar}
        alt={author.name}
        className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#256B3A]/30 shrink-0 shadow-sm"
      />
      <div className="space-y-2 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#143520] text-[#BFDC28]">
            Contributing Agronomist
          </span>
          {author.institution && (
            <span className="text-xs text-[#6F5B3C] flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-[#8F7855]" />
              {author.institution}
            </span>
          )}
        </div>
        <h4 className="font-serif font-bold text-xl text-[#143520]">
          {author.name}
        </h4>
        <div className="text-xs font-semibold text-[#256B3A] flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          <span>{author.role}</span>
        </div>
        <p className="text-xs sm:text-sm text-[#54432C] leading-relaxed pt-1">
          {author.bio}
        </p>
      </div>
    </div>
  );
};

