import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  formatCdekAddress,
  formatPostAddress,
  groupAddressesByDelivery,
  readSavedAddresses,
  type SavedAddress,
  writeSavedAddresses,
} from '../../lib/savedAddresses';
import { writeDeliveryCity } from '../../lib/deliveryCity';
import { AddressFormModal, type AddressFormValues } from './AddressFormModal';
import { AddressesMobileToolbar } from './AddressesMobileToolbar';
import { EmptyAddressesState } from './EmptyAddressesState';
import { useAccountMobileLayout } from './useAccountMobileLayout';
import {
  AddAddressButton,
  AddressSectionHeader,
  CourierAddressCard,
  PickupAddressCard,
} from './addresses';
import './addresses/addresses.css';
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
    workingHours: { opensAt: '09:00', closesAt: '21:00' },
  };
}

function applyDefault(addresses: SavedAddress[], defaultId: string): SavedAddress[] {
  return addresses.map((a) => ({ ...a, isDefault: a.id === defaultId }));
}

function courierCountLabel(count: number): string {
  if (count === 1) return '1 адрес';
  if (count >= 2 && count <= 4) return `${count} адреса`;
  return `${count} адресов`;
}

function pickupCountLabel(count: number): string {
  if (count === 1) return '1 пункт';
  if (count >= 2 && count <= 4) return `${count} пункта`;
  return `${count} пунктов`;
}

export function AccountAddresses({ onBack }: AccountAddressesProps) {
  const navigate = useNavigate();
  const isCompactMobile = useAccountMobileLayout();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);

  const load = useCallback(() => {
    setAddresses(readSavedAddresses());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { courier, pickup } = useMemo(() => groupAddressesByDelivery(addresses), [addresses]);
  const defaultId = addresses.find((a) => a.isDefault)?.id ?? null;

  const persist = (next: SavedAddress[]) => {
    writeSavedAddresses(next);
    setAddresses(next);
  };

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (addr: SavedAddress) => {
    setEditing(addr);
    setModalOpen(true);
  };

  const handleSave = (values: AddressFormValues, editingId: string | null) => {
    const id = editingId ?? `addr-${Date.now()}`;
    const nextItem = buildAddress(values, id);
    let next = editingId
      ? addresses.map((a) =>
          a.id === editingId
            ? {
                ...a,
                ...nextItem,
                workingHours: nextItem.workingHours ?? a.workingHours,
                coordinates: a.coordinates,
              }
            : a,
        )
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
  };

  const handleSetDefault = (id: string) => {
    const item = addresses.find((a) => a.id === id);
    if (!item || item.isDefault) return;
    writeDeliveryCity(item.city);
    persist(applyDefault(addresses, id));
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
            <Plus size={18} strokeWidth={2.5} aria-hidden />
            Добавить адрес
          </button>
        </header>
      )}

      {isCompactMobile ? (
        <p className="addr-hint">Сохранённые адреса подставляются при оформлении заказа</p>
      ) : null}

      {addresses.length === 0 ? (
        <EmptyAddressesState onAdd={openAdd} />
      ) : (
        <div className={styles.sections}>
          {!isCompactMobile ? (
            <div className={styles.prominentAdd}>
              <AddAddressButton onClick={openAdd} />
            </div>
          ) : null}

          <section className={styles.section} aria-labelledby="courier-section-title">
            <AddressSectionHeader
              title="Курьерская доставка"
              count={courier.length}
              countLabel={courierCountLabel}
            />
            {courier.length === 0 ? (
              <AddAddressButton onClick={openAdd} variant="dashed" label="Добавить адрес доставки" />
            ) : (
              <ul className={styles.list} aria-label="Адреса курьерской доставки">
                {courier.map((addr) => (
                  <li key={addr.id}>
                    <CourierAddressCard
                      address={addr}
                      selected={defaultId === addr.id}
                      onSelect={() => handleSetDefault(addr.id)}
                      onEdit={() => openEdit(addr)}
                      onDelete={() => handleDelete(addr.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section} aria-labelledby="pickup-section-title">
            <AddressSectionHeader
              title="Пункты выдачи (ПВЗ)"
              count={pickup.length}
              countLabel={pickupCountLabel}
            />
            {pickup.length === 0 ? (
              <AddAddressButton onClick={openAdd} variant="dashed" label="Добавить пункт выдачи" />
            ) : (
              <ul className={styles.list} aria-label="Пункты выдачи заказов">
                {pickup.map((addr) => (
                  <li key={addr.id}>
                    <PickupAddressCard
                      address={addr}
                      selected={defaultId === addr.id}
                      onSelect={() => handleSetDefault(addr.id)}
                      onEdit={() => openEdit(addr)}
                      onDelete={() => handleDelete(addr.id)}
                      showMap
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {addresses.length > 0 ? (
        <div className={styles.cartCtaWrap}>
          <button type="button" className={styles.cartCta} onClick={() => navigate('/cart')}>
            Перейти в корзину
          </button>
        </div>
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
