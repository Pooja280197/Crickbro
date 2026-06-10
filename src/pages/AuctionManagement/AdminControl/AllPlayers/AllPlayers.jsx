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
  `inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 text-sm font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)] ${active ? "bg-[var(--secondary)] text-[#102033] shadow-[0_8px_20px_rgba(244,180,0,0.16)]" : ""}`;

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
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 lg:px-5">
      <div className="space-y-4">
        {(activePlayerTab === "all" ||
          (auctionTypeTrial &&
            (activePlayerTab === "unassigned" ||
              activePlayerTab === "assigned"))) && (
          <>
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    Players
                  </p>
                  <h1 className="mt-1 text-xl font-bold leading-7 text-[var(--text-primary)]">
                    Registered Players
                  </h1>
                  <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                    Total {totalPlayers || 0} players registered in this auction.
                  </p>
                </div>

                {activePlayerTab === "all" && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <ImportPlayers auctionId={auctionId} />
                    <button
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--secondary)] px-3 text-xs font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)]"
                      onClick={() => setIsAddPlayerOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Player
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search player..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] pl-10 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)]"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] lg:w-auto"
                  >
                    <span>Showing {itemsPerPage}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isItemsDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isItemsDropdownOpen && (
                    <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
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

                {(activePlayerTab === "all" ||
                  activePlayerTab === "assigned") && (
                  <button
                    onClick={handleDownloadExcel}
                    disabled={downloadLoading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download className="h-4 w-4 text-[var(--primary)]" />
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

            {/* Players Grid */}
            <div className="mx-auto max-w-7xl pb-6">
              {getFilteredPlayers().length > 0 ? (
                <div
                  className={
                    activePlayerTab === "assigned"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"
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
