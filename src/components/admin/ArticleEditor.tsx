import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Save,
  Eye,
  Columns,
  Edit,
  Sparkles,
  Image as ImageIcon,
  ImagePlus,
  Upload,
  Link2,
  RefreshCw,
  Plus,
  X,
  Star,
  CheckCircle2,
  Clock,
  Bold,
  Italic,
  AlignJustify,
  Heading2,
  Heading3,
  Quote,
  Table as TableIcon,
  List,
  Code,
  UserCheck,
} from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { slugify } from '../../utils/slugify';
import { calculateReadingTime } from '../../utils/readingTime';
import { useToast } from '../common/Toast';

function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const res = e.target?.result as string;
          resolve({ dataUrl: res, sizeKb: Math.round(file.size / 1024) });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        resolve({ dataUrl, sizeKb });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

interface ArticleEditorProps {
  articleId?: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

const PRESET_COVERS = [
  { label: 'Living Soil & Roots', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Smart Drip & Sensor', url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Silvopasture & Cattle', url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Orchard & Trellis', url: 'https://images.unsplash.com/photo-1519972064555-542444e71b54?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Biochar & Compost', url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Rural Solar Microgrid', url: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Seedlings & Greenery', url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Drone Crop Scouting', url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1600&q=80' },
];

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  articleId,
  onSaved,
  onCancel,
}) => {
  const { articles, categories, tags, authors, addArticle, updateArticle, addCategory, addTag, addAuthor, uploadImage } = useBlog();
  const { showToast } = useToast();

  const existingArticle = articleId ? articles.find(a => a.id === articleId) : null;

  // Form states
  const [title, setTitle] = useState(existingArticle?.title || '');
  const [slug, setSlug] = useState(existingArticle?.slug || '');
  const [isSlugManual, setIsSlugManual] = useState(Boolean(existingArticle));
  const [content, setContent] = useState(existingArticle?.content || '');
  const [coverImage, setCoverImage] = useState(
    existingArticle?.coverImage || PRESET_COVERS[0].url
  );
  const [category, setCategory] = useState(
    existingArticle?.category || (categories[0]?.name || 'Agronomy & Soil Health')
  );
  const [tagsList, setTagsList] = useState<string[]>(
    existingArticle?.tags || []
  );
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>(
    existingArticle?.status || 'published'
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    existingArticle?.isFeatured ?? false
  );
  const [authorId, setAuthorId] = useState<string>(
    existingArticle?.author?.id || authors[0]?.id || ''
  );

  // Editor View modes: 'split' | 'edit' | 'preview' - Default to 'edit'
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('edit');
  const [isCanvasJustified, setIsCanvasJustified] = useState(false);

  // Inline Category modal
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Inline Author modal
  const [showNewAuthorModal, setShowNewAuthorModal] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorRole, setNewAuthorRole] = useState('');
  const [newAuthorInst, setNewAuthorInst] = useState('');
  const [newAuthorBio, setNewAuthorBio] = useState('');
  const [newAuthorAvatar, setNewAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');

  // Inline Image Insertion modal & Upload states
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalTab, setImageModalTab] = useState<'upload' | 'embed'>('upload');
  const [imageUploadPreview, setImageUploadPreview] = useState<string>('');
  const [imageUploadSizeKb, setImageUploadSizeKb] = useState<number>(0);
  const [imageEmbedUrl, setImageEmbedUrl] = useState<string>('');
  const [imageCaption, setImageCaption] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertImageAtCursor = (url: string, captionText: string = '') => {
    if (!url.trim()) {
      showToast('Please select or enter an image URL', 'error');
      return;
    }
    const cleanCaption = captionText.trim();
    const snippet = cleanCaption
      ? `\n\n![${cleanCaption}](${url.trim()})\n*${cleanCaption}*\n\n`
      : `\n\n![](${url.trim()})\n\n`;

    const textarea = document.getElementById('article-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      setContent(prev => (prev ? prev + snippet : snippet.trimStart()));
    } else {
      const start = textarea.selectionStart ?? content.length;
      const end = textarea.selectionEnd ?? content.length;
      const newContent = content.substring(0, start) + snippet + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        const pos = start + snippet.length;
        textarea.setSelectionRange(pos, pos);
      }, 50);
    }

    setShowImageModal(false);
    setImageUploadPreview('');
    setImageUploadSizeKb(0);
    setImageEmbedUrl('');
    setImageCaption('');
    showToast('Photo inserted into article!', 'success');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }

    setIsCompressing(true);
    try {
      const result = await compressImage(file, 1200, 0.82);
      const cloudUrl = await uploadImage(result.dataUrl, file.name);
      setImageUploadPreview(cloudUrl);
      setImageUploadSizeKb(result.sizeKb);
      if (!imageCaption) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setImageCaption(nameWithoutExt);
      }
    } catch {
      showToast('Error processing image. Please try another file.', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleTextareaDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      e.preventDefault();
      try {
        const result = await compressImage(file, 1200, 0.82);
        const cloudUrl = await uploadImage(result.dataUrl, file.name);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        insertImageAtCursor(cloudUrl, nameWithoutExt);
      } catch {
        showToast('Failed to drop image', 'error');
      }
    }
  };

  const handleTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          try {
            const result = await compressImage(file, 1200, 0.82);
            insertImageAtCursor(result.dataUrl, 'Pasted observation photograph');
          } catch {
            showToast('Failed to paste image', 'error');
          }
          break;
        }
      }
    }
  };

  // Auto-generate slug when title changes unless manually altered
  useEffect(() => {
    if (!isSlugManual && title) {
      setSlug(slugify(title));
    }
  }, [title, isSlugManual]);

  const readingTime = calculateReadingTime(content);
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // Tag chip handlers
  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.replace(/^#/, '').trim();
    if (!clean) return;
    if (!tagsList.includes(clean)) {
      setTagsList(prev => [...prev, clean]);
      // Also ensure tag exists in global taxonomy
      if (!tags.some(t => t.name.toLowerCase() === clean.toLowerCase())) {
        addTag({ name: clean });
      }
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  // Toolbar insertion helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('article-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = prefix + (selectedText || 'text') + suffix;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 50);
  };

  const handleJustifyText = () => {
    const textarea = document.getElementById('article-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText.trim()) {
      const justifyMatch =
        selectedText.match(/^<div align="justify">\s*\n*([\s\S]*?)\s*\n*<\/div>$/i) ||
        selectedText.match(/^<div style="text-align:\s*justify;?">\s*\n*([\s\S]*?)\s*\n*<\/div>$/i);

      let replacement: string;
      if (justifyMatch) {
        replacement = justifyMatch[1];
        showToast('Justified alignment removed', 'info');
      } else {
        replacement = `<div align="justify">\n\n${selectedText.trim()}\n\n</div>`;
        showToast('Text justified!', 'success');
      }

      const newContent = content.substring(0, start) + replacement + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + replacement.length);
      }, 50);
    } else {
      setIsCanvasJustified(prev => {
        const next = !prev;
        showToast(next ? 'Text canvas justified!' : 'Text canvas left-aligned', 'info');
        return next;
      });
    }
  };

  // Inline Category creation
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const created = addCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim() || 'Emerging agricultural sector topic',
    });
    setCategory(created.name);
    setShowNewCatModal(false);
    setNewCatName('');
    setNewCatDesc('');
    showToast(`Category "${created.name}" created!`, 'success');
  };

  // Inline Author creation
  const handleCreateAuthor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim()) {
      showToast('Please provide the contributor name', 'error');
      return;
    }
    const created = addAuthor({
      name: newAuthorName.trim(),
      role: newAuthorRole.trim() || 'Field Agronomist & Writer',
      institution: newAuthorInst.trim() || 'Mizoram Agronomy Collective',
      bio: newAuthorBio.trim() || `${newAuthorName.trim()} writes on sustainable farming and agro-ecological practices in Mizoram.`,
      avatar: newAuthorAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });
    setAuthorId(created.id);
    setShowNewAuthorModal(false);
    setNewAuthorName('');
    setNewAuthorRole('');
    setNewAuthorInst('');
    setNewAuthorBio('');
    showToast(`Author "${created.name}" created and assigned!`, 'success');
  };

  // Save handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter an article title', 'error');
      return;
    }
    if (!content.trim()) {
      showToast('Please write the article content', 'error');
      return;
    }

    const selectedAuthor = authors.find(a => a.id === authorId) || authors[0];

    if (existingArticle) {
      updateArticle(existingArticle.id, {
        title,
        slug: slug || slugify(title),
        excerpt: '',
        content,
        coverImage,
        category,
        tags: tagsList,
        author: selectedAuthor,
        status,
        isFeatured,
      });
      showToast('Article updated successfully!', 'success');
    } else {
      addArticle({
        title,
        slug: slug || slugify(title),
        excerpt: '',
        content,
        coverImage,
        category,
        tags: tagsList,
        author: selectedAuthor,
        status,
        isFeatured,
      });
      showToast(
        status === 'published'
          ? 'Article published to live journal!'
          : 'Article draft saved to queue',
        'success'
      );
    }

    onSaved();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-24 md:pb-6">
      {/* Top Header / Actions Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#256B3A]">
            {existingArticle ? 'Revising Publication' : 'New Article Draft'}
          </span>
          <h2 className="font-serif font-bold text-base sm:text-2xl text-[#143520] truncate max-w-xl">
            {title || 'Untitled Article'}
          </h2>
          <div className="flex items-center gap-3 text-xs text-[#8F7855] mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {readingTime} min read
            </span>
            <span>•</span>
            <span>{wordCount} words</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-[#DDD4BC] text-[#54432C] hover:bg-[#F6F4EB] text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#BFDC28]" />
            <span>{existingArticle ? 'Update Article' : 'Publish / Save Article'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Mobile order prioritizes Title & Markdown Editor (order-1), Metadata on side/bottom (order-2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Right Column (displayed first on mobile): Title, Slug & Rich Markdown Editor */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-5">
          {/* Article Entry Box with Formatting Toolbar placed JUST ABOVE Article Title */}
          <div className="bg-white rounded-2xl border border-[#DDD4BC] shadow-xs overflow-hidden">
            {/* Formatting Toolbar Strip - Exact length/width of this rectangular Article Entry box */}
            <div className="p-2 sm:p-2.5 bg-[#F6F4EB] border-b border-[#DDD4BC] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              {/* Quick Formatting Tools */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0">
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  className="h-8 px-2.5 text-[#54432C] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg shrink-0 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
                  title="Bold (**text**)"
                >
                  <Bold className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Bold</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  className="h-8 px-2.5 text-[#54432C] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg shrink-0 flex items-center gap-1.5 text-xs italic transition-colors cursor-pointer"
                  title="Italic (*text*)"
                >
                  <Italic className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Italic</span>
                </button>
                <button
                  type="button"
                  onClick={handleJustifyText}
                  className={`h-8 px-2.5 hover:bg-[#EBE6D6] active:bg-[#DDD4BC] border rounded-lg shrink-0 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    isCanvasJustified ? 'bg-[#EBF1EA] text-[#1E542E] border-[#256B3A]' : 'bg-white text-[#54432C] border-[#DDD4BC]'
                  }`}
                  title="Justify Text: Wrap selected text in justified alignment, or toggle canvas justification"
                >
                  <AlignJustify className="w-3.5 h-3.5 text-[#256B3A]" />
                  <span className="hidden sm:inline text-[11px]">Justify</span>
                </button>
                <div className="h-4 w-px bg-[#DDD4BC] mx-1 shrink-0" />
                <button
                  type="button"
                  onClick={() => insertFormatting('\n## ')}
                  className="h-8 px-2.5 text-[#54432C] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg shrink-0 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
                  title="Heading 2 (## Title)"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">H2</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n### ')}
                  className="h-8 px-2.5 text-[#54432C] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg shrink-0 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
                  title="Heading 3 (### Title)"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">H3</span>
                </button>
                <div className="h-4 w-px bg-[#DDD4BC] mx-1 shrink-0" />
                <button
                  type="button"
                  onClick={() => insertFormatting('\n> ')}
                  className="w-8 h-8 p-1.5 text-[#54432C] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg shrink-0 flex items-center justify-center transition-colors cursor-pointer"
                  title="Blockquote (> quote)"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n- ')}
                  className="w-8 h-8 p-1.5 text-[#54432C] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg shrink-0 flex items-center justify-center transition-colors cursor-pointer"
                  title="Bullet list (- item)"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('```\n', '\n```')}
                  className="w-8 h-8 p-1.5 text-[#54432C] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg shrink-0 flex items-center justify-center transition-colors cursor-pointer"
                  title="Code block"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertFormatting(
                      '\n| Parameter | Baseline | Regenerative Protocol | Impact |\n| :--- | :--- | :--- | :--- |\n| Sample Metric | 10 units | 25 units | +150% |\n'
                    )
                  }
                  className="w-8 h-8 p-1.5 text-[#54432C] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg shrink-0 flex items-center justify-center transition-colors cursor-pointer"
                  title="Insert Comparison Table"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertFormatting(
                      '\n> 🌿 **Agronomy Field Note:** Soil organic matter increases of 1% allow soil to hold an additional 20,000 gallons of clean water per acre.\n'
                    )
                  }
                  className="h-8 px-2.5 text-[11px] font-semibold bg-[#EBF1EA] text-[#1E542E] hover:bg-[#DFEDE3] rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Insert Field Note Callout"
                >
                  <Sparkles className="w-3 h-3 text-[#BFDC28]" />
                  <span>Note</span>
                </button>
                <div className="h-4 w-px bg-[#DDD4BC] mx-1 shrink-0" />
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="h-8 px-2.5 bg-[#EBF1EA] text-[#143520] hover:bg-[#DFEDE3] border border-[#B7CEB4] rounded-lg shrink-0 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Insert or Upload Picture into Article Body"
                >
                  <ImagePlus className="w-3.5 h-3.5 text-[#256B3A]" />
                  <span className="text-[11px]">Picture / Image</span>
                </button>
              </div>

              {/* View Mode Toggle: Edit | Split | Preview */}
              <div className="flex items-center gap-0.5 bg-[#EBE6D6] p-0.5 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    viewMode === 'edit'
                      ? 'bg-white text-[#143520] shadow-xs'
                      : 'text-[#6F5B3C] hover:text-[#143520]'
                  }`}
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`hidden lg:flex px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold items-center gap-1 cursor-pointer transition-colors ${
                    viewMode === 'split'
                      ? 'bg-white text-[#143520] shadow-xs'
                      : 'text-[#6F5B3C] hover:text-[#143520]'
                  }`}
                >
                  <Columns className="w-3 h-3" />
                  <span>Split</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-white text-[#143520] shadow-xs'
                      : 'text-[#6F5B3C] hover:text-[#143520]'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Title & Slug section - strictly below the toolbar with plenty of padding */}
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
                  Article Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter article title..."
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl font-serif font-bold text-lg sm:text-xl text-[#143520] placeholder:text-[#8F7855]/50 focus:outline-hidden focus:border-[#256B3A]"
                  required
                />
              </div>

              {/* Slug input */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
                <div className="sm:col-span-3 text-xs font-medium text-[#6F5B3C]">
                  Permanent URL Slug:
                </div>
                <div className="sm:col-span-9 flex items-center">
                  <span className="px-2.5 sm:px-3 py-2 bg-[#EBE6D6] border border-r-0 border-[#DDD4BC] rounded-l-xl text-xs text-[#8F7855] font-mono shrink-0">
                    /article/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => {
                      setSlug(e.target.value);
                      setIsSlugManual(true);
                    }}
                    placeholder="auto-generated-or-custom-slug"
                    className="flex-1 min-w-0 px-3 py-2 bg-[#F6F4EB] border border-[#DDD4BC] rounded-r-xl text-xs font-mono text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Markdown Content Editor - Clean canvas with NO floating toolbar */}
          <div className="bg-white rounded-2xl border border-[#DDD4BC] shadow-xs overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 py-2.5 bg-[#FBFBF8] border-b border-[#DDD4BC] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <label htmlFor="article-content-textarea" className="font-bold uppercase tracking-wider text-[#6F5B3C]">
                  Article Content & Body
                </label>
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#1E542E] bg-[#EBF1EA] hover:bg-[#DFEDE3] border border-[#B7CEB4] rounded-lg transition-colors cursor-pointer"
                  title="Insert or upload image at cursor location"
                >
                  <ImagePlus className="w-3.5 h-3.5 text-[#256B3A]" />
                  <span>+ Insert / Upload Photo</span>
                </button>
              </div>
              <span className="text-[11px] text-[#8F7855]">
                {viewMode === 'edit' && 'Edit Mode (Blank Canvas)'}
                {viewMode === 'split' && 'Split View'}
                {viewMode === 'preview' && 'Rendered Preview'}
              </span>
            </div>

            {/* Split / Edit / Preview Workspace */}
            <div className="min-h-[450px] sm:min-h-[550px]">
              {viewMode === 'edit' && (
                <textarea
                  id="article-content-textarea"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onDrop={handleTextareaDrop}
                  onPaste={handleTextareaPaste}
                  className={`w-full min-h-[450px] sm:h-[650px] p-4 sm:p-6 font-mono text-xs sm:text-sm text-[#1E2922] bg-[#FDFCF9] focus:outline-hidden resize-y leading-relaxed ${
                    isCanvasJustified ? 'text-justify [text-align:justify]' : ''
                  }`}
                  placeholder="Start typing your article content here in Markdown... (Tip: Click '+ Insert / Upload Photo', paste screenshots directly with Ctrl+V, or drag & drop pictures here!)"
                  required
                />
              )}

              {viewMode === 'preview' && (
                <div className="p-5 sm:p-8 prose-agri max-w-none bg-white min-h-[450px] sm:min-h-[650px]">
                  {content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        img: ({ node, ...props }) => (
                          <figure className="my-6 block">
                            <div className="overflow-hidden rounded-xl border border-[#DDD4BC] bg-[#F6F4EB] shadow-xs">
                              <img
                                {...props}
                                className="w-full max-h-[500px] object-cover block"
                                loading="lazy"
                              />
                            </div>
                            {props.alt && (
                              <figcaption className="text-center text-xs text-[#8F7855] mt-2 italic font-serif">
                                {props.alt}
                              </figcaption>
                            )}
                          </figure>
                        ),
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm text-[#8F7855] italic">
                      Article content is empty. Type in Edit mode to preview your article.
                    </p>
                  )}
                </div>
              )}

              {viewMode === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#DDD4BC] h-[650px]">
                  <textarea
                    id="article-content-textarea"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onDrop={handleTextareaDrop}
                    onPaste={handleTextareaPaste}
                    className={`w-full h-full p-5 font-mono text-xs sm:text-sm text-[#1E2922] bg-[#FDFCF9] focus:outline-hidden resize-none leading-relaxed overflow-y-auto ${
                      isCanvasJustified ? 'text-justify [text-align:justify]' : ''
                    }`}
                    placeholder="Start typing your article content here in Markdown... (Tip: Click '+ Insert / Upload Photo', paste screenshots directly with Ctrl+V, or drag & drop pictures here!)"
                    required
                  />
                  <div className="p-6 prose-agri max-w-none bg-white overflow-y-auto h-full text-sm">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#8F7855] pb-2 mb-3 border-b border-[#EBE6D6]">
                      Real-Time Rendered View
                    </div>
                    {content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          img: ({ node, ...props }) => (
                            <figure className="my-6 block">
                              <div className="overflow-hidden rounded-xl border border-[#DDD4BC] bg-[#F6F4EB] shadow-xs">
                                <img
                                  {...props}
                                  className="w-full max-h-[500px] object-cover block"
                                  loading="lazy"
                                />
                              </div>
                              {props.alt && (
                                <figcaption className="text-center text-xs text-[#8F7855] mt-2 italic font-serif">
                                  {props.alt}
                                </figcaption>
                              )}
                            </figure>
                          ),
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm text-[#8F7855] italic">
                        Preview will appear here as you type...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Left Column (Metadata & Configuration): placed below editor on mobile, on left on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-4 space-y-5">
          {/* Status & Featured Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#143520]">
              Publication Controls
            </h3>

            {/* Status Radio */}
            <div>
              <label className="block text-xs font-medium text-[#6F5B3C] mb-1.5">
                Visibility Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('published')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                    status === 'published'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-[#F6F4EB] text-[#54432C] border-[#DDD4BC]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Published</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                    status === 'draft'
                      ? 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-500/20'
                      : 'bg-[#F6F4EB] text-[#54432C] border-[#DDD4BC]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Draft</span>
                </button>
              </div>
            </div>

            {/* Feature on Home Screen Toggle */}
            <div className="pt-2 border-t border-[#F6F4EB]">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#143520] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Feature on Home Screen</span>
                  </div>
                  <p className="text-[11px] text-[#8F7855]">
                    Positions as hero lead or highlighted story
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#256B3A] focus:ring-[#256B3A] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Core Taxonomy Fields */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#143520]">
              Taxonomy & Categorization
            </h3>

            {/* Category Select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#6F5B3C]">
                  Agricultural Sector / Category *
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCatModal(true)}
                  className="text-[11px] font-semibold text-[#256B3A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Sector</span>
                </button>
              </div>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] font-medium focus:outline-hidden focus:border-[#256B3A] cursor-pointer"
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Chip Input */}
            <div>
              <label className="block text-xs font-medium text-[#6F5B3C] mb-1.5">
                Practice Tags (Type & Press Enter)
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl min-h-[44px]">
                {tagsList.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#143520] text-[#BFDC28]"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-white hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={tagsList.length === 0 ? "e.g. SoilHealth, Drip..." : "+ add tag"}
                  className="flex-1 bg-transparent text-xs text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden min-w-[80px]"
                />
              </div>

              {/* Tag suggestions from global list */}
              <div className="mt-2 flex flex-wrap gap-1">
                {tags
                  .filter(t => !tagsList.includes(t.name))
                  .slice(0, 5)
                  .map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleAddTag(t.name)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#DDD4BC] text-[#6F5B3C] hover:border-[#256B3A] cursor-pointer"
                    >
                      +{t.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* Author Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#6F5B3C]">
                  Assigned Author Profile *
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewAuthorModal(true)}
                  className="text-[11px] font-semibold text-[#256B3A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Author</span>
                </button>
              </div>
              <select
                value={authorId}
                onChange={e => setAuthorId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] font-medium focus:outline-hidden focus:border-[#256B3A] cursor-pointer"
              >
                {authors.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#143520] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#256B3A]" />
              <span>Cover Image</span>
            </h3>

            {/* Preview */}
            <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-[#EBE6D6] border border-[#DDD4BC]">
              <img
                src={coverImage}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src = PRESET_COVERS[0].url;
                }}
              />
            </div>

            {/* Input URL */}
            <div>
              <label className="block text-xs font-medium text-[#6F5B3C] mb-1">
                Image URL (Unsplash or direct asset)
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                className="w-full px-3 py-2 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                placeholder="https://images.unsplash.com/..."
                required
              />
            </div>

            {/* Preset Picks */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8F7855] uppercase tracking-wider mb-2">
                Or Quick Select Agricultural Preset:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_COVERS.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImage(p.url)}
                    className="p-1.5 rounded-lg border border-[#DDD4BC] hover:border-[#256B3A] bg-[#F6F4EB] text-left flex items-center gap-2 cursor-pointer group"
                  >
                    <img
                      src={p.url}
                      alt={p.label}
                      className="w-8 h-8 rounded-md object-cover shrink-0"
                    />
                    <span className="text-[10px] font-medium text-[#54432C] group-hover:text-[#143520] line-clamp-1">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Mobile Bottom Action Bar (One-Handed Publishing on < 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DDD4BC] p-3 shadow-2xl flex items-center gap-2">
        <button
          type="button"
          onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
            status === 'published'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{status === 'published' ? 'Published' : 'Draft'}</span>
        </button>

        <button
          type="submit"
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#143520] active:bg-[#1E542E] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#BFDC28]" />
          <span>{existingArticle ? 'Update' : 'Publish'}</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2.5 rounded-xl border border-[#DDD4BC] text-[#54432C] text-xs font-semibold hover:bg-[#F6F4EB] cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Inline Create Category Modal */}
      {showNewCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#DDD4BC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#143520]">
                Add Agricultural Sector Category
              </h3>
              <button
                type="button"
                onClick={() => setShowNewCatModal(false)}
                className="text-[#8F7855] hover:text-[#13341D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#6F5B3C] mb-1">
                  Sector Name *
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Apiculture & Pollinator Stewardship"
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6F5B3C] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  placeholder="Focus on honeybee genetics, native pollen corridors, and hive telemetry..."
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewCatModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6F5B3C] hover:bg-[#F6F4EB] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                className="px-4 py-2 text-xs font-semibold bg-[#143520] text-white hover:bg-[#1E542E] rounded-xl"
              >
                Create Sector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Create Author Modal */}
      {showNewAuthorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#DDD4BC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#143520] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#256B3A]" />
                <span>Add Contributor Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewAuthorModal(false)}
                className="text-[#8F7855] hover:text-[#13341D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#6F5B3C] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newAuthorName}
                  onChange={e => setNewAuthorName(e.target.value)}
                  placeholder="e.g. Dr. Lalramhluna"
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6F5B3C] mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={newAuthorRole}
                    onChange={e => setNewAuthorRole(e.target.value)}
                    placeholder="e.g. Hill Agronomist"
                    className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6F5B3C] mb-1">
                    Institution / Org
                  </label>
                  <input
                    type="text"
                    value={newAuthorInst}
                    onChange={e => setNewAuthorInst(e.target.value)}
                    placeholder="e.g. Loneitu Contributor"
                    className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6F5B3C] mb-1">
                  Avatar Photo URL
                </label>
                <input
                  type="url"
                  value={newAuthorAvatar}
                  onChange={e => setNewAuthorAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6F5B3C] mb-1">
                  Short Bio
                </label>
                <textarea
                  rows={2}
                  value={newAuthorBio}
                  onChange={e => setNewAuthorBio(e.target.value)}
                  placeholder="Field experience, research area, or agronomic focus..."
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewAuthorModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6F5B3C] hover:bg-[#F6F4EB] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAuthor}
                className="px-4 py-2 text-xs font-semibold bg-[#143520] text-white hover:bg-[#1E542E] rounded-xl"
              >
                Save & Assign Author
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Insert / Upload Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full border border-[#DDD4BC] shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center">
                  <ImagePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#143520]">
                    Insert Picture into Article
                  </h3>
                  <p className="text-[11px] text-[#8F7855]">
                    Embed photos directly in between your paragraphs. (Cover photo remains intact)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-[#8F7855] hover:text-[#13341D] p-1 rounded-lg hover:bg-[#F6F4EB] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher: Upload from Device vs Embed via URL */}
            <div className="grid grid-cols-2 p-1 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setImageModalTab('upload')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  imageModalTab === 'upload'
                    ? 'bg-white text-[#143520] shadow-xs'
                    : 'text-[#6F5B3C] hover:text-[#143520]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload from Device</span>
              </button>
              <button
                type="button"
                onClick={() => setImageModalTab('embed')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  imageModalTab === 'embed'
                    ? 'bg-white text-[#143520] shadow-xs'
                    : 'text-[#6F5B3C] hover:text-[#143520]'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Embed Web URL</span>
              </button>
            </div>

            {/* Tab 1: Upload from Device */}
            {imageModalTab === 'upload' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!imageUploadPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#DDD4BC] hover:border-[#256B3A] rounded-2xl p-6 text-center bg-[#FBFBF8] hover:bg-[#F2F7F3] transition-colors cursor-pointer space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center mx-auto">
                      {isCompressing ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#143520] block">
                        {isCompressing ? 'Optimizing photo...' : 'Click to select picture from phone or computer'}
                      </span>
                      <span className="text-[11px] text-[#8F7855]">
                        Supports JPG, PNG, WEBP. Automatically optimized for fast web loading.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative aspect-16/10 rounded-xl overflow-hidden border border-[#DDD4BC] bg-[#EBE6D6]">
                      <img
                        src={imageUploadPreview}
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageUploadPreview('');
                          setImageUploadSizeKb(0);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                        title="Choose another picture"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                        {imageUploadSizeKb} KB (Web Ready)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-[#256B3A] font-semibold hover:underline block text-center cursor-pointer"
                    >
                      Change selected picture
                    </button>
                  </div>
                )}

                {/* Caption Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                    Photo Caption / Alt Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={e => setImageCaption(e.target.value)}
                    placeholder="e.g. Field inspection: Cotton plants in flowering stage"
                    className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  />
                  <p className="text-[10px] text-[#8F7855] mt-1">
                    Caption will be displayed beneath the picture in your published article.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Embed Web URL */}
            {imageModalTab === 'embed' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                    Direct Image URL *
                  </label>
                  <input
                    type="url"
                    value={imageEmbedUrl}
                    onChange={e => setImageEmbedUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  />
                </div>

                {/* Live Preview if URL is entered */}
                {imageEmbedUrl && (
                  <div className="relative aspect-16/10 rounded-xl overflow-hidden border border-[#DDD4BC] bg-[#EBE6D6]">
                    <img
                      src={imageEmbedUrl}
                      alt="URL preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = PRESET_COVERS[0].url;
                      }}
                    />
                  </div>
                )}

                {/* Quick Presets */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8F7855] tracking-wider mb-1.5">
                    Or select quick sample photo:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_COVERS.slice(0, 3).map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageEmbedUrl(p.url)}
                        className="rounded-lg overflow-hidden border border-[#DDD4BC] hover:border-[#256B3A] aspect-16/10 relative group cursor-pointer"
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-medium text-center p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Caption Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                    Photo Caption / Alt Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={e => setImageCaption(e.target.value)}
                    placeholder="e.g. Field inspection: Drip irrigation telemetry sensor"
                    className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBE6D6]">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6F5B3C] hover:bg-[#F6F4EB] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={imageModalTab === 'upload' ? !imageUploadPreview : !imageEmbedUrl}
                onClick={() => {
                  if (imageModalTab === 'upload') {
                    insertImageAtCursor(imageUploadPreview, imageCaption);
                  } else {
                    insertImageAtCursor(imageEmbedUrl, imageCaption);
                  }
                }}
                className="px-5 py-2.5 text-xs font-bold bg-[#143520] hover:bg-[#1E542E] text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#BFDC28]" />
                <span>Insert into Article</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
