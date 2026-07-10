import {
  ClipboardList,
  Check,
  Gavel,
  Gauge,
  Layers3,
  RadioTower,
  Star,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import BatImage from "../assets/Images/BatImage.png";
import Footer from "../components/Footer";
import Header from "../components/Header";

const workflowSteps = [
  {
    number: "01",
    title: "Create Tournament",
    icon: Trophy,
    description: "Create your tournament and configure all essential details",
    points: [
      "Add tournament details (name, format, venue, dates)",
      "Register participating teams",
      "Configure awards and prize details",
      "Set tournament rules and settings",
    ],
  },
  {
    number: "02",
    title: "Create Auction",
    icon: Gavel,
    description: "Configure your auction setup",
    points: [
      "Choose Trial-Based or Direct Auction",
      "Set bidding rules and increments",
      "Configure team budgets",
      "Customize player registration form",
      "Define auction settings",
    ],
  },
  {
    number: "03",
    title: "Trial Management & Player Selection (Optional)",
    icon: Star,
    description: "Conduct trials and shortlist players",
    points: [
      "Create trial slots across multiple locations",
      "Assign selectors for player evaluation",
      "Configure selection criteria and rules",
      "Rate player performances",
      "Automatically qualify selected players for auction",
    ],
  },
  {
    number: "04",
    title: "Create Player Categories",
    icon: Layers3,
    description: "Organize players for the auction",
    points: [
      "Create player categories",
      "Assign players based on performance and ratings",
      "Organize auction lots",
      "Prepare players for live bidding",
    ],
  },
  {
    number: "05",
    title: "Start Live Auction",
    icon: RadioTower,
    description: "Run your auction in real time",
    points: [
      "Live bidding by team owners",
      "Real-time wallet and budget tracking",
      "Monitor player bidding activity",
      "Public auction display overlays for screens",
      "Automatic player assignment to winning teams",
    ],
  },
  {
    number: "06",
    title: "Matches & Live Scoring",
    icon: Gauge,
    description: "Manage matches after the auction",
    points: [
      "Schedule matches between teams",
      "Manage squads and fixtures",
      "Live scoring through CrickBro App",
      "Real-time scorecards and statistics",
      "Track tournament standings and results",
    ],
  },
];

const TimelineStep = ({ step, side }) => {
  const Icon = step.icon;
  const isLeft = side === "left";

  return (
    <div
      className={`hiw-step group relative w-full py-3 ${
        isLeft ? "hiw-step-left" : "hiw-step-right"
      }`}
    >
      <div
        className={`hiw-connector absolute top-[47px] hidden h-px w-10 bg-gradient-to-r ${
          isLeft
            ? "right-0 from-cyan-200/10 to-cyan-100/80"
            : "left-0 from-cyan-100/80 to-cyan-200/10"
        }`}
      />
      <span
        className={`hiw-dot absolute top-[40px] hidden h-[15px] w-[15px] rounded-full border border-cyan-100/70 bg-[#111044] shadow-[0_0_12px_rgba(103,232,249,0.3)] ${
          isLeft ? "right-0" : "left-0"
        }`}
      >
        <span className="absolute inset-[4px] rounded-full bg-cyan-300" />
      </span>

      <div className="rounded-2xl border border-cyan-200/15 bg-white/[0.055] px-4 py-4 shadow-[0_16px_36px_rgba(0,0,0,0.16)] backdrop-blur-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:border-cyan-200/30 group-hover:bg-white/[0.075]">
        <div
          className="hiw-step-heading flex items-center gap-3"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-cyan-200/30 bg-cyan-300/[0.08] text-cyan-300 shadow-[inset_0_0_18px_rgba(34,211,238,0.08)] transition group-hover:border-cyan-200/60 group-hover:bg-cyan-300/[0.13]">
            <Icon size={19} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-cyan-200/65">
              Step {step.number}
            </p>
            <h2 className="font-heading text-lg font-black leading-tight text-white sm:text-xl">
              {step.title}
            </h2>
          </div>
        </div>

        <p className="mt-3 border-t border-white/10 pt-3 text-[13px] font-bold leading-5 text-cyan-100/90">
          {step.description}
        </p>

        <ul className="mt-3 space-y-2">
          {step.points.map((point) => (
            <li
              key={point}
              className={`flex items-start gap-2 text-[12px] font-medium leading-[1.45] text-slate-300/85 ${
                isLeft ? "flex-row-reverse text-right" : "text-left"
              }`}
            >
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                <Check size={10} strokeWidth={3} />
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const HowItWorks = ({ theme, onToggleTheme }) => {
  return (
    <div className="site-shell">
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      <main className="overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
        <section className="relative px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[38rem] -translate-x-1/2 rounded-full bg-[rgba(8,186,247,0.13)] blur-[100px]" />

          <div className="relative mx-auto max-w-6xl">
            <header className="mx-auto mb-10 max-w-3xl text-center lg:mb-14">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]">
                <Gavel size={14} /> The complete journey
              </span>
              <h1 className="mt-5 font-heading text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">
                How CrickBro Auction <span className="text-[var(--primary)]">Works</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                One connected workflow—from creating your tournament to the final ball of match day.
              </p>
            </header>

            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[linear-gradient(135deg,#07366c_0%,#17104d_44%,#09042b_100%)] px-5 py-10 shadow-[0_35px_100px_rgba(0,0,0,0.4)] sm:px-8 lg:px-12 lg:py-14">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_45%,rgba(31,106,174,0.35),transparent_42%),radial-gradient(ellipse_at_90%_85%,rgba(34,67,139,0.28),transparent_38%)]" />
              <div className="pointer-events-none absolute -left-32 top-[-10%] hidden h-[120%] w-[52%] rotate-[8deg] rounded-[50%] bg-white/[0.035] lg:block" />

              <div className="hiw-timeline-bat pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2">
                <div className="absolute inset-x-8 bottom-0 h-12 rounded-full bg-black/50 blur-2xl" />
                <img
                  src={BatImage}
                  alt="CrickBro cricket bat"
                  className="hiw-bat-image relative h-[830px] w-auto max-w-none object-contain drop-shadow-[0_22px_30px_rgba(0,0,0,0.55)]"
                />
              </div>

              <div className="hiw-timeline relative z-20 ml-5 border-l border-cyan-100/20 pl-7">
                {workflowSteps.map((step, index) => {
                  const isRight = index % 2 === 1;

                  return (
                    <article
                      key={step.number}
                      className="hiw-timeline-row relative min-h-[230px]"
                    >
                      <span className="hiw-mobile-node absolute -left-[37px] top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full border border-cyan-100/70 bg-[#141047] text-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.2)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      </span>

                      <div className="hiw-left-slot min-w-0">
                        {!isRight && <TimelineStep step={step} side="left" />}
                      </div>
                      <div className="hiw-center-slot" aria-hidden="true" />
                      <div className="hiw-right-slot min-w-0">
                        {isRight && <TimelineStep step={step} side="right" />}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 text-center shadow-[var(--shadow-card)] sm:flex-row sm:text-left lg:px-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">Ready to begin?</p>
                <h2 className="mt-1 font-heading text-2xl font-black">Create your first auction today.</h2>
              </div>
              <Link to="/createAuction" className="ui-btn-primary shrink-0 justify-center">
                Start Creating <ClipboardList size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default HowItWorks;
