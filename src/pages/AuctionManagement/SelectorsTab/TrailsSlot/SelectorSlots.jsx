import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSelectorsSlot } from "../../../../redux/actions";
import SlotCard from "./SlotCard";
import DetailsPopup from "./DetailsPopup";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";

const panelClass =
  "rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]";
const inputClass =
  "h-9 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)]";
const outlineButtonClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-50";
const iconTileClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]";

const SelectorSlots = ({ auctionId }) => {
  const dispatch = useDispatch();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [search, setSearch] = useState("");
  const [slotTypeFilter, setSlotTypeFilter] = useState("all");
  const [sessionStatusFilter, setSessionStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const slotsData = useSelector((state) => state.data?.mySlots?.data || []);
  const normalizedSearch = search.trim().toLowerCase();

  const uniqueSlotTypes = [
    "all",
    ...new Set(
      slotsData
        .map((slot) => String(slot?.slotType || "").trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

  const getSlotStatuses = (slot) =>
    Array.isArray(slot?.sessions)
      ? slot.sessions
          .map((session) => String(session?.status || "").trim().toLowerCase())
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
  }, [auctionId, dispatch, slotsData.length]);

  useEffect(() => {
    setPage(1);
  }, [search, slotTypeFilter, sessionStatusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const resetFilters = () => {
    setSearch("");
    setSlotTypeFilter("all");
    setSessionStatusFilter("all");
  };

  const statusOptions = ["all", "ongoing", "upcoming", "completed", "cancelled"];

  return (
    <div className="w-full space-y-3 p-3 sm:p-4">
      <div className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-[var(--border-card)] bg-[var(--bg-card)] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className={iconTileClass}>
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
             
              <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                Trial Slots
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                Assigned slots, sessions, and venue details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                Total
              </p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {slotsData.length}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                Showing
              </p>
              <p className="text-sm font-semibold text-[var(--primary)]">
                {paginatedSlots.length}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                Matched
              </p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {slotsData.filter((slot) => slot?.slotMatched).length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-2 p-3 sm:p-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search slot, code, city..."
              className={`${inputClass} w-full pl-9`}
            />
          </div>

          <select
            value={slotTypeFilter}
            onChange={(event) => setSlotTypeFilter(event.target.value)}
            className={`${inputClass} min-w-[150px] capitalize`}
          >
            {uniqueSlotTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </option>
            ))}
          </select>

          <select
            value={sessionStatusFilter}
            onChange={(event) => setSessionStatusFilter(event.target.value)}
            className={`${inputClass} min-w-[160px] capitalize`}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Status" : status}
              </option>
            ))}
          </select>

          <button type="button" onClick={resetFilters} className={outlineButtonClass}>
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      </div>

      <div className={`${panelClass} p-3 sm:p-4`}>
        <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)]">
          <Filter size={15} className="text-[var(--primary)]" />
          Showing {paginatedSlots.length} of {filteredSlots.length}
        </div>

        {filteredSlots.length === 0 ? (
          <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-5 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No slots found
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
              Try changing search or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {paginatedSlots.map((slot) => (
              <SlotCard
                key={slot.slotId}
                slot={slot}
                onClick={() => setSelectedSlot(slot)}
              />
            ))}
          </div>
        )}

        {filteredSlots.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-[var(--border-card)] pt-3 sm:flex-row">
            <span className="text-sm font-semibold text-[var(--text-secondary)]">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className={outlineButtonClass}
              >
                <ChevronLeft size={15} />
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className={outlineButtonClass}
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <DetailsPopup slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
    </div>
  );
};

export default SelectorSlots;
