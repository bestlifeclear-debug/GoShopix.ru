#!/bin/sh
set -e
cd /app/server
if [ "${SKIP_MIGRATIONS}" != "true" ]; then
  npx prisma migrate deploy --schema=prisma/schema.prisma
fi
exec "$@"
