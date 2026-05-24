import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { categoryHubThemeClass } from '../components/CategoryTiles/categoryHubTheme';
import { CATEGORY_HUB_TILES, catalogLinkForHubTile } from '../lib/categoryHubTiles';
import { categoryImageUrl } from '../lib/categoryImages';
import styles from './CategoriesHubPage.module.css';

function useMinWidth(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    setMatches(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function CategoriesHubPage() {
  const isDesktop = useMinWidth('(min-width: 768px)');
  if (isDesktop) return <Navigate to="/catalog" replace />;

  return (
    <PageContainer className={styles.pageWrap}>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Все категории</h1>
        </header>

        <ul className={styles.grid} aria-label="Главные категории">
          {CATEGORY_HUB_TILES.map((tile) => (
            <li key={tile.slug} className={styles.gridItem}>
              <Link to={catalogLinkForHubTile(tile.slug)} className={styles.card}>
                <span
                  className={`${styles.visual} ${categoryHubThemeClass(tile.slug, styles)}`}
                  aria-hidden
                >
                  <img
                    src={categoryImageUrl(tile.slug)}
                    alt=""
                    className={styles.productImage}
                    loading="lazy"
                  />
                </span>
                <span className={styles.cardLabel}>{tile.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PageContainer>
  );
}
