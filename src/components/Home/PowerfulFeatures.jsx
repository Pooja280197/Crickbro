import SectionHeading from "../SectionHeading";

const features = [
  ["Registration Website", "Online player & team registration with custom forms and approval flow"],
  ["Trial & Selection", "Conduct trials, shortlist players, and run structured selection rounds"],
  ["Admin Panel", "Full league control - settings, users, tournaments, and permissions"],
  ["Team Owner Dashboard", "Budgets, squad picks, bids, and team management in one place"],
  ["Register Report Dashboard", "Player & team registration reports with filters and export"],
  ["Dynamic Rating & Selection", "Skill ratings, categories, and data-driven player selection"],
  ["Player Performance Track", "Stats, match history, and performance trends across seasons"],
  ["Auction Controller Panel", "Live bidding control, timers, sold/unsold, and auction flow"],
  ["Digital Overlay", "Broadcast-ready on-screen graphics for live auction & matches"],
];

const PowerfulFeatures = () => {
  return (
    <section className="power-bg relative overflow-hidden py-[72px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(8,186,247,0.82),rgba(255,196,0,0.66),transparent)]" />
      <div className="pointer-events-none absolute -left-24 bottom-8 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(8,186,247,0.18),transparent_68%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[-140px] top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,196,0,0.13),transparent_66%)] blur-2xl" />
      <div className="container relative">
        <SectionHeading
          eyebrow="All-in-one Platform"
          title="Powerful"
          accent="Features"
          text="Registration se auction tak - trials, admin, dashboards, reports, ratings, performance tracking aur live digital overlay"
        />
        <div className="grid grid-cols-3 gap-[18px] max-md:grid-cols-1">
          {features.map(([title, text], index) => (
            <article
              className="modern-card-lift modern-surface grid min-h-[106px] grid-cols-[42px_1fr] gap-4 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-5 text-[var(--text-primary)] shadow-[var(--shadow-card)]"
              key={title}
            >
              <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(8,186,247,0.76),rgba(255,196,0,0.58),transparent)]" />
              <span className="modern-icon-pop grid h-[34px] w-[34px] place-items-center rounded-md border border-[var(--border-primary)] bg-[var(--accent-light)] text-xs font-black text-[var(--primary)]">
                {index + 1}
              </span>
              <div>
                <h3 className="mb-[7px] text-[15px] font-bold text-[var(--text-primary)]">{title}</h3>
                <p className="m-0 text-xs leading-[1.45] text-[var(--text-secondary)]">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PowerfulFeatures;
