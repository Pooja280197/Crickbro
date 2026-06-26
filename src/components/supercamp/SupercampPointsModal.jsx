import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { X, Star, Gift, AlertTriangle } from "lucide-react";

const TYPE_LABEL = {
  standard: { label: "Standard", className: "text-[var(--primary)] bg-[var(--accent-light)]" },
  bonus: { label: "Bonus", className: "text-emerald-400 bg-emerald-500/10" },
  penalty: { label: "Penalty", className: "text-red-400 bg-red-500/10" },
};

const SupercampPointsModal = ({ isOpen, onClose, onSubmit, player, rounds, loading }) => {
  const [roundPoints, setRoundPoints] = useState({});
  const [bonusPoints, setBonusPoints] = useState("");
  const [penaltyPoints, setPenaltyPoints] = useState("");

  useEffect(() => {
    if (!player) return;
    const map = {};
    (player.roundPoints || []).forEach((rp) => {
      const pts = rp.pointsEarned;
      map[String(rp.supercampRoundId)] =
        pts != null && pts !== "" ? String(pts) : "";
    });
    setRoundPoints(map);
    setBonusPoints(
      player.bonusPoints != null && player.bonusPoints !== ""
        ? String(player.bonusPoints)
        : ""
    );
    setPenaltyPoints(
      player.penaltyPoints != null && player.penaltyPoints !== ""
        ? String(player.penaltyPoints)
        : ""
    );
  }, [player, isOpen]);

  if (!isOpen || !player) return null;

  const activeRounds = (rounds || []).filter((r) => r.status === "active");
  const grouped = {
    standard: activeRounds.filter((r) => !r.roundType || r.roundType === "standard"),
    bonus: activeRounds.filter((r) => r.roundType === "bonus"),
    penalty: activeRounds.filter((r) => r.roundType === "penalty"),
  };

  const validateRoundInput = (round, points) => {
    const type = round.roundType || "standard";
    const maxPts = Number(round.mixPoints) || 0;

    if (maxPts > 0 && Math.abs(points) > maxPts) {
      return `${round.roundName}: points cannot exceed ±${maxPts}`;
    }
    if (type === "bonus" && points < 0) {
      return `${round.roundName}: bonus round only allows positive points`;
    }
    if (type === "penalty" && points < 0) {
      return `${round.roundName}: enter penalty as a positive number`;
    }
    if (type === "standard" && points < 0 && !round.minusMarking) {
      return `${round.roundName}: negative points not allowed for this round`;
    }
    return null;
  };

  const renderRoundInput = (round) => {
    const type = round.roundType || "standard";
    const typeInfo = TYPE_LABEL[type] || TYPE_LABEL.standard;
    const isPenalty = type === "penalty";
    const isStandard = type === "standard";
    const allowNegative = isStandard && round.minusMarking;
    const maxPts = Number(round.mixPoints) || 0;

    return (
      <div
        key={round._id}
        className="flex items-center gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeInfo.className}`}>
              {typeInfo.label}
            </span>
            <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{round.roundName}</span>
          </div>
          <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Max: {maxPts}
            {allowNegative ? " · minus marking allowed" : ""}
            {isPenalty ? " · subtracted from total" : type === "bonus" ? " · added to total" : ""}
          </div>
        </div>
        <input
          type="number"
          value={roundPoints[String(round._id)] ?? ""}
          min={allowNegative && maxPts > 0 ? -maxPts : 0}
          max={maxPts > 0 ? maxPts : undefined}
          onChange={(e) =>
            setRoundPoints({
              ...roundPoints,
              [String(round._id)]: e.target.value,
            })
          }
          placeholder="0"
          className="w-20 shrink-0 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2.5 text-center text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)]"
        />
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    for (const round of activeRounds) {
      const raw = roundPoints[String(round._id)];
      const points =
        raw === "" || raw == null ? 0 : Number(raw);
      if (!Number.isFinite(points)) {
        toast.error(`Enter valid points for ${round.roundName}`);
        return;
      }
      const err = validateRoundInput(round, points);
      if (err) {
        toast.error(err);
        return;
      }
    }

    const roundUpdates = activeRounds.map((round) => ({
      roundId: round._id,
      pointsEarned:
        roundPoints[String(round._id)] === "" || roundPoints[String(round._id)] == null
          ? 0
          : Number(roundPoints[String(round._id)]),
    }));
    onSubmit(player.playerId, {
      roundUpdates,
      bonusPoints: bonusPoints === "" ? 0 : Number(bonusPoints),
      penaltyPoints: penaltyPoints === "" ? 0 : Number(penaltyPoints),
    });
  };

  const hasContent = activeRounds.length > 0 || true;

  return createPortal(
    <div
      className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(88vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border-card)] bg-[var(--bg-card)] p-5">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
              <Star className="h-5 w-5 shrink-0 text-[var(--primary)]" />
              Assign Points
            </h3>
            <p className="mt-0.5 truncate text-sm text-[var(--text-secondary)]">{player.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-[var(--border-card)] p-2 text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-5 space-y-5">
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4 text-center">
              <div className="mb-1 text-xs text-[var(--text-secondary)]">Current Total</div>
              <div className="text-3xl font-bold text-[var(--primary)]">{player.totalPoints ?? 0}</div>
            </div>

            {/* Direct Bonus & Penalty */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Extra Bonus / Penalty
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <label className="text-xs text-emerald-400 flex items-center gap-1 mb-2">
                    <Gift className="w-3.5 h-3.5" />
                    Bonus
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-center text-sm text-[var(--text-primary)] outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <label className="text-xs text-red-400 flex items-center gap-1 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Penalty
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={penaltyPoints}
                    onChange={(e) => setPenaltyPoints(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-center text-sm text-[var(--text-primary)] outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {activeRounds.length === 0 ? (
              <p className="text-sm text-amber-400 text-center py-2">No active rounds.</p>
            ) : (
              <>
                {grouped.standard.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      Standard Rounds
                    </h4>
                    {grouped.standard.map(renderRoundInput)}
                  </div>
                )}
                {grouped.bonus.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                      Bonus Rounds
                    </h4>
                    {grouped.bonus.map(renderRoundInput)}
                  </div>
                )}
                {grouped.penalty.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                      Penalty Rounds
                    </h4>
                    {grouped.penalty.map(renderRoundInput)}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex shrink-0 gap-3 border-t border-[var(--border-card)] bg-[var(--bg-card)] p-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasContent}
              className="flex-1 rounded-lg bg-[var(--primary)] py-2.5 text-sm font-semibold text-[var(--text-dark)] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Points"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default SupercampPointsModal;
