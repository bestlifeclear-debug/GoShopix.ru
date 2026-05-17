import type { Seller, Store } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';

export type SellerContext = Seller & { stores: Store[] };

export async function getSellerContext(userId: string): Promise<SellerContext> {
  const seller = await prisma.seller.findUnique({
    where: { userId },
    include: { stores: { orderBy: { createdAt: 'asc' } } },
  });

  if (!seller) {
    throw new AppError(403, 'Seller profile not found. Only sellers can access this resource.');
  }

  return seller;
}

export function getPrimaryStore(seller: SellerContext): Store {
  const store = seller.stores[0];
  if (!store) {
    throw new AppError(400, 'No store configured for this seller');
  }
  return store;
}

export async function assertProductOwnedBySeller(
  productId: string,
  sellerId: string,
) {
  const product = await prisma.product.findFirst({
    where: { id: productId, sellerId },
  });

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  return product;
}

export async function assertOrderHasSellerItems(
  orderId: string,
  sellerId: string,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { select: { id: true, sellerId: true, name: true } } },
          },
        },
      },
      history: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  const sellerItems = order.items.filter(
    (item) => item.variant?.product.sellerId === sellerId,
  );

  if (sellerItems.length === 0) {
    throw new AppError(404, 'Order not found');
  }

  return { order, sellerItems };
}

/** Заказ содержит товары только этого продавца */
type OrderWithVariants = {
  items: Array<{
    variant: { product: { sellerId: string } } | null;
  }>;
};

export function orderBelongsToSellerOnly(order: OrderWithVariants, sellerId: string): boolean {
  return order.items.every(
    (item) => !item.variant || item.variant.product.sellerId === sellerId,
  );
}
