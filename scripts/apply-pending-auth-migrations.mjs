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

const migrationsDir = path.join(root, 'server', 'prisma', 'migrations');
const pending = [
  '20250518120000_profile_username',
  '20250518140000_password_reset',
];

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  for (const name of pending) {
    const sqlPath = path.join(migrationsDir, name, 'migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`Applying ${name}…`);
    await client.query(sql);
    console.log(`  OK`);
  }
  console.log('Done.');
} finally {
  await client.end();
}
