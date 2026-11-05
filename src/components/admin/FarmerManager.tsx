import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useBlog } from '../../context/BlogContext';
import type { FarmerRecord } from '../../types/farmer';
import { 
  parseExcelToFarmers, 
  downloadSampleFarmerTemplate, 
  exportFarmersToExcel,
  type ParseResult 
} from '../../utils/excelFarmerParser';
import { exportFarmersToPdf } from '../../utils/pdfFarmerExporter';
import { downloadFarmerBackup, parseFarmerBackupFile } from '../../utils/farmerBackupUtils';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileText,
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Download, 
  Upload,
  CheckCircle2, 
  AlertCircle, 
  X, 
  Camera, 
  Eye, 
  ShieldCheck, 
  Check,
  Columns,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List,
  Database,
  MessageCircle,
  Building2,
  Phone
} from 'lucide-react';
import { FarmerDetailModal } from '../farmer/FarmerDetailModal';

const PAGE_SIZE = 8;

// Helper to canonicalize and format block names (e.g. CHAMPHAI, Champhai -> Champhai; khawbung, KHAWBUNG -> Khawbung)
function formatBlockName(raw: string): string {
  if (!raw) return '';
  // 1. Clean invisible zero-width chars and whitespace
  let clean = String(raw)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  if (!clean) return '';

  // 2. Remove trailing punctuation e.g. .,;:-
  clean = clean.replace(/[.,;:\-_/]+$/, '').trim();

  // 3. Remove common block suffixes/prefixes:
  // e.g. "RD Block", "R.D. Block", "C.D. Block", "CD Block", "Block", "(Block)"
  clean = clean.replace(/\s*\(?(?:r\.?d\.?|c\.?d\.?|dev\.?)?\s*block\)?$/i, '').trim();
  clean = clean.replace(/^(?:r\.?d\.?|c\.?d\.?|dev\.?)?\s*block\s*:?\s*/i, '').trim();
  clean = clean.replace(/[.,;:\-_/]+$/, '').trim();

  if (!clean) clean = String(raw).trim();

  // 4. Convert to Title Case words (e.g., 'CHAMPHAI' -> 'Champhai', 'khawbung' -> 'Khawbung')
  return clean
    .toLowerCase()
    .split(/\s+/)
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
    .join(' ')
    .trim();
}

// Helper to extract block from farmer record data
function getFarmerBlock(farmer: FarmerRecord): string {
  if (!farmer || !farmer.data) return '';
  const entries = Object.entries(farmer.data);

  // 1. Direct exact block header: Block, RD Block, Block Name, etc.
  for (const [key, val] of entries) {
    if (/^(block|block\s*name|rd\s*block|r\.d\.\s*block)$/i.test(key.trim())) {
      const s = String(val || '').trim();
      if (s) return formatBlockName(s);
    }
  }

  // 2. Key contains block (excluding id, code, sl, no, number)
  for (const [key, val] of entries) {
    if (/block/i.test(key) && !/(code|id|no|number|sl|num)/i.test(key)) {
      const s = String(val || '').trim();
      if (s) return formatBlockName(s);
    }
  }

  // 3. Composite keys like District/Block or Cluster or Circle
  for (const [key, val] of entries) {
    if (/(cluster|circle|district.*block|block.*district)/i.test(key)) {
      const s = String(val || '').trim();
      if (s) return formatBlockName(s);
    }
  }

  // 4. Any key containing block
  for (const [key, val] of entries) {
    if (/block/i.test(key)) {
      const s = String(val || '').trim();
      if (s) return formatBlockName(s);
    }
  }

  // 5. If record has no block column, check if District matches Champhai or Khawbung
  for (const [key, val] of entries) {
    if (/district/i.test(key)) {
      const s = String(val || '').trim();
      if (s && /(champhai|khawbung)/i.test(s)) {
        return formatBlockName(s);
      }
    }
  }

  // 6. Any field that equals Champhai or Khawbung (case-insensitive)
  for (const [_, val] of entries) {
    const s = String(val || '').trim();
    if (/^(champhai|khawbung)$/i.test(s)) {
      return formatBlockName(s);
    }
  }

  return '';
}

// Helper to extract contact number
function getFarmerContact(farmer: FarmerRecord): string {
  if (!farmer || !farmer.data) return '';
  for (const [key, val] of Object.entries(farmer.data)) {
    if (/contact|phone|mobile|cell|whatsapp|ph/i.test(key)) {
      const s = String(val || '').trim();
      if (s) return s;
    }
  }
  return '';
}

// Helper to format WhatsApp click-to-chat URL
function getWhatsAppUrl(contact: string, name?: string): string | null {
  const digits = (contact || '').replace(/\D/g, '');
  if (!digits || digits.length < 10) return null;
  const phone = digits.length === 10 ? `91${digits}` : digits;
  const msg = encodeURIComponent(
    name ? `Chibai ${name}! Loneitu (Mizoram Tan) atanga biak i ni e.` : 'Chibai! Loneitu (Mizoram Tan) atanga biak i ni e.'
  );
  return `https://wa.me/${phone}?text=${msg}`;
}

