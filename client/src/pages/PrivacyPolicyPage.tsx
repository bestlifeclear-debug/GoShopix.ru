import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteFooter } from '../components/layout/SiteFooter';
import { PRIVACY_NAV, PRIVACY_SECTIONS, PRIVACY_UPDATED, type PrivacyBlock } from './privacyPolicySections';
import styles from './legalPage.module.css';

function renderBlock(block: PrivacyBlock, index: number) {
  if (block.type === 'p') {
    return (
      <p key={index} className={styles.paragraph}>
        {block.text}
      </p>
    );
  }

  return (
    <ul key={index} className={styles.list}>
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function PrivacyPolicyPage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Политика конфиденциальности — GoShopix';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo} aria-label="GoShopix — на главную">
          <span className={styles.logoMark} aria-hidden>
            G
          </span>
          GoShopix
        </Link>
        <Link to="/" className={styles.backLink}>
          Назад в магазин
        </Link>
      </header>

      <main className={styles.main} id="main-content">
        <h1 className={styles.title}>Политика конфиденциальности</h1>
        <p className={styles.intro}>
          Настоящий документ описывает, как маркетплейс GoShopix собирает, использует, хранит и
          защищает персональные данные Пользователей. Пожалуйста, внимательно ознакомьтесь с
          Политикой перед использованием Сайта.
        </p>

        <nav className={styles.toc} aria-label="Содержание политики конфиденциальности">
          <p className={styles.tocTitle}>Содержание</p>
          <ul className={styles.tocList}>
            {PRIVACY_NAV.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className={styles.tocLink}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {PRIVACY_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className={styles.section}
            aria-labelledby={`${section.id}-title`}
          >
            <h2 id={`${section.id}-title`} className={styles.sectionTitle}>
              {section.title}
            </h2>
            {section.blocks.map((block, index) => renderBlock(block, index))}
          </section>
        ))}

        <p className={styles.updated}>Дата последнего обновления: {PRIVACY_UPDATED}</p>
      </main>

      <SiteFooter />
    </div>
  );
}
