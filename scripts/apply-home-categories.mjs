/**
 * Вставка демо-категорий для главной (без prisma migrate).
 * Запуск с production DATABASE_URL в .env:
 *   npm run db:apply-home-categories
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sqlPath = path.join(
  root,
  'server',
  'prisma',
  'migrations',
  '20250523120000_home_page_categories',
  'migration.sql',
);
const sql = fs.readFileSync(sqlPath, 'utf8');

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  console.log('Applying home page categories…');
  await client.query(sql);
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS n FROM categories WHERE "parentId" IS NULL`,
  );
  console.log(`Done. Root categories in DB: ${rows[0].n}`);
} finally {
  await client.end();
}
