import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="cta-bg relative overflow-hidden py-[84px]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(920px,84vw)] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(8,186,247,0.9),rgba(255,196,0,0.76),transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(8,186,247,0.16),transparent_68%)] blur-2xl" />
      <div className="container relative text-center">
        <h2 className="mb-3 font-heading text-[clamp(30px,4vw,44px)] font-bold uppercase">
          Ready To Host Your <span className="gradient-text">Auction?</span>
        </h2>
        <p className="mb-6 text-base text-[var(--text-secondary)]">
          Join 500+ cricket leagues using CrickBro for professional auction
          management.
        </p>
        <Link
          className="ui-btn-secondary min-h-12 px-7 text-xs uppercase"
          to="/createAuction"
        >
          Create Your Own Auction 
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
