import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Palette } from "lucide-react";
import {
  connectAuctionSocket,
  disconnectSocket,
  requestAuctionPlayerStats,
} from "../../../../../utils/SocketClient";
import icon from "../../../../../assets/Images/profile-icon.jpg";
import logo from "/Crickbro_auction_logo.png";
import api from "../../../../../utils/api";

const DUMMY_IMAGE_URL =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

const THEME_ORDER = ["crickbro", "midnight", "daylight", "royale", "velvet"];

const THEMES = {
  crickbro: {
    name: "Crickbro",
    pageBg: "bg-gradient-to-br from-[#0a0a2e] via-[#121252] to-[#0a0a2e]",
    headerBg: "bg-[#121252]/95 border-[#f9a513]/35",
    headerText: "text-[#FFF9EC]",
    accent: "text-[#f9a513]",
    cardBg: "bg-[#151657]/90 border-[#f9a513]/40",
    cardText: "text-[#FFF9EC]",
    muted: "text-[#FFF9EC]/75",
    btn: "bg-[#f9a513] text-[#121252] hover:bg-[#ffc045] border border-[#f9a513]",
    btnGhost: "bg-white/10 text-white border border-white/20 hover:bg-white/15",
    imgRing: "ring-[3px] sm:ring-4 ring-[#f9a513]/80",
    statBox: "bg-black/25 border-[#f9a513]/25",
  },
  midnight: {
    name: "Midnight",
    pageBg: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
    headerBg: "bg-slate-900/90 border-cyan-400/30",
    headerText: "text-white",
    accent: "text-cyan-300",
    cardBg: "bg-slate-800/85 border-cyan-400/35",
    cardText: "text-slate-50",
    muted: "text-slate-300",
    btn: "bg-cyan-500/90 text-slate-950 hover:bg-cyan-400 border border-cyan-300/50",
    btnGhost: "bg-slate-700/80 text-white border border-slate-500/50 hover:bg-slate-600/90",
    imgRing: "ring-[3px] sm:ring-4 ring-cyan-400/60",
    statBox: "bg-slate-900/60 border-cyan-500/25",
  },
  daylight: {
    name: "Daylight",
    pageBg: "bg-gradient-to-br from-slate-100 via-white to-slate-200",
    headerBg: "bg-white/95 border-slate-300/80",
    headerText: "text-slate-900",
    accent: "text-sky-700",
    cardBg: "bg-white/95 border-slate-300/90",
    cardText: "text-slate-900",
    muted: "text-slate-600",
    btn: "bg-sky-600 text-white hover:bg-sky-500 border border-sky-500/60",
    btnGhost: "bg-slate-200/90 text-slate-900 border border-slate-400/60 hover:bg-slate-300/90",
    imgRing: "ring-[3px] sm:ring-4 ring-sky-400/70",
    statBox: "bg-slate-50 border-slate-300/80",
  },
  royale: {
    name: "Royale",
    pageBg: "bg-gradient-to-br from-zinc-950 via-neutral-950 to-black",
    headerBg: "bg-black/92 border-amber-500/45",
    headerText: "text-amber-50",
    accent: "text-amber-400",
    cardBg: "bg-gradient-to-br from-zinc-900/95 to-black/90 border-amber-500/40",
    cardText: "text-amber-50",
    muted: "text-amber-100/70",
    btn: "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400 border border-amber-400/80 font-black shadow-lg shadow-amber-900/40",
    btnGhost: "bg-zinc-800/90 text-amber-100 border border-amber-500/35 hover:bg-zinc-700/95 hover:border-amber-400/50",
    imgRing: "ring-[3px] sm:ring-4 ring-amber-400/75 shadow-[0_0_28px_rgba(251,191,36,0.2)]",
    statBox: "bg-black/50 border-amber-500/30",
  },
  velvet: {
    name: "Velvet",
    pageBg: "bg-gradient-to-br from-[#120618] via-[#1e0b2e] to-[#0a0412]",
    headerBg: "bg-[#16081f]/95 border-fuchsia-500/35",
    headerText: "text-fuchsia-50",
    accent: "text-fuchsia-300",
    cardBg: "bg-gradient-to-br from-[#1a0d24]/95 to-[#0d0612]/92 border-fuchsia-400/35",
    cardText: "text-fuchsia-50",
    muted: "text-fuchsia-200/65",
    btn: "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white hover:from-fuchsia-500 hover:to-violet-500 border border-fuchsia-400/50 shadow-lg shadow-fuchsia-950/50",
    btnGhost: "bg-violet-950/70 text-fuchsia-100 border border-fuchsia-500/30 hover:bg-violet-900/85 hover:border-fuchsia-400/45",
    imgRing: "ring-[3px] sm:ring-4 ring-fuchsia-400/65 shadow-[0_0_26px_rgba(192,38,211,0.25)]",
    statBox: "bg-black/40 border-fuchsia-500/25",
  },
};

