import type { Cart, CartItem } from '../api/types.js';
import type { CartItemSnapshot } from './guestCart.js';

function snapshotToCartItem(snapshot: CartItemSnapshot, quantity: number): CartItem {
  return {
    id: `opt-${snapshot.variantId}`,
    quantity,
    unitPrice: snapshot.unitPrice,
    lineTotal: snapshot.unitPrice * quantity,
    variant: {
      id: snapshot.variantId,
      sku: '',
      name: snapshot.variantName,
      price: snapshot.unitPrice,
      stock: snapshot.stock,
      options: [],
    },
    product: {
      id: snapshot.productId,
      name: snapshot.productName,
      slug: snapshot.productSlug,
      imageUrl: snapshot.imageUrl,
    },
  };
}

function recalcCart(items: CartItem[], id: string): Cart {
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return {
    id,
    items,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    subtotal,
    updatedAt: new Date().toISOString(),
  };
}

export function optimisticAddToCart(
  cart: Cart | null,
  snapshot: CartItemSnapshot,
  quantity: number,
): Cart {
  const baseId = cart?.id ?? 'optimistic';
  const items = [...(cart?.items ?? [])];
  const idx = items.findIndex((i) => i.variant.id === snapshot.variantId);

  if (idx >= 0) {
    const line = items[idx]!;
    const nextQty = line.quantity + quantity;
    items[idx] = {
      ...line,
      quantity: nextQty,
      lineTotal: line.unitPrice * nextQty,
    };
  } else {
    items.push(snapshotToCartItem(snapshot, quantity));
  }

  return recalcCart(items, baseId);
}

export function optimisticUpdateQuantity(cart: Cart, itemId: string, quantity: number): Cart {
  const items = cart.items.map((item) => {
    if (item.id !== itemId) return item;
    return {
      ...item,
      quantity,
      lineTotal: item.unitPrice * quantity,
    };
  });
  return recalcCart(items, cart.id);
}

export function optimisticRemoveItem(cart: Cart, itemId: string): Cart {
  const items = cart.items.filter((item) => item.id !== itemId);
  return recalcCart(items, cart.id);
}
