import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  Award,
  Shield,
  Gavel,
  Clock,
  DollarSign,
  Settings,
  User,
  Users as UsersIcon,
  Star,
  Globe,
  Pencil,
  Trash,
  UserPlus,
  X,
  Search,
  Download,
  CheckSquare,
  Square,
  UserCheck,
  Filter,
  Plus, // Added missing Plus icon
  Edit,
  Trash2,
  Wallet,
  Info,
  Trophy,
  ScrollText,
  Menu,
  LayoutGrid,
  Table2,
  Eye,
} from "lucide-react";
import PlayerAssign from "../../../../components/PlayerAssign";
import PlayerCard, {
  PlayerDetailsModal,
} from "../../../../components/PlayerCard";
import { useDebounce } from "../../../../components/useDebounce";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAuctionDetails,
  fetchSlotList,
  getAuctionPlayers,
} from "../../../../redux/actions";
import { useParams, useSearchParams } from "react-router-dom";
import ImportPlayers from "./ImportPlayers";
import AddPlayerManually from "./AddPlayerManually";
import api from "../../../../utils/api";
import { createPortal } from "react-dom";
import Pagination from "../../../../components/Pagination";

const tabClass = (active) =>
  `inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 text-sm font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)] ${active ? "bg-[var(--secondary)] text-[#102033] shadow-[0_8px_20px_rgba(244,180,0,0.16)]" : ""}`;

