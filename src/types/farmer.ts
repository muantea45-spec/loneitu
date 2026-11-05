export type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export interface FarmerFieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  category?: 'identity' | 'location' | 'agriculture' | 'financial' | 'custom';
}

export interface FarmerRecord {
  id: string; // Unique internal ID
  farmerId: string; // Official ID e.g. "MZ-CH-2026-001"
  fullName: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  age?: number | string;
  village: string;
  district: string;
  state: string;
  aadhaarNumber?: string;
  landSizeAcre: number | string;
  landOwnership: string; // Owned (Patu), Leased, Community, Joint
  farmingType: string; // Organic, Regenerative, Natural, Jhum, Integrated
  primaryCrops: string; // e.g. "Grape (Chawnpui), Ginger, Assam Lemon"
  secondaryCrops?: string;
  soilType?: string;
  irrigationSource?: string;
  annualYieldKg?: number | string;
  annualIncomeInr?: number | string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  pmKisanEnrolled?: 'Yes' | 'No' | 'In Progress' | string;
  avatar: string; // Profile photo URL
  status: 'Verified' | 'Active' | 'Pending Review' | string;
  registrationDate: string;
  notes?: string;
  customAttributes?: Record<string, string | number | boolean>; // Dynamic schema extension
}

// Pre-configured 22 standard fields definition
export const CORE_FARMER_FIELDS: FarmerFieldDefinition[] = [
  // 1-5: Identity
  { key: 'farmerId', label: 'Farmer Registry ID', type: 'text', required: true, category: 'identity', placeholder: 'e.g. MZ-CH-001' },
  { key: 'fullName', label: 'Full Name', type: 'text', required: true, category: 'identity', placeholder: 'e.g. Lalbiakthanga Fanai' },
  { key: 'phone', label: 'Contact Number', type: 'text', required: true, category: 'identity', placeholder: '+91 98623 45678' },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], category: 'identity' },
  { key: 'age', label: 'Age / DOB', type: 'text', category: 'identity', placeholder: 'e.g. 46' },

  // 6-8: Location
  { key: 'village', label: 'Village / Locality', type: 'text', required: true, category: 'location', placeholder: 'e.g. Hnahlan' },
  { key: 'district', label: 'District', type: 'select', options: ['Champhai', 'Aizawl', 'Serchhip', 'Kolasib', 'Mamit', 'Lunglei', 'Siaha', 'Lawngtlai', 'Hnahthial', 'Khawzawl', 'Saitual'], category: 'location' },
  { key: 'state', label: 'State', type: 'text', category: 'location', placeholder: 'Mizoram' },

  // 9: ID Reference
  { key: 'aadhaarNumber', label: 'Aadhaar / ID Proof', type: 'text', category: 'identity', placeholder: 'XXXX-XXXX-1234' },

  // 10-16: Agricultural Profile
  { key: 'landSizeAcre', label: 'Total Land Size (Acres)', type: 'number', required: true, category: 'agriculture', placeholder: 'e.g. 4.5' },
  { key: 'landOwnership', label: 'Land Ownership Status', type: 'select', options: ['Owned (Patu)', 'Leased / Rented', 'Community Land', 'Joint Family'], category: 'agriculture' },
  { key: 'farmingType', label: 'Farming Practice', type: 'select', options: ['Organic Farming', 'Regenerative Agriculture', 'Natural Farming', 'Jhum / Shifting', 'Integrated Agri-Horti'], category: 'agriculture' },
  { key: 'primaryCrops', label: 'Primary Crops Cultivated', type: 'text', required: true, category: 'agriculture', placeholder: 'e.g. Grape, Ginger, Assam Lemon' },
  { key: 'secondaryCrops', label: 'Secondary / Inter-crops', type: 'text', category: 'agriculture', placeholder: 'e.g. Chilli, Turmeric, Mustard' },
  { key: 'soilType', label: 'Soil Type & Condition', type: 'text', category: 'agriculture', placeholder: 'e.g. Red Sandy Loam, pH 5.6' },
  { key: 'irrigationSource', label: 'Irrigation & Water Source', type: 'text', category: 'agriculture', placeholder: 'e.g. Smart Drip, Rainwater Harvest Pond' },

  // 17-18: Yield & Revenue
  { key: 'annualYieldKg', label: 'Estimated Annual Yield (Kg)', type: 'number', category: 'agriculture', placeholder: 'e.g. 6800' },
  { key: 'annualIncomeInr', label: 'Annual Farm Revenue (₹)', type: 'text', category: 'financial', placeholder: 'e.g. ₹4,20,000' },

  // 19-21: Bank & Financial
  { key: 'bankName', label: 'Bank Name', type: 'text', category: 'financial', placeholder: 'e.g. Mizoram Rural Bank' },
  { key: 'accountNumber', label: 'Bank Account Number', type: 'text', category: 'financial', placeholder: 'e.g. XXXXXX4920' },
  { key: 'ifscCode', label: 'IFSC Code', type: 'text', category: 'financial', placeholder: 'e.g. SBIN0RRMRGB' },

  // 22: Government Scheme
  { key: 'pmKisanEnrolled', label: 'PM-Kisan Scheme Enrolled', type: 'select', options: ['Yes', 'No', 'In Progress'], category: 'financial' },
];
