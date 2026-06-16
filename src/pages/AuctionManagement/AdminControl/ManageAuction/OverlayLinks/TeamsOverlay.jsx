import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import api from "../../../../../utils/api";
import { fetchAllAuctionTeams } from "../../../../../utils/fetchAllAuctionTeams";
import { clientApiBaseURL, logoUrl } from "../../../../../config/env";
import logo from "/Crickbro_auction_logo.png";
import LightLogo from "/Crickbro_auction_logo-1.png";

import {
  X,
  Users,
  TrendingUp,
  Wallet,
  ChevronLeft,
  Target,
  Star,
  Shield,
  Lock,
  Moon,
  Sun,
  Waves,
  Stars,
  CloudSun,
  Crown,
  Gem,
} from "lucide-react";
import { computeCategoryLockReserveForTeam } from "../AuctionBiddingPanel/categoryBudgetLockUtils";
const DUMMY_IMAGE_URL =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

/** Preset themes: `ui` drives legacy dark/light accent splits (cyan vs sky paths). */
const TEAM_OVERLAY_THEMES = {
  dark: {
    ui: "dark",
    text: "text-slate-100",
    bg: "from-slate-950 via-slate-900 to-slate-950",
    heading: "text-cyan-200",
    subtle: "text-slate-300",
    soft: "text-slate-400",
    card: "from-slate-800/90 to-slate-900/90 border-slate-500/45",
    progressTrack: "bg-slate-700",
    neutralSurface: "bg-slate-800/70 border-slate-600/40",
    button: "bg-slate-800/80 border-slate-500/55 text-slate-100 hover:bg-slate-700/90",
    panel: "bg-slate-900/65 border-slate-700/50 shadow-[0_16px_50px_rgba(8,15,40,0.45)]",
    chip: "bg-slate-800/75 border-slate-600/40 text-slate-200",
  },
  light: {
    ui: "light",
    text: "text-slate-800",
    bg: "from-slate-100 via-white to-blue-50",
    heading: "text-sky-700",
    subtle: "text-slate-600",
    soft: "text-slate-500",
    card: "from-white to-slate-50 border-slate-300/80",
    progressTrack: "bg-slate-200",
    neutralSurface: "bg-white/80 border-slate-300/80",
    button: "bg-white/95 border-slate-300 text-slate-800 hover:bg-slate-100",
    panel: "bg-white/90 border-slate-300/90 shadow-[0_14px_40px_rgba(15,23,42,0.12)]",
    chip: "bg-white border-slate-300 text-slate-700",
  },
  ocean: {
    ui: "dark",
    text: "text-teal-50",
    bg: "from-teal-950 via-cyan-950 to-slate-950",
    heading: "text-cyan-200",
    subtle: "text-teal-100/90",
    soft: "text-teal-300/80",
    card: "from-teal-900/90 to-cyan-950/90 border-teal-500/40",
    progressTrack: "bg-teal-900",
    neutralSurface: "bg-teal-950/70 border-teal-600/45",
    button: "bg-teal-900/85 border-teal-500/50 text-teal-50 hover:bg-teal-800/90",
    panel: "bg-teal-950/65 border-teal-700/50 shadow-[0_16px_50px_rgba(6,40,45,0.5)]",
    chip: "bg-teal-900/80 border-teal-600/45 text-teal-100",
  },
  midnight: {
    ui: "dark",
    text: "text-indigo-50",
    bg: "from-indigo-950 via-slate-950 to-violet-950",
    heading: "text-indigo-200",
    subtle: "text-indigo-200/85",
    soft: "text-indigo-300/75",
    card: "from-indigo-900/90 to-slate-900/90 border-indigo-500/42",
    progressTrack: "bg-indigo-900",
    neutralSurface: "bg-indigo-950/72 border-indigo-600/45",
    button: "bg-indigo-900/85 border-indigo-500/50 text-indigo-50 hover:bg-indigo-800/90",
    panel: "bg-indigo-950/65 border-indigo-700/50 shadow-[0_16px_50px_rgba(20,15,55,0.52)]",
    chip: "bg-indigo-900/78 border-indigo-600/42 text-indigo-100",
  },
  daylight: {
    ui: "light",
    text: "text-stone-800",
    bg: "from-amber-50 via-orange-50/50 to-sky-100",
    heading: "text-orange-700",
    subtle: "text-stone-600",
    soft: "text-stone-500",
    card: "from-white to-amber-50/60 border-amber-200/85",
    progressTrack: "bg-amber-100",
    neutralSurface: "bg-white/90 border-amber-200/85",
    button: "bg-white/95 border-amber-200 text-stone-800 hover:bg-amber-50",
    panel: "bg-white/92 border-amber-200/90 shadow-[0_14px_40px_rgba(120,53,15,0.1)]",
    chip: "bg-amber-50/90 border-amber-200 text-stone-700",
  },
  royale: {
    ui: "dark",
    text: "text-yellow-50",
    bg: "from-violet-950 via-purple-950 to-slate-950",
    heading: "text-amber-200",
    subtle: "text-violet-200/90",
    soft: "text-violet-300/78",
    card: "from-violet-900/90 to-purple-950/90 border-amber-500/38",
    progressTrack: "bg-violet-900",
    neutralSurface: "bg-violet-950/72 border-amber-600/35",
    button: "bg-violet-900/85 border-amber-500/42 text-yellow-50 hover:bg-violet-800/90",
    panel: "bg-violet-950/65 border-amber-600/42 shadow-[0_16px_50px_rgba(55,20,80,0.48)]",
    chip: "bg-violet-900/78 border-amber-500/38 text-amber-100",
  },
  velvet: {
    ui: "dark",
    text: "text-rose-50",
    bg: "from-rose-950 via-fuchsia-950 to-slate-950",
    heading: "text-rose-200",
    subtle: "text-rose-200/88",
    soft: "text-rose-300/72",
    card: "from-rose-900/90 to-fuchsia-950/90 border-rose-500/42",
    progressTrack: "bg-rose-900",
    neutralSurface: "bg-rose-950/72 border-rose-600/42",
    button: "bg-rose-900/85 border-rose-500/48 text-rose-50 hover:bg-rose-800/90",
    panel: "bg-rose-950/65 border-rose-700/50 shadow-[0_16px_50px_rgba(60,10,35,0.5)]",
    chip: "bg-rose-900/78 border-rose-600/42 text-rose-100",
  },
};

