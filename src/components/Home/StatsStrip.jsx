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
    <section className="relative z-[2] bg-[image:var(--inverse-bg)] text-[var(--inverse-text)] shadow-[0_10px_28px_rgba(16,32,51,0.12)]">
      <div className="container grid min-h-20 grid-cols-6 items-center gap-[14px] py-3 max-lg:grid-cols-3 max-md:grid-cols-1 max-md:gap-3 max-md:py-4">
        {stats.map(([value, label, Icon]) => (
          <div
            className="flex min-h-12 items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-extrabold leading-tight text-[var(--inverse-muted)] transition hover:-translate-y-px hover:bg-white/10 hover:text-[var(--inverse-text)]"
            key={label}
          >
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--inverse-accent)] text-[11px] font-black text-[var(--inverse-accent-text)]"
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
