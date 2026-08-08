type WordmarkProps = { className?: string };

export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <span
      className={`inline-flex items-baseline gap-2 font-display text-ink ${className}`}
      aria-label="Mavis"
    >
      <span className="text-[0.7em] leading-none text-peach" aria-hidden="true">
        ✦
      </span>
      <span className="uppercase tracking-[0.28em]">Mavis</span>
    </span>
  );
}
