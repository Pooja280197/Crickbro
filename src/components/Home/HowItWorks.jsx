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
    <section className="process-bg py-[72px] pb-[74px]">
      <div className="container">
        <SectionHeading
          eyebrow="Simple Process"
          title="How It"
          accent="Works"
          text="Four simple steps - tournament se live auction tak, minutes mein ready"
        />
        <div className="mt-[42px] grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {steps.map(([step, title, text], index) => (
            <article
              className="relative min-h-[190px] rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-[22px] py-7 text-center text-[var(--text-primary)] shadow-[var(--shadow-card)]"
              key={step}
            >
              <span className="inline-flex min-h-[22px] items-center justify-center rounded-full bg-[var(--secondary)] px-3 text-[9px] font-black uppercase text-[#071525]">
                {step}
              </span>
              <span className="mx-auto mb-4 mt-[18px] grid h-[34px] w-[34px] place-items-center rounded-md border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
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
        <a className="ui-btn-secondary mx-auto mt-[34px] flex items-center gap-2" href="/">
          Start Creating Your Auction
        </a>
      </div>
    </section>
  );
};

export default HowItWorks;
