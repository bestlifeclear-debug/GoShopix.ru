import type { VercelResponse } from '@vercel/node';
import '../../server/dist/load-env.js';
import {
  checkEnv,
  formatEnvSetupHint,
  loadCatalogConfig,
  loadConfig,
} from '../../server/dist/config/env.js';

type EnsureEnvOptions = {
  requireJwt?: boolean;
};

/** Validates env before loading Express; returns false if response already sent. */
export function ensureEnvOrRespond(res: VercelResponse, options?: EnsureEnvOptions): boolean {
  const requireJwt = options?.requireJwt ?? true;

  try {
    if (requireJwt) {
      loadConfig();
    } else {
      loadCatalogConfig();
    }
    return true;
  } catch (err) {
    const check = checkEnv({ requireJwt });
    const message =
      check.missing.length > 0
        ? formatEnvSetupHint(check.missing)
        : err instanceof Error
          ? err.message
          : 'Invalid environment configuration';

    res.status(503).json({
      success: false,
      error: message,
      ...(check.missing.length > 0 ? { missing: check.missing } : {}),
    });
    return false;
  }
}