const AllPlayers = () => {
  const { auctionId } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const loading = useSelector((state) => state?.loading?.auctionPlayers);
  const playersError = useSelector((state) => state?.error?.auctionPlayers);

  const auctionTypeTrial = useSelector(
    (state) => state?.data?.auctionDetails?.trailTypeAuction,
  );

  const auctionPlayersData = useSelector(
    (state) => state?.data?.auctionPlayers,
  );

  const [activePlayerTab, setActivePlayerTab] = useState("all");
  const [selectedManagerTab, setSelectedManagerTab] =
    useState("unassignedSelected");
  //  const [selectedSubTab, setSelectedSubTab] = useState("unassignedSelected");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusSort, setStatusSort] = useState("");
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [typeSort, setTypeSort] = useState("");
  const [currentPageState, setCurrentPageState] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const [isItemsDropdownOpen, setIsItemsDropdownOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  // const [slotDetail, setSlotDetail] = useState([]);
  const [slot, setSlot] = useState("");
  const [selectedSlotSessions, setSelectedSlotSessions] = useState([]);
  const [slotSession, setSlotSession] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [slotLoading, setSlotLoading] = useState(false);
  const [hasMoreSlots, setHasMoreSlots] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // const [slots, setSlots] = useState([]);

  const [isSlotOpen, setIsSlotOpen] = useState(false);
  const [slotSearch, setSlotSearch] = useState("");
  const [selectedSlotLabel, setSelectedSlotLabel] = useState("");
  const [slotPage, setSlotPage] = useState(1);
  const [viewMode, setViewMode] = useState("card");
  const [tableDetailsPlayer, setTableDetailsPlayer] = useState(null);
  const [tableDetailsType, setTableDetailsType] = useState("");
  const [tableAction, setTableAction] = useState("");
  const [tableModalSaving, setTableModalSaving] = useState(false);
  const [tableModalRemoving, setTableModalRemoving] = useState(false);
  const isAllPlayersVisible = searchParams.get("tab") === "allPlayers";
  // const hasRating = !!localStorage.getItem(`playerRating${auctionId}`);
  const debouncedSearch = useDebounce(searchQuery, 400);
  const playersRequest = auctionPlayersData?.request;
  const hasCurrentPlayersData =
    playersRequest?.auctionId === auctionId &&
    playersRequest?.activePlayerTab === activePlayerTab;
  const playerList = hasCurrentPlayersData
    ? auctionPlayersData?.list || []
    : [];
  const totalPages = hasCurrentPlayersData ? auctionPlayersData?.pages || 0 : 0;
  const totalPlayers = hasCurrentPlayersData
    ? auctionPlayersData?.total || 0
    : 0;
  const currentPage = hasCurrentPlayersData ? auctionPlayersData?.page || 1 : 1;
  const isPlayersLoading = loading || (!hasCurrentPlayersData && !playersError);
  const slots = useSelector((state) => state?.data?.slotList);
  const slotDetail = slots?.data;
  const dropdownRef = useRef();
  // const [loading, setLoading] = useState(false);

  // const fetchSlotList = async () => {
  //   try {
  //     const res = await api.get(
  //       `/webSiteApi/auctionSlot/getListAuctionSlots?auctionId=${auctionId}`,
  //     );
  //     setSlotDetail(res?.data?.data?.data || []);
  //     return res?.data?.data?.data || [];
  //   } catch (error) {
  //     console.log("Error fetching slots:", error);
  //     toast.error("Failed to fetch slots");
  //     return [];
  //   }
  // };

  const fetchSessionsForSlot = (slotId) => {
    const slot = slotDetail.find((s) => s._id === slotId);
    if (slot && slot.sessions) {
      setSelectedSlotSessions(slot.sessions);
    } else {
      setSelectedSlotSessions([]);
    }
  };

  const sortPlayers = [
    { value: "all", label: "All" },
    // { value: "select", label: "Selected" },
    // { value: "not select", label: "Not Selected" },
    // { value: "pending", label: "Pending" },
    // { value: "not reached", label: "Not Reached" },
  ];
  const handlePlayerTabChange = (tab) => {
    setActivePlayerTab(tab);
    // Reset everything when switching tab
    setSelectedPlayers([]);
    setSearchQuery("");

    setStatusSort("");
    setTypeSort("");

    setSlot("");
    setSlotSession("");
    setSelectedSlotSessions([]);

    setCurrentPageState(1);
  };

  const handleAssignClick = () => {
    setAssignmentModalOpen(true);
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayers((prev) => {
      if (prev.some((p) => p.id === player.id)) {
        return prev.filter((p) => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  };

  const handleRemovePlayer = (player) => {
    setSelectedPlayers((prev) => prev.filter((p) => p.id !== player.id));
  };

  useEffect(() => {
    dispatch(fetchAuctionDetails(auctionId));
  }, []);

  useEffect(() => {
    if (auctionId) {
      dispatch(fetchSlotList(auctionId, slotPage, 20, slotSearch));
    }
  }, [auctionId, slotPage, slotSearch]);

  useEffect(() => {
    setSlotPage(1);
  }, [slotSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsSlotOpen(false);
        setSlotSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (auctionId && hasMoreSlots) {
      setSlotLoading(true);
      dispatch(fetchSlotList(auctionId, slotPage, 20, slotSearch))
        .then((res) => {
          if (res?.data?.data?.data?.length < 20) {
            setHasMoreSlots(false);
          }
        })
        .finally(() => setSlotLoading(false));
    }
  }, [auctionId, slotPage, slotSearch]);

  const fetchPlayers = (activePlayerTab, page = currentPageState) => {
    return dispatch(
      getAuctionPlayers({
        auctionId: auctionId,
        activePlayerTab,
        page,
        itemsPerPage,
        statusSort,
        typeSort,
        debouncedSearch,
        slot, // Add slot filter
        slotSession, // Add session filter
      }),
    );
  };

  useEffect(() => {
    if (!auctionId || !isAllPlayersVisible) return;
    setCurrentPageState(1);
    fetchPlayers(activePlayerTab, 1);
  }, [auctionId, isAllPlayersVisible]);

  useEffect(() => {
    if (
      statusSort === "pending" ||
      statusSort === "not reached" ||
      statusSort === "all"
    ) {
      setTypeSort("");
    }
    // if (auctionTypeTrial) {
    //   setCurrentPageState(1);
    //   fetchPlayers("assigned", 1);
    // }
  }, [statusSort, typeSort]);

  // Fetch assigned players only when explicitly on assigned tab
  useEffect(() => {
    if (
      activePlayerTab === "all" ||
      (auctionTypeTrial &&
        (activePlayerTab === "unassigned" || activePlayerTab === "assigned"))
    ) {
      fetchPlayers(activePlayerTab, 1);
    }
    // if (auctionTypeTrial && activePlayerTab === "assigned") {
    //   setCurrentPageState(1);
    //   fetchPlayers("assigned", 1);
    // }
  }, [activePlayerTab, auctionTypeTrial]); // Only depend on these, not statusSort/typeSort

  useEffect(() => {
    setCurrentPageState(1);
    fetchPlayers(activePlayerTab, 1);
  }, [
    activePlayerTab,
    statusSort,
    typeSort,
    debouncedSearch,
    itemsPerPage,
    slot,
    slotSession,
  ]);

  const handleAssignmentSuccess = () => {
    fetchPlayers(activePlayerTab, currentPageState);
    setSelectedPlayers([]);
  };

  const handleImportSuccess = () => {
    setCurrentPageState(1);
    return fetchPlayers(activePlayerTab, 1);
  };

  const getFilteredPlayers = () => {
    let filtered = playerList;
    return filtered;
  };

  const handleSelectAll = () => {
    const currentPlayers = getFilteredPlayers();

    if (selectedPlayers.length === currentPlayers.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(currentPlayers.map((item) => item.player?._id));
    }
  };

  const handleAssignPlayers = () => {
    if (selectedPlayers.length === 0) {
      toast.info("Please select at least one player");
      return;
    }
    setAssignmentModalOpen(true);
  };

  const getFileNameFromHeaders = (headers) => {
    const contentDisposition = headers?.["content-disposition"] || "";
    const match = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
    return match?.[1] || null;
  };

  const handleDownloadExcel = async () => {
    if (!auctionId) return;

    if (activePlayerTab === "assigned" && !slot) {
      toast.info("Please select slot first");
      return;
    }

    try {
      setDownloadLoading(true);

      const params = {};
      if (activePlayerTab === "assigned") {
        params.slotId = slot;
        if (slotSession) {
          params.sessionId = slotSession;
        }
      }

      const response = await api.get(
        `/webSiteApi/auction/exportAuctionPlayersExcel/${auctionId}`,
        {
          params,
          responseType: "blob",
        },
      );

      const fileName =
        getFileNameFromHeaders(response.headers) ||
        `auction_players_${auctionId}.xlsx`;

      const blob = new Blob([response.data], {
        type:
          response.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.setAttribute("download", fileName);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download excel");
    } finally {
      setDownloadLoading(false);
    }
  };

  const formatText = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  };

  const formatRole = (role) =>
    role
      ? String(role)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "-";

  const getStatusBadgeClass = (status) => {
    switch (String(status || "").trim().toLowerCase()) {
      case "available":
        return "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "unsold":
        return "border-red-500/35 bg-red-500/10 text-red-600 dark:text-red-400";
      case "sold":
        return "border-blue-500/35 bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "bidding":
        return "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400";
      default:
        return "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)]";
    }
  };

  const getPlayerInfo = (item) => {
    const playerData = item?.player || item || {};
    const playerRole = playerData?.playerRole || item?.playerRole;
    const playerType = item?.playersRatings?.playerType;
    const roleToDisplay =
      activePlayerTab === "assigned"
        ? playerType || playerRole
        : playerRole || playerType;

    return {
      id: playerData?._id || item?._id,
      name: playerData?.name || "Unknown Player",
      image: playerData?.profilePicture || "",
      mobile: playerData?.mobile
        ? `${playerData?.countryCode ? `${playerData.countryCode} ` : ""}${playerData.mobile}`
        : "",
      location: playerData?.location || "",
      role: roleToDisplay,
      status: item?.status || playerData?.status || "",
      basePrice: item?.basePrice,
      currentBid: item?.currentBid,
      slotName: item?.slot?.slotName || item?.slot?.location?.venue || "",
      sessionName: item?.session?.name || "",
      rating:
        item?.playersRatings?.avgRating?.overall ||
        item?.playersRatings?.overallRating ||
        "",
    };
  };

  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "NA";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  const getPlayerId = (item) =>
    item?.player?._id || item?.playerId || item?.id || item?._id || "";

  const handleOpenTableDetails = (item, action = "") => {
    const info = getPlayerInfo(item);
    setTableDetailsPlayer(item);
    setTableDetailsType(info.role);
    setTableAction(action);
  };

  const handleCloseTableDetails = () => {
    setTableDetailsPlayer(null);
    setTableAction("");
  };

  const handleTableEditPlayer = async (payload) => {
    try {
      setTableModalSaving(true);
      await api.put("/webSiteApi/players/editPlayer", payload);
      toast.success("Player updated successfully");
      handleCloseTableDetails();
      fetchPlayers(activePlayerTab, currentPageState);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update player");
      return false;
    } finally {
      setTableModalSaving(false);
    }
  };

  const handleTableRemovePlayer = async () => {
    const playerId = getPlayerId(tableDetailsPlayer);

    if (!auctionId || !playerId) {
      toast.error("Missing auction or player id");
      return;
    }

    try {
      setTableModalRemoving(true);
      await api.delete(
        `/webSiteApi/auction/removePlayer/${auctionId}/${playerId}`,
      );
      toast.success("Player removed successfully");
      handleCloseTableDetails();
      fetchPlayers(activePlayerTab, currentPageState);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove player");
    } finally {
      setTableModalRemoving(false);
    }
  };

  const tableHeadCellClass = "sticky top-0 z-30 bg-[var(--bg-main)] px-4 py-3";

  const renderPlayersTable = () => (
    <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
      <div className="professional-scrollbar h-[calc(100vh-330px)] min-h-[300px] overflow-auto">
        <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left text-sm">
          <thead className="border-b border-[var(--border-card)] text-xs uppercase text-[var(--text-secondary)] shadow-sm">
            <tr>
              {activePlayerTab === "unassigned" && (
                <th className={`${tableHeadCellClass} w-12`}>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-card)] text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                    aria-label="Select all players"
                  >
                    {selectedPlayers.length === getFilteredPlayers().length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
              )}
              <th className={tableHeadCellClass}>Player</th>
              <th className={tableHeadCellClass}>Role</th>
              <th className={tableHeadCellClass}>Mobile</th>
              <th className={tableHeadCellClass}>Location</th>
              <th className={tableHeadCellClass}>Status</th>
              <th className={tableHeadCellClass}>Base Price</th>
              {activePlayerTab === "assigned" && (
                <>
                  <th className={tableHeadCellClass}>Slot</th>
                  <th className={tableHeadCellClass}>Session</th>
                  <th className={tableHeadCellClass}>Rating</th>
                </>
              )}
              <th className={`${tableHeadCellClass} w-36 text-right`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-card)]">
            {getFilteredPlayers().map((item) => {
              const info = getPlayerInfo(item);
              const isSelected = selectedPlayers?.includes(info.id);

              return (
                <tr
                  key={item?._id || info.id}
                  className="transition hover:bg-[var(--accent-light)]"
                >
                  {activePlayerTab === "unassigned" && (
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedPlayers(
                              selectedPlayers?.filter((id) => id !== info.id),
                            );
                          } else {
                            setSelectedPlayers([...selectedPlayers, info.id]);
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-card)] text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                        aria-label={`Select ${info.name}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-[var(--primary)]" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  )}
                  <td className="min-w-56 px-4 py-1">
                    <div className="flex items-center gap-3">
                      {info.image ? (
                        <img
                          src={info.image}
                          alt={info.name}
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--border-card)]"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary-lighter)] text-xs font-bold text-[var(--primary)]">
                          {getInitials(info.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--text-primary)]">
                          {info.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-1 font-medium text-[var(--text-primary)]">
                    {formatRole(info.role)}
                  </td>
                  <td className="px-4 py-1 text-[var(--text-secondary)]">
                    {formatText(info.mobile)}
                  </td>
                  <td className="px-4 py-1 text-[var(--text-secondary)]">
                    {formatText(info.location)}
                  </td>
                  <td className="px-4 py-1">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(info.status)}`}
                    >
                      {formatText(info.status)}
                    </span>
                  </td>
                  <td className="px-4 py-1 font-semibold text-[var(--text-primary)]">
                    {info.basePrice
                      ? `₹${Number(info.basePrice).toLocaleString("en-IN")}`
                      : "-"}
                  </td>
                  {activePlayerTab === "assigned" && (
                    <>
                      <td className="px-4 py-1 text-[var(--text-secondary)]">
                        {formatText(info.slotName)}
                      </td>
                      <td className="px-4 py-1 text-[var(--text-secondary)]">
                        {formatText(info.sessionName)}
                      </td>
                      <td className="px-4 py-1 font-semibold text-[var(--text-primary)]">
                        {formatText(info.rating)}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-1 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenTableDetails(item)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
                        title="View player details"
                        aria-label={`View ${info.name}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenTableDetails(item, "edit")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)] transition hover:opacity-80"
                        title="Edit player"
                        aria-label={`Edit ${info.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenTableDetails(item, "delete")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 transition hover:bg-red-500/20"
                        title="Remove player"
                        aria-label={`Remove ${info.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-96px)] min-h-[560px] w-full flex-col px-2 py-2 sm:px-4 sm:py-4 lg:px-5">
      <div className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
        {(activePlayerTab === "all" ||
          (auctionTypeTrial &&
            (activePlayerTab === "unassigned" ||
              activePlayerTab === "assigned"))) && (
          <>
            <div className="sticky top-2 z-40 shrink-0 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] sm:top-4 sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <h1 className="text-lg font-bold leading-6 text-[var(--text-primary)] sm:mt-1 sm:text-xl sm:leading-7">
                    Registered Players
                  </h1>
                  <p className="mt-0.5 text-[11px] font-medium leading-4 text-[var(--text-secondary)] sm:mt-1 sm:text-xs">
                    Total {totalPlayers || 0} players registered in this
                    auction.
                  </p>
                </div>

                {activePlayerTab === "all" && (
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center [&>button]:w-full sm:[&>button]:w-auto">
                    <ImportPlayers
                      auctionId={auctionId}
                      onImportSuccess={handleImportSuccess}
                    />
                    <button
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--secondary)] px-3 text-xs font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)]"
                      onClick={() => setIsAddPlayerOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Player
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-center">
                <div className="relative col-span-2 lg:col-span-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search player..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] pl-10 pr-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)] sm:h-10 sm:pr-4"
                  />
                </div>

                <div className="flex w-full items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsItemsDropdownOpen(!isItemsDropdownOpen)
                      }
                      className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] sm:h-10 lg:w-auto"
                    >
                      <span className="hidden sm:inline">Showing {itemsPerPage}</span>
                      <span className="sm:hidden">{itemsPerPage}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isItemsDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isItemsDropdownOpen && (
                      <div className="absolute left-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
                        {[16, 32, 64, 96].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              setItemsPerPage(num);
                              setCurrentPageState(1);
                              setIsItemsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs font-semibold transition ${
                              itemsPerPage === num
                                ? "bg-[var(--accent-light)] text-[var(--primary)]"
                                : "text-[var(--text-secondary)] hover:bg-[var(--secondary-lighter)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            Showing {num}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="inline-flex h-9 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] sm:h-10">
                    <button
                      type="button"
                      onClick={() => setViewMode("card")}
                      className={`inline-flex items-center justify-center gap-2 px-3 text-xs font-semibold transition ${
                        viewMode === "card"
                          ? "bg-[var(--secondary)] text-[#102033]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("table")}
                      className={`inline-flex items-center justify-center gap-2 border-l border-[var(--border-card)] px-3 text-xs font-semibold transition ${
                        viewMode === "table"
                          ? "bg-[var(--secondary)] text-[#102033]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <Table2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {(activePlayerTab === "all" ||
                  activePlayerTab === "assigned") && (
                  <button
                    onClick={handleDownloadExcel}
                    disabled={downloadLoading}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:gap-2"
                  >
                    <Download className="h-4 w-4 text-[var(--primary)]" />
                    <span className="hidden sm:inline">
                      {downloadLoading
                        ? "Downloading..."
                        : activePlayerTab === "all"
                          ? "Download Excel"
                          : "Download Trials Excel"}
                    </span>
                    <span className="sm:hidden">
                      {downloadLoading ? "..." : "Excel"}
                    </span>
                  </button>
                )}

                {/* Filters only for assigned */}
                {activePlayerTab === "assigned" && (
                  <div className="col-span-2 flex w-full flex-col gap-2 sm:flex-row md:w-auto lg:col-span-1 lg:gap-3">
                    {/* <select
                      className="w-full sm:w-40 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 bg-[var(--bg-card)] text-[var(--text-primary)]"
                      value={slot}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSlot(value);
                        if (value) {
                          fetchSessionsForSlot(value);
                        } else {
                          setSelectedSlotSessions([]);
                          setSlotSession("");
                        }
                      }}
                    >
                      <option value="">All Slots</option>
                      {slotDetail.map((slot) => (
                        <option key={slot._id} value={slot._id}>
                          {slot.slotName}
                        </option>
                      ))}
                    </select> */}

                    <div ref={dropdownRef} className="relative w-full sm:w-40">
                      <input
                        type="text"
                        placeholder="Search Slot..."
                        value={isSlotOpen ? slotSearch : selectedSlotLabel}
                        onFocus={() => setIsSlotOpen(true)}
                        onChange={(e) => {
                          setSlotSearch(e.target.value);
                          setSlot(""); // reset selection
                          setSelectedSlotLabel("");
                        }}
                        className="ui-input"
                      />

                      <div
                        onScroll={(e) => {
                          const bottom =
                            e.target.scrollTop + e.target.clientHeight >=
                            e.target.scrollHeight - 10;

                          if (bottom && !slotLoading && hasMoreSlots) {
                            setSlotPage((prev) => prev + 1);
                          }
                        }}
                        className={`ui-card absolute z-[9999] mt-1 max-h-48 w-full overflow-y-auto ${isSlotOpen ? "block" : "hidden"}`}
                      >
                        {slotDetail?.map((s) => (
                          <div
                            key={s._id}
                            onClick={() => {
                              setSlot(s._id);
                              setSelectedSlotLabel(s.slotName);
                              setIsSlotOpen(false);
                              setSlotSearch("");
                              fetchSessionsForSlot(s._id);
                            }}
                            className="px-3 py-2 cursor-pointer hover:bg-[var(--secondary-lighter)] text-sm"
                          >
                            {s.slotName}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Session Filter - Only show when slot is selected and has sessions */}
                    {slot && selectedSlotSessions.length > 0 && (
                      <select
                        className="ui-input sm:w-40"
                        value={slotSession}
                        onChange={(e) => setSlotSession(e.target.value)}
                      >
                        <option value="">All Sessions</option>
                        {selectedSlotSessions.map((session) => (
                          <option key={session._id} value={session._id}>
                            {session.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Sort By Status */}
                    <select
                      className="ui-input sm:w-40"
                      value={statusSort}
                      onChange={(e) => setStatusSort(e.target.value)}
                    >
                      <option value="" disabled>
                        Sort By Status
                      </option>
                      {sortPlayers?.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>

                    {/* Sort By Type (Visible Only When Needed) */}
                    {(statusSort === "select" ||
                      statusSort === "not select") && (
                      <select
                        className="ui-input sm:w-40"
                        value={typeSort}
                        onChange={(e) => setTypeSort(e.target.value)}
                      >
                        <option value="" disabled>
                          Sort By Player Type
                        </option>
                        <option value="batsman">Batsman</option>
                        <option value="bowler">Bowler</option>
                        <option value="allrounder">All Rounder</option>
                        <option value="wicketkeeper">Wicket Keeper</option>
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS → For Unassigned */}
              {/* {activePlayerTab === "unassigned" && (
                <div className="flex flex-row gap-2 w-full justify-end">
                  
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 bg-[var(--background)] border rounded-lg text-sm font-semibold hover:bg-[var(--bg-soft)]0"
                  >
                    {selectedPlayers.length === getFilteredPlayers().length
                      ? "Deselect All"
                      : "Select All"}
                  </button>

            
                  <button
                    disabled={selectedPlayers.length === 0}
                    onClick={handleAssignPlayers}
                    className={`px-5 py-2 rounded-lg text-sm font-bold ${
                      selectedPlayers.length > 0
                        ? "bg-emerald-600 text-[var(--text-dark)] hover:bg-emerald-700"
                        : "bg-[var(--secondary-lighter)] text-[var(--text-secondary)] cursor-not-allowed"
                    }`}
                  >
                    Assign ({selectedPlayers.length})
                  </button>
                </div>
              )} */}
            </div>

            <PlayerAssign
              isOpen={assignmentModalOpen}
              onClose={() => setAssignmentModalOpen(false)}
              selectedPlayers={selectedPlayers}
              playerCount={selectedPlayers.length}
              onAssignSuccess={handleAssignmentSuccess}
              auctionId={auctionId}
            />

            <PlayerDetailsModal
              player={tableDetailsPlayer}
              isOpen={Boolean(tableDetailsPlayer)}
              onClose={handleCloseTableDetails}
              onEdit={tableAction === "edit" ? handleTableEditPlayer : undefined}
              onDelete={
                tableAction === "delete" ? handleTableRemovePlayer : undefined
              }
              isSaving={tableModalSaving}
              isRemoving={tableModalRemoving}
              type={tableDetailsType}
              initialAction={tableAction}
              actionOnly={tableAction === "delete"}
              showAllDetails={tableAction === ""}
            />

            <div className="professional-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
              {/* Players Grid */}
              <div className="mx-auto max-w-7xl pb-6">
                {isPlayersLoading ? (
                  <div className="ui-card py-14 text-center">
                    <div className="mx-auto mb-3 h-14 w-14 animate-pulse rounded-full bg-[var(--secondary-lighter)]" />
                    <h3 className="text-md font-semibold text-[var(--text-primary)]">
                      Loading players...
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Please wait while players are fetched.
                    </p>
                  </div>
                ) : getFilteredPlayers().length > 0 ? (
                  viewMode === "table" ? (
                    renderPlayersTable()
                  ) : (
                    <div
                      className={
                        activePlayerTab === "assigned"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                          : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"
                      }
                    >
                      {getFilteredPlayers().map((item) => {
                        const info = getPlayerInfo(item);

                        return (
                          <PlayerCard
                            key={item?._id}
                            player={item} // Pass the entire item object
                            type={info.role}
                            auctionId={auctionId}
                            selectedSlotId={slot}
                            selectedSlotSessions={selectedSlotSessions}
                            slotDetails={slotDetail || []}
                            onActionComplete={() =>
                              fetchPlayers(activePlayerTab, currentPageState)
                            }
                            mode={
                              activePlayerTab === "unassigned"
                                ? "select"
                                : activePlayerTab === "assigned"
                                  ? "assigned"
                                  : "view"
                            }
                            isSelected={selectedPlayers?.includes(info.id)}
                            onRemove={() =>
                              fetchPlayers("assigned", currentPageState)
                            }
                            onSelect={(id) => {
                              if (selectedPlayers?.includes(id)) {
                                setSelectedPlayers(
                                  selectedPlayers?.filter((x) => x !== id),
                                );
                              } else {
                                setSelectedPlayers([...selectedPlayers, id]);
                              }
                            }}
                            showActions={activePlayerTab === "unassigned"}
                          />
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="ui-card py-14 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--secondary-lighter)] rounded-full mb-3">
                      <Search className="w-6 h-6 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-md font-semibold text-[var(--text-primary)]">
                      No players found
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                      {activePlayerTab === "all"
                        ? "No players available"
                        : activePlayerTab === "unassigned"
                          ? "Try adjusting your search"
                          : "No assigned players found"}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {(activePlayerTab === "all" ||
                (auctionTypeTrial &&
                  (activePlayerTab === "unassigned" ||
                    activePlayerTab === "assigned"))) &&
                totalPages > 1 && (
                  <Pagination
                    className="mx-auto max-w-7xl pb-2 "
                    currentPage={currentPageState}
                    totalPages={totalPages}
                    summaryPrefix={`Total: ${totalPlayers} players | Page`}
                    onPageChange={(page) => {
                      setCurrentPageState(page);
                      fetchPlayers(activePlayerTab, page);
                    }}
                    prevLabel="Previous"
                    nextLabel="Next"
                  />
                )}
            </div>
          </>
        )}
        {/* ========= NEW FLOW: Selected / Auction ========= */}
        {/* {activePlayerTab === "selected" && (
          <div className="max-w-7xl mx-auto px-4 pb-6 ">
            <SelectedAuctionManager
              defaultTab={selectedManagerTab}
              auctionId={auctionId}
              auctionTypeTrial={auctionTypeTrial}
            />
          </div>
        )} */}

        {isAddPlayerOpen &&
          createPortal(
            <AddPlayerManually
              auctionId={auctionId}
              auctionTypeTrial={auctionTypeTrial}
              isOpen={isAddPlayerOpen}
              onClose={() => setIsAddPlayerOpen(false)}
            />,
            document.body,
          )}
      </div>
    </div>
  );
};

export default AllPlayers;
