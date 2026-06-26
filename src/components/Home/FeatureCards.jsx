import {
  Clapperboard,
  Gavel,
  LayoutDashboard,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

const features = [
  { title: "Live Player Auction", text: "Real-time bidding", icon: Gavel },
  { title: "Team Purse", text: "Budget tracking", icon: Wallet },
  { title: "Player Data", text: "Profiles and roles", icon: Users },
  { title: "Dashboard", text: "Simple controls", icon: LayoutDashboard },
  { title: "Live Screen", text: "Pro display", icon: Clapperboard },
  { title: "Tournament Sync", text: "Connected flow", icon: Trophy },
];

const FeatureCards = () => {
  return (
    <section className="relative overflow-hidden border-y border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-8 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(900px,84vw)] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(8,186,247,0.8),rgba(255,196,0,0.65),transparent)]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(8,186,247,0.16),transparent_68%)] blur-2xl" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="modern-card-lift modern-surface group min-w-0 overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]"
              >
                <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(8,186,247,0.75),rgba(255,196,0,0.55),transparent)]" />
                <div className="modern-icon-pop mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(8,186,247,0.24)] bg-[var(--accent-light)] text-[var(--primary)]">
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <h3 className="truncate text-sm font-black text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="mt-1 truncate text-xs font-semibold text-[var(--text-secondary)]">
                  {feature.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
