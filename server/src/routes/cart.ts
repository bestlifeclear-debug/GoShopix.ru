import { Router } from 'express';
import { AppError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { ok } from '../lib/response.js';
import { requireCustomer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  addCartItemSchema,
  cartItemParamsSchema,
  mergeCartSchema,
  updateCartItemSchema,
} from '../schemas/cart.js';
import { getOrCreateCart, mapCart, mergeGuestCartItems } from '../services/cart.js';
import { paramString } from '../utils/params.js';

export const cartRouter = Router();

cartRouter.use(...requireCustomer);

cartRouter.get('/', async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user!.sub);
    ok(res, mapCart(cart));
  } catch (error) {
    next(error);
  }
});

cartRouter.post('/merge', validate({ body: mergeCartSchema }), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const updated = await mergeGuestCartItems(userId, req.body.items);
    ok(res, mapCart(updated));
  } catch (error) {
    next(error);
  }
});

cartRouter.post('/items', validate({ body: addCartItemSchema }), async (req, res, next) => {
  try {
    const { variantId, quantity } = req.body;
    const userId = req.user!.sub;

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { select: { isPublished: true } } },
    });

    if (!variant || !variant.product.isPublished) {
      throw new AppError(404, 'Product variant not found');
    }

    if (variant.stock < quantity) {
      throw new AppError(400, 'Insufficient stock');
    }

    const cart = await getOrCreateCart(userId);

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (variant.stock < newQty) {
        throw new AppError(400, 'Insufficient stock');
      }
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, variantId, quantity },
      });
    }

    const updated = await getOrCreateCart(userId);
    ok(res, mapCart(updated), 201);
  } catch (error) {
    next(error);
  }
});

cartRouter.put(
  '/items/:id',
  validate({ params: cartItemParamsSchema, body: updateCartItemSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user!.sub;
      const { quantity } = req.body;

      const itemId = paramString(req.params.id);
      const cart = await getOrCreateCart(userId);
      const item = await prisma.cartItem.findFirst({
        where: { id: itemId, cartId: cart.id },
        include: { variant: true },
      });

      if (!item) {
        throw new AppError(404, 'Cart item not found');
      }

      if (item.variant.stock < quantity) {
        throw new AppError(400, 'Insufficient stock');
      }

      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });

      const updated = await getOrCreateCart(userId);
      ok(res, mapCart(updated));
    } catch (error) {
      next(error);
    }
  },
);

cartRouter.delete(
  '/items/:id',
  validate({ params: cartItemParamsSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user!.sub;
      const itemId = paramString(req.params.id);
      const cart = await getOrCreateCart(userId);

      const item = await prisma.cartItem.findFirst({
        where: { id: itemId, cartId: cart.id },
      });

      if (!item) {
        throw new AppError(404, 'Cart item not found');
      }

      await prisma.cartItem.delete({ where: { id: item.id } });

      const updated = await getOrCreateCart(userId);
      ok(res, mapCart(updated));
    } catch (error) {
      next(error);
    }
  },
);
