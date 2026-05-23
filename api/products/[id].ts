import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureEnvOrRespond } from '../_shared/ensure-env.js';
import { getCatalogApp } from '../_shared/get-catalog-app.js';
import { mountCatalogPath } from '../_shared/mount-catalog-path.js';
import { runExpress } from '../_shared/run-express.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!ensureEnvOrRespond(res, { requireJwt: false })) return;
  const rawId = req.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (id) mountCatalogPath(req, `/api/products/${id}`);
  const app = await getCatalogApp();
  await runExpress(app, req, res);
}
