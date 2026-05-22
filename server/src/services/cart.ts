import { prisma } from '../lib/prisma.js';

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
          options: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

export async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }

  return cart;
}

export async function mergeGuestCartItems(
  userId: string,
  lines: { variantId: string; quantity: number }[],
) {
  if (lines.length === 0) {
    return getOrCreateCart(userId);
  }

  const cart = await getOrCreateCart(userId);

  for (const { variantId, quantity } of lines) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { select: { isPublished: true } } },
    });

    if (!variant || !variant.product.isPublished) {
      continue;
    }

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, variant.stock);
      if (newQty < 1) continue;
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      const newQty = Math.min(quantity, variant.stock);
      if (newQty < 1) continue;
      await prisma.cartItem.create({
        data: { cartId: cart.id, variantId, quantity: newQty },
      });
    }
  }

  return getOrCreateCart(userId);
}

export function mapCart(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  const items = cart.items.map((item) => {
    const unitPrice = item.variant.price.toNumber();
    return {
      id: item.id,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      variant: {
        id: item.variant.id,
        sku: item.variant.sku,
        name: item.variant.name,
        price: unitPrice,
        stock: item.variant.stock,
        options: item.variant.options,
      },
      product: {
        id: item.variant.product.id,
        name: item.variant.product.name,
        slug: item.variant.product.slug,
        imageUrl: item.variant.product.images[0]?.url ?? null,
      },
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    subtotal,
    updatedAt: cart.updatedAt.toISOString(),
  };
}
