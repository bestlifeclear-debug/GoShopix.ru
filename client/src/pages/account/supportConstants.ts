import type { SupportTicketTopic } from '../../api/types';
import type { AccountSection } from './types';

export const SUPPORT_EMAIL = 'support@goshopix.ru';

export const SUPPORT_TOPIC_OPTIONS: { value: SupportTicketTopic; label: string }[] = [
  { value: 'order', label: 'Заказ и доставка' },
  { value: 'return', label: 'Возврат товара' },
  { value: 'payment', label: 'Оплата' },
  { value: 'cancel', label: 'Отмена заказа' },
  { value: 'product', label: 'Проблема с товаром' },
  { value: 'seller', label: 'Вопрос продавцу' },
  { value: 'bonuses', label: 'Бонусы и акции' },
  { value: 'other', label: 'Другое' },
];

export interface SupportFaqItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const SUPPORT_FAQ: SupportFaqItem[] = [
  {
    id: 'delivery-time',
    question: 'Когда привезут заказ?',
    answer:
      'Срок доставки указан в карточке товара и в деталях заказа. Статус можно отследить в разделе «Мои заказы» — там отображаются этапы обработки и отправки.',
    keywords: ['доставка', 'когда', 'привезут', 'срок', 'заказ'],
  },
  {
    id: 'return-how',
    question: 'Как оформить возврат?',
    answer:
      'Возврат доступен для доставленных заказов в течение 14 дней. Откройте заказ в «Мои заказы» или раздел «Возвраты» и следуйте подсказкам. При необходимости создайте обращение в поддержку с темой «Возврат товара».',
    keywords: ['возврат', 'вернуть', '14 дней'],
  },
  {
    id: 'payment-failed',
    question: 'Оплата не прошла — что делать?',
    answer:
      'Проверьте лимиты карты или СБП и повторите оплату из раздела «Мои заказы» для заказов в статусе «Ожидает оплаты». Если списание прошло, а статус не обновился — напишите в поддержку с номером заказа.',
    keywords: ['оплата', 'не прошла', 'карта', 'сбп', 'платёж'],
  },
  {
    id: 'cancel-order',
    question: 'Как отменить заказ?',
    answer:
      'Отмена доступна, пока заказ не передан в доставку. В «Мои заказы» откройте заказ и нажмите «Отменить», если кнопка активна. Иначе создайте обращение с темой «Отмена заказа».',
    keywords: ['отмена', 'отменить', 'заказ'],
  },
  {
    id: 'bonuses',
    question: 'Как использовать бонусы?',
    answer:
      '1 бонус = 1 ₽ при оплате до 30% суммы заказа. Бонусы начисляются после доставки. Баланс отображается в разделе «Баллы и бонусы» личного кабинета.',
    keywords: ['бонусы', 'баллы', 'скидка'],
  },
  {
    id: 'seller-vs-support',
    question: 'Кому писать — продавцу или поддержке GoShopix?',
    answer:
      'Вопросы по качеству товара, комплектации и характеристикам — продавцу (в карточке товара). Вопросы по оплате на сайте, доставке маркетплейса, возврату через GoShopix — в нашу поддержку.',
    keywords: ['продавец', 'маркетплейс', 'поддержка'],
  },
  {
    id: 'notifications',
    question: 'Не пришло уведомление о заказе',
    answer:
      'Проверьте раздел «Уведомления» в личном кабинете и настройки в «Личные данные». Убедитесь, что email указан верно. Письма могут попадать в папку «Спам».',
    keywords: ['уведомление', 'письмо', 'email', 'sms'],
  },
  {
    id: 'track-order',
    question: 'Где посмотреть статус заказа?',
    answer:
      'Все заказы и актуальный статус — в разделе «Мои заказы». Для заказов в пути отображаются трек-номер и перевозчик, если они уже назначены.',
    keywords: ['статус', 'отследить', 'трек', 'где заказ'],
  },
];

export type QuickActionId =
  | 'orders'
  | 'returns'
  | 'payment'
  | 'cancel'
  | 'product'
  | 'bonuses'
  | 'seller';

export interface SupportQuickAction {
  id: QuickActionId;
  title: string;
  subtitle: string;
  section?: AccountSection;
  topic?: SupportTicketTopic;
  sellerPath?: string;
}

export const SUPPORT_QUICK_ACTIONS: SupportQuickAction[] = [
  {
    id: 'orders',
    title: 'Где мой заказ?',
    subtitle: 'Статус и доставка',
    section: 'orders',
  },
  {
    id: 'returns',
    title: 'Возврат товара',
    subtitle: 'Оформить или проверить',
    section: 'returns',
  },
  {
    id: 'payment',
    title: 'Оплата не прошла',
    subtitle: 'Повторить или уточнить',
    section: 'orders',
    topic: 'payment',
  },
  {
    id: 'cancel',
    title: 'Отменить заказ',
    subtitle: 'Пока не отправлен',
    section: 'orders',
    topic: 'cancel',
  },
  {
    id: 'product',
    title: 'Проблема с товаром',
    subtitle: 'Брак, не тот товар',
    topic: 'product',
  },
  {
    id: 'bonuses',
    title: 'Бонусы и акции',
    subtitle: 'Начисление и списание',
    section: 'finance',
  },
];

export const TICKET_STATUS_LABELS: Record<string, string> = {
  open: 'Открыто',
  in_progress: 'В работе',
  answered: 'Есть ответ',
  closed: 'Закрыто',
};
