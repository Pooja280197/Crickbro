import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { connectAuctionSocket, disconnectSocket } from "../../../../../utils/SocketClient";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Palette } from "lucide-react";
import { computeCategoryLockReserveForTeam } from "../AuctionBiddingPanel/categoryBudgetLockUtils";
import icon from "../../../../../assets/Images/profile-icon.jpg";
import logo from "/Crickbro_auction_logo.png";
import api from "../../../../../utils/api";

const DUMMY_IMAGE_URL =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

const LOW_BUDGET_THRESHOLD = 0.15; // 15% remaining = low budget

const THEME_ORDER = ["ocean", "daylight", "midnight", "royale", "velvet"];

/* ─────────── Color Themes ─────────── */
const THEMES = {
  ocean: {
    name: "Ocean",
    bg: "from-[#06172d] via-[#0a1929] to-[#06172d]",
    glow1: "bg-cyan-500/22",
    glow2: "bg-blue-600/16",
    card: "from-[#071a30]/95 to-[#0b243f]/92 border-[#1c3e61]/80",
    accent: "text-cyan-300",
    accentBg: "bg-cyan-400/15 border border-cyan-400/35",
    dot: "bg-cyan-400",
    roleText: "text-cyan-200",
    basePrice: "text-emerald-300",
    bidBg: "bg-[#0b243f]/85 border-cyan-400/40",
    bidText: "text-cyan-100",
    bidLabel: "Current Bid",
    imgGlow: "from-cyan-400 via-[#0072ff] to-cyan-300",
    headerBorder: "border-cyan-500/35",
    budgetBar: "from-cyan-400 to-sky-500",
    budgetBarWarn: "from-amber-500 to-orange-400",
    spentText: "text-cyan-200",
    remainText: "text-emerald-300",
    sectionTitle: "text-slate-100",
    topBid: "bg-cyan-500/15 border border-cyan-400/35",
    topBidText: "text-cyan-100",
    metaText: "text-[#f0f8ff]",
    mutedText: "text-slate-200",
    cardSubtle: "text-slate-300",
    toggleBtn: "bg-slate-800/80 border-cyan-500/30 text-white hover:bg-slate-700/90",
    textBase: "text-[#f0f8ff]",
    headingText: "text-white",
    separatorText: "text-slate-400",
    iconBtn: "bg-[#082038]/80 hover:bg-slate-800/90 border-cyan-500/30 text-white",
    imageBorder: "border-cyan-400/45",
    emptyWrap: "bg-slate-800/40 border-cyan-500/25",
    emptyText: "text-slate-200",
    softRow: "bg-slate-700/50",
    statBg: "bg-slate-700/50",
    statLabel: "text-slate-300",
    percentText: "text-cyan-100",
    ifWinLabel: "text-white",
    teamName: "text-white",
    teamMeta: "text-slate-200",
    headerBar: "bg-[#06172d]/92 border-b-2 border-[#1c3e61] backdrop-blur-md",
    headerTitle: "text-[#f0f8ff]",
    headerMuted: "text-[#a9bdd7]",
    headerIconBtn:
      "bg-[rgba(8,32,56,0.72)] hover:bg-[rgba(8,32,56,0.88)] border border-[#1c3e61] text-[#f0f8ff]",
  },
  midnight: {
    name: "Midnight",
    bg: "from-slate-950 via-slate-900 to-slate-950",
    glow1: "bg-cyan-500/18",
    glow2: "bg-indigo-500/14",
    card: "from-slate-800/90 to-slate-900/88 border-slate-500/50",
    accent: "text-cyan-300",
    accentBg: "bg-cyan-400/18 border border-cyan-300/40",
    dot: "bg-cyan-400",
    roleText: "text-cyan-200",
    basePrice: "text-emerald-300",
    bidBg: "bg-slate-800/75 border-cyan-300/45",
    bidText: "text-cyan-200",
    bidLabel: "Current Bid",
    imgGlow: "from-cyan-400 via-sky-400 to-indigo-400",
    headerBorder: "border-cyan-300/35",
    budgetBar: "from-cyan-400 to-sky-400",
    budgetBarWarn: "from-amber-500 to-orange-400",
    spentText: "text-cyan-200",
    remainText: "text-emerald-300",
    sectionTitle: "text-slate-100",
    topBid: "bg-cyan-400/18 border border-cyan-300/40",
    topBidText: "text-cyan-200",
    metaText: "text-white",
    mutedText: "text-slate-100",
    cardSubtle: "text-slate-200",
    toggleBtn: "bg-slate-700/85 border-slate-300/35 text-white hover:bg-slate-600/90",
    textBase: "text-white",
    headingText: "text-white",
    separatorText: "text-slate-300",
    iconBtn: "bg-slate-700/70 hover:bg-slate-600/85 border-slate-300/35 text-white",
    imageBorder: "border-slate-200/35",
    emptyWrap: "bg-slate-700/30 border-slate-300/35",
    emptyText: "text-slate-100",
    softRow: "bg-slate-600/45",
    statBg: "bg-slate-600/45",
    statLabel: "text-slate-100",
    percentText: "text-white",
    ifWinLabel: "text-white",
    teamName: "text-white",
    teamMeta: "text-slate-100",
    headerBar: "bg-slate-900/92 border-b-2 border-cyan-400/30 backdrop-blur-md",
    headerTitle: "text-white",
    headerMuted: "text-slate-400",
    headerIconBtn:
      "bg-slate-700/70 hover:bg-slate-600/85 border border-slate-300/35 text-white",
  },
  daylight: {
    name: "Daylight",
    bg: "from-slate-100 via-white to-slate-100",
    glow1: "bg-sky-300/20",
    glow2: "bg-cyan-300/18",
    card: "from-white to-slate-50 border-slate-300/85",
    accent: "text-sky-700",
    accentBg: "bg-sky-100/70 border border-sky-300/70",
    dot: "bg-sky-500",
    roleText: "text-sky-700",
    basePrice: "text-emerald-700",
    bidBg: "bg-sky-100/90 border-sky-300/85",
    bidText: "text-sky-800",
    bidLabel: "Current Bid",
    imgGlow: "from-sky-300 via-cyan-300 to-blue-300",
    headerBorder: "border-sky-200/75",
    budgetBar: "from-sky-500 to-cyan-500",
    budgetBarWarn: "from-amber-500 to-orange-500",
    spentText: "text-sky-700",
    remainText: "text-emerald-700",
    sectionTitle: "text-slate-600",
    topBid: "bg-sky-100/80 border border-sky-300/80",
    topBidText: "text-sky-800",
    metaText: "text-slate-800",
    mutedText: "text-slate-700",
    cardSubtle: "text-slate-500",
    toggleBtn: "bg-white/95 border-slate-300 text-slate-800 hover:bg-slate-100",
    textBase: "text-slate-900",
    headingText: "text-slate-900",
    separatorText: "text-slate-400",
    iconBtn: "bg-slate-200/70 hover:bg-slate-300/80 border-slate-400/60 text-slate-800",
    imageBorder: "border-slate-300/70",
    emptyWrap: "bg-slate-200/45 border-slate-300/80",
    emptyText: "text-slate-600",
    softRow: "bg-slate-100/80",
    statBg: "bg-slate-100/80",
    statLabel: "text-slate-500",
    percentText: "text-slate-600",
    ifWinLabel: "text-slate-700",
    teamName: "text-slate-800",
    teamMeta: "text-slate-600",
    headerBar: "bg-white/95 border-b-2 border-slate-300/80 backdrop-blur-md",
    headerTitle: "text-slate-900",
    headerMuted: "text-slate-500",
    headerIconBtn:
      "bg-slate-200/70 hover:bg-slate-300/80 border border-slate-400/60 text-slate-800",
  },
  royale: {
    name: "Royale",
    bg: "from-zinc-950 via-neutral-950 to-black",
    glow1: "bg-amber-500/16",
    glow2: "bg-yellow-600/12",
    card: "from-zinc-900/92 to-black/90 border-amber-500/40",
    accent: "text-amber-400",
    accentBg: "bg-amber-500/15 border border-amber-400/40",
    dot: "bg-amber-400",
    roleText: "text-amber-200",
    basePrice: "text-emerald-400",
    bidBg: "bg-zinc-900/80 border-amber-500/35",
    bidText: "text-amber-100",
    bidLabel: "Current Bid",
    imgGlow: "from-amber-400 via-yellow-400 to-orange-300",
    headerBorder: "border-amber-500/40",
    budgetBar: "from-amber-400 to-yellow-500",
    budgetBarWarn: "from-red-500 to-orange-500",
    spentText: "text-amber-200",
    remainText: "text-emerald-400",
    sectionTitle: "text-amber-50",
    topBid: "bg-amber-500/12 border border-amber-400/35",
    topBidText: "text-amber-100",
    metaText: "text-amber-50",
    mutedText: "text-amber-100/80",
    cardSubtle: "text-amber-200/70",
    toggleBtn: "bg-zinc-800/90 border-amber-500/35 text-amber-50 hover:bg-zinc-700/95",
    textBase: "text-amber-50",
    headingText: "text-amber-50",
    separatorText: "text-amber-200/60",
    iconBtn: "bg-zinc-800/80 hover:bg-zinc-700/90 border-amber-500/35 text-amber-50",
    imageBorder: "border-amber-400/50",
    emptyWrap: "bg-zinc-900/50 border-amber-500/30",
    emptyText: "text-amber-100/90",
    softRow: "bg-zinc-800/55",
    statBg: "bg-zinc-800/55",
    statLabel: "text-amber-200/80",
    percentText: "text-amber-100",
    ifWinLabel: "text-amber-50",
    teamName: "text-amber-50",
    teamMeta: "text-amber-100/80",
    headerBar: "bg-black/90 border-b-2 border-amber-500/40 backdrop-blur-md",
    headerTitle: "text-amber-50",
    headerMuted: "text-amber-200/75",
    headerIconBtn:
      "bg-zinc-800/90 hover:bg-zinc-700/95 border border-amber-500/40 text-amber-100",
  },
  velvet: {
    name: "Velvet",
    bg: "from-[#120618] via-[#1e0b2e] to-[#0a0412]",
    glow1: "bg-fuchsia-600/18",
    glow2: "bg-violet-600/14",
    card: "from-[#1a0d24]/95 to-[#0d0612]/92 border-fuchsia-500/35",
    accent: "text-fuchsia-300",
    accentBg: "bg-fuchsia-500/15 border border-fuchsia-400/35",
    dot: "bg-fuchsia-400",
    roleText: "text-fuchsia-200",
    basePrice: "text-emerald-300",
    bidBg: "bg-[#16081f]/85 border-fuchsia-500/35",
    bidText: "text-fuchsia-100",
    bidLabel: "Current Bid",
    imgGlow: "from-fuchsia-500 via-violet-500 to-fuchsia-400",
    headerBorder: "border-fuchsia-500/35",
    budgetBar: "from-fuchsia-500 to-violet-500",
    budgetBarWarn: "from-amber-500 to-orange-400",
    spentText: "text-fuchsia-200",
    remainText: "text-emerald-300",
    sectionTitle: "text-fuchsia-50",
    topBid: "bg-fuchsia-500/12 border border-fuchsia-400/35",
    topBidText: "text-fuchsia-100",
    metaText: "text-fuchsia-50",
    mutedText: "text-fuchsia-200/75",
    cardSubtle: "text-fuchsia-200/65",
    toggleBtn: "bg-violet-950/75 border-fuchsia-500/30 text-fuchsia-50 hover:bg-violet-900/90",
    textBase: "text-fuchsia-50",
    headingText: "text-fuchsia-50",
    separatorText: "text-fuchsia-300/50",
    iconBtn: "bg-violet-950/70 hover:bg-violet-900/85 border-fuchsia-500/30 text-fuchsia-100",
    imageBorder: "border-fuchsia-400/45",
    emptyWrap: "bg-[#16081f]/55 border-fuchsia-500/28",
    emptyText: "text-fuchsia-100/90",
    softRow: "bg-violet-950/50",
    statBg: "bg-violet-950/50",
    statLabel: "text-fuchsia-200/70",
    percentText: "text-fuchsia-100",
    ifWinLabel: "text-fuchsia-50",
    teamName: "text-fuchsia-50",
    teamMeta: "text-fuchsia-200/75",
    headerBar: "bg-[#16081f]/92 border-b-2 border-fuchsia-500/35 backdrop-blur-md",
    headerTitle: "text-fuchsia-50",
    headerMuted: "text-fuchsia-200/70",
    headerIconBtn:
      "bg-violet-950/75 hover:bg-violet-900/90 border border-fuchsia-500/35 text-fuchsia-100",
  },
};

