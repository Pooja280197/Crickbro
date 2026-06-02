import React from "react";
import { ChevronDown, Search } from "lucide-react";

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
        </div>

        <div className="flex flex-row gap-2 w-full justify-end">
          <button
            onClick={handleSelectAll}
            className="auction-btn auction-btn-ghost"
          >
            {selectedPlayers.length === players.length
              ? "Deselect All"
              : "Select All"}
          </button>

          <button
            disabled={selectedPlayers.length === 0}
            onClick={handleAssignPlayers}
            className={`auction-btn ${
              selectedPlayers.length > 0
                ? "auction-btn-primary"
                : "auction-btn-ghost"
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

      <div className="max-w-7xl mx-auto px-4 pb-6">
        {players.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
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
        ) : (
          <div className="text-center py-14">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-md font-semibold text-gray-900">
              No players found
            </h3>
            <p className="text-gray-500 text-sm">Try adjusting your search</p>
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
