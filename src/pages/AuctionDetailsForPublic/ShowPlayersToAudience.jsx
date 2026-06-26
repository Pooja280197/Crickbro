import { Trash2, Eye } from "lucide-react";

const DUMMY_IMAGE_URL =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

// Color gradients for initials
const gradients = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-rose-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-blue-500",
  "from-violet-500 to-purple-500",
  "from-fuchsia-500 to-pink-500",
  "from-cyan-500 to-blue-500",
];

const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

const getGradientByName = (name) => {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

const isDummyImage = (logoUrl) => {
  return logoUrl === DUMMY_IMAGE_URL;
};

const getPositiveAmount = (value) => {
  const amount = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

export default function ShowPlayersToAudience({
  player,
  selected,
  selectable,
  showDelete,
  onSelect,
  onDelete,
  isTrialType,
}) {
 

  const playerName = player?.player?.name || "Unknown";
  const playerLogo = player?.player?.profilePicture || DUMMY_IMAGE_URL;
  const isPlaceholder = isDummyImage(playerLogo);
  const initials = getInitials(playerName);
  const gradientClass = getGradientByName(playerName);
  const basePrice = getPositiveAmount(player?.basePrice);

  return (
    <div
      className="group relative flex max-w-full items-start gap-4 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 font-main shadow-[var(--shadow-card)] transition-all hover:border-[var(--border-primary)]"
      style={{ minWidth: 0 }}
    >
      {/* LEFT: square avatar (clickable) */}
      <div
        onClick={onSelect}
        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center
      ${selected ? "ring-4 ring-[var(--primary)] scale-105" : "ring-2 ring-[var(--border-card)]"}
      ${selectable ? "cursor-pointer hover:ring-[var(--border-primary)]" : ""}`}
      >
        {isPlaceholder ? (
          <div
            className="flex h-full w-full items-center justify-center bg-[var(--accent-light)]"
          >
            <span className="font-heading text-xl font-bold leading-none text-[var(--primary)]">
              {initials}
            </span>
          </div>
        ) : (
          <img
            src={playerLogo}
            className="block w-full h-full object-cover"
            alt={playerName}
          />
        )}

        {isTrialType && (
          <span className="absolute left-1 top-1 rounded bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)] shadow-sm">
            ⭐ {(player?.playersRatings?.avgRating || 0).toFixed(2)}
          </span>
        )}

        {player?.playersRatings?.playerType && (
          <span className="absolute bottom-1 right-1 rounded bg-[var(--bg-card)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--text-primary)] shadow-sm">
            {player?.playersRatings?.playerType.slice(0, 10).toUpperCase()}
          </span>
        )}
      </div>

      {/* RIGHT: details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          {showDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete();
              }}
              className="z-10 ml-2 hidden items-center justify-center rounded-full bg-[var(--primary)] p-1 text-white transition-colors hover:bg-[var(--primary-dark)] group-hover:flex"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className=" flex items-center gap-2">
          <p className="line-clamp-2 min-w-0 break-words font-heading text-sm font-bold leading-tight text-[var(--text-primary)]">
            {playerName}
          </p>
        </div>
        {player?.player?.batchId && (
          <div className="mt-1 truncate text-[11px] font-semibold text-[var(--primary)]">
            Batch ID-{player.player.batchId}
          </div>
        )}
        {basePrice > 0 && (
          <div className="mt-1 truncate text-[11px] text-[var(--text-secondary)]">
            Base Price -₹{basePrice.toLocaleString("en-IN")}
          </div>
        )}

        {/* Slot / Session lines */}
      
      </div>
    </div>
  );
}
