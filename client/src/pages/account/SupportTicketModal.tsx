import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Order, SupportTicketTopic } from '../../api/types';
import { orderShortId } from './utils';
import { SUPPORT_TOPIC_OPTIONS } from './supportConstants';
import styles from './SupportTicketModal.module.css';

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
  const titleId = useId();
  const trimmedLen = message.trim().length;
  const canSubmit = trimmedLen >= 10;

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    onSubmit({
      topic,
      message: message.trim(),
      orderId: orderId || undefined,
    });
  };

  if (!open) return null;

  const showOrderSelect =
    topic === 'order' ||
    topic === 'return' ||
    topic === 'payment' ||
    topic === 'cancel' ||
    topic === 'product';

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <p id={titleId} className={styles.title}>
            Написать в поддержку
          </p>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </header>

        <form className={styles.formWrap} onSubmit={handleSubmit}>
        <div className={styles.body}>
          <div className={styles.form}>
            <label className={styles.field}>
              <span className={styles.label}>Тема обращения</span>
              <select
                className={`${styles.control} ${styles.select}`}
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

            {showOrderSelect && orders.length > 0 ? (
              <label className={styles.field}>
                <span className={styles.label}>Заказ</span>
                <select
                  className={`${styles.control} ${styles.select}`}
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
            ) : null}

            <label className={styles.field}>
              <span className={styles.label}>Опишите ситуацию</span>
              <textarea
                className={`${styles.control} ${styles.textarea}`}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Номер заказа, что случилось и чего ждёте — ответим как можно быстрее"
              />
              <span
                className={`${styles.hint} ${trimmedLen > 0 && trimmedLen < 10 ? styles.hintInvalid : ''}`}
              >
                {trimmedLen > 0 && trimmedLen < 10
                  ? `Ещё ${10 - trimmedLen} симв.`
                  : 'Минимум 10 символов'}
              </span>
            </label>
          </div>
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onClose}
            disabled={submitting}
          >
            Отмена
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={submitting || !canSubmit}>
            {submitting ? 'Отправка…' : 'Отправить'}
          </button>
        </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
