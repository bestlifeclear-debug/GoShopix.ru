type EmptyFavoritesIllustrationProps = {
  className?: string;
};

/** Тонкое контурное сердце — premium empty state */
export function EmptyFavoritesIllustration({ className = '' }: EmptyFavoritesIllustrationProps) {
  return (
    <svg
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
    >
      <circle cx="60" cy="60" r="48" stroke="#e5e7eb" strokeWidth="1.5" />
      <path
        d="M60 88s-22-14.2-28.8-26.4C25.6 50.8 30.2 38 40.4 38c6.4 0 11.2 3.4 14.8 7.2 1.2 1.4 2.2 2.6 4.8 2.6s3.6-1.2 4.8-2.6C68 41.4 72.8 38 79.2 38c10.2 0 14.8 12.8 9.2 23.6C82 73.8 60 88 60 88z"
        stroke="#9ca3af"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
