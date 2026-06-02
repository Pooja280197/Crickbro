import { useEffect, useState } from "react";

const auctionPlayers = [
  {
    name: "Shubham Agrawal",
    role: "Bowler",
    batch: "CBP0033",
    basePrice: "3k",
    currentBid: "7.5k",
    bidder: "City Warriors",
    team: "City Warriors",
    purse: "1.8L",
    winAmount: "88k",
  },
  {
    name: "Arjun Mehta",
    role: "All Rounder",
    batch: "CBP0148",
    basePrice: "5k",
    currentBid: "12k",
    bidder: "Royal Strikers",
    team: "Royal Strikers",
    purse: "2.4L",
    winAmount: "1.02L",
  },
  {
    name: "Rohit Verma",
    role: "Batsman",
    batch: "CBP0211",
    basePrice: "4k",
    currentBid: "9.5k",
    bidder: "Blue Blazers",
    team: "Blue Blazers",
    purse: "1.6L",
    winAmount: "94k",
  },
  {
    name: "Kunal Sharma",
    role: "Wicket Keeper",
    batch: "CBP0307",
    basePrice: "6k",
    currentBid: "15k",
    bidder: "Indore Titans",
    team: "Indore Titans",
    purse: "2.1L",
    winAmount: "1.15L",
  },
  {
    name: "Aman Khan",
    role: "Fast Bowler",
    batch: "CBP0442",
    basePrice: "4k",
    currentBid: "11k",
    bidder: "Kashi Kings",
    team: "Kashi Kings",
    purse: "1.9L",
    winAmount: "99k",
  },
];

const AUCTION_SLIDE_MS = 4000;

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePlayer = auctionPlayers[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % auctionPlayers.length);
    }, AUCTION_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero-bg relative min-h-[575px] pb-[82px] pt-[142px] max-md:min-h-0 max-md:pb-14 max-md:pt-[116px]">
      <div className="container relative z-[1] grid grid-cols-[minmax(0,1fr)_520px] items-center gap-[90px] max-lg:grid-cols-1 max-lg:gap-10">
        <div>
          <span className="pill">The future of cricket auctions</span>
          <h1 className="my-[22px] max-w-[680px] font-heading text-[clamp(45px,4.4vw,58px)] font-bold uppercase leading-[0.98] max-md:text-[clamp(38px,12vw,56px)]">
            From Auction To <span className="gradient-text">Live Scorecards</span>
          </h1>
          <p className="max-w-[560px] text-base leading-[1.65] text-[var(--text-secondary)]">
            Run live bidding, manage budgets, and build balanced squads - then
            move directly into CrickBro scoring, fixtures and leaderboards.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a className="btn btn-primary" href="/">
              Create Auction <span>+</span>
            </a>
            <a className="btn btn-ghost" href="/">
              Explore Auctions
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-[22px] shadow-[var(--shadow-card)] max-lg:max-w-[620px]" aria-label="Live auction preview">
          <div className="flex flex-col gap-2 border-b border-[var(--border-soft)] pb-[22px]">
            <strong className="text-sm">CrickBro Mega Auction</strong>
            <span className="text-[10px] font-black uppercase text-[var(--danger)]">Live Auction</span>
          </div>
          <div key={activeIndex} className="grid grid-cols-[1fr_250px] gap-8 py-[26px] pb-5 [animation:auctionSlideIn_450ms_ease-out] max-md:grid-cols-1">
            <div>
              <h3 className="mb-2.5 mt-0 text-[23px] font-bold">{activePlayer.name}</h3>
              <span className="inline-flex rounded bg-[var(--primary-strong)] px-2 py-1 text-[10px] font-black uppercase text-white">{activePlayer.role}</span>
              <p className="my-2 text-xs text-[var(--text-secondary)]">Batch {activePlayer.batch}</p>
              <p className="my-2 text-xs text-[var(--text-secondary)]">Base Price</p>
              <strong className="text-[34px] leading-none text-[var(--success)]">{activePlayer.basePrice}</strong>
            </div>
            <div className="rounded-lg border border-[var(--border-soft)] p-4">
              <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">Current Bid</span>
              <strong className="block text-[32px] text-[var(--primary)]">{activePlayer.currentBid}</strong>
              <p className="my-2 text-xs text-[var(--text-secondary)]">Highest bidder: {activePlayer.bidder}</p>
              <p className="my-2 text-xs text-[var(--text-secondary)]">Last Selected Team: {activePlayer.team}</p>
              <p className="my-2 text-xs text-[var(--text-secondary)]">Remaining Purse: {activePlayer.purse}</p>
              <p className="my-2 text-xs text-[var(--text-secondary)]">If Win: {activePlayer.winAmount}</p>
            </div>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/15">
            <span
              key={activeIndex}
              className="block h-full bg-[var(--primary)] [animation:auctionProgress_4s_linear_forwards]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
