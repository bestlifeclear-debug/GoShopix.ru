import crypto from 'node:crypto';
import { OtpChannel, OtpPurpose } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { maskEmail, maskPhone, type ParsedIdentifier } from '../lib/identifier.js';
import { prisma } from '../lib/prisma.js';

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_LENGTH = 6;

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(OTP_LENGTH, '0');
}

async function deliverOtp(channel: OtpChannel, target: string, code: string, subject: string): Promise<void> {
  if (channel === OtpChannel.EMAIL) {
    const smtpHost = process.env.SMTP_HOST;
    const text = `Ваш код подтверждения GoShopix: ${code}\nКод действует 5 минут.`;
    if (smtpHost) {
      const nodemailer = await import('nodemailer');
      const transport = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
      await transport.sendMail({
        from: process.env.SMTP_FROM ?? 'noreply@goshopix.ru',
        to: target,
        subject,
        text,
      });
      return;
    }
    console.log('[otp-email]', subject, '→', target, 'code:', code);
    return;
  }
  console.log('[otp-sms]', target, 'code:', code);
}

export async function createOtp(params: {
  parsed: ParsedIdentifier;
  purpose: OtpPurpose;
  userId?: string;
}): Promise<{ maskedDestination: string; devCode?: string }> {
  const channel = params.parsed.kind === 'phone' ? OtpChannel.PHONE : OtpChannel.EMAIL;
  const code = generateCode();
  const codeHash = hashCode(code);

  await prisma.authOtp.deleteMany({
    where: { target: params.parsed.value, purpose: params.purpose },
  });

  await prisma.authOtp.create({
    data: {
      target: params.parsed.value,
      channel,
      purpose: params.purpose,
      codeHash,
      userId: params.userId,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  const subject =
    params.purpose === OtpPurpose.LOGIN
      ? 'Код входа GoShopix'
      : params.purpose === OtpPurpose.CHANGE_PHONE
        ? 'Подтверждение нового телефона'
        : 'Подтверждение нового email';

  await deliverOtp(channel, params.parsed.value, code, subject);

  const maskedDestination =
    params.parsed.kind === 'phone'
      ? maskPhone(params.parsed.value)
      : maskEmail(params.parsed.value);

  const exposeDevCode =
    process.env.NODE_ENV !== 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_ENV === 'development' ||
    process.env.EXPOSE_OTP_DEV_CODE === 'true';

  return {
    maskedDestination,
    ...(exposeDevCode ? { devCode: code } : {}),
  };
}

export async function verifyOtp(params: {
  parsed: ParsedIdentifier;
  purpose: OtpPurpose;
  code: string;
}): Promise<void> {
  const record = await prisma.authOtp.findFirst({
    where: { target: params.parsed.value, purpose: params.purpose },
    orderBy: { createdAt: 'desc' },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError(400, 'Код истёк или не найден. Запросите новый');
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.authOtp.delete({ where: { id: record.id } });
    throw new AppError(400, 'Превышено число попыток. Запросите новый код');
  }

  const codeHash = hashCode(params.code.trim());
  if (record.codeHash !== codeHash) {
    await prisma.authOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw new AppError(400, 'Неверный код');
  }

  await prisma.authOtp.delete({ where: { id: record.id } });
}
