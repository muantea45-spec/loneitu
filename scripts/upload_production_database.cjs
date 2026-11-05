const fs = require('fs');
const path = require('path');

async function main() {
  const dbPath = path.resolve('./scripts/production_db.json');
  console.log('Reading production_db.json...');
  const jsonContent = fs.readFileSync(dbPath, 'utf-8');
  const payload = JSON.parse(jsonContent);

  console.log(`Database summary:
  - Articles: ${payload.articles.length}
  - Categories: ${payload.categories.length}
  - Tags: ${payload.tags.length}
  - Authors: ${payload.authors.length}
  - Farmers: ${payload.farmers.length}
  - Staff Section: "${payload.aboutData.customCardsSection.title}" with ${payload.aboutData.customCardsSection.cards.length} cards
  - Authorized Emails: ${payload.authorizedEmails.join(', ')}
  - Primary Owner: ${payload.primaryOwnerEmail}
  - Updated At: ${payload.updatedAt}
  `);

  const endpoints = [
    'https://loneitu.ddvktp.workers.dev/api/db',
    'https://loneitu-cbe.pages.dev/api/db'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Pushing to ${endpoint}...`);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': 'agri2026',
          'X-Admin-Email': 'muantea45@gmail.com'
        },
        body: jsonContent
      });
      const data = await res.json();
      console.log(`Response from ${endpoint}:`, data.success ? 'SUCCESS' : data);
    } catch (err) {
      console.error(`Error pushing to ${endpoint}:`, err.message);
    }
  }
}

main();

