import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Star, X } from 'lucide-react';
import type { ProductReview } from './types';
import styles from './ReviewWriteModal.module.css';

export interface ReviewDraft {
  rating: number;
  pros: string;
  cons: string;
  comment: string;
  photos: string[];
}

interface ReviewWriteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: ReviewDraft) => void;
}

const MAX_PHOTOS = 5;

function formatTodayRu(): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export function ReviewWriteModal({ open, onClose, onSubmit }: ReviewWriteModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const blobUrls = useRef<string[]>([]);

  const reset = () => {
    setRating(0);
    setHoverRating(0);
    setPros('');
    setCons('');
    setComment('');
    setDragActive(false);
    for (const url of blobUrls.current) URL.revokeObjectURL(url);
    blobUrls.current = [];
    setPhotos([]);
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

  useEffect(
    () => () => {
      for (const url of blobUrls.current) URL.revokeObjectURL(url);
    },
    [],
  );

  const displayRating = hoverRating || rating;
  const canAddPhotos = photos.length < MAX_PHOTOS;

  const handleFiles = (files: FileList | null) => {
    if (!files || !canAddPhotos) return;
    const slots = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, slots);
    for (const file of picked) {
      const url = URL.createObjectURL(file);
      blobUrls.current.push(url);
      setPhotos((prev) => [...prev, url]);
    }
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
    if (blobUrls.current.includes(url)) {
      URL.revokeObjectURL(url);
      blobUrls.current = blobUrls.current.filter((u) => u !== url);
    }
  };

  const handleSubmit = () => {
    if (rating < 1 || !comment.trim()) return;
    onSubmit({
      rating,
      pros: pros.trim(),
      cons: cons.trim(),
      comment: comment.trim(),
      photos: [...photos],
    });
    reset();
    onClose();
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canAddPhotos) setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const canSubmit = rating >= 1 && comment.trim().length > 0;

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="review-modal-title" className={styles.title}>
            Оставить отзыв
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <X size={20} strokeWidth={2} />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.grid}>
            <div className={styles.leftCol}>
              <div className={styles.field}>
                <span className={styles.label}>Ваша оценка</span>
                <div
                  className={styles.starPicker}
                  role="radiogroup"
                  aria-label="Оценка от 1 до 5"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={styles.starBtn}
                      role="radio"
                      aria-checked={rating === value}
                      aria-label={`${value} из 5`}
                      onMouseEnter={() => setHoverRating(value)}
                      onClick={() => setRating(value)}
                    >
                      <Star
                        size={34}
                        strokeWidth={1.5}
                        className={value <= displayRating ? styles.starActive : styles.starIdle}
                        fill={value <= displayRating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Достоинства</span>
                <textarea
                  className={`${styles.textarea} ${styles.textareaPros}`}
                  value={pros}
                  onChange={(e) => setPros(e.target.value)}
                  placeholder="Что понравилось?"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Недостатки</span>
                <textarea
                  className={`${styles.textarea} ${styles.textareaCons}`}
                  value={cons}
                  onChange={(e) => setCons(e.target.value)}
                  placeholder="Что можно улучшить?"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Комментарий</span>
                <textarea
                  className={`${styles.textarea} ${styles.textareaComment}`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Расскажите о покупке подробнее"
                  required
                />
              </label>
            </div>

            <div className={styles.rightCol}>
              <div
                className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''} ${!canAddPhotos ? styles.dropzoneDisabled : ''} ${photos.length > 0 ? styles.dropzoneWithPreviews : ''}`}
                role="button"
                tabIndex={0}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => canAddPhotos && fileRef.current?.click()}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && canAddPhotos) {
                    e.preventDefault();
                    fileRef.current?.click();
                  }
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.fileInput}
                  disabled={!canAddPhotos}
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
                {photos.length === 0 ? (
                  <>
                    <span className={styles.dropzoneIcon} aria-hidden>
                      <Camera size={26} strokeWidth={1.75} />
                    </span>
                    <p className={styles.dropzoneTitle}>Добавить фото</p>
                    <p className={styles.dropzoneHint}>
                      Перетащите файлы сюда или нажмите для выбора
                    </p>
                  </>
                ) : (
                  <>
                    <p className={styles.dropzoneTitle}>Добавить фото</p>
                    <p className={styles.dropzoneCount}>
                      {photos.length} из {MAX_PHOTOS}
                    </p>
                    <ul className={styles.previewGrid}>
                      {photos.map((url) => (
                        <li key={url} className={styles.previewItem}>
                          <img src={url} alt="" className={styles.previewImg} />
                          <button
                            type="button"
                            className={styles.previewRemove}
                            aria-label="Удалить фото"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhoto(url);
                            }}
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    {canAddPhotos && (
                      <p className={styles.dropzoneHint}>Нажмите или перетащите, чтобы добавить ещё</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Отмена
          </button>
          <button type="button" className={styles.btnSubmit} onClick={handleSubmit} disabled={!canSubmit}>
            Отправить отзыв
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

export function draftToReview(draft: ReviewDraft, id: string): ProductReview {
  return {
    id,
    authorName: 'Вы',
    date: formatTodayRu(),
    rating: draft.rating,
    pros: draft.pros || undefined,
    cons: draft.cons || undefined,
    comment: draft.comment,
    photos: draft.photos,
    helpfulCount: 0,
  };
}
