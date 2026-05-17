import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'client/public/product-images');

/** slug → [title, gradient stops] */
const products = {
  'gophone-x': ['GoPhone X', ['#1e3a5f', '#2563eb', '#60a5fa']],
  'probook-15': ['ProBook 15', ['#334155', '#64748b', '#94a3b8']],
  'soundwave-pro': ['SoundWave Pro', ['#4c1d95', '#7c3aed', '#a78bfa']],
  'fittrack-2': ['FitTrack 2', ['#14532d', '#16a34a', '#4ade80']],
  'tabair-11': ['TabAir 11', ['#0e7490', '#0891b2', '#67e8f9']],
  'brewmaster': ['BrewMaster', ['#78350f', '#b45309', '#fbbf24']],
  'basic-cotton-tee': ['Basic Cotton', ['#9f1239', '#e11d48', '#fda4af']],
  'urban-wind-jacket': ['Urban Wind', ['#1e293b', '#334155', '#64748b']],
  'street-run-sneakers': ['Street Run', ['#c2410c', '#ea580c', '#fb923c']],
  'city-pack-25': ['City Pack 25L', ['#115e59', '#0d9488', '#5eead4']],
};

function svg(title, stops, variant) {
  const [c1, c2, c3] = stops;
  const offset = variant * 8;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="${45 + offset}%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#g)"/>
  <circle cx="680" cy="120" r="140" fill="white" fill-opacity="0.08"/>
  <circle cx="120" cy="880" r="200" fill="white" fill-opacity="0.06"/>
  <text x="400" y="470" text-anchor="middle" fill="white" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="42" font-weight="700">${title}</text>
  <text x="400" y="530" text-anchor="middle" fill="white" fill-opacity="0.85" font-family="system-ui,sans-serif" font-size="22">GoShopix</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });

for (const [slug, [title, stops]] of Object.entries(products)) {
  const count = slug === 'gophone-x' || slug === 'urban-wind-jacket' || slug === 'street-run-sneakers' ? 4 : 3;
  for (let n = 1; n <= count; n++) {
    const file = path.join(outDir, `${slug}-${n}.svg`);
    await writeFile(file, svg(title, stops, n), 'utf8');
  }
}

console.log(`Generated product images in ${outDir}`);
