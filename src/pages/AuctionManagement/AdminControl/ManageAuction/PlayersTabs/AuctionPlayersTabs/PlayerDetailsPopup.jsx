import { X, Trophy, User, MapPin, Phone, Mail, Calendar } from "lucide-react";

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
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-600" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
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

  return (
    <div className="fixed inset-0 z-[200000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-5 sm:px-5">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <X className="w-4 h-4 text-[var(--text-dark)]" />
          </button>

          <div className="flex items-center gap-4">
            {/* Profile */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-gradient-to-br ${getGradientByName(
                playerDoc?.name,
              )} flex items-center justify-center shrink-0`}
            >
              {isDummyImage ? (
                <span className="text-[var(--text-dark)] text-xl sm:text-2xl font-bold">
                  {getInitials(playerDoc?.name)}
                </span>
              ) : (
                <img
                  src={playerDoc?.profilePicture}
                  alt={playerDoc?.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Info */}
            <div className="text-[var(--text-dark)] min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">
                {playerDoc?.name}
              </h2>

              {playerRole && (
                <p className="text-white/90 text-sm truncate">{playerRole}</p>
              )}

              {isTrialType && (
                <div className="mt-2 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  ⭐ {rating.toFixed(2)} Rating
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <div className="bg-[var(--bg-soft)] border rounded-2xl p-4">
              <h3 className="font-semibold text-sm mb-3">Trial Details</h3>

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
            <div className="bg-[var(--bg-soft)] border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <h3 className="font-semibold text-sm">Ratings</h3>
              </div>

              <div className="space-y-3">
                {allRatings.map((r, idx) => (
                  <div key={idx} className="bg-[var(--bg-card)] border rounded-xl p-3">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {r.slotName}
                        </p>

                        <p className="text-xs text-[var(--text-secondary)]">{r.sessionName}</p>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${
                          r.selectionStatus === "select"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
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
            <div className="bg-[var(--bg-soft)] border rounded-2xl p-4">
              <h3 className="font-semibold text-sm mb-2">About</h3>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {playerDoc.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-[var(--bg-card)] p-4 flex gap-3">
          {activeSubTab === "auctionPlayers" && (
            <button
              onClick={onDelete}
              className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition"
            >
              Remove
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--secondary-lighter)] font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* Helper Components */
const CompactDetailCard = ({ icon, label, value, color }) => {
  const tone = COLOR_TONE[color] || COLOR_TONE.blue;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border bg-[var(--bg-card)]">
      
      <div
        className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${tone.bg} ${tone.text}`}
      >
        {icon}
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
      className={`rounded-xl p-2 text-center ${
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
