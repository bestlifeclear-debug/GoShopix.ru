import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Star, X } from 'lucide-react';
import { Button, Modal } from '../../design-system';
import type { ProductReview } from './types';
import styles from './ProductReviews.module.css';

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
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrls = useRef<string[]>([]);

  const reset = () => {
    setRating(0);
    setHoverRating(0);
    setPros('');
    setCons('');
    setComment('');
    for (const url of blobUrls.current) URL.revokeObjectURL(url);
    blobUrls.current = [];
    setPhotos([]);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  useEffect(
    () => () => {
      for (const url of blobUrls.current) URL.revokeObjectURL(url);
    },
    [],
  );

  const displayRating = hoverRating || rating;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const slots = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).slice(0, slots);
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

  const canSubmit = rating >= 1 && comment.trim().length > 0;

  return (
    <Modal
      open={open}
      title="Оставить отзыв"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            Отправить отзыв
          </Button>
        </>
      }
    >
      <div className={styles.modalForm}>
        <div className={styles.modalField}>
          <span className={styles.modalLabel}>Ваша оценка</span>
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
                className={styles.starPickerBtn}
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} из 5`}
                onMouseEnter={() => setHoverRating(value)}
                onClick={() => setRating(value)}
              >
                <Star
                  size={28}
                  strokeWidth={1.75}
                  className={
                    value <= displayRating ? styles.starPickerActive : styles.starPickerIdle
                  }
                  fill={value <= displayRating ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
        </div>

        <label className={styles.modalField}>
          <span className={styles.modalLabel}>Достоинства</span>
          <textarea
            className={styles.modalTextarea}
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            rows={2}
            placeholder="Что понравилось?"
          />
        </label>

        <label className={styles.modalField}>
          <span className={styles.modalLabel}>Недостатки</span>
          <textarea
            className={styles.modalTextarea}
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            rows={2}
            placeholder="Что можно улучшить?"
          />
        </label>

        <label className={styles.modalField}>
          <span className={styles.modalLabel}>Комментарий</span>
          <textarea
            className={styles.modalTextarea}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Расскажите о покупке подробнее"
            required
          />
        </label>

        <div className={styles.modalField}>
          <span className={styles.modalLabel}>Фото товара</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className={styles.fileInput}
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className={styles.uploadBtn}
            disabled={photos.length >= MAX_PHOTOS}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus size={18} strokeWidth={2} aria-hidden />
            Загрузить фото ({photos.length}/{MAX_PHOTOS})
          </button>
          {photos.length > 0 && (
            <ul className={styles.uploadPreview}>
              {photos.map((url) => (
                <li key={url}>
                  <img src={url} alt="" className={styles.uploadThumb} />
                  <button
                    type="button"
                    className={styles.uploadRemove}
                    aria-label="Удалить фото"
                    onClick={() => removePhoto(url)}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
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
