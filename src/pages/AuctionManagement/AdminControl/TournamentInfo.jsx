import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  Clock,
  IndianRupee,
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
  return `Rs. ${value}`;
};

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
      <div className="flex min-h-[360px] items-center justify-center p-4">
        <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-5 py-3 text-sm font-bold text-[var(--secondary)] shadow-[var(--shadow-glow)]">
          Loading tournament details...
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

  const stats = [
    { icon: CalendarDays, label: "Date", value: date || "-" },
    { icon: MapPin, label: "Ground", value: groundName || "-" },
    {
      icon: Users,
      label: "Teams",
      value: `${totalRegisteredTeams || 0}/${numberOfTeams || 0}`,
    },
    { icon: IndianRupee, label: "Entry Fee", value: formatMoney(entryFees) },
  ];

  const details = [
    { icon: Volleyball, label: "Ball", value: titleCase(ballType) },
    { icon: MapPin, label: "Pitch", value: titleCase(pitchType) },
    { icon: Trophy, label: "Match", value: titleCase(matchType) },
    { icon: Clock, label: "Time", value: titleCase(tournamentTime) },
  ];

  console.log("Tournament Data:", tournamentData);

  return (
    <div className="min-h-screen space-y-4 p-4 font-main text-[var(--text-primary)]">
      <section className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-3xl border border-[var(--secondary)] bg-[rgba(245,180,0,0.12)] shadow-[0_0_22px_rgba(245,180,0,0.18)]">
              <img
                src={logo || CricketImage}
                alt={name || "Tournament logo"}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--secondary)]">
                <span className="rounded-full bg-[var(--secondary)]/15 px-3 py-1 font-semibold text-[var(--secondary)]">
                  Tournament Info
                </span>
                {tournamentStatus && (
                  <span className="rounded-full bg-[var(--secondary)]/15 px-3 py-1 font-semibold text-[var(--secondary)]">
                    {tournamentStatus}
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-heading font-bold text-[var(--text-primary)] sm:text-3xl">
                {name || "Tournament"}
              </h1>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {groundName || "Venue TBA"} · {cityTown || "Location TBA"}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={16} className="text-[var(--secondary)]" />
                  {date || "Date TBA"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock size={16} className="text-[var(--secondary)]" />
                  {tournamentTime || "Time TBA"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-[260px]">
            <MiniMetric label="Teams" value={`${totalRegisteredTeams || 0}/${numberOfTeams || 0}`} />
            <MiniMetric label="Entry Fee" value={formatMoney(entryFees)} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
        <Panel title="Tournament Details">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {details.map((item) => (
              <DetailRow key={item.label} {...item} />
            ))}
          </div>
        </Panel>

        <Panel title="Organizer">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--secondary)]/15 text-[var(--secondary)]">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[var(--text-primary)]">
                  {organizerName || "Organizer"}
                </p>
                {organizerEmail && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Mail size={14} className="text-[var(--secondary)]" />
                    <span className="truncate">{organizerEmail}</span>
                  </p>
                )}
                {organizerNumber && (
                  <p className="mt-1.5 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Phone size={14} className="text-[var(--secondary)]" />
                    <span>{organizerNumber}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </Panel>
      </section>

      <Panel title="Awards">
        {awardList?.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {awardList.map((award, idx) => (
              <div
                key={`${award.award}-${idx}`}
                className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--secondary)]/15 text-[var(--secondary)]">
                    <Trophy size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {award.award || "Award"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {award.cashValue || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-[var(--border-card)] bg-[var(--bg-section)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            No awards added yet.
          </p>
        )}
      </Panel>
    </div>
  );
};

export default TournamentDetails;

const Panel = ({ title, children }) => (
  <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-glow)]">
    <div className="mb-3 flex items-center gap-2.5">
      <span className="h-5 w-1 rounded-full bg-[var(--secondary)]" />
      <h2 className="font-heading text-base font-extrabold text-[var(--text-primary)]">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const MiniMetric = ({ label, value }) => (
  <div className="rounded-lg border border-[var(--border-soft)] bg-[rgba(0,9,20,0.58)] px-3 py-2">
    <p className="text-xs font-black uppercase tracking-wide text-[var(--text-muted)]">
      {label}
    </p>
    <p className="mt-0.5 truncate text-sm font-extrabold text-[var(--secondary)]">
      {value || "-"}
    </p>
  </div>
);

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-glow)]">
    <div className="flex items-center gap-3">
      <div className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--secondary)] bg-[rgba(245,180,0,0.12)] text-[var(--secondary)]">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-[var(--text-muted)]">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-extrabold text-[var(--text-primary)]">
          {value || "-"}
        </p>
      </div>
    </div>
  </div>
);

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-[rgba(0,9,20,0.42)] px-3 py-2.5">
    <div className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[rgba(245,180,0,0.12)] text-[var(--secondary)]">
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-black uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </p>
      <p className="truncate text-sm font-extrabold text-[var(--text-primary)]">
        {value || "-"}
      </p>
    </div>
  </div>
);
