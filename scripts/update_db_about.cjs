const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'production_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.aboutData.customCardsSection = {
  enabled: true,
  tag: 'Staff & Team Specialists',
  title: 'Staff & Specialists of the Firm',
  subtitle: 'The dedicated agronomists, researchers, officers, and field specialists of the firm.',
  columns: [
    { id: 'col-location', name: 'DESIGNATION', type: 'text' },
    { id: 'col-contact', name: 'PORTFOLIO', type: 'text' },
    { id: 'col-status', name: 'QUALIFICATION', type: 'text' },
    { id: 'col-1793872810199', name: 'PROFESSIONAL EXPERIENCE', type: 'text' }
  ],
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

db.updatedAt = new Date().toISOString();

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully updated production_db.json with new Staff Cards schema!');
