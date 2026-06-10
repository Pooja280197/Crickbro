import React, { useState } from "react";
import { ChevronDown, Download, Filter, Search } from "lucide-react";

import PlayerCard from "../../../../../components/PlayerCard";
import Pagination from "../../../../../components/Pagination";

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
}) => {
  const players = getFilteredPlayers();
  const [showFilters, setShowFilters] = useState(false);
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

  return (
    <>
      <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto_auto] xl:items-center">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {players.map((item) => {
              const playerRole = item?.player?.playerRole || item?.playerRole;
              const playerType = item?.playersRatings?.playerType;
              const roleToDisplay = playerType || playerRole;

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
                />
              );
            })}
          </div>
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
  );
};

export default AssignedTrialsTab;
