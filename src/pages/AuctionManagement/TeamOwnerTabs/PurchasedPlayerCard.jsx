import React from "react";

const PurchasedPlayerCard = ({ player }) => {
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(player?.player?.name);
  const image = player?.player?.logo;
  const role = player?.player?.playerRole || "Player";
  const finalPrice = player?.finalPrice || 0;

  const DUMMY_IMAGE =
    "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

  const showImage = image && image !== DUMMY_IMAGE;

  return (
    <div
      className="flex w-full max-w-[240px] items-center gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2 shadow-[var(--shadow-card)] transition hover:border-[var(--border-primary)]"
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)]">
        {showImage ? (
          <img
            src={image}
            alt={player?.player?.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-[var(--accent-light)] text-sm font-bold text-[var(--primary)]"
          >
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col leading-tight">
        <span className="max-w-[140px] truncate text-sm font-semibold text-[var(--text-primary)]">
          {player?.player?.name}
        </span>

        <span className="text-[10px] uppercase tracking-wide text-[var(--primary)]">
          {role}
        </span>

        <span className="text-xs font-bold text-green-400 mt-0.5">
          ₹{finalPrice.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default PurchasedPlayerCard;
