import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trophy, X } from "lucide-react";

const ROUND_TYPES = [
  { value: "standard", label: "Standard Round" },
  { value: "bonus", label: "Bonus Round" },
  { value: "penalty", label: "Penalty Round" },
];

const SupercampRoundForm = ({ isOpen, onClose, onSubmit, editingRound }) => {
  const [form, setForm] = useState({
    roundName: "",
    description: "",
    mixPoints: "",
    roundType: "standard",
    minusMarking: false,
    status: "active",
  });

  useEffect(() => {
    if (editingRound) {
      setForm({
        roundName: editingRound.roundName || "",
        description: editingRound.description || "",
        mixPoints:
          editingRound.mixPoints != null && editingRound.mixPoints !== ""
            ? String(editingRound.mixPoints)
            : "",
        roundType: editingRound.roundType || "standard",
        minusMarking: Boolean(editingRound.minusMarking),
        status: editingRound.status || "active",
      });
    } else {
      setForm({
        roundName: "",
        description: "",
        mixPoints: "",
        roundType: "standard",
        minusMarking: false,
        status: "active",
      });
    }
  }, [editingRound, isOpen]);

  if (!isOpen) return null;

  const isPenalty = form.roundType === "penalty";
  const isBonus = form.roundType === "bonus";

  const handleTypeChange = (roundType) => {
    setForm((prev) => ({
      ...prev,
      roundType,
      minusMarking: roundType === "penalty" ? true : prev.minusMarking,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      mixPoints: form.mixPoints === "" ? 0 : Number(form.mixPoints),
      minusMarking: isPenalty ? true : form.minusMarking,
    });
  };

  const maxLabel = isPenalty ? "Max Penalty" : isBonus ? "Max Bonus" : "Max Points";

  const fieldClass = "w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)]";

  return createPortal(
    <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--border-card)] bg-[var(--bg-card)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]"><Trophy className="h-4 w-4" /></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Supercamp round</p><h3 className="text-lg font-bold text-[var(--text-primary)]">{editingRound ? "Edit Round" : "Create Round"}</h3></div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-card)] text-[var(--text-secondary)] transition hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="professional-scrollbar overflow-y-auto overscroll-contain p-5 pr-3 [scrollbar-gutter:stable]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Round Type *</label>
            <select
              value={form.roundType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className={fieldClass}
            >
              {ROUND_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Round Name *</label>
            <input
              required
              value={form.roundName}
              onChange={(e) => setForm({ ...form, roundName: e.target.value })}
              className={fieldClass}
              placeholder={
                isBonus ? "e.g. Best Fielder Bonus" : isPenalty ? "e.g. Late Arrival" : "e.g. Batting Round 1"
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${fieldClass} min-h-[80px] resize-y`}
              placeholder="Round details..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">{maxLabel}</label>
            <input
              type="number"
              min={0}
              value={form.mixPoints}
              onChange={(e) => setForm({ ...form, mixPoints: e.target.value })}
              placeholder="e.g. 10"
              className={fieldClass}
            />
          </div>
          {form.roundType === "standard" && (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={form.minusMarking}
                onChange={(e) => setForm({ ...form, minusMarking: e.target.checked })}
                className="rounded"
              />
              Allow minus marking (negative points)
            </label>
          )}
          {isPenalty && (
            <p className="text-xs text-amber-400">
              Penalty points are subtracted from total. Enter as positive numbers.
            </p>
          )}
          {isBonus && (
            <p className="text-xs text-emerald-400">Bonus points are added to the player total.</p>
          )}
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={fieldClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-[var(--primary)] py-2.5 text-sm font-semibold text-[var(--text-dark)] transition hover:opacity-90">
              {editingRound ? "Update" : "Create"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SupercampRoundForm;
