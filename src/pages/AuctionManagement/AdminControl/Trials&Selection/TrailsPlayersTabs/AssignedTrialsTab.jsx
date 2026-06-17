import React, { useState } from "react";
import {
  Award,
  ChevronDown,
  Download,
  Edit3,
  Filter,
  LayoutGrid,
  Search,
  Star,
  Table2,
  Trash2,
  Unlink2,
} from "lucide-react";
import { toast } from "react-toastify";

import PlayerCard, { PlayerDetailsModal } from "../../../../../components/PlayerCard";
import Pagination from "../../../../../components/Pagination";
import BallByBallRating from "../../../SelectorsTab/AssignedPlayers/BallByBallRating";
import DirectSelectModal from "../../../SelectorsTab/DirectSelect/DirectSelectModal";
import api from "../../../../../utils/api";

const AssignedTrialsTab = ({
  searchQuery,
  setSearchQuery,
  itemsPerPage,
  setItemsPerPage,
  isItemsDropdownOpen,
  setIsItemsDropdownOpen,
  downloadLoading,
  handleDownloadExcel,
  dropdownRef,
  isSlotOpen,
  setIsSlotOpen,
  slotSearch,
  setSlotSearch,
  selectedSlotLabel,
  setSelectedSlotLabel,
  setSlot,
  slotLoading,
  hasMoreSlots,
  setSlotPage,
  slotDetail,
  fetchSessionsForSlot,
  slot,
  selectedSlotSessions,
  slotSession,
  setSlotSession,
  statusSort,
  setStatusSort,
  sortPlayers,
  typeSort,
  setTypeSort,
  getFilteredPlayers,
  selectedPlayers,
  setSelectedPlayers,
  fetchPlayers,
  currentPageState,
  setCurrentPageState,
  totalPages,
  totalPlayers,
  auctionId,
  viewMode,
  setViewMode,
}) => {
  const players = getFilteredPlayers();
  const [showFilters, setShowFilters] = useState(false);
  const [ballRatingConfig, setBallRatingConfig] = useState(null);
  const [gradingPlayerIds, setGradingPlayerIds] = useState([]);
  const [tableModalConfig, setTableModalConfig] = useState(null);
  const [tableModalSaving, setTableModalSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const hasActiveFilters = Boolean(
    slot || slotSession || statusSort || typeSort || slotSearch || selectedSlotLabel,
  );
  const handleResetFilters = () => {
    setSlot("");
    setSlotSession("");
    setStatusSort("");
    setTypeSort("");
    setSlotSearch("");
    setSelectedSlotLabel("");
    setIsSlotOpen(false);
  };

  const getRole = (item) =>
    item?.playersRatings?.playerType ||
    item?.player?.playerRole ||
    item?.playerRole ||
    "Role not set";

  const getRating = (item) =>
    item?.directSelected
      ? item?.directSelectedGrade || "N/A"
      : item?.playersRatings?.avgRating
        ? Number(item.playersRatings.avgRating).toFixed(2)
        : "-";

  const getPlayerId = (item) => item?.player?._id || item?.playerId || item?._id || "";

  const getSlotId = (item) =>
    item?.session?.slot?._id || item?.slot?._id || item?.slotId || "";

  const getSessionId = (item) => item?.session?._id || item?.sessionId || "";

  const isSessionLocked = (item) =>
    String(item?.session?.lockStatus || "").trim().toLowerCase() === "locked";

  const handleOpenRating = (item) => {
    if (isSessionLocked(item)) {
      toast.error("Session locked hai, is player ki rating nahi ho sakti");
      return;
    }

    const slotId = getSlotId(item);
    const sessionId = getSessionId(item);

    if (!slotId || !sessionId) {
      toast.error("Missing slot/session information for rating");
      return;
    }

    setBallRatingConfig({
      slot: { slotId },
      session: { sessionId },
    });
  };

  const handleOpenGrading = (item) => {
    const playerId = getPlayerId(item);

    if (!playerId) {
      toast.error("Missing player information for grading");
      return;
    }

    setGradingPlayerIds([playerId]);
  };

  const handleGradingSave = () => {
    setGradingPlayerIds([]);
    fetchPlayers("assigned", currentPageState);
  };

  const openTableModal = (item, initialAction = "") => {
    setTableModalConfig({ item, initialAction });
  };

  const closeTableModal = () => {
    setTableModalConfig(null);
  };

  const handleTableModalEdit = async (payload) => {
    try {
      setTableModalSaving(true);
      await api.put("/webSiteApi/players/editPlayer", payload);
      toast.success("Player updated successfully");
      closeTableModal();
      fetchPlayers("assigned", currentPageState);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update player");
      return false;
    } finally {
      setTableModalSaving(false);
    }
  };

  const handleTableModalDelete = async () => {
    const item = tableModalConfig?.item;
    const playerId = getPlayerId(item);

    if (!auctionId || !playerId) {
      toast.error("Missing auction or player information");
      return;
    }

    try {
      setActionLoadingId(`delete-${playerId}`);
      await api.delete(`/webSiteApi/auction/removePlayer/${auctionId}/${playerId}`);
      toast.success("Player removed successfully");
      closeTableModal();
      fetchPlayers("assigned", currentPageState);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove player");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleTableModalRemoveFromSession = async (slotId, sessionId, playerId) => {
    if (!slotId || !sessionId || !playerId) {
      toast.error("Missing slot/session/player information");
      return;
    }

    try {
      setActionLoadingId(`session-${playerId}`);
      await api.post(`/webSiteApi/auctionSlot/removePlayerFromSession/${slotId}/${sessionId}`, {
        playerIds: [playerId],
      });
      toast.success("Player removed from session");
      closeTableModal();
      fetchPlayers("assigned", currentPageState);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove from session");
    } finally {
      setActionLoadingId("");
    }
  };

  const ActionIconButton = ({ title, onClick, disabled, children, danger = false }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "border-red-200 bg-[var(--bg-main)] text-red-500 hover:bg-red-50"
          : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
      }`}
    >
      {children}
    </button>
  );

  const TableActions = ({ item }) => {
    const playerId = getPlayerId(item);

    return (
      <div className="flex items-center gap-1.5">
        <ActionIconButton
          title="Rating"
          onClick={() => handleOpenRating(item)}
          disabled={isSessionLocked(item)}
        >
          <Star className="h-4 w-4" />
        </ActionIconButton>
        <ActionIconButton title="Grading" onClick={() => handleOpenGrading(item)}>
          <Award className="h-4 w-4" />
        </ActionIconButton>
        <ActionIconButton title="Edit" onClick={() => openTableModal(item, "edit")}>
          <Edit3 className="h-4 w-4" />
        </ActionIconButton>
        <ActionIconButton
          title="Delete"
          onClick={() => openTableModal(item, "delete")}
          disabled={actionLoadingId === `delete-${playerId}`}
          danger
        >
          <Trash2 className="h-4 w-4" />
        </ActionIconButton>
        <ActionIconButton
          title="Remove from session"
          onClick={() => openTableModal(item, "removeSession")}
          disabled={actionLoadingId === `session-${playerId}`}
          danger
        >
          <Unlink2 className="h-4 w-4" />
        </ActionIconButton>
      </div>
    );
  };

  const ViewModeToggle = () => (
    <div className="inline-flex h-10 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-0.5">
      <button
        type="button"
        onClick={() => setViewMode("grid")}
        className={`inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${
          viewMode === "grid"
            ? "bg-[var(--secondary)] text-[#102033]"
            : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)]"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        Grid
      </button>
      <button
        type="button"
        onClick={() => setViewMode("table")}
        className={`inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${
          viewMode === "table"
            ? "bg-[var(--secondary)] text-[#102033]"
            : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)]"
        }`}
      >
        <Table2 className="h-4 w-4" />
        Table
      </button>
    </div>
  );

  const renderPlayersTable = () => (
    <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
      <div className="professional-scrollbar overflow-x-auto">
        <table className="min-w-[940px] w-full text-left text-sm">
          <thead className="bg-[var(--bg-main)] text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
            <tr className="border-b border-[var(--border-card)]">
              <th className="px-3 py-3">Player</th>
              <th className="px-3 py-3">Batch ID</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Rating</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Slot / Session</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-card)]">
            {players.map((item) => {
              const core = item?.player || {};
              const initials =
                String(core?.name || "P")
                  .split(" ")
                  .filter(Boolean)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "P";

              return (
                <tr key={item?._id || core?._id} className="bg-[var(--bg-card)] transition hover:bg-[var(--accent-light)]/60">
                  <td className="px-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--accent-light)] text-xs font-bold text-[var(--primary)]">
                        {core?.profilePicture ? (
                          <img src={core.profilePicture} alt={core?.name || "Player"} className="h-full w-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--text-primary)]">{core?.name || "Unknown"}</p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">{core?.mobileNumber || core?.phone || "Player"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[var(--text-secondary)]">{core?.batchId || "-"}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2.5 py-1 text-xs font-bold text-[var(--primary)]">
                      {getRole(item)}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">{getRating(item)}</td>
                  <td className="px-3 py-3 text-[var(--text-secondary)]">{item?.status || core?.status || "-"}</td>
                  <td className="px-3 py-3 text-[var(--text-secondary)]">
                    <div className="max-w-[180px] truncate">{item?.slot?.slotName || "-"}</div>
                    <div className="max-w-[180px] truncate text-xs text-[var(--text-muted)]">{item?.session?.name || "-"}</div>
                  </td>
                  <td className="px-3 py-3">
                    <TableActions item={item} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      {ballRatingConfig && (
        <BallByBallRating
          auctionId={auctionId}
          slot={ballRatingConfig.slot}
          session={ballRatingConfig.session}
          onBack={() => {
            setBallRatingConfig(null);
            fetchPlayers("assigned", currentPageState);
          }}
        />
      )}

      {gradingPlayerIds.length > 0 && (
        <DirectSelectModal
          selectedPlayers={gradingPlayerIds}
          selectorPlayers={players}
          onClose={() => setGradingPlayerIds([])}
          auctionId={auctionId}
          onSave={handleGradingSave}
        />
      )}

      {tableModalConfig && (
        <PlayerDetailsModal
          player={tableModalConfig.item}
          isOpen={Boolean(tableModalConfig)}
          onClose={closeTableModal}
          onEdit={handleTableModalEdit}
          onDelete={handleTableModalDelete}
          onRemoveSession={handleTableModalRemoveFromSession}
          isSaving={tableModalSaving}
          isRemoving={Boolean(actionLoadingId)}
          type={getRole(tableModalConfig.item)}
          onRatePlayer={handleOpenRating}
          onGradePlayer={handleOpenGrading}
          initialAction={tableModalConfig.initialAction}
          actionOnly={
            tableModalConfig.initialAction === "delete" ||
            tableModalConfig.initialAction === "removeSession"
          }
        />
      )}

      {!ballRatingConfig && (
      <>
      <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] lg:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] pl-10 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)]"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] xl:w-auto"
            >
              <span>Showing {itemsPerPage}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${
                  isItemsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isItemsDropdownOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
                {[16, 32, 64, 96].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setItemsPerPage(num);
                      setCurrentPageState(1);
                      setIsItemsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold transition ${
                      itemsPerPage === num
                        ? "bg-[var(--accent-light)] text-[var(--primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--secondary-lighter)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Showing {num}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ViewModeToggle />

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
              showFilters
                ? "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"
                : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={downloadLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4 text-[var(--primary)]" />
            {downloadLoading ? "Downloading..." : "Download Trials Excel"}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-3">
          <div className="flex flex-col gap-3 xl:col-span-3 sm:flex-row sm:flex-wrap">
            <div ref={dropdownRef} className="relative w-full sm:w-40">
              <input
                type="text"
                placeholder="Search Slot..."
                value={isSlotOpen ? slotSearch : selectedSlotLabel}
                onFocus={() => setIsSlotOpen(true)}
                onChange={(e) => {
                  setSlotSearch(e.target.value);
                  setSlot("");
                  setSelectedSlotLabel("");
                }}
                className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)]"
              />

              <div
                onScroll={(e) => {
                  const bottom =
                    e.target.scrollTop + e.target.clientHeight >=
                    e.target.scrollHeight - 10;

                  if (bottom && !slotLoading && hasMoreSlots) {
                    setSlotPage((prev) => prev + 1);
                  }
                }}
                className={`absolute z-[9999] mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] ${isSlotOpen ? "block" : "hidden"}`}
              >
                {slotDetail?.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => {
                      setSlot(s._id);
                      setSelectedSlotLabel(s.slotName);
                      setIsSlotOpen(false);
                      setSlotSearch("");
                      fetchSessionsForSlot(s._id);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-[var(--secondary-lighter)] text-sm"
                  >
                    {s.slotName}
                  </div>
                ))}
              </div>
            </div>

            {slot && selectedSlotSessions.length > 0 && (
              <select
                className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] sm:w-40"
                value={slotSession}
                onChange={(e) => setSlotSession(e.target.value)}
              >
                <option value="">All Sessions</option>
                {selectedSlotSessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.name}
                  </option>
                ))}
              </select>
            )}

            <select
              className="h-10 rounded-lg border border-[var(--border-card)]  bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] sm:w-40"
              value={statusSort}
              onChange={(e) => setStatusSort(e.target.value)}
            >
              <option value="" disabled className="text-[var(--text-primary)]">
                Sort By Status
              </option>
              {sortPlayers?.map((item) => (
                <option key={item.value} value={item.value} className="text-[var(--text-primary)]">
                  {item.label}
                </option>
              ))}
            </select>

            {(statusSort === "select" || statusSort === "not select") && (
              <select
                className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] sm:w-40"
                value={typeSort}
                onChange={(e) => setTypeSort(e.target.value)}
              >
                <option value="" disabled>
                  Sort By Player Type
                </option>
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="allrounder">All Rounder</option>
                <option value="wicketkeeper">Wicket Keeper</option>
              </select>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset Filters
            </button>
          </div>
          </div>
        )}
      </div>

      <div className="pb-6">
        {players.length > 0 ? (
          viewMode === "table" ? (
            renderPlayersTable()
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {players.map((item) => {
                const playerRole = item?.player?.playerRole || item?.playerRole;
                const playerType = item?.playersRatings?.playerType;
                const roleToDisplay = playerType || playerRole;

                return (
                  <div key={item?._id}>
                    <PlayerCard
                      player={item}
                      type={roleToDisplay}
                      auctionId={auctionId}
                      selectedSlotId={slot}
                      selectedSlotSessions={selectedSlotSessions}
                      slotDetails={slotDetail || []}
                      onActionComplete={() =>
                        fetchPlayers("assigned", currentPageState)
                      }
                      mode="assigned"
                      isSelected={selectedPlayers?.includes(item?.player?._id)}
                      onRemove={() => fetchPlayers("assigned")}
                      onSelect={(id) => {
                        if (selectedPlayers?.includes(id)) {
                          setSelectedPlayers(selectedPlayers?.filter((x) => x !== id));
                        } else {
                          setSelectedPlayers([...selectedPlayers, id]);
                        }
                      }}
                      showActions={false}
                      onRatePlayer={handleOpenRating}
                      onGradePlayer={handleOpenGrading}
                    />
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] py-14 text-center shadow-[var(--shadow-card)]">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--secondary-lighter)] rounded-full mb-3">
              <Search className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-md font-semibold text-[var(--text-primary)]">
              No players found
            </h3>
            <p className="text-[var(--text-secondary)] text-sm">No assigned players found</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          className="mx-auto max-w-7xl"
          currentPage={currentPageState}
          totalPages={totalPages}
          summaryPrefix={`Total: ${totalPlayers} players | Page`}
          onPageChange={(page) => {
            setCurrentPageState(page);
            fetchPlayers("assigned", page);
          }}
          prevLabel="Previous"
          nextLabel="Next"
        />
      )}
      </>
      )}
    </>
  );
};

export default AssignedTrialsTab;
