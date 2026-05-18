import '../src/load-env.js';
import crypto from 'node:crypto';
import { PrismaClient, OrderStatus, UserRole, VerificationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { seedCatalogProducts } from './seed-catalog.js';

const pgUrl = (process.env.DATABASE_URL ?? '').replace(/\?.*$/, '');

/** Один запрос Prisma = одно подключение (Supavisor session limit). */
async function db<T>(fn: (client: PrismaClient) => Promise<T>): Promise<T> {
  const client = new PrismaClient();
  try {
    return await fn(client);
  } finally {
    await client.$disconnect();
  }
}

async function terminateStuckPrismaSessions(): Promise<void> {
  await withPg(async (client) => {
    const stuck = await client.query(`
      SELECT pid FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid <> pg_backend_pid()
        AND state LIKE 'idle in transaction%'
    `);
    for (const row of stuck.rows) {
      await client.query('SELECT pg_terminate_backend($1)', [row.pid]);
    }
  });
}

async function withPg<T>(fn: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

const PASSWORD = 'password123';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Prisma + pooler на Windows: user через pg, остальное через Prisma. */
async function createUser(data: {
  email: string;
  passwordHash: string;
  role: UserRole;
  profile?: { firstName: string; lastName?: string; phone?: string };
  withCart?: boolean;
}) {
  const id = `u_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  const now = new Date();
  await withPg(async (client) => {
    await client.query(
      `INSERT INTO users (id, email, "passwordHash", role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4::"UserRole", $5, $5)`,
      [id, data.email, data.passwordHash, data.role, now],
    );
    if (data.profile) {
      await client.query(
        `INSERT INTO profiles (id, "userId", "firstName", "lastName", phone, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $6)`,
        [
          `p_${id}`,
          id,
          data.profile.firstName,
          data.profile.lastName ?? null,
          data.profile.phone ?? null,
          now,
        ],
      );
    }
    if (data.withCart) {
      await client.query(
        `INSERT INTO carts (id, "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $3)`,
        [`c_${id}`, id, now],
      );
    }
  });
  return { id, email: data.email };
}

