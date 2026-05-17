import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, 'server', '.env') });

const prisma = new PrismaClient();
try {
  const r = await prisma.$queryRaw`SELECT 1::int AS n`;
  console.log('Prisma OK', r);
  const count = await prisma.user.count();
  console.log('users count', count);
} catch (e) {
  console.error('Prisma FAIL', e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
