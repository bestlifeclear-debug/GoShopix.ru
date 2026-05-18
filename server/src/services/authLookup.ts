import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { normalizePhone, phonesMatch } from '../lib/phone.js';

const userWithProfile = { include: { profile: true } } as const;
export type UserWithProfile = Prisma.UserGetPayload<typeof userWithProfile>;

export async function findUserByLogin(login: string): Promise<UserWithProfile | null> {
  const trimmed = login.trim();
  if (trimmed.includes('@')) {
    return prisma.user.findUnique({ where: { email: trimmed.toLowerCase() }, ...userWithProfile });
  }
  const profile = await prisma.profile.findUnique({
    where: { username: trimmed },
    include: { user: { include: { profile: true } } },
  });
  if (!profile?.user) return null;
  return profile.user;
}

export async function findUserByPhone(phone: string): Promise<UserWithProfile | null> {
  const profiles = await prisma.profile.findMany({
    where: { phone: { not: null } },
    include: { user: { include: { profile: true } } },
  });
  const match = profiles.find((p) => p.phone && phonesMatch(p.phone, phone));
  return match?.user ?? null;
}

export async function phoneExists(phone: string): Promise<boolean> {
  return (await findUserByPhone(phone)) !== null;
}

export function formatPhoneForStorage(phone: string): string {
  const n = normalizePhone(phone);
  if (n.length === 11 && n.startsWith('7')) {
    return `+${n}`;
  }
  return phone.trim();
}