const TEAM_OVERLAY_THEME_OPTIONS = [
  { id: "dark", Icon: Moon },
  { id: "light", Icon: Sun },
  { id: "ocean", Icon: Waves },
  { id: "midnight", Icon: Stars },
  { id: "daylight", Icon: CloudSun },
  { id: "royale", Icon: Crown },
  { id: "velvet", Icon: Gem },
];

export default function TeamsOverlay() {
  const { auctionId } = useParams();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [themeMode, setThemeMode] = useState("dark");
  const theme = TEAM_OVERLAY_THEMES[themeMode] || TEAM_OVERLAY_THEMES.dark;
  const isDark = theme.ui === "dark";
  const ThemeIcon =
    TEAM_OVERLAY_THEME_OPTIONS.find((o) => o.id === themeMode)?.Icon ?? Moon;
  const cycleTheme = useCallback(() => {
    const list = TEAM_OVERLAY_THEME_OPTIONS;
    const i = list.findIndex((o) => o.id === themeMode);
    const nextIdx = i >= 0 ? (i + 1) % list.length : 0;
    setThemeMode(list[nextIdx].id);
  }, [themeMode]);
  const [auctionMeta, setAuctionMeta] = useState({ name: "", logo: "" });
  const [categoryBudgetLocks, setCategoryBudgetLocks] = useState([]);
  const [soldPlayersByTeamCategory, setSoldPlayersByTeamCategory] = useState({});

  // Format money for Indian currency
  const formatMoney = (amount) => {
    if (!amount || isNaN(amount)) return "0";

    if (amount >= 10000000) {
      const crore = amount / 10000000;
      return `₹${parseFloat(crore.toFixed(2))}Cr`;
    }

    if (amount >= 100000) {
      const lakh = amount / 100000;
      return `₹${parseFloat(lakh.toFixed(2))}L`;
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Fetch teams
  useEffect(() => {
    const fetchOverlayData = async () => {
      try {
        setLoading(true);
        const [payload, auctionResponse] = await Promise.all([
          fetchAllAuctionTeams(auctionId),
          api.get(`/webSiteApi/auction/getAuctionById/${auctionId}`),
        ]);
        const auctionData = auctionResponse?.data?.data || {};

        const tournamentData =
          auctionData?.auctionDetails?.tournament || auctionData?.tournament || {};

        const auctionName =
          tournamentData?.name ||
          auctionData?.auctionDetails?.auctionName ||
          auctionData?.auctionName ||
          payload?.auctionDetails?.auctionName ||
          payload?.auctionName ||
          "";
        const auctionLogo =
          tournamentData?.logo ||
          tournamentData?.bannerLogo ||
          auctionData?.auctionDetails?.logo ||
          auctionData?.auctionLogo ||
          payload?.auctionDetails?.logo ||
          payload?.auctionLogo ||
          "";

        setAuctionMeta({ name: auctionName, logo: auctionLogo });

        const teamsList =
          payload?.data || payload?.selectedTeamToAuction || payload?.teams || [];

        if (Array.isArray(teamsList)) {
          setTeams(teamsList);
        } else {
          setTeams([]);
        }

        setCategoryBudgetLocks(
          Array.isArray(payload?.categoryBudgetLocks)
            ? payload.categoryBudgetLocks
            : [],
        );
        setSoldPlayersByTeamCategory(
          payload?.soldPlayersByTeamCategory &&
            typeof payload.soldPlayersByTeamCategory === "object"
            ? payload.soldPlayersByTeamCategory
            : {},
        );
      } catch (error) {
        console.error("Error fetching overlay data:", error);
        setTeams([]);
        setCategoryBudgetLocks([]);
        setSoldPlayersByTeamCategory({});
      } finally {
        setLoading(false);
      }
    };

    if (auctionId) {
      fetchOverlayData();
    }
  }, [auctionId]);

  // Fetch team players
  const handleTeamClick = async (team) => {
    try {
      setPlayersLoading(true);
      setSelectedTeam(team);
      const response = await api.get(
        `/webSiteApi/auctionTeam/getTeamWithSoldPlayers/${auctionId}/${team.teamId}`,
      );
      if (response.data && response.data.data) {
        setTeamPlayers(response.data.data.players?.list || []);
      }
    } catch (error) {
      console.error("Error fetching team players:", error);
      setTeamPlayers([]);
    } finally {
      setPlayersLoading(false);
    }
  };

  // Close team detail view
  const handleCloseTeamDetail = () => {
    setSelectedTeam(null);
    setTeamPlayers([]);
    setSelectedPlayer(null);
  };

  // Get role color
  const getRoleColor = (role) => {
    if (!role) return "from-blue-500/20 to-blue-700/20";
    const roleLower = role.toLowerCase();
    if (roleLower.includes("batter") || roleLower.includes("batsman"))
      return "from-red-500/20 to-red-700/20";
    if (roleLower.includes("bowler"))
      return "from-green-500/20 to-green-700/20";
    if (roleLower.includes("all")) return "from-purple-500/20 to-purple-700/20";
    if (roleLower.includes("keeper"))
      return "from-yellow-500/20 to-yellow-700/20";
    return "from-blue-500/20 to-blue-700/20";
  };

  const getTeamLogo = (team) => {
    return (
      team?.teamDoc?.logo ||
      team?.teamDoc?.teamLogo ||
      team?.teamDoc?.image ||
      team?.teamDetails?.logo ||
      team?.teamDetails?.teamLogo ||
      team?.teamAuctionDetails?.teamLogo ||
      team?.teamLogo ||
      team?.teamlogo ||
      team?.logo ||
      team?.teamLogoUrl ||
      team?.logoUrl ||
      team?.teamImage ||
      team?.image ||
      team?.imageUrl ||
      team?.teamProfilePicture ||
      null
    );
  };

  const normalizeImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }

    const base = (
      clientApiBaseURL ||
      import.meta.env.VITE_API_BASE_URL ||
      window.location.origin ||
      ""
    ).replace(/\/$/, "");
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${base}${path}`;
  };

  const getDisplayText = (value, fallback = "") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string" || typeof value === "number") {
      const text = String(value).trim();
      return text || fallback;
    }

    if (typeof value === "object") {
      const candidate =
        value?.name || value?.label || value?.title || value?.value || fallback;
      return typeof candidate === "string" || typeof candidate === "number"
        ? String(candidate)
        : fallback;
    }

    return fallback;
  };

  const getTeamName = (team) =>
    getDisplayText(team?.teamName || team?.name, "Team");

  const getPlayerCategory = (player) =>
    getDisplayText(
      player?.categoryName || player?.category || player?.playerCategory,
      "Uncategorized",
    );

  const tournamentName = getDisplayText(
    selectedTeam?.tournamentName ||
    selectedTeam?.tournament?.name ||
    selectedTeam?.tournamentDetails?.name ||
    auctionMeta?.name ||
    teams?.[0]?.tournamentName ||
    teams?.[0]?.tournament?.name ||
    teams?.[0]?.tournamentDetails?.name ||
    teams?.[0]?.auctionName ||
    "CrickBro Tournament",
    "CrickBro Tournament",
  );
  const tournamentLogo =
    selectedTeam?.tournamentLogo ||
    selectedTeam?.tournament?.logo ||
    selectedTeam?.tournamentDetails?.logo ||
    auctionMeta?.logo ||
    teams?.[0]?.tournamentLogo ||
    teams?.[0]?.tournament?.logo ||
    teams?.[0]?.tournamentDetails?.logo ||
    logoUrl ||
    "/auctionLogo.png";

  const categoryBreakdown = useMemo(() => {
    const map = teamPlayers.reduce((acc, player) => {
      const label = getPlayerCategory(player);

      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [teamPlayers]);

  const getTeamLockSpendable = useCallback(
    (team) => {
      if (!categoryBudgetLocks.length || !team) {
        return { reserve: 0, spendable: null };
      }
      const tid = team.teamId != null ? String(team.teamId) : "";
      const soldMap = (tid && soldPlayersByTeamCategory[tid]) || {};
      const remNum = Number(team.remainingBudget);
      if (!Number.isFinite(remNum)) {
        return { reserve: 0, spendable: null };
      }
      const { reserve } = computeCategoryLockReserveForTeam(
        categoryBudgetLocks,
        soldMap,
        { categoryId: null, consumeSlotFromBidCategory: false },
      );
      return {
        reserve,
        spendable: Math.max(0, remNum - reserve),
      };
    },
    [categoryBudgetLocks, soldPlayersByTeamCategory],
  );

  const selectedTeamLock = useMemo(
    () =>
      selectedTeam ? getTeamLockSpendable(selectedTeam) : { reserve: 0, spendable: null },
    [selectedTeam, getTeamLockSpendable],
  );

  return (
    <div className={`w-full min-h-screen relative overflow-hidden ${theme.text}`}>
      {/* Animated Gradient Background */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg}`}></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-20"></div>

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${isDark ? "bg-cyan-400/30" : "bg-sky-500/25"}`}
              animate={{
                y: [0, -1000],
                x: [0, Math.sin(i) * 100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen p-4 md:p-6 lg:p-8">
        {!selectedTeam && (
          <div className={`max-w-7xl mx-auto rounded-3xl border px-4 py-3 md:px-6 md:py-4 mb-5 md:mb-8 flex items-center justify-between gap-3 backdrop-blur-xl ${theme.panel}`}>
            <div className="flex items-center gap-3 min-w-0">
              <motion.img
                src={normalizeImageUrl(tournamentLogo)}
                alt={tournamentName}
                className={`h-11 w-11 md:h-16 md:w-16 rounded-2xl object-cover border ${isDark ? "border-cyan-300/40" : "border-sky-300/80"} shadow-lg`}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                onError={(e) => {
                  e.currentTarget.src = "/auctionLogo.png";
                }}
              />
              <div className="min-w-0">
                <p className={`text-[10px] md:text-xs uppercase tracking-[0.2em] ${theme.soft}`}>Live Tournament Overlay</p>
                <h1 className={`text-base md:text-2xl font-black break-words leading-tight ${theme.heading}`}>{tournamentName}</h1>
              </div>
            </div>
           { isDark ?<div className="absolute -top-8 right-16 z-50">
              <img
                className="w-[150px] h-auto"
                src={logo}
                alt="App Logo"
              />
            </div>
            :
            <div className="absolute right-24 z-50">
              <img
                className="w-[80px] h-auto bg-b"
                src={LightLogo}
                alt="App Logo"
              />
            </div>
            }
            <button
              type="button"
              onClick={cycleTheme}
              aria-label="Next overlay theme"
              className={`p-2 rounded-lg border transition-all hover:scale-105 active:scale-95 shrink-0 ${theme.button}`}
            >
              <ThemeIcon className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2.25} />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="pb-6">
          <AnimatePresence mode="wait">
            {!selectedTeam ? (
              // Teams Grid View - COMPACT CARDS
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-7xl mx-auto"
              >
                {/* <motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl md:text-3xl font-black text-center mb-6 md:mb-8"
                  style={{ color: isDark ? "#a5f3fc" : "#0369a1" }}
                >
                  AUCTION TEAMS
                </motion.h1> */}

                {loading ? (
                  <div className="text-center">
                    <div className={`inline-block animate-spin w-12 h-12 border-4 ${isDark ? "border-cyan-400" : "border-sky-500"} border-t-transparent rounded-full mb-3`}></div>
                    <p className={theme.subtle}>Loading Teams...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {teams.map((team, index) => {
                      const budgetSpent =
                        (team.initialBudget || 0) - (team.remainingBudget || 0);
                      const playerCount = team.currentSquadSize || 0;
                      const budgetUsed = team.initialBudget
                        ? (budgetSpent / team.initialBudget) * 100
                        : 0;
                      const teamLogo = getTeamLogo(team);
                      const lockInfo = getTeamLockSpendable(team);

                      return (
                        <motion.div
                          key={team._id || team.teamId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleTeamClick(team)}
                          className="cursor-pointer group relative"
                        >
                          {/* Glow Effect */}
                          <div className={`absolute -inset-1 rounded-xl blur opacity-0 group-hover:opacity-35 transition-opacity duration-300 ${isDark ? "bg-gradient-to-r from-cyan-500 to-indigo-500" : "bg-gradient-to-r from-sky-400 to-cyan-400"}`}></div>

                          {/* Main Card */}
                          <div className={`relative min-h-[292px] bg-gradient-to-br backdrop-blur-sm rounded-2xl p-4 md:p-5 border transition-all duration-300 group-hover:shadow-[0_0_32px_rgba(34,211,238,0.26)] ${theme.card}`}>
                            {/* Team Name */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border ${isDark ? "border-cyan-300/40" : "border-sky-300/80"} bg-slate-100/10 flex-shrink-0`}>
                                {teamLogo && teamLogo !== DUMMY_IMAGE_URL ? (
                                  <img
                                    src={normalizeImageUrl(teamLogo)}
                                    alt={getTeamName(team)}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      e.currentTarget.nextSibling.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full ${teamLogo && teamLogo !== DUMMY_IMAGE_URL ? "hidden" : "flex"} items-center justify-center text-xs font-black ${isDark ? "text-cyan-200" : "text-sky-700"}`}>
                                  {getTeamName(team)?.slice(0, 2)?.toUpperCase() || "TM"}
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className={`text-base md:text-lg font-extrabold truncate mb-0.5 ${theme.text}`}>
                                  {getTeamName(team)}
                                </h3>
                                <div className={`text-[11px] mt-1 truncate ${theme.subtle}`}>
                                  {tournamentName}
                                </div>
                              </div>
                            </div>

                            {/* Budget Progress */}
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1.5">
                                <span className={theme.subtle}>Budget</span>
                                <span className={`font-semibold ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                                  {budgetUsed.toFixed(0)}%
                                </span>
                              </div>
                              <div className={`h-2 rounded-full overflow-hidden ${theme.progressTrack}`}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${Math.min(budgetUsed, 100)}%`,
                                  }}
                                  transition={{ delay: index * 0.1 + 0.3 }}
                                  className={`h-full bg-gradient-to-r ${isDark ? "from-green-500 to-cyan-400" : "from-green-500 to-sky-500"}`}
                                />
                              </div>
                              <div className={`mt-2 text-xs font-semibold ${theme.soft}`}>
                                Initial Budget {formatMoney(team.initialBudget || 0)}
                              </div>
                            </div>

                            {/* Stats Icons Row */}
                            <div className="grid grid-cols-3 gap-2.5">
                              {/* Budget Spent */}
                              <div className="text-center">
                                <div className={`w-10 h-10 mx-auto mb-1.5 rounded-full bg-gradient-to-br flex items-center justify-center border ${isDark ? "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30" : "from-emerald-100 to-emerald-200 border-emerald-300"}`}>
                                  <TrendingUp className={`w-5 h-5 ${isDark ? "text-emerald-300" : "text-emerald-700"}`} />
                                </div>
                                <div className={`text-sm font-extrabold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                                  {formatMoney(budgetSpent).replace("₹", "")}
                                </div>
                                <div className={`text-[10px] mt-0.5 ${theme.soft}`}>Spent</div>
                              </div>

                              {/* Remaining */}
                              <div className="text-center">
                                <div className={`w-10 h-10 mx-auto mb-1.5 rounded-full bg-gradient-to-br flex items-center justify-center border ${isDark ? "from-amber-500/20 to-amber-600/20 border-amber-500/30" : "from-amber-100 to-amber-200 border-amber-300"}`}>
                                  <Wallet className={`w-5 h-5 ${isDark ? "text-amber-300" : "text-amber-700"}`} />
                                </div>
                                <div className={`text-sm font-extrabold ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                                  {formatMoney(
                                    team.remainingBudget || 0,
                                  ).replace("₹", "")}
                                </div>
                                <div className={`text-[10px] mt-0.5 ${theme.soft}`}>Left</div>
                              </div>

                              {/* Players */}
                              <div className="text-center">
                                <div className={`w-10 h-10 mx-auto mb-1.5 rounded-full bg-gradient-to-br flex items-center justify-center border ${isDark ? "from-violet-500/20 to-violet-600/20 border-violet-500/30" : "from-violet-100 to-violet-200 border-violet-300"}`}>
                                  <Users className={`w-5 h-5 ${isDark ? "text-violet-300" : "text-violet-700"}`} />
                                </div>
                                <div className={`text-sm font-extrabold ${isDark ? "text-violet-300" : "text-violet-700"}`}>
                                  {playerCount}
                                </div>
                                <div className={`text-[10px] mt-0.5 ${theme.soft}`}>Players</div>
                              </div>
                            </div>

                            {categoryBudgetLocks.length > 0 && lockInfo.spendable != null && (
                              <div
                                className={`mt-2.5 rounded-xl border px-2.5 py-2 text-left ${isDark
                                  ? "border-amber-500/40 bg-amber-500/10"
                                  : "border-amber-300 bg-amber-50"
                                  }`}
                              >
                                <div
                                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide mb-1 ${isDark ? "text-amber-200" : "text-amber-900"
                                    }`}
                                >
                                  <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                                  Category budget locks
                                </div>
                                {lockInfo.reserve > 0 ? (
                                  <div className={`space-y-0.5 text-[11px] ${theme.subtle}`}>
                                    <div>
                                      <span className={theme.soft}>Reserved: </span>
                                      <span
                                        className={`font-semibold ${isDark ? "text-amber-100" : "text-amber-900"}`}
                                      >
                                        {formatMoney(lockInfo.reserve)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className={theme.soft}>Spendable: </span>
                                      <span
                                        className={`font-semibold ${isDark ? "text-cyan-200" : "text-sky-800"}`}
                                      >
                                        {formatMoney(lockInfo.spendable)}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className={`text-[11px] ${theme.subtle}`}>
                                    No purse reserved for open lock slots
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Hover Indicator */}
                            <div className={`mt-3 pt-2 border-t ${isDark ? "border-cyan-500/20" : "border-sky-200/90"} text-center`}>
                              <div className={`text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme.heading}`}>
                                View Squad →
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              // Team Detail View - Compact Players Grid
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-7xl mx-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={handleCloseTeamDetail}
                      className={`p-2 rounded-lg border transition-all duration-300 hover:scale-110 ${theme.button}`}
                    >
                      <ChevronLeft className={`w-5 h-5 ${isDark ? "text-cyan-400" : "text-sky-600"}`} />
                    </button>

                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border ${isDark ? "border-cyan-300/40" : "border-sky-300/80"} bg-slate-100/10 flex-shrink-0`}>
                      {getTeamLogo(selectedTeam) &&
                        getTeamLogo(selectedTeam) !== DUMMY_IMAGE_URL ? (
                        <img
                          src={normalizeImageUrl(getTeamLogo(selectedTeam))}
                          alt={getTeamName(selectedTeam)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full ${getTeamLogo(selectedTeam) &&
                            getTeamLogo(selectedTeam) !== DUMMY_IMAGE_URL
                            ? "hidden"
                            : "flex"
                          } items-center justify-center text-xs font-black ${isDark ? "text-cyan-200" : "text-sky-700"}`}
                      >
                        {getTeamName(selectedTeam)?.slice(0, 2)?.toUpperCase() || "TM"}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={normalizeImageUrl(tournamentLogo)}
                          alt={tournamentName}
                          className={`h-5 w-5 rounded object-cover border ${isDark ? "border-cyan-300/40" : "border-sky-300/80"}`}
                          onError={(e) => {
                            e.currentTarget.src = "/auctionLogo.png";
                          }}
                        />
                        <p className={`text-[11px] md:text-xs truncate ${theme.soft}`}>
                          {tournamentName}
                        </p>
                      </div>
                      <h1 className={`text-xl md:text-2xl font-bold truncate ${theme.text}`}>
                        {getTeamName(selectedTeam)}
                      </h1>
                      <div className={`flex flex-wrap items-center gap-3 text-sm ${theme.subtle}`}>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {teamPlayers.length} Players
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Initial Budget {formatMoney(selectedTeam.initialBudget || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Wallet className="w-4 h-4" />
                          Spent:{" "}
                          {formatMoney(
                            (selectedTeam.initialBudget || 0) -
                            (selectedTeam.remainingBudget || 0),
                          )}
                        </span>
                      </div>
                      {categoryBudgetLocks.length > 0 && selectedTeamLock.spendable != null && (
                        <div
                          className={`md:hidden mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs rounded-lg border px-2 py-1.5 ${isDark
                            ? "border-amber-500/40 bg-amber-500/10"
                            : "border-amber-200 bg-amber-50"
                            }`}
                        >
                          <span className="flex items-center gap-1 font-semibold">
                            <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                            Budget locks
                          </span>
                          <span className={theme.subtle}>
                            Reserved {formatMoney(selectedTeamLock.reserve)}
                          </span>
                          <span className={theme.soft}>·</span>
                          <span className={theme.subtle}>
                            Spendable {formatMoney(selectedTeamLock.spendable)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Stats */}
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-xs ${theme.soft}`}>Remaining</div>
                      <div className={`text-lg font-bold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                        {formatMoney(selectedTeam.remainingBudget || 0)}
                      </div>
                    </div>
                    <div className={`w-px h-8 ${isDark ? "bg-cyan-500/30" : "bg-sky-200/90"}`}></div>
                    <div className="text-center">
                      <div className={`text-xs ${theme.soft}`}>Initial</div>
                      <div className={`text-lg font-bold ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                        {formatMoney(selectedTeam.initialBudget || 0)}
                      </div>
                    </div>
                    <div className={`w-px h-8 ${isDark ? "bg-cyan-500/30" : "bg-sky-200/90"}`}></div>
                    <div className="text-center">
                      <div className={`text-xs ${theme.soft}`}>Categories</div>
                      <div className={`text-lg font-bold ${isDark ? "text-violet-300" : "text-violet-700"}`}>
                        {categoryBreakdown.length}
                      </div>
                    </div>
                    {categoryBudgetLocks.length > 0 && selectedTeamLock.spendable != null && (
                      <>
                        <div className={`w-px h-8 ${isDark ? "bg-cyan-500/30" : "bg-sky-200/90"}`}></div>
                        <div className="text-center min-w-[7.5rem]">
                          <div
                            className={`text-[10px] uppercase tracking-wide flex items-center justify-center gap-1 ${theme.soft}`}
                          >
                            <Lock className="w-3 h-3 shrink-0" aria-hidden />
                            Locks
                          </div>
                          <div
                            className={`text-sm font-bold leading-tight mt-0.5 ${isDark ? "text-amber-200" : "text-amber-800"}`}
                          >
                            {selectedTeamLock.reserve > 0
                              ? `Res. ${formatMoney(selectedTeamLock.reserve)}`
                              : "—"}
                          </div>
                          <div
                            className={`text-[11px] font-semibold mt-0.5 ${isDark ? "text-cyan-200/95" : "text-sky-800"}`}
                          >
                            Spend {formatMoney(selectedTeamLock.spendable)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Players Grid */}
                {playersLoading ? (
                  <div className="text-center py-12">
                    <div className={`inline-block animate-spin w-12 h-12 border-4 ${isDark ? "border-cyan-400" : "border-sky-500"} border-t-transparent rounded-full mb-3`}></div>
                    <p className={theme.subtle}>Loading Players...</p>
                  </div>
                ) : teamPlayers.length === 0 ? (
                  <div className={`text-center py-16 bg-gradient-to-br rounded-2xl border ${theme.card}`}>
                    <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-cyan-400/30" : "text-sky-400/50"}`} />
                    <p className={`text-xl ${theme.subtle}`}>
                      No players purchased yet
                    </p>
                    <p className={`text-sm ${theme.soft} mt-2`}>
                      Team hasn't made any bids
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {teamPlayers.map((player, index) => (
                      <motion.div
                        key={player._id || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedPlayer(player)}
                        className="cursor-pointer group"
                      >
                        {/* Player Card */}
                        <div className={`relative bg-gradient-to-br backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 group-hover:shadow-[0_0_26px_rgba(34,211,238,0.28)] ${theme.card}`}>
                          {/* Top Banner */}
                          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${isDark ? "from-cyan-500 to-blue-500" : "from-sky-500 to-cyan-500"} z-20`}></div>

                          {/* Player Image — fixed height, gradient only at bottom so text block stays visually separate */}
                          <div className={`relative h-40 md:h-44 shrink-0 overflow-hidden border-b ${isDark ? "border-slate-600/60" : "border-slate-300/80"}`}>
                            {player.profilePicture ? (
                              <img
                                src={player.profilePicture}
                                alt={player.name}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div
                                className={`w-full h-full flex items-center justify-center ${getRoleColor(player.role)}`}
                              >
                                <div className="text-4xl opacity-30">👤</div>
                              </div>
                            )}

                            {/* Bottom-only gradient for role readability; avoids covering full card into name area */}
                            <div
                              className={`pointer-events-none absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-t ${isDark ? "from-slate-950/95 via-slate-950/40 to-transparent" : "from-slate-200/95 via-slate-200/35 to-transparent"}`}
                              aria-hidden
                            />

                            {/* Sold Badge */}
                            <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                              <Star className="w-3 h-3" />
                              SOLD
                            </div>

                            {/* Role Badge */}
                            <div className="absolute bottom-2 left-2 z-10">
                              <div
                                className={`px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-sm ${getRoleColor(player.playerRole).replace("/20", "/30")} border border-white/25 backdrop-blur-md bg-black/35`}
                              >
                                {player.playerRole?.charAt(0).toUpperCase() +
                                  player.playerRole?.slice(1) || "Player"}
                              </div>
                            </div>
                          </div>

                          {/* Player Info — solid band so image never visually "pushes" into labels */}
                          <div
                            className={`relative z-10 px-4 pt-3.5 pb-4 ${isDark ? "bg-slate-950/90" : "bg-slate-50"}`}
                          >
                            {/* Name */}
                            <h3 className={`text-base md:text-lg font-extrabold truncate mb-3 leading-snug ${theme.text}`}>
                              {getDisplayText(player.name, "Player")}
                            </h3>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className={`rounded-lg border p-2.5 ${isDark ? "border-emerald-400/40 bg-slate-900/80" : "border-emerald-300 bg-white"}`}>
                                <div className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Base Price</div>
                                <div className={`text-sm md:text-base font-black ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                                  {formatMoney(player.basePrice || 0)}
                                </div>
                              </div>

                              <div className={`rounded-lg border p-2.5 ${isDark ? "border-lime-400/40 bg-slate-900/80" : "border-green-300 bg-white"}`}>
                                <div className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Sold Price</div>
                                <div className={`text-sm md:text-base font-black ${isDark ? "text-lime-400" : "text-green-700"}`}>
                                  {formatMoney(player.soldPrice || player.currentBid || 0)}
                                </div>
                              </div>
                            </div>

                            <div className={`rounded-lg border px-3 py-2.5 mb-1 ${isDark ? "border-fuchsia-400/35 bg-slate-900/80" : "border-purple-300 bg-white"}`}>
                              <div className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Category</div>
                              <div className={`text-sm md:text-base font-bold truncate ${isDark ? "text-fuchsia-300" : "text-purple-800"}`}>
                                {getPlayerCategory(player)}
                              </div>
                            </div>

                            {/* Hover View */}
                            <div className={`mt-2 pt-2 border-t ${isDark ? "border-cyan-500/10" : "border-sky-200/60"} text-center`}>
                              <div className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme.heading}`}>
                                Click for details →
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Player Detail Modal */}
                <AnimatePresence>
                  {selectedPlayer && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4"
                      onClick={() => setSelectedPlayer(null)}
                    >
                      {/* Backdrop */}
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

                      {/* Modal Content */}
                      <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`relative w-full max-w-md bg-gradient-to-br rounded-2xl border overflow-hidden shadow-2xl ${theme.card}`}
                      >
                        {/* Close Button */}
                        <button
                          onClick={() => setSelectedPlayer(null)}
                          className="absolute top-4 right-4 z-10 p-2 bg-red-600/80 hover:bg-red-600 rounded-full transition-all duration-300 hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Player Image */}
                        <div className="relative h-48">
                          {selectedPlayer.profilePicture ? (
                            <img
                              src={selectedPlayer.profilePicture}
                              alt={getDisplayText(selectedPlayer.name, "Player")}
                              className="w-full h-full object-contain object-top bg-black/10"
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center ${getRoleColor(selectedPlayer.role)}`}
                            >
                              <div className="text-6xl opacity-30">👤</div>
                            </div>
                          )}
                          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? "from-slate-900" : "from-slate-200"} to-transparent`}></div>

                          {/* Role Badge */}
                          <div className="absolute bottom-4 left-4">
                            <div
                              className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getRoleColor(selectedPlayer.role).replace("/20", "/30")} border border-white/20 backdrop-blur-sm`}
                            >
                              {selectedPlayer.role || "Player"}
                            </div>
                          </div>
                        </div>

                        {/* Player Details */}
                        <div className="p-6">
                          {/* Name */}
                          <h2 className={`text-2xl font-bold mb-2 ${theme.text}`}>
                            {getDisplayText(selectedPlayer.name, "Player")}
                          </h2>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Purchase Price */}
                            <div className={`bg-gradient-to-br rounded-xl p-3 border ${isDark ? "from-emerald-600/20 to-emerald-700/20 border-emerald-500/30" : "from-emerald-50 to-emerald-100 border-emerald-300"}`}>
                              <div className={`text-xs mb-1 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                                Purchase Price
                              </div>
                              <div className={`text-xl font-black ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                                {formatMoney(
                                  selectedPlayer.soldPrice ||
                                  selectedPlayer.currentBid ||
                                  0,
                                )}
                              </div>
                            </div>

                            {/* Rating */}
                            {selectedPlayer.rating && (
                              <div className={`bg-gradient-to-br rounded-xl p-3 border ${isDark ? "from-amber-600/20 to-amber-700/20 border-amber-500/30" : "from-amber-50 to-amber-100 border-amber-300"}`}>
                                <div className={`text-xs mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                                  Rating
                                </div>
                                <div className={`text-xl font-black flex items-center gap-2 ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                                  <Star className="w-5 h-5" />
                                  {selectedPlayer.rating}
                                </div>
                              </div>
                            )}

                            {/* Category */}
                            {(selectedPlayer.categoryName || selectedPlayer.category || selectedPlayer.playerCategory) && (
                              <div className={`bg-gradient-to-br rounded-xl p-3 border ${isDark ? "from-violet-600/20 to-violet-700/20 border-violet-500/30" : "from-violet-50 to-violet-100 border-violet-300"}`}>
                                <div className={`text-xs mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>
                                  Category
                                </div>
                                <div className={`text-lg font-bold ${isDark ? "text-violet-300" : "text-violet-700"}`}>
                                  {getPlayerCategory(selectedPlayer)}
                                </div>
                              </div>
                            )}

                            {/* Location */}
                            {selectedPlayer.location && (
                              <div className={`bg-gradient-to-br rounded-xl p-3 border ${isDark ? "from-cyan-600/20 to-blue-600/20 border-cyan-500/30" : "from-cyan-50 to-blue-50 border-cyan-300"}`}>
                                <div className={`text-xs mb-1 ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
                                  Location
                                </div>
                                <div className={`text-lg font-bold ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
                                  {selectedPlayer.location}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Team Info */}
                          <div className={`bg-gradient-to-br rounded-xl p-4 border ${theme.neutralSurface}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className={`text-xs ${theme.subtle}`}>
                                  Playing For
                                </div>
                                <div className={`text-lg font-bold ${theme.text}`}>
                                  {getTeamName(selectedTeam)}
                                </div>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                                <Shield className="w-5 h-5 text-cyan-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
