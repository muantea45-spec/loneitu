import * as XLSX from 'xlsx';
import type { FarmerRecord } from '../types/farmer';
import { CORE_FARMER_FIELDS } from '../types/farmer';

export interface ParseResult {
  records: FarmerRecord[];
  errors: { row: number; reason: string }[];
  totalRows: number;
  detectedHeaders: string[];
  dynamicHeaders: string[];
}

// Normalized lookup map for standard field headers
const HEADER_SYNONYMS: Record<string, keyof FarmerRecord> = {
  // Identity
  'farmer id': 'farmerId',
  'farmerid': 'farmerId',
  'registration id': 'farmerId',
  'reg id': 'farmerId',
  'id': 'farmerId',

  'full name': 'fullName',
  'fullname': 'fullName',
  'name': 'fullName',
  'farmer name': 'fullName',
  'hming': 'fullName',

  'phone': 'phone',
  'contact': 'phone',
  'mobile': 'phone',
  'phone number': 'phone',
  'contact number': 'phone',
  'biakpawhna': 'phone',

  'gender': 'gender',
  'sex': 'gender',

  'age': 'age',
  'kum': 'age',
  'dob': 'age',

  // Location
  'village': 'village',
  'locality': 'village',
  'address': 'village',
  'khua': 'village',
  'veng': 'village',

  'district': 'district',

  'state': 'state',

  'aadhaar': 'aadhaarNumber',
  'aadhaar number': 'aadhaarNumber',
  'aadhaar no': 'aadhaarNumber',
  'id proof': 'aadhaarNumber',

  // Agriculture
  'land size': 'landSizeAcre',
  'land size (acre)': 'landSizeAcre',
  'land size (acres)': 'landSizeAcre',
  'land size acre': 'landSizeAcre',
  'acres': 'landSizeAcre',
  'area': 'landSizeAcre',
  'ram zauhzawng': 'landSizeAcre',

  'land ownership': 'landOwnership',
  'ownership': 'landOwnership',
  'land status': 'landOwnership',
  'patu': 'landOwnership',

  'farming type': 'farmingType',
  'farming practice': 'farmingType',
  'practice': 'farmingType',
  'enkawl dan': 'farmingType',

  'primary crops': 'primaryCrops',
  'main crops': 'primaryCrops',
  'crops': 'primaryCrops',
  'thlai': 'primaryCrops',
  'thlai thar': 'primaryCrops',

  'secondary crops': 'secondaryCrops',
  'intercrops': 'secondaryCrops',
  'other crops': 'secondaryCrops',

  'soil type': 'soilType',
  'soil': 'soilType',
  'leilung': 'soilType',

  'irrigation': 'irrigationSource',
  'irrigation source': 'irrigationSource',
  'water source': 'irrigationSource',
  'tui lakna': 'irrigationSource',

  // Yield & Revenue
  'annual yield': 'annualYieldKg',
  'yield (kg)': 'annualYieldKg',
  'annual yield (kg)': 'annualYieldKg',
  'yield': 'annualYieldKg',
  'kum khata tharchhuah': 'annualYieldKg',

  'annual income': 'annualIncomeInr',
  'annual income (inr)': 'annualIncomeInr',
  'revenue': 'annualIncomeInr',
  'income': 'annualIncomeInr',
  'sum lakluh': 'annualIncomeInr',

  // Bank & Financial
  'bank name': 'bankName',
  'bank': 'bankName',

  'account number': 'accountNumber',
  'account no': 'accountNumber',
  'bank account': 'accountNumber',

  'ifsc': 'ifscCode',
  'ifsc code': 'ifscCode',

  'pm-kisan': 'pmKisanEnrolled',
  'pm kisan': 'pmKisanEnrolled',
  'pm-kisan enrolled': 'pmKisanEnrolled',
  'pm kisan status': 'pmKisanEnrolled',

  // Profile & Meta
  'avatar': 'avatar',
  'photo': 'avatar',
  'image': 'avatar',
  'profile picture': 'avatar',

  'status': 'status',
  'registration date': 'registrationDate',
  'reg date': 'registrationDate',
  'date': 'registrationDate',
  'notes': 'notes',
  'remarks': 'notes'
};

