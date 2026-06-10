import { CalendarDays, Clock3, Eye, ShieldCheck } from "lucide-react";

const statusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "ongoing") return "bg-emerald-50 text-emerald-700";
  if (value === "completed") return "bg-[var(--accent-light)] text-[var(--primary)]";
  if (value === "cancelled") return "bg-red-50 text-red-600";
  return "bg-[var(--secondary-lighter)] text-[var(--text-primary)]";
};

const SlotCard = ({ slot, onClick }) => {
  const session =
    slot.sessions && slot.sessions.length > 0 ? slot.sessions[0] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 text-left shadow-[0_8px_20px_rgba(16,32,51,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--border-primary)] hover:shadow-[0_14px_28px_rgba(16,32,51,0.12)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
            <ShieldCheck size={16} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {slot.slotName}
            </h3>
            <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-wide text-[var(--primary)]">
              {slot.slotCode || "Slot"} • {slot.slotType || "-"}
            </p>
          </div>
        </div>

        <Eye
          size={15}
          className="mt-1 shrink-0 text-[var(--text-secondary)] transition group-hover:text-[var(--primary)]"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[var(--text-secondary)]">
        {session && (
          <>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} className="text-[var(--primary)]" />
              {new Date(session.slotDate).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={13} className="text-[var(--primary)]" />
              {session.slotStartTime} - {session.slotEndTime}
            </span>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${statusClass(
            session?.status,
          )}`}
        >
          {session?.status || "No session"}
        </span>

        <span className="truncate text-xs font-semibold text-[var(--text-secondary)]">
          {slot.location?.city || slot.location?.venue || "-"}
        </span>
      </div>
    </button>
  );
};

export default SlotCard;
