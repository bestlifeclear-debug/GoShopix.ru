import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
try {
  const cols = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'orders' ORDER BY column_name`,
  );
  console.log('orders columns:', cols.rows.map((r) => r.column_name).join(', '));

  const pending = await client.query(
    `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NULL`,
  );
  console.log('pending migrations:', pending.rows.length ? pending.rows : 'none');

  const count = await client.query(`SELECT COUNT(*)::int AS n FROM orders`);
  console.log('orders count:', count.rows[0].n);
} finally {
  await client.end();
}
