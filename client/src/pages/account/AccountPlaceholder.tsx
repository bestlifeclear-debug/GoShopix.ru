import styles from '../AccountPage.module.css';

interface AccountPlaceholderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AccountPlaceholder({ title, description, actionLabel, onAction }: AccountPlaceholderProps) {
  return (
    <div className={styles.placeholder}>
      <div className={styles.placeholderIcon} aria-hidden>
        ◇
      </div>
      <h2 className={styles.placeholderTitle}>{title}</h2>
      <p className={styles.placeholderText}>{description}</p>
      {actionLabel && onAction && (
        <button type="button" className={styles.btnSecondary} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
