import React from "react";
import { createPortal } from "react-dom";
import { X, Trophy } from "lucide-react";

const SupercampPlayerDetailsModal = ({ isOpen, onClose, player }) => {
  if (!isOpen || !player) return null;

  const initials = (player.name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return createPortal(
    <div
      className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(88vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — fixed */}
        <div className="flex shrink-0 items-center gap-4 border-b border-[var(--border-card)] bg-[var(--bg-card)] p-5">
          {player.profilePicture ? (
            <img
              src={player.profilePicture}
              alt={player.name}
              className="h-14 w-14 shrink-0 rounded-full border-2 border-[var(--border-primary)] object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] font-bold text-[var(--text-dark)]">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-lg font-bold text-[var(--text-primary)]">
              {player.name || "Player"}
            </h3>
            {player.batchId && (
              <p className="truncate text-sm text-[var(--text-secondary)]">{player.batchId}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-[var(--border-card)] p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4">
              <div className="mb-1 text-xs text-[var(--text-secondary)]">Total Points</div>
              <div className="text-2xl font-bold text-[var(--primary)]">
                {player.totalPoints ?? 0}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4">
              <div className="mb-1 text-xs text-[var(--text-secondary)]">Player Role</div>
              <div className="text-sm font-medium capitalize text-[var(--text-primary)]">
                {player.playerRole || "—"}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="text-xs text-emerald-400 mb-1">Bonus</div>
              <div className="text-xl font-bold text-emerald-400">+{player.bonusPoints ?? 0}</div>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="text-xs text-red-400 mb-1">Penalty</div>
              <div className="text-xl font-bold text-red-400">-{player.penaltyPoints ?? 0}</div>
            </div>
            <div className="col-span-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4">
              <div className="mb-1 text-xs text-[var(--text-secondary)]">Slot / Session</div>
              <div className="text-sm text-[var(--text-primary)]">
                {player.slotName || "—"}
                {player.sessionName ? ` · ${player.sessionName}` : ""}
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Trophy className="h-4 w-4 text-[var(--primary)]" />
              Round-wise Points
            </h4>
            {(player.roundPoints || []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-[var(--border-card)] py-4 text-center text-sm text-[var(--text-secondary)]">
                No round points assigned yet.
              </p>
            ) : (
              <div className="space-y-2">
                {player.roundPoints.map((rp) => (
                  <div
                    key={String(rp.supercampRoundId)}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {rp.roundType === "bonus" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                            Bonus
                          </span>
                        )}
                        {rp.roundType === "penalty" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                            Penalty
                          </span>
                        )}
                        <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {rp.roundName || "Round"}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        Max: {rp.mixPoints ?? 0}
                        {rp.status === "inactive" ? " · inactive" : ""}
                      </div>
                    </div>
                    <span
                      className={`text-xl font-bold shrink-0 tabular-nums ${
                        rp.roundType === "penalty"
                          ? "text-red-400"
                          : rp.roundType === "bonus"
                            ? "text-emerald-400"
                            : (rp.pointsEarned ?? 0) < 0
                              ? "text-red-400"
                              : "text-[var(--primary)]"
                      }`}
                    >
                      {rp.roundType === "penalty" ? `-${Math.abs(rp.pointsEarned ?? 0)}` : rp.pointsEarned ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[var(--border-card)] bg-[var(--bg-card)] p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SupercampPlayerDetailsModal;
