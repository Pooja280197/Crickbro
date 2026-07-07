import api from "../../../../../utils/api";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import {
  connectAuctionSocket,
  disconnectSocket,
} from "../../../../../utils/SocketClient";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../../../components/ConfirmDialog";
import profile from "../../../../../assets/Images/profile-icon.jpg";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Maximize2,
  Minimize2,
  Search,
  Settings,
} from "lucide-react";
import { computeCategoryLockReserveForTeam } from "./categoryBudgetLockUtils";

/* ================= CONSTANTS ================= */

const BID_STEP = 250000;

/* ================= HELPERS ================= */

const formatBidTime = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;

  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-IN", { month: "short" });
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  const secs = String(d.getSeconds()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${mins}:${secs}`;
};

const formatMoney = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0";
  if (n >= 10000000) return `${parseFloat((n / 10000000).toFixed(2))}Cr`;
  if (n >= 100000) return `${parseFloat((n / 100000).toFixed(2))}L`;
  if (n >= 1000) return `${parseFloat((n / 1000).toFixed(1))}k`;
  return n.toString();
};

/* ================= COMPONENT ================= */

const AdminAuctionControl = () => {
  const { auctionId } = useParams();
  const auctionRoomRef = useRef(null);

  /* ---------- UI STATE ---------- */
  const [isRoomFullscreen, setIsRoomFullscreen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("available");
  /** "sequence" = orderInCategory; "random" = any eligible player */
  const [nextPlayerPickMode, setNextPlayerPickMode] = useState("sequence");

  const [categoryCounts, setCategoryCounts] = useState(null);
  const [countsLoading, setCountsLoading] = useState(false);
  const [countsError, setCountsError] = useState(null);

  const [auctionStarted, setAuctionStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [decisionPending, setDecisionPending] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [currentBid, setCurrentBid] = useState(null);
  const [currentWinnerName, setCurrentWinnerName] = useState(null);
  const [isSold, setIsSold] = useState(null);

  const [soldHistory, setSoldHistory] = useState([]);
  const [biddingHistory, setBiddingHistory] = useState([]);

  const [socketData, setSocketData] = useState(null);
  const [socketInstance, setSocketInstance] = useState(null);
  const [teams, setTeams] = useState([]);

  const [teamSearch, setTeamSearch] = useState("");
  const [hasSelectedCategory, setHasSelectedCategory] = useState(false);
  const [searchPlayerPopup, setSearchPlayerPopup] = useState(false);
  const [searchParticularPlayer, setSearchParticularPlayer] = useState("");
  const [debouncedSearchParticularPlayer, setDebouncedSearchParticularPlayer] =
    useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [searchPlayers, setSearchPlayers] = useState([]);
  const [searchPlayersTotalPages, setSearchPlayersTotalPages] = useState(1);
  const [searchPlayersLoading, setSearchPlayersLoading] = useState(false);

  const [manualBidTeamId, setManualBidTeamId] = useState("");
  const [manualBidAmount, setManualBidAmount] = useState("");

  const [sellPlayerPopup, setSellPlayerPopup] = useState(false);
  const [sellToSelectedTeam, setSellToSelectedTeam] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  /* ========== TEAM SETTINGS MODAL ========== */
  const [teamSettingsList, setTeamSettingsList] = useState([]);
  const [teamSettingsOpen, setTeamSettingsOpen] = useState(false);

  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
    danger: false,
  });

  const currentPlayer = socketData?.currentPlayer || null;

  const Card = ({ label, children }) => (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 shadow-sm">
      <span className="text-[11px] tracking-wide text-slate-400 uppercase">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </div>
  );

  const enterFullscreen = async () => {
    setIsRoomFullscreen(true);
    const el = auctionRoomRef.current;
    try {
      if (el?.requestFullscreen) {
        await el.requestFullscreen();
      }
    } catch (error) {
      console.error("Unable to enter fullscreen:", error);
    }
  };

  const exitFullscreen = async () => {
    setIsRoomFullscreen(false);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Unable to exit fullscreen:", error);
    }
  };

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsRoomFullscreen(
        document.fullscreenElement === auctionRoomRef.current,
      );
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  /* ---------- FETCH CATEGORIES ---------- */

  useEffect(() => {
    if (!auctionId) return;

    const fetchCategories = async () => {
      try {
        const res = await api.get(
          `/webSiteApi/auctionCategory/listCategories?auctionId=${auctionId}`,
        );

        const apiCats = res.data?.data?.data || [];
        setCategories(apiCats.map((c) => ({ id: c._id, name: c.name })));
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, [auctionId]);

  /* ---------- FETCH CATEGORY COUNTS ---------- */

  const fetchCounts = useCallback(async () => {
    if (!selectedCategoryId) {
      setCategoryCounts(null);
      return;
    }

    setCountsLoading(true);
    setCountsError(null);

    try {
      const res = await api.get(
        `/webSiteApi/auctionCategory/getCategoryPlayerCounts/${selectedCategoryId}`,
      );

      const payload = res.data?.data?.data || res.data?.data || res.data;

      // Payload itself is the counts object
      if (payload && typeof payload === "object" && "total" in payload) {
        setCategoryCounts({
          total: Number(payload.total || 0),
          available: Number(payload.available || 0),
          sold: Number(payload.sold || 0),
          unsold: Number(payload.unsold || 0),
        });
      } else {
        setCategoryCounts({ total: 0, available: 0, sold: 0, unsold: 0 });
      }
    } catch (err) {
      console.error("Error fetching counts:", err);
      setCountsError("Failed to load counts");
    } finally {
      setCountsLoading(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    const fetchSearchPlayers = async () => {
      if (!searchPlayerPopup || !selectedCategoryId) {
        setSearchPlayers([]);
        setSearchPlayersTotalPages(1);
        return;
      }

      setSearchPlayersLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          status: selectedStatus,
          search: debouncedSearchParticularPlayer,
        }).toString();

        const res = await api.get(
          `/webSiteApi/auctionCategory/getPlayersByCategory/${selectedCategoryId}?${params}`,
        );

        const payload = res?.data?.data || {};
        setSearchPlayers(payload?.data || []);
        setSearchPlayersTotalPages(payload?.pages || 1);
      } catch (error) {
        console.error("Player search failed:", error);
        setSearchPlayers([]);
        setSearchPlayersTotalPages(1);
      } finally {
        setSearchPlayersLoading(false);
      }
    };

    fetchSearchPlayers();
  }, [
    searchPlayerPopup,
    selectedCategoryId,
    selectedStatus,
    debouncedSearchParticularPlayer,
    page,
    limit,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchParticularPlayer(searchParticularPlayer.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchParticularPlayer]);

  useEffect(() => {
    if (searchPlayerPopup) setSelectedPlayerId(null);
  }, [searchPlayerPopup]);

  /* ========== PRE-POPULATE MODAL WHEN OPENING ========== */
  const getTeamShortName = (name) => {
    if (!name) return "";

    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };
  useEffect(() => {
    if (teamSettingsOpen && teams.length > 0) {
      const mapped = teams.map((t, index) => ({
        teamId: t.teamId,
        teamName: t.teamName,
        teamCustomText: t.teamCustomText || getTeamShortName(t.teamName),
        teamCustomOrder: t.teamCustomOrder || index + 1, // auto order
      }));

      setTeamSettingsList(mapped);
    }
  }, [teamSettingsOpen, teams]);

  // console.log(categoryplayers,"cate")

  /* ---------- SOCKET HANDLER ---------- */

  const auctionStatus = socketData?.auctionStatus;

  const handleSocketData = useCallback(
    (data) => {
      const payload = data?.data || data;
      console.log("Socket payload received:", payload);

      setSocketData(payload);
      setTeams(payload?.teams || []);

      if (payload?.auctionStatus === "ongoing") {
        setAuctionStarted(true);
        setIsPaused(false);
      } else if (payload?.auctionStatus === "paused") {
        setAuctionStarted(true);
        setIsPaused(true);
      } else {
        setAuctionStarted(false);
        setIsPaused(false);
      }

      const bh = payload?.currentPlayer?.bidHistory || [];

      setBiddingHistory(
        bh
          .map((b) => ({
            teamName: b.teamName,
            amount: Number(b.bidAmount ?? b.amount ?? 0),
            time: formatBidTime(b.bidTime || b.createdAt || b.time),
          }))
          .sort((a, c) => c.amount - a.amount)
          .slice(0, 10),
      );

      if (payload?.currentPlayer) {
        setCurrentBid(
          payload.currentPlayer.currentBid ??
            payload.currentPlayer.basePrice ??
            null,
        );

        setCurrentWinnerName(
          payload.currentPlayer.highestBidderName ||
            payload.currentPlayer.highestBidder ||
            null,
        );

        if (payload.currentPlayer.highestBidder) {
          setSelectedTeamId(payload.currentPlayer.highestBidder);
        }
      } else {
        setCurrentBid(null);
        setCurrentWinnerName(null);
        setBiddingHistory([]);
        setSelectedTeamId("");
      }

      // Refresh category counts after player status changes
      fetchCounts();
    },
    [fetchCounts],
  );

  /* ---------- CONNECT SOCKET ---------- */
  const resetLocalAuctionState = () => {
    setAuctionStarted(false);
    setIsPaused(false);
    setDecisionPending(false);
    setAuctionEnded(false);
    setTimeLeft(30);
    setCurrentBid(null);
    setSelectedTeamId("");
    setCurrentWinnerName(null);
    setIsSold(null);
  };

  //   // ---- CATEGORY CHANGE -> load first player via callNext ----
  const handleCategoryChange = (value) => {
    if (!socketInstance || !auctionId) return;

    setSelectedCategoryId(value);
    setHasSelectedCategory(true);
    resetLocalAuctionState();

    socketInstance.emit("callNext", {
      auctionId,
      categoryId: value,
      playerStatus: selectedStatus,
      nextPickMode: nextPlayerPickMode,
    });
  };

  const handleNextPlayer = async () => {
    if (!selectedCategoryId) {
      toast.error("Please select a category first");
      return;
    }
    if (!auctionId) return;

    try {
      const data = {
        categoryId: selectedCategoryId,
        playerStatus: selectedStatus,
        nextPickMode: nextPlayerPickMode,
      };

      await api.post(`/webSiteApi/auction/callNext/${auctionId}`, data);
      resetLocalAuctionState();
    } catch (error) {
      console.error("Next player error", error);
    }
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
  };

  // ---- START / PAUSE / RESUME ----
  const handleStartAuction = async () => {
    try {
      const data = {
        categoryId: selectedCategoryId,
        playerStatus: selectedStatus,
      };

      await api.post(`/webSiteApi/auction/start/${auctionId}`, data);

      setAuctionStarted(true);
    } catch (error) {
      console.error("Start auction error", error);
    }
  };

  const getNextBidPrice = () => {
    if (!currentPlayer) return null;
    return (
      (currentBid ?? currentPlayer.basePrice) +
      (currentPlayer.categoryBiddingIncrement || BID_STEP)
    );
  };

  const nextBidPrice = getNextBidPrice();

  const handlePlayPause = async () => {
    try {
      if (socketData?.auctionStatus === "paused") {
        await api.post(`/webSiteApi/auction/resume/${auctionId}`);
        return;
      }

      if (socketData?.auctionStatus === "ongoing") {
        await api.post(`/webSiteApi/auction/pause/${auctionId}`);
        return;
      }

      handleStartAuction();
    } catch (err) {
      console.error("Pause/Resume failed:", err);
    }
  };

  useEffect(() => {
    if (!auctionId) return;

    const socket = connectAuctionSocket({
      auctionId,
      onSnapshot: handleSocketData,
      onUpdate: handleSocketData,
      onDisconnect: (r) => console.log("Socket disconnected:", r),
      onError: (e) => console.error("Socket error:", e),
    });

    setSocketInstance(socket);

    return () => {
      disconnectSocket();
      setSocketInstance(null);
    };
  }, [auctionId, handleSocketData]);

  /* ---------- TIMER ---------- */

  //   // ---- UNDO MARK (sold/unsold -> bidding) ----
  const handleUndoMark = async () => {
    if (!currentPlayer || !auctionId) return;

    // Only allow undo mark when current player is finalized (sold/unsold)
    if (!["sold", "unsold"].includes(currentPlayer.status)) {
      toast.error(
        "Undo mark is allowed only when the current player is marked SOLD or UNSOLD",
      );
      return;
    }

    try {
      const resp = await api.post(`/webSiteApi/auction/undoMark/${auctionId}`, {
        playerId: currentPlayer.playerId,
      });

      console.log("✅ Undo mark success", resp?.data);
      // UI updates should arrive via socket; clear result state immediately
      setIsSold(null);
      setDecisionPending(false);
      setAuctionStarted(false);
      setAuctionEnded(false);
      // clear sold record if present
      setSoldHistory((prev) =>
        prev.filter((s) => s.playerId !== currentPlayer.playerId),
      );
    } catch (err) {
      console.error("❌ Undo mark failed", err?.response?.data || err);
      toast.error(err?.response?.data?.message || "Failed to undo mark");
    }
  };

  const openUndoConfirm = () => {
    if (!currentPlayer) {
      toast.error("No player selected.");
      return;
    }

    setConfirmState({
      open: true,
      title: "Undo Last Action",
      danger: true, // undo destructive ho sakta hai
      message: `Are you sure you want to undo the ${String(
        currentPlayer.status || "",
      ).toUpperCase()} mark for ${currentPlayer.name}? This will move the player back to bidding.`,
      onConfirm: async () => {
        setConfirmState((p) => ({ ...p, open: false }));
        await handleUndoMark(); // existing undo logic
      },
    });
  };

  useEffect(() => {
    if (!auctionStarted || decisionPending || auctionEnded || isPaused) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setAuctionStarted(false);
          setDecisionPending(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [auctionStarted, decisionPending, auctionEnded, isPaused]);

  const canMarkDecision = !!currentPlayer && currentPlayer.status === "bidding";

  /* ---------- TEAM BID ---------- */

  const handleTeamBid = async (teamId) => {
    if (!currentPlayer || !auctionId) return;

    const increment =
      currentPlayer.categoryBiddingIncrement ||
      currentPlayer.biddingIncrement ||
      BID_STEP;

    try {
      await api.post(`/webSiteApi/auction/placeBid/${auctionId}`, {
        playerId: currentPlayer.playerId,
        teamId,
        // bidAmount: currentBid + increment,
        bidAmount:
          currentPlayer.currentBid === 0
            ? currentPlayer.basePrice
            : currentPlayer.currentBid + increment,
      });

      setSelectedTeamId(teamId);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Bid failed");
    }
  };

  /* ---------- TEAM SETTINGS HANDLER ---------- */
  const handleSaveAllTeams = async () => {
    try {
      await api.put(`/webSiteApi/auction/updateAllTeamSettings/${auctionId}`, {
        teams: teamSettingsList,
      });

      toast.success("All team settings saved!");
      setTeamSettingsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  };

  /* ---------- SOLD / UNSOLD ---------- */

  const handleMarkSold = async () => {
    if (!currentPlayer || !selectedTeamId || !currentBid) return;

    try {
      await api.post(
        `/webSiteApi/auction/playerStatus/${auctionId}/${currentPlayer.playerId}`,
        {
          status: "sold",
          soldTo: selectedTeamId,
          finalPrice: currentBid,
        },
      );

      setFinalPrice(currentBid);
      setIsSold(true);
      setAuctionEnded(true);
    } catch {
      toast.error("Failed to mark sold");
    }
  };

  const handleMarkUnsold = async () => {
    if (!currentPlayer) return;

    try {
      await api.post(
        `/webSiteApi/auction/playerStatus/${auctionId}/${currentPlayer.playerId}`,
        { status: "unsold" },
      );

      setIsSold(false);
    } catch {
      toast.error("Failed to mark unsold");
    }
  };

  const openSoldConfirm = () => {
    if (!currentPlayer || !selectedTeamId || !currentBid) {
      toast.error("No bid found to mark sold.");
      return;
    }

    setConfirmState({
      open: true,
      title: "Confirm Sale",
      danger: false, // SOLD positive action hai
      message: `Are you sure you want to sell ${currentPlayer.name} to ${
        teams.find((t) => t.teamId === selectedTeamId)?.teamName
      } for ${formatMoney(currentBid)}?`,
      onConfirm: async () => {
        setConfirmState((p) => ({ ...p, open: false }));
        await handleMarkSold(); // existing SOLD logic reuse
      },
    });
  };

  //   // ---- UNDO LAST BID ----
  const handleUndoLastBid = async (teamId) => {
    if (!currentPlayer || !auctionId) return;

    try {
      const payload = { playerId: currentPlayer.playerId };
      if (teamId) payload.teamId = teamId;

      const resp = await api.post(
        `/webSiteApi/auction/undoLastBid/${auctionId}`,
        payload,
      );

      if (teamId && selectedTeamId === teamId) setSelectedTeamId("");
    } catch (err) {
      console.error("❌ Undo last bid failed", err?.response?.data || err);
      toast.error(err?.response?.data?.message || "Failed to undo last bid");
    }
  };

  const openUnsoldConfirm = () => {
    setConfirmState({
      open: true,
      danger: true,
      message: `Are you sure you want to mark ${currentPlayer?.name} as UNSOLD?`,
      onConfirm: async () => {
        setConfirmState((p) => ({ ...p, open: false }));
        await handleMarkUnsold();
      },
    });
  };

  const openUndoLastBidConfirm = () => {
    if (!currentBid) {
      toast.error("No bid available to undo.");
      return;
    }

    setConfirmState({
      open: true,
      title: "Undo Last Bid",
      danger: true, // bid undo destructive hai
      message: `Are you sure you want to undo the last bid of ${formatMoney(
        currentBid,
      )}?`,
      onConfirm: async () => {
        setConfirmState((p) => ({ ...p, open: false }));
        await handleUndoLastBid(); // existing logic
      },
    });
  };

  /* ---------- FILTER TEAMS ---------- */

  const filteredTeams = useMemo(() => {
    let data = [...teams];

    // 🔥 SORT BY ORDER
    data.sort((a, b) => {
      const orderA = a.teamCustomOrder ?? 9999;
      const orderB = b.teamCustomOrder ?? 9999;
      return orderA - orderB;
    });

    // 🔍 SEARCH FILTER
    if (teamSearch) {
      const search = teamSearch.toLowerCase();

      data = data.filter(
        (t) =>
          // team name
          t.teamName?.toLowerCase().includes(search) ||
          // custom text (MI, RCB)
          t.teamCustomText?.toLowerCase().includes(search) ||
          // order number (convert to string)
          String(t.teamCustomOrder || "").includes(search),
      );
    }

    return data;
  }, [teamSearch, teams]);

  const buttonText =
    auctionStatus === "paused"
      ? "Resume"
      : auctionStatus === "ongoing"
        ? "Pause"
        : "Start Auction";

  const handleSetCurrentPlayer = async (playerId) => {
    if (!playerId) return;

    try {
      const res = await api.post(
        `/webSiteApi/auction/callPlayer/${auctionId}`,
        { playerId }, // ✅ always send as object
      );

      if (res?.data?.success) {
        // optional: update UI / refetch current player
        toast.success("Player set as current successfully");

        setSearchPlayerPopup(false);
      } else {
        toast.error(res?.data?.message || "Failed to set player");
      }
    } catch (error) {
      console.error("Set current player error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const selectedTeam = teams.find((t) => t.teamId === selectedTeamId);

  const handleSellPlayer = async () => {
    try {
      const payload = {
        playerId: currentPlayer.playerId,
        teamId: selectedTeamId,
        finalPrice: Number(finalPrice),
      };

      const res = await api.post(
        `/webSiteApi/auction/directSell/${auctionId}`,
        payload,
      );

      if (res?.data?.success) {
        toast.success("Player sold successfully");
        setSellPlayerPopup(false);
        setFinalPrice(res.data?.data?.finalPrice || finalPrice);
        setSelectedTeamId("");
        // optional: refetch auction state
      } else {
        toast.error(res?.data?.message || "Failed to sell player");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    let buffer = "";
    let timeout;

    const handleKeyPress = (e) => {
      const tag = document.activeElement.tagName;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;

      if (
        !currentPlayer ||
        currentPlayer.status !== "bidding" ||
        socketData?.auctionStatus !== "ongoing"
      )
        return;

      const key = e.key.toLowerCase();
      if (!/^[a-z0-9]$/.test(key)) return;

      buffer += key;

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const input = buffer;
        buffer = "";

        // Wait for the full sequence, then match once.
        // Numeric keys should match complete order (e.g. 13, 22), not first digit.
        let matchedTeam = null;
        if (/^\d+$/.test(input)) {
          matchedTeam = filteredTeams.find(
            (t) => String(t.teamCustomOrder) === input,
          );
        } else {
          matchedTeam =
            filteredTeams.find(
              (t) => t.teamCustomText?.toLowerCase() === input,
            ) ||
            filteredTeams.find((t) =>
              t.teamCustomText?.toLowerCase().startsWith(input),
            );
        }

        if (matchedTeam) {
          handleTeamBid(matchedTeam.teamId);
        }
      }, 800);
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      clearTimeout(timeout);
    };
  }, [filteredTeams, currentPlayer, socketData]);

  return (
    <div
      ref={auctionRoomRef}
      className={`admin-auction-control bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-2 ${
        isRoomFullscreen
          ? "fixed inset-0 z-[9999] min-h-screen overflow-y-auto"
          : ""
      }`}
    >
      <div className="w-full mx-auto space-y-2">
        {/* <div className="flex justify-center items-center font-bold text-yellow-400">
          ADMIN AUCTION CONTROL
        </div> */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={isRoomFullscreen ? exitFullscreen : enterFullscreen}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:border-[var(--border-primary)] hover:bg-[var(--bg-main)]"
          >
            {isRoomFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
                Minimize
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                Full Screen
              </>
            )}
          </button>
        </div>

        {/* HEADER STATS */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card label="Auction Status">
            <div className="text-sm font-semibold text-emerald-400 capitalize">
              {auctionStatus || "Loading..."}
            </div>
          </Card>

          <Card label="Current Category">
            <div className="text-base font-semibold">
              {categories.find((c) => c.id === selectedCategoryId)?.name ||
                currentPlayer?.categoryName ||
                "-"}
            </div>
          </Card>
          <Card label="Total Teams">
            <div className="text-lg font-bold">{teams?.length || 0}</div>
          </Card>
          <Card label="Current Bid">
            <div className="text-lg font-bold text-sky-400">
              {currentPlayer ? formatMoney(currentPlayer.currentBid) : "—"}
            </div>
          </Card>
          <Card label="Highest Bidder">
            <div className="text-sm font-semibold text-amber-400 truncate">
              {currentPlayer?.highestBidderName || "—"}
            </div>
          </Card>
          {categoryCounts && (
            <Card label="Players">
              {countsLoading ? (
                <span className="text-xs text-slate-400">Loading…</span>
              ) : (
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <div className="text-slate-400">Total</div>
                    <div className="font-semibold text-slate-100">
                      {categoryCounts.total}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Avail</div>
                    <div className="font-semibold text-emerald-400">
                      {categoryCounts.available}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Sold</div>
                    <div className="font-semibold text-amber-400">
                      {categoryCounts.sold}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Unsold</div>
                    <div className="font-semibold text-pink-400">
                      {categoryCounts.unsold}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* MIDDLE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 lg:gap-6">
          {/* LIVE AUCTION */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 flex flex-col gap-4">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-xl">
                  🔥
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-200">
                    LIVE AUCTION
                  </h2>
                  <p className="text-sm text-slate-500">
                    Category wise player bidding
                  </p>
                </div>
              </div>

              {/* Category + Status */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setPage(1);
                    setSelectedCategoryId(e.target.value);
                  }}
                  className="w-full sm:w-auto bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setPage(1);
                    handleStatusChange(e.target.value);
                  }}
                  className="w-full sm:w-auto bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="available">Available</option>
                  <option value="unsold">Unsold</option>
                </select>

                <select
                  value={nextPlayerPickMode}
                  onChange={(e) => setNextPlayerPickMode(e.target.value)}
                  title="How to pick the next player when you press Next Player"
                  className="w-full sm:w-auto bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="sequence">Sequence</option>
                  <option value="random">Random</option>
                </select>

                {selectedCategoryId && !canMarkDecision && (
                  <div className="relative group inline-block">
                    <Eye
                      onClick={() => setSearchPlayerPopup(true)}
                      className="cursor-pointer"
                    />

                    {/* Tooltip */}
                    <span
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
    whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white 
    opacity-0 group-hover:opacity-100 transition"
                    >
                      Search particular player
                    </span>
                  </div>
                )}
              </div>

              {/* Play/Pause */}
              <button
                type="button"
                onClick={handlePlayPause}
                disabled={!selectedCategoryId}
                className={`w-full sm:w-auto px-4 py-2 rounded-full text-sm font-semibold transition ${
                  !selectedCategoryId
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-600"
                }`}
              >
                {buttonText}
              </button>
            </div>

            {/* EMPTY STATES */}
            {!selectedCategoryId && (
              <div className="flex-1 min-h-[160px] flex flex-col items-center justify-center text-slate-400 text-base">
                <div className="text-4xl mb-3">⚙️</div>
                <div className="font-semibold mb-1">No Active Lot</div>
                <p className="text-sm text-slate-500">
                  Select a category to load players.
                </p>
              </div>
            )}

            {!currentPlayer && socketData?.auctionStatus === "ongoing" && (
              <p className="text-slate-400">
                No player available for this category
              </p>
            )}

            {/* ACTIVE PLAYER CARD */}
            {currentPlayer && (
              <>
                <div className="relative grid md:grid-cols-[1.2fr,1fr] gap-4 bg-slate-950/30 rounded-2xl border border-slate-800/80 p-3">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                        {currentPlayer.profilePicture ? (
                          <div className="relative w-full h-full">
                            <img
                              // src={currentPlayer.profilePicture}
                              src={
                                currentPlayer?.profilePicture
                                  ? currentPlayer.profilePicture ===
                                    "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png"
                                    ? profile
                                    : currentPlayer.profilePicture
                                  : profile
                              }
                              alt={currentPlayer.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />

                            {/* Role Badge */}
                            <span
                              className="absolute bottom-2 left-2 right-2 px-3 py-1 rounded-full 
    bg-sky-500/20 border border-sky-500/40 
    text-xs text-red-600 font-semibold backdrop-blur-md"
                            >
                              {currentPlayer?.role?.toUpperCase() || "PLAYER"}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                            No Image
                          </div>
                        )}
                      </div>

                      {currentPlayer.status === "unsold" && (
                        <div className="absolute inset-0 bg-red-600/70 flex items-center justify-center text-white font-bold text-lg rounded-2xl rotate-[-15deg]">
                          UNSOLD
                        </div>
                      )}
                      {currentPlayer.status === "sold" && (
                        <div className="absolute inset-0 bg-green-600/70 flex items-center justify-center text-white font-bold text-lg rounded-2xl rotate-[-15deg]">
                          SOLD
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-semibold text-slate-50">
                          {currentPlayer.name}
                        </h3>
                      </div>

                      <p className="text-sm text-slate-400">
                        Batch{" "}
                        <span className="font-semibold">
                          {currentPlayer.batchId || "-"}
                        </span>
                      </p>

                      <div className="mt-3">
                        <span className="text-xs text-slate-500">
                          Base Price
                        </span>
                        <div className="text-2xl font-bold text-emerald-400">
                          {formatMoney(currentPlayer.basePrice)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CURRENT BID SUMMARY */}
                  <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex flex-col justify-between shadow-sm shadow-amber-100">
                    <div>
                      {currentPlayer.status === "sold" ? (
                        <>
                          <span className="text-xs text-emerald-400 font-semibold">
                            SOLD ✓
                          </span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <div className="text-3xl font-bold text-emerald-400">
                              {formatMoney(finalPrice) ||
                                formatMoney(currentBid)}
                            </div>
                          </div>
                          {currentWinnerName && (
                            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                              <p className="text-xs text-emerald-400 font-semibold mb-1">
                                SOLD TO
                              </p>
                              <p className="text-sm font-bold text-emerald-100">
                                {currentWinnerName}
                              </p>
                            </div>
                          )}
                        </>
                      ) : currentPlayer.status === "unsold" ? (
                        <>
                          <span className="text-xs text-red-400 font-semibold">
                            UNSOLD ✗
                          </span>
                          <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-xs text-red-400 font-semibold">
                              NOT SOLD IN THIS ROUND
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-slate-500">
                            CURRENT BID
                          </span>
                          <div className="text-2xl font-bold text-sky-400 animate-pulse">
                            {formatMoney(currentBid)}
                          </div>
                          {currentWinnerName && (
                            <p className="mt-1 text-sm text-slate-300">
                              Highest bidder:{" "}
                              <span className="font-semibold text-slate-50">
                                {currentWinnerName}
                              </span>
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {selectedTeam && (
                      <div className="mt-4 pt-3 border-t border-slate-800">
                        <p className="text-xs text-slate-500">
                          Last Selected Team
                        </p>
                        <p className="text-sm font-semibold text-slate-100">
                          {selectedTeam.teamName}
                        </p>
                        <p className="text-sm text-slate-400">
                          Remaining Purse:{" "}
                          <span className="text-emerald-400 font-semibold">
                            {formatMoney(selectedTeam.remainingBudget)}
                          </span>
                        </p>
                        {currentPlayer &&
                          currentPlayer.status === "bidding" &&
                          currentBid && (
                            <p className="text-sm text-slate-400 mt-1">
                              If Wins:{" "}
                              <span className="text-amber-400 font-semibold">
                                {formatMoney(
                                  Math.max(
                                    selectedTeam.remainingBudget - currentBid,
                                    0,
                                  ),
                                )}
                              </span>
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                {/* PLACE YOUR BID + controls */}
                <div className="mt-2">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <p className="text-sm text-slate-300 font-medium">
                      PLACE YOUR BID
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      {auctionStarted && !auctionEnded && (
                        <div className="text-sm text-sky-300">
                          Next Bid Price:{" "}
                          <span className="font-semibold">
                            {formatMoney(nextBidPrice)}
                          </span>
                        </div>
                      )}

                      {/* Sold / Unsold / Next buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          // onClick={handleMarkSold}
                          onClick={openSoldConfirm}
                          disabled={!canMarkDecision}
                          className={`px-3 py-2 rounded-full text-xs font-semibold transition 
                            ${
                              !canMarkDecision
                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                : "bg-emerald-500 text-slate-950 hover:bg-emerald-600"
                            }
                          `}
                        >
                          Sold
                        </button>

                        <button
                          type="button"
                          // onClick={handleMarkUnsold}
                          onClick={openUnsoldConfirm}
                          disabled={!canMarkDecision}
                          className={`px-3 py-2 rounded-full text-xs font-semibold transition 
                            ${
                              !canMarkDecision
                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                : "bg-red-500 text-slate-50 hover:bg-red-600"
                            }
                          `}
                        >
                          Unsold
                        </button>

                        <button
                          type="button"
                          onClick={handleNextPlayer}
                          disabled={
                            !currentPlayer ||
                            !["sold", "unsold"].includes(currentPlayer.status)
                          }
                          className={`px-3 py-2 rounded-full text-xs font-semibold transition ${
                            !currentPlayer ||
                            !["sold", "unsold"].includes(currentPlayer.status)
                              ? "bg-slate-700 text-slate-900 cursor-not-allowed"
                              : "bg-slate-200 text-slate-400 hover:bg-white"
                          }`}
                        >
                          Next Player
                        </button>
                        <button
                          type="button"
                          // onClick={() => handleUndoLastBid(selectedTeamId || undefined)}
                          onClick={openUndoLastBidConfirm}
                          disabled={!canMarkDecision}
                          className={`px-3 py-2 rounded-full text-xs font-semibold transition 
                            ${
                              !canMarkDecision
                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                : "bg-amber-500 text-slate-900 hover:bg-amber-600"
                            }
                          `}
                        >
                          Undo Last Bid
                        </button>
                        <button
                          type="button"
                          // onClick={() => handleUndoLastBid(selectedTeamId || undefined)}
                          onClick={() => {
                            setSellPlayerPopup(true);
                          }}
                          // disabled={!canMarkDecision}
                          className={`px-3 py-2 rounded-full text-xs font-semibold transition 
                            ${
                              !canMarkDecision
                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                : "bg-amber-500 text-slate-900 hover:bg-amber-600"
                            }
                          `}
                        >
                          Sell Player Directly
                        </button>
                        <button
                          type="button"
                          // onClick={handleUndoMark}
                          onClick={openUndoConfirm}
                          disabled={
                            !(
                              currentPlayer &&
                              ["sold", "unsold"].includes(currentPlayer.status)
                            )
                          }
                          className={`px-3 py-2 rounded-full text-xs font-semibold transition 
                            ${
                              !(
                                currentPlayer &&
                                ["sold", "unsold"].includes(
                                  currentPlayer.status,
                                )
                              )
                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                : "bg-indigo-500 text-slate-50 hover:bg-indigo-600"
                            }
                          `}
                        >
                          Undo Mark
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result info */}
                {auctionEnded && (
                  <div className="mt-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl px-5 py-4 text-center">
                      {isSold && currentWinnerName && currentBid ? (
                        <>
                          <div className="text-xl font-semibold text-emerald-300 mb-1">
                            🎉 Sold to {currentWinnerName}
                          </div>
                          <p className="text-sm text-emerald-100">
                            {currentPlayer.name} sold for{" "}
                            <span className="font-semibold">
                              {formatMoney(currentBid)}
                            </span>
                            .
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-semibold text-slate-100 mb-1">
                            Player Unsold
                          </div>
                          <p className="text-sm text-slate-300">
                            {currentPlayer.name} remained unsold in this round.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TEAMS GRID – ALWAYS VISIBLE WHEN TEAMS EXIST */}
          </div>
          <div className="space-y-4 relative">
            <div className="bidding-history-panel bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 rounded-2xl p-4 sm:p-5 min-h-[260px] md:h-[400px] flex flex-col shadow-lg overflow-y-auto">
              <div className="bidding-history-header mb-4 sticky top-0 bg-slate-900 z-10 py-2">
                <h3 className="bidding-history-title text-lg font-bold text-slate-100 tracking-wide ">
                  BIDDING HISTORY
                </h3>
              </div>

              <div className="flex-1">
                {biddingHistory.length === 0 ? (
                  <div className="bidding-history-empty h-full flex flex-col items-center justify-center text-slate-400">
                    <div className="text-4xl mb-3 opacity-50">📭</div>
                    <p className="text-sm">No bids yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 h-full overflow-y-auto">
                    {biddingHistory.map((entry, idx) => (
                      <div
                        key={idx}
                        className={`bidding-history-row flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          idx === 0
                            ? "bg-amber-500/20 border border-amber-500/40 ring-2 ring-amber-400/30 animate-pulse shadow-lg shadow-amber-400/20"
                            : "bg-slate-800/50 border border-slate-700/30 hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {idx === 0 && (
                            <span className="text-amber-400 font-bold text-lg">
                              ★
                            </span>
                          )}
                          <span
                            className={`text-sm font-semibold truncate ${
                              idx === 0 ? "text-amber-100" : "text-slate-200"
                            }`}
                          >
                            {/* {entry.teamName} */}

                            {entry.teamName ||
                              (currentPlayer.status === "sold"
                                ? currentPlayer.highestBidderName
                                : "—")}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`font-bold min-w-20 text-right ${
                              idx === 0
                                ? "text-amber-300 text-base"
                                : "text-emerald-400 text-sm"
                            }`}
                          >
                            {formatMoney(entry.amount)}
                          </span>
                          {/* <span className="text-xs text-slate-400 whitespace-nowrap">
                            {entry.time}
                          </span> */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {teams.length > 0 && (
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-4 flex flex-col gap-4 max-h-none lg:max-h-[600px] overflow-visible lg:overflow-y-auto">
            {/* HEADER: Title + Search + Manual Bid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 p-3 bg-slate-800/60 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-1">
                <p className="text-sm font-semibold text-slate-200 self-center">
                  Teams &amp; Purses
                </p>
                <button onClick={() => setTeamSettingsOpen(true)}>
                  <Settings />
                </button>
              </div>

              {teams.length > 4 && (
                <div className="sm:col-span-1">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Search Team
                  </label>
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder="Search team"
                    className="w-full bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              <div className="h-6 w-px bg-slate-600 self-center hidden" />

              <div className="sm:col-span-1">
                <label className="text-xs text-slate-400 mb-1 block">
                  Select Team
                </label>
                <select
                  value={manualBidTeamId}
                  onChange={(e) => setManualBidTeamId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Select Team</option>
                  {teams.map((t) => (
                    <option key={t.teamId} value={t.teamId}>
                      {t.teamName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="text-xs text-slate-400 mb-1 block">
                  Bid Amount (₹)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter amount"
                  value={manualBidAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setManualBidAmount(value);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="button"
                disabled={
                  !manualBidTeamId ||
                  !manualBidAmount ||
                  !currentPlayer ||
                  currentPlayer.status !== "bidding" ||
                  socketData?.auctionStatus !== "ongoing"
                }
                onClick={async () => {
                  if (!currentPlayer || !auctionId) return;
                  try {
                    await api.post(
                      `/webSiteApi/auction/placeBid/${auctionId}`,
                      {
                        playerId: currentPlayer.playerId,
                        teamId: manualBidTeamId,
                        bidAmount: Number(manualBidAmount),
                      },
                    );
                    setSelectedTeamId(manualBidTeamId);
                    setManualBidAmount("");
                    toast.success("Bid placed successfully");
                  } catch (err) {
                    toast.error(err?.response?.data?.message || "Bid failed");
                  }
                }}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold transition self-stretch sm:self-end ${
                  !manualBidTeamId ||
                  !manualBidAmount ||
                  !currentPlayer ||
                  currentPlayer.status !== "bidding" ||
                  socketData?.auctionStatus !== "ongoing"
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-sky-500 text-white hover:bg-sky-600"
                }`}
              >
                Place Bid
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
              {filteredTeams.map((team) => {
                const canBid =
                  socketData?.auctionStatus === "ongoing" &&
                  !!currentPlayer &&
                  currentPlayer.status === "bidding";

                const isSelected = team.teamId === selectedTeamId;
                const isDisabled = !canBid || isSelected;

                const displayBudget = team.remainingBudget;
                const remainingIfWin = (() => {
                  if (!currentPlayer) return null;
                  if (team.teamId !== selectedTeamId) return null;
                  const payAmount = Number(
                    currentBid ?? currentPlayer.basePrice ?? 0,
                  );
                  return Math.max(team.remainingBudget - payAmount, 0);
                })();

                const lockCats = socketData?.categoryBudgetLocks || [];
                const soldMap =
                  socketData?.soldPlayersByTeamCategory?.[
                    String(team.teamId)
                  ] || {};
                const remNum = Number(team.remainingBudget);
                const showLockBidCap =
                  socketData?.auctionStatus === "ongoing" &&
                  currentPlayer?.status === "bidding" &&
                  lockCats.length > 0;

                let maxBidAfterLocks = null;
                let reserveLocked = null;
                if (showLockBidCap && Number.isFinite(remNum)) {
                  const { reserve } = computeCategoryLockReserveForTeam(
                    lockCats,
                    soldMap,
                    {
                      categoryId: currentPlayer?.categoryId || null,
                      consumeSlotFromBidCategory: Boolean(
                        currentPlayer?.categoryId,
                      ),
                    },
                  );
                  reserveLocked = reserve;
                  maxBidAfterLocks = Math.max(0, remNum - reserve);
                }

                return (
                  <button
                    key={team.teamId}
                    disabled={isDisabled}
                    onClick={() => handleTeamBid(team.teamId)}
                    className={`rounded-xl p-3 text-sm border transition 
        ${
          isSelected
            ? "bg-sky-600 border-sky-400"
            : "bg-slate-900 border-slate-700"
        }
        ${isDisabled ? "opacity-70 cursor-not-allowed" : "hover:border-sky-400"}
      `}
                  >
                    <div className="flex flex-col gap-1">
                      {/* TOP ROW → Order + Short Text */}
                      <div className="flex items-center justify-between">
                        {/* Order Badge */}
                        {team.teamCustomOrder && (
                          <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded">
                            #{team.teamCustomOrder}
                          </span>
                        )}

                        {/* Short Text */}
                        <span className="font-bold text-white text-sm">
                          {team.teamCustomText || ""}
                        </span>
                      </div>

                      {/* TEAM NAME (Below) */}
                      <div className="text-xs text-slate-400 truncate">
                        {team.teamName}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      ₹{displayBudget.toLocaleString()}
                      {maxBidAfterLocks !== null && (
                        <div className="text-[11px] text-amber-200/95 mt-1 leading-snug">
                          <span className="text-slate-500">
                            Max bid (after locks):{" "}
                          </span>
                          <span className="font-semibold text-amber-100">
                            ₹{maxBidAfterLocks.toLocaleString()}
                          </span>
                          {reserveLocked > 0 && (
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              Reserved: ₹{reserveLocked.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                      {remainingIfWin !== null &&
                        currentPlayer?.status !== "sold" && (
                          <div className="text-[11px] text-slate-300 mt-1">
                            If wins:{" "}
                            <span className="font-semibold text-emerald-300">
                              ₹{remainingIfWin.toLocaleString()}
                            </span>
                          </div>
                        )}
                    </div>
                  </button>
                );
              })}

              {filteredTeams.length === 0 && (
                <div className="col-span-full text-center text-sm text-slate-400 py-4">
                  No teams found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========== TEAM SETTINGS MODAL ========== */}
      {teamSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setTeamSettingsOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                Team Settings
              </h2>
              <button
                onClick={() => setTeamSettingsOpen(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* LIST */}
            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {teamSettingsList.map((team, index) => (
                <div
                  key={team.teamId}
                  className="grid grid-cols-3 gap-3 bg-slate-800 p-3 rounded-lg"
                >
                  {/* Team Name */}
                  <div className="text-white text-sm font-semibold flex items-center">
                    {team.teamName}
                  </div>

                  {/* Order */}
                  <input
                    type="number"
                    value={team.teamCustomOrder}
                    onChange={(e) => {
                      const updated = [...teamSettingsList];
                      updated[index].teamCustomOrder = e.target.value;
                      setTeamSettingsList(updated);
                    }}
                    className="px-2 py-1 rounded bg-slate-700 text-white text-sm"
                  />

                  {/* Text */}
                  <input
                    type="text"
                    value={team.teamCustomText}
                    onChange={(e) => {
                      const updated = [...teamSettingsList];
                      updated[index].teamCustomText = e.target.value;
                      setTeamSettingsList(updated);
                    }}
                    className="px-2 py-1 rounded bg-slate-700 text-white text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setTeamSettingsOpen(false)}
                className="flex-1 bg-slate-700 text-white py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveAllTeams}
                className="flex-1 bg-sky-500 text-white py-2 rounded-lg"
              >
                Save All
              </button>
            </div>
          </div>
        </div>
      )}
      {searchPlayerPopup &&
        createPortal(
          <div className="fixed inset-0 z-[200000] flex items-center justify-center p-2 sm:p-5">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSearchPlayerPopup(false)}
            />

            {/* Popup */}
            <div className="relative z-10 flex h-[calc(100dvh-16px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:h-auto sm:max-h-[calc(100vh-40px)]">
              {/* Header */}
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-3 py-2 sm:px-5 sm:py-3">
                <h2 className="text-lg font-semibold text-white">
                  Search Player
                </h2>
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
                    <option value={20} className="bg-gray-800">
                      20 per page
                    </option>
                    <option value={50} className="bg-gray-800">
                      50 per page
                    </option>
                    <option value={100} className="bg-gray-800">
                      100 per page
                    </option>
                  </select>
                </div>
                <button
                  onClick={() => setSearchPlayerPopup(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-xl text-slate-400 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid w-full shrink-0 grid-cols-1 gap-2 px-3 pt-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-3 sm:px-5 sm:pt-4">
                {/* Search Input */}
                <div className="relative">
                  <label className="text-sm text-slate-400 mb-1 block">
                    Select Player
                  </label>

                  <Search className="absolute left-3 top-8 w-4 h-4 text-slate-300" />

                  <input
                    type="text"
                    placeholder="Search player..."
                    value={searchParticularPlayer}
                    onChange={(e) => {
                      setPage(1);
                      setSearchParticularPlayer(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">
                    Select Category
                  </label>
                  {/* Category Dropdown */}
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 sm:min-w-48"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 sm:min-w-36"
                  >
                    <option value="available">Available</option>
                    <option value="unsold">Unsold</option>
                  </select>
                </div>
              </div>

              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:min-h-[260px] sm:px-5 sm:py-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {searchPlayersLoading && (
                    <div className="col-span-full text-center text-sm text-slate-300 py-6">
                      Loading players...
                    </div>
                  )}

                  {!searchPlayersLoading && searchPlayers.length === 0 && (
                    <div className="col-span-full text-center text-sm text-slate-400 py-6">
                      No players found.
                    </div>
                  )}

                  {!searchPlayersLoading &&
                    searchPlayers.map((player) => {
                      const isSelected = selectedPlayerId === player.playerId;

                      return (
                        <div
                          key={player.playerId}
                          onClick={() => setSelectedPlayerId(player.playerId)}
                          className={`flex min-h-[145px] cursor-pointer flex-col items-center gap-2 rounded-xl border p-2.5 transition-all
            ${
              isSelected
                ? "border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/40"
                : "border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-600"
            }`}
                        >
                          <div className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-md bg-slate-800 sm:h-20 sm:w-24">
                            <img
                              src={player.logo}
                              alt={player.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <p className="text-sm font-semibold text-slate-200 truncate w-full text-center">
                            {player.name}
                          </p>

                          <p className="text-xs text-amber-300 font-medium uppercase">
                            {player.playerRole || "NA"}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            {player.batchId}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="shrink-0 border-t border-slate-800 bg-slate-950/80 px-3 py-2 sm:px-5 sm:py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-4"
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, searchPlayersTotalPages))].map(
                        (_, idx) => {
                          const pageNum =
                            page <= 3
                              ? idx + 1
                              : page >= searchPlayersTotalPages - 2
                                ? searchPlayersTotalPages - 4 + idx
                                : page - 2 + idx;
                          if (pageNum < 1 || pageNum > searchPlayersTotalPages)
                            return null;

                          return (
                            <button
                              key={idx}
                              onClick={() => setPage(pageNum)}
                              className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors sm:h-10 sm:w-10
                        ${
                          page === pageNum
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-900 text-white"
                        }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <button
                      disabled={page === searchPlayersTotalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-4"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-col gap-2 border-t border-slate-800 bg-slate-900 px-3 py-2 sm:flex-row sm:gap-3 sm:px-5 sm:py-3">
                <button
                  className="flex-1 rounded-xl bg-slate-700 py-2 text-white hover:bg-slate-600"
                  onClick={() => setSearchPlayerPopup(false)}
                >
                  Cancel
                </button>

                <button
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 
  py-2 text-white font-medium disabled:opacity-50"
                  disabled={!selectedPlayerId}
                  onClick={() => {
                    handleSetCurrentPlayer(selectedPlayerId);
                    setSearchPlayerPopup(false);
                  }}
                >
                  Set as Current Player
                </button>
              </div>
            </div>
          </div>,
          isRoomFullscreen && auctionRoomRef.current
            ? auctionRoomRef.current
            : document.body,
        )}

      {sellPlayerPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSellPlayerPopup(false)}
          />

          {/* Popup */}
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-xl p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-white">Sell Player</h2>
              <button
                onClick={() => setSellPlayerPopup(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Player Info */}
            <div className="flex items-center gap-4 mb-5 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <img
                src={currentPlayer?.profilePicture}
                alt={currentPlayer?.name}
                className="w-24 h-24 object-contain bg-slate-800 rounded-lg"
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  {currentPlayer?.name}
                </p>
                <p className="text-xs text-slate-400">
                  Batch Id: {currentPlayer?.batchId}
                </p>
                <p className="text-xs text-slate-400">
                  Base Price: {currentPlayer?.basePrice}
                </p>
                <p className="text-xs text-slate-400">
                  Role: {currentPlayer?.role?.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Team Dropdown */}
            <div className="mb-4">
              <label className="text-sm text-slate-400 mb-1 block">
                Select Team
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option
                    key={team.teamId}
                    value={team.teamId}
                    className="text-white"
                  >
                    {team.teamName}
                  </option>
                ))}
              </select>
            </div>

            {/* Final Price */}
            <div className="mb-6">
              <label className="text-sm text-slate-400 mb-1 block">
                Final Price(₹)
              </label>
              <input
                type="text"
                placeholder="Enter final price"
                value={finalPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setFinalPrice(value);
                }}
                inputMode="numeric"
                className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-white py-2"
                onClick={() => setSellPlayerPopup(false)}
              >
                Cancel
              </button>

              <button
                disabled={!selectedTeamId || !finalPrice}
                className="flex-1 rounded-xl bg-green-600 hover:bg-green-500 text-white py-2 font-medium disabled:opacity-50"
                onClick={handleSellPlayer}
              >
                Sell Player
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        danger={confirmState.danger}
        confirmText={
          confirmState.title === "Undo Last Bid"
            ? "Yes, Undo Bid"
            : confirmState.title === "Undo Last Action"
              ? "Yes, Undo"
              : "Confirm"
        }
        cancelText="Cancel"
        onCancel={() => setConfirmState((p) => ({ ...p, open: false }))}
        onConfirm={confirmState.onConfirm}
      />
    </div>
  );
};

export default AdminAuctionControl;
