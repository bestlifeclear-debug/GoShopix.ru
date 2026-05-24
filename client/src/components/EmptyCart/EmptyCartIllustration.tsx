import { useId } from 'react';

type EmptyCartIllustrationProps = {
  className?: string;
};

/** Минималистичная сумка с мягким сине-фиолетовым градиентом (soft premium). */
export function EmptyCartIllustration({ className = '' }: EmptyCartIllustrationProps) {
  const gradientId = useId();

  return (
    <svg
      className={className}
      width="128"
      height="128"
      viewBox="0 0 128 128"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="16" y1="20" x2="112" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="45%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r="52" fill={`url(#${gradientId})`} opacity="0.12" />
      <path
        d="M40 48h48l-4 52H44L40 48Z"
        fill={`url(#${gradientId})`}
        opacity="0.35"
      />
      <path
        d="M48 48c0-8.837 7.163-16 16-16s16 7.163 16 16"
        stroke={`url(#${gradientId})`}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M44 52h40l-3.5 44H47.5L44 52Z"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M52 68h24"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
