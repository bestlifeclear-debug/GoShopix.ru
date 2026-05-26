import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, MoreVertical, Pencil, Star, Trash2, Truck } from 'lucide-react';
import {
  formatCdekAddress,
  formatPostAddress,
  readSavedAddresses,
  type SavedAddress,
  writeSavedAddresses,
} from '../../lib/savedAddresses';
import { writeDeliveryCity } from '../../lib/deliveryCity';
import { AddressFormModal, type AddressFormValues } from './AddressFormModal';
import { AddressesMobileToolbar } from './AddressesMobileToolbar';
import { EmptyAddressesState } from './EmptyAddressesState';
import { useAccountMobileLayout } from './useAccountMobileLayout';
import styles from './AccountAddresses.module.css';

interface AccountAddressesProps {
  onBack?: () => void;
}

function buildAddress(values: AddressFormValues, id: string): SavedAddress {
  const label = values.label.trim() || 'Адрес';
  const city = values.city.trim();
  if (values.deliveryMethod === 'post') {
    const fullAddress = formatPostAddress({
      index: values.index,
      city,
      street: values.street,
      house: values.house,
      apartment: values.apartment,
    });
    return {
      id,
      label,
      city,
      deliveryMethod: 'post',
      fullAddress,
      isDefault: values.isDefault,
      index: values.index.replace(/\D/g, '').slice(0, 6),
      street: values.street.trim(),
      house: values.house.trim(),
      apartment: values.apartment.trim() || undefined,
    };
  }
  const pickupPoint = values.pickupPoint.trim();
  return {
    id,
    label,
    city,
    deliveryMethod: 'cdek',
    fullAddress: formatCdekAddress({ city, pickupPoint }),
    isDefault: values.isDefault,
    pickupPoint,
  };
}

function applyDefault(addresses: SavedAddress[], defaultId: string): SavedAddress[] {
  return addresses.map((a) => ({ ...a, isDefault: a.id === defaultId }));
}

export function AccountAddresses({ onBack }: AccountAddressesProps) {
  const navigate = useNavigate();
  const isCompactMobile = useAccountMobileLayout();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);

  const load = useCallback(() => {
    setAddresses(readSavedAddresses());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = (next: SavedAddress[]) => {
    writeSavedAddresses(next);
    setAddresses(next);
  };

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
    setMenuId(null);
  };

  const openEdit = (addr: SavedAddress) => {
    setEditing(addr);
    setModalOpen(true);
    setMenuId(null);
  };

  const handleSave = (values: AddressFormValues, editingId: string | null) => {
    const id = editingId ?? `addr-${Date.now()}`;
    const nextItem = buildAddress(values, id);
    let next = editingId
      ? addresses.map((a) => (a.id === editingId ? nextItem : a))
      : [...addresses, nextItem];

    if (values.isDefault || next.length === 1) {
      next = applyDefault(next, id);
    } else if (editingId && addresses.find((a) => a.id === editingId)?.isDefault && !values.isDefault) {
      const fallback = next.find((a) => a.id !== id);
      if (fallback) next = applyDefault(next, fallback.id);
    }

    if (values.isDefault) {
      writeDeliveryCity(values.city.trim());
    }

    persist(next);
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    const target = addresses.find((a) => a.id === id);
    if (!target) return;
    if (!window.confirm(`Удалить адрес «${target.label}»?`)) return;
    let next = addresses.filter((a) => a.id !== id);
    if (target.isDefault && next.length > 0) {
      next = applyDefault(next, next[0].id);
    }
    persist(next);
    setMenuId(null);
  };

  const handleSetDefault = (id: string) => {
    const item = addresses.find((a) => a.id === id);
    if (!item) return;
    writeDeliveryCity(item.city);
    persist(applyDefault(addresses, id));
    setMenuId(null);
  };

  return (
    <div className={styles.root}>
      {isCompactMobile ? (
        <AddressesMobileToolbar count={addresses.length} onBack={onBack} onAdd={openAdd} />
      ) : (
        <header className={styles.desktopHead}>
          <div>
            <h1 className={styles.desktopTitle}>Адреса доставки</h1>
            <p className={styles.desktopLead}>
              Сохранённые адреса подставляются при оформлении заказа в корзине
            </p>
          </div>
          <button type="button" className={styles.addBtnDesktop} onClick={openAdd}>
            Добавить адрес
          </button>
        </header>
      )}

      {isCompactMobile ? (
        <p className="mb-3 px-0.5 text-sm leading-snug text-gray-500">
          Сохранённые адреса подставляются при оформлении заказа
        </p>
      ) : null}

      {addresses.length === 0 ? (
        <EmptyAddressesState onAdd={openAdd} />
      ) : (
        <ul className={styles.list} aria-label="Сохранённые адреса">
          {addresses.map((addr) => (
            <li key={addr.id} className="relative">
              <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100/90">
                <div className="flex items-start gap-3 px-3.5 py-3">
                  <span
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7062]/10 text-[#FF7062]"
                    aria-hidden
                  >
                    {addr.deliveryMethod === 'cdek' ? (
                      <Truck size={18} strokeWidth={2} />
                    ) : (
                      <MapPin size={18} strokeWidth={2} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{addr.label}</p>
                      {addr.isDefault ? (
                        <span className="rounded-md bg-[#FF7062]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FF7062]">
                          По умолчанию
                        </span>
                      ) : null}
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        {addr.deliveryMethod === 'cdek' ? 'СДЭК' : 'Почта'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-gray-500">{addr.city}</p>
                    <p className="mt-1 text-sm leading-snug text-gray-700">{addr.fullAddress}</p>
                  </div>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 active:bg-gray-100"
                      aria-label="Действия с адресом"
                      aria-expanded={menuId === addr.id}
                      onClick={() => setMenuId((id) => (id === addr.id ? null : addr.id))}
                    >
                      <MoreVertical size={18} aria-hidden />
                    </button>
                    {menuId === addr.id ? (
                      <ul
                        className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[11rem] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
                        role="menu"
                      >
                        {!addr.isDefault ? (
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 active:bg-gray-50"
                              onClick={() => handleSetDefault(addr.id)}
                            >
                              <Star size={16} className="text-[#FF7062]" aria-hidden />
                              Сделать основным
                            </button>
                          </li>
                        ) : null}
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 active:bg-gray-50"
                            onClick={() => openEdit(addr)}
                          >
                            <Pencil size={16} aria-hidden />
                            Изменить
                          </button>
                        </li>
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 active:bg-red-50"
                            onClick={() => handleDelete(addr.id)}
                          >
                            <Trash2 size={16} aria-hidden />
                            Удалить
                          </button>
                        </li>
                      </ul>
                    ) : null}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {addresses.length > 0 ? (
        <p className="mt-4 text-center">
          <button
            type="button"
            className="text-sm font-semibold text-[#FF7062] active:opacity-80"
            onClick={() => navigate('/cart')}
          >
            Перейти в корзину
          </button>
        </p>
      ) : null}

      <AddressFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
