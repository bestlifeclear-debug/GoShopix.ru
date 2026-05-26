import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@goshopix/shared';
import type { OrderArchiveItem, OrderArchiveStatus } from './types';
import './orders-list.css';

type OrderCardProps = {
  order: OrderArchiveItem;
  onOpen?: (orderId: string) => void;
  onRepeat?: (orderId: string) => void;
};

const STATUS_BADGE: Record<OrderArchiveStatus, string> = {
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
};

export function OrderCard({ order, onOpen, onRepeat }: OrderCardProps) {
  const handleOpen = () => onOpen?.(order.id);

  return (
    <article className="mb-4">
      <div
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onClick={onOpen ? handleOpen : undefined}
        onKeyDown={
          onOpen
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpen();
                }
              }
            : undefined
        }
        className={[
          'rounded-2xl border border-gray-100 bg-white p-4 shadow-sm',
          'transition-transform active:scale-[0.98]',
          onOpen ? 'cursor-pointer' : '',
        ].join(' ')}
      >
        <header className="flex items-start justify-between gap-3 border-b border-gray-50 pb-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">№ {order.orderNumber}</p>
            <time className="mt-0.5 block text-xs text-gray-500">{order.date}</time>
          </div>
          <span
            className={[
              'w-fit shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
              STATUS_BADGE[order.status],
            ].join(' ')}
          >
            {order.statusLabel}
          </span>
        </header>

        <div className="flex items-center gap-3 pt-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-50">
            {order.productImageUrl ? (
              <img
                src={order.productImageUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center text-lg font-semibold text-gray-300"
                aria-hidden
              >
                {order.productName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-gray-800">{order.productName}</p>
            {order.extraItemsCount > 0 ? (
              <p className="mt-0.5 text-xs text-gray-400">
                + ещё {order.extraItemsCount}{' '}
                {order.extraItemsCount === 1
                  ? 'товар'
                  : order.extraItemsCount < 5
                    ? 'товара'
                    : 'товаров'}
              </p>
            ) : null}
            <p className="mt-1.5 text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
          </div>

          <button
            type="button"
            className="shrink-0 rounded-full p-2 text-[#FF7062] transition-colors active:bg-[#FF7062]/10"
            aria-label="Повторить заказ"
            onClick={(e) => {
              e.stopPropagation();
              onRepeat?.(order.id);
            }}
          >
            <ShoppingCart size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
