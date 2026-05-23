import '../load-env.js';
import { EXTRA_ROOT_CATEGORIES, ensureExtraCategories } from '../lib/extra-categories.js';
import { prisma } from '../lib/prisma.js';

async function main() {
  const count = await ensureExtraCategories();
  const roots = await prisma.category.count({ where: { parentId: null } });
  console.log(`✓ Ensured ${count} demo categories (${EXTRA_ROOT_CATEGORIES.map((c) => c.slug).join(', ')})`);
  console.log(`  Root categories in DB: ${roots}`);
}

main()
  .catch((err) => {
    console.error('ensure-categories failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
