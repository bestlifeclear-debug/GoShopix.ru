import type { Express } from 'express';

let appPromise: Promise<Express> | null = null;

export function getCatalogApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = (async () => {
      await import('../../server/dist/load-env.js');
      const { loadCatalogConfig } = await import('../../server/dist/config/env.js');
      loadCatalogConfig();
      const { createCatalogApp } = await import('../../server/dist/app-catalog.js');
      return createCatalogApp();
    })();
  }
  return appPromise;
}
