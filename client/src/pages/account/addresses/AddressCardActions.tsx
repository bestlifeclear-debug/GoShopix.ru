import { Pencil, Trash2 } from 'lucide-react';
import './addresses.css';

type AddressCardActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel: string;
};

export function AddressCardActions({ onEdit, onDelete, deleteLabel }: AddressCardActionsProps) {
  return (
    <div className="addr-card__footer">
      <button type="button" className="addr-card__action addr-card__action--edit" onClick={onEdit}>
        <Pencil size={13} strokeWidth={2} aria-hidden />
        Изменить
      </button>
      <button
        type="button"
        className="addr-card__action addr-card__action--delete"
        onClick={onDelete}
        aria-label={deleteLabel}
      >
        <Trash2 size={13} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
