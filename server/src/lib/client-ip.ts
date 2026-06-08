import type { Request } from 'express';

const PRIVATE_IP_RE =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|::$|fc00:|fd[0-9a-f]{2}:)/i;

function normalizeIp(raw: string): string {
  return raw.trim().replace(/^::ffff:/i, '');
}

function firstForwardedIp(value: string): string {
  return normalizeIp(value.split(',')[0] ?? '');
}

/** Извлекает IP клиента с учётом прокси (Vercel, nginx, Cloudflare). */
export function resolveClientIp(req: Request): string | null {
  const candidates = [
    req.headers['x-vercel-forwarded-for'],
    req.headers['cf-connecting-ip'],
    req.headers['x-real-ip'],
    req.headers['x-forwarded-for'],
  ];

  for (const header of candidates) {
    if (typeof header !== 'string' || !header.trim()) continue;
    const ip = firstForwardedIp(header);
    if (ip) return ip;
  }

  const socketIp = req.socket.remoteAddress;
  if (!socketIp) return null;
  return normalizeIp(socketIp);
}

export function isLocalOrPrivateIp(ip: string | null | undefined): boolean {
  if (!ip?.trim()) return true;
  const normalized = normalizeIp(ip);
  if (normalized === '::1' || normalized === '0.0.0.0') return true;
  return PRIVATE_IP_RE.test(normalized);
}
