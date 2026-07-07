import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  fetchAuctionDetails,
  EnrollPlayer,
  fetchUserRole,
  getAuctionPlayers,
  fetchProfile,
} from "../../redux/actions";
import Header from "../../components/Header";
import RegisterPopup from "./RegisterPopup";
import PaymentConfirmationModal from "../../components/PaymentConfirmationModal";
import { toast } from "react-toastify";
import {
  connectAuctionSocket,
  disconnectSocket,
} from "../../utils/SocketClient";
import { useDebounce } from "../../components/useDebounce";
import {
  ChevronDown,
  Search,
  Trophy,
  Gavel,
  Users,
  User,
  TrendingUp,
  PlayCircle,
  Award,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Activity,
} from "lucide-react";
import ShowPlayersToAudience from "./ShowPlayersToAudience";
import { useLoginPopup } from "../../context/LoginPopupContext";
import {
  getRazorpayPaymentConfig,
  loadRazorpayScript,
} from "../../utils/RazorPay";
import {
  recoverPaidAuctionRegistration,
  resolveAuctionRegistrationPollIds,
  waitForAuctionRegistrationViaWebhook,
} from "../../utils/auctionRegisterPayment";
import { logoUrl } from "../../config/env";
import RegistrationDetails from "../../components/RegistrationDetails";
import TeamRegistrationPopup from "./TeamRegistrationPopup";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const StatCard = ({ icon: Icon, label, value }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="modern-card-lift modern-surface min-w-0 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)]"
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="modern-icon-pop rounded-lg bg-[var(--accent-light)] p-2 shrink-0">
        <Icon className="h-4 w-4 text-[var(--primary)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          {label}
        </p>
        <p
          className="mt-0.5 max-w-full truncate text-sm font-bold text-[var(--text-primary)]"
          title={String(value || "")}
        >
          {value}
        </p>
      </div>
    </div>
  </motion.div>
);

const Skeleton = () => (
  <div className="animate-pulse space-y-4 bg-[var(--bg-main)] p-4">
    <div className="h-56 rounded-xl bg-[var(--bg-card)]" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-lg bg-[var(--bg-card)]"
        />
      ))}
    </div>
    <div className="h-32 rounded-xl bg-[var(--bg-card)]" />
  </div>
);

const TABS = {
  TOURNAMENT: "tournament",
  AUCTION: "auction",
  TEAMS: "teams",
  PLAYERS: "players",
  BIDDING: "bidding",
};

const getEntityId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || value.tournamentId || "";
};

const panelClass =
  "modern-card-lift modern-surface rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]";
const tileClass =
  "modern-card-lift rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-2.5";
const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-dark)]";
const heroPrimaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200/45 bg-gradient-to-b from-[#11d3ff] to-[#008df2] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(0,148,255,0.24)] transition-all hover:-translate-y-0.5 hover:from-[#38dcff] hover:to-[#006fd6] hover:shadow-[0_14px_30px_rgba(0,148,255,0.34)]";
const viewRegistrationButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200/45 bg-white/95 px-4 py-2 text-sm font-bold text-[#08203d] shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-0.5 hover:border-cyan-100 hover:bg-cyan-50 hover:text-[#001f44] hover:shadow-[0_14px_30px_rgba(8,186,247,0.28)]";
const teamRegisterButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200/70 bg-gradient-to-b from-[#ffe27a] to-[#ffb000] px-4 py-2 text-sm font-bold text-[#102033] shadow-[0_10px_24px_rgba(255,176,0,0.24)] transition-all hover:-translate-y-0.5 hover:from-[#fff0a6] hover:to-[#ff9500] hover:shadow-[0_14px_30px_rgba(255,176,0,0.34)]";
const outlineButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-dark)] hover:text-[var(--text-primary)]";

const DetailTile = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`${tileClass} ${className}`}>
    <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
      {Icon && <Icon className="h-3.5 w-3.5 text-[var(--primary)]" />}
      {label}
    </div>
    <p className="truncate text-sm font-bold text-[var(--text-primary)]">{value || "N/A"}</p>
  </div>
);

