import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { formatPhoneForStorage, phonesMatch } from '../lib/phone.js';

export { formatPhoneForStorage };

const userWithProfile = { include: { profile: true } } as const;
export type UserWithProfile = Prisma.UserGetPayload<typeof userWithProfile>;

export async function findUserByEmail(email: string): Promise<UserWithProfile | null> {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    ...userWithProfile,
  });
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
