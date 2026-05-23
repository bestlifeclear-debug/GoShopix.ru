#!/bin/sh
set -e
cd /app/server
if [ "${SKIP_MIGRATIONS}" != "true" ]; then
  npx prisma migrate deploy --schema=prisma/schema.prisma
fi
if [ "${SKIP_CATEGORY_SEED}" != "true" ] && [ -f dist/scripts/ensure-categories.js ]; then
  node dist/scripts/ensure-categories.js || echo "warn: ensure-categories failed (non-fatal)"
fi
exec "$@"
