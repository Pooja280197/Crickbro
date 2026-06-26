import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Search, Medal, Eye, Pencil, ChevronLeft, ChevronRight, Trash2, FolderInput } from "lucide-react";
import AssignCategoryModal from "../../../AdminControl/ManageAuction/PlayersTabs/AuctionPlayersTabs/AssignCategoryModal";
import { useDebounce } from "../../../../../components/useDebounce";
import {
  assignSupercampBonusPenalty,
  assignSupercampPoints,
  bulkToggleSupercampPlayers,
  fetchSlotList,
  getSupercampPlayers,
  getSupercampRounds,
  toggleSupercampPlayer,
} from "../../../../../redux/actions";
import SupercampPointsModal from "../../../../../components/supercamp/SupercampPointsModal";
import SupercampPlayerDetailsModal from "../../../../../components/supercamp/SupercampPlayerDetailsModal";
import EnableSupercampModal from "./EnableSupercampModal";
import DeleteConfirmModal from "../../../../../components/DeleteConfirmModal";
import SupercampPageHeader from "../../../../../components/supercamp/SupercampPageHeader";

function SupercampLeaderboard({ auctionId }) {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [slotId, setSlotId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [roundId, setRoundId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("totalPoints");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);
  const [enableModalOpen, setEnableModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [assignCategoryOpen, setAssignCategoryOpen] = useState(false);

  const playersData = useSelector((state) => state.data?.supercampPlayers);
  const players = playersData?.data || [];
  const total = playersData?.total ?? 0;
  const totalPages = playersData?.pages ?? 0;
  const loading = useSelector((state) => state.loading?.supercampPlayers);

  const roundsData = useSelector((state) => state.data?.supercampRounds);
  const rounds = roundsData?.data || [];
  const slotDetail = useSelector((state) => state.data?.slotList?.data || []);
  const [slotSessions, setSlotSessions] = useState([]);

  const fetchPlayers = (p = page) => {
    dispatch(
      getSupercampPlayers(auctionId, p, itemsPerPage, {
        search: debouncedSearch,
        slotId,
        sessionId,
        roundId,
        categoryFilter,
        sortBy,
        sortOrder,
      })
    );
  };

  useEffect(() => {
    dispatch(getSupercampRounds(auctionId));
    dispatch(fetchSlotList(auctionId, 1, 200, ""));
  }, [auctionId, dispatch]);

  useEffect(() => {
    fetchPlayers(1);
    setPage(1);
  }, [debouncedSearch, slotId, sessionId, roundId, categoryFilter, sortBy, sortOrder, itemsPerPage]);

  useEffect(() => {
    fetchPlayers(page);
  }, [page]);

  useEffect(() => {
    if (!slotId) {
      setSlotSessions([]);
      if (sessionId) setSessionId("");
      return;
    }
    const slot = slotDetail.find((s) => String(s._id) === String(slotId));
    const sessions = Array.isArray(slot?.sessions) ? slot.sessions : [];
    setSlotSessions(sessions);
    if (sessionId && !sessions.some((s) => String(s._id) === String(sessionId))) {
      setSessionId("");
    }
  }, [slotId, slotDetail]);

  const handleSavePoints = async (playerId, { roundUpdates, bonusPoints, penaltyPoints }) => {
    setSavingPoints(true);
    try {
      for (const u of roundUpdates || []) {
        await dispatch(
          assignSupercampPoints(auctionId, {
            playerId,
            roundId: u.roundId,
            pointsEarned: u.pointsEarned,
          })
        );
      }
      await dispatch(
        assignSupercampBonusPenalty(auctionId, {
          playerId,
          bonusPoints,
          penaltyPoints,
        })
      );
      toast.success("Points updated");
      setPointsModalOpen(false);
      setSelectedPlayer(null);
      fetchPlayers(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save points");
    } finally {
      setSavingPoints(false);
    }
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return "text-amber-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-amber-600";
    return "text-[var(--text-secondary)]";
  };

  const toggleSelect = (playerId) => {
    setSelectedIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSelectAllVisible = () => {
    const ids = players.map((p) => p.playerId).filter(Boolean);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const handleRemoveOne = async () => {
    if (!removeTarget?.playerId) return;
    try {
      setRemoving(true);
      await dispatch(
        toggleSupercampPlayer(auctionId, removeTarget.playerId, false)
      );
      toast.success(`${removeTarget.name || "Player"} removed from supercamp`);
      setRemoveModalOpen(false);
      setRemoveTarget(null);
      setSelectedIds((prev) => prev.filter((id) => id !== removeTarget.playerId));
      fetchPlayers(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove player");
    } finally {
      setRemoving(false);
    }
  };

  const handleBulkRemove = async () => {
    if (!selectedIds.length) return;
    try {
      setRemoving(true);
      await dispatch(bulkToggleSupercampPlayers(auctionId, selectedIds, false));
      toast.success(`${selectedIds.length} player(s) removed from supercamp`);
      setBulkRemoveOpen(false);
      setSelectedIds([]);
      fetchPlayers(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove players");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="h-full space-y-4 overflow-y-auto p-3 text-[var(--text-primary)] sm:p-4 lg:p-5">
      <SupercampPageHeader
        icon={Medal}
        // eyebrow="Trials & Selection"
        title="Supercamp Leaderboard"
        description="Review rankings, manage players and update supercamp points."
      />
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)]">
        <div className="relative shrink-0 w-[11rem] sm:w-[12rem]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player..."
            className="h-9 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)]"
          />
        </div>
        <select
          value={slotId}
          onChange={(e) => setSlotId(e.target.value)}
          className="h-9 shrink-0 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)]"
        >
          <option value="">All Slots</option>
          {slotDetail.map((s) => (
            <option key={s._id} value={s._id}>
              {s.slotName || s.slotCode}
            </option>
          ))}
        </select>
        <select
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          disabled={!slotId}
          className="h-9 shrink-0 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)] disabled:opacity-50"
        >
          <option value="">All Sessions</option>
          {slotSessions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={roundId}
          onChange={(e) => setRoundId(e.target.value)}
          className="h-9 shrink-0 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)]"
        >
          <option value="">All Rounds</option>
          {rounds.map((r) => (
            <option key={r._id} value={r._id}>
              {r.roundName}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 shrink-0 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)]"
        >
          <option value="">All categories</option>
          <option value="assignincategory">In category</option>
          <option value="notassignincategory">Not in category</option>
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [sb, so] = e.target.value.split("-");
            setSortBy(sb);
            setSortOrder(so);
          }}
          className="h-9 shrink-0 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)]"
        >
          <option value="totalPoints-desc">Points: High to Low</option>
          <option value="totalPoints-asc">Points: Low to High</option>
          <option value="name-asc">Name: A-Z</option>
          <option value="name-desc">Name: Z-A</option>
        </select>

        <button
          type="button"
          onClick={() => setEnableModalOpen(true)}
          className="h-9 shrink-0 whitespace-nowrap rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 text-sm font-semibold text-[var(--primary)] hover:opacity-90"
        >
          Manage Players
        </button>

        {players.length > 0 && (
          <>
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="h-9 shrink-0 whitespace-nowrap rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
            >
              {players.every((p) => selectedIds.includes(p.playerId)) && players.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>
            {selectedIds.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setAssignCategoryOpen(true)}
                  className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-500/40 px-3 text-sm font-semibold text-amber-500 hover:bg-amber-500/10"
                >
                  <FolderInput className="w-4 h-4" />
                  Assign to Category ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBulkRemoveOpen(true)}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 text-sm hover:bg-red-500/10 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove ({selectedIds.length})
                </button>
              </>
            )}
          </>
        )}
      </div>

      {loading ? (
        <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] py-12 text-center font-semibold text-[var(--primary)] shadow-[var(--shadow-card)] animate-pulse">Loading leaderboard...</div>
      ) : players.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-card)] py-12 text-center text-[var(--text-secondary)] shadow-[var(--shadow-card)]">
          No supercamp players found. Mark players as supercamp and assign points.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-card)] bg-[var(--bg-main)] text-left text-[var(--text-secondary)]">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        players.length > 0 &&
                        players.every((p) => selectedIds.includes(p.playerId))
                      }
                      onChange={handleSelectAllVisible}
                      className="rounded"
                      title="Select all on this page"
                    />
                  </th>
                  <th className="px-4 py-3 w-12">#</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Slot</th>
                  <th className="px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-center">Points</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => {
                  const rank = (page - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={player._id} className="border-b border-[var(--border-card)] transition hover:bg-[var(--accent-light)]/60">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(player.playerId)}
                          onChange={() => toggleSelect(player.playerId)}
                          className="rounded"
                        />
                      </td>
                      <td className={`px-4 py-3 font-bold ${getRankStyle(rank)}`}>
                        {rank <= 3 ? (
                          <Medal className="w-4 h-4 inline" />
                        ) : (
                          rank
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {player.profilePicture ? (
                            <img
                              src={player.profilePicture}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-light)] text-xs font-semibold text-[var(--primary)]">
                              {(player.name || "?")[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-[var(--text-primary)]">{player.name}</div>
                            <div className="text-xs text-[var(--text-secondary)]">{player.batchId || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--text-secondary)] sm:table-cell">
                        {player.slotName || "—"}
                        {player.sessionName ? ` / ${player.sessionName}` : ""}
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--text-secondary)] md:table-cell">
                        {player.categoryName || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-lg font-bold text-[var(--primary)]">
                          {player.totalPoints ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPlayer(player);
                              setDetailsModalOpen(true);
                            }}
                            className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-2 text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPlayer(player);
                              setPointsModalOpen(true);
                            }}
                            className="rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] p-2 text-[var(--primary)] hover:opacity-90"
                            title="Edit points"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setRemoveTarget(player);
                              setRemoveModalOpen(true);
                            }}
                            className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
                            title="Remove from supercamp"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <span>
            {total} players · Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-2 text-[var(--text-primary)] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-2 text-[var(--text-primary)] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <SupercampPointsModal
        isOpen={pointsModalOpen}
        onClose={() => {
          setPointsModalOpen(false);
          setSelectedPlayer(null);
        }}
        onSubmit={handleSavePoints}
        player={selectedPlayer}
        rounds={rounds}
        loading={savingPoints}
      />

      <SupercampPlayerDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedPlayer(null);
        }}
        player={selectedPlayer}
      />

      <EnableSupercampModal
        isOpen={enableModalOpen}
        onClose={() => setEnableModalOpen(false)}
        auctionId={auctionId}
        onUpdated={() => fetchPlayers(page)}
      />

      <DeleteConfirmModal
        open={removeModalOpen}
        dark
        title="Remove from Supercamp"
        description={
          removeTarget
            ? `Remove ${removeTarget.name || "this player"} from supercamp? Their points will be kept but they won't appear on the leaderboard.`
            : ""
        }
        confirmText="Remove"
        loading={removing}
        onClose={() => {
          setRemoveModalOpen(false);
          setRemoveTarget(null);
        }}
        onConfirm={handleRemoveOne}
      />

      <AssignCategoryModal
        isOpen={assignCategoryOpen}
        count={selectedIds.length}
        onClose={() => setAssignCategoryOpen(false)}
        auctionId={auctionId}
        selectedIds={selectedIds}
        fetchUnassignedPlayers={() => fetchPlayers(page)}
        fetchAssignedPlayers={() => fetchPlayers(page)}
        resetSelectedIds={() => setSelectedIds([])}
      />

      <DeleteConfirmModal
        open={bulkRemoveOpen}
        dark
        title="Remove from Supercamp"
        description={`Remove ${selectedIds.length} selected player(s) from supercamp? They won't appear on the leaderboard.`}
        confirmText="Remove"
        loading={removing}
        onClose={() => setBulkRemoveOpen(false)}
        onConfirm={handleBulkRemove}
      />
    </div>
  );
}

export default SupercampLeaderboard;
