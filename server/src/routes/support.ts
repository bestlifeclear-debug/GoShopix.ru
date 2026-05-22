import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../lib/errors.js';
import { paginatedMeta, parsePagination, skipTake } from '../lib/pagination.js';
import { prisma } from '../lib/prisma.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const topicSchema = z.enum([
  'order',
  'return',
  'payment',
  'cancel',
  'product',
  'seller',
  'bonuses',
  'other',
]);

const TOPIC_LABELS: Record<z.infer<typeof topicSchema>, string> = {
  order: 'Заказ и доставка',
  return: 'Возврат товара',
  payment: 'Оплата',
  cancel: 'Отмена заказа',
  product: 'Проблема с товаром',
  seller: 'Вопрос продавцу',
  bonuses: 'Бонусы и акции',
  other: 'Другое',
};

const createTicketSchema = z.object({
  topic: topicSchema,
  message: z.string().trim().min(10).max(4000),
  orderId: z.string().cuid().optional(),
  subject: z.string().trim().min(3).max(200).optional(),
});

const replySchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

function mapTicket(ticket: {
  id: string;
  topic: z.infer<typeof topicSchema>;
  subject: string;
  status: string;
  orderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: { id: string; authorRole: string; body: string; createdAt: Date }[];
}) {
  const lastMessage = ticket.messages?.[ticket.messages.length - 1];
  return {
    id: ticket.id,
    topic: ticket.topic,
    topicLabel: TOPIC_LABELS[ticket.topic],
    subject: ticket.subject,
    status: ticket.status,
    orderId: ticket.orderId,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    lastMessagePreview: lastMessage ? lastMessage.body.slice(0, 120) : null,
    messages: ticket.messages?.map((m) => ({
      id: m.id,
      authorRole: m.authorRole,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export const supportRouter = Router();

supportRouter.use(authenticate);

supportRouter.get('/tickets', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const pagination = parsePagination(page, limit);
    const userId = req.user!.sub;

    const where = { userId };

    const [total, rows] = await Promise.all([
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        ...skipTake(pagination),
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      }),
    ]);

    const items = await Promise.all(
      rows.map(async (row) => {
        const last = await prisma.supportTicketMessage.findFirst({
          where: { ticketId: row.id },
          orderBy: { createdAt: 'desc' },
        });
        return mapTicket({
          ...row,
          messages: last ? [last] : [],
        });
      }),
    );

    ok(res, { items, meta: paginatedMeta(total, pagination) });
  } catch (error) {
    next(error);
  }
});

supportRouter.get('/tickets/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.sub;

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!ticket) throw new AppError(404, 'Обращение не найдено');

    ok(res, mapTicket(ticket));
  } catch (error) {
    next(error);
  }
});

supportRouter.post('/tickets', validate({ body: createTicketSchema }), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const body = req.body as z.infer<typeof createTicketSchema>;

    if (body.orderId) {
      const order = await prisma.order.findFirst({
        where: { id: body.orderId, userId },
      });
      if (!order) throw new AppError(400, 'Заказ не найден');
    }

    const subject = body.subject?.trim() || TOPIC_LABELS[body.topic];

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        orderId: body.orderId ?? null,
        topic: body.topic,
        subject,
        status: 'answered',
        messages: {
          create: [
            { authorRole: 'CUSTOMER', body: body.message },
            {
              authorRole: 'STAFF',
              body: 'Спасибо за обращение! Мы получили ваш запрос и ответим в этом диалоге.',
            },
          ],
        },
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    ok(res, mapTicket(ticket), 201);
  } catch (error) {
    next(error);
  }
});

supportRouter.post(
  '/tickets/:id/messages',
  validate({ body: replySchema }),
  async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const userId = req.user!.sub;
      const body = req.body as z.infer<typeof replySchema>;

      const ticket = await prisma.supportTicket.findFirst({
        where: { id, userId },
      });

      if (!ticket) throw new AppError(404, 'Обращение не найдено');
      if (ticket.status === 'closed') {
        throw new AppError(400, 'Обращение закрыто. Создайте новое, если вопрос остался.');
      }

      await prisma.supportTicketMessage.create({
        data: {
          ticketId: id,
          authorRole: 'CUSTOMER',
          body: body.message,
        },
      });

      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'open', updatedAt: new Date() },
      });

      const updated = await prisma.supportTicket.findFirst({
        where: { id },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });

      ok(res, mapTicket(updated!));
    } catch (error) {
      next(error);
    }
  },
);
