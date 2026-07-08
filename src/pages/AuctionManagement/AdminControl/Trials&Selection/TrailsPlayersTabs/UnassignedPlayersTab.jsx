import React, { useState } from "react";
import {
  CheckSquare,
  ChevronDown,
  Edit3,
  Eye,
  LayoutGrid,
  Search,
  Square,
  Table2,
  Trash2,
  Trophy,
} from "lucide-react";
import { toast } from "react-toastify";

import PlayerAssign from "../../../../../components/PlayerAssign";
import PlayerCard, {
  PlayerDetailsModal,
} from "../../../../../components/PlayerCard";
import Pagination from "../../../../../components/Pagination";
import api from "../../../../../utils/api";

const UnassignedPlayersTab = ({
  searchQuery,
  setSearchQuery,
  itemsPerPage,
  setItemsPerPage,
  isItemsDropdownOpen,
  setIsItemsDropdownOpen,
  selectedPlayers,
  setSelectedPlayers,
  assignmentModalOpen,
  setAssignmentModalOpen,
  getFilteredPlayers,
  // handleSelectAll,
  handleSelectCurrentPage,
  handleDeselectAll,
  handleAssignPlayers,
  handleAddToSupercamp,
  supercampLoading,
  handleAssignmentSuccess,
  fetchPlayers,
  currentPageState,
  setCurrentPageState,
  totalPages,
  totalPlayers,
  auctionId,
  slot,
  selectedSlotSessions,
  slotDetail,
  viewMode,
  setViewMode,
}) => {
  const players = getFilteredPlayers();
  const [tableModalConfig, setTableModalConfig] = useState(null);
  const [tableModalSaving, setTableModalSaving] = useState(false);
  const [tableModalRemoving, setTableModalRemoving] = useState(false);

  const getPlayerId = (item) =>
    item?.player?._id || item?.playerId || item?.id || item?._id || "";

  const openTableModal = (item, initialAction = "") => {
    setTableModalConfig({ item, initialAction });
  };

  const closeTableModal = () => setTableModalConfig(null);

  const handleTableModalEdit = async (payload) => {
    try {
      setTableModalSaving(true);
      await api.put("/webSiteApi/players/editPlayer", payload);
      toast.success("Player updated successfully");
      closeTableModal();
      fetchPlayers("unassigned", currentPageState);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update player");
      return false;
    } finally {
      setTableModalSaving(false);
    }
  };

  const handleTableModalRemove = async () => {
    const playerId = getPlayerId(tableModalConfig?.item);
    if (!auctionId || !playerId) {
      toast.error("Missing auction or player information");
      return;
    }

    try {
      setTableModalRemoving(true);
      await api.delete(
        `/webSiteApi/auction/removePlayer/${auctionId}/${playerId}`,
      );
      toast.success("Player removed successfully");
      closeTableModal();
      fetchPlayers("unassigned", currentPageState);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove player");
    } finally {
      setTableModalRemoving(false);
    }
  };

  const ActionIconButton = ({ title, onClick, danger = false, children }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
        danger
          ? "border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
          : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
      }`}
    >
      {children}
    </button>
  );

  const getRole = (item) =>
    item?.player?.playerRole ||
    item?.playerRole ||
    item?.playersRatings?.playerType ||
    "Role not set";

  const getRating = (item) =>
    item?.directSelected
      ? item?.directSelectedGrade || "N/A"
      : item?.playersRatings?.avgRating
        ? Number(item.playersRatings.avgRating).toFixed(2)
        : "-";

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
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="bg-[var(--bg-main)] text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)] shadow-sm">
            <tr className="border-b border-[var(--border-card)]">
              <th className="sticky top-0 z-20 w-12 px-3 py-3 bg-[var(--bg-main)]">
                Select
              </th>
              <th className="sticky top-0 z-20 px-3 py-3 bg-[var(--bg-main)]">
                Player
              </th>
              <th className="sticky top-0 z-20 px-3 py-3 bg-[var(--bg-main)]">
                Batch ID
              </th>
              <th className="sticky top-0 z-20 px-3 py-3 bg-[var(--bg-main)]">
                Role
              </th>
              <th className="sticky top-0 z-20 px-3 py-3 bg-[var(--bg-main)]">
                Mobile
              </th>
              <th className="sticky top-0 z-20 px-3 py-3 bg-[var(--bg-main)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-card)]">
            {players.map((item) => {
              const core = item?.player || {};
              const selected = selectedPlayers?.includes(core?._id);
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
                  className={`transition hover:bg-[var(--accent-light)]/60 ${
                    selected
                      ? "bg-[var(--accent-light)]"
                      : "bg-[var(--bg-card)]"
                  }`}
                >
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (selected) {
                          setSelectedPlayers(
                            selectedPlayers?.filter((id) => id !== core?._id),
                          );
                        } else {
                          setSelectedPlayers([...selectedPlayers, core?._id]);
                        }
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                        selected
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--border-primary)]"
                      }`}
                    >
                      {selected ? (
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
                  <td className="px-3 py-3 text-[var(--text-secondary)]">
                    {core?.batchId || "-"}
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2.5 py-1 text-xs font-bold text-[var(--primary)]">
                      {getRole(item)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[var(--text-secondary)]">
                    {core?.mobile
                      ? `${core?.countryCode ? `${core.countryCode} ` : ""}${core.mobile}`
                      : core?.mobileNumber || core?.phone || "-"}
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <ActionIconButton
                        title="View player"
                        onClick={() => openTableModal(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </ActionIconButton>
                      <ActionIconButton
                        title="Edit player"
                        onClick={() => openTableModal(item, "edit")}
                      >
                        <Edit3 className="h-4 w-4" />
                      </ActionIconButton>
                      <ActionIconButton
                        title="Remove player"
                        onClick={() => openTableModal(item, "delete")}
                        danger
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionIconButton>
                    </div>
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
      <div className="sticky top-[86px] z-30 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] sm:p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto_auto] lg:items-center">
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
          <div className="relative ">
            <button
              onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] sm:h-10 lg:w-auto"
            >
              <span className="hidden sm:inline">Showing {itemsPerPage}</span>
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
            onClick={handleSelectAll}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] sm:h-10"
          >
            <span className="sm:inline">
              {selectedPlayers.length === players.length ? "Deselect All" : "Select All"}
            </span>
            
          </button> */}
          {/* Replace the button section with this */}
          <div className="flex gap-2">
            {/* Select All button - Always visible */}
            <button
              onClick={handleSelectCurrentPage}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] sm:h-10"
            >
              <span className="sm:inline">Select All</span>
            </button>

            {/* Deselect All button - Show only if there are selected players */}
            {selectedPlayers.length > 0 && (
              <button
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
            disabled={selectedPlayers.length === 0}
            onClick={handleAssignPlayers}
            className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 ${
              selectedPlayers.length > 0
                ? "border border-[var(--border-primary)] bg-[var(--secondary)] text-[#102033] hover:bg-[var(--secondary-strong)]"
                : "border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)]"
            }`}
          >
            <span className="hidden sm:inline">
              Assign ({selectedPlayers.length})
            </span>
            <span className="sm:hidden">Assign</span>
          </button>
          <button
            type="button"
            disabled={selectedPlayers.length === 0 || supercampLoading}
            onClick={handleAddToSupercamp}
            className={`col-span-2 flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-bold transition sm:h-10 sm:text-sm lg:col-span-1 ${
              selectedPlayers.length > 0 && !supercampLoading
                ? "border border-[#00d4ff]/50 text-[#00d4ff] hover:bg-[#00d4ff]/10"
                : "opacity-50 cursor-not-allowed border border-[#1a2b45] text-home-muted bg-[#000d21]/60"
            }`}
          >
            <Trophy className="w-4 h-4" />
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
        </div>
      </div>

      <PlayerAssign
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        selectedPlayers={selectedPlayers}
        playerCount={selectedPlayers.length}
        onAssignSuccess={handleAssignmentSuccess}
        auctionId={auctionId}
      />

      {tableModalConfig && (
        <PlayerDetailsModal
          player={tableModalConfig.item}
          isOpen={Boolean(tableModalConfig)}
          onClose={closeTableModal}
          onEdit={
            tableModalConfig.initialAction === "edit"
              ? handleTableModalEdit
              : undefined
          }
          onDelete={
            tableModalConfig.initialAction === "delete"
              ? handleTableModalRemove
              : undefined
          }
          isSaving={tableModalSaving}
          isRemoving={tableModalRemoving}
          type={getRole(tableModalConfig.item)}
          initialAction={tableModalConfig.initialAction}
          actionOnly={tableModalConfig.initialAction === "delete"}
          showAllDetails={tableModalConfig.initialAction === ""}
        />
      )}

      <div className="pb-6">
        {players.length > 0 ? (
          viewMode === "table" ? (
            renderPlayersTable()
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {players.map((item) => {
                const playerRole = item?.player?.playerRole || item?.playerRole;
                const playerType = item?.playersRatings?.playerType;
                const roleToDisplay = playerRole || playerType;

                return (
                  <PlayerCard
                    key={item?._id}
                    player={item}
                    type={roleToDisplay}
                    auctionId={auctionId}
                    selectedSlotId={slot}
                    selectedSlotSessions={selectedSlotSessions}
                    slotDetails={slotDetail || []}
                    onActionComplete={() =>
                      fetchPlayers("unassigned", currentPageState)
                    }
                    mode="select"
                    isSelected={selectedPlayers?.includes(item?.player?._id)}
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
                    showActions
                  />
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
              Try adjusting your search
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
            fetchPlayers("unassigned", page);
          }}
          prevLabel="Previous"
          nextLabel="Next"
        />
      )}
    </>
  );
};

export default UnassignedPlayersTab;
