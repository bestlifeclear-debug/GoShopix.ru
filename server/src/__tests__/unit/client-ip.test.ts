import type { Request } from 'express';
import { isLocalOrPrivateIp, resolveClientIp } from '../../lib/client-ip.js';

function mockReq(headers: Record<string, string | undefined>, remoteAddress?: string): Request {
  return {
    headers,
    socket: { remoteAddress },
  } as Request;
}

describe('resolveClientIp', () => {
  it('prefers x-vercel-forwarded-for', () => {
    const ip = resolveClientIp(
      mockReq({
        'x-vercel-forwarded-for': '89.113.12.34, 10.0.0.1',
        'x-forwarded-for': '1.2.3.4',
      }),
    );
    expect(ip).toBe('89.113.12.34');
  });

  it('falls back to socket address', () => {
    const ip = resolveClientIp(mockReq({}, '::ffff:203.0.113.9'));
    expect(ip).toBe('203.0.113.9');
  });
});

describe('isLocalOrPrivateIp', () => {
  it('detects localhost and private ranges', () => {
    expect(isLocalOrPrivateIp('127.0.0.1')).toBe(true);
    expect(isLocalOrPrivateIp('::1')).toBe(true);
    expect(isLocalOrPrivateIp('192.168.0.4')).toBe(true);
    expect(isLocalOrPrivateIp('89.113.12.34')).toBe(false);
  });
});
