import { Router } from 'express';
import { z } from 'zod';
import { paginatedMeta, parsePagination, skipTake } from '../lib/pagination.js';
import { prisma } from '../lib/prisma.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getOrCreateNotificationSettings } from '../services/notifications.js';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const pagination = parsePagination(page, limit);
    const userId = req.user!.sub;
    const unreadOnly = req.query.unread === 'true';

    const where = {
      userId,
      ...(unreadOnly ? { readAt: null } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...skipTake(pagination),
      }),
    ]);

    ok(res, {
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
      })),
      meta: paginatedMeta(total, pagination),
    });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.get('/unread-count', async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user!.sub, readAt: null },
    });
    ok(res, { count });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.post('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.sub, readAt: null },
      data: { readAt: new Date() },
    });
    ok(res, { success: true });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.post('/:id/read', async (req, res, next) => {
  try {
    const id = String(req.params.id);
    await prisma.notification.updateMany({
      where: { id, userId: req.user!.sub },
      data: { readAt: new Date() },
    });
    ok(res, { success: true });
  } catch (error) {
    next(error);
  }
});

const settingsSchema = z.object({
  emailOrderStatus: z.boolean().optional(),
  inAppOrderStatus: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
});

notificationsRouter.get('/settings', async (req, res, next) => {
  try {
    const settings = await getOrCreateNotificationSettings(req.user!.sub);
    ok(res, settings);
  } catch (error) {
    next(error);
  }
});

notificationsRouter.put('/settings', validate({ body: settingsSchema }), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const body = req.body as z.infer<typeof settingsSchema>;
    const settings = await prisma.userNotificationSettings.upsert({
      where: { userId },
      create: { userId, ...body },
      update: body,
    });
    ok(res, settings);
  } catch (error) {
    next(error);
  }
});
