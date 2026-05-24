import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import { CountdownTimer } from '../CountdownTimer/CountdownTimer';
import { IconChevronLeft, IconChevronRight } from '../../design-system/icons/Icons';
import { HeroSlideVisual } from './HeroSlideVisual';
import { HERO_SLIDES } from './heroSlides';
import visualStyles from './HeroSlideVisual.module.css';
import styles from './HeroCarousel.module.css';

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 48;

export function HeroCarousel() {
  const slides = HERO_SLIDES;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex((next + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

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
    <div className={styles.wrapper}>
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
            {slides.map((slide) => (
              <article
                key={slide.id}
                className={styles.slide}
                data-theme={slide.theme}
                aria-hidden={slides[index].id !== slide.id}
              >
                <div className={styles.slideInner}>
                  <div className={styles.copy}>
                    <span className={styles.promoRibbon}>{slide.promo}</span>
                    <p className={styles.eyebrow}>{slide.eyebrow}</p>
                    <h1 className={styles.title}>
                      <span className={styles.titleDesktop}>{slide.title}</span>
                      {slide.mobileTitle && (
                        <span className={styles.titleMobile}>
                          {slide.mobileTitle.map((line) => (
                            <span key={line} className={styles.titleLine}>
                              {line}
                            </span>
                          ))}
                        </span>
                      )}
                    </h1>
                    <p className={styles.text}>{slide.text}</p>
                    {slide.countdownEndsAt && (
                      <CountdownTimer
                        endsAt={slide.countdownEndsAt}
                        className={styles.countdown}
                        tone="dark"
                        compact
                      />
                    )}
                    <Link to={slide.cta.to} className={styles.btnCta}>
                      {slide.cta.label}
                    </Link>
                  </div>
                  <div className={styles.visual} aria-hidden>
                    <div className={styles.imageFrame}>
                      <HeroSlideVisual
                        theme={slide.theme}
                        className={`${styles.illustration} ${visualStyles.root}`}
                      />
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
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Слайд ${i + 1}: ${slide.title}`}
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
