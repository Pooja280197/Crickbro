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
    <section className="power-bg py-[72px]">
      <div className="container">
        <SectionHeading
          eyebrow="All-in-one Platform"
          title="Powerful"
          accent="Features"
          text="Registration se auction tak - trials, admin, dashboards, reports, ratings, performance tracking aur live digital overlay"
        />
        <div className="grid grid-cols-3 gap-[18px] max-md:grid-cols-1">
          {features.map(([title, text], index) => (
            <article
              className="grid min-h-[106px] grid-cols-[42px_1fr] gap-4 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-5 text-[var(--text-primary)] shadow-[var(--shadow-card)]"
              key={title}
            >
              <span className="grid h-[34px] w-[34px] place-items-center rounded-md border border-[var(--border-primary)] bg-[var(--accent-light)] text-xs font-black text-[var(--primary)]">
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
