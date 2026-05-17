import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const images = await prisma.productImage.findMany({
    include: { product: { select: { slug: true } } },
    orderBy: [{ productId: 'asc' }, { sortOrder: 'asc' }],
  });

  let updated = 0;
  for (const row of images) {
    const url = `/product-images/${row.product.slug}-${row.sortOrder + 1}.svg`;
    if (row.url !== url) {
      await prisma.productImage.update({ where: { id: row.id }, data: { url } });
      updated++;
    }
  }

  const stores = await prisma.storeImage.findMany({ include: { store: { select: { slug: true } } } });
  for (const row of stores) {
    const url = `/store-images/${row.store.slug}.svg`;
    if (row.url !== url) {
      await prisma.storeImage.update({ where: { id: row.id }, data: { url } });
      updated++;
    }
  }

  console.log(`Updated ${updated} image URL(s) to local /public assets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
