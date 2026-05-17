/**
 * Кэш с fallback: Redis (REDIS_URL) → in-memory LRU.
 * Prisma защищён от SQL-инъекций параметризованными запросами.
 */
import { logger } from './logger.js';

interface CacheBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

interface RedisLike {
  get(key: string): Promise<string | null>;
  setex(key: string, ttl: number, value: string): Promise<unknown>;
  del(key: string): Promise<unknown>;
  on(event: string, cb: (err: Error) => void): void;
}

class MemoryCache implements CacheBackend {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const row = this.store.get(key);
    if (!row) return null;
    if (Date.now() > row.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return row.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

let backend: CacheBackend = new MemoryCache();
let redisReady = false;

async function initRedis(): Promise<void> {
  const url = process.env.REDIS_URL;
  if (!url || redisReady) return;

  try {
    // Динамический импорт: ioredis опционален (npm install ioredis в server)
    const loadRedis = new Function('return import("ioredis")') as () => Promise<{
      default: new (url: string) => RedisLike;
    }>;
    const mod = await loadRedis();
    const client = new mod.default(url);
    client.on('error', (err: Error) => logger.warn('Redis error', { error: err.message }));

    backend = {
      async get(key) {
        return client.get(key);
      },
      async set(key, value, ttlSeconds) {
        await client.setex(key, ttlSeconds, value);
      },
      async del(key) {
        await client.del(key);
      },
    };
    redisReady = true;
    logger.info('Redis cache enabled');
  } catch {
    logger.info('Redis unavailable, using in-memory cache');
  }
}

void initRedis();

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await backend.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await backend.set(key, JSON.stringify(value), ttlSeconds);
}

export async function cacheDel(key: string): Promise<void> {
  await backend.del(key);
}

/** Кэширует результат асинхронной функции */
export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  factory: () => Promise<T>,
): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const value = await factory();
  await cacheSet(key, value, ttlSeconds);
  return value;
}

export function cacheKey(parts: (string | number | undefined)[]): string {
  return parts.filter((p) => p !== undefined && p !== '').join(':');
}
