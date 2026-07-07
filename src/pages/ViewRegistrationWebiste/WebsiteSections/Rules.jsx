// import React from "react";

// const formatCurrency = (value) => {
//   if (value === undefined || value === null || value === "") return null;
//   const numericValue = Number(value);
//   if (Number.isNaN(numericValue) || numericValue <= 0) return null;
//   return `₹ ${numericValue.toLocaleString("en-IN")}`;
// };

// const formatValue = (value, suffix = "") => {
//   if (value === undefined || value === null || value === "") return null;
//   const numericValue = Number(value);
//   if (!Number.isNaN(numericValue) && numericValue <= 0) return null;
//   return suffix ? `${value} ${suffix}` : `${value}`;
// };

// const Rules = ({ pagedata }) => {
//   const customRules = pagedata?.rules;
//   const auctionRules =
//     pagedata?.auctionId?.auctionRules || pagedata?.auctionRules;

//   const customRuleItems = Array.isArray(customRules?.items)
//     ? customRules.items.filter(
//         (rule) =>
//           String(rule?.title || "").trim() &&
//           String(rule?.description || "").trim(),
//       )
//     : [];

//   const dynamicRules = [
//     {
//       label: "Budget Cap",
//       value: formatCurrency(auctionRules?.budgetCap),
//     },
//     {
//       label: "Minimum Bid",
//       value: formatCurrency(auctionRules?.minimumBid),
//     },
//     {
//       label: "Bid Increment",
//       value: formatCurrency(auctionRules?.biddingIncrement),
//     },
//     {
//       label: "Players Per Team",
//       value:
//         auctionRules?.minPlayersPerTeam > 0 &&
//         auctionRules?.maxPlayersPerTeam > 0
//           ? `${auctionRules.minPlayersPerTeam} - ${auctionRules.maxPlayersPerTeam}`
//           : null,
//     },
//     {
//       label: "Max Foreign Players",
//       value: formatValue(auctionRules?.maxForeignPlayers, "players"),
//     },
//     {
//       label: "Wicket Keepers",
//       value:
//         auctionRules?.minWicketKeepers > 0 && auctionRules?.maxWicketKeepers > 0
//           ? `${auctionRules.minWicketKeepers} - ${auctionRules.maxWicketKeepers}`
//           : null,
//     },
//     {
//       label: "RTM Enabled",
//       value: auctionRules?.rtmEnabled === true ? "Yes" : null,
//     },
//     {
//       label: "Unsold Re-entry",
//       value: auctionRules?.unsoldPlayerReEntry === true ? "Allowed" : null,
//     },
//   ].filter((rule) => rule.value !== null);

//   const sectionBadge = customRuleItems.length > 0 ? "Custom Rules" : "Rules";
//   const sectionTitle =
//     customRuleItems.length > 0
//       ? customRules?.title || "Rules & Guidelines"
//       : "Important Auction Rules in One Place";
//   const sectionDescription =
//     customRuleItems.length > 0
//       ? customRules?.description ||
//         "Please review the auction process, participation requirements, and selection criteria before registering."
//       : "Please review the auction process, participation requirements, and selection criteria before registering.";
//   const hasData = customRuleItems.length > 0 || dynamicRules.length > 0;

//   if (!hasData) return null;

//   const visibleRules =
//     customRuleItems.length > 0 ? customRuleItems : dynamicRules;
//   const rulesStyle = {
//     "--rules-title": "#f8fafc",
//     "--rules-text": "#dbeafe",
//     "--rules-muted": "#bfdbfe",
//     "--rules-primary": "#38bdf8",
//     "--rules-accent": "#f59e0b",
//     fontFamily:
//       '"Inter", "Manrope", "Nunito Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
//   };

//   return (
//     <section
//       className="relative overflow-hidden py-8 md:py-10"
//       style={{
//         ...rulesStyle,
//         background:
//           "radial-gradient(circle at 12% 8%, rgba(96, 165, 250, 0.18), transparent 30%), radial-gradient(circle at 88% 12%, rgba(14, 165, 233, 0.14), transparent 26%), linear-gradient(145deg, #020617 0%, #082f49 42%, #0b4a7a 100%)",
//       }}
//     >
//       <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.08),_transparent_36%),linear-gradient(180deg,_rgba(125,211,252,0.08),_transparent_55%)]" />

//       <div className="relative mx-auto max-w-7xl px-4">
//         <div className="mx-auto mb-7 max-w-3xl text-center">
//             <span
//               className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
//               style={{
//                 borderColor: "rgba(125, 211, 252, 0.28)",
//                 background: "rgba(255, 255, 255, 0.12)",
//                 color: "var(--rules-primary)",
//               }}
//             >
//               {sectionBadge}
//             </span>
//             <h2
//               className="mt-3 text-2xl font-black tracking-tight md:text-3xl"
//               style={{ color: "var(--rules-title)" }}
//             >
//               {sectionTitle}
//             </h2>
//             <p
//               className="mx-auto mt-2 max-w-2xl text-sm leading-6 md:text-base"
//               style={{ color: "var(--rules-text)" }}
//             >
//               {sectionDescription}
//             </p>
//         </div>

//         <div className="grid gap-4">
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
//             {visibleRules.map((rule, index) => (
//               <div
//                 key={rule.label || rule.title}
//                 className="group relative overflow-hidden rounded-xl border p-4 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
//                 style={{
//                   background:
//                     "linear-gradient(180deg, rgba(255,255,255,0.105) 0%, rgba(255,255,255,0.065) 100%)",
//                   borderColor: "rgba(125, 211, 252, 0.22)",
//                   boxShadow:
//                     "0 12px 30px rgba(2, 6, 23, 0.22), inset 0 1px 0 rgba(255,255,255,0.12)",
//                 }}
//               >
//                 <div
//                   className="absolute inset-x-0 top-0 h-1 transition-all duration-300 group-hover:h-1.5"
//                   style={{
//                     background:
//                       "linear-gradient(90deg, #38bdf8 0%, #60a5fa 55%, #f59e0b 100%)",
//                   }}
//                 />
//                 <div className="mb-3 flex items-center gap-2 pt-1">
//                   <span
//                     className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black"
//                     style={{
//                       background: "rgba(56, 189, 248, 0.16)",
//                       color: "#e0f2fe",
//                       border: "1px solid rgba(125, 211, 252, 0.28)",
//                     }}
//                   >
//                     {index + 1}
//                   </span>
//                   <div
//                     className="h-px flex-1 transition-all"
//                     style={{ background: "rgba(125, 211, 252, 0.2)" }}
//                   />
//                 </div>
//                 <h3
//                   className="text-sm font-extrabold leading-5 md:text-base"
//                   style={{ color: "var(--rules-title)" }}
//                 >
//                   {rule.label || rule.title}
//                 </h3>
//                 <p
//                   className="mt-2 text-sm leading-6"
//                   style={{ color: "var(--rules-muted)" }}
//                 >
//                   {rule.value || rule.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Rules;

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
