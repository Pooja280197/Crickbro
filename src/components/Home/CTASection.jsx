const CTASection = () => {
  return (
    <section className="cta-bg py-[84px]">
      <div className="container text-center">
        <h2 className="mb-3 font-heading text-[clamp(30px,4vw,44px)] font-bold uppercase">
          Ready To Host Your <span className="gradient-text">Auction?</span>
        </h2>
        <p className="mb-6 text-base text-[var(--text-secondary)]">Join 500+ cricket leagues using CrickBro for professional auction management.</p>
        <a className="btn btn-primary" href="/">
          Create Your Auction Now <span>+</span>
        </a>
      </div>
    </section>
  );
};

export default CTASection;
