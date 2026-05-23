import type { ApiError, ApiSuccess } from './types.js';

const apiBase = import.meta.env.VITE_API_URL ?? '';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function getToken(): string | null {
  try {
    return localStorage.getItem('goshopix_token');
  } catch {
    return null;
  }
}

async function parseJsonSafe(res: Response): Promise<ApiSuccess<unknown> | ApiError | null> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as ApiSuccess<unknown> | ApiError;
  } catch {
    return null;
  }
}

/** Vercel cold start + Supabase connect can exceed 20s on first homepage load. */
const REQUEST_TIMEOUT_MS = 40_000;

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = false, headers, ...rest } = options;
  const token = getToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ApiClientError(
        'Сервер не ответил вовремя. Попробуйте ещё раз через несколько секунд',
        0,
      );
    }
    throw new ApiClientError('Нет связи с сервером. Проверьте подключение к интернету', 0);
  } finally {
    clearTimeout(timeoutId);
  }

  const json = await parseJsonSafe(res);

  if (!res.ok || !json || !json.success) {
    const err = json as ApiError | null;
    const message =
      err?.error ??
      (res.status === 401
        ? 'Требуется авторизация'
        : res.status >= 500
          ? 'Ошибка сервера'
          : 'Запрос не выполнен');
    throw new ApiClientError(message, res.status, err?.details);
  }

  return (json as ApiSuccess<T>).data;
}

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '') q.set(key, String(val));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}
