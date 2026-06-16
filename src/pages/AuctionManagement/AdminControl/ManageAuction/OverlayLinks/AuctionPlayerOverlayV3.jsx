import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { connectAuctionSocket, disconnectSocket } from "../../../../../utils/SocketClient";
import { AnimatePresence, motion } from "framer-motion";
import { Palette } from "lucide-react";
import icon from "../../../../../assets/Images/profile-icon.jpg";
import logo from "/Crickbro_auction_logo.png";
import api from "../../../../../utils/api";

const THEME_ORDER = ["ocean", "daylight", "midnight", "royale", "velvet"];

/** Visual tokens shared across layout (gradient, header, cards, avatar ring glow) */
const THEMES = {
  ocean: {
    label: "Ocean",
    isLight: false,
    bgPrimary: "#06172d",
    bgSecondary: "#071a30",
    text: "#f0f8ff",
    textMuted: "#a9bdd7",
    card: "#071a30",
    cardAlt: "#0b243f",
    accent: "#00c6ff",
    panelBorder: "#1c3e61",
    bidValue: "#ffea00",
    badgeBg: "rgba(8, 32, 56, 0.72)",
    headerBg: "rgba(6, 23, 45, 0.92)",
    glowFrom: "#00c6ff",
    glowVia: "#0072ff",
    glowTo: "#00f5ff",
  },
  daylight: {
    label: "Daylight",
    isLight: true,
    bgPrimary: "#e7f0ff",
    bgSecondary: "#cfdefa",
    text: "#081a37",
    textMuted: "#2f4d78",
    card: "#ffffff",
    cardAlt: "#edf4ff",
    accent: "#005ce6",
    panelBorder: "#8faad3",
    bidValue: "#003d99",
    badgeBg: "rgba(255, 255, 255, 0.96)",
    headerBg: "rgba(255, 255, 255, 0.95)",
    glowFrom: "#38bdf8",
    glowVia: "#0ea5e9",
    glowTo: "#7dd3fc",
  },
  midnight: {
    label: "Midnight",
    isLight: false,
    bgPrimary: "#020617",
    bgSecondary: "#0f172a",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    card: "#1e293b",
    cardAlt: "#0f172a",
    accent: "#22d3ee",
    panelBorder: "rgba(34, 211, 238, 0.38)",
    bidValue: "#67e8f9",
    badgeBg: "rgba(15, 23, 42, 0.88)",
    headerBg: "rgba(15, 23, 42, 0.92)",
    glowFrom: "#06b6d4",
    glowVia: "#0891b2",
    glowTo: "#22d3ee",
  },
  royale: {
    label: "Royale",
    isLight: false,
    bgPrimary: "#09090b",
    bgSecondary: "#18181b",
    text: "#fffbeb",
    textMuted: "#d4d4d8",
    card: "#27272a",
    cardAlt: "#18181b",
    accent: "#fbbf24",
    panelBorder: "rgba(245, 158, 11, 0.42)",
    bidValue: "#fcd34d",
    badgeBg: "rgba(24, 24, 27, 0.9)",
    headerBg: "rgba(9, 9, 11, 0.9)",
    glowFrom: "#f59e0b",
    glowVia: "#eab308",
    glowTo: "#fde047",
  },
  velvet: {
    label: "Velvet",
    isLight: false,
    bgPrimary: "#120618",
    bgSecondary: "#1e0b2e",
    text: "#fdf4ff",
    textMuted: "#e9d5ff",
    card: "#1a0d24",
    cardAlt: "#0d0612",
    accent: "#e879f9",
    panelBorder: "rgba(217, 70, 239, 0.38)",
    bidValue: "#f0abfc",
    badgeBg: "rgba(22, 6, 36, 0.88)",
    headerBg: "rgba(22, 6, 36, 0.92)",
    glowFrom: "#c026d3",
    glowVia: "#7c3aed",
    glowTo: "#e879f9",
  },
};

