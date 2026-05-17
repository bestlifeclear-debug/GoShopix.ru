/**
 * Применяет Prisma-миграции к Supabase (session pooler, IPv4).
 * Используется, если `prisma migrate deploy` падает с P1017 на Windows.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, 'server', '.env') });

const conn = process.env.DIRECT_URL?.replace(/[?&]sslmode=[^&]+/g, '');
if (!conn) {
  console.error('Set DIRECT_URL in server/.env');
  process.exit(1);
}

const migrationsDir = path.join(root, 'server', 'prisma', 'migrations');
const dirs = fs
  .readdirSync(migrationsDir)
  .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory())
  .sort();

async function apply(name) {
  const client = new pg.Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 60_000,
    query_timeout: 600_000,
  });
  await client.connect();
  const sql = fs.readFileSync(path.join(migrationsDir, name, 'migration.sql'), 'utf8');
  console.log(`Applying ${name}...`);
  await client.query(sql);
  await client.end();
  console.log(`Done ${name}`);
}

async function listTables() {
  const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const r = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1`,
  );
  await client.end();
  return r.rows.map((x) => x.tablename);
}

const only = process.argv.slice(2);
const toRun = only.length ? dirs.filter((d) => only.includes(d)) : dirs;

console.log('Migrations:', toRun.join(', '));
for (const d of toRun) {
  await apply(d);
}
console.log('Tables:', (await listTables()).join(', '));
