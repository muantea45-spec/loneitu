import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Save,
  Eye,
  Columns,
  Edit,
  Code2,
  Sparkles,
  Image as ImageIcon,
  ImagePlus,
  Upload,
  Link2,
  Unlink,
  Plus,
  X,
  CheckCircle2,
  Clock,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Table as TableIcon,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Code,
  FileCode,
  Minus,
  AlertTriangle,
  Palette,
  Highlighter,
  Eraser,
  Undo,
  Redo,
} from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { slugify } from '../../utils/slugify';
import { calculateReadingTime } from '../../utils/readingTime';
import { cleanTextExcerpt } from '../../utils/shareUtils';
import { useToast } from '../common/Toast';
import { compressImage } from '../../utils/imageCompressor';
import { markdownToHtml } from '../../utils/richTextFormatter';
import { resolveImageUrl } from '../../utils/imageUrlResolver';

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

const TEXT_COLORS = [
  { name: 'Forest Dark', color: '#143520' },
  { name: 'Field Green', color: '#256B3A' },
  { name: 'Soil Umber', color: '#6F5B3C' },
  { name: 'Harvest Amber', color: '#D97706' },
  { name: 'Alert Crimson', color: '#B91C1C' },
  { name: 'Charcoal', color: '#1E2922' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Lime Light', color: '#F4FBD0' },
  { name: 'Soft Sage', color: '#EBF1EA' },
  { name: 'Amber Glow', color: '#FEF3C7' },
  { name: 'Pale Rose', color: '#FFE4E6' },
  { name: 'Sky Pale', color: '#E0F2FE' },
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
  const [coverImage, setCoverImage] = useState(existingArticle?.coverImage || '');
  const [coverImageTab, setCoverImageTab] = useState<'upload' | 'embed'>('upload');
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(
    existingArticle?.category || (categories[0]?.name || 'Agronomy & Soil Health')
  );
  const [tagsList, setTagsList] = useState<string[]>(existingArticle?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>(
    existingArticle?.status || 'published'
  );
  const isFeatured = existingArticle?.isFeatured ?? false;
  const [authorId, setAuthorId] = useState<string>(
    existingArticle?.author?.id || authors[0]?.id || ''
  );

  // Editor View modes: 'edit' (Visual Canvas) | 'split' | 'preview' | 'code' (Raw HTML/MD)
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview' | 'code'>('edit');
  const [isCanvasJustified, setIsCanvasJustified] = useState(false);

  // Popover controls
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  // Inline Link modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('https://');
  const [linkTextInput, setLinkTextInput] = useState('');

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
  const [isNewAuthorAvatarUploading, setIsNewAuthorAvatarUploading] = useState(false);
  const newAuthorAvatarInputRef = useRef<HTMLInputElement>(null);

  // Inline Image Insertion modal & Upload states
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalTab, setImageModalTab] = useState<'upload' | 'embed'>('upload');
  const [imageUploadPreview, setImageUploadPreview] = useState<string>('');
  const [imageUploadSizeKb, setImageUploadSizeKb] = useState<number>(0);
  const [imageEmbedUrl, setImageEmbedUrl] = useState<string>('');
  const [imageCaption, setImageCaption] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas DOM refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const isCanvasInitializedRef = useRef<boolean>(false);

  // Initialize canvas with rich HTML on load
  useEffect(() => {
    if (canvasRef.current && !isCanvasInitializedRef.current) {
      const initialHtml = markdownToHtml(existingArticle?.content || '');
      canvasRef.current.innerHTML = initialHtml;
      setContent(initialHtml);
      isCanvasInitializedRef.current = true;
    }
  }, [existingArticle]);

  // When switching from raw code mode back to visual canvas, sync innerHTML
  const handleViewModeChange = (mode: 'edit' | 'split' | 'preview' | 'code') => {
    if (mode !== 'code' && canvasRef.current && canvasRef.current.innerHTML !== content) {
      canvasRef.current.innerHTML = content;
    }
    setViewMode(mode);
  };

  // Sync state on canvas input
  const handleCanvasInput = () => {
    if (canvasRef.current) {
      setContent(canvasRef.current.innerHTML);
    }
  };

  // Selection preservation
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

  // Execute browser document command directly inside the visual canvas
  const exec = (command: string, value: string | undefined = undefined) => {
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
    try {
      document.execCommand(command, false, value);
    } catch (err) {
      console.warn('execCommand failed:', err);
    }
    handleCanvasInput();
  };

  // Insert HTML element at current cursor in the visual canvas
  const insertHtmlAtCursor = (html: string) => {
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (canvasRef.current && canvasRef.current.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node: ChildNode | null;
        let lastNode: ChildNode | null = null;
        while ((node = tempDiv.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else if (canvasRef.current) {
        canvasRef.current.innerHTML += html;
      }
    } else if (canvasRef.current) {
      canvasRef.current.innerHTML += html;
    }
    handleCanvasInput();
  };

  // Photo insertion directly into the visual canvas
  const insertImageAtCursor = (url: string, captionText: string = '') => {
    if (!url.trim()) {
      showToast('Please select or enter an image URL', 'error');
      return;
    }
    restoreSelection();
    const cleanUrl = resolveImageUrl(url.trim());
    const cleanCaption = captionText.trim();
    const imgHtml = `
<figure style="margin: 24px 0; display: block; text-align: center;">
  <div style="overflow: hidden; border-radius: 16px; border: 1px solid #ddd4bc; background: #f6f4eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); display: inline-block; max-width: 100%;">
    <img src="${cleanUrl}" alt="${cleanCaption}" style="width: 100%; max-height: 550px; object-fit: cover; display: block;" loading="lazy" />
  </div>
  ${cleanCaption ? `<figcaption style="text-align: center; font-size: 12px; color: #8f7855; margin-top: 8px; font-style: italic;">${cleanCaption}</figcaption>` : ''}
</figure>
<p><br /></p>
`;
    insertHtmlAtCursor(imgHtml);
    setShowImageModal(false);
    setImageUploadPreview('');
    setImageUploadSizeKb(0);
    setImageEmbedUrl('');
    setImageCaption('');
    showToast('Photo inserted into canvas!', 'success');
  };

  // Link Dialog Handlers
  const handleOpenLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString().trim() : '';
    setLinkTextInput(selectedText);
    setLinkUrlInput('https://');
    setShowLinkModal(true);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrlInput.trim()) return;
    restoreSelection();
    const safeUrl = linkUrlInput.trim();
    const safeText = linkTextInput.trim();
    if (safeText) {
      const linkHtml = `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color: #256b3a; text-decoration: underline; font-weight: 600;">${safeText}</a>`;
      insertHtmlAtCursor(linkHtml);
    } else {
      exec('createLink', safeUrl);
    }
    setShowLinkModal(false);
    setLinkUrlInput('https://');
    setLinkTextInput('');
    showToast('Link inserted into canvas!', 'success');
  };

  const handleUnlink = () => {
    exec('unlink');
    showToast('Link removed', 'info');
  };

  // Table Insertion
  const handleInsertTable = () => {
    const tableHtml = `
<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd4bc; border-radius: 12px; overflow: hidden;">
  <thead>
    <tr style="background: #faf8f3;">
      <th style="border: 1px solid #ddd4bc; padding: 10px 14px; text-align: left; font-weight: bold; color: #143520;">Zirchianna / Metric</th>
      <th style="border: 1px solid #ddd4bc; padding: 10px 14px; text-align: left; font-weight: bold; color: #143520;">Hmanlai Dan (Baseline)</th>
      <th style="border: 1px solid #ddd4bc; padding: 10px 14px; text-align: left; font-weight: bold; color: #143520;">Loneitu Kalpui Dan</th>
      <th style="border: 1px solid #ddd4bc; padding: 10px 14px; text-align: left; font-weight: bold; color: #143520;">Hmasawnna (%)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #ddd4bc; padding: 10px 14px; color: #143520; font-weight: 600;">Leilung Ṭhatna (SOM)</td>
      <td style="border: 1px solid #ddd4bc; padding: 10px 14px; color: #3b2e1d;">1.2%</td>
      <td style="border: 1px solid #ddd4bc; padding: 10px 14px; color: #3b2e1d;">Biochar + Hnim phah</td>
      <td style="border: 1px solid #ddd4bc; padding: 10px 14px; color: #256b3a; font-weight: 600;">+185%</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd4bc; padding: 10px 14px; color: #143520; font-weight: 600;">Tui Hip Theihna</td>
      <td style="border: 1px solid #ddd4bc; padding: 10px 14px; color: #3b2e1d;">15 mm/hr</td>
      <td style="border: 1px solid #ddd4bc; padding: 10px 14px; color: #3b2e1d;">Lei let lova thlai chin</td>
      <td style="border: 1px solid #ddd4bc; padding: 10px 14px; color: #256b3a; font-weight: 600;">+320%</td>
    </tr>
  </tbody>
</table>
<p><br /></p>
`;
    insertHtmlAtCursor(tableHtml);
    showToast('Table inserted!', 'success');
  };

  // Agronomy Field Note Callout
  const handleInsertNoteCallout = () => {
    const noteHtml = `
<div style="background: #ebf1ea; border: 1.5px solid #256b3a; border-left-width: 6px; border-radius: 12px; padding: 16px 20px; margin: 20px 0; color: #143520;">
  <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 13.5px; margin-bottom: 6px; color: #1e542e;">
    <span>🌿</span>
    <span>LONEITU FIELD NOTE:</span>
  </div>
  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #24412b;">
    Hemi hmunah hian loneitu tana hriattur pawimawh, zirbingna thurawn, emaw thlai enkawl dan thuruk ziak rawh le.
  </p>
</div>
<p><br /></p>
`;
    insertHtmlAtCursor(noteHtml);
    showToast('Field Note Callout inserted!', 'success');
  };

  // Warning / Caution Callout
  const handleInsertWarningCallout = () => {
    const warnHtml = `
<div style="background: #fffbeb; border: 1.5px solid #d97706; border-left-width: 6px; border-radius: 12px; padding: 16px 20px; margin: 20px 0; color: #92400e;">
  <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 13.5px; margin-bottom: 6px; color: #b45309;">
    <span>⚠️</span>
    <span>FIMKHURNA & VAWNHIM DAN:</span>
  </div>
  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #78350f;">
    Sik leh sa inthlak danglam thut laka thlai ven dan leh damdawi hman dan fimkhur thurawn hetiang hian tar lang rawh.
  </p>
</div>
<p><br /></p>
`;
    insertHtmlAtCursor(warnHtml);
    showToast('Caution Callout inserted!', 'success');
  };

  // Code Block Insertion
  const handleCodeBlock = () => {
    const sel = window.getSelection();
    const codeText = sel && sel.toString() ? sel.toString() : '// Enter technical formula or protocol data';
    insertHtmlAtCursor(`<pre style="background: #143520; color: #fbfbf8; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 13px; margin: 16px 0;"><code>${codeText}</code></pre><p><br /></p>`);
  };

  // Inline Code
  const handleInlineCode = () => {
    const sel = window.getSelection();
    if (sel && sel.toString()) {
      insertHtmlAtCursor(`<code style="background: #f6f4eb; color: #143520; padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 600;">${sel.toString()}</code>`);
    } else {
      insertHtmlAtCursor(`<code style="background: #f6f4eb; color: #143520; padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 600;">code</code>`);
    }
  };

  // Drag and Drop into Canvas
  const handleCanvasDrop = async (e: React.DragEvent<HTMLDivElement>) => {
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

  // Paste image into Canvas
  const handleCanvasPaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          try {
            const result = await compressImage(file, 1200, 0.82);
            const cloudUrl = await uploadImage(result.dataUrl, file.name);
            insertImageAtCursor(cloudUrl, 'Pasted observation photograph');
          } catch {
            showToast('Failed to paste image', 'error');
          }
          break;
        }
      }
    }
  };

  // File Upload Handlers for Cover & Author Avatar
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
      // Immediately set preview with dataUrl so preview is never blank or dummy!
      setImageUploadPreview(result.dataUrl);
      setImageUploadSizeKb(result.sizeKb);
      if (!imageCaption) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setImageCaption(nameWithoutExt);
      }
      const cloudUrl = await uploadImage(result.dataUrl, file.name);
      if (cloudUrl) {
        setImageUploadPreview(cloudUrl);
      }
    } catch {
      showToast('Error processing image. Please try another file.', 'error');
    } finally {
      setIsCompressing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }

    setIsCoverUploading(true);
    try {
      const result = await compressImage(file, 1600, 0.85);
      // Immediately set cover image to dataUrl for instant zero-latency preview
      setCoverImage(result.dataUrl);
      const cdnUrl = await uploadImage(result.dataUrl, file.name);
      if (cdnUrl) {
        setCoverImage(cdnUrl);
      }
      showToast('Cover photo uploaded successfully!', 'success');
    } catch {
      showToast('Failed to upload cover photo. Please try another file.', 'error');
    } finally {
      setIsCoverUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleNewAuthorAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }

    setIsNewAuthorAvatarUploading(true);
    try {
      const result = await compressImage(file, 400, 0.85);
      const cdnUrl = await uploadImage(result.dataUrl, file.name);
      setNewAuthorAvatar(cdnUrl);
      showToast('Author avatar photo uploaded successfully!', 'success');
    } catch {
      showToast('Failed to upload author photo. Please try again.', 'error');
    } finally {
      setIsNewAuthorAvatarUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Auto-generate slug when title changes unless manually altered
  useEffect(() => {
    if (!isSlugManual && title) {
      setSlug(slugify(title));
    }
  }, [title, isSlugManual]);

  const readingTime = calculateReadingTime(content);
  const wordCount = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

  // Tag chip handlers
  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.replace(/^#/, '').trim();
    if (!clean) return;
    if (!tagsList.includes(clean)) {
      setTagsList(prev => [...prev, clean]);
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

    const currentContent = (canvasRef.current && viewMode !== 'code' ? canvasRef.current.innerHTML : content).trim();
    if (!currentContent) {
      showToast('Please write the article content', 'error');
      return;
    }

    const selectedAuthor = authors.find(a => a.id === authorId) || authors[0];
    const finalCoverImage = coverImage.trim() || PRESET_COVERS[0].url;

    const generatedExcerpt = cleanTextExcerpt(currentContent, 160);

    if (existingArticle) {
      updateArticle(existingArticle.id, {
        title,
        slug: slug || slugify(title),
        excerpt: generatedExcerpt,
        content: currentContent,
        coverImage: finalCoverImage,
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
        excerpt: generatedExcerpt,
        content: currentContent,
        coverImage: finalCoverImage,
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
              <Clock className="w-3.5 h-3.5" /> Min {readingTime} read
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Right Column: Title, Slug & Rich Text Canvas */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-5">
          {/* Article Entry Box with Title & Permanent Slug */}
          <div className="bg-white rounded-2xl border border-[#DDD4BC] shadow-xs p-4 sm:p-6 space-y-4">
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

          {/* Rich Content & Textbox Canvas Box */}
          <div className="bg-white rounded-2xl border border-[#DDD4BC] shadow-xs overflow-hidden flex flex-col">
            {/* Header label for canvas */}
            <div className="px-4 sm:px-6 py-2.5 bg-[#FAF8F3] border-b border-[#DDD4BC] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-[#143520]">
                  Article Content Canvas
                </span>
                <span className="text-[11px] text-[#8F7855] hidden sm:inline">
                  (WYSIWYG: Formats reflect immediately in the canvas)
                </span>
              </div>
              <div className="text-[11px] font-semibold text-[#256B3A]">
                {viewMode === 'edit' && 'Visual Canvas Mode'}
                {viewMode === 'split' && 'Split View'}
                {viewMode === 'preview' && 'Full Preview'}
                {viewMode === 'code' && 'Raw HTML/Markdown Mode'}
              </div>
            </div>

            {/* MULTI-LINE ORGANIZED TOOLBAR (No Horizontal Scroll Needed) */}
            <div className="bg-[#F6F4EB] border-b border-[#DDD4BC] p-2.5 sm:p-3 space-y-2 select-none">
              {/* LINE 1: Typography, Font Formats, Headings & Colors */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#DDD4BC]/60">
                {/* Heading / Block selector */}
                <select
                  onMouseDown={e => e.stopPropagation()}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'p') exec('formatBlock', '<p>');
                    else if (val === 'h1') exec('formatBlock', '<h1>');
                    else if (val === 'h2') exec('formatBlock', '<h2>');
                    else if (val === 'h3') exec('formatBlock', '<h3>');
                    else if (val === 'h4') exec('formatBlock', '<h4>');
                  }}
                  className="h-8 px-2.5 bg-white border border-[#DDD4BC] rounded-lg text-xs font-semibold text-[#143520] focus:outline-hidden cursor-pointer"
                  defaultValue="p"
                  title="Format block / heading level"
                >
                  <option value="p">Paragraph</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="h4">Heading 4</option>
                </select>

                <div className="h-5 w-px bg-[#DDD4BC] mx-1 shrink-0" />

                {/* Bold */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('bold')}
                  className="h-8 px-2.5 text-[#143520] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
                  title="Bold (Ctrl+B) - Reflects directly in canvas"
                >
                  <Bold className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Bold</span>
                </button>

                {/* Italic */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('italic')}
                  className="h-8 px-2.5 text-[#143520] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg flex items-center gap-1 text-xs italic transition-colors cursor-pointer"
                  title="Italic (Ctrl+I) - Reflects directly in canvas"
                >
                  <Italic className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Italic</span>
                </button>

                {/* Underline */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('underline')}
                  className="h-8 px-2.5 text-[#143520] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg flex items-center gap-1 text-xs underline transition-colors cursor-pointer"
                  title="Underline (Ctrl+U) - Reflects directly in canvas"
                >
                  <Underline className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Underline</span>
                </button>

                {/* Strikethrough */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('strikeThrough')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Strikethrough"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>

                {/* Subscript */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('subscript')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Subscript (e.g. H₂O)"
                >
                  <Subscript className="w-3.5 h-3.5" />
                </button>

                {/* Superscript */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('superscript')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] active:bg-[#DDD4BC] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Superscript (e.g. m²)"
                >
                  <Superscript className="w-3.5 h-3.5" />
                </button>

                <div className="h-5 w-px bg-[#DDD4BC] mx-1 shrink-0" />

                {/* Text Color Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      setShowColorPicker(prev => !prev);
                      setShowHighlightPicker(false);
                    }}
                    className="h-8 px-2.5 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Change Text Color"
                  >
                    <Palette className="w-3.5 h-3.5 text-[#256B3A]" />
                    <span className="text-[11px]">Color</span>
                  </button>

                  {showColorPicker && (
                    <div className="absolute top-10 left-0 z-30 p-2 bg-white rounded-xl border border-[#DDD4BC] shadow-lg flex gap-1.5 items-center">
                      {TEXT_COLORS.map(c => (
                        <button
                          key={c.color}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            exec('foreColor', c.color);
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded-full border border-black/20 hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Highlight Color Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      setShowHighlightPicker(prev => !prev);
                      setShowColorPicker(false);
                    }}
                    className="h-8 px-2.5 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Text Background Highlight"
                  >
                    <Highlighter className="w-3.5 h-3.5 text-[#D97706]" />
                    <span className="text-[11px]">Highlight</span>
                  </button>

                  {showHighlightPicker && (
                    <div className="absolute top-10 left-0 z-30 p-2 bg-white rounded-xl border border-[#DDD4BC] shadow-lg flex gap-1.5 items-center">
                      {HIGHLIGHT_COLORS.map(c => (
                        <button
                          key={c.color}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            exec('hiliteColor', c.color);
                            setShowHighlightPicker(false);
                          }}
                          className="w-6 h-6 rounded-full border border-black/20 hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        />
                      ))}
                      <button
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          exec('hiliteColor', 'transparent');
                          setShowHighlightPicker(false);
                        }}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-[#F6F4EB] text-[#54432C] hover:bg-[#EBE6D6]"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Clear Formatting */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('removeFormat')}
                  className="h-8 px-2 text-[#6F5B3C] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center gap-1 text-xs cursor-pointer"
                  title="Clear formatting on selection"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Clear</span>
                </button>
              </div>

              {/* LINE 2: Alignments, Paragraphs, Lists & Blocks */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#DDD4BC]/60">
                {/* Align Left */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('justifyLeft')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>

                {/* Align Center */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('justifyCenter')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>

                {/* Align Right */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('justifyRight')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>

                {/* Align Justify - REFLECTS DIRECTLY IN CANVAS */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => {
                    exec('justifyFull');
                    setIsCanvasJustified(prev => !prev);
                  }}
                  className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                    isCanvasJustified
                      ? 'bg-[#143520] text-[#BFDC28] border-[#143520]'
                      : 'bg-white text-[#143520] border-[#DDD4BC] hover:bg-[#EBE6D6]'
                  }`}
                  title="Justify Text - Reflects directly in canvas"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Justify</span>
                </button>

                <div className="h-5 w-px bg-[#DDD4BC] mx-1 shrink-0" />

                {/* Bullet List */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('insertUnorderedList')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>

                {/* Numbered List */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('insertOrderedList')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>

                {/* Outdent */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('outdent')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Decrease Indent"
                >
                  <Outdent className="w-3.5 h-3.5" />
                </button>

                {/* Indent */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('indent')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Increase Indent"
                >
                  <Indent className="w-3.5 h-3.5" />
                </button>

                <div className="h-5 w-px bg-[#DDD4BC] mx-1 shrink-0" />

                {/* Blockquote */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('formatBlock', '<blockquote>')}
                  className="h-8 px-2 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center gap-1 text-xs cursor-pointer"
                  title="Blockquote citation"
                >
                  <Quote className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Quote</span>
                </button>

                {/* Inline Code */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={handleInlineCode}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Inline Code"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>

                {/* Code Block */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={handleCodeBlock}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Code Block"
                >
                  <FileCode className="w-3.5 h-3.5" />
                </button>

                {/* Horizontal Divider Line */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('insertHorizontalRule')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Insert Horizontal Divider Line"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="h-5 w-px bg-[#DDD4BC] mx-1 shrink-0" />

                {/* Undo */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('undo')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>

                {/* Redo */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec('redo')}
                  className="w-8 h-8 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* LINE 3: Media, Tables, Custom Agronomy Callouts & View Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Insert / Upload Photo */}
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      saveSelection();
                      setShowImageModal(true);
                    }}
                    className="h-8 px-3 bg-[#EBF1EA] text-[#143520] hover:bg-[#DFEDE3] border border-[#B7CEB4] rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    title="Insert Photo / Picture with Caption into Canvas"
                  >
                    <ImagePlus className="w-3.5 h-3.5 text-[#256B3A]" />
                    <span className="text-[11px]">+ Insert / Upload Photo</span>
                  </button>

                  {/* Insert Link */}
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={handleOpenLinkModal}
                    className="h-8 px-2.5 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    title="Insert Hyperlink"
                  >
                    <Link2 className="w-3.5 h-3.5 text-[#256B3A]" />
                    <span className="text-[11px]">Link</span>
                  </button>

                  {/* Remove Link */}
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={handleUnlink}
                    className="w-8 h-8 text-[#6F5B3C] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center justify-center cursor-pointer"
                    title="Remove Link"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </button>

                  {/* Insert Table */}
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={handleInsertTable}
                    className="h-8 px-2.5 text-[#143520] hover:bg-[#EBE6D6] bg-white border border-[#DDD4BC] rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Insert Comparison Table"
                  >
                    <TableIcon className="w-3.5 h-3.5 text-[#256B3A]" />
                    <span className="text-[11px]">Table</span>
                  </button>

                  {/* Agronomy Field Note Callout */}
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={handleInsertNoteCallout}
                    className="h-8 px-2.5 bg-[#EBF1EA] text-[#1E542E] hover:bg-[#DFEDE3] border border-[#B7CEB4] rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Insert Styled Agronomy Field Note Box"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#256B3A]" />
                    <span className="text-[11px]">Note Callout</span>
                  </button>

                  {/* Warning Callout */}
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={handleInsertWarningCallout}
                    className="h-8 px-2.5 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Insert Caution / Warning Alert Box"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[11px]">Caution Box</span>
                  </button>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-0.5 bg-[#EBE6D6] p-0.5 rounded-lg shrink-0">
                  <button
                    type="button"
                    onClick={() => handleViewModeChange('edit')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      viewMode === 'edit'
                        ? 'bg-white text-[#143520] shadow-xs'
                        : 'text-[#6F5B3C] hover:text-[#143520]'
                    }`}
                    title="Visual Canvas Editor"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Canvas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleViewModeChange('split')}
                    className={`hidden sm:flex px-2.5 py-1 rounded-md text-[11px] font-bold items-center gap-1 cursor-pointer transition-colors ${
                      viewMode === 'split'
                        ? 'bg-white text-[#143520] shadow-xs'
                        : 'text-[#6F5B3C] hover:text-[#143520]'
                    }`}
                    title="Side-by-side Visual & Live Preview"
                  >
                    <Columns className="w-3 h-3" />
                    <span>Split</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleViewModeChange('preview')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      viewMode === 'preview'
                        ? 'bg-white text-[#143520] shadow-xs'
                        : 'text-[#6F5B3C] hover:text-[#143520]'
                    }`}
                    title="Full Article Preview"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleViewModeChange('code')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      viewMode === 'code'
                        ? 'bg-white text-[#143520] shadow-xs'
                        : 'text-[#6F5B3C] hover:text-[#143520]'
                    }`}
                    title="Raw HTML / Markdown Code View"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>Code</span>
                  </button>
                </div>
              </div>
            </div>

            {/* WORKSPACE AREA: Visual Canvas, Split View, Full Preview, or Raw Code */}
            <div className="min-h-[500px] sm:min-h-[650px] bg-white relative">
              {/* Visual Canvas Mode: Formats reflect live inside the canvas */}
              {viewMode === 'edit' && (
                <div className="relative w-full h-full">
                  <div
                    ref={canvasRef}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onInput={handleCanvasInput}
                    onDrop={handleCanvasDrop}
                    onPaste={handleCanvasPaste}
                    className={`w-full min-h-[500px] sm:min-h-[650px] p-5 sm:p-8 bg-white focus:outline-hidden prose-agri max-w-none text-base leading-relaxed text-[#1E2922] ${
                      isCanvasJustified ? 'text-justify [text-align:justify]' : ''
                    }`}
                    style={{ minHeight: '550px' }}
                  />
                  {(!content || content === '<br>' || content === '<p><br></p>') && (
                    <div className="absolute top-8 left-8 text-sm text-[#8F7855]/50 pointer-events-none select-none font-sans">
                      Start writing your article here... Click Bold, Italic, Justify, or Add Photo from the toolbar above!
                    </div>
                  )}
                </div>
              )}

              {/* Split View: Left Visual Canvas, Right Live Rendered Reader View */}
              {viewMode === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#DDD4BC] min-h-[650px]">
                  <div className="relative h-full overflow-y-auto">
                    <div
                      ref={canvasRef}
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onInput={handleCanvasInput}
                      onDrop={handleCanvasDrop}
                      onPaste={handleCanvasPaste}
                      className={`w-full h-full min-h-[650px] p-5 sm:p-6 bg-white focus:outline-hidden prose-agri max-w-none text-base leading-relaxed text-[#1E2922] ${
                        isCanvasJustified ? 'text-justify [text-align:justify]' : ''
                      }`}
                    />
                  </div>
                  <div className="p-6 prose-agri max-w-none bg-[#FAF8F3] overflow-y-auto h-full text-sm">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#8F7855] pb-2 mb-3 border-b border-[#EBE6D6]">
                      Real-Time Rendered Reader View
                    </div>
                    {content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
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

              {/* Full Article Preview */}
              {viewMode === 'preview' && (
                <div className="p-6 sm:p-10 prose-agri max-w-none bg-white min-h-[500px] sm:min-h-[650px]">
                  {content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm text-[#8F7855] italic">
                      Article content is empty. Type in Visual Canvas mode to preview your article.
                    </p>
                  )}
                </div>
              )}

              {/* Raw HTML / Markdown Code View */}
              {viewMode === 'code' && (
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full min-h-[500px] sm:min-h-[650px] p-5 font-mono text-xs sm:text-sm text-[#1E2922] bg-[#FAF8F3] focus:outline-hidden resize-y leading-relaxed"
                  placeholder="Raw HTML/Markdown code..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Left Column: Metadata & Configuration */}
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

          {/* Cover Image Card with Upload and Embed Options */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#143520] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#256B3A]" />
                <span>Cover Image</span>
              </h3>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  Clear Photo
                </button>
              )}
            </div>

            {/* Hidden File Input for Cover Photo Upload */}
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="hidden"
            />

            <div className="space-y-3">
              {/* Cover Source Switcher: Upload vs Link Embedding */}
              <div className="flex items-center p-1 bg-[#F6F4EB] rounded-xl border border-[#DDD4BC]">
                <button
                  type="button"
                  onClick={() => setCoverImageTab('upload')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    coverImageTab === 'upload'
                      ? 'bg-white text-[#143520] shadow-xs'
                      : 'text-[#6F5B3C] hover:text-[#143520]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-[#256B3A]" />
                  <span>Upload Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImageTab('embed')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    coverImageTab === 'embed'
                      ? 'bg-white text-[#143520] shadow-xs'
                      : 'text-[#6F5B3C] hover:text-[#143520]'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5 text-[#256B3A]" />
                  <span>Embed Link</span>
                </button>
              </div>

              {coverImageTab === 'upload' ? (
                <div className="space-y-2">
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#DDD4BC] hover:border-[#256B3A] rounded-xl p-4 text-center bg-[#FAF8F3] hover:bg-[#F6F4EB] transition-colors cursor-pointer space-y-1.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center mx-auto">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#143520] block">
                        {isCoverUploading ? 'Uploading cover photo...' : 'Click to Upload Picture from Device'}
                      </span>
                      <span className="text-[11px] text-[#8F7855]">
                        JPG, PNG, WEBP. Fast automatic web compression.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6F5B3C] mb-1">
                      Direct Image Web Link
                    </label>
                    <input
                      type="url"
                      value={coverImage}
                      onChange={e => setCoverImage(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="w-full px-3.5 py-2 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {PRESET_COVERS.slice(0, 4).map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCoverImage(p.url)}
                        className="aspect-16/10 rounded-lg overflow-hidden border border-[#DDD4BC] hover:border-[#256B3A] relative group cursor-pointer"
                        title={p.label}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Cover Image Preview */}
              {coverImage && (
                <div className="space-y-2 pt-2 border-t border-[#EBE6D6]">
                  <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-[#EBE6D6] border border-[#DDD4BC] group">
                    <img
                      src={resolveImageUrl(coverImage)}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = PRESET_COVERS[0].url;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-[#143520] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#256B3A]" />
                        <span>Change Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white transition-all shadow-xs cursor-pointer"
                        title="Remove Cover Photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                      Active Cover Photo Preview
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#8F7855]">
                    <span>Cover is ready for publication</span>
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="text-red-600 hover:underline font-semibold cursor-pointer"
                    >
                      Clear image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Insert Link Dialog */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#DDD4BC] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#143520] flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#256B3A]" />
                <span>Insert Hyperlink</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded-lg text-[#8F7855] hover:text-[#143520]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#6F5B3C] mb-1">
                  Destination Web URL (https://...) *
                </label>
                <input
                  type="url"
                  value={linkUrlInput}
                  onChange={e => setLinkUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6F5B3C] mb-1">
                  Display Text (Optional)
                </label>
                <input
                  type="text"
                  value={linkTextInput}
                  onChange={e => setLinkTextInput(e.target.value)}
                  placeholder="Link label or title..."
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBE6D6]">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6F5B3C] hover:bg-[#F6F4EB] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-5 py-2 text-xs font-bold bg-[#143520] hover:bg-[#1E542E] text-white rounded-xl shadow-xs cursor-pointer"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Inline Image Insertion Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#DDD4BC] p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#143520] flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-[#256B3A]" />
                <span>Insert Photo into Article</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-lg text-[#8F7855] hover:text-[#143520]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center p-1 bg-[#F6F4EB] rounded-xl border border-[#DDD4BC]">
              <button
                type="button"
                onClick={() => setImageModalTab('upload')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  imageModalTab === 'upload'
                    ? 'bg-white text-[#143520] shadow-xs'
                    : 'text-[#6F5B3C] hover:text-[#143520]'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-[#256B3A]" />
                <span>Upload from Device</span>
              </button>
              <button
                type="button"
                onClick={() => setImageModalTab('embed')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  imageModalTab === 'embed'
                    ? 'bg-white text-[#143520] shadow-xs'
                    : 'text-[#6F5B3C] hover:text-[#143520]'
                }`}
              >
                <Link2 className="w-3.5 h-3.5 text-[#256B3A]" />
                <span>Web Image Link</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Tab 1: Upload from local device */}
            {imageModalTab === 'upload' && (
              <div className="space-y-4">
                {!imageUploadPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#DDD4BC] hover:border-[#256B3A] rounded-xl p-8 text-center bg-[#FAF8F3] hover:bg-[#F6F4EB] transition-colors cursor-pointer space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#143520] block">
                        {isCompressing ? 'Optimizing photo...' : 'Click to select picture from phone or computer'}
                      </span>
                      <span className="text-[11px] text-[#8F7855]">
                        Supports JPG, PNG, WEBP. Optimized automatically for fast web loading.
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
                    Or select sample agriculture photo:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COVERS.slice(0, 4).map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageEmbedUrl(p.url)}
                        className="rounded-lg overflow-hidden border border-[#DDD4BC] hover:border-[#256B3A] aspect-16/10 relative group cursor-pointer"
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
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

      {/* MODAL 3: Inline New Category Modal */}
      {showNewCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#DDD4BC] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#143520]">
                Create New Agricultural Sector
              </h3>
              <button
                type="button"
                onClick={() => setShowNewCatModal(false)}
                className="p-1 rounded-lg text-[#8F7855] hover:text-[#143520]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#6F5B3C] mb-1">
                  Sector / Category Name *
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Agroforestry & Bamboo"
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6F5B3C] mb-1">
                  Description
                </label>
                <textarea
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  placeholder="Brief description of this domain..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBE6D6]">
              <button
                type="button"
                onClick={() => setShowNewCatModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6F5B3C] hover:bg-[#F6F4EB] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                className="px-5 py-2 text-xs font-bold bg-[#143520] hover:bg-[#1E542E] text-white rounded-xl shadow-xs cursor-pointer"
              >
                Create Sector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Inline New Author Modal */}
      {showNewAuthorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#DDD4BC] p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#143520]">
                Add New Author Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowNewAuthorModal(false)}
                className="p-1 rounded-lg text-[#8F7855] hover:text-[#143520]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#6F5B3C] mb-1">
                  Author Full Name *
                </label>
                <input
                  type="text"
                  value={newAuthorName}
                  onChange={e => setNewAuthorName(e.target.value)}
                  placeholder="e.g. Dr. H. Lalrinchhana"
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6F5B3C] mb-1">
                  Professional Role / Job Title
                </label>
                <input
                  type="text"
                  value={newAuthorRole}
                  onChange={e => setNewAuthorRole(e.target.value)}
                  placeholder="e.g. Senior Soil Microbiologist"
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6F5B3C] mb-1">
                  Institution or District
                </label>
                <input
                  type="text"
                  value={newAuthorInst}
                  onChange={e => setNewAuthorInst(e.target.value)}
                  placeholder="e.g. Champhai District Organic Cluster"
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>

              {/* Author Avatar Upload vs Embed */}
              <div>
                <label className="block text-xs font-bold text-[#6F5B3C] mb-1">
                  Profile Avatar Picture
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={newAuthorAvatar}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-[#DDD4BC]"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={newAuthorAvatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleNewAuthorAvatarFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => newAuthorAvatarInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#143520] text-xs font-bold border border-[#DDD4BC] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#256B3A]" />
                      <span>{isNewAuthorAvatarUploading ? 'Uploading...' : 'Upload Avatar'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6F5B3C] mb-1">
                  Author Biography
                </label>
                <textarea
                  value={newAuthorBio}
                  onChange={e => setNewAuthorBio(e.target.value)}
                  placeholder="Brief background and scientific expertise..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBE6D6]">
              <button
                type="button"
                onClick={() => setShowNewAuthorModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6F5B3C] hover:bg-[#F6F4EB] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAuthor}
                className="px-5 py-2 text-xs font-bold bg-[#143520] hover:bg-[#1E542E] text-white rounded-xl shadow-xs cursor-pointer"
              >
                Create Author
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
