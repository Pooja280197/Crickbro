import SectionHeading from "../SectionHeading";

const steps = [
  [
    "Step 01",
    "Create Tournament",
    "Launch your tournament and configure teams, rules, and auction settings",
  ],
  [
    "Step 02",
    "Prepare Player Pool",
    "Add players, create categories, and organize auction lots",
  ],
  [
    "Step 03",
    "Live Player Auction",
    "Teams compete in real-time bidding to secure their preferred players",
  ],
  [
    "Step 04",
    "Finalize Team Squads",
    "Winning bids automatically assign players to teams for the tournament",
  ],
];

const HowItWorks = () => {
  return (
    <section className="process-bg relative overflow-hidden py-[72px] pb-[74px]">
      <div className="pointer-events-none absolute left-[-120px] top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(8,186,247,0.18),transparent_68%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[-120px] bottom-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,196,0,0.13),transparent_66%)] blur-2xl" />
      <div className="container relative">
        <SectionHeading
          eyebrow="Simple Process"
          title="How It"
          accent="Works"
          text="Four simple steps - tournament se live auction tak, minutes mein ready"
        />
        <div className="mt-[42px] grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {steps.map(([step, title, text], index) => (
            <article
              className="modern-card-lift modern-surface relative min-h-[190px] overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-[22px] py-7 text-center text-[var(--text-primary)] shadow-[var(--shadow-card)]"
              key={step}
            >
              <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(8,186,247,0.78),rgba(255,196,0,0.62),transparent)]" />
              <span className="inline-flex min-h-[22px] items-center justify-center rounded-full bg-[var(--secondary)] px-3 text-[9px] font-black uppercase text-[#071525]">
                {step}
              </span>
              <span className="modern-icon-pop mx-auto mb-4 mt-[18px] grid h-[34px] w-[34px] place-items-center rounded-md border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                {index + 1}
              </span>
              <h3 className="mb-2.5 text-[15px] font-bold text-[var(--text-primary)]">
                {title}
              </h3>
              <p className="m-0 text-xs leading-[1.45] text-[var(--text-secondary)]">
                {text}
              </p>
            </article>
          ))}
        </div>
        <a
          className="ui-btn-secondary mx-auto mt-[34px] w-[250px] flex items-center gap-2"
          href="/createAuction"
        >
          Start Creating Your Auction
        </a>
      </div>
    </section>
  );
};

export default HowItWorks;
