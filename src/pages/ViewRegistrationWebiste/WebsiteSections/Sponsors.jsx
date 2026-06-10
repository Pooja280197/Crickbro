import React, { useEffect, useState, useRef } from "react";
import { useContent } from "../../../context/ContentContext";

const sponsorAccents = [
  { from: "#f59e0b", via: "#facc15", to: "#38bdf8" },
  { from: "#38bdf8", via: "#2563eb", to: "#8b5cf6" },
  { from: "#22c55e", via: "#14b8a6", to: "#38bdf8" },
  { from: "#fb7185", via: "#f97316", to: "#facc15" },
  { from: "#a78bfa", via: "#6366f1", to: "#06b6d4" },
];

const getSponsorAccent = (tier, index) => {
  const tierKey = String(tier || "").toLowerCase();
  const tierAccents = {
    platinum: sponsorAccents[1],
    gold: sponsorAccents[0],
    silver: { from: "#cbd5e1", via: "#94a3b8", to: "#38bdf8" },
    bronze: { from: "#d97706", via: "#f97316", to: "#fbbf24" },
    partner: sponsorAccents[2],
  };

  return tierAccents[tierKey] || sponsorAccents[index % sponsorAccents.length];
};

const Sponsors = ({ pagedata }) => {
  const [isPaused, setIsPaused] = useState(false);

  const { content } = useContent();

  const sponsors = pagedata?.sponsors || content?.sponsors || [];
  const shouldAutoScroll = sponsors?.length > 5;

  const sliderRef = useRef(null);

  useEffect(() => {
    if (!shouldAutoScroll) return;

    const slider = sliderRef.current;

    if (!slider) return;

    let animationFrame;

    const autoScroll = () => {
      if (!slider) return;

      if (!isPaused) {
        slider.scrollLeft += 0.45;

        // INFINITE LOOP
        if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
          slider.scrollLeft = 0;
        }
      }

      animationFrame = requestAnimationFrame(autoScroll);
    };

    animationFrame = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused, shouldAutoScroll]);

  return (
    <div
      className="relative h-auto overflow-hidden py-8 md:py-10"
      style={{
        background:
          "radial-gradient(circle at 12% 8%, rgba(96, 165, 250, 0.18), transparent 30%), radial-gradient(circle at 88% 12%, rgba(14, 165, 233, 0.14), transparent 26%), linear-gradient(145deg, #020617 0%, #082f49 42%, #0b4a7a 100%)",
        fontFamily:
          '"Inter", "Manrope", "Nunito Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.08),_transparent_36%),linear-gradient(180deg,_rgba(125,211,252,0.08),_transparent_55%)]" />
      <section
        className="
          relative
          py-2 md:py-4
        "
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-sky-300/30 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">
              Partners
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
              Our Sponsors
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
              We proudly collaborate with partners who support and inspire
              excellence.
            </p>
          </div>

          <div className="relative overflow-hidden">
            {shouldAutoScroll && (
              <>
                <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-[#06233b] to-transparent md:w-16" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-[#083752] to-transparent md:w-16" />
              </>
            )}

            <div
              ref={sliderRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className={`flex items-stretch gap-3 overflow-hidden py-3 md:gap-4 ${
                shouldAutoScroll ? "px-5 md:px-10" : "justify-center px-1"
              }`}
            >
              {(shouldAutoScroll ? [...sponsors, ...sponsors] : sponsors).map(
                (s, i) => {
                  const accent = getSponsorAccent(s.tier, i);

                  return (
                    <article
                      key={`${s._id || s.name || "sponsor"}-${i}`}
                      className="group relative flex min-w-[145px] max-w-[145px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-white/[0.08] p-2.5 shadow-[0_10px_24px_rgba(2,6,23,0.2)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/35 hover:bg-white/[0.12] md:min-w-[170px] md:max-w-[170px] md:p-3"
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-1"
                        style={{
                          background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
                        }}
                      />

                      <div className="relative flex h-[68px] items-center justify-center rounded-lg bg-white px-3 shadow-sm md:h-[78px]">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={s.logo}
                          alt={s.name || "Sponsor logo"}
                          className="max-h-[48px] max-w-full object-contain md:max-h-[56px]"
                        />
                      </div>

                      <div className="mt-2.5 min-w-0 text-center">
                        <p className="truncate text-xs font-bold text-white md:text-sm">
                          {s.name || "Valued Partner"}
                        </p>
                        {s.tier && (
                          <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-blue-200/70">
                            {s.tier}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sponsors;
