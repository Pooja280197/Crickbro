import React, { useState, useCallback, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  User,
  Tag,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  Edit,
} from "lucide-react";
import api from "../../../../utils/api";
// import toast from 'react-hot-toast';
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import Pagination from "../../../../components/Pagination";

const panelClass =
  "rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]";
const inputClass =
  "h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)]";
const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-4 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)] disabled:cursor-not-allowed disabled:opacity-60";
const outlineButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]";
const iconTileClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]";
const optionClass = "bg-[var(--bg-card)] text-[var(--text-primary)]";

const AuctionOverview = ({ auctionId }) => {
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [teamIdFilter, setTeamIdFilter] = useState("");
  const [categoryFilterName, setCategoryFilterName] = useState("");
  const [viewingPlayer, setViewingPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [apiCategories, setApiCategories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedBidHistory, setExpandedBidHistory] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFinalPrice, setEditFinalPrice] = useState("");
  const [editTeamId, setEditTeamId] = useState("");
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  // Fetch players from API with filters
  const fetchPlayersWithFilters = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("limit", itemsPerPage.toString());
        params.append("page", page.toString());
        if (searchQuery) params.append("search", searchQuery);
        if (statusFilter) params.append("status", statusFilter);
        if (teamIdFilter) params.append("teamId", teamIdFilter);
        if (categoryFilterName) params.append("categoryId", categoryFilterName);

        const url = `/webSiteApi/auction/getAllPlayersAdmin/${auctionId}?${params.toString()}`;
        const res = await api.get(url);
        // Extract data based on your API response structure
        const responseData = res.data;
        let playersData = [];

        // Check different possible response structures
        if (Array.isArray(responseData?.data)) {
          // Case: response.data is the array directly
          playersData = responseData.data;
        } else if (Array.isArray(responseData?.data?.data)) {
          // Case: response.data.data is the array
          playersData = responseData.data.data;
        } else if (Array.isArray(responseData?.data)) {
          // Case: response.data might be the array (from your example)
          playersData = responseData.data;
        } else {
          playersData = [];
        }

        if (Array.isArray(playersData) && playersData.length > 0) {
          setPlayers(playersData);

          // Extract pagination metadata - FIXED HERE
          const total =
            responseData?.total ||
            responseData?.data?.total ||
            responseData?.data?.data?.total ||
            playersData.length;

          const pages =
            responseData?.pages ||
            responseData?.data?.pages ||
            responseData?.data?.data?.pages ||
            Math.ceil(total / itemsPerPage);
          setTotalPlayers(total);
          setTotalPages(pages);
          setCurrentPage(page);
        } else {
          setPlayers([]);
          setTotalPlayers(0);
          setTotalPages(0);
        }
      } catch (error) {
        console.error("❌ Error fetching players:", error);
        setPlayers([]);
        setTotalPlayers(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [
      auctionId,
      searchQuery,
      statusFilter,
      teamIdFilter,
      categoryFilterName,
      itemsPerPage,
    ],
  );

  const handleDownload = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("limit", "10000"); // large limit for full export
      params.append("page", "1");

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter) params.append("status", statusFilter);
      if (teamIdFilter) params.append("teamId", teamIdFilter);
      if (categoryFilterName) params.append("categoryId", categoryFilterName);

      const url = `/webSiteApi/auction/getAllPlayersAdmin/${auctionId}?${params.toString()}`;
      const res = await api.get(url);

      const playersData =
        res.data?.data?.data ||
        res.data?.data ||
        res.data ||
        [];

        console.log("📥 Download data fetched:", playersData);

      if (!Array.isArray(playersData) || playersData.length === 0) {
        toast.error("No data to download");
        return;
      }

      // Transform data
      const exportData = playersData.map((p) => ({
        PlayerName: p?.player?.name,
        Mobile: p?.player?.mobile,
        PlayerRole: p?.player?.playerRole || "",
        JerseyNumber: p?.player?.jerseyNumber || "",
        JerseyName: p?.player?.jerseyName || "",
        JerseySize: p?.player?.jerseySize || "",
        Status: p?.isSold
          ? "Sold"
          : p?.status === "unsold"
            ? "Unsold"
            : "Available",
        TeamName: getTeamName(p),
        BasePrice: p?.basePrice || 0,
        FinalPrice: p?.finalPrice || p?.currentBid || 0,
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0]).join(",");
      const rows = exportData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(","),
      );

      const csvContent = [headers, ...rows].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);
      link.download = "auction_players.csv";
      link.click();

      toast.success("Download started 🚀");
    } catch (error) {
      console.error(error);
      toast.error("Download failed");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(
          `/webSiteApi/auctionCategory/listCategories?auctionId=${auctionId}`,
        );

        const categoryData = res.data?.data?.data || res.data?.data || res.data;
        if (Array.isArray(categoryData)) {
          setApiCategories(categoryData);
        }
      } catch (error) {
        console.error("❌ Failed to fetch categories:", error);
        toast.error("Failed to fetch categories:");
      }
    };

    if (auctionId) {
      fetchCategories();
    }
  }, [auctionId]);

  // Fetch teams from API
  const fetchTeams = useCallback(async () => {
    try {
      const allTeams = [];
      const limit = 200;
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await api.get(
          `/webSiteApi/auction/getAuctionTeams/${auctionId}?page=${page}&limit=${limit}`,
        );

        const responseData = res?.data;
        const teamsData =
          responseData?.data?.data || responseData?.data || responseData;

        const pageItems = Array.isArray(teamsData) ? teamsData : [];
        allTeams.push(...pageItems);

        const totalPages =
          responseData?.pages ||
          responseData?.data?.pages ||
          responseData?.data?.data?.pages ||
          0;

        if (totalPages > 0) {
          hasMore = page < totalPages;
        } else {
          hasMore = pageItems.length === limit;
        }

        page += 1;
      }

      const uniqueTeams = Array.from(
        new Map(allTeams.map((team) => [team?.teamId, team])).values(),
      ).filter((team) => team?.teamId);

      setTeams(uniqueTeams);
    } catch (error) {
      console.error("❌ Failed to fetch teams:", error);
      setTeams([]);
    }
  }, [auctionId]);

  const getTeamDisplayName = (team) =>
    team?.teamName || team?.teamDoc?.name || team?.name || "Unnamed Team";

  const filteredTeams = teams.filter((team) =>
    getTeamDisplayName(team).toLowerCase().includes(teamSearch.toLowerCase()),
  );

  // Get team name from soldTo or highestBidder using teams state
  const getTeamName = (player) => {
    if (player.soldTo?.id) {
      const soldTeam = teams.find((team) => team.teamId === player.soldTo?.id);
      return soldTeam?.teamName || player.soldTo.name || "Unknown Team";
    }

    if (player.highestBidder?.id) {
      const bidTeam = teams.find(
        (team) => team.teamId === player.highestBidder?.id,
      );
      return bidTeam?.teamName || player.highestBidder.name || "Unknown Team";
    }

    return "No Team";
  };

  // Initial load
  useEffect(() => {
    if (auctionId) {
      fetchPlayersWithFilters(1);
      fetchTeams();
    }
  }, [auctionId, fetchTeams]);

  // Fetch when any filter changes or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
    fetchPlayersWithFilters(1);
  }, [
    searchQuery,
    statusFilter,
    teamIdFilter,
    categoryFilterName,
    itemsPerPage,
    fetchPlayersWithFilters,
  ]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setTeamIdFilter("");
    setCategoryFilterName("");
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getPlayerImage = (playerRow) => {
    return (
      playerRow?.player?.logo ||
      playerRow?.player?.profilePicture ||
      playerRow?.player?.profileImage ||
      ""
    );
  };

  const isDummyProfileImage = (imageUrl = "") => {
    const raw = String(imageUrl || "").trim().toLowerCase();
    if (!raw) return true;

    const dummyKeywords = [
      "dummy",
      "default",
      "placeholder",
      "avatar",
      "no-image",
      "no_image",
      "user.png",
      "user.jpg",
      "profile-default",
    ];

    return dummyKeywords.some((keyword) => raw.includes(keyword));
  };

  const getPlayerInitials = (name = "") => {
    const words = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return "P";

    const first = words[0]?.charAt(0)?.toUpperCase() || "";
    const second = words[1]?.charAt(0)?.toUpperCase() || "";

    return `${first}${second}` || first || "P";
  };

  const hasValidPlayerImage = (playerRow) => {
    const imageUrl = getPlayerImage(playerRow);
    return !!imageUrl && !isDummyProfileImage(imageUrl);
  };

  // Get active filter count
  const activeFilterCount = [
    searchQuery,
    statusFilter,
    teamIdFilter,
    categoryFilterName,
  ].filter(Boolean).length;

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    // Don't call fetchPlayersWithFilters here, useEffect will handle it
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPlayersWithFilters(page);
  };

  const handleEditFinalPrice = async () => {
    if (!editTeamId || !editFinalPrice) {
      toast.error("Team and Final Price are required");
      return;
    }

    try {
      setEditLoading(true);

      await api.put(`/webSiteApi/auction/editSoldPlayer/${auctionId}`, {
        playerId: editingPlayer.playerId,
        teamId: editTeamId,
        finalPrice: Number(editFinalPrice),
      });

      toast.success("Final price updated successfully");

      setShowEditModal(false);
      setViewingPlayer(null);

      // refresh list
      fetchPlayersWithFilters(currentPage);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update final price");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-3 text-[var(--text-primary)] sm:p-4 lg:p-5">
      {/* Header with Stats */}
      <div className={`${panelClass} p-4`}>
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className={iconTileClass}>
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-normal text-[var(--text-primary)] sm:text-xl">
                Auction Players
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Track sold, unsold and available players with final bids and team details.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--border-card)] bg-[var(--bg-main)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                  {totalPlayers} players
                </span>
                <span className="rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
                  Page {currentPage} of {totalPages || 1}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3">
              <span className="whitespace-nowrap text-sm font-semibold text-[var(--text-primary)]">
                Items per page:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="h-10 bg-[var(--bg-card)] text-sm font-semibold text-[var(--text-primary)] outline-none"
              >
                <option value={6} className="bg-[var(--bg-card)] text-[var(--text-primary)]">6</option>
                <option value={12} className="bg-[var(--bg-card)] text-[var(--text-primary)]">12</option>
                <option value={24} className="bg-[var(--bg-card)] text-[var(--text-primary)]">24</option>
                <option value={50} className="bg-[var(--bg-card)] text-[var(--text-primary)]">50</option>
                <option value={100} className="bg-[var(--bg-card)] text-[var(--text-primary)]">100</option>
              </select>
            </div>
            <button
              onClick={handleDownload}
              className={primaryButtonClass}
            >
              Download Data
            </button>
            <button
              onClick={resetFilters}
              className={outlineButtonClass}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Search Bar with Filter Toggle */}
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search by player name, batch ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputClass} w-full pl-10`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`${outlineButtonClass} ${
                showFilters || activeFilterCount > 0
                  ? "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"
                  : ""
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline ">
                Filters
              </span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel - Collapsible */}
          {showFilters && (
            <div className="animate-slideDown rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStatusFilter(value);

                      // If unsold → disable teams + reset current team filter
                      if (value === "unsold") {
                        setTeamIdFilter("");
                      }
                    }}
                    className={`${inputClass} w-full text-[var(--text-primary)]`}
                  >
                    <option value="" className={optionClass}>All Players</option>
                    <option value="sold" className={optionClass}>Sold</option>
                    <option value="unsold" className={optionClass}>Unsold</option>
                    <option value="available" className={optionClass}>Available</option>
                  </select>
                </div>

                {/* Team Filter */}
                  <div className="relative">
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Team
                  </label>

                  <div className="relative">
                    {/* Input */}
                    <input
                      type="text"
                      placeholder="Search team..."
                      value={
                        teamIdFilter
                          ? getTeamDisplayName(
                              teams.find((t) => t.teamId === teamIdFilter),
                            )
                          : teamSearch
                      }
                      onChange={(e) => {
                        setTeamSearch(e.target.value);
                        setTeamIdFilter("");
                      
                      }}
                      onFocus={() => setShowTeamDropdown(true)}
                      onClick={() => setShowTeamDropdown(true)}
                      disabled={statusFilter === "unsold"}
                      className={`${inputClass} w-full pr-12 disabled:cursor-not-allowed disabled:opacity-60`}
                    />

                    {/* Arrow Button */}
                    <button
                      type="button"
                      onClick={() => setShowTeamDropdown((prev) => !prev)}
                      disabled={statusFilter === "unsold"}
                      className="absolute bottom-0 right-2 top-0 my-auto flex h-7 w-7 items-center justify-center rounded-md  bg-[var(--bg-card)] text-[var(--text-secondary)]  transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Toggle team filter"
                    >
                      {showTeamDropdown ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Dropdown */}
                  {showTeamDropdown && statusFilter !== "unsold" && (
                    <div className="professional-scrollbar absolute z-[80] mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-1 shadow-[0_18px_42px_rgba(0,0,0,0.22)]">
                      {/* All Teams */}
                      <button
                        type="button"
                        className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition hover:bg-[var(--accent-light)] ${
                          !teamIdFilter
                            ? "bg-[var(--accent-light)] text-[var(--primary)]"
                            : "text-[var(--text-primary)]"
                        }`}
                        onClick={() => {
                          setTeamIdFilter("");
                          setTeamSearch("");
                          setShowTeamDropdown(false);
                        }}
                      >
                        All Teams
                      </button>

                      {filteredTeams.map((team) => (
                          <button
                            type="button"
                            key={team.teamId}
                            className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition hover:bg-[var(--accent-light)] ${
                              teamIdFilter === team.teamId
                                ? "bg-[var(--accent-light)] text-[var(--primary)]"
                                : "text-[var(--text-primary)]"
                            }`}
                            onClick={() => {
                              setTeamIdFilter(team.teamId);
                              setTeamSearch("");
                              setShowTeamDropdown(false);
                            }}
                          >
                            {getTeamDisplayName(team)}
                          </button>
                        ))}

                      {filteredTeams.length === 0 && (
                        <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">
                          No teams found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Category
                  </label>
                  <select
                    value={categoryFilterName}
                    onChange={(e) => setCategoryFilterName(e.target.value)}
                    className={`${inputClass} w-full`}
                  >
                    <option value="" className={optionClass}>All Categories</option>
                    {apiCategories.map((category) => (
                      <option
                        key={category._id}
                        value={category._id}
                        className={optionClass}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFilterCount > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--border-card)]">
                    <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
                    Active filters:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-2 py-1 text-xs font-medium text-[var(--text-primary)]">
                        Search: {searchQuery}
                        <button
                          onClick={() => setSearchQuery("")}
                          className="rounded-full p-0.5 transition hover:bg-[var(--accent-light)]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {statusFilter && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-2 py-1 text-xs font-medium text-[var(--text-primary)]">
                        Status: {statusFilter}
                        <button
                          onClick={() => setStatusFilter("")}
                          className="rounded-full p-0.5 transition hover:bg-[var(--accent-light)]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {teamIdFilter && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-2 py-1 text-xs font-medium text-[var(--text-primary)]">
                        Team:{" "}
                        {getTeamDisplayName(
                          teams.find((t) => t.teamId === teamIdFilter),
                        ) || teamIdFilter}
                        <button
                          onClick={() => setTeamIdFilter("")}
                          className="rounded-full p-0.5 transition hover:bg-[var(--accent-light)]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {categoryFilterName && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-2 py-1 text-xs font-medium text-[var(--text-primary)]">
                        Category:{" "}
                        {apiCategories.find((c) => c._id === categoryFilterName)
                          ?.name || categoryFilterName}
                        <button
                          onClick={() => setCategoryFilterName("")}
                          className="rounded-full p-0.5 transition hover:bg-[var(--accent-light)]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Players Grid Only - No Table View */}
      {players.length > 0 ? (
        <div className="space-y-4">
          {/* Grid View - Responsive columns */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 ">
            {players.map((player) => (
              <div
                key={player._id}
                className="group relative cursor-pointer overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[0_8px_22px_rgba(16,32,51,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--border-primary)] hover:shadow-[0_16px_34px_rgba(16,32,51,0.14)]"
                onClick={() => setViewingPlayer(player)}
              >
                <div className="p-1.5">
                  {/* Top Row: Avatar + Basic Info */}
                  <div className="flex items-start gap-2">
                    <div className="shrink-0">
                      {hasValidPlayerImage(player) ? (
                        <img
                          src={getPlayerImage(player)}
                          alt={player?.player?.name || "Player"}
                          className="h-11 w-11 rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--accent-light)] text-xs font-bold text-[var(--primary)]">
                          {getPlayerInitials(player?.player?.name)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[11px] font-semibold leading-4 text-[var(--text-primary)]">
                        {player.player.name}
                      </p>
                      <p className="truncate text-[10px] leading-3 text-[var(--text-secondary)]">
                        {player.player.batchId}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] leading-3 text-[var(--text-secondary)]">
                        {player?.player?.mobile || "No mobile"}
                      </p>
                      {/* <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">
                        {player.category}
                      </p> */}
                    </div>
                  </div>

                  {/* Middle Row: Price & Team */}
                  <div className="mt-2 space-y-1.5 border-t border-[var(--border-card)] pt-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">
                        Price
                      </span>
                      <span className="text-[11px] font-bold text-[var(--primary)] text-right">
                        {formatCurrency(
                          player.finalPrice ||
                          player.currentBid ||
                          player.basePrice ||
                          0,
                        )}
                      </span>
                    </div>

                    {player.isSold ? (
                      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5">
                        <p className="truncate text-[10px] font-semibold text-emerald-700">
                          {getTeamName(player)}
                        </p>
                      </div>
                    ) : player.status === "unsold" ? (
                      <div className="rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5">
                        <p className="text-[10px] font-semibold text-red-700">
                          Unsold
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border border-[var(--border-primary)] bg-[var(--accent-light)] px-1.5 py-0.5">
                        <p className="text-[10px] font-semibold text-[var(--primary)]">
                          Available
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Badge - Bottom */}
                  <div className="absolute right-2 top-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${player.isSold ? "bg-emerald-500" : "bg-amber-500"}`}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <span className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--bg-card)] px-3 text-xs font-semibold text-[var(--primary)] shadow">
                      <Eye className="h-4 w-4" />
                      View
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Fixed */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              summaryPrefix={`Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, totalPlayers)} - ${Math.min(currentPage * itemsPerPage, totalPlayers)} of ${totalPlayers} players | Page`}
              prevLabel="Previous"
              nextLabel="Next"
            />
          )}
        </div>
      ) : loading ? (
        <div className={`${panelClass} p-8 text-center`}>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent-light)]">
            <div className="w-8 h-8 border-4 border-[var(--secondary-light)] border-t-[var(--secondary)] rounded-full animate-spin"></div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
            Loading Players...
          </h3>
          <p className="text-[var(--text-secondary)]">Fetching auction data</p>
        </div>
      ) : (
        <div className={`${panelClass} p-8 text-center`}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--accent-light)]">
            <User className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
            No Players Found
          </h3>
          <p className="mb-4 text-[var(--text-secondary)]">
            Try adjusting your search or filters
          </p>
          <button
            onClick={resetFilters}
            className={primaryButtonClass}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Player Details Modal with Expandable Bid History */}
      {viewingPlayer && 
      createPortal(
         <div
          className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setViewingPlayer(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-[var(--border-card)] bg-[var(--bg-main)] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {hasValidPlayerImage(viewingPlayer) ? (
                    <img
                      src={getPlayerImage(viewingPlayer)}
                      alt={viewingPlayer?.player?.name || "Player"}
                      className="h-14 w-14 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-xl font-bold text-[var(--primary)]">
                      {getPlayerInitials(viewingPlayer?.player?.name)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      {viewingPlayer.player.name}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {viewingPlayer.player.batchId}
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setEditingPlayer(viewingPlayer);
                      setEditFinalPrice(
                        viewingPlayer.finalPrice ||
                        viewingPlayer.currentBid ||
                        viewingPlayer.basePrice,
                      );
                      setEditTeamId(viewingPlayer.soldTo?.id || "");
                      setShowEditModal(true);
                    }}
                    disabled={!viewingPlayer.isSold}
                    className={`${viewingPlayer.isSold
                        ? "border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--accent-light)]"
                        : "opacity-40 cursor-not-allowed"
                      } rounded-lg p-2 transition-colors`}
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setViewingPlayer(null)}
                    className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-2 text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-light)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="professional-scrollbar max-h-[calc(90vh-80px)] space-y-4 overflow-y-auto p-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {/* <div className="bg-[var(--bg-soft)] p-3 rounded-lg">
                  <p className="text-xs text-[var(--text-secondary)]">Category</p>
                  <p className="font-medium text-sm">{viewingPlayer.category}</p>
                </div> */}
                {viewingPlayer?.isSold && (
                  <>
                    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                      <p className="text-xs text-[var(--text-secondary)]">Base Price</p>
                      <p className="font-medium text-sm text-[var(--text-secondary)]">
                        {formatCurrency(viewingPlayer.basePrice)}{" "}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                      <p className="text-xs text-[var(--text-secondary)]">Final Price</p>
                      <p className="text-sm font-bold text-[var(--primary)]">
                        {formatCurrency(
                          viewingPlayer.finalPrice ||
                          viewingPlayer.currentBid ||
                          viewingPlayer.basePrice,
                        )}
                      </p>
                    </div>
                  </>
                )}
                <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                  <p className="text-xs text-[var(--text-secondary)]">Status</p>
                  <p
                    className={`text-sm font-medium ${viewingPlayer.isSold ? "text-emerald-600" : viewingPlayer.status === "unsold" ? "text-red-600" : "text-[var(--primary)]"}`}
                  >
                    {viewingPlayer.isSold ? "Sold" : viewingPlayer.status === "unsold" ? "Unsold" : "Available"}
                  </p>
                </div>
              </div>

              {/* Auction Date */}
              {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Auction Date</span>
                </div>
                <p className="text-blue-900 text-sm mt-1">
                  {viewingPlayer.auctionDate ? formatDate(viewingPlayer.auctionDate) : 'N/A'}
                </p>
              </div> */}

              {/* Sale Information */}
              {viewingPlayer.isSold && (
                <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-[var(--text-primary)]">
                    <Users className="w-4 h-4" />
                    Sale Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-[var(--text-secondary)]">
                        Sold To
                      </p>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {getTeamName(viewingPlayer)}
                      </p>
                    </div>
                    {viewingPlayer.soldAt && (
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs font-medium text-[var(--text-secondary)]">
                            Sold Date
                          </p>
                          <p className="text-sm text-[var(--text-primary)]">
                            {formatDate(viewingPlayer.soldAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[var(--text-secondary)]">
                            Time
                          </p>
                          <p className="text-sm text-[var(--text-primary)]">
                            {formatTime(viewingPlayer.soldAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bid History */}
              {viewingPlayer.bidHistory?.length > 0 && (
                <div className="border border-[var(--border-card)] rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-3 bg-[var(--bg-soft)] cursor-pointer hover:bg-[var(--secondary-lighter)] transition-colors"
                    onClick={() => setExpandedBidHistory(!expandedBidHistory)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[var(--text-primary)]">Bid History</h3>
                      <span className="rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2 py-1 text-xs font-semibold text-[var(--primary)]">
                        {viewingPlayer.bidHistory.length} bids
                      </span>
                    </div>
                    {expandedBidHistory ? (
                      <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                    )}
                  </div>

                  {expandedBidHistory && (
                    <div className="professional-scrollbar max-h-64 divide-y divide-[var(--border-card)] overflow-y-auto">
                      {viewingPlayer.bidHistory.map((bid, index) => (
                        <div key={bid._id} className="p-3 hover:bg-[var(--bg-soft)]">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium bg-[var(--secondary-lighter)] text-[var(--text-primary)] w-6 h-6 rounded-full flex items-center justify-center">
                                {index + 1}
                              </span>
                              <p className="text-sm font-medium text-[var(--text-primary)]">
                                {bid.teamName}
                              </p>
                            </div>
                            <p className="text-sm font-bold text-[var(--primary)]">
                              {formatCurrency(bid.bidAmount)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] ml-8">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(bid.bidTime)}</span>
                            <span className="mx-1">•</span>
                            <span>{formatDate(bid.bidTime)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Player Info */}
              <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                <h3 className="font-bold text-[var(--text-primary)] mb-2 text-sm">
                  Player Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Mobile:</span>
                    <span className="font-medium text-[var(--text-secondary)]">
                      {viewingPlayer.player.mobile || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Batch Number:</span>
                    <span className="font-medium text-[var(--text-secondary)]">
                      {viewingPlayer.player.batchNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Foreign Player:</span>
                    <span className="font-medium text-[var(--text-secondary)]">
                      {viewingPlayer.isForeign ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Unsold Re-entry:</span>
                    <span className="font-medium text-[var(--text-secondary)]">
                      {viewingPlayer.isUnsoldReEntry ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border-card)]">
              <button
                onClick={() => setViewingPlayer(null)}
                className={`${outlineButtonClass} w-full`}
              >
                Close Details
              </button>
            </div>
          </div>
        </div> ,
          document.body,
      )}
    {showEditModal &&
  typeof document !== "undefined" &&
  createPortal(
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => setShowEditModal(false)}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-[var(--border-card)] bg-[var(--bg-main)] px-5 py-4">
          <button
            onClick={() => setShowEditModal(false)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] transition hover:bg-[var(--accent-light)]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
              <IndianRupee className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Edit Sold Player
              </h2>

              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Update team & final selling amount
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Player Preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-soft)] border border-[var(--border-card)]">
            {editingPlayer && hasValidPlayerImage(editingPlayer) ? (
              <img
                src={getPlayerImage(editingPlayer)}
                alt={editingPlayer?.player?.name}
                className="w-11 h-11 rounded-xl object-cover border"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[var(--accent-light)] text-lg font-bold text-[var(--primary)]">
                {getPlayerInitials(editingPlayer?.player?.name)}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-bold text-[var(--text-primary)] truncate">
                {editingPlayer?.player?.name}
              </h3>

              <p className="text-sm text-[var(--text-secondary)] truncate">
                {editingPlayer?.player?.batchId}
              </p>

              <div className="mt-1 text-xs inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Sold Player
              </div>
            </div>
          </div>

          {/* Team Select */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Select Team
            </label>

            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />

              <select
                value={editTeamId}
                onChange={(e) => setEditTeamId(e.target.value)}
                className={`${inputClass} w-full pl-12 pr-4`}
              >
                <option value="">Choose Team</option>

                {teams.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Final Price */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Final Price
            </label>

            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />

              <input
                type="text"
                value={editFinalPrice}
                onChange={(e) =>
                  setEditFinalPrice(
                    e.target.value.replace(/[^0-9]/g, ""),
                  )
                }
                placeholder="Enter final amount"
                inputMode="numeric"
                className={`${inputClass} w-full pl-12 pr-4`}
              />
            </div>

            {/* {editFinalPrice && (
              <p className="mt-2 text-sm text-green-700 font-medium">
                {formatCurrency(Number(editFinalPrice || 0))}
              </p>
            )} */}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-[var(--border-card)] bg-[var(--bg-main)] px-6 py-5">
          <button
            onClick={() => setShowEditModal(false)}
            className={`${outlineButtonClass} flex-1`}
          >
            Cancel
          </button>

          <button
            onClick={handleEditFinalPrice}
            disabled={editLoading}
            className={`${primaryButtonClass} flex-1`}
          >
            {editLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}
    </div>
  );
};

export default AuctionOverview;
