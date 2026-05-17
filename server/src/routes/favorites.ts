import { Router } from 'express';
import { AppError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { ok } from '../lib/response.js';
import { mapProductListItem, productListInclude } from '../mappers/product.js';
import { requireCustomer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productIdParamSchema } from '../schemas/common.js';
import { paramString } from '../utils/params.js';

export const favoritesRouter = Router();

favoritesRouter.use(...requireCustomer);

favoritesRouter.get('/', async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.sub },
      include: {
        product: {
          include: productListInclude,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    ok(
      res,
      favorites.map((f) => ({
        id: f.id,
        productId: f.productId,
        addedAt: f.createdAt.toISOString(),
        product: mapProductListItem(f.product),
      })),
    );
  } catch (error) {
    next(error);
  }
});

favoritesRouter.post(
  '/:productId',
  validate({ params: productIdParamSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user!.sub;
      const productId = paramString(req.params.productId);

      const product = await prisma.product.findFirst({
        where: { id: productId, isPublished: true },
      });

      if (!product) {
        throw new AppError(404, 'Product not found');
      }

      const favorite = await prisma.favorite.upsert({
        where: { userId_productId: { userId, productId } },
        create: { userId, productId },
        update: {},
        include: {
          product: { include: productListInclude },
        },
      });

      ok(
        res,
        {
          id: favorite.id,
          productId: favorite.productId,
          addedAt: favorite.createdAt.toISOString(),
          product: mapProductListItem(favorite.product),
        },
        201,
      );
    } catch (error) {
      next(error);
    }
  },
);

favoritesRouter.delete(
  '/:productId',
  validate({ params: productIdParamSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user!.sub;
      const productId = paramString(req.params.productId);

      const favorite = await prisma.favorite.findUnique({
        where: { userId_productId: { userId, productId } },
      });

      if (!favorite) {
        throw new AppError(404, 'Favorite not found');
      }

      await prisma.favorite.delete({ where: { id: favorite.id } });

      ok(res, { removed: true, productId });
    } catch (error) {
      next(error);
    }
  },
);
