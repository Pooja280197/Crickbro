import React, { useEffect, useState } from "react";
import { useDebounce } from "../../../../components/useDebounce";
import { Search, CheckSquare, Camera } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAuctionDetails,
  fetchSlotList,
  getSelectorPlayers,
  updatePlayerDirectSelect,
} from "../../../../redux/actions";
import SelectorPlayerCard from "../AssignedPlayers/SelectorPlayerCard";
import { toast } from "react-toastify";
import DirectSelectModal from "./DirectSelectModal";
import BarcodeScanner from "./BarcodeScanner";
import { createPortal } from "react-dom";
import Pagination from "../../../../components/Pagination";

const panelClass =
  "rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]";
const iconTileClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]";

  const EMPTY_ARRAY = [];
function SelectDirect({ auctionId }) {
  const dispatch = useDispatch();
  const [searchAssignedPlayer, setSearchAssignedPlayer] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const debouncedAssignPlayer = useDebounce(searchAssignedPlayer, 200);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSlotSessions, setSelectedSlotSessions] = useState([]);
  const [directSelectFilter, setDirectSelectFilter] = useState(""); // "" for all, "selected", "not_selected", "pending"
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const playersData = useSelector(
    (state) => state.data?.selectorPlayers || null,
  );

  const selectorPlayers = useSelector(
    (state) => state.data?.selectorPlayers?.data || EMPTY_ARRAY ,
  );
  const slotDetail = useSelector((state) => state.data?.slotList?.data || EMPTY_ARRAY );

  const selectorPlayersPage = playersData?.page;
  const selectorPlayersTotalPages = playersData?.pages;
  const selectorPlayersTotal = playersData?.total;

  // Check if session is locked
  const isSessionLocked = () => {
    if (!selectedSessionId) return false;

    const selectedSlot = slotDetail.find((slot) => String(slot?._id) === String(selectedSlotId));
    if (!selectedSlot || !Array.isArray(selectedSlot.sessions)) return false;

    const session = selectedSlot.sessions.find((s) => String(s?._id) === String(selectedSessionId));
    // Session is locked if status is 'locked' or 'closed'
    return session?.status === 'locked' || session?.status === 'closed';
  };

  const sessionLocked = isSessionLocked();

  const fetchSelectorPlayers = async (page = 1) => {
    try {
      const searchQuery = debouncedAssignPlayer?.trim() || "";
      await dispatch(
        getSelectorPlayers(auctionId, page, searchQuery, itemsPerPage, {
          slotId: selectedSlotId,
          sessionId: selectedSessionId,
          directSelectFilter: directSelectFilter,
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
  }, [debouncedAssignPlayer, itemsPerPage, selectedSlotId, selectedSessionId, directSelectFilter]);

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

  // Check if a specific player's session is locked
  const isPlayerSessionLocked = (player) => {
    const session = player?.session;
    if (!session) return false;
    const lockStatus = String(session?.lockStatus || "").trim().toLowerCase();
    return lockStatus === "locked";
  };

  const handlePlayerSelect = (playerId, isSelected) => {
    // Find the player to check if their session is locked
    const player = selectorPlayers.find(p => p.player._id === playerId);
    if (player && isPlayerSessionLocked(player)) {
      toast.error("Cannot select locked player");
      return;
    }

    if (isSelected) {
      setSelectedPlayers(prev => [...prev, playerId]);
    } else {
      setSelectedPlayers(prev => prev.filter(id => id !== playerId));
    }
  };

  const handleRateSelected = () => {
    if (selectedPlayers.length === 0) {
      toast.error("Please select at least one player");
      return;
    }
    setShowModal(true);
  };

  const handleRemoveSelection = async (playerId) => {
    if (sessionLocked) {
      toast.error("Session is locked. Cannot remove selection.");
      return;
    }

    try {
      console.log("Removing selection for playerId:", playerId, "auctionId:", auctionId);
      await dispatch(updatePlayerDirectSelect(auctionId, [{ playerId, status: "removed" }]));
      toast.success("Selection removed successfully");
      fetchSelectorPlayers(selectorPlayersPage || 1);
    } catch (error) {
      console.error("Remove selection error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to remove selection";
      toast.error(errorMessage);
    }
  };

  const handleEditSelection = (player) => {
    // For edit, open a modal with just this player
    setSelectedPlayers([player.player._id]);
    setShowModal(true);
  };

  const handleBarcodeScanned = (barcode) => {
    try {
      let parsed;

      try {
        parsed = JSON.parse(barcode);
      } catch {
        parsed = { batchId: barcode };
      }

      const batchId = parsed.batchId?.toString().trim();

      if (!batchId) {
        toast.error("❌ Invalid QR Code");
        return;
      }

      // 👉 only search update
      setSearchAssignedPlayer(batchId);

      toast.info("🔍 Searching player...");
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Scan failed");
    }
  };
  useEffect(() => {
    if (!searchAssignedPlayer || selectorPlayers.length === 0) return;

    const matchedPlayer = selectorPlayers.find(
      (item) =>
        item.player?.batchId === searchAssignedPlayer
    );

    if (!matchedPlayer) return;

    if (isPlayerSessionLocked(matchedPlayer)) {
      toast.error("🚫 Player session locked");
      return;
    }

    const playerId = matchedPlayer.player._id;

    setSelectedPlayers([playerId]);

    setTimeout(() => {
      setShowModal(true);
    }, 100);

    toast.success(`✅ ${matchedPlayer.player.name} selected`);
  }, [selectorPlayers]);
  return (
    <>
      {showBarcodeScanner && 
      createPortal(
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowBarcodeScanner(false)}
        />,
        document.body
      )}

      {showModal && (
        <DirectSelectModal
          selectedPlayers={selectedPlayers}
          selectorPlayers={selectorPlayers}
          onClose={() => setShowModal(false)}
          auctionId={auctionId}
          onSave={() => {
            setShowModal(false);
            setSelectedPlayers([]);
            fetchSelectorPlayers(selectorPlayersPage || 1);
          }}
        />
      )}

      <div className="flex flex-col gap-y-4 p-3 sm:p-6">
        <div className={`${panelClass} overflow-hidden`}>
          <div className="flex flex-col gap-3 border-b border-[var(--border-card)] bg-[var(--bg-main)] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className={iconTileClass}>
                <CheckSquare size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  Direct Select
                </h2>
                <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                  Select players directly, scan barcodes, and manage selection status.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                  Selected
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {selectedPlayers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
          <div className="sm:col-span-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search Player"
              value={searchAssignedPlayer}
              onChange={(e) => setSearchAssignedPlayer(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-[var(--border-primary)] rounded-lg text-xs sm:text-sm bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            />
            <button
              onClick={() => setShowBarcodeScanner(true)}
              className="absolute right-2 -translate-y-1/2 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--secondary-lighter)] rounded-md transition"
              title="Scan barcode"
              aria-label="Scan barcode"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <select
            value={selectedSlotId}
            onChange={(e) => {
              setSelectedSlotId(e.target.value);
              setSelectedSessionId("");
            }}
            className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-lg text-xs sm:text-sm bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
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
            className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-lg text-xs sm:text-sm bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition disabled:bg-[var(--secondary-lighter)] disabled:text-[var(--text-secondary)]"
          >
            <option value="">All Sessions</option>
            {selectedSlotSessions.map((session) => (
              <option key={session?._id} value={session?._id}>
                {session?.name || "Unnamed Session"}
              </option>
            ))}
          </select>

          <select
            value={directSelectFilter}
            onChange={(e) => setDirectSelectFilter(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-lg text-xs sm:text-sm bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
          >
            <option value="">All Players</option>
            <option value="selected">Selected</option>
            <option value="not_selected">Not Selected</option>
            <option value="pending">Pending</option>
          </select>

           <div className="flex items-center gap-2 sm:gap-3">
                <label className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] whitespace-nowrap">
                  Per page:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="ui-input w-auto"
                >
                  <option value="16">16</option>
                  <option value="32">32</option>
                  <option value="64">64</option>
                  <option value="96">96</option>
                </select>
              </div>

        </div>

        {selectedPlayers.length > 0 && !sessionLocked && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-blue-50 p-3 sm:p-4 rounded-lg">
            <span className="text-xs sm:text-sm text-blue-700">
              {selectedPlayers.length} player(s) selected
            </span>
            <button
              onClick={handleRateSelected}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Rate Selected Players
            </button>
          </div>
        )}

        {selectorPlayers?.length === 0 ? (
          <div className="text-center text-[var(--text-secondary)] py-6 text-sm">
            No players found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {selectorPlayers?.map((item) => {
                const playerLocked = isPlayerSessionLocked(item);
                return (
                  <div key={item._id} className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(item.player._id)}
                        onChange={(e) => handlePlayerSelect(item.player._id, e.target.checked)}
                        disabled={playerLocked}
                        className={`w-5 h-5 mt-1 text-blue-600 bg-[var(--secondary-lighter)] border-[var(--border-primary)] rounded focus:ring-blue-500 ${playerLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          }`}
                        title={playerLocked ? "Session locked - cannot select" : ""}
                      />
                    </div>
                    <SelectorPlayerCard
                      player={item}
                      fetchSelectorPlayers={fetchSelectorPlayers}
                      hideRatingFeatures={true}
                      sessionLocked={sessionLocked}
                      onRemoveSelection={() => handleRemoveSelection(item.player._id)}
                      onEditSelection={() => handleEditSelection(item)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="ui-card-soft mt-6">
             
              <Pagination
                className="flex-1"
                currentPage={selectorPlayersPage || 1}
                totalPages={selectorPlayersTotalPages || 1}
                onPageChange={fetchSelectorPlayers}
                summaryPrefix={`${selectorPlayersTotal || 0} total | Page`}
                prevLabel="Prev"
                nextLabel="Next"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default SelectDirect;
