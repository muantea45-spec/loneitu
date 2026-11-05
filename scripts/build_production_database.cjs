const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 1. Load compiled initial data
const init = require('../temp_build/data/initialData.js');

// 2. Load aboutData from step 6609 snapshot
const aboutDataRaw = fs.readFileSync('C:/Users/muant/.gemini/antigravity/brain/9b4cf6a5-ece1-4c8b-ab5a-dca12cec46c6/.system_generated/steps/6609/output.txt', 'utf-8');
const jsonMatch = aboutDataRaw.substring(aboutDataRaw.indexOf('{'));
const aboutData = JSON.parse(jsonMatch);

// Update Staff Card Views in aboutData
aboutData.customCardsSection = {
  enabled: true,
  tag: 'Staff & Team Specialists',
  title: 'Staff & Specialists of the Firm',
  subtitle: 'The dedicated agronomists, researchers, officers, and field specialists of the firm.',
  cards: [
    {
      id: 'card-1793872877251',
      name: 'Dr. C. Lalhriatpuia',
      designation: 'Project Director',
      portfolio: 'Agriculture & Horticulture',
      qualification: 'Ph.D.',
      experience: 'More than 10 years of field work experience with several published research papers. Awarded Appreciation Certificates by the Minister of Horticulture, Government of Mizoram, Minister of State, Adviser to Chief Minister, and MLA. Extensive work experience under NABARD.',
      avatar: 'https://i.postimg.cc/Z5rVXKSy/Hriata.png',
      title: 'Dr. C. Lalhriatpuia',
      image: 'https://i.postimg.cc/Z5rVXKSy/Hriata.png',
      columnValues: {
        'col-location': 'Project Director',
        'col-contact': 'Agriculture & Horticulture',
        'col-status': 'Ph.D.',
        'col-1793872810199': 'More than 10 years of field work experience with several published research papers. Awarded Appreciation Certificates by the Minister of Horticulture, Government of Mizoram, Minister of State, Adviser to Chief Minister, and MLA. Extensive work experience under NABARD.'
      }
    },
    {
      id: 'card-1',
      name: 'Dr. C. Lalremruata',
      designation: 'Senior Soil & Agronomy Specialist',
      portfolio: 'Microbial Inoculants & Soil Health',
      qualification: 'Ph.D. Soil Science',
      experience: 'Oversees high-altitude soil profiling, microbial fungal inoculants, and cold-climate grape vineyard monitoring across Mizoram.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      title: 'Dr. C. Lalremruata',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      columnValues: {
        'col-location': 'Senior Soil & Agronomy Specialist',
        'col-contact': 'Microbial Inoculants & Soil Health',
        'col-status': 'Ph.D. Soil Science',
        'col-1793872810199': 'Oversees high-altitude soil profiling, microbial fungal inoculants, and cold-climate grape vineyard monitoring across Mizoram.'
      }
    },
    {
      id: 'card-2',
      name: 'Pi Lalhmingmawii Vance',
      designation: 'Principal Horticultural Investigator',
      portfolio: 'Citrus & Dragon Fruit Canopy',
      qualification: 'M.Sc. Horticulture',
      experience: 'Specializes in tropical fruit canopy pruning, dragon fruit trellis architectures, and Assam lemon disease-free rootstocks.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      title: 'Pi Lalhmingmawii Vance',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      columnValues: {
        'col-location': 'Principal Horticultural Investigator',
        'col-contact': 'Citrus & Dragon Fruit Canopy',
        'col-status': 'M.Sc. Horticulture',
        'col-1793872810199': 'Specializes in tropical fruit canopy pruning, dragon fruit trellis architectures, and Assam lemon disease-free rootstocks.'
      }
    },
    {
      id: 'card-3',
      name: 'Pu R. Lalhmachhuana',
      designation: 'Organic Input & Composting Officer',
      portfolio: 'Bio-fertilizer & Certification',
      qualification: 'B.Sc. Agriculture',
      experience: 'Leads farmer participatory bio-fertilizer formulations, vermicomposting clusters, and community organic certification.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      title: 'Pu R. Lalhmachhuana',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      columnValues: {
        'col-location': 'Organic Input & Composting Officer',
        'col-contact': 'Bio-fertilizer & Certification',
        'col-status': 'B.Sc. Agriculture',
        'col-1793872810199': 'Leads farmer participatory bio-fertilizer formulations, vermicomposting clusters, and community organic certification.'
      }
    }
  ]
};

