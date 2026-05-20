export interface MegaMenuLink {
  label: string;
  slug: string;
}

export interface MegaMenuColumn {
  title: string;
  links: MegaMenuLink[];
}

export interface MegaMenuCategory {
  id: string;
  name: string;
  slug: string;
  columns: MegaMenuColumn[];
}

export const MEGA_MENU_CATEGORIES: MegaMenuCategory[] = [
  {
    id: 'electronics',
    name: 'Электроника',
    slug: 'electronics',
    columns: [
      {
        title: 'Смартфоны и связь',
        links: [
          { label: 'Смартфоны', slug: 'smartphones' },
          { label: 'Чехлы и стёкла', slug: 'phone-cases' },
          { label: 'Наушники', slug: 'headphones' },
          { label: 'Умные часы', slug: 'smartwatches' },
        ],
      },
      {
        title: 'Компьютеры',
        links: [
          { label: 'Ноутбуки', slug: 'laptops' },
          { label: 'Планшеты', slug: 'tablets' },
          { label: 'Мониторы', slug: 'monitors' },
          { label: 'Периферия', slug: 'peripherals' },
        ],
      },
      {
        title: 'ТВ и аудио',
        links: [
          { label: 'Телевизоры', slug: 'tv' },
          { label: 'Колонки', slug: 'speakers' },
          { label: 'Игровые консоли', slug: 'consoles' },
          { label: 'Аксессуары', slug: 'electronics-accessories' },
        ],
      },
      {
        title: 'Фото и видео',
        links: [
          { label: 'Камеры', slug: 'cameras' },
          { label: 'Объективы', slug: 'lenses' },
          { label: 'Экшн-камеры', slug: 'action-cams' },
          { label: 'Штативы', slug: 'tripods' },
        ],
      },
    ],
  },
  {
    id: 'clothing',
    name: 'Одежда',
    slug: 'clothing',
    columns: [
      {
        title: 'Женщинам',
        links: [
          { label: 'Платья', slug: 'dresses' },
          { label: 'Блузы и рубашки', slug: 'blouses' },
          { label: 'Джинсы', slug: 'womens-jeans' },
          { label: 'Верхняя одежда', slug: 'womens-outerwear' },
        ],
      },
      {
        title: 'Мужчинам',
        links: [
          { label: 'Футболки', slug: 'mens-tshirts' },
          { label: 'Рубашки', slug: 'mens-shirts' },
          { label: 'Брюки', slug: 'mens-pants' },
          { label: 'Куртки', slug: 'mens-jackets' },
        ],
      },
      {
        title: 'Обувь',
        links: [
          { label: 'Кроссовки', slug: 'sneakers' },
          { label: 'Ботинки', slug: 'boots' },
          { label: 'Сандалии', slug: 'sandals' },
          { label: 'Домашняя обувь', slug: 'slippers' },
        ],
      },
      {
        title: 'Аксессуары',
        links: [
          { label: 'Сумки', slug: 'bags' },
          { label: 'Ремни', slug: 'belts' },
          { label: 'Головные уборы', slug: 'hats' },
          { label: 'Украшения', slug: 'jewelry' },
        ],
      },
    ],
  },
  {
    id: 'home',
    name: 'Дом и сад',
    slug: 'home',
    columns: [
      {
        title: 'Мебель',
        links: [
          { label: 'Диваны', slug: 'sofas' },
          { label: 'Кресла', slug: 'armchairs' },
          { label: 'Столы', slug: 'tables' },
          { label: 'Шкафы', slug: 'wardrobes' },
        ],
      },
      {
        title: 'Текстиль',
        links: [
          { label: 'Постельное бельё', slug: 'bedding' },
          { label: 'Полотенца', slug: 'towels' },
          { label: 'Шторы', slug: 'curtains' },
          { label: 'Ковры', slug: 'rugs' },
        ],
      },
      {
        title: 'Кухня',
        links: [
          { label: 'Посуда', slug: 'tableware' },
          { label: 'Техника', slug: 'kitchen-appliances' },
          { label: 'Хранение', slug: 'kitchen-storage' },
          { label: 'Ножи и доски', slug: 'knives-boards' },
        ],
      },
      {
        title: 'Сад',
        links: [
          { label: 'Инструменты', slug: 'garden-tools' },
          { label: 'Растения', slug: 'plants' },
          { label: 'Гриль', slug: 'grill' },
          { label: 'Освещение', slug: 'outdoor-lighting' },
        ],
      },
    ],
  },
  {
    id: 'beauty',
    name: 'Красота',
    slug: 'beauty',
    columns: [
      {
        title: 'Уход за кожей',
        links: [
          { label: 'Кремы', slug: 'face-creams' },
          { label: 'Сыворотки', slug: 'serums' },
          { label: 'Маски', slug: 'face-masks' },
          { label: 'SPF-защита', slug: 'sunscreen' },
        ],
      },
      {
        title: 'Макияж',
        links: [
          { label: 'Тональные средства', slug: 'foundation' },
          { label: 'Помады', slug: 'lipstick' },
          { label: 'Тени', slug: 'eyeshadow' },
          { label: 'Тушь', slug: 'mascara' },
        ],
      },
      {
        title: 'Волосы',
        links: [
          { label: 'Шампуни', slug: 'shampoo' },
          { label: 'Бальзамы', slug: 'conditioner' },
          { label: 'Стайлинг', slug: 'hair-styling' },
          { label: 'Окрашивание', slug: 'hair-color' },
        ],
      },
      {
        title: 'Парфюмерия',
        links: [
          { label: 'Женские ароматы', slug: 'perfume-women' },
          { label: 'Мужские ароматы', slug: 'perfume-men' },
          { label: 'Нишевая парфюмерия', slug: 'niche-perfume' },
          { label: 'Наборы', slug: 'perfume-sets' },
        ],
      },
    ],
  },
];
