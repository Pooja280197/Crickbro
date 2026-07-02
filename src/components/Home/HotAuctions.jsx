import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, MapPin, Calendar, Users, X } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import Pagination from "../Pagination";
import { fetchAuctions } from "../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useLoginPopup } from "../../context/LoginPopupContext";
import CricketImage from "../../assets/Images/cricket_bg.png";
import ChatBot from "../ChatBot";

/* ---------------- HELPERS ---------------- */

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

const getAuctionDate = (start, end) => {
  if (!start) return "-";
  const startDate = formatDate(start);
  if (!end) return startDate;
  const endDate = formatDate(end);
  return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
};

const getDateOnlyTime = (date, endOfDay = false) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  if (endOfDay) parsed.setHours(23, 59, 59, 999);
  else parsed.setHours(0, 0, 0, 0);
  return parsed.getTime();
};

const filterAuctions = (auctionList, filters) => {
  const search = filters.search.trim().toLowerCase();
  const fromTime = getDateOnlyTime(filters.fromDate);
  const toTime = getDateOnlyTime(filters.toDate, true);

  return auctionList.filter((auction) => {
    const searchableText = [
      auction.auctionName,
      auction.tournamentId?.cityTown,
      auction.tournamentId?.tournamentName,
      auction.tournamentId?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = !search || searchableText.includes(search);

    const auctionStart = getDateOnlyTime(auction.auctionStartedAt);
    const auctionEnd =
      getDateOnlyTime(auction.auctionEndedAt, true) || auctionStart;
    const matchesFrom = !fromTime || !auctionEnd || auctionEnd >= fromTime;
    const matchesTo = !toTime || !auctionStart || auctionStart <= toTime;

    return matchesSearch && matchesFrom && matchesTo;
  });
};

/* ---------------- TABS ---------------- */

const tabs = [
  { key: "ongoing", label: "Ongoing" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Past" },
  { key: "my", label: "My auctions" },
];

const HotAuctions = ({ theme, onToggleTheme }) => {
  const AUCTIONS_PER_PAGE = 8;
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab = tabs.some((tab) => tab.key === requestedTab)
    ? requestedTab
    : "ongoing";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
  });
  const [loginRefresh, setLoginRefresh] = useState(0);
  const [homeShowingUpcoming, setHomeShowingUpcoming] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { openLoginPopup } = useLoginPopup();
  const playerId = localStorage.getItem("playerId");
  const isLoggedIn = Boolean(playerId);

  const isHome = location.pathname === "/";

  const visibleTabs = tabs.filter((tab) => {
    if (tab.key === "my") return isLoggedIn;
    return true;
  });

  const isLoading = useSelector((state) => state.loading?.auctionList || false);
  const auctionData = useSelector((state) => state.data?.auctionList || null);
  const auctions = auctionData?.data || [];
  const filteredAuctions = useMemo(
    () => filterAuctions(auctions, filters),
    [auctions, filters],
  );
  const hasServerPagination = Boolean(
    auctionData?.pages || auctionData?.total || auctionData?.page,
  );
  const hasActiveFilters = Boolean(
    filters.search.trim() || filters.fromDate || filters.toDate,
  );
  const totalAuctions = hasServerPagination
    ? Number(auctionData?.total || filteredAuctions.length)
    : filteredAuctions.length;
  const totalPages = Math.max(
    1,
    Number(auctionData?.pages) ||
      Math.ceil(totalAuctions / AUCTIONS_PER_PAGE) ||
      1,
  );

  useEffect(() => {
    if (isHome) return;

    const tabFromUrl = searchParams.get("tab");
    const isValidTab = tabs.some((tab) => tab.key === tabFromUrl);

    if (isValidTab && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
      setCurrentPage(1);
    }
  }, [activeTab, isHome, searchParams]);

  useEffect(() => {
    if (!isHome && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, isHome, totalPages]);

  useEffect(() => {
    if (activeTab === "my" && !isLoggedIn) {
      setActiveTab("ongoing");
      setCurrentPage(1);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("tab");
      setSearchParams(nextParams, { replace: true });
    }
  }, [activeTab, isLoggedIn, searchParams, setSearchParams]);

  useEffect(() => {
    const handleLoginEvent = () => setLoginRefresh((prev) => prev + 1);
    window.addEventListener("userLoggedIn", handleLoginEvent);
    return () => window.removeEventListener("userLoggedIn", handleLoginEvent);
  }, []);

  useEffect(() => {
    let active = true;

    const loadAuctions = async () => {
      const pageOptions = {
        page: isHome ? 1 : currentPage,
        limit: isHome ? 4 : AUCTIONS_PER_PAGE,
        search: isHome ? "" : filters.search,
        fromDate: isHome ? "" : filters.fromDate,
        toDate: isHome ? "" : filters.toDate,
      };

      if (activeTab === "my") {
        if (playerId) {
          await dispatch(fetchAuctions(activeTab, playerId, pageOptions));
        }
        return;
      }

      const result = await dispatch(fetchAuctions(activeTab, null, pageOptions));
      const fetchedAuctions = result?.data || [];

      if (
        active &&
        isHome &&
        activeTab === "ongoing" &&
        fetchedAuctions.length === 0
      ) {
        setHomeShowingUpcoming(true);
        await dispatch(fetchAuctions("upcoming", null, pageOptions));
        return;
      }

      if (active) setHomeShowingUpcoming(false);
    };

    loadAuctions();

    return () => {
      active = false;
    };
  }, [
    dispatch,
    playerId,
    activeTab,
    currentPage,
    filters.search,
    filters.fromDate,
    filters.toDate,
    loginRefresh,
    isHome,
  ]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: "", fromDate: "", toDate: "" });
    setCurrentPage(1);
  };

  const handleCreateAuction = () => {
    if (!isLoggedIn) {
      openLoginPopup(() => navigate("/createAuction"));
    } else {
      navigate("/createAuction");
    }
  };

  const handleOpenAuction = (auctionId) => {
    if (activeTab === "my") {
      navigate(`/auction-details/${auctionId}`);
    } else {
      navigate(`/viewAuction/${auctionId}`);
    }
  };

  const getStatusBadge = (auction) => {
    if (auction.isBiddingActive) {
      return (
        <span className="absolute right-3 top-3 inline-flex min-h-7 items-center gap-1.5 rounded-full bg-[var(--danger)] px-3 text-[10px] font-black uppercase text-white shadow-[0_8px_18px_rgba(220,53,69,0.25)]">
          <span className="h-1.5 w-1.5 rounded-full bg-white [animation:hotAuctionPulse_1.2s_ease-in-out_infinite]" />
          LIVE
        </span>
      );
    }
    if (auction.auctionStatus === "ongoing") {
      return (
        <span className="absolute right-3 top-3 inline-flex min-h-7 items-center rounded-full bg-[var(--primary)] px-3 text-[10px] font-black uppercase text-white">
          Ongoing
        </span>
      );
    }
    if (auction.auctionStatus === "upcoming") {
      return (
        <span className="absolute right-3 top-3 inline-flex min-h-7 items-center rounded-full bg-[var(--primary)] px-3 text-[10px] font-black uppercase text-white">
          Upcoming
        </span>
      );
    }
    if (auction.auctionStatus === "completed") {
      return (
        <span className="absolute right-3 top-3 inline-flex min-h-7 items-center rounded-full bg-[var(--success)] px-3 text-[10px] font-black uppercase text-white">
          Past
        </span>
      );
    }
    return null;
  };

  const homeLiveAuctions = auctions.slice(0, 4);
  const paginatedAuctions = hasServerPagination
    ? filteredAuctions
    : filteredAuctions.slice(
        (currentPage - 1) * AUCTIONS_PER_PAGE,
        currentPage * AUCTIONS_PER_PAGE,
      );
  const listToRender = isHome ? homeLiveAuctions : paginatedAuctions;
  const showPagination = !isHome && !isLoading && totalPages > 1;

  return (
    <>
      {!isHome && <Header theme={theme} onToggleTheme={onToggleTheme} />}
      <section
        className={`min-h-[60vh] ${
          isHome
            ? "hot-bg relative overflow-hidden border-t border-[rgba(8,186,247,0.26)] py-[26px] pb-11 max-md:py-7 max-md:pb-[38px]"
            : "pb-8 pt-0"
        }`}
      >
        {isHome && (
          <>
            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(940px,86vw)] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(8,186,247,0.86),rgba(255,196,0,0.7),transparent)]" />
            <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(8,186,247,0.19),transparent_68%)] blur-2xl" />
            <div className="pointer-events-none absolute -right-28 bottom-2 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,196,0,0.14),transparent_66%)] blur-2xl" />
          </>
        )}
        <div className="container relative mx-auto px-4 sm:px-6">
          {isHome && (
            <div className="mb-9 text-center text-[var(--text-primary)]">
              <h2 className="m-0 font-heading text-[clamp(30px,4vw,44px)] font-black uppercase leading-tight">
                {homeShowingUpcoming ? (
                  <>
                    Upcoming <span className="gradient-text mx-2">Auctions</span>
                  </>
                ) : (
                  <>
                    Hot Auctions{" "}
                    <span className="gradient-text mx-2">Happening</span>
                    <strong>Now</strong>
                  </>
                )}
              </h2>
              <p className="mx-auto mt-3 max-w-[560px] text-sm text-[var(--text-secondary)]">
                {homeShowingUpcoming
                  ? "Explore the next auctions and get ready before bidding begins"
                  : "Join live auctions and bid on your favorite teams"}
              </p>
            </div>
          )}

          {!isHome && (
            <div className="sticky top-[88px] z-30 -mx-4 mb-8 px-4 pb-3 pt-0 max-md:top-[68px] sm:-mx-6 sm:px-6">
              <div className="relative flex flex-col gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-2 shadow-[var(--shadow-card)] backdrop-blur-xl">
                <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-70" />

                <div className="flex w-full flex-col items-stretch gap-2 lg:flex-row lg:items-center">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
                    className={`min-h-10 rounded-md border px-4 text-xs font-extrabold uppercase tracking-wide transition-all duration-200 lg:w-auto ${
                      isFilterOpen || hasActiveFilters
                        ? "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"
                        : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Filter size={15} />
                      Filter
                      {hasActiveFilters && (
                        <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                      )}
                    </span>
                  </button>

                  <div className="flex w-full flex-wrap justify-center gap-2 lg:flex-1">
                    {visibleTabs.map((tab) => {
                      const isActive = activeTab === tab.key;

                      return (
                        <button
                          key={tab.key}
                          onClick={() => {
                            setActiveTab(tab.key);
                            setCurrentPage(1);

                            const nextParams = new URLSearchParams(searchParams);
                            if (tab.key === "ongoing") {
                              nextParams.delete("tab");
                            } else {
                              nextParams.set("tab", tab.key);
                            }
                            setSearchParams(nextParams);
                          }}
                          className={`min-h-10 rounded-md px-5 text-xs font-extrabold uppercase tracking-wide transition-all duration-200 max-sm:flex-1 ${
                            isActive
                              ? "border border-[var(--border-primary)] bg-[var(--primary)] text-white shadow-[0_10px_24px_rgba(8,186,247,0.22)]"
                              : "border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleCreateAuction}
                    className="ui-btn-secondary min-h-10 px-5 text-[11px] lg:w-auto"
                  >
                    Create Auction
                  </button>
                </div>

                {isFilterOpen && (
                  <div className="grid gap-2 rounded-md border border-[var(--border-card)] bg-[var(--bg-main)] p-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
                    <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                      Search
                      <input
                        type="search"
                        value={filters.search}
                        onChange={(e) => updateFilter("search", e.target.value)}
                        placeholder="Search auction "
                        className="min-h-10 rounded-md border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm normal-case tracking-normal text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                      From Date
                      <input
                        type="date"
                        value={filters.fromDate}
                        max={filters.toDate || undefined}
                        onChange={(e) => updateFilter("fromDate", e.target.value)}
                        className="min-h-10 rounded-md border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm normal-case tracking-normal text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                      To Date
                      <input
                        type="date"
                        value={filters.toDate}
                        min={filters.fromDate || undefined}
                        onChange={(e) => updateFilter("toDate", e.target.value)}
                        className="min-h-10 rounded-md border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm normal-case tracking-normal text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                      className="min-h-10 self-end rounded-md border border-[var(--border-card)] bg-[var(--bg-card)] px-4 text-xs font-extrabold uppercase tracking-wide text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <X size={14} />
                        Clear
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-4"
            >
              {isLoading && (
                <div className="col-span-full text-center py-20">
                  <div style={{ color: "var(--text-secondary)" }}>
                    Loading auctions...
                  </div>
                </div>
              )}

              {!isLoading && listToRender.length === 0 && (
                <div
                  className="col-span-full py-16 text-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No auctions available
                </div>
              )}

              {!isLoading &&
                listToRender.map((auction, idx) => (
                  <motion.div
                    key={auction._id}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => handleOpenAuction(auction._id)}
                    className="modern-card-lift modern-surface group cursor-pointer overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-card)]"
                  >
                    <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(8,186,247,0.78),rgba(255,196,0,0.62),transparent)]" />
                    <div className="relative h-[166px] overflow-hidden bg-[var(--bg-soft)]">
                      <img
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        src={auction.tournamentId?.bannerLogo || CricketImage}
                        alt={auction.auctionName}
                      />
                      {getStatusBadge(auction)}
                    </div>

                    <div className="p-4">
                      <h3
                        className="mb-2.5 truncate font-heading text-[17px] font-extrabold uppercase leading-tight text-[var(--text-primary)]"
                        title={auction.auctionName}
                      >
                        {auction.auctionName}
                      </h3>

                      <div className="mb-4 flex flex-col gap-2 text-[12px] leading-tight text-[var(--text-secondary)]">
                        <div className="grid grid-cols-[18px_minmax(0,1fr)] items-center gap-2">
                          <MapPin size={15} className="text-[var(--primary)]" />
                          <span className="truncate">
                            {auction.tournamentId?.cityTown || "Location TBA"}
                          </span>
                        </div>

                        <div className="grid grid-cols-[18px_minmax(0,1fr)] items-center gap-2">
                          <Calendar
                            size={14}
                            className="text-[var(--primary)]"
                          />
                          <span className="truncate">
                            {getAuctionDate(
                              auction?.auctionStartedAt,
                              auction?.auctionEndedAt,
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-[18px_minmax(0,1fr)] items-center gap-2">
                          <Users size={14} className="text-[var(--primary)]" />
                          <span className="truncate">
                            {auction.teams?.length || 0} Teams
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAuction(auction._id);
                        }}
                        className={
                          "ui-btn-secondary w-full min-h-[38px] text-xs uppercase"
                        }>
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </AnimatePresence>

          {showPagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-8"
              summaryPrefix={`${totalAuctions} auctions | Page`}
            />
          )}

          {isHome && auctions.length > 0 && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => navigate("/auction")}
                className="ui-btn-ghost min-w-[240px]"
              >
                View All Auctions {"->"}
              </button>
            </div>
          )}
        </div>
      </section>
      {!isHome && <ChatBot />}
      {!isHome && <Footer />}
    </>
  );
};

export default HotAuctions;
