import { Router } from 'express';
import { cacheGetOrSet } from '../lib/cache.js';
import { ensureExtraCategories } from '../lib/extra-categories.js';
import { prisma } from '../lib/prisma.js';
import { ok } from '../lib/response.js';

export const categoriesRouter = Router();

/** На Vercel migrate deploy не запускается — один раз за инстанс дополняем демо-категории. */
let extraCategoriesEnsured = false;

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  children: CategoryNode[];
}

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    if (!extraCategoriesEnsured && process.env.SKIP_AUTO_ENSURE_CATEGORIES !== 'true') {
      await ensureExtraCategories();
      extraCategoriesEnsured = true;
    }

    const ttl = Number(process.env.CACHE_TTL_CATEGORIES ?? 120);
    const roots = await cacheGetOrSet<CategoryNode[]>('categories:tree', ttl, async () => {
      const rows = await prisma.category.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      });

      const map = new Map<string, CategoryNode>();
      const tree: CategoryNode[] = [];

      for (const row of rows) {
        map.set(row.id, {
          id: row.id,
          name: row.name,
          slug: row.slug,
          parentId: row.parentId,
          sortOrder: row.sortOrder,
          children: [],
        });
      }

      for (const node of map.values()) {
        if (node.parentId && map.has(node.parentId)) {
          map.get(node.parentId)!.children.push(node);
        } else {
          tree.push(node);
        }
      }

      return tree;
    });

    ok(res, roots);
  } catch (error) {
    next(error);
  }
});
