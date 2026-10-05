const fs = require('fs');
const path = require('path');
const docsSections = require('../src/app/docs/sections.json');

const domains = [
  'https://toonkit.js.org',
  'https://toonkit.manojgowda.in',
];

const pages = [
  '',
  '/docs',
  ...docsSections.map(({ slug }) => `/docs/${slug}`),
  '/playground',
  '/api-simulator',
  '/developer',
  '/examples',
  '/seo',
  '/seo/toon-javascript-toolkit',
  '/seo/toon-lightweight-utilities',
  '/seo/toon-frontend-backend-workflows',
  '/seo/toon-scalable-javascript-tools',
  '/seo/toon-open-source-toolkit',
  '/seo/toon-reusable-helper-functions',
  '/seo/toon-performance-utilities',
  '/seo/toon-modern-framework-support',
  '/seo/toon-developer-ecosystem',
  '/seo/toon-fast-scalable-utilities',
];

function buildEntries() {
  const now = new Date().toISOString();
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const domain of domains) {
    for (const page of pages) {
      lines.push('  <url>');
      lines.push(`    <loc>${domain}${page}</loc>`);
      lines.push(`    <lastmod>${now}</lastmod>`);
      lines.push('  </url>');
    }
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

function buildRobots() {
  const lines = [];
  lines.push('User-agent: *');
  lines.push('Allow: /');
  lines.push('');
  for (const domain of domains) {
    lines.push(`Sitemap: ${domain}/sitemap.xml`);
  }
  return lines.join('\n');
}

function writeFile(relativePath, contents) {
  const outPath = path.join(__dirname, '..', 'public', relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, contents, 'utf8');
  console.log(`Wrote ${outPath}`);
}

try {
  const sitemap = buildEntries();
  writeFile('sitemap.xml', sitemap);

  const robots = buildRobots();
  writeFile('robots.txt', robots);

  console.log('Sitemap and robots generated successfully.');
} catch (err) {
  console.error('Failed to generate sitemap/robots:', err);
  process.exit(1);
}
