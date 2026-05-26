import { MessageCircle } from 'lucide-react';
import './orders/orders-list.css';

type EmptySupportTicketsStateProps = {
  onCreateTicket?: () => void;
};

export function EmptySupportTicketsState({ onCreateTicket }: EmptySupportTicketsStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-4 py-8 text-center shadow-sm ring-1 ring-gray-100/90">
      <div
        className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-gray-100"
        aria-hidden
      >
        <MessageCircle className="h-9 w-9 text-gray-300" strokeWidth={1.25} />
      </div>
      <p className="mt-3 text-base font-semibold leading-snug text-gray-900">Обращений пока нет</p>
      <p className="mt-1.5 max-w-[16rem] text-sm leading-normal text-gray-500">
        Создайте обращение — ответим в этом разделе
      </p>
      {onCreateTicket ? (
        <button
          type="button"
          onClick={onCreateTicket}
          className="mt-4 text-sm font-semibold text-[#FF7062] active:opacity-80"
        >
          Написать в поддержку
        </button>
      ) : null}
    </div>
  );
}
