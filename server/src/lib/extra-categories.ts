import { cacheDel } from './cache.js';
import { prisma } from './prisma.js';

/** Корневые категории для ленты на главной (идемпотентный upsert). */
export const EXTRA_ROOT_CATEGORIES = [
  { name: 'Аудио', slug: 'audio', sortOrder: 3 },
  { name: 'Обувь', slug: 'shoes', sortOrder: 4 },
  { name: 'Аксессуары', slug: 'accessories', sortOrder: 5 },
  { name: 'Спорт', slug: 'sport', sortOrder: 6 },
  { name: 'Дом', slug: 'home', sortOrder: 7 },
  { name: 'Бытовая техника', slug: 'appliances', sortOrder: 8 },
] as const;

export async function ensureExtraCategories(): Promise<number> {
  const slugs = EXTRA_ROOT_CATEGORIES.map((c) => c.slug);
  const existing = await prisma.category.count({ where: { slug: { in: slugs } } });
  if (existing >= EXTRA_ROOT_CATEGORIES.length) {
    return 0;
  }

  let upserted = 0;
  for (const cat of EXTRA_ROOT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: { name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder },
      update: { name: cat.name, sortOrder: cat.sortOrder },
    });
    upserted += 1;
  }
  await cacheDel('categories:tree');
  return upserted;
}
