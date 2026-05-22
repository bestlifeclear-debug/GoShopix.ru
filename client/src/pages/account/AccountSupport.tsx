import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  Gift,
  HelpCircle,
  Package,
  RotateCcw,
  Search,
  Store,
  XCircle,
} from 'lucide-react';
import { supportApi } from '../../api/index';
import type { Order, SupportTicket, SupportTicketTopic } from '../../api/types';
import { Button } from '../../design-system';
import type { AccountSection } from './types';
import { orderShortId } from './utils';
import {
  SUPPORT_EMAIL,
  SUPPORT_FAQ,
  SUPPORT_QUICK_ACTIONS,
  TICKET_STATUS_LABELS,
  type QuickActionId,
} from './supportConstants';
import { SupportTicketModal } from './SupportTicketModal';
import styles from './AccountSupport.module.css';

const QUICK_ICONS: Record<QuickActionId, typeof Package> = {
  orders: Package,
  returns: RotateCcw,
  payment: CreditCard,
  cancel: XCircle,
  product: HelpCircle,
  seller: Store,
  bonuses: Gift,
};

interface AccountSupportProps {
  orders: Order[];
  contextOrderId: string | null;
  isSeller: boolean;
  onNavigateSection: (id: AccountSection) => void;
  onOpenOrder: (orderId: string) => void;
}

