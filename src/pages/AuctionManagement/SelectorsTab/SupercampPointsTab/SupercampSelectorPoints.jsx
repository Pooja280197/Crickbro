import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Eye, PencilLine, Search, Star } from "lucide-react";
import { useDebounce } from "../../../../components/useDebounce";
import {
  assignSupercampBonusPenalty,
  assignSupercampPoints,
  fetchSlotList,
  getSupercampPlayers,
  getSupercampRounds,
} from "../../../../redux/actions";
import SupercampPointsModal from "../../../../components/supercamp/SupercampPointsModal";
import SupercampPlayerDetailsModal from "../../../../components/supercamp/SupercampPlayerDetailsModal";
import SupercampPageHeader from "../../../../components/supercamp/SupercampPageHeader";

const EMPTY_ARRAY = [];

function SupercampSelectorPoints({ auctionId }) {
  const dispatch = useDispatch();
  const selectorId = localStorage.getItem("playerId");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(16);
  const [slotId, setSlotId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);

  const playersData = useSelector((state) => state.data?.supercampPlayers);
  const players = playersData?.data || EMPTY_ARRAY;
  const totalPages = playersData?.pages ?? 0;
  const loading = useSelector((state) => state.loading?.supercampPlayers);

  const roundsData = useSelector((state) => state.data?.supercampRounds);
  const rounds = roundsData?.data || EMPTY_ARRAY;
  const slotDetail = useSelector((state) => state.data?.slotList?.data || EMPTY_ARRAY);
  const [slotSessions, setSlotSessions] = useState([]);

  const selectorSlots = useMemo(
    () =>
      slotDetail.filter((slot) =>
        (slot.selectors || []).some(
          (selector) =>
            String(selector?._id || selector?.playerId || selector) ===
            String(selectorId),
        ),
      ),
    [slotDetail, selectorId],
  );

  const fetchPlayers = (p = page) => {
    dispatch(
      getSupercampPlayers(auctionId, p, itemsPerPage, {
        search: debouncedSearch,
        slotId,
        sessionId,
        selectorId,
        sortBy: "totalPoints",
        sortOrder: "desc",
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
  }, [debouncedSearch, slotId, sessionId]);

  useEffect(() => {
    fetchPlayers(page);
  }, [page]);

  useEffect(() => {
    if (!slotId) {
      setSlotSessions([]);
      if (sessionId) setSessionId("");
      return;
    }
    const slot = selectorSlots.find((s) => String(s._id) === String(slotId));
    setSlotSessions(Array.isArray(slot?.sessions) ? slot.sessions : []);
  }, [slotId, selectorSlots]);

  const handleSavePoints = async (playerId, { roundUpdates, bonusPoints, penaltyPoints }) => {
    setSavingPoints(true);
    try {
      for (const u of roundUpdates || []) {
        await dispatch(
          assignSupercampPoints(auctionId, {
            playerId,
            roundId: u.roundId,
            pointsEarned: u.pointsEarned,
            selectorId,
          })
        );
      }
      await dispatch(
        assignSupercampBonusPenalty(auctionId, {
          playerId,
          bonusPoints,
          penaltyPoints,
          selectorId,
        })
      );
      toast.success("Points saved");
      setPointsModalOpen(false);
      setSelectedPlayer(null);
      fetchPlayers(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save points");
    } finally {
      setSavingPoints(false);
    }
  };

  return (
    <div className="h-full space-y-4 overflow-y-auto p-3 text-[var(--text-primary)] sm:p-4 lg:p-5">
      <SupercampPageHeader
        icon={Star}
        // eyebrow="Selector workspace"
        title="Supercamp Points"
        description="Score players from the slots and sessions assigned to you."
      />
      <div className="flex flex-wrap gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player..."
            className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)]"
          />
        </div>
        <select
          value={slotId}
          onChange={(e) => setSlotId(e.target.value)}
          className="h-10 min-w-[140px] rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)]"
        >
          <option value="">All My Slots</option>
          {selectorSlots.map((s) => (
            <option key={s._id} value={s._id}>
              {s.slotName || s.slotCode}
            </option>
          ))}
        </select>
        <select
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          disabled={!slotId}
          className="h-10 min-w-[140px] rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)] disabled:opacity-50"
        >
          <option value="">All Sessions</option>
          {slotSessions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {selectorSlots.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-card)] py-12 text-center text-[var(--text-secondary)] shadow-[var(--shadow-card)]">
          You are not assigned to any slots. Contact admin.
        </div>
      ) : loading ? (
        <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] py-12 text-center font-semibold text-[var(--primary)] shadow-[var(--shadow-card)] animate-pulse">Loading players...</div>
      ) : players.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-card)] py-12 text-center text-[var(--text-secondary)] shadow-[var(--shadow-card)]">
          No supercamp players in your assigned slots.
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {players.map((player) => (
            <div
              key={player._id}
              className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-2.5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--border-primary)]"
            >
              <div className="flex items-start gap-2.5">
                <div className="shrink-0">
                {player.profilePicture ? (
                  <img
                    src={player.profilePicture}
                    alt=""
                    className="h-11 w-11 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent-light)] text-sm font-bold text-[var(--primary)]">
                    {(player.name || "?")[0]}
                  </div>
                )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold leading-5 text-[var(--text-primary)]">{player.name}</div>
                  <div className="truncate text-xs text-[var(--text-secondary)]">
                    {player.slotName || "Slot not assigned"} · {player.totalPoints ?? 0} pts
                    {player.sessionName ? ` · ${player.sessionName}` : ""}
                  </div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    setSelectedPlayer(player);
                    setDetailsModalOpen(true);
                  }}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-[var(--border-card)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
                <button
                  onClick={() => {
                    setSelectedPlayer(player);
                    setPointsModalOpen(true);
                  }}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-[var(--primary)] text-xs font-semibold text-[var(--text-dark)] hover:opacity-90"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Points
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-[var(--text-secondary)]">
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] disabled:opacity-40"
          >
            Next
          </button>
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
    </div>
  );
}

export default SupercampSelectorPoints;
