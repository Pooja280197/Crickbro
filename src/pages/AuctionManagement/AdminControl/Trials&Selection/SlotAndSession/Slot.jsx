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
import { Search } from "lucide-react";

const Slot = ({ auctionId }) => {
  const [slotPopup, setSlotPopup] = useState(false);
  const [isEditingSlot, setIsEditingSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState("");
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
  const totalPages = Math.ceil(total / limit);
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
    <div className="text-gray-800 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <h4 className="text-xl font-semibold text-gray-800">Slots</h4>
          <div className="relative w-full sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search slot by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              autoComplete="off"
            />
          </div>
        </div>

        <button
          onClick={() => setSlotPopup(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Create Slot
        </button>
      </div>

      {/* Slots Table */}
      {slotLocalList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 mb-2">No slots available</div>
          <div className="text-sm text-gray-400">
            Create your first slot to get started
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Mobile View (up to tablet portrait) */}
          <div className="lg:hidden p-3 space-y-3 bg-gray-50">
            {slotLocalList.map((slot) => (
              <div
                key={slot._id}
                className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {slot.slotName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {slot.description}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {slot.location?.venue},{slot.location?.city}
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-[11px] font-medium border border-emerald-600 text-emerald-600 bg-white">
                    {(slot.sessions || []).length} Sessions
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEditSlot(slot)}
                    className="px-3 py-1.5 text-xs bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
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
                    className="px-3 py-1.5 text-xs bg-white text-red-600 rounded-lg border border-red-300 hover:bg-red-50"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => toggleSlotSessions(slot._id)}
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg border border-blue-300 hover:bg-blue-100"
                  >
                    {expandedSlots.includes(slot._id)
                      ? "Hide Sessions"
                      : "View Sessions"}
                  </button>
                </div>

                {expandedSlots.includes(slot._id) && (
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <button
                      onClick={() => openCreateSession(slot._id)}
                      className="w-full mb-3 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      + Create Session
                    </button>
                    {slot.sessions?.length ? (
                      <div className="space-y-2">
                        {slot.sessions.map((sess) => (
                          <div
                            key={sess._id}
                            className="rounded-lg border border-gray-200 p-2 bg-gray-200"
                          >
                            <div className="text-sm font-medium text-gray-800">
                              {sess.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {sess.slotDate
                                ? new Date(sess.slotDate).toLocaleDateString(
                                    "en-US",
                                  )
                                : "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(sess.slotStartTime || "") +
                                (sess.slotEndTime
                                  ? ` - ${sess.slotEndTime}`
                                  : "") || "-"}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => openEditSession(slot._id, sess)}
                                className="px-2 py-1 text-xs bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50"
                              >
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
                                className="px-2 py-1 text-xs bg-white text-red-600 rounded border border-red-300 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        No sessions available
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop/Tablet Landscape View - Responsive Table */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-full">
              <table className="min-w-full">
                <thead className="bg-gray-200 border-b border-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Venue / City
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {slotLocalList.map((slot, idx) => (
                    <React.Fragment key={slot._id}>
                      <tr
                        className={`transition-colors duration-150 ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {slot.slotName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {slot.description}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                            {slot.slotCode}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {slot.location?.venue}
                          </div>
                          <div className="text-xs text-gray-500">
                            {slot.location?.city}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-emerald-600 border border-emerald-300">
                            {slot.sessions ? slot.sessions.length : 0} Sessions
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
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
                              className="px-3 py-1.5 text-xs bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
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
                              className="px-3 py-1.5 text-xs bg-white text-red-600 rounded-lg border border-red-300 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => toggleSlotSessions(slot._id)}
                              className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg border border-blue-300 hover:bg-blue-100 transition-colors"
                            >
                              {expandedSlots.includes(slot._id)
                                ? "Hide Sessions"
                                : "View Sessions"}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedSlots.includes(slot._id) && (
                        <tr>
                          <td colSpan={6} className="bg-gray-200 border-t border-gray-200">
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h5 className="text-base font-semibold text-gray-800 mb-1">
                                    Sessions
                                  </h5>
                                  <div className="text-xs text-gray-500">
                                    Total: {(slot.sessions || []).length}{" "}
                                    sessions
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => openCreateSession(slot._id)}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all duration-200"
                                  >
                                    + Create Session
                                  </button>
                                </div>
                              </div>

                              {slot.sessions && slot.sessions.length > 0 ? (
                                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Name
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Date
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Time
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Players
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {slot.sessions.map((sess, sidx) => (
                                          <tr
                                            key={sess._id}
                                            className={`hover:bg-gray-50 transition-colors ${
                                              sidx % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50/50"
                                            }`}
                                          >
                                            <td className="px-3 py-2">
                                              <div className="text-sm font-medium text-gray-900">
                                                {sess.name}
                                              </div>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="text-sm text-gray-600">
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
                                              <div className="text-sm text-gray-700">
                                                {(sess.slotStartTime || "") +
                                                  (sess.slotEndTime
                                                    ? ` - ${sess.slotEndTime}`
                                                    : "")}
                                              </div>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="text-sm font-medium text-blue-600">
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
                                                  className="px-2 py-1 text-xs bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                                                >
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
                                                  className="px-2 py-1 text-xs bg-white text-red-600 rounded border border-red-300 hover:bg-red-50 transition-colors"
                                                >
                                                  Delete
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
                                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="text-gray-500 mb-1">
                                    No sessions available
                                  </div>
                                  <div className="text-sm text-gray-400">
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
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 text-sm"
                >
                  Prev
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 text-sm"
                >
                  Next
                </button>
              </div>
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
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
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