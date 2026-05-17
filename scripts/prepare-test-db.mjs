#!/usr/bin/env node
/**
 * Поднимает PostgreSQL (docker compose db) и готовит goshopix_test для integration-тестов.
 */
import { execSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEST_DB = 'goshopix_test';
const DATABASE_URL =
  process.env.DATABASE_URL ??
  `postgresql://goshopix:goshopix@127.0.0.1:5432/${TEST_DB}?schema=public`;

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts });
}

function dockerExec(args, opts = {}) {
  return spawnSync('docker', ['compose', 'exec', '-T', 'db', ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    ...opts,
  });
}

function dockerAvailable() {
  const r = spawnSync('docker', ['compose', 'version'], { cwd: ROOT });
  return r.status === 0;
}

function databaseExists() {
  const sql = `SELECT 1 FROM pg_database WHERE datname = '${TEST_DB}'`;
  const check = dockerExec(['psql', '-U', 'goshopix', '-d', 'goshopix', '-tAc', sql]);

  if (check.status !== 0) {
    console.error(check.stderr || check.stdout);
    throw new Error('Не удалось подключиться к PostgreSQL в Docker. Запущен ли контейнер db?');
  }

  return check.stdout.trim() === '1';
}

function ensureTestDatabase() {
  if (databaseExists()) {
    console.log(`База ${TEST_DB} уже существует.`);
    return;
  }

  const create = dockerExec(['psql', '-U', 'goshopix', '-d', 'goshopix', '-c', `CREATE DATABASE ${TEST_DB};`]);
  const output = `${create.stderr ?? ''}${create.stdout ?? ''}`;

  if (create.status === 0) {
    console.log(`База ${TEST_DB} создана.`);
    return;
  }

  if (/already exists/i.test(output)) {
    console.log(`База ${TEST_DB} уже существует (создана ранее).`);
    return;
  }

  console.error(output);
  throw new Error(`Не удалось создать базу ${TEST_DB}`);
}

async function waitForPostgres(maxAttempts = 30) {
  for (let i = 1; i <= maxAttempts; i++) {
    const r = dockerExec(['pg_isready', '-U', 'goshopix']);
    if (r.status === 0) {
      // Дать init-скриптам время создать goshopix_test при первом старте
      await sleep(1500);
      return;
    }
    console.log(`Ожидание PostgreSQL… (${i}/${maxAttempts})`);
    await sleep(2000);
  }
  throw new Error('PostgreSQL не ответил вовремя.');
}

async function main() {
  if (!dockerAvailable()) {
    console.error(`
Docker не найден. Варианты:
  1. Установите Docker Desktop и выполните: npm run db:up
  2. Установите PostgreSQL локально и создайте БД goshopix_test вручную (pgAdmin / psql)
`);
    process.exit(1);
  }

  run('docker compose up db -d');
  await waitForPostgres();
  ensureTestDatabase();

  process.env.DATABASE_URL = DATABASE_URL;
  run('npx prisma migrate deploy --schema=server/prisma/schema.prisma', {
    env: { ...process.env, DATABASE_URL },
  });
  console.log(
    '\nГотово. Запуск тестов:\n  npm run test:integration:full\n',
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