// Helper to format direct phone call link
function getDirectCallUrl(contact: string): string | null {
  const digits = (contact || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return `tel:+91${digits}`;
  if (digits.length > 10) return `tel:+${digits}`;
  if (digits.length >= 6) return `tel:${digits}`;
  return null;
}

export const FarmerManager: React.FC = () => {
  const { 
    farmers, 
    farmerCustomFields,
    addFarmer, 
    updateFarmer, 
    deleteFarmer, 
    wipeAllFarmers,
    batchImportFarmers,
    renameColumn,
    deleteColumn,
    addColumn,
    uploadImage,
    pushToCloudDatabase
  } = useBlog();

  // View mode: Default is 'card' view
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination: 10 profiles per page
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedFarmerForDetail, setSelectedFarmerForDetail] = useState<FarmerRecord | null>(null);
  const [editingFarmer, setEditingFarmer] = useState<Partial<FarmerRecord> | null>(null);

  // Backup restore state
  const [pendingRestore, setPendingRestore] = useState<{
    farmers: FarmerRecord[];
    farmerCustomFields: any[];
    totalRecords: number;
  } | null>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');

  // Status and feedback messages
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Global Add Column state
  const [newGlobalColumnName, setNewGlobalColumnName] = useState('');

  // Column rename state
  const [editingHeaderCol, setEditingHeaderCol] = useState<{ oldName: string; newName: string } | null>(null);

  // Table cell inline edit state (for table view)
  const [editingCell, setEditingCell] = useState<{ farmerId: string; column: string; value: string } | null>(null);

  // Excel Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // New column addition in Edit/Create modal
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnVal, setNewColumnVal] = useState('');

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // Auto clear feedback banner after 4 seconds
  useEffect(() => {
    if (statusFeedback) {
      const timer = setTimeout(() => setStatusFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusFeedback]);

  // Determine all distinct uploaded columns across all records + custom fields
  const allColumns = Array.from(
    new Set([
      ...(farmerCustomFields || []).map(f => f.label || f.key),
      ...farmers.flatMap(f => {
        const fromCols = f.columns || [];
        const fromData = Object.keys(f.data || {});
        return [...fromCols, ...fromData];
      })
    ])
  ).filter(c => Boolean(c) && !['name', 'farmer name', 'full name', 'hming', 'avatar', 'photo'].includes(c.toLowerCase().trim()));

  // Determine summary columns to show on the card: only up to Contact No.
  const contactIdx = allColumns.findIndex(c => /contact|phone|mobile|call|ph/i.test(c));
  const summaryColumns = contactIdx !== -1 
    ? allColumns.slice(0, contactIdx + 1)
    : allColumns.slice(0, Math.min(allColumns.length, 3));
  const extraColumnsCount = Math.max(0, allColumns.length - summaryColumns.length);

  // Block Filter State (District removed per user request)
  const [selectedBlock, setSelectedBlock] = useState<string>('all');

  // Active Registry Columns Dropdown Menu state
  const [isColumnsDropdownOpen, setIsColumnsDropdownOpen] = useState(false);

  // Determine available blocks from all farmer records (case-insensitive combined)
  const availableBlocks = useMemo(() => {
    const blocksMap = new Map<string, { name: string; count: number }>();
    farmers.forEach(f => {
      const b = getFarmerBlock(f);
      if (b) {
        const canonicalKey = b.toLowerCase();
        const existing = blocksMap.get(canonicalKey);
        if (existing) {
          existing.count += 1;
        } else {
          blocksMap.set(canonicalKey, { name: b, count: 1 });
        }
      }
    });

    return Array.from(blocksMap.values())
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [farmers]);

  // Reset page to 1 when search query or selected block changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBlock]);

  // Filtered farmers based on block and search
  const filteredFarmers = useMemo(() => {
    return farmers.filter(farmer => {
      // 1. Block filter (case-insensitive match)
      if (selectedBlock !== 'all') {
        const block = getFarmerBlock(farmer);
        const sel = selectedBlock.toLowerCase();
        if (block) {
          const blk = block.toLowerCase();
          if (blk !== sel && !blk.includes(sel) && !sel.includes(blk)) {
            return false;
          }
        } else {
          const match = Object.values(farmer.data || {}).some(v => 
            String(v).toLowerCase().includes(sel)
          );
          if (!match) return false;
        }
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = farmer.fullName.toLowerCase().includes(q);
        const matchData = Object.values(farmer.data || {}).some(val => 
          String(val).toLowerCase().includes(q)
        );
        if (!matchName && !matchData) return false;
      }

      return true;
    });
  }, [farmers, selectedBlock, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredFarmers.length / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedFarmers = filteredFarmers.slice(
    (effectivePage - 1) * PAGE_SIZE,
    effectivePage * PAGE_SIZE
  );

  // Handlers for Single Farmer Modal (Create / Edit)
  const handleOpenAddModal = () => {
    const initialData: Record<string, string | number | boolean> = {};
    allColumns.forEach(col => {
      initialData[col] = '';
    });

    setEditingFarmer({
      fullName: '',
      avatar: '',
      data: initialData,
      columns: allColumns
    });
    setNewColumnName('');
    setNewColumnVal('');
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (farmer: FarmerRecord) => {
    setEditingFarmer({
      ...farmer,
      avatar: farmer.avatar && !farmer.avatar.includes('unsplash') ? farmer.avatar : '',
      data: { ...(farmer.data || {}) },
      columns: [...(farmer.columns || allColumns)]
    });
    setNewColumnName('');
    setNewColumnVal('');
    setIsEditModalOpen(true);
  };

  const handleSaveFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarmer || !editingFarmer.fullName?.trim()) return;

    if (editingFarmer.id) {
      updateFarmer(editingFarmer.id, editingFarmer);
      setStatusFeedback({ type: 'success', message: `Updated profile for "${editingFarmer.fullName}"` });
    } else {
      addFarmer(editingFarmer as any);
      setStatusFeedback({ type: 'success', message: `Added new farmer "${editingFarmer.fullName}"` });
    }
    setIsEditModalOpen(false);
    setEditingFarmer(null);
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const uploadedUrl = await uploadImage(dataUrl, `farmer-avatar-${Date.now()}`);
        setEditingFarmer(prev => (prev ? { ...prev, avatar: uploadedUrl } : null));
        setStatusFeedback({ type: 'success', message: 'Profile photo uploaded successfully' });
      } catch {
        setEditingFarmer(prev => (prev ? { ...prev, avatar: dataUrl } : null));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewColumnInModal = () => {
    if (!newColumnName.trim() || !editingFarmer) return;
    const colName = newColumnName.trim();
    const currentData = { ...(editingFarmer.data || {}) };
    currentData[colName] = newColumnVal.trim();

    const currentCols = Array.from(new Set([...(editingFarmer.columns || []), colName]));

    setEditingFarmer({
      ...editingFarmer,
      data: currentData,
      columns: currentCols
    });

    setNewColumnName('');
    setNewColumnVal('');
  };

  const handleRenameRecordField = (oldKey: string, newKey: string) => {
    if (!editingFarmer || !editingFarmer.data) return;
    const currentData = { ...editingFarmer.data };
    const val = currentData[oldKey];
    delete currentData[oldKey];
    currentData[newKey] = val;
    const currentCols = (editingFarmer.columns || []).map(c => c === oldKey ? newKey : c);
    setEditingFarmer({
      ...editingFarmer,
      data: currentData,
      columns: currentCols
    });
  };

  const handleRemoveField = (colName: string) => {
    if (!editingFarmer || !editingFarmer.data) return;
    const currentData = { ...editingFarmer.data };
    delete currentData[colName];

    const currentCols = (editingFarmer.columns || []).filter(c => c !== colName);

    setEditingFarmer({
      ...editingFarmer,
      data: currentData,
      columns: currentCols
    });
  };

  // Header column rename
  const handleSaveHeaderRename = () => {
    if (!editingHeaderCol) return;
    const trimmed = editingHeaderCol.newName.trim();
    if (trimmed && trimmed !== editingHeaderCol.oldName) {
      renameColumn(editingHeaderCol.oldName, trimmed);
      setStatusFeedback({ type: 'success', message: `Renamed column "${editingHeaderCol.oldName}" to "${trimmed}"` });
    }
    setEditingHeaderCol(null);
  };

  // Table cell inline edit save
  const handleSaveCellEdit = () => {
    if (!editingCell) return;
    const { farmerId, column, value } = editingCell;
    const target = farmers.find(f => f.id === farmerId);
    if (!target) {
      setEditingCell(null);
      return;
    }

    if (column === '__fullName__') {
      const trimmed = value.trim();
      if (trimmed && trimmed !== target.fullName) {
        updateFarmer(farmerId, { fullName: trimmed });
      }
    } else {
      const currentVal = target.data?.[column] !== undefined ? String(target.data[column]) : '';
      if (value !== currentVal) {
        const updatedData = { ...(target.data || {}), [column]: value };
        updateFarmer(farmerId, { data: updatedData });
      }
    }
    setEditingCell(null);
  };

  // Excel Drag and Drop parsing
  const handleExcelFileDrop = async (file: File) => {
    setImportFile(file);
    setIsParsing(true);
    setParseError(null);
    setParseResult(null);

    try {
      const result = await parseExcelToFarmers(file);
      setParseResult(result);
    } catch (err: any) {
      setParseError(err?.message || 'Failed to parse spreadsheet.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleCommitBatchImport = () => {
    if (!parseResult || parseResult.records.length === 0) return;
    batchImportFarmers(parseResult.records);
    setImportSuccessMsg(`Successfully imported ${parseResult.records.length} records with columns: ${parseResult.detectedHeaders.join(', ')}`);
    setStatusFeedback({ type: 'success', message: `Imported ${parseResult.records.length} records from Excel.` });
    setTimeout(() => {
      setImportSuccessMsg(null);
      setIsImportModalOpen(false);
      setImportFile(null);
      setParseResult(null);
    }, 1800);
  };

  // Export handlers
  const handleExportExcel = () => {
    if (farmers.length === 0) {
      setStatusFeedback({ type: 'error', message: 'No farmer records to export.' });
      return;
    }
    exportFarmersToExcel(farmers);
    setStatusFeedback({ type: 'success', message: `Exported ${farmers.length} records to Excel (.xlsx)` });
  };

  const handleExportPdf = () => {
    if (farmers.length === 0) {
      setStatusFeedback({ type: 'error', message: 'No farmer records to export.' });
      return;
    }
    exportFarmersToPdf(farmers, allColumns);
    setStatusFeedback({ type: 'success', message: `Exported ${farmers.length} records to PDF document (.pdf)` });
  };

  const handleDownloadBackup = () => {
    if (farmers.length === 0) {
      setStatusFeedback({ type: 'error', message: 'No farmer records available to backup.' });
      return;
    }
    downloadFarmerBackup(farmers, farmerCustomFields, allColumns);
    setStatusFeedback({ type: 'success', message: `Farmer Registry snapshot backup downloaded (.json)` });
  };

  // Backup restore file upload handling
  const handleBackupFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseFarmerBackupFile(file);
      setPendingRestore(parsed);
      setIsRestoreModalOpen(true);
    } catch (err: any) {
      setStatusFeedback({ type: 'error', message: err?.message || 'Failed to read backup file.' });
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleConfirmRestore = () => {
    if (!pendingRestore) return;

    if (restoreMode === 'replace') {
      try {
        localStorage.setItem('loneitu_mizo_farmers_v2', JSON.stringify(pendingRestore.farmers));
        if (pendingRestore.farmerCustomFields) {
          localStorage.setItem('loneitu_farmer_custom_fields_v1', JSON.stringify(pendingRestore.farmerCustomFields));
        }
      } catch {}
      pushToCloudDatabase({
        farmers: pendingRestore.farmers,
        farmerCustomFields: pendingRestore.farmerCustomFields || []
      });
      window.location.reload();
    } else {
      batchImportFarmers(pendingRestore.farmers);
      setStatusFeedback({ type: 'success', message: `Merged ${pendingRestore.farmers.length} backup records into registry.` });
    }

    setIsRestoreModalOpen(false);
    setPendingRestore(null);
  };

  // Pagination range generation
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, effectivePage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner (Admin Only Header) */}
      <div className="bg-gradient-to-r from-[#143520] via-[#1d4c2e] to-[#256B3A] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md mb-3 border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Admin Console Exclusive</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Registry of Farmers
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Internal admin management system. Presenting profiles in compact Green Card View (8 profiles per page) with PDF/Excel export and backup capabilities.
            </p>
          </div>

          {/* Quick Action Buttons Toolbar (8 Actions: Clean icons/signs on mobile, icon+label on desktop) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
            {/* 1. Add Record (+) */}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold bg-[#C9A84C] hover:bg-[#b8953c] text-white transition-all shadow-md active:scale-95 cursor-pointer"
              title="Add Record (+)"
              aria-label="Add Record"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Add Record</span>
            </button>

            {/* 2. + Add Column */}
            <button
              onClick={() => {
                setNewGlobalColumnName('');
                setIsAddColumnModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 cursor-pointer"
              title="+ Add Column"
              aria-label="Add Column"
            >
              <Columns className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">+ Add Column</span>
            </button>

            {/* 3. Excel Import */}
            <button
              onClick={() => {
                setImportFile(null);
                setParseResult(null);
                setParseError(null);
                setIsImportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold bg-white text-[#143520] hover:bg-emerald-50 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Excel Import (.xlsx / .xls)"
              aria-label="Excel Import"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#256B3A] shrink-0" />
              <span className="hidden sm:inline">Excel Import</span>
            </button>

            {/* Export & Backup Section */}
            {farmers.length > 0 && (
              <>
                {/* 4. Export Excel */}
                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/25 hover:bg-emerald-500/35 text-white transition-all border border-emerald-300/30 shadow-xs active:scale-95 cursor-pointer"
                  title="Export Excel (.xlsx)"
                  aria-label="Export Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="hidden sm:inline">Export Excel</span>
                </button>

                {/* 5. Export PDF */}
                <button
                  onClick={handleExportPdf}
                  className="inline-flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-semibold bg-rose-500/25 hover:bg-rose-500/35 text-white transition-all border border-rose-300/30 shadow-xs active:scale-95 cursor-pointer"
                  title="Export PDF Document (.pdf)"
                  aria-label="Export PDF"
                >
                  <FileText className="w-4 h-4 text-rose-300 shrink-0" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>

                {/* 6. Backup (.json) */}
                <button
                  onClick={handleDownloadBackup}
                  className="inline-flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-semibold bg-blue-500/25 hover:bg-blue-500/35 text-white transition-all border border-blue-300/30 shadow-xs active:scale-95 cursor-pointer"
                  title="Backup Registry (.json)"
                  aria-label="Backup JSON"
                >
                  <Database className="w-4 h-4 text-blue-300 shrink-0" />
                  <span className="hidden sm:inline">Backup (.json)</span>
                </button>
              </>
            )}

            {/* 7. Restore Backup */}
            <button
              onClick={() => backupFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 active:scale-95 cursor-pointer"
              title="Restore from Backup File (.json)"
              aria-label="Restore Backup"
            >
              <Upload className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="hidden sm:inline">Restore Backup</span>
            </button>

            <input
              ref={backupFileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleBackupFileSelect}
            />

            {/* 8. Wipe All */}
            {farmers.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to completely wipe all ${farmers.length} farmer registry records? This will delete all records immediately.`)) {
                    wipeAllFarmers();
                    setStatusFeedback({ type: 'success', message: 'Wiped all farmer records from registry.' });
                  }
                }}
                className="inline-flex items-center gap-1.5 p-2.5 sm:px-3 sm:py-2.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 transition-all cursor-pointer active:scale-95"
                title="Wipe All Farmer Records"
                aria-label="Wipe All"
              >
                <Trash2 className="w-4 h-4 text-rose-300 shrink-0" />
                <span className="hidden sm:inline">Wipe All</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15 text-white">
          <div>
            <span className="text-xs text-emerald-200 block">Total Records</span>
            <p className="text-2xl font-black mt-0.5">{farmers.length}</p>
          </div>
          <div>
            <span className="text-xs text-emerald-200 block">Active Columns</span>
            <p className="text-2xl font-black mt-0.5">{allColumns.length}</p>
          </div>
          <div>
            <span className="text-xs text-emerald-200 block">Current Page</span>
            <p className="text-2xl font-black mt-0.5">{effectivePage} / {totalPages}</p>
          </div>
          <div>
            <span className="text-xs text-emerald-200 block">Per Page View</span>
            <p className="text-2xl font-black mt-0.5">8 Profiles</p>
          </div>
        </div>
      </div>

      {/* Floating Status Feedback Toast / Banner */}
      {statusFeedback && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold transition-all shadow-md animate-fadeIn ${
          statusFeedback.type === 'success' 
            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {statusFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 dark:text-rose-300" />
            )}
            <span>{statusFeedback.message}</span>
          </div>
          <button onClick={() => setStatusFeedback(null)} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search, View Mode & Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/60 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#256B3A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all columns and fields..."
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#256B3A]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switcher & Column Trigger */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-emerald-50 dark:bg-slate-800 p-1 rounded-xl border border-emerald-200/70 dark:border-slate-700">
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'card'
                  ? 'bg-[#256B3A] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#256B3A]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-[#256B3A] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#256B3A]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={() => {
              setNewGlobalColumnName('');
              setIsAddColumnModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#EBF1EA] dark:bg-emerald-950/60 text-[#143520] dark:text-emerald-300 hover:bg-emerald-100 transition-colors border border-emerald-200/60 dark:border-emerald-800/60"
          >
            <Plus className="w-3.5 h-3.5 text-[#256B3A]" />
            <span>Add Column</span>
          </button>
        </div>
      </div>

      {/* BLOCK FILTER (Block Thlanna Dropdown Menu) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/60 dark:from-[#0d2616] dark:via-slate-900 dark:to-[#0a1f12] rounded-2xl p-3.5 sm:p-4 border border-emerald-200 dark:border-emerald-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#256B3A] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-4 h-4 text-[#BFDC28]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#143520] dark:text-emerald-300">
                Block Thlanna (Filter by Block)
              </span>
              {selectedBlock !== 'all' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                  Active: {selectedBlock}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#1E542E] dark:text-emerald-400 font-medium">
              Dropdown menu atang hian farmer-te awmna block thlang rawh le
            </p>
          </div>
        </div>

        {/* Block Dropdown Menu */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700 text-[#143520] dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#256B3A] cursor-pointer shadow-2xs"
            >
              <option value="all">Block Zawng Zawng (All Blocks - {farmers.length})</option>
              {availableBlocks.map(block => (
                <option key={block.name} value={block.name}>
                  {block.name} ({block.count} {block.count === 1 ? 'farmer' : 'farmers'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#256B3A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedBlock !== 'all' && (
            <button
              onClick={() => setSelectedBlock('all')}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shadow-2xs shrink-0"
              title="Clear Block Filter"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tibo Rawh</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE REGISTRY COLUMNS: Dropdown Menu */}
      {allColumns.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsColumnsDropdownOpen(!isColumnsDropdownOpen)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0d2616] dark:via-slate-900 dark:to-[#0a1f12] border-2 border-emerald-300 dark:border-emerald-800 shadow-xs hover:border-[#256B3A] transition-all cursor-pointer"
            aria-expanded={isColumnsDropdownOpen}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#256B3A] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Columns className="w-4 h-4 text-[#BFDC28]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#143520] dark:text-emerald-300">
                    Active Registry Columns
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-700 text-white font-black">
                    {allColumns.length} Columns
                  </span>
                </div>
                <p className="text-[11px] text-[#1E542E] dark:text-emerald-400 font-medium">
                  Hmet la, column zawng zawng en, rename, emaw delete rawh le
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[#256B3A] dark:text-emerald-300 font-bold text-xs shrink-0 ml-2">
              <span className="hidden sm:inline">{isColumnsDropdownOpen ? 'Close Menu' : 'View / Manage Columns'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isColumnsDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown Menu Panel */}
          {isColumnsDropdownOpen && (
            <div className="mt-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-800 shadow-xl space-y-3 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-100 dark:border-emerald-900/60">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  💡 Double-click or click pencil to rename header globally
                </span>
                <button
                  onClick={() => {
                    setNewGlobalColumnName('');
                    setIsAddColumnModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#256B3A] text-white hover:bg-[#1b4d2a] transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Column</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 max-h-60 overflow-y-auto p-1 scrollbar-thin">
                {allColumns.map((col, idx) => (
                  <div 
                    key={col}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800 text-xs shadow-2xs hover:border-[#256B3A] dark:hover:border-emerald-400 transition-all"
                  >
                    {editingHeaderCol?.oldName === col ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          autoFocus
                          value={editingHeaderCol.newName}
                          onChange={(e) => setEditingHeaderCol({ ...editingHeaderCol, newName: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveHeaderRename();
                            if (e.key === 'Escape') setEditingHeaderCol(null);
                          }}
                          className="px-2 py-0.5 text-xs font-bold rounded-lg border border-[#256B3A] bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none w-28"
                        />
                        <button
                          onClick={handleSaveHeaderRename}
                          className="p-1 rounded bg-[#256B3A] text-white hover:bg-[#1b4d2a]"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingHeaderCol(null)}
                          className="p-1 rounded bg-slate-200 text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="w-4 h-4 rounded-full bg-[#143520] text-emerald-200 text-[9px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span 
                          onDoubleClick={() => setEditingHeaderCol({ oldName: col, newName: col })}
                          className="font-bold text-[#143520] dark:text-emerald-100 cursor-pointer hover:underline"
                          title="Double-click to rename"
                        >
                          {col}
                        </span>
                        <div className="flex items-center gap-0.5 ml-1">
                          <button
                            onClick={() => setEditingHeaderCol({ oldName: col, newName: col })}
                            className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                            title={`Rename column "${col}"`}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete column "${col}" across all farmer records?`)) {
                                deleteColumn(col);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                            title={`Delete column "${col}"`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MAIN VIEW CONTENT: COMPACT GREEN CARDS (DEFAULT) */}
      {viewMode === 'card' ? (
        <div className="space-y-6">
          {paginatedFarmers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border-2 border-dashed border-emerald-200 dark:border-emerald-900 text-slate-400">
              <p className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
                {farmers.length === 0 ? 'No farmer profiles yet' : 'No records match your search'}
              </p>
              <p className="text-xs text-slate-400">
                {farmers.length === 0 ? 'Use "Excel Import" or "+ Add Record" to add your first farmer.' : 'Try adjusting your search query.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {paginatedFarmers.map(farmer => {
                const farmerContact = getFarmerContact(farmer);
                const farmerWaUrl = farmerContact ? getWhatsAppUrl(farmerContact, farmer.fullName) : null;
                const farmerCallUrl = farmerContact ? getDirectCallUrl(farmerContact) : null;

                return (
                <div
                  key={farmer.id}
                  onClick={() => setSelectedFarmerForDetail(farmer)}
                  className="group relative flex flex-col justify-between bg-gradient-to-b from-[#F3F8F4] to-white dark:from-[#0d2616] dark:to-[#0a1a0f] rounded-2xl border-2 border-emerald-200/90 dark:border-emerald-800/80 hover:border-[#256B3A] dark:hover:border-emerald-400 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
                >
                  {/* Decorative Forest Green Accent Top Strip */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#143520] via-[#256B3A] to-[#409b5c]" />

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    {/* Card Top: Monogram/Avatar & Full Unobstructed Farmer Name */}
                    <div>
                      <div className="flex items-center gap-3 pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
                        <div className="relative shrink-0">
                          {farmer.avatar ? (
                            <img
                              src={farmer.avatar}
                              alt={farmer.fullName}
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-[#256B3A]/30 dark:ring-emerald-400/30 shadow-xs"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#143520] to-[#256B3A] text-white font-black text-sm flex items-center justify-center shadow-xs ring-2 ring-emerald-500/20 shrink-0">
                              {farmer.fullName ? farmer.fullName.trim().charAt(0).toUpperCase() : 'F'}
                            </div>
                          )}
                          <div 
                            className="absolute -bottom-0.5 -right-0.5 bg-[#256B3A] text-white p-0.5 rounded-full shadow-xs ring-1 ring-white dark:ring-slate-900"
                            title="Verified"
                          >
                            <ShieldCheck className="w-2.5 h-2.5 text-[#BFDC28]" />
                          </div>
                        </div>

                        {/* Full width unobstructed name */}
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-sm sm:text-base font-black text-[#143520] dark:text-emerald-100 group-hover:text-[#256B3A] dark:group-hover:text-emerald-300 transition-colors leading-snug line-clamp-2"
                            title={farmer.fullName}
                          >
                            {farmer.fullName}
                          </h3>
                        </div>
                      </div>

                      {/* Card Body: Summary Attributes Displayed ONLY UP TO CONTACT NO */}
                      <div className="py-2.5 space-y-1.5">
                        {summaryColumns.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic text-center py-1">No fields uploaded</p>
                        ) : (
                          summaryColumns.map(col => {
                            const val = farmer.data?.[col];
                            const isContact = /contact|phone|mobile|call|cell|whatsapp|ph/i.test(col);
                            const rowWaUrl = isContact && val ? getWhatsAppUrl(String(val), farmer.fullName) : null;
                            const rowCallUrl = isContact && val ? getDirectCallUrl(String(val)) : null;

                            return (
                              <div 
                                key={col}
                                className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60"
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#256B3A] dark:text-emerald-400 truncate max-w-[40%]">
                                  {col}:
                                </span>
                                <div className="flex items-center gap-1.5 truncate max-w-[60%] justify-end">
                                  <span 
                                    className="font-bold text-slate-800 dark:text-slate-100 truncate text-[11px] text-right" 
                                    title={String(val ?? '')}
                                  >
                                    {val !== undefined && val !== '' ? String(val) : <span className="text-slate-400 font-normal italic">-</span>}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {rowCallUrl && (
                                      <a
                                        href={rowCallUrl}
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black shadow-2xs hover:scale-105 transition-transform"
                                        title={`Call ${farmer.fullName} (${val})`}
                                      >
                                        <Phone className="w-2.5 h-2.5 fill-current" />
                                        <span>Call</span>
                                      </a>
                                    )}
                                    {rowWaUrl && (
                                      <a
                                        href={rowWaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#25D366] hover:bg-[#20ba5a] text-white text-[9px] font-black shadow-2xs hover:scale-105 transition-transform"
                                        title={`Direct WhatsApp to ${farmer.fullName} (${val})`}
                                      >
                                        <MessageCircle className="w-2.5 h-2.5 fill-current" />
                                        <span>WA</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Summary Tag & Action Buttons */}
                    <div className="pt-2.5 mt-2 border-t border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 truncate">
                        {extraColumnsCount > 0 ? `+${extraColumnsCount} more fields` : 'Full profile'}
                      </div>

                      {/* Action buttons with Direct Call & 1-Click WhatsApp Quick Action */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {farmerCallUrl && (
                          <a
                            href={farmerCallUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-2xs hover:scale-105"
                            title={`Direct Phone Call: ${farmer.fullName} (${farmerContact})`}
                          >
                            <Phone className="w-3.5 h-3.5 fill-current" />
                          </a>
                        )}
                        {farmerWaUrl && (
                          <a
                            href={farmerWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-white bg-[#25D366] hover:bg-[#20ba5a] transition-all shadow-2xs hover:scale-105"
                            title={`1-Click WhatsApp: ${farmer.fullName} (${farmerContact})`}
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedFarmerForDetail(farmer)}
                          className="p-1.5 rounded-lg text-emerald-800 dark:text-emerald-300 hover:text-white hover:bg-[#256B3A] bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/80 transition-all shadow-2xs"
                          title="View Full Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(farmer)}
                          className="p-1.5 rounded-lg text-blue-700 dark:text-blue-300 hover:text-white hover:bg-blue-600 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/80 transition-all shadow-2xs"
                          title="Edit Fields"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete record for ${farmer.fullName}?`)) {
                              deleteFarmer(farmer.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-700 dark:text-rose-300 hover:text-white hover:bg-rose-600 bg-rose-50 dark:bg-rose-950/80 border border-rose-200/80 dark:border-rose-800/80 transition-all shadow-2xs"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW (MATCHING GREEN CARDS COLOR SCHEME) */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-300 dark:border-emerald-800 shadow-md overflow-hidden">
          {/* Top Green Accent Strip */}
          <div className="h-2 w-full bg-gradient-to-r from-[#143520] via-[#256B3A] to-[#409b5c]" />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#143520] text-emerald-100 font-bold uppercase tracking-wider border-b border-emerald-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[180px]">Farmer Profile</th>
                  {allColumns.map(col => (
                    <th key={col} className="py-3 px-4 whitespace-nowrap group/header relative min-w-[130px]">
                      {editingHeaderCol?.oldName === col ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            autoFocus
                            value={editingHeaderCol.newName}
                            onChange={(e) => setEditingHeaderCol({ ...editingHeaderCol, newName: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveHeaderRename();
                              if (e.key === 'Escape') setEditingHeaderCol(null);
                            }}
                            className="px-2 py-0.5 text-xs font-bold rounded-lg border border-[#256B3A] bg-white text-slate-900 outline-none w-32 shadow-sm"
                          />
                          <button
                            onClick={handleSaveHeaderRename}
                            className="p-1 rounded bg-[#256B3A] text-white hover:bg-[#1b4d2a]"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingHeaderCol(null)}
                            className="p-1 rounded bg-slate-200 text-slate-600"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span 
                            onDoubleClick={() => setEditingHeaderCol({ oldName: col, newName: col })}
                            title="Double click to rename column"
                            className="cursor-pointer hover:text-white transition-colors"
                          >
                            {col}
                          </span>
                          <div className="opacity-0 group-hover/header:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={() => setEditingHeaderCol({ oldName: col, newName: col })}
                              className="p-1 text-emerald-300 hover:text-white rounded"
                              title={`Rename column "${col}"`}
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete column "${col}" from all farmer records?`)) {
                                  deleteColumn(col);
                                }
                              }}
                              className="p-1 text-emerald-300 hover:text-rose-400 rounded"
                              title={`Delete column "${col}"`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/60">
                {paginatedFarmers.length === 0 ? (
                  <tr>
                    <td colSpan={Math.max(allColumns.length + 2, 3)} className="py-12 text-center text-slate-400">
                      {farmers.length === 0 
                        ? 'The Farmer Registry is empty. Use "Excel Import" to begin.'
                        : 'No records match your search query.'}
                    </td>
                  </tr>
                ) : (
                  paginatedFarmers.map((farmer, idx) => {
                    const farmerContact = getFarmerContact(farmer);
                    const farmerWaUrl = farmerContact ? getWhatsAppUrl(farmerContact, farmer.fullName) : null;
                    const farmerCallUrl = farmerContact ? getDirectCallUrl(farmerContact) : null;

                    return (
                    <tr 
                      key={farmer.id}
                      className={`transition-colors cursor-pointer ${
                        idx % 2 === 0 
                          ? 'bg-white dark:bg-[#0c2214]/40 hover:bg-emerald-50 dark:hover:bg-[#143520]' 
                          : 'bg-[#F4F9F5] dark:bg-[#0f2918]/60 hover:bg-emerald-100/70 dark:hover:bg-[#143520]'
                      }`}
                      onClick={() => setSelectedFarmerForDetail(farmer)}
                    >
                      <td className="py-3 px-4 whitespace-nowrap group/cell" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2.5">
                          {farmer.avatar ? (
                            <img
                              src={farmer.avatar}
                              alt={farmer.fullName}
                              onClick={() => setSelectedFarmerForDetail(farmer)}
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#256B3A]/30 shrink-0"
                            />
                          ) : (
                            <div 
                              onClick={() => setSelectedFarmerForDetail(farmer)}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#143520] to-[#256B3A] text-white font-black text-xs flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                            >
                              {farmer.fullName ? farmer.fullName.trim().charAt(0).toUpperCase() : 'F'}
                            </div>
                          )}

                          {editingCell?.farmerId === farmer.id && editingCell?.column === '__fullName__' ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                autoFocus
                                value={editingCell.value}
                                onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveCellEdit();
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="px-2 py-0.5 text-xs font-bold rounded-lg border border-[#256B3A] bg-white text-slate-900 outline-none w-36 shadow-sm"
                              />
                              <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleSaveCellEdit}
                                className="p-1 rounded bg-[#256B3A] text-white hover:bg-[#1b4d2a]"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setEditingCell(null)}
                                className="p-1 rounded bg-slate-200 text-slate-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              className="flex items-center gap-1.5"
                              onDoubleClick={() => setEditingCell({ farmerId: farmer.id, column: '__fullName__', value: farmer.fullName })}
                            >
                              <span 
                                onClick={() => setSelectedFarmerForDetail(farmer)}
                                className="font-bold text-[#143520] dark:text-emerald-100 hover:text-[#256B3A] transition-colors"
                              >
                                {farmer.fullName}
                              </span>
                              <button
                                onClick={() => setEditingCell({ farmerId: farmer.id, column: '__fullName__', value: farmer.fullName })}
                                className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 rounded transition-opacity"
                                title="Edit name"
                              >
                                <Pencil className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {allColumns.map(col => {
                        const isEditing = editingCell?.farmerId === farmer.id && editingCell?.column === col;
                        const cellVal = farmer.data && farmer.data[col] !== undefined ? String(farmer.data[col]) : '';
                        const isContact = /contact|phone|mobile|cell|whatsapp|ph/i.test(col);
                        const cellWaUrl = isContact && cellVal ? getWhatsAppUrl(cellVal, farmer.fullName) : null;
                        const cellCallUrl = isContact && cellVal ? getDirectCallUrl(cellVal) : null;

                        return (
                          <td
                            key={col}
                            className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 group/cell relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingCell.value}
                                  onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveCellEdit();
                                    if (e.key === 'Escape') setEditingCell(null);
                                  }}
                                  className="px-2 py-0.5 text-xs rounded-lg border border-[#256B3A] bg-white text-slate-900 outline-none w-32 shadow-sm"
                                />
                                <button
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={handleSaveCellEdit}
                                  className="p-1 rounded bg-[#256B3A] text-white hover:bg-[#1b4d2a]"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => setEditingCell(null)}
                                  className="p-1 rounded bg-slate-200 text-slate-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="flex items-center justify-between gap-1.5 min-h-[22px]"
                                onDoubleClick={() => setEditingCell({ farmerId: farmer.id, column: col, value: cellVal })}
                              >
                                <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                                  <span className="truncate" title={cellVal || '-'}>
                                    {cellVal || <span className="text-slate-400 font-normal italic">-</span>}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {cellCallUrl && (
                                      <a
                                        href={cellCallUrl}
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold shadow-2xs shrink-0"
                                        title={`Call ${farmer.fullName} (${cellVal})`}
                                      >
                                        <Phone className="w-2.5 h-2.5 fill-current" />
                                        <span>Call</span>
                                      </a>
                                    )}
                                    {cellWaUrl && (
                                      <a
                                        href={cellWaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#25D366] hover:bg-[#20ba5a] text-white text-[9px] font-bold shadow-2xs shrink-0"
                                        title={`WhatsApp ${farmer.fullName} (${cellVal})`}
                                      >
                                        <MessageCircle className="w-2.5 h-2.5 fill-current" />
                                        <span>WA</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => setEditingCell({ farmerId: farmer.id, column: col, value: cellVal })}
                                  className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 rounded transition-opacity"
                                  title="Edit cell"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {farmerCallUrl && (
                            <a
                              href={farmerCallUrl}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-2xs hover:scale-105"
                              title={`Direct Call: ${farmer.fullName} (${farmerContact})`}
                            >
                              <Phone className="w-3.5 h-3.5 fill-current" />
                            </a>
                          )}
                          {farmerWaUrl && (
                            <a
                              href={farmerWaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-white bg-[#25D366] hover:bg-[#20ba5a] rounded-lg transition-all shadow-2xs hover:scale-105"
                              title={`WhatsApp ${farmer.fullName} (${farmerContact})`}
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedFarmerForDetail(farmer)}
                            className="p-1.5 text-slate-400 hover:text-[#256B3A] rounded-lg hover:bg-emerald-100/60 dark:hover:bg-slate-800"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(farmer)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete record for ${farmer.fullName}?`)) {
                                deleteFarmer(farmer.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION CONTROLS: Display up to 8 profiles per page with Next / Previous & Numbers */}
      {filteredFarmers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/60 shadow-sm">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Showing <strong>{(effectivePage - 1) * PAGE_SIZE + 1}</strong> to <strong>{Math.min(effectivePage * PAGE_SIZE, filteredFarmers.length)}</strong> of <strong>{filteredFarmers.length}</strong> farmers (8 per page)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={effectivePage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-slate-800 text-[#143520] dark:text-emerald-300 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {getPageNumbers().map(num => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 text-xs font-bold rounded-xl transition-all ${
                  effectivePage === num
                    ? 'bg-[#256B3A] text-white shadow-md'
                    : 'border border-emerald-200/80 dark:border-emerald-800/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              disabled={effectivePage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-slate-800 text-[#143520] dark:text-emerald-300 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* RESTORE BACKUP CONFIRMATION MODAL */}
      {isRestoreModalOpen && pendingRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-slate-900 dark:text-white">
            <button
              onClick={() => setIsRestoreModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Restore Backup</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Found {pendingRestore.totalRecords} farmer records in file</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Choose how you want to restore the backup data into your registry:
              </p>

              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  restoreMode === 'replace'
                    ? 'border-[#256B3A] bg-emerald-50/60 dark:bg-emerald-950/40 text-[#143520] dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="restoreMode"
                    value="replace"
                    checked={restoreMode === 'replace'}
                    onChange={() => setRestoreMode('replace')}
                    className="mt-0.5 text-[#256B3A]"
                  />
                  <div>
                    <span className="text-xs font-bold block">Replace Registry (Full Restore)</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Wipes current registry ({farmers.length} records) and restores the {pendingRestore.totalRecords} records from backup.
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  restoreMode === 'merge'
                    ? 'border-[#256B3A] bg-emerald-50/60 dark:bg-emerald-950/40 text-[#143520] dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="restoreMode"
                    value="merge"
                    checked={restoreMode === 'merge'}
                    onChange={() => setRestoreMode('merge')}
                    className="mt-0.5 text-[#256B3A]"
                  />
                  <div>
                    <span className="text-xs font-bold block">Merge with Current Registry</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Adds all {pendingRestore.totalRecords} records to your current {farmers.length} records without deleting existing data.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  className="px-5 py-2 text-xs font-bold bg-[#256B3A] text-white rounded-xl hover:bg-[#1b4d2a] shadow-md transition-all active:scale-95"
                >
                  Confirm Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL ADD COLUMN MODAL */}
      {isAddColumnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-slate-900 dark:text-white">
            <button
              onClick={() => setIsAddColumnModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#256B3A] dark:text-emerald-400">
                <Columns className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Add New Column</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Creates a new column across all farmer records</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newGlobalColumnName.trim()) {
                  addColumn(newGlobalColumnName.trim());
                  setNewGlobalColumnName('');
                  setIsAddColumnModalOpen(false);
                  setStatusFeedback({ type: 'success', message: `Added new column "${newGlobalColumnName.trim()}"` });
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Column Header Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newGlobalColumnName}
                  onChange={(e) => setNewGlobalColumnName(e.target.value)}
                  placeholder="e.g. Father's Name, Village, Contact No..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#256B3A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddColumnModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#256B3A] text-white rounded-xl hover:bg-[#1b4d2a] shadow-md transition-all active:scale-95"
                >
                  Create Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXCEL BATCH IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-[#EBF1EA] dark:bg-emerald-950 text-[#143520] dark:text-emerald-300">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Excel Batch Import</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Upload your spreadsheet with any custom columns (e.g. Name, Father's Name, Village, etc.)</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 mb-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Sample Excel Template</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Download a starter file with clean sample columns.</p>
              </div>
              <button
                onClick={downloadSampleFarmerTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-[#256B3A] text-white hover:bg-[#1b4d2a] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample (.xlsx)</span>
              </button>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleExcelFileDrop(file);
              }}
              onClick={() => excelInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#256B3A] dark:hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
            >
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleExcelFileDrop(file);
                }}
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {importFile ? importFile.name : 'Drag & drop Excel (.xlsx, .xls) here or click to browse'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Accepts any column structure without pre-defined restrictions</p>
            </div>

            {isParsing && (
              <div className="mt-4 text-center text-xs text-[#256B3A] font-semibold animate-pulse">
                Reading columns and parsing rows...
              </div>
            )}

            {parseError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {parseResult && (
              <div className="mt-4 space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#256B3A]" />
                    <span>Parsed <strong>{parseResult.records.length}</strong> records from <strong>{parseResult.totalRows}</strong> rows.</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    Uploaded Columns: <strong>{parseResult.detectedHeaders.join(', ')}</strong>
                  </div>
                </div>

                {parseResult.errors.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs max-h-24 overflow-y-auto">
                    <p className="font-bold mb-1">Skipped {parseResult.errors.length} invalid rows:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {parseResult.errors.map((err, i) => (
                        <li key={i}>Row {err.row}: {err.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {importSuccessMsg && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center">
                {importSuccessMsg}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!parseResult || parseResult.records.length === 0}
                onClick={handleCommitBatchImport}
                className="px-5 py-2 text-xs font-bold bg-[#256B3A] text-white rounded-xl hover:bg-[#1b4d2a] disabled:opacity-50 transition-all shadow-md"
              >
                Import {parseResult ? `${parseResult.records.length} Records` : 'Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FARMER RECORD MODAL */}
      {isEditModalOpen && editingFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-slate-800 dark:text-slate-100">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
              {editingFarmer.id ? 'Edit Record' : 'Add Farmer Record'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Edit any field name and its corresponding value. Photos are uploaded manually.
            </p>

            <form onSubmit={handleSaveFarmer} className="space-y-6">
              {/* Profile Image & Avatar Upload (Manual Upload Only) */}
              <div className="flex flex-col items-center justify-center p-5 bg-emerald-50/60 dark:bg-slate-800/40 rounded-2xl border border-emerald-100 dark:border-slate-800">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full p-1 ring-4 ring-[#256B3A]/30 shadow-md bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center overflow-hidden">
                    {editingFarmer.avatar ? (
                      <img
                        src={editingFarmer.avatar}
                        alt="Avatar preview"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-[#143520] to-[#256B3A] text-white flex flex-col items-center justify-center">
                        <Camera className="w-6 h-6 mb-1 text-emerald-200" />
                        <span className="text-[9px] font-bold tracking-wider">No Photo</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Upload</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-[#256B3A] dark:text-emerald-400 hover:underline"
                  >
                    {editingFarmer.avatar ? 'Change Photo' : 'Upload Profile Photo'}
                  </button>
                  {editingFarmer.avatar && (
                    <button
                      type="button"
                      onClick={() => setEditingFarmer({ ...editingFarmer, avatar: '' })}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Farmer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingFarmer.fullName || ''}
                  onChange={(e) => setEditingFarmer({ ...editingFarmer, fullName: e.target.value })}
                  placeholder="e.g. Lalbiakthanga Fanai"
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Dynamic Uploaded Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Record Fields & Values
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Both field labels and values are editable
                  </span>
                </div>

                {editingFarmer.data && Object.keys(editingFarmer.data).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(editingFarmer.data).map(([col, val]) => (
                      <div key={col} className="p-3 rounded-xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-200/70 dark:border-slate-700/70 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 w-full">
                            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">Field:</span>
                            <input
                              type="text"
                              value={col}
                              onChange={(e) => handleRenameRecordField(col, e.target.value)}
                              className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 focus:border-[#256B3A] outline-none w-full"
                              title="Edit field name"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(col)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded"
                            title="Remove field from this record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={String(val || '')}
                          placeholder={`Enter ${col}...`}
                          onChange={(e) => {
                            const updatedData = { ...(editingFarmer.data || {}) };
                            updatedData[col] = e.target.value;
                            setEditingFarmer({ ...editingFarmer, data: updatedData });
                          }}
                          className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#256B3A]"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No columns yet. Add your first field below!</p>
                )}
              </div>

              {/* Add New Dynamic Column */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-slate-700">
                <span className="text-[11px] font-bold text-[#143520] dark:text-emerald-300 block mb-2">
                  + Add Another Field to this Record
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Field Name (e.g. Village, Contact)"
                    className="w-1/2 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={newColumnVal}
                    onChange={(e) => setNewColumnVal(e.target.value)}
                    placeholder="Field Value"
                    className="w-1/2 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewColumnInModal}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#256B3A] text-white hover:bg-[#1b4d2a] shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-[#256B3A] text-white rounded-xl hover:bg-[#1b4d2a] shadow-md transition-all active:scale-95"
                >
                  {editingFarmer.id ? 'Save Updates' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      <FarmerDetailModal
        farmer={selectedFarmerForDetail}
        onClose={() => setSelectedFarmerForDetail(null)}
      />
    </div>
  );
};
