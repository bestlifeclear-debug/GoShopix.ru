import pg from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

const c = new pg.Client({
  connectionString:
    'postgresql://postgres.njcqpzumsccmowhdpepx:7xyPTqJG4HL-3dR@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  statement_timeout: 120_000,
});
await c.connect();
const id = randomUUID();
const hash = await bcrypt.hash('password123', 4);
const now = new Date();
console.log('inserting...');
await c.query(
  `INSERT INTO users (id, email, "passwordHash", role, "createdAt", "updatedAt")
   VALUES ($1, $2, $3, $4::"UserRole", $5, $5)`,
  [id, 'customer@goshopix.ru', hash, 'CUSTOMER', now],
);
console.log('inserted', id);
await c.end();
