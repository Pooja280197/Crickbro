import React, { useState } from "react";
import { ChevronLeft, ChevronRight, UserRoundCheck } from "lucide-react";

const PlayersList = ({
  players = [],
  loading = false,
  totalPlayers = 0,
  totalPages = 1,
  currentPage = 1,
  itemsPerPage = 12,
  onSelectionChange,
  onPageChange,
}) => {
  const [selected, setSelected] = useState([]);

  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      buttons.push(1);

      if (currentPage > 3) buttons.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }

      if (currentPage < totalPages - 2) buttons.push("...");

      buttons.push(totalPages);
    }

    return buttons;
  };

  const paginatedPlayers = players;
  const currentPageIds = paginatedPlayers.map((player) => player.playerId);
  const isAllSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selected.includes(id));

  const handleSelectAll = (event) => {
    const nextSelected = event.target.checked
      ? [...new Set([...selected, ...currentPageIds])]
      : selected.filter((id) => !currentPageIds.includes(id));

    setSelected(nextSelected);
    onSelectionChange?.(nextSelected);
  };

  const handleSelect = (id) => {
    const nextSelected = selected.includes(id)
      ? selected.filter((selectedId) => selectedId !== id)
      : [...selected, id];

    setSelected(nextSelected);
    onSelectionChange?.(nextSelected);
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] text-sm font-semibold text-[var(--text-secondary)]">
        Loading players...
      </div>
    );
  }

  if (!paginatedPlayers.length) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] text-sm font-semibold text-[var(--text-secondary)]">
        No players found.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-card)] px-3 py-2.5">
        <label className="flex min-w-0 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            className="h-4 !min-h-4 w-4 rounded border-[var(--border-card)] accent-[var(--secondary)]"
          />
          <span className="truncate text-sm font-bold text-[var(--text-primary)]">
            Select All
          </span>
        </label>
        <span className="rounded-full bg-[var(--secondary-lighter)] px-2 py-1 text-xs font-bold text-[var(--secondary)]">
          {selected.length} selected
        </span>
      </div>

      <div className="h-[323px] shrink-0 overflow-y-auto overscroll-contain">
        <ul className="divide-y divide-[var(--border-card)]">
          {paginatedPlayers.map((player) => (
            <li key={player.playerId}>
              <label className="flex h-[53px] cursor-pointer items-center gap-3 px-3 py-2 transition hover:bg-[var(--accent-light)]">
                <input
                  type="checkbox"
                  checked={selected.includes(player.playerId)}
                  onChange={() => handleSelect(player.playerId)}
                  className="h-4 !min-h-4 w-4 rounded border-[var(--border-card)] accent-[var(--secondary)]"
                />
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary-lighter)] text-[var(--secondary)]">
                  <UserRoundCheck className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--text-primary)]">
                  {player.player?.name || player.name}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {totalPages > 1 && (
        <div className="shrink-0 border-t border-[var(--border-card)] bg-[var(--bg-card)] p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalPlayers)} -{" "}
              {Math.min(currentPage * itemsPerPage, totalPlayers)} of{" "}
              {totalPlayers}
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] transition hover:border-[var(--border-primary)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {renderPaginationButtons().map((btn, index) => (
                <button
                  key={`${btn}-${index}`}
                  onClick={() => btn !== "..." && handlePageChange(btn)}
                  disabled={btn === "..."}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-bold transition ${
                    btn === currentPage
                      ? "border-[var(--secondary)] bg-[var(--secondary)] text-[#102033]"
                      : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:border-[var(--border-primary)]"
                  } disabled:cursor-default disabled:opacity-60`}
                >
                  {btn}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] transition hover:border-[var(--border-primary)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersList;
