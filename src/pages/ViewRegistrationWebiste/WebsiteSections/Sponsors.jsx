import React, { useEffect, useState, useRef } from "react";
import { useContent } from "../../../context/ContentContext";

const sponsorAccents = [
  { from: "#fef3c7", to: "#fde68a" },
  { from: "#dbeafe", to: "#bfdbfe" },
  { from: "#dcfce7", to: "#bbf7d0" },
  { from: "#ffe4e6", to: "#fecdd3" },
  { from: "#ede9fe", to: "#ddd6fe" },
];

const getSponsorAccent = (tier, index) => {
  const tierKey = String(tier || "").toLowerCase();
  const tierAccents = {
    platinum: sponsorAccents[1],
    gold: sponsorAccents[0],
    silver: { from: "#f1f5f9", to: "#e2e8f0" },
    bronze: { from: "#ffedd5", to: "#fed7aa" },
    partner: sponsorAccents[2],
  };

  return tierAccents[tierKey] || sponsorAccents[index % sponsorAccents.length];
};

const Sponsors = ({ pagedata }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(false);

  const { content } = useContent();

  const sponsors = pagedata?.sponsors || content?.sponsors || [];
  const hasManySponsors = sponsors?.length > 5;
  const shouldAutoScroll = hasManySponsors && isWideScreen;

  const sliderRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateScreenSize = () => setIsWideScreen(mediaQuery.matches);

    updateScreenSize();
    mediaQuery.addEventListener?.("change", updateScreenSize);
    return () => mediaQuery.removeEventListener?.("change", updateScreenSize);
  }, []);

  useEffect(() => {
    if (!shouldAutoScroll) return;

    const slider = sliderRef.current;
    if (!slider) return;

    let animationFrameId;
    const step = 0.75;

    const autoScroll = () => {
      if (!slider) return;

      if (!isPaused) {
        slider.scrollLeft += step;

        if (slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft = 0;
        }
      }

      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, shouldAutoScroll]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.scrollLeft = 0;
  }, [shouldAutoScroll, sponsors?.length]);

  const scrollContainerClass = hasManySponsors
    ? "px-4 sm:px-6 md:px-8"
    : "px-1 sm:justify-center";

  return (
    <div
      className="relative  h-auto overflow-hidden bg-slate-50 py-8 md:py-10"
      style={{
        fontFamily:
          '"Inter", "Manrope", "Nunito Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_58%,_#eef6ff_100%)]" />
      <section
        className="
          relative
          py-2 md:py-4
        "
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Partners
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Our Sponsors
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              We proudly collaborate with partners who support and inspire
              excellence.
            </p>
          </div>

          <div className="relative overflow-hidden">
            {shouldAutoScroll && (
              <>
                <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-slate-50 to-transparent md:w-16" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-slate-50 to-transparent md:w-16" />
              </>
            )}

            <div
              ref={sliderRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className={`sponsors-scroll flex touch-pan-x items-stretch gap-3 overflow-x-auto overflow-y-hidden py-3 md:gap-4 ${shouldAutoScroll ? "" : "snap-x snap-mandatory"} ${scrollContainerClass}`}
            >
              {(shouldAutoScroll ? [...sponsors, ...sponsors] : sponsors).map(
                (s, i) => {
                  const accent = getSponsorAccent(s.tier, i);

                  return (
                    <article
                      key={`${s._id || s.name || "sponsor"}-${i}`}
                      className="group relative flex min-w-[145px] md:min-w-[170px] max-w-[170px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md md:p-3"
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-1"
                        style={{
                          background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
                        }}
                      />

                      <div
                        className="relative flex h-[68px] items-center justify-center rounded-lg border border-slate-100 px-3 md:h-[78px]"
                        style={{
                          background: `linear-gradient(135deg, ${accent.from}, #ffffff 62%, ${accent.to})`,
                        }}
                      >
                        <img
                          loading="lazy"
                          decoding="async"
                          src={s.logo}
                          alt={s.name || "Sponsor logo"}
                          className="max-h-[48px] max-w-full object-contain md:max-h-[56px]"
                        />
                      </div>

                      <div className="mt-2.5 min-w-0 text-center">
                        <p className="truncate text-xs font-bold text-slate-900 md:text-sm">
                          {s.name || "Valued Partner"}
                        </p>
                        {s.tier && (
                          <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
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
      <style>{`
        .sponsors-scroll {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          overscroll-behavior-x: contain;
        }

        .sponsors-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Sponsors;
