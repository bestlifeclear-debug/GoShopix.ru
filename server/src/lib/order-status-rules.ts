import { OrderStatus, StatusActorRole, UserRole } from '@prisma/client';
import type { OrderStatusSlug } from '@goshopix/shared';
import { AppError } from './errors.js';

/** Допустимые переходы статуса */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.pending]: [OrderStatus.processing, OrderStatus.cancelled],
  [OrderStatus.processing]: [OrderStatus.shipped, OrderStatus.cancelled],
  [OrderStatus.shipped]: [OrderStatus.delivered],
  [OrderStatus.delivered]: [OrderStatus.refunded],
  [OrderStatus.cancelled]: [],
  [OrderStatus.refunded]: [],
};

/** Автоматические переходы после действия */
export const AUTO_AFTER: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.pending]: OrderStatus.processing,
};

const ROLE_TRANSITIONS: Record<UserRole, OrderStatus[]> = {
  CUSTOMER: [OrderStatus.cancelled],
  SELLER: [
    OrderStatus.processing,
    OrderStatus.shipped,
    OrderStatus.delivered,
    OrderStatus.cancelled,
  ],
  ADMIN: Object.values(OrderStatus),
};

export function getAllowedTransitions(
  current: OrderStatus,
  actorRole: UserRole | 'SYSTEM',
): OrderStatus[] {
  const graph = STATUS_TRANSITIONS[current];
  if (actorRole === 'SYSTEM' || actorRole === 'ADMIN') return graph;
  const roleAllowed = ROLE_TRANSITIONS[actorRole as UserRole] ?? [];
  return graph.filter((s) => roleAllowed.includes(s));
}

export function assertStatusTransition(
  current: OrderStatus,
  next: OrderStatus,
  actorRole: UserRole | 'SYSTEM',
): void {
  const allowed = getAllowedTransitions(current, actorRole);
  if (!allowed.includes(next)) {
    throw new AppError(
      400,
      `Недопустимый переход статуса: ${current} → ${next} для роли ${actorRole}`,
    );
  }
}

export function toActorRole(role: UserRole | 'SYSTEM'): StatusActorRole {
  if (role === 'SYSTEM') return StatusActorRole.SYSTEM;
  return role as StatusActorRole;
}

export function isProgressStatus(status: string): status is OrderStatusSlug {
  return ['pending', 'processing', 'shipped', 'delivered'].includes(status);
}
