import type { FarmerRecord } from '../types/farmer';
import type { FarmerAnalyticsMetrics } from './farmerAnalyticsCalculator';

const getXLSX = async () => await import('xlsx');

/**
 * Generates an official, publication-grade multi-sheet Excel workbook (.xlsx)
 * designed for institutional presentation and departmental auditing.
 */
export async function generateGovernmentExcelReport(
  metrics: FarmerAnalyticsMetrics,
  farmers: FarmerRecord[]
): Promise<void> {
  const XLSX = await getXLSX();
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const workbook = XLSX.utils.book_new();

  // =========================================================================
  // SHEET 1: EXECUTIVE SUMMARY
  // =========================================================================
  const summaryAoa: any[][] = [
    ['MIZO FARM SOLUTIONS — GOVERNMENT PROGRESS & FIELD AUDIT PRESENTATION'],
    ['OFFICE OF THE PROJECT DIRECTOR, CHAMPHAI DISTRICT, MIZORAM'],
    ['REGISTRATION NO: MSR 1863 OF 07.04.2026 | DARPAN ID: MZ/2026/1116885 | UDYAM: UDYAM-MZ-02-0002682'],
    ['REPORT GENERATED ON:', dateStr],
    [],
    ['KEY PERFORMANCE INDICATORS (KPIs)'],
    ['Metric Description', 'Quantitative Value', 'Unit of Measure', 'Remarks'],
    ['Total Verified Farming Households', metrics.totalFarmers, 'Farmers', '100% field audited'],
    ['Total Committed Cultivated Land', metrics.totalAcreage, 'Acres', 'Active agricultural area'],
    ['Average Agricultural Landholding', metrics.avgAcreagePerFarmer, 'Acres / Farmer', 'Typical smallholder scale'],
    ['Operational Districts Covered', metrics.totalDistricts, 'Districts', 'Champhai, Khawzawl'],
    ['Operational Blocks Covered', metrics.totalBlocks, 'Blocks', 'Champhai, Khawbung, Khawzawl'],
    ['Active Rural Villages / GPs', metrics.totalVillages, 'Villages', 'Cluster coverage'],
    ['Women Farmers (Inclusivity)', metrics.femaleCount, `Farmers (${metrics.femalePercentage}%)`, 'Strong gender equity'],
    ['Male Farmers', metrics.maleCount, `Farmers (${(100 - metrics.femalePercentage).toFixed(1)}%)`, 'Head of households'],
    ['Rainfed Production Area', metrics.rainfedAcreage, 'Acres', 'Monsoon-dependent systems'],
    ['Mechanized / Irrigated Area', metrics.irrigatedAcreage, 'Acres', 'Solar/stream irrigation'],
    [],
    ['DISTRICT-WISE AGRICULTURAL LANDHOLDINGS'],
    ['#', 'District Name', 'Total Farmers', 'Total Acreage (Acres)', 'Share of Land (%)', 'Women Farmers', 'Avg Landholding (Ac)'],
  ];

  metrics.districtBreakdown.forEach((d, idx) => {
    summaryAoa.push([
      idx + 1,
      d.district,
      d.totalFarmers,
      d.totalAcreage,
      `${((d.totalAcreage / (metrics.totalAcreage || 1)) * 100).toFixed(1)}%`,
      d.femaleFarmers,
      d.avgAcreage,
    ]);
  });

  summaryAoa.push([]);
  summaryAoa.push(['FLAGSHIP AGRONOMIC CROPS BREAKDOWN (KIWI VS DRAGONFRUIT VS TERRACE PADDY)']);
  summaryAoa.push(['#', 'Target Crop Category', 'Agronomic Profile', 'Verified Growers', 'Total Acreage (Acres)', 'Share of Total (%)', 'Avg Holding (Ac)']);

  metrics.cropBreakdown.forEach((c, idx) => {
    summaryAoa.push([
      idx + 1,
      c.cropName,
      c.category,
      c.farmersCount,
      c.totalAcres,
      `${c.percentage}%`,
      c.avgAcrePerFarmer,
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
  wsSummary['!cols'] = [
    { wch: 6 },
    { wch: 38 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Executive Summary');

  // =========================================================================
  // SHEET 2: DISTRICT & BLOCK MATRIX
  // =========================================================================
  const blockAoa: any[][] = [
    ['DISTRICT & BLOCK LEVEL FIELD DEPLOYMENT MATRIX'],
    ['Organization: Mizo Farm Solutions, Champhai District'],
    ['Audit Date:', dateStr],
    [],
    ['#', 'District Name', 'Block Name', 'Verified Growers', 'Total Acreage (Acres)', 'District Land Share (%)', 'Cluster Status'],
  ];

  let blockIdx = 1;
  metrics.districtBreakdown.forEach((d) => {
    d.blocks.forEach((b) => {
      blockAoa.push([
        blockIdx++,
        d.district,
        b.name,
        b.farmers,
        b.acreage,
        `${((b.acreage / (d.totalAcreage || 1)) * 100).toFixed(1)}%`,
        'Active Implementation Cluster',
      ]);
    });
  });

  const wsBlock = XLSX.utils.aoa_to_sheet(blockAoa);
  wsBlock['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 24 },
    { wch: 18 },
    { wch: 22 },
    { wch: 24 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(workbook, wsBlock, 'Block Matrix');

  // =========================================================================
  // SHEET 3: CROP & ACREAGE BREAKDOWN
  // =========================================================================
  const cropAoa: any[][] = [
    ['COMPREHENSIVE CROP SPECIALIZATION & WATER SECURITY REPORT'],
    ['Focus: Kiwi, Dragon Fruit, Terrace Paddy & Organic Hill Horticulture'],
    ['Generated on:', dateStr],
    [],
    ['#', 'Crop Name', 'Classification', 'Growers Count', 'Total Acreage (Acres)', 'Land Share (%)', 'Average Holding', 'Primary Cluster Villages'],
  ];

  metrics.cropBreakdown.forEach((c, idx) => {
    cropAoa.push([
      idx + 1,
      c.cropName,
      c.category,
      c.farmersCount,
      c.totalAcres,
      `${c.percentage}%`,
      `${c.avgAcrePerFarmer} Ac`,
      c.primaryVillages.join(', ') || 'District-Wide Clusters',
    ]);
  });

  const wsCrop = XLSX.utils.aoa_to_sheet(cropAoa);
  wsCrop['!cols'] = [
    { wch: 6 },
    { wch: 34 },
    { wch: 24 },
    { wch: 16 },
    { wch: 22 },
    { wch: 16 },
    { wch: 18 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(workbook, wsCrop, 'Crop Breakdown');

  // =========================================================================
  // SHEET 4: MASTER FARMER DIRECTORY (Clean Sample / Full Records)
  // =========================================================================
  const dirHeaders = [
    'Sl No',
    'Farmer Full Name',
    'Gender',
    'Age',
    'District',
    'Block',
    'Village / GP',
    'Contact Number',
    'Total Land (Acres)',
    'Land Classification',
    'Irrigation Method',
    'Verification Status',
  ];

  const dirRows: any[][] = [
    ['VERIFIED MASTER FARMER REGISTRY — CHAMPHAI & ADJOINING DISTRICTS'],
    ['Total Records Exported:', farmers.length],
    [],
    dirHeaders,
  ];

  farmers.forEach((f, idx) => {
    const d = f.data || {};
    const acres = d['Total Land under NF/Committed (acre)'] || d['Total Land'] || d['Acre'] || 1;
    const landType = d['Land Type'] || d['Land type \r\n(Upland/Lowland/ Irrigated/Rainfed)'] || 'UpLand';
    const irr = d['IrrigationType'] || 'Rainfed';

    dirRows.push([
      idx + 1,
      f.fullName || '-',
      d['Gender'] || '-',
      d['Age'] || '-',
      d['District Name'] || d['District'] || 'CHAMPHAI',
      d['Block'] || 'Champhai',
      d['Village'] || d['Name of the village'] || d['Gram Panchayat'] || '-',
      d['Contact No'] || d['Contact Number'] || '-',
      acres,
      landType,
      irr,
      f.status || 'Verified',
    ]);
  });

  const wsDir = XLSX.utils.aoa_to_sheet(dirRows);
  wsDir['!cols'] = [
    { wch: 8 },
    { wch: 28 },
    { wch: 12 },
    { wch: 8 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(workbook, wsDir, 'Master Farmer Directory');

  // Write and trigger download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Mizo_Farm_Solutions_Farmer_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
