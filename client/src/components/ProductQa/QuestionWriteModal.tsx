import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from '../ProductReviews/ReviewWriteModal.module.css';

export interface QuestionDraft {
  name: string;
  email: string;
  question: string;
}

interface QuestionWriteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: QuestionDraft) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function QuestionWriteModal({ open, onClose, onSubmit }: QuestionWriteModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setName('');
    setEmail('');
    setQuestion('');
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

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
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedQuestion = question.trim();
    if (!trimmedName || !trimmedEmail || !trimmedQuestion) return;
    if (!EMAIL_RE.test(trimmedEmail)) return;
    onSubmit({
      name: trimmedName,
      email: trimmedEmail,
      question: trimmedQuestion,
    });
    reset();
    onClose();
  };

  const canSubmit =
    name.trim().length > 0 &&
    EMAIL_RE.test(email.trim()) &&
    question.trim().length > 0;

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="question-modal-title" className={styles.title}>
            Задать вопрос
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <X size={20} strokeWidth={2} />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.formStack}>
            <label className={styles.field}>
              <span className={styles.label}>Ваше имя</span>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как к вам обращаться?"
                autoComplete="name"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.ru"
                autoComplete="email"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Ваш вопрос</span>
              <textarea
                className={`${styles.textarea} ${styles.textareaQuestion}`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Опишите, что вас интересует по этому товару"
                required
              />
            </label>
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Отмена
          </button>
          <button type="button" className={styles.btnSubmit} onClick={handleSubmit} disabled={!canSubmit}>
            Отправить вопрос
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
