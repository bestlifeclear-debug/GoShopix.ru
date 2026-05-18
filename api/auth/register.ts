import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthApp } from '../_shared/get-auth-app.js';
import { runExpress } from '../_shared/run-express.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const app = await getAuthApp();
  await runExpress(app, req, res);
}
