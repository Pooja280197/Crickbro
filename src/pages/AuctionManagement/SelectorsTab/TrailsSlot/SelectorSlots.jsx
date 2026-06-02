import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSelectorsSlot } from "../../../../redux/actions";
import SlotCard from "./SlotCard";
import DetailsPopup from "./DetailsPopup";

const SelectorSlots = ({ auctionId }) => {
  const dispatch = useDispatch();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [search, setSearch] = useState("");
  const [slotTypeFilter, setSlotTypeFilter] = useState("all");
  const [sessionStatusFilter, setSessionStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const slotsData = useSelector(
    (state) => state.data?.mySlots?.data || []
  );

  const normalizedSearch = search.trim().toLowerCase();

  const uniqueSlotTypes = [
    "all",
    ...new Set(
      slotsData
        .map((slot) => String(slot?.slotType || "").trim().toLowerCase())
        .filter(Boolean)
    ),
  ];

  const getSlotStatuses = (slot) =>
    Array.isArray(slot?.sessions)
      ? slot.sessions
          .map((s) => String(s?.status || "").trim().toLowerCase())
          .filter(Boolean)
      : [];

  const filteredSlots = slotsData.filter((slot) => {
    const slotType = String(slot?.slotType || "").trim().toLowerCase();
    const slotStatuses = getSlotStatuses(slot);

    const searchFields = [
      slot?.slotName,
      slot?.slotCode,
      slot?.slotType,
      slot?.location?.venue,
      slot?.location?.city,
      slot?.location?.state,
      slot?.location?.country,
    ]
      .map((field) => String(field || "").toLowerCase())
      .join(" ");

    const matchesSearch =
      !normalizedSearch || searchFields.includes(normalizedSearch);

    const matchesSlotType =
      slotTypeFilter === "all" || slotType === slotTypeFilter;

    const matchesSessionStatus =
      sessionStatusFilter === "all" || slotStatuses.includes(sessionStatusFilter);

    return matchesSearch && matchesSlotType && matchesSessionStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSlots.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const paginatedSlots = filteredSlots.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    if (!slotsData.length) {
      dispatch(getSelectorsSlot(auctionId));
    }
  }, [auctionId]);

  useEffect(() => {
    setPage(1);
  }, [search, slotTypeFilter, sessionStatusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="w-full py-4 px-2 sm:px-6">
      <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4 ">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search slot name, code, city..."
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
        />

        <select
          value={slotTypeFilter}
          onChange={(e) => setSlotTypeFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          {uniqueSlotTypes.map((type) => (
            <option key={type} value={type}>
              {type === "all" ? "All Slot Types" : type}
            </option>
          ))}
        </select>

        <select
          value={sessionStatusFilter}
          onChange={(e) => setSessionStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="all">All Session Status</option>
          <option value="ongoing">Ongoing</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setSlotTypeFilter("all");
            setSessionStatusFilter("all");
          }}
          className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
        >
          Reset Filters
        </button>
      </div>

      <div className="mb-3 text-xs text-slate-600">
        Showing {paginatedSlots.length} of {filteredSlots.length} slots
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedSlots.map((slot) => (
          <SlotCard
            key={slot.slotId}
            slot={slot}
            onClick={() => setSelectedSlot(slot)}
          />
        ))}
      </div>

      {filteredSlots.length === 0 && (
        <div className="mt-4 rounded-lg border bg-white p-4 text-sm text-slate-600">
          No slots found for current search/filter.
        </div>
      )}

      {filteredSlots.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-slate-600">
            Page {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <DetailsPopup
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
      />
    </div>
  );
};

export default SelectorSlots;
