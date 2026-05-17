import type { OrderStatus } from '@prisma/client';

export function mapSellerOrderItem(item: {
  id: string;
  productName: string;
  variantName: string | null;
  unitPrice: { toNumber: () => number };
  quantity: number;
  lineTotal: { toNumber: () => number };
  variantId: string | null;
  variant?: { product: { id: string } } | null;
}) {
  return {
    id: item.id,
    productName: item.productName,
    variantName: item.variantName,
    unitPrice: item.unitPrice.toNumber(),
    quantity: item.quantity,
    lineTotal: item.lineTotal.toNumber(),
    variantId: item.variantId,
    productId: item.variant?.product.id ?? null,
  };
}

export function mapSellerOrderView(
  order: {
    id: string;
    status: OrderStatus;
    totalAmount: { toNumber: () => number };
    shippingName: string | null;
    shippingPhone: string | null;
    shippingAddress: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  sellerItems: Parameters<typeof mapSellerOrderItem>[0][],
  sellerRevenue: number,
) {
  return {
    id: order.id,
    status: order.status,
    orderTotal: order.totalAmount.toNumber(),
    sellerRevenue,
    shipping: {
      name: order.shippingName,
      phone: order.shippingPhone,
      address: order.shippingAddress,
    },
    items: sellerItems.map(mapSellerOrderItem),
    itemCount: sellerItems.length,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}
