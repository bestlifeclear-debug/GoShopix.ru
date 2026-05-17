import { getStatusDefinition } from '@goshopix/shared';
import { prisma } from '../lib/prisma.js';

export interface OrderStatusEmailContext {
  orderId: string;
  userId: string;
  status: string;
  customerEmail: string;
  customerName: string | null;
  orderTotal: number;
  trackingNumber?: string | null;
}

function buildHtml(ctx: OrderStatusEmailContext): { subject: string; html: string; text: string } {
  const def = getStatusDefinition(ctx.status);
  const statusName = def?.name ?? ctx.status;
  const statusDesc = def?.description ?? '';

  const subject = `GoShopix: заказ #${ctx.orderId.slice(0, 8)} — ${statusName}`;
  const text = [
    `Здравствуйте${ctx.customerName ? `, ${ctx.customerName}` : ''}!`,
    '',
    `Статус заказа #${ctx.orderId.slice(0, 8)} изменён: ${statusName}.`,
    statusDesc,
    `Сумма: ${ctx.orderTotal.toFixed(2)} ₽`,
    ctx.trackingNumber ? `Трек-номер: ${ctx.trackingNumber}` : '',
    '',
    'С уважением, GoShopix',
  ]
    .filter(Boolean)
    .join('\n');

  const color = def?.color ?? '#E31837';
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Inter, sans-serif; color: #111;">
  <h2 style="color: ${color};">Заказ #${ctx.orderId.slice(0, 8)}</h2>
  <p><strong>${statusName}</strong></p>
  <p>${statusDesc}</p>
  <p>Сумма: <strong>${ctx.orderTotal.toFixed(2)} ₽</strong></p>
  ${ctx.trackingNumber ? `<p>Трек-номер: <code>${ctx.trackingNumber}</code></p>` : ''}
  <p style="color:#666;font-size:12px;">GoShopix — маркетплейс</p>
</body>
</html>`;

  return { subject, html, text };
}

/** Отправка письма (в dev — лог в консоль; SMTP через env) */
export async function sendOrderStatusEmail(ctx: OrderStatusEmailContext): Promise<void> {
  const settings = await prisma.userNotificationSettings.findUnique({
    where: { userId: ctx.userId },
  });
  if (settings && !settings.emailOrderStatus) return;

  const { subject, html, text } = buildHtml(ctx);

  const smtpHost = process.env.SMTP_HOST;
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
      to: ctx.customerEmail,
      subject,
      text,
      html,
    });
    return;
  }

  console.log('[email]', subject, '→', ctx.customerEmail);
  console.log(text);
}
