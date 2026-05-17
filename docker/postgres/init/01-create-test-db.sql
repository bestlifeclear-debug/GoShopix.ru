-- Создаётся при первом запуске контейнера PostgreSQL
SELECT 'CREATE DATABASE goshopix_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'goshopix_test')\gexec
