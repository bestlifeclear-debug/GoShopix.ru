import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../lib/errors.js';
import { signToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { ok } from '../lib/response.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  checkPhoneSchema,
  forgotPasswordSchema,
  loginByPhoneSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../schemas/auth.js';
import { findUserById, mapUser, updateUserProfile } from '../services/user.js';
import {
  findUserByLogin,
  findUserByPhone,
  formatPhoneForStorage,
  phoneExists,
} from '../services/authLookup.js';

export const authRouter = Router();

const RESET_TTL_MS = 60 * 60 * 1000;

function issueAuthResponse(user: Awaited<ReturnType<typeof findUserByLogin>>) {
  if (!user) throw new AppError(401, 'Invalid credentials');
  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return { user: mapUser(user), token };
}

async function verifyPassword(user: { passwordHash: string }, password: string) {
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, 'Invalid credentials');
  }
}

authRouter.post('/check-phone', validate({ body: checkPhoneSchema }), async (req, res, next) => {
  try {
    const exists = await phoneExists(req.body.phone);
    const user = exists ? await findUserByPhone(req.body.phone) : null;
    ok(res, {
      exists,
      maskedEmail: user?.email ? maskEmail(user.email) : undefined,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/register', validate({ body: registerSchema }), async (req, res, next) => {
  try {
    const { email, password, username, firstName, lastName, phone } = req.body;
    const storedPhone = formatPhoneForStorage(phone);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    const usernameTaken = await prisma.profile.findUnique({ where: { username } });
    if (usernameTaken) {
      throw new AppError(409, 'Username already taken');
    }

    if (await phoneExists(storedPhone)) {
      throw new AppError(409, 'Phone already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.CUSTOMER,
        profile: {
          create: { username, firstName, lastName, phone: storedPhone },
        },
        cart: { create: {} },
      },
      include: { profile: true },
    });

    const token = signToken({ sub: user.id, email: user.email, role: user.role });

    ok(
      res,
      {
        user: mapUser(user),
        token,
      },
      201,
    );
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', validate({ body: loginSchema }), async (req, res, next) => {
  try {
    const { login, password } = req.body;
    const user = await findUserByLogin(login);
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }
    await verifyPassword(user, password);
    ok(res, issueAuthResponse(user));
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login-phone', validate({ body: loginByPhoneSchema }), async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await findUserByPhone(phone);
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }
    await verifyPassword(user, password);
    ok(res, issueAuthResponse(user));
  } catch (error) {
    next(error);
  }
});

authRouter.post('/forgot-password', validate({ body: forgotPasswordSchema }), async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    let devToken: string | undefined;
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + RESET_TTL_MS),
        },
      });
      if (process.env.NODE_ENV !== 'production') {
        devToken = rawToken;
      }
    }

    ok(res, {
      message: 'If the email exists, reset instructions were sent',
      ...(devToken ? { devToken } : {}),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/reset-password', validate({ body: resetPasswordSchema }), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { profile: true } } },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.delete({ where: { id: record.id } }),
    ]);

    ok(res, issueAuthResponse(record.user));
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', authenticate, requireRole('CUSTOMER', 'SELLER', 'ADMIN'), async (req, res, next) => {
  try {
    const user = await findUserById(req.user!.sub);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    ok(res, mapUser(user));
  } catch (error) {
    next(error);
  }
});

authRouter.patch(
  '/profile',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  validate({ body: updateProfileSchema }),
  async (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof updateProfileSchema>;
      const updated = await updateUserProfile(req.user!.sub, body);
      ok(res, mapUser(updated));
    } catch (error) {
      next(error);
    }
  },
);

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.length <= 2 ? '*' : local.slice(0, 2);
  return `${visible}***@${domain}`;
}
