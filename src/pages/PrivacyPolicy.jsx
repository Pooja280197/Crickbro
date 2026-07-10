import React from "react";
import { ArrowUpRight, Mail, ShieldCheck } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const sections = [
  {
    title: "1. Information We Collect",
    points: [
      "Account details such as name, mobile number, email address, and profile information.",
      "Auction and tournament data you create or manage, including team, player, and bid records.",
      "Technical data such as device type, browser, IP address, and app usage logs for security and performance.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    points: [
      "To provide and operate auction, scoring, and tournament features.",
      "To authenticate users, prevent fraud, and maintain platform security.",
      "To send service updates, support responses, and important account notifications.",
      "To improve platform performance, reliability, and user experience.",
    ],
  },
  {
    title: "3. Sharing of Information",
    points: [
      "We do not sell your personal information.",
      "Data may be shared with trusted service providers strictly for hosting, communication, analytics, or support purposes.",
      "Information may be disclosed if required by law, legal process, or to protect rights and platform safety.",
    ],
  },
  {
    title: "4. Data Retention",
    points: [
      "We retain data while your account is active or as needed to provide services.",
      "Certain records may be retained longer to meet legal, accounting, and dispute-resolution obligations.",
    ],
  },
  {
    title: "5. Security",
    points: [
      "We apply reasonable technical and organizational safeguards to protect your information.",
      "No internet-based system is fully secure; users should protect credentials and report suspicious activity immediately.",
    ],
  },
  {
    title: "6. Your Rights and Choices",
    points: [
      "You may request access, correction, or deletion of account data subject to legal limitations.",
      "You may contact us to update profile information or close your account.",
    ],
  },
  {
    title: "7. Children's Privacy",
    points: [
      "CrickBro services are not intended for children under 13 without parental or guardian consent.",
      "If we become aware of unauthorized child data, we will take steps to remove it.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    points: [
      "We may update this Privacy Policy from time to time.",
      "Any significant changes will be reflected on this page with an updated effective date.",
    ],
  },
];

const PrivacyPolicy = ({ theme, onToggleTheme }) => {
  return (
    <div className="site-shell">
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      <main>
        <section className="relative overflow-hidden border-b border-[var(--border-card)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,var(--accent-light),transparent_28%)]" />
          <div className="container relative grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_260px] lg:items-center">
            <div className="max-w-3xl">
              <span className="pill">Legal & privacy</span>
              <h1 className="mt-5 font-heading text-[clamp(40px,6vw,68px)] font-bold uppercase leading-[0.95] tracking-[-0.035em] text-[var(--text-primary)]">
                Privacy
                <span className="gradient-text"> Policy.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-[var(--text-secondary)] sm:text-base">
                A clear overview of how CrickBro collects, uses, protects, and manages your
                information across our services.
              </p>
            </div>

            <div className="relative hidden min-h-40 items-center justify-center lg:flex">
              <div className="absolute h-40 w-40 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)]" />
              <div className="absolute h-28 w-28 rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]" />
              <ShieldCheck className="relative text-[var(--primary)]" size={52} strokeWidth={1.6} />
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
                Privacy details
              </span>
              <h2 className="mt-2 font-heading text-2xl font-black text-[var(--text-primary)] sm:text-3xl">
                How we handle your information
              </h2>
            </div>
            <span className="hidden text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] sm:block">
              8 sections
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
                  Have a privacy question?
                </h2>
                <p className="mt-1 text-sm font-medium text-[var(--inverse-muted)]">
                  Request access, correction, or deletion of your account data.
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
            <ShieldCheck size={14} />
            <span>CrickBro is committed to transparent and responsible data practices.</span>
          </div>
        </section>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default PrivacyPolicy;
