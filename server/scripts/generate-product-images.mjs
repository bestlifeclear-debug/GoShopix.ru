import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'client/public/product-images');

/** Variant C: единое семейство коралла, лёгкая вариация среднего stop */
const BRAND_STOPS = ['#ff7a6b', '#ff6b5c', '#ff4d3d'];

/** slug → [title, middleStop tweak] */
const products = {
  'gophone-x': ['GoPhone X', '#ff6555'],
  'probook-15': ['ProBook 15', '#ff6f60'],
  'soundwave-pro': ['SoundWave Pro', '#ff6858'],
  'fittrack-2': ['FitTrack 2', '#ff725f'],
  'tabair-11': ['TabAir 11', '#ff6d5e'],
  'brewmaster': ['BrewMaster', '#ff705c'],
  'basic-cotton-tee': ['Basic Cotton', '#ff6454'],
  'urban-wind-jacket': ['Urban Wind', '#ff6a5b'],
  'street-run-sneakers': ['Street Run', '#ff6759'],
  'city-pack-25': ['City Pack 25L', '#ff6e5d'],
};

function svg(title, middle, variant) {
  const [c1, , c3] = BRAND_STOPS;
  const offset = variant * 6;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="${45 + offset}%" stop-color="${middle}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#g)"/>
  <circle cx="680" cy="120" r="140" fill="white" fill-opacity="0.1"/>
  <circle cx="120" cy="880" r="200" fill="white" fill-opacity="0.07"/>
  <text x="400" y="470" text-anchor="middle" fill="white" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="42" font-weight="700">${title}</text>
  <text x="400" y="530" text-anchor="middle" fill="white" fill-opacity="0.9" font-family="system-ui,sans-serif" font-size="22">GoShopix</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });

for (const [slug, [title, middle]] of Object.entries(products)) {
  const count = slug === 'gophone-x' || slug === 'urban-wind-jacket' || slug === 'street-run-sneakers' ? 4 : 3;
  for (let n = 1; n <= count; n++) {
    const file = path.join(outDir, `${slug}-${n}.svg`);
    await writeFile(file, svg(title, middle, n), 'utf8');
  }
}

console.log(`Generated product images in ${outDir}`);
