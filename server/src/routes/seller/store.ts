import { Router } from 'express';
import { AppError } from '../../lib/errors.js';
import { assertValidSlug, slugify } from '../../lib/business-rules.js';
import { prisma } from '../../lib/prisma.js';
import { ok } from '../../lib/response.js';
import { requireSeller } from '../../middleware/seller.js';
import { validate } from '../../middleware/validate.js';
import { updateStoreSchema } from '../../schemas/seller/store.js';
import { getPrimaryStore } from '../../services/seller.js';

export const sellerStoreRouter = Router();

sellerStoreRouter.use(...requireSeller);

function mapStore(store: {
  id: string;
  name: string;
  slug: string;
  description: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  images?: { id: string; url: string; alt: string | null; isPrimary: boolean }[];
}) {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    email: store.email,
    phone: store.phone,
    address: store.address,
    isActive: store.isActive,
    images: store.images?.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary,
    })),
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
  };
}

sellerStoreRouter.get('/', async (req, res, next) => {
  try {
    const store = getPrimaryStore(req.seller!);
    const full = await prisma.store.findUniqueOrThrow({
      where: { id: store.id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    ok(res, mapStore(full));
  } catch (error) {
    next(error);
  }
});

sellerStoreRouter.put('/', validate({ body: updateStoreSchema }), async (req, res, next) => {
  try {
    const seller = req.seller!;
    const store = getPrimaryStore(seller);
    const body = req.body;

    if (body.name && body.name !== store.name) {
      const newSlug = slugify(body.name);
      assertValidSlug(newSlug);
      const taken = await prisma.store.findFirst({
        where: { slug: newSlug, id: { not: store.id } },
      });
      if (taken) throw new AppError(409, 'Store slug derived from name is already taken');

      const updated = await prisma.store.update({
        where: { id: store.id },
        data: {
          name: body.name,
          slug: newSlug,
          description: body.description,
          email: body.email,
          phone: body.phone,
          address: body.address,
          isActive: body.isActive,
        },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
      });
      ok(res, mapStore(updated));
      return;
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        description: body.description,
        email: body.email,
        phone: body.phone,
        address: body.address,
        isActive: body.isActive,
        ...(body.name ? { name: body.name } : {}),
      },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    ok(res, mapStore(updated));
  } catch (error) {
    next(error);
  }
});
