import type { PrismaClient } from '@prisma/client';

type SeedCtx = {
  seller1Id: string;
  seller2Id: string;
  storeTechId: string;
  storeFashionId: string;
  catPhonesId: string;
  catLaptopsId: string;
  catClothingId: string;
  catElectronicsId: string;
  attrBrandId: string;
  attrColorId: string;
  attrMaterialId: string;
  attrStorageId: string;
  attrScreenId: string;
};

/** Локальные файлы из client/public — picsum.photos часто недоступен (403). */
function img(slug: string, n: number) {
  return `/product-images/${slug}-${n}.svg`;
}

type VariantSeed = {
  sku: string;
  name: string;
  price: number;
  stock: number;
  isDefault?: boolean;
  options?: { name: string; value: string }[];
};

type ProductSeed = {
  sellerId: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  compareAtPrice: number;
  rating: number;
  reviewCount: number;
  promoBadge: string;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  brandAttr?: string;
  extraAttrs?: { attributeId: string; value: string }[];
  imageCount?: number;
  variants: VariantSeed[];
};

type PrismaRun = <T>(fn: (client: PrismaClient) => Promise<T>) => Promise<T>;

export async function seedCatalogProducts(run: PrismaRun, ctx: SeedCtx) {
  const products: ProductSeed[] = [
    {
      sellerId: ctx.seller1Id,
      storeId: ctx.storeTechId,
      categoryId: ctx.catPhonesId,
      name: 'Смартфон GoPhone X',
      slug: 'gophone-x',
      brand: 'GoPhone',
      description:
        'Флагманский смартфон с AMOLED 6.5", камерой 48 Мп и быстрой зарядкой 67 Вт. Идеален для фото, игр и работы.',
      price: 49990,
      compareAtPrice: 64990,
      rating: 4.7,
      reviewCount: 328,
      promoBadge: 'Осталось 3 шт.',
      deliveryDaysMin: 1,
      deliveryDaysMax: 3,
      brandAttr: 'GoPhone',
      extraAttrs: [
        { attributeId: ctx.attrStorageId, value: '128 ГБ' },
        { attributeId: ctx.attrScreenId, value: '6.5"' },
      ],
      imageCount: 4,
      variants: [
        {
          sku: 'GOPHONE-X-128-BLK',
          name: '128 ГБ / Чёрный',
          price: 49990,
          stock: 3,
          isDefault: true,
          options: [
            { name: 'Память', value: '128 ГБ' },
            { name: 'Цвет', value: 'Чёрный' },
          ],
        },
        {
          sku: 'GOPHONE-X-256-WHT',
          name: '256 ГБ / Белый',
          price: 59990,
          stock: 12,
          options: [
            { name: 'Память', value: '256 ГБ' },
            { name: 'Цвет', value: 'Белый' },
          ],
        },
      ],
    },
    {
      sellerId: ctx.seller1Id,
      storeId: ctx.storeTechId,
      categoryId: ctx.catLaptopsId,
      name: 'Ноутбук ProBook 15',
      slug: 'probook-15',
      brand: 'ProBook',
      description: '15.6" IPS, Intel Core i7, 16 ГБ RAM, SSD 512 ГБ. Тонкий корпус и тихая система охлаждения.',
      price: 89990,
      compareAtPrice: 109990,
      rating: 4.8,
      reviewCount: 152,
      promoBadge: 'Быстрая доставка',
      deliveryDaysMin: 2,
      deliveryDaysMax: 4,
      brandAttr: 'ProBook',
      extraAttrs: [
        { attributeId: ctx.attrStorageId, value: '512 ГБ' },
        { attributeId: ctx.attrScreenId, value: '15.6"' },
      ],
      imageCount: 4,
      variants: [
        { sku: 'PROBOOK-15-512', name: '512 ГБ SSD', price: 89990, stock: 8, isDefault: true },
      ],
    },
    {
      sellerId: ctx.seller1Id,
      storeId: ctx.storeTechId,
      categoryId: ctx.catElectronicsId,
      name: 'Наушники SoundWave Pro',
      slug: 'soundwave-pro',
      brand: 'SoundWave',
      description: 'Беспроводные наушники с активным шумоподавлением и автономностью до 32 часов.',
      price: 12990,
      compareAtPrice: 17990,
      rating: 4.6,
      reviewCount: 891,
      promoBadge: 'Хит продаж',
      deliveryDaysMin: 1,
      deliveryDaysMax: 2,
      brandAttr: 'SoundWave',
      imageCount: 3,
      variants: [
        {
          sku: 'SW-PRO-BLK',
          name: 'Чёрный',
          price: 12990,
          stock: 45,
          isDefault: true,
          options: [{ name: 'Цвет', value: 'Чёрный' }],
        },
        {
          sku: 'SW-PRO-WHT',
          name: 'Белый',
          price: 12990,
          stock: 22,
          options: [{ name: 'Цвет', value: 'Белый' }],
        },
      ],
    },
    {
      sellerId: ctx.seller1Id,
      storeId: ctx.storeTechId,
      categoryId: ctx.catElectronicsId,
      name: 'Умные часы FitTrack 2',
      slug: 'fittrack-2',
      brand: 'FitTrack',
      description: 'Пульс, SpO₂, GPS, водозащита 5 ATM. Уведомления и NFC-оплата.',
      price: 8490,
      compareAtPrice: 11990,
      rating: 4.3,
      reviewCount: 412,
      promoBadge: '−30%',
      deliveryDaysMin: 1,
      deliveryDaysMax: 3,
      brandAttr: 'FitTrack',
      imageCount: 3,
      variants: [
        {
          sku: 'FIT-2-42-BLK',
          name: '42 мм / Чёрный',
          price: 8490,
          stock: 18,
          isDefault: true,
          options: [
            { name: 'Размер', value: '42 мм' },
            { name: 'Цвет', value: 'Чёрный' },
          ],
        },
        {
          sku: 'FIT-2-46-SLV',
          name: '46 мм / Серебро',
          price: 9490,
          stock: 9,
          options: [
            { name: 'Размер', value: '46 мм' },
            { name: 'Цвет', value: 'Серебро' },
          ],
        },
      ],
    },
    {
      sellerId: ctx.seller1Id,
      storeId: ctx.storeTechId,
      categoryId: ctx.catElectronicsId,
      name: 'Планшет TabAir 11',
      slug: 'tabair-11',
      brand: 'TabAir',
      description: '11" 2K дисплей, стилус в комплекте, 8 ГБ RAM. Для учёбы и творчества.',
      price: 34990,
      compareAtPrice: 42990,
      rating: 4.5,
      reviewCount: 97,
      promoBadge: 'Эксклюзив',
      deliveryDaysMin: 2,
      deliveryDaysMax: 5,
      brandAttr: 'TabAir',
      imageCount: 4,
      variants: [
        { sku: 'TABAIR-11-128', name: '128 ГБ', price: 34990, stock: 14, isDefault: true },
      ],
    },
    {
      sellerId: ctx.seller1Id,
      storeId: ctx.storeTechId,
      categoryId: ctx.catElectronicsId,
      name: 'Кофемашина BrewMaster',
      slug: 'brewmaster',
      brand: 'BrewMaster',
      description: 'Автоматическая кофемашина: эспрессо, капучино, латте. Съёмный блок заваривания.',
      price: 45990,
      compareAtPrice: 54990,
      rating: 4.9,
      reviewCount: 64,
      promoBadge: 'Быстрая доставка',
      deliveryDaysMin: 2,
      deliveryDaysMax: 6,
      brandAttr: 'BrewMaster',
      imageCount: 3,
      variants: [
        { sku: 'BREW-MASTER', name: 'Стандарт', price: 45990, stock: 6, isDefault: true },
      ],
    },
    {
      sellerId: ctx.seller2Id,
      storeId: ctx.storeFashionId,
      categoryId: ctx.catClothingId,
      name: 'Футболка Basic Cotton',
      slug: 'basic-cotton-tee',
      brand: 'BasicWear',
      description: '100% хлопок, унисекс, классический крой. Мягкая ткань для ежедневной носки.',
      price: 1990,
      compareAtPrice: 2990,
      rating: 4.4,
      reviewCount: 1203,
      promoBadge: 'Осталось 5 шт.',
      deliveryDaysMin: 1,
      deliveryDaysMax: 4,
      brandAttr: 'BasicWear',
      extraAttrs: [{ attributeId: ctx.attrMaterialId, value: 'Хлопок' }],
      imageCount: 3,
      variants: [
        {
          sku: 'TEE-BASIC-M-WHT',
          name: 'M / Белый',
          price: 1990,
          stock: 5,
          isDefault: true,
          options: [
            { name: 'Размер', value: 'M' },
            { name: 'Цвет', value: 'Белый' },
          ],
        },
        {
          sku: 'TEE-BASIC-L-BLK',
          name: 'L / Чёрный',
          price: 1990,
          stock: 30,
          options: [
            { name: 'Размер', value: 'L' },
            { name: 'Цвет', value: 'Чёрный' },
          ],
        },
      ],
    },
    {
      sellerId: ctx.seller2Id,
      storeId: ctx.storeFashionId,
      categoryId: ctx.catClothingId,
      name: 'Куртка Urban Wind',
      slug: 'urban-wind-jacket',
      brand: 'UrbanLine',
      description: 'Ветрозащитная куртка с водоотталкивающей пропиткой. Лёгкая и компактная.',
      price: 7490,
      compareAtPrice: 9990,
      rating: 4.2,
      reviewCount: 256,
      promoBadge: '−25%',
      deliveryDaysMin: 2,
      deliveryDaysMax: 5,
      brandAttr: 'UrbanLine',
      extraAttrs: [{ attributeId: ctx.attrMaterialId, value: 'Полиэстер' }],
      imageCount: 4,
      variants: [
        {
          sku: 'JACKET-URBAN-L',
          name: 'Размер L',
          price: 7490,
          stock: 15,
          isDefault: true,
          options: [{ name: 'Размер', value: 'L' }],
        },
      ],
    },
    {
      sellerId: ctx.seller2Id,
      storeId: ctx.storeFashionId,
      categoryId: ctx.catClothingId,
      name: 'Кроссовки Street Run',
      slug: 'street-run-sneakers',
      brand: 'StreetRun',
      description: 'Лёгкая подошва, дышащий верх, амортизация для бега и города.',
      price: 5990,
      compareAtPrice: 7990,
      rating: 4.6,
      reviewCount: 534,
      promoBadge: 'Хит продаж',
      deliveryDaysMin: 1,
      deliveryDaysMax: 3,
      brandAttr: 'StreetRun',
      imageCount: 4,
      variants: [
        {
          sku: 'SR-42-BLK',
          name: '42 / Чёрный',
          price: 5990,
          stock: 20,
          isDefault: true,
          options: [
            { name: 'Размер', value: '42' },
            { name: 'Цвет', value: 'Чёрный' },
          ],
        },
        {
          sku: 'SR-43-WHT',
          name: '43 / Белый',
          price: 5990,
          stock: 11,
          options: [
            { name: 'Размер', value: '43' },
            { name: 'Цвет', value: 'Белый' },
          ],
        },
      ],
    },
    {
      sellerId: ctx.seller2Id,
      storeId: ctx.storeFashionId,
      categoryId: ctx.catClothingId,
      name: 'Рюкзак City Pack 25L',
      slug: 'city-pack-25',
      brand: 'CityPack',
      description: 'Городской рюкзак 25 л: отделение для ноутбука 15", USB-порт, водоотталкивающая ткань.',
      price: 4290,
      compareAtPrice: 5490,
      rating: 3.9,
      reviewCount: 178,
      promoBadge: 'Быстрая доставка',
      deliveryDaysMin: 1,
      deliveryDaysMax: 4,
      brandAttr: 'CityPack',
      imageCount: 3,
      variants: [
        {
          sku: 'CITYPACK-25-GRY',
          name: 'Серый',
          price: 4290,
          stock: 24,
          isDefault: true,
          options: [{ name: 'Цвет', value: 'Серый' }],
        },
        {
          sku: 'CITYPACK-25-BLK',
          name: 'Чёрный',
          price: 4290,
          stock: 16,
          options: [{ name: 'Цвет', value: 'Чёрный' }],
        },
      ],
    },
  ];

  const created = [];

  for (const p of products) {
    const imageCount = p.imageCount ?? 3;
    const attributesCreate = [
      ...(p.brandAttr ? [{ attributeId: ctx.attrBrandId, value: p.brandAttr }] : []),
      ...(p.extraAttrs ?? []),
    ];

    const product = await run((prisma) =>
      prisma.product.create({
        data: {
          sellerId: p.sellerId,
          storeId: p.storeId,
          categoryId: p.categoryId,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          brand: p.brand,
          rating: p.rating,
          reviewCount: p.reviewCount,
          promoBadge: p.promoBadge,
          deliveryDaysMin: p.deliveryDaysMin,
          deliveryDaysMax: p.deliveryDaysMax,
          isPublished: true,
        },
      }),
    );

    for (const attr of attributesCreate) {
      await run((prisma) =>
        prisma.productAttributeValue.create({
          data: { productId: product.id, attributeId: attr.attributeId, value: attr.value },
        }),
      );
    }

    for (let i = 0; i < imageCount; i++) {
      await run((prisma) =>
        prisma.productImage.create({
          data: {
            productId: product.id,
            url: img(p.slug, i + 1),
            alt: `${p.name} — фото ${i + 1}`,
            sortOrder: i,
            isPrimary: i === 0,
          },
        }),
      );
    }

    const variants = [];
    for (const v of p.variants) {
      const variant = await run((prisma) =>
        prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku,
            name: v.name,
            price: v.price,
            stock: v.stock,
            isDefault: v.isDefault ?? false,
          },
        }),
      );
      if (v.options?.length) {
        for (const opt of v.options) {
          await run((prisma) =>
            prisma.variantAttribute.create({
              data: { variantId: variant.id, name: opt.name, value: opt.value },
            }),
          );
        }
      }
      variants.push(variant);
    }

    created.push({ ...product, variants });
  }

  return created;
}
