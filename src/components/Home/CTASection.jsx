import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="cta-bg py-[84px]">
      <div className="container text-center">
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
