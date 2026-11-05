import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useBlog } from '../../context/BlogContext';
import { useToast } from '../common/Toast';
import type { AboutPageData, SocialLinks, CustomCardItem, CustomCardSectionData } from '../../types/blog';
import { INITIAL_ABOUT_DATA } from '../../data/initialData';
import { compressImage } from '../../utils/imageCompressor';
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
  CornerDownLeft,
  ListIndentIncrease,
  Info,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Users,
  LayoutGrid,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Search,
  Check,
  Layers,
  Camera
} from 'lucide-react';
import {
  InstagramIcon,
  FacebookIcon,
  WhatsAppIcon,
  YouTubeIcon,
  TwitterIcon,
  SocialIconsRow
} from '../common/SocialIcons';

function getStaffCardDetails(card: any) {
  const name = card.name || card.title || '';
  const designation = card.designation || card.columnValues?.['col-location'] || card.subtitle || '';
  const portfolio = card.portfolio || card.columnValues?.['col-contact'] || '';
  const qualification = card.qualification || card.columnValues?.['col-status'] || card.badge || '';
  const experience = card.experience || card.columnValues?.['col-1793872810199'] || card.columnValues?.['col-desc'] || card.description || '';
  const avatar = card.avatar || card.image || '';
  return { name, designation, portfolio, qualification, experience, avatar };
}

