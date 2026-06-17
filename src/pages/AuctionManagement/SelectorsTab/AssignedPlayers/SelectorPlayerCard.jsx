import React, { useState } from "react";
import { Eye, MapPin, Clock, X, Star, CalendarCheck, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const DUMMY_IMAGE_URL =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

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

const getGradientByName = (name) => {
  const hash = name
    ?.split("")
    ?.reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

const isDummyImage = (imageUrl) => imageUrl === DUMMY_IMAGE_URL;

const formatTime = (time) => {
  if (!time) return "";
  const [hour, minute] = time.split(":");
  const h = parseInt(hour, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 || 12;
  return `${formattedHour}:${minute} ${suffix}`;
};

const getInitials = (name) => {
  if (!name) return "NA";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`?.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatRole = (role) => {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1)?.toLowerCase();
};

const isSessionLocked = (session) => {
  const lockStatus = String(session?.lockStatus || "").trim().toLowerCase();
  return lockStatus === "locked";
};

const PlayerDetailsModal = ({
  player,
  isOpen,
  onClose,
  onBallRate,
  onRemoveRating,
  isRemovingRating,
  hideRatingFeatures = false,
  onRemoveSelection,
  onEditSelection,
}) => {
  if (!isOpen || !player) return null;

  const session = player.session;
  const locked = isSessionLocked(session);
  const hasSelectorRated =
    Array.isArray(player?.rating?.ratings) && player.rating.ratings.length > 0;
  const grade = player?.directSelectedGrade || player?.rating?.directSelectedGrade || null;
  const [showRatings, setShowRatings] = useState(true);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const openBallByBall = () => {
    if (locked) {
      toast.error("Session locked hai, is player ki rating nahi ho sakti");
      return;
    }

    const slotId = player?.session?.slot?._id;
    const sessionId = player?.session?._id;
    if (!slotId || !sessionId) {
      toast.error("Missing session information for Ball by Ball rating");
      return;
    }
    onClose();
    if (onBallRate) onBallRate(player);
  };

  const handleRemoveRating = async () => {
    if (!hasSelectorRated || !onRemoveRating) return;

    if (locked) {
      toast.error("Session locked hai, rating remove nahi ho sakti");
      return;
    }

    setShowRemoveConfirm(true);
  };

  const confirmRemoveRating = async () => {
    setShowRemoveConfirm(false);
    try {
      await onRemoveRating(player);
    } catch (error) {
      console.error("Failed to remove rating:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative h-full w-full overflow-y-auto mt-10 mb-10">
        <div className="min-h-full flex justify-center items-start p-4 pt-16 pb-10">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl">
            {showRemoveConfirm && (
              <div className="absolute inset-0 z-30 bg-black/40 flex items-center justify-center p-4 rounded-2xl">
                <div className="w-full max-w-sm rounded-xl bg-[var(--bg-card)] p-4 shadow-2xl border border-[var(--border-card)]">
                  <h4 className="text-base font-semibold text-[var(--text-primary)]">
                    Confirm Remove Rating
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    Are you sure? This player's rating will be removed.
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRemoveConfirm(false)}
                      className="px-3 py-2 rounded-lg border border-[var(--border-primary)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--secondary-lighter)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmRemoveRating}
                      className="px-3 py-2 rounded-lg border border-red-500 bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-[var(--secondary-lighter)] hover:bg-[var(--secondary-lighter)] rounded-full"
            >
              <X className="w-4 h-4 text-[var(--text-primary)]" />
            </button>

            <div className="max-h-[85vh] overflow-y-auto bg-[var(--bg-card)] p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-[var(--secondary-lighter)] overflow-hidden">
                  {player?.player?.logo && !isDummyImage(player?.player?.logo) ? (
                    <img
                      src={player?.player?.logo}
                      alt={player?.player?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getGradientByName(
                        player?.player?.name
                      )} text-[var(--text-dark)] font-bold`}
                    >
                      {getInitials(player?.player?.name)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {player?.player?.batchId}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-block rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1 text-sm font-medium text-[var(--primary)]">
                      {formatRole(player?.rating?.playerType || player?.player?.playerType)}
                    </span>
                    {grade && (
                      <span className="inline-block px-3 py-1 bg-[var(--secondary-lighter)] text-[var(--text-primary)] rounded-full text-sm font-semibold">
                        Grade: {grade}
                      </span>
                    )}
                    {session?.lockStatus && (
                      <span className="inline-block rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1 text-sm font-medium capitalize text-[var(--primary)]">
                        {session.lockStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-[var(--border-card)] bg-[var(--bg-main)] p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-lg">
                  Trial Session Details
                </h3>

                <div className="space-y-3 text-sm text-[var(--text-primary)]">
                  <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-sm">
                    <p className="font-medium">Session: {session?.name || "-"}</p>
                    <p>Slot: {session?.slot?.slotName || "-"}</p>
                    <p>
                      Time: {formatTime(session?.slotStartTime)} - {formatTime(session?.slotEndTime)}
                    </p>
                  </div>
                </div>
              </div>

              {hasSelectorRated && showRatings && !hideRatingFeatures && (
                <div className="mb-6 rounded-xl border border-[var(--border-card)] bg-[var(--bg-main)] p-4">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-lg">
                    Your Rating Details
                  </h3>

                  <div className="space-y-3">
                    {player.rating.ratings.map((ratingItem, idx) => (
                      <div key={idx} className="bg-[var(--bg-card)] rounded-lg p-3 shadow-sm border border-[var(--border-card)]">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            Rating #{idx + 1}
                          </p>
                          <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2 py-1 text-sm font-semibold text-[var(--primary)]">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {ratingItem?.rating ?? 0}
                          </div>
                        </div>

                        {ratingItem?.comments && (
                          <p className="mt-2 text-sm text-[var(--text-primary)] bg-[var(--bg-soft)] border border-[var(--border-card)] rounded-md px-2 py-2">
                            {ratingItem.comments}
                          </p>
                        )}

                        {Array.isArray(ratingItem?.field) && ratingItem.field.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {ratingItem.field.map((fieldItem, fieldIndex) => (
                              <span
                                key={`${fieldItem?.label || fieldIndex}`}
                                className="rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2 py-1 text-xs text-[var(--primary)]"
                              >
                                {fieldItem?.label || "Field"}: {fieldItem?.numberValue ?? fieldItem?.stringValue ?? "-"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-[var(--border-card)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-[var(--text-primary)] bg-[var(--secondary-lighter)] hover:bg-[var(--secondary-lighter)] border border-[var(--border-primary)] transition-all shadow-sm"
                >
                  Close
                </button>

                {!hideRatingFeatures && hasSelectorRated && (
                  <button
                    type="button"
                    onClick={() => setShowRatings((prev) => !prev)}
                    className="px-4 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] font-medium text-[var(--primary)] transition-all shadow-sm hover:bg-[var(--secondary-lighter)]"
                  >
                    {showRatings ? "Hide Rating" : "View Rating"}
                  </button>
                )}

                {!hideRatingFeatures && hasSelectorRated && !locked && (
                  <button
                    type="button"
                    onClick={handleRemoveRating}
                    disabled={isRemovingRating}
                    className="px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isRemovingRating ? "Removing..." : "Remove Rating"}
                  </button>
                )}

                {!hideRatingFeatures && !locked && (
                  <button
                    type="button"
                    onClick={openBallByBall}
                    className="flex-1 px-4 py-2 rounded-lg font-medium text-[#102033] bg-[var(--secondary)] hover:bg-[var(--secondary-strong)] transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    Rating
                  </button>
                )}

                {hideRatingFeatures && player?.directSelected !== null && player?.directSelected !== undefined && !locked && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (onRemoveSelection) onRemoveSelection(player.player._id);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-all shadow-sm"
                    >
                      Remove Selection
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onEditSelection) onEditSelection(player);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-700 transition-all shadow-sm"
                    >
                      Edit Selection
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SelectorPlayerCard = ({
  player,
  onViewDetails,
  selector = true,
  onBallRate,
  onRemoveRating,
  isRemovingRating,
  hideRatingFeatures = false,
  onRemoveSelection,
  onEditSelection,
}) => {
  const [imageError, setImageError] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const initials = getInitials(player?.player?.name);
  const role = formatRole(player?.rating?.playerType);
  const session = player?.session;
  const hasSelectorRated =
    Array.isArray(player?.rating?.ratings) && player.rating.ratings.length > 0;
  const grade = player?.directSelectedGrade || player?.rating?.directSelectedGrade || null;

  const handleViewDetails = (e) => {
    e?.stopPropagation();
    setDetailsModalOpen(true);

    if (onViewDetails) {
      try {
        onViewDetails(player);
      } catch (err) {
        console.error("onViewDetails callback failed:", err);
      }
    }
  };

  const getRoleColor = () => {
    const roleLower = player?.rating?.playerType?.toLowerCase();
    if (roleLower === "batsman") return "bg-blue-600 text-[var(--text-dark)]";
    if (roleLower === "bowler") return "bg-red-600 text-[var(--text-dark)]";
    if (roleLower?.includes("wicket")) return "bg-amber-600 text-[var(--text-dark)]";
    return "bg-orange-500 text-[var(--text-dark)]";
  };

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-[var(--color-primary)] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-[var(--border-card)] overflow-hidden flex w-full max-w-sm p-3 gap-3"
      >
        {hasSelectorRated && !hideRatingFeatures && (
          <div
            className="absolute top-1 left-1 z-30 px-1.5 py-1 rounded-full shadow bg-[var(--secondary)] text-[#102033] flex items-center justify-center"
            title="Rated by selector"
          >
            <Star className="w-3 h-3 fill-current" />
          </div>
        )}

        {hideRatingFeatures && player?.directSelected === true && (
          <div
            className="absolute top-1 left-1 z-30 px-1.5 py-1 rounded-full shadow bg-green-500 text-white flex items-center justify-center"
            title="Selected"
          >
            {grade ? (
              <span className="text-xs font-semibold">{grade}</span>
            ) : (

              <Star className="w-3 h-3 fill-current" />
            )}

          </div>
        )}

        {hideRatingFeatures && player?.directSelected === false && (
          <div
            className="absolute top-1 left-1 z-30 px-1.5 py-1 rounded-full shadow bg-red-500 text-white flex items-center justify-center"
            title="Not Selected"
          >
             {grade ? (
              <span className="text-xs font-semibold">{grade}</span>
            ) : (

              <Star className="w-3 h-3 fill-current" />
            )}
            
          </div>
        )}

        <div
          onClick={handleViewDetails}
          className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600"
        >
          {!imageError &&
            player?.player?.logo &&
            !isDummyImage(player?.player?.logo) ? (
            <img
              src={player?.player?.logo}
              alt={player?.player?.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getGradientByName(
                player?.player?.name
              )} text-[var(--text-dark)] text-xl font-bold`}
            >
              {initials}
            </div>
          )}

          <span
            className={`absolute bottom-1 right-1 px-2 py-0.5 rounded-full text-[9px] font-semibold shadow ${getRoleColor()}`}
          >
            {role}
          </span>
        </div>

        <div
          onClick={handleViewDetails}
          className="flex flex-col justify-center flex-grow cursor-pointer"
        >
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">
              {player?.player?.batchId}
            </h3>
            {/* {grade && (
              <span className="inline-flex mr-4 text-md items-center px-2 py-0.5 bg-[var(--secondary-lighter)] text-[var(--text-primary)] rounded-full text-[10px] font-semibold">
                {grade}
              </span>
            )} */}
          </div>

          {session?.slot?.location && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-[var(--text-secondary)] truncate">
                {session?.slot?.slotName}
              </span>
            </div>
          )}

          {session?.name && (
            <div className="flex items-center gap-1 mt-1">
              <CalendarCheck className="w-3 h-3 text-pink-600" />
              <span className="text-xs text-[var(--text-secondary)] truncate">
                Session -{session?.name}
              </span>
            </div>
          )}

          {session && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-green-600" />
              <span className="text-xs text-[var(--text-secondary)]">
                {formatTime(session.slotStartTime)} - {formatTime(session.slotEndTime)}
              </span>
            </div>
          )}
        </div>

        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-200">
            <button
              type="button"
              onClick={handleViewDetails}
              className="bg-[var(--bg-card)] px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-[var(--secondary-lighter)]"
            >
              <Eye className="w-4 h-4 text-[var(--text-primary)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">View</span>
            </button>
          </div>
        )}
      </div>

      <PlayerDetailsModal
        player={player}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        selector={selector}
        onBallRate={onBallRate}
        onRemoveRating={onRemoveRating}
        isRemovingRating={isRemovingRating}
        hideRatingFeatures={hideRatingFeatures}
        onRemoveSelection={onRemoveSelection}
        onEditSelection={onEditSelection}
      />
    </>
  );
};

export default SelectorPlayerCard;
