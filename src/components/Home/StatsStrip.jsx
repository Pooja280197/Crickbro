import {
  Gavel,
  IndianRupee,
  Star,
  Trophy,
  Users,
  UserRoundCheck,
} from "lucide-react";

const stats = [
  ["120+", "Live Auctions", Gavel],
  ["10K+", "Teams Registered", Users],
  ["100K+", "Players Listed", UserRoundCheck],
  ["10Cr+", "Total Bids", IndianRupee],
  ["600+", "Tournaments", Trophy],
  ["4.8+", "User Rating", Star],
];

const StatsStrip = () => {
  return (
    <section className="relative z-[2] overflow-hidden border-y border-[rgba(8,186,247,0.24)] bg-[image:var(--inverse-bg)] text-[var(--inverse-text)] shadow-[0_10px_28px_rgba(16,32,51,0.18),0_0_28px_rgba(8,186,247,0.12)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(8,186,247,0.9),rgba(255,196,0,0.72),transparent)]" />
      <div className="container grid min-h-20 grid-cols-6 items-center gap-[14px] py-3 max-lg:grid-cols-3 max-md:grid-cols-1 max-md:gap-3 max-md:py-4">
        {stats.map(([value, label, Icon]) => (
          <div
            className="flex min-h-12 items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-xs font-extrabold leading-tight text-[var(--inverse-muted)] transition hover:-translate-y-px hover:border-[rgba(8,186,247,0.28)] hover:bg-white/10 hover:text-[var(--inverse-text)] hover:shadow-[0_0_20px_rgba(8,186,247,0.12)]"
            key={label}
          >
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--inverse-accent)] text-[11px] font-black text-[var(--inverse-accent-text)] shadow-[0_0_18px_rgba(255,196,0,0.18)]"
              aria-hidden="true"
            >
              <Icon size={15} strokeWidth={2.4} />
            </span>
            <strong className="whitespace-nowrap text-[15px] font-black text-[var(--inverse-text)]">{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsStrip;
