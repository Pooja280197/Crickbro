import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Filter,
  Users,
  Trash2,
  CheckSquare,
  Square,
  ChevronDown,
} from "lucide-react";
import PlayerCard from "./SelectedPlayerCard";
import AssignCategoryModal from "./AssignCategoryModal";
import PlayerDetailsPopup from "./PlayerDetailsPopup";
import { ratingOptions } from "./mockPlayers";
import api from "../../../../../../utils/api";
import { useDebounce } from "../../../../../../components/useDebounce";
import { useDispatch, useSelector } from "react-redux";
import {
  deletePlayer,
  getAssignedinCategory,
  getAssignedPlayers,
  getSelectedPlayers,
  getUnassignedinCategory,
} from "../../../../../../redux/actions";
import { a } from "framer-motion/client";
import DeleteConfirmModal from "../../../../../../components/DeleteConfirmModal";
import Pagination from "../../../../../../components/Pagination";
// import axios from "axios";

const SelectedAuctionManager = ({
  auctionId,
  auctionTypeTrial,
  defaultTab,
}) => {
  const dispatch = useDispatch();
  const isTrialType = auctionTypeTrial;
  const [showResetUnassigned, setShowResetUnassigned] = useState(false);
  const [showResetAuction, setShowResetAuction] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("unassignedSelected");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedAuctionIds, setSelectedAuctionIds] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isItemsDropdownOpen, setIsItemsDropdownOpen] = useState(false);
  const [fromRating, setFromRating] = useState("");
  const [toRating, setToRating] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [slotFilter, setSlotFilter] = useState("");
  const [slotSessionFilter, setSlotSessionFilter] = useState("");
  const [directSelectedCheckbox, setDirectSelectedCheckbox] = useState(false);
  const [directSelectedGradeFilter, setDirectSelectedGradeFilter] =
    useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    from: "",
    to: "",
    type: "",
    slot: "",
    slotSession: "",
    directSelected: false,
    directSelectedGrade: "",
  });

  const [fromRatingA, setFromRatingA] = useState("");
  const [toRatingA, setToRatingA] = useState("");
  const [typeFilterA, setTypeFilterA] = useState("");
  const [slotFilterA, setSlotFilterA] = useState("");
  const [slotSessionFilterA, setSlotSessionFilterA] = useState("");
  const [directSelectedCheckboxA, setDirectSelectedCheckboxA] = useState(false);
  const [directSelectedGradeFilterA, setDirectSelectedGradeFilterA] =
    useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFiltersA, setAppliedFiltersA] = useState({
    from: "",
    to: "",
    type: "",
    slot: "",
    slotSession: "",
    directSelected: false,
    directSelectedGrade: "",
  });

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [categorySearchId, setCategorySearchId] = useState("");
  const [categorySearchName, setCategorySearchName] = useState("");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [undoTimer, setUndoTimer] = useState(null);
  const [selectedPlayerDetails, setSelectedPlayerDetails] = useState(null);
  const [isPlayerDetailsOpen, setIsPlayerDetailsOpen] = useState(false);
  const [searchUnassign, setSearchUnassign] = useState("");
  const [searchAssign, setSearchAssign] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // const [auctionTotalPages, setAuctionTotalPages] = useState(1);
  // const [auctionTotal, setAuctionTotal] = useState(0);
  const [playerTypes, setPlayerTypes] = useState([
    { label: "Batsman", value: "batsman", color: "text-cyan-400" },
    { label: "Bowler", value: "bowler", color: "text-emerald-400" },
    { label: "All-rounder", value: "all-rounder", color: "text-amber-400" },
    {
      label: "Wicketkeeper",
      value: "wicketkeeper-batsman",
      color: "text-pink-400",
    },
  ]);

  const [slotDetail, setSlotDetail] = useState([]);
  const [selectedSlotSessions, setSelectedSlotSessions] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const debouncedUnassignPlayer = useDebounce(searchUnassign, 400);
  const debouncedAssignPlayer = useDebounce(searchAssign, 200);

  const enableBulkMode = Boolean(categorySearchId);

  const unassignedPlayers = useSelector((state) =>
    isTrialType ? state?.data?.selectedPlayers : state?.data?.unassignedPlayers,
  );
  const selectPlayersList = unassignedPlayers?.list || [];
  const unassignedTotalPages = unassignedPlayers?.pages || 1;
  const unassignedTotal = unassignedPlayers?.total || 0;
  const unassignedPage = unassignedPlayers?.page;

  const assignedPlayers = useSelector((state) =>
    isTrialType
      ? state?.data?.assignedinCategory
      : state?.data?.assignedPlayers,
  );

  const auctionPlayers = assignedPlayers?.list || [];
  const auctionPage = assignedPlayers?.page;
  const auctionTotalPages = assignedPlayers?.pages || 1;
  const auctionTotal = assignedPlayers?.total || 0;

  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(
          `/webSiteApi/auctionCategory/listCategories?auctionId=${auctionId}`,
        );

        const categoryData = res.data?.data?.data || res.data?.data || res.data;
        if (Array.isArray(categoryData)) {
          setAllCategories(categoryData);
        }
      } catch (error) {
        console.error("❌ Failed to fetch categories:", error);
      }
    };

    if (auctionId) {
      fetchCategories();
    }
  }, [auctionId]);

  const fetchSlotList = async () => {
    try {
      const res = await api.get(
        `/webSiteApi/auctionSlot/getListAuctionSlots?auctionId=${auctionId}`,
      );
      setSlotDetail(res?.data?.data?.data || []);
      return res?.data?.data?.data || [];
    } catch (error) {
      console.log("Error fetching slots:", error);
      showToast({
        type: "error",
        message: "Failed to fetch slots",
      });
      return [];
    }
  };

  const fetchSessionsForSlot = (slotId) => {
    const slot = slotDetail.find((s) => s._id === slotId);
    if (slot && slot.sessions) {
      setSelectedSlotSessions(slot.sessions);
    } else {
      setSelectedSlotSessions([]);
    }
  };

  const showToast = (data) => {
    setToast(data);
    if (data && !data.actionLabel) {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const fetchUnassignedPlayers = (page = 1) => {
    dispatch(
      isTrialType
        ? getSelectedPlayers({
            auctionId,
            page,
            itemsPerPage: itemsPerPage,
            debouncedUnassignPlayer,
            typeFilter,
            fromRating,
            toRating,
            slotFilter,
            slotSessionFilter,
            directSelectedCheckbox,
            directSelectedGradeFilter,
          })
        : getUnassignedinCategory({
            auctionId,
            page,
            itemsPerPage: itemsPerPage,
            debouncedUnassignPlayer,
            typeFilter,
          }),
    );
  };

  const fetchAssignedPlayers = (page = 1) => {
    dispatch(
      isTrialType
        ? getAssignedinCategory({
            auctionId,
            page,
            itemsPerPage: itemsPerPage,
            debouncedAssignPlayer,
            typeFilter: typeFilterA,
            fromRating: fromRatingA,
            toRating: toRatingA,
            categorySearchId,
            slotFilter: slotFilterA,
            slotSessionFilter: slotSessionFilterA,
            directSelectedCheckbox: directSelectedCheckboxA,
            directSelectedGradeFilter: directSelectedGradeFilterA,
          })
        : getAssignedPlayers({
            auctionId,
            page,
            itemsPerPage: itemsPerPage,
            debouncedAssignPlayer,
            typeFilter: typeFilterA,
            fromRating: fromRatingA,
            toRating: toRatingA,
            categorySearchId,
            slotFilter: slotFilterA,
            slotSessionFilter: slotSessionFilterA,
            directSelectedCheckbox: directSelectedCheckboxA,
            directSelectedGradeFilter: directSelectedGradeFilterA,
          }),
    );
  };

  useEffect(() => {
    if (!auctionId) return;
    fetchSlotList();

    if (activeSubTab === "unassignedSelected") {
      fetchUnassignedPlayers(1);
    } else {
      fetchAssignedPlayers(1);
    }
  }, [
    auctionId,
    debouncedUnassignPlayer,
    debouncedAssignPlayer,
    activeSubTab,
    itemsPerPage,
  ]);

  // Respect a parent-provided default tab (e.g., Assign to Category vs Players for Auction)
  useEffect(() => {
    if (defaultTab && defaultTab !== activeSubTab) {
      setActiveSubTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    if (!auctionId) return;

    if (activeSubTab === "unassignedSelected") {
      fetchUnassignedPlayers(1);
    } else {
      fetchAssignedPlayers(1);
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (activeSubTab === "unassignedSelected") {
      setSlotSessionFilter("");
      if (slotFilter) {
        fetchSessionsForSlot(slotFilter);
      } else {
        setSelectedSlotSessions([]);
      }
    } else {
      setSlotSessionFilterA("");
      if (slotFilterA) {
        fetchSessionsForSlot(slotFilterA);
      } else {
        setSelectedSlotSessions([]);
      }
    }
  }, [slotFilter, slotFilterA, activeSubTab]);

  const handleSearchUnassigned = async () => {
    setAppliedFilters({
      from: fromRating,
      to: toRating,
      type: typeFilter,
      slot: slotFilter,
      slotSession: slotSessionFilter,
      directSelected: directSelectedCheckbox,
      directSelectedGrade: directSelectedGradeFilter,
    });
    setShowResetUnassigned(
      fromRating !== "" ||
        toRating !== "" ||
        typeFilter !== "" ||
        debouncedUnassignPlayer !== "" ||
        slotFilter !== "" ||
        slotSessionFilter !== "" ||
        directSelectedCheckbox !== false ||
        directSelectedGradeFilter !== "",
    );
    fetchUnassignedPlayers(1);
  };

  const handleSearchAuction = async () => {
    setAppliedFiltersA({
      from: fromRatingA,
      to: toRatingA,
      type: typeFilterA,
      slot: slotFilterA,
      slotSession: slotSessionFilterA,
      directSelected: directSelectedCheckboxA,
      directSelectedGrade: directSelectedGradeFilterA,
    });
    setShowResetAuction(
      fromRatingA !== "" ||
        toRatingA !== "" ||
        typeFilterA !== "" ||
        debouncedAssignPlayer !== "" ||
        slotFilterA !== "" ||
        slotSessionFilterA !== "" ||
        categorySearchId !== "" ||
        directSelectedCheckboxA !== false ||
        directSelectedGradeFilterA !== "",
    );

    fetchAssignedPlayers(1);
    setShowBulkActions(!!categorySearchId);
  };

  const handleResetUnassigned = () => {
    setFromRating("");
    setToRating("");
    setTypeFilter("");
    setSlotFilter("");
    setSlotSessionFilter("");
    setDirectSelectedCheckbox(false);
    setDirectSelectedGradeFilter("");
    setSearchUnassign("");
    setAppliedFilters({
      from: "",
      to: "",
      type: "",
      slot: "",
      slotSession: "",
      directSelected: false,
      directSelectedGrade: "",
    });
    setShowResetUnassigned(false);
    setSelectedIds([]);
    setSelectedSlotSessions([]);

    const params = new URLSearchParams({
      categoryFilter: "notassignincategory",
      page: "1",
      limit: "8",
    });

    api
      .get(
        `/webSiteApi/auction/getSelectPlayers/${auctionId}?${params.toString()}`,
      )
      .catch((err) => {
        console.error("Error resetting unassigned", err);
        showToast({
          type: "error",
          message: "Failed to reset filters.",
        });
      });
  };

  const handleResetAuction = () => {
    setFromRatingA("");
    setToRatingA("");
    setTypeFilterA("");
    setSlotFilterA("");
    setSlotSessionFilterA("");
    setDirectSelectedCheckboxA(false);
    setDirectSelectedGradeFilterA("");
    setSearchAssign("");
    setCategorySearchId("");
    setCategorySearchName("");
    setAppliedFiltersA({
      from: "",
      to: "",
      type: "",
      slot: "",
      slotSession: "",
      directSelected: false,
      directSelectedGrade: "",
    });
    setShowResetAuction(false);
    setShowBulkActions(false);
    setSelectedAuctionIds([]);

    fetchAssignedPlayers(1);
  };

  useEffect(() => {
    if (activeSubTab === "auctionPlayers" && categorySearchId) {
      fetchAssignedPlayers(1);
      setShowBulkActions(true);
    }
  }, [categorySearchId]);

  const handleAssignClick = (ids) => {
    if (!ids.length) return;
    setAssignModalOpen(true);
  };

  const handleAuctionPlayerSelect = (playerId) => {
    if (!enableBulkMode) return;

    if (categorySearchId === "") {
      setSelectedAuctionIds((prev) =>
        prev.includes(playerId) ? [] : [playerId],
      );
    } else {
      setSelectedAuctionIds((prev) =>
        prev.includes(playerId)
          ? prev.filter((id) => id !== playerId)
          : [...prev, playerId],
      );
    }

    const selectedPlayer = auctionPlayers.find(
      (p) => p.player._id === playerId,
    );
    if (selectedPlayer) {
      setSelectedCategoryId(selectedPlayer?.category?._id || []);
    }
  };

  useEffect(() => {
    if (activeSubTab === "unassignedSelected") {
      fetchUnassignedPlayers(1);
    }
  }, [debouncedUnassignPlayer]);

  useEffect(() => {
    if (activeSubTab === "auctionPlayers") {
      fetchAssignedPlayers(1);
    }
  }, [debouncedAssignPlayer]);

  const startOptimisticDelete = (ids, cId) => {
    const playersToRemove = auctionPlayers.filter((p) =>
      ids.includes(p.player._id),
    );

    let timeLeft = 5;
    setUndoTimer(timeLeft);

    const intervalId = setInterval(() => {
      timeLeft -= 1;
      setUndoTimer(timeLeft);

      if (timeLeft === 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    const timeoutId = setTimeout(async () => {
      clearInterval(intervalId);
      setUndoTimer(null);

      try {
        await api.post(
          `/webSiteApi/auctionCategory/removePlayersFromCategory/${cId}`,
          { auctionId, playerIds: ids },
        );
        await fetchAssignedPlayers(auctionPage);
        await fetchUnassignedPlayers(unassignedPage);

        setSelectedAuctionIds([]);

        showToast({
          type: "success",
          message: `${ids.length} player(s) permanently removed.`,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setPendingDelete(null);
      }
    }, 5000);

    setPendingDelete({
      ids,
      players: playersToRemove,
      timeoutId,
    });

    showToast({
      type: "success",
      message: `${ids.length} player(s) removed. Undo? (${timeLeft}s)`,
      actionLabel: "Undo",
      onAction: () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        setUndoTimer(null);
        setPendingDelete(null);
        setSelectedAuctionIds([]);
        fetchAssignedPlayers(auctionPage);

        showToast({
          type: "success",
          message: "Undo successful",
        });
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const id = deleteCandidate.player._id;
    const cId = deleteCandidate?.category?._id;
    startOptimisticDelete([id], cId);
    setDeleteCandidate(null);
  };

  const handleBulkDeleteConfirm = () => {
    if (!selectedAuctionIds.length || !categorySearchId) return;

    if (categorySearchId === "") {
      showToast({
        type: "error",
        message:
          "Cannot delete players when viewing all categories. Please select a specific category first.",
      });
      return;
    }

    startOptimisticDelete(selectedAuctionIds, categorySearchId);
    setBulkDeleteConfirmOpen(false);
  };

  const handleSelectAllVisible = () => {
    const currentPageIds = selectPlayersList.map((p) => p.player._id);
    const allSelected = currentPageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      const newSet = new Set([...selectedIds, ...currentPageIds]);
      setSelectedIds(Array.from(newSet));
    }
  };

  const handleSelectAllAuctionVisible = () => {
    if (!categorySearchId || categorySearchId === "") {
      showToast({
        type: "error",
        message:
          "Cannot select multiple players when viewing all categories. Please select a specific category first.",
      });
      return;
    }

    const currentPageIds = auctionPlayers.map((p) => p.player._id);
    const allSelected = currentPageIds.every((id) =>
      selectedAuctionIds.includes(id),
    );

    if (allSelected) {
      setSelectedAuctionIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      const newSet = new Set([...selectedAuctionIds, ...currentPageIds]);
      setSelectedAuctionIds(Array.from(newSet));
    }
  };

  const renderFilterRow = (tab = "unassigned") => {
    const isUnassigned = tab === "unassigned";
    const from = isUnassigned ? fromRating : fromRatingA;
    const to = isUnassigned ? toRating : toRatingA;
    const type = isUnassigned ? typeFilter : typeFilterA;
    const slot = isUnassigned ? slotFilter : slotFilterA;
    const slotSession = isUnassigned ? slotSessionFilter : slotSessionFilterA;
    const directSelectedChecked = isUnassigned
      ? directSelectedCheckbox
      : directSelectedCheckboxA;
    const directSelectedGradeVal = isUnassigned
      ? directSelectedGradeFilter
      : directSelectedGradeFilterA;
    const setFrom = isUnassigned ? setFromRating : setFromRatingA;
    const setTo = isUnassigned ? setToRating : setToRatingA;
    const setType = isUnassigned ? setTypeFilter : setTypeFilterA;
    const setSlot = isUnassigned ? setSlotFilter : setSlotFilterA;
    const setSlotSession = isUnassigned
      ? setSlotSessionFilter
      : setSlotSessionFilter;
    const setDirectSelectedCB = isUnassigned
      ? setDirectSelectedCheckbox
      : setDirectSelectedCheckboxA;
    const setDirectSelectedGradeVal = isUnassigned
      ? setDirectSelectedGradeFilter
      : setDirectSelectedGradeFilterA;
    const handleSearch = isUnassigned
      ? handleSearchUnassigned
      : handleSearchAuction;
    const handleReset = isUnassigned
      ? handleResetUnassigned
      : handleResetAuction;

    const showReset = isUnassigned
      ? showResetUnassigned ||
        searchUnassign !== "" ||
        slotFilter !== "" ||
        slotSessionFilter !== "" ||
        directSelectedCheckbox !== false ||
        directSelectedGradeFilter !== ""
      : showResetAuction ||
        searchAssign !== "" ||
        categorySearchId !== "" ||
        slotFilterA !== "" ||
        slotSessionFilterA !== "" ||
        directSelectedCheckboxA !== false ||
        directSelectedGradeFilterA !== "";

    const count = isUnassigned ? unassignedTotal : auctionTotal;

    return (
      <div className="w-full  space-y-4">
        {/* Top row: Search + Filters button */}
        <div className="flex items-center gap-4 relative z-[9999]">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by player name or batch ID..."
              className="w-full pl-10 pr-4 py-2.5  border border-gray-700 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              value={isUnassigned ? searchUnassign : searchAssign}
              onChange={(e) =>
                isUnassigned
                  ? setSearchUnassign(e.target.value)
                  : setSearchAssign(e.target.value)
              }
            />
          </div>

          {/* Items Per Page Dropdown */}
          <div className="relative z-[100000]">
            <button
              onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
              className="text-[var(--secondary)] border border-[var(--secondary)] px-3 py-2 rounded-lg text-sm flex items-center gap-1"
            >
              <span>Showing {itemsPerPage}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isItemsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isItemsDropdownOpen && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-gray-700 shadow-lg w-40 z-[100001]">
                {[8, 16, 32, 64, 96].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setItemsPerPage(num);
                      setIsItemsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm text-[var(--color-button-primary)]  transition-colors ${
                      itemsPerPage === num
                        ? "text-white bg-[var(--secondary)]"
                        : "hover:bg-[var(--secondary-light)] hover:text-white text-[var(--secondary)]"
                    }`}
                  >
                    Showing {num}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter button - isko clickable banao */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-[var(--secondary)] border border-[var(--secondary)] px-3 py-2 rounded-lg text-sm flex items-center gap-1"
          >
            <Filter
              className={`h-4 w-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
            />
            <span>Filters</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Filter controls */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 gap-3">
            {/* Rating filters */}
            {isTrialType && (
              <>
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-500 mb-1.5">
                    Rating From
                  </label>
                  <select
                    value={from === "" ? "" : from}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : Number(e.target.value);
                      setFrom(value);
                      if (value !== "" && to !== "" && to < value) {
                        setTo("");
                      }
                    }}
                    className=" border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="" disabled>
                      Select rating
                    </option>
                    {ratingOptions.map((r) => (
                      <option
                        key={r}
                        value={r}
                        className="text-[var(--secondary)]"
                      >
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-500 mb-1.5">
                    Rating To
                  </label>
                  <select
                    value={to === "" ? "" : to}
                    disabled={from === ""}
                    onChange={(e) =>
                      setTo(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className={` border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${
                      from === "" ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Select rating</option>
                    {ratingOptions
                      .filter((r) => from === "" || r >= from)
                      .map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            )}

            {/* Player Type */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 mb-1.5">
                Player Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="">All Types</option>
                {playerTypes.map((t) => (
                  <option
                    value={t.value}
                    key={t.label}
                    className="text-[var(--secondary)]"
                  >
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Selected Checkbox */}
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="directSelectedCheckbox"
                checked={directSelectedChecked}
                onChange={(e) => setDirectSelectedCB(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="directSelectedCheckbox"
                className="text-xs font-medium text-gray-500 ml-2 cursor-pointer"
              >
                Only Direct Selected
              </label>
            </div>

            {/* Direct Selected Grade Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 mb-1.5">
                Direct Grade
              </label>
              <select
                value={directSelectedGradeVal}
                onChange={(e) => setDirectSelectedGradeVal(e.target.value)}
                className="border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="">All Grades</option>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            {/* Slot filter */}
            {isUnassigned && isTrialType && (
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-500 mb-1.5">
                  Slot
                </label>
                <select
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
                  className="border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="">All Slots</option>
                  {slotDetail.map((slot) => (
                    <option
                      key={slot._id}
                      value={slot._id}
                      className="text-[var(--secondary)]"
                    >
                      {slot.slotName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Session Filter */}
            {slot && selectedSlotSessions.length > 0 && (
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-500 mb-1.5">
                  Session
                </label>
                <select
                  value={slotSession}
                  onChange={(e) => setSlotSession(e.target.value)}
                  className=" border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="">All Sessions</option>
                  {selectedSlotSessions.map((session) => (
                    <option
                      key={session._id}
                      value={session._id}
                      className="text-[var(--secondary)]"
                    >
                      {session.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category filter - Only for Auction Tab */}
            {!isUnassigned && (
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-500 mb-1.5">
                  Category
                </label>
                <select
                  value={categorySearchId}
                  onChange={(e) => {
                    const value = e.target.value;
                    const found = allCategories.find((c) => c._id === value);
                    setCategorySearchId(value);
                    setCategorySearchName(found?.name || "");
                  }}
                  className=" border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="">All Categories</option>
                  {allCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action buttons and results */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-button-primary)] text-white text-sm font-semibold hover:from-cyan-600 hover:to-blue-700 active:scale-[0.98] shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Search className="w-4 h-4" />
                  Apply Filters
                </button>

                {showReset && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl border border-gray-600 text-sm font-medium text-gray-700 hover:bg-gray-800/50 hover:border-gray-500 active:scale-[0.98] transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  Found:{" "}
                  <span className="font-semibold text-cyan-400">{count}</span>{" "}
                  players
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="auction-panel w-full overflow-hidden">
      {/* Header Tabs */}
      {/* <div className="border-b border-gray-800">
        <div className="flex gap-3 px-6 py-4">
          <button
            onClick={() => setActiveSubTab("unassignedSelected")}
            className={`px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
              activeSubTab === "unassignedSelected"
                ? "bg-gradient-to-r from-cyan-900/30 to-blue-900/30 text-cyan-300 border border-cyan-800/50 shadow-lg shadow-cyan-900/20"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300 border border-gray-700"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${activeSubTab === "unassignedSelected" ? "bg-cyan-400" : "bg-gray-600"}`}
            />
            {isTrialType ? "Selected (Not Assigned)" : "Assign to Category"}
            {selectedIds.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-cyan-900/50 text-cyan-300 border border-cyan-700">
                {selectedIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("auctionPlayers")}
            className={`px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
              activeSubTab === "auctionPlayers"
                ? "bg-gradient-to-r from-emerald-900/30 to-green-900/30 text-emerald-300 border border-emerald-800/50 shadow-lg shadow-emerald-900/20"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300 border border-gray-700"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${activeSubTab === "auctionPlayers" ? "bg-emerald-400" : "bg-gray-600"}`}
            />
            Players for Auction
            {selectedAuctionIds.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-700">
                {selectedAuctionIds.length}
              </span>
            )}
          </button>
        </div>
      </div> */}

      {/* Main Content */}
      <div className=" space-y-3">
        {activeSubTab === "unassignedSelected" ? (
          <>
            {/* Unassigned Section */}
            <div className="auction-card relative z-[60] space-y-3 p-4 backdrop-blur-sm">
              {renderFilterRow("unassigned")}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSelectAllVisible}
                    className="auction-btn auction-btn-blue"
                  >
                    {selectPlayersList.every((p) =>
                      selectedIds.includes(p.player?._id),
                    ) && selectPlayersList.length > 0 ? (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4" />
                        Select All (Visible)
                      </>
                    )}
                  </button>

                  <span className="text-sm text-gray-500">
                    {selectedIds.length} selected
                  </span>
                </div>

                <button
                  disabled={selectedIds.length === 0}
                  onClick={() => handleAssignClick(selectedIds)}
                  className={`auction-btn ${
                    selectedIds.length > 0
                      ? "auction-btn-primary"
                      : "auction-btn-ghost"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Assign to Auction ({selectedIds.length})
                </button>
              </div>
            </div>

            {/* Players Grid */}
            <div className="max-h-[65vh] relative z-[10] overflow-y-auto pt-3 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {selectPlayersList?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-sm text-gray-500 rounded-2xl border-2 border-dashed border-gray-800 bg-gray-900/30">
                  <Search className="w-12 h-12 mb-4 text-gray-600" />
                  <p className="text-lg font-medium text-gray-500 mb-1">
                    No players found
                  </p>
                  <p className="text-gray-600">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {selectPlayersList.map((player) => (
                    <PlayerCard
                      key={player?.player?._id}
                      player={player}
                      selected={selectedIds.includes(player?.player?._id)}
                      selectable
                      onSelect={() => {
                        setSelectedIds((prev) =>
                          prev.includes(player.player._id)
                            ? prev.filter((id) => id !== player.player._id)
                            : [...prev, player.player._id],
                        );
                      }}
                      isTrialType={isTrialType}
                      onViewDetails={() => {
                        setSelectedPlayerDetails(player);
                        setIsPlayerDetailsOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {unassignedTotalPages > 1 && (
              <Pagination
                currentPage={unassignedPage}
                totalPages={unassignedTotalPages}
                onPageChange={fetchUnassignedPlayers}
                summaryPrefix={`${unassignedTotal} total | Page`}
                prevLabel="Previous"
                nextLabel="Next"
              />
            )}
          </>
        ) : (
          <>
            {/* Auction Players Section */}
            <div className="auction-card relative z-[60] space-y-3 p-4 backdrop-blur-sm">
              {renderFilterRow("auction")}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-3">
                  {enableBulkMode && (
                    <>
                      <button
                        onClick={handleSelectAllAuctionVisible}
                        className="auction-btn auction-btn-blue"
                      >
                        {auctionPlayers.every((p) =>
                          selectedAuctionIds.includes(p.player._id),
                        ) && auctionPlayers.length > 0 ? (
                          <>
                            <CheckSquare className="h-4 w-4" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <Square className="h-4 w-4" />
                            Select All (Visible)
                          </>
                        )}
                      </button>

                      <button
                        disabled={
                          selectedAuctionIds.length === 0 ||
                          categorySearchId === ""
                        }
                        onClick={() => setBulkDeleteConfirmOpen(true)}
                        className={`auction-btn ${
                          selectedAuctionIds.length > 0 &&
                          categorySearchId !== ""
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "auction-btn-ghost"
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Selected ({selectedAuctionIds.length})
                      </button>
                    </>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  {categorySearchName && (
                    <div className="text-sm text-gray-500">
                      Viewing:{" "}
                      <span className="font-semibold text-emerald-400">
                        {categorySearchName}
                      </span>
                    </div>
                  )}

                  {!enableBulkMode && (
                    <div className="text-xs text-[var(--secondary)] bg-[var(--background)] px-3 py-1.5 rounded-lg border border-amber-800/30">
                      💡 Select a category to enable bulk actions
                    </div>
                  )}

                  {enableBulkMode && categorySearchId === "" && (
                    <div className="text-xs text-yellow-400 bg-yellow-900/20 px-3 py-1.5 rounded-lg border border-yellow-800/30">
                      ⚠️ Single selection only in "All Categories"
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Auction Players Grid */}
            <div className="max-h-[65vh] relative z-[10] overflow-y-auto pt-3 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {auctionPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-sm text-gray-500 rounded-2xl border-2 border-dashed border-gray-800 bg-gray-900/30">
                  <Users className="w-12 h-12 mb-4 text-gray-600" />
                  <p className="text-lg font-medium text-gray-500 mb-1">
                    No auction players
                  </p>
                  <p className="text-gray-600">
                    Select a category or adjust filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {auctionPlayers.map((player) => (
                    <PlayerCard
                      key={player.player._id}
                      player={player}
                      selectable
                      selected={selectedAuctionIds.includes(player.player._id)}
                      onSelect={() =>
                        handleAuctionPlayerSelect(player.player._id)
                      }
                      showDelete
                      onDelete={() => setDeleteCandidate(player)}
                      onViewDetails={() => {
                        setSelectedPlayerDetails(player);
                        setIsPlayerDetailsOpen(true);
                      }}
                      // activeTab={tab}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {auctionTotalPages > 1 && (
              <Pagination
                currentPage={auctionPage}
                totalPages={auctionTotalPages}
                onPageChange={fetchAssignedPlayers}
                summaryPrefix={`${auctionTotal} total | Page`}
                prevLabel="Previous"
                nextLabel="Next"
              />
            )}
          </>
        )}
      </div>

      {/* Modals and Toasts */}
      <AssignCategoryModal
        isOpen={assignModalOpen}
        count={selectedIds.length}
        onClose={() => setAssignModalOpen(false)}
        auctionId={auctionId}
        selectedIds={selectedIds}
        fetchUnassignedPlayers={fetchUnassignedPlayers}
        fetchAssignedPlayers={fetchAssignedPlayers}
        resetSelectedIds={() => setSelectedIds([])}
      />

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-white border border-gray-800 rounded-2xl shadow-2xl p-4 w-full max-w-md space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Remove Player
              </h2>
              <button
                onClick={() => setDeleteCandidate(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="bg-[var(--background)] rounded-xl p-4 border border-gray-700">
              <p className="text-sm text-gray-700 leading-relaxed">
                Remove{" "}
                <span className="font-semibold text-gray-900">
                  {deleteCandidate?.player?.name}
                </span>{" "}
                from{" "}
                <span className="font-semibold text-emerald-800">
                  Auction Players
                </span>
                ?
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Player will be moved back to{" "}
                <span className="text-[var(--secondary)]">
                  Selected (Not Assigned)
                </span>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-700 text-gray-500 hover:bg-gray-800 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 text-sm font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
              >
                Remove Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {bulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-5">
            <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Remove {selectedAuctionIds.length} Players
            </h2>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-sm text-gray-700">
                Are you sure you want to remove{" "}
                <span className="font-bold text-gray-900">
                  {selectedAuctionIds.length}
                </span>{" "}
                players from auction?
              </p>
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                ⚡ You can undo this action for 5 seconds
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setBulkDeleteConfirmOpen(false)}
                className="px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-700 text-gray-500 hover:bg-gray-800 hover:text-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                className="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 to-pink-700 text-gray-900 hover:from-red-700 hover:to-pink-800 shadow-lg shadow-red-500/20 transition-all"
              >
                Remove All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${
            toast.type === "error"
              ? "bg-red-900/20 border-red-800 text-red-300"
              : "bg-emerald-900/20 border-emerald-800 text-emerald-300"
          } backdrop-blur-sm`}
        >
          <div
            className={`w-2 h-2 rounded-full ${toast.type === "error" ? "bg-red-400" : "bg-emerald-400"}`}
          />
          <span>
            {toast.message.replace(/\(\d+s\)/, "")}
            {undoTimer !== null && (
              <span className="ml-1 font-semibold text-cyan-400">
                ({undoTimer}s)
              </span>
            )}
          </span>

          {toast.actionLabel && (
            <button
              onClick={toast.onAction}
              className="ml-3 px-3 py-1 text-sm rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}

      {/* Player Details Popup */}
      <PlayerDetailsPopup
        isOpen={isPlayerDetailsOpen}
        onClose={() => {
          setIsPlayerDetailsOpen(false);
          setSelectedPlayerDetails(null);
        }}
        player={selectedPlayerDetails}
        isTrialType={isTrialType}
        onDelete={() => setIsDeleteOpen(true)}
        activeSubTab={activeSubTab}
      />

      <DeleteConfirmModal
        open={isDeleteOpen}
        title="Remove Player"
        description="Are you sure you want to remove this player from the auction?"
        loading={deleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          if (!selectedPlayerDetails?.player?._id) {
            toast.error("Player not found");
            return;
          }

          setDeleting(true);

          let res = null;

          try {
            res = await dispatch(
              deletePlayer(auctionId, selectedPlayerDetails.player._id),
            );
          } catch (e) {
            console.error("Delete API error:", e);
          }

          // 🔐 HARD SAFETY
          setDeleting(false);

          if (!res || res?.data?.success === false) {
            toast.error("Failed to remove player");
            return;
          }

          // toast.success("Player removed successfully");
          showToast({
            type: "success",
            message: `Player removed successfully`,
          });

          // ✅ CLOSE MODALS FIRST
          setIsDeleteOpen(false);
          setIsPlayerDetailsOpen(false);

          // ✅ CLEAR DATA AFTER UI CLOSES
          setTimeout(() => {
            setSelectedPlayerDetails(null);
          }, 0);

          // optional refresh
          dispatch(fetchAssignedPlayers());
          dispatch(fetchUnassignedPlayers());
        }}
      />
      <style>{`
    @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
    }
    .animate-slideDown {
    animation: slideDown 0.2s ease-out;
    }
`}</style>
    </div>
  );
};

export default SelectedAuctionManager;
