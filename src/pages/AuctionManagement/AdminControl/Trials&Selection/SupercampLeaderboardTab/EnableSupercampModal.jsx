import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Search, UserPlus, Users, X } from "lucide-react";
import { useDebounce } from "../../../../../components/useDebounce";
import api from "../../../../../utils/api";
import { toggleSupercampPlayer } from "../../../../../redux/actions";

const EnableSupercampModal = ({ isOpen, onClose, auctionId, onUpdated }) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/webSiteApi/auction/getAuctionPlayers/${auctionId}`, {
          params: { page: 1, limit: 30, search: debouncedSearch },
        });
        setPlayers(response?.data?.data?.data || []);
      } catch {
        toast.error("Failed to load players");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [isOpen, auctionId, debouncedSearch]);

  const handleToggle = async (player) => {
    const playerId = player?.player?._id || player?.playerId;
    if (!playerId) return;
    const current = Boolean(player?.supercamp?.isSupercamp);
    setTogglingId(playerId);
    try {
      await dispatch(toggleSupercampPlayer(auctionId, playerId, !current));
      toast.success(current ? "Removed from supercamp" : "Added to supercamp");
      setPlayers((prev) =>
        prev.map((p) => {
          const pid = p?.player?._id || p?.playerId;
          if (String(pid) !== String(playerId)) return p;
          return {
            ...p,
            supercamp: { ...p.supercamp, isSupercamp: !current },
          };
        })
      );
      onUpdated?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setTogglingId(null);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--border-card)] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]"><Users className="h-4 w-4" /></div>
            <div className="min-w-0"><h3 className="text-lg font-bold text-[var(--text-primary)]">Manage Supercamp Players</h3><p className="truncate text-sm text-[var(--text-secondary)]">Enable or disable leaderboard players</p></div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-card)] text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"><X className="h-4 w-4" /></button>
        </div>

        <div className="relative m-4 mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search registered players..."
            className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)]"
          />
        </div>

        <div className="professional-scrollbar min-h-[200px] flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 pb-4 pr-3 [scrollbar-gutter:stable]">
          {loading ? (
            <div className="py-8 text-center font-semibold text-[var(--primary)] animate-pulse">Loading...</div>
          ) : players.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border-card)] py-8 text-center text-[var(--text-secondary)]">No players found</div>
          ) : (
            players.map((ap) => {
              const pid = ap?.player?._id || ap?.playerId;
              const isSupercamp = Boolean(ap?.supercamp?.isSupercamp);
              return (
                <div
                  key={ap._id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3 transition hover:border-[var(--border-primary)]"
                >
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{ap?.player?.name || "Player"}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{ap?.player?.mobile}</div>
                  </div>
                  <button
                    disabled={togglingId === pid}
                    onClick={() => handleToggle(ap)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
                      isSupercamp
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-[var(--primary)] text-[var(--text-dark)]"
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {isSupercamp ? "Remove" : "Enable"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="m-4 mt-0 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
        >
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default EnableSupercampModal;
