import {
  CalendarDays,
  ClipboardList,
  Gavel,
  Gauge,
  Layers3,
  RadioTower,
  ShieldCheck,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import BatImage from "../assets/Images/BatImage.png";

const workflowSteps = [
  {
    number: "01",
    title: "Create Tournament",
    icon: Trophy,
    accent: "Tournament base",
    description:
      "Create your tournament with teams, venue, format, dates, rules, and important setup details.",
    points: [
      "Add complete tournament details",
      "Manage teams and setup",
      "Prepare auction and match base",
    ],
  },
  {
    number: "02",
    title: "Create Auction",
    icon: Gavel,
    accent: "Auction setup",
    description:
      "Select the tournament and choose a trial-based or direct auction flow with registration options.",
    points: [
      "Choose trial or direct auction",
      "Enable player registration",
      "Set free or paid registration",
      "Add rules and GST if needed",
    ],
  },
  {
    number: "03",
    title: "Trial & Player Selection",
    icon: Star,
    accent: "Selection flow",
    description:
      "Create trial slots, assign selectors, rate players, and move qualified players forward automatically.",
    points: [
      "Create slots and sessions",
      "Assign selectors",
      "Set minimum rating criteria",
      "Auto-add qualified players",
    ],
  },
  {
    number: "04",
    title: "Create Player Categories",
    icon: Layers3,
    accent: "Auction lots",
    description:
      "Organize selected players into categories or lots so the live auction feels clear and structured.",
    points: [
      "Create categories or lots",
      "Assign selected players",
      "Organize auction order",
    ],
  },
  {
    number: "05",
    title: "Start Live Auction",
    icon: RadioTower,
    accent: "Live bidding",
    description:
      "Start bidding by category, status, and order. Teams bid live while admins manage the flow.",
    points: [
      "Choose category and player status",
      "Use sequence or random order",
      "Teams place live bids",
      "Auto-assign sold players",
    ],
  },
  {
    number: "06",
    title: "Manage Matches & Live Scoring",
    icon: Gauge,
    accent: "Match day",
    description:
      "After auction, schedule fixtures, assign teams, track matches, and score live in CrickBro.",
    points: [
      "Schedule fixtures",
      "Assign teams",
      "Track match progress",
      "Use live scoring",
    ],
  },
];

const miniStats = [
  { label: "Tournament", icon: CalendarDays },
  { label: "Players", icon: Users },
  { label: "Rules", icon: ClipboardList },
  { label: "Secure", icon: ShieldCheck },
];

const AuctionWorkflow = () => {
  return (
    <section className="relative overflow-hidden border-y border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-16 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--accent-light)] opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 rounded-full bg-[var(--accent-light)] opacity-60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
            <Gavel size={14} />
            Complete Auction Flow
          </span>

          <h2 className="mt-4 font-heading text-3xl font-black leading-tight text-[var(--text-primary)] md:text-5xl">
            How CrickBro Auction Works
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-[var(--text-secondary)] md:text-base">
            From tournament creation to live scoring, CrickBro manages the
            complete cricket auction journey in one powerful platform.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {miniStats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2 shadow-sm"
                >
                  <Icon size={16} className="mx-auto text-[var(--primary)]" />
                  <p className="mt-1 text-xs font-bold text-[var(--text-secondary)]">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-[var(--border-card)] bg-[radial-gradient(circle_at_18%_35%,rgba(8,186,247,0.18),transparent_30%),linear-gradient(135deg,#102b5e_0%,#170a44_46%,#060f2f_100%)] px-4 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:px-6 xl:px-10">
          <div className="pointer-events-none absolute inset-y-0 left-[22%] hidden w-[22%] rounded-[50%] bg-white/5 blur-sm xl:block" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[2] hidden -translate-x-1/2 -translate-y-1/2 xl:block">
            <img
              src={BatImage}
              alt="Cricket bat"
              className="h-[760px] w-auto object-contain drop-shadow-[0_28px_48px_rgba(0,0,0,0.42)]"
            />
          </div>

          <div className="relative z-[3] grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)]">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const isRight = index % 2 === 1;

              return (
                <article
                  key={step.number}
                  className={`relative xl:col-span-3 xl:grid xl:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)] ${
                    isRight ? "" : ""
                  }`}
                >
                  <div
                    className={`group relative rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/[0.1] xl:max-w-[430px] ${
                      isRight
                        ? "xl:col-start-3 xl:ml-auto"
                        : "xl:col-start-1 xl:mr-auto xl:text-right"
                    }`}
                  >
                    <div
                      className={`absolute top-10 hidden h-px bg-white/55 xl:block ${
                        isRight
                          ? "right-full w-[110px]"
                          : "left-full w-[110px]"
                      }`}
                    />
                    <div
                      className={`absolute top-[34px] hidden h-4 w-4 rounded-full border border-white/70 bg-[#102b5e] xl:block ${
                        isRight ? "-left-[122px]" : "-right-[122px]"
                      }`}
                    />

                    <div
                      className={`mb-3 flex items-center gap-3 ${
                        isRight ? "" : "xl:flex-row-reverse"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/25 text-[#31d4ff]">
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9fc7e8]">
                          Step {step.number}
                        </p>
                        <h3 className="font-heading text-2xl font-black leading-none text-white">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm font-medium leading-6 text-white/80">
                      {step.description}
                    </p>

                    <div
                      className={`mt-3 flex flex-wrap gap-2 ${
                        isRight ? "" : "xl:justify-end"
                      }`}
                    >
                      {step.points.slice(0, 3).map((point) => (
                        <span
                          key={point}
                          className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-white/75"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                <Trophy size={14} />
                Ready for match day
              </span>

              <h3 className="mt-3 font-heading text-2xl font-black text-[var(--text-primary)]">
                Ready to run your next cricket auction?
              </h3>

              <p className="mt-2 text-sm font-medium leading-6 text-[var(--text-secondary)]">
                Create tournaments, manage trials, conduct live auctions, assign
                players, and score matches — all from one platform.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/createAuction"
                aria-label="Start Auction"
                className="ui-btn-primary justify-center"
              >
                Start Auction
              </Link>

              <a
                href="/auction"
                aria-label="View Demo"
                className="ui-btn-ghost justify-center"
              >
                View Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuctionWorkflow;
