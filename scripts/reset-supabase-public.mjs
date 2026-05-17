import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, 'server', '.env') });

const conn = process.env.DIRECT_URL?.replace(/[?&]sslmode=[^&]+/g, '');

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log('Resetting public schema...');
await client.query('DROP SCHEMA public CASCADE');
await client.query('CREATE SCHEMA public');
await client.query('GRANT ALL ON SCHEMA public TO postgres');
await client.query('GRANT ALL ON SCHEMA public TO public');
await client.end();
console.log('Done.');
