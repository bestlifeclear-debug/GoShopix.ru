import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import '../server/dist/load-env.js';
import { createApp } from '../server/dist/app.js';

const app = createApp();
const handler = serverless(app);

export default async function vercelHandler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<unknown> {
  return handler(req, res);
}

export const config = {
  api: {
    externalResolver: true,
  },
};
