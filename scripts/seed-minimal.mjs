import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, 'server', '.env') });

const prisma = new PrismaClient();
const hash = await bcrypt.hash('password123', 10);
console.log('creating user...');
let u = await prisma.user.create({
  data: {
    email: 'customer@goshopix.ru',
    passwordHash: hash,
    role: 'CUSTOMER',
  },
});
console.log('flat create ok', u.id);
u = await prisma.user.update({
  where: { id: u.id },
  data: { profile: { create: { firstName: 'Test' } } },
});
console.log('created', u.email);
await prisma.$disconnect();
