import React from "react";
import { ArrowUpRight, FileCheck2, Mail, Scale } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    points: [
      "By accessing or using CrickBro, you agree to these Terms of Service.",
      "If you do not agree, you must stop using the platform.",
    ],
  },
  {
    title: "2. Eligibility and Accounts",
    points: [
      "You must provide accurate account information and keep credentials secure.",
      "You are responsible for activity performed through your account.",
      "We may suspend or terminate accounts involved in misuse, fraud, or policy violations.",
    ],
  },
  {
    title: "3. Use of Platform",
    points: [
      "CrickBro is intended for lawful management of cricket auctions, teams, and related operations.",
      "You agree not to disrupt services, attempt unauthorized access, or misuse platform data.",
      "You must comply with applicable laws and tournament-specific rules while using the platform.",
    ],
  },
  {
    title: "4. User Content and Data",
    points: [
      "You retain ownership of data you submit, including auction, player, and team information.",
      "You grant CrickBro permission to process and display this data to operate requested services.",
      "You are responsible for ensuring submitted data is accurate and does not violate third-party rights.",
    ],
  },
  {
    title: "5. Payments and Third-Party Services",
    points: [
      "If paid features are offered, pricing and billing terms will be shown before purchase.",
      "Third-party tools (hosting, analytics, payment providers, messaging) may have their own terms.",
    ],
  },
  {
    title: "6. Intellectual Property",
    points: [
      "CrickBro brand assets, software, and platform design are protected by applicable intellectual property laws.",
      "You may not copy, reverse engineer, or redistribute platform code or branded assets without authorization.",
    ],
  },
  {
    title: "7. Service Availability",
    points: [
      "We aim for reliable uptime but do not guarantee uninterrupted service.",
      "Maintenance, upgrades, network failures, or force majeure events may affect availability.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    points: [
      "To the maximum extent permitted by law, CrickBro is not liable for indirect or consequential losses.",
      "Platform use is at your own risk, and users should verify critical data during live events.",
    ],
  },
  {
    title: "9. Termination",
    points: [
      "You may stop using CrickBro at any time.",
      "We may restrict or terminate access for violations of these terms or harmful activity.",
    ],
  },
  {
    title: "10. Changes to Terms",
    points: [
      "We may update these Terms of Service from time to time.",
      "Continued use of the platform after updates means you accept the revised terms.",
    ],
  },
];

const TermsOfService = ({ theme, onToggleTheme }) => {
  return (
    <div className="site-shell">
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      <main>
        <section className="relative overflow-hidden border-b border-[var(--border-card)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,var(--accent-light),transparent_28%)]" />
          <div className="container relative grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_260px] lg:items-center">
            <div className="max-w-3xl">
              <span className="pill">Legal & usage</span>
              <h1 className="mt-5 font-heading text-[clamp(40px,6vw,68px)] font-bold uppercase leading-[0.95] tracking-[-0.035em] text-[var(--text-primary)]">
                Terms of
                <span className="gradient-text"> Service.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-[var(--text-secondary)] sm:text-base">
                The rules and responsibilities that guide your use of CrickBro auctions, teams,
                and tournament services.
              </p>
            </div>

            <div className="relative hidden min-h-40 items-center justify-center lg:flex">
              <div className="absolute h-40 w-40 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)]" />
              <div className="absolute h-28 w-28 rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]" />
              <Scale className="relative text-[var(--primary)]" size={52} strokeWidth={1.6} />
            </div>
          </div>

          <div className="border-t border-[var(--border-card)] bg-[var(--bg-soft)]">
            <div className="container flex flex-col gap-2 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
              <span>Effective March 30, 2026</span>
              <span>Last reviewed March 30, 2026</span>
            </div>
          </div>
        </section>

        <section className="container py-10 sm:py-14">
          <div className="mb-8 flex items-end justify-between gap-4 border-b border-[var(--border-card)] pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--primary)]">
                Service terms
              </span>
              <h2 className="mt-2 font-heading text-2xl font-black text-[var(--text-primary)] sm:text-3xl">
                Using CrickBro responsibly
              </h2>
            </div>
            <span className="hidden text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] sm:block">
              10 sections
            </span>
          </div>

          <div className="grid gap-x-12 gap-y-0 lg:grid-cols-2">
            {sections.map((section, index) => (
              <article
                key={section.title}
                className="group border-b border-[var(--border-card)] py-6 sm:py-7"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] text-xs font-black text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-black text-[var(--text-primary)] sm:text-xl">
                      {section.title.replace(/^\d+\.\s*/, "")}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {section.points.map((point) => (
                        <li
                          key={point}
                          className="relative pl-4 text-sm font-medium leading-6 text-[var(--text-secondary)]"
                        >
                          <span className="absolute left-0 top-[0.6rem] h-1 w-1 rounded-full bg-[var(--secondary)]" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--inverse-border)] bg-[image:var(--inverse-bg)] text-[var(--inverse-text)]">
          <div className="container flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--inverse-accent)] text-[var(--inverse-accent-text)]">
                <Mail size={19} />
              </span>
              <div>
                <h2 className="font-heading text-xl font-black text-[var(--inverse-text)] sm:text-2xl">
                  Have a terms or legal question?
                </h2>
                <p className="mt-1 text-sm font-medium text-[var(--inverse-muted)]">
                  Contact our team for clarification about using CrickBro services.
                </p>
              </div>
            </div>
            <a
              href="mailto:support@crickbro.com"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--inverse-border)] px-5 text-xs font-black uppercase text-[var(--inverse-text)] transition hover:border-[var(--inverse-accent)] hover:text-[var(--inverse-accent)]"
            >
              support@crickbro.com
              <ArrowUpRight size={16} />
            </a>
          </div>
        </section>

        <section className="container py-4">
          <div className="flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-[var(--text-muted)]">
            <FileCheck2 size={14} />
            <span>Using CrickBro means agreeing to these service terms.</span>
          </div>
        </section>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default TermsOfService;
