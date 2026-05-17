import { PrismaClient, OrderStatus, UserRole, VerificationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedCatalogProducts } from './seed-catalog.js';

const prisma = new PrismaClient();

const PASSWORD = 'password123';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Seeding GoShopix database…');

  await prisma.$transaction([
    prisma.favorite.deleteMany(),
    prisma.orderStatusHistory.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.storeImage.deleteMany(),
    prisma.variantAttribute.deleteMany(),
    prisma.productAttributeValue.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.productAttribute.deleteMany(),
    prisma.category.deleteMany({ where: { parentId: { not: null } } }),
    prisma.category.deleteMany(),
    prisma.store.deleteMany(),
    prisma.seller.deleteMany(),
    prisma.session.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await hashPassword(PASSWORD);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@goshopix.ru',
      passwordHash,
      role: UserRole.ADMIN,
      profile: { create: { firstName: 'Админ', lastName: 'GoShopix' } },
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@goshopix.ru',
      passwordHash,
      role: UserRole.CUSTOMER,
      profile: {
        create: { firstName: 'Иван', lastName: 'Петров', phone: '+7 900 111-22-33' },
      },
      cart: { create: {} },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'maria@goshopix.ru',
      passwordHash,
      role: UserRole.CUSTOMER,
      profile: {
        create: { firstName: 'Мария', lastName: 'Сидорова', phone: '+7 900 444-55-66' },
      },
    },
  });

  const sellerUser1 = await prisma.user.create({
    data: {
      email: 'seller1@goshopix.ru',
      passwordHash,
      role: UserRole.SELLER,
      profile: { create: { firstName: 'Алексей', lastName: 'Техно' } },
    },
  });

  const sellerUser2 = await prisma.user.create({
    data: {
      email: 'seller2@goshopix.ru',
      passwordHash,
      role: UserRole.SELLER,
      profile: { create: { firstName: 'Ольга', lastName: 'Стиль' } },
    },
  });

  const seller1 = await prisma.seller.create({
    data: {
      userId: sellerUser1.id,
      verificationStatus: VerificationStatus.VERIFIED,
      companyName: 'ООО ТехноМаркет',
      taxId: '7701234567',
      verifiedAt: new Date(),
    },
  });

  const seller2 = await prisma.seller.create({
    data: {
      userId: sellerUser2.id,
      verificationStatus: VerificationStatus.VERIFIED,
      companyName: 'ИП Стиль и Комфорт',
      verifiedAt: new Date(),
    },
  });

  const storeTech = await prisma.store.create({
    data: {
      sellerId: seller1.id,
      name: 'ТехноМаркет',
      slug: 'tehnomarket',
      description: 'Электроника и гаджеты с официальной гарантией',
      email: 'shop@tehnomarket.ru',
      phone: '+7 495 100-20-30',
      address: 'Москва, ул. Тверская, 1',
      images: {
        create: {
          url: '/store-images/tehnomarket.svg',
          alt: 'ТехноМаркет',
          isPrimary: true,
        },
      },
    },
  });

  const storeFashion = await prisma.store.create({
    data: {
      sellerId: seller2.id,
      name: 'Модный Дом',
      slug: 'modny-dom',
      description: 'Одежда и аксессуары для всей семьи',
      email: 'hello@modny-dom.ru',
      phone: '+7 812 200-30-40',
      address: 'Санкт-Петербург, Невский пр., 50',
      images: {
        create: {
          url: '/store-images/modny-dom.svg',
          alt: 'Модный Дом',
          isPrimary: true,
        },
      },
    },
  });

  const catElectronics = await prisma.category.create({
    data: { name: 'Электроника', slug: 'electronics', sortOrder: 1 },
  });

  const catPhones = await prisma.category.create({
    data: {
      name: 'Смартфоны',
      slug: 'smartphones',
      parentId: catElectronics.id,
      sortOrder: 1,
    },
  });

  const catLaptops = await prisma.category.create({
    data: {
      name: 'Ноутбуки',
      slug: 'laptops',
      parentId: catElectronics.id,
      sortOrder: 2,
    },
  });

  const catClothing = await prisma.category.create({
    data: { name: 'Одежда', slug: 'clothing', sortOrder: 2 },
  });

  const attrBrand = await prisma.productAttribute.create({
    data: { name: 'Бренд', slug: 'brand', type: 'SELECT' },
  });

  const attrColor = await prisma.productAttribute.create({
    data: { name: 'Цвет', slug: 'color', type: 'SELECT' },
  });

  const attrMaterial = await prisma.productAttribute.create({
    data: { name: 'Материал', slug: 'material', type: 'TEXT' },
  });

  const catalog = await seedCatalogProducts(prisma, {
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
  });

  const phone = catalog.find((p) => p.slug === 'gophone-x')!;
  const tshirt = catalog.find((p) => p.slug === 'basic-cotton-tee')!;

  const cart = await prisma.cart.findUniqueOrThrow({ where: { userId: customer1.id } });

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      variantId: phone.variants[0]!.id,
      quantity: 1,
    },
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      variantId: tshirt.variants[0]!.id,
      quantity: 2,
    },
  });

  const phoneVariant = phone.variants[0]!;
  const orderTotal = phoneVariant.price.toNumber();

  const order = await prisma.order.create({
    data: {
      userId: customer2.id,
      status: OrderStatus.processing,
      totalAmount: orderTotal,
      shippingName: 'Мария Сидорова',
      shippingPhone: '+7 900 444-55-66',
      shippingAddress: 'Санкт-Петербург, ул. Ленина, 10, кв. 5',
      items: {
        create: {
          variantId: phoneVariant.id,
          productName: phone.name,
          variantName: phoneVariant.name,
          unitPrice: phoneVariant.price,
          quantity: 1,
          lineTotal: phoneVariant.price,
        },
      },
      history: {
        create: [
          { status: OrderStatus.pending, note: 'Заказ создан', reason: 'Заказ создан', actorRole: 'SYSTEM' },
          { status: OrderStatus.processing, note: 'Оплата подтверждена', reason: 'Оплата подтверждена', actorRole: 'SYSTEM' },
        ],
      },
    },
  });

  await prisma.session.create({
    data: {
      userId: customer1.id,
      tokenHash: await hashPassword('demo-session-token-customer1'),
      userAgent: 'Seed Script',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Seed completed.\n');
  console.log('Test accounts (password for all):', PASSWORD);
  console.log('  Admin:    ', admin.email);
  console.log('  Customer: ', customer1.email, ',', customer2.email);
  console.log('  Sellers:  ', sellerUser1.email, ',', sellerUser2.email);
  console.log('\nStores:     ', storeTech.slug, ',', storeFashion.slug);
  console.log('Categories: ', catElectronics.slug, '→', catPhones.slug, ',', catLaptops.slug, '|', catClothing.slug);
  console.log('Products:   ', catalog.length, 'items seeded');
  console.log('Sample order:', order.id, `(${order.status})`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
