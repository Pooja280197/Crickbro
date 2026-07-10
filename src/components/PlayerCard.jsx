import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  Eye,
  MapPin,
  Clock,
  Calendar,
  X,
  Check,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../utils/api";

const DUMMY_IMAGE_URL =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

const PLAYER_ROLES = [
  { value: "", label: "Select Role" },
  { value: "batsman", label: "Batsman" },
  { value: "bowler", label: "Bowler" },
  { value: "all-rounder", label: "All-Rounder" },
  { value: "wicketkeeper-batsman", label: "Wicketkeeper-Batsman" },
];

/* ================= GRADIENTS ================= */
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
  if (!name) return gradients[0];
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

const isDummyImage = (url) => url === DUMMY_IMAGE_URL;

const getInitials = (name = "") => {
  if (!name) return "NA";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

const formatRole = (role) =>
  role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : "";

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-GB") : "";

const formatTime = (t) => {
  if (!t) return "";
  let [h, m] = t.split(":");
  let hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
};

const toInputString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const getObjectId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return value._id;
  return "";
};

/* ================= PLAYER DETAILS MODAL ================= */
export const PlayerDetailsModal = ({
  player,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isSaving,
  isRemoving,
  type,
  onRemoveSession,
  onRatePlayer,
  onGradePlayer,
  initialAction = "",
  actionOnly = false,
  showAllDetails = false,
  directSelected,
  grade
}) => {
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [showTrialDetails, setShowTrialDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSessionDeleteConfirm, setSessionShowDeleteConfirm] =
    useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    email: "",
    location: "",
    playerRole: "",
    jerseyNumber: "",
    jerseyName: "",
    jerseySize: "",
    dob: "",
  });

  const playerData = player?.player || player || null;

  useEffect(() => {
    if (isOpen) {
      setShowMoreDetails(showAllDetails);
      setShowTrialDetails(showAllDetails);
      setIsEditing(initialAction === "edit");
      setShowDeleteConfirm(initialAction === "delete");
      setSessionShowDeleteConfirm(initialAction === "removeSession");
      setProfileFile(null);
      setProfilePreview(playerData?.profilePicture || "");
    }
  }, [isOpen, player?._id, player?.player?._id, initialAction, showAllDetails]);

  const playerName = playerData?.name || "";
  const playerImage = playerData?.profilePicture || "";
  const playerEmail = playerData?.email || "";
  const playerMobile = playerData?.mobile || "";
  const playerCountryCode = playerData?.countryCode || "";
  const playerLocation = playerData?.location || "";
  const playerBatchId = playerData?.batchId || "";
  const playerDateOfBirth = playerData?.dateOfBirth || playerData?.dob || "";
  const playerAge = playerData?.age;
  const jerseyNumber = playerData?.jerseyNumber;
  const jerseyName = playerData?.jerseyName || "";
  const jerseySize = playerData?.jerseySize || "";
  const playerUserType = playerData?.userType || "";
  const registrationRank = playerData?.registrationRank;
  const unifiedRank = playerData?.unifiedRank;
  const createdAt = playerData?.createdAt || "";
  const updatedAt = playerData?.updatedAt || "";

  useEffect(() => {
    if (!isOpen || !playerData) return;
    setEditForm({
      name: playerData?.name || "",
      mobile: playerData?.mobile || "",
      email: playerData?.email || "",
      location: playerData?.location || "",
      playerRole: playerData?.playerRole || "",
      jerseyNumber: playerData?.jerseyNumber || "",
      jerseyName: playerData?.jerseyName || "",
      jerseySize: playerData?.jerseySize || "",
      dob: playerData?.dateOfBirth
        ? new Date(playerData.dateOfBirth).toISOString().split("T")[0]
        : "",
    });
  }, [isOpen, player?._id, player?.player?._id]);

  if (!isOpen || !player) return null;

  const initials = getInitials(playerName);
  const role = formatRole(type || playerData?.playerRole);

  const rating = player?.playersRatings || {};
  const basePrice = player?.basePrice || 0;
  const currentBid = player?.currentBid || 0;
  const status = player?.status || playerData?.status || "";
  const slotName =
    player?.slot?.slotName || player?.slot?.location?.venue || "";
  const sessionName = player?.session?.name || "";
  const sessionDate = player?.session?.slotDate || "";
  const sessionStart = player?.session?.slotStartTime || "";
  const sessionEnd = player?.session?.slotEndTime || "";

  const primaryDetails = [
    { label: "Role", value: role },
    {
      label: "Mobile",
      value: playerMobile
        ? `${playerCountryCode ? `${playerCountryCode} ` : ""}${playerMobile}`
        : "",
    },
    { label: "Location", value: playerLocation },
    { label: "Email", value: playerEmail },
    { label: "Batch ID", value: playerBatchId },
    { label: "Status", value: status },
  ];

  const additionalDetails = [
    {
      label: "Date Of Birth",
      value: playerDateOfBirth ? formatDate(playerDateOfBirth) : "",
    },
    { label: "Age", value: playerAge ?? "" },
    { label: "Jersey Number", value: jerseyNumber ?? "" },
    { label: "Jersey Name", value: jerseyName },
    { label: "Jersey Size", value: jerseySize },
    { label: "User Type", value: playerUserType },
    {
      label: "Registration Rank",
      value: registrationRank ?? "",
    },
    { label: "Unified Rank", value: unifiedRank ?? "" },
    { label: "Created On", value: createdAt ? formatDate(createdAt) : "" },
    { label: "Updated On", value: updatedAt ? formatDate(updatedAt) : "" },
  ];

  const handleEditInputChange = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveEdit = async () => {
    if (!onEdit) return;
    const targetPlayerId = playerData?._id || player?._id || "";
    const normalizedName = toInputString(editForm.name);
    const normalizedEmail = toInputString(editForm.email);
    const normalizedLocation = toInputString(editForm.location);
    const normalizedJerseyNumber = toInputString(editForm.jerseyNumber);
    const normalizedJerseyName = toInputString(editForm.jerseyName);
    const normalizedJerseySize = toInputString(editForm.jerseySize);
    const normalizedPlayerRole = toInputString(
      editForm.playerRole,
    ).toLowerCase();

    let payload;

    // If file is present, use FormData; otherwise use JSON
    if (profileFile) {
      payload = new FormData();
      if (targetPlayerId) payload.append("playerId", targetPlayerId);
      payload.append("name", normalizedName);
      payload.append("email", normalizedEmail);
      payload.append("location", normalizedLocation);
      payload.append("jerseyNumber", normalizedJerseyNumber);
      payload.append("jerseyName", normalizedJerseyName);
      payload.append("jerseySize", normalizedJerseySize);
      if (normalizedPlayerRole) {
        payload.append("playerRole", normalizedPlayerRole);
      }
      if (editForm.dob) {
        payload.append("dob", editForm.dob);
      }
      payload.append("profilePicture", profileFile);
    } else {
      // Send as JSON when no file is present
      payload = {
        playerId: targetPlayerId,
        name: normalizedName,
        email: normalizedEmail,
        location: normalizedLocation,
        jerseyNumber: normalizedJerseyNumber,
        jerseyName: normalizedJerseyName,
        jerseySize: normalizedJerseySize,
      };
      if (normalizedPlayerRole) {
        payload.playerRole = normalizedPlayerRole;
      }
      if (editForm.dob) {
        payload.dob = editForm.dob;
      }
    }

    const success = await onEdit(payload);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    await onDelete();
    setShowDeleteConfirm(false);
  };

  const handleConfirmRemoveSession = async () => {
    if (!onRemoveSession) return;
    await onRemoveSession(
      player?.slot?._id,
      player?.session?._id,
      player?.player?._id,
    );
    setSessionShowDeleteConfirm(false);
  };

  if (typeof document === "undefined") return null;

  if (
    actionOnly &&
    (initialAction === "delete" || initialAction === "removeSession")
  ) {
    const isRemoveSession = initialAction === "removeSession";

    return createPortal(
      <div className="fixed inset-0 z-[120000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-[var(--bg-card)] p-5 shadow-2xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {isRemoveSession ? "Remove Player From Session" : "Remove Player"}
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {isRemoveSession
              ? "Are you sure you want to remove this player from the Slot/Session?"
              : "Are you sure you want to remove this player from the auction?"}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border-primary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--secondary-lighter)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={
                isRemoveSession
                  ? handleConfirmRemoveSession
                  : handleConfirmDelete
              }
              disabled={isRemoving}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isRemoving ? "Removing..." : "OK"}
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[120000] flex items-center justify-center overflow-y-auto bg-black/60 p-2 backdrop-blur-sm sm:p-4">
      <div className="relative z-[120001] flex max-h-[calc(100vh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] sm:max-h-[calc(100vh-2rem)]">
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-card)] shadow-2xl border border-red-100 p-5">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Remove Player
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Are you sure you want to remove this player from the auction?
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-primary)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--secondary-lighter)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isRemoving}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                >
                  {isRemoving ? "Removing..." : "OK"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSessionDeleteConfirm && (
          <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-card)] shadow-2xl border border-red-100 p-5">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Remove Player From Session
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Are you sure you want to remove this player from the
                Slot/Session?
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSessionShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-primary)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--secondary-lighter)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemoveSession}
                  disabled={isRemoving}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                >
                  {isRemoving ? "Removing..." : "OK"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
        >
          <X className="w-4 h-4 text-[var(--text-primary)]" />
        </button>

        {/* Scrollable Body */}
        <div className="professional-scrollbar max-h-[calc(100vh-1rem)] overflow-y-auto p-4 pt-12 sm:max-h-[calc(100vh-2rem)] sm:p-5 sm:pt-12">
          {/* Player Header */}
          <div className="mb-4 flex items-center gap-3 border-b border-[var(--border-card)] pb-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] shadow-sm">
              {playerImage && !isDummyImage(playerImage) ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={playerImage}
                  alt={playerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getGradientByName(
                    playerName,
                  )} text-[var(--text-dark)] text-lg font-bold`}
                >
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-[var(--text-primary)] sm:text-xl">
                {playerName}
              </h2>

              {role && (
                <span className="mt-1 inline-flex rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2.5 py-1 text-[11px] font-semibold text-[var(--primary)]">
                  {role}
                </span>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mb-4 rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Profile Picture
              </p>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)]">
                  {profilePreview ? (
                    <img
                      loading="lazy"
                      decoding="async"
                      src={profilePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">
                      N/A
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (profilePreview && profilePreview.startsWith("blob:")) {
                      URL.revokeObjectURL(profilePreview);
                    }
                    setProfileFile(file);
                    setProfilePreview(URL.createObjectURL(file));
                  }}
                  className="block w-full text-xs font-medium text-[var(--text-secondary)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--secondary)] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#102033]"
                />
              </div>
            </div>
          )}

          {/* Personal Details */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
              Personal Details
            </h3>

            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {primaryDetails
                .filter(
                  (detail) =>
                    detail.value !== "" &&
                    detail.value !== null &&
                    detail.value !== undefined,
                )
                .map((detail) => (
                  <div
                    key={detail.label}
                    className="rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] px-3 py-2"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      {detail.label}
                    </p>
                    <p className="mt-1 break-words text-xs font-semibold text-[var(--text-primary)]">
                      {detail.value}
                    </p>
                  </div>
                ))}

              {(showMoreDetails || showAllDetails) &&
                additionalDetails
                  .filter(
                    (detail) =>
                      detail.value !== "" &&
                      detail.value !== null &&
                      detail.value !== undefined,
                  )
                  .map((detail) => (
                    <div
                      key={detail.label}
                      className="rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] px-3 py-2"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                        {detail.label}
                      </p>
                      <p className="mt-1 break-words text-xs font-semibold text-[var(--text-primary)]">
                        {detail.value}
                      </p>
                    </div>
                  ))}
            </div>

            {!showAllDetails &&
              additionalDetails.some(
                (detail) =>
                  detail.value !== "" &&
                  detail.value !== null &&
                  detail.value !== undefined,
              ) && (
                <button
                  type="button"
                  onClick={() => setShowMoreDetails((prev) => !prev)}
                  className="mt-2 text-xs font-semibold text-[var(--primary)] hover:text-[var(--secondary)]"
                >
                  {showMoreDetails ? "Show less details" : "Show more details"}
                </button>
              )}

            {isEditing && (
              <div className="mt-3 rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-3">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  Edit Details
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      handleEditInputChange("name", e.target.value)
                    }
                    placeholder="Name"
                    className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)]"
                  />
                  <input
                    type="text"
                    value={editForm.mobile}
                    placeholder="Mobile"
                    className="h-10 cursor-not-allowed rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-secondary)] outline-none"
                    maxLength={10}
                    readOnly
                    disabled
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      handleEditInputChange("email", e.target.value)
                    }
                    placeholder="Email"
                    className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)]"
                  />
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) =>
                      handleEditInputChange("location", e.target.value)
                    }
                    placeholder="Location"
                    className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)]"
                  />
                  <select
                    value={editForm.playerRole}
                    onChange={(e) =>
                      handleEditInputChange("playerRole", e.target.value)
                    }
                    className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)]"
                  >
                    {PLAYER_ROLES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={(e) =>
                      handleEditInputChange("dob", e.target.value)
                    }
                    className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)]"
                  />
                  <input
                    type="text"
                    value={editForm.jerseyNumber}
                    onChange={(e) =>
                      handleEditInputChange("jerseyNumber", e.target.value)
                    }
                    placeholder="Jersey Number"
                    className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)]"
                  />
                  <input
                    type="text"
                    value={editForm.jerseyName}
                    onChange={(e) =>
                      handleEditInputChange("jerseyName", e.target.value)
                    }
                    placeholder="Jersey Name"
                    className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)]"
                  />
                  <input
                    type="text"
                    value={editForm.jerseySize}
                    onChange={(e) =>
                      handleEditInputChange("jerseySize", e.target.value)
                    }
                    placeholder="Jersey Size"
                    className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] sm:col-span-2"
                  />
                </div>
              </div>
            )}
          </div>

          {(showAllDetails ||
            slotName ||
            sessionName ||
            sessionDate ||
            (sessionStart && sessionEnd)) && (
            <div className="mb-4 rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-3">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                  Trial Details
                </h3>
                {!showAllDetails && (
                  <button
                    type="button"
                    onClick={() => setShowTrialDetails((prev) => !prev)}
                    className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--secondary)]"
                  >
                    {showTrialDetails ? "Hide" : "Show"}
                  </button>
                )}
              </div>

              {(showTrialDetails || showAllDetails) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {slotName && (
                    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
                        Slot
                      </p>
                      <p className="font-semibold text-[var(--text-primary)] break-words">
                        {slotName}
                      </p>
                    </div>
                  )}
                  {sessionName && (
                    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
                        Session
                      </p>
                      <p className="font-semibold text-[var(--text-primary)] break-words">
                        {sessionName}
                      </p>
                    </div>
                  )}
                  {sessionDate && (
                    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
                        Date
                      </p>
                      <p className="font-semibold text-[var(--text-primary)] break-words">
                        {formatDate(sessionDate)}
                      </p>
                    </div>
                  )}
                  {sessionStart && sessionEnd && (
                    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
                        Time
                      </p>
                      <p className="font-semibold text-[var(--text-primary)] break-words">
                        {formatTime(sessionStart)} - {formatTime(sessionEnd)}
                      </p>
                    </div>
                  )}
                  {!slotName &&
                    !sessionName &&
                    !sessionDate &&
                    !(sessionStart && sessionEnd) && (
                      <p className="text-sm text-[var(--text-secondary)] sm:col-span-2">
                        No trial slot or session details available.
                      </p>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Auction Details */}
          {(showAllDetails || basePrice > 0 || currentBid > 0) && (
            <div className="mb-4 rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Auction Details
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {(showAllDetails || basePrice > 0) && (
                  <div>
                    <div className="text-[var(--text-secondary)] text-xs">
                      Base Price
                    </div>
                    <div className="text-lg font-semibold text-[var(--text-primary)]">
                      ₹{basePrice.toLocaleString()}
                    </div>
                  </div>
                )}

                {(showAllDetails || currentBid > 0) && (
                  <div>
                    <div className="text-[var(--text-secondary)] text-xs">
                      Current Bid
                    </div>
                    <div className="text-lg font-semibold text-[var(--primary)]">
                      ₹{currentBid.toLocaleString()}
                    </div>
                  </div>
                )}

                {status && (
                  <div>
                    <div className="text-[var(--text-secondary)] text-xs">
                      Status
                    </div>
                    <div className="font-medium text-[var(--text-primary)]">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          {((rating?.avgRating > 0) || directSelected) && (
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Rating Details
              </h3>

            {rating?.avgRating > 0 &&  <div className="flex items-center justify-between mb-3">
                <span className="text-[var(--text-secondary)] text-sm">
                  Average Rating
                </span>

                <span className="text-2xl font-bold text-[var(--primary)]">
                  {rating.avgRating}
                </span>
              </div>}

               {grade &&  <div className="flex items-center justify-between mb-3">
                <span className="text-[var(--text-secondary)] text-sm">
                  Grade
                </span>

                <span className="text-2xl font-bold text-[var(--primary)]">
                  {grade}
                </span>
              </div>}

              {rating.playerType && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">
                    Player Type
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {rating?.playerType?.charAt(0)?.toUpperCase() + rating?.playerType?.slice(1) }
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {(onRatePlayer ||
          onGradePlayer ||
          onEdit ||
          onDelete ||
          onRemoveSession) && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border-card)] bg-[var(--bg-card)] p-4">
            {!isEditing && onRatePlayer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRatePlayer(player);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--secondary)] hover:text-[#102033]"
              >
                <Star className="h-4 w-4" />
                Rating
              </button>
            )}

            {!isEditing && onGradePlayer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGradePlayer(player);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--secondary)] hover:text-[#102033]"
              >
                <Award className="h-4 w-4" />
                Grading
              </button>
            )}

            {!isEditing && onEdit && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--secondary)] hover:text-[#102033]"
              >
                Edit
              </button>
            )}

            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-[var(--border-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--secondary-lighter)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="rounded-lg bg-[var(--secondary)] px-4 py-2 text-sm font-semibold text-[#102033] hover:bg-[var(--secondary-strong)] disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isRemoving}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            )}

            {onRemoveSession && (
              <button
                type="button"
                onClick={() => setSessionShowDeleteConfirm(true)}
                disabled={isRemoving}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isRemoving ? "Removing..." : "Remove from session"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

/* ================= PLAYER CARD ================= */
const PlayerCard = ({
  player,
  mode = "view",
  isSelected = false,
  onSelect,
  onViewDetails,
  onAssign,
  showActions = true,
  selector,
  onRemove,
  adminLogin,
  type,
  auctionId,
  onActionComplete,
  selectedSlotId,
  selectedSlotSessions = [],
  slotDetails = [],
  onRatePlayer,
  onGradePlayer,
}) => {
  const [imageError, setImageError] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showAssignSession, setShowAssignSession] = useState(false);
  const [assignSessionId, setAssignSessionId] = useState("");
  const [isAssigningSession, setIsAssigningSession] = useState(false);

  // Extract player data from the structure

  const playerData = player?.player || player;
  const playerId =
    player?.player?._id || player?.playerId || player?.id || player?._id;
  const playerSlotId = getObjectId(
    player?.slot?._id || player?.slotId || playerData?.slotId,
  );
  const playerName = playerData?.name || "";
  const playerImage = playerData?.profilePicture || "";
  const playerBatchId = playerData?.batchId || "";

  const initials = getInitials(playerName);
  const role = formatRole(type || playerData?.playerRole);

  const handleViewDetails = (e) => {
    e?.stopPropagation();
    setDetailsModalOpen(true);
    onViewDetails && onViewDetails(player);
  };

  const handleSelect = (e) => {
    e?.stopPropagation();
    if (onSelect) {
      onSelect(playerId);
    }
  };

  const handleEditPlayer = async (payload) => {
    try {
      setIsSaving(true);
      await api.put("/webSiteApi/players/editPlayer", payload);
      toast.success("Player updated successfully");
      setDetailsModalOpen(false);
      if (typeof onActionComplete === "function") {
        onActionComplete();
      }
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update player");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePlayer = async () => {
    if (!auctionId || !playerId) {
      toast.error("Missing auction or player id");
      return;
    }

    try {
      setIsRemoving(true);
      await api.delete(
        `/webSiteApi/auction/removePlayer/${auctionId}/${playerId}`,
      );
      toast.success("Player removed successfully");
      setDetailsModalOpen(false);
      if (typeof onActionComplete === "function") {
        onActionComplete();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove player");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRemoveFromSession = async (SlotId, SessionId, playerId) => {
    if (!SlotId || !SessionId) {
      toast.error("Missing auction or player id");
      return;
    }
    const data = {
      playerIds: [playerId],
    };

    try {
      setIsRemoving(true);
      await api.post(
        `/webSiteApi/auctionSlot/removePlayerFromSession/${SlotId}/${SessionId}`,
        data,
      );
      toast.success("Player removed successfully");
      setDetailsModalOpen(false);
      if (typeof onActionComplete === "function") {
        onActionComplete();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove player");
    } finally {
      setIsRemoving(false);
    }
  };

  const hasAssignedSession = Boolean(
    player?.session?._id || player?.sessionId || player?.session?.name,
  );

  const matchedSlot = slotDetails.find((item) => item?._id === playerSlotId);

  const availableSessions = (() => {
    if (
      selectedSlotId &&
      playerSlotId &&
      selectedSlotId === playerSlotId &&
      selectedSlotSessions.length > 0
    ) {
      return selectedSlotSessions;
    }

    if (
      Array.isArray(player?.slot?.sessions) &&
      player?.slot?.sessions.length > 0
    ) {
      return player.slot.sessions;
    }

    if (
      Array.isArray(matchedSlot?.sessions) &&
      matchedSlot.sessions.length > 0
    ) {
      return matchedSlot.sessions;
    }

    return [];
  })();

  const handleUpdateSessionAssignment = async () => {
    if (!auctionId || !playerId) {
      toast.error("Missing auction or player details");
      return;
    }

    if (!playerSlotId) {
      toast.error("No slot found for this player");
      return;
    }

    if (!assignSessionId) {
      toast.info("Please select a session");
      return;
    }

    try {
      setIsAssigningSession(true);
      await api.put("/webSiteApi/auctionSlot/updatePlayerSlotSession", {
        auctionId,
        playerId,
        slotId: playerSlotId,
        sessionId: assignSessionId,
      });

      toast.success("Session assigned successfully");
      setShowAssignSession(false);
      setAssignSessionId("");

      if (typeof onActionComplete === "function") {
        onActionComplete();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to assign session");
    } finally {
      setIsAssigningSession(false);
    }
  };

  // For mode === "select"
  if (mode === "select") {
    return (
      <>
        <div className="group flex w-full flex-col items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-1.5 shadow-[var(--shadow-card)] transition hover:border-[var(--border-primary)]">
          <div className="relative">
            {showActions && (
              <div
                onClick={handleSelect}
                className={`absolute right-1 top-1 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-md"
                    : "border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-primary)]"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </div>
            )}

            <div
              onClick={handleViewDetails}
              className={`h-20 w-20 overflow-hidden rounded-lg border transition-all cursor-pointer sm:h-20 sm:w-20 ${
                isSelected
                  ? "border-emerald-500 ring-2 ring-emerald-400"
                  : "border-[var(--border-card)] group-hover:border-[var(--border-primary)]"
              }`}
            >
              {!imageError && playerImage && !isDummyImage(playerImage) ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={playerImage}
                  alt={playerName}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-xl font-bold text-white ${getGradientByName(
                    playerName,
                  )}`}
                >
                  {initials}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleViewDetails}
              className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/45 opacity-0 transition group-hover:opacity-100"
              title="View player details"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-card)] text-[var(--primary)] shadow">
                <Eye className="h-4 w-4" />
              </span>
            </button>

            {role && (
              <span className="absolute bottom-1 left-1 max-w-[calc(100%-0.5rem)] truncate rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[9px] font-bold leading-3 text-[#102033] shadow">
                {role}
              </span>
            )}
          </div>

          <div className="min-w-0 max-w-full text-center">
            <p className="w-full truncate text-[11px] font-semibold leading-4 text-[var(--text-primary)]">
              {playerName}
            </p>
            {playerBatchId && (
              <p className="truncate text-[10px] leading-3 text-[var(--text-secondary)]">
                {playerBatchId}
              </p>
            )}
          </div>
        </div>

        <PlayerDetailsModal
          player={player}
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          selector={selector}
          onEdit={handleEditPlayer}
          onDelete={handleRemovePlayer}
          isSaving={isSaving}
          isRemoving={isRemoving}
          type={type}
          onRatePlayer={onRatePlayer}
          onGradePlayer={onGradePlayer}
          // onRemoveSession={handleRemoveFromSession}
        />
      </>
    );
  }

  // For mode === "assigned"
  if (mode === "assigned") {
    const assign = player?.session || {};
    const location = player?.slot?.location || {};
    const rating = Number(player?.playersRatings?.avgRating || 0);
    const canAssignSession = !hasAssignedSession && !!playerSlotId;
    const directSelected = player?.directSelected || false;
    const grade = player?.directSelectedGrade || null;

    return (
      <>
        <div
          className={` relative group flex w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-[var(--bg-card)] shadow-md transition-all duration-300 hover:shadow-lg ${
            isSelected
              ? "border-emerald-500 ring-2 ring-emerald-500/25"
              : "border-[var(--border-card)] hover:border-[var(--border-primary)]"
          }`}
        >
          {rating > 0 && (
            <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              <Star className="h-3 w-3 fill-current" />
              {rating.toFixed(1)}
              {/* Ya agar grade dikhana ho to: A+ */}
            </div>
          )}

           {directSelected && (
            <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              <Star className="h-3 w-3 fill-current" />
              {grade}
              {/* Ya agar grade dikhana ho to: A+ */}
            </div>
          )}
          
          <div className="flex gap-3 p-3">
            <button
              type="button"
              onClick={handleViewDetails}
              className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--border-card)] text-left transition group-hover:border-[var(--border-primary)]"
              title="View player details"
            >
              {!imageError && playerImage && !isDummyImage(playerImage) ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={playerImage}
                  alt={playerName}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-xl font-bold text-[var(--text-dark)] ${getGradientByName(
                    playerName,
                  )}`}
                >
                  {initials}
                </div>
              )}

              {role && (
                <span
                  className={`absolute bottom-1 right-1 max-w-[calc(100%-0.5rem)] truncate rounded-full px-2 py-0.5 text-[9px] font-semibold shadow ${
                    role?.toLowerCase() === "batsman"
                      ? "bg-blue-600 text-[var(--text-dark)]"
                      : role?.toLowerCase() === "bowler"
                        ? "bg-red-600 text-[var(--text-dark)]"
                        : role?.toLowerCase() === "all-rounder" ||
                            role?.toLowerCase() === "allrounder"
                          ? "bg-orange-500 text-[var(--text-dark)]"
                          : "bg-purple-500 text-[var(--text-dark)]"
                  }`}
                >
                  {role}
                </span>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 truncate text-sm font-semibold leading-tight text-[var(--text-primary)]">
                  {playerName}
                </h3>
                <div className="flex shrink-0 items-center gap-1">
                  {onSelect && (
                    <button
                      type="button"
                      onClick={handleSelect}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-emerald-500 hover:text-emerald-500"
                      }`}
                      title={isSelected ? "Deselect player" : "Select player"}
                      aria-label={
                        isSelected ? "Deselect player" : "Select player"
                      }
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {canAssignSession && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAssignSession(true);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-300 bg-amber-400 text-[#102033] transition hover:bg-amber-500"
                      title="Assign session"
                      aria-label="Assign session"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleViewDetails}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                    title="View player details"
                    aria-label="View player details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {location?.venue && (
                <div className="mt-1 flex min-w-0 items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0 text-pink-500" />
                  <span className="truncate text-xs text-[var(--text-primary)]">
                    {location.venue}
                  </span>
                </div>
              )}

              {assign?.slotStartTime ? (
                <div className="mt-1 flex min-w-0 items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0 text-green-600" />
                  <span className="truncate text-xs text-[var(--text-secondary)]">
                    {formatTime(assign.slotStartTime)} -{" "}
                    {formatTime(assign.slotEndTime)}
                  </span>
                </div>
              ) : canAssignSession ? (
                <div className="mt-1 flex min-w-0 items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0 text-amber-500" />
                  <span className="truncate text-xs font-medium text-amber-600">
                    Session not assigned
                  </span>
                </div>
              ) : null}

              {/* {rating > 0 && (
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    Rating: {rating.toFixed(2)}
                  </span>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {canAssignSession &&
          showAssignSession &&
          typeof document !== "undefined" &&
          createPortal(
            <div className="fixed inset-0 z-[120000] flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-sm rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-[var(--text-primary)]">
                      Assign Session
                    </h3>
                    <p className="truncate text-xs text-[var(--text-secondary)]">
                      {playerName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignSession(false);
                      setAssignSessionId("");
                    }}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <select
                  value={assignSessionId}
                  onChange={(e) => setAssignSessionId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)]"
                >
                  <option value="">Select Session</option>
                  {availableSessions.map((session) => (
                    <option key={session?._id} value={session?._id}>
                      {session?.name}
                    </option>
                  ))}
                </select>

                {availableSessions.length === 0 && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    No sessions found for this slot.
                  </p>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignSession(false);
                      setAssignSessionId("");
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border-card)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateSessionAssignment}
                    disabled={isAssigningSession || !assignSessionId}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAssigningSession ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

        <PlayerDetailsModal
          player={player}
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          selector={selector}
          onEdit={handleEditPlayer}
          onDelete={handleRemovePlayer}
          isSaving={isSaving}
          isRemoving={isRemoving}
          type={type}
          onRemoveSession={handleRemoveFromSession}
          onRatePlayer={onRatePlayer}
          onGradePlayer={onGradePlayer}
          directSelected={ directSelected}
          grade={grade}
        />
      </>
    );
  }

  // Default view mode
  return (
    <>
      <div className="group flex w-full flex-col items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-1.5 shadow-[var(--shadow-card)] transition hover:border-[var(--border-primary)]">
        <div className="relative">
          <div
            onClick={handleViewDetails}
            className="h-20 w-20 cursor-pointer overflow-hidden rounded-lg border border-[var(--border-card)] transition group-hover:border-[var(--border-primary)] sm:h-20 sm:w-20"
          >
            {!imageError && playerImage && !isDummyImage(playerImage) ? (
              <img
                loading="lazy"
                decoding="async"
                src={playerImage}
                alt={playerName}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-xl font-bold text-white ${getGradientByName(
                  playerName,
                )}`}
              >
                {initials}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleViewDetails}
            className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/45 opacity-0 transition group-hover:opacity-100"
            title="View player details"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-card)] text-[var(--primary)] shadow">
              <Eye className="h-4 w-4" />
            </span>
          </button>

          {role && (
            <span className="absolute bottom-1 left-1 max-w-[calc(100%-0.5rem)] truncate rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[9px] font-bold leading-3 text-[#102033] shadow">
              {role}
            </span>
          )}
        </div>

        <p className="w-full truncate text-center text-[11px] font-semibold leading-4 text-[var(--text-primary)]">
          {playerName}
        </p>
        {playerBatchId && (
          <p className="w-full truncate text-center text-[10px] leading-3 text-[var(--text-secondary)]">
            {playerBatchId}
          </p>
        )}

        {showActions && (
          <div className="mt-1 flex gap-1">
            {onAssign && (
              <button
                type="button"
                onClick={() => onAssign && onAssign(player)}
                className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Assign
              </button>
            )}
          </div>
        )}
      </div>

      <PlayerDetailsModal
        player={player}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        selector={selector}
        onEdit={handleEditPlayer}
        onDelete={handleRemovePlayer}
        isSaving={isSaving}
        isRemoving={isRemoving}
        type={type}
        onRatePlayer={onRatePlayer}
        onGradePlayer={onGradePlayer}
      />
    </>
  );
};

export default PlayerCard;
