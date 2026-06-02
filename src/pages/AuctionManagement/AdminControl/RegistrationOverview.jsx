import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../utils/api";
import {
  Users,
  CreditCard,
  Zap,
  IndianRupee,
  User,
  CalendarDays,
  X,
  CreditCardIcon,
} from "lucide-react";
import { fetchSlotList } from "../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";

const Field = ({ label, value, full }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <p className="text-[10px] text-gray-600">{label}</p>
    <p className="font-medium text-[13px] text-[var(--secondary-dark)] break-words">
      {value || "-"}
    </p>
  </div>
);

const Section = ({ title, icon, children }) => (
  <div className="border rounded-lg p-3 bg-[var(--background)]">
    <h4 className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] mb-2">
      {icon}
      {title}
    </h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
      {children}
    </div>
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
      <div className="p-6 text-sm text-[var(--secondary-dark)]">
        Loading registration report...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-sm text-red-500">{error}</div>;
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
  const netRevenue = grossRevenue - transactionCharge;

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const gstData = {
    totalGST: summary.totalGSTAmount || 0,
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
      bg: "bg-blue-50",
      border: "border-blue-400 ",
      iconBg: "bg-white text-[var(--primary)]",
    },
    {
      title: "Paid",
      value: summary.totalPaidRegistrations || 0,
      icon: <CreditCard size={18} />,
      bg: "bg-green-50",
      border: "border-green-400",
      iconBg: "bg-white text-[var(--primary)]",
    },
    ...(!isTeamMode
      ? [
          {
            title: "Direct",
            value: summary.totalDirectRegistrations || 0,
            icon: <Zap size={18} />,
            bg: "bg-purple-50",
            border: "border-purple-400",
            iconBg: "bg-white text-[var(--primary)]",
          },
        ]
      : []),
    {
      title: "Total Revenue",
      value: formatCurrency(grossRevenue),
      icon: <IndianRupee size={18} />,
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      iconBg: "bg-white text-[var(--primary)]",
    },
    {
      title: "Net Revenue",
      value: formatCurrency(netRevenue),
      subtitle: `After 2.3% Transaction Fee + GST`,
      icon: <IndianRupee size={18} />,
      bg: "bg-emerald-50",
      border: "border-emerald-400",
      iconBg: "bg-white text-emerald-600",
    },
    ...(gstData.enabled
      ? [
          {
            title: "Total GST",
            value: formatCurrency(gstData.totalGST),
            subtitle: `GST @ ${gstData.gstPercentage}%`,
            icon: <IndianRupee size={18} />,
            bg: "bg-red-50",
            border: "border-red-400",
            iconBg: "bg-white text-red-600",
          },
        ]
      : []),
  ];

  return (
    <div className="p-4 lg:p-4 text-[var(--secondary-dark)] space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            Registration Report
          </h2>
        </div>

        {showTeamReportSwitch && (
          <div className="flex w-full items-center justify-end gap-2 rounded-xl border bg-white p-1 shadow-sm sm:w-auto">
            <button
              type="button"
              onClick={() => setReportMode("player")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                !isTeamMode
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--secondary-dark)] hover:bg-gray-100"
              }`}
            >
              Player Report
            </button>
            <button
              type="button"
              onClick={() => setReportMode("team")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isTeamMode
                  ? "bg-indigo-600 text-white"
                  : "text-[var(--secondary-dark)] hover:bg-gray-100"
              }`}
            >
              Team Report
            </button>
          </div>
        )}
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
          isTeamMode ? "lg:grid-cols-4" : gstData.enabled ?"lg:grid-cols-6": "lg:grid-cols-5"
        }`}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className={`relative rounded-xl  p-4 shadow-lg ${card.bg}  border-l-4 ${card.border}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--secondary-dark)]">
                  {card.title}
                </p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                {card.subtitle ? (
                  <p className="mt-1 text-[11px] text-gray-600">
                    {card.subtitle}
                  </p>
                ) : null}
              </div>
              <div className={`p-2 rounded-lg shadow-md ${card.iconBg}`}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--background)] border rounded-xl shadow-lg p-4 space-y-4">
  {/* TOP BAR */}
  <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
    
    {/* SEARCH */}
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder={
        isTeamMode ? "🔍 Search team..." : "🔍 Search player..."
      }
      className="w-full md:w-[400px] shadow-md rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
    />

    {/* ACTIONS */}
    <div className="flex items-center gap-2 w-full md:w-auto">
      
      {/* LIMIT */}
      <select
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        className="border shadow-md rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>

      {/* FILTER BUTTON */}
      <button
        onClick={() => setShowFilters((prev) => !prev)}
        className="px-4 py-2 rounded-lg shadow-md border bg-white hover:bg-gray-100 text-sm"
      >
        ⚙️ Filters
      </button>

      {/* RESET */}
      <button
        onClick={resetFilters}
        className="p-2 shadow-md rounded-lg border border-[var(--secondary-light)] bg-white hover:bg-gray-100"
        title="Reset Filters"
      >
        🔄
      </button>
    </div>
  </div>

  {/* FILTER SECTION */}
  {showFilters && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t">
      
      {/* REGISTRATION TYPE */}
      <select
        value={registrationType}
        onChange={(e) => {
          setRegistrationType(e.target.value);
          setPage(1);
        }}
        className="border shadow-md rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="all">All Types</option>
        <option value="paid">Paid</option>
        <option value="direct">Direct</option>
      </select>

      {/* SLOT */}
      {!isTeamMode && (
        <div className="relative">
          <div
            className="border shadow-md rounded-lg px-3 py-2 text-sm cursor-pointer bg-white"
            onClick={() => setOpenSlotDropdown((prev) => !prev)}
          >
            {selectedSlot?.slotName || "All Slots"}
          </div>

          {openSlotDropdown && (
            <div
              className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
              onScroll={handleScroll}
            >
              <input
                type="text"
                placeholder="Search slot..."
                value={searchSlot}
                onChange={(e) => setSearchSlot(e.target.value)}
                className="w-full px-3 py-2 border-b outline-none text-sm"
              />

              <div
                onClick={() => {
                  setSlotId("");
                  setSessionId("");
                  setPage(1);
                  setOpenSlotDropdown(false);
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
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
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {s.slotName}
                </div>
              ))}

              {hasMoreSlots && (
                <div className="text-center py-2 text-xs text-gray-400">
                  Loading more...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SESSION */}
      {!isTeamMode && (
        <select
          value={sessionId}
          onChange={(e) => {
            setSessionId(e.target.value);
            setPage(1);
          }}
          className="border shadow-md rounded-lg px-3 py-2 text-sm"
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
        className="border shadow-md rounded-lg px-3 py-2 text-sm"
      />

      {/* DATE TO */}
      <input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        className="border shadow-md rounded-lg px-3 py-2 text-sm"
      />
    </div>
  )}
</div>

      <div className="shadow-lg border rounded-xl overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          {/* HEADER */}
          <thead className="bg-[var(--background)] font-semibold">
            <tr className="border-b border-[var(--secondary-light)]">
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
                  className="text-left px-4 py-3 text-md text-black font-semibold tracking-wide uppercase"
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
                  className="text-center py-6 text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            )}
            {registrations.length === 0 && (
              <tr>
                <td
                  colSpan={tableColSpan}
                  className="text-center py-10 text-gray-400 bg-white"
                >
                  No registration data found
                </td>
              </tr>
            )}

            {registrations.map((item, i) => (
              <tr
                key={item.auctionPlayerId || item.registrationId}
                className="border-b border-[var(--secondary-light)] last:border-0 hover:bg-white/60 transition duration-150 bg-gray-50 text-sm "
              >
                {/* INDEX */}
                <td className="px-4 py-3 text-gray-500">
                  {(page - 1) * limit + i + 1}
                </td>

                {/* PLAYER / TEAM */}
                <td className="px-4 py-3 font-medium text-[var(--secondary-dark)]">
                  {isTeamMode
                    ? item?.teamName || "-"
                    : item?.player?.name || "-"}
                </td>

                {/* SLOT */}
                {isTrailAuction && (
                  <td className="px-4 py-3">{item?.slot?.slotName || "-"}</td>
                )}

                {/* SESSION */}
                {isTrailAuction && (
                  <td className="px-4 py-3">{item?.session?.name || "-"}</td>
                )}

                {isTeamMode && (
                  <td className="px-4 py-3 text-gray-600">
                    {item?.teamOwner || "-"}
                  </td>
                )}

                {/* MOBILE */}
                <td className="px-4 py-3 text-gray-600">
                  {isTeamMode
                    ? item?.mobileNumber || "-"
                    : item?.player?.mobile || "-"}
                </td>

                {/* TYPE BADGE */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      item.registrationType === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {item.registrationType}
                  </span>
                </td>

                {/* FEE */}
                <td className="px-4 py-3 font-semibold text-[var(--secondary-dark)]">
                  ₹{item?.paymentDetails?.registrationFee || 0}
                </td>

                {/* DATE */}
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {item?.registrationDate
                    ? new Date(item.registrationDate).toLocaleDateString()
                    : "-"}
                </td>

                {/* ACTION */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedRegistration(item)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--secondary-light)] hover:bg-white transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-sm text-gray-600">
          Showing {registrations.length} of {pagination.total || 0} records
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="border rounded-md px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm min-w-[90px] text-center">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="border rounded-md px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {selectedRegistration && (
        <div className="fixed top-20 inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-[var(--background)]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                  {isTeamMode ? <Users size={16} /> : <User size={16} />}
                </div>

                <h3 className="text-sm font-semibold text-[var(--primary)]">
                  Registration Details
                </h3>
              </div>

              <button
                onClick={() => setSelectedRegistration(null)}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-black"
              >
                <X size={16} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-3">
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
                            alt={selectedRegistration?.teamName || "Team logo"}
                            className="h-20 w-20 rounded-lg border object-cover"
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
                              className="max-h-52 w-full rounded-lg border object-contain"
                            />
                            <span className="text-xs text-blue-600 underline">
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
                              className="max-h-52 w-full rounded-lg border object-contain"
                            />
                            <span className="text-xs text-blue-600 underline">
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
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        selectedRegistration?.registrationType === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
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
                    value={selectedRegistration?.paymentDetails?.orderId || "-"}
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
                          className="max-h-52 w-full rounded-lg border object-contain"
                        />
                        <span className="text-xs text-blue-600 underline">
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
        </div>
      )}
    </div>
  );
};

export default RegistrationOverview;
