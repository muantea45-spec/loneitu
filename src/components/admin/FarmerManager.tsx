import React, { useState, useRef, useEffect } from 'react';
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
  FileUp,
  Check,
  Columns,
  Pencil,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Database
} from 'lucide-react';
import { FarmerDetailModal } from '../farmer/FarmerDetailModal';

const PAGE_SIZE = 10;

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

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filtered farmers based on search
  const filteredFarmers = farmers.filter(farmer => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = farmer.fullName.toLowerCase().includes(q);
    const matchData = Object.values(farmer.data || {}).some(val => 
      String(val).toLowerCase().includes(q)
    );
    return matchName || matchData;
  });

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
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
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
      // Overwrite all farmers with backup
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
      // Also update local state by wiping and re-adding or triggering reload
      window.location.reload();
    } else {
      // Merge with existing
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
              Internal admin management system. Presenting profiles in Green Card View (10 profiles per page) with full column editing, PDF/Excel export, and backup/restore.
            </p>
          </div>

          {/* Quick Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Import Group */}
            <button
              onClick={() => {
                setImportFile(null);
                setParseResult(null);
                setParseError(null);
                setIsImportModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-[#143520] hover:bg-emerald-50 transition-all shadow-md active:scale-95"
              title="Import spreadsheet (.xlsx / .xls)"
            >
              <FileUp className="w-4 h-4 text-[#256B3A]" />
              <span>Excel Import</span>
            </button>

            {/* Add Column */}
            <button
              onClick={() => {
                setNewGlobalColumnName('');
                setIsAddColumnModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95"
              title="Add a new column header across all farmer records"
            >
              <Columns className="w-4 h-4" />
              <span>+ Add Column</span>
            </button>

            {/* Add Record */}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#C9A84C] hover:bg-[#b8953c] text-white transition-all shadow-md active:scale-95"
              title="Manually add a farmer record"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>

            {/* Export & Backup Section */}
            {farmers.length > 0 && (
              <>
                {/* Export PDF Button */}
                <button
                  onClick={handleExportPdf}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/25 hover:bg-rose-500/35 text-white transition-all border border-rose-300/30 shadow-xs active:scale-95"
                  title="Export official printable PDF of all farmer records"
                >
                  <FileText className="w-4 h-4 text-rose-300" />
                  <span>Export PDF</span>
                </button>

                {/* Export Excel Button */}
                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/25 hover:bg-emerald-500/35 text-white transition-all border border-emerald-300/30 shadow-xs active:scale-95"
                  title="Export all current farmer records to Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                  <span>Export Excel</span>
                </button>

                {/* Backup JSON Button */}
                <button
                  onClick={handleDownloadBackup}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/25 hover:bg-blue-500/35 text-white transition-all border border-blue-300/30 shadow-xs active:scale-95"
                  title="Download complete registry snapshot backup (.json)"
                >
                  <Database className="w-4 h-4 text-blue-300" />
                  <span>Backup (.json)</span>
                </button>
              </>
            )}

            {/* Restore Backup Button */}
            <button
              onClick={() => backupFileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 active:scale-95"
              title="Restore registry from backup JSON file"
            >
              <Upload className="w-4 h-4 text-emerald-300" />
              <span>Restore Backup</span>
            </button>

            <input
              ref={backupFileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleBackupFileSelect}
            />

            {/* Wipe All Button */}
            {farmers.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to completely wipe all ${farmers.length} farmer registry records? This will delete all records immediately.`)) {
                    wipeAllFarmers();
                    setStatusFeedback({ type: 'success', message: 'Wiped all farmer records from registry.' });
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 transition-all cursor-pointer"
                title="Wipe all farmer registry records completely"
              >
                <Trash2 className="w-4 h-4 text-rose-300" />
                <span>Wipe All</span>
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
            <p className="text-2xl font-black mt-0.5">10 Cards</p>
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
              <span>Green Cards</span>
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

      {/* Editable Column Headers Banner */}
      {allColumns.length > 0 && (
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-200/60 dark:border-emerald-900/40">
          <div className="flex items-center justify-between gap-3 mb-2.5 flex-wrap">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#256B3A] dark:text-emerald-300 flex items-center gap-1.5">
              <Columns className="w-3.5 h-3.5" />
              <span>Active Registry Columns ({allColumns.length}):</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Double-click or click pencil to rename column header globally
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {allColumns.map(col => (
              <div 
                key={col}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs shadow-2xs"
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
                    <span 
                      onDoubleClick={() => setEditingHeaderCol({ oldName: col, newName: col })}
                      className="font-bold text-[#143520] dark:text-emerald-200 cursor-pointer"
                    >
                      {col}
                    </span>
                    <button
                      onClick={() => setEditingHeaderCol({ oldName: col, newName: col })}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
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
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title={`Delete column "${col}"`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTENT: GREEN CARDS (DEFAULT) */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedFarmers.map(farmer => (
                <div
                  key={farmer.id}
                  className="group relative flex flex-col justify-between bg-gradient-to-b from-[#F3F8F4] to-white dark:from-[#0d2616] dark:to-[#0a1a0f] rounded-3xl border-2 border-emerald-200/90 dark:border-emerald-800/80 hover:border-[#256B3A] dark:hover:border-emerald-400 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Decorative Forest Green Accent Top Strip */}
                  <div className="h-2.5 w-full bg-gradient-to-r from-[#143520] via-[#256B3A] to-[#409b5c]" />

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    {/* Card Top: Circular Avatar, Name & Actions */}
                    <div>
                      <div className="flex items-start justify-between gap-3 pb-4 border-b border-emerald-100 dark:border-emerald-900/60">
                        <div className="flex items-center gap-3.5">
                          <div 
                            className="relative cursor-pointer shrink-0"
                            onClick={() => setSelectedFarmerForDetail(farmer)}
                          >
                            <img
                              src={farmer.avatar}
                              alt={farmer.fullName}
                              className="w-14 h-14 rounded-full object-cover ring-3 ring-[#256B3A]/30 dark:ring-emerald-400/30 shadow-md group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400';
                              }}
                            />
                            <div 
                              className="absolute -bottom-1 -right-1 bg-[#256B3A] text-white p-1 rounded-full shadow-xs ring-2 ring-white dark:ring-slate-900"
                              title="Verified Record"
                            >
                              <ShieldCheck className="w-3 h-3 text-[#BFDC28]" />
                            </div>
                          </div>

                          <div>
                            <h3 
                              onClick={() => setSelectedFarmerForDetail(farmer)}
                              className="text-base font-black text-[#143520] dark:text-emerald-100 group-hover:text-[#256B3A] dark:group-hover:text-emerald-300 transition-colors line-clamp-1 cursor-pointer"
                              title={farmer.fullName}
                            >
                              {farmer.fullName}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF1EA] dark:bg-emerald-950/80 text-[#143520] dark:text-emerald-300 border border-[#B7CEB4] dark:border-emerald-800/60 mt-1">
                              Farmer Record
                            </span>
                          </div>
                        </div>

                        {/* Top Action Pills */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setSelectedFarmerForDetail(farmer)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#256B3A] dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-950 transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(farmer)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                            title="Edit Fields & Values"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete record for ${farmer.fullName}?`)) {
                                deleteFarmer(farmer.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body: Dynamic Columns Key-Value Grid in Green Aesthetic */}
                      <div className="py-4">
                        {allColumns.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-4">No additional columns uploaded</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {allColumns.map(col => {
                              const val = farmer.data?.[col];
                              return (
                                <div
                                  key={col}
                                  className="p-2.5 rounded-2xl bg-white/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs flex flex-col justify-between"
                                >
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#256B3A] dark:text-emerald-400 truncate mb-0.5">
                                    {col}
                                  </span>
                                  <span 
                                    className="font-bold text-slate-800 dark:text-slate-100 truncate text-xs" 
                                    title={String(val ?? '')}
                                  >
                                    {val !== undefined && val !== '' ? (
                                      String(val)
                                    ) : (
                                      <span className="text-slate-400 font-normal italic">-</span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {Object.keys(farmer.data || {}).length} Fields Uploaded
                      </span>

                      <button
                        onClick={() => handleOpenEditModal(farmer)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-[#256B3A] text-white hover:bg-[#1b4d2a] transition-all shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW (ALTERNATIVE SPREADSHEET VIEW) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EBF1EA] dark:bg-slate-800 text-[#143520] dark:text-slate-400 font-bold uppercase tracking-wider border-b border-emerald-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[200px]">Farmer Profile</th>
                  {allColumns.map(col => (
                    <th key={col} className="py-3 px-4 whitespace-nowrap group/header relative min-w-[140px]">
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
                            className="px-2 py-1 text-xs font-bold rounded-lg border border-[#256B3A] bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none w-36 shadow-sm"
                          />
                          <button
                            onClick={handleSaveHeaderRename}
                            className="p-1 rounded bg-[#256B3A] text-white hover:bg-[#1b4d2a]"
                            title="Save column name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingHeaderCol(null)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span 
                            onDoubleClick={() => setEditingHeaderCol({ oldName: col, newName: col })}
                            title="Double click to rename column"
                            className="cursor-pointer hover:text-[#256B3A] transition-colors"
                          >
                            {col}
                          </span>
                          <div className="opacity-0 group-hover/header:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={() => setEditingHeaderCol({ oldName: col, newName: col })}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded"
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
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title={`Delete column "${col}"`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedFarmers.length === 0 ? (
                  <tr>
                    <td colSpan={Math.max(allColumns.length + 2, 3)} className="py-12 text-center text-slate-400">
                      {farmers.length === 0 
                        ? 'The Farmer Registry is empty. Use "Excel Import" to begin.'
                        : 'No records match your search query.'}
                    </td>
                  </tr>
                ) : (
                  paginatedFarmers.map(farmer => (
                    <tr 
                      key={farmer.id}
                      className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedFarmerForDetail(farmer)}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap group/cell" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          <img
                            src={farmer.avatar}
                            alt={farmer.fullName}
                            onClick={() => setSelectedFarmerForDetail(farmer)}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 cursor-pointer hover:ring-[#256B3A] transition-all shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400';
                            }}
                          />

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
                                className="px-2 py-1 text-xs font-bold rounded-lg border border-[#256B3A] bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none w-40 shadow-sm"
                              />
                              <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleSaveCellEdit}
                                className="p-1 rounded bg-[#256B3A] text-white hover:bg-[#1b4d2a]"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setEditingCell(null)}
                                className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              className="flex items-center gap-2"
                              onDoubleClick={() => setEditingCell({ farmerId: farmer.id, column: '__fullName__', value: farmer.fullName })}
                            >
                              <span 
                                onClick={() => setSelectedFarmerForDetail(farmer)}
                                className="font-bold text-slate-900 dark:text-white hover:text-[#256B3A] dark:hover:text-emerald-400 transition-colors"
                              >
                                {farmer.fullName}
                              </span>
                              <button
                                onClick={() => setEditingCell({ farmerId: farmer.id, column: '__fullName__', value: farmer.fullName })}
                                className="opacity-0 group-hover/cell:opacity-100 p-1 text-slate-400 hover:text-blue-600 rounded transition-opacity"
                                title="Edit farmer name"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {allColumns.map(col => {
                        const isEditing = editingCell?.farmerId === farmer.id && editingCell?.column === col;
                        const cellVal = farmer.data && farmer.data[col] !== undefined ? String(farmer.data[col]) : '';

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
                                  className="px-2 py-1 text-xs rounded-lg border border-[#256B3A] bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none w-36 shadow-sm"
                                />
                                <button
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={handleSaveCellEdit}
                                  className="p-1 rounded bg-[#256B3A] text-white hover:bg-[#1b4d2a]"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => setEditingCell(null)}
                                  className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="flex items-center justify-between gap-2 min-h-[24px]"
                                onDoubleClick={() => setEditingCell({ farmerId: farmer.id, column: col, value: cellVal })}
                              >
                                <span className="truncate max-w-[180px]" title={cellVal || '-'}>
                                  {cellVal || <span className="text-slate-300 dark:text-slate-600 italic">Empty</span>}
                                </span>
                                <button
                                  onClick={() => setEditingCell({ farmerId: farmer.id, column: col, value: cellVal })}
                                  className="opacity-0 group-hover/cell:opacity-100 p-1 text-slate-400 hover:text-blue-600 rounded transition-opacity"
                                  title="Edit cell value"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedFarmerForDetail(farmer)}
                            className="p-1.5 text-slate-400 hover:text-[#256B3A] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(farmer)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit All Fields"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete record for ${farmer.fullName}?`)) {
                                deleteFarmer(farmer.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION CONTROLS: Display up to 10 profiles per page with Next / Previous & Numbers */}
      {filteredFarmers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/60 shadow-sm">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Showing <strong>{(effectivePage - 1) * PAGE_SIZE + 1}</strong> to <strong>{Math.min(effectivePage * PAGE_SIZE, filteredFarmers.length)}</strong> of <strong>{filteredFarmers.length}</strong> farmers (10 per page)
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
              Edit any field name and its corresponding value. You can also add more custom columns dynamically.
            </p>

            <form onSubmit={handleSaveFarmer} className="space-y-6">
              {/* Profile Image & Avatar Upload */}
              <div className="flex flex-col items-center justify-center p-4 bg-emerald-50/50 dark:bg-slate-800/40 rounded-2xl border border-emerald-100 dark:border-slate-800">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full p-1 ring-4 ring-[#256B3A]/30 shadow-md">
                    <img
                      src={editingFarmer.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400'}
                      alt="Avatar preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold"
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
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[#256B3A] dark:text-emerald-400 hover:underline mt-2"
                >
                  Change Profile Photo
                </button>
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
