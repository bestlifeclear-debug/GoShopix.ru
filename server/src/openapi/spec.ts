export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'GoShopix API',
    version: '1.0.0',
    description: 'REST API маркетплейса GoShopix (покупатель и продавец)',
  },
  servers: [{ url: 'http://127.0.0.1:3000', description: 'Local' }],
  tags: [
    { name: 'Auth', description: 'Passwordless OTP и профиль (JWT)' },
    { name: 'Products', description: 'Каталог товаров' },
    { name: 'Categories', description: 'Категории' },
    { name: 'Cart', description: 'Корзина' },
    { name: 'Orders', description: 'Заказы' },
    { name: 'Favorites', description: 'Избранное' },
    { name: 'Seller Products', description: 'Товары продавца' },
    { name: 'Seller Orders', description: 'Заказы продавца' },
    { name: 'Seller Analytics', description: 'Аналитика продавца' },
    { name: 'Seller Store', description: 'Магазин продавца' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {},
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          details: {},
        },
      },
      SendOtpBody: {
        type: 'object',
        required: ['identifier'],
        properties: {
          identifier: { type: 'string', description: 'Телефон или email' },
        },
      },
      VerifyOtpBody: {
        type: 'object',
        required: ['identifier', 'code'],
        properties: {
          identifier: { type: 'string' },
          code: { type: 'string', pattern: '^\\d{6}$' },
        },
      },
      UpdateProfileBody: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
      AddCartItemBody: {
        type: 'object',
        required: ['variantId'],
        properties: {
          variantId: { type: 'string' },
          quantity: { type: 'integer', minimum: 1, default: 1 },
        },
      },
      UpdateCartItemBody: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'integer', minimum: 1 },
        },
      },
      CreateOrderBody: {
        type: 'object',
        required: ['shippingName', 'shippingPhone', 'shippingAddress'],
        properties: {
          shippingName: { type: 'string' },
          shippingPhone: { type: 'string' },
          shippingAddress: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Регистрация покупателя',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } } },
        },
        responses: {
          '201': { description: 'Пользователь создан, возвращается JWT' },
          '409': { description: 'Email уже занят' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Вход',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } },
        },
        responses: {
          '200': { description: 'JWT токен' },
          '401': { description: 'Неверные учётные данные' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Текущий пользователь',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Профиль пользователя' } },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Список товаров',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
          { name: 'categorySlug', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'name_asc'] },
          },
          {
            name: 'attr_{slug}',
            in: 'query',
            description: 'Фильтр по атрибуту, напр. attr_brand=GoPhone',
            schema: { type: 'string' },
          },
        ],
        responses: { '200': { description: 'Пагинированный список' } },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Детали товара',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Товар с вариантами и атрибутами' }, '404': { description: 'Не найден' } },
      },
    },
    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Дерево категорий',
        responses: { '200': { description: 'Корневые категории с children' } },
      },
    },
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Получить корзину',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Корзина с позициями' } },
      },
    },
    '/api/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Добавить в корзину',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AddCartItemBody' } } },
        },
        responses: { '201': { description: 'Обновлённая корзина' } },
      },
    },
    '/api/cart/items/{id}': {
      put: {
        tags: ['Cart'],
        summary: 'Изменить количество',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateCartItemBody' } },
          },
        },
        responses: { '200': { description: 'Обновлённая корзина' } },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Удалить из корзины',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Обновлённая корзина' } },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Список заказов пользователя',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Пагинированный список заказов' } },
      },
      post: {
        tags: ['Orders'],
        summary: 'Создать заказ из корзины',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderBody' } } },
        },
        responses: { '201': { description: 'Заказ создан, корзина очищена' } },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Детали заказа',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Заказ с историей статусов' } },
      },
    },
    '/api/orders/{id}/cancel': {
      post: {
        tags: ['Orders'],
        summary: 'Отменить заказ',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Заказ отменён' } },
      },
    },
    '/api/favorites': {
      get: {
        tags: ['Favorites'],
        summary: 'Список избранного',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Избранные товары' } },
      },
    },
    '/api/favorites/{productId}': {
      post: {
        tags: ['Favorites'],
        summary: 'Добавить в избранное',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '201': { description: 'Добавлено' } },
      },
      delete: {
        tags: ['Favorites'],
        summary: 'Удалить из избранного',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Удалено' } },
      },
    },
    '/api/seller/products': {
      get: {
        tags: ['Seller Products'],
        summary: 'Список товаров продавца',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Пагинированный список' } },
      },
      post: {
        tags: ['Seller Products'],
        summary: 'Создать товар',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Товар создан' } },
      },
    },
    '/api/seller/products/{id}': {
      get: {
        tags: ['Seller Products'],
        summary: 'Детали товара',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Товар' } },
      },
      put: {
        tags: ['Seller Products'],
        summary: 'Обновить товар',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Обновлено' } },
      },
      delete: {
        tags: ['Seller Products'],
        summary: 'Удалить товар',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Удалено' } },
      },
    },
    '/api/seller/products/{id}/images': {
      post: {
        tags: ['Seller Products'],
        summary: 'Добавить изображения (URL)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '201': { description: 'Изображения добавлены' } },
      },
    },
    '/api/seller/orders': {
      get: {
        tags: ['Seller Orders'],
        summary: 'Заказы с товарами продавца',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Список заказов' } },
      },
    },
    '/api/seller/orders/{id}': {
      get: {
        tags: ['Seller Orders'],
        summary: 'Детали заказа',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Заказ' } },
      },
    },
    '/api/seller/orders/{id}/items': {
      get: {
        tags: ['Seller Orders'],
        summary: 'Позиции заказа продавца',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Позиции' } },
      },
    },
    '/api/seller/orders/{id}/status': {
      put: {
        tags: ['Seller Orders'],
        summary: 'Изменить статус заказа',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Статус обновлён' } },
      },
    },
    '/api/seller/analytics/sales': {
      get: {
        tags: ['Seller Analytics'],
        summary: 'Статистика продаж по периодам',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'groupBy', in: 'query', schema: { type: 'string', enum: ['day', 'week', 'month'] } },
        ],
        responses: { '200': { description: 'Агрегаты продаж' } },
      },
    },
    '/api/seller/analytics/products': {
      get: {
        tags: ['Seller Analytics'],
        summary: 'Топ товаров по продажам',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Топ товаров' } },
      },
    },
    '/api/seller/analytics/revenue': {
      get: {
        tags: ['Seller Analytics'],
        summary: 'Выручка по периодам',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Выручка' } },
      },
    },
    '/api/seller/store': {
      get: {
        tags: ['Seller Store'],
        summary: 'Информация о магазине',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Магазин' } },
      },
      put: {
        tags: ['Seller Store'],
        summary: 'Обновить магазин',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Обновлено' } },
      },
    },
  },
} as const;
