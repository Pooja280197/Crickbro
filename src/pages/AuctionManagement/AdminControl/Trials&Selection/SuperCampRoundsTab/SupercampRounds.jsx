import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, Trophy } from "lucide-react";
import {
  createSupercampRound,
  deleteSupercampRound,
  fetchAuctionDetails,
  getSupercampRounds,
  updateSupercampRound,
} from "../../../../../redux/actions";
import SupercampRoundForm from "./SupercampRoundForm";
import DeleteConfirmModal from "../../../../../components/DeleteConfirmModal";
import SupercampPageHeader from "../../../../../components/supercamp/SupercampPageHeader";

function SupercampRounds({ auctionId }) {
  const dispatch = useDispatch();
  const tournamentId = useSelector((state) => state.tournamentId);
  const roundsData = useSelector((state) => state.data?.supercampRounds);
  const rounds = roundsData?.data || [];
  const loading = useSelector((state) => state.loading?.supercampRounds);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRound, setEditingRound] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAuctionDetails(auctionId));
    dispatch(getSupercampRounds(auctionId));
  }, [auctionId, dispatch]);

  const refresh = () => dispatch(getSupercampRounds(auctionId));

  const handleCreate = async (form) => {
    try {
      await dispatch(
        createSupercampRound({
          ...form,
          auctionId,
          tournamentId,
          createdBy: localStorage.getItem("playerId"),
        })
      );
      toast.success("Round created");
      setFormOpen(false);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };

  const handleUpdate = async (form) => {
    try {
      await dispatch(updateSupercampRound(editingRound._id, form));
      toast.success("Round updated");
      setFormOpen(false);
      setEditingRound(null);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteSupercampRound(deleteId));
      toast.success("Round deleted");
      setDeleteOpen(false);
      setDeleteId(null);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="h-full space-y-4 overflow-y-auto p-3 text-[var(--text-primary)] sm:p-4 lg:p-5">
      <SupercampPageHeader
        icon={Trophy}
        // eyebrow="Trials & Selection"
        title="Supercamp Rounds"
        description="Create and manage scoring rounds for the supercamp."
        actions={
          <button
            onClick={() => {
              setEditingRound(null);
              setFormOpen(true);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--text-dark)] shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create Round
          </button>
        }
      />

      {loading ? (
        <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] py-12 text-center font-semibold text-[var(--primary)] shadow-[var(--shadow-card)] animate-pulse">Loading rounds...</div>
      ) : rounds.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-card)] py-12 text-center text-[var(--text-secondary)] shadow-[var(--shadow-card)]">
          No rounds yet. Create your first supercamp round.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rounds.map((round) => (
            <div
              key={round._id}
              className="flex flex-col gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] transition hover:border-[var(--border-primary)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{round.roundName}</h3>
                  {round.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">{round.description}</p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    round.status === "active"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-[var(--secondary-lighter)] text-[var(--text-secondary)]"
                  }`}
                >
                  {round.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
                <span
                  className={`px-2 py-1 rounded ${
                    round.roundType === "bonus"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : round.roundType === "penalty"
                        ? "bg-red-500/10 text-red-400"
                        : "border border-[var(--border-card)] bg-[var(--bg-main)]"
                  }`}
                >
                  {round.roundType === "bonus"
                    ? "Bonus"
                    : round.roundType === "penalty"
                      ? "Penalty"
                      : "Standard"}
                </span>
                <span className="rounded border border-[var(--border-card)] bg-[var(--bg-main)] px-2 py-1">Max: {round.mixPoints ?? 0} pts</span>
                {round.minusMarking && round.roundType !== "penalty" && (
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded">Minus marking</span>
                )}
              </div>
              <div className="flex gap-2 mt-auto pt-2">
                <button
                  onClick={() => {
                    setEditingRound(round);
                    setFormOpen(true);
                  }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteId(round._id);
                    setDeleteOpen(true);
                  }}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SupercampRoundForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingRound(null);
        }}
        onSubmit={editingRound ? handleUpdate : handleCreate}
        editingRound={editingRound}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        dark
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Round"
        description="This will remove the round and its points from all players. Continue?"
      />
    </div>
  );
}

export default SupercampRounds;