const fmt = (v) => {
  if (v === undefined || v === null || v === "") return "—";
  if (typeof v === "number" && !Number.isFinite(v)) return "—";
  return String(v);
};

const pickBatting = (p) => {
  if (!p) return {};
  if (p.playerStats?.batting && typeof p.playerStats.batting === "object") {
    const b = p.playerStats.batting;
    return {
      matches: b.matches,
      innings: b.innings,
      runs: b.runs,
      ballsFaced: b.ballsFaced,
      average: b.average,
      strikeRate: b.strikeRate,
      highest: b.highest,
      fours: b.fours,
      sixes: b.sixes,
      ducks: b.ducks,
    };
  }
  const raw = p.battingStats || p.batting || p.stats?.batting;
  if (raw && typeof raw === "object") return raw;
  return {};
};

const pickBowling = (p) => {
  if (!p) return {};
  if (p.playerStats?.bowling && typeof p.playerStats.bowling === "object") {
    const b = p.playerStats.bowling;
    return {
      matches: b.matches,
      innings: b.innings,
      wickets: b.wickets,
      overs: b.overs,
      maidens: b.maidens,
      runsConceded: b.runsConceded,
      ballsBowled: b.ballsBowled,
      average: b.average,
      economy: b.economy,
      strikeRate: b.strikeRate,
      best: b.best,
    };
  }
  const raw = p.bowlingStats || p.bowling || p.stats?.bowling;
  if (raw && typeof raw === "object") return raw;
  return {};
};

