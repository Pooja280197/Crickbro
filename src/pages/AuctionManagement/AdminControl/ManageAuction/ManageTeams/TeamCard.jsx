import { Eye, ShieldCheck } from "lucide-react";

export default function TeamCard({ player, onView, showActions }) {
  const initials = player?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group relative w-full">
      <div className="min-h-[132px] rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 text-center shadow-[0_8px_22px_rgba(16,32,51,0.08)] transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--border-primary)] group-hover:shadow-[0_16px_34px_rgba(16,32,51,0.14)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-sm font-bold text-[var(--primary)]">
          {player.image ? (
            <img
              src={player.image}
              alt={player.name}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            initials || <ShieldCheck size={18} />
          )}
        </div>

        <p className="mt-2 truncate text-sm font-semibold text-[var(--text-primary)]">
          {player.name}
        </p>
        <p className="mt-1 text-[11px] font-medium text-[var(--text-secondary)]">
          Auction team
        </p>
      </div>

      {showActions && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[rgba(16,32,51,0.46)] opacity-0 backdrop-blur-[1px] transition group-hover:opacity-100">
          <button
            onClick={() => onView(player)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--secondary)] px-3 text-xs font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)]"
          >
            <Eye size={14} />
            View
          </button>
        </div>
      )}
    </div>
  );
}
