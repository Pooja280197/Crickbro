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
} from "lucide-react";
import PlayerAssign from "../../../../components/PlayerAssign";
import PlayerCard from "../../../../components/PlayerCard";
import { useDebounce } from "../../../../components/useDebounce";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAuctionDetails,
  fetchSlotList,
  getAuctionPlayers,
} from "../../../../redux/actions";
import { useParams } from "react-router-dom";
import ImportPlayers from "./ImportPlayers";
import AddPlayerManually from "./AddPlayerManually";
import api from "../../../../utils/api";
import { createPortal } from "react-dom";
import Pagination from "../../../../components/Pagination";


const tabClass = (active) =>
  `auction-tab ${active ? "auction-tab-active" : ""}`;

const AllPlayers = () => {
  const { auctionId } = useParams();
  const dispatch = useDispatch();

  const loading = useSelector((state) => state?.loading?.auctionPlayers);

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
  // const hasRating = !!localStorage.getItem(`playerRating${auctionId}`);
  const debouncedSearch = useDebounce(searchQuery, 400);
  const playerList = auctionPlayersData?.list || [];
  const totalPages = auctionPlayersData?.pages || 0;
  const totalPlayers = auctionPlayersData?.total || 0;
  const currentPage = auctionPlayersData?.page || 1;
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
        slot, // Add slot filter
        slotSession, // Add session filter
      }),
    );
  };

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
    fetchPlayers(activePlayerTab);
    setSelectedPlayers([]);
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

  return (
    <div className="auction-page">
      <div className="space-y-4">
        {/* Tabs */}
        {/* Tabs */}
        <div className="auction-panel sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4">
            {/* TABS CONTAINER - Fixed overflow and spacing */}
            <div className="relative">
              {/* Scrollable tabs container */}
              <div className="overflow-x-auto scrollbar-hide flex justify-between items-center">
                <div className="flex gap-2 min-w-max py-3">
                  {/* All Tab */}
                  <button
                    onClick={() => handlePlayerTabChange("all")}
                    // className={tabClass(activePlayerTab === "all")}
                    className={tabClass(activePlayerTab === "all")}
                  >
                    <Users className="w-4 h-4" />
                    All Players
                  </button>
                </div>
                {activePlayerTab === "all" && (
                  <div className="flex gap-2 ">
                    <ImportPlayers auctionId={auctionId} />
                    <button
                      className="auction-btn auction-btn-blue"
                      onClick={() => setIsAddPlayerOpen(true)}
                    >
                      Add Player Manually
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Only for 'all' tab */}
          </div>
        </div>

        {/* Search + Buttons Row - Only show for unassigned tab */}
        {(activePlayerTab === "all" ||
          (auctionTypeTrial &&
            (activePlayerTab === "unassigned" ||
              activePlayerTab === "assigned"))) && (
          <>
            <div className="mx-auto flex max-w-7xl flex-col gap-3 py-2">
              {/* TOP SECTION → Search + (Filters if assigned) */}

                <div className="auction-toolbar">
                {/* Search Bar */}
                <div className="relative w-full md:w-1/2 flex justify-between">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 " />
                  <input
                    type="text"
                    placeholder="Search player..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="auction-input pl-10 pr-4"
                  />
                </div>

                {/* Items Per Page Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
                    className="auction-btn auction-btn-ghost"
                  >
                    <span>Showing {itemsPerPage}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isItemsDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isItemsDropdownOpen && (
                    <div className="auction-card absolute right-0 top-full z-10 mt-1 overflow-hidden">
                      {[16, 32, 64, 96].map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            setItemsPerPage(num);
                            setCurrentPageState(1);
                            setIsItemsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm text-[var(--color-button-primary)] transition-colors ${
                            itemsPerPage === num
                              ? "bg-[var(--accent-light)] text-[var(--primary)]"
                              : "hover:bg-[var(--color-button-primary)] hover:text-white"
                          }`}
                        >
                          Showing {num}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {(activePlayerTab === "all" ||
                  activePlayerTab === "assigned") && (
                  <button
                    onClick={handleDownloadExcel}
                    disabled={downloadLoading}
                     className="auction-btn auction-btn-primary"
                  >
                    <Download className="w-4 h-4" />
                    {downloadLoading
                      ? "Downloading..."
                      : activePlayerTab === "all"
                        ? "Download Excel"
                        : "Download Trials Excel"}
                  </button>
                )}

                {/* Filters only for assigned */}
                {activePlayerTab === "assigned" && (
                  <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                    {/* <select
                      className="w-full sm:w-40 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 bg-white text-gray-800"
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
                         className="auction-input"
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
                        className={`auction-card absolute z-[9999] mt-1 max-h-48 w-full overflow-y-auto ${isSlotOpen ? "block" : "hidden"}`}
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
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                          >
                            {s.slotName}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Session Filter - Only show when slot is selected and has sessions */}
                    {slot && selectedSlotSessions.length > 0 && (
                      <select
                         className="auction-select sm:w-40"
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
                      className="auction-select sm:w-40"
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
                         className="auction-select sm:w-40"
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
                    className="px-3 py-2 bg-[var(--background)] border rounded-lg text-sm font-semibold hover:bg-gray-500"
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
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
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

            {/* Players Grid */}
            <div className="mx-auto max-w-7xl pb-6">
              {getFilteredPlayers().length > 0 ? (
                <div
                  className={
                    activePlayerTab === "assigned"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4"
                  }
                >
                  {getFilteredPlayers().map((item) => {
                    const playerRole =
                      item?.player?.playerRole || item?.playerRole;
                    const playerType = item?.playersRatings?.playerType;
                    const roleToDisplay =
                      activePlayerTab === "assigned"
                        ? playerType || playerRole
                        : playerRole || playerType;

                    return (
                      <PlayerCard
                        key={item?._id}
                        player={item} // Pass the entire item object
                        type={roleToDisplay}
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
                        isSelected={selectedPlayers?.includes(
                          item?.player?._id,
                        )}
                        onRemove={() => fetchPlayers("assigned")}
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
              ) : (
                <div className="auction-card py-14 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-md font-semibold text-gray-900">
                    No players found
                  </h3>
                  <p className="text-gray-500 text-sm">
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
                   className="mx-auto max-w-7xl"
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
