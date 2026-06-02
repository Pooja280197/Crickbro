import React from "react";
import { ChevronDown, Download, Search } from "lucide-react";

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

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-3">
        <div className="auction-toolbar">
          <div className="relative w-full md:w-1/2 flex justify-between">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 " />
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="auction-input pl-10 pr-4"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
              className="auction-btn auction-btn-ghost"
            >
              <span>Showing {itemsPerPage}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isItemsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isItemsDropdownOpen && (
              <div className="auction-card absolute right-0 top-full z-10 mt-1 overflow-hidden">
                {[16, 32, 64, 96].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setItemsPerPage(num);
                      setCurrentPageState(1);
                      setIsItemsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm text-[var(--color-button-primary)] transition-colors ${
                      itemsPerPage === num
                        ? "bg-white text-[var(--color-button-primary)]"
                        : "hover:bg-[var(--color-button-primary)] hover:text-white"
                    }`}
                  >
                    Showing {num}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleDownloadExcel}
            disabled={downloadLoading}
            className="auction-btn auction-btn-primary"
          >
            <Download className="w-4 h-4" />
            {downloadLoading ? "Downloading..." : "Download Trials Excel"}
          </button>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
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
                className="auction-input"
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
                className={`auction-card absolute z-[9999] mt-1 max-h-48 w-full overflow-y-auto ${isSlotOpen ? "block" : "hidden"}`}
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
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  >
                    {s.slotName}
                  </div>
                ))}
              </div>
            </div>

            {slot && selectedSlotSessions.length > 0 && (
              <select
                className="auction-select sm:w-40"
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
              className="auction-select sm:w-40"
              value={statusSort}
              onChange={(e) => setStatusSort(e.target.value)}
            >
              <option value="" disabled>
                Sort By Status
              </option>
              {sortPlayers?.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            {(statusSort === "select" || statusSort === "not select") && (
              <select
                className="auction-select sm:w-40"
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-6">
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
          <div className="text-center py-14">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-md font-semibold text-gray-900">
              No players found
            </h3>
            <p className="text-gray-500 text-sm">No assigned players found</p>
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
