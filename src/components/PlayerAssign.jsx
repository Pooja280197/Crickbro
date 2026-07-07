import React, { useState, useEffect } from "react";
import { X, MapPin, Clock, AlertCircle } from "lucide-react";
// import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  AssignPlayersToTrails,
  fetchSlotList,
  fetchSlotSessions,
} from "../redux/actions";

const PlayerAssign = ({
  isOpen,
  onClose,
  selectedPlayers,
  playerCount,
  onAssignSuccess,
  auctionId,
}) => {
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [allSlots, setAllSlots] = useState([]);
  const [slotPage, setSlotPage] = useState(1);
  const [hasMoreSlots, setHasMoreSlots] = useState(true);
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dispatch = useDispatch();

  const slotLoading = useSelector((state) => state?.loading?.slotList);
  const sessionLoading = useSelector((state) => state?.loading?.sessions);
  const slotsdata = useSelector((state) => state?.data?.slotList);
  const sessionsdata = useSelector((state) => state?.data?.sessions);

  const auctionSlots = slotsdata?.data;
  const sessions = sessionsdata?.sessions;

  // Fetch auction slots on modal open

  useEffect(() => {
    if (isOpen && auctionId) {
      setSearch(""); // optional reset
      setSlotPage(1);
      setHasMoreSlots(true);

      dispatch(fetchSlotList(auctionId, 1, 20));
    }
  }, [isOpen, auctionId]);

  useEffect(() => {
    if (slotsdata?.data) {
      setAllSlots((prev) => {
        if (slotPage === 1) {
          return slotsdata.data; // replace on new search
        }
        return [...prev, ...slotsdata.data]; // append for pagination
      });

      if (slotsdata.data.length < 20) {
        setHasMoreSlots(false);
      }
    }
  }, [slotsdata]);

  useEffect(() => {
    if (!isOpen || !auctionId) return;

    const delay = setTimeout(() => {
      setSlotPage(1);
      setHasMoreSlots(true);

      dispatch(fetchSlotList(auctionId, 1, 20, search));
    }, 400);

    return () => clearTimeout(delay);
  }, [search, isOpen, auctionId]);

  const loadMoreSlots = async () => {
    if (!hasMoreSlots || slotLoading) return;

    const nextPage = slotPage + 1;
    setSlotPage(nextPage);

    await dispatch(fetchSlotList(auctionId, nextPage, 20, search));
  };

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 5;

    if (bottom) {
      loadMoreSlots();
    }
  };

  // Fetch auction slots
  const fetchAuctionSlots = async () => {
    try {
      await dispatch(fetchSlotList(auctionId));
    } catch (error) {
      console.log("Error fetching auction slots:", error);
      toast.error("Failed to fetch auction slots");
    }
  };

  // Fetch sessions when slot is selected
  const fetchSessions = async (slotId) => {
    setSelectedSession("");
    try {
      await dispatch(fetchSlotSessions(slotId));
    } catch (error) {
      console.log("Error fetching sessions:", error);
      toast.error("Failed to fetch shift times");
      // setSessions([]);
    }
  };

  const handleSlotChange = (slotId) => {
    setSelectedSlot(slotId);
    setSelectedSession("");
    if (slotId) {
      fetchSessions(slotId);
    }
  };

  const handleAssign = async () => {
    if (!selectedSlot) {
      toast.error("Please select both location and shift time");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        auctionId: auctionId,
        playerIds: selectedPlayers,
      };
      await dispatch(
        AssignPlayersToTrails(selectedSlot, selectedSession, payload)
      );
      toast.success(
        `Successfully assigned ${playerCount} player${
          playerCount > 1 ? "s" : ""
        } to trial`
      );
      onAssignSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.log("Error assigning players:", error);
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSlot("");
    setSelectedSession("");
    // setSessions([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const h = Number(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${minute} ${ampm}`;
  };

  return (
    <div className="fixed top-20 inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-black/30 font-main">
      <div className="relative rounded-2xl shadow-2xl max-w-md w-full bg-[var(--bg-card)] text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Assign Players to Trial
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-[var(--secondary-lighter)] rounded-full"
          >
            <X className="w-5 h-5 text-[var(--text-primary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Assigning {playerCount} player{playerCount > 1 ? "s" : ""} to
              trial
            </p>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="w-4 h-4" />
              Trial Location
            </label>

            <div className="relative">
              {/* Selected */}
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-3 border rounded-lg cursor-pointer bg-[var(--bg-card)]"
              >
                {selectedSlot
                  ? allSlots.find((s) => s._id === selectedSlot)?.slotName
                  : "Select location..."}
              </div>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-full bg-[var(--bg-card)] border rounded-lg mt-2 shadow-lg">
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSlotPage(1);
                      setHasMoreSlots(true);
                    }}
                    className="w-full p-2 border-b outline-none"
                  />

                  {/* List */}
                  <div
                    className="max-h-60 min-h-[150px] overflow-y-auto relative"
                    onScroll={handleScroll}
                  >
                    {allSlots.map((slot) => (
                      <div
                        key={slot._id}
                        onClick={() => {
                          setSelectedSlot(slot._id);
                          setIsDropdownOpen(false);
                          fetchSessions(slot._id);
                        }}
                        className="p-2 hover:bg-[var(--secondary-lighter)] cursor-pointer"
                      >
                        {slot.slotName}
                      </div>
                    ))}

                    {slotLoading && (
                      <div className="p-2 text-center text-sm text-[var(--text-muted)]">
                        Loading...
                      </div>
                    )}

                    {!hasMoreSlots && (
                      <div className="p-2 text-center text-xs text-[var(--text-muted)]">
                        No more locations
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Display messages based on state */}
            {slotLoading && (
              <p className="text-sm text-[var(--text-muted)] animate-pulse">
                Loading locations...
              </p>
            )}

            {!slotLoading && auctionSlots && auctionSlots.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-300">
                  No trial locations available for this auction
                </p>
              </div>
            )}
          </div>

          {/* Sessions */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="w-4 h-4" />
              Shift Time
            </label>

            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              disabled={!selectedSlot || sessionLoading}
              className="w-full p-3 border rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)]/90"
            >
              <option value="" disabled hidden>
                {!selectedSlot
                  ? "Select location first"
                  : sessionLoading
                  ? "Loading shift times..."
                  : sessions && sessions.length > 0
                  ? "Select shift time..."
                  : "No sessions available"}
              </option>

              {selectedSlot &&
                !sessionLoading &&
                sessions &&
                sessions.length > 0 && (
                  <>
                    {sessions.map((session) => (
                      <option key={session._id} value={session._id}>
                        {session.name}

                        {session.slotDate &&
                          ` - ${formatDate(session.slotDate)}`}

                        {session.slotStartTime &&
                          session.slotEndTime &&
                          ` (${formatTime(
                            session.slotStartTime
                          )} - ${formatTime(session.slotEndTime)})`}
                      </option>
                    ))}
                  </>
                )}
            </select>
            {/* Display messages based on state */}
            {!selectedSlot && (
              <p className="text-sm text-[var(--text-muted)]">
                Please select a location first
              </p>
            )}

            {sessionLoading && selectedSlot && (
              <p className="text-sm text-[var(--text-muted)] animate-pulse">
                Loading shift times...
              </p>
            )}

            {selectedSlot &&
              !sessionLoading &&
              sessions &&
              sessions.length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg ">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <p className="text-sm text-[var(--text-muted)]">
                    No shift times available for this location
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleAssign}
            disabled={
              !selectedSlot ||
              !selectedSession ||
              loading ||
              (auctionSlots && auctionSlots.length === 0) ||
              (selectedSlot && sessions && sessions.length === 0)
            }
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              !selectedSlot ||
              !selectedSession ||
              loading ||
              (auctionSlots && auctionSlots.length === 0) ||
              (selectedSlot && sessions && sessions.length === 0)
                ? "bg-gray-700 text-[var(--text-muted)] cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-[var(--text-dark)]"
            }`}
          >
            {loading ? "Assigning..." : "Assign to Trial"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerAssign;
