# Production deployment checklist

Используйте перед каждым релизом на production.

## Код и CI

- [ ] Все PR прошли CI (lint, build, unit, integration)
- [ ] E2E на staging зелёные
- [ ] Версия образа зафиксирована (тег `sha-...`, не `latest`)

## Секреты и конфигурация

- [ ] `JWT_SECRET` — уникальный, ≥ 32 символов, не из dev/staging
- [ ] `DATABASE_URL` — production БД с бэкапами
- [ ] `CORS_ORIGIN` / `API_PUBLIC_URL` — production домен
- [ ] `SENTRY_DSN` настроен, `SENTRY_ENVIRONMENT=production`
- [ ] `NODE_ENV=production`, `LOG_LEVEL=warn` или `error`
- [ ] SMTP / webhooks (если используются) — production credentials

## База данных

- [ ] `prisma migrate deploy` выполнен на production
- [ ] Seed **не** запускался на production (только migrate)
- [ ] Резервная копия БД перед деплоем

## Инфраструктура

- [ ] SSL сертификат валиден (Let's Encrypt auto-renew)
- [ ] Nginx проксирует `/api` → API, `/` → static
- [ ] Firewall: открыты 80/443, PostgreSQL не доступен извне
- [ ] Health: `/api/health/ready` возвращает 200

## Деплой

- [ ] Staging проверен вручную
- [ ] Запущен workflow **Deploy Production** с нужным `image_tag`
- [ ] Approval в GitHub Environment `production` получен
- [ ] Post-deploy smoke: главная, каталог, login, `/api/docs`

## Мониторинг

- [ ] Sentry получает тестовое событие (опционально)
- [ ] Логи контейнеров без критических ошибок (`docker compose logs api`)
- [ ] Метрики `/api/health/metrics` в норме (нет всплеска 5xx)

## Откат

- [ ] Известен предыдущий рабочий тег образа
- [ ] Команда отката проверена на staging

## После релиза

- [ ] Уведомить команду
- [ ] Зафиксировать тег/release в GitHub Releases
- [ ] Мониторинг 30–60 мин после деплоя
