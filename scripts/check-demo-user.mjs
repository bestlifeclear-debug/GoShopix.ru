import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const u = await client.query(
  `SELECT u.id, u.email, p.name, p.phone FROM users u
   LEFT JOIN profiles p ON p."userId" = u.id
   WHERE u.email = $1`,
  ['customer@goshopix.ru'],
);
console.log('demo user:', u.rows[0] ?? 'NOT FOUND');
await client.end();
