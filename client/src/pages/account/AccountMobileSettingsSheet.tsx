import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { AccountSection } from './types';
import styles from './AccountMobileSettingsSheet.module.css';

interface AccountMobileSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (id: AccountSection) => void;
  onLogout: () => void;
}

const SETTINGS_ITEMS: { id: AccountSection; label: string }[] = [
  { id: 'profile', label: 'Личные данные' },
  { id: 'notifications', label: 'Уведомления' },
  { id: 'support', label: 'Поддержка' },
];

export function AccountMobileSettingsSheet({
  open,
  onClose,
  onNavigate,
  onLogout,
}: AccountMobileSettingsSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleNavigate = (id: AccountSection) => {
    onClose();
    onNavigate(id);
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return createPortal(
    <>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Закрыть настройки"
        onClick={onClose}
      />
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Настройки личного кабинета"
      >
        <div className={styles.handle} aria-hidden />
        <ul className={styles.list}>
          {SETTINGS_ITEMS.map((item) => (
            <li key={item.id}>
              <button type="button" className={styles.row} onClick={() => handleNavigate(item.id)}>
                <span>{item.label}</span>
                <span className={styles.chevron} aria-hidden>
                  ›
                </span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={`${styles.row} ${styles.rowDanger}`}
              onClick={handleLogout}
            >
              <span>Выйти</span>
              <span className={styles.chevron} aria-hidden>
                ›
              </span>
            </button>
          </li>
        </ul>
      </div>
    </>,
    document.body,
  );
}