// 3. Authors
const authors = [
  {
    id: 'auth-3',
    name: 'Dr. C. Lalhriatpuia',
    role: 'Agri and Allied',
    avatar: 'https://i.postimg.cc/Z5rVXKSy/Hriata.png',
    bio: 'Kum tam tak experience neih tawh',
    institution: 'ATMA Project Director'
  }
];

// 4. Parse 3,173 Farmers
console.log('Parsing 3,173 farmers...');
const files = [
  'C:/Users/muant/Desktop/NF 2025-26 Champhai block.csv',
  'C:/Users/muant/Desktop/NF 2025-26 Khawbung block.csv',
  'C:/Users/muant/Desktop/NF 2026-27 Champhai block.csv',
];

const farmers = [];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const wb = XLSX.readFile(f);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headers = rawRows[0].map(h => String(h || '').trim()).filter(Boolean);
  let nameIdx = rawRows[0].findIndex(h => /name/i.test(String(h || '')));
  if (nameIdx === -1) nameIdx = 1;

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.every(c => c === '')) continue;
    const name = String(row[nameIdx] || '').trim();
    if (!name) continue;
    const data = {};
    rawRows[0].forEach((h, i) => { if (h && row[i] !== '') data[String(h).trim()] = row[i]; });
    farmers.push({
      id: `farmer-${farmers.length}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: name,
      avatar: '',
      registrationDate: '2026-04-01',
      status: 'Verified',
      columns: headers,
      data
    });
  }
}

// Add the 125 from Excel Sheet 1
const excel = 'C:/Users/muant/Desktop/Farmers List_NMNF 2026-2027.xlsx';
if (fs.existsSync(excel)) {
  const wb = XLSX.readFile(excel);
  const sheet = wb.Sheets[wb.SheetNames[0]]; // 'New Chalrang -II'
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headers = rawRows[0].map(h => String(h || '').trim()).filter(Boolean);
  let nameIdx = rawRows[0].findIndex(h => /name/i.test(String(h || '')));
  if (nameIdx === -1) nameIdx = 1;

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.every(c => c === '')) continue;
    const name = String(row[nameIdx] || '').trim();
    if (!name) continue;
    const data = {};
    rawRows[0].forEach((h, i) => { if (h && row[i] !== '') data[String(h).trim()] = row[i]; });
    farmers.push({
      id: `farmer-${farmers.length}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: name,
      avatar: '',
      registrationDate: '2026-04-01',
      status: 'Verified',
      columns: headers,
      data
    });
  }
}

console.log(`Total farmers assembled: ${farmers.length}`);

// 5. Complete Database Object
const dbPayload = {
  authorizedEmails: [
    'muantea45@gmail.com',
    'hriata@live.com',
    'hriata.cherput@gmail.com'
  ],
  primaryOwnerEmail: 'hriata.cherput@gmail.com',
  adminSecurityKey: 'agri2026',
  articles: init.INITIAL_ARTICLES,
  categories: init.INITIAL_CATEGORIES,
  tags: init.INITIAL_TAGS,
  authors: authors,
  aboutData: aboutData,
  footerData: init.INITIAL_FOOTER_DATA,
  farmers: farmers,
  farmerCustomFields: [],
  updatedAt: new Date().toISOString()
};

const outPath = path.resolve('./scripts/production_db.json');
fs.writeFileSync(outPath, JSON.stringify(dbPayload));
console.log(`Saved production database to ${outPath} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);

