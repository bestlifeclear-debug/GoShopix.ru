/**
 * Applies passwordless auth migration on DBs without Prisma migrate history
 * (staging Supabase). Also baselines _prisma_migrations when missing.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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
const PASSWORDLESS = '20250522150000_passwordless_auth';

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

function checksum(sql) {
  return crypto.createHash('sha256').update(sql).digest('hex');
}

async function hasColumn(table, column) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column],
  );
  return r.rowCount > 0;
}

async function ensureMigrationsTable() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) NOT NULL PRIMARY KEY,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);
}

async function markMigrationApplied(name) {
  const sqlPath = path.join(migrationsDir, name, 'migration.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const exists = await client.query(
    `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1`,
    [name],
  );
  if (exists.rowCount > 0) return;
  await client.query(
    `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, applied_steps_count)
     VALUES ($1, $2, NOW(), $3, NULL, 1)`,
    [crypto.randomUUID(), checksum(sql), name],
  );
}

try {
  await ensureMigrationsTable();

  const authOtps = await client.query(`SELECT to_regclass('public.auth_otps') AS t`);
  if (authOtps.rows[0]?.t) {
    console.log('auth_otps already exists — passwordless migration likely applied.');
  } else {
    const sql = fs.readFileSync(path.join(migrationsDir, PASSWORDLESS, 'migration.sql'), 'utf8');
    console.log(`Applying ${PASSWORDLESS}…`);
    await client.query(sql);
    console.log('  SQL OK');
  }

  const dirs = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const name of dirs) {
    await markMigrationApplied(name);
  }
  console.log(`Baselined ${dirs.length} migrations in _prisma_migrations`);

  const cols = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'profiles' ORDER BY column_name`,
  );
  console.log('profiles columns:', cols.rows.map((r) => r.column_name).join(', '));

  if (!(await hasColumn('profiles', 'name'))) {
    console.error('ERROR: profiles.name missing after migration');
    process.exit(1);
  }
  if (await hasColumn('profiles', 'username')) {
    console.error('ERROR: profiles.username still present');
    process.exit(1);
  }

  console.log('Done. Schema ready for passwordless auth.');
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await client.end();
}
