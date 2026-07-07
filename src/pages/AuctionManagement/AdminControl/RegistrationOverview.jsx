import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import api from "../../../utils/api";
import {
  Users,
  CreditCard,
  Zap,
  IndianRupee,
  User,
  CalendarDays,
  Eye,
  Filter,
  X,
  CreditCardIcon,
  RotateCcw,
  Search,
} from "lucide-react";
import { fetchSlotList } from "../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";

const Field = ({ label, value, full }) => {
  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== "-" &&
    (typeof value !== "string" || value.trim() !== "");

  if (!hasValue) return null;

  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </p>
      <div className="mt-1.5 min-h-9 break-words rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-sm">
    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
        {icon}
      </span>
      <span>{title}</span>
    </h4>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>
  </div>
);

const RegistrationOverview = ({ auctionId: auctionIdProp }) => {
  const { auctionId: routeAuctionId } = useParams();
  const auctionId = auctionIdProp || routeAuctionId;

  // const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [reportMode, setReportMode] = useState("player");
  const [registrationType, setRegistrationType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [slotId, setSlotId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [slots, setSlots] = useState([]);
  const [openSlotDropdown, setOpenSlotDropdown] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [allSlots, setAllSlots] = useState([]);
  const [slotPage, setSlotPage] = useState(1);
  const [hasMoreSlots, setHasMoreSlots] = useState(true);
  const [searchSlot, setSearchSlot] = useState("");
  const slotsdata = useSelector((state) => state?.data?.slotList);
  const selectedSlot = allSlots.find((s) => String(s?._id) === String(slotId));
  const slotSessions = selectedSlot?.sessions || [];
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchRegistrationReport = async () => {
      if (!auctionId) {
        setInitialLoading(false);
        setTableLoading(false);
        return;
      }

      if (initialLoading) {
        setInitialLoading(true);
      } else {
        setTableLoading(true);
      }
      setError("");

      try {
        const params = {
          page,
          limit,
          mode: reportMode,
          registrationType,
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
        if (reportMode === "player") {
          if (slotId) params.slotId = slotId;
          if (sessionId) params.sessionId = sessionId;
        }

        const response = await api.get(
          `/webSiteApi/auction/registrationReport/${auctionId}`,
          {
            params,
          },
        );

        setReport(response?.data?.data || null);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to fetch registration report",
        );
      } finally {
        setInitialLoading(false);
        setTableLoading(false);
      }
    };

    fetchRegistrationReport();
  }, [
    auctionId,
    page,
    limit,
    registrationType,
    reportMode,
    dateFrom,
    dateTo,
    debouncedSearch,
    slotId,
    sessionId,
  ]);

  useEffect(() => {
    setPage(1);
    setSelectedRegistration(null);
    setSlotId("");
    setSessionId("");
  }, [reportMode]);

  useEffect(() => {
    if (auctionId) {
      setSearch(""); // optional reset
      setSlotPage(1);
      setHasMoreSlots(true);

      dispatch(fetchSlotList(auctionId, 1, 20));
    }
  }, [auctionId]);

  useEffect(() => {
    if (slotsdata?.data) {
      setAllSlots((prev) => {
        const newData = slotsdata.data || [];

        const merged = slotPage === 1 ? newData : [...prev, ...newData];

        const unique = Array.from(
          new Map(merged.map((item) => [item._id, item])).values(),
        );

        return unique;
      });

      if (slotsdata.data.length < 20) {
        setHasMoreSlots(false);
      }
    }
  }, [slotsdata]);

  useEffect(() => {
    if (!auctionId) return;

    const delay = setTimeout(() => {
      setSlotPage(1);
      setHasMoreSlots(true);
      setAllSlots([]); // 🔥 IMPORTANT

      dispatch(fetchSlotList(auctionId, 1, 20, searchSlot));
    }, 400);

    return () => clearTimeout(delay);
  }, [searchSlot, auctionId]);

  const loadMoreSlots = async () => {
    if (!hasMoreSlots || slotLoading) return;

    setSlotLoading(true);

    const nextPage = slotPage + 1;
    setSlotPage(nextPage);

    await dispatch(fetchSlotList(auctionId, nextPage, 20, searchSlot));

    setSlotLoading(false);
  };
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 20;

    if (bottom && !slotLoading) {
      loadMoreSlots();
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[calc(100vh-108px)] items-center justify-center p-4">
        <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-6 py-5 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Loading registration report...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      </div>
    );
  }

  const summary = report?.summary || {};
  const registrations = report?.data || [];
  const pagination = report?.pagination || {};
  const totalPages = pagination.pages || 1;
  const isTeamMode = reportMode === "team";
  const isTrailAuction = !isTeamMode && !!report?.auction?.trailTypeAuction;
  const showTeamReportSwitch =
    !!report?.auction?.teamRegistration?.showTeamRegistration;
  const tableColSpan = isTeamMode ? 8 : isTrailAuction ? 9 : 7;
  const grossRevenue = Number(
    isTeamMode
      ? summary.totalRegistrationFee || 0
      : summary.totalRegistrationFee || 0,
  );
  const transactionCharge = grossRevenue * 0.023;
  const netRevenue = Math.round(grossRevenue - transactionCharge);

  

  // const formatCurrency = (value) =>
  //   `₹${Number(value || 0).toLocaleString("en-IN", {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   })}`;

  const gstData = {
    totalGST: Math.round(summary.totalGSTAmount) || 0,
    gstPercentage: summary.gstPercentage || 0,
    enabled: summary.gstEnabled || false,
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setRegistrationType("all");
    setDateFrom("");
    setDateTo("");
    setSlotId("");
    setSessionId("");
    setPage(1);
    setLimit(10);
  };

  const cards = [
    {
      title: isTeamMode ? "Total Teams" : "Total Players",
      value: isTeamMode
        ? summary.totalRegistrations || 0
        : summary.totalFilteredPlayers || 0,
      icon: <Users size={18} />,
    },
    {
      title: "Paid",
      value: summary.totalPaidRegistrations || 0,
      icon: <CreditCard size={18} />,
    },
    ...(!isTeamMode
      ? [
          {
            title: "Direct",
            value: summary.totalDirectRegistrations || 0,
            icon: <Zap size={18} />,
          },
        ]
      : []),
    {
      title: "Total Revenue",
      value: grossRevenue,
      icon: <IndianRupee size={18} />,
    },
    {
      title: "Net Revenue",
      value: netRevenue,
      subtitle: `After 2.3% Transaction Fee + GST`,
      icon: <IndianRupee size={18} />,
    },
    ...(gstData.enabled
      ? [
          {
            title: "Total GST",
            value: gstData.totalGST,
            subtitle: `GST @ ${gstData.gstPercentage}%`,
            icon: <IndianRupee size={18} />,
          },
        ]
      : []),
  ];

  
  return (
    <div className="space-y-5 p-3 text-[var(--text-primary)] lg:p-5">
      <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
        <div className=" flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Registration
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-xl font-bold leading-7 text-[var(--text-primary)]">
              Registration Report
            </h2>
            <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
              Track player and team registration payments in one place.
            </p>
          </div>

          {showTeamReportSwitch && (
            <div className="flex w-full items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-1 sm:w-auto">
              <button
                type="button"
                onClick={() => setReportMode("player")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  !isTeamMode
                    ? "bg-[var(--secondary)] text-[#102033]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--secondary-lighter)] hover:text-[var(--text-primary)]"
                }`}
              >
                Player Report
              </button>
              <button
                type="button"
                onClick={() => setReportMode("team")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isTeamMode
                    ? "bg-[var(--secondary)] text-[#102033]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--secondary-lighter)] hover:text-[var(--text-primary)]"
                }`}
              >
                Team Report
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 ${
          isTeamMode
            ? gstData.enabled
              ? "lg:grid-cols-5"
              : "lg:grid-cols-4"
            : gstData.enabled
              ? "lg:grid-cols-6"
              : "lg:grid-cols-5"
        }`}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="flex min-h-[80px] flex-col justify-between rounded-lg border border-[var(--border-card)] border-l-[5px] border-l-[var(--accent-light)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] transition hover:border-[var(--border-primary)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  {card.title}
                </p>
                <p className="mt-2 truncate text-lg font-bold leading-6 text-[var(--text-primary)]">
                  {card.value}
                </p>
                {card.subtitle ? (
                  <p className="mt-1 truncate text-[8px] font-medium text-[var(--text-secondary)]">
                    {card.subtitle}
                  </p>
                ) : null}
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
        {/* TOP BAR */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-center">
          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isTeamMode ? "Search team..." : "Search player..."}
              className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] pl-10 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)]"
            />
          </div>

          {/* ACTIONS */}
          <div className="contents">
            {/* LIMIT */}
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            {/* FILTER BUTTON */}
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
                showFilters
                  ? "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"
                  : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {/* RESET */}
            <button
              onClick={resetFilters}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4 text-[var(--primary)]" />
              Reset
            </button>
          </div>
        </div>

        {/* FILTER SECTION */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-3 border-t border-[var(--border-card)] pt-3 md:grid-cols-2 lg:grid-cols-5">
            {/* REGISTRATION TYPE */}
            <select
              value={registrationType}
              onChange={(e) => {
                setRegistrationType(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)]"
            >
              <option value="all">All Types</option>
              <option value="paid">Paid</option>
              <option value="direct">Direct</option>
            </select>

            {/* SLOT */}
            {!isTeamMode && isTrailAuction && (
              <div className="relative">
                <div
                  className="h-10 cursor-pointer rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
                  onClick={() => setOpenSlotDropdown((prev) => !prev)}
                >
                  {selectedSlot?.slotName || "All Slots"}
                </div>

                {openSlotDropdown && (
                  <div
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]"
                    onScroll={handleScroll}
                  >
                    <input
                      type="text"
                      placeholder="Search slot..."
                      value={searchSlot}
                      onChange={(e) => setSearchSlot(e.target.value)}
                      className="w-full border-b border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-sm font-medium outline-none"
                    />

                    <div
                      onClick={() => {
                        setSlotId("");
                        setSessionId("");
                        setPage(1);
                        setOpenSlotDropdown(false);
                      }}
                      className="px-3 py-2 hover:bg-[var(--secondary-lighter)] cursor-pointer text-sm"
                    >
                      All Slots
                    </div>

                    {allSlots.map((s) => (
                      <div
                        key={s._id}
                        onClick={() => {
                          setSlotId(s._id);
                          setSessionId("");
                          setPage(1);
                          setOpenSlotDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-[var(--secondary-lighter)] cursor-pointer text-sm"
                      >
                        {s.slotName}
                      </div>
                    ))}

                    {hasMoreSlots && (
                      <div className="text-center py-2 text-xs text-[var(--text-muted)]">
                        Loading more...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SESSION */}
            {!isTeamMode && isTrailAuction && (
              <select
                value={sessionId}
                onChange={(e) => {
                  setSessionId(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] disabled:opacity-60"
                disabled={!slotId}
              >
                <option value="">All Sessions</option>
                {slotSessions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {/* DATE FROM */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)]"
            />

            {/* DATE TO */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)]"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[900px] text-sm">
          {/* HEADER */}
          <thead className="bg-[var(--secondary-lighter)] font-semibold">
            <tr className="border-b border-[var(--border-card)]">
              {[
                "#",
                isTeamMode ? "Team" : "Player",
                ...(isTrailAuction ? ["Slot", "Session"] : []),
                ...(isTeamMode ? ["Owner"] : []),
                "Mobile",
                "Type",
                "Fee",
                "Date",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {tableLoading && (
              <tr>
                <td
                  colSpan={tableColSpan}
                  className="py-6 text-center text-sm text-[var(--text-secondary)]"
                >
                  Loading...
                </td>
              </tr>
            )}
            {registrations.length === 0 && (
              <tr>
                <td
                  colSpan={tableColSpan}
                  className="bg-[var(--bg-card)] py-10 text-center text-sm text-[var(--text-secondary)]"
                >
                  No registration data found
                </td>
              </tr>
            )}

            {registrations.map((item, i) => (
              <tr
                key={item.auctionPlayerId || item.registrationId}
                className="border-b border-[var(--border-card)] bg-[var(--bg-card)] text-xs transition last:border-0 hover:bg-[var(--secondary-lighter)]"
              >
                {/* INDEX */}
                <td className="px-3 py-1 text-[var(--text-secondary)]">
                  {(page - 1) * limit + i + 1}
                </td>

                {/* PLAYER / TEAM */}
                <td className="px-3 py-1 font-semibold text-[var(--text-primary)]">
                  {isTeamMode
                    ? item?.teamName || "-"
                    : item?.player?.name || "-"}
                </td>

                {/* SLOT */}
                {isTrailAuction && (
                  <td className="px-3 py-1 text-[var(--text-secondary)]">
                    {item?.slot?.slotName || "-"}
                  </td>
                )}

                {/* SESSION */}
                {isTrailAuction && (
                  <td className="px-3 py-1 text-[var(--text-secondary)]">
                    {item?.session?.name || "-"}
                  </td>
                )}

                {isTeamMode && (
                  <td className="px-3 py-1 text-[var(--text-secondary)]">
                    {item?.teamOwner || "-"}
                  </td>
                )}

                {/* MOBILE */}
                <td className="px-3 py-1 text-[var(--text-secondary)]">
                  {isTeamMode
                    ? item?.mobileNumber || "-"
                    : item?.player?.mobile || "-"}
                </td>

                {/* TYPE BADGE */}
                <td className="px-3 py-1">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                      item.registrationType === "paid"
                        ? "bg-[var(--accent-light)] text-[var(--primary)]"
                        : "bg-[var(--secondary-lighter)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {item.registrationType}
                  </span>
                </td>

                {/* FEE */}
                <td className="px-3 py-1 font-semibold text-[var(--text-primary)]">
                  ₹{item?.paymentDetails?.registrationFee || 0}
                </td>

                {/* DATE */}
                <td className="px-3 py-1 text-xs text-[var(--text-secondary)]">
                  {item?.registrationDate
                    ? new Date(item.registrationDate).toLocaleDateString()
                    : "-"}
                </td>

                {/* ACTION */}
                <td className="px-3 py-1">
                  <button
                    onClick={() => setSelectedRegistration(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                  >
                    <Eye className="h-3.5 w-3.5 text-[var(--primary)]" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-medium text-[var(--text-secondary)]">
          Showing {registrations.length} of {pagination.total || 0} records
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:opacity-50"
          >
            Prev
          </button>
          <span className="min-w-[90px] text-center text-xs font-semibold text-[var(--text-secondary)]">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {selectedRegistration &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-black/70 p-3 pt-5 backdrop-blur-sm sm:p-5">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
              {/* HEADER */}
              <div className="border-b border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                      {isTeamMode ? <Users size={18} /> : <User size={18} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">
                          Registration Details
                        </h3>
                        <span className="rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--primary)]">
                          {isTeamMode ? "Team" : "Player"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-[var(--text-secondary)]">
                        {isTeamMode
                          ? selectedRegistration?.teamName ||
                            "Team registration"
                          : selectedRegistration?.player?.name ||
                            "Player registration"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRegistration(null)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                    aria-label="Close registration details"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      Type
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-[var(--text-primary)]">
                      {selectedRegistration?.registrationType || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-[var(--text-primary)]">
                      {selectedRegistration?.paymentDetails?.status || "direct"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      Total
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
                      ₹{selectedRegistration?.paymentDetails?.amount || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      Role
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                      {selectedRegistration?.player?.playerRole || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CONTENT */}
              <div className="max-h-[calc(100vh-13rem)] space-y-3 overflow-y-auto bg-[var(--bg-main)] p-3 [scrollbar-color:var(--border-primary)_transparent] [scrollbar-width:thin] sm:p-5">
                {isTeamMode ? (
                  <>
                    <Section title="Team Info" icon={<Users size={14} />}>
                      <Field
                        label="Team Name"
                        value={selectedRegistration?.teamName}
                      />
                      <Field
                        label="Owner"
                        value={selectedRegistration?.teamOwner}
                      />
                      <Field
                        label="Mobile"
                        value={selectedRegistration?.mobileNumber}
                      />
                      <Field
                        label="Email"
                        value={selectedRegistration?.contactEmail}
                      />
                      <Field
                        label="Location"
                        value={selectedRegistration?.location}
                      />
                      <Field
                        label="Logo"
                        full
                        value={
                          selectedRegistration?.logo ? (
                            <img
                              src={selectedRegistration.logo}
                              alt={
                                selectedRegistration?.teamName || "Team logo"
                              }
                              className="h-20 w-20 rounded-lg border border-[var(--border-card)] object-cover"
                            />
                          ) : (
                            "-"
                          )
                        }
                      />
                    </Section>
                  </>
                ) : (
                  <>
                    <Section title="Player Info" icon={<User size={14} />}>
                      <Field
                        label="Name"
                        value={selectedRegistration?.player?.name}
                      />
                      <Field
                        label="Mobile"
                        value={selectedRegistration?.player?.mobile}
                      />
                      <Field
                        label="Email"
                        value={selectedRegistration?.player?.email}
                      />
                      <Field
                        label="Location"
                        value={selectedRegistration?.player?.location}
                      />
                      <Field
                        label="Date of birth"
                        value={
                          selectedRegistration?.player?.dateOfBirth
                            ? new Date(
                                selectedRegistration.player.dateOfBirth,
                              ).toLocaleDateString()
                            : "-"
                        }
                      />
                      <Field
                        label="Aadhar card"
                        full
                        value={
                          selectedRegistration?.player?.adharCard ? (
                            <a
                              href={selectedRegistration.player.adharCard}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex flex-col gap-2"
                            >
                              <img
                                src={selectedRegistration.player.adharCard}
                                alt="Aadhar card"
                                className="max-h-52 w-full rounded-lg border border-[var(--border-card)] object-contain"
                              />
                              <span className="text-xs font-semibold text-[var(--primary)] underline">
                                Open full image
                              </span>
                            </a>
                          ) : (
                            "-"
                          )
                        }
                      />
                      <Field
                        label="Voter ID"
                        full
                        value={
                          selectedRegistration?.player?.voterId ? (
                            <a
                              href={selectedRegistration.player.voterId}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex flex-col gap-2"
                            >
                              <img
                                src={selectedRegistration.player.voterId}
                                alt="Voter ID"
                                className="max-h-52 w-full rounded-lg border border-[var(--border-card)] object-contain"
                              />
                              <span className="text-xs font-semibold text-[var(--primary)] underline">
                                Open full image
                              </span>
                            </a>
                          ) : (
                            "-"
                          )
                        }
                      />
                    </Section>

                    <Section
                      title="Slot & Session"
                      icon={<CalendarDays size={14} />}
                    >
                      <Field
                        label="Slot"
                        value={selectedRegistration?.slot?.slotName}
                      />
                      <Field
                        label="Code"
                        value={selectedRegistration?.slot?.slotCode}
                      />
                      <Field
                        label="Type"
                        value={selectedRegistration?.slot?.slotType}
                      />
                      <Field
                        label="Session"
                        value={selectedRegistration?.session?.name}
                      />

                      <Field
                        label="Date"
                        value={
                          selectedRegistration?.session?.slotDate
                            ? new Date(
                                selectedRegistration.session.slotDate,
                              ).toLocaleDateString()
                            : "-"
                        }
                      />

                      <Field
                        label="Time"
                        value={
                          selectedRegistration?.session?.slotStartTime &&
                          selectedRegistration?.session?.slotEndTime
                            ? `${selectedRegistration.session.slotStartTime} - ${selectedRegistration.session.slotEndTime}`
                            : "-"
                        }
                      />
                    </Section>
                  </>
                )}

                <Section title="Payment" icon={<CreditCardIcon size={14} />}>
                  <Field
                    label="Type"
                    value={
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          selectedRegistration?.registrationType === "paid"
                            ? "bg-[var(--accent-light)] text-[var(--primary)]"
                            : "bg-[var(--secondary-lighter)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {selectedRegistration?.registrationType || "-"}
                      </span>
                    }
                  />

                  <Field
                    label="Status"
                    value={
                      selectedRegistration?.paymentDetails?.status || "direct"
                    }
                  />
                  <Field
                    label="Fee"
                    value={`₹${selectedRegistration?.paymentDetails?.registrationFee || 0}`}
                  />
                  <Field
                    label="Platform"
                    value={`₹${selectedRegistration?.paymentDetails?.platformFee || 0}`}
                  />
                  <Field
                    label="Total"
                    value={`₹${selectedRegistration?.paymentDetails?.amount || 0}`}
                  />
                  {/* ✅ GST SHOW */}
                  {selectedRegistration?.paymentDetails?.gstEnabled && (
                    <>
                      <Field
                        label="GST (%)"
                        value={`${selectedRegistration?.paymentDetails?.gstPercentage || 0}%`}
                      />
                      <Field
                        label="GST Amount"
                        value={`₹${selectedRegistration?.paymentDetails?.gstAmount || 0}`}
                      />
                    </>
                  )}
                  {isTeamMode && (
                    <Field
                      label="Payment ID"
                      value={
                        selectedRegistration?.paymentDetails?.paymentId || "-"
                      }
                    />
                  )}
                  {isTeamMode && (
                    <Field
                      label="Order ID"
                      value={
                        selectedRegistration?.paymentDetails?.orderId || "-"
                      }
                    />
                  )}

                  {isTeamMode && selectedRegistration?.paymentScreenshot && (
                    <Field
                      label="Payment Screenshot"
                      full
                      value={
                        <a
                          href={selectedRegistration.paymentScreenshot}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex flex-col gap-2"
                        >
                          <img
                            src={selectedRegistration.paymentScreenshot}
                            alt="Payment screenshot"
                            className="max-h-52 w-full rounded-lg border border-[var(--border-card)] object-contain"
                          />
                          <span className="text-xs font-semibold text-[var(--primary)] underline">
                            Open full screenshot
                          </span>
                        </a>
                      }
                    />
                  )}

                  <Field
                    label="Date"
                    full
                    value={
                      selectedRegistration?.registrationDate
                        ? new Date(
                            selectedRegistration.registrationDate,
                          ).toLocaleString()
                        : "-"
                    }
                  />
                </Section>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default RegistrationOverview;
