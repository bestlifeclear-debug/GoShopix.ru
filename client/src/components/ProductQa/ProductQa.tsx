import { useState } from 'react';
import { Check } from 'lucide-react';
import { getInitialQuestions } from './mockQuestions';
import type { ProductQuestion } from './types';
import styles from './ProductQa.module.css';

function QuestionItem({
  item,
  helpfulCount,
  voted,
  onHelpful,
}: {
  item: ProductQuestion;
  helpfulCount: number;
  voted: boolean;
  onHelpful: () => void;
}) {
  return (
    <li className={styles.item}>
      <div className={styles.questionBlock}>
        <div className={styles.questionMeta}>
          <span className={styles.questionAuthor}>{item.authorName}</span>
          <time className={styles.questionDate} dateTime={item.createdAt}>
            {item.date}
          </time>
        </div>
        <p className={styles.questionText}>{item.question}</p>
      </div>

      <div className={styles.answerBlock}>
        <span className={styles.officialBadge}>
          <Check size={14} strokeWidth={2.5} className={styles.badgeIcon} aria-hidden />
          {item.answer.badgeLabel}
        </span>
        <p className={styles.answerText}>{item.answer.text}</p>
        <div className={styles.helpfulRow}>
          <button
            type="button"
            className={`${styles.helpfulBtn} ${voted ? styles.helpfulBtnActive : ''}`}
            onClick={onHelpful}
            aria-pressed={voted}
            aria-label={`Полезно, ${helpfulCount}`}
          >
            <span>Полезно?</span>
            <span aria-hidden>👍</span>
            <span className={styles.helpfulCount}>{helpfulCount}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

export function ProductQa() {
  const [questions] = useState(() => getInitialQuestions());
  const [helpfulCounts, setHelpfulCounts] = useState(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.helpfulCount])),
  );
  const [votedIds, setVotedIds] = useState<Set<string>>(() => new Set());

  const handleHelpful = (id: string, baseCount: number) => {
    setVotedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      setHelpfulCounts((counts) => ({
        ...counts,
        [id]: (counts[id] ?? baseCount) + 1,
      }));
      return next;
    });
  };

  if (questions.length === 0) {
    return (
      <p className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden>
          💬
        </span>
        Пока нет вопросов — задайте первый, и продавец ответит здесь.
      </p>
    );
  }

  return (
    <div className={styles.section}>
    <ul className={styles.list}>
      {questions.map((item) => (
        <QuestionItem
          key={item.id}
          item={item}
          helpfulCount={helpfulCounts[item.id] ?? item.helpfulCount}
          voted={votedIds.has(item.id)}
          onHelpful={() => handleHelpful(item.id, item.helpfulCount)}
        />
      ))}
    </ul>
    </div>
  );
}