async function main() {
  console.log('🌱 Seeding GoShopix database…');

  const existingUsers = await db((p) => p.user.count());
  const productCount = await db((p) => p.product.count());
  const shouldReset = process.env.SEED_RESET === 'true' && existingUsers > 0;
  const resumeCatalog = existingUsers > 0 && productCount === 0;

  if (productCount > 0 && !shouldReset) {
    console.log('Database already seeded (products exist).');
    return;
  }
  if (shouldReset) {
    console.log('Clearing existing data…');
  }

  // Последовательно: Supavisor/pooler обрывает длинные batch-$transaction (P1017).
  if (shouldReset) {
    const resetSteps = [
      (p: PrismaClient) => p.favorite.deleteMany(),
      (p: PrismaClient) => p.orderStatusHistory.deleteMany(),
      (p: PrismaClient) => p.orderItem.deleteMany(),
      (p: PrismaClient) => p.order.deleteMany(),
      (p: PrismaClient) => p.cartItem.deleteMany(),
      (p: PrismaClient) => p.cart.deleteMany(),
      (p: PrismaClient) => p.productImage.deleteMany(),
      (p: PrismaClient) => p.storeImage.deleteMany(),
      (p: PrismaClient) => p.variantAttribute.deleteMany(),
      (p: PrismaClient) => p.productAttributeValue.deleteMany(),
      (p: PrismaClient) => p.productVariant.deleteMany(),
      (p: PrismaClient) => p.product.deleteMany(),
      (p: PrismaClient) => p.productAttribute.deleteMany(),
      (p: PrismaClient) => p.category.deleteMany({ where: { parentId: { not: null } } }),
      (p: PrismaClient) => p.category.deleteMany(),
      (p: PrismaClient) => p.store.deleteMany(),
      (p: PrismaClient) => p.seller.deleteMany(),
      (p: PrismaClient) => p.session.deleteMany(),
      (p: PrismaClient) => p.profile.deleteMany(),
      (p: PrismaClient) => p.user.deleteMany(),
    ];
    for (const step of resetSteps) {
      await db(step);
    }
  }

  const passwordHash = await hashPassword(PASSWORD);

  let admin: { id: string; email: string };
  let customer1: { id: string; email: string };
  let customer2: { id: string; email: string };
  let sellerUser1: { id: string; email: string };
  let sellerUser2: { id: string; email: string };
  let seller1: { id: string };
  let seller2: { id: string };
  let storeTech: { id: string; slug: string };
  let storeFashion: { id: string; slug: string };
  let catElectronics: { id: string; slug: string };
  let catPhones: { id: string; slug: string };
  let catLaptops: { id: string; slug: string };
  let catClothing: { id: string; slug: string };
  let attrBrand: { id: string };
  let attrColor: { id: string };
  let attrMaterial: { id: string };
  let attrStorage: { id: string };
  let attrScreen: { id: string };

  if (resumeCatalog) {
    console.log('Resuming seed: catalog only…');
    await terminateStuckPrismaSessions();
    admin = await db((p) => p.user.findUniqueOrThrow({ where: { email: 'admin@goshopix.ru' } }));
    customer1 = await db((p) => p.user.findUniqueOrThrow({ where: { email: 'customer@goshopix.ru' } }));
    customer2 = await db((p) => p.user.findUniqueOrThrow({ where: { email: 'maria@goshopix.ru' } }));
    sellerUser1 = await db((p) => p.user.findUniqueOrThrow({ where: { email: 'seller1@goshopix.ru' } }));
    sellerUser2 = await db((p) => p.user.findUniqueOrThrow({ where: { email: 'seller2@goshopix.ru' } }));
    seller1 = await db((p) => p.seller.findFirstOrThrow({ where: { userId: sellerUser1.id } }));
    seller2 = await db((p) => p.seller.findFirstOrThrow({ where: { userId: sellerUser2.id } }));
    storeTech = await db((p) => p.store.findUniqueOrThrow({ where: { slug: 'tehnomarket' } }));
    storeFashion = await db((p) => p.store.findUniqueOrThrow({ where: { slug: 'modny-dom' } }));
    catElectronics = await db((p) => p.category.findUniqueOrThrow({ where: { slug: 'electronics' } }));
    catPhones = await db((p) => p.category.findUniqueOrThrow({ where: { slug: 'smartphones' } }));
    catLaptops = await db((p) => p.category.findUniqueOrThrow({ where: { slug: 'laptops' } }));
    catClothing = await db((p) => p.category.findUniqueOrThrow({ where: { slug: 'clothing' } }));
    attrBrand = await db((p) => p.productAttribute.findUniqueOrThrow({ where: { slug: 'brand' } }));
    attrColor = await db((p) => p.productAttribute.findUniqueOrThrow({ where: { slug: 'color' } }));
    attrMaterial = await db((p) => p.productAttribute.findUniqueOrThrow({ where: { slug: 'material' } }));
    attrStorage = await db((p) => p.productAttribute.findUniqueOrThrow({ where: { slug: 'storage' } }));
    attrScreen = await db((p) => p.productAttribute.findUniqueOrThrow({ where: { slug: 'screen-size' } }));
  } else {
  admin = await createUser({
    email: 'admin@goshopix.ru',
    passwordHash,
    role: UserRole.ADMIN,
    profile: { firstName: 'Админ', lastName: 'GoShopix' },
  });

  customer1 = await createUser({
    email: 'customer@goshopix.ru',
    passwordHash,
    role: UserRole.CUSTOMER,
    profile: { firstName: 'Иван', lastName: 'Петров', phone: '+7 900 111-22-33' },
    withCart: true,
  });

  customer2 = await createUser({
    email: 'maria@goshopix.ru',
    passwordHash,
    role: UserRole.CUSTOMER,
    profile: { firstName: 'Мария', lastName: 'Сидорова', phone: '+7 900 444-55-66' },
  });

  sellerUser1 = await createUser({
    email: 'seller1@goshopix.ru',
    passwordHash,
    role: UserRole.SELLER,
    profile: { firstName: 'Алексей', lastName: 'Техно' },
  });

  sellerUser2 = await createUser({
    email: 'seller2@goshopix.ru',
    passwordHash,
    role: UserRole.SELLER,
    profile: { firstName: 'Ольга', lastName: 'Стиль' },
  });

  seller1 = await db((p) =>
    p.seller.create({
      data: {
        userId: sellerUser1.id,
        verificationStatus: VerificationStatus.VERIFIED,
        companyName: 'ООО ТехноМаркет',
        taxId: '7701234567',
        verifiedAt: new Date(),
      },
    }),
  );

  seller2 = await db((p) =>
    p.seller.create({
      data: {
        userId: sellerUser2.id,
        verificationStatus: VerificationStatus.VERIFIED,
        companyName: 'ИП Стиль и Комфорт',
        verifiedAt: new Date(),
      },
    }),
  );

  storeTech = await db((p) =>
    p.store.create({
      data: {
        sellerId: seller1.id,
        name: 'ТехноМаркет',
        slug: 'tehnomarket',
        description: 'Электроника и гаджеты с официальной гарантией',
        email: 'shop@tehnomarket.ru',
        phone: '+7 495 100-20-30',
        address: 'Москва, ул. Тверская, 1',
      },
    }),
  );

  storeFashion = await db((p) =>
    p.store.create({
      data: {
        sellerId: seller2.id,
        name: 'Модный Дом',
        slug: 'modny-dom',
        description: 'Одежда и аксессуары для всей семьи',
        email: 'hello@modny-dom.ru',
        phone: '+7 812 200-30-40',
        address: 'Санкт-Петербург, Невский пр., 50',
      },
    }),
  );

  catElectronics = await db((p) =>
    p.category.create({ data: { name: 'Электроника', slug: 'electronics', sortOrder: 1 } }),
  );

  catPhones = await db((p) =>
    p.category.create({
      data: {
        name: 'Смартфоны',
        slug: 'smartphones',
        parentId: catElectronics.id,
        sortOrder: 1,
      },
    }),
  );

  catLaptops = await db((p) =>
    p.category.create({
      data: {
        name: 'Ноутбуки',
        slug: 'laptops',
        parentId: catElectronics.id,
        sortOrder: 2,
      },
    }),
  );

  catClothing = await db((p) =>
    p.category.create({ data: { name: 'Одежда', slug: 'clothing', sortOrder: 2 } }),
  );

  attrBrand = await db((p) =>
    p.productAttribute.create({ data: { name: 'Бренд', slug: 'brand', type: 'SELECT' } }),
  );

  attrColor = await db((p) =>
    p.productAttribute.create({ data: { name: 'Цвет', slug: 'color', type: 'SELECT' } }),
  );

  attrMaterial = await db((p) =>
    p.productAttribute.create({ data: { name: 'Материал', slug: 'material', type: 'TEXT' } }),
  );

  attrStorage = await db((p) =>
    p.productAttribute.create({ data: { name: 'Объём памяти', slug: 'storage', type: 'SELECT' } }),
  );

  attrScreen = await db((p) =>
    p.productAttribute.create({
      data: { name: 'Диагональ экрана', slug: 'screen-size', type: 'SELECT' },
    }),
  );
  }

  await terminateStuckPrismaSessions();
  const catalog = await seedCatalogProducts(db, {
    seller1Id: seller1.id,
    seller2Id: seller2.id,
    storeTechId: storeTech.id,
    storeFashionId: storeFashion.id,
    catPhonesId: catPhones.id,
    catLaptopsId: catLaptops.id,
    catClothingId: catClothing.id,
    catElectronicsId: catElectronics.id,
    attrBrandId: attrBrand.id,
    attrColorId: attrColor.id,
    attrMaterialId: attrMaterial.id,
    attrStorageId: attrStorage.id,
    attrScreenId: attrScreen.id,
  });

  const phone = catalog.find((p) => p.slug === 'gophone-x')!;
  const tshirt = catalog.find((p) => p.slug === 'basic-cotton-tee')!;

  const cart = await db((p) => p.cart.findUniqueOrThrow({ where: { userId: customer1.id } }));

  await db((p) =>
    p.cartItem.create({
      data: { cartId: cart.id, variantId: phone.variants[0]!.id, quantity: 1 },
    }),
  );

  await db((p) =>
    p.cartItem.create({
      data: { cartId: cart.id, variantId: tshirt.variants[0]!.id, quantity: 2 },
    }),
  );

  const phoneVariant = phone.variants[0]!;
  const orderTotal = phoneVariant.price.toNumber();

  let order: { id: string; status: OrderStatus } | null = null;
  try {
    order = await db((p) =>
      p.order.create({
        data: {
          userId: customer2.id,
          status: OrderStatus.processing,
          totalAmount: orderTotal,
          shippingName: 'Мария Сидорова',
          shippingPhone: '+7 900 444-55-66',
          shippingAddress: 'Санкт-Петербург, ул. Ленина, 10, кв. 5',
        },
      }),
    );
    await db((p) =>
      p.orderItem.create({
        data: {
          orderId: order!.id,
          variantId: phoneVariant.id,
          productName: phone.name,
          variantName: phoneVariant.name,
          unitPrice: phoneVariant.price,
          quantity: 1,
          lineTotal: phoneVariant.price,
        },
      }),
    );
    await db((p) =>
      p.orderStatusHistory.createMany({
        data: [
          {
            orderId: order!.id,
            status: OrderStatus.pending,
            note: 'Заказ создан',
            reason: 'Заказ создан',
            actorRole: 'SYSTEM',
          },
          {
            orderId: order!.id,
            status: OrderStatus.processing,
            note: 'Оплата подтверждена',
            reason: 'Оплата подтверждена',
            actorRole: 'SYSTEM',
          },
        ],
      }),
    );
  } catch {
    console.warn('⚠ Sample order skipped (pooler limit).');
  }

  console.log('✅ Seed completed.\n');
  console.log('Test accounts (password for all):', PASSWORD);
  console.log('  Admin:    ', admin.email);
  console.log('  Customer: ', customer1.email, ',', customer2.email);
  console.log('  Sellers:  ', sellerUser1.email, ',', sellerUser2.email);
  console.log('\nStores:     ', storeTech.slug, ',', storeFashion.slug);
  console.log('Categories: ', catElectronics.slug, '→', catPhones.slug, ',', catLaptops.slug, '|', catClothing.slug);
  console.log('Products:   ', catalog.length, 'items seeded');
  if (order) console.log('Sample order:', order.id, `(${order.status})`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await terminateStuckPrismaSessions();
  });
