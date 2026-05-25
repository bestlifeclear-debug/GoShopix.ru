import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

process.chdir(path.join(root, 'server'));
const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

try {
  const rows = await prisma.order.findMany({ take: 1, include: { items: true, history: true } });
  console.log('prisma.order.findMany OK, rows:', rows.length);
} catch (e) {
  console.error('prisma.order.findMany FAILED:', e.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
