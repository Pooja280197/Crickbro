import React, { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";

export default function TeamCard({
  team,
  isAdded = false,
  isSelected = false,
  onSelect,
  showActions = true,
}) {
  const [imageError, setImageError] = useState(false);
  const initials = team?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(team.id);
    }
  };

  return (
    <div
      onClick={handleSelect}
      className={`group relative flex min-h-[132px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border p-3 text-center shadow-[0_8px_22px_rgba(16,32,51,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(16,32,51,0.14)] ${
        isSelected
          ? "border-[var(--border-primary)] bg-[var(--accent-light)]"
          : "border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--border-primary)]"
      }`}
    >
      {showActions && (
        <div
          className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition ${
            isSelected
              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
              : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)] group-hover:border-[var(--border-primary)] group-hover:text-[var(--primary)]"
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      {isAdded && (
        <span className="absolute left-2 top-2 rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[10px] font-bold text-[#102033]">
          Added
        </span>
      )}

      <div
        className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border text-sm font-bold ${
          isSelected
            ? "border-[var(--primary)] bg-[var(--bg-card)] text-[var(--primary)]"
            : "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"
        }`}
      >
        {!imageError && team.image ? (
          <img
            loading="lazy"
            decoding="async"
            src={team.image}
            alt={team.name}
            className="h-full w-full object-contain p-1"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{initials || <ShieldCheck size={18} />}</span>
        )}
      </div>

      <p className="mt-2 line-clamp-2 min-h-[34px] w-full text-sm font-semibold leading-snug text-[var(--text-primary)]">
        {team.name}
      </p>
      <p className="text-[11px] font-medium text-[var(--text-secondary)]">
        Tap to {isSelected ? "remove" : "select"}
      </p>
    </div>
  );
}
