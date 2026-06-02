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

   const filteredTeams = teams.filter((team) =>
  team.teamName.toLowerCase().includes(teamSearch.toLowerCase())
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
    <div className="auction-page space-y-4 text-[var(--secondary-dark)] font-main">
      {/* Header with Stats */}
      <div className="auction-panel p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-[--text-primary]">
              Auction Players
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Total: {totalPlayers} Players | Page {currentPage} of{" "}
              {totalPages || 1}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)] whitespace-nowrap">
                Items per page:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="auction-select min-h-9 py-1.5"
              >
                <option
                  value={6}
                  className="bg-[var(--color-primary)]  text-gray-600"
                >
                  6
                </option>
                <option
                  value={12}
                  className="bg-[var(--color-primary)] text-gray-600"
                >
                  12
                </option>
                <option
                  value={24}
                  className="bg-[var(--color-primary)] text-gray-600"
                >
                  24
                </option>
                <option
                  value={50}
                  className="bg-[var(--color-primary)] text-gray-600"
                >
                  50
                </option>
                <option
                  value={100}
                  className="bg-[var(--color-primary)] text-gray-600"
                >
                  100
                </option>
              </select>
            </div>
            <button
              onClick={handleDownload}
              className="auction-btn auction-btn-primary"
            >
              Download Data
            </button>
            <button
              onClick={resetFilters}
              className="auction-btn auction-btn-ghost whitespace-nowrap"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Search Bar with Filter Toggle */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--secondary-light)]" />
              <input
                type="text"
                placeholder="Search by player name, batch ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="auction-input min-h-12 pl-10 pr-4"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`auction-btn ${showFilters || activeFilterCount > 0
                  ? "auction-btn-blue"
                  : "auction-btn-ghost"
                }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline ">
                Filters
              </span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel - Collapsible */}
          {showFilters && (
            <div className="auction-filter-panel animate-slideDown">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-[var(--secondary-dark)] mb-1">
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
                    className="auction-select"
                  >
                    <option value="">All Players</option>
                    <option value="sold">Sold</option>
                    <option value="unsold">Unsold</option>
                    <option value="available">Available</option>
                  </select>
                </div>

                {/* Team Filter */}
                  <div className="relative">
                  <label className="block text-xs font-medium text-[var(--secondary-dark)] mb-1">
                    Team
                  </label>

                  <div className="relative">
                    {/* Input */}
                    <input
                      type="text"
                      placeholder="Search team..."
                      value={
                        teamIdFilter
                          ? teams.find((t) => t.teamId === teamIdFilter)
                              ?.teamName || ""
                          : teamSearch
                      }
                      onChange={(e) => {
                        setTeamSearch(e.target.value);
                        setTeamIdFilter("");
                      
                      }}
                      onClick={()=>{setShowTeamDropdown(true)}}
                      className="auction-input pr-10"
                    />

                    {/* Arrow Button */}
                    <button
                      type="button"
                      onClick={() => setShowTeamDropdown((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-white/10"
                    >
                      {showTeamDropdown ? (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* Dropdown */}
                  {showTeamDropdown && (
                    <div className="auction-card absolute z-10 mt-1 max-h-48 w-full overflow-y-auto">
                      {/* All Teams */}
                      <div
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTeamIdFilter("");
                          setTeamSearch("");
                          setShowTeamDropdown(false);
                        }}
                      >
                        All Teams
                      </div>

                      {teams
                        .filter((team) =>
                          team.teamName
                            .toLowerCase()
                            .includes(teamSearch.toLowerCase()),
                        )
                        .map((team) => (
                          <div
                            key={team.teamId}
                            className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setTeamIdFilter(team.teamId);
                              setTeamSearch("");
                              setShowTeamDropdown(false);
                            }}
                          >
                            {team.teamName}
                          </div>
                        ))}

                      {teams.filter((team) =>
                        team.teamName
                          .toLowerCase()
                          .includes(teamSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No teams found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-[var(--secondary-dark)] mb-1">
                    Category
                  </label>
                  <select
                    value={categoryFilterName}
                    onChange={(e) => setCategoryFilterName(e.target.value)}
                    className="auction-select"
                  >
                    <option value="">All Categories</option>
                    {apiCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFilterCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-[var(--secondary-dark)] mb-2">
                    Active filters:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 bg-[var(--secondary-light)] text-[var(--secondary-dark)] px-2 py-1 rounded-full text-xs">
                        Search: {searchQuery}
                        <button
                          onClick={() => setSearchQuery("")}
                          className="hover:bg-blue-200 p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {statusFilter && (
                      <span className="inline-flex items-center gap-1 bg-[var(--secondary-light)]  text-white px-2 py-1 rounded-full text-xs">
                        Status: {statusFilter}
                        <button
                          onClick={() => setStatusFilter("")}
                          className="hover:bg-blue-200 p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {teamIdFilter && (
                      <span className="inline-flex items-center gap-1 bg-[var(--secondary-light)]  text-white px-2 py-1 rounded-full text-xs">
                        Team:{" "}
                        {teams.find((t) => t.teamId === teamIdFilter)
                          ?.teamName || teamIdFilter}
                        <button
                          onClick={() => setTeamIdFilter("")}
                          className="hover:bg-blue-200 p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {categoryFilterName && (
                      <span className="inline-flex items-center gap-1 bg-[var(--secondary-light)]  text-white px-2 py-1 rounded-full text-xs">
                        Category:{" "}
                        {apiCategories.find((c) => c._id === categoryFilterName)
                          ?.name || categoryFilterName}
                        <button
                          onClick={() => setCategoryFilterName("")}
                          className="hover:bg-blue-200 p-0.5 rounded-full"
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
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {players.map((player) => (
              <div
                key={player._id}
                className="auction-card group relative cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                onClick={() => setViewingPlayer(player)}
              >
                <div className="p-3.5">
                  {/* Top Row: Avatar + Basic Info */}
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <div className="flex-shrink-0">
                      {hasValidPlayerImage(player) ? (
                        <img
                          src={getPlayerImage(player)}
                          alt={player?.player?.name || "Player"}
                          className="w-12 h-12 rounded-md object-cover border border-[var(--secondary-light)] bg-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-slate-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
                          {getPlayerInitials(player?.player?.name)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate leading-5">
                        {player.player.name}
                      </p>
                      <p className="text-[11px] text-gray-600 truncate">
                        {player.player.batchId}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {player?.player?.mobile || "No mobile"}
                      </p>
                      {/* <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {player.category}
                      </p> */}
                    </div>
                  </div>

                  {/* Middle Row: Price & Team */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                        Price
                      </span>
                      <span className="text-xs font-bold text-[var(--primary)] text-right">
                        {formatCurrency(
                          player.finalPrice ||
                          player.currentBid ||
                          player.basePrice ||
                          0,
                        )}
                      </span>
                    </div>

                    {player.isSold ? (
                      <div className="bg-green-50 border border-green-200 px-2 py-1 rounded-md">
                        <p className="text-[10px] text-green-700 font-semibold truncate">
                          {getTeamName(player)}
                        </p>
                      </div>
                    ) : player.status === "unsold" ? (
                      <div className="bg-red-50 border border-red-200 px-2 py-1 rounded-md">
                        <p className="text-[10px] text-red-700 font-semibold">
                          Unsold
                        </p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-md">
                        <p className="text-[10px] text-yellow-700 font-semibold">
                          Available
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Badge - Bottom */}
                  <div className="absolute top-2.5 right-2.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${player.isSold ? "bg-emerald-500" : "bg-amber-500"}`}
                    />
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
        <div className="auction-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--secondary-light)] rounded-full mb-4">
            <div className="w-8 h-8 border-4 border-[var(--secondary-light)] border-t-[var(--secondary)] rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-[var(--secondary-dark)] mb-2">
            Loading Players...
          </h3>
          <p className="text-[var(--secondary-dark)]">Fetching auction data</p>
        </div>
      ) : (
        <div className="auction-card p-8 text-center">
          <div className="w-16 h-16 bg-[var(--secondary-light)] rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-[var(--secondary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--secondary-dark)] mb-2">
            No Players Found
          </h3>
          <p className="text-[var(--secondary-dark)] mb-4">
            Try adjusting your search or filters
          </p>
          <button
            onClick={resetFilters}
            className="auction-btn auction-btn-primary"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Player Details Modal with Expandable Bid History */}
      {viewingPlayer && 
      createPortal(
         <div
          className="fixed top-0 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingPlayer(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-blue-700 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {hasValidPlayerImage(viewingPlayer) ? (
                    <img
                      src={getPlayerImage(viewingPlayer)}
                      alt={viewingPlayer?.player?.name || "Player"}
                      className="w-14 h-14 rounded-md object-cover border border-white/40 bg-white/10"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-white/20 rounded-md flex items-center justify-center text-white text-xl font-bold">
                      {getPlayerInitials(viewingPlayer?.player?.name)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {viewingPlayer.player.name}
                    </h2>
                    <p className="text-blue-100 text-sm">
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
                    className={`p-2 rounded-full transition-colors ${viewingPlayer.isSold
                        ? "hover:bg-white/20"
                        : "opacity-40 cursor-not-allowed"
                      }`}
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setViewingPlayer(null)}
                    className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {/* <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Category</p>
                  <p className="font-medium text-sm">{viewingPlayer.category}</p>
                </div> */}
                {viewingPlayer?.isSold && (
                  <>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Base Price</p>
                      <p className="font-medium text-sm text-gray-600">
                        {formatCurrency(viewingPlayer.basePrice)}{" "}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Final Price</p>
                      <p className="font-bold text-green-700 text-sm">
                        {formatCurrency(
                          viewingPlayer.finalPrice ||
                          viewingPlayer.currentBid ||
                          viewingPlayer.basePrice,
                        )}
                      </p>
                    </div>
                  </>
                )}
                <div className="bg-gray-50 p-3 rounded-lg ">
                  <p className="text-xs text-gray-600">Status</p>
                  <p
                    className={`font-medium text-sm ${viewingPlayer.isSold ? "text-green-700" : viewingPlayer.status === "unsold" ? "text-red-700" : "text-yellow-700"}`}
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Sale Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-green-700 font-medium">
                        Sold To
                      </p>
                      <p className="font-bold text-green-900 text-sm">
                        {getTeamName(viewingPlayer)}
                      </p>
                    </div>
                    {viewingPlayer.soldAt && (
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-green-700 font-medium">
                            Sold Date
                          </p>
                          <p className="text-green-900 text-sm">
                            {formatDate(viewingPlayer.soldAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-green-700 font-medium">
                            Time
                          </p>
                          <p className="text-green-900 text-sm">
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
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setExpandedBidHistory(!expandedBidHistory)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">Bid History</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {viewingPlayer.bidHistory.length} bids
                      </span>
                    </div>
                    {expandedBidHistory ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>

                  {expandedBidHistory && (
                    <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                      {viewingPlayer.bidHistory.map((bid, index) => (
                        <div key={bid._id} className="p-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium bg-gray-100 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center">
                                {index + 1}
                              </span>
                              <p className="text-sm font-medium text-gray-900">
                                {bid.teamName}
                              </p>
                            </div>
                            <p className="font-bold text-green-700 text-sm">
                              {formatCurrency(bid.bidAmount)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 ml-8">
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
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">
                  Player Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mobile:</span>
                    <span className="font-medium text-gray-600">
                      {viewingPlayer.player.mobile || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Batch Number:</span>
                    <span className="font-medium text-gray-600">
                      {viewingPlayer.player.batchNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Foreign Player:</span>
                    <span className="font-medium text-gray-600">
                      {viewingPlayer.isForeign ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unsold Re-entry:</span>
                    <span className="font-medium text-gray-600">
                      {viewingPlayer.isUnsoldReEntry ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setViewingPlayer(null)}
                className="w-full py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
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
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowEditModal(false)}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 px-5 py-4 relative">
          <button
            onClick={() => setShowEditModal(false)}
            className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Edit Sold Player
              </h2>

              <p className="text-xs text-blue-100 mt-0.5">
                Update team & final selling amount
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Player Preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {editingPlayer && hasValidPlayerImage(editingPlayer) ? (
              <img
                src={getPlayerImage(editingPlayer)}
                alt={editingPlayer?.player?.name}
                className="w-11 h-11 rounded-xl object-cover border"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center text-white font-bold text-lg">
                {getPlayerInitials(editingPlayer?.player?.name)}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 truncate">
                {editingPlayer?.player?.name}
              </h3>

              <p className="text-sm text-gray-500 truncate">
                {editingPlayer?.player?.batchId}
              </p>

              <div className="mt-1 text-xs inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Sold Player
              </div>
            </div>
          </div>

          {/* Team Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Team
            </label>

            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <select
                value={editTeamId}
                onChange={(e) => setEditTeamId(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Final Price
            </label>

            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

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
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
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
        <div className="px-6 py-5 border-t border-gray-100 bg-slate-50 flex gap-3">
          <button
            onClick={() => setShowEditModal(false)}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleEditFinalPrice}
            disabled={editLoading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
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
