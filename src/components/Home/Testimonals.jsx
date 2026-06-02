import SectionHeading from "../SectionHeading";

const reviews = [
  ["R", "Rajesh Sharma", "Tournament Organizer", "Auction process 6 hours mein - full transparency ke saath."],
  ["P", "Priya Patel", "Team Owner", "Live bidding smooth hai, budget tracking bahut helpful."],
  ["A", "Amit Kumar", "League Commissioner", "Multi-team manage karna easy, squad auto-generate time bachata hai."],
  ["S", "Sneha Reddy", "Player Manager", "200+ players categories aur auction - bilkul seamless."],
];

const Testimonals = () => {
  return (
    <section className="bg-[var(--bg-deep)] py-[72px] pb-40 max-md:pb-[72px]">
      <div className="container">
        <SectionHeading
          eyebrow="Testimonials"
          title="Trusted by Cricket"
          accent="Communities"
          text="Organizers, team owners & players - CrickBro Auction par unki baat"
        />
        <div className="grid grid-cols-4 gap-[18px] max-lg:grid-cols-2 max-md:grid-cols-1">
          {reviews.map(([initial, name, role, text]) => (
            <article className="card-surface min-h-[150px] rounded-lg p-[18px]" key={name}>
              <div className="mb-3.5 flex items-center gap-3">
                <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[var(--primary-strong)] text-xs font-black">{initial}</span>
                <div>
                  <h3 className="m-0 text-[13px] font-bold">{name}</h3>
                  <p className="m-0 text-xs leading-[1.45] text-[var(--primary)]">{role}</p>
                </div>
              </div>
              <div className="mb-2.5 text-xs font-black text-[var(--secondary)]">5.0 / 5</div>
              <p className="m-0 text-xs leading-[1.45] text-[var(--text-secondary)]">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonals;
