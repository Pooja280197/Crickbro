import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import { fetchAuctions } from "../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginPopup } from "../../context/LoginPopupContext";
import CricketImage from "../../assets/Images/cricket_bg.png";

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

/* ---------------- TABS ---------------- */

const tabs = [
  { key: "ongoing", label: "Ongoing" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Past" },
  { key: "my", label: "My auctions" },
];

const HotAuctions = ({ theme, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState("ongoing");
  const [loginRefresh, setLoginRefresh] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openLoginPopup } = useLoginPopup();
  const playerId = localStorage.getItem("playerId");
  const isLoggedIn = Boolean(playerId);

  const isHome = window.location.pathname === "/";

  const visibleTabs = tabs.filter((tab) => {
    if (tab.key === "my") return isLoggedIn;
    return true;
  });

  const isLoading = useSelector((state) => state.loading?.auctionList || false);
  const auctionData = useSelector((state) => state.data?.auctionList || null);
  const auctions = auctionData?.data || [];

  useEffect(() => {
    const handleLoginEvent = () => setLoginRefresh((prev) => prev + 1);
    window.addEventListener("userLoggedIn", handleLoginEvent);
    return () => window.removeEventListener("userLoggedIn", handleLoginEvent);
  }, []);

  useEffect(() => {
    if (activeTab === "my") {
      if (playerId) dispatch(fetchAuctions(activeTab, playerId));
    } else {
      dispatch(fetchAuctions(activeTab, null));
    }
  }, [dispatch, playerId, activeTab, loginRefresh]);

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
        <span className="auction-status auction-status-live">
          <span className="auction-status-dot" />
          LIVE
        </span>
      );
    }
    if (auction.auctionStatus === "ongoing") {
      return <span className="auction-status auction-status-primary">Ongoing</span>;
    }
    if (auction.auctionStatus === "upcoming") {
      return <span className="auction-status auction-status-primary">Upcoming</span>;
    }
    if (auction.auctionStatus === "completed") {
      return <span className="auction-status auction-status-success">Past</span>;
    }
    return null;
  };

  const homeLiveAuctions = auctions.slice(0, 4);
  const listToRender = isHome ? homeLiveAuctions : auctions;

  return (
    <>
      {!isHome && <Header theme={theme} onToggleTheme={onToggleTheme} />}
      <section
        className={`hot-auctions-section min-h-[60vh] ${
          isHome ? "hot-bg hot-auctions-home" : "pb-8 pt-0"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          {isHome && (
            <div className="hot-auctions-heading">
              <h2>
                Hot Auctions <span>Happening</span> <strong>Now</strong>
              </h2>
              <p>Join live auctions and bid on your favorite teams</p>
            </div>
          )}

          {!isHome && (
            <div className="sticky top-[76px] z-30 -mx-4 mb-8 px-4 pb-3 pt-0 max-md:top-[68px] sm:-mx-6 sm:px-6">
              <div className="relative flex flex-col items-center gap-3 rounded-lg border border-[var(--border-card)] bg-[rgba(0,17,38,0.82)] p-2 shadow-[0_18px_42px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:flex-row sm:justify-center">
                <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-70" />

                <div className="flex w-full flex-wrap justify-center gap-2 sm:w-auto">
                  {visibleTabs.map((tab) => {
                    const isActive = activeTab === tab.key;

                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`min-h-10 rounded-md px-5 text-xs font-extrabold uppercase tracking-wide transition-all duration-200 max-sm:flex-1 ${
                          isActive
                            ? "text-[var(--text-dark)] shadow-[0_10px_24px_rgba(255,196,0,0.24)]"
                            : "border border-[var(--border-soft)] bg-white/[0.03] text-[var(--text-secondary)] hover:border-[var(--border-primary)] hover:text-[var(--primary)]"
                        }`}
                        style={
                          isActive
                            ? {
                                background:
                                  "linear-gradient(180deg, var(--secondary), var(--secondary-strong))",
                              }
                            : undefined
                        }
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleCreateAuction}
                  className="btn btn-primary min-h-10 px-5 text-[11px] sm:absolute sm:right-2"
                >
                  Create Auction
                </button>
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
                    className="hot-auction-card card-surface"
                  >
                    <div className="hot-auction-image">
                      <img
                        src={auction.tournamentId?.bannerLogo || CricketImage}
                        alt={auction.auctionName}
                      />
                      {getStatusBadge(auction)}
                    </div>

                    <div className="hot-auction-content">
                      <h3 title={auction.auctionName}>{auction.auctionName}</h3>

                      <div className="mb-4 flex flex-col gap-2 text-[12px] leading-tight text-[var(--text-secondary)]">
                        <div className="grid grid-cols-[18px_minmax(0,1fr)] items-center gap-2">
                          <MapPin size={15} className="text-[var(--primary)]" />
                          <span className="truncate">
                            {auction.tournamentId?.cityTown || "Location TBA"}
                          </span>
                        </div>

                        <div className="grid grid-cols-[18px_minmax(0,1fr)] items-center gap-2">
                          <Calendar size={14} className="text-[var(--primary)]" />
                          <span className="truncate">
                            {getAuctionDate(
                              auction?.auctionStartedAt,
                              auction?.auctionEndedAt
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
                        className={`mini-btn ${idx % 2 === 1 ? "mini-btn-blue" : ""}`}
                      >
                        JOIN NOW
                      </button>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </AnimatePresence>

          {isHome && auctions.length > 0 && (
            <div className="flex justify-center mt-10">
              <button onClick={() => navigate("/auction")} className="btn btn-outline-primary">
                View All Auctions {"->"}
              </button>
            </div>
          )}
        </div>
      </section>
      {!isHome && <Footer />}
    </>
  );
};

export default HotAuctions;
