import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { AppError } from '../lib/errors.js';
import { signToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { ok } from '../lib/response.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../schemas/auth.js';
import { findUserById, mapUser } from '../services/user.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.CUSTOMER,
        profile: {
          create: { firstName, lastName, phone },
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
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role });

    ok(res, {
      user: mapUser(user),
      token,
    });
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
