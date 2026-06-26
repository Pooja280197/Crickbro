import { useState } from "react";
import { Check, Eye, Trash2 } from "lucide-react";

const DUMMY_IMAGE_URL =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

const getInitials = (name = "") =>
  String(name)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "P";

const avatarGradients = [
  "from-violet-500 to-purple-600",
  "from-sky-400 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-orange-500 to-red-500",
  "from-emerald-400 to-teal-600",
  "from-indigo-500 to-violet-600",
];

const getAvatarGradient = (name = "") => {
  const hash = String(name)
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return avatarGradients[hash % avatarGradients.length];
};

const isDummyImage = (logoUrl) => logoUrl === DUMMY_IMAGE_URL;

const formatRoleLabel = (role) => {
  if (!role) return "";
  return String(role)
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

export default function PlayerCard({
  player,
  selected,
  selectable,
  showDelete,
  onSelect,
  onDelete,
  onViewDetails,
}) {
  const [imageError, setImageError] = useState(false);
  const playerName = player?.player?.name || "Unknown";
  const playerLogo = player?.player?.profilePicture || DUMMY_IMAGE_URL;
  const isPlaceholder = isDummyImage(playerLogo);
  const initials = getInitials(playerName);
  const displayRole = formatRoleLabel(
    player?.player?.playerRole ||
      player?.playerRole ||
      player?.playersRatings?.playerType,
  );

  return (
    <div
      onClick={() => {
        if (selectable) onSelect?.();
      }}
      className={`group relative flex min-h-[136px] w-full flex-col items-center gap-1.5 overflow-hidden rounded-lg border p-1.5 shadow-[var(--shadow-card)] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-[var(--primary)] before:via-[var(--secondary)] before:to-transparent hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(0,187,255,0.14)] ${
        selected
          ? "border-[var(--border-primary)] bg-[linear-gradient(180deg,rgba(0,187,255,0.12),rgba(3,17,34,0.96))] ring-2 ring-[var(--primary)]/20"
          : "border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--border-primary)]"
      } ${selectable ? "cursor-pointer" : ""}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[var(--primary)]/10 blur-2xl opacity-0 transition group-hover:opacity-100" />
      <div className="pointer-events-none absolute -bottom-12 left-1/2 h-20 w-28 -translate-x-1/2 rounded-full bg-[var(--secondary)]/10 blur-2xl opacity-0 transition group-hover:opacity-100" />

      {selectable && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.();
          }}
          className={`absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-lg border text-[10px] shadow-sm transition ${
            selected
              ? "border-[var(--secondary)] bg-[var(--secondary)] text-[#102033]"
              : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--border-primary)] hover:text-[var(--primary)]"
          }`}
          aria-label={selected ? "Deselect player" : "Select player"}
        >
          {selected ? <Check className="h-3.5 w-3.5" /> : null}
        </button>
      )}

      {showDelete && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
          className="absolute left-2 top-2 z-20 hidden h-7 w-7 items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 shadow-sm transition hover:border-red-400 hover:bg-red-500/20 hover:text-red-200 group-hover:flex"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      )}

      <div className="relative z-10">
        <div
          className={`flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border transition-all ${
            selected
              ? "border-emerald-500 bg-[var(--bg-card)] ring-2 ring-emerald-400"
              : "border-[var(--border-card)] bg-[var(--bg-main)] group-hover:border-[var(--border-primary)]"
          }`}
        >
          {isPlaceholder || imageError ? (
            <div
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-xl font-extrabold text-white ${getAvatarGradient(playerName)}`}
            >
              {initials}
            </div>
          ) : (
            <img
              src={playerLogo}
              className="block h-full w-full object-cover"
              alt={playerName}
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {displayRole && (
          <span className="absolute bottom-1 left-1 max-w-[calc(100%-0.5rem)] truncate rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[9px] font-bold leading-3 text-[#102033] shadow-[0_0_16px_rgba(255,190,0,0.25)]">
            {displayRole}
          </span>
        )}
      </div>

      <div className="relative z-10 min-w-0 max-w-full text-center">
        <p className="w-full truncate text-[11px] font-semibold leading-4 text-[var(--text-primary)]">
          {playerName}
        </p>
        {player?.player?.batchId && (
          <p className="truncate text-[10px] leading-3 text-[var(--text-secondary)]">
            {player.player.batchId}
          </p>
        )}
      </div>

      {onViewDetails && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onViewDetails();
            }}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-card)] text-[var(--primary)] shadow transition hover:bg-[var(--accent-light)]"
            title="View player details"
          >
            <Eye size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
