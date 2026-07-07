import React, { useEffect, useState } from "react";
import { useDebounce } from "../../../../components/useDebounce";
import { Search, UserCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAuctionDetails,
  fetchSlotList,
  getSelectorPlayers,
  removePlayerRating,
} from "../../../../redux/actions";
import SelectorPlayerCard from "./SelectorPlayerCard";
import { toast } from "react-toastify";
import BallByBallRating from "./BallByBallRating";
import Pagination from "../../../../components/Pagination";

const panelClass =
  "rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]";
const iconTileClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]";

const EMPTY_ARRAY = [];
function PlayersAssignedToSelector({ auctionId }) {
  const dispatch = useDispatch();
  const [searchAssignedPlayer, setSearchAssignedPlayer] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const debouncedAssignPlayer = useDebounce(searchAssignedPlayer, 200);
  const [ballRatingConfig, setBallRatingConfig] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSlotSessions, setSelectedSlotSessions] = useState([]);
  const [removingPlayerId, setRemovingPlayerId] = useState("");

  const playersData = useSelector(
    (state) => state.data?.selectorPlayers || null,
  );

  const selectorPlayers = useSelector(
    (state) => state.data?.selectorPlayers?.data || EMPTY_ARRAY,
  );
  const slotDetail = useSelector((state) => state.data?.slotList?.data || EMPTY_ARRAY);

  const selectorPlayersPage = playersData?.page;
  const selectorPlayersTotalPages = playersData?.pages;
  const selectorPlayersTotal = playersData?.total;

  const isSessionLocked = (session) =>
    String(session?.lockStatus || "").trim().toLowerCase() === "locked";

  const fetchSelectorPlayers = async (page = 1) => {
    try {
      const searchQuery = debouncedAssignPlayer?.trim() || "";
      await dispatch(
        getSelectorPlayers(auctionId, page, searchQuery, itemsPerPage, {
          slotId: selectedSlotId,
          sessionId: selectedSessionId,
        }),
      );
    } catch (error) {
      console.log("Error fetching auction players:", error);
    }
  };

  useEffect(() => {
    fetchSelectorPlayers();
    dispatch(fetchAuctionDetails(auctionId));
    dispatch(fetchSlotList(auctionId, 1, 200, ""));
  }, [auctionId]);

  useEffect(() => {
    fetchSelectorPlayers(1);
  }, [debouncedAssignPlayer, itemsPerPage, selectedSlotId, selectedSessionId]);

  useEffect(() => {
    if (!selectedSlotId) {
      setSelectedSlotSessions([]);
      if (selectedSessionId) setSelectedSessionId("");
      return;
    }

    const selectedSlot = slotDetail.find((slot) => String(slot?._id) === String(selectedSlotId));
    const sessions = Array.isArray(selectedSlot?.sessions) ? selectedSlot.sessions : [];
    setSelectedSlotSessions(sessions);

    if (
      selectedSessionId &&
      !sessions.some((session) => String(session?._id) === String(selectedSessionId))
    ) {
      setSelectedSessionId("");
    }
  }, [selectedSlotId, slotDetail, selectedSessionId]);

  const handleRemoveRating = async (player) => {
    const slotId = player?.session?.slot?._id;
    const sessionId = player?.session?._id;
    const targetPlayerId = player?.player?._id;
    const selectorId = localStorage.getItem("playerId");

    if (!slotId || !sessionId || !targetPlayerId || !selectorId) {
      toast.error("Missing data for remove rating");
      return;
    }

    try {
      setRemovingPlayerId(String(targetPlayerId));
      await dispatch(
        removePlayerRating(slotId, sessionId, {
          playerId: targetPlayerId,
          selectorId,
        }),
      );
      toast.success("Rating removed successfully");
      await fetchSelectorPlayers(selectorPlayersPage || 1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove rating");
    } finally {
      setRemovingPlayerId("");
    }
  };

  return (
    <>
      {ballRatingConfig && (
        <BallByBallRating
          auctionId={auctionId}
          slot={ballRatingConfig.slot}
          session={ballRatingConfig.session}
          onBack={() => setBallRatingConfig(null)}
        />
      )}

      {!ballRatingConfig && (
        <div className="flex flex-col gap-y-4 p-3 sm:p-6">
          <div className={`${panelClass} overflow-hidden`}>
            <div className="flex flex-col gap-3 border-b border-[var(--border-card)] bg-[var(--bg-main)] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className={iconTileClass}>
                  <UserCheck size={18} />
                </div>
                <div className="min-w-0">
                  <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                    Assigned Players
                  </h2>
                  <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                    Review assigned players, sessions, and rating actions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
                <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    Total
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {selectorPlayersTotal || 0}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    Showing
                  </p>
                  <p className="text-sm font-semibold text-[var(--primary)]">
                    {selectorPlayers.length}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    Slots
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {slotDetail.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative w-full sm:col-span-2 xl:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search Player"
                value={searchAssignedPlayer}
                onChange={(e) => setSearchAssignedPlayer(e.target.value)}
                className="ui-input pl-10 pr-4"
              />
            </div>

            <select
              value={selectedSlotId}
              onChange={(e) => {
                setSelectedSlotId(e.target.value);
                setSelectedSessionId("");
              }}
              className="ui-input"
            >
              <option value="">All Slots</option>
              {slotDetail.map((slot) => (
                <option key={slot?._id} value={slot?._id}>
                  {slot?.slotName || "Unnamed Slot"}
                </option>
              ))}
            </select>

            <select
              value={selectedSessionId}
              disabled={!selectedSlotId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="ui-input disabled:opacity-50"
            >
              <option value="">All Sessions</option>
              {selectedSlotSessions.map((session) => (
                <option key={session?._id} value={session?._id}>
                  {session?.name || "Unnamed Session"}
                </option>
              ))}
            </select>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Players per page:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="ui-input w-full sm:w-auto"
              >
                <option value="16">16</option>
                <option value="32">32</option>
                <option value="64">64</option>
                <option value="96">96</option>
              </select>
            </div>
          </div>

          {selectorPlayers?.length === 0 ? (
            <div className="text-center text-[var(--text-secondary)] py-6 text-sm">
              No players found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {selectorPlayers?.map((item) => (
                  <div key={item._id}>
                    <SelectorPlayerCard
                      player={item}
                      fetchSelectorPlayers={fetchSelectorPlayers}
                      onRemoveRating={handleRemoveRating}
                      isRemovingRating={
                        removingPlayerId &&
                        String(removingPlayerId) === String(item?.player?._id)
                      }
                      onBallRate={(player) => {
                        if (isSessionLocked(player?.session)) {
                          toast.error("Session locked hai, is player ki rating nahi ho sakti");
                          return;
                        }

                        const slotId = player?.session?.slot?._id;
                        const sessionId = player?.session?._id;
                        if (!slotId || !sessionId) {
                          toast.error("Missing session information for Ball by Ball rating");
                          return;
                        }
                        setBallRatingConfig({
                          slot: { slotId },
                          session: { sessionId },
                        });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="ui-card-soft mt-6">
               

                <Pagination
                  className="flex-1"
                  currentPage={selectorPlayersPage || 1}
                  totalPages={selectorPlayersTotalPages || 1}
                  onPageChange={fetchSelectorPlayers}
                  summaryPrefix={`${selectorPlayersTotal || 0} total | Page`}
                  prevLabel="Previous"
                  nextLabel="Next"
                />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default PlayersAssignedToSelector;
