export interface FarmerFieldDefinition {
  key: string;
  label: string;
}

export interface FarmerRecord {
  id: string; // Unique internal record ID
  fullName: string; // Farmer full name
  avatar: string; // Profile picture URL or fallback
  registrationDate?: string;
  status?: string;
  // All columns and values from the uploaded spreadsheet:
  // e.g. { "Father's Name": "Lalzirliana", "Village": "Khawzawl", "Contact": "9862..." }
  data: Record<string, string | number | boolean>;
  // Original column headers preserved in order as uploaded
  columns?: string[];
}
