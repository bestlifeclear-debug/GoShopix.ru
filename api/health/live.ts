import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Lightweight liveness probe — no Express/Prisma (fast cold start on Vercel). */
export default function handler(_req: VercelRequest, res: VercelResponse): void {
  res.status(200).json({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString() },
  });
}
