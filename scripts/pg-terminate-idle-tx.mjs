import pg from 'pg';

const c = new pg.Client({
  connectionString:
    'postgresql://postgres.njcqpzumsccmowhdpepx:7xyPTqJG4HL-3dR@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const stuck = await c.query(`
  SELECT pid, state, left(query, 80) AS query
  FROM pg_stat_activity
  WHERE datname = current_database()
    AND pid <> pg_backend_pid()
    AND state LIKE 'idle in transaction%'
`);
console.log('Terminating', stuck.rows.length, 'sessions');
for (const row of stuck.rows) {
  await c.query('SELECT pg_terminate_backend($1)', [row.pid]);
  console.log('terminated', row.pid, row.state, row.query);
}
await c.end();
console.log('Done');
