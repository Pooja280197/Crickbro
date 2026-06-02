const Footer = () => {
  return (
    <footer className="border-t border-[var(--border-soft)] bg-[var(--bg-deep)] pb-7 pt-16">
      <div className="container grid grid-cols-[1.35fr_0.7fr_0.95fr] gap-[90px] max-md:grid-cols-1 max-md:gap-9">
        <div>
          <a className="inline-flex items-center gap-3 font-bold text-[var(--text-primary)]" href="/">
            <img className="h-11 w-11 object-contain" src="/favicon.svg" alt="CrickBro" />
            <span>CrickBro</span>
          </a>
          <p className="text-[13px] leading-[1.6] text-[var(--text-secondary)]">Professional Auction Platform</p>
          <p className="text-[13px] leading-[1.6] text-[var(--text-secondary)]">
            Revolutionizing cricket auctions with intelligent technology.
            Trusted by leagues, teams, and players across India.
          </p>
          <div className="mt-5 flex gap-3">
            <span className="inline-flex min-h-8 items-center rounded-[5px] border border-[var(--border-soft)] bg-[#05080d] px-3 text-xs font-extrabold text-white">Google Play</span>
            <span className="inline-flex min-h-8 items-center rounded-[5px] border border-[var(--border-soft)] bg-[#05080d] px-3 text-xs font-extrabold text-white">App Store</span>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <h3 className="mb-2.5 text-base">Explore</h3>
          {["Home", "Auction", "About Us", "Enquiries", "Privacy Policy", "Terms of Service"].map((item) => (
            <a className="text-[13px] text-[var(--text-secondary)]" href="/" key={item}>{item}</a>
          ))}
        </div>

        <div>
          <p className="text-[13px] leading-[1.6] text-[var(--text-secondary)]"><span className="font-black text-[var(--secondary)]">@</span>Email<br />info@crickbro.com</p>
          <p className="text-[13px] leading-[1.6] text-[var(--text-secondary)]"><span className="font-black text-[var(--secondary)]">#</span>Phone<br />+91 7000742081</p>
          <p className="text-[13px] leading-[1.6] text-[var(--text-secondary)]"><span className="font-black text-[var(--secondary)]">*</span>Office<br />Indore, India</p>
        </div>
      </div>
      <div className="container mt-[54px] flex items-center justify-between border-t border-[var(--border-soft)] pt-6 text-[13px] max-md:flex-col max-md:items-start max-md:gap-[18px]">
        <strong>Follow us on social media</strong>
        <div className="flex gap-3.5">
          {["yt", "ig", "fb", "in", "web"].map((item) => (
            <a className="grid h-[30px] w-[30px] place-items-center rounded-full bg-white/10 text-[10px] font-black text-[var(--text-secondary)]" href="/" key={item} aria-label={item}>{item}</a>
          ))}
        </div>
      </div>
      <p className="mt-7 text-center text-[11px] text-[var(--text-secondary)]">(c) 2026 CrickBro. All rights reserved. Made for cricket lovers in India.</p>
    </footer>
  );
};

export default Footer;
