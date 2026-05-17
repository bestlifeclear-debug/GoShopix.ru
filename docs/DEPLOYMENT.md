# Развёртывание GoShopix

## Обзор

| Способ | Когда использовать |
|--------|-------------------|
| Docker Compose | Локальная разработка, staging на одном VPS |
| VPS + Nginx + Let's Encrypt | Production на собственном сервере |
| Railway | Managed PaaS (API из `railway.toml`) |
| Heroku Container | Альтернатива PaaS (`heroku.yml`) |

## 1. Docker Compose

### Локально

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec api npx prisma db seed
```

### Staging overlay

```bash
cp config/env/staging.env.example config/env/staging.env
# отредактируйте секреты
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

## 2. VPS (Ubuntu 22.04+)

### Подготовка сервера

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
sudo usermod -aG docker $USER
```

### Каталог приложения

```bash
sudo mkdir -p /opt/goshopix
sudo chown $USER:$USER /opt/goshopix
cd /opt/goshopix
git clone <repo-url> .
cp config/env/production.env.example config/env/production.env
# заполните DATABASE_URL, JWT_SECRET, SENTRY_DSN
```

### Nginx

```bash
sudo cp deploy/nginx/goshopix.conf /etc/nginx/sites-available/goshopix
sudo ln -s /etc/nginx/sites-available/goshopix /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d goshopix.ru -d www.goshopix.ru
```

### Запуск контейнеров

```bash
export API_IMAGE=ghcr.io/<org>/<repo>/api:staging
export WEB_IMAGE=ghcr.io/<org>/<repo>/web:staging
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

Проверка:

```bash
curl -fsS https://goshopix.ru/api/health/ready
```

## 3. GitHub Actions

### CI

На каждый push/PR: ESLint, Prettier, `npm run build`, Jest (с PostgreSQL service), E2E на ветке `main`.

### Staging

Push в `main` → сборка образов → деплой по SSH (секреты `STAGING_*`).

### Production

1. GitHub → Actions → **Deploy Production** → Run workflow  
2. Укажите тег образа (например `staging` или `sha-...`)  
3. Подтвердите в Environment **production** (required reviewers)

## 4. Railway

1. Создайте проект и PostgreSQL plugin  
2. Укажите переменные из `config/env/production.env.example`  
3. Deploy из репозитория (`railway.toml` → `server/Dockerfile`)  
4. Health check: `/api/health/live`

## 5. Heroku

```bash
heroku create goshopix-api
heroku addons:create heroku-postgresql:essential-0
heroku config:set JWT_SECRET=... NODE_ENV=production
heroku container:push web
heroku container:release web
```

Frontend обычно на CDN / отдельном static host с `VITE_API_URL=https://api.example.com`.

## Health checks для оркестраторов

| Endpoint | Назначение |
|----------|------------|
| `/api/health/live` | Процесс жив |
| `/api/health/ready` | БД доступна |
| `/api/health/metrics` | Метрики latency/count |

## Откат

```bash
cd /opt/goshopix
export API_IMAGE=ghcr.io/<org>/<repo>/api:<previous-sha>
export WEB_IMAGE=ghcr.io/<org>/<repo>/web:<previous-sha>
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
```
