import { X, Trophy, User, MapPin, Phone, Mail, Calendar } from "lucide-react";
import { createPortal } from "react-dom";

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

const getGradientByName = (name = "") => {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

const formatRoleLabel = (role) => {
  if (!role) return "";
  return String(role)
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const COLOR_TONE = {
  blue: { bg: "bg-[rgba(0,187,255,0.12)]", text: "text-[var(--primary)]" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-300" },
  orange: { bg: "bg-[rgba(255,190,0,0.14)]", text: "text-[var(--secondary)]" },
  red: { bg: "bg-red-500/10", text: "text-red-300" },
  purple: { bg: "bg-violet-500/10", text: "text-violet-300" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-300" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-300" },
};

export default function PlayerDetailsPopup({
  isOpen,
  onClose,
  player,
  isTrialType,
  onDelete,
  activeSubTab,
}) {
  if (!isOpen || !player) return null;
  if (typeof document === "undefined") return null;

  const playerDoc = player?.player || {};
  const rating = player?.playersRatings?.avgRating || 0;
  const matchedSlots = player?.matchedSlots || [];
  const playerRole = formatRoleLabel(
    playerDoc?.playerRole ||
      player?.playerRole ||
      player?.playersRatings?.playerType,
  );
  const mobileWithCode = playerDoc?.mobile
    ? `${playerDoc?.countryCode ? `${playerDoc.countryCode} ` : ""}${playerDoc.mobile}`
    : "";
  const trialSlotName = player?.slot?.slotName || "";
  const trialSessionName = player?.session?.name || "";
  const trialDate = player?.session?.slotDate || "";
  const trialTime =
    player?.session?.slotStartTime && player?.session?.slotEndTime
      ? `${player.session.slotStartTime} - ${player.session.slotEndTime}`
      : "";
  const categoryName = player?.category?.name || "";
  const playerStatus = player?.status || playerDoc?.status || "";

  const basicDetails = [
    playerRole
      ? {
          icon: <User />,
          label: "Player Role",
          value: playerRole,
          color: "blue",
        }
      : null,
    playerDoc?.batchId
      ? {
          icon: <User />,
          label: "Batch ID",
          value: playerDoc.batchId,
          color: "blue",
        }
      : null,
    playerDoc?.location
      ? {
          icon: <MapPin />,
          label: "Location",
          value: playerDoc.location,
          color: "green",
        }
      : null,
    playerDoc?.mobile
      ? {
          icon: <Phone />,
          label: "Mobile",
          value: mobileWithCode,
          color: "orange",
        }
      : null,
    playerDoc?.email
      ? {
          icon: <Mail />,
          label: "Email",
          value: playerDoc.email,
          color: "red",
        }
      : null,
    playerDoc?.dateOfBirth
      ? {
          icon: <Calendar />,
          label: "Date of Birth",
          value: new Date(playerDoc.dateOfBirth).toLocaleDateString(),
          color: "purple",
        }
      : null,
  ].filter(Boolean);

  const additionalDetails = [
    playerDoc?.age !== undefined && playerDoc?.age !== null
      ? {
          icon: <Calendar />,
          label: "Age",
          value: String(playerDoc.age),
          color: "cyan",
        }
      : null,
    playerDoc?.jerseyNumber !== undefined && playerDoc?.jerseyNumber !== null
      ? {
          icon: <User />,
          label: "Jersey Number",
          value: String(playerDoc.jerseyNumber),
          color: "emerald",
        }
      : null,
    playerDoc?.jerseyName
      ? {
          icon: <User />,
          label: "Jersey Name",
          value: playerDoc.jerseyName,
          color: "emerald",
        }
      : null,
    playerDoc?.jerseySize
      ? {
          icon: <User />,
          label: "Jersey Size",
          value: playerDoc.jerseySize,
          color: "emerald",
        }
      : null,
    playerStatus
      ? {
          icon: <Trophy />,
          label: "Status",
          value: playerStatus,
          color: "purple",
        }
      : null,
    playerDoc?.userType
      ? {
          icon: <User />,
          label: "User Type",
          value: playerDoc.userType,
          color: "blue",
        }
      : null,
  ].filter(Boolean);

  // Check if image is dummy
  const isDummyImage =
    !playerDoc?.profilePicture ||
    playerDoc?.profilePicture === DUMMY_IMAGE_URL ||
    playerDoc?.profilePicture?.includes("placeholder") ||
    playerDoc?.profilePicture?.includes("via.placeholder");

  // Get player initials
  const getInitials = (name = "") => {
    if (!name) return "P";
    return name
      .trim()
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  // Extract all ratings
  const getAllRatings = () => {
    const ratings = [];
    matchedSlots.forEach((slot) => {
      if (slot?.rating?.ratings && Array.isArray(slot.rating.ratings)) {
        slot.rating.ratings.forEach((r) => {
          ratings.push({
            ...r,
            slotName: slot.slotName,
            slotDate: slot.slotDate,
            sessionName: slot.sessionName,
            selectionStatus: slot.selectionStatus,
          });
        });
      }
    });
    return ratings;
  };

  const allRatings = getAllRatings();

  return createPortal(
    <div
      className="fixed inset-0 z-[200000] flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[0_28px_90px_rgba(0,0,0,0.55)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-[var(--primary)] before:via-[var(--secondary)] before:to-transparent sm:max-h-[calc(100dvh-2rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[var(--primary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-[var(--secondary)]/10 blur-3xl" />
        {/* Header */}
        <div className="relative border-b border-[var(--border-card)] bg-[linear-gradient(135deg,rgba(0,187,255,0.14),rgba(3,17,34,0.96)_45%,rgba(255,190,0,0.10))] px-4 py-5 sm:px-5">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-1.5 text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            {/* Profile */}
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border-primary)] bg-gradient-to-br shadow-[0_0_28px_rgba(0,187,255,0.22)] sm:h-20 sm:w-20 ${getGradientByName(
                playerDoc?.name,
              )}`}
            >
              {isDummyImage ? (
                <span className="text-xl font-bold text-white sm:text-2xl">
                  {getInitials(playerDoc?.name)}
                </span>
              ) : (
                <img
                  src={playerDoc?.profilePicture}
                  alt={playerDoc?.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 pr-8 text-[var(--text-primary)]">
              <h2 className="truncate text-lg font-bold sm:text-xl">
                {playerDoc?.name}
              </h2>

              {playerRole && (
                <p className="truncate text-sm font-semibold text-[var(--primary)]">{playerRole}</p>
              )}

              {isTrialType && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[var(--secondary)]/50 bg-[var(--secondary)] px-3 py-1 text-xs font-bold text-[#102033] shadow-[0_0_20px_rgba(255,190,0,0.28)]">
                  ⭐ {rating.toFixed(2)} Rating
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="professional-scrollbar relative flex-1 space-y-4 overflow-y-auto p-4">
          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...basicDetails, ...additionalDetails].map((detail) => (
              <CompactDetailCard
                key={detail.label}
                icon={detail.icon}
                label={detail.label}
                value={detail.value}
                color={detail.color}
              />
            ))}
          </div>

          {/* Trial Details */}
          {(trialSlotName ||
            trialSessionName ||
            trialDate ||
            trialTime ||
            categoryName) && (
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">Trial Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trialSlotName && (
                  <CompactDetailCard
                    icon={<MapPin />}
                    label="Slot"
                    value={trialSlotName}
                    color="green"
                  />
                )}

                {trialSessionName && (
                  <CompactDetailCard
                    icon={<Calendar />}
                    label="Session"
                    value={trialSessionName}
                    color="purple"
                  />
                )}

                {trialDate && (
                  <CompactDetailCard
                    icon={<Calendar />}
                    label="Date"
                    value={new Date(trialDate).toLocaleDateString()}
                    color="orange"
                  />
                )}

                {trialTime && (
                  <CompactDetailCard
                    icon={<Calendar />}
                    label="Time"
                    value={trialTime}
                    color="blue"
                  />
                )}
              </div>
            </div>
          )}

          {/* Ratings */}
          {allRatings.length > 0 && (
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[var(--secondary)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Ratings</h3>
              </div>

              <div className="space-y-3">
                {allRatings.map((r, idx) => (
                  <div key={idx} className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {r.slotName}
                        </p>

                        <p className="text-xs text-[var(--text-secondary)]">{r.sessionName}</p>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${
                          r.selectionStatus === "select"
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border border-[var(--secondary)]/30 bg-[var(--secondary)]/10 text-[var(--secondary)]"
                        }`}
                      >
                        {r.selectionStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {renderMiniRating("Bat", r.batting, "blue")}
                      {renderMiniRating("Bowl", r.bowling, "red")}
                      {renderMiniRating("Field", r.fielding, "green")}
                      {renderMiniRating("Fit", r.fitness, "cyan")}
                      {renderMiniRating("Att", r.attitude, "purple")}
                      {renderMiniRating("WK", r.bowler, "orange")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          {playerDoc?.description && (
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4">
              <h3 className="mb-2 text-sm font-bold text-[var(--text-primary)]">About</h3>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {playerDoc.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative flex gap-3 border-t border-[var(--border-card)] bg-[var(--bg-main)] p-4">
          {activeSubTab === "auctionPlayers" && (
            <button
              onClick={onDelete}
              className="h-11 flex-1 rounded-lg border border-red-500/40 bg-red-500/12 font-bold text-red-200 transition hover:bg-red-500/20"
            >
              Remove
            </button>
          )}

          <button
            onClick={onClose}
            className="h-11 flex-1 rounded-lg border border-[var(--border-primary)] bg-[rgba(0,187,255,0.08)] font-bold text-[var(--primary)] transition hover:bg-[rgba(0,187,255,0.14)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* Helper Components */
const CompactDetailCard = ({ icon, label, value, color }) => {
  const tone = COLOR_TONE[color] || COLOR_TONE.blue;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:border-[var(--border-primary)]">
      
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-current/15 ${tone.bg} ${tone.text}`}
      >
        <span className="[&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      </div>

      <div className="min-w-0">
        <p className="text-[11px] text-[var(--text-secondary)]">
          {label}
        </p>

        <p className="text-sm font-semibold text-[var(--text-primary)] break-words">
          {value}
        </p>
      </div>
    </div>
  );
};

const renderMiniRating = (label, value, color) =>
  value !== undefined && (
    <div
      className={`rounded-lg border border-[var(--border-card)] p-2 text-center ${
        (COLOR_TONE[color] || COLOR_TONE.blue).bg
      }`}
    >
      <p className="text-[10px] text-[var(--text-secondary)]">
        {label}
      </p>

      <p
        className={`text-sm font-bold ${
          (COLOR_TONE[color] || COLOR_TONE.blue).text
        }`}
      >
        {value}
      </p>
    </div>
  );
