import { OrderStatus } from '@prisma/client';

import { AppError } from './errors.js';

import { assertStatusTransition, getAllowedTransitions } from './order-status-rules.js';



export const PRICE_MIN = 0.01;

export const PRICE_MAX = 9_999_999.99;

export const STOCK_MIN = 0;

export const STOCK_MAX = 999_999;

export const QUANTITY_MAX = 99;



const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;



export function assertValidPrice(price: number, field = 'price'): void {

  if (!Number.isFinite(price) || price < PRICE_MIN || price > PRICE_MAX) {

    throw new AppError(400, `${field} must be between ${PRICE_MIN} and ${PRICE_MAX}`);

  }

}



export function assertValidStock(stock: number, field = 'stock'): void {

  if (!Number.isInteger(stock) || stock < STOCK_MIN || stock > STOCK_MAX) {

    throw new AppError(400, `${field} must be an integer between ${STOCK_MIN} and ${STOCK_MAX}`);

  }

}



export function assertValidSlug(slug: string): void {

  if (!SLUG_REGEX.test(slug)) {

    throw new AppError(

      400,

      'slug must contain only lowercase letters, numbers and hyphens',

    );

  }

}



export function slugify(name: string): string {

  return name

    .toLowerCase()

    .trim()

    .replace(/[^a-z0-9]+/g, '-')

    .replace(/^-+|-+$/g, '')

    .slice(0, 80);

}



/** @deprecated use getAllowedTransitions from order-status-rules */

export const SELLER_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = Object.fromEntries(

  Object.values(OrderStatus).map((s) => [s, getAllowedTransitions(s, 'SELLER')]),

) as Record<OrderStatus, OrderStatus[]>;



export function assertSellerStatusTransition(current: OrderStatus, next: OrderStatus): void {

  assertStatusTransition(current, next, 'SELLER');

}