const normalizeHeader = (raw: string): string => {
  return raw
    .toLowerCase()
    .replace(/[_\-.]+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
};

/**
 * Parses an Excel (.xlsx, .xls) or CSV File into structured FarmerRecord objects.
 * Core 22 fields are mapped, while unknown columns are dynamically stored in `customAttributes`.
 */
export async function parseExcelToFarmers(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Spreadsheet contains no sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  // Read rows as array of arrays
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawRows.length < 2) {
    throw new Error('Spreadsheet must contain a header row and at least one data row.');
  }

  const rawHeaders = rawRows[0].map(h => String(h || '').trim());
  const detectedHeaders = rawHeaders.filter(Boolean);
  const dynamicHeaders: string[] = [];

  // Build column index to field mapping
  const colMapping: { index: number; target: keyof FarmerRecord | 'custom'; customKey?: string }[] = [];

  rawHeaders.forEach((header, index) => {
    if (!header) return;
    const normalized = normalizeHeader(header);
    const matchedField = HEADER_SYNONYMS[normalized];

    if (matchedField) {
      colMapping.push({ index, target: matchedField });
    } else {
      colMapping.push({ index, target: 'custom', customKey: header });
      if (!dynamicHeaders.includes(header)) {
        dynamicHeaders.push(header);
      }
    }
  });

  const records: FarmerRecord[] = [];
  const errors: { row: number; reason: string }[] = [];
  const defaultAvatars = [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'
  ];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    // Skip completely empty rows
    if (!row || row.every(c => c === '' || c === undefined || c === null)) {
      continue;
    }

    const rowNum = r + 1; // 1-based index in Excel
    const partialRecord: Partial<FarmerRecord> = {
      customAttributes: {}
    };

    colMapping.forEach(mapping => {
      const rawVal = row[mapping.index];
      if (rawVal === undefined || rawVal === null || rawVal === '') return;

      if (mapping.target === 'custom' && mapping.customKey) {
        if (!partialRecord.customAttributes) partialRecord.customAttributes = {};
        partialRecord.customAttributes[mapping.customKey] = String(rawVal).trim();
      } else {
        const key = mapping.target as keyof FarmerRecord;

        if (key === 'landSizeAcre' || key === 'annualYieldKg') {
          const num = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal).replace(/[^0-9.]/g, ''));
          (partialRecord as any)[key] = isNaN(num) ? String(rawVal).trim() : num;
        } else if (key === 'registrationDate') {
          if (rawVal instanceof Date) {
            partialRecord.registrationDate = rawVal.toISOString().split('T')[0];
          } else {
            partialRecord.registrationDate = String(rawVal).trim();
          }
        } else {
          (partialRecord as any)[key] = String(rawVal).trim();
        }
      }
    });

    // Validation
    if (!partialRecord.fullName || partialRecord.fullName.trim() === '') {
      errors.push({ row: rowNum, reason: 'Full Name is required but was blank or missing.' });
      continue;
    }

    const nowStr = new Date().toISOString().split('T')[0];
    const uniqueId = `farmer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const randomAvatar = defaultAvatars[records.length % defaultAvatars.length];

    const finalizedRecord: FarmerRecord = {
      id: uniqueId,
      farmerId: partialRecord.farmerId || `MZ-REG-${String(records.length + 1).padStart(3, '0')}`,
      fullName: partialRecord.fullName.trim(),
      phone: partialRecord.phone || 'N/A',
      gender: partialRecord.gender || 'Other',
      age: partialRecord.age || '',
      village: partialRecord.village || 'Mizoram',
      district: partialRecord.district || 'Champhai',
      state: partialRecord.state || 'Mizoram',
      aadhaarNumber: partialRecord.aadhaarNumber || '',
      landSizeAcre: partialRecord.landSizeAcre !== undefined ? partialRecord.landSizeAcre : 1.0,
      landOwnership: partialRecord.landOwnership || 'Owned (Patu)',
      farmingType: partialRecord.farmingType || 'Organic Farming',
      primaryCrops: partialRecord.primaryCrops || 'Mixed Crops',
      secondaryCrops: partialRecord.secondaryCrops || '',
      soilType: partialRecord.soilType || 'Loamy Mountain Soil',
      irrigationSource: partialRecord.irrigationSource || 'Rainfed & Spring',
      annualYieldKg: partialRecord.annualYieldKg !== undefined ? partialRecord.annualYieldKg : 0,
      annualIncomeInr: partialRecord.annualIncomeInr || '₹0',
      bankName: partialRecord.bankName || 'Mizoram Rural Bank',
      accountNumber: partialRecord.accountNumber || '',
      ifscCode: partialRecord.ifscCode || '',
      pmKisanEnrolled: partialRecord.pmKisanEnrolled || 'Yes',
      avatar: partialRecord.avatar || randomAvatar,
      status: partialRecord.status || 'Verified',
      registrationDate: partialRecord.registrationDate || nowStr,
      notes: partialRecord.notes || '',
      customAttributes: partialRecord.customAttributes || {}
    };

    records.push(finalizedRecord);
  }

  return {
    records,
    errors,
    totalRows: rawRows.length - 1,
    detectedHeaders,
    dynamicHeaders
  };
}

/**
 * Generates an Excel template (.xlsx) containing all 22 standard fields + sample dynamic columns.
 */
export function generateSampleFarmerExcel(): Uint8Array {
  const headers = CORE_FARMER_FIELDS.map(f => f.label);
  // Add a couple of dynamic attribute columns to showcase dynamic schema extensibility
  const fullHeaders = [...headers, 'SHG Affiliation', 'Solar Pump Installed'];

  const sampleRow1 = [
    'MZ-CH-2026-007',
    'Lalremruata Tochhawng',
    '+91 94361 55210',
    'Male',
    '44',
    'Ruantlang',
    'Champhai',
    'Mizoram',
    'XXXX-XXXX-8921',
    4.5,
    'Owned (Patu)',
    'Organic Farming',
    'Champhai Grape, Passion Fruit',
    'Assam Lemon, Ginger',
    'Red Loamy Soil, pH 5.9',
    'Perennial Mountain Stream Drip',
    7200,
    '₹4,50,000',
    'Mizoram Rural Bank',
    'XXXXXX8912',
    'SBIN0RRMRGB',
    'Yes',
    'Ruantlang Progressive Farmers SHG',
    'Yes (PM-KUSUM)'
  ];

  const sampleRow2 = [
    'MZ-SC-2026-008',
    'Lalhmingmawii Sailo',
    '+91 98625 33014',
    'Female',
    '39',
    'Chhiahtlang',
    'Serchhip',
    'Mizoram',
    'XXXX-XXXX-1143',
    3.0,
    'Owned (Patu)',
    'Natural Farming',
    'Mandarin Orange, Assam Lemon',
    'Turmeric, Black Pepper',
    'Clay Loam Humus, pH 6.1',
    'Gravity Spring Feeder Tank',
    5100,
    '₹3,80,000',
    'State Bank of India',
    'XXXXXX4401',
    'SBIN0001539',
    'Yes',
    'Chhiahtlang Women Farmers Guild',
    'In Progress'
  ];

  const wsData = [fullHeaders, sampleRow1, sampleRow2];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths for readability
  worksheet['!cols'] = fullHeaders.map(h => ({ wch: Math.max(h.length + 4, 18) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Farmer Registry Template');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(excelBuffer);
}

/**
 * Triggers a download of the sample template in browser
 */
export function downloadSampleFarmerTemplate(): void {
  const data = generateSampleFarmerExcel();
  const blob = new Blob([data.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Mizoram_Farmer_Registry_Template.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports current farmer records to an .xlsx file
 */
export function exportFarmersToExcel(farmers: FarmerRecord[]): void {
  const headers = CORE_FARMER_FIELDS.map(f => f.label);

  // Collect any custom attributes present across records
  const customKeySet = new Set<string>();
  farmers.forEach(f => {
    if (f.customAttributes) {
      Object.keys(f.customAttributes).forEach(k => customKeySet.add(k));
    }
  });
  const customKeys = Array.from(customKeySet);
  const fullHeaders = [...headers, ...customKeys];

  const rows = farmers.map(farmer => {
    const rowValues = CORE_FARMER_FIELDS.map(field => {
      const val = (farmer as any)[field.key];
      return val !== undefined && val !== null ? val : '';
    });

    customKeys.forEach(ck => {
      const customVal = farmer.customAttributes ? farmer.customAttributes[ck] : '';
      rowValues.push(customVal !== undefined && customVal !== null ? customVal : '');
    });

    return rowValues;
  });

  const wsData = [fullHeaders, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  worksheet['!cols'] = fullHeaders.map(h => ({ wch: Math.max(h.length + 3, 16) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Farmer Registry');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Loneitu_Farmer_Registry_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
