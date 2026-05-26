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
  cancelled: 'bg-gray-100 text-gray-500',
};

function pluralItems(n: number): string {
  if (n === 1) return 'товар';
  if (n >= 2 && n <= 4) return 'товара';
  return 'товаров';
}

export function OrderCard({ order, onOpen, onRepeat }: OrderCardProps) {
  const handleOpen = () => onOpen?.(order.id);

  return (
    <article>
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
          'overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100/90',
          'transition-transform active:scale-[0.99]',
          onOpen ? 'cursor-pointer' : '',
        ].join(' ')}
      >
        <header className="flex items-center justify-between gap-2 border-b border-gray-50 px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">№ {order.orderNumber}</p>
            <time className="mt-0.5 block text-[11px] text-gray-500">{order.date}</time>
          </div>
          <span
            className={[
              'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold leading-tight',
              STATUS_BADGE[order.status],
            ].join(' ')}
          >
            {order.statusLabel}
          </span>
        </header>

        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50 ring-1 ring-gray-100">
            {order.productImageUrl ? (
              <img
                src={order.productImageUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center text-base font-semibold text-gray-300"
                aria-hidden
              >
                {order.productName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[13px] leading-snug text-gray-800">{order.productName}</p>
            {order.extraItemsCount > 0 ? (
              <p className="mt-0.5 text-[11px] text-gray-400">
                + ещё {order.extraItemsCount} {pluralItems(order.extraItemsCount)}
              </p>
            ) : null}
            <p className="mt-1 text-sm font-bold tabular-nums text-gray-900">
              {formatPrice(order.totalAmount)}
            </p>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-full bg-[#FF7062]/12 text-[#FF7062] transition-colors active:bg-[#FF7062]/22"
            aria-label="Повторить заказ"
            onClick={(e) => {
              e.stopPropagation();
              onRepeat?.(order.id);
            }}
          >
            <ShoppingCart size={19} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
