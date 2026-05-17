# Changelog

## [0.2.0] — 2026-05-16

### Дизайн-система (фронтенд)

- Добавлен `shared/src/design-tokens.ts` — единый источник цветов, типографики, отступов и радиусов
- Обновлён `client/src/design-system/tokens/tokens.css` (радиусы 4/8/12px, отступы 4–32px)
- Унифицированы кнопки (primary, secondary, outline, danger), карточки, поля ввода, модалки, StatusBadge
- Secondary-кнопка приведена к нейтральному стилю (без фиолетового)

### Адаптивность

- Сетка каталога: 1 / 2 / 3 / 4 колонки по брейкпоинтам 768px и 1024px
- Бургер-меню навигации на экранах &lt;768px
- Touch-target минимум 44×44px для кнопок и ссылок
- Минимальный размер текста 14px на мобильных
- `overflow-x: hidden` на body

### API и интеграция (клиент)

- Улучшен `api/client.ts`: безопасный парсинг JSON, сообщение при отсутствии сети
- Добавлен `api/mapApiError.ts` — понятные сообщения для 4xx/5xx
- Stores auth/cart используют `mapApiError`

### Бэкенд

- Кэш категорий (Redis при `REDIS_URL`, иначе in-memory) с TTL 120с
- Индексы Prisma: `(isPublished, createdAt)`, `(isPublished, price)`
- Middleware CSRF Origin guard для мутаций
- Audit-логирование auth/orders/seller-orders
- Загрузка `.env` из корня монорепо (`server/src/load-env.ts`)

### Тестирование и инфраструктура

- Скрипты `test:integration:full`, `db:setup`, `prepare-test-db.mjs`
- Cypress E2E: checkout-flow, seller-order
- CI/CD, Docker, Sentry, health/metrics (предыдущий этап)

### Исправления

- Ошибка входа при незапущенном API / отсутствии JWT_SECRET в workspace
- Integration-тесты: Docker + `goshopix_test`
- Повторное создание БД в prepare-test-db
