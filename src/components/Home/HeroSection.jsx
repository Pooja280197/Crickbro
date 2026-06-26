import { useEffect, useState } from "react";
import profileIcon from "../../assets/Images/profile-icon.jpg";
import { Link, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % auctionPlayers.length);
    }, AUCTION_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, []);



  return (
    <section className="hero-bg relative min-h-[575px] overflow-hidden pb-[82px] pt-[142px] max-md:min-h-0 max-md:pb-14 max-md:pt-[116px]">
      <div className="pointer-events-none absolute left-[-120px] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(8,186,247,0.22),transparent_68%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[-90px] top-40 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,196,0,0.13),transparent_66%)] blur-2xl" />
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
            <Link
              className="ui-btn-secondary min-h-12 px-7 text-xs uppercase"
              to="/createAuction"
            >
              Create Auction
            </Link>
            <Link className="ui-btn-ghost min-h-12 px-7 text-xs uppercase" 
            to="/auction">
              Explore Auctions
            </Link>
          </div>
        </div>

        <div
          className="relative max-lg:max-w-[620px] overflow-hidden rounded-[18px] border border-[rgba(8,186,247,0.38)] bg-[var(--hero-bid-bg)] p-4 shadow-[0_26px_58px_rgba(0,0,0,0.34),0_0_34px_rgba(8,186,247,0.18)] before:pointer-events-none before:absolute before:inset-0 before:bg-[var(--hero-card-glow)] before:content-[''] after:pointer-events-none after:absolute after:inset-x-5 after:top-0 after:h-px after:bg-[linear-gradient(90deg,transparent,rgba(8,186,247,0.95),rgba(255,196,0,0.8),transparent)] after:content-[''] max-md:rounded-[14px] max-md:p-3"
          aria-label="Live auction preview"
        >
          <div className="relative z-[1] flex items-center justify-between gap-4 pb-3">
            <div>
              <strong className="block text-sm font-black text-[var(--text-primary)]">CrickBro Mega Auction</strong>
              <span className="mt-0.5 block text-[11px] font-bold text-[var(--text-secondary)]">Player on the block</span>
            </div>
            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-[var(--danger)] px-3 text-[10px] font-black uppercase text-white shadow-[0_8px_18px_rgba(220,53,69,0.26)] before:h-[7px] before:w-[7px] before:rounded-full before:bg-current before:content-[''] before:[animation:hotAuctionPulse_1.2s_ease-in-out_infinite]">
              Live
            </span>
          </div>

          <div key={activeIndex} className="relative z-[1] block [animation:auctionSlideIn_450ms_ease-out] ">
            <div className="flex items-center gap-3.5 max-md:items-start">
              <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-2xl border border-[rgba(255,196,0,0.34)] bg-[image:var(--hero-photo-bg)] shadow-[0_14px_28px_rgba(16,32,51,0.18),0_0_22px_rgba(255,196,0,0.12)] after:absolute after:bottom-0 after:left-[18px] after:right-[18px] after:h-11 after:rounded-t-full after:bg-[rgba(16,32,51,0.09)] after:blur-[10px] after:content-[''] max-md:w-[92px]">
                <img className="relative z-[1] h-full w-full object-cover object-center" src={profileIcon} alt={activePlayer.name} />
                <span className="absolute bottom-3 left-3 z-[2] rounded-full bg-[var(--secondary)] px-2.5 py-1 text-[9px] font-black text-[#102033]">{activePlayer.batch}</span>
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="w-fit rounded-full bg-[var(--primary-strong)] px-2.5 py-1.5 text-[10px] font-black uppercase text-white">{activePlayer.role}</span>
                <h3 className="mb-0 mt-2.5 font-heading text-[clamp(22px,2.2vw,28px)] font-black leading-none text-[var(--text-primary)]">{activePlayer.name}</h3>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[rgba(8,186,247,0.28)] bg-[var(--hero-bid-bg)] p-2.5 shadow-[0_8px_18px_rgba(16,32,51,0.12),0_0_18px_rgba(8,186,247,0.08)]">
                <span className="block text-[10px] font-black uppercase text-[var(--text-muted)]">Base Price</span>
                <strong className="mt-1 block text-2xl font-black leading-none text-[var(--success)]">{activePlayer.basePrice}</strong>
              </div>
              <div className="rounded-xl border border-[rgba(8,186,247,0.28)] bg-[var(--hero-bid-bg)] p-2.5 shadow-[0_8px_18px_rgba(16,32,51,0.12),0_0_18px_rgba(8,186,247,0.08)]">
                <span className="block text-[10px] font-black uppercase text-[var(--text-muted)]">Current Bid</span>
                <strong className="mt-1 block text-2xl font-black leading-none text-[var(--primary)]">{activePlayer.currentBid}</strong>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-[7px]">
              <p className="m-0 rounded-[10px] border border-[var(--border-card)] bg-[var(--hero-detail-bg)] px-2.5 py-2">
                <span className="block text-[10px] font-black uppercase text-[var(--text-muted)]">Highest bidder</span>
                <strong className="mt-1 block truncate text-xs font-black text-[var(--text-primary)]">{activePlayer.bidder}</strong>
              </p>
              <p className="m-0 rounded-[10px] border border-[var(--border-card)] bg-[var(--hero-detail-bg)] px-2.5 py-2">
                <span className="block text-[10px] font-black uppercase text-[var(--text-muted)]">Last selected</span>
                <strong className="mt-1 block truncate text-xs font-black text-[var(--text-primary)]">{activePlayer.team}</strong>
              </p>
              <p className="m-0 rounded-[10px] border border-[var(--border-card)] bg-[var(--hero-detail-bg)] px-2.5 py-2">
                <span className="block text-[10px] font-black uppercase text-[var(--text-muted)]">Remaining purse</span>
                <strong className="mt-1 block truncate text-xs font-black text-[var(--text-primary)]">{activePlayer.purse}</strong>
              </p>
              <p className="m-0 rounded-[10px] border border-[var(--border-card)] bg-[var(--hero-detail-bg)] px-2.5 py-2">
                <span className="block text-[10px] font-black uppercase text-[var(--text-muted)]">If win</span>
                <strong className="mt-1 block truncate text-xs font-black text-[var(--text-primary)]">{activePlayer.winAmount}</strong>
              </p>
            </div>
          </div>
          <div className="relative z-[1] mt-3 h-[5px] overflow-hidden rounded-full bg-[var(--hero-detail-bg)]">
            <span
              key={activeIndex}
              className="block h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] [animation:auctionProgress_4s_linear_forwards]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
