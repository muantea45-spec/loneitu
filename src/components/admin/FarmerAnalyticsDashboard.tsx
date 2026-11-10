import React, { useState, useMemo } from 'react';
import { useBlog } from '../../context/BlogContext';
import { calculateFarmerAnalytics } from '../../utils/farmerAnalyticsCalculator';
import { generateGovernmentPresentationPdf } from '../../utils/governmentPresentationPdfGenerator';
import { generateGovernmentExcelReport } from '../../utils/governmentExcelReportGenerator';
import { useToast } from '../common/Toast';
import {
  FileText,
  FileSpreadsheet,
  Users,
  MapPin,
  Sprout,
  Droplets,
  Award,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Search,
} from 'lucide-react';

export const FarmerAnalyticsDashboard: React.FC = () => {
  const { farmers } = useBlog();
  const { showToast } = useToast();

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState('');

  // Calculate high-performance metrics
  const metrics = useMemo(() => {
    return calculateFarmerAnalytics(farmers);
  }, [farmers]);

  // Handle PDF Export
  const handleExportPdf = async () => {
    if (farmers.length === 0) {
      showToast('No farmer records found to generate presentation.', 'error');
      return;
    }
    setIsExportingPdf(true);
    try {
      await generateGovernmentPresentationPdf(metrics);
      showToast('Official Government Progress Presentation PDF generated successfully!', 'success');
    } catch (err) {
      console.error('PDF generation error', err);
      showToast('Failed to generate Presentation PDF.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle Excel Export
  const handleExportExcel = async () => {
    if (farmers.length === 0) {
      showToast('No farmer records found to generate report.', 'error');
      return;
    }
    setIsExportingExcel(true);
    try {
      await generateGovernmentExcelReport(metrics, farmers);
      showToast('Multi-Sheet Institutional Excel Report downloaded successfully!', 'success');
    } catch (err) {
      console.error('Excel generation error', err);
      showToast('Failed to export Excel report.', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Filtered district breakdown for table
  const filteredDistricts = useMemo(() => {
    return metrics.districtBreakdown.filter(d => {
      if (selectedDistrictFilter !== 'all' && d.district.toLowerCase() !== selectedDistrictFilter.toLowerCase()) {
        return false;
      }
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matchName = d.district.toLowerCase().includes(q);
        const matchBlock = d.blocks.some(b => b.name.toLowerCase().includes(q));
        if (!matchName && !matchBlock) return false;
      }
      return true;
    });
  }, [metrics, selectedDistrictFilter, tableSearch]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner & Credentials */}
      <div className="bg-gradient-to-br from-[#143520] via-[#1A442A] to-[#12301D] text-white rounded-3xl p-6 sm:p-8 border border-[#256B3A]/40 shadow-xl relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#BFDC28_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#BFDC28]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#DFEDE3] border border-white/15 text-[11px] font-semibold tracking-wider uppercase">
              <Award className="w-3.5 h-3.5 text-[#BFDC28]" />
              <span>Government of Mizoram Recognized Registry</span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              Farmer Directory District Export & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#DFEDE3]/85 leading-relaxed">
              Official institutional dashboard for the <strong>Office of The Project Director, Mizo Farm Solutions</strong> (Champhai District).
              Visual demographic analytics, crop-specific landholdings, and presentation-ready exports.
            </p>

            {/* Registration badges */}
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[#BFDC28] font-mono">
              <span>MSR 1863 of 07.04.2026</span>
              <span className="text-white/40">•</span>
              <span>DARPAN: MZ/2026/1116885</span>
              <span className="text-white/40">•</span>
              <span>UDYAM-MZ-02-0002682</span>
              <span className="text-white/40">•</span>
              <span className="text-[#DFEDE3]">Jail Veng, Champhai (796321)</span>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {/* One-Click PDF */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf || farmers.length === 0}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-[#BFDC28] text-[#143520] font-bold text-xs sm:text-sm hover:bg-[#d2ee3a] shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <FileText className="w-4 h-4 text-[#143520] group-hover:scale-110 transition-transform" />
              <span>{isExportingPdf ? 'Generating Presentation...' : 'One-Click Govt Presentation (.pdf)'}</span>
            </button>

            {/* One-Click Excel */}
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel || farmers.length === 0}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#BFDC28] group-hover:scale-110 transition-transform" />
              <span>{isExportingExcel ? 'Exporting Spreadsheet...' : 'One-Click Multi-Sheet Excel (.xlsx)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Farmers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#6F5B3C]">
            <span className="uppercase tracking-wider">Verified Farmers</span>
            <div className="w-8 h-8 rounded-xl bg-[#F2F7F3] text-[#256B3A] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-extrabold text-[#143520]">
            {metrics.totalFarmers.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#6F5B3C] flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#256B3A]" />
            <span>100% Field Registry Audited</span>
          </div>
        </div>

        {/* KPI 2: Total Cultivated Acreage */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#6F5B3C]">
            <span className="uppercase tracking-wider">Total Crop Land</span>
            <div className="w-8 h-8 rounded-xl bg-[#FBFBF8] text-[#C98A2C] flex items-center justify-center border border-[#EBE6D6]">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-extrabold text-[#143520]">
            {metrics.totalAcreage.toLocaleString()} <span className="text-sm font-sans font-normal text-[#6F5B3C]">Acres</span>
          </div>
          <div className="text-[11px] text-[#6F5B3C] flex items-center gap-1 font-medium">
            <span className="font-bold text-[#256B3A]">Avg {metrics.avgAcreagePerFarmer} Ac</span>
            <span>per farming household</span>
          </div>
        </div>

        {/* KPI 3: Women Farmers Inclusivity */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#6F5B3C]">
            <span className="uppercase tracking-wider">Women Farmers</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#C2623D] flex items-center justify-center border border-orange-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-extrabold text-[#143520]">
            {metrics.femalePercentage}%
          </div>
          <div className="text-[11px] text-[#6F5B3C] font-medium">
            <span className="font-bold text-[#C2623D]">{metrics.femaleCount.toLocaleString()}</span> Female Land Stewards
          </div>
        </div>

        {/* KPI 4: Coverage Scope */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#6F5B3C]">
            <span className="uppercase tracking-wider">Geographic Reach</span>
            <div className="w-8 h-8 rounded-xl bg-[#F6F4EB] text-[#143520] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-extrabold text-[#143520]">
            {metrics.totalDistricts} <span className="text-sm font-sans font-normal text-[#6F5B3C]">Districts</span>
          </div>
          <div className="text-[11px] text-[#6F5B3C] font-medium">
            <span>{metrics.totalBlocks} Blocks</span> • <span>{metrics.totalVillages} Villages & GPs</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Charts Grid: District vs Crops */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): District Distribution Chart */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#256B3A] uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-[#256B3A]" />
                <span>Geographic Demographics</span>
              </div>
              <h2 className="font-serif font-bold text-xl text-[#143520] mt-0.5">
                Total Registered Farmers by District & Block
              </h2>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F6F4EB] rounded-xl border border-[#DDD4BC]">
              <button
                onClick={() => setSelectedDistrictFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedDistrictFilter === 'all'
                    ? 'bg-[#143520] text-white'
                    : 'text-[#6F5B3C] hover:text-[#143520]'
                }`}
              >
                All
              </button>
              {metrics.districtBreakdown.map(d => (
                <button
                  key={d.district}
                  onClick={() => setSelectedDistrictFilter(d.district)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedDistrictFilter.toLowerCase() === d.district.toLowerCase()
                      ? 'bg-[#143520] text-white'
                      : 'text-[#6F5B3C] hover:text-[#143520]'
                  }`}
                >
                  {d.district}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive District Progress Bars */}
          <div className="space-y-4 pt-2">
            {metrics.districtBreakdown.map(dist => {
              const pctFarmers = ((dist.totalFarmers / (metrics.totalFarmers || 1)) * 100).toFixed(1);
              const pctAcres = ((dist.totalAcreage / (metrics.totalAcreage || 1)) * 100).toFixed(1);

              return (
                <div
                  key={dist.district}
                  className="p-4 rounded-xl bg-[#FBFBF8] border border-[#EBE6D6] space-y-3 hover:border-[#B7CEB4] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-[#143520]">
                        {dist.district} District
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2F7F3] text-[#256B3A] border border-[#B7CEB4]">
                        {dist.totalFarmers.toLocaleString()} Farmers ({pctFarmers}%)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#143520]">
                      {dist.totalAcreage.toLocaleString()} Acres ({pctAcres}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#EBE6D6] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#256B3A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pctFarmers}%` }}
                    />
                  </div>

                  {/* Operational Blocks */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    {dist.blocks.map(b => (
                      <div key={b.name} className="p-2 rounded-lg bg-white border border-[#EBE6D6] flex flex-col">
                        <span className="text-[10px] text-[#6F5B3C] font-semibold">{b.name} Block</span>
                        <span className="font-bold text-[#143520] mt-0.5">
                          {b.farmers.toLocaleString()} <span className="text-[10px] font-normal text-[#8F7855]">farmers ({b.acreage} Ac)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Acreage Breakdown (Kiwi vs Dragonfruit vs Terrace Paddy) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#256B3A] uppercase tracking-wider">
              <PieIcon className="w-4 h-4 text-[#256B3A]" />
              <span>Agronomic Crop Breakdown</span>
            </div>
            <h2 className="font-serif font-bold text-xl text-[#143520] mt-0.5">
              Kiwi vs. Dragonfruit vs. Terrace Paddy
            </h2>
            <p className="text-xs text-[#6F5B3C]">
              Land distribution across strategic commercial and staple crop clusters
            </p>
          </div>

          {/* Stacked Visual Donut / Segmented Bar */}
          <div className="space-y-3">
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-[#EBE6D6]">
              {metrics.cropBreakdown.map((c) => (
                <div
                  key={c.cropName}
                  className="h-full transition-all"
                  style={{
                    width: `${c.percentage}%`,
                    backgroundColor: c.color,
                  }}
                  title={`${c.cropName}: ${c.totalAcres} Acres (${c.percentage}%)`}
                />
              ))}
            </div>

            {/* Crop Cards List */}
            <div className="space-y-2.5 pt-1">
              {metrics.cropBreakdown.map((crop) => (
                <div
                  key={crop.cropName}
                  className="p-3 rounded-xl border border-[#EBE6D6] hover:bg-[#FBFBF8] transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: crop.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-xs sm:text-sm text-[#143520] truncate">
                        {crop.cropName}
                      </div>
                      <div className="text-[10px] text-[#6F5B3C]">
                        {crop.category} • {crop.farmersCount.toLocaleString()} growers
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-xs sm:text-sm text-[#143520]">
                      {crop.totalAcres.toLocaleString()} Ac
                    </div>
                    <div className="text-[10px] font-bold text-[#256B3A]">
                      {crop.percentage}% share
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Water Security & Irrigation Infrastructure Banner */}
      <div className="bg-[#FEF9EB] border border-[#EBD6A3] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#A84C2A] uppercase tracking-wider">
            <Droplets className="w-4 h-4 text-[#A84C2A]" />
            <span>Water Security & Irrigation Assessment for Funding Proposals</span>
          </div>
          <p className="text-xs sm:text-sm text-[#54432C] leading-relaxed">
            <strong className="text-[#143520]">{metrics.rainfedAcreage.toLocaleString()} Acres ({((metrics.rainfedAcreage / (metrics.totalAcreage || 1)) * 100).toFixed(1)}%)</strong> of all registered farming land operates strictly on seasonal monsoon rain.
            Transitioning growers to <strong>Solar Micro-Drip Irrigation Kits</strong> and rain-harvesting farm ponds can increase multi-season winter yields by over <strong>85%</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-4 py-2 bg-white rounded-xl border border-[#EBD6A3] text-center">
            <div className="text-xs text-[#8F7855] font-semibold">Irrigated Land</div>
            <div className="text-sm font-bold text-[#256B3A]">{metrics.irrigatedAcreage} Ac</div>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl border border-[#EBD6A3] text-center">
            <div className="text-xs text-[#8F7855] font-semibold">Rainfed Land</div>
            <div className="text-sm font-bold text-[#A84C2A]">{metrics.rainfedAcreage} Ac</div>
          </div>
        </div>
      </div>

      {/* 5. Comprehensive District & Block Matrix Table */}
      <div className="bg-white rounded-2xl border border-[#DDD4BC] shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#143520]">
              Operational District & Block Deployment Matrix
            </h3>
            <p className="text-xs text-[#6F5B3C]">
              Comprehensive administrative audit ready for submission to State Agriculture & Horticulture departments
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8F7855] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              placeholder="Search district or block..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FBFBF8] border border-[#DDD4BC] text-[#143520] placeholder-[#8F7855] focus:outline-hidden focus:ring-2 focus:ring-[#256B3A]"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto border border-[#EBE6D6] rounded-xl">
          <table className="w-full text-left text-xs text-[#304134]">
            <thead className="bg-[#143520] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Blocks Covered</th>
                <th className="py-3 px-4 text-right">Verified Farmers</th>
                <th className="py-3 px-4 text-right">Total Acreage</th>
                <th className="py-3 px-4 text-right">Women Farmers</th>
                <th className="py-3 px-4 text-right">Rainfed Area</th>
                <th className="py-3 px-4 text-right">Avg Holding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE6D6]">
              {filteredDistricts.map(d => (
                <tr key={d.district} className="hover:bg-[#FBFBF8] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#143520] font-serif">
                    {d.district}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {d.blocks.map(b => (
                        <span key={b.name} className="px-2 py-0.5 rounded-md bg-[#F2F7F3] text-[#256B3A] text-[10px] font-semibold border border-[#B7CEB4]">
                          {b.name} ({b.farmers})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#143520]">
                    {d.totalFarmers.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#256B3A]">
                    {d.totalAcreage.toLocaleString()} Ac
                  </td>
                  <td className="py-3 px-4 text-right">
                    {d.femaleFarmers.toLocaleString()} <span className="text-[10px] text-[#6F5B3C]">({((d.femaleFarmers / d.totalFarmers) * 100).toFixed(0)}%)</span>
                  </td>
                  <td className="py-3 px-4 text-right text-[#A84C2A] font-medium">
                    {d.rainfedAcreage.toLocaleString()} Ac
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-[#54432C]">
                    {d.avgAcreage} Ac
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
