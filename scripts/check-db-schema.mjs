import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  const cols = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'profiles'
     ORDER BY column_name`,
  );
  console.log('profiles columns:', cols.rows.map((r) => r.column_name).join(', '));

  const reset = await client.query(
    `SELECT to_regclass('public.password_reset_tokens') AS table_name`,
  );
  console.log('password_reset_tokens table:', reset.rows[0].table_name ?? 'MISSING');

  const migrations = await client.query(
    `SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC NULLS LAST LIMIT 10`,
  ).catch(() => ({ rows: [] }));
  console.log('recent migrations:', migrations.rows);
} finally {
  await client.end();
}
