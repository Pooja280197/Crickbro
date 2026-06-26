import { createPortal } from "react-dom";
import {
  CalendarDays,
  Clock3,
  Lock,
  MapPin,
  ShieldCheck,
  Unlock,
  X,
} from "lucide-react";

const iconTileClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]";

const badgeClass = (type, value) => {
  const normalized = String(value || "").toLowerCase();

  if (type === "match") {
    return normalized === "true"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-red-50 text-red-600";
  }

  if (normalized === "ongoing" || normalized === "unlocked") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalized === "completed") {
    return "bg-[var(--accent-light)] text-[var(--primary)]";
  }

  if (normalized === "locked" || normalized === "cancelled") {
    return "bg-red-50 text-red-600";
  }

  return "bg-[var(--secondary-lighter)] text-[var(--text-primary)]";
};

const DetailsPopup = ({ slot, onClose }) => {
  if (!slot) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] isolate flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className={iconTileClass}>
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                    {slot.slotName}
                  </h2>
                  <span className="rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--primary)]">
                    {slot.slotCode || "Slot"}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                  Slot session and venue information
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
              aria-label="Close slot details"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-12rem)] space-y-4 overflow-y-auto bg-[var(--bg-main)] p-4 professional-scrollbar sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Type
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-[var(--text-primary)]">
                {slot.slotType || "-"}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Country
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                {slot.location?.country || "-"}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Match
              </p>
              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeClass(
                  "match",
                  String(Boolean(slot.slotMatched)),
                )}`}
              >
                {slot.slotMatched ? "Matched" : "Not Matched"}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--primary)]" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  Venue
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {[slot.location?.venue, slot.location?.city, slot.location?.state]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Sessions
                </h4>
                <p className="text-xs font-medium text-[var(--text-secondary)]">
                  {slot.sessions?.length || 0} session records
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(slot.sessions || []).map((session) => (
                <div
                  key={session.sessionId}
                  className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3 shadow-[0_8px_20px_rgba(16,32,51,0.06)]"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {session.sessionName}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm font-medium text-[var(--text-secondary)]">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-[var(--primary)]" />
                          {new Date(session.slotDate).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} className="text-[var(--primary)]" />
                          {session.slotStartTime} - {session.slotEndTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${badgeClass(
                          "status",
                          session.status,
                        )}`}
                      >
                        {session.status || "-"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${badgeClass(
                          "lock",
                          session.lockStatus,
                        )}`}
                      >
                        {session.lockStatus === "locked" ? (
                          <Lock size={12} />
                        ) : (
                          <Unlock size={12} />
                        )}
                        {session.lockStatus || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DetailsPopup;
