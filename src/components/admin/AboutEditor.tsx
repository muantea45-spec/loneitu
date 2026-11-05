import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useBlog } from '../../context/BlogContext';
import { useToast } from '../common/Toast';
import type { AboutPageData, SocialLinks } from '../../types/blog';
import {
  Save,
  ExternalLink,
  BookOpen,
  Sparkles,
  Quote,
  CheckCircle2,
  RefreshCw,
  Share2,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Minus,
  Link2,
  Table as TableIcon,
  Eye,
  Edit3,
  ChevronDown,
  X,
  Plus,
  Info
} from 'lucide-react';
import {
  InstagramIcon,
  FacebookIcon,
  WhatsAppIcon,
  YouTubeIcon,
  TwitterIcon,
  SocialIconsRow
} from '../common/SocialIcons';

export const AboutEditor: React.FC = () => {
  const { aboutData, updateAboutData, isCloudSyncing } = useBlog();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<AboutPageData>(() => ({
    ...aboutData,
    socialLinks: {
      instagram: aboutData.socialLinks?.instagram || '',
      facebook: aboutData.socialLinks?.facebook || '',
      whatsapp: aboutData.socialLinks?.whatsapp || '',
      youtube: aboutData.socialLinks?.youtube || '',
      twitter: aboutData.socialLinks?.twitter || '',
    },
  }));

  const [isSaved, setIsSaved] = useState(false);

  // User-interaction guard: prevents background polling from reverting text while the user is typing
  const isDirtyRef = useRef(false);

  useEffect(() => {
    // Only accept external updates if user has NOT modified the form
    if (!isDirtyRef.current) {
      setFormData({
        ...aboutData,
        socialLinks: {
          instagram: aboutData.socialLinks?.instagram || '',
          facebook: aboutData.socialLinks?.facebook || '',
          whatsapp: aboutData.socialLinks?.whatsapp || '',
          youtube: aboutData.socialLinks?.youtube || '',
          twitter: aboutData.socialLinks?.twitter || '',
        },
      });
    }
  }, [aboutData]);

  const handleChange = (field: keyof AboutPageData, value: any) => {
    isDirtyRef.current = true;
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSocialChange = (network: keyof SocialLinks, value: string) => {
    isDirtyRef.current = true;
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [network]: value,
      },
    }));
    setIsSaved(false);
  };

  // Toolbar and preview states
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [isCustomTableModalOpen, setIsCustomTableModalOpen] = useState(false);
  const [customCols, setCustomCols] = useState(3);
  const [customRows, setCustomRows] = useState(3);

  // Column Configuration interface for manual column sizing
  interface ColumnConfig {
    name: string;
    width: number; // Percentage (e.g. 20, 50, 30)
  }

  const getDefaultColumns = (count: number): ColumnConfig[] => {
    if (count === 2) {
      return [
        { name: 'Thupui / Metric', width: 50 },
        { name: 'Dinhmun / Details', width: 50 }
      ];
    }
    if (count === 3) {
      return [
        { name: 'Sl No', width: 20 },
        { name: 'Thupui / Description', width: 50 },
        { name: 'Dinhmun / Status', width: 30 }
      ];
    }
    if (count === 4) {
      return [
        { name: 'Thlai / Item', width: 25 },
        { name: 'Hmun / Location', width: 25 },
        { name: 'Hmalakna', width: 30 },
        { name: 'Status', width: 20 }
      ];
    }
    if (count === 5) {
      return [
        { name: 'Sl No', width: 12 },
        { name: 'Thupui', width: 28 },
        { name: 'Hmun', width: 20 },
        { name: 'Hmalakna', width: 25 },
        { name: 'Status', width: 15 }
      ];
    }
    return Array.from({ length: count }, (_, i) => ({
      name: `Col ${i + 1}`,
      width: Math.round(100 / count)
    }));
  };

  const [columnsConfig, setColumnsConfig] = useState<ColumnConfig[]>(() => getDefaultColumns(3));

  const handleColsChange = (newCols: number) => {
    setCustomCols(newCols);
    setColumnsConfig(getDefaultColumns(newCols));
  };

  const updateColumnName = (index: number, name: string) => {
    setColumnsConfig(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], name };
      }
      return copy;
    });
  };

  const updateColumnWidth = (index: number, width: number) => {
    setColumnsConfig(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], width: Math.max(5, Math.min(95, width)) };
      }
      return copy;
    });
  };

  const applyEqualWidths = () => {
    const each = Math.round(100 / customCols);
    setColumnsConfig(prev => {
      return prev.map((col, idx) => ({
        ...col,
        width: idx === prev.length - 1 ? Math.max(5, 100 - each * (prev.length - 1)) : each
      }));
    });
  };

  const applyCompactFirstCol = () => {
    if (customCols === 2) {
      setColumnsConfig([
        { ...columnsConfig[0], width: 20 },
        { ...columnsConfig[1], width: 80 }
      ]);
    } else if (customCols === 3) {
      setColumnsConfig([
        { ...columnsConfig[0], width: 15 },
        { ...columnsConfig[1], width: 55 },
        { ...columnsConfig[2], width: 30 }
      ]);
    } else if (customCols === 4) {
      setColumnsConfig([
        { ...columnsConfig[0], width: 12 },
        { ...columnsConfig[1], width: 38 },
        { ...columnsConfig[2], width: 30 },
        { ...columnsConfig[3], width: 20 }
      ]);
    } else {
      const first = 10;
      const rest = Math.round((100 - first) / (customCols - 1));
      setColumnsConfig(prev => prev.map((col, idx) => ({
        ...col,
        width: idx === 0 ? first : idx === prev.length - 1 ? Math.max(5, 100 - first - rest * (prev.length - 2)) : rest
      })));
    }
  };

  const applyDominantMiddleCol = () => {
    if (customCols === 3) {
      setColumnsConfig([
        { ...columnsConfig[0], width: 20 },
        { ...columnsConfig[1], width: 60 },
        { ...columnsConfig[2], width: 20 }
      ]);
    } else if (customCols === 4) {
      setColumnsConfig([
        { ...columnsConfig[0], width: 15 },
        { ...columnsConfig[1], width: 45 },
        { ...columnsConfig[2], width: 25 },
        { ...columnsConfig[3], width: 15 }
      ]);
    } else {
      applyEqualWidths();
    }
  };

  const totalWidth = useMemo(() => {
    return columnsConfig.reduce((acc, c) => acc + (c.width || 0), 0);
  }, [columnsConfig]);

  const normalizeTo100 = () => {
    const currentSum = totalWidth;
    if (currentSum === 0) return;
    setColumnsConfig(prev => {
      let accumulated = 0;
      return prev.map((col, idx) => {
        if (idx === prev.length - 1) {
          return { ...col, width: Math.max(5, 100 - accumulated) };
        }
        const normalized = Math.max(5, Math.round((col.width / currentSum) * 100));
        accumulated += normalized;
        return { ...col, width: normalized };
      });
    });
  };

  // Formatting helpers
  const insertFormat = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}${defaultText}${suffix}`;

    const nextValue = text.substring(0, start) + replacement + text.substring(end);
    handleChange('editorialBody', nextValue);

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultText.length);
      }
    }, 0);
  };

  const insertLinePrefix = (prefix: string, defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || defaultText;
    
    const before = text.substring(0, start);
    const needsNewlineBefore = before.length > 0 && !before.endsWith('\n');
    const insertStr = `${needsNewlineBefore ? '\n' : ''}${prefix}${selected}\n`;

    const nextValue = text.substring(0, start) + insertStr + text.substring(end);
    handleChange('editorialBody', nextValue);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + (needsNewlineBefore ? 1 : 0) + prefix.length + selected.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const insertTextAtCursor = (content: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const needsNewlineBefore = before.length > 0 && !before.endsWith('\n');
    const insertStr = `${needsNewlineBefore ? '\n' : ''}${content}`;

    const nextValue = text.substring(0, start) + insertStr + text.substring(end);
    handleChange('editorialBody', nextValue);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertStr.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const insertCustomConfiguredTable = () => {
    const sum = totalWidth;
    const finalCols = columnsConfig.map(col => {
      if (sum === 100) return col;
      const norm = Math.round((col.width / (sum || 1)) * 100);
      return { ...col, width: norm };
    });

    const ths = finalCols.map(col => 
      `      <th style="width: ${col.width}%; padding: 10px 14px; text-align: left; border: 1px solid #DDD4BC;">${col.name || 'Header'}</th>`
    ).join('\n');

    const sampleRowCells = finalCols.map((col, cIdx) => 
      `      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Sample ${col.name || `Data ${cIdx + 1}`}</td>`
    ).join('\n');

    const rowsHtml = Array.from({ length: customRows }, (_, rIdx) => 
`    <tr>
${sampleRowCells.replace(/Sample/g, `Item ${rIdx + 1} -`)}
    </tr>`
    ).join('\n');

    const tableHtml = `\n<table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
  <thead>
    <tr style="background: #143520; color: #BFDC28;">
