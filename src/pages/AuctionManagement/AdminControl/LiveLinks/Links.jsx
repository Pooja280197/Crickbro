import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  Check,
  Eye,
  Settings,
  Monitor,
  LayoutDashboard,
  Layers,
  Disc,
  Columns,
} from "lucide-react";
import overlay1 from "../../../../assets/Images/overlay1.png";
import overlay2 from "../../../../assets/Images/overlay2.png";
import overlay3 from "../../../../assets/Images/overlay3.png";

const Links = ({ auctionId }) => {

  const [copied, setCopied] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const auctionLinks = [
    {
      id: "adminControl",
      label: "Live Auction",
      description: "Manage and control the live auction in real-time",
      icon: Settings,
      path: `/live-auction/${auctionId}`,
    },
    {
      id: "overlayOne",
      label: "Bottom Overlay",
      description:
        "Displays current player, bids, and details in a bottom bar layout",
      icon: Monitor,
      path: `/auction-overlay-v1/${auctionId}`,
      preview: overlay1,
    },
    {
      id: "overlayTwo",
      label: "Half Screen",
      description: "Compact half-screen view for live auction display",
      icon: LayoutDashboard,
      path: `/auction-overlay-v2/${auctionId}`,
      preview: overlay2,
    },
    {
      id: "overlayThree",
      label: "Full Screen",
      description: "Full-screen broadcast view with complete auction details",
      icon: Layers,
      path: `/auction-overlay-v3/${auctionId}`,
      preview: overlay3,
    },
    {
      id: "TeamsCards",
      label: "Team Purse Status",
      description: "View team budgets, remaining purse, and player count",
      icon: Monitor,
      path: `/teams-overlay/${auctionId}`,
    },
    {
      id: "fortuneWheel",
      label: "Fortune Wheel",
      description: "Spin the wheel to randomly select a team",
      icon: Disc,
      path: `/team-wheel/${auctionId}`,
    },
    {
      id: "splitOverlay",
      label: "Player + Team Purse",
      description: "Split view with current player bid and team budgets with color indicators",
      icon: Columns,
      path: `/auction-split-overlay/${auctionId}`,
    },
  ];

  const copyLink = async (link) => {
    const url = `${window.location.origin}${link.path}`;
    await navigator.clipboard.writeText(url);
    setCopied(link.id);

    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className=" mx-auto rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--secondary)] p-6 text-[var(--text-dark)]">
        <h2 className="text-2xl font-bold text-[var(--text)]">
          Live Auction Center
        </h2>
        <p className="text-sm text-white/80 mt-2">
          Manage live auction and share overlay links with organizers.
        </p>
      </div>

      {/* Links */}
      <div className="bg-[var(--background)] p-6 space-y-3">
        {auctionLinks.map((link) => {
          const Icon = link.icon;
          const showViewButton =
            link.id === "adminControl" || link.id === "TeamsCards" || link.id === "fortuneWheel" || link.id === "splitOverlay";

          return (
            <div
              key={link.id}
              className="group flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-[var(--primary)] hover:bg-white/5 transition-all"
            >
              {/* Left */}
              <div
                onClick={() => window.open(link.path, "_blank")}
                className="flex items-center gap-4 cursor-pointer"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Icon size={20} />
                </div>

                <div>
                  <p className="font-semibold text-[var(--secondary-dark)]">
                    {link.label}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{link.description}</p>
                </div>
              </div>
              <div className="flex flex-row items-center gap-2">
              {link.preview && (
                <button
                  onClick={() => setPreviewImage(link.preview)}
                  className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-white/10 hover:border-blue-400 hover:text-blue-400 transition"
                >
                  👁 Sample View
                </button>
              )}

              {showViewButton && (
                <button
                  onClick={() => window.open(link.path, "_blank")}
                  className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-white/10 hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
                >
                  <Eye size={16} />
                  View
                </button>
              )}

              {/* Copy button */}
              <button
                onClick={() => copyLink(link)}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-white/10 hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
              >
                {copied === link.id ? (
                  <>
                    <Check size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accent */}
      <div className="h-1 bg-[var(--accent)]"></div>
      {previewImage && (
        <div className="fixed top-10 inset-0 bg-black/80 z-50 flex items-center justify-center">
          {/* Close on background click */}
          <div
            className="absolute inset-0"
            onClick={() => setPreviewImage(null)}
          />

          {/* Image */}
          <div className="relative z-10 max-w-6xl w-full p-4">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto rounded-xl shadow-2xl"
            />

            {/* Close Button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-[var(--bg-card)] text-[var(--text-primary)] px-3 py-1 rounded-md"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Links;
