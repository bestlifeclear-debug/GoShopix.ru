import { Check, Minus } from 'lucide-react';
import shared from './shared/sellerPremium.module.css';
import styles from './TariffsPage.module.css';

interface TariffFeature {
  text: string;
}

interface TariffPlan {
  id: string;
  name: string;
  price: string;
  pricePeriod?: string;
  status?: string;
  features: TariffFeature[];
  variant: 'current' | 'coming';
}

const PLANS: TariffPlan[] = [
  {
    id: 'start',
    name: 'Start (Текущий)',
    price: '0 ₽',
    pricePeriod: '/мес',
    features: [
      { text: 'Полный доступ ко всем функциям кабинета' },
      { text: 'Комиссия с продаж: 6%' },
      { text: 'Лимит: до 50 товаров' },
    ],
    variant: 'current',
  },
  {
    id: 'premium',
    name: 'Premium',
    status: 'В разработке',
    price: '—',
    features: [
      { text: 'Размещение: —' },
      { text: 'Комиссия: —' },
      { text: 'Лимит: —' },
    ],
    variant: 'coming',
  },
  {
    id: 'ultra',
    name: 'Ultra',
    status: 'В разработке',
    price: '—',
    features: [
      { text: 'Размещение: —' },
      { text: 'Комиссия: —' },
      { text: 'Лимит: —' },
    ],
    variant: 'coming',
  },
];

function FeatureIcon({ current }: { current: boolean }) {
  if (current) {
    return <Check className={`${styles.featureIcon} ${styles.featureIconCurrent}`} size={18} strokeWidth={2.5} />;
  }
  return <Minus className={styles.featureIcon} size={18} strokeWidth={2} />;
}

export function TariffsPage() {
  return (
    <div className={shared.page}>
      <header className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Тарифный план</h1>
        <p className={shared.pageSubtitle}>Условия размещения и комиссии вашего магазина</p>
      </header>

      <div className={styles.tariffGrid}>
        {PLANS.map((plan) => {
          const isCurrent = plan.variant === 'current';
          return (
            <article
              key={plan.id}
              className={`${styles.tariffCard} ${isCurrent ? styles.tariffCardCurrent : styles.tariffCardMuted}`}
            >
              <div className={styles.tariffHeader}>
                <h2
                  className={`${styles.tariffName} ${isCurrent ? styles.tariffNameCurrent : ''}`}
                >
                  {plan.name}
                </h2>
                <p className={styles.tariffPrice}>
                  {plan.price}
                  {plan.pricePeriod && (
                    <span className={styles.tariffPricePeriod}>{plan.pricePeriod}</span>
                  )}
                </p>
                {plan.status && <span className={styles.tariffStatus}>{plan.status}</span>}
              </div>

              <ul className={styles.featureList}>
                {plan.features.map((feature) => (
                  <li key={feature.text} className={styles.featureItem}>
                    <FeatureIcon current={isCurrent} />
                    {feature.text}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button type="button" className={styles.btnCurrent} disabled>
                  Ваш текущий тариф
                </button>
              ) : (
                <button type="button" className={styles.btnDisabled} disabled>
                  Недоступно
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