export const AboutEditor: React.FC = () => {
  const { aboutData, updateAboutData, isCloudSyncing, uploadImage } = useBlog();
  const { showToast } = useToast();

  const initialCardsSection: CustomCardSectionData = aboutData.customCardsSection || INITIAL_ABOUT_DATA.customCardsSection || {
    enabled: true,
    tag: 'Staff & Team Specialists',
    title: 'Staff & Specialists of the Firm',
    subtitle: 'The dedicated agronomists, researchers, officers, and field specialists of the firm.',
    columns: [
      { id: 'col-role', name: 'Role / Designation', type: 'text' },
      { id: 'col-dept', name: 'Subtitle / Division', type: 'text' },
      { id: 'col-location', name: 'Station / District', type: 'text' },
      { id: 'col-contact', name: 'Contact / Phone', type: 'text' },
      { id: 'col-status', name: 'Status', type: 'badge' },
      { id: 'col-desc', name: 'Description / Bio', type: 'text' },
    ],
    cards: [],
  };

  const [formData, setFormData] = useState<AboutPageData>(() => ({
    ...aboutData,
    customCardsSection: aboutData.customCardsSection || initialCardsSection,
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
        customCardsSection: aboutData.customCardsSection || initialCardsSection,
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

  // --- Card View & Column Data Entry States ---
  const currentCardsSection: CustomCardSectionData = formData.customCardsSection || initialCardsSection;
  const [adminCardSearch, setAdminCardSearch] = useState('');

  // Card modal state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardName, setCardName] = useState('');
  const [cardDesignation, setCardDesignation] = useState('');
  const [cardPortfolio, setCardPortfolio] = useState('');
  const [cardQualification, setCardQualification] = useState('');
  const [cardExperience, setCardExperience] = useState('');
  const [cardAvatar, setCardAvatar] = useState('');
  const [isCardImageUploading, setIsCardImageUploading] = useState(false);
  const cardFileInputRef = useRef<HTMLInputElement>(null);

  const updateCardsSection = (updates: Partial<CustomCardSectionData>) => {
    isDirtyRef.current = true;
    const nextSection: CustomCardSectionData = {
      ...currentCardsSection,
      ...updates,
    };
    handleChange('customCardsSection', nextSection);
  };

  const handleOpenAddCard = () => {
    setEditingCardId(null);
    setCardName('');
    setCardDesignation('');
    setCardPortfolio('');
    setCardQualification('');
    setCardExperience('');
    setCardAvatar('');
    setIsCardModalOpen(true);
  };

  const handleOpenEditCard = (card: CustomCardItem) => {
    setEditingCardId(card.id);
    const details = getStaffCardDetails(card);
    setCardName(details.name);
    setCardDesignation(details.designation);
    setCardPortfolio(details.portfolio);
    setCardQualification(details.qualification);
    setCardExperience(details.experience);
    setCardAvatar(details.avatar);
    setIsCardModalOpen(true);
  };

  const handleSaveCard = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cardName.trim()) {
      showToast('Please provide a name for the staff member.', 'error');
      return;
    }

    const cards = [...(currentCardsSection.cards || [])];
    const cardData: CustomCardItem = {
      id: editingCardId || `card-${Date.now()}`,
      name: cardName.trim(),
      designation: cardDesignation.trim(),
      portfolio: cardPortfolio.trim(),
      qualification: cardQualification.trim(),
      experience: cardExperience.trim(),
      avatar: cardAvatar.trim(),
      title: cardName.trim(),
      subtitle: cardDesignation.trim(),
      badge: cardQualification.trim(),
      description: cardExperience.trim(),
      image: cardAvatar.trim(),
      columnValues: {
        'col-location': cardDesignation.trim(),
        'col-contact': cardPortfolio.trim(),
        'col-status': cardQualification.trim(),
        'col-1793872810199': cardExperience.trim(),
      },
    };

    if (editingCardId) {
      const idx = cards.findIndex(c => c.id === editingCardId);
      if (idx !== -1) {
        cards[idx] = cardData;
      }
      showToast(`Staff card "${cardName}" updated!`, 'success');
    } else {
      cards.push(cardData);
      showToast(`New staff card "${cardName}" added!`, 'success');
    }

    updateCardsSection({ cards });
    setIsCardModalOpen(false);
  };

  const handleDeleteCard = (cardId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete card "${title}"?`)) return;
    const cards = (currentCardsSection.cards || []).filter(c => c.id !== cardId);
    updateCardsSection({ cards });
    showToast(`Card "${title}" deleted.`, 'success');
  };

  const handleDuplicateCard = (card: CustomCardItem) => {
    const cards = [...(currentCardsSection.cards || [])];
    const details = getStaffCardDetails(card);
    const newCard: CustomCardItem = {
      ...card,
      id: `card-${Date.now()}`,
      name: `${details.name} (Copy)`,
      title: `${details.name} (Copy)`,
      designation: details.designation,
      portfolio: details.portfolio,
      qualification: details.qualification,
      experience: details.experience,
      avatar: details.avatar,
    };
    cards.push(newCard);
    updateCardsSection({ cards });
    showToast(`Duplicated "${details.name}"`, 'success');
  };

  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const cards = [...(currentCardsSection.cards || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= cards.length) return;
    const temp = cards[index];
    cards[index] = cards[targetIdx];
    cards[targetIdx] = temp;
    updateCardsSection({ cards });
  };

  const handleCardAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }

    setIsCardImageUploading(true);
    try {
      const result = await compressImage(file, 500, 0.85);
      const cdnUrl = await uploadImage(result.dataUrl, file.name);
      setCardAvatar(cdnUrl);
      showToast('Circular avatar uploaded successfully!', 'success');
    } catch {
      showToast('Failed to upload avatar. Please try again.', 'error');
    } finally {
      setIsCardImageUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Toolbar and preview states
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [isCustomTableModalOpen, setIsCustomTableModalOpen] = useState(false);
  const [customCols, setCustomCols] = useState(3);
  const [customRows, setCustomRows] = useState(3);
  const [tableOutputFormat, setTableOutputFormat] = useState<'markdown' | 'html'>('markdown');

  // Column Configuration interface for manual column sizing and alignment
  interface ColumnConfig {
    name: string;
    width: number; // Percentage (e.g. 20, 50, 30)
    align?: 'left' | 'center' | 'right';
  }

  const getDefaultColumns = (count: number): ColumnConfig[] => {
    if (count === 2) {
      return [
        { name: 'Thupui / Metric', width: 50, align: 'left' },
        { name: 'Dinhmun / Details', width: 50, align: 'left' }
      ];
    }
    if (count === 3) {
      return [
        { name: 'Sl No', width: 20, align: 'left' },
        { name: 'Thupui / Description', width: 50, align: 'left' },
        { name: 'Dinhmun / Status', width: 30, align: 'left' }
      ];
    }
    if (count === 4) {
      return [
        { name: 'Thlai / Item', width: 25, align: 'left' },
        { name: 'Hmun / Location', width: 25, align: 'left' },
        { name: 'Hmalakna', width: 30, align: 'left' },
        { name: 'Status', width: 20, align: 'left' }
      ];
    }
    if (count === 5) {
      return [
        { name: 'Sl No', width: 12, align: 'left' },
        { name: 'Thupui', width: 28, align: 'left' },
        { name: 'Hmun', width: 20, align: 'left' },
        { name: 'Hmalakna', width: 25, align: 'left' },
        { name: 'Status', width: 15, align: 'left' }
      ];
    }
    return Array.from({ length: count }, (_, i) => ({
      name: `Col ${i + 1}`,
      width: Math.round(100 / count),
      align: 'left' as const
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

  const updateColumnAlign = (index: number, align: 'left' | 'center' | 'right') => {
    setColumnsConfig(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], align };
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

    const savedScrollTop = textarea.scrollTop;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}${defaultText}${suffix}`;

    const newStart = start + prefix.length;
    const newEnd = selected ? end + prefix.length : newStart + defaultText.length;

    const nextValue = text.substring(0, start) + replacement + text.substring(end);
    handleChange('editorialBody', nextValue);

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.setSelectionRange(newStart, newEnd);
        textareaRef.current.scrollTop = savedScrollTop;
      }
    });
  };

  const insertLinePrefix = (prefix: string, defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const savedScrollTop = textarea.scrollTop;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || defaultText;
    
    const before = text.substring(0, start);
    const needsNewlineBefore = before.length > 0 && !before.endsWith('\n');
    const insertStr = `${needsNewlineBefore ? '\n' : ''}${prefix}${selected}\n`;

    const newPos = start + (needsNewlineBefore ? 1 : 0) + prefix.length + selected.length;

    const nextValue = text.substring(0, start) + insertStr + text.substring(end);
    handleChange('editorialBody', nextValue);

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.scrollTop = savedScrollTop;
      }
    });
  };

  const insertTextAtCursor = (content: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const savedScrollTop = textarea.scrollTop;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const needsNewlineBefore = before.length > 0 && !before.endsWith('\n');
    const insertStr = `${needsNewlineBefore ? '\n' : ''}${content}`;

    const newPos = start + insertStr.length;

    const nextValue = text.substring(0, start) + insertStr + text.substring(end);
    handleChange('editorialBody', nextValue);

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.scrollTop = savedScrollTop;
      }
    });
  };

  const handleInsertTab = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const savedScrollTop = textarea.scrollTop;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const tabSpaces = '    '; // 4 spaces for clean indentation

    const nextValue = text.substring(0, start) + tabSpaces + text.substring(end);
    handleChange('editorialBody', nextValue);

    const newPos = start + tabSpaces.length;
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.scrollTop = savedScrollTop;
      }
    });
  };

  const handleInsertNewParagraph = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const savedScrollTop = textarea.scrollTop;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // Ensure 2 newlines (\n\n) so markdown and preview render a true separate paragraph
    const before = text.substring(0, start);
    let insertStr = '\n\n';
    if (before.endsWith('\n\n')) {
      insertStr = '\n';
    } else if (before.endsWith('\n')) {
      insertStr = '\n';
    }

    const nextValue = text.substring(0, start) + insertStr + text.substring(end);
    handleChange('editorialBody', nextValue);

    const newPos = start + insertStr.length;
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.scrollTop = savedScrollTop;
      }
    });
  };

  const insertCustomConfiguredTable = () => {
    if (tableOutputFormat === 'markdown') {
      const headerRow = `| ${columnsConfig.map(c => c.name || 'Header').join(' | ')} |`;
      const separatorRow = `| ${columnsConfig.map(c => {
        if (c.align === 'center') return ':---:';
        if (c.align === 'right') return '---:';
        return ':---';
      }).join(' | ')} |`;

      const rows = Array.from({ length: customRows }, (_, rIdx) => {
        const cells = columnsConfig.map((c, cIdx) => `Sample ${c.name || `Data ${cIdx + 1}`} ${rIdx + 1}`);
        return `| ${cells.join(' | ')} |`;
      }).join('\n');

      const tableMarkdown = `\n${headerRow}\n${separatorRow}\n${rows}\n\n`;
      insertTextAtCursor(tableMarkdown);
      showToast(`Clean Markdown table with ${customCols} columns inserted!`, 'success');
      setIsCustomTableModalOpen(false);
      return;
    }

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

  const insertStaffCardTemplate = () => {
    const template = `\n<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 24px 0;">
  <div style="background: white; border: 1px solid #DDD4BC; border-radius: 20px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    <div style="display: flex; gap: 16px; align-items: center;">
      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" style="width: 72px; height: 72px; border-radius: 16px; object-fit: cover;" alt="Staff Photo" />
      <div>
        <h4 style="margin: 0; font-weight: bold; color: #143520; font-size: 16px;">Staff Member Name</h4>
        <div style="color: #256B3A; font-weight: 700; font-size: 12px; margin-top: 4px;">Role / Designation</div>
        <div style="color: #8F7855; font-size: 11px;">Department / Specialization</div>
      </div>
    </div>
    <p style="margin: 12px 0 0 0; font-size: 12px; color: #54432C; line-height: 1.6;">Brief profile describing field responsibilities, agricultural expertise, or qualifications.</p>
  </div>
</div>\n\n`;
    insertTextAtCursor(template);
    showToast('Interactive Staff Card template inserted into canvas!', 'success');
    setIsTableDropdownOpen(false);
  };

  const insertTable = (_cols?: number, _rows?: number, presetType: 'standard' | 'comparison' | 'agronomy' = 'standard') => {
    let tableMarkdown = '';

    if (presetType === 'comparison') {
      tableMarkdown = `\n| Hmanlai Dan (Traditional) | Loneitu Kalpui Dan (Modern Agro-Tech) |
| :--- | :--- |
| Kut hnathawh hahthlak | Khawl leh automated monitoring |
| Leitha tlem | Soil test hmanga leitha pek |
| Thlai hralhna harsa | Direct market & digital registry |\n\n`;
    } else if (presetType === 'agronomy') {
      tableMarkdown = `\n| Thlai Hming | Hmun / District | Hmalakna | Dinhmun (Status) |
| :--- | :--- | :--- | :--- |
| Chawnpui Grape | Champhai | Drip Irrigation | Ṭha tluang |
| Dragon Fruit | Kolasib | Trellis support system | Rah chhuak mek |
| Assam Lemon | Serchhip | Organic composting | Zirchianna kal mek |
| Ginger (Sawhthing) | Lunglei | Value-added processing | Hralh chhuah theih |\n\n`;
    } else {
      tableMarkdown = `\n| Sl No | Thupui / Description | Dinhmun / Status |
| :--- | :--- | :--- |
| 1 | Sample research record | Active |
| 2 | Field survey update | Completed |\n\n`;
    }

    insertTextAtCursor(tableMarkdown);
    showToast('Clean Markdown table inserted! Edit cells directly between the | bars.', 'success');
    setIsTableDropdownOpen(false);
    setIsCustomTableModalOpen(false);
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter link URL (e.g. https://...):', 'https://');
    if (!url) return;
    insertFormat('[', `](${url})`, 'Link Text');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Check if cursor is currently on a Markdown table line
    const start = textarea.selectionStart;
    const text = textarea.value;
    const lastNewline = text.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const nextNewline = text.indexOf('\n', start);
    const lineEnd = nextNewline === -1 ? text.length : nextNewline;
    const currentLine = text.substring(lineStart, lineEnd);
    const isTableLine = currentLine.trim().startsWith('|');

    // 1. Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      if (isTableLine) {
        // Inside a table: insert " | " to quickly advance to or create the next column cell
        const savedScrollTop = textarea.scrollTop;
        const separator = ' | ';
        const nextValue = text.substring(0, start) + separator + text.substring(textarea.selectionEnd);
        handleChange('editorialBody', nextValue);
        const newPos = start + separator.length;
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.focus({ preventScroll: true });
            textareaRef.current.setSelectionRange(newPos, newPos);
            textareaRef.current.scrollTop = savedScrollTop;
          }
        });
      } else {
        // Normal text: insert 4 spaces indent
        handleInsertTab();
      }
      return;
    }

    // 2. Enter key
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (isTableLine) {
        const trimmed = currentLine.trim();
        // If the line is only '|' or '| ' (user finished entering table data and hit Enter on an empty row)
        if (trimmed === '|' || trimmed === '||' || trimmed === '| ' || trimmed === '| :--- |') {
          // Clean up the empty table row and exit table with paragraph break
          const savedScrollTop = textarea.scrollTop;
          const nextValue = text.substring(0, lineStart) + '\n\n' + text.substring(lineEnd);
          handleChange('editorialBody', nextValue);
          const newPos = lineStart + 2;
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.focus({ preventScroll: true });
              textareaRef.current.setSelectionRange(newPos, newPos);
              textareaRef.current.scrollTop = savedScrollTop;
            }
          });
        } else {
          // Inside a table row: hitting Enter starts the next table row with '| '
          const savedScrollTop = textarea.scrollTop;
          const nextRowPrefix = '\n| ';
          const nextValue = text.substring(0, start) + nextRowPrefix + text.substring(textarea.selectionEnd);
          handleChange('editorialBody', nextValue);
          const newPos = start + nextRowPrefix.length;
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.focus({ preventScroll: true });
              textareaRef.current.setSelectionRange(newPos, newPos);
              textareaRef.current.scrollTop = savedScrollTop;
            }
          });
        }
      } else {
        // Normal text: insert a new paragraph break (\n\n)
        handleInsertNewParagraph();
      }
      return;
    }

    // 3. Shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+K (Link)
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
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertFormat('**', '**', 'Bold text')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertFormat('*', '*', 'Italic text')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
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
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertLinePrefix('# ', 'Heading 1')}
                className="px-2 py-1.5 rounded-lg text-xs font-bold text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertLinePrefix('## ', 'Heading 2')}
                className="px-2 py-1.5 rounded-lg text-xs font-bold text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertLinePrefix('### ', 'Heading 3')}
                className="px-2 py-1.5 rounded-lg text-xs font-bold text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-[#DDD4BC] mx-1" />

              {/* Tab Indent & New Paragraph Action Buttons */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleInsertTab}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Insert Tab Indent (4 spaces or Tab key)"
              >
                <ListIndentIncrease className="w-3.5 h-3.5 text-[#256B3A]" />
                <span>Tab</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleInsertNewParagraph}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="New Paragraph (Enter)"
              >
                <CornerDownLeft className="w-3.5 h-3.5 text-[#256B3A]" />
                <span>New Para</span>
              </button>

              <div className="h-5 w-px bg-[#DDD4BC] mx-1" />

              {/* Lists and Quotes */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertLinePrefix('- ', 'List item')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertLinePrefix('1. ', 'List item')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertLinePrefix('> ', 'Quote callout')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertFormat('`', '`', 'code')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Inline Code"
              >
                <Code className="w-4 h-4" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertTextAtCursor('\n\n---\n\n')}
                className="p-2 rounded-lg text-[#143520] hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DDD4BC] transition-all cursor-pointer"
                title="Horizontal Divider"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
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
                    onMouseDown={(e) => e.preventDefault()}
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
                    onMouseDown={(e) => e.preventDefault()}
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

                    <div className="border-t border-[#EBE6D6] my-1" />

                    <button
                      type="button"
                      onClick={insertStaffCardTemplate}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-[#143520] hover:bg-[#F6F4EB] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#256B3A]" />
                        <span>Staff Card Template</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">Photo+Role</span>
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
                  <span>Shortcuts: <strong>Ctrl+B</strong> (Bold), <strong>Ctrl+I</strong> (Italic), <strong>Tab</strong> (Indent / Table Cell), <strong>Enter</strong> (New Para / Next Row)</span>
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
                      p: ({ node, ...props }) => <p className="mb-5 leading-relaxed text-justify [text-align:justify] whitespace-pre-line" {...props} />,
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

      {/* Section 3: Custom Card Directory (Editable Title & Dynamic Columns) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE6D6] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
              <span className="text-xs">03</span>
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#143520] flex items-center gap-2">
                <span>3. Custom Card Directory & Data Entry</span>
                <span className="px-2 py-0.5 rounded-md bg-[#BFDC28]/30 text-[#143520] text-[10px] font-black uppercase">
                  Card View
                </span>
              </h2>
              <p className="text-xs text-[#8F7855]">
                Manage cards, editable section title, and add custom columns that appear on each card on the About page.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-[#143520] cursor-pointer self-start sm:self-auto bg-[#F6F4EB] px-3 py-1.5 rounded-xl border border-[#DDD4BC]">
            <input
              type="checkbox"
              checked={currentCardsSection.enabled !== false}
              onChange={e => updateCardsSection({ enabled: e.target.checked })}
              className="w-4 h-4 text-[#256B3A] rounded border-[#DDD4BC] focus:ring-[#256B3A] cursor-pointer"
            />
            <span>Show on About Us page</span>
          </label>
        </div>

        {/* Section Title & Subtitle Inputs */}
        <div className="p-4 bg-[#FBFBF8] rounded-2xl border border-[#DDD4BC] space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#256B3A] flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>Section Headers (Public View)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                Section Tag / Badge
              </label>
              <input
                type="text"
                value={currentCardsSection.tag || ''}
                onChange={e => updateCardsSection({ tag: e.target.value })}
                placeholder="e.g. Operational Units & Field Stations"
                className="w-full px-3 py-2 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                Section Title * (Editable)
              </label>
              <input
                type="text"
                value={currentCardsSection.title || ''}
                onChange={e => updateCardsSection({ title: e.target.value })}
                placeholder="e.g. Our Specialist Units & Field Stations"
                className="w-full px-3 py-2 bg-white border border-[#DDD4BC] rounded-xl text-xs font-semibold text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={currentCardsSection.subtitle || ''}
                onChange={e => updateCardsSection({ subtitle: e.target.value })}
                placeholder="e.g. Explore our registered agricultural branches, nodal officers, and facilities."
                className="w-full px-3 py-2 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              />
            </div>
          </div>
        </div>

        {/* Staff Cards Management & Data Entry */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#143520]">
                Staff Members ({currentCardsSection.cards?.length || 0})
              </span>
              <span className="text-[11px] text-[#8F7855]">
                Card View Preview
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8F7855] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminCardSearch}
                  onChange={e => setAdminCardSearch(e.target.value)}
                  placeholder="Filter staff..."
                  className="pl-8 pr-2.5 py-1.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A] w-40"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenAddCard}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#256B3A] hover:bg-[#1E542E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#BFDC28]" />
                <span>Add Staff Card</span>
              </button>
            </div>
          </div>

          {/* Cards Grid / Mobile Slideable Track */}
          {(() => {
            const list = currentCardsSection.cards || [];
            const filtered = adminCardSearch.trim()
              ? list.filter(c => {
                  const d = getStaffCardDetails(c);
                  const q = adminCardSearch.toLowerCase();
                  return (
                    d.name.toLowerCase().includes(q) ||
                    d.designation.toLowerCase().includes(q) ||
                    d.portfolio.toLowerCase().includes(q) ||
                    d.qualification.toLowerCase().includes(q) ||
                    d.experience.toLowerCase().includes(q)
                  );
                })
              : list;

            if (filtered.length === 0) {
              return (
                <div className="p-8 text-center bg-[#FBFBF8] rounded-2xl border-2 border-dashed border-[#DDD4BC] space-y-2">
                  <LayoutGrid className="w-8 h-8 text-[#8F7855] mx-auto opacity-60" />
                  <div className="text-xs font-bold text-[#143520]">No staff cards found</div>
                  <p className="text-[11px] text-[#8F7855]">
                    Click "+ Add Staff Card" to add your first card entry.
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-2">
                {filtered.length > 1 && (
                  <div className="flex sm:hidden items-center justify-between px-1 text-[11px] text-[#8F7855] font-medium">
                    <span>← Swipe cards to view staff →</span>
                    <span className="font-bold text-[#256B3A]">{filtered.length} Cards</span>
                  </div>
                )}

                <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 -mx-2 px-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:overflow-visible scrollbar-none">
                  {filtered.map((card, idx) => {
                    const details = getStaffCardDetails(card);
                    return (
                      <div
                        key={card.id}
                        className="min-w-[85vw] max-w-[88vw] snap-center shrink-0 sm:min-w-0 sm:max-w-none sm:shrink bg-white rounded-2xl border border-[#DDD4BC] shadow-xs flex flex-col justify-between overflow-hidden hover:border-[#256B3A]/40 transition-all"
                      >
                        <div className="p-4 space-y-3">
                          {/* Top Row: Name on Left + Circular Avatar on Top-Right */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 pr-1">
                              <h4 className="font-serif font-bold text-base sm:text-lg text-[#143520] leading-snug tracking-tight break-words">
                                {details.name}
                              </h4>
                            </div>

                            {/* Small Circular Avatar */}
                            <div className="shrink-0">
                              {details.avatar ? (
                                <img
                                  src={details.avatar}
                                  alt={details.name}
                                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#256B3A]/30 shadow-xs"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-[#EBF1EA] ring-2 ring-[#256B3A]/20 flex items-center justify-center text-[#256B3A] font-bold text-sm">
                                  {details.name ? details.name.charAt(0).toUpperCase() : 'S'}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Aligned middle rows: DESIGNATION, PORTFOLIO, QUALIFICATION */}
                          <div className="pt-2 border-t border-[#EBE6D6] space-y-1.5 text-xs">
                            {details.designation && (
                              <div className="grid grid-cols-[105px_1fr] gap-2 py-1 border-b border-[#F2ECE1] items-baseline">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F7855] shrink-0 text-left">
                                  DESIGNATION:
                                </span>
                                <span className="font-semibold text-[#143520] text-left break-words">
                                  {details.designation}
                                </span>
                              </div>
                            )}

                            {details.portfolio && (
                              <div className="grid grid-cols-[105px_1fr] gap-2 py-1 border-b border-[#F2ECE1] items-baseline">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F7855] shrink-0 text-left">
                                  PORTFOLIO:
                                </span>
                                <span className="font-semibold text-[#143520] text-left break-words">
                                  {details.portfolio}
                                </span>
                              </div>
                            )}

                            {details.qualification && (
                              <div className="grid grid-cols-[105px_1fr] gap-2 py-1 border-b border-[#F2ECE1] items-baseline">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F7855] shrink-0 text-left">
                                  QUALIFICATION:
                                </span>
                                <span className="font-semibold text-[#143520] text-left break-words">
                                  {details.qualification}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* PROFESSIONAL EXPERIENCE: New line, full width */}
                          {details.experience && (
                            <div className="pt-2 border-t border-[#EBE6D6]">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F7855] block mb-1 text-left">
                                PROFESSIONAL EXPERIENCE:
                              </span>
                              <p className="w-full text-justify [text-align:justify] text-[11px] text-[#54432C] leading-relaxed whitespace-pre-line line-clamp-3">
                                {details.experience}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Bar */}
                        <div className="p-2.5 bg-[#FBFBF8] border-t border-[#EBE6D6] flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveCard(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 text-[#8F7855] hover:text-[#143520] rounded-lg hover:bg-white disabled:opacity-30 cursor-pointer"
                              title="Move card left / up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveCard(idx, 'down')}
                              disabled={idx === filtered.length - 1}
                              className="p-1.5 text-[#8F7855] hover:text-[#143520] rounded-lg hover:bg-white disabled:opacity-30 cursor-pointer"
                              title="Move card right / down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateCard(card)}
                              className="p-1.5 text-[#8F7855] hover:text-[#143520] rounded-lg hover:bg-white cursor-pointer"
                              title="Duplicate card"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCard(card)}
                              className="p-1.5 text-[#256B3A] hover:bg-[#EBF1EA] rounded-lg cursor-pointer"
                              title="Edit card"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCard(card.id, details.name)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Delete card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Section 4: Social Media Links (Simple Brand Logos - Not Mandatory) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#143520]">
                4. Social Media Logos & Links
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

      {/* Section 5: Staff & Team Specialists Headers */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#EBE6D6] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
            <span className="text-xs">05</span>
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#143520]">
              5. Staff & Specialists Section Headers
            </h2>
            <p className="text-xs text-[#8F7855]">
              Section titles for the staff and team member cards rendered at the bottom of the About page
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
              placeholder="e.g. Staff & Agricultural Specialists of the Firm"
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
              placeholder="e.g. The dedicated agronomists, researchers, and field specialists of the firm."
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>
        </div>

        <div className="p-4 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl flex items-start gap-3">
          <Info className="w-4 h-4 text-[#256B3A] shrink-0 mt-0.5" />
          <p className="text-xs text-[#54432C] leading-relaxed">
            <strong>Note:</strong> The individual staff profiles, photos, and credentials displayed in this section are managed separately under the <strong>Staff & Team Members</strong> tab on the left sidebar.
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

      {/* Custom Table Builder Modal with Markdown & HTML support */}
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
                  <h3 className="font-serif font-bold text-lg text-[#143520]">Custom Table Builder</h3>
                  <p className="text-xs text-[#8F7855]">
                    {tableOutputFormat === 'markdown'
                      ? 'Clean Markdown pipe table — easy to fill and edit in text canvas'
                      : 'Advanced HTML table with custom column width percentages'}
                  </p>
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

            {/* Format Selector: Markdown (Option 3) vs HTML */}
            <div className="flex items-center gap-2 bg-[#F6F4EB] p-1.5 rounded-2xl border border-[#DDD4BC]">
              <button
                type="button"
                onClick={() => setTableOutputFormat('markdown')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tableOutputFormat === 'markdown'
                    ? 'bg-[#143520] text-[#BFDC28] shadow-xs'
                    : 'text-[#6F5B3C] hover:text-[#143520]'
                }`}
              >
                <span>Clean Markdown Table (| ... |)</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#BFDC28]/20 text-[#BFDC28] rounded-md uppercase font-bold">Recommended</span>
              </button>
              <button
                type="button"
                onClick={() => setTableOutputFormat('html')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tableOutputFormat === 'html'
                    ? 'bg-[#143520] text-[#BFDC28] shadow-xs'
                    : 'text-[#6F5B3C] hover:text-[#143520]'
                }`}
              >
                <span>HTML Table (% Width)</span>
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

            {tableOutputFormat === 'markdown' ? (
              <>
                {/* Column Headers & Alignment for Markdown */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  <span className="text-[11px] font-bold text-[#8F7855] uppercase tracking-wider">Configure Column Titles & Alignment:</span>
                  {columnsConfig.map((col, idx) => (
                    <div key={idx} className="p-3 bg-[#FAF8F3] rounded-xl border border-[#DDD4BC] flex items-center justify-between gap-3">
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

                      {/* Alignment Buttons */}
                      <div className="flex items-center bg-white border border-[#DDD4BC] rounded-lg p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateColumnAlign(idx, 'left')}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            (col.align || 'left') === 'left' ? 'bg-[#143520] text-[#BFDC28]' : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title="Align Left (:---)"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateColumnAlign(idx, 'center')}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            col.align === 'center' ? 'bg-[#143520] text-[#BFDC28]' : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title="Align Center (:---:)"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateColumnAlign(idx, 'right')}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            col.align === 'right' ? 'bg-[#143520] text-[#BFDC28]' : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title="Align Right (---:)"
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Helpful Tip Card for Easy Data Entry */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-[#143520] flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#256B3A] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-[#143520]">Effortless Data Entry in Canvas:</p>
                    <p className="text-[11px] text-[#256B3A] leading-relaxed">
                      Once inserted, simply type or edit text between the <code className="bg-white px-1 py-0.5 rounded font-mono font-bold text-slate-800">|</code> bars. Press <kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono font-bold text-[10px]">Tab</kbd> to jump between cells (<code className="bg-white px-1 py-0.5 rounded font-mono font-bold text-slate-800"> | </code>) and <kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono font-bold text-[10px]">Enter</kbd> to automatically start the next row!
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Preset Width Ratios for HTML */}
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
              </>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#EBE6D6]">
              <div className="text-[11px] text-[#8F7855]">
                {tableOutputFormat === 'markdown' ? (
                  <span>Inserts clean Markdown pipes <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">| Col 1 | Col 2 |</code> — no messy HTML</span>
                ) : (
                  <span>Generates HTML <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">&lt;th style="width: ...%"&gt;</code> tags</span>
                )}
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


      {/* Staff Card Entry Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#DDD4BC] shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#143520] flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#256B3A]" />
                <span>{editingCardId ? 'Edit Staff Member' : 'Add New Staff Member'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="p-1.5 text-[#8F7855] hover:text-[#143520] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Top Row: NAME on Left + Small Circular Avatar at Top-Right Corner */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#143520] mb-1.5">
                    NAME * (Staff Full Name)
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    placeholder="e.g. Dr. C. Lalhriatpuia"
                    className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-sm font-bold text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                    required
                  />
                  <p className="text-[10px] text-[#8F7855] mt-1">
                    Displayed prominently in bold as the main title on the card.
                  </p>
                </div>

                {/* Small Circular Option for Avatar Upload at the right corner */}
                <div className="flex flex-col items-center shrink-0">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8F7855] mb-1">
                    AVATAR
                  </label>
                  <div
                    onClick={() => cardFileInputRef.current?.click()}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-[#256B3A]/40 hover:border-[#256B3A] bg-[#F6F4EB] flex items-center justify-center cursor-pointer relative overflow-hidden group shadow-xs transition-all"
                    title="Click to upload circular Avatar photo"
                  >
                    {cardAvatar ? (
                      <>
                        <img src={cardAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                          Change
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-[#8F7855] group-hover:text-[#256B3A]">
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-[9px] font-bold mt-0.5">Upload</span>
                      </div>
                    )}
                    {isCardImageUploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#256B3A]" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={cardFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCardAvatarUpload}
                    className="hidden"
                  />
                  {cardAvatar && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCardAvatar(''); }}
                      className="text-[10px] text-red-500 hover:text-red-700 hover:underline mt-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* DESIGNATION */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                  DESIGNATION *
                </label>
                <input
                  type="text"
                  value={cardDesignation}
                  onChange={e => setCardDesignation(e.target.value)}
                  placeholder="e.g. Project Director"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs font-semibold text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                  required
                />
              </div>

              {/* PORTFOLIO */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                  PORTFOLIO
                </label>
                <input
                  type="text"
                  value={cardPortfolio}
                  onChange={e => setCardPortfolio(e.target.value)}
                  placeholder="e.g. Agriculture & Horticulture"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs font-semibold text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>

              {/* QUALIFICATION */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                  QUALIFICATION
                </label>
                <input
                  type="text"
                  value={cardQualification}
                  onChange={e => setCardQualification(e.target.value)}
                  placeholder="e.g. Ph.D. / M.Sc. Agronomy"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs font-semibold text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>

              {/* PROFESSIONAL EXPERIENCE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                  PROFESSIONAL EXPERIENCE
                </label>
                <textarea
                  rows={4}
                  value={cardExperience}
                  onChange={e => setCardExperience(e.target.value)}
                  placeholder="Detail professional qualifications, honors, research papers, projects, and career milestones..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#143520] leading-relaxed focus:outline-hidden focus:border-[#256B3A]"
                />
                <p className="text-[10px] text-[#8F7855] mt-1">
                  Displayed on a new line and justified across the whole width of the card.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE6D6]">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8F7855] hover:bg-[#F6F4EB] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCard()}
                  className="px-6 py-2 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#BFDC28]" />
                  <span>{editingCardId ? 'Save Changes' : 'Create Staff Card'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
