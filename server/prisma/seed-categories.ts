/**
 * Только категории для главной — безопасно на staging/production.
 * npm run db:seed:categories -w server
 */
import '../src/load-env.js';
import { ensureExtraCategories } from '../src/lib/extra-categories.js';
import { prisma } from '../src/lib/prisma.js';

async function main() {
  await ensureExtraCategories();
  console.log('Category seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
