import { useMemo } from 'react';
import { Minus, Plus, Trash2, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@goshopix/shared';
import type { CartItem } from '../../api/types';
import { CART_DELIVERY_ESTIMATE_FROM, type CartLineTotals } from '../../lib/checkoutSelection';
import { formatEstimatedDeliveryDate } from '../../lib/cartDeliveryDate';
import { CartItemCheckbox } from './CartItemCheckbox';

interface MobileCartListProps {
  items: CartItem[];
  compareAtByProduct: Record<string, number | null>;
  selectedIds: Set<string>;
  lineTotals: CartLineTotals;
  onToggleItem: (itemId: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  selectedCount: number;
  onCheckout: () => void;
}

function getLinePricing(item: CartItem, compareAt: number | null | undefined) {
  const unitCompareAt =
    compareAt != null && compareAt > item.unitPrice ? compareAt : null;
  const oldLineTotal = unitCompareAt != null ? unitCompareAt * item.quantity : null;
  return { oldLineTotal, lineTotal: item.lineTotal };
}

export function MobileCartList({
  items,
  compareAtByProduct,
  selectedIds,
  lineTotals,
  onToggleItem,
  onToggleAll,
  allSelected,
  onUpdateQuantity,
  onRemoveItem,
  selectedCount,
  onCheckout,
}: MobileCartListProps) {
  const deliveryDateLabel = useMemo(() => formatEstimatedDeliveryDate(7), []);
  const hasSelection = selectedCount > 0;

  const deliverySummaryLine = lineTotals.freeDelivery
    ? 'Доставка: бесплатно'
    : `Доставка от ${formatPrice(CART_DELIVERY_ESTIMATE_FROM)}`;

  return (
    <div className="hidden max-md:flex flex-col gap-2">
      <div className="flex items-center gap-0 px-0 pb-1">
        <CartItemCheckbox
          checked={allSelected}
          onChange={() => onToggleAll()}
          ariaLabel="Выбрать все товары"
        />
        <button
          type="button"
          className="min-h-11 cursor-pointer border-0 bg-transparent px-1 py-2 text-sm font-medium text-gray-700"
          onClick={onToggleAll}
        >
          Выбрать всё
        </button>
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0 pb-[calc(11.5rem+env(safe-area-inset-bottom,0px))]">
        {items.map((item) => {
          const isSelected = selectedIds.has(item.id);
          const compareAt = compareAtByProduct[item.product.id];
          const { oldLineTotal, lineTotal } = getLinePricing(item, compareAt);

          return (
            <li
              key={item.id}
              className={[
                'relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm',
                isSelected ? '' : 'opacity-75',
              ].join(' ')}
            >
              <button
                type="button"
                className="absolute top-1 right-1 z-10 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-gray-400 transition-colors duration-200 hover:text-gray-700"
                aria-label="Удалить товар"
                onClick={() => onRemoveItem(item.id)}
              >
                <Trash2 size={16} strokeWidth={1.75} aria-hidden />
              </button>

              <div className="flex min-w-0 gap-1 pr-8">
                <div className="flex shrink-0 items-start">
                  <CartItemCheckbox
                    checked={isSelected}
                    onChange={() => onToggleItem(item.id)}
                    ariaLabel={`Выбрать ${item.product.name}`}
                  />
                </div>

                <Link
                  to={`/product/${item.product.id}`}
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                >
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="block h-full w-full bg-gray-100" />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 no-underline visited:text-gray-900"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant.name ? (
                    <span className="text-xs text-gray-500">{item.variant.name}</span>
                  ) : null}
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <Truck size={12} strokeWidth={1.75} className="shrink-0" aria-hidden />
                    <span>Доставка ~{deliveryDateLabel}</span>
                  </p>
                </div>
              </div>

              <div className="mt-2.5 flex w-full min-w-0 items-center justify-between gap-2">
                <div className="flex w-[7.75rem] shrink-0 items-center justify-between rounded-[0.625rem] bg-gray-100 p-0.5">
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Уменьшить количество"
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    <Minus size={14} strokeWidth={2} aria-hidden />
                  </button>
                  <span className="min-w-6 text-center text-sm font-semibold text-gray-900 tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Увеличить количество"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.variant.stock}
                  >
                    <Plus size={14} strokeWidth={2} aria-hidden />
                  </button>
                </div>

                <div className="flex min-w-0 shrink-0 flex-col items-end gap-0.5">
                  {oldLineTotal != null ? (
                    <span className="text-xs leading-none font-medium text-gray-400 line-through tabular-nums">
                      {formatPrice(oldLineTotal)}
                    </span>
                  ) : null}
                  <span className="whitespace-nowrap text-sm font-bold text-gray-900 tabular-nums">
                    {formatPrice(lineTotal)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div
        className="fixed left-0 right-0 z-40 flex flex-col gap-2 border-t border-gray-100 bg-white px-3 pt-2.5 pb-3 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex flex-col gap-1">
          {lineTotals.discount > 0 && hasSelection ? (
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-emerald-700">Экономия</span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                −{formatPrice(lineTotals.discount)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
            <span>{deliverySummaryLine}</span>
            {!lineTotals.freeDelivery && lineTotals.subtotal > 0 && hasSelection ? (
              <span className="text-right text-[11px] leading-tight text-gray-500">
                ещё {formatPrice(lineTotals.deliveryRemaining)} до бесплатной
              </span>
            ) : null}
          </div>
          <div className="flex items-baseline justify-between gap-2 border-t border-gray-100 pt-1.5">
            <span className="text-sm font-medium text-gray-900">
              К оплате{selectedCount > 0 ? ` · ${selectedCount} шт.` : ''}
            </span>
            <strong className="text-xl font-bold leading-tight text-gray-900 tabular-nums">
              {formatPrice(lineTotals.subtotal)}
            </strong>
          </div>
        </div>
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl border-0 bg-gradient-to-r from-[#FF7062] to-[#FF3D2E] py-3 text-sm font-semibold text-white transition-[filter,transform] duration-150 hover:brightness-[1.03] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onCheckout}
          disabled={!hasSelection}
        >
          Перейти к оформлению
        </button>
        <p className="m-0 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-center text-[11px] leading-snug text-gray-500">
          <span className="inline-flex items-center gap-1">
            <img src="/payment-icons/mir.png" alt="" width={22} height={14} className="h-3.5 w-auto" />
            <img src="/payment-icons/sbp.png" alt="" width={14} height={14} className="h-3.5 w-3.5" />
          </span>
          <span>Безопасная оплата</span>
          <span aria-hidden>·</span>
          <Link to="/privacy" className="text-gray-500 underline-offset-2 hover:underline">
            Возврат 14 дней
          </Link>
        </p>
      </div>
    </div>
  );
}
