import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from '../ProductReviews/ReviewWriteModal.module.css';

export interface QuestionDraft {
  name: string;
  question: string;
}

interface QuestionWriteModalProps {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  userName: string | null;
  onRequireAuth: () => void;
  onSubmit: (draft: QuestionDraft) => void;
}

export function QuestionWriteModal({
  open,
  onClose,
  isAuthenticated,
  userName,
  onRequireAuth,
  onSubmit,
}: QuestionWriteModalProps) {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setName('');
    setQuestion('');
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  useEffect(() => {
    if (open && isAuthenticated && userName) {
      setName(userName);
    }
  }, [open, isAuthenticated, userName]);

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
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    const trimmedName = (name.trim() || userName?.trim() || '').trim();
    if (!trimmedName) return;

    onSubmit({
      name: trimmedName,
      question: trimmedQuestion,
    });
    reset();
    onClose();
  };

  const canSubmit =
    question.trim().length > 0 &&
    (!isAuthenticated || !!(name.trim() || userName?.trim()));

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
            {isAuthenticated && (
              <label className={styles.field}>
                <span className={styles.label}>Ваше имя</span>
                <input
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={!!userName}
                  placeholder="Как к вам обращаться?"
                  autoComplete="name"
                />
              </label>
            )}

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
