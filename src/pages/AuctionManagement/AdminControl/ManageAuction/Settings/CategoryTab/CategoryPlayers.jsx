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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 top-20">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl text-gray-200 font-bold">Category Players</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-300">
                  {localPlayers.length} players
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                  Page {page} of {totalPages}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setSearchTerm(e.target.value);
                }}
                placeholder="Search player..."
                className="pl-9 pr-3 py-2 rounded-lg bg-gray-800/70 border border-gray-600 text-white text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}
                className="bg-transparent text-white text-sm focus:outline-none"
              >
                <option value={20} className="bg-gray-800">20 per page</option>
                <option value={50} className="bg-gray-800">50 per page</option>
                <option value={100} className="bg-gray-800">100 per page</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 text-red-700 px-6 py-3 flex items-center">
            <div className="mr-3">⚠️</div>
            <div className="flex-1">{error}</div>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Players Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
            {localPlayers
              .sort((a, b) => a.orderInCategory - b.orderInCategory)
              .map((player) => (
                <div
                  key={player.playerId}
                  onClick={() => {
                    if (isSaving) return;
                    setSelectedPlayer(player);
                    setNewOrder(player.orderInCategory.toString());
                    setError("");
                    setInputError("");
                  }}
                  className={`relative border rounded-xl p-3 text-center transition-all duration-200 cursor-pointer group
                    ${isSaving
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:scale-[1.02] hover:shadow-lg hover:border-blue-400"
                    }
                    ${selectedPlayer?.playerId === player.playerId
                      ? "ring-2 ring-blue-500 border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-white"
                    }`}
                >
                  {/* Order Badge */}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${selectedPlayer?.playerId === player.playerId
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-white"
                    }`}
                  >
                    #{player.orderInCategory}
                  </div>

                  {/* Player Content */}
                  <div className="mb-2 h-12 flex items-center justify-center">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-700">
                      {player.name}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-1 inline-block">
                      Batch: {player.batchId}
                    </p>
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-xl pointer-events-none" />
                </div>
              ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 bg-gray-800/90 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white-600">
              Showing {Math.min((page - 1) * limit + 1, localPlayers.length)}-
              {Math.min(page * limit, localPlayers.length)} of {localPlayers.length} players
            </div>
            
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-2 px-4 py-2 border text-gray-100 border-gray-300 rounded-lg hover:bg-gray-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                        ${page === pageNum
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-900 text-white"
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
                className="flex items-center gap-2 px-4 py-2 text-gray-100 border border-gray-300 rounded-lg hover:bg-gray-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
          <div className="text-sm text-gray-600 text-center flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Click on a player to change their display order
          </div>
        </div>
      </div>

      {/* -------- Order Change Modal -------- */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Hash size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Change Player Order</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlayer(null);
                    setNewOrder("");
                    setInputError("");
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Player Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <p className="font-semibold text-gray-900">{selectedPlayer.name}</p>
                    <p className="text-sm text-gray-600 mt-1">Batch: {selectedPlayer.batchId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Current Order</div>
                    <div className="text-2xl font-bold text-blue-600">
                      #{selectedPlayer.orderInCategory}
                    </div>
                  </div>
                </div>

                {/* New Order Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span>New Order Position</span>
                    <span className="text-xs text-gray-500">
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
                      className={`w-full px-4 py-3 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${inputError ? "border-red-500" : "border-gray-300"}`}
                      placeholder={`Enter position 1-${totalRecords}`}
                      autoFocus
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      of {totalRecords}
                    </div>
                  </div>
                  
                  {inputError && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      ⚠️ {inputError}
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
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrderSubmit}
                  disabled={isSaving || !newOrder.trim() || !!inputError}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg"
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