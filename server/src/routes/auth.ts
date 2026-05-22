import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../lib/errors.js';
import { parseIdentifier } from '../lib/identifier.js';
import { ok } from '../lib/response.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  changeEmailSendSchema,
  changeEmailVerifySchema,
  changePhoneSendSchema,
  changePhoneVerifySchema,
  sendOtpSchema,
  updateProfileSchema,
  verifyOtpSchema,
} from '../schemas/auth.js';
import {
  confirmChangeEmail,
  confirmChangePhone,
  sendChangeEmailOtp,
  sendChangePhoneOtp,
  sendLoginOtp,
  verifyLoginOtp,
} from '../services/passwordlessAuth.js';
import { findUserById, mapUser, updateUserProfile } from '../services/user.js';

export const authRouter = Router();

authRouter.post('/otp/send', validate({ body: sendOtpSchema }), async (req, res, next) => {
  try {
    const parsed = parseIdentifier(req.body.identifier);
    const result = await sendLoginOtp(req.body.identifier, parsed);
    ok(res, {
      message: 'Код отправлен',
      maskedDestination: result.maskedDestination,
      ...(result.devCode ? { devCode: result.devCode } : {}),
    });
  } catch (error) {
    if (error instanceof Error && ['EMPTY', 'INVALID', 'INVALID_EMAIL'].includes(error.message)) {
      next(new AppError(400, 'Введите корректный телефон или email'));
      return;
    }
    next(error);
  }
});

authRouter.post('/otp/verify', validate({ body: verifyOtpSchema }), async (req, res, next) => {
  try {
    const parsed = parseIdentifier(req.body.identifier);
    const result = await verifyLoginOtp(req.body.identifier, parsed, req.body.code);
    ok(res, result);
  } catch (error) {
    if (error instanceof Error && ['EMPTY', 'INVALID', 'INVALID_EMAIL'].includes(error.message)) {
      next(new AppError(400, 'Введите корректный телефон или email'));
      return;
    }
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

authRouter.post(
  '/profile/phone/send-otp',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  validate({ body: changePhoneSendSchema }),
  async (req, res, next) => {
    try {
      const result = await sendChangePhoneOtp(req.user!.sub, req.body.phone);
      ok(res, {
        message: 'Код отправлен',
        maskedDestination: result.maskedDestination,
        ...(result.devCode ? { devCode: result.devCode } : {}),
      });
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  '/profile/phone/verify',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  validate({ body: changePhoneVerifySchema }),
  async (req, res, next) => {
    try {
      const updated = await confirmChangePhone(req.user!.sub, req.body.phone, req.body.code);
      ok(res, mapUser(updated));
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  '/profile/email/send-otp',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  validate({ body: changeEmailSendSchema }),
  async (req, res, next) => {
    try {
      const result = await sendChangeEmailOtp(req.user!.sub, req.body.email);
      ok(res, {
        message: 'Код отправлен',
        maskedDestination: result.maskedDestination,
        ...(result.devCode ? { devCode: result.devCode } : {}),
      });
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  '/profile/email/verify',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  validate({ body: changeEmailVerifySchema }),
  async (req, res, next) => {
    try {
      const updated = await confirmChangeEmail(req.user!.sub, req.body.email, req.body.code);
      ok(res, mapUser(updated));
    } catch (error) {
      next(error);
    }
  },
);
