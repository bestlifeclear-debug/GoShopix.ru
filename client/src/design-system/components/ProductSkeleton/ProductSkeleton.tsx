import styles from './ProductSkeleton.module.css';

/** Плейсхолдер карточки товара — заполняет сетку при неполной выдаче */
export function ProductSkeleton() {
  return (
    <article className={styles.card} aria-hidden>
      <div className={styles.media} />
      <div className={styles.body}>
        <span className={`${styles.line} ${styles.lineShort}`} />
        <span className={`${styles.line} ${styles.lineTitle}`} />
        <span className={`${styles.line} ${styles.lineMid}`} />
        <span className={`${styles.line} ${styles.linePrice}`} />
        <span className={styles.btn} />
      </div>
    </article>
  );
}