export function AccountSupport({
  orders,
  contextOrderId,
  isSeller,
  onNavigateSection,
  onOpenOrder,
}: AccountSupportProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState<SupportTicketTopic | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<Record<string, SupportTicket>>({});
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const contextOrder = useMemo(
    () => (contextOrderId ? orders.find((o) => o.id === contextOrderId) : null),
    [contextOrderId, orders],
  );

  const quickActions = useMemo(() => {
    const base = [...SUPPORT_QUICK_ACTIONS];
    if (isSeller) {
      base.push({
        id: 'seller' as QuickActionId,
        title: 'Кабинет продавца',
        subtitle: 'Заказы и товары магазина',
        sellerPath: '/seller/dashboard',
      });
    }
    return base;
  }, [isSeller]);

  const filteredFaq = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SUPPORT_FAQ;
    return SUPPORT_FAQ.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q)),
    );
  }, [search]);

  const loadTickets = useCallback(() => {
    setTicketsLoading(true);
    supportApi
      .listTickets(1, 30)
      .then((r) => setTickets(r.items))
      .catch(() => setTickets([]))
      .finally(() => setTicketsLoading(false));
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (contextOrderId) {
      setModalTopic('order');
    }
  }, [contextOrderId]);

  const openModal = (topic?: SupportTicketTopic) => {
    setModalTopic(topic ?? null);
    setModalOpen(true);
  };

  const handleQuickAction = (action: (typeof quickActions)[number]) => {
    if (action.sellerPath) {
      navigate(action.sellerPath);
      return;
    }
    if (action.topic && !action.section) {
      openModal(action.topic);
      return;
    }
    if (action.section) {
      onNavigateSection(action.section);
      return;
    }
    openModal();
  };

  const toggleFaq = (id: string) => {
    setExpandedFaq((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateTicket = async (payload: {
    topic: SupportTicketTopic;
    message: string;
    orderId?: string;
  }) => {
    setSubmitting(true);
    try {
      await supportApi.createTicket({
        ...payload,
        orderId: payload.orderId ?? contextOrderId ?? undefined,
      });
      setModalOpen(false);
      loadTickets();
    } finally {
      setSubmitting(false);
    }
  };

  const loadTicketDetail = async (id: string) => {
    if (ticketDetails[id]) return;
    const detail = await supportApi.getTicket(id);
    setTicketDetails((d) => ({ ...d, [id]: detail }));
  };

  const toggleTicket = async (id: string) => {
    if (expandedTicketId === id) {
      setExpandedTicketId(null);
      return;
    }
    setExpandedTicketId(id);
    setReplyText('');
    await loadTicketDetail(id);
  };

  const handleReply = async (ticketId: string) => {
    const text = replyText.trim();
    if (!text) return;
    setReplyLoading(true);
    try {
      const updated = await supportApi.reply(ticketId, text);
      setTicketDetails((d) => ({ ...d, [ticketId]: updated }));
      setReplyText('');
      loadTickets();
    } finally {
      setReplyLoading(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={styles.support}>
      {contextOrder && (
        <div className={styles.orderBanner} role="status">
          <p className={styles.orderBannerText}>
            Вопрос по заказу № {orderShortId(contextOrder.id)}
          </p>
          <div className={styles.orderBannerActions}>
            <Button variant="outline" size="sm" onClick={() => onOpenOrder(contextOrder.id)}>
              Открыть заказ
            </Button>
            <Button size="sm" onClick={() => openModal('order')}>
              Написать в поддержку
            </Button>
          </div>
        </div>
      )}

      <div className={styles.helpZone}>
      <section className={styles.hero} aria-labelledby="support-hero-title">
        <h2 id="support-hero-title" className={styles.heroTitle}>
          Чем помочь?
        </h2>
        <p className={styles.heroText}>
          Служба поддержки GoShopix на связи круглосуточно — найдите ответ ниже или создайте обращение.
        </p>
        <div className={styles.searchWrap}>
          <Search className={styles.searchIcon} size={20} aria-hidden />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Поиск по вопросам и темам"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Поиск по базе помощи"
          />
        </div>
      </section>

      <section className={styles.sectionBlock} aria-labelledby="support-quick-title">
        <h2 id="support-quick-title" className={styles.sectionTitle}>
          Быстрые действия
        </h2>
        <ul className={styles.quickGrid}>
          {quickActions.map((action) => {
            const Icon = QUICK_ICONS[action.id] ?? HelpCircle;
            return (
              <li key={action.id}>
                <button type="button" className={styles.quickTile} onClick={() => handleQuickAction(action)}>
                  <span className={styles.quickIcon} aria-hidden>
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <span className={styles.quickBody}>
                    <span className={styles.quickTitle}>{action.title}</span>
                    <span className={styles.quickSubtitle}>{action.subtitle}</span>
                  </span>
                  <ChevronRight className={styles.quickChevron} size={18} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.sectionBlock} aria-labelledby="support-faq-title">
        <h2 id="support-faq-title" className={styles.sectionTitle}>
          Популярные вопросы
        </h2>
        {filteredFaq.length === 0 ? (
          <p className={styles.faqEmpty}>
            По запросу ничего не найдено.{' '}
            <button type="button" className={styles.contactEmail} onClick={() => openModal()}>
              Напишите в поддержку
            </button>
            — поможем вручную.
          </p>
        ) : (
          <ul className={styles.faqList}>
            {filteredFaq.map((item) => {
              const open = expandedFaq.has(item.id);
              return (
                <li key={item.id} className={styles.faqItem}>
                  <button
                    type="button"
                    className={styles.faqTrigger}
                    aria-expanded={open}
                    onClick={() => toggleFaq(item.id)}
                  >
                    {item.question}
                    <ChevronDown
                      size={18}
                      aria-hidden
                      style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
                    />
                  </button>
                  {open && <p className={styles.faqAnswer}>{item.answer}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={styles.contactCard} aria-labelledby="support-contact-title">
        <div>
          <h2 id="support-contact-title" className={styles.sectionTitle}>
            Не нашли ответ?
          </h2>
          <p className={styles.contactText}>Опишите ситуацию — мы ответим в обращении в личном кабинете.</p>
          <div className={styles.contactEmailRow}>
            <a href={`mailto:${SUPPORT_EMAIL}`} className={styles.contactEmail}>
              {SUPPORT_EMAIL}
            </a>
            <button type="button" className={styles.copyBtn} onClick={() => void copyEmail()}>
              {copyDone ? 'Скопировано' : 'Копировать'}
            </button>
          </div>
        </div>
        <Button onClick={() => openModal(contextOrderId ? 'order' : undefined)}>Написать в поддержку</Button>
      </section>
      </div>

      <div className={styles.ticketsZone}>
        <div className={styles.ticketsDivider}>
          <span className={styles.ticketsDividerLine} />
          <span className={styles.ticketsDividerLabel}>Мои обращения</span>
          <span className={styles.ticketsDividerLine} />
        </div>

      <section className={styles.ticketsSection} aria-labelledby="support-tickets-title">
        <h2 id="support-tickets-title" className={styles.ticketsSectionTitle}>
          История обращений
        </h2>
        <p className={styles.ticketsSectionHint}>
          Здесь отображаются ваши диалоги со службой поддержки
        </p>
        {ticketsLoading ? (
          <p className={styles.ticketsEmpty}>Загрузка…</p>
        ) : tickets.length === 0 ? (
          <p className={styles.ticketsEmpty}>
            Обращений пока нет. Нажмите «Написать в поддержку», если нужна помощь специалиста.
          </p>
        ) : (
          <ul className={styles.ticketsList}>
            {tickets.map((ticket) => {
              const expanded = expandedTicketId === ticket.id;
              const detail = ticketDetails[ticket.id];
              const messages = detail?.messages ?? [];
              const canReply = ticket.status !== 'closed';

              return (
                <li key={ticket.id} className={styles.ticketRow}>
                  <button type="button" className={styles.ticketHead} onClick={() => void toggleTicket(ticket.id)}>
                    <span className={styles.ticketSubject}>{ticket.subject}</span>
                    <span className={`${styles.statusBadge} ${styles[`status_${ticket.status}`]}`}>
                      {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
                    </span>
                    <span className={styles.ticketMeta}>
                      {new Date(ticket.updatedAt).toLocaleString('ru-RU')}
                      {ticket.orderId ? ` · № ${orderShortId(ticket.orderId)}` : ''}
                    </span>
                    <ChevronDown
                      size={18}
                      aria-hidden
                      style={{
                        transform: expanded ? 'rotate(180deg)' : undefined,
                        transition: 'transform 0.2s',
                      }}
                    />
                  </button>
                  {expanded && (
                    <div className={styles.ticketDetail}>
                      {messages.length === 0 ? (
                        <p className={styles.ticketMeta}>Загрузка переписки…</p>
                      ) : (
                        <ul className={styles.messages}>
                          {messages.map((m) => (
                            <li
                              key={m.id}
                              className={`${styles.message} ${
                                m.authorRole === 'STAFF' ? styles.messageStaff : styles.messageCustomer
                              }`}
                            >
                              <span className={styles.messageMeta}>
                                {m.authorRole === 'STAFF' ? 'Поддержка GoShopix' : 'Вы'} ·{' '}
                                {new Date(m.createdAt).toLocaleString('ru-RU')}
                              </span>
                              {m.body}
                            </li>
                          ))}
                        </ul>
                      )}
                      {canReply && (
                        <form
                          className={styles.replyForm}
                          onSubmit={(e) => {
                            e.preventDefault();
                            void handleReply(ticket.id);
                          }}
                        >
                          <textarea
                            className={styles.replyInput}
                            rows={3}
                            placeholder="Дополните обращение…"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <Button type="submit" size="sm" disabled={replyLoading || !replyText.trim()}>
                            {replyLoading ? 'Отправка…' : 'Отправить сообщение'}
                          </Button>
                        </form>
                      )}
                      {ticket.orderId && (
                        <p className={styles.ticketMeta}>
                          <button type="button" className={styles.contactEmail} onClick={() => onOpenOrder(ticket.orderId!)}>
                            Перейти к заказу № {orderShortId(ticket.orderId)}
                          </button>
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
      </div>

      <div className={styles.stickyCta}>
        <Button onClick={() => openModal()}>Написать в поддержку</Button>
      </div>

      <SupportTicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        orders={orders}
        initialOrderId={contextOrderId}
        initialTopic={modalTopic}
        submitting={submitting}
        onSubmit={(p) => void handleCreateTicket(p)}
      />
    </div>
  );
}
