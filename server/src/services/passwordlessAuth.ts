import { UserRole } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import type { ParsedIdentifier } from '../lib/identifier.js';
import { signToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { formatPhoneForStorage } from '../lib/phone.js';
import { findUserByPhone } from './authLookup.js';
import { createOtp, verifyOtp } from './otp.js';
import { mapUser } from './user.js';
import { OtpPurpose } from '@prisma/client';

export async function sendLoginOtp(_identifier: string, parsed: ParsedIdentifier) {
  return createOtp({ parsed, purpose: OtpPurpose.LOGIN });
}

export async function verifyLoginOtp(_identifier: string, parsed: ParsedIdentifier, code: string) {
  await verifyOtp({ parsed, purpose: OtpPurpose.LOGIN, code });

  let user =
    parsed.kind === 'email'
      ? await prisma.user.findUnique({ where: { email: parsed.value }, include: { profile: true } })
      : await findUserByPhone(parsed.value);

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: parsed.kind === 'email' ? parsed.value : null,
        role: UserRole.CUSTOMER,
        profile: {
          create: {
            phone: parsed.kind === 'phone' ? parsed.value : null,
          },
        },
        cart: { create: {} },
      },
      include: { profile: true },
    });
  }

  assertUserHasContact(user);

  const token = signToken({
    sub: user.id,
    email: user.email ?? '',
    role: user.role,
  });

  return { user: mapUser(user), token };
}

function assertUserHasContact(user: { email: string | null; profile: { phone: string | null } | null }) {
  const hasEmail = Boolean(user.email);
  const hasPhone = Boolean(user.profile?.phone);
  if (!hasEmail && !hasPhone) {
    throw new AppError(500, 'Account has no contact method');
  }
}

export async function sendChangePhoneOtp(userId: string, phone: string) {
  const stored = formatPhoneForStorage(phone);
  const other = await findUserByPhone(stored);
  if (other && other.id !== userId) {
    throw new AppError(409, 'Этот номер уже используется');
  }
  return createOtp({
    parsed: { kind: 'phone', value: stored },
    purpose: OtpPurpose.CHANGE_PHONE,
    userId,
  });
}

export async function confirmChangePhone(userId: string, phone: string, code: string) {
  const stored = formatPhoneForStorage(phone);
  const parsed = { kind: 'phone' as const, value: stored };
  await verifyOtp({ parsed, purpose: OtpPurpose.CHANGE_PHONE, code });

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  if (!user) throw new AppError(404, 'User not found');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      profile: user.profile
        ? { update: { phone: stored } }
        : { create: { phone: stored } },
    },
    include: { profile: true },
  });

  assertUserHasContact(updated);
  return updated;
}

export async function sendChangeEmailOtp(userId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  const other = await prisma.user.findUnique({ where: { email: normalized } });
  if (other && other.id !== userId) {
    throw new AppError(409, 'Этот email уже используется');
  }
  return createOtp({
    parsed: { kind: 'email', value: normalized },
    purpose: OtpPurpose.CHANGE_EMAIL,
    userId,
  });
}

export async function confirmChangeEmail(userId: string, email: string, code: string) {
  const normalized = email.trim().toLowerCase();
  const parsed = { kind: 'email' as const, value: normalized };
  await verifyOtp({ parsed, purpose: OtpPurpose.CHANGE_EMAIL, code });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { email: normalized },
    include: { profile: true },
  });

  assertUserHasContact(updated);
  return updated;
}
