import * as XLSX from 'xlsx';
import type { FarmerRecord } from '../types/farmer';

export interface ParseResult {
  records: FarmerRecord[];
  errors: { row: number; reason: string }[];
  totalRows: number;
  detectedHeaders: string[];
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV file into dynamic FarmerRecord objects.
 * Only the exact columns present in the uploaded spreadsheet are saved.
 * Avatars are left blank unless a specific valid image URL is in the spreadsheet,
 * requiring profiles to be uploaded manually.
 */
export async function parseExcelToFarmers(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Spreadsheet contains no sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawRows.length < 2) {
    throw new Error('Spreadsheet must contain a header row and at least one data row.');
  }

  // Row 0 is the exact list of headers uploaded by the user
  const detectedHeaders = rawRows[0]
    .map(h => String(h || '').trim())
    .filter(Boolean);

  if (detectedHeaders.length === 0) {
    throw new Error('No valid column headers found in the first row.');
  }

  // Identify which header represents the farmer's full name
  let nameHeaderIndex = rawRows[0].findIndex((h: any) =>
    /^(farmer\s*name|full\s*name|name|hming|loneitu\s*hming)$/i.test(String(h || '').trim())
  );
  if (nameHeaderIndex === -1) {
    nameHeaderIndex = rawRows[0].findIndex((h: any) =>
      /(name|hming)/i.test(String(h || '').trim())
    );
  }
  // If still not found, default to first non-empty column
  if (nameHeaderIndex === -1) {
    nameHeaderIndex = 0;
  }

  // Identify avatar header if provided
  const avatarHeaderIndex = rawRows[0].findIndex((h: any) =>
    /^(avatar|photo|image|picture|thlalak)$/i.test(String(h || '').trim())
  );

  const records: FarmerRecord[] = [];
  const errors: { row: number; reason: string }[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.every(c => c === '' || c === undefined || c === null)) {
      continue;
    }

    const rowNum = r + 1;
    const rowData: Record<string, string | number | boolean> = {};

    rawRows[0].forEach((headerRaw: any, colIdx: number) => {
      const header = String(headerRaw || '').trim();
      if (!header) return;

      const rawVal = row[colIdx];
      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
        if (rawVal instanceof Date) {
          rowData[header] = rawVal.toISOString().split('T')[0];
        } else if (typeof rawVal === 'number') {
          rowData[header] = rawVal;
        } else {
          rowData[header] = String(rawVal).trim();
        }
      }
    });

    const rawName = row[nameHeaderIndex];
    const fullName = rawName ? String(rawName).trim() : '';

    if (!fullName) {
      errors.push({ row: rowNum, reason: `Missing name in column "${rawRows[0][nameHeaderIndex] || 'Name'}".` });
      continue;
    }

    const customAvatar = avatarHeaderIndex !== -1 && row[avatarHeaderIndex] ? String(row[avatarHeaderIndex]).trim() : '';
    // Wipe fake/stock avatars: only keep if explicitly provided non-unsplash URL
    const avatar = customAvatar && !customAvatar.includes('unsplash.com') ? customAvatar : '';

    records.push({
      id: `farmer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName,
      avatar,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'Verified',
      columns: detectedHeaders,
      data: rowData
    });
  }

  return {
    records,
    errors,
    totalRows: rawRows.length - 1,
    detectedHeaders
  };
}

/**
 * Generates a sample Excel template (.xlsx) with clean, flexible columns.
 */
export function generateSampleFarmerExcel(): Uint8Array {
  const headers = [
    'Sl No',
    'Farmer Name',
    "Father's Name",
    'Village',
    'District',
    'Contact Number',
    'Aadhaar Number',
    'Land Size (Acres)',
    'Primary Crops Cultivated'
  ];

  const sampleRow1 = [
    '1',
    'Lalbiakthanga Fanai',
    'Lalmuana Fanai',
    'Hnahlan',
    'Champhai',
    '+91 98623 45120',
    'XXXX-XXXX-4819',
    '5.5',
    'Chawnpui Grape, Assam Lemon'
  ];

  const sampleRow2 = [
    '2',
    'Lalthanzuali Ralte',
    'R. Lalchungnunga',
    'Zawlnuam',
    'Mamit',
    '+91 94361 78201',
    'XXXX-XXXX-9321',
    '4.0',
    'Nadia Ginger, Lakadong Turmeric'
  ];

  const wsData = [headers, sampleRow1, sampleRow2];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  worksheet['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 4, 18) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Farmer Registry');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(excelBuffer);
}

/**
 * Triggers a download of the sample Excel template
 */
export function downloadSampleFarmerTemplate(): void {
  const data = generateSampleFarmerExcel();
  const blob = new Blob([data.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Farmer_Registry_Template.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports current farmer records dynamically using only the columns that exist.
 */
export function exportFarmersToExcel(farmers: FarmerRecord[]): void {
  if (farmers.length === 0) {
    alert('No farmer records available to export.');
    return;
  }

  // Collect all unique column headers present across all records
  const dynamicColsSet = new Set<string>();
  farmers.forEach(f => {
    if (f.columns) {
      f.columns.forEach(c => dynamicColsSet.add(c));
    }
    if (f.data) {
      Object.keys(f.data).forEach(k => dynamicColsSet.add(k));
    }
  });

  // Filter out any duplicated name or avatar columns from dynamic set
  const dynamicCols = Array.from(dynamicColsSet).filter(
    c => !['name', 'farmer name', 'full name', 'hming', 'avatar', 'photo'].includes(c.toLowerCase().trim())
  );

  // Clean structured headers: Sl No, Farmer Name, followed by all uploaded attributes
  const headers = ['Sl No', 'Farmer Name', ...dynamicCols];

  const rows = farmers.map((farmer, idx) => {
    const row: (string | number | boolean)[] = [
      idx + 1,
      farmer.fullName || ''
    ];

    dynamicCols.forEach(col => {
      const val = farmer.data ? farmer.data[col] : '';
      row.push(val !== undefined && val !== null ? val : '');
    });

    return row;
  });

  const wsData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  worksheet['!cols'] = headers.map((h, i) => {
    if (i === 0) return { wch: 8 };
    if (i === 1) return { wch: 26 };
    return { wch: Math.max(h.length + 4, 18) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Farmer Registry');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Farmer_Registry_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
