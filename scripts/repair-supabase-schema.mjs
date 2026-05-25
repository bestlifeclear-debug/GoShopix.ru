/**
 * Идемпотентное выравнивание схемы Supabase с Prisma (drift после частичных миграций).
 */
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const repairs = [
  {
    name: 'orders.paymentMethod',
    sql: `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT`,
  },
  {
    name: 'order_status_history.reason',
    sql: `ALTER TABLE "order_status_history" ADD COLUMN IF NOT EXISTS "reason" TEXT`,
  },
  {
    name: 'order_status_history.actorRole',
    sql: `DO $$ BEGIN
      CREATE TYPE "StatusActorRole" AS ENUM ('CUSTOMER', 'SELLER', 'ADMIN', 'SYSTEM');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    ALTER TABLE "order_status_history" ADD COLUMN IF NOT EXISTS "actorRole" "StatusActorRole"`,
  },
];

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  for (const step of repairs) {
    await client.query(step.sql);
    console.log(`OK: ${step.name}`);
  }

  const cols = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'orders' ORDER BY column_name`,
  );
  console.log('orders columns:', cols.rows.map((r) => r.column_name).join(', '));
} finally {
  await client.end();
}