export default function AuctionOverlayFullScreen() {
  const { auctionId } = useParams();
  const [player, setPlayer] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [bidAnimation, setBidAnimation] = useState(false);
  const [zoomImageOpen, setZoomImageOpen] = useState(false);
  const [themeKey, setThemeKey] = useState("ocean");
  const previousBidRef = useRef(0);

  const currentTheme = THEMES[themeKey];
  const isLight = currentTheme.isLight;

  const DUMMY_IMAGE_URL =
    "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";
  const isDummyImage = (url) => url === DUMMY_IMAGE_URL;

  const cycleTheme = () => {
    const i = THEME_ORDER.indexOf(themeKey);
    setThemeKey(THEME_ORDER[(i + 1) % THEME_ORDER.length]);
  };

  useEffect(() => {
    const prevBg = document.body.style.background;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.background = "transparent";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.background = prevBg;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
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

  const formatMoney = (amount) => {
    if (!amount || isNaN(amount)) return "0";
    return amount.toLocaleString("en-IN");
  };

  const handleSocketData = (data) => {
    const payload = data?.data || data;
    if (!payload?.currentPlayer) return;

    const incomingBid = Number(payload.currentPlayer.currentBid || 0);
    const previousBid = Number(previousBidRef.current || 0);

    if (incomingBid > previousBid) {
      setBidAnimation(true);
      setTimeout(() => setBidAnimation(false), 800);
    }

    previousBidRef.current = incomingBid;

    setPlayer(payload.currentPlayer);
    setBidHistory(payload.currentPlayer.bidHistory || []);
  };

  useEffect(() => {
    if (!auctionId) return;
    connectAuctionSocket({
      auctionId,
      onSnapshot: handleSocketData,
      onUpdate: handleSocketData,
    });
    return () => disconnectSocket();
  }, [auctionId]);

  useEffect(() => {
    const handleEscClose = (e) => {
      if (e.key === "Escape") {
        setZoomImageOpen(false);
      }
    };

    if (zoomImageOpen) {
      window.addEventListener("keydown", handleEscClose);
    }

    return () => window.removeEventListener("keydown", handleEscClose);
  }, [zoomImageOpen]);

  if (!player) return null;

  const isSold = player.status === "sold";
  const isUnsold = player.status === "unsold";

  const sortedBids = [...bidHistory].sort(
    (a, b) => new Date(b.bidTime) - new Date(a.bidTime),
  );

  const isPlaceholder = isDummyImage(player.profilePicture);

  const glowGradient = `linear-gradient(to right, ${currentTheme.glowFrom}, ${currentTheme.glowVia}, ${currentTheme.glowTo})`;
  const glowGradientBr = `linear-gradient(to bottom right, ${currentTheme.glowFrom}, ${currentTheme.glowVia}, ${currentTheme.glowTo})`;

  return (
    <div className="bg-transparent">
      <div
        className="fixed inset-0 z-10 flex h-dvh max-h-dvh w-full max-w-full flex-col overflow-hidden overscroll-none text-[clamp(14px,2.2vmin,18px)]"
        style={{ color: currentTheme.text }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom right, ${currentTheme.bgPrimary}, ${currentTheme.bgSecondary})`,
          }}
        />

        <header
          className="relative z-20 shrink-0 flex items-stretch sm:items-center justify-between gap-2 sm:gap-4 md:gap-6 min-h-0 sm:min-h-[clamp(4.25rem,11vh,7.5rem)] px-3 sm:px-5 md:px-8 py-2.5 sm:py-3 md:py-4 border-b-2 backdrop-blur-md"
          style={{
            background: currentTheme.headerBg,
            borderColor: currentTheme.panelBorder,
          }}
        >
          <div className="flex items-center justify-start min-w-0 w-[min(30%,9.5rem)] sm:w-[26%] md:w-[28%]">
            {tournament?.logo ? (
              <img
                src={tournament.logo}
                alt=""
                className="h-[clamp(2rem,7vmin,4.5rem)] sm:h-[clamp(2.75rem,8vmin,5.5rem)] md:h-[clamp(3rem,9vmin,6rem)] w-auto max-w-full object-contain object-left"
              />
            ) : (
              <span
                className="text-xs sm:text-sm md:text-base font-semibold leading-tight line-clamp-2"
                style={{ color: currentTheme.textMuted }}
              >
                Tournament
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 flex items-center justify-center px-1 sm:px-3 md:px-4 py-1">
            <h1
              className="w-full text-center text-[clamp(0.95rem,3.8vmin,1.85rem)] sm:text-[clamp(1.05rem,4vmin,2.35rem)] md:text-[clamp(1.15rem,4.2vmin,2.85rem)] font-black leading-[1.15] tracking-tight break-words [overflow-wrap:anywhere] hyphens-auto line-clamp-3 sm:line-clamp-2"
              style={{ color: currentTheme.text }}
            >
              {tournament?.name || "Live Auction"}
            </h1>
          </div>

          <div className="flex flex-row items-center justify-end gap-1.5 sm:gap-2 md:gap-2.5 w-[min(40%,12rem)] sm:w-[30%] md:w-[30%] min-w-0 shrink-0">
            <img
              src={logo}
              alt="Crickbro"
              className="h-[clamp(3rem,11vmin,5.25rem)] sm:h-[clamp(3.5rem,12vmin,6.25rem)] md:h-[clamp(4rem,12.5vmin,7.5rem)] lg:h-[clamp(4.25rem,13vmin,8.5rem)] w-auto max-w-[min(92vw,220px)] sm:max-w-[min(48vw,280px)] md:max-w-[min(44vw,340px)] object-contain object-right drop-shadow-md"
            />
            <button
              type="button"
              onClick={cycleTheme}
              title={`${currentTheme.label} — next theme`}
              aria-label={`Change theme, current ${currentTheme.label}`}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md backdrop-blur touch-manipulation sm:h-9 sm:w-9"
              style={{
                background: currentTheme.badgeBg,
                color: currentTheme.text,
                border: `1px solid ${currentTheme.panelBorder}`,
              }}
            >
              <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start overflow-y-auto overflow-x-hidden px-2 py-2 overlay-no-scrollbar sm:px-3 sm:py-3 lg:h-full lg:w-[58%] lg:min-w-0 lg:flex-none lg:justify-center lg:px-4 lg:py-4 xl:px-8 xl:py-6">
            <div className="relative mb-2 aspect-square h-[min(26vw,10rem)] w-[min(26vw,10rem)] shrink-0 sm:mb-3 sm:h-40 sm:w-40 md:mb-3 md:h-44 md:w-44 lg:mb-5 lg:h-52 lg:w-52 xl:mb-6 xl:h-56 xl:w-56">
              <div
                className="absolute -inset-3 sm:-inset-4 rounded-3xl blur-xl opacity-35 animate-pulse"
                style={{ background: glowGradient }}
              />

              <div
                className="relative w-full h-full p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl"
                style={{ background: glowGradientBr }}
              >
                <div
                  className="w-full h-full overflow-hidden relative rounded-[0.65rem] sm:rounded-[0.85rem] lg:rounded-2xl"
                  style={{
                    background: currentTheme.card,
                    border: `1px solid ${currentTheme.panelBorder}`,
                  }}
                >
                  <img
                    src={isPlaceholder ? icon : player.profilePicture}
                    alt={player.name}
                    className="w-full h-full object-cover scale-105"
                  />

                  <button
                    type="button"
                    onClick={() => setZoomImageOpen(true)}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold border bg-black/50 hover:bg-black/70 transition-all pointer-events-auto touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                    style={{ borderColor: currentTheme.accent + "66", color: "#ffffff" }}
                  >
                    Zoom
                  </button>

                  {(isSold || isUnsold) && (
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <div
                        className={`px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-lg font-extrabold rotate-[-16deg] sm:rotate-[-20deg] border-4 rounded-lg shadow-xl max-w-[90%] text-center
            ${isSold ? "border-green-400 text-green-400" : "border-red-500 text-red-500"}`}
                        style={{
                          background: "rgba(0,0,0,0.4)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {isSold ? "SOLD" : "UNSOLD"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <h2
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-center mb-2 sm:mb-3 lg:mb-4 px-2 w-full max-w-[min(100%,42rem)]"
              style={{
                color: currentTheme.text,
                textShadow: isLight ? "0 1px 0 rgba(255,255,255,0.6)" : "none",
              }}
            >
              {player.name}
            </h2>

            <div className="mb-2 flex max-w-[min(100%,40rem)] flex-wrap items-center justify-center gap-1.5 px-1 text-xs sm:mb-3 sm:gap-2 sm:text-sm md:mb-4 md:gap-3 md:text-base lg:mb-5">
              <span
                className="px-2.5 sm:px-3 py-1 rounded-full border max-w-full truncate"
                style={{
                  borderColor: currentTheme.accent + "55",
                  background: currentTheme.badgeBg,
                  color: currentTheme.text,
                }}
              >
                {player.role || "-"}
              </span>
              <span
                className="px-2.5 sm:px-3 py-1 rounded-full border max-w-full truncate"
                style={{
                  borderColor: currentTheme.accent + "55",
                  background: currentTheme.badgeBg,
                  color: currentTheme.text,
                }}
              >
                {player.categoryName || player.category || "-"}
              </span>
              <span
                className="px-2.5 sm:px-3 py-1 rounded-full border max-w-full truncate"
                style={{
                  borderColor: currentTheme.accent + "55",
                  background: currentTheme.badgeBg,
                  color: currentTheme.text,
                }}
              >
                {player.batchId || "-"}
              </span>
              <span
                className="px-2.5 sm:px-3 py-1 rounded-full border max-w-full truncate"
                style={{
                  borderColor: currentTheme.accent + "55",
                  background: currentTheme.badgeBg,
                  color: currentTheme.text,
                }}
              >
                {player.location || player.city || "-"}
              </span>
            </div>

            <div
              className="relative mx-auto mb-2 w-full max-w-md rounded-xl border p-2.5 transition-all duration-500 sm:mb-3 sm:rounded-2xl sm:p-3 md:mb-4 md:p-4 lg:mb-5 lg:p-5"
              style={{
                background: isSold
                  ? "linear-gradient(135deg, rgba(0,255,135,0.15), rgba(0,200,83,0.2))"
                  : isUnsold
                    ? "linear-gradient(135deg, rgba(255,77,77,0.15), rgba(183,28,28,0.2))"
                    : `linear-gradient(135deg, ${currentTheme.cardAlt}, ${currentTheme.card})`,
                borderColor: isSold
                  ? "#00ff87"
                  : isUnsold
                    ? "#ff4d4d"
                    : currentTheme.accent + "40",
                boxShadow: bidAnimation
                  ? `0 0 28px ${currentTheme.accent}66`
                  : "0 0 0 transparent",
              }}
            >
              <div className="text-center mb-1.5 sm:mb-2">
                <span
                  className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-bold"
                  style={{
                    color:
                      isSold && isLight
                        ? "#14532d"
                        : isUnsold && isLight
                          ? "#7f1d1d"
                          : currentTheme.textMuted,
                    letterSpacing: "0.06em",
                    background:
                      isSold && isLight
                        ? "#dcfce7"
                        : isUnsold && isLight
                          ? "#fee2e2"
                          : "transparent",
                    border:
                      isSold && isLight
                        ? "1px solid #16a34a"
                        : isUnsold && isLight
                          ? "1px solid #ef4444"
                          : "1px solid transparent",
                  }}
                >
                  {isSold ? "FINAL PRICE" : isUnsold ? "NOT SOLD" : "CURRENT BID"}
                </span>
              </div>

              <motion.div
                animate={bidAnimation ? { scale: [1, 1.12, 1], y: [0, -4, 0] } : {}}
                className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold break-all px-1"
                style={{
                  color: isSold
                    ? isLight
                      ? "#15803d"
                      : "#00ff87"
                    : isUnsold
                      ? "#ff4d4d"
                      : currentTheme.bidValue,
                }}
              >
                ₹ {formatMoney(isSold ? player.finalPrice : player.currentBid)}
              </motion.div>
            </div>

            <div
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-center px-2"
              style={{ color: currentTheme.accent }}
            >
              Base Price: ₹ {formatMoney(player.basePrice)}
            </div>
            {isSold && (
              <div
                className="mt-3 sm:mt-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-center max-w-md w-full text-sm sm:text-base"
                style={{
                  background: isLight ? "#dcfce7" : "rgba(0,255,135,0.15)",
                  border: isLight ? "1px solid #16a34a" : "1px solid #00ff87",
                  color: isLight ? "#14532d" : "#00ff87",
                  boxShadow: isLight ? "0 8px 18px rgba(22, 163, 74, 0.20)" : "none",
                  fontWeight: 700,
                }}
              >
                🏆 SOLD TO: {player.highestBidderName}
              </div>
            )}
          </div>

          <div className="flex w-full shrink-0 flex-col overflow-hidden px-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-0 min-h-[8rem] max-h-[min(38dvh,260px)] lg:max-h-none lg:min-h-0 lg:h-full lg:w-[42%] lg:shrink-0 xl:w-[40%] lg:px-4 lg:pb-6 lg:pt-2 xl:px-8 xl:pb-8">
            <div
              className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border p-2.5 sm:rounded-2xl sm:p-3 md:p-4 lg:p-6"
              style={{
                background: currentTheme.card,
                borderColor: currentTheme.panelBorder,
                boxShadow: isLight ? "0 12px 28px rgba(15, 23, 42, 0.12)" : "none",
              }}
            >
              <h3
                className="mb-2 shrink-0 text-center text-base font-bold sm:mb-3 sm:text-lg md:mb-4 md:text-xl lg:mb-5 lg:text-2xl"
                style={{ color: currentTheme.text }}
              >
                BID HISTORY
              </h3>

              <div className="overlay-no-scrollbar flex min-h-0 flex-1 flex-col space-y-2 overflow-y-auto overscroll-contain pr-0.5 touch-pan-y md:space-y-3 sm:pr-1">
                {sortedBids.length > 0 ? (
                  sortedBids.map((bid, index) => {
                    const bidderName =
                      bid.teamName ||
                      bid.bidderName ||
                      (player.status === "sold" ? player.highestBidderName : "—");

                    const isTopBid = index === 0;

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border transition-all min-h-[44px]"
                        style={{
                          background: isTopBid
                            ? currentTheme.accent + "25"
                            : currentTheme.cardAlt,
                          border: isTopBid
                            ? `1px solid ${currentTheme.accent}`
                            : `1px solid ${currentTheme.panelBorder}`,
                        }}
                      >
                        <span className="truncate min-w-0 text-left">{bidderName}</span>
                        <span
                          className="font-semibold flex-shrink-0 tabular-nums text-sm sm:text-base"
                          style={{ color: currentTheme.accent }}
                        >
                          ₹ {formatMoney(bid.bidAmount)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="rounded-lg sm:rounded-xl p-3 sm:p-4 text-center text-sm"
                    style={{
                      background: currentTheme.cardAlt,
                      color: currentTheme.textMuted,
                      border: `1px solid ${currentTheme.panelBorder}`,
                    }}
                  >
                    No bids yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .overlay-no-scrollbar,
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .overlay-no-scrollbar::-webkit-scrollbar,
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
            background: transparent;
          }
        `}</style>

        <AnimatePresence>
          {zoomImageOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-3 sm:p-4"
              onClick={() => setZoomImageOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-[min(92vw,900px)] aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 max-h-[min(92dvh,900px)]"
                style={{ borderColor: currentTheme.accent + "66" }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={isPlaceholder ? icon : player.profilePicture}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setZoomImageOpen(false)}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 px-3 py-2 sm:py-1 rounded-md text-sm font-semibold bg-black/60 hover:bg-black/80 border min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center touch-manipulation"
                  style={{ borderColor: currentTheme.accent + "66", color: "#ffffff" }}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
