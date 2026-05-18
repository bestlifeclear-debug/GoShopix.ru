import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureEnvOrRespond } from '../_shared/ensure-env.js';
import { getAuthApp } from '../_shared/get-auth-app.js';
import { runExpress } from '../_shared/run-express.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!ensureEnvOrRespond(res)) return;
  const app = await getAuthApp();
  await runExpress(app, req, res);
}
