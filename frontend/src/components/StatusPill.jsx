export default function StatusPill({ category, tone = 'default' }) {
  if (!category) {
    return (
      <span className="inline-flex items-center gap-[5px] px-[7px] py-[2px] border border-border font-mono text-[11px] text-secondary leading-relaxed whitespace-nowrap">
        unclassified
      </span>
    );
  }

  const toneClasses =
    tone === 'accent'
      ? 'border-accent text-accent'
      : tone === 'error'
        ? 'border-error text-error'
        : 'border-border text-secondary';

  return (
    <span
      className={`inline-flex items-center gap-[5px] px-[7px] py-[2px] border font-mono text-[11px] leading-relaxed whitespace-nowrap ${toneClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {category}
    </span>
  );
}