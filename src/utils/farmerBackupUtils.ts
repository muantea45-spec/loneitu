import type { FarmerRecord, FarmerFieldDefinition } from '../types/farmer';

export interface FarmerRegistryBackup {
  format: 'loneitu_farmer_registry_backup';
  version: number;
  exportedAt: string;
  totalRecords: number;
  columns: string[];
  farmerCustomFields: FarmerFieldDefinition[];
  farmers: FarmerRecord[];
}

/**
 * Downloads a complete JSON snapshot of the Farmer Registry
 */
export function downloadFarmerBackup(
  farmers: FarmerRecord[],
  customFields: FarmerFieldDefinition[] = [],
  activeColumns: string[] = []
): void {
  const backup: FarmerRegistryBackup = {
    format: 'loneitu_farmer_registry_backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    totalRecords: farmers.length,
    columns: activeColumns,
    farmerCustomFields: customFields,
    farmers
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Farmer_Registry_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses and validates an uploaded backup file (.json)
 */
export async function parseFarmerBackupFile(file: File): Promise<{
  farmers: FarmerRecord[];
  farmerCustomFields: FarmerFieldDefinition[];
  totalRecords: number;
}> {
  const text = await file.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }

  // Format 1: Dedicated Farmer Registry backup
  if (json.farmers && Array.isArray(json.farmers)) {
    return {
      farmers: json.farmers,
      farmerCustomFields: json.farmerCustomFields || [],
      totalRecords: json.farmers.length
    };
  }

  // Format 2: Full Loneitu system backup containing data.farmers
  if (json.data && Array.isArray(json.data.farmers)) {
    return {
      farmers: json.data.farmers,
      farmerCustomFields: json.data.farmerCustomFields || [],
      totalRecords: json.data.farmers.length
    };
  }

  // Format 3: Raw array of farmer records
  if (Array.isArray(json)) {
    return {
      farmers: json,
      farmerCustomFields: [],
      totalRecords: json.length
    };
  }

  throw new Error('Unrecognized backup structure. File does not contain valid farmer records.');
}
