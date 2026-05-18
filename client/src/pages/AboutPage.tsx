import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SiteFooter } from '../components/layout/SiteFooter';
import {
  ABOUT_HISTORY,
  ABOUT_METRICS,
  ABOUT_NAV,
  ABOUT_TECH,
  ABOUT_UPDATED,
  ABOUT_VALUES,
} from './aboutPageContent';
import { IconChart, IconChip, IconHeart, IconHistory } from './AboutPageIcons';
import aboutStyles from './AboutPage.module.css';
import legal from './legalPage.module.css';

function SectionHead({
  icon,
  title,
  id,
}: {
  icon: ReactNode;
  title: string;
  id: string;
}) {
  return (
    <div className={legal.sectionHead}>
      <span className={legal.sectionIcon}>{icon}</span>
      <h2 id={id} className={legal.sectionTitle}>
        {title}
      </h2>
    </div>
  );
}

export function AboutPage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'О нас — GoShopix';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className={legal.page}>
      <header className={legal.header}>
        <Link to="/" className={legal.logo} aria-label="GoShopix — на главную">
          <span className={legal.logoMark} aria-hidden>
            G
          </span>
          GoShopix
        </Link>
        <Link to="/" className={legal.backLink}>
          Назад в магазин
        </Link>
      </header>

      <main className={legal.main} id="main-content">
        <h1 className={legal.title}>О нас</h1>
        <p className={legal.intro}>
          Привет! Мы — GoShopix. Мы верим, что онлайн‑шопинг должен быть лёгким, приятным и
          надёжным. Наш маркетплейс объединяет тысячи товаров, проверенных продавцов и современные
          технологии — чтобы вы находили нужное быстрее, а продавцы росли вместе с нами.
        </p>

        <nav className={legal.toc} aria-label="Содержание страницы «О нас»">
          <p className={legal.tocTitle}>Содержание</p>
          <ul className={legal.tocList}>
            {ABOUT_NAV.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className={legal.tocLink}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section id="history" className={legal.section} aria-labelledby="history-title">
          <SectionHead
            icon={<IconHistory className={legal.sectionIcon} />}
            title="История создания"
            id="history-title"
          />
          <ol className={aboutStyles.timeline}>
            {ABOUT_HISTORY.map((item) => (
              <li key={item.year}>
                <span className={aboutStyles.year}>{item.year}</span>
                <p className={aboutStyles.timelineText}>{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="mission" className={legal.section} aria-labelledby="mission-title">
          <SectionHead
            icon={<IconHeart className={legal.sectionIcon} />}
            title="Миссия и ценности"
            id="mission-title"
          />
          <p className={legal.paragraph}>
            Мы только в начале пути — и очень хотим, чтобы вы стали нашими партнёрами в развитии.
            Делитесь идеями: что добавить, улучшить или изменить. Ваше мнение поможет сделать GoShopix
            ещё удобнее и выгоднее.
          </p>
          <div className={aboutStyles.values}>
            {ABOUT_VALUES.map((value) => (
              <article key={value.title} className={aboutStyles.valueCard}>
                <h3 className={aboutStyles.valueTitle}>{value.title}</h3>
                <p className={aboutStyles.valueText}>{value.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="tech" className={legal.section} aria-labelledby="tech-title">
          <SectionHead icon={<IconChip className={legal.sectionIcon} />} title="Технологии" id="tech-title" />
          <ul className={legal.list}>
            {ABOUT_TECH.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="achievements" className={legal.section} aria-labelledby="achievements-title">
          <SectionHead
            icon={<IconChart className={legal.sectionIcon} />}
            title="Наши достижения"
            id="achievements-title"
          />
          <ul className={aboutStyles.metrics} aria-label="Ключевые показатели GoShopix">
            {ABOUT_METRICS.map((metric) => (
              <li key={metric.label}>
                <div className={aboutStyles.metricCard}>
                  <span className={aboutStyles.metricValue}>{metric.value}</span>
                  <span className={aboutStyles.metricLabel}>{metric.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <p className={legal.updated}>Дата последнего обновления: {ABOUT_UPDATED}</p>
      </main>

      <SiteFooter />
    </div>
  );
}