${ths}
    </tr>
  </thead>
  <tbody>
${rowsHtml}
  </tbody>
</table>\n\n`;

    insertTextAtCursor(tableHtml);
    showToast(`Table with ${customCols} custom-width columns inserted!`, 'success');
    setIsCustomTableModalOpen(false);
  };

  const insertTable = (_cols?: number, _rows?: number, presetType: 'standard' | 'comparison' | 'agronomy' = 'standard') => {
    let tableHtml = '';

    if (presetType === 'comparison') {
      tableHtml = `\n<table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
  <thead>
    <tr style="background: #143520; color: #BFDC28;">
      <th style="width: 50%; padding: 10px 14px; text-align: left; border: 1px solid #DDD4BC;">Hmanlai Dan (Traditional)</th>
      <th style="width: 50%; padding: 10px 14px; text-align: left; border: 1px solid #DDD4BC;">Loneitu Kalpui Dan (Modern Agro-Tech)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Kut hnathawh hahthlak</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Khawl leh automated monitoring</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Leitha tlem</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Soil test hmanga leitha pek</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Thlai hralhna harsa</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Direct market & digital registry</td>
    </tr>
  </tbody>
</table>\n\n`;
    } else if (presetType === 'agronomy') {
      tableHtml = `\n<table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
  <thead>
    <tr style="background: #143520; color: #BFDC28;">
      <th style="width: 25%; padding: 10px 14px; text-align: left; border: 1px solid #DDD4BC;">Thlai Hming</th>
      <th style="width: 25%; padding: 10px 14px; text-align: left; border: 1px solid #DDD4BC;">Hmun / District</th>
      <th style="width: 30%; padding: 10px 14px; text-align: left; border: 1px solid #DDD4BC;">Hmalakna</th>
      <th style="width: 20%; padding: 10px 14px; text-align: left; border: 1px solid #DDD4BC;">Dinhmun (Status)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Chawnpui Grape</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Champhai</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Drip Irrigation</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Ṭha tluang</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Dragon Fruit</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Kolasib</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Trellis support system</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Rah chhuak mek</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Assam Lemon</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Serchhip</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Organic composting</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Zirchianna kal mek</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Ginger (Sawhthing)</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Lunglei</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Value-added processing</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Hralh chhuah theih</td>
    </tr>
  </tbody>