export default function AuctionSplitOverlay() {
  const { auctionId } = useParams();
  const [player, setPlayer] = useState(null);
  const [teams, setTeams] = useState([]);
  const [categoryBudgetLocks, setCategoryBudgetLocks] = useState([]);
  const [soldPlayersByTeamCategory, setSoldPlayersByTeamCategory] = useState({});
  const [auctionStatus, setAuctionStatus] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [bidAnimation, setBidAnimation] = useState(false);
  const [themeKey, setThemeKey] = useState("ocean");
  const [fullScreen, setFullScreen] = useState(false);
  const [tournament, setTournament] = useState(null);
  const theme = THEMES[themeKey];

  const cycleTheme = () => {
    const i = THEME_ORDER.indexOf(themeKey);
    setThemeKey(THEME_ORDER[(i + 1) % THEME_ORDER.length]);
  };

  const isDummyImage = (url) => url === DUMMY_IMAGE_URL;

  const formatMoney = (amount) => {
    if (!amount || isNaN(amount)) return "₹0";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Transparent background for OBS overlay
  useEffect(() => {
    const prevBg = document.body.style.background;
    document.body.style.background = "transparent";
    return () => {
      document.body.style.background = prevBg;
    };
  }, []);

  useEffect(() => {
    if (!auctionId) return;
    const fetchAuction = async () => {
      try {
        const response = await api.get(
          `/webSiteApi/auction/getAuctionById/${auctionId}`,
        );
        if (response.data.success) {
          const auctionData = response.data.data;
          setTournament(auctionData.tournamentId || auctionData.tournament);
        }
      } catch (error) {
        console.error("Error fetching auction:", error);
      }
    };
    fetchAuction();
  }, [auctionId]);

  const handleSocketData = useCallback(
    (data) => {
      const payload = data?.data || data;

      if (payload?.auctionStatus !== undefined && payload?.auctionStatus !== null) {
        setAuctionStatus(payload.auctionStatus);
      }
      if (payload && "categoryBudgetLocks" in payload) {
        setCategoryBudgetLocks(
          Array.isArray(payload.categoryBudgetLocks) ? payload.categoryBudgetLocks : [],
        );
      }
      if (payload && "soldPlayersByTeamCategory" in payload) {
        const s = payload.soldPlayersByTeamCategory;
        setSoldPlayersByTeamCategory(
          s && typeof s === "object" && !Array.isArray(s) ? s : {},
        );
      }

      if (payload?.currentPlayer) {
        if (player?.currentBid !== payload.currentPlayer.currentBid) {
          setBidAnimation(true);
          setTimeout(() => setBidAnimation(false), 800);
        }
        setPlayer(payload.currentPlayer);
        setBidHistory(payload.currentPlayer.bidHistory || []);
      }

      if (payload?.teams) {
        setTeams(payload.teams);
      }
    },
    [player?.currentBid],
  );

  useEffect(() => {
    if (!auctionId) return;
    connectAuctionSocket({
      auctionId,
      onSnapshot: handleSocketData,
      onUpdate: handleSocketData,
      onError: console.error,
    });
    return () => disconnectSocket();
  }, [auctionId, handleSocketData]);

  const isSold = player?.status === "sold";
  const isUnsold = player?.status === "unsold";
  const isPlaceholder = player ? isDummyImage(player.profilePicture) : true;

  const sortedBids = [...bidHistory].sort(
    (a, b) => new Date(b.bidTime) - new Date(a.bidTime),
  );

  const winningTeamId = player?.highestBidder;

  const renderHeader = (includeClose) => (
    <header
      className={`relative z-20 flex shrink-0 items-stretch justify-between gap-2 border-b-2 px-3 py-2.5 backdrop-blur-md sm:items-center sm:gap-4 sm:px-5 sm:py-3 md:gap-6 md:px-8 md:py-4 min-h-0 sm:min-h-[clamp(4.25rem,11vh,7.5rem)] ${theme.headerBar}`}
    >
      <div className="flex w-[min(30%,9.5rem)] min-w-0 items-center justify-start sm:w-[26%] md:w-[28%]">
        {tournament?.logo ? (
          <img
            src={tournament.logo}
            alt=""
            className="h-[clamp(2rem,7vmin,4.5rem)] w-auto max-w-full object-contain object-left sm:h-[clamp(2.75rem,8vmin,5.5rem)] md:h-[clamp(3rem,9vmin,6rem)]"
          />
        ) : (
          <span
            className={`line-clamp-2 text-xs font-semibold leading-tight sm:text-sm md:text-base ${theme.headerMuted}`}
          >
            Tournament
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center px-1 py-1 sm:px-3 md:px-4">
        <h1
          className={`w-full hyphens-auto text-center text-[clamp(0.95rem,3.8vmin,1.85rem)] font-black leading-[1.15] tracking-tight break-words [overflow-wrap:anywhere] line-clamp-3 sm:text-[clamp(1.05rem,4vmin,2.35rem)] sm:line-clamp-2 md:text-[clamp(1.15rem,4.2vmin,2.85rem)] ${theme.headerTitle}`}
        >
          {tournament?.name || "Live Auction"}
        </h1>
      </div>

      <div className="flex w-[min(40%,12rem)] min-w-0 shrink-0 flex-row items-center justify-end gap-1.5 sm:w-[30%] sm:gap-2 md:w-[30%] md:gap-2.5">
        <img
          src={logo}
          alt="Crickbro"
          className="h-[clamp(3rem,11vmin,5.25rem)] w-auto max-w-[min(92vw,220px)] object-contain object-right drop-shadow-md sm:h-[clamp(3.5rem,12vmin,6.25rem)] sm:max-w-[min(48vw,280px)] md:h-[clamp(4rem,12.5vmin,7.5rem)] md:max-w-[min(44vw,340px)] lg:h-[clamp(4.25rem,13vmin,8.5rem)]"
        />
        <button
          type="button"
          onClick={cycleTheme}
          title={`${theme.name} — next theme`}
          aria-label={`Change theme, current ${theme.name}`}
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md touch-manipulation sm:h-9 sm:w-9 ${theme.headerIconBtn}`}
        >
          <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
        </button>
        {includeClose && (
          <button
            type="button"
            onClick={() => setFullScreen(false)}
            aria-label="Close fullscreen"
            title="Close"
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md touch-manipulation sm:h-9 sm:w-9 ${theme.headerIconBtn}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );

  return (
    <div className="fixed inset-0 z-10 flex h-dvh max-h-dvh w-full flex-col overflow-hidden overscroll-none">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg}`} />
      {/* Background glow effects */}
      <div className={`pointer-events-none absolute left-1/4 top-0 h-96 w-96 ${theme.glow1} rounded-full blur-[120px]`} />
      <div className={`pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 ${theme.glow2} rounded-full blur-[120px]`} />

      {renderHeader(false)}

      {/* Main Split Layout */}
      <div className={`relative z-10 flex min-h-0 flex-1 gap-3 px-3 pb-3 pt-2 sm:gap-4 sm:px-4 sm:pb-4 ${theme.textBase}`}>
        {/* ═══════════ LEFT: Current Player & Bid ═══════════ */}
        <div className="flex w-[45%] flex-col gap-3 sm:gap-4">
          {player ? (
            <>
              {/* Player Card */}
              <div className={`relative justify-center flex-1 bg-gradient-to-br ${theme.card} backdrop-blur-sm rounded-2xl border p-4 flex overflow-y-auto scrollbar-hide`}>
                {/* Fullscreen toggle */}
                <button
                  onClick={() => setFullScreen(true)}
                  title="View Fullscreen"
                  className={`absolute top-4 left-4 z-20 w-8 h-8 flex items-center justify-center rounded-lg border transition-all hover:scale-110 ${theme.iconBtn}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                </button>

                {/* Status badge */}
                {(isSold || isUnsold) && (
                  <div className="absolute top-4 right-4 z-20">
                    <div
                      className={`px-4 py-1.5 text-sm font-extrabold uppercase tracking-wider rounded-lg border-2 ${
                        isSold
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-400"
                          : "bg-red-500/20 border-red-400 text-red-400"
                      }`}
                    >
                      {isSold ? "SOLD" : "UNSOLD"}
                    </div>
                  </div>
                )}

                <div className="w-full h-full flex items-center gap-5">
                  {/* Player Image */}
                  <div className="w-[42%] min-w-[220px] flex items-center justify-center">
                    <div className="relative w-full max-w-[260px]">
                      <div className={`absolute -inset-3 bg-gradient-to-r ${theme.imgGlow} rounded-2xl blur-lg opacity-30 animate-pulse`} />
                      <div className={`relative aspect-square rounded-2xl overflow-hidden border-2 ${theme.imageBorder}`}>
                        <img
                          src={isPlaceholder ? icon : player.profilePicture}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Player Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h2 className={`text-3xl font-black uppercase tracking-wide mb-1 drop-shadow-lg leading-tight ${theme.headingText}`}>
                      {player.name}
                    </h2>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-base font-semibold ${theme.roleText} capitalize`}>
                        {player.role}
                      </span>
                      {player.categoryName && (
                        <>
                          <span className={theme.separatorText}>•</span>
                          <span className={`text-base font-semibold ${theme.roleText}`}>
                            {player.categoryName}
                          </span>
                        </>
                      )}
                    </div>

                    <div className={`text-sm mb-2 font-medium ${theme.mutedText}`}>
                      Batch Id:{" "}
                      <span className={`font-semibold ${theme.metaText}`}>{player.batchId || "-"}</span>
                    </div>

                    <div className={`text-sm mb-2 font-medium ${theme.mutedText}`}>
                      Location:{" "}
                      <span className={`font-semibold ${theme.metaText}`}>{player.location || player.city || "-"}</span>
                    </div>

                    {/* Base Price */}
                    <div className={`text-base mb-2 font-medium ${theme.metaText}`}>
                      Base Price:{" "}
                      <span className={`${theme.basePrice} font-bold text-xl`}>
                        {formatMoney(player.basePrice)}
                      </span>
                    </div>

                    {/* Current Bid / Sold Info */}
                    <motion.div
                      animate={bidAnimation ? { scale: [1, 1.12, 1], y: [0, -5, 0] } : {}}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`w-full rounded-xl p-3 border relative overflow-hidden ${
                        isSold
                          ? "bg-emerald-500/15 border-emerald-500/40"
                          : isUnsold
                            ? "bg-red-500/15 border-red-500/40"
                            : theme.bidBg
                      }`}
                    >
                      {/* Shimmer on bid */}
                      {bidAnimation && (
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "200%" }}
                          transition={{ duration: 0.7, ease: "easeInOut" }}
                          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none"
                        />
                      )}
                      <p className={`text-[11px] leading-5 uppercase tracking-[0.22em] mb-1 font-semibold ${theme.mutedText}`}>
                        {isSold
                          ? "Final Price"
                          : isUnsold
                            ? "Not Sold"
                            : "Current Bid"}
                      </p>
                      <p
                        className={`text-4xl font-black drop-shadow-md leading-none ${
                          isSold
                            ? "text-emerald-400"
                            : isUnsold
                              ? "text-red-400"
                              : theme.bidText
                        }`}
                      >
                        {formatMoney(
                          isSold ? player.finalPrice : player.currentBid,
                        )}
                      </p>
                      {/* Sold To — inline */}
                      {isSold && player.highestBidderName && (
                        <p className="mt-1.5 text-sm text-emerald-400/80 font-semibold">
                          Sold to <span className="text-emerald-400 font-black">{player.highestBidderName}</span>
                        </p>
                      )}
                    </motion.div>

                    {/* Highest Bidder (during bidding only) */}
                    {player.highestBidderName && !isUnsold && !isSold && (
                      <div className="mt-2 text-base">
                        <span className={`font-medium ${theme.metaText}`}>Highest Bidder: </span>
                        <span className={`${theme.accent} font-bold text-xl`}>
                          {player.highestBidderName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Bids */}
              {sortedBids.length > 0 && (
                <div className={`bg-gradient-to-br ${theme.card} backdrop-blur-sm rounded-2xl border p-4`}>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${theme.cardSubtle}`}>
                    Recent Bids
                  </h3>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto scrollbar-hide">
                    {sortedBids.slice(0, 5).map((bid, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                          i === 0
                            ? theme.topBid
                            : theme.softRow
                        }`}
                      >
                        <span
                          className={`font-semibold ${i === 0 ? theme.topBidText : theme.metaText}`}
                        >
                          {bid.teamName}
                        </span>
                        <span
                          className={`font-bold ${i === 0 ? theme.topBidText : theme.mutedText}`}
                        >
                          {formatMoney(bid.bidAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={`flex-1 flex items-center justify-center rounded-2xl border ${theme.emptyWrap}`}>
              <div className={`text-center ${theme.emptyText}`}>
                <div className="text-4xl mb-3">🏏</div>
                <p className="text-lg font-semibold">Waiting for player...</p>
                <p className="text-sm mt-1">
                  Auction will appear here when started
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ RIGHT: Team Purse Status ═══════════ */}
        <div className="w-[55%] flex flex-col">
          {/* <h3 className={`text-sm font-bold uppercase tracking-widest ${theme.sectionTitle} mb-3 px-1`}>
            Team Purse Status
          </h3> */}

          {teams.length > 0 ? (
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                  {[...teams]
                    .sort((a, b) => {
                      const aIsWinner = (a.teamId === winningTeamId || a._id === winningTeamId) ? 1 : 0;
                      const bIsWinner = (b.teamId === winningTeamId || b._id === winningTeamId) ? 1 : 0;
                      return bIsWinner - aIsWinner;
                    })
                    .map((team, index) => {
                    const initial = team.initialBudget || 0;
                    const remaining = team.remainingBudget || 0;
                    const spent = initial - remaining;
                    const usedPercent = initial
                      ? (spent / initial) * 100
                      : 0;
                    const remainPercent = initial
                      ? (remaining / initial) * 100
                      : 100;
                    const isLowBudget =
                      initial > 0 && remainPercent / 100 <= LOW_BUDGET_THRESHOLD;
                    const isWinner =
                      team.teamId === winningTeamId ||
                      team._id === winningTeamId;
                    const playerCount = team.currentSquadSize || 0;
                    const currentBid = player?.currentBid || 0;
                    const afterWinRemaining = remaining - currentBid;
                    const isBidding = player && !isSold && !isUnsold && currentBid > 0;
                    const canAfford = afterWinRemaining >= 0;

                    const teamKey = String(team.teamId ?? team._id ?? "");
                    const soldMap = (teamKey && soldPlayersByTeamCategory[teamKey]) || {};
                    const useLiveLockCap =
                      auctionStatus === "ongoing" &&
                      player?.status === "bidding" &&
                      categoryBudgetLocks.length > 0;
                    const remNum = Number(remaining);
                    let lockReserve = null;
                    let lockSpendable = null;
                    if (categoryBudgetLocks.length > 0 && Number.isFinite(remNum)) {
                      const { reserve } = computeCategoryLockReserveForTeam(
                        categoryBudgetLocks,
                        soldMap,
                        useLiveLockCap
                          ? {
                              categoryId: player?.categoryId || null,
                              consumeSlotFromBidCategory: Boolean(player?.categoryId),
                            }
                          : { categoryId: null, consumeSlotFromBidCategory: false },
                      );
                      lockReserve = reserve;
                      lockSpendable = Math.max(0, remNum - reserve);
                    }

                    return (
                      <motion.div
                        key={team._id || team.teamId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative rounded-xl border p-4 transition-all duration-300 ${
                          isWinner ? "col-span-2" : ""
                        } ${
                          isWinner
                            ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            : isLowBudget
                              ? "bg-gradient-to-br from-red-500/10 to-red-900/10 border-red-500/40"
                              : `bg-gradient-to-br ${theme.card}`
                        }`}
                      >
                        {/* Winner badge */}
                        {isWinner && isSold && (
                          <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                            WON
                          </div>
                        )}
                        {isWinner && !isSold && !isUnsold && (
                          <div className="absolute -top-2 -right-2">
                            <div className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                              BIDDING
                            </div>
                          </div>
                        )}

                        {/* Low budget warning */}
                        {isLowBudget && !isWinner && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                            LOW
                          </div>
                        )}

                        {/* Team Name */}
                        <div className="flex items-center justify-between mb-3">
                          <h4
                            className={`text-sm font-bold truncate pr-2 ${
                              isWinner
                                ? "text-amber-400"
                                : isLowBudget
                                  ? "text-red-400"
                                  : theme.teamName
                            }`}
                          >
                            {team.teamName}
                          </h4>
                          <span className={`text-xs flex items-center gap-1 flex-shrink-0 ${theme.teamMeta}`}>
                            👥 {playerCount}
                          </span>
                        </div>

                        {/* Won player info */}
                        {isWinner && isSold && player && (
                          <div className="mb-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
                            <span className="text-lg">🏆</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-emerald-400 font-bold truncate">
                                Won: {player.name}
                              </p>
                              <p className="text-[10px] text-emerald-300 font-semibold">
                                {formatMoney(player.finalPrice)}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Budget Bar */}
                        <div className="mb-3">
                          <div className={`h-2 rounded-full overflow-hidden ${theme.softRow}`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(usedPercent, 100)}%`,
                              }}
                              transition={{
                                delay: index * 0.05 + 0.2,
                                duration: 0.8,
                              }}
                              className={`h-full rounded-full ${
                                isLowBudget
                                  ? "bg-gradient-to-r from-red-500 to-red-400"
                                  : usedPercent > 70
                                    ? `bg-gradient-to-r ${theme.budgetBarWarn}`
                                    : `bg-gradient-to-r ${theme.budgetBar}`
                              }`}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className={`text-[10px] ${theme.statLabel}`}>
                              {usedPercent.toFixed(0)}% used
                            </span>
                            <span
                              className={`text-[10px] font-semibold ${
                                isLowBudget ? "text-red-500" : theme.percentText
                              }`}
                            >
                              {remainPercent.toFixed(0)}% left
                            </span>
                          </div>
                        </div>

                        {/* Budget Numbers */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`text-center rounded-lg py-1.5 ${theme.statBg}`}>
                            <p className={`text-[10px] uppercase ${theme.statLabel}`}>
                              Spent
                            </p>
                            <p className={`text-xs font-bold ${theme.spentText}`}>
                              {formatMoney(spent)}
                            </p>
                          </div>
                          <div
                            className={`text-center rounded-lg py-1.5 ${
                              isLowBudget
                                ? "bg-red-500/15"
                                : theme.statBg
                            }`}
                          >
                            <p className={`text-[10px] uppercase ${theme.statLabel}`}>
                              Remaining
                            </p>
                            <p
                              className={`text-xs font-bold ${
                                isLowBudget
                                  ? "text-red-400"
                                  : theme.remainText
                              }`}
                            >
                              {formatMoney(remaining)}
                            </p>
                          </div>
                        </div>

                        {categoryBudgetLocks.length > 0 && lockSpendable != null && (
                          <div
                            className={`mt-2 rounded-lg border px-2 py-1.5 ${
                              isWinner
                                ? "border-amber-400/45 bg-amber-500/12"
                                : isLowBudget
                                  ? "border-orange-500/40 bg-orange-500/10"
                                  : "border-amber-500/35 bg-amber-500/10"
                            }`}
                          >
                            <div
                              className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide mb-0.5 ${theme.ifWinLabel}`}
                            >
                              <Lock className="w-3 h-3 shrink-0 opacity-90" aria-hidden />
                              Category locks
                            </div>
                            {lockReserve > 0 ? (
                              <p className={`text-[10px] leading-snug ${theme.cardSubtle}`}>
                                <span className={theme.statLabel}>Reserved </span>
                                <span className={`font-semibold ${theme.accent}`}>
                                  {formatMoney(lockReserve)}
                                </span>
                              </p>
                            ) : (
                              <p className={`text-[10px] ${theme.cardSubtle}`}>
                                No purse reserved for open slots
                              </p>
                            )}
                            <p className={`text-[10px] leading-snug mt-0.5 ${theme.cardSubtle}`}>
                              <span className={theme.statLabel}>Spendable </span>
                              <span className={`font-semibold ${theme.remainText}`}>
                                {formatMoney(lockSpendable)}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* If Win: remaining after current bid */}
                        {isBidding && (
                          <div className={`mt-2 rounded-lg px-3 py-1.5 flex items-center justify-between ${
                            canAfford
                              ? theme.accentBg
                              : "bg-red-500/15 border border-red-500/30"
                          }`}>
                            <span className={`text-[10px] uppercase font-semibold ${theme.ifWinLabel}`}>If Win</span>
                            <span className={`text-xs font-bold ${
                              canAfford ? theme.accent : "text-red-400"
                            }`}>
                              {canAfford ? formatMoney(afterWinRemaining) : "❌ Over Budget"}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className={`flex-1 flex items-center justify-center rounded-2xl border ${theme.emptyWrap}`}>
              <div className={`text-center ${theme.emptyText}`}>
                <p className="text-lg font-semibold">No teams data</p>
                <p className="text-sm mt-1">
                  Teams will appear when auction starts
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ FULLSCREEN PLAYER VIEW ═══════════ */}
      <AnimatePresence>
        {fullScreen && player && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-[100] flex flex-col overflow-hidden bg-gradient-to-br ${theme.bg}`}
          >
            {renderHeader(true)}

            <div className={`relative flex min-h-0 flex-1 flex-row overflow-hidden ${theme.textBase}`}>
            {/* Glow effects */}
            <div className={`pointer-events-none absolute left-1/4 top-1/4 h-[500px] w-[500px] ${theme.glow1} rounded-full blur-[150px]`} />
            <div className={`pointer-events-none absolute bottom-1/4 right-1/4 h-[500px] w-[500px] ${theme.glow2} rounded-full blur-[150px]`} />

            {/* Bid Flash Effect */}
            <AnimatePresence>
              {bidAnimation && (
                <>
                  <motion.div
                    initial={{ opacity: 0.8, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center z-[105] pointer-events-none"
                  >
                    <div className={`w-64 h-64 rounded-full bg-gradient-to-r ${theme.imgGlow} opacity-40 blur-xl`} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-white/10 z-[104] pointer-events-none"
                  />
                </>
              )}
            </AnimatePresence>

            {/* LEFT: Full Player Image */}
            <div className="w-1/2 h-full flex items-center justify-center p-8 relative">
              <div className="relative">
                <div className={`absolute -inset-8 bg-gradient-to-r ${theme.imgGlow} rounded-[2rem] blur-3xl opacity-30 animate-pulse`} />
                <div className={`relative w-[420px] h-[420px] rounded-[2rem] overflow-hidden border-2 shadow-2xl ${theme.imageBorder}`}>
                  <img
                    src={isPlaceholder ? icon : player.profilePicture}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Status badge on image */}
              {(isSold || isUnsold) && (
                <div className="absolute top-8 left-8 z-10">
                  <div
                    className={`px-6 py-2 text-lg font-extrabold uppercase tracking-widest rounded-xl border-2 ${
                      isSold
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-400"
                        : "bg-red-500/20 border-red-400 text-red-400"
                    }`}
                  >
                    {isSold ? "SOLD" : "UNSOLD"}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Player Details */}
            <div className="w-1/2 h-full min-h-0 flex flex-col px-8 py-6 overflow-hidden">
              <div className="flex-shrink-0">
                {/* Player Name */}
                <h1 className={`text-4xl leading-tight font-black uppercase tracking-wider drop-shadow-xl mb-1 ${theme.headingText}`}>
                  {player.name}
                </h1>

                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-lg font-semibold ${theme.roleText} capitalize`}>
                    {player.role}
                  </span>
                  {player.categoryName && (
                    <>
                      <span className={theme.separatorText}>•</span>
                      <span className={`text-lg font-semibold ${theme.roleText}`}>
                        {player.categoryName}
                      </span>
                    </>
                  )}
                </div>

                <div className={`text-base mb-1 font-medium ${theme.mutedText}`}>
                  Batch Id:{" "}
                  <span className={`font-semibold ${theme.metaText}`}>{player.batchId || "-"}</span>
                </div>

                <div className={`text-base mb-1 font-medium ${theme.mutedText}`}>
                  Location:{" "}
                  <span className={`font-semibold ${theme.metaText}`}>{player.location || player.city || "-"}</span>
                </div>

                {/* Base Price */}
                <div className={`text-base mb-2 font-medium ${theme.metaText}`}>
                  Base Price:{" "}
                  <span className={`${theme.basePrice} font-bold text-xl`}>
                    {formatMoney(player.basePrice)}
                  </span>
                </div>

                {/* Current Bid / Final Price */}
                <motion.div
                  animate={bidAnimation ? { scale: [1, 1.15, 1], y: [0, -8, 0] } : {}}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`rounded-2xl px-8 py-6 border-2 mb-2 max-w-md min-h-[148px] relative overflow-hidden flex flex-col justify-center ${
                    isSold
                      ? "bg-emerald-500/15 border-emerald-500/40"
                      : isUnsold
                        ? "bg-red-500/15 border-red-500/40"
                        : theme.bidBg
                  }`}
                >
                {/* New Bid flash badge */}
                <AnimatePresence>
                  {bidAnimation && !isSold && !isUnsold && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-3 right-3"
                    >
                      <span className="px-3 py-1 bg-amber-500 text-black text-xs font-black rounded-full animate-pulse shadow-lg">
                        NEW BID!
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Shimmer on bid */}
                {bidAnimation && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
                  />
                )}
                <p className={`text-sm leading-7 uppercase tracking-[0.14em] mb-2 font-semibold pr-24 ${theme.mutedText}`}>
                  {isSold ? "Final Price" : isUnsold ? "Not Sold" : "Current Bid"}
                </p>
                <p
                  className={`text-5xl leading-tight font-black drop-shadow-lg ${
                    isSold
                      ? "text-emerald-400"
                      : isUnsold
                        ? "text-red-400"
                        : theme.bidText
                  }`}
                >
                  {formatMoney(isSold ? player.finalPrice : player.currentBid)}
                </p>
                {/* Sold To — inside same card */}
                {isSold && player.highestBidderName && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/30">
                    <p className="text-xs uppercase tracking-widest text-emerald-400/80 font-semibold">Sold To</p>
                    <p className="text-3xl font-black text-emerald-400 drop-shadow-lg">
                      {player.highestBidderName}
                    </p>
                  </div>
                )}
                </motion.div>

                {/* Highest Bidder (during bidding only) */}
                {player.highestBidderName && !isUnsold && !isSold && (
                  <motion.div
                    animate={bidAnimation ? { scale: [1, 1.1, 1], opacity: [0.5, 1] } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-base mb-1"
                  >
                    <span className={`font-medium ${theme.metaText}`}>Highest Bidder: </span>
                    <span className={`${theme.accent} font-bold text-2xl`}>
                      {player.highestBidderName}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Recent Bids in fullscreen */}
              {sortedBids.length > 0 && (
                <div className={`mt-3 flex-1 min-h-0 bg-gradient-to-br ${theme.card} backdrop-blur-sm rounded-xl border p-4 max-w-md`}>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${theme.cardSubtle}`}>
                    Recent Bids
                  </h3>
                  <div className="space-y-2 h-[calc(100%-28px)] overflow-y-auto scrollbar-hide pr-1">
                    {sortedBids.slice(0, 4).map((bid, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                          i === 0 ? theme.topBid : theme.softRow
                        }`}
                      >
                        <span className={`font-semibold ${i === 0 ? theme.topBidText : theme.metaText}`}>
                          {bid.teamName}
                        </span>
                        <span className={`font-bold ${i === 0 ? theme.topBidText : theme.mutedText}`}>
                          {formatMoney(bid.bidAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
