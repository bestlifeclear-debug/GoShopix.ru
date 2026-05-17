import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type UserWithProfile = User & {
  profile: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    bio: string | null;
  } | null;
};

export function mapUser(user: UserWithProfile) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile
      ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          phone: user.profile.phone,
          avatarUrl: user.profile.avatarUrl,
          bio: user.profile.bio,
        }
      : null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
}
