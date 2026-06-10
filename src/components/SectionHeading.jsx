const SectionHeading = ({ eyebrow, title, accent, text, inverse = false }) => {
  const headingColor = inverse ? "text-[var(--inverse-text)]" : "text-[var(--text-primary)]";
  const bodyColor = inverse ? "text-[var(--inverse-muted)]" : "text-[var(--text-secondary)]";
  const badgeClass = inverse
    ? "border-[var(--inverse-border)] bg-white/10 text-[var(--inverse-accent)]"
    : "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]";

  return (
    <div className="mx-auto mb-10 max-w-[680px] text-center">
      {eyebrow && (
        <span className={`inline-flex min-h-[26px] items-center justify-center rounded-full border px-4 text-[10px] font-black uppercase ${badgeClass}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`my-3 font-heading text-[clamp(28px,3vw,38px)] font-bold leading-tight ${headingColor}`}>
        {title} {accent && <span className="gradient-text">{accent}</span>}
      </h2>
      {text && <p className={`m-0 text-sm ${bodyColor}`}>{text}</p>}
    </div>
  );
};

export default SectionHeading;
