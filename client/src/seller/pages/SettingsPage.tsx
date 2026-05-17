import { useEffect, useState } from 'react';
import { Button, Input } from '../../design-system';
import { sellerApi } from '../api/index';
import type { SellerStore } from '../api/types';
import styles from './sellerPages.module.css';

const DELIVERY_KEY = 'goshopix_seller_delivery';
const PROMO_KEY = 'goshopix_seller_promos';

interface DeliverySettings {
  freeFrom: string;
  baseCost: string;
  daysMin: string;
  daysMax: string;
}

interface PromoSettings {
  enabled: boolean;
  discountPercent: string;
  label: string;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function SettingsPage() {
  const [store, setStore] = useState<SellerStore | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [delivery, setDelivery] = useState<DeliverySettings>({
    freeFrom: '',
    baseCost: '',
    daysMin: '2',
    daysMax: '7',
  });
  const [promo, setPromo] = useState<PromoSettings>({
    enabled: false,
    discountPercent: '10',
    label: 'Скидка',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    sellerApi.store.get().then((s) => {
      setStore(s);
      setName(s.name);
      setDescription(s.description);
      setEmail(s.email ?? '');
      setPhone(s.phone ?? '');
      setAddress(s.address ?? '');
      setIsActive(s.isActive);
    });
    setDelivery(
      loadJson(DELIVERY_KEY, {
        freeFrom: '3000',
        baseCost: '299',
        daysMin: '2',
        daysMax: '7',
      }),
    );
    setPromo(
      loadJson(PROMO_KEY, {
        enabled: false,
        discountPercent: '10',
        label: 'Скидка',
      }),
    );
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await sellerApi.store.update({
      name,
      description,
      email: email || null,
      phone: phone || null,
      address: address || null,
      isActive,
    });
    localStorage.setItem(DELIVERY_KEY, JSON.stringify(delivery));
    localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!store) return <p>Загрузка…</p>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Настройки магазина</h1>
      <form className={styles.formGrid} onSubmit={save}>
        <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} />
        <label>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />{' '}
          Магазин активен
        </label>

        <h2 className={styles.sectionTitle}>Доставка (локально)</h2>
        <Input
          label="Бесплатно от, ₽"
          value={delivery.freeFrom}
          onChange={(e) => setDelivery({ ...delivery, freeFrom: e.target.value })}
        />
        <Input
          label="Базовая стоимость, ₽"
          value={delivery.baseCost}
          onChange={(e) => setDelivery({ ...delivery, baseCost: e.target.value })}
        />
        <Input
          label="Срок от (дней)"
          value={delivery.daysMin}
          onChange={(e) => setDelivery({ ...delivery, daysMin: e.target.value })}
        />
        <Input
          label="Срок до (дней)"
          value={delivery.daysMax}
          onChange={(e) => setDelivery({ ...delivery, daysMax: e.target.value })}
        />

        <h2 className={styles.sectionTitle}>Акции (локально)</h2>
        <label>
          <input
            type="checkbox"
            checked={promo.enabled}
            onChange={(e) => setPromo({ ...promo, enabled: e.target.checked })}
          />{' '}
          Показывать акцию на витрине (демо)
        </label>
        <Input
          label="Подпись"
          value={promo.label}
          onChange={(e) => setPromo({ ...promo, label: e.target.value })}
        />
        <Input
          label="Скидка, %"
          value={promo.discountPercent}
          onChange={(e) => setPromo({ ...promo, discountPercent: e.target.value })}
        />

        <Button type="submit">Сохранить</Button>
        {saved && <p>Сохранено</p>}
      </form>
    </div>
  );
}
