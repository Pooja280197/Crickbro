import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../../../../utils/api";
import { X, ChevronLeft, ChevronRight, Users, Hash, Filter, Search } from "lucide-react";
import { getCategoryPlayers } from "../../../../../../redux/actions";

const CategoryPlayers = ({ open, onClose, categoryId, auctionId }) => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [localPlayers, setLocalPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newOrder, setNewOrder] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const categoryplayers = useSelector((state) => state?.data?.categoryPlayers);
  const totalPages = categoryplayers?.pages || 1;
  const totalRecords = categoryplayers?.total || 0;

  /* ---------- Sync Redux → Local ---------- */
  useEffect(() => {
    if (categoryplayers?.data) {
      setLocalPlayers(categoryplayers.data);
    }
  }, [categoryplayers]);

  /* ---------- Fetch Players ---------- */
  useEffect(() => {
    if (open && categoryId) {
      dispatch(getCategoryPlayers(categoryId, page, limit, "", debouncedSearchTerm));
    }
  }, [open, categoryId, page, limit, debouncedSearchTerm, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ---------- Validate and Handle Order Input ---------- */
  const handleOrderChange = useCallback((value) => {
    setInputError("");
    
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue === "") {
      setNewOrder("");
      return;
    }
    
    const num = parseInt(numericValue, 10);
    
    // Validate range against total records (not current page size)
    if (totalRecords > 0 && num > totalRecords) {
      setInputError(`Maximum order is ${totalRecords}`);
    }
    
    setNewOrder(numericValue);
  }, [totalRecords]);

  /* ---------- Submit Order Change ---------- */
  const handleOrderSubmit = async () => {
    const order = Number(newOrder);
    const totalPlayers = totalRecords;

    // Validation
    if (!newOrder.trim()) {
      setError("Please enter an order number");
      return;
    }

    if (order < 1) {
      setError("Order must be at least 1");
      return;
    }

    if (order > totalPlayers) {
      setError(`Order cannot exceed ${totalPlayers}`);
      return;
    }

    if (order === selectedPlayer.orderInCategory) {
      setError("Player is already at this position");
      return;
    }

    setIsSaving(true);
    setError("");
    setInputError("");

    try {
      await api.post(
        `/webSiteApi/auctionCategory/swapPlayerOrderInCategory/${categoryId}`,
        {
          auctionId,
          playerId: selectedPlayer.playerId,
          newOrder: order,
        }
      );

      dispatch(getCategoryPlayers(categoryId, page, limit));
      setSelectedPlayer(null);
      setNewOrder("");
    } catch (err) {
      console.error(err);
      setError("Failed to update order. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-black/70 p-3 pt-5 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[calc(100vh-2.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        {/* Header */}
        <div className="border-b border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                <Users size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                  Category Players
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                    {totalRecords || localPlayers.length} players
                  </span>
                  <span className="rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
                    Page {page} of {totalPages}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setSearchTerm(e.target.value);
                }}
                placeholder="Search player..."
                className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] pl-9 pr-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)]"
              />
            </div>

            <div className="flex h-10 items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3">
              <Filter size={16} className="text-[var(--primary)]" />
              <select
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}
                className="bg-transparent text-sm font-medium text-[var(--text-primary)] outline-none"
              >
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            <div className="flex-1">{error}</div>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Players List */}
        <div className="professional-scrollbar flex-1 overflow-y-auto bg-[var(--bg-main)] p-4 sm:p-5">
          {localPlayers.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--bg-card)] p-6 text-center shadow-sm">
              <Users className="mb-3 h-10 w-10 text-[var(--primary)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                No players found
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Try changing the search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {localPlayers
                .sort((a, b) => a.orderInCategory - b.orderInCategory)
                .map((player) => {
                  const isSelected = selectedPlayer?.playerId === player.playerId;

                  return (
                    <button
                      type="button"
                      key={player.playerId}
                      onClick={() => {
                        if (isSaving) return;
                        setSelectedPlayer(player);
                        setNewOrder(player.orderInCategory.toString());
                        setError("");
                        setInputError("");
                      }}
                      className={`group relative min-h-[92px] rounded-lg border p-2.5 text-left shadow-sm transition ${
                        isSaving
                          ? "cursor-not-allowed opacity-60"
                          : "hover:border-[var(--border-primary)] hover:bg-[var(--bg-card)]"
                      } ${
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--accent-light)] ring-2 ring-[var(--primary)]/20"
                          : "border-[var(--border-card)] bg-[var(--bg-card)]"
                      }`}
                    >
                      <span
                        className={`mb-2 inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-[11px] font-bold shadow-sm ${
                          isSelected
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--secondary)] text-[#102033]"
                        }`}
                      >
                        #{player.orderInCategory}
                      </span>

                      <p className="line-clamp-2 min-h-8 text-xs font-semibold leading-4 text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                        {player.name}
                      </p>

                      <p className="mt-1 truncate text-[10px] font-medium text-[var(--text-secondary)]">
                        Batch: {player.batchId || "-"}
                      </p>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="border-t border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm text-[var(--text-secondary)]">
              Showing {localPlayers.length ? Math.min((page - 1) * limit + 1, totalRecords || localPlayers.length) : 0}-
              {Math.min(page * limit, totalRecords || localPlayers.length)} of {totalRecords || localPlayers.length} players
            </div>
            
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  const pageNum = page <= 3 ? idx + 1 : 
                                page >= totalPages - 2 ? totalPages - 4 + idx : 
                                page - 2 + idx;
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setPage(pageNum)}
                      className={`h-9 w-9 rounded-lg text-sm font-semibold transition
                        ${page === pageNum
                          ? "bg-[var(--secondary)] text-[#102033]"
                          : "border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:bg-[var(--accent-light)]"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="border-t border-[var(--border-card)] bg-[var(--bg-main)] px-5 py-3">
          <div className="flex items-center justify-center gap-2 text-center text-sm text-[var(--text-secondary)]">
            <div className="h-2 w-2 rounded-full bg-[var(--primary)]"></div>
            Select a player card to change its display order.
          </div>
        </div>
      </div>

      {/* -------- Order Change Modal -------- */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
            {/* Modal Header */}
            <div className="border-b border-[var(--border-card)] bg-[var(--bg-main)] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                    <Hash size={18} />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">Change Player Order</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlayer(null);
                    setNewOrder("");
                    setInputError("");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:bg-[var(--accent-light)]"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Player Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-[var(--border-card)] bg-[var(--bg-main)] p-4">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{selectedPlayer.name}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Batch: {selectedPlayer.batchId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[var(--text-secondary)]">Current Order</div>
                    <div className="text-2xl font-bold text-[var(--primary)]">
                      #{selectedPlayer.orderInCategory}
                    </div>
                  </div>
                </div>

                {/* New Order Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                    <span>New Order Position</span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      (1 - {totalRecords})
                    </span>
                  </label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newOrder}
                      onChange={(e) => handleOrderChange(e.target.value)}
                      className={`w-full rounded-xl border bg-[var(--bg-main)] px-4 py-3 text-lg text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)]
                        ${inputError ? "border-red-500" : "border-[var(--border-primary)]"}`}
                      placeholder={`Enter position 1-${totalRecords}`}
                      autoFocus
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]">
                      of {totalRecords}
                    </div>
                  </div>
                  
                  {inputError && (
                    <p className="flex items-center gap-2 text-sm text-red-600">
                      {inputError}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedPlayer(null);
                    setNewOrder("");
                    setInputError("");
                  }}
                  className="flex-1 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrderSubmit}
                  disabled={isSaving || !newOrder.trim() || !!inputError}
                  className="flex-1 rounded-lg bg-[var(--secondary)] px-4 py-3 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </span>
                  ) : (
                    "Update Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPlayers;
