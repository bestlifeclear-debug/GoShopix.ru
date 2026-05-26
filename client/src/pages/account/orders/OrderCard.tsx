import type { MouseEvent, PointerEvent } from 'react';
import { Repeat2 } from 'lucide-react';
import { formatPrice } from '@goshopix/shared';
import type { OrderArchiveItem, OrderArchiveStatus } from './types';
import './orders-list.css';

type OrderCardProps = {
  order: OrderArchiveItem;
  onOpen?: (order: OrderArchiveItem) => void;
  onRepeat?: (order: OrderArchiveItem) => void;
};

const STATUS_BADGE: Record<OrderArchiveStatus, string> = {
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export function OrderCard({ order, onOpen, onRepeat }: OrderCardProps) {
  const canRepeat = order.status === 'delivered' && Boolean(onRepeat);

  const handleOpen = () => onOpen?.(order);

  const handleRepeat = (e: MouseEvent | PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRepeat?.(order);
  };

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
            <time className="mt-0.5 block text-[11px] text-gray-500" dateTime={order.sortAt}>
              {order.date}
            </time>
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
            <p className="mt-1 text-sm font-bold tabular-nums text-gray-900">
              {formatPrice(order.totalAmount)}
            </p>
          </div>

          {canRepeat ? (
            <button
              type="button"
              className="flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-[#FF7062]/10 px-2 py-2 text-[#FF7062] transition-colors active:bg-[#FF7062]/22"
              aria-label="Купить снова"
              onClick={handleRepeat}
              onPointerDown={handleRepeat}
            >
              <Repeat2 size={17} strokeWidth={2.25} aria-hidden className="shrink-0" />
              <span className="max-w-[3.5rem] text-center text-[9px] font-semibold leading-[1.15]">
                Купить снова
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
