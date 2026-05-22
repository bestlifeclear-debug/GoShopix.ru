import type { User } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { formatPhoneForStorage } from '../lib/phone.js';
import { findUserByPhone } from './authLookup.js';

type UserWithProfile = User & {
  profile: {
    name: string | null;
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
          name: user.profile.name,
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

export interface UpdateProfileInput {
  name?: string;
}

function emptyToNull(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const user = await findUserById(userId);
  if (!user) throw new AppError(404, 'User not found');

  const profileData: { name?: string | null } = {};
  const name = emptyToNull(input.name);
  if (name !== undefined) profileData.name = name;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      profile: user.profile ? { update: profileData } : { create: profileData },
    },
    include: { profile: true },
  });

  if (!updated.email && !updated.profile?.phone) {
    throw new AppError(400, 'У аккаунта должен быть email или телефон');
  }

  return updated;
}
