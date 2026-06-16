import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Copy,
  Check,
  Eye,
  Monitor,
  LayoutDashboard,
  Layers,
  Disc,
  Columns,
  Presentation,
  ExternalLink,
  X,
  Link2,
} from "lucide-react";
import overlay1 from "../../../../../assets/overlay/bottom.png";
import overlay2 from "../../../../../assets/overlay/half.png";
import overlay3 from "../../../../../assets/overlay/led-bid.png";
import overlay4 from "../../../../../assets/overlay/led-status.png";
import overlay5 from "../../../../../assets/overlay/led-teampurse.png";
import overlay6 from "../../../../../assets/overlay/team-purse.png";
import overlay7 from "../../../../../assets/overlay/fortune-wheel.png";

const OVERLAY_LINKS = [
  {
    id: "overlayOne",
    label: "Live Bottom Overlay",
    description:
      "Live bottom strip with current player, latest bid, and key auction details.",
    icon: Monitor,
    accent: "cyan",
    path: `/auction-overlay-v1`,
    preview: overlay1,
  },
  {
    id: "overlayTwo",
    label: "Live Half Screen Overlay",
    description:
      "Live half-screen layout for side-by-side stream scenes and commentary view.",
    icon: LayoutDashboard,
    accent: "gold",
    path: `/auction-overlay-v2`,
    preview: overlay2,
  },
  {
    id: "overlayThree",
    label: "LED Full Screen",
    description:
      "LED full-screen bid overlay focused on player highlight and current bidding state.",
    icon: Layers,
    accent: "cyan",
    path: `/auction-overlay-v3`,
    preview: overlay3,
  },
  {
    id: "TeamsCards",
    label: "Team Purse Status",
    description:
      "Team purse board showing remaining budget and squad status in one compact view.",
    icon: Monitor,
    accent: "gold",
    path: `/teams-overlay`,
    preview: overlay6,
  },
  {
    id: "fortuneWheel",
    label: "Fortune Wheel",
    description: "Live random team picker wheel for toss-style on-stream moments.",
    icon: Disc,
    accent: "cyan",
    path: `/team-wheel`,
    preview: overlay7,
  },
  {
    id: "splitOverlay",
    label: "LED Player with Team Purse",
    description:
      "LED split overlay with player bidding on one side and team purse panel on the other.",
    icon: Columns,
    accent: "gold",
    path: `/auction-split-overlay`,
    preview: overlay5,
  },
  {
    id: "broadcastBoard",
    label: "LED Broadcast with Player Stats",
    description:
      "LED broadcast board with tournament header, player profile, and batting or bowling stats.",
    icon: Presentation,
    accent: "cyan",
    path: `/auction-broadcast-board`,
    preview: overlay4,
  },
];

const accentStyles = {
  cyan: {
    icon: "bg-[#00d4ff]/15 text-[#00d4ff] border-[#00d4ff]/35",
    ring: "group-hover:border-[#00d4ff]/45 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.12)]",
  },
  gold: {
    icon: "bg-[#ffb800]/15 text-[#ffb800] border-[#ffb800]/35",
    ring: "group-hover:border-[#ffb800]/45 group-hover:shadow-[0_0_20px_rgba(255,184,0,0.12)]",
  },
};

const Links = ({ auctionId, panelOnly = false }) => {
  const [copied, setCopied] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const auctionLinks = panelOnly
    ? [
        {
          id: "adminControl",
          label: "Auction panel",
          description: "Open the live auction control panel or copy the link to share.",
          icon: Monitor,
          accent: "gold",
          path: `/live-auction`,
          hasView: true,
        },
      ]
    : OVERLAY_LINKS;

  useEffect(() => {
    if (!previewImage) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [previewImage]);

  const buildPath = (link) => `${link.path}/${auctionId}`;

  const copyLink = async (link) => {
    const url = `${window.location.origin}${buildPath(link)}`;
    await navigator.clipboard.writeText(url);
    setCopied(link.id);
    setTimeout(() => setCopied(null), 1500);
  };

  const openLink = (link) => {
    window.open(buildPath(link), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="lp-builder overlay-links-page font-poppins text-white/90 w-full min-w-0 space-y-4">
      <div className="home-card p-4 sm:p-5 !transform-none hover:!transform-none border border-[#0066ff]/25">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-[#00d4ff]/15 border border-[#00d4ff]/35 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div className="min-w-0">
            <h2
              className="text-lg sm:text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {panelOnly ? "Auction panel" : "Live overlay links"}
            </h2>
            <p className="text-sm text-white/55 mt-1 leading-relaxed">
              {panelOnly
                ? "Open the control panel or copy the link for your auction operator."
                : "Copy or open OBS/browser source URLs for each broadcast overlay."}
            </p>
          </div>
        </div>
      </div>

      <div
        className={
          panelOnly
            ? "max-w-xl"
            : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4"
        }
      >
        {auctionLinks.map((link) => {
          const Icon = link.icon;
          const accent = accentStyles[link.accent] || accentStyles.cyan;

          return (
            <div
              key={link.id}
              className={`group home-card p-4 sm:p-5 flex flex-col gap-4 !transform-none hover:!translate-y-0 border border-[#1a2b45] transition-all duration-200 ${accent.ring}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center ${accent.icon}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white text-base leading-tight">
                    {link.label}
                  </h3>
                  <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                    {link.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1a2b45]/80">
                {link.preview && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(link.preview)}
                    className="reg-btn-ghost text-xs sm:text-sm px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Sample
                  </button>
                )}

                {(link.hasView || link.preview) && (
                  <button
                    type="button"
                    onClick={() => openLink(link)}
                    className="reg-btn-ghost text-xs sm:text-sm px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => copyLink(link)}
                  className={`text-xs sm:text-sm px-3 py-1.5 flex items-center gap-1.5 font-bold ml-auto ${
                    copied === link.id ? "reg-btn-ghost text-[#00d4ff]" : "reg-btn-gold"
                  }`}
                >
                  {copied === link.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy link
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {previewImage &&
        createPortal(
          <div
            className="player-details-overlay font-poppins !items-center p-4"
            onClick={(e) => e.target === e.currentTarget && setPreviewImage(null)}
            role="presentation"
          >
            <div
              className="relative z-10 w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="home-glass-dark rounded-2xl border border-[#0066ff]/35 overflow-hidden p-2 sm:p-3">
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full border border-[#1a2b45] bg-[#000d21]/90 text-white/70 hover:text-[#00d4ff] transition"
                  aria-label="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src={previewImage}
                  alt="Overlay preview"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Links;
