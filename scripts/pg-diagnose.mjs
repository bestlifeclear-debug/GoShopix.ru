import pg from 'pg';

const c = new pg.Client({
  connectionString:
    'postgresql://postgres.njcqpzumsccmowhdpepx:7xyPTqJG4HL-3dR@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const users = await c.query('SELECT id, email FROM users LIMIT 5');
console.log('users', users.rows);
const locks = await c.query(`
  SELECT pid, state, query, wait_event_type, wait_event
  FROM pg_stat_activity
  WHERE datname = current_database() AND pid <> pg_backend_pid()
`);
console.log('activity', locks.rows);
await c.end();
