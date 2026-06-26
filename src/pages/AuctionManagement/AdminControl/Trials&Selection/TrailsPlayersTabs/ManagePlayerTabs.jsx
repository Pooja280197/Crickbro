import React, { useEffect, useRef, useState } from "react";
import { Users, UserCheck } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { useDebounce } from "../../../../../components/useDebounce";
import {
  bulkToggleSupercampPlayers,
  fetchAuctionDetails,
  fetchSlotList,
  getAuctionPlayers,
} from "../../../../../redux/actions";
import api from "../../../../../utils/api";
// import SelectedAuctionManager from "./AuctionPlayersTabs/SelectedAuctionManager";
import AssignedTrialsTab from "./AssignedTrialsTab";
import UnassignedPlayersTab from "./UnassignedPlayersTab";

const tabClass = (active) =>
  `inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition ${
    active
      ? "border-[var(--border-primary)] bg-[var(--secondary)] text-[#102033] shadow-sm"
      : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
  }`;

const ManagePlayerTabs = () => {
  const { auctionId } = useParams();
  const dispatch = useDispatch();

  const auctionTypeTrial = useSelector(
    (state) => state?.data?.auctionDetails?.trailTypeAuction,
  );
  const auctionPlayersData = useSelector(
    (state) => state?.data?.auctionPlayers,
  );
  const slots = useSelector((state) => state?.data?.slotList);

  const [activePlayerTab, setActivePlayerTab] = useState(() => {
    return auctionTypeTrial ? "unassigned" : "selected";
  });
  const [selectedManagerTab, setSelectedManagerTab] =
    useState("unassignedSelected");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusSort, setStatusSort] = useState("");
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [typeSort, setTypeSort] = useState("");
  const [currentPageState, setCurrentPageState] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const [isItemsDropdownOpen, setIsItemsDropdownOpen] = useState(false);
  const [unassignedViewMode, setUnassignedViewMode] = useState("grid");
  const [assignedViewMode, setAssignedViewMode] = useState("grid");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [slot, setSlot] = useState("");
  const [selectedSlotSessions, setSelectedSlotSessions] = useState([]);
  const [slotSession, setSlotSession] = useState("");
  const [slotLoading, setSlotLoading] = useState(false);
  const [hasMoreSlots, setHasMoreSlots] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [isSlotOpen, setIsSlotOpen] = useState(false);
  const [slotSearch, setSlotSearch] = useState("");
  const [selectedSlotLabel, setSelectedSlotLabel] = useState("");
  const [slotPage, setSlotPage] = useState(1);
  const [supercampLoading, setSupercampLoading] = useState(false);

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
  const slotDetail = slots?.data;
  const dropdownRef = useRef();

  const sortPlayers = [
    { value: "select", label: "Selected" },
    { value: "not select", label: "Not Selected" },
    { value: "pending", label: "Pending" },
    { value: "not reached", label: "Not Reached" },
  ];

  const isValidTrialPlayerTab =
    activePlayerTab === "unassigned" || activePlayerTab === "assigned";

  const fetchSessionsForSlot = (slotId) => {
    const selectedSlot = slotDetail?.find((s) => s._id === slotId);
    if (selectedSlot && selectedSlot.sessions) {
      setSelectedSlotSessions(selectedSlot.sessions);
    } else {
      setSelectedSlotSessions([]);
    }
  };

  const handlePlayerTabChange = (tab) => {
    setActivePlayerTab(tab);
    setSelectedPlayers([]);
    setSearchQuery("");
    setStatusSort("");
    setTypeSort("");
    setSlot("");
    setSlotSession("");
    setSelectedSlotSessions([]);
    setCurrentPageState(1);
  };

  useEffect(() => {
    dispatch(fetchAuctionDetails(auctionId));
  }, []);

  useEffect(() => {
    if (auctionTypeTrial && !isValidTrialPlayerTab) {
      handlePlayerTabChange("unassigned");
    }
  }, [auctionTypeTrial, isValidTrialPlayerTab]);

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

  const fetchPlayers = (activeTab, page = currentPageState) => {
    return dispatch(
      getAuctionPlayers({
        auctionId,
        activePlayerTab: activeTab,
        page,
        itemsPerPage,
        statusSort,
        typeSort,
        debouncedSearch,
        slot,
        slotSession,
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
  }, [statusSort, typeSort]);

  useEffect(() => {
    if (auctionTypeTrial && isValidTrialPlayerTab) {
      fetchPlayers(activePlayerTab, 1);
    }
  }, [activePlayerTab, auctionTypeTrial, isValidTrialPlayerTab]);

  useEffect(() => {
    if (auctionTypeTrial && !isValidTrialPlayerTab) return;
    setCurrentPageState(1);
    fetchPlayers(activePlayerTab, 1);
  }, [
    auctionTypeTrial,
    activePlayerTab,
    isValidTrialPlayerTab,
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

  const handleAddToSupercamp = async () => {
    if (selectedPlayers.length === 0) {
      toast.info("Please select at least one player");
      return;
    }
    try {
      setSupercampLoading(true);
      const response = await dispatch(
        bulkToggleSupercampPlayers(auctionId, selectedPlayers, true),
      );
      const updated = response?.data?.data?.updated ?? selectedPlayers.length;
      toast.success(`${updated} player(s) added to supercamp`);
      setSelectedPlayers([]);
      fetchPlayers(activePlayerTab, currentPageState);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to add players to supercamp",
      );
    } finally {
      setSupercampLoading(false);
    }
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
    <div className="mx-auto flex h-full min-h-0 w-full flex-col px-2 py-2 sm:px-4 sm:py-4 lg:px-5">
      <div className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
        <div className="sticky top-0 z-40 shrink-0 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-6 text-[var(--text-primary)] sm:mt-1 sm:text-xl sm:leading-7">
                Players for Trials
              </h1>
              <p className="mt-0.5 text-[11px] font-medium leading-4 text-[var(--text-secondary)] sm:mt-1 sm:text-xs">
                Manage unassigned and assigned trial players.
              </p>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max gap-2">
                {auctionTypeTrial && (
                  <button
                    onClick={() => handlePlayerTabChange("unassigned")}
                    className={tabClass(activePlayerTab === "unassigned")}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Unassigned to Trials
                  </button>
                )}

                {auctionTypeTrial && (
                  <button
                    onClick={() => handlePlayerTabChange("assigned")}
                    className={tabClass(activePlayerTab === "assigned")}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Assigned to Trials
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {auctionTypeTrial && activePlayerTab === "unassigned" && (
          <UnassignedPlayersTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            isItemsDropdownOpen={isItemsDropdownOpen}
            setIsItemsDropdownOpen={setIsItemsDropdownOpen}
            selectedPlayers={selectedPlayers}
            setSelectedPlayers={setSelectedPlayers}
            assignmentModalOpen={assignmentModalOpen}
            setAssignmentModalOpen={setAssignmentModalOpen}
            getFilteredPlayers={getFilteredPlayers}
            handleSelectAll={handleSelectAll}
            handleAssignPlayers={handleAssignPlayers}
            handleAddToSupercamp={handleAddToSupercamp}
            supercampLoading={supercampLoading}
            handleAssignmentSuccess={handleAssignmentSuccess}
            fetchPlayers={fetchPlayers}
            currentPageState={currentPageState}
            setCurrentPageState={setCurrentPageState}
            totalPages={totalPages}
            totalPlayers={totalPlayers}
            auctionId={auctionId}
            slot={slot}
            selectedSlotSessions={selectedSlotSessions}
            slotDetail={slotDetail}
            viewMode={unassignedViewMode}
            setViewMode={setUnassignedViewMode}
          />
        )}

        {auctionTypeTrial && activePlayerTab === "assigned" && (
          <AssignedTrialsTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            isItemsDropdownOpen={isItemsDropdownOpen}
            setIsItemsDropdownOpen={setIsItemsDropdownOpen}
            downloadLoading={downloadLoading}
            handleDownloadExcel={handleDownloadExcel}
            dropdownRef={dropdownRef}
            isSlotOpen={isSlotOpen}
            setIsSlotOpen={setIsSlotOpen}
            slotSearch={slotSearch}
            setSlotSearch={setSlotSearch}
            selectedSlotLabel={selectedSlotLabel}
            setSelectedSlotLabel={setSelectedSlotLabel}
            setSlot={setSlot}
            slotLoading={slotLoading}
            hasMoreSlots={hasMoreSlots}
            setSlotPage={setSlotPage}
            slotDetail={slotDetail}
            fetchSessionsForSlot={fetchSessionsForSlot}
            slot={slot}
            selectedSlotSessions={selectedSlotSessions}
            slotSession={slotSession}
            setSlotSession={setSlotSession}
            statusSort={statusSort}
            setStatusSort={setStatusSort}
            sortPlayers={sortPlayers}
            typeSort={typeSort}
            setTypeSort={setTypeSort}
            getFilteredPlayers={getFilteredPlayers}
            selectedPlayers={selectedPlayers}
            setSelectedPlayers={setSelectedPlayers}
            fetchPlayers={fetchPlayers}
            currentPageState={currentPageState}
            setCurrentPageState={setCurrentPageState}
            totalPages={totalPages}
            totalPlayers={totalPlayers}
            auctionId={auctionId}
            viewMode={assignedViewMode}
            setViewMode={setAssignedViewMode}
            handleAddToSupercamp={handleAddToSupercamp}
            supercampLoading={supercampLoading}
          />
        )}
      </div>
    </div>
  );
};

export default ManagePlayerTabs;
