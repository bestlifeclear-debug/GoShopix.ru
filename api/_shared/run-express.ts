import type { Express } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Run Express on Vercel without serverless-http (avoids hung responses). */
export function runExpress(
  app: Express,
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  return new Promise((resolve, reject) => {
    app(req, res, (err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
