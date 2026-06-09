import { useCallback, useRef, useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '../design-system/icons/Icons';
import { Modal } from '../design-system';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  images: { url: string; alt?: string | null }[];
  name: string;
}

const SWIPE_THRESHOLD = 50;

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const list = images.length > 0 ? images : [{ url: '', alt: name }];
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTapTime = useRef(0);

  const main = list[active] ?? list[0];

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => (i + dir + list.length) % list.length);
    },
    [list.length],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null || list.length <= 1) return;

    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
    const deltaX = endX - touchStartX.current;
    const deltaY = endY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaY) > Math.abs(deltaX)) return;

    go(deltaX < 0 ? 1 : -1);
  };

  const handleMainClick = () => {
    if (!main.url) return;

    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      setZoomOpen(true);
      lastTapTime.current = 0;
      return;
    }
    lastTapTime.current = now;
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mainWrap}>
        <button
          type="button"
          className={styles.main}
          onClick={handleMainClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="Увеличить изображение. Двойной тап или свайп для навигации."
        >
          {main.url ? (
            <img src={main.url} alt={main.alt ?? name} draggable={false} />
          ) : (
            <div className={styles.placeholder}>Нет фото</div>
          )}
        </button>

        {list.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowPrev}`}
              onClick={() => go(-1)}
              aria-label="Предыдущее фото"
            >
              <IconChevronLeft />
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowNext}`}
              onClick={() => go(1)}
              aria-label="Следующее фото"
            >
              <IconChevronRight />
            </button>
            <span className={styles.counter}>
              {active + 1} / {list.length}
            </span>
            <div className={styles.dots} aria-hidden>
              {list.map((_, i) => (
                <span key={i} className={`${styles.dot} ${i === active ? styles.dotActive : ''}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className={styles.thumbs} role="tablist" aria-label="Миниатюры товара">
          {list.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Фото ${i + 1}`}
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
              onClick={() => setActive(i)}
            >
              {img.url ? <img src={img.url} alt="" draggable={false} /> : <span />}
            </button>
          ))}
        </div>
      )}

      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={name}>
        {main.url && <img src={main.url} alt={main.alt ?? name} className={styles.zoomImg} />}
      </Modal>
    </div>
  );
}
