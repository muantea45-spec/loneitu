import React, { useState, useEffect } from 'react';
import { ListFilter } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse markdown or HTML headings
    const lines = content.split('\n');
    const parsedHeadings: TOCItem[] = [];

    // 1. Try markdown headings
    lines.forEach(line => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const rawText = match[2].trim().replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/_/g, '');
        const id = rawText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        parsedHeadings.push({
          id,
          text: rawText,
          level,
        });
      }
    });

    // 2. Try HTML headings if no markdown headings found
    if (parsedHeadings.length === 0) {
      const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
      let htmlMatch: RegExpExecArray | null;
      while ((htmlMatch = headingRegex.exec(content)) !== null) {
        const level = parseInt(htmlMatch[1], 10);
        const rawText = htmlMatch[2].replace(/<[^>]*>/g, '').trim();
        if (rawText) {
          const id = rawText
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          parsedHeadings.push({
            id,
            text: rawText,
            level,
          });
        }
      }
    }

    setHeadings(parsedHeadings);
    if (parsedHeadings.length > 0) {
      setActiveId(parsedHeadings[0].id);
    }
  }, [content]);

  // Observer for active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="p-5 bg-[#F6F4EB] rounded-2xl border border-[#EBE6D6] space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#143520] pb-2 border-b border-[#DDD4BC]">
        <ListFilter className="w-4 h-4 text-[#256B3A]" />
        <span>Thuziak thar Chhungchang</span>
      </div>
      <ul className="space-y-2 text-xs">
        {headings.map(h => {
          const isActive = activeId === h.id;
          return (
            <li
              key={h.id}
              className={`${h.level === 3 ? 'pl-3.5 border-l border-[#DDD4BC]' : ''}`}
            >
              <button
                onClick={() => scrollToHeading(h.id)}
                className={`text-left transition-colors duration-150 block w-full py-0.5 cursor-pointer leading-snug ${
                  isActive
                    ? 'text-[#143520] font-bold underline decoration-[#256B3A] decoration-2 underline-offset-2'
                    : 'text-[#6F5B3C] hover:text-[#143520]'
                }`}
              >
                {h.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

