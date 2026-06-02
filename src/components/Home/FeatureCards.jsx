const features = [
  ["analytics", "Player Analytics", "Deep stats & insights"],
  ["predictor", "AI Auction Predictor", "Smart bid suggestions"],
  ["scorecard", "Real-time Scorecards", "Live match updates"],
  ["streaming", "Live Streaming", "Broadcast auctions"],
  ["secure", "Secure Payments", "Trusted transactions"],
  ["setup", "Instant Setup", "Launch in minutes"],
];

const FeatureIcon = ({ type }) => {
  const commonProps = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const icons = {
    analytics: (
      <svg {...commonProps} aria-hidden="true">
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-5" />
        <path d="M12 16V8" />
        <path d="M16 16v-3" />
      </svg>
    ),
    predictor: (
      <svg {...commonProps} aria-hidden="true">
        <path d="M12 3a6 6 0 0 0-4 10.5V16h8v-2.5A6 6 0 0 0 12 3Z" />
        <path d="M9 20h6" />
        <path d="M10 16h4" />
        <path d="M12 7v3" />
      </svg>
    ),
    scorecard: (
      <svg {...commonProps} aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h3" />
      </svg>
    ),
    streaming: (
      <svg {...commonProps} aria-hidden="true">
        <path d="M8 9a5 5 0 0 0 0 6" />
        <path d="M5 6a9 9 0 0 0 0 12" />
        <path d="M16 9a5 5 0 0 1 0 6" />
        <path d="M19 6a9 9 0 0 1 0 12" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    ),
    secure: (
      <svg {...commonProps} aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-5" />
      </svg>
    ),
    setup: (
      <svg {...commonProps} aria-hidden="true">
        <path d="m13 2-8 11h6l-1 9 8-12h-6l1-8Z" />
      </svg>
    ),
  };

  return icons[type];
};

const FeatureCards = () => {
  return (
    <section className="bg-[var(--bg-section)] py-[42px]">
      <div className="container grid grid-cols-6 gap-[18px] max-lg:grid-cols-3 max-md:grid-cols-1">
        {features.map(([icon, title, text]) => (
          <article className="feature-card min-h-[126px] rounded-lg p-5" key={title}>
            <span className="feature-icon">
              <FeatureIcon type={icon} />
            </span>
            <h3 className="mb-1 mt-3.5 text-[13px] font-bold text-[var(--primary)]">{title}</h3>
            <p className="m-0 text-xs leading-[1.45] text-[var(--text-secondary)]">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;
