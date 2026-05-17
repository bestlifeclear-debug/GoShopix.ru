/**
 * Загружает .env из корня монорепо и из server/ (npm run dev -w server
 * запускается с cwd=server, стандартный dotenv/config не видит корневой .env).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const serverSrcDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(serverSrcDir, '..');
const monorepoRoot = path.resolve(serverRoot, '..');

const envFiles = [
  path.join(monorepoRoot, '.env'),
  path.join(monorepoRoot, '.env.local'),
  path.join(serverRoot, '.env'),
  path.join(serverRoot, '.env.local'),
];

for (const file of envFiles) {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file });
  }
}
