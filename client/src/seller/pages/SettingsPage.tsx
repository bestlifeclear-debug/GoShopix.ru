import { useEffect, useState, type ReactNode } from 'react';
import {
  Building2,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Save,
  Store,
  Truck,
} from 'lucide-react';
import { sellerApi } from '../api/index';
import type { SellerStore } from '../api/types';
import { Loader } from '../../design-system';
import shared from './shared/sellerPremium.module.css';

const DELIVERY_KEY = 'goshopix_seller_delivery';
const FINANCE_KEY = 'goshopix_seller_finance';

interface DeliverySettings {
  freeFrom: string;
  baseCost: string;
  daysMin: string;
  daysMax: string;
}

interface FinanceSettings {
  inn: string;
  ogrn: string;
  bankName: string;
  bik: string;
  account: string;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function IconField({
  label,
  icon,
  children,
  fullWidth,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? shared.formGridFull : undefined}>
      <label className={shared.fieldLabel}>{label}</label>
      <div className={shared.inputWrap}>
        <span className={shared.inputIcon} aria-hidden>
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
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
    freeFrom: '3000',
    baseCost: '299',
    daysMin: '2',
    daysMax: '7',
  });
  const [finance, setFinance] = useState<FinanceSettings>({
    inn: '7701234567',
    ogrn: '1234567890123',
    bankName: 'ПАО «Сбербанк»',
    bik: '044525225',
    account: '40702810123456789012',
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
    setFinance(
      loadJson(FINANCE_KEY, {
        inn: '7701234567',
        ogrn: '1234567890123',
        bankName: 'ПАО «Сбербанк»',
        bik: '044525225',
        account: '40702810123456789012',
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
    localStorage.setItem(FINANCE_KEY, JSON.stringify(finance));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!store) {
    return <Loader variant="block" label="Загружаем настройки…" />;
  }

  const inputClass = `${shared.fieldInput} ${shared.fieldInputWithIcon}`;

  return (
    <div className={shared.page}>
      <header className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Настройки магазина</h1>
        <p className={shared.pageSubtitle}>Профиль, доставка и реквизиты для выплат</p>
      </header>

      <form className={shared.formStack} onSubmit={save}>
        <section className={shared.formCard}>
          <h2 className={shared.formCardTitle}>Основная информация</h2>
          <div className={shared.formGrid}>
            <IconField label="Название магазина" icon={<Store size={18} strokeWidth={2} />} fullWidth>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </IconField>
            <div className={shared.formGridFull}>
              <label className={shared.fieldLabel}>Описание</label>
              <textarea
                className={shared.fieldTextarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <IconField label="Email" icon={<Mail size={18} strokeWidth={2} />}>
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </IconField>
            <IconField label="Телефон" icon={<Phone size={18} strokeWidth={2} />}>
              <input
                className={inputClass}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </IconField>
            <IconField label="Адрес склада / офиса" icon={<MapPin size={18} strokeWidth={2} />} fullWidth>
              <input
                className={inputClass}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </IconField>
            <div className={shared.formGridFull}>
              <label className={shared.checkboxRow}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Магазин активен и виден на витрине
              </label>
            </div>
          </div>
        </section>

        <section className={shared.formCard}>
          <h2 className={shared.formCardTitle}>Логистика и доставка</h2>
          <div className={shared.formGrid}>
            <IconField label="Бесплатная доставка от, ₽" icon={<Truck size={18} strokeWidth={2} />}>
              <input
                className={inputClass}
                inputMode="numeric"
                value={delivery.freeFrom}
                onChange={(e) => setDelivery({ ...delivery, freeFrom: e.target.value })}
              />
            </IconField>
            <IconField label="Базовая стоимость, ₽" icon={<Truck size={18} strokeWidth={2} />}>
              <input
                className={inputClass}
                inputMode="numeric"
                value={delivery.baseCost}
                onChange={(e) => setDelivery({ ...delivery, baseCost: e.target.value })}
              />
            </IconField>
            <IconField label="Срок доставки от (дней)" icon={<Truck size={18} strokeWidth={2} />}>
              <input
                className={inputClass}
                inputMode="numeric"
                value={delivery.daysMin}
                onChange={(e) => setDelivery({ ...delivery, daysMin: e.target.value })}
              />
            </IconField>
            <IconField label="Срок доставки до (дней)" icon={<Truck size={18} strokeWidth={2} />}>
              <input
                className={inputClass}
                inputMode="numeric"
                value={delivery.daysMax}
                onChange={(e) => setDelivery({ ...delivery, daysMax: e.target.value })}
              />
            </IconField>
          </div>
        </section>

        <section className={shared.formCard}>
          <h2 className={shared.formCardTitle}>Финансовые реквизиты</h2>
          <div className={shared.formGrid}>
            <IconField label="ИНН" icon={<Building2 size={18} strokeWidth={2} />}>
              <input
                className={inputClass}
                value={finance.inn}
                onChange={(e) => setFinance({ ...finance, inn: e.target.value })}
              />
            </IconField>
            <IconField label="ОГРН" icon={<Building2 size={18} strokeWidth={2} />}>
              <input
                className={inputClass}
                value={finance.ogrn}
                onChange={(e) => setFinance({ ...finance, ogrn: e.target.value })}
              />
            </IconField>
            <IconField label="Банк" icon={<CreditCard size={18} strokeWidth={2} />} fullWidth>
              <input
                className={inputClass}
                value={finance.bankName}
                onChange={(e) => setFinance({ ...finance, bankName: e.target.value })}
              />
            </IconField>
            <IconField label="БИК" icon={<CreditCard size={18} strokeWidth={2} />}>
              <input
                className={inputClass}
                value={finance.bik}
                onChange={(e) => setFinance({ ...finance, bik: e.target.value })}
              />
            </IconField>
            <IconField label="Расчётный счёт" icon={<CreditCard size={18} strokeWidth={2} />}>
              <input
                className={inputClass}
                value={finance.account}
                onChange={(e) => setFinance({ ...finance, account: e.target.value })}
              />
            </IconField>
          </div>
        </section>

        <div className={shared.formFooter}>
          <button type="submit" className={shared.btnSave}>
            <Save size={18} strokeWidth={2} aria-hidden />
            Сохранить
          </button>
          {saved && <p className={shared.savedHint}>Настройки сохранены</p>}
        </div>
      </form>
    </div>
  );
}
