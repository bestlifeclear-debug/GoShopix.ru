import type { PrismaClient } from '@prisma/client';

/** Корневые категории для ленты на главной (демо-ассортимент). */
export const EXTRA_ROOT_CATEGORIES = [
  { name: 'Аудио', slug: 'audio', sortOrder: 3 },
  { name: 'Обувь', slug: 'shoes', sortOrder: 4 },
  { name: 'Аксессуары', slug: 'accessories', sortOrder: 5 },
  { name: 'Спорт', slug: 'sport', sortOrder: 6 },
  { name: 'Дом', slug: 'home', sortOrder: 7 },
  { name: 'Бытовая техника', slug: 'appliances', sortOrder: 8 },
] as const;

export async function ensureExtraCategories(run: <T>(fn: (p: PrismaClient) => Promise<T>) => Promise<T>) {
  for (const cat of EXTRA_ROOT_CATEGORIES) {
    await run((p) =>
      p.category.upsert({
        where: { slug: cat.slug },
        create: { name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder },
        update: { name: cat.name, sortOrder: cat.sortOrder },
      }),
    );
  }
}
