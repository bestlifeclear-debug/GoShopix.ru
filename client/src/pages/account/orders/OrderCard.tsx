import { ChevronRight, ShoppingCart } from 'lucide-react';
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
          'rounded-2xl border border-gray-100/90 bg-white p-3.5 shadow-sm',
          'transition-transform active:scale-[0.99]',
          onOpen ? 'cursor-pointer' : '',
        ].join(' ')}
      >
        <header className="flex items-center justify-between gap-3 border-b border-gray-50 pb-2.5">
          <div className="min-w-0">
            <p className="text-[15px] font-bold tracking-tight text-gray-900">
              № {order.orderNumber}
            </p>
            <time className="mt-0.5 block text-xs text-gray-500">{order.date}</time>
          </div>
          <span
            className={[
              'w-fit shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-semibold',
              STATUS_BADGE[order.status],
            ].join(' ')}
          >
            {order.statusLabel}
          </span>
        </header>

        <div className="flex items-center gap-3 pt-2.5">
          <div className="h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100/80">
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
            <p className="line-clamp-2 text-sm leading-snug text-gray-800">{order.productName}</p>
            {order.extraItemsCount > 0 ? (
              <p className="mt-0.5 text-xs text-gray-400">
                + ещё {order.extraItemsCount} {pluralItems(order.extraItemsCount)}
              </p>
            ) : null}
            <p className="mt-1 text-[15px] font-bold text-gray-900">
              {formatPrice(order.totalAmount)}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1 self-stretch justify-center">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF7062]/10 text-[#FF7062] transition-colors active:bg-[#FF7062]/20"
              aria-label="Повторить заказ"
              onClick={(e) => {
                e.stopPropagation();
                onRepeat?.(order.id);
              }}
            >
              <ShoppingCart size={18} strokeWidth={1.75} aria-hidden />
            </button>
            {onOpen ? (
              <ChevronRight size={16} className="text-gray-300" strokeWidth={2} aria-hidden />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
