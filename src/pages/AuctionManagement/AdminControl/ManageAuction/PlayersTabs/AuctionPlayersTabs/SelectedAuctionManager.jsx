import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Filter,
  Users,
  Trash2,
  CheckSquare,
  Eye,
  LayoutGrid,
  Square,
  Table2,
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

const inputClass =
  "h-9 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/15 [&>option]:bg-[var(--bg-card)] [&>option]:text-[var(--text-primary)]";

const labelClass =
  "mb-1 text-[11px] font-semibold text-[var(--text-secondary)]";

const controlButtonClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] shadow-sm transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]";

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
  const [unassignedViewMode, setUnassignedViewMode] = useState("grid");
  const [auctionViewMode, setAuctionViewMode] = useState("grid");
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
  const getPlayerCore = (item) => item?.player || {};

  const formatRoleLabel = (role) => {
    if (!role) return "Role not set";
    return String(role)
      .split(/[-\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const getPlayerRole = (item) =>
    formatRoleLabel(
      item?.player?.playerRole ||
        item?.playerRole ||
        item?.playersRatings?.playerType,
    );

  const getRatingLabel = (item) =>
    item?.directSelected
      ? item?.directSelectedGrade || "N/A"
      : item?.playersRatings?.avgRating
        ? Number(item.playersRatings.avgRating).toFixed(2)
        : "-";

  const ViewModeToggle = ({ mode, onChange }) => (
    <div className="inline-flex h-9 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-0.5 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${
          mode === "grid"
            ? "bg-[var(--secondary)] text-[#102033]"
            : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
        }`}
        title="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
        Grid
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${
          mode === "table"
            ? "bg-[var(--secondary)] text-[#102033]"
            : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
        }`}
        title="Table view"
      >
        <Table2 className="h-4 w-4" />
        Table
      </button>
    </div>
  );

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
      : setSlotSessionFilterA;
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
        from !== "" ||
        to !== "" ||
        type !== "" ||
        slot !== "" ||
        slotSession !== "" ||
        directSelectedChecked !== false ||
        directSelectedGradeVal !== ""
      : showResetAuction ||
        searchAssign !== "" ||
        from !== "" ||
        to !== "" ||
        type !== "" ||
        categorySearchId !== "" ||
        slot !== "" ||
        slotSession !== "" ||
        directSelectedChecked !== false ||
        directSelectedGradeVal !== "";

    const count = isUnassigned ? unassignedTotal : auctionTotal;

    return (
      <div className="w-full space-y-3">
        {/* Top row: Search + Filters button */}
        <div className="relative z-[30] flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search by player name or batch ID..."
              className={`${inputClass} w-full pl-10`}
              value={isUnassigned ? searchUnassign : searchAssign}
              onChange={(e) =>
                isUnassigned
                  ? setSearchUnassign(e.target.value)
                  : setSearchAssign(e.target.value)
              }
            />
          </div>

          {/* Items Per Page Dropdown */}
          <div className="relative z-[40]">
            <button
              onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
              className={controlButtonClass}
            >
              <span>Showing {itemsPerPage}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isItemsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isItemsDropdownOpen && (
              <div className="absolute right-0 top-full z-[50] mt-1 w-40 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
                {[8, 16, 32, 64, 96].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setItemsPerPage(num);
                      setIsItemsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors ${
                      itemsPerPage === num
                        ? "text-[var(--text-dark)] bg-[var(--secondary)]"
                        : "text-[var(--text-primary)] hover:bg-[var(--accent-light)]"
                    }`}
                  >
                    Showing {num}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ViewModeToggle
            mode={isUnassigned ? unassignedViewMode : auctionViewMode}
            onChange={isUnassigned ? setUnassignedViewMode : setAuctionViewMode}
          />

          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`${controlButtonClass} ${
              showFilters
                ? "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"
                : ""
            }`}
          >
            <Filter
              className={`h-4 w-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
            />
            <span>Filters</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
            />
          </button>

          {isUnassigned && (
            <>
              <button
                onClick={handleSelectAllVisible}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 text-xs font-semibold text-[var(--primary)] transition hover:bg-[var(--secondary-lighter)]"
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
                    Select All
                  </>
                )}
              </button>
              <button
                disabled={selectedIds.length === 0}
                onClick={() => handleAssignClick(selectedIds)}
                className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  selectedIds.length > 0
                    ? "bg-[var(--secondary)] text-[#102033] hover:bg-[var(--secondary-strong)]"
                    : "border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)]"
                }`}
              >
                <Users className="h-4 w-4" />
                Assign to Auction ({selectedIds.length})
              </button>
            </>
          )}
        </div>

        {/* Filter controls */}
        {showFilters && (
          <div className="flex flex-col gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-2.5 xl:flex-row xl:items-end">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {/* Rating filters */}
            {isTrialType && (
              <>
                <div className="flex flex-col">
                  <label className={labelClass}>
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
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select rating
                    </option>
                    {ratingOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>
                    Rating To
                  </label>
                  <select
                    value={to === "" ? "" : to}
                    disabled={from === ""}
                    onChange={(e) =>
                      setTo(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className={`${inputClass} ${
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
              <label className={labelClass}>
                Player Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={inputClass}
              >
                <option value="">All Types</option>
                {playerTypes.map((t) => (
                  <option value={t.value} key={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Selected Grade Filter */}
            <div className="flex flex-col">
              <label className={labelClass}>
                Direct Grade
              </label>
              <select
                value={directSelectedGradeVal}
                onChange={(e) => setDirectSelectedGradeVal(e.target.value)}
                className={inputClass}
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
                <label className={labelClass}>
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
                  className={inputClass}
                >
                  <option value="">All Slots</option>
                  {slotDetail.map((slot) => (
                    <option key={slot._id} value={slot._id}>
                      {slot.slotName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Session Filter */}
            {slot && selectedSlotSessions.length > 0 && (
              <div className="flex flex-col">
                <label className={labelClass}>
                  Session
                </label>
                <select
                  value={slotSession}
                  onChange={(e) => setSlotSession(e.target.value)}
                  className={inputClass}
                >
                  <option value="">All Sessions</option>
                  {selectedSlotSessions.map((session) => (
                    <option key={session._id} value={session._id}>
                      {session.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category filter - Only for Auction Tab */}
            {!isUnassigned && (
              <div className="flex flex-col">
                <label className={labelClass}>
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
                  className={inputClass}
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

            {/* Standalone checkbox stays after dropdown filters */}
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id={`directSelectedCheckbox-${tab}`}
                checked={directSelectedChecked}
                onChange={(e) => setDirectSelectedCB(e.target.checked)}
                className="h-4 w-4 cursor-pointer"
              />
              <label
                htmlFor={`directSelectedCheckbox-${tab}`}
                className="ml-2 cursor-pointer text-xs font-semibold text-[var(--text-secondary)]"
              >
                Only Direct Selected
              </label>
            </div>

            </div>

            {/* Action buttons and results */}
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[var(--border-card)] pt-2 xl:border-l xl:border-t-0 xl:pl-2 xl:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSearch}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-3 text-xs font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)]"
                >
                  <Search className="w-4 h-4" />
                  Apply Filters
                </button>

                {showReset && (
                  <button
                    onClick={handleReset}
                    className={controlButtonClass}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3">
                <Users className="h-4 w-4 text-[var(--text-secondary)]" />
                <span className="text-xs text-[var(--text-secondary)]">
                  Found:{" "}
                  <span className="font-semibold text-[var(--primary)]">{count}</span>{" "}
                  players
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPlayersTable = ({ players, isUnassigned }) => (
    <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
      <div className="professional-scrollbar overflow-x-auto">
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--bg-main)] text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
            <tr className="border-b border-[var(--border-card)]">
              <th className="w-12 px-3 py-3">Select</th>
              <th className="px-3 py-3">Player</th>
              <th className="px-3 py-3">Batch ID</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">{isTrialType ? "Rating" : "Status"}</th>
              {!isUnassigned && <th className="px-3 py-3">Category</th>}
              {isTrialType && <th className="px-3 py-3">Slot / Session</th>}
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-card)]">
            {players.map((item) => {
              const core = getPlayerCore(item);
              const id = core?._id;
              const selected = isUnassigned
                ? selectedIds.includes(id)
                : selectedAuctionIds.includes(id);
              const name = core?.name || "Unknown";
              const profilePicture = core?.profilePicture;
              const initials =
                String(name)
                  .split(" ")
                  .filter(Boolean)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "P";
              const categoryName =
                item?.category?.name ||
                core?.category?.name ||
                item?.categoryName ||
                "-";

              return (
                <tr
                  key={id}
                  className={`transition hover:bg-[var(--accent-light)]/60 ${
                    selected ? "bg-[var(--accent-light)]" : "bg-[var(--bg-card)]"
                  }`}
                >
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        isUnassigned
                          ? setSelectedIds((prev) =>
                              prev.includes(id)
                                ? prev.filter((playerId) => playerId !== id)
                                : [...prev, id],
                            )
                          : handleAuctionPlayerSelect(id)
                      }
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                        selected
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--border-primary)] hover:text-[var(--primary)]"
                      }`}
                      title={selected ? "Deselect player" : "Select player"}
                    >
                      {selected ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--accent-light)] text-xs font-bold text-[var(--primary)]">
                        {profilePicture ? (
                          <img
                            src={profilePicture}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--text-primary)]">
                          {name}
                        </p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {core?.mobileNumber || core?.phone || core?.email || "Player"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[var(--text-secondary)]">
                    {core?.batchId || "-"}
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex max-w-[160px] rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2.5 py-1 text-xs font-bold text-[var(--primary)]">
                      <span className="truncate">{getPlayerRole(item)}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">
                    {isTrialType ? getRatingLabel(item) : item?.status || "Selected"}
                  </td>
                  {!isUnassigned && (
                    <td className="px-3 py-3 text-[var(--text-secondary)]">
                      {categoryName}
                    </td>
                  )}
                  {isTrialType && (
                    <td className="px-3 py-3 text-[var(--text-secondary)]">
                      <div className="max-w-[180px] truncate">
                        {item?.slot?.slotName || "-"}
                      </div>
                      <div className="max-w-[180px] truncate text-xs text-[var(--text-muted)]">
                        {item?.session?.name || "-"}
                      </div>
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlayerDetails(item);
                          setIsPlayerDetailsOpen(true);
                        }}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-2.5 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                      {!isUnassigned && (
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(item)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-[var(--bg-card)] px-2.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
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
    <div className="w-full overflow-visible">
      {/* Header Tabs */}
      {/* <div className="border-b border-gray-800">
        <div className="flex gap-3 px-6 py-4">
          <button
            onClick={() => setActiveSubTab("unassignedSelected")}
            className={`px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
              activeSubTab === "unassignedSelected"
                ? "bg-gradient-to-r from-cyan-900/30 to-blue-900/30 text-cyan-300 border border-cyan-800/50 shadow-lg shadow-cyan-900/20"
                : "bg-gray-800/50 text-[var(--text-muted)] hover:bg-gray-800 hover:text-gray-300 border border-gray-700"
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
                : "bg-gray-800/50 text-[var(--text-muted)] hover:bg-gray-800 hover:text-gray-300 border border-gray-700"
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
      <div className="space-y-4">
        {activeSubTab === "unassignedSelected" ? (
          <>
            {/* Unassigned Section */}
            <div className="relative z-[20] space-y-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] sm:p-4">
              {renderFilterRow("unassigned")}
            </div>

            {/* Players Grid */}
            <div className="professional-scrollbar relative z-[10] max-h-[65vh] overflow-y-auto pr-1">
              {selectPlayersList?.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--bg-card)] px-4 py-14 text-center text-sm text-[var(--text-secondary)] shadow-[var(--shadow-card)]">
                  <Search className="mb-3 h-10 w-10 text-[var(--primary)]" />
                  <p className="mb-1 text-base font-semibold text-[var(--text-primary)]">
                    No players found
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              ) : (
                <>
                  {unassignedViewMode === "table" ? (
                    renderPlayersTable({
                      players: selectPlayersList,
                      isUnassigned: true,
                    })
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
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
                </>
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
            <div className="relative z-[20] space-y-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] sm:p-4">
              {renderFilterRow("auction")}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2">
                <div className="flex items-center gap-3">
                  {enableBulkMode && (
                    <>
                      <button
                        onClick={handleSelectAllAuctionVisible}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--secondary-lighter)]"
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
                        className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          selectedAuctionIds.length > 0 &&
                          categorySearchId !== ""
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)]"
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
                    <div className="text-sm text-[var(--text-secondary)]">
                      Viewing:{" "}
                      <span className="font-semibold text-[var(--primary)]">
                        {categorySearchName}
                      </span>
                    </div>
                  )}

                  {!enableBulkMode && (
                    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
                      Select a category to enable bulk actions
                    </div>
                  )}

                  {enableBulkMode && categorySearchId === "" && (
                    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
                      Single selection only in "All Categories"
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Auction Players Grid */}
            <div className="professional-scrollbar relative z-[10] max-h-[65vh] overflow-y-auto pr-1">
              {auctionPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--bg-card)] px-4 py-14 text-center text-sm text-[var(--text-secondary)] shadow-[var(--shadow-card)]">
                  <Users className="mb-3 h-10 w-10 text-[var(--primary)]" />
                  <p className="mb-1 text-base font-semibold text-[var(--text-primary)]">
                    No auction players
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    Select a category or adjust filters
                  </p>
                </div>
              ) : (
                <>
                  {auctionViewMode === "table" ? (
                    renderPlayersTable({
                      players: auctionPlayers,
                      isUnassigned: false,
                    })
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
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
                </>
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
          <div className="bg-[var(--bg-card)] border border-gray-800 rounded-2xl shadow-2xl p-4 w-full max-w-md space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Remove Player
              </h2>
              <button
                onClick={() => setDeleteCandidate(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="bg-[var(--background)] rounded-xl p-4 border border-gray-700">
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                Remove{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {deleteCandidate?.player?.name}
                </span>{" "}
                from{" "}
                <span className="font-semibold text-emerald-800">
                  Auction Players
                </span>
                ?
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Player will be moved back to{" "}
                <span className="text-[var(--secondary)]">
                  Selected (Not Assigned)
                </span>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-700 text-[var(--text-secondary)] hover:bg-gray-800 hover:text-[var(--text-dark)] transition-all"
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
              <p className="text-sm text-[var(--text-primary)]">
                Are you sure you want to remove{" "}
                <span className="font-bold text-[var(--text-primary)]">
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
                className="px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-700 text-[var(--text-secondary)] hover:bg-gray-800 hover:text-[var(--text-primary)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                className="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 to-pink-700 text-[var(--text-primary)] hover:from-red-700 hover:to-pink-800 shadow-lg shadow-red-500/20 transition-all"
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
