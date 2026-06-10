import { Quote, Sparkles, Star } from "lucide-react";

const reviews = [
  {
    initial: "R",
    name: "Rajesh Sharma",
    role: "Tournament Organizer",
    text: "Auction process 6 hours mein complete hua, full transparency ke saath.",
    highlight: "Fast setup",
  },
  {
    initial: "P",
    name: "Priya Patel",
    role: "Team Owner",
    text: "Live bidding smooth hai, budget tracking bahut helpful.",
    highlight: "Easy bidding",
  },
  {
    initial: "A",
    name: "Amit Kumar",
    role: "League Commissioner",
    text: "Multi-team manage karna easy hai, squad auto-generate se time bachta hai.",
    highlight: "Team control",
  },
  {
    initial: "S",
    name: "Sneha Reddy",
    role: "Player Manager",
    text: "200+ players categories aur auction manage karna bilkul seamless raha.",
    highlight: "Clean workflow",
  },
];

const Testimonals = () => {
  return (
    <section className="bg-[var(--bg-main)] px-4 py-14 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles size={14} />
              Testimonials
            </span>
            <h2 className="mt-3 font-heading text-3xl font-black leading-tight text-[var(--text-primary)] md:text-4xl">
              Trusted by cricket communities.
            </h2>
          </div>
          {/* <p className="max-w-md text-sm font-medium leading-6 text-[var(--text-secondary)]">
            Organizers, team owners, and player managers use CrickBro to run auctions with less pressure and more clarity.
          </p> */}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="group relative overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:border-[var(--border-primary)]"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--accent-light)] opacity-70 blur-2xl transition group-hover:opacity-100" />

              <div className="relative mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--border-primary)] bg-[var(--accent-light)] text-sm font-black text-[var(--primary)]">
                    {review.initial}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-[var(--text-primary)]">
                      {review.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                      {review.role}
                    </p>
                  </div>
                </div>
                <Quote size={18} className="shrink-0 text-[var(--primary)] opacity-70" />
              </div>

              <div className="relative mb-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-card)] bg-[var(--bg-main)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--primary)]">
                  <Star size={12} className="fill-current" />
                  5.0
                </span>
                <span className="truncate rounded-full bg-[var(--accent-light)] px-2.5 py-1 text-[10px] font-bold text-[var(--primary)]">
                  {review.highlight}
                </span>
              </div>

              <p className="relative min-h-[72px] text-sm font-medium leading-6 text-[var(--text-secondary)]">
                {review.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonals;
