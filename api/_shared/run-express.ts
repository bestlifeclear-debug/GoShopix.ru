import type { Express, Request, Response } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Run Express on Vercel without serverless-http (avoids hung responses). */
export function runExpress(
  app: Express,
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  // VercelRequest/VercelResponse are IncomingMessage/ServerResponse at runtime; Express types are stricter.
  const expressReq = req as unknown as Request;
  const expressRes = res as unknown as Response;

  return new Promise((resolve, reject) => {
    app(expressReq, expressRes, (err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
