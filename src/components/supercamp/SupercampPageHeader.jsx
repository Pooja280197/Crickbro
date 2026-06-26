import React from "react";

const SupercampPageHeader = ({ icon: Icon, eyebrow, title, description, actions }) => (
  <div className="flex flex-col gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          {eyebrow}
        </p>
        <h2 className="mt-0.5 text-xl font-bold text-[var(--text-primary)]">{title}</h2>
        <p className="mt-0.5 text-sm font-medium text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
);

export default SupercampPageHeader;