/** One row = batting label+value | bowling label+value — no scroll, large readable type */
const StatMergedGrid = ({ pairs, theme }) => (
  <div
    className={`rounded-2xl border-2 flex-1 min-h-0 min-w-0 flex flex-col p-4 sm:p-5 md:p-6 ${theme.statBox}`}
  >
    <div
      className="grid grid-cols-4 flex-1 min-h-0 gap-x-3 sm:gap-x-5 md:gap-x-6 gap-y-[clamp(6px,1.4vh,14px)] sm:gap-y-3 md:gap-y-4 content-start text-[clamp(0.95rem,min(2.8vmin,3.2vh),1.85rem)] leading-snug"
    >
      <div
        className={`col-span-2 font-black uppercase tracking-wide border-b-2 border-black/20 pb-2 mb-1 text-[clamp(1.05rem,min(3.2vmin,3.6vh),1.95rem)] ${theme.accent}`}
      >
        Batting
      </div>
      <div
        className={`col-span-2 font-black uppercase tracking-wide border-b-2 border-black/20 pb-2 mb-1 text-[clamp(1.05rem,min(3.2vmin,3.6vh),1.95rem)] ${theme.accent}`}
      >
        Bowling
      </div>
      {pairs.map(([left, right], i) => (
        <React.Fragment key={i}>
          <span className={`${theme.muted} font-semibold min-w-0 truncate`}>{left[0]}</span>
          <span
            className={`font-black tabular-nums text-right min-w-0 text-[clamp(1rem,min(3vmin,3.4vh),2rem)] ${theme.cardText}`}
          >
            {fmt(left[1])}
          </span>
          <span className={`${theme.muted} font-semibold min-w-0 truncate`}>{right[0]}</span>
          <span
            className={`font-black tabular-nums text-right min-w-0 text-[clamp(1rem,min(3vmin,3.4vh),2rem)] ${theme.cardText}`}
          >
            {fmt(right[1])}
          </span>
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default function AuctionBroadcastBoardOverlay() {
  const { auctionId } = useParams();
  const [player, setPlayer] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [themeKey, setThemeKey] = useState("crickbro");
  const [showStats, setShowStats] = useState(false);

  const theme = THEMES[themeKey];

  const isDummyImage = (url) => url === DUMMY_IMAGE_URL;

  const formatMoney = (amount) => {
    if (!amount || isNaN(amount)) return "0";
    return amount.toLocaleString("en-IN");
  };

  useEffect(() => {
    const prevBg = document.body.style.background;
    document.body.style.background = "transparent";
    return () => {
      document.body.style.background = prevBg;
    };
  }, []);

  useEffect(() => {
    setShowStats(false);
  }, [player?.playerId]);

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

  const handleSocketData = useCallback((data) => {
    const payload = data?.data || data;
    if (payload?.currentPlayer) {
      setPlayer((prev) => {
        const next = payload.currentPlayer;
        const samePlayer =
          prev &&
          next?.playerId &&
          String(prev.playerId) === String(next.playerId);
        return samePlayer ? { ...next, playerStats: prev.playerStats } : next;
      });
    }
  }, []);

  const handlePlayerStats = useCallback((msg) => {
    if (!msg?.success || !msg.playerId) return;
    setPlayer((prev) => {
      if (!prev || String(prev.playerId) !== String(msg.playerId)) return prev;
      return { ...prev, playerStats: msg.playerStats ?? null };
    });
  }, []);

  useEffect(() => {
    if (!auctionId) return;
    connectAuctionSocket({
      auctionId,
      onSnapshot: handleSocketData,
      onUpdate: handleSocketData,
      onAuctionPlayerStats: handlePlayerStats,
      onError: console.error,
    });
    return () => disconnectSocket();
  }, [auctionId, handleSocketData, handlePlayerStats]);

  useEffect(() => {
    if (!showStats || !auctionId || !player?.playerId) return;
    requestAuctionPlayerStats(auctionId, player.playerId);
  }, [showStats, auctionId, player?.playerId]);

  const cycleTheme = () => {
    const i = THEME_ORDER.indexOf(themeKey);
    setThemeKey(THEME_ORDER[(i + 1) % THEME_ORDER.length]);
  };

  const isPlaceholder = player ? isDummyImage(player.profilePicture) : true;
  const status = (player?.status || "").toLowerCase();
  const isSold = status === "sold";
  const isUnsold = status === "unsold";

  const soldTeamName =
    typeof player?.soldToName === "string" && player.soldToName.trim()
      ? player.soldToName.trim()
      : null;
  const currentBidTeamName =
    typeof player?.highestBidderName === "string" && player.highestBidderName.trim()
      ? player.highestBidderName.trim()
      : null;

  const bat = pickBatting(player || {});
  const bowl = pickBowling(player || {});

  const fourSix =
    bat.fours != null && bat.sixes != null ? `${bat.fours} / ${bat.sixes}` : null;

  /** Bowling column order: Matches, Innings, Wickets, Economy, Best, Overs, Average */
  const mergedStatPairs = [
    [
      ["Matches", bat.matches ?? bat.mat ?? bat.m],
      ["Matches", bowl.matches ?? bowl.mat ?? bowl.m],
    ],
    [
      ["Innings", bat.innings ?? bat.inn],
      ["Innings", bowl.innings ?? bowl.inn],
    ],
    [
      ["Runs", bat.runs ?? bat.run],
      ["Wickets", bowl.wickets ?? bowl.wkts ?? bowl.w],
    ],
    [
      ["Average", bat.average ?? bat.avg],
      ["Economy", bowl.economy ?? bowl.eco],
    ],
    [
      ["Strike rate", bat.strikeRate ?? bat.sr],
      ["Best", bowl.best ?? bowl.bbbi],
    ],
    [
      ["Highest", bat.highest ?? bat.hs ?? bat.highScore],
      ["Overs", bowl.overs ?? bowl.ov],
    ],
    [
      ["4s / 6s", fourSix],
      ["Average", bowl.average ?? bowl.avg],
    ],
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${theme.pageBg} ${theme.headerText} text-[clamp(16px,2vmin,26px)]`}
    >
      <header
        className={`relative z-20 shrink-0 flex items-stretch sm:items-center justify-between gap-2 sm:gap-4 md:gap-6 min-h-0 sm:min-h-[clamp(4.25rem,11vh,7.5rem)] px-3 sm:px-5 md:px-8 py-2.5 sm:py-3 md:py-4 border-b-2 backdrop-blur-md ${theme.headerBg}`}
      >
        <div className="flex items-center justify-start min-w-0 w-[min(30%,9.5rem)] sm:w-[26%] md:w-[28%]">
          {tournament?.logo ? (
            <img
              src={tournament.logo}
              alt=""
              className="h-[clamp(2rem,7vmin,4.5rem)] sm:h-[clamp(2.75rem,8vmin,5.5rem)] md:h-[clamp(3rem,9vmin,6rem)] w-auto max-w-full object-contain object-left"
            />
          ) : (
            <span className={`text-xs sm:text-sm md:text-base font-semibold leading-tight line-clamp-2 ${theme.muted}`}>
              Tournament
            </span>
          )}
        </div>

        <div className="flex flex-1 min-w-0 items-center justify-center px-1 py-1 sm:px-3 md:px-4">
          <h1
            className={`w-full text-center text-[clamp(0.95rem,3.8vmin,1.85rem)] sm:text-[clamp(1.05rem,4vmin,2.35rem)] md:text-[clamp(1.15rem,4.2vmin,2.85rem)] font-black leading-[1.15] tracking-tight break-words [overflow-wrap:anywhere] hyphens-auto line-clamp-3 sm:line-clamp-2 ${theme.headerText}`}
          >
            {tournament?.name || "Live Auction"}
          </h1>
        </div>

        <div className="flex min-w-0 shrink-0 flex-row items-center justify-end gap-1.5 sm:gap-2 md:gap-2.5 w-[min(40%,12rem)] sm:w-[30%] md:w-[30%]">
          <img
            src={logo}
            alt="Crickbro"
            className="h-[clamp(3rem,11vmin,5.25rem)] sm:h-[clamp(3.5rem,12vmin,6.25rem)] md:h-[clamp(4rem,12.5vmin,7.5rem)] lg:h-[clamp(4.25rem,13vmin,8.5rem)] w-auto max-w-[min(92vw,220px)] sm:max-w-[min(48vw,280px)] md:max-w-[min(44vw,340px)] object-contain object-right drop-shadow-md"
          />
          <button
            type="button"
            onClick={cycleTheme}
            title={`${theme.name} — next theme`}
            aria-label={`Change theme, current ${theme.name}`}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md touch-manipulation sm:h-9 sm:w-9 ${theme.btnGhost}`}
          >
            <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row gap-5 sm:gap-7 lg:gap-10 p-4 sm:p-6 md:p-8 lg:p-10">
        {!player ? (
          <div
            className={`flex-1 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-semibold ${theme.muted}`}
          >
            Waiting for current player…
          </div>
        ) : (
          <>
            <div className="shrink-0 lg:w-[46%] xl:w-[44%] flex flex-col items-center justify-center py-2 min-h-0 lg:self-stretch overflow-hidden">
              <div
                className={`relative mx-auto rounded-3xl overflow-hidden shadow-2xl aspect-square w-[min(96vw,min(720px,min(68vh,calc(100dvh-8rem))))] max-w-full ${theme.imgRing}`}
              >
                <img
                  src={isPlaceholder ? icon : player.profilePicture}
                  alt={player.name || ""}
                  className={`h-full w-full object-cover ${
                    isPlaceholder ? "object-contain bg-black/20 p-4 sm:p-6" : ""
                  }`}
                />
                {(isSold || isUnsold) && (
                  <div
                    className="absolute bottom-0 inset-x-0 py-2.5 sm:py-3 px-2 text-center text-sm sm:text-base md:text-lg font-black uppercase tracking-widest text-white"
                    style={{
                      backgroundColor: isSold
                        ? "rgba(16, 185, 129, 0.92)"
                        : "rgba(239, 68, 68, 0.92)",
                    }}
                  >
                    {isSold ? "Sold" : "Unsold"}
                  </div>
                )}
              </div>
            </div>

            <div
              className={`flex-1 min-w-0 min-h-0 flex flex-col rounded-3xl border-2 p-4 sm:p-5 md:p-6 shadow-2xl overflow-hidden ${theme.cardBg}`}
            >
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowStats((s) => !s)}
                  className={`inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-black uppercase tracking-wide transition ${theme.btnGhost}`}
                >
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                  {showStats ? "Details" : "Stats"}
                </button>
              </div>

              <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                  {showStats ? (
                    <motion.div
                      key="stats"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="min-h-0 min-w-0 flex-1 flex flex-col"
                    >
                      <StatMergedGrid pairs={mergedStatPairs} theme={theme} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className={`space-y-3 sm:space-y-4 md:space-y-5 text-[clamp(1rem,2.2vmin,1.35rem)] min-h-0 overflow-hidden ${theme.cardText}`}
                    >
                      <p
                        className={`text-[clamp(1.65rem,5.5vmin,3.5rem)] font-black tracking-tight leading-none ${theme.accent}`}
                      >
                        {player.name || "Player"}
                      </p>
                      <p className={`text-lg sm:text-xl md:text-2xl capitalize font-semibold ${theme.muted}`}>
                        {player.role || "—"}
                      </p>
                      {player.categoryName && (
                        <p className="text-base sm:text-lg md:text-xl">
                          <span className={`${theme.muted} font-medium`}>Category: </span>
                          {player.categoryName}
                        </p>
                      )}
                      {player.batchId && (
                        <p className="text-base sm:text-lg md:text-xl">
                          <span className={`${theme.muted} font-medium`}>Batch: </span>
                          {player.batchId}
                        </p>
                      )}
                      {player.location && (
                        <p className="text-base sm:text-lg md:text-xl">
                          <span className={`${theme.muted} font-medium`}>Location: </span>
                          {player.location}
                        </p>
                      )}
                      <div className="pt-3 sm:pt-4 flex flex-wrap gap-6 sm:gap-10 md:gap-12">
                        <div>
                          <div className={`text-sm sm:text-base uppercase font-bold tracking-wide ${theme.muted}`}>
                            Base price
                          </div>
                          <div className="text-xl sm:text-2xl md:text-3xl font-black mt-1">
                            ₹ {formatMoney(player.basePrice)}
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-sm sm:text-base uppercase font-bold tracking-wide ${theme.muted}`}
                          >
                            {isSold ? "Final price" : "Current bid"}
                          </div>
                          <div className={`text-xl sm:text-2xl md:text-3xl font-black mt-1 ${theme.accent}`}>
                            ₹{" "}
                            {formatMoney(
                              isSold
                                ? player.finalPrice ?? player.currentBid
                                : player.currentBid,
                            )}
                          </div>
                        </div>
                      </div>
                      {isSold && soldTeamName ? (
                        <p className="text-base sm:text-lg md:text-xl font-semibold">
                          <span className={theme.muted}>Sold to: </span>
                          {soldTeamName}
                        </p>
                      ) : !isSold && !isUnsold ? (
                        <p className="text-base sm:text-lg md:text-xl font-semibold">
                          <span className={theme.muted}>Current bid: </span>
                          {currentBidTeamName || "—"}
                        </p>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
