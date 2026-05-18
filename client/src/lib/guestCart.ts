import type { Cart, CartItem } from '../api/types.js';

const STORAGE_KEY = 'goshopix_guest_cart';

export interface CartItemSnapshot {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantName: string | null;
  unitPrice: number;
  stock: number;
  imageUrl: string | null;
}

export interface GuestCartLine extends CartItemSnapshot {
  quantity: number;
}

export function loadGuestCart(): GuestCartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestCartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: GuestCartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

export function clearGuestCart() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function guestLineToCartItem(line: GuestCartLine): CartItem {
  return {
    id: line.variantId,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    lineTotal: line.unitPrice * line.quantity,
    variant: {
      id: line.variantId,
      sku: '',
      name: line.variantName,
      price: line.unitPrice,
      stock: line.stock,
      options: [],
    },
    product: {
      id: line.productId,
      name: line.productName,
      slug: line.productSlug,
      imageUrl: line.imageUrl,
    },
  };
}

export function buildGuestCart(items: GuestCartLine[]): Cart {
  const cartItems = items.map(guestLineToCartItem);
  const subtotal = cartItems.reduce((sum, i) => sum + i.lineTotal, 0);
  return {
    id: 'guest',
    items: cartItems,
    itemCount: cartItems.reduce((n, i) => n + i.quantity, 0),
    subtotal,
    updatedAt: new Date().toISOString(),
  };
}

export function addGuestLine(items: GuestCartLine[], snapshot: CartItemSnapshot, quantity: number): GuestCartLine[] {
  const existing = items.find((i) => i.variantId === snapshot.variantId);
  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, snapshot.stock);
    return items.map((i) =>
      i.variantId === snapshot.variantId ? { ...i, quantity: newQty } : i,
    );
  }
  return [...items, { ...snapshot, quantity: Math.min(quantity, snapshot.stock) }];
}

export function updateGuestQuantity(items: GuestCartLine[], variantId: string, quantity: number): GuestCartLine[] {
  if (quantity < 1) {
    return items.filter((i) => i.variantId !== variantId);
  }
  return items.map((i) =>
    i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.stock) } : i,
  );
}

export function removeGuestLine(items: GuestCartLine[], variantId: string): GuestCartLine[] {
  return items.filter((i) => i.variantId !== variantId);
}
