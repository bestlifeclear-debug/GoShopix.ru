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
