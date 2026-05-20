/** Лёгкий слой аналитики — можно подключить GTM/Я.Метрику без правок по всему коду */
export function track(event: string, props?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, props ?? {});
  }
  if (typeof window !== 'undefined' && typeof (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag === 'function') {
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag('event', event, props ?? {});
  }
}
