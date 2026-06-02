import React, { useEffect, useRef, useState } from "react";
import { Users, UserCheck } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { useDebounce } from "../../../../../components/useDebounce";
import {
  fetchAuctionDetails,
  fetchSlotList,
  getAuctionPlayers,
} from "../../../../../redux/actions";
import api from "../../../../../utils/api";
import SelectedAuctionManager from "./AuctionPlayersTabs/SelectedAuctionManager";
import AddPlayerManually from "../../AllPlayers/AddPlayerManually";

const tabClass = (active) =>
  `auction-tab ${active ? "auction-tab-active" : ""}`;

const AuctionPlayers = () => {
  const { auctionId } = useParams();
  const dispatch = useDispatch();

  const auctionTypeTrial = useSelector(
    (state) => state?.data?.auctionDetails?.trailTypeAuction,
  );
  const auctionPlayersData = useSelector(
    (state) => state?.data?.auctionPlayers,
  );
  const slots = useSelector((state) => state?.data?.slotList);

  const [activePlayerTab, setActivePlayerTab] = useState("selected")
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

  const debouncedSearch = useDebounce(searchQuery, 400);
  const playerList = auctionPlayersData?.list || [];
  const totalPages = auctionPlayersData?.pages || 0;
  const totalPlayers = auctionPlayersData?.total || 0;
  const slotDetail = slots?.data;
  const dropdownRef = useRef();

  const sortPlayers = [
    { value: "select", label: "Selected" },
    { value: "not select", label: "Not Selected" },
    { value: "pending", label: "Pending" },
    { value: "not reached", label: "Not Reached" },
  ];

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

  const fetchPlayers = (activeTab, page = 1) => {
    dispatch(
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
    if (
      auctionTypeTrial &&
      (activePlayerTab === "unassigned" || activePlayerTab === "assigned")
    ) {
      fetchPlayers(activePlayerTab, 1);
    }
  }, [activePlayerTab, auctionTypeTrial]);

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
        <div className="auction-panel sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 min-w-max py-3">
                 

                  <button
                    onClick={() => {
                      setActivePlayerTab("selected");
                      setSelectedManagerTab("unassignedSelected");
                    }}
                    className={tabClass(
                      activePlayerTab === "selected" &&
                        selectedManagerTab === "unassignedSelected",
                    )}
                  >
                    <Users className="w-4 h-4" />
                    Assign to Category
                  </button>

                  <button
                    onClick={() => {
                      setActivePlayerTab("selected");
                      setSelectedManagerTab("auctionPlayers");
                    }}
                    className={tabClass(
                      activePlayerTab === "selected" &&
                        selectedManagerTab === "auctionPlayers",
                    )}
                  >
                    <Users className="w-4 h-4" />
                    Players for Auction
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

     

       

        {activePlayerTab === "selected" &&
          (selectedManagerTab === "unassignedSelected" ||
            selectedManagerTab === "auctionPlayers") && (
            <div className="max-w-7xl mx-auto px-4 pb-6 ">
              <SelectedAuctionManager
                defaultTab={selectedManagerTab}
                auctionId={auctionId}
                auctionTypeTrial={auctionTypeTrial}
              />
            </div>
          )}

        {isAddPlayerOpen && (
          <AddPlayerManually
            auctionId={auctionId}
            auctionTypeTrial={auctionTypeTrial}
            isOpen={isAddPlayerOpen}
            onClose={() => setIsAddPlayerOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AuctionPlayers;
