import React from "react";

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const numericValue = Number(value);
  if (Number.isNaN(numericValue) || numericValue <= 0) return null;
  return `₹ ${numericValue.toLocaleString("en-IN")}`;
};

const formatValue = (value, suffix = "") => {
  if (value === undefined || value === null || value === "") return null;
  const numericValue = Number(value);
  if (!Number.isNaN(numericValue) && numericValue <= 0) return null;
  return suffix ? `${value} ${suffix}` : `${value}`;
};

const Rules = ({ pagedata }) => {
  const customRules = pagedata?.rules;
  const auctionRules = pagedata?.auctionId?.auctionRules || pagedata?.auctionRules;

  const customRuleItems = Array.isArray(customRules?.items)
    ? customRules.items.filter(
        (rule) =>
          String(rule?.title || "").trim() &&
          String(rule?.description || "").trim(),
      )
    : [];

  const dynamicRules = [
    {
      label: "Budget Cap",
      value: formatCurrency(auctionRules?.budgetCap),
    },
    {
      label: "Minimum Bid",
      value: formatCurrency(auctionRules?.minimumBid),
    },
    {
      label: "Bid Increment",
      value: formatCurrency(auctionRules?.biddingIncrement),
    },
    {
      label: "Players Per Team",
      value:
        auctionRules?.minPlayersPerTeam > 0 &&
        auctionRules?.maxPlayersPerTeam > 0
          ? `${auctionRules.minPlayersPerTeam} - ${auctionRules.maxPlayersPerTeam}`
          : null,
    },
    {
      label: "Max Foreign Players",
      value: formatValue(auctionRules?.maxForeignPlayers, "players"),
    },
    {
      label: "Wicket Keepers",
      value:
        auctionRules?.minWicketKeepers > 0 &&
        auctionRules?.maxWicketKeepers > 0
          ? `${auctionRules.minWicketKeepers} - ${auctionRules.maxWicketKeepers}`
          : null,
    },
    {
      label: "RTM Enabled",
      value: auctionRules?.rtmEnabled === true ? "Yes" : null,
    },
    {
      label: "Unsold Re-entry",
      value: auctionRules?.unsoldPlayerReEntry === true ? "Allowed" : null,
    },
  ].filter((rule) => rule.value !== null);

  const sectionBadge = customRuleItems.length > 0 ? "Custom Rules" : "Rules";
  const sectionTitle =
    customRuleItems.length > 0
      ? customRules?.title || "Rules & Guidelines"
      : "Auction ke important rules ek jagah";
  const sectionDescription =
    customRuleItems.length > 0
      ? customRules?.description ||
        "Participation se pehle basic process aur selection conditions samajh lena better rahega."
      : "Participation se pehle basic process aur selection conditions samajh lena better rahega.";
  const hasData = customRuleItems.length > 0 || dynamicRules.length > 0;

  if (!hasData) return null;

  const visibleRules = customRuleItems.length > 0 ? customRuleItems : dynamicRules;

  return (
    <section className="relative overflow-hidden bg-slate-950 py-14 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.24),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.18),_transparent_28%)]" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
              {sectionBadge}
            </span>
            <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
              {sectionTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
              {sectionDescription}
            </p>
          </div>


        </div>

        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleRules.map((rule) => (
              <div
                key={rule.label || rule.title}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm"
              >
                <div className="mb-4 h-1.5 w-14 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                <h3 className="text-lg font-bold text-white">
                  {rule.label || rule.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">
                  {rule.value || rule.description}
                </p>
              </div>
            ))}
          </div>


        </div>
      </div>
    </section>
  );
};

export default Rules;