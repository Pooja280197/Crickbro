import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  createSession,
  createSlot,
  deleteSession,
  deleteSlot,
  editSession,
  fetchAllSelectors,
  fetchAuctionDetails,
  fetchSlotList,
  updateSlotThunk,
} from "../../../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import CreateSlot from "./CreateSlot";
import CreateSession from "./CreateSession";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../../../../../components/DeleteConfirmModal";
import { useDebounce } from "../../../../../components/useDebounce";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Layers,
  MapPin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

const Slot = ({ auctionId }) => {
  const [slotPopup, setSlotPopup] = useState(false);
  const [isEditingSlot, setIsEditingSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState("");
  const debouncedSearchQuery = useDebounce(search, 1000);
  const [deleteContext, setDeleteContext] = useState({
    type: null,
    slotId: null,
    sessionId: null,
  });
  const slotLoading = useSelector((state) => state?.loading?.slotList);
  const slotDetails = useSelector((state) => state?.data?.slotList);
  const tournamentId = useSelector((state) => state.tournamentId);
  const total = slotDetails?.total || 0;
  const currentPage = slotDetails?.page || 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const selectorsList = useSelector(
    (state) => state?.data?.auctionSelectors?.selectors,
  );

  const slotList = slotDetails?.data || [];
  
  const [slotData, setSlotData] = useState({
    tournamentId: tournamentId,
    auctionId: auctionId || "",
    slotName: "",
    slotCode: "",
    description: "",
    selectors: [],
    location: {
      venue: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      link: "",
    },
  });

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAuctionDetails(auctionId));
    dispatch(fetchSlotList(auctionId, page, limit, search));
    dispatch(fetchAllSelectors(auctionId));
  }, [auctionId, dispatch, page, limit, search]);

  const [slotLocalList, setSlotLocalList] = useState([]);

  useEffect(() => {
    if (!Array.isArray(slotList)) return;

    const slotSig = slotList
      .map((s) => `${s._id}|${s.updatedAt || ""}`)
      .join(",");
    const localSig = slotLocalList
      .map((s) => `${s._id}|${s.updatedAt || ""}`)
      .join(",");

    if (slotSig !== localSig) {
      setSlotLocalList(slotList);
    }
  }, [slotList, slotLocalList]);

  const resetSlotForm = () => {
    setSlotData({
      slotName: "",
      slotCode: "",
      description: "",
      location: {
        venue: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        link: "",
      },
      selectors: [],
    });
  };

  const [expandedSlots, setExpandedSlots] = useState([]);
  const [sessionForm, setSessionForm] = useState({
    isOpen: false,
    slotId: null,
    isEditing: false,
    editSessionId: null,
    data: {
      name: "",
      slotDate: "",
      slotStartTime: "",
      slotEndTime: "",
      status: "scheduled",
      lockStatus: "unlocked",
    },
  });

  const toggleSlotSessions = (slotId) => {
    setExpandedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId],
    );
  };

  const openCreateSession = (slotId) => {
    setSessionForm({
      isOpen: true,
      slotId,
      isEditing: false,
      editSessionId: null,
      data: {
        name: "",
        slotDate: "",
        slotStartTime: "",
        slotEndTime: "",
        status: "scheduled",
        lockStatus: "unlocked",
      },
    });
  };

  const openEditSession = (slotId, session) => {
    setSessionForm({
      isOpen: true,
      slotId,
      isEditing: true,
      editSessionId: session._id,
      data: {
        name: session.name || "",
        slotDate: session.slotDate || "",
        slotStartTime: session.slotStartTime || "",
        slotSize: session.slotSize || "",
        slotEndTime: session.slotEndTime || "",
        status: session.status || "scheduled",
        lockStatus: session.lockStatus,
      },
    });
  };

  const closeSessionForm = () =>
    setSessionForm({
      isOpen: false,
      slotId: null,
      isEditing: false,
      editSessionId: null,
      data: { name: "", slotDate: "", slotStartTime: "", slotEndTime: "" },
    });

  const handleSessionChange = (e) => {
    const { name, value } = e.target;
    setSessionForm((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }));
  };

  const handleSaveSession = async () => {
    const { slotId, isEditing, editSessionId, data } = sessionForm;

    if (!slotId || !data.name) {
      toast.error("Please fill required session fields");
      return;
    }

    if (!slotId) return;

    try {
      if (isEditing) {
        await dispatch(editSession(slotId, editSessionId, data));
        toast.success("Session updated successfully");
      } else {
        await dispatch(createSession(slotId, data));
        toast.success("Session created successfully");
      }
      dispatch(fetchSlotList(auctionId, page, limit));
      closeSessionForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleConfirmDelete = async () => {
    const { type, slotId, sessionId } = deleteContext;

    try {
      if (type === "session") {
        await dispatch(deleteSession(slotId, sessionId));
        toast.success("Session deleted successfully");
      }

      if (type === "slot") {
        await dispatch(deleteSlot(slotId));
        toast.success("Slot deleted successfully");
      }
      setPage(1);
      dispatch(fetchSlotList(auctionId, 1, limit));
      setOpenDelete(false);
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  const handleSlotChange = (e) => {
    const { name, value } = e.target;

    if (name === "selectors") {
      setSlotData((prev) => ({
        ...prev,
        selectors: Array.isArray(value) ? value : [],
      }));
      return;
    }

    if (name === "location") {
      setSlotData((prev) => ({
        ...prev,
        location: value,
      }));
      return;
    }

    setSlotData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSlot = (slot) => {
    setSelectedSlot(slot._id);
    setIsEditingSlot(true);

    setSlotData({
      slotName: slot.slotName || "",
      slotCode: slot.slotCode || "",
      description: slot.description || "",
      selectors: slot.selectors || [],
      location: {
        venue: slot.location?.venue || "",
        address: slot.location?.address || "",
        city: slot.location?.city || "",
        state: slot.location?.state || "",
        country: slot.location?.country || "",
        pincode: slot.location?.pincode || "",
        link: slot.location?.link || "",
      },
      tournamentId: slot.tournamentId?._id || slot.tournamentId,
      auctionId: slot.auctionId?._id || slot.auctionId || auctionId || "",
      _id: slot._id,
    });

    setSlotPopup(true);
  };

  const handleUpdateSlot = async (slotData) => {
    if (!selectedSlot) {
      toast.error("No slot selected for update");
      return;
    }

    try {
      const updateData = {
        ...slotData,
        tournamentId: slotData.tournamentId || tournamentId,
        auctionId: slotData.auctionId || auctionId || "",
        _id: selectedSlot,
      };

      await dispatch(updateSlotThunk(selectedSlot, updateData));
      toast.success("Slot updated successfully!");
      setSlotLocalList((prev) =>
        prev.map((s) => (s._id === selectedSlot ? { ...s, ...updateData } : s)),
      );
      dispatch(fetchSlotList(auctionId, page, limit));
      setSlotPopup(false);
      setIsEditingSlot(false);
      setSelectedSlot(null);
      resetSlotForm();
    } catch (error) {
      console.error("Error updating slot:", error);
      toast.error(error.message || "Error updating slot");
    }
  };

  const handleCreateSlot = async () => {
    if (!slotData.tournamentId) {
      slotData.tournamentId = tournamentId;
    }
    if (!slotData.auctionId) {
      slotData.auctionId = auctionId;
    }
    try {
      await dispatch(createSlot(slotData));
      toast.success("Slot created successfully!");
      setPage(1);
      dispatch(fetchSlotList(auctionId, 1, limit));
      setSlotPopup(false);
      resetSlotForm();
    } catch (error) {
      console.error("Error creating slot:", error);
      toast.error("Error creating slot");
    }
  };

  return (
    <div className="space-y-4 p-3 text-[var(--text-primary)] sm:p-4 lg:p-5">
      <div className="relative overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)] shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-lg font-semibold tracking-normal text-[var(--text-primary)]">
                Slots & Sessions
              </h4>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Manage trial venues, slot codes, and session schedules.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:items-center">
            <div className="relative w-full sm:min-w-[300px] xl:w-[340px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search slot by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-main)] pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
                autoComplete="off"
              />
            </div>

            <button
              onClick={() => setSlotPopup(true)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-4 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)] sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Create Slot
            </button>
          </div>
        </div>
      </div>

      {/* Slots Table */}
      {slotLocalList.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--bg-card)] px-4 py-12 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
            <Layers className="h-6 w-6" />
          </div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">
            No slots available
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">
            Create your first slot to get started
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
          {/* Mobile View (up to tablet portrait) */}
          <div className="space-y-3 bg-[var(--bg-main)] p-3 lg:hidden">
            {slotLocalList.map((slot) => (
              <div
                key={slot._id}
                className="relative overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {slot.slotName}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">
                      {slot.description}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" />
                      <span className="truncate">
                        {slot.location?.venue || "-"}
                        {slot.location?.city ? `, ${slot.location.city}` : ""}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2 py-1 text-[11px] font-semibold text-[var(--primary)]">
                    {(slot.sessions || []).length} Sessions
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEditSlot(slot)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-main)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition hover:bg-[var(--secondary-lighter)]"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleteContext({
                        type: "slot",
                        slotId: slot._id,
                        sessionId: null,
                      });
                      setOpenDelete(true);
                    }}
                    title="Delete slot"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-[var(--bg-card)] text-red-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => toggleSlotSessions(slot._id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition hover:bg-[var(--secondary-lighter)]"
                  >
                    {expandedSlots.includes(slot._id) ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    {expandedSlots.includes(slot._id)
                      ? "Hide Sessions"
                      : "View Sessions"}
                  </button>
                </div>

                {expandedSlots.includes(slot._id) && (
                  <div className="mt-3 border-t border-[var(--border-card)] pt-3">
                    <button
                      onClick={() => openCreateSession(slot._id)}
                      className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-yellow-400 bg-yellow-500 px-3 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-yellow-400"
                    >
                      <Plus className="h-4 w-4" />
                      Create Session
                    </button>
                    {slot.sessions?.length ? (
                      <div className="space-y-2">
                        {slot.sessions.map((sess) => (
                          <div
                            key={sess._id}
                            className="rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-2.5"
                          >
                            <div className="text-sm font-semibold text-[var(--text-primary)]">
                              {sess.name}
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-[var(--text-secondary)]">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5 text-[var(--primary)]" />
                                {sess.slotDate
                                  ? new Date(sess.slotDate).toLocaleDateString(
                                      "en-US",
                                    )
                                  : "-"}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
                                {(sess.slotStartTime || "") +
                                  (sess.slotEndTime
                                    ? ` - ${sess.slotEndTime}`
                                    : "") || "-"}
                              </span>
                            </div>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => openEditSession(slot._id, sess)}
                                className="inline-flex items-center gap-1 rounded-md border border-[var(--border-primary)] bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-primary)] transition hover:bg-[var(--bg-main)]"
                              >
                                <Edit3 className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteContext({
                                    type: "session",
                                    slotId: slot._id,
                                    sessionId: sess._id,
                                  });
                                  setOpenDelete(true);
                                }}
                                title="Delete session"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-[var(--bg-card)] text-red-500 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] py-4 text-center text-xs text-[var(--text-secondary)]">
                        No sessions available
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop/Tablet Landscape View - Responsive Table */}
          <div className="hidden overflow-x-auto lg:block">
            <div className="min-w-full">
              <table className="min-w-full">
                <thead className="border-b border-[var(--border-card)] bg-[var(--secondary-lighter)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
                      Venue / City
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
                      Sessions
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-card)]">
                  {slotLocalList.map((slot) => (
                    <React.Fragment key={slot._id}>
                      <tr
                        className="bg-[var(--bg-card)] transition-colors duration-150 hover:bg-[var(--secondary-lighter)]"
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            {slot.slotName}
                          </div>
                          <div className="mt-1 max-w-[320px] truncate text-xs text-[var(--text-secondary)]">
                            {slot.description}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-block rounded-md border border-[var(--border-card)] bg-[var(--bg-main)] px-2 py-1 font-mono text-xs text-[var(--text-primary)]">
                            {slot.slotCode}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                            <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" />
                            {slot.location?.venue}
                          </div>
                          <div className="mt-1 text-xs text-[var(--text-secondary)]">
                            {slot.location?.city}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                            {slot.sessions ? slot.sessions.length : 0} Sessions
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                          {new Date(slot.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditSlot(slot)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-main)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card)]"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteContext({
                                  type: "slot",
                                  slotId: slot._id,
                                  sessionId: null,
                                });
                                setOpenDelete(true);
                              }}
                              title="Delete slot"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-[var(--bg-card)] text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => toggleSlotSessions(slot._id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--secondary-lighter)]"
                            >
                              {expandedSlots.includes(slot._id) ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                              {expandedSlots.includes(slot._id)
                                ? "Hide Sessions"
                                : "View Sessions"}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedSlots.includes(slot._id) && (
                        <tr>
                          <td
                            colSpan={6}
                            className="border-t border-[var(--border-card)] bg-[var(--secondary-lighter)]"
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h5 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
                                    Sessions
                                  </h5>
                                  <div className="text-xs text-[var(--text-secondary)]">
                                    Total: {(slot.sessions || []).length}{" "}
                                    sessions
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => openCreateSession(slot._id)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-yellow-400 bg-yellow-500 px-3 py-1.5 text-sm font-semibold text-black shadow-sm transition-all duration-200 hover:bg-yellow-400"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Create Session
                                  </button>
                                </div>
                              </div>

                              {slot.sessions && slot.sessions.length > 0 ? (
                                <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-sm">
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                      <thead className="border-b border-[var(--border-card)] bg-[var(--bg-main)]">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
                                            Name
                                          </th>
                                          <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
                                            Date
                                          </th>
                                          <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
                                            Time
                                          </th>
                                          <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
                                            Players
                                          </th>
                                          <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-[var(--border-card)]">
                                        {slot.sessions.map((sess) => (
                                          <tr
                                            key={sess._id}
                                            className="bg-[var(--bg-card)] transition-colors hover:bg-[var(--secondary-lighter)]"
                                          >
                                            <td className="px-3 py-2">
                                              <div className="text-sm font-semibold text-[var(--text-primary)]">
                                                {sess.name}
                                              </div>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                                                <CalendarDays className="h-3.5 w-3.5 text-[var(--primary)]" />
                                                {sess.slotDate
                                                  ? new Date(
                                                      sess.slotDate,
                                                    ).toLocaleDateString("en-US", {
                                                      weekday: "short",
                                                      month: "short",
                                                      day: "numeric",
                                                    })
                                                  : "-"}
                                              </div>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="inline-flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
                                                <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
                                                {(sess.slotStartTime || "") +
                                                  (sess.slotEndTime
                                                    ? ` - ${sess.slotEndTime}`
                                                    : "")}
                                              </div>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="text-sm font-semibold text-[var(--primary)]">
                                                {(sess.players || []).length ||
                                                  sess.playerCount ||
                                                  0}
                                              </div>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="flex items-center gap-2">
                                                <button
                                                  onClick={() =>
                                                    openEditSession(slot._id, sess)
                                                  }
                                                  className="inline-flex items-center gap-1 rounded-md border border-[var(--border-primary)] bg-[var(--bg-main)] px-2 py-1 text-xs text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card)]"
                                                >
                                                  <Edit3 className="h-3 w-3" />
                                                  Edit
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setDeleteContext({
                                                      type: "session",
                                                      slotId: slot._id,
                                                      sessionId: sess._id,
                                                    });
                                                    setOpenDelete(true);
                                                  }}
                                                  title="Delete session"
                                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-[var(--bg-card)] text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ) : (
                                <div className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-card)] py-6 text-center">
                                  <div className="mb-1 text-sm font-semibold text-[var(--text-primary)]">
                                    No sessions available
                                  </div>
                                  <div className="text-sm text-[var(--text-muted)]">
                                    Create a session to get started
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="text-center text-sm text-[var(--text-secondary)] sm:text-left">
              Page {currentPage} of {totalPages}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-card)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--secondary-lighter)] disabled:cursor-not-allowed disabled:opacity-50 sm:py-1.5"
              >
                Prev
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-card)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--secondary-lighter)] disabled:cursor-not-allowed disabled:opacity-50 sm:py-1.5"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {sessionForm.isOpen &&
        createPortal(
          <CreateSession
            isOpen={sessionForm.isOpen}
            onClose={closeSessionForm}
            sessionData={sessionForm.data}
            onSessionChange={handleSessionChange}
            onSave={handleSaveSession}
            isEditing={sessionForm.isEditing}
            slotName={
              slotLocalList.find((s) => s._id === sessionForm.slotId)?.slotName ||
              ""
            }
          />,
          document.body,
        )}

      {slotPopup &&
        createPortal(
          <div className="fixed inset-0 z-[120000] flex items-start justify-center overflow-y-auto p-3 sm:p-4">
            <CreateSlot
              isOpen={slotPopup}
              onClose={() => {
                setSlotPopup(false);
                setIsEditingSlot(false);
                setSelectedSlot(null);
                resetSlotForm();
              }}
              slotData={slotData}
              onSlotChange={handleSlotChange}
              onCreate={handleCreateSlot}
              onUpdate={handleUpdateSlot}
              selectors={selectorsList}
              isEditing={isEditingSlot}
            />
          </div>,
          document.body,
        )}

      <DeleteConfirmModal
        open={openDelete}
        title={deleteContext.type === "slot" ? "Delete Slot" : "Delete Session"}
        description={
          deleteContext.type === "slot"
            ? "This slot and all its sessions will be permanently deleted."
            : "This session will be permanently deleted."
        }
        onClose={() => setOpenDelete(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Slot;
