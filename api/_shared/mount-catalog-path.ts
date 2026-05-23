import type { VercelRequest } from '@vercel/node';

/** Express mounts expect full /api/... paths; Vercel serverless often passes a shorter req.url. */
export function mountCatalogPath(req: VercelRequest, pathname: string): void {
  const raw = req.url ?? '';
  const qIdx = raw.indexOf('?');
  const qs = qIdx >= 0 ? raw.slice(qIdx) : '';
  req.url = `${pathname}${qs}`;
}
