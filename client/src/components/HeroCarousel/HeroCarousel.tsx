import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft, IconChevronRight } from '../../design-system/icons/Icons';
import styles from './HeroCarousel.module.css';

const AUTOPLAY_MS = 4000;
const SWIPE_THRESHOLD_PX = 48;

const SLIDES = [
  {
    id: 'mega-sale',
    promo: '−30%',
    floatBadge: 'Акция',
    eyebrow: 'Мега-распродажа',
    title: 'Техника со скидкой до 30%',
    text: 'Смартфоны, ноутбуки и гаджеты — только до конца недели.',
    image: '/product-images/gophone-x-1.svg',
    imageAlt: 'Смартфон',
    tone: 'rose',
    cta: { to: '/catalog?categorySlug=electronics', label: 'Купить со скидкой' },
  },
  {
    id: 'clothing',
    promo: '−40%',
    floatBadge: '−50%',
    eyebrow: 'Мода и стиль',
    title: 'Одежда и обувь — сезонные цены',
    text: 'Куртки, кроссовки и базовый гардероб от топ-продавцов.',
    image: '/product-images/urban-wind-jacket-1.svg',
    imageAlt: 'Куртка',
    tone: 'plum',
    cta: { to: '/catalog?categorySlug=clothing', label: 'Купить со скидкой' },
  },
  {
    id: 'audio',
    promo: 'ХИТ',
    floatBadge: 'Топ недели',
    eyebrow: 'Бестселлер',
    title: 'Наушники и аудио — топ недели',
    text: 'Проверенные модели с тысячами отзывов.',
    image: '/product-images/soundwave-pro-1.svg',
    imageAlt: 'Наушники',
    tone: 'dark',
    cta: { to: '/catalog?sort=popular', label: 'Купить со скидкой' },
  },
  {
    id: 'laptops',
    promo: 'NEW',
    floatBadge: 'Новинка',
    eyebrow: 'Новинки',
    title: 'Ноутбуки для работы и учёбы',
    text: 'Мощные конфигурации с быстрой доставкой.',
    image: '/product-images/probook-15-1.svg',
    imageAlt: 'Ноутбук',
    tone: 'light',
    cta: { to: '/catalog?sort=newest', label: 'Смотреть новинки' },
  },
  {
    id: 'delivery',
    promo: '0 ₽',
    floatBadge: '0 ₽ доставка',
    eyebrow: 'Бесплатная доставка',
    title: 'Заказ от 2 000 ₽ — доставка бесплатно',
    text: 'Соберите корзину и получите доставку в ПВЗ за 0 ₽.',
    image: '/product-images/street-run-sneakers-1.svg',
    imageAlt: 'Кроссовки',
    tone: 'rose',
    cta: { to: '/catalog', label: 'Купить со скидкой' },
  },
] as const;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    setPaused(true);
  };

  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    setPaused(false);
    if (start == null) return;
    const endX = e.changedTouches[0]?.clientX ?? start;
    const delta = endX - start;
    if (delta > SWIPE_THRESHOLD_PX) prev();
    else if (delta < -SWIPE_THRESHOLD_PX) next();
  };

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label="Акции и предложения"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.viewport}>
        <div className={styles.track} style={{ transform: `translateX(-${index * 100}%)` }}>
          {SLIDES.map((slide) => (
            <article
              key={slide.id}
              className={`${styles.slide} ${styles[slide.tone]}`}
              aria-hidden={SLIDES[index].id !== slide.id}
            >
              <div className={styles.slideInner}>
                <div className={styles.copy}>
                  <span className={styles.promoRibbon}>{slide.promo}</span>
                  <p className={styles.eyebrow}>{slide.eyebrow}</p>
                  <h1 className={styles.title}>{slide.title}</h1>
                  <p className={styles.text}>{slide.text}</p>
                  <Link to={slide.cta.to} className={styles.btnCta}>
                    {slide.cta.label}
                  </Link>
                </div>
                <div className={styles.visual}>
                  <span className={styles.floatBadge}>{slide.floatBadge}</span>
                  <div className={styles.imageFrame}>
                    <img src={slide.image} alt={slide.imageAlt} className={styles.productImage} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <button type="button" className={styles.arrowPrev} onClick={prev} aria-label="Назад">
        <IconChevronLeft />
      </button>
      <button type="button" className={styles.arrowNext} onClick={next} aria-label="Вперёд">
        <IconChevronRight />
      </button>

      <div className={styles.dots} role="tablist">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Слайд ${i + 1}`}
            className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  );
}
