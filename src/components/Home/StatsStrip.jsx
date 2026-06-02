const stats = [
  ["120+", "Live Auctions"],
  ["10K+", "Teams Registered"],
  ["100K+", "Players Listed"],
  ["10Cr+", "Total Bids"],
  ["600+", "Tournaments"],
  ["4.8+", "User Rating"],
];

const StatsStrip = () => {
  return (
    <section className="relative z-[2] bg-[var(--bg-stat)] text-[#071525]">
      <div className="container grid min-h-20 grid-cols-6 items-center gap-[18px] max-lg:grid-cols-3 max-md:grid-cols-1 max-md:gap-3 max-md:py-4">
        {stats.map(([value, label], index) => (
          <div className="flex items-center gap-2.5 text-xs font-extrabold" key={label}>
            <span className={`line-icon icon-${index}`} />
            <strong className="font-black">{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsStrip;
