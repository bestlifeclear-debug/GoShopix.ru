import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Order, SupportTicketTopic } from '../../api/types';
import { Button } from '../../design-system';
import modalStyles from '../../components/ProductReviews/ReviewWriteModal.module.css';
import { orderShortId } from './utils';
import { SUPPORT_TOPIC_OPTIONS } from './supportConstants';

interface SupportTicketModalProps {
  open: boolean;
  onClose: () => void;
  orders: Order[];
  initialOrderId: string | null;
  initialTopic: SupportTicketTopic | null;
  submitting: boolean;
  onSubmit: (payload: { topic: SupportTicketTopic; message: string; orderId?: string }) => void;
}

export function SupportTicketModal({
  open,
  onClose,
  orders,
  initialOrderId,
  initialTopic,
  submitting,
  onSubmit,
}: SupportTicketModalProps) {
  const [topic, setTopic] = useState<SupportTicketTopic>('other');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setTopic(initialTopic ?? 'other');
    setOrderId(initialOrderId ?? '');
    setMessage('');
  }, [open, initialTopic, initialOrderId]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (trimmed.length < 10) return;
    onSubmit({
      topic,
      message: trimmed,
      orderId: orderId || undefined,
    });
  };

  if (!open) return null;

  const showOrderSelect = topic === 'order' || topic === 'return' || topic === 'payment' || topic === 'cancel' || topic === 'product';

  return createPortal(
    <div className={modalStyles.overlay} role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className={modalStyles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560 }}
      >
        <header className={modalStyles.header}>
          <h2 id="support-modal-title" className={modalStyles.title}>
            Написать в поддержку
          </h2>
          <button type="button" className={modalStyles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <X size={22} aria-hidden />
          </button>
        </header>

        <div className={modalStyles.body}>
          <label className={modalStyles.field}>
            <span className={modalStyles.label}>Тема обращения</span>
            <select
              className={modalStyles.input}
              value={topic}
              onChange={(e) => setTopic(e.target.value as SupportTicketTopic)}
            >
              {SUPPORT_TOPIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {showOrderSelect && orders.length > 0 && (
            <label className={modalStyles.field}>
              <span className={modalStyles.label}>Заказ (необязательно)</span>
              <select
                className={modalStyles.input}
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              >
                <option value="">Не выбран</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    № {orderShortId(o.id)} · {new Date(o.createdAt).toLocaleDateString('ru-RU')}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className={modalStyles.field}>
            <span className={modalStyles.label}>Опишите ситуацию</span>
            <textarea
              className={modalStyles.textarea}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Укажите номер заказа, что произошло и что ожидаете — так мы быстрее поможем."
            />
            <span className={modalStyles.label} style={{ fontWeight: 400, color: '#94a3b8' }}>
              Минимум 10 символов
            </span>
          </label>
        </div>

        <footer className={modalStyles.footer}>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || message.trim().length < 10}>
            {submitting ? 'Отправка…' : 'Отправить'}
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