</table>\n\n`;
    } else {
      tableHtml = `\n<table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
  <thead>
    <tr style="background: #143520; color: #BFDC28;">
      <th style="width: 20%; padding: 10px 14px; text-align: left; border: 1px solid #DDD4BC;">Sl No</th>
      <th style="width: 50%; padding: 10px 14px; text-align: left; border: 1px solid #DDD4BC;">Thupui / Description</th>
      <th style="width: 30%; padding: 10px 14px; text-align: left; border: 1px solid #DDD4BC;">Dinhmun / Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">1</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Sample research record</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Active</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">2</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Field survey update</td>
      <td style="padding: 10px 14px; border: 1px solid #DDD4BC;">Completed</td>
    </tr>
  </tbody>
</table>\n\n`;
    }

    insertTextAtCursor(tableHtml);
    showToast('Table inserted with balanced column widths!', 'success');
    setIsTableDropdownOpen(false);
    setIsCustomTableModalOpen(false);
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter link URL (e.g. https://...):', 'https://');
    if (!url) return;
    insertFormat('[', `](${url})`, 'Link Text');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        insertFormat('**', '**', 'Bold text');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        insertFormat('*', '*', 'Italic text');
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleInsertLink();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    isDirtyRef.current = false;
    updateAboutData(formData);
    setIsSaved(true);
    showToast('About page successfully updated & saved across all devices!', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#DDD4BC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#256B3A] mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Public Page Customization</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#143520]">
            Edit About & Editorial Manifesto Page
          </h1>
          <p className="text-xs text-[#8F7855] mt-1">
            Customize the editorial vision, manifesto copy, and optional social media links displayed at /about.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DDD4BC] text-[#54432C] hover:bg-[#F6F4EB] text-xs font-semibold transition-colors"
          >
            <span>View Live Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="submit"
            disabled={isCloudSyncing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isCloudSyncing ? (
              <RefreshCw className="w-4 h-4 text-[#BFDC28] animate-spin" />
            ) : isSaved ? (
              <CheckCircle2 className="w-4 h-4 text-[#BFDC28]" />
            ) : (
              <Save className="w-4 h-4 text-[#BFDC28]" />
            )}
            <span>{isCloudSyncing ? 'Syncing...' : isSaved ? 'Saved & Synced' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Section 1: Hero Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#EBE6D6] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#143520]">
              1. Hero Header & Mission Badge
            </h2>
            <p className="text-xs text-[#8F7855]">
              The prominent dark green banner displayed at the top of the About page
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Badge / Kicker Text
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={e => handleChange('badge', e.target.value)}
              placeholder="e.g. The Loneitu Manifesto — MIZORAM TAN"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-medium text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Main Hero Heading
            </label>
            <input
              type="text"
              value={formData.heroTitle}
              onChange={e => handleChange('heroTitle', e.target.value)}
              placeholder="e.g. Empowering Mizoram Farmers with Sustainable Agronomy & Agro-Tech."
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl font-serif font-bold text-base text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Hero Subtitle / Mission Summary
            </label>
            <textarea
              rows={3}
              value={formData.heroDescription}
              onChange={e => handleChange('heroDescription', e.target.value)}
              placeholder="Describe the overarching mission of Loneitu in 2-3 sentences..."
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] leading-relaxed focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 2: Editorial Purpose & Manifesto */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#EBE6D6] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#143520]">
              2. Editorial Purpose & Manifesto Text
            </h2>
            <p className="text-xs text-[#8F7855]">
              Detailed narrative explaining why Loneitu exists and what reading standard it sets
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
                Section Tag / Kicker
              </label>
              <input
                type="text"
                value={formData.editorialTag}
                onChange={e => handleChange('editorialTag', e.target.value)}
                placeholder="e.g. Our Editorial Purpose"
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-medium text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
                Section Headline
              </label>
              <input
                type="text"
                value={formData.editorialTitle}
                onChange={e => handleChange('editorialTitle', e.target.value)}
                placeholder="e.g. Why Modern Agriculture Requires a New Reading Standard"
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl font-serif font-bold text-sm text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                required
              />
            </div>
          </div>

          {/* Rich Content Editor with Toolbar & Live Preview */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C]">
                  Editorial Manifesto Content (Rich Text & Tables)
                </label>
                <p className="text-[11px] text-[#8F7855]">
                  Hman tangkai zung zung theih nan a hnuai toolbar hi hmang la, bold, italic, table etc dah rawh le.
                </p>
              </div>

              {/* Edit / Preview Toggle */}
              <div className="flex items-center bg-[#EBE6D6] p-1 rounded-xl self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setEditorMode('edit')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'edit'
                      ? 'bg-white text-[#143520] shadow-xs'
                      : 'text-[#6F5B3C] hover:text-[#143520]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('preview')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'preview'
                      ? 'bg-[#143520] text-[#BFDC28] shadow-xs'
                      : 'text-[#6F5B3C] hover:text-[#143520]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="p-2 bg-gradient-to-r from-[#FAF8F3] to-[#F4EFE6] border border-[#DDD4BC] rounded-t-2xl flex flex-wrap items-center gap-1 sm:gap-1.5">
              {/* Text styles */}
              <button
                type="button"
                onClick={() => insertFormat('**', '**', 'Bold text')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormat('*', '*', 'Italic text')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormat('~~', '~~', 'Strikethrough text')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-[#DDD4BC] mx-1" />

              {/* Headings */}
              <button
                type="button"
                onClick={() => insertLinePrefix('# ', 'Heading 1')}
                className="px-2 py-1.5 rounded-lg text-xs font-bold text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertLinePrefix('## ', 'Heading 2')}
                className="px-2 py-1.5 rounded-lg text-xs font-bold text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertLinePrefix('### ', 'Heading 3')}
                className="px-2 py-1.5 rounded-lg text-xs font-bold text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-[#DDD4BC] mx-1" />

              {/* Lists and Quotes */}
              <button
                type="button"
                onClick={() => insertLinePrefix('- ', 'List item')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertLinePrefix('1. ', 'List item')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertLinePrefix('> ', 'Quote callout')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormat('`', '`', 'code')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Inline Code"
              >
                <Code className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertTextAtCursor('\n\n---\n\n')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Horizontal Divider"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleInsertLink}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Insert Link (Ctrl+K)"
              >
                <Link2 className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-[#DDD4BC] mx-1" />

              {/* TABLE DROPDOWN & QUICK ACTIONS */}
              <div className="relative">
                <div className="inline-flex items-center rounded-xl bg-white border border-[#DDD4BC] shadow-2xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTableDropdownOpen(false);
                      setIsCustomTableModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-[#143520] hover:bg-[#F6F4EB] transition-colors cursor-pointer"
                    title="Insert Custom Table with Manual Column Sizing"
                  >
                    <TableIcon className="w-4 h-4 text-[#256B3A]" />
                    <span>Table</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
                    className="p-1.5 hover:bg-[#F6F4EB] border-l border-[#DDD4BC] text-[#143520] transition-colors cursor-pointer"
                    title="Table Templates & Custom Builder"
                    aria-expanded={isTableDropdownOpen}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Table Dropdown Menu */}
                {isTableDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-2xl border-2 border-emerald-300 shadow-xl z-30 p-2 space-y-1 animate-fadeIn">
                    <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#256B3A]">
                      Table Options
                    </div>

                    <button
                      type="button"
                      onClick={() => insertTable(3, 3, 'standard')}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-[#143520] hover:bg-[#F6F4EB] flex items-center justify-between cursor-pointer"
                    >
                      <span>Standard Table</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">3 x 3</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertTable(2, 3, 'comparison')}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-[#143520] hover:bg-[#F6F4EB] flex items-center justify-between cursor-pointer"
                    >
                      <span>Comparison Table</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">2 Cols</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertTable(4, 4, 'agronomy')}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-[#143520] hover:bg-[#F6F4EB] flex items-center justify-between cursor-pointer"
                    >
                      <span>Agronomy / Crop Status</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">4 Cols</span>
                    </button>

                    <div className="border-t border-[#EBE6D6] my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsTableDropdownOpen(false);
                        setIsCustomTableModalOpen(true);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-[#256B3A] hover:bg-emerald-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Custom Table Builder...</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Editor Canvas or Live Preview Panel */}
            {editorMode === 'edit' ? (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  rows={12}
                  value={formData.editorialBody}
                  onChange={e => handleChange('editorialBody', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write or edit the manifesto text... (Tip: Click Table to add tabular data)"
                  className="w-full p-4 bg-[#F6F4EB] border border-[#DDD4BC] rounded-b-2xl text-xs font-mono text-[#143520] leading-relaxed text-justify [text-align:justify] focus:outline-hidden focus:border-[#256B3A] shadow-inner"
                  required
                />
                <div className="flex items-center justify-between text-[11px] text-[#8F7855] px-2 pt-1 font-mono">
                  <span>Shortcuts: <strong>Ctrl+B</strong> (Bold), <strong>Ctrl+I</strong> (Italic), <strong>Ctrl+K</strong> (Link)</span>
                  <span>{formData.editorialBody.length} characters</span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white border border-[#DDD4BC] rounded-b-2xl shadow-inner min-h-[280px]">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#256B3A] text-xs font-bold mb-4">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Render Preview (Exact public view with tables)</span>
                </div>

                <div className="text-sm sm:text-base text-[#4A584E] leading-relaxed space-y-4 text-justify [text-align:justify]">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-justify [text-align:justify]" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-[#143520]" {...props} />,
                      em: ({ node, ...props }) => <em className="italic text-[#143520]" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1.5 my-3 text-justify [text-align:justify]" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1.5 my-3 text-justify [text-align:justify]" {...props} />,
                      li: ({ node, ...props }) => <li className="text-[#4A584E] text-justify [text-align:justify]" {...props} />,
                      table: ({ node, ...props }) => (
                        <div className="w-full overflow-x-auto my-6 rounded-2xl border border-[#DDD4BC] shadow-xs bg-white">
                          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-full" style={{ tableLayout: 'auto', ...props.style }} {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-[#143520] text-[#BFDC28] font-bold uppercase tracking-wider text-[11px] sm:text-xs" {...props} />
                      ),
                      tbody: ({ node, ...props }) => (
                        <tbody className="divide-y divide-[#EBE6D6]" {...props} />
                      ),
                      tr: ({ node, ...props }) => (
                        <tr className="hover:bg-[#F6F4EB]/70 transition-colors" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th className="py-3 px-4 sm:py-3.5 sm:px-5 font-bold border-b border-[#256B3A]/40 align-top" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="py-2.5 px-4 sm:py-3 sm:px-5 text-[#3B2E1D] align-top" {...props} />
                      ),
                      h1: ({ node, ...props }) => <h1 className="font-serif font-bold text-2xl text-[#143520] mt-6 mb-3" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="font-serif font-bold text-xl text-[#143520] mt-5 mb-2.5" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="font-serif font-bold text-lg text-[#143520] mt-4 mb-2" {...props} />,
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-[#256B3A] pl-4 py-2.5 my-4 italic text-[#143520] bg-[#F6F4EB] rounded-r-xl" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a className="text-[#256B3A] font-semibold hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                      ),
                      code: ({ node, inline, ...props }: any) => inline ? (
                        <code className="px-1.5 py-0.5 rounded bg-[#F6F4EB] text-[#143520] font-mono text-xs border border-[#DDD4BC]" {...props} />
                      ) : (
                        <pre className="p-4 rounded-xl bg-[#143520] text-emerald-100 font-mono text-xs overflow-x-auto my-3"><code {...props} /></pre>
                      ),
                      hr: () => <hr className="my-6 border-t border-[#DDD4BC]" />
                    }}
                  >
                    {formData.editorialBody || '*Manifesto text is currently empty.*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Featured Manifesto Quotation Callout (Optional)
            </label>
            <div className="relative">
              <Quote className="w-4 h-4 text-[#256B3A] absolute top-3 left-3" />
              <textarea
                rows={2}
                value={formData.quote || ''}
                onChange={e => handleChange('quote', e.target.value)}
                placeholder="Highlighted manifesto quote..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs italic text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Social Media Links (Simple Brand Logos - Not Mandatory) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#143520]">
                3. Social Media Logos & Links
              </h2>
              <p className="text-xs text-[#8F7855]">
                Displayed simply as clean, recognizable brand logos on the About page and footer. Completely optional.
              </p>
            </div>
          </div>

          {/* Live Preview of Active Logos */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8F7855] uppercase tracking-wider">Preview:</span>
            <SocialIconsRow links={formData.socialLinks} variant="light" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instagram */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
              <span className="text-[#E1306C]"><InstagramIcon className="w-4 h-4" /></span>
              <span>Instagram (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.socialLinks?.instagram || ''}
              onChange={e => handleSocialChange('instagram', e.target.value)}
              placeholder="https://instagram.com/yourhandle or @yourhandle"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
              <span className="text-[#1877F2]"><FacebookIcon className="w-4 h-4" /></span>
              <span>Facebook (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.socialLinks?.facebook || ''}
              onChange={e => handleSocialChange('facebook', e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
              <span className="text-[#25D366]"><WhatsAppIcon className="w-4 h-4" /></span>
              <span>WhatsApp (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.socialLinks?.whatsapp || ''}
              onChange={e => handleSocialChange('whatsapp', e.target.value)}
              placeholder="e.g. +91 9876543210 or https://wa.me/..."
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
              <span className="text-[#FF0000]"><YouTubeIcon className="w-4 h-4" /></span>
              <span>YouTube (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.socialLinks?.youtube || ''}
              onChange={e => handleSocialChange('youtube', e.target.value)}
              placeholder="https://youtube.com/@yourchannel"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>

          {/* X / Twitter */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
              <span className="text-[#143520]"><TwitterIcon className="w-4 h-4" /></span>
              <span>X / Twitter (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.socialLinks?.twitter || ''}
              onChange={e => handleSocialChange('twitter', e.target.value)}
              placeholder="https://x.com/yourhandle or @yourhandle"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Editorial Advisory & Research Team Headers */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#EBE6D6] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
            <span className="text-xs">04</span>
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#143520]">
              4. Authors & Researchers Section Headers
            </h2>
            <p className="text-xs text-[#8F7855]">
              Section titles for the contributing researcher cards rendered at the bottom of the About page
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Section Title
            </label>
            <input
              type="text"
              value={formData.authorsTitle}
              onChange={e => handleChange('authorsTitle', e.target.value)}
              placeholder="e.g. Contributing Agronomists & Field Researchers"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-medium text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Section Subtitle
            </label>
            <input
              type="text"
              value={formData.authorsSubtitle}
              onChange={e => handleChange('authorsSubtitle', e.target.value)}
              placeholder="e.g. Researchers and farmers authoring our peer-informed investigations"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>
        </div>

        <div className="p-4 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl flex items-start gap-3">
          <Info className="w-4 h-4 text-[#256B3A] shrink-0 mt-0.5" />
          <p className="text-xs text-[#54432C] leading-relaxed">
            <strong>Note:</strong> The individual author profiles, photos, and credentials displayed in this section are managed separately under the <strong>Authors & Contributors</strong> tab on the left sidebar.
          </p>
        </div>
      </div>

      {/* Bottom Floating/Sticky Save Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-md flex items-center justify-between gap-4 sticky bottom-4 z-20">
        <div className="text-xs text-[#6F5B3C] hidden sm:block">
          All changes are saved to Cloudflare KV and instantly available across all devices.
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="submit"
            disabled={isCloudSyncing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isCloudSyncing ? (
              <RefreshCw className="w-4 h-4 text-[#BFDC28] animate-spin" />
            ) : isSaved ? (
              <CheckCircle2 className="w-4 h-4 text-[#BFDC28]" />
            ) : (
              <Save className="w-4 h-4 text-[#BFDC28]" />
            )}
            <span>{isCloudSyncing ? 'Syncing...' : 'Save & Publish About Page'}</span>
          </button>
        </div>
      </div>

      {/* Custom Table Builder Modal with Manual Column Size Controls */}
      {isCustomTableModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 border-2 border-emerald-300 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#143520] text-[#BFDC28] flex items-center justify-center font-bold shadow-xs">
                  <TableIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#143520]">Custom Table & Column Sizing</h3>
                  <p className="text-xs text-[#8F7855]">Manually adjust column widths (%) and headers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomTableModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid Settings: Number of Columns and Rows */}
            <div className="grid grid-cols-2 gap-4 bg-[#FAF8F3] p-4 rounded-2xl border border-[#DDD4BC]">
              <div>
                <label className="block text-xs font-bold text-[#6F5B3C] mb-1.5">
                  Number of Columns (2 - 6)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleColsChange(Math.max(2, customCols - 1))}
                    disabled={customCols <= 2}
                    className="w-8 h-8 rounded-lg bg-white border border-[#DDD4BC] font-bold text-sm text-[#143520] hover:bg-[#F6F4EB] disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-[#143520] bg-white py-1 rounded-lg border border-[#DDD4BC]">
                    {customCols} Cols
                  </span>
                  <button
                    type="button"
                    onClick={() => handleColsChange(Math.min(6, customCols + 1))}
                    disabled={customCols >= 6}
                    className="w-8 h-8 rounded-lg bg-white border border-[#DDD4BC] font-bold text-sm text-[#143520] hover:bg-[#F6F4EB] disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6F5B3C] mb-1.5">
                  Number of Data Rows (1 - 10)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomRows(Math.max(1, customRows - 1))}
                    disabled={customRows <= 1}
                    className="w-8 h-8 rounded-lg bg-white border border-[#DDD4BC] font-bold text-sm text-[#143520] hover:bg-[#F6F4EB] disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-[#143520] bg-white py-1 rounded-lg border border-[#DDD4BC]">
                    {customRows} Rows
                  </span>
                  <button
                    type="button"
                    onClick={() => setCustomRows(Math.min(10, customRows + 1))}
                    disabled={customRows >= 10}
                    className="w-8 h-8 rounded-lg bg-white border border-[#DDD4BC] font-bold text-sm text-[#143520] hover:bg-[#F6F4EB] disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Preset Width Ratios */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#6F5B3C] uppercase tracking-wider text-[11px]">Quick Width Presets</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  totalWidth === 100 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Total Width: {totalWidth}% {totalWidth !== 100 && '(Auto-normalizes to 100%)'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={applyEqualWidths}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#DDD4BC] hover:border-[#256B3A] text-[#143520] hover:bg-[#F6F4EB] transition-colors cursor-pointer"
                >
                  Equal ({Math.round(100 / customCols)}% each)
                </button>
                <button
                  type="button"
                  onClick={applyCompactFirstCol}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#DDD4BC] hover:border-[#256B3A] text-[#143520] hover:bg-[#F6F4EB] transition-colors cursor-pointer"
                >
                  Compact 1st Col (15% Index / Serial)
                </button>
                <button
                  type="button"
                  onClick={applyDominantMiddleCol}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#DDD4BC] hover:border-[#256B3A] text-[#143520] hover:bg-[#F6F4EB] transition-colors cursor-pointer"
                >
                  Wide Content Col
                </button>
                {totalWidth !== 100 && (
                  <button
                    type="button"
                    onClick={normalizeTo100}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer ml-auto"
                  >
                    Normalize to 100%
                  </button>
                )}
              </div>
            </div>

            {/* Visual Proportion Bar Preview */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#8F7855] uppercase tracking-wider">Column Proportions Preview:</span>
              <div className="h-8 w-full rounded-xl overflow-hidden flex border border-[#DDD4BC] shadow-xs text-[10px] font-bold text-white text-center">
                {columnsConfig.map((col, idx) => {
                  const colors = ['bg-[#143520]', 'bg-[#256B3A]', 'bg-[#3A8D55]', 'bg-[#5CB578]', 'bg-[#82D099]', 'bg-[#B0E5C0]'];
                  return (
                    <div
                      key={idx}
                      style={{ width: `${(col.width / (totalWidth || 1)) * 100}%` }}
                      className={`${colors[idx % colors.length]} h-full flex items-center justify-center px-1 truncate transition-all duration-200 border-r border-white/20 last:border-r-0`}
                      title={`${col.name || `Col ${idx + 1}`}: ${col.width}%`}
                    >
                      <span className="truncate">{col.name || `Col ${idx + 1}`} ({col.width}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Column Sliders & Name Customizers */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-[#8F7855] uppercase tracking-wider">Configure Each Column Size:</span>
              {columnsConfig.map((col, idx) => (
                <div key={idx} className="p-3 bg-[#FAF8F3] rounded-xl border border-[#DDD4BC] space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-5 h-5 rounded-full bg-[#143520] text-[#BFDC28] text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => updateColumnName(idx, e.target.value)}
                        placeholder={`Column ${idx + 1} Title`}
                        className="flex-1 px-2.5 py-1 text-xs font-bold bg-white border border-[#DDD4BC] rounded-lg text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={5}
                        max={90}
                        value={col.width}
                        onChange={(e) => updateColumnWidth(idx, parseInt(e.target.value) || 10)}
                        className="w-16 px-2 py-1 text-xs font-bold text-center bg-white border border-[#DDD4BC] rounded-lg text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                      />
                      <span className="text-xs font-bold text-[#6F5B3C]">%</span>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={5}
                      max={85}
                      step={1}
                      value={col.width}
                      onChange={(e) => updateColumnWidth(idx, parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-[#DDD4BC] rounded-lg appearance-none cursor-pointer accent-[#256B3A]"
                    />
                    <span className="text-[11px] font-mono text-[#8F7855] w-10 text-right">{col.width}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#EBE6D6]">
              <div className="text-[11px] text-[#8F7855]">
                Generates editable <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">&lt;th style="width: ...%"&gt;</code> tags
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomTableModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD4BC] text-xs font-semibold text-[#54432C] hover:bg-[#F6F4EB] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertCustomConfiguredTable}
                  className="px-5 py-2 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <TableIcon className="w-3.5 h-3.5 text-[#BFDC28]" />
                  <span>Insert Table</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
