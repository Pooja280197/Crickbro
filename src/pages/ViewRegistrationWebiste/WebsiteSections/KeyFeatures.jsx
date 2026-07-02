import React from "react";
import { CheckCircle, Sparkles } from "lucide-react";

const Points = ({ pagedata, theme, themeMode = "light" }) => {
  const keyFeatures = pagedata?.keyFeatures?.features || [];
  const keyFeaturesTitle =
    pagedata?.keyFeatures?.title || "THIS IS MORE THAN CRICKET.";
  const isDark = themeMode === "dark";
  const featureStyle = {
    "--feature-bg": isDark ? "#07111f" : "#f8fafc",
    "--feature-soft": isDark
      ? "rgba(37, 99, 235, 0.14)"
      : theme?.soft || "var(--reg-soft)",
    "--feature-card": isDark ? "rgba(15, 27, 45, 0.94)" : "#ffffff",
    "--feature-border": isDark
      ? "rgba(148, 163, 184, 0.2)"
      : "#e2e8f0",
    "--feature-title": isDark ? "#f8fafc" : "#0f172a",
    "--feature-text": isDark ? "#cbd5e1" : "#475569",
    "--feature-muted": isDark ? "#94a3b8" : "#64748b",
    "--feature-primary": theme?.primary || "var(--reg-primary)",
    "--feature-accent": theme?.accent || "var(--reg-accent)",
    fontFamily:
      '"Inter", "Manrope", "Nunito Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  return (
    <section
      className="relative overflow-hidden py-9 md:py-12"
      style={{
        ...featureStyle,
        background:
          "linear-gradient(180deg, var(--feature-bg) 0%, var(--feature-soft) 100%)",
      }}
    >
      <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-[var(--feature-primary)]/10 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[var(--feature-accent)]/10 blur-3xl" />
      <div className="absolute inset-x-4 top-8 h-px bg-gradient-to-r from-transparent via-[var(--feature-primary)]/25 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <span
            className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--feature-primary) 28%, transparent)",
              background:
                "color-mix(in srgb, var(--feature-primary) 10%, transparent)",
              color: "var(--feature-primary)",
            }}
          >
            Key Features
          </span>
          <h2
            className="mt-3 text-2xl font-black tracking-tight md:text-4xl"
            style={{ color: "var(--feature-title)" }}
          >
            {keyFeaturesTitle}
          </h2>
          <p
            className="mx-auto mt-2 max-w-2xl text-sm leading-6 md:text-base"
            style={{ color: "var(--feature-text)" }}
          >
            Everything players need for a smooth, transparent auction
            registration experience.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {keyFeatures?.map((point, idx) => (
            <article
              key={point?._id}
              className="group relative flex min-h-[205px] w-full max-w-[290px] overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--feature-card) 96%, white), var(--feature-card))",
                borderColor:
                  "color-mix(in srgb, var(--feature-primary) 18%, var(--feature-border))",
                boxShadow: isDark
                  ? "0 16px 42px rgba(0, 0, 0, 0.18)"
                  : "0 14px 34px rgba(15, 23, 42, 0.07)",
                transitionDelay: `${idx * 100}ms`,
              }}
            >
              <div
                className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "color-mix(in srgb, var(--feature-primary) 18%, transparent)",
                }}
              />
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(145deg, color-mix(in srgb, var(--feature-primary) 10%, transparent), transparent 58%)",
                }}
              />
              <div className="relative flex h-full w-full flex-col">
                {/* <div
                  className="mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(145deg, color-mix(in srgb, var(--feature-primary) 16%, var(--feature-card)), var(--feature-card))",
                    color: "var(--feature-primary)",
                    ringColor:
                      "color-mix(in srgb, var(--feature-primary) 22%, transparent)",
                  }}
                >
                  {point?.icon ? (
                    <span className="text-lg leading-none">{point.icon}</span>
                  ) : (
                    <Sparkles size={20} />
                  )}
                </div> */}
                <div className="mb-3 min-w-0">
                  <h3
                    className="text-base font-extrabold leading-5 tracking-tight md:text-[17px]"
                    style={{ color: "var(--feature-title)" }}
                  >
                    {point?.title}
                  </h3>
                  <div
                    className="mt-2 h-0.5 w-10 rounded-full transition-all group-hover:w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--feature-primary), var(--feature-accent))",
                    }}
                  />
                </div>
                <p
                  className="relative line-clamp-4 text-sm font-medium leading-6"
                  style={{ color: "var(--feature-text)" }}
                >
                  {point?.description}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: "var(--feature-muted)" }}
                  >
                    Feature {String(idx + 1).padStart(2, "0")}
                  </span>
                  <CheckCircle
                    size={18}
                    style={{ color: "var(--feature-primary)" }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Points;
