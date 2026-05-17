import pg from 'pg';

const c = new pg.Client({
  connectionString:
    'postgresql://postgres.njcqpzumsccmowhdpepx:7xyPTqJG4HL-3dR@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});
await c.connect();
await c.query(`
  TRUNCATE TABLE
    favorites, order_status_history, order_items, orders,
    cart_items, carts, product_images, store_images,
    variant_attributes, product_attribute_values, product_variants,
    products, product_attributes, categories, stores, sellers,
    sessions, profiles, users, background_jobs, notifications,
    user_notification_settings, webhook_subscriptions
  RESTART IDENTITY CASCADE
`);
await c.end();
console.log('All tables truncated');
