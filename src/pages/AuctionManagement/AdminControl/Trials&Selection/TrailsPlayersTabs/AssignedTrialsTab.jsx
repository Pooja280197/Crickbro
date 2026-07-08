import React, { useState } from "react";
import {
  Award,
  CheckSquare,
  ChevronDown,
  Download,
  Edit3,
  Filter,
  LayoutGrid,
  Search,
  Square,
  Star,
  Table2,
  Trash2,
  Unlink2,
} from "lucide-react";
import { toast } from "react-toastify";

import PlayerCard, {
  PlayerDetailsModal,
} from "../../../../../components/PlayerCard";
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
  handleAddToSupercamp,
  supercampLoading,
}) => {
  const players = getFilteredPlayers();
  const [showFilters, setShowFilters] = useState(false);
  const [ballRatingConfig, setBallRatingConfig] = useState(null);
  const [gradingPlayerIds, setGradingPlayerIds] = useState([]);
  const [tableModalConfig, setTableModalConfig] = useState(null);
  const [tableModalSaving, setTableModalSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const hasActiveFilters = Boolean(
    slot ||
    slotSession ||
    statusSort ||
    typeSort ||
    slotSearch ||
    selectedSlotLabel,
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

  // const handleSelectAllVisible = () => {
  //   const visibleIds = players.map(getPlayerId).filter(Boolean);
  //   const allSelected =
  //     visibleIds.length > 0 &&
  //     visibleIds.every((playerId) => selectedPlayers.includes(playerId));

  //   setSelectedPlayers((prev) =>
  //     allSelected
  //       ? prev.filter((playerId) => !visibleIds.includes(playerId))
  //       : [...new Set([...prev, ...visibleIds])],
  //   );
  // };

  const handleSelectCurrentPage = () => {
    const currentPagePlayerIds = players
      .map((item) => getPlayerId(item))
      .filter(Boolean);

    setSelectedPlayers((prev) => {
      const newSelection = [...prev];
      currentPagePlayerIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };
  const handleDeselectAll = () => {
    setSelectedPlayers([]);
  };

  const getRole = (item) =>
    item?.playersRatings?.playerType ||
    item?.player?.playerRole ||
    item?.playerRole ||
    "Role not set";

  const getRatingOrGrade = (item) => {
    const grade =
      item?.directSelectedGrade || item?.playersRatings?.grade || item?.grading;

    if (grade !== undefined && grade !== null && grade !== "") {
      return { label: "Grade", value: String(grade), isGrade: true };
    }

    const rawRating =
      item?.playersRatings?.avgRating?.overall ??
      item?.playersRatings?.avgRating ??
      item?.playersRatings?.overallRating;
    const numericRating = Number(rawRating);

    return {
      label: "Rating",
      value:
        Number.isFinite(numericRating) && rawRating !== ""
          ? numericRating.toFixed(2)
          : "-",
      isGrade: false,
    };
  };

  const getStatusBadgeClass = (status) => {
    switch (
      String(status || "")
        .trim()
        .toLowerCase()
    ) {
      case "select":
      case "selected":
      case "available":
        return "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "not select":
      case "not selected":
      case "unsold":
        return "border-red-500/35 bg-red-500/10 text-red-600 dark:text-red-400";
      case "pending":
      case "bidding":
        return "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "sold":
        return "border-blue-500/35 bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "not reached":
        return "border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-300";
      default:
        return "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)]";
    }
  };

  const getPlayerId = (item) =>
    item?.player?._id || item?.playerId || item?._id || "";

  const getSlotId = (item) =>
    item?.session?.slot?._id || item?.slot?._id || item?.slotId || "";

  const getSessionId = (item) => item?.session?._id || item?.sessionId || "";

  const isSessionLocked = (item) =>
    String(item?.session?.lockStatus || "")
      .trim()
      .toLowerCase() === "locked";

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
      await api.delete(
        `/webSiteApi/auction/removePlayer/${auctionId}/${playerId}`,
      );
      toast.success("Player removed successfully");
      closeTableModal();
      fetchPlayers("assigned", currentPageState);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove player");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleTableModalRemoveFromSession = async (
    slotId,
    sessionId,
    playerId,
  ) => {
    if (!slotId || !sessionId || !playerId) {
      toast.error("Missing slot/session/player information");
      return;
    }

    try {
      setActionLoadingId(`session-${playerId}`);
      await api.post(
        `/webSiteApi/auctionSlot/removePlayerFromSession/${slotId}/${sessionId}`,
        {
          playerIds: [playerId],
        },
      );
      toast.success("Player removed from session");
      closeTableModal();
      fetchPlayers("assigned", currentPageState);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to remove from session",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const ActionIconButton = ({
    title,
    onClick,
    disabled,
    children,
    danger = false,
  }) => (
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
        <ActionIconButton
          title="Grading"
          onClick={() => handleOpenGrading(item)}
        >
          <Award className="h-4 w-4" />
        </ActionIconButton>
        <ActionIconButton
          title="Edit"
          onClick={() => openTableModal(item, "edit")}
        >
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
    <div className="inline-flex h-9 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-0.5 sm:h-10">
      <button
        type="button"
        onClick={() => setViewMode("grid")}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition sm:h-9 ${
          viewMode === "grid"
            ? "bg-[var(--secondary)] text-[#102033]"
            : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)]"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setViewMode("table")}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition sm:h-9 ${
          viewMode === "table"
            ? "bg-[var(--secondary)] text-[#102033]"
            : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)]"
        }`}
      >
        <Table2 className="h-4 w-4" />
      </button>
    </div>
  );

  const renderPlayersTable = () => (
    <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
      <div className="professional-scrollbar max-h-[calc(100vh-260px)] min-h-[260px] overflow-auto">
        <table className="min-w-[940px] w-full text-left text-sm">
          <thead className="bg-[var(--bg-main)] text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)] shadow-sm">
            <tr className="border-b border-[var(--border-card)]">
              <th className="sticky top-0 z-20 w-12 px-3 py-3 bg-[var(--bg-main)]">
                Select
              </th>
              <th className="sticky top-0 z-20 px-3 py-3 bg-[var(--bg-main)]">
                Player
              </th>
              <th className="sticky top-0 z-20 px-3 py-3 bg-[var(--bg-main)]">
                Role
              </th>
              <th className="sticky top-0 z-20 px-3 py-3 bg-[var(--bg-main)]">
                Rating / Grading
              </th>
              <th className="sticky top-0 z-20 px-3 py-3 bg-[var(--bg-main)]">
                Status
              </th>
              <th className="sticky top-0 z-20 px-3 py-3 bg-[var(--bg-main)]">
                Slot / Session
              </th>
              <th className="sticky top-0 z-20 px-3 py-3 bg-[var(--bg-main)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-card)]">
            {players.map((item) => {
              const core = item?.player || {};
              const ratingOrGrade = getRatingOrGrade(item);
              const playerStatus = item?.status || core?.status || "";
              const initials =
                String(core?.name || "P")
                  .split(" ")
                  .filter(Boolean)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "P";

              return (
                <tr
                  key={item?._id || core?._id}
                  className="bg-[var(--bg-card)] transition hover:bg-[var(--accent-light)]/60"
                >
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        const playerId = getPlayerId(item);
                        setSelectedPlayers((prev) =>
                          prev.includes(playerId)
                            ? prev.filter((id) => id !== playerId)
                            : [...prev, playerId],
                        );
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                        selectedPlayers.includes(getPlayerId(item))
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--border-primary)]"
                      }`}
                      title="Select player"
                    >
                      {selectedPlayers.includes(getPlayerId(item)) ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--accent-light)] text-xs font-bold text-[var(--primary)]">
                        {core?.profilePicture ? (
                          <img
                            src={core.profilePicture}
                            alt={core?.name || "Player"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--text-primary)]">
                          {core?.name || "Unknown"}
                        </p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {core?.mobileNumber || core?.phone || "Player"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2.5 py-1 text-xs font-bold text-[var(--primary)]">
                      {getRole(item)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        ratingOrGrade.isGrade
                          ? "border-violet-500/35 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                          : "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"
                      }`}
                    >
                      <span className="opacity-75">{ratingOrGrade.label}:</span>
                      {ratingOrGrade.value}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(playerStatus)}`}
                    >
                      {playerStatus || "-"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[var(--text-secondary)]">
                    <div className="max-w-[180px] truncate">
                      {item?.slot?.slotName || "-"}
                    </div>
                    <div className="max-w-[180px] truncate text-xs text-[var(--text-muted)]">
                      {item?.session?.name || "-"}
                    </div>
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
          <div className="sticky top-[86px] z-30 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] sm:p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto_auto_auto_auto] lg:items-center">
              <div className="relative col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] pl-10 pr-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)] sm:h-10 sm:pr-4"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] sm:h-10 xl:w-auto"
                >
                  <span className="hidden sm:inline">
                    Showing {itemsPerPage}
                  </span>
                  <span className="sm:hidden">{itemsPerPage}</span>
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

              {/* <button
                type="button"
                onClick={handleSelectAllVisible}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] sm:h-10"
              >
                <span className=" sm:inline">
                  {players.length > 0 &&
                  players.every((item) =>
                    selectedPlayers.includes(getPlayerId(item)),
                  )
                    ? "Deselect All"
                    : "Select All"}
                </span>
              
              </button> */}
              <div className="flex items-center gap-2">
                {/* Select All button */}
                <button
                  type="button"
                  onClick={handleSelectCurrentPage}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] sm:h-10"
                >
                  <span className="sm:inline">Select All</span>
                </button>

                {/* Deselect All button - Only shows when players are selected */}
                {selectedPlayers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs font-semibold text-red-500 transition hover:bg-red-500/20 sm:h-10"
                  >
                    <span className="sm:inline">
                      Deselect All ({selectedPlayers.length})
                    </span>
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={selectedPlayers.length === 0 || supercampLoading}
                onClick={handleAddToSupercamp}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 text-xs font-semibold text-[var(--primary)] transition hover:bg-[var(--secondary)] hover:text-[#102033] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10"
              >
                <span className="hidden sm:inline">
                  {supercampLoading
                    ? "Adding..."
                    : `Add to Supercamp (${selectedPlayers.length})`}
                </span>
                <span className="sm:hidden">
                  {supercampLoading
                    ? "Adding..."
                    : `Supercamp (${selectedPlayers.length})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition sm:h-10 sm:gap-2 ${
                  showFilters
                    ? "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"
                    : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              <button
                onClick={handleDownloadExcel}
                disabled={downloadLoading}
                className="col-span-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:gap-2 lg:col-span-1"
              >
                <Download className="h-4 w-4 text-[var(--primary)]" />
                <span className="hidden sm:inline">
                  {downloadLoading ? "Downloading..." : "Download Trials Excel"}
                </span>
                <span className="sm:hidden">
                  {downloadLoading ? "..." : "Excel"}
                </span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-2 rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-2 sm:mt-3 sm:p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:gap-3">
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
                    <option
                      value=""
                      disabled
                      className="text-[var(--text-primary)]"
                    >
                      Sort By Status
                    </option>
                    {sortPlayers?.map((item) => (
                      <option
                        key={item.value}
                        value={item.value}
                        className="text-[var(--text-primary)]"
                      >
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
                    const playerRole =
                      item?.player?.playerRole || item?.playerRole;
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
                          isSelected={selectedPlayers?.includes(
                            item?.player?._id,
                          )}
                          onRemove={() => fetchPlayers("assigned")}
                          onSelect={(id) => {
                            if (selectedPlayers?.includes(id)) {
                              setSelectedPlayers(
                                selectedPlayers?.filter((x) => x !== id),
                              );
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
                <p className="text-[var(--text-secondary)] text-sm">
                  No assigned players found
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <Pagination
              className="mx-auto max-w-7xl pb-2 "
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
