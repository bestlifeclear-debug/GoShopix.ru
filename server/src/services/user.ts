import type { User } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { formatPhoneForStorage, findUserByPhone } from './authLookup.js';

type UserWithProfile = User & {
  profile: {
    username: string | null;
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
          username: user.profile.username,
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

export interface UpdateProfileInput {
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

function emptyToNull(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const user = await findUserById(userId);
  if (!user) throw new AppError(404, 'User not found');

  if (input.username !== undefined) {
    const taken = await prisma.profile.findFirst({
      where: { username: input.username, userId: { not: userId } },
    });
    if (taken) throw new AppError(409, 'Username already taken');
  }

  if (input.phone !== undefined) {
    const storedPhone = formatPhoneForStorage(input.phone);
    const other = await findUserByPhone(storedPhone);
    if (other && other.id !== userId) {
      throw new AppError(409, 'Phone already registered');
    }
  }

  const profileData: {
    username?: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  } = {};

  if (input.username !== undefined) profileData.username = input.username;
  const firstName = emptyToNull(input.firstName);
  if (firstName !== undefined) profileData.firstName = firstName;
  const lastName = emptyToNull(input.lastName);
  if (lastName !== undefined) profileData.lastName = lastName;
  if (input.phone !== undefined) {
    profileData.phone = formatPhoneForStorage(input.phone);
  }

  const fallbackUsername = `user_${userId.slice(-8)}`;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      profile: user.profile
        ? { update: profileData }
        : {
            create: {
              username: profileData.username ?? fallbackUsername,
              firstName: profileData.firstName ?? null,
              lastName: profileData.lastName ?? null,
              phone: profileData.phone ?? null,
            },
          },
    },
    include: { profile: true },
  });

  return updated;
}
