import type { Express } from 'express';

let appPromise: Promise<Express> | null = null;

export function getAuthApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = (async () => {
      await import('../../server/dist/load-env.js');
      const { createAuthApp } = await import('../../server/dist/app-auth.js');
      return createAuthApp();
    })();
  }
  return appPromise;
}