const PlayersTab = ({
  searchQuery,
  setSearchQuery,
  playerList,
  itemsPerPage,
  setItemsPerPage,
  totalPages,
  currentPageState,
  setCurrentPageState,
  fetchPlayers,
  totalPlayers,
}) => {
  const [isItemsDropdownOpen, setIsItemsDropdownOpen] = useState(false);
  return (
    <div className="space-y-4">
      <div className={`${panelClass} flex flex-col justify-between gap-3 p-3 md:flex-row md:items-center`}>
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search player by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] py-2.5 pl-10 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            autoComplete="off"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
          >
            <span>Show {itemsPerPage}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${isItemsDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>
          {isItemsDropdownOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
              {[16, 32, 64, 96].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setItemsPerPage(num);
                    setCurrentPageState(1);
                    setIsItemsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--accent-light)] ${itemsPerPage === num
                      ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                      : "text-[var(--text-primary)]"
                    }`}
                >
                  {num} players
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {playerList?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {playerList?.map((item) => {
              const playerType = item?.playersRatings?.playerType;
              return (
                <ShowPlayersToAudience
                  key={item?._id}
                  player={item}
                  type={playerType}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] py-10 text-center shadow-[var(--shadow-card)]">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-light)]">
              <Search className="w-6 h-6 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-md font-semibold text-[var(--text-primary)]">
              No players found
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={`${panelClass} mx-auto flex max-w-7xl items-center justify-center gap-3 p-3`}>
          <button
            onClick={() => {
              setCurrentPageState(currentPageState - 1);
              fetchPlayers("all", currentPageState - 1);
            }}
            disabled={currentPageState === 1}
            className="rounded-lg border border-[var(--border-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Previous
          </button>

          <span className="text-sm text-[var(--text-secondary)] px-3">
            Page{" "}
            <span className="font-semibold text-[var(--primary)]">
              {currentPageState}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--primary)]">
              {totalPages}
            </span>
          </span>

          <button
            onClick={() => {
              setCurrentPageState(currentPageState + 1);
              fetchPlayers("all", currentPageState + 1);
            }}
            disabled={currentPageState === totalPages}
            className="rounded-lg border border-[var(--border-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next →
          </button>

          <span className="text-sm text-[var(--text-secondary)] ml-3">
            Total:{" "}
            <span className="font-semibold text-[var(--primary)]">
              {totalPlayers}
            </span>{" "}
            players
          </span>
        </div>
      )}
    </div>
  );
};

export default function AuctionDetailsPage({ theme, onToggleTheme }) {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [registerPopupOpen, setRegisterPopupOpen] = useState(false);
  const [teamRegisterPopupOpen, setTeamRegisterPopupOpen] = useState(false);
  const [paymentConfirmationOpen, setPaymentConfirmationOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [socketData, setSocketData] = useState(null);
  const [socketInstance, setSocketInstance] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const [statusSort, setStatusSort] = useState("");
  const [typeSort, setTypeSort] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPageState, setCurrentPageState] = useState(1);
  const [activeTab, setActiveTab] = useState(TABS.TOURNAMENT);
  const [showDetails, setShowDetails] = useState(false);
  const [landingPageAvailable, setLandingPageAvailable] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { openLoginPopup } = useLoginPopup();

  // const [isItemsDropdownOpen, setIsItemsDropdownOpen] = useState(false);

  const isLoading = useSelector((state) => state.loading?.auctionDetails);

  const auctionData = useSelector((state) => state.data?.auctionDetails);
  const userRole = useSelector((state) => state.data?.userRole);
  const auctionPlayersData = useSelector(
    (state) => state?.data?.auctionPlayers,
  );
  const playerList = auctionPlayersData?.list;
  const totalPages = auctionPlayersData?.pages;
  const totalPlayers = auctionPlayersData?.total;
  const currentPage = auctionPlayersData?.page;
  const landingTournamentId =
    getEntityId(auctionData?.tournamentId) ||
    getEntityId(auctionData?.tournament);
  const landingPageUrl =
    landingTournamentId && auctionId
      ? `/landing-page/${landingTournamentId}/${auctionId}`
      : "";

  const sortPlayers = [
    { value: "all", label: "All" },
    { value: "select", label: "Selected" },
    { value: "not select", label: "Not Selected" },
    { value: "pending", label: "Pending" },
    { value: "not reached", label: "Not Reached" },
  ];

  const activePlayerTab = "all";

  const fetchPlayers = (activePlayerTab, page = 1) => {
    dispatch(
      getAuctionPlayers({
        auctionId: auctionId,
        activePlayerTab,
        page,
        itemsPerPage,
        statusSort,
        typeSort,
        debouncedSearch,
      }),
    );
  };

  useEffect(() => {
    setCurrentPageState(1);
    fetchPlayers(activePlayerTab, 1);
  }, [activePlayerTab, statusSort, typeSort, debouncedSearch, itemsPerPage]);

  const handleSocketData = useCallback((data) => {
    const payload = data?.data || data;
    console.log("Received socket data:", payload);

    setSocketData((prev) => ({
      ...payload,
      currentPlayer: payload?.currentPlayer
        ? { ...payload.currentPlayer }
        : null,
    }));
  }, []);

  useEffect(() => {
    fetchPlayers("all");
  }, []);

  useEffect(() => {
    if (!auctionId) return;
    const socket = connectAuctionSocket({
      auctionId,
      onSnapshot: handleSocketData,
      onUpdate: handleSocketData,
      onDisconnect: (r) => console.log("Socket disconnected:", r),
      onError: (e) => console.error("Socket error:", e),
    });

    console.log("Socket connected:", socket);
    setSocketInstance(socket);

    return () => {
      console.log("Cleaning up socket");
      socket?.disconnect?.();
    };
  }, [auctionId, handleSocketData]);

  useEffect(() => {
    if (auctionId) {
      dispatch(fetchAuctionDetails(auctionId));
      const playerId = localStorage.getItem("playerId");
      if (playerId) {
        dispatch(fetchUserRole(auctionId, playerId));
      }
    }
  }, [dispatch, auctionId]);

  useEffect(() => {
    let isActive = true;

    const checkLandingPage = async () => {
      if (!landingTournamentId || !auctionId) {
        setLandingPageAvailable(false);
        return;
      }

      try {
        const response = await api.get(
          `/webSiteApi/auctionLandingPage/auctionLandingPage?tournamentId=${landingTournamentId}&auctionId=${auctionId}`,
        );

        if (isActive) {
          setLandingPageAvailable(Boolean(response?.data?.data?.landingPage));
        }
      } catch (error) {
        if (isActive) {
          setLandingPageAvailable(false);
        }
      }
    };

    checkLandingPage();

    return () => {
      isActive = false;
    };
  }, [landingTournamentId, auctionId]);

  const enrollPlayer = async (formData) => {
    const playerId = localStorage.getItem("playerId");

    try {
      const response = await dispatch(EnrollPlayer(auctionId, formData));
      const resData = response?.data?.data;

      // 🟢 CASE 1: Payment NOT required
      if (!resData?.paymentRequired) {
        toast.success("Successfully Registered For The Tournament");
        setRegisterPopupOpen(false);
        dispatch(fetchUserRole(auctionId, playerId));
        return;
      }

      // 🔴 CASE 2: Payment REQUIRED - Show confirmation modal
      setPaymentData(resData);
      setPaymentConfirmationOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Enrollment Failed");
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!paymentData) return;

    try {
      await openRazorpay(paymentData);
      setPaymentConfirmationOpen(false);
    } catch (error) {
      console.error("Error opening Razorpay:", error);
      toast.error("Failed to open payment gateway");
    }
  };

  const openRazorpay = async (data) => {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    const options = {
      key: data.paymentDetails.razorpayKeyId || "rzp_test_SEMjn2EKQHa5FH",
      amount: data.paymentDetails.amount,
      currency: data.paymentDetails.currency,
      order_id: data.paymentDetails.orderId,

      name: data.auctionDetails.auctionName,
      description: "Auction Registration Fee",
      image: logoUrl,

      prefill: {
        name: data.player.name,
        contact: data.player.mobile,
      },

      ...getRazorpayPaymentConfig(),

      handler: async function (response) {
        await verifyPayment(response, data);
      },

      modal: {
        ondismiss: function () {
          toast.info("Payment cancelled");
        },
      },

      theme: { color: "#AA0909" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (response, data) => {
    const { auctionId: aid, playerId: pid } = resolveAuctionRegistrationPollIds(
      data,
      auctionId,
    );
    const paymentRef = response?.razorpay_payment_id || "";

    if (!aid || !pid) {
      toast.error(
        "Could not confirm registration (missing auction or player). Save your payment ID and contact support.",
      );
      setRegisterPopupOpen(false);
      dispatch(
        fetchUserRole(auctionId, localStorage.getItem("playerId")),
      );
      return;
    }

    try {
      toast.info(
        "Payment received. Confirming registration (this may take a few seconds)…",
      );
      const recovered = await recoverPaidAuctionRegistration({
        response,
        data,
        routeAuctionId: auctionId,
      });
      if (recovered.ok) {
        toast.success("Registration completed successfully");
        setRegisterPopupOpen(false);
        dispatch(fetchUserRole(aid, pid));
        return;
      }

      const result = await waitForAuctionRegistrationViaWebhook({
        auctionId: aid,
        playerId: pid,
      });

      if (result.authError) {
        toast.error(
          result.reason === "unauthorized"
            ? "Session expired. Log in again, then refresh to confirm registration."
            : "Could not verify registration for this account.",
        );
      } else if (result.ok) {
        toast.success("Registration completed successfully 🎉");
      } else {
        const recoveredAfterPoll = await recoverPaidAuctionRegistration({
          response,
          data,
          routeAuctionId: auctionId,
        });
        if (recoveredAfterPoll.ok) {
          toast.success("Registration completed successfully");
          setRegisterPopupOpen(false);
          dispatch(fetchUserRole(aid, pid));
          return;
        }
        toast.warning(
          `Registration is still processing. Payment ID: ${paymentRef || "—"}. Refresh the page in a minute or contact support if this persists.`,
        );
      }

      setRegisterPopupOpen(false);
      dispatch(fetchUserRole(aid, pid));
    } catch (error) {
      console.error("Registration confirmation failed:", error);
      toast.error(
        error?.response?.data?.message ||
        "Could not confirm registration. If payment was deducted, save your Razorpay payment ID and contact support.",
      );
      setRegisterPopupOpen(false);
      dispatch(fetchUserRole(aid, pid));
    }
  };

  const handleRegisterClick = () => {
    const token = localStorage.getItem("token");
    const playerId = localStorage.getItem("playerId");
    // If user NOT logged in
    if (!token || !playerId) {
      openLoginPopup(() => {
        const newPlayerId = localStorage.getItem("playerId");

        if (newPlayerId) {
          dispatch(fetchProfile(newPlayerId));
        }

        setRegisterPopupOpen(true);
      });

      return;
    }

    // If already logged in
    dispatch(fetchUserRole(auctionId, playerId));
    setRegisterPopupOpen(true);
  };

  const navigateToLandingRegistration = (type) => {
    navigate(`${landingPageUrl}?registration=${type}`);
  };

  const handlePlayerRegisterClick = () => {
    if (landingPageAvailable && landingPageUrl) {
      navigateToLandingRegistration("player");
      return;
    }

    handleRegisterClick();
  };

  const handleTeamRegisterClick = () => {
    if (landingPageAvailable && landingPageUrl) {
      navigateToLandingRegistration("team");
      return;
    }

    setTeamRegisterPopupOpen(true);
  };

  const handleViewDetails = () => {
    setShowDetails(true)
  }

  if (isLoading || !auctionData) {
    return <Skeleton />;
  }

  const { auctionRules, teams, tournamentId } = auctionData;
  const currentPlayer =
    typeof socketData?.currentPlayer === "object"
      ? socketData.currentPlayer
      : null;



  const TournamentTab = () => {
    const startDate = tournamentId?.startDate
      ? new Date(tournamentId.startDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "N/A";
    const endDate = tournamentId?.endDate
      ? new Date(tournamentId.endDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "N/A";

    return (
      <div className="space-y-4">
        <div className={`${panelClass} overflow-hidden`}>
          <div className="flex flex-col gap-2 border-b border-[var(--border-card)] bg-[var(--bg-main)] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                <Trophy size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--primary)]">
                  Tournament
                </p>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Tournament Details
                </h2>
              </div>
            </div>
            <span className="w-fit rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1 text-xs font-bold capitalize text-[var(--primary)]">
              {tournamentId?.tournamentType || "Tournament"}
            </span>
          </div>

          <div className="grid gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailTile icon={MapPin} label="Ground" value={tournamentId?.groundName} />
            <DetailTile icon={Calendar} label="Duration" value={`${startDate} - ${endDate}`} />
            <DetailTile icon={User} label="Organizer" value={tournamentId?.organizerName} />
            <DetailTile
              icon={DollarSign}
              label="Entry Fee"
              value={`₹${Number(tournamentId?.entryFees || 0).toLocaleString("en-IN")}`}
            />
            <DetailTile icon={Activity} label="Pitch Type" value={tournamentId?.pitchType?.charAt(0)?.toUpperCase() + tournamentId?.pitchType?.slice(1)} />
            <DetailTile icon={Trophy} label="Match Type" value={tournamentId?.matchType?.charAt(0)?.toUpperCase() + tournamentId?.matchType?.slice(1)} />
          </div>
        </div>

        {auctionData?.tournament?.awardList?.length > 0 && (
          <div className={`${panelClass} p-3`}>
            <div className="mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">Awards</h2>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {auctionData?.tournament?.awardList?.map((award, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -2 }}
                  className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    {award?.award}
                  </p>
                  <p className="mt-1 text-base font-bold text-[var(--primary)]">
                    {award?.cashValue}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const AuctionTab = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
        <h2 className="text-base font-bold mb-3 text-[var(--text-primary)] flex items-center gap-2">
          <Gavel className="w-5 h-5 text-[var(--primary)]" />
          Auction Status
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Auction Type
            </p>
            <p className="font-semibold text-[var(--text-primary)] capitalize">
              {auctionData?.auctionType === "auto"
                ? "⚡ Automated Auction"
                : "👨 Manual Auction"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Bidding Status
            </p>
            <p
              className={`font-semibold inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${auctionData?.isBiddingActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${auctionData?.isBiddingActive ? "bg-green-500" : "bg-red-500"}`}
              />
              {auctionData?.auctionStatus}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
              <Clock className="w-3 h-3" /> Auction Period
            </p>
            <p className="font-semibold text-[var(--text-primary)]">
              {auctionData?.auctionStartedAt &&
                new Date(auctionData.auctionStartedAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                )}
              {auctionData?.auctionEndedAt &&
                ` - ${new Date(auctionData.auctionEndedAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                )}`}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Total Teams
            </p>
            <p className="font-semibold text-[var(--text-primary)]">
              {teams?.length} Teams
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
        <h2 className="text-base font-bold mb-3 text-[var(--text-primary)]">
          Auction Rules
        </h2>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Budget Cap:</span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              ₹{auctionRules?.budgetCap?.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Max Foreign Players:</span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              {auctionRules?.maxForeignPlayers} Players
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Max Players per Team:</span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              {auctionRules?.maxPlayersPerTeam} Players
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Min Players per Team:</span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              {auctionRules?.minPlayersPerTeam} Players
            </span>
          </div>


          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Max Purchase Player per Team:</span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              {auctionRules?.maxPurchasePlayersPerTeam} Players
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Min Purchase Player per Team:</span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              {auctionRules?.minPurchasePlayersPerTeam} Players
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Min Bid:</span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              ₹{auctionRules?.minimumBid?.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Bid Increment:</span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              ₹{auctionRules?.biddingIncrement}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Players/Team:</span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              {auctionRules?.minPlayersPerTeam} -{" "}
              {auctionRules?.maxPlayersPerTeam}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Max Foreign:</span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              {auctionRules?.maxForeignPlayers}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">
              Wicket Keepers:
            </span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              {auctionRules?.minWicketKeepers} -{" "}
              {auctionRules?.maxWicketKeepers}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Unsold Player Re-entry:</span>
            <span
              className={`font-semibold ml-auto ${auctionRules?.rtmEnabled ? "text-green-600" : "text-red-600"}`}
            >
              {auctionRules?.rtmEnabled ? "✓ Enabled" : "✗ Disabled"}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">RTM:</span>
            <span
              className={`font-semibold ml-auto ${auctionRules?.rtmEnabled ? "text-green-600" : "text-red-600"}`}
            >
              {auctionRules?.rtmEnabled ? "✓ Enabled" : "✗ Disabled"}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-main)] p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Max RTM Cards per Team:</span>
            <span className="font-semibold text-[var(--text-primary)] ml-auto">
              {auctionRules?.maxRTMCardsPerTeam}
            </span>
          </div>


        </div>
      </div>

      {auctionData?.stream?.isLive && auctionData?.stream?.streamUrl && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Live Stream Available
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {auctionData?.stream?.platform || "Streaming Platform"}
            </p>
          </div>
          <a
            href={auctionData?.stream.streamUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2 rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            Watch Live
          </a>
        </div>
      )}
    </div>
  );

  const TeamsTab = () => (
    <div>
      <h2 className="text-base font-bold mb-3 text-[var(--text-primary)] flex items-center gap-2">
        <Users className="w-5 h-5 text-[var(--primary)]" />
        Teams ({teams?.length || 0})
      </h2>

      {teams?.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <motion.div
              key={team?.teamId?._id || team?.teamId}
              whileHover={{ y: -2 }}
              className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] transition-all hover:border-[var(--border-primary)]"
            >
              <div className="flex gap-4">
                <img
                  src={team?.teamId?.logo}
                  alt={team?.teamId?.name}
                  className="w-16 h-16 rounded-lg object-cover border border-[var(--border-card)]"
                />

                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {team?.teamId?.name}
                  </h3>

                  <div className="mt-2 space-y-1">
                    <p className="text-xs">
                      <span className="text-[var(--text-secondary)]">
                        Initial:
                      </span>{" "}
                      <span className="font-semibold text-[var(--text-primary)]">
                        ₹{team?.initialBudget?.toLocaleString()}
                      </span>
                    </p>

                    <p className="text-xs">
                      <span className="text-[var(--text-secondary)]">
                        Remaining:
                      </span>{" "}
                      <span className="font-semibold text-[var(--primary)]">
                        ₹{team?.remainingBudget?.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] py-10 text-center shadow-[var(--shadow-card)]">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-light)]">
            <Search className="w-6 h-6 text-[var(--text-secondary)]" />
          </div>

          <h3 className="text-md font-semibold text-[var(--text-primary)]">
            No Teams Found
          </h3>
        </div>
      )}
    </div>
  );

  const BiddingTab = () => {
    const latestBid =
      currentPlayer?.bidHistory?.[currentPlayer?.bidHistory?.length - 1];
    const currentPlayerStatus = String(currentPlayer?.status || "")
      .trim()
      .toLowerCase();
    const isSold = currentPlayerStatus === "sold";
    const isUnsold = currentPlayerStatus === "unsold";
    const hasFinalStatus = isSold || isUnsold;

    return (
      <div className="space-y-6">
        {currentPlayer ? (
          <div className="relative overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
            <AnimatePresence>
              {hasFinalStatus && (
                <motion.div
                  key={`${currentPlayer?._id || currentPlayer?.playerId || currentPlayer?.batchId}-${currentPlayerStatus}`}
                  initial={{ opacity: 0, scale: 0.88, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: -8 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
                >
                  <motion.div
                    initial={{ y: 26 }}
                    animate={{ y: [26, 0, 0], scale: [0.98, 1.06, 1] }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className={`rounded-xl border-4 px-8 py-4 text-4xl font-black uppercase tracking-[0.22em] shadow-2xl sm:text-6xl ${
                      isSold
                        ? "border-emerald-300 bg-emerald-600/90 text-white shadow-emerald-900/30"
                        : "border-red-300 bg-red-600/90 text-white shadow-red-900/30"
                    }`}
                  >
                    {isSold ? "Sold" : "Unsold"}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[var(--primary)]" />
                Live Auction
              </h2>
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${
                  isSold
                    ? "bg-emerald-100 text-emerald-700"
                    : isUnsold
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSold
                      ? "bg-emerald-500"
                      : isUnsold
                        ? "bg-red-500"
                        : "bg-green-500 animate-pulse"
                  }`}
                />
                {isSold ? "SOLD" : isUnsold ? "UNSOLD" : "BIDDING ACTIVE"}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex gap-4 items-center flex-1">
                <img
                  src={currentPlayer?.profilePicture}
                  alt={currentPlayer?.name}
                  className="h-24 w-20 rounded-xl object-cover border border-[var(--border-card)]"
                />

                <div className="flex-1">
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {currentPlayer?.name}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    <span className="rounded-md bg-[var(--bg-main)] px-2 py-1 text-[var(--text-secondary)]">
                      Batch: {currentPlayer?.batchId}
                    </span>
                    <span className="rounded-md bg-[var(--bg-main)] px-2 py-1 text-[var(--text-secondary)]">
                      Category: {currentPlayer?.categoryName}
                    </span>
                    {currentPlayer.role && (
                      <span className="rounded-md bg-[var(--bg-main)] px-2 py-1 text-[var(--text-secondary)]">
                        Role: {currentPlayer?.role?.charAt(0)?.toUpperCase() + currentPlayer?.role?.slice(1)}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex gap-4 text-sm">
                    <p className="text-[var(--text-secondary)]">
                      Base Price:{" "}
                      <span className="text-[var(--text-primary)] font-semibold">
                        ₹{currentPlayer?.basePrice?.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      Increment:{" "}
                      <span className="text-[var(--text-primary)] font-semibold">
                        ₹{currentPlayer?.biddingIncrement}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--bg-main)] p-4 text-center lg:w-64">
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                  Current Bid
                </p>
                <p className="text-2xl font-bold text-[var(--primary)] mt-1">
                  ₹{currentPlayer?.currentBid?.toLocaleString()}
                </p>

                {latestBid && (
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Leading:{" "}
                    <span className="font-semibold text-[var(--text-primary)]">
                      {latestBid.teamName}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {currentPlayer.bidHistory?.length > 0 && (
              <div className="mt-6 min-h-0">
                <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                  Bid History
                </h3>
                <div className="max-h-56 min-h-0 space-y-2 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:var(--primary)_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--primary)]">
                  {[...currentPlayer.bidHistory].reverse().map((bid, idx) => (
                    <div
                      key={idx}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-[var(--bg-main)] px-4 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate font-medium text-[var(--text-primary)]">
                        {bid?.teamName}
                      </span>
                      <span className="shrink-0 font-semibold text-[var(--primary)]">
                        ₹{bid?.bidAmount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] py-12 text-center shadow-[var(--shadow-card)]">
            <Activity className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              No Active Bidding
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Waiting for the next player to enter the auction
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case TABS.TOURNAMENT:
        return <TournamentTab />;
      case TABS.AUCTION:
        return <AuctionTab />;
      case TABS.TEAMS:
        return auctionData?.teamPublic ? (
          <TeamsTab />
        ) : (
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] py-12 text-center shadow-[var(--shadow-card)]">
            <Users className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Teams Not Public
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Team information is not publicly available
            </p>
          </div>
        );
      case TABS.PLAYERS:
        return auctionData?.playerPublic ? (
          <PlayersTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            playerList={playerList}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            totalPages={totalPages}
            currentPageState={currentPageState}
            setCurrentPageState={setCurrentPageState}
            fetchPlayers={fetchPlayers}
            totalPlayers={totalPlayers}
          />
        ) : (
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] py-12 text-center shadow-[var(--shadow-card)]">
            <User className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Players Not Public
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Player information is not publicly available
            </p>
          </div>
        );
      case TABS.BIDDING:
        return socketData ? (
          <BiddingTab />
        ) : (
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] py-12 text-center shadow-[var(--shadow-card)]">
            <TrendingUp className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Live Bidding Not Available
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Live bidding data is not available at the moment
            </p>
          </div>
        );
      default:
        return <TournamentTab />;
    }
  };

  return (
    <div className="public-auction-page min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <div className="mx-auto max-w-6xl space-y-4 px-3 py-4 pb-28 sm:px-5 sm:py-5 lg:pb-5">
        {/* Hero Section */}
        <div className={`${panelClass} relative overflow-hidden`}>
          <img
            src={tournamentId?.bannerLogo}
            alt="banner"
            className="h-40 w-full object-cover sm:h-44 lg:h-48"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex min-w-0 items-end gap-3">
                <img
                  src={tournamentId?.logo}
                  alt="logo"
                  className="h-12 w-12 shrink-0 rounded-lg border-2 border-white bg-white object-cover shadow-lg sm:h-14 sm:w-14"
                />
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm ${auctionData?.auctionStatus === "ongoing"
                          ? "bg-green-500 text-white"
                          : auctionData?.auctionStatus === "completed"
                            ? "bg-blue-500 text-white"
                            : "bg-[var(--primary)] text-white"
                        }`}
                    >
                      {auctionData?.auctionStatus?.toUpperCase() || "Auction"}
                    </span>
                    {socketData && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                        Live
                      </span>
                    )}
                  </div>
                  <div>
                    <h1 className="inline-block max-w-full rounded-md bg-black/45 px-2 py-1 font-heading text-xl font-black leading-tight !text-white shadow-sm backdrop-blur-[2px] sm:text-2xl">
                      {auctionData?.auctionName}
                    </h1>
                    <p className="mt-0.5 text-xs font-medium text-white/90 drop-shadow sm:text-sm">
                      {tournamentId?.name} • {auctionData?.cityTown || tournamentId?.cityTown || "Auction"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                {auctionData?.showRegistrationForm && (
                  <button
                    onClick={userRole?.auctionPlayer ? handleViewDetails : handlePlayerRegisterClick}
                    className={userRole?.auctionPlayer ? viewRegistrationButtonClass : heroPrimaryButtonClass}
                  >
                    {userRole?.auctionPlayer ? "View Registration" : "Register as Player"}
                  </button>
                )}
                {auctionData?.teamRegistration?.showTeamRegistration && (
                  <button
                    onClick={handleTeamRegisterClick}
                    className={teamRegisterButtonClass}
                  >
                    Register Team
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:[grid-template-columns:repeat(4,minmax(0,1fr))]">
          <StatCard icon={Users} label="Teams" value={teams?.length || 0} />
          <StatCard
            icon={MapPin}
            label="Ground"
            value={tournamentId?.groundName || "N/A"}
          />
          <StatCard
            icon={Activity}
            label="Match Type"
            value={tournamentId?.matchType?.toUpperCase() || "N/A"}
          />
          <StatCard
            icon={Trophy}
            label="Ball Type"
            value={
              tournamentId?.ballType
                ? tournamentId.ballType.charAt(0).toUpperCase() +
                tournamentId.ballType.slice(1)
                : "N/A"
            }
          />
        </div>

        {/* Tabs Navigation */}
        <div className={`${panelClass} p-1.5`}>
          <nav className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab(TABS.TOURNAMENT)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:text-sm ${activeTab === TABS.TOURNAMENT
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Tournament
              </div>
            </button>

            <button
              onClick={() => setActiveTab(TABS.AUCTION)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:text-sm ${activeTab === TABS.AUCTION
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                }`}
            >
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4" />
                Auction
              </div>
            </button>

            {auctionData?.teamPublic && (
              <button
                onClick={() => setActiveTab(TABS.TEAMS)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:text-sm ${activeTab === TABS.TEAMS
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Teams
                </div>
              </button>
            )}

            {auctionData?.playerPublic && (
              <button
                onClick={() => setActiveTab(TABS.PLAYERS)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:text-sm ${activeTab === TABS.PLAYERS
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Players
                </div>
              </button>
            )}

            
              <button
                onClick={() => setActiveTab(TABS.BIDDING)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:text-sm ${activeTab === TABS.BIDDING
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Live Bidding
                </div>
              </button>
            
          </nav>
        </div>

        {/* Active Tab Content */}
        <div className="min-h-[400px]">{renderActiveTab()}</div>

        {/* Mobile Register Button */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-card)] bg-[var(--bg-card)]/95 px-3 py-3 shadow-[0_-12px_30px_rgba(0,0,0,0.18)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
          {auctionData?.showRegistrationForm && (
            <button
              onClick={userRole?.auctionPlayer ? handleViewDetails : handlePlayerRegisterClick}
              className={`w-full px-5 py-3 ${userRole?.auctionPlayer ? viewRegistrationButtonClass : heroPrimaryButtonClass}`}
            >
              {userRole?.auctionPlayer ? "✓ View Registration" : "Register as Player"}
            </button>
          )}
          {auctionData?.teamRegistration?.showTeamRegistration && (
            <button
              onClick={handleTeamRegisterClick}
              className={`w-full px-8 py-3 ${teamRegisterButtonClass}`}
            >
              Register Team
            </button>
          )}
          </div>
        </div>

        {showDetails &&
          <RegistrationDetails
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
            auctionId={auctionId}
          />
        }
      </div>

      <RegisterPopup
        isOpen={registerPopupOpen}
        onClose={() => setRegisterPopupOpen(false)}
        onConfirm={enrollPlayer}
        auctionId={auctionId}
        isTrialType={auctionData?.showTrialLocations}
        playerRegistrationFiels={auctionData?.playerRegistrationFiels}
        feeType={auctionData?.feeType}
        roleBasedFees={auctionData?.roleBasedFees}
      />

      <TeamRegistrationPopup
        isOpen={teamRegisterPopupOpen}
        onClose={() => setTeamRegisterPopupOpen(false)}
        auctionId={auctionId}
        tournamentId={auctionData?.tournament?.id || auctionData?.tournamentId}
        teamRegistration={auctionData?.teamRegistration}
        auctionName={auctionData?.auctionName}
        onSuccess={() => dispatch(fetchAuctionDetails(auctionId))}
      />

      <PaymentConfirmationModal
        isOpen={paymentConfirmationOpen}
        onClose={() => setPaymentConfirmationOpen(false)}
        onConfirm={handlePaymentConfirmation}
        paymentDetails={paymentData?.paymentDetails}
        auctionDetails={paymentData?.auctionDetails}
        player={paymentData?.player}
      />

    </div>
  );
}
