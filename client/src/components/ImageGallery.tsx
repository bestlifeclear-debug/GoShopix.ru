import { useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '../design-system/icons/Icons';
import { Modal } from '../design-system';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  images: { url: string; alt?: string | null }[];
  name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const list = images.length > 0 ? images : [{ url: '', alt: name }];
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const main = list[active] ?? list[0];

  const go = (dir: -1 | 1) => {
    setActive((i) => (i + dir + list.length) % list.length);
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mainWrap}>
        <button
          type="button"
          className={styles.main}
          onClick={() => main.url && setZoomOpen(true)}
          aria-label="Увеличить изображение"
        >
          {main.url ? (
            <img src={main.url} alt={main.alt ?? name} />
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
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className={styles.thumbs}>
          {list.map((img, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
              onClick={() => setActive(i)}
            >
              {img.url ? <img src={img.url} alt="" /> : <span />}
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
