import React, { useState, useRef } from 'react';
import { useBlog } from '../../context/BlogContext';
import type { FarmerRecord } from '../../types/farmer';
import { 
  parseExcelToFarmers, 
  downloadSampleFarmerTemplate, 
  exportFarmersToExcel,
  type ParseResult 
} from '../../utils/excelFarmerParser';
import { 
  Users, 
  UploadCloud, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Camera, 
  Filter, 
  Eye, 
  ShieldCheck, 
  Sprout,
  BadgeCheck, 
  Layers, 
  FileUp
} from 'lucide-react';
import { FarmerDetailModal } from '../farmer/FarmerDetailModal';

export const FarmerManager: React.FC = () => {
  const { 
    farmers, 
    addFarmer, 
    updateFarmer, 
    deleteFarmer, 
    wipeAllFarmers,
    batchImportFarmers,
    uploadImage
  } = useBlog();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterPractice, setFilterPractice] = useState('all');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFarmerForDetail, setSelectedFarmerForDetail] = useState<FarmerRecord | null>(null);
  const [editingFarmer, setEditingFarmer] = useState<Partial<FarmerRecord> | null>(null);

  // Excel Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Dynamic custom attributes editor inside Edit/Create modal
  const [customAttrKey, setCustomAttrKey] = useState('');
  const [customAttrVal, setCustomAttrVal] = useState('');

  // Image upload handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Filtered farmers
  const filteredFarmers = farmers.filter(farmer => {
    if (filterDistrict !== 'all' && farmer.district.toLowerCase() !== filterDistrict.toLowerCase()) {
      return false;
    }
    if (filterPractice !== 'all' && !farmer.farmingType.toLowerCase().includes(filterPractice.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = farmer.fullName.toLowerCase().includes(q);
      const matchId = farmer.farmerId.toLowerCase().includes(q);
      const matchVillage = farmer.village.toLowerCase().includes(q);
      const matchCrop = farmer.primaryCrops.toLowerCase().includes(q);
      const matchPhone = farmer.phone.toLowerCase().includes(q);
      return matchName || matchId || matchVillage || matchCrop || matchPhone;
    }
    return true;
  });

  // Calculate live stats
  const totalAcreage = farmers.reduce((sum, f) => {
    const acres = typeof f.landSizeAcre === 'number' ? f.landSizeAcre : parseFloat(String(f.landSizeAcre)) || 0;
    return sum + acres;
  }, 0);

  const organicCount = farmers.filter(f => 
    f.farmingType.toLowerCase().includes('organic') || f.farmingType.toLowerCase().includes('natural')
  ).length;

  const verifiedCount = farmers.filter(f => f.status === 'Verified').length;

  // Handlers for Single Farmer Modal (Create / Edit)
  const handleOpenAddModal = () => {
    setEditingFarmer({
      farmerId: `MZ-REG-${String(farmers.length + 1).padStart(3, '0')}`,
      fullName: '',
      phone: '',
      gender: 'Male',
      age: '',
      village: '',
      district: 'Champhai',
      state: 'Mizoram',
      aadhaarNumber: '',
      landSizeAcre: 2.0,
      landOwnership: 'Owned (Patu)',
      farmingType: 'Organic Farming',
      primaryCrops: '',
      secondaryCrops: '',
      soilType: 'Loamy Mountain Soil',
      irrigationSource: 'Spring Feed & Rainfed',
      annualYieldKg: 0,
      annualIncomeInr: '',
      bankName: 'Mizoram Rural Bank',
      accountNumber: '',
      ifscCode: 'SBIN0RRMRGB',
      pmKisanEnrolled: 'Yes',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
      status: 'Verified',
      registrationDate: new Date().toISOString().split('T')[0],
      notes: '',
      customAttributes: {}
    });
    setCustomAttrKey('');
    setCustomAttrVal('');
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (farmer: FarmerRecord) => {
    setEditingFarmer({ ...farmer, customAttributes: { ...(farmer.customAttributes || {}) } });
    setCustomAttrKey('');
    setCustomAttrVal('');
    setIsEditModalOpen(true);
  };

  const handleSaveFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarmer || !editingFarmer.fullName?.trim()) return;

    if (editingFarmer.id) {
      updateFarmer(editingFarmer.id, editingFarmer);
    } else {
      addFarmer(editingFarmer as any);
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

  const handleAddCustomAttribute = () => {
    if (!customAttrKey.trim() || !customAttrVal.trim() || !editingFarmer) return;
    const currentCustom = { ...(editingFarmer.customAttributes || {}) };
    currentCustom[customAttrKey.trim()] = customAttrVal.trim();
    setEditingFarmer({ ...editingFarmer, customAttributes: currentCustom });
    setCustomAttrKey('');
    setCustomAttrVal('');
  };

  const handleRemoveCustomAttribute = (key: string) => {
    if (!editingFarmer || !editingFarmer.customAttributes) return;
    const currentCustom = { ...editingFarmer.customAttributes };
    delete currentCustom[key];
    setEditingFarmer({ ...editingFarmer, customAttributes: currentCustom });
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
      setParseError(err?.message || 'Failed to parse Excel file. Please ensure valid format.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleCommitBatchImport = () => {
    if (!parseResult || parseResult.records.length === 0) return;
    batchImportFarmers(parseResult.records);
    setImportSuccessMsg(`Successfully registered ${parseResult.records.length} farmers from spreadsheet!`);
    setTimeout(() => {
      setImportSuccessMsg(null);
      setIsImportModalOpen(false);
      setImportFile(null);
      setParseResult(null);
    }, 1800);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-[#143520] via-[#1d4c2e] to-[#256B3A] rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Official Department Registry Module</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Registry of Farmers
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Comprehensive registry of Mizoram agriculturalists with Excel batch import, dynamic schema attribute support, and direct field verification.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setImportFile(null);
                setParseResult(null);
                setParseError(null);
                setIsImportModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-[#143520] hover:bg-emerald-50 transition-all shadow-md active:scale-95"
            >
              <FileUp className="w-4 h-4 text-[#256B3A]" />
              <span>Excel Batch Import</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#C9A84C] hover:bg-[#b8953c] text-white transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Farmer Record</span>
            </button>

            <button
              onClick={() => exportFarmersToExcel(farmers)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20"
              title="Export all current farmer records to Excel"
            >
              <Download className="w-4 h-4" />
              <span>Export (.xlsx)</span>
            </button>

            {farmers.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to completely wipe all ${farmers.length} farmer registry records? This cannot be undone.`)) {
                    wipeAllFarmers();
                  }
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 transition-all cursor-pointer"
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
            <span className="text-xs text-emerald-200 block">Total Registered</span>
            <p className="text-2xl font-black mt-0.5">{farmers.length}</p>
          </div>
          <div>
            <span className="text-xs text-emerald-200 block">Cultivated Land</span>
            <p className="text-2xl font-black mt-0.5">{totalAcreage.toFixed(1)} <span className="text-sm font-normal text-emerald-200">Acres</span></p>
          </div>
          <div>
            <span className="text-xs text-emerald-200 block">Organic / Natural</span>
            <p className="text-2xl font-black mt-0.5">{organicCount}</p>
          </div>
          <div>
            <span className="text-xs text-emerald-200 block">Status Verified</span>
            <p className="text-2xl font-black mt-0.5">{verifiedCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, village, crop, or phone..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#256B3A]"
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

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#256B3A]"
            >
              <option value="all">All Districts (Mizoram)</option>
              <option value="Champhai">Champhai</option>
              <option value="Aizawl">Aizawl</option>
              <option value="Serchhip">Serchhip</option>
              <option value="Kolasib">Kolasib</option>
              <option value="Mamit">Mamit</option>
              <option value="Lunglei">Lunglei</option>
              <option value="Siaha">Siaha</option>
              <option value="Lawngtlai">Lawngtlai</option>
              <option value="Saitual">Saitual</option>
              <option value="Khawzawl">Khawzawl</option>
              <option value="Hnahthial">Hnahthial</option>
            </select>
          </div>

          <select
            value={filterPractice}
            onChange={(e) => setFilterPractice(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#256B3A]"
          >
            <option value="all">All Practices</option>
            <option value="Organic">Organic Farming</option>
            <option value="Natural">Natural / Regenerative</option>
            <option value="Integrated">Integrated Agri-Horti</option>
          </select>
        </div>
      </div>

      {/* Farmers Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Farmer Profile</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Land & Practice</th>
                <th className="py-3.5 px-4">Primary Crops</th>
                <th className="py-3.5 px-4">Annual Yield</th>
                <th className="py-3.5 px-4">PM-Kisan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFarmers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No farmer records match your current search/filter.
                  </td>
                </tr>
              ) : (
                filteredFarmers.map(farmer => (
                  <tr 
                    key={farmer.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedFarmerForDetail(farmer)}
                  >
                    {/* Centered Circular Avatar + Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={farmer.avatar}
                            alt={farmer.fullName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{farmer.fullName}</p>
                          <p className="font-mono text-[11px] text-slate-400">{farmer.farmerId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{farmer.village}</p>
                      <p className="text-[11px] text-slate-400">{farmer.district}</p>
                    </td>

                    {/* Land & Practice */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{farmer.landSizeAcre} Acres</p>
                      <p className="text-[11px] text-[#256B3A] dark:text-emerald-400 truncate max-w-[120px]">{farmer.farmingType}</p>
                    </td>

                    {/* Primary Crops */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[180px]" title={farmer.primaryCrops}>
                        {farmer.primaryCrops}
                      </p>
                    </td>

                    {/* Annual Yield */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {typeof farmer.annualYieldKg === 'number' ? farmer.annualYieldKg.toLocaleString() : farmer.annualYieldKg} Kg
                      </p>
                    </td>

                    {/* PM-Kisan */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        farmer.pmKisanEnrolled === 'Yes' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {farmer.pmKisanEnrolled || 'Yes'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <BadgeCheck className="w-3.5 h-3.5 text-[#256B3A]" />
                        {farmer.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedFarmerForDetail(farmer)}
                          className="p-1.5 text-slate-400 hover:text-[#256B3A] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(farmer)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Record"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete farmer record ${farmer.fullName} (${farmer.farmerId})?`)) {
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Import multiple farmer records seamlessly with auto-column mapping.</p>
              </div>
            </div>

            {/* Template Download Prompt */}
            <div className="flex items-center justify-between p-3.5 mb-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Need the official format?</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Download our pre-structured template containing all 22 core fields.</p>
              </div>
              <button
                onClick={downloadSampleFarmerTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-[#256B3A] text-white hover:bg-[#1b4d2a] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template (.xlsx)</span>
              </button>
            </div>

            {/* Drag and Drop Zone */}
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
              <p className="text-xs text-slate-400 mt-1">Automatic type conversion & dynamic attribute column detection</p>
            </div>

            {/* Parsing State */}
            {isParsing && (
              <div className="mt-4 text-center text-xs text-[#256B3A] font-semibold animate-pulse">
                Parsing spreadsheet rows and mapping fields...
              </div>
            )}

            {/* Parse Error */}
            {parseError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Parse Success Preview */}
            {parseResult && (
              <div className="mt-4 space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#256B3A]" />
                    <span>Parsed <strong>{parseResult.records.length}</strong> valid farmer records from <strong>{parseResult.totalRows}</strong> rows.</span>
                  </div>
                  {parseResult.dynamicHeaders.length > 0 && (
                    <span className="text-[11px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md font-semibold">
                      +{parseResult.dynamicHeaders.length} dynamic attributes
                    </span>
                  )}
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

            {/* Actions */}
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
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-slate-800 dark:text-slate-100">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
              {editingFarmer.id ? 'Edit Farmer Record' : 'Register New Farmer'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Complete farmer registry entry with 22 core fields and flexible dynamic schema extension.
            </p>

            <form onSubmit={handleSaveFarmer} className="space-y-6">
              {/* Profile Image & Avatar Upload (Centered circular container) */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full p-1 ring-4 ring-[#256B3A]/20 shadow-md">
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
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-[#256B3A] dark:text-emerald-400 hover:underline"
                  >
                    Change Profile Picture
                  </button>
                  <p className="text-[10px] text-slate-400">Centered circular avatar format (Aspect 1:1, auto-cropped)</p>
                </div>
              </div>

              {/* SECTION: 1. Identity */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#256B3A]" />
                  1. Identity & Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Farmer Registry ID *</label>
                    <input
                      type="text"
                      required
                      value={editingFarmer.farmerId || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, farmerId: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editingFarmer.fullName || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, fullName: e.target.value })}
                      placeholder="e.g. Lalbiakthanga Fanai"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={editingFarmer.phone || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, phone: e.target.value })}
                      placeholder="+91 98623 XXXXX"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Gender</label>
                    <select
                      value={editingFarmer.gender || 'Male'}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, gender: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Age / DOB</label>
                    <input
                      type="text"
                      value={editingFarmer.age || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, age: e.target.value })}
                      placeholder="e.g. 45"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Village / Locality *</label>
                    <input
                      type="text"
                      required
                      value={editingFarmer.village || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, village: e.target.value })}
                      placeholder="e.g. Hnahlan"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">District</label>
                    <select
                      value={editingFarmer.district || 'Champhai'}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, district: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Champhai">Champhai</option>
                      <option value="Aizawl">Aizawl</option>
                      <option value="Serchhip">Serchhip</option>
                      <option value="Kolasib">Kolasib</option>
                      <option value="Mamit">Mamit</option>
                      <option value="Lunglei">Lunglei</option>
                      <option value="Siaha">Siaha</option>
                      <option value="Lawngtlai">Lawngtlai</option>
                      <option value="Saitual">Saitual</option>
                      <option value="Khawzawl">Khawzawl</option>
                      <option value="Hnahthial">Hnahthial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Aadhaar / ID Proof</label>
                    <input
                      type="text"
                      value={editingFarmer.aadhaarNumber || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, aadhaarNumber: e.target.value })}
                      placeholder="XXXX-XXXX-1234"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: 2. Agriculture Profile */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-[#256B3A]" />
                  2. Agricultural Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Land Size (Acres) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editingFarmer.landSizeAcre !== undefined ? editingFarmer.landSizeAcre : ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, landSizeAcre: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Land Ownership</label>
                    <select
                      value={editingFarmer.landOwnership || 'Owned (Patu)'}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, landOwnership: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Owned (Patu)">Owned (Patu)</option>
                      <option value="Leased / Rented">Leased / Rented</option>
                      <option value="Community Land">Community Land</option>
                      <option value="Joint Family">Joint Family</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Farming Practice</label>
                    <select
                      value={editingFarmer.farmingType || 'Organic Farming'}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, farmingType: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Organic Farming">Organic Farming</option>
                      <option value="Natural Farming">Natural Farming</option>
                      <option value="Regenerative Agriculture">Regenerative Agriculture</option>
                      <option value="Integrated Agri-Horti">Integrated Agri-Horti</option>
                      <option value="Jhum / Shifting">Jhum / Shifting</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Primary Crops *</label>
                    <input
                      type="text"
                      required
                      value={editingFarmer.primaryCrops || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, primaryCrops: e.target.value })}
                      placeholder="e.g. Chawnpui Grape, Assam Lemon"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Annual Yield (Kg)</label>
                    <input
                      type="number"
                      value={editingFarmer.annualYieldKg !== undefined ? editingFarmer.annualYieldKg : ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, annualYieldKg: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g. 7500"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Secondary / Inter-crops</label>
                    <input
                      type="text"
                      value={editingFarmer.secondaryCrops || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, secondaryCrops: e.target.value })}
                      placeholder="e.g. Ginger, Cardamom"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Soil Type</label>
                    <input
                      type="text"
                      value={editingFarmer.soilType || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, soilType: e.target.value })}
                      placeholder="e.g. Red Sandy Loam, pH 5.8"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Irrigation Source</label>
                    <input
                      type="text"
                      value={editingFarmer.irrigationSource || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, irrigationSource: e.target.value })}
                      placeholder="e.g. Gravity Spring Feed & Drip"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: 3. Banking & Direct Benefit */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  3. Banking & Direct Benefit (DBT)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Estimated Annual Revenue</label>
                    <input
                      type="text"
                      value={editingFarmer.annualIncomeInr || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, annualIncomeInr: e.target.value })}
                      placeholder="e.g. ₹4,50,000"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">PM-Kisan Scheme Status</label>
                    <select
                      value={editingFarmer.pmKisanEnrolled || 'Yes'}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, pmKisanEnrolled: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Yes">Yes (Enrolled & Active)</option>
                      <option value="In Progress">In Progress / Applied</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={editingFarmer.bankName || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, bankName: e.target.value })}
                      placeholder="e.g. Mizoram Rural Bank"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={editingFarmer.accountNumber || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, accountNumber: e.target.value })}
                      placeholder="XXXXXX4012"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={editingFarmer.ifscCode || ''}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, ifscCode: e.target.value })}
                      placeholder="SBIN0RRMRGB"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Verification Status</label>
                    <select
                      value={editingFarmer.status || 'Verified'}
                      onChange={(e) => setEditingFarmer({ ...editingFarmer, status: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Verified">Verified</option>
                      <option value="Active">Active</option>
                      <option value="Pending Review">Pending Review</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: 4. Dynamic Schema Extension (Custom Key-Values) */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  4. Dynamic Schema Attributes (No Migrations Required)
                </h3>
                <p className="text-[11px] text-purple-600/80 dark:text-purple-300/70 mb-3">
                  Attach arbitrary custom fields (e.g., Solar Pump, Organic Certification No, SHG Name).
                </p>

                {/* Existing Custom Attributes */}
                {editingFarmer.customAttributes && Object.keys(editingFarmer.customAttributes).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {Object.entries(editingFarmer.customAttributes).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-200/50 dark:border-purple-800/40 text-xs">
                        <div>
                          <span className="font-semibold text-purple-900 dark:text-purple-300">{k}:</span>
                          <span className="ml-1 text-slate-700 dark:text-slate-300">{String(v)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomAttribute(k)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Custom Attribute inputs */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customAttrKey}
                    onChange={(e) => setCustomAttrKey(e.target.value)}
                    placeholder="Field name (e.g. Solar Pump)"
                    className="w-1/2 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={customAttrVal}
                    onChange={(e) => setCustomAttrVal(e.target.value)}
                    placeholder="Value (e.g. Yes / PM-KUSUM)"
                    className="w-1/2 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAttribute}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Field Remarks & Awards / Accreditations
                </label>
                <textarea
                  rows={2}
                  value={editingFarmer.notes || ''}
                  onChange={(e) => setEditingFarmer({ ...editingFarmer, notes: e.target.value })}
                  placeholder="Additional observations, cluster details, or agricultural recognitions..."
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
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
                  {editingFarmer.id ? 'Save Updates' : 'Register Farmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (WHEN CLICKING EYE OR ROW) */}
      <FarmerDetailModal
        farmer={selectedFarmerForDetail}
        onClose={() => setSelectedFarmerForDetail(null)}
      />
    </div>
  );
};
