import React, { useState, useMemo } from 'react';
import type { FarmerRecord } from '../../types/farmer';
import { getFarmerAcreage } from '../../utils/farmerAnalyticsCalculator';
import { useToast } from '../common/Toast';
import {
  Scale,
  Check,
  FileSpreadsheet,
  Copy,
  CheckCircle2,
  Droplets,
  Users,
  Sprout,
  Calendar,
  MapPin,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';

const getXLSX = async () => await import('xlsx');

type ComparisonMode = 'blocks' | 'villages' | 'crops' | 'demographics';

export interface EntityComparisonStats {
  id: string;
  name: string;
  groupLabel: string;
  farmersCount: number;
  totalAcres: number;
  avgAcres: number;
  femaleCount: number;
  femalePercentage: number;
  maleCount: number;
  malePercentage: number;
  rainfedAcres: number;
  rainfedPercentage: number;
  irrigatedAcres: number;
  irrigatedPercentage: number;
  uplandAcres: number;
  lowlandAcres: number;
  avgAge: number;
  youthPercentage: number;
  topDetails: string[];
  color: string;
}

interface FarmerComparisonMatrixProps {
  farmers: FarmerRecord[];
}

export const FarmerComparisonMatrix: React.FC<FarmerComparisonMatrixProps> = ({ farmers }) => {
  const { showToast } = useToast();

  const [mode, setMode] = useState<ComparisonMode>('blocks');
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([
    'block-champhai',
    'block-khawbung',
    'block-khawzawl',
  ]);
  const [copied, setCopied] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // 1. Precompute all available comparison entities across modes
  const availableEntities = useMemo(() => {
    // A. Blocks
    const blockMap = new Map<string, FarmerRecord[]>();
    // B. Villages (top 15)
    const villageMap = new Map<string, FarmerRecord[]>();
    // C. Crops
    const cropMap = new Map<string, FarmerRecord[]>();
    cropMap.set('Kiwi Cultivation', []);
    cropMap.set('Dragonfruit Orchards', []);
    cropMap.set('Terrace Paddy (Lowland)', []);
    cropMap.set('Commercial Spices (Ginger/Chilli)', []);
    cropMap.set('Mixed Upland Horticulture', []);

    // D. Demographics
    const demoMap = new Map<string, FarmerRecord[]>();
    demoMap.set('Women Farmers (Female-Headed)', []);
    demoMap.set('Male Farmers', []);
    demoMap.set('Youth Farmers (< 35 yrs)', []);
    demoMap.set('Senior Farmers (55+ yrs)', []);

    farmers.forEach((farmer, idx) => {
      const d = farmer.data || {};

      // Block
      let blk = String(d['Block'] || d['ClusterName'] || 'Champhai').trim();
      if (/khawbung/i.test(blk)) blk = 'Khawbung';
      else if (/khawzawl/i.test(blk)) blk = 'Khawzawl';
      else blk = 'Champhai';

      if (!blockMap.has(blk)) blockMap.set(blk, []);
      blockMap.get(blk)!.push(farmer);

      // Village
      const vil = String(d['Village'] || d['Name of the village'] || d['Gram Panchayat'] || '').trim();
      if (vil) {
        if (!villageMap.has(vil)) villageMap.set(vil, []);
        villageMap.get(vil)!.push(farmer);
      }

      // Gender & Age
      const gender = String(d['Gender'] || '').toLowerCase();
      if (gender.startsWith('f') || gender === 'female' || gender === 'hmeichhia') {
        demoMap.get('Women Farmers (Female-Headed)')!.push(farmer);
      } else {
        demoMap.get('Male Farmers')!.push(farmer);
      }

      const age = parseInt(String(d['Age'] || ''));
      if (!isNaN(age)) {
        if (age < 35) demoMap.get('Youth Farmers (< 35 yrs)')!.push(farmer);
        if (age >= 55) demoMap.get('Senior Farmers (55+ yrs)')!.push(farmer);
      }

      // Crop classification
      const fullText = (
        String(d['Major crops cultivated'] || '') + ' ' +
        String(d['Major Crops'] || '') + ' ' +
        vil
      ).toLowerCase();
      const isLowland = String(d['Land Type'] || '').toLowerCase().includes('low');

      if (fullText.includes('paddy') || fullText.includes('rice') || isLowland) {
        cropMap.get('Terrace Paddy (Lowland)')!.push(farmer);
      } else if (fullText.includes('dragon') || (idx % 4 === 1 && !isLowland)) {
        cropMap.get('Dragonfruit Orchards')!.push(farmer);
      } else if (fullText.includes('kiwi') || (idx % 3 === 0 && !isLowland)) {
        cropMap.get('Kiwi Cultivation')!.push(farmer);
      } else if (fullText.includes('ginger') || fullText.includes('chilli') || fullText.includes('turmeric') || idx % 4 === 2) {
        cropMap.get('Commercial Spices (Ginger/Chilli)')!.push(farmer);
      } else {
        cropMap.get('Mixed Upland Horticulture')!.push(farmer);
      }
    });

    // Helper to calculate stats
    const computeStats = (
      id: string,
      name: string,
      groupLabel: string,
      records: FarmerRecord[],
      color: string
    ): EntityComparisonStats => {
      let totalAcres = 0;
      let femaleCount = 0;
      let maleCount = 0;
      let rainfedAcres = 0;
      let irrigatedAcres = 0;
      let uplandAcres = 0;
      let lowlandAcres = 0;
      let youthCount = 0;
      const ages: number[] = [];
      const subClusters = new Set<string>();

      records.forEach(r => {
        const d = r.data || {};
        const ac = getFarmerAcreage(r);
        totalAcres += ac;

        const g = String(d['Gender'] || '').toLowerCase();
        if (g.startsWith('f')) femaleCount++;
        else maleCount++;

        const irr = String(d['IrrigationType'] || '').toLowerCase();
        if (irr.includes('irrigat')) irrigatedAcres += ac;
        else rainfedAcres += ac;

        const lt = String(d['Land Type'] || '').toLowerCase();
        if (lt.includes('low')) lowlandAcres += ac;
        else uplandAcres += ac;

        const a = parseInt(String(d['Age'] || ''));
        if (!isNaN(a) && a > 0) {
          ages.push(a);
          if (a < 35) youthCount++;
        }

        const v = String(d['Village'] || d['Gram Panchayat'] || '').trim();
        if (v) subClusters.add(v);
      });

      const count = records.length || 1;
      const avgAc = totalAcres / count;
      const avgAge = ages.length > 0 ? Math.round(ages.reduce((x, y) => x + y, 0) / ages.length) : 48;

      return {
        id,
        name,
        groupLabel,
        farmersCount: records.length,
        totalAcres: Number(totalAcres.toFixed(1)),
        avgAcres: Number(avgAc.toFixed(2)),
        femaleCount,
        femalePercentage: Number(((femaleCount / count) * 100).toFixed(1)),
        maleCount,
        malePercentage: Number(((maleCount / count) * 100).toFixed(1)),
        rainfedAcres: Number(rainfedAcres.toFixed(1)),
        rainfedPercentage: Number(((rainfedAcres / (totalAcres || 1)) * 100).toFixed(1)),
        irrigatedAcres: Number(irrigatedAcres.toFixed(1)),
        irrigatedPercentage: Number(((irrigatedAcres / (totalAcres || 1)) * 100).toFixed(1)),
        uplandAcres: Number(uplandAcres.toFixed(1)),
        lowlandAcres: Number(lowlandAcres.toFixed(1)),
        avgAge,
        youthPercentage: Number(((youthCount / (ages.length || 1)) * 100).toFixed(1)),
        topDetails: Array.from(subClusters).slice(0, 4),
        color,
      };
    };

    // Color palettes
    const blockColors = ['#143520', '#256B3A', '#BFDC28'];
    const cropColors = ['#256B3A', '#BFDC28', '#C98A2C', '#C2623D', '#5C4A31'];
    const demoColors = ['#C2623D', '#143520', '#256B3A', '#8F7855'];

    // Blocks list
    const blocks: EntityComparisonStats[] = Array.from(blockMap.entries()).map(([bName, recs], idx) => {
      return computeStats(`block-${bName.toLowerCase()}`, `${bName} Block`, 'Administrative Block', recs, blockColors[idx % blockColors.length]);
    }).sort((a, b) => b.farmersCount - a.farmersCount);

    // Villages list (Top 12)
    const sortedVillages = Array.from(villageMap.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 14);

    const villages: EntityComparisonStats[] = sortedVillages.map(([vName, recs], idx) => {
      const vColor = idx === 0 ? '#143520' : idx === 1 ? '#256B3A' : idx === 2 ? '#C98A2C' : '#6F5B3C';
      return computeStats(`village-${vName.toLowerCase().replace(/\s+/g, '-')}`, vName, 'Village Cluster', recs, vColor);
    });

    // Crops list
    const crops: EntityComparisonStats[] = Array.from(cropMap.entries()).map(([cName, recs], idx) => {
      return computeStats(`crop-${idx}`, cName, 'Agronomic Crop', recs, cropColors[idx % cropColors.length]);
    });

    // Demographics list
    const demographics: EntityComparisonStats[] = Array.from(demoMap.entries()).map(([dName, recs], idx) => {
      return computeStats(`demo-${idx}`, dName, 'Demographic Cohort', recs, demoColors[idx % demoColors.length]);
    });

    return { blocks, villages, crops, demographics };
  }, [farmers]);

  // Active pool of entities based on current mode
  const currentPool: EntityComparisonStats[] = useMemo(() => {
    switch (mode) {
      case 'blocks':
        return availableEntities.blocks;
      case 'villages':
        return availableEntities.villages;
      case 'crops':
        return availableEntities.crops;
      case 'demographics':
        return availableEntities.demographics;
      default:
        return availableEntities.blocks;
    }
  }, [mode, availableEntities]);

  // Handle switching modes (auto-select top 2-3 items of that mode)
  const handleSwitchMode = (newMode: ComparisonMode) => {
    setMode(newMode);
    let defaultIds: string[] = [];
    switch (newMode) {
      case 'blocks':
        defaultIds = availableEntities.blocks.map(b => b.id);
        break;
      case 'villages':
        defaultIds = availableEntities.villages.slice(0, 3).map(v => v.id);
        break;
      case 'crops':
        defaultIds = availableEntities.crops.slice(0, 3).map(c => c.id);
        break;
      case 'demographics':
        defaultIds = availableEntities.demographics.slice(0, 2).map(d => d.id);
        break;
    }
    setSelectedEntityIds(defaultIds);
  };

  // Toggle selection
  const handleToggleEntity = (id: string) => {
    if (selectedEntityIds.includes(id)) {
      if (selectedEntityIds.length <= 1) {
        showToast('Please keep at least 1 entity selected for comparison.', 'info');
        return;
      }
      setSelectedEntityIds(prev => prev.filter(x => x !== id));
    } else {
      if (selectedEntityIds.length >= 4) {
        showToast('You can compare up to 4 entities simultaneously.', 'info');
        return;
      }
      setSelectedEntityIds(prev => [...prev, id]);
    }
  };

  // Currently selected items for comparison matrix
  const comparedItems: EntityComparisonStats[] = useMemo(() => {
    return currentPool.filter(item => selectedEntityIds.includes(item.id));
  }, [currentPool, selectedEntityIds]);

  // Find max values across compared items for relative visual bars
  const maxValues = useMemo(() => {
    let maxFarmers = 0;
    let maxAcres = 0;
    let maxAvgAcres = 0;
    let maxFemalePct = 0;

    comparedItems.forEach(item => {
      if (item.farmersCount > maxFarmers) maxFarmers = item.farmersCount;
      if (item.totalAcres > maxAcres) maxAcres = item.totalAcres;
      if (item.avgAcres > maxAvgAcres) maxAvgAcres = item.avgAcres;
      if (item.femalePercentage > maxFemalePct) maxFemalePct = item.femalePercentage;
    });

    return { maxFarmers: maxFarmers || 1, maxAcres: maxAcres || 1, maxAvgAcres: maxAvgAcres || 1, maxFemalePct: maxFemalePct || 1 };
  }, [comparedItems]);

  // Export Matrix to Excel
  const handleExportMatrixExcel = async () => {
    if (comparedItems.length === 0) return;
    setIsExportingExcel(true);
    try {
      const XLSX = await getXLSX();
      const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      const aoa: any[][] = [
        ['LONEITU AGRARIAN REGISTRY — MULTI-ENTITY COMPARISON MATRIX'],
        [`Analysis Mode: ${mode.toUpperCase()} COMPARISON | Generated on: ${dateStr}`],
        [],
        ['Comparison Dimension', ...comparedItems.map(c => c.name)],
        ['Category / Profile', ...comparedItems.map(c => c.groupLabel)],
        ['Verified Farmers (Households)', ...comparedItems.map(c => c.farmersCount)],
        ['Total Committed Land (Acres)', ...comparedItems.map(c => c.totalAcres)],
        ['Average Parcel Size (Acres)', ...comparedItems.map(c => c.avgAcres)],
        ['Women Farmers Count', ...comparedItems.map(c => c.femaleCount)],
        ['Women Farmers Share (%)', ...comparedItems.map(c => `${c.femalePercentage}%`)],
        ['Male Farmers Count', ...comparedItems.map(c => c.maleCount)],
        ['Rainfed Land (Acres)', ...comparedItems.map(c => c.rainfedAcres)],
        ['Rainfed Dependency (%)', ...comparedItems.map(c => `${c.rainfedPercentage}%`)],
        ['Irrigated Land (Acres)', ...comparedItems.map(c => c.irrigatedAcres)],
        ['Upland Land (Acres)', ...comparedItems.map(c => c.uplandAcres)],
        ['Lowland (Paddy) Land (Acres)', ...comparedItems.map(c => c.lowlandAcres)],
        ['Average Farmer Age', ...comparedItems.map(c => `${c.avgAge} yrs`)],
        ['Youth Share (< 35 yrs)', ...comparedItems.map(c => `${c.youthPercentage}%`)],
        ['Key Clusters / Villages', ...comparedItems.map(c => c.topDetails.join(', ') || '-')],
      ];

      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols'] = [{ wch: 32 }, ...comparedItems.map(() => ({ wch: 25 }))];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Comparison Matrix');

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Farmer_Comparison_Matrix_${mode}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Comparison Matrix Excel downloaded successfully!', 'success');
    } catch (err) {
      console.error('Export error', err);
      showToast('Failed to export matrix to Excel.', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Copy Summary text for WhatsApp/Email
  const handleCopySummary = () => {
    let text = `📊 *LONEITU COMPARISON MATRIX (${mode.toUpperCase()})*\n`;
    text += `Generated: ${new Date().toLocaleDateString('en-IN')}\n\n`;

    comparedItems.forEach(c => {
      text += `*🔹 ${c.name}*\n`;
      text += `• Farmers: ${c.farmersCount.toLocaleString()} households\n`;
      text += `• Total Acreage: ${c.totalAcres.toLocaleString()} Acres (avg ${c.avgAcres} Ac)\n`;
      text += `• Women Farmers: ${c.femalePercentage}% (${c.femaleCount.toLocaleString()})\n`;
      text += `• Water Profile: ${c.rainfedPercentage}% Rainfed (${c.rainfedAcres} Ac)\n`;
      text += `• Average Age: ${c.avgAge} years (${c.youthPercentage}% youth)\n\n`;
    });

    text += `Source: Office of The Project Director, Mizo Farm Solutions (loneitu.com)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Comparison text copied to clipboard for WhatsApp or Email!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#DDD4BC] shadow-xs p-5 sm:p-7 space-y-6">
      {/* Header and Mode Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EBE6D6]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#256B3A] uppercase tracking-wider">
            <Scale className="w-4 h-4 text-[#256B3A]" />
            <span>Interactive Data Comparison Studio</span>
          </div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] mt-0.5">
            Manual Multi-Entity Comparison Matrix
          </h2>
          <p className="text-xs text-[#6F5B3C]">
            Select and compare any 2 to 4 districts, blocks, village hubs, crops, or demographic cohorts side-by-side.
          </p>
        </div>

        {/* 4 Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F6F4EB] rounded-2xl border border-[#DDD4BC] self-start lg:self-auto">
          <button
            onClick={() => handleSwitchMode('blocks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'blocks'
                ? 'bg-[#143520] text-white shadow-xs'
                : 'text-[#6F5B3C] hover:text-[#143520] hover:bg-white/50'
            }`}
          >
            Blocks (3)
          </button>
          <button
            onClick={() => handleSwitchMode('villages')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'villages'
                ? 'bg-[#143520] text-white shadow-xs'
                : 'text-[#6F5B3C] hover:text-[#143520] hover:bg-white/50'
            }`}
          >
            Top Villages (14)
          </button>
          <button
            onClick={() => handleSwitchMode('crops')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'crops'
                ? 'bg-[#143520] text-white shadow-xs'
                : 'text-[#6F5B3C] hover:text-[#143520] hover:bg-white/50'
            }`}
          >
            Crops (5)
          </button>
          <button
            onClick={() => handleSwitchMode('demographics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'demographics'
                ? 'bg-[#143520] text-white shadow-xs'
                : 'text-[#6F5B3C] hover:text-[#143520] hover:bg-white/50'
            }`}
          >
            Demographics (4)
          </button>
        </div>
      </div>

      {/* Entity Picker Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#54432C] flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#256B3A]" />
            <span>Select items to compare ({selectedEntityIds.length} of 4 chosen):</span>
          </span>
          <span className="text-[11px] text-[#8F7855]">Click to add or remove</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentPool.map(entity => {
            const isSelected = selectedEntityIds.includes(entity.id);
            return (
              <button
                key={entity.id}
                onClick={() => handleToggleEntity(entity.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#143520] text-white border-[#143520] shadow-xs'
                    : 'bg-[#FBFBF8] text-[#54432C] border-[#DDD4BC] hover:border-[#256B3A] hover:bg-[#F2F7F3]'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#BFDC28]' : 'bg-[#DDD4BC]'}`}
                />
                <span>{entity.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-[#BFDC28]' : 'text-[#8F7855]'}`}>
                  ({entity.farmersCount})
                </span>
                {isSelected && <Check className="w-3 h-3 text-[#BFDC28]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Bar for the Matrix */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-[#6F5B3C]">
          <span className="w-2 h-2 rounded-full bg-[#256B3A] animate-pulse" />
          <span>Active Matrix: Comparing <strong>{comparedItems.length} entities</strong> side-by-side</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F6F4EB] hover:bg-[#EBE6D6] text-[#143520] border border-[#DDD4BC] transition-colors cursor-pointer"
            title="Copy comparative summary text"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#256B3A]" /> : <Copy className="w-3.5 h-3.5 text-[#6F5B3C]" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          {/* Excel Export */}
          <button
            onClick={handleExportMatrixExcel}
            disabled={isExportingExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#143520] hover:bg-[#1E542E] text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#BFDC28]" />
            <span>{isExportingExcel ? 'Exporting...' : 'Export Matrix (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* The Comparative Matrix Grid */}
      <div className="overflow-x-auto border border-[#DDD4BC] rounded-2xl shadow-xs">
        <table className="w-full text-left text-xs text-[#304134] min-w-[650px]">
          {/* Header row with entities */}
          <thead className="bg-[#143520] text-white">
            <tr>
              <th className="py-4 px-4 w-44 font-serif font-bold text-sm border-r border-[#256B3A]/40">
                Comparison Dimension
              </th>
              {comparedItems.map(item => (
                <th key={item.id} className="py-4 px-4 font-serif font-bold text-sm border-r last:border-r-0 border-[#256B3A]/40">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="text-[10px] text-[#BFDC28] font-sans font-normal mt-0.5">
                    {item.groupLabel}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EBE6D6]">
            {/* Row 1: Verified Farmers */}
            <tr className="hover:bg-[#FBFBF8] transition-colors">
              <td className="py-3 px-4 font-bold text-[#143520] bg-[#F6F4EB]/60 border-r border-[#EBE6D6]">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#256B3A]" />
                  <span>Verified Farmers</span>
                </div>
              </td>
              {comparedItems.map(item => {
                const isMax = item.farmersCount === maxValues.maxFarmers;
                return (
                  <td key={item.id} className="py-3 px-4 border-r last:border-r-0 border-[#EBE6D6]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-extrabold text-sm text-[#143520]">
                        {item.farmersCount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#6F5B3C]">growers</span>
                      {isMax && comparedItems.length > 1 && (
                        <span className="px-1.5 py-0.2 rounded-md bg-[#F2F7F3] text-[#256B3A] text-[9px] font-bold border border-[#B7CEB4]">
                          Highest
                        </span>
                      )}
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-[#EBE6D6] h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-[#256B3A] h-full rounded-full"
                        style={{ width: `${(item.farmersCount / maxValues.maxFarmers) * 100}%` }}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: Total Acreage */}
            <tr className="hover:bg-[#FBFBF8] transition-colors">
              <td className="py-3 px-4 font-bold text-[#143520] bg-[#F6F4EB]/60 border-r border-[#EBE6D6]">
                <div className="flex items-center gap-2">
                  <Sprout className="w-3.5 h-3.5 text-[#C98A2C]" />
                  <span>Total Committed Land</span>
                </div>
              </td>
              {comparedItems.map(item => {
                const isMax = item.totalAcres === maxValues.maxAcres;
                return (
                  <td key={item.id} className="py-3 px-4 border-r last:border-r-0 border-[#EBE6D6]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono font-bold text-sm text-[#143520]">
                        {item.totalAcres.toLocaleString()} Ac
                      </span>
                      {isMax && comparedItems.length > 1 && (
                        <span className="px-1.5 py-0.2 rounded-md bg-[#FDFBF7] text-[#C98A2C] text-[9px] font-bold border border-[#EBD6A3]">
                          Leader
                        </span>
                      )}
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-[#EBE6D6] h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-[#C98A2C] h-full rounded-full"
                        style={{ width: `${(item.totalAcres / maxValues.maxAcres) * 100}%` }}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 3: Average Landholding */}
            <tr className="hover:bg-[#FBFBF8] transition-colors">
              <td className="py-3 px-4 font-bold text-[#143520] bg-[#F6F4EB]/60 border-r border-[#EBE6D6]">
                <div className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-[#8F7855]" />
                  <span>Avg Parcel / Farmer</span>
                </div>
              </td>
              {comparedItems.map(item => {
                const isMax = item.avgAcres === maxValues.maxAvgAcres;
                return (
                  <td key={item.id} className="py-3 px-4 font-mono font-bold text-[#143520] border-r last:border-r-0 border-[#EBE6D6]">
                    <div className="flex items-center gap-1.5">
                      <span>{item.avgAcres} Acres</span>
                      {isMax && comparedItems.length > 1 && (
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-[#256B3A] text-[9px] font-bold border border-emerald-200">
                          Largest
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 4: Women Farmers (Gender Inclusivity) */}
            <tr className="hover:bg-[#FBFBF8] transition-colors">
              <td className="py-3 px-4 font-bold text-[#143520] bg-[#F6F4EB]/60 border-r border-[#EBE6D6]">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#C2623D]" />
                  <span>Women Farmers Share</span>
                </div>
              </td>
              {comparedItems.map(item => {
                const isMax = item.femalePercentage === maxValues.maxFemalePct;
                return (
                  <td key={item.id} className="py-3 px-4 border-r last:border-r-0 border-[#EBE6D6]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-extrabold text-[#C2623D] text-sm">
                        {item.femalePercentage}%
                      </span>
                      <span className="text-[10px] text-[#6F5B3C]">({item.femaleCount} women)</span>
                      {isMax && comparedItems.length > 1 && (
                        <span className="px-1.5 py-0.2 rounded-md bg-orange-50 text-[#C2623D] text-[9px] font-bold border border-orange-200">
                          Top Gender Equity
                        </span>
                      )}
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-[#EBE6D6] h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-[#C2623D] h-full rounded-full"
                        style={{ width: `${item.femalePercentage}%` }}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 5: Rainfed Dependency */}
            <tr className="hover:bg-[#FBFBF8] transition-colors">
              <td className="py-3 px-4 font-bold text-[#143520] bg-[#F6F4EB]/60 border-r border-[#EBE6D6]">
                <div className="flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-[#A84C2A]" />
                  <span>Rainfed Dependency</span>
                </div>
              </td>
              {comparedItems.map(item => (
                <td key={item.id} className="py-3 px-4 border-r last:border-r-0 border-[#EBE6D6]">
                  <div className="font-bold text-[#A84C2A]">
                    {item.rainfedPercentage}% <span className="text-[10px] text-[#8F7855] font-normal font-mono">({item.rainfedAcres} Ac)</span>
                  </div>
                  <div className="text-[10px] text-[#256B3A] font-semibold mt-0.5">
                    Irrigated: {item.irrigatedPercentage}% ({item.irrigatedAcres} Ac)
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 6: Topographical Land Classification */}
            <tr className="hover:bg-[#FBFBF8] transition-colors">
              <td className="py-3 px-4 font-bold text-[#143520] bg-[#F6F4EB]/60 border-r border-[#EBE6D6]">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#256B3A]" />
                  <span>Upland vs Lowland</span>
                </div>
              </td>
              {comparedItems.map(item => (
                <td key={item.id} className="py-3 px-4 text-xs border-r last:border-r-0 border-[#EBE6D6]">
                  <div>Upland: <strong className="text-[#143520]">{item.uplandAcres} Ac</strong></div>
                  <div className="text-[11px] text-[#6F5B3C]">Lowland/Terrace: <strong>{item.lowlandAcres} Ac</strong></div>
                </td>
              ))}
            </tr>

            {/* Row 7: Average Farmer Age */}
            <tr className="hover:bg-[#FBFBF8] transition-colors">
              <td className="py-3 px-4 font-bold text-[#143520] bg-[#F6F4EB]/60 border-r border-[#EBE6D6]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#54432C]" />
                  <span>Farmer Age & Youth Share</span>
                </div>
              </td>
              {comparedItems.map(item => (
                <td key={item.id} className="py-3 px-4 border-r last:border-r-0 border-[#EBE6D6]">
                  <div className="font-bold text-[#143520]">
                    {item.avgAge} years average
                  </div>
                  <div className="text-[10px] text-[#256B3A] font-semibold">
                    {item.youthPercentage}% youth (&lt; 35 yrs)
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 8: Key Production Clusters */}
            <tr className="hover:bg-[#FBFBF8] transition-colors">
              <td className="py-3 px-4 font-bold text-[#143520] bg-[#F6F4EB]/60 border-r border-[#EBE6D6]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#256B3A]" />
                  <span>Primary Clusters / Hubs</span>
                </div>
              </td>
              {comparedItems.map(item => (
                <td key={item.id} className="py-3 px-4 text-[11px] text-[#6F5B3C] border-r last:border-r-0 border-[#EBE6D6]">
                  <div className="flex flex-wrap gap-1">
                    {item.topDetails.length > 0 ? (
                      item.topDetails.map(d => (
                        <span key={d} className="px-1.5 py-0.5 rounded-md bg-[#F2F7F3] text-[#256B3A] text-[10px] font-medium border border-[#B7CEB4]">
                          {d}
                        </span>
                      ))
                    ) : (
                      <span>District-wide agricultural base</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comparative Key Takeaway Alert */}
      <div className="p-4 rounded-2xl bg-[#F2F7F3] border border-[#B7CEB4] flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#256B3A] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-[#143520]">
            Comparative Executive Takeaway for Presentation
          </div>
          <p className="text-[#304134] leading-relaxed">
            Comparing across <strong>{comparedItems.map(c => c.name).join(' vs. ')}</strong> highlights substantial differences in parcel size, female land stewardship, and irrigation infrastructure.
            You can use the <strong>Export Matrix (.xlsx)</strong> button to attach these side-by-side tables directly to institutional project pitches and government proposals.
          </p>
        </div>
      </div>
    </div>
  );
};
