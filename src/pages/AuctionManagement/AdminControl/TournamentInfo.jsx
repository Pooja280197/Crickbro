import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  Clock,
  IndianRupee,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trophy,
  Users,
  Volleyball,
} from "lucide-react";
import { fetchAuctionDetails } from "../../../redux/actions";
import CricketImage from "../../../assets/Images/cricket_bg.png";

const titleCase = (value) => {
  if (!value) return "-";
  return String(value)
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return `₹${Number(value || 0).toLocaleString()}`;
};

const SummaryCard = ({ icon: Icon, label, value }) => (
  <div className="flex min-h-[88px] flex-col justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] transition hover:border-[var(--border-primary)]">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          {label}
        </p>
        <p className="mt-2 truncate text-xs font-semibold leading-5 text-[var(--text-primary)]">
          {value || "-"}
        </p>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
        <Icon className="h-3.5 w-3.5" />
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, icon: Icon, children }) => (
  <section className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)]">
    <div className="mb-3 flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h2 className="truncate text-sm font-bold text-[var(--text-primary)]">
        {title}
      </h2>
    </div>
    {children}
  </section>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 border-b border-[var(--border-card)] py-2 last:border-b-0">
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
      <span className="truncate text-[11px] font-medium text-[var(--text-secondary)]">
        {label}
      </span>
    </div>
    <span className="min-w-0 truncate text-right text-[11px] font-semibold text-[var(--text-primary)]">
      {value || "-"}
    </span>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className="inline-flex items-center rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2.5 py-1 text-[11px] font-semibold capitalize text-[var(--primary)]">
    {status || "Unknown"}
  </span>
);

const ContactLine = ({ icon: Icon, value }) => (
  <p className="flex min-w-0 items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
    <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
    <span className="truncate">{value || "-"}</span>
  </p>
);

const TournamentDetails = ({ auctionId }) => {
  const dispatch = useDispatch();

  const isLoading = useSelector(
    (state) => state.loading?.auctionDetails || false,
  );
  const tournamentData = useSelector(
    (state) => state.data?.auctionDetails?.tournament || null,
  );

  useEffect(() => {
    if (auctionId && !tournamentData) {
      dispatch(fetchAuctionDetails(auctionId));
    }
  }, [dispatch, auctionId, tournamentData]);

  if (isLoading || !tournamentData) {
    return (
      <div className="flex min-h-[calc(100vh-108px)] items-center justify-center p-4">
        <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-6 py-5 text-center shadow-[var(--shadow-card)]">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[var(--secondary)]" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Loading tournament details...
          </p>
        </div>
      </div>
    );
  }

  const {
    name,
    cityTown,
    date,
    groundName,
    entryFees,
    tournamentTime,
    logo,
    totalRegisteredTeams,
    numberOfTeams,
    ballType,
    pitchType,
    matchType,
    tournamentStatus,
    awardList,
    organizerName,
    organizerEmail,
    organizerNumber,
  } = tournamentData;

  const summaryCards = [
    { icon: CalendarDays, label: "Date", value: date || "-" },
    // { icon: MapPin, label: "Ground", value: groundName || "-" },
    { icon: MapPin, label: "City", value: cityTown || "-" },
    {
      icon: Users,
      label: "Teams",
      value: `${totalRegisteredTeams || 0}/${numberOfTeams || 0}`,
    },
    { icon: IndianRupee, label: "Entry Fee", value: formatMoney(entryFees) },
  ];

  return (
    <div className="min-h-[calc(100vh-108px)] bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="space-y-4 p-3 lg:p-5">
        <header className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)]">
                <img
                  src={logo || CricketImage}
                  alt={name || "Tournament logo"}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  Tournament Info
                </p>
                <h1 className="mt-1 truncate text-lg font-bold leading-6 text-[var(--text-primary)] lg:text-xl">
                  {name || "Tournament"}
                </h1>
                <p className="mt-1.5 truncate text-xs font-medium text-[var(--text-secondary)]">
                  {groundName || "Venue TBA"} · {cityTown || "Location TBA"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={tournamentStatus} />
              <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-card)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
                {tournamentTime || "Time TBA"}
              </span>
            </div>
          </div>
        </header>

        <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard key={card.label} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="Tournament Information" icon={Trophy}>
            <div>
              <InfoRow
                icon={Volleyball}
                label="Ball Type"
                value={titleCase(ballType)}
              />
              <InfoRow
                icon={MapPin}
                label="Pitch Type"
                value={titleCase(pitchType)}
              />
              <InfoRow
                icon={Trophy}
                label="Match Type"
                value={titleCase(matchType)}
              />
              <InfoRow
                icon={Clock}
                label="Time"
                value={titleCase(tournamentTime)}
              />
            </div>
          </SectionCard>

          <SectionCard title="Organizer" icon={ShieldCheck}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                  {organizerName || "Organizer"}
                </p>
                <div className="mt-2 space-y-1.5">
                  <ContactLine icon={Mail} value={organizerEmail} />
                  <ContactLine icon={Phone} value={organizerNumber} />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Awards" icon={Trophy}>
          {awardList?.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {awardList.map((award, idx) => (
                <div
                  key={`${award.award}-${idx}`}
                  className="rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                      <Trophy className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                        {award.award || "Award"}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] font-medium text-[var(--text-secondary)]">
                        {award.cashValue || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--secondary-lighter)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
              No awards added yet.
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default TournamentDetails;
