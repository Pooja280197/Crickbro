import { Check, Eye, Trash2, UserRound } from "lucide-react";

const DUMMY_IMAGE_URL =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

const getInitials = (name = "") =>
  String(name)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "P";

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
  isTrialType,
}) {
  const playerName = player?.player?.name || "Unknown";
  const playerLogo = player?.player?.profilePicture || DUMMY_IMAGE_URL;
  const isPlaceholder = isDummyImage(playerLogo);
  const initials = getInitials(playerName);
  const displayRole = formatRoleLabel(
    player?.player?.playerRole ||
      player?.playerRole ||
      player?.playersRatings?.playerType,
  );
  const ratingLabel = player?.directSelected
    ? player?.directSelectedGrade || "N/A"
    : (player?.playersRatings?.avgRating || 0).toFixed(2);

  return (
    <div
      className={`group relative min-h-[154px] w-full overflow-hidden rounded-lg border p-2.5 shadow-[0_8px_22px_rgba(16,32,51,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(16,32,51,0.14)] ${
        selected
          ? "border-[var(--border-primary)] bg-[var(--accent-light)] ring-2 ring-[var(--primary)]/20"
          : "border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--border-primary)]"
      }`}
    >
      {selectable && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.();
          }}
          className={`absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-lg border text-[10px] shadow-sm transition ${
            selected
              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
              : "border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-primary)] hover:text-[var(--primary)]"
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
          className="absolute left-2 top-2 z-20 hidden h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-[var(--bg-card)] text-red-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 group-hover:flex"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      )}

      <div
        onClick={(event) => {
          event.stopPropagation();
          if (selectable) onSelect?.();
        }}
        className={`relative mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border ${
          selected
            ? "border-[var(--primary)] bg-[var(--bg-card)]"
            : "border-[var(--border-card)] bg-[var(--bg-main)] group-hover:border-[var(--border-primary)]"
        } ${selectable ? "cursor-pointer" : ""}`}
      >
        {isPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center bg-[var(--accent-light)] text-base font-bold text-[var(--primary)]">
            {initials || <UserRound size={18} />}
          </div>
        ) : (
          <img
            src={playerLogo}
            className="block h-full w-full object-cover"
            alt={playerName}
          />
        )}

        {isTrialType && (
          <span className="absolute left-1 top-1 rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[9px] font-bold leading-3 text-[#102033] shadow-sm">
            {ratingLabel}
          </span>
        )}
      </div>

      <div className="mt-2 min-w-0 text-center">
        <p className="truncate text-xs font-semibold leading-4 text-[var(--text-primary)]">
          {playerName}
        </p>
        {player?.player?.batchId && (
          <p className="mt-0.5 truncate text-[10px] font-medium text-[var(--text-secondary)]">
            {player.player.batchId}
          </p>
        )}
      </div>

      <div className="mt-2 flex min-h-[22px] items-center justify-center">
        {displayRole ? (
          <span className="max-w-full truncate rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2 py-1 text-[10px] font-bold text-[var(--primary)]">
            {displayRole}
          </span>
        ) : (
          <span className="text-[10px] font-medium text-[var(--text-muted)]">
            Role not set
          </span>
        )}
      </div>

      {isTrialType && (
        <div className="mt-2 space-y-0.5 text-center text-[10px] font-medium text-[var(--text-secondary)]">
          <p className="truncate">{player?.session?.name || "Session"}</p>
          <p className="truncate text-[var(--text-muted)]">
            {player?.slot?.slotName || "Slot"}
          </p>
        </div>
      )}

      {onViewDetails && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onViewDetails();
            }}
            className="pointer-events-auto inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--secondary)] px-3 text-xs font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)]"
          >
            <Eye size={14} />
            View
          </button>
        </div>
      )}
    </div>
  );
}
