import SectionHeading from "../SectionHeading";

const steps = [
  ["Step 01", "Create Tournament", "Set up teams, budgets & categories"],
  ["Step 02", "Register Players", "Upload database or team registration"],
  ["Step 03", "Live Auction Day", "Real-time bidding interface"],
  ["Step 04", "Squad & Fixtures", "Auto-generate fixtures & scoring"],
];

const HowItWorks = () => {
  return (
    <section className="process-bg py-[72px] pb-[74px]">
      <div className="container">
        <SectionHeading
          eyebrow="Simple Process"
          title="How It"
          accent="Works"
          text="Four simple steps - tournament se live auction tak, minutes mein ready"
        />
        <div className="mt-[42px] grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {steps.map(([step, title, text], index) => (
            <article className="card-surface relative min-h-[190px] rounded-lg px-[22px] py-7 text-center" key={step}>
              <span className="inline-flex min-h-[22px] items-center justify-center rounded-full bg-[var(--secondary)] px-3 text-[9px] font-black uppercase text-[#071525]">{step}</span>
              <span className={`line-icon mx-auto mb-4 mt-[18px] icon-${index}`} />
              <h3 className="mb-2.5 text-[15px] font-bold">{title}</h3>
              <p className="m-0 text-xs leading-[1.45] text-[var(--text-secondary)]">{text}</p>
            </article>
          ))}
        </div>
        <a className="btn btn-primary mx-auto mt-[34px]" href="/">
          Start Creating Your Auction <span>+</span>
        </a>
      </div>
    </section>
  );
};

export default HowItWorks;
