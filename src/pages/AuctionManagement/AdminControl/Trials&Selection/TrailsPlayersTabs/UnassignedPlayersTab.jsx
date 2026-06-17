import React from "react";
import { CheckSquare, ChevronDown, LayoutGrid, Search, Square, Table2 } from "lucide-react";

import PlayerAssign from "../../../../../components/PlayerAssign";
import PlayerCard from "../../../../../components/PlayerCard";
import Pagination from "../../../../../components/Pagination";

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
  handleSelectAll,
  handleAssignPlayers,
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
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-[var(--bg-main)] text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
            <tr className="border-b border-[var(--border-card)]">
              <th className="w-12 px-3 py-3">Select</th>
              <th className="px-3 py-3">Player</th>
              <th className="px-3 py-3">Batch ID</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Rating</th>
              <th className="px-3 py-3">Slot / Session</th>
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
                    selected ? "bg-[var(--accent-light)]" : "bg-[var(--bg-card)]"
                  }`}
                >
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (selected) {
                          setSelectedPlayers(selectedPlayers?.filter((id) => id !== core?._id));
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
                      {selected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                    </button>
                  </td>
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
                  <td className="px-3 py-3 text-[var(--text-secondary)]">
                    <div className="max-w-[180px] truncate">{item?.slot?.slotName || "-"}</div>
                    <div className="max-w-[180px] truncate text-xs text-[var(--text-muted)]">{item?.session?.name || "-"}</div>
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
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] lg:w-auto"
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
            onClick={handleSelectAll}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
          >
            {selectedPlayers.length === players.length
              ? "Deselect All"
              : "Select All"}
          </button>

          <button
            disabled={selectedPlayers.length === 0}
            onClick={handleAssignPlayers}
            className={`inline-flex h-10 items-center justify-center rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              selectedPlayers.length > 0
                ? "border border-[var(--border-primary)] bg-[var(--secondary)] text-[#102033] hover:bg-[var(--secondary-strong)]"
                : "border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)]"
            }`}
          >
            Assign ({selectedPlayers.length})
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
                        setSelectedPlayers(selectedPlayers?.filter((x) => x !== id));
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
            <p className="text-[var(--text-secondary)] text-sm">Try adjusting your search</p>
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
