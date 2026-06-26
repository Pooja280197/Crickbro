import React, { useEffect, useState } from "react";
import { Camera, FileImage, Loader2, Save, User, X } from "lucide-react";

const PLAYER_ROLES = [
  { value: "batsman", label: "Batsman" },
  { value: "bowler", label: "Bowler" },
  { value: "all-rounder", label: "All-Rounder" },
  { value: "wicketkeeper-batsman", label: "Wicketkeeper-Batsman" },
];

const sizeOptions = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)] focus:shadow-[0_0_0_3px_rgba(23,105,224,0.12)] disabled:cursor-not-allowed disabled:opacity-70";
const labelClass =
  "mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]";
const panelClass =
  "rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]";

const normalizeGenderValue = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

const numericFields = new Set(["countryCode", "mobile", "jerseyNumber"]);

const sanitizeNumericInput = (name, value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return name === "countryCode" ? `+${digits}` : digits;
};

const EditProfile = ({ isOpen, onClose, onSubmit, editData, profile }) => {
  const [formData, setFormData] = useState({
    profilePicture: null,
    name: "",
    mobile: "",
    countryCode: "+91",
    location: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    playerRole: "",
    jerseyNumber: "",
    jerseyName: "",
    jerseySize: "",
    lowerSize: "",
    adharCard: null,
    voterId: null,
  });

  const [adharPreview, setAdharPreview] = useState(null);
  const [voterPreview, setVoterPreview] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = editData || profile;

    if (data) {
      setFormData({
        profilePicture: data.profilePicture || null,
        name: data.name || "",
        mobile: data.mobile || "",
        countryCode: data.countryCode || "+91",
        location: data.location || "",
        email: data.email || "",
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : "",
        gender: normalizeGenderValue(data.gender),
        playerRole: data.playerRole || "",
        jerseyNumber: data.jerseyNumber || "",
        jerseyName: data.jerseyName || "",
        jerseySize: data.jerseySize || "",
        lowerSize: data.lowerSize || "",
        adharCard: data.adharCard || null,
        voterId: data.voterId || null,
      });

      if (typeof data.profilePicture === "string") setPreview(data.profilePicture);
      if (typeof data.adharCard === "string") setAdharPreview(data.adharCard);
      if (typeof data.voterId === "string") setVoterPreview(data.voterId);
    }
  }, [editData, profile]);

  useEffect(() => {
    return () => {
      if (preview && typeof formData.profilePicture !== "string") {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, formData.profilePicture]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, profilePicture: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = numericFields.has(name)
      ? sanitizeNumericInput(name, value)
      : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleFileChange = (key, setPreviewFn) => (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, [key]: file }));
    setPreviewFn(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const hasFiles =
        (formData.profilePicture && typeof formData.profilePicture !== "string") ||
        (formData.adharCard && typeof formData.adharCard !== "string") ||
        (formData.voterId && typeof formData.voterId !== "string");

      if (!hasFiles) {
        await onSubmit?.(
          {
            name: formData.name,
            mobile: formData.mobile,
            countryCode: formData.countryCode,
            location: formData.location,
            email: formData.email || "",
            dateOfBirth: formData.dateOfBirth || "",
            gender: formData.gender || "",
            playerRole: formData.playerRole,
            jerseyNumber: formData.jerseyNumber,
            jerseyName: formData.jerseyName,
            jerseySize: formData.jerseySize,
            lowerSize: formData.lowerSize || "",
          },
          false,
        );
      } else {
        const profileData = new FormData();
        [
          "name",
          "mobile",
          "countryCode",
          "location",
          "email",
          "dateOfBirth",
          "gender",
          "playerRole",
          "jerseyNumber",
          "jerseyName",
          "jerseySize",
          "lowerSize",
        ].forEach((key) => profileData.append(key, formData[key] || ""));

        if (formData.profilePicture && typeof formData.profilePicture !== "string") {
          profileData.append("profilePicture", formData.profilePicture);
        }
        if (formData.adharCard && typeof formData.adharCard !== "string") {
          profileData.append("adharCard", formData.adharCard);
        }
        if (formData.voterId && typeof formData.voterId !== "string") {
          profileData.append("voterId", formData.voterId);
        }

        await onSubmit?.(profileData, true);
      }

      onClose?.();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderDocumentUpload = (label, previewSrc, onChange) => (
    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
      <label className={labelClass}>{label}</label>
      {previewSrc ? (
        <img
          src={previewSrc}
          alt={label}
          className="mb-2 h-24 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] object-cover"
        />
      ) : (
        <div className="mb-2 flex h-24 items-center justify-center rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
          <FileImage size={22} />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="block w-full text-xs font-medium text-[var(--text-secondary)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--secondary)] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#102033]"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-5">
      <div className={`${panelClass} w-full max-w-3xl overflow-hidden`}>
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
              <User size={19} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Edit Profile
              </h2>
              <p className="mt-0.5 text-sm font-medium text-[var(--text-secondary)]">
                Update player details, kit info, and documents.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
            aria-label="Close edit profile"
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="professional-scrollbar max-h-[calc(100vh-9rem)] overflow-y-auto bg-[var(--bg-main)] p-4 sm:p-5"
        >
          <div className="mb-5 flex flex-col items-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4">
            <div className="relative h-24 w-24">
              {preview ? (
                <img
                  src={preview}
                  alt="profile"
                  className="h-full w-full rounded-lg border border-[var(--border-primary)] object-cover shadow-[var(--shadow-card)]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                  <User size={30} />
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-[var(--secondary)] text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)]">
                <Camera size={15} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-3 text-xs font-medium text-[var(--text-secondary)]">
              Upload a clear player photo
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Mobile Number *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  inputMode="numeric"
                  className={`${inputClass} !w-20 shrink-0 text-center sm:!w-24`}
                />
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  readOnly
                  inputMode="numeric"
                  className={`${inputClass} flex-1`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                name="location"
                placeholder="Enter city/location"
                value={formData.location}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Player Role *</label>
              <select
                name="playerRole"
                value={formData.playerRole}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Role</option>
                {PLAYER_ROLES.map((role) => (
                  <option key={role.label} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Jersey Number</label>
              <input
                type="text"
                name="jerseyNumber"
                placeholder="e.g. 10"
                value={formData.jerseyNumber}
                onChange={handleChange}
                inputMode="numeric"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Jersey Name</label>
              <input
                type="text"
                name="jerseyName"
                placeholder="Jersey Name"
                value={formData.jerseyName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Jersey Size</label>
              <select
                name="jerseySize"
                value={formData.jerseySize}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Jersey Size</option>
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Lower Size</label>
              <select
                name="lowerSize"
                value={formData.lowerSize}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Lower Size</option>
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {renderDocumentUpload(
              "Aadhar Card",
              adharPreview,
              handleFileChange("adharCard", setAdharPreview),
            )}
            {renderDocumentUpload(
              "Voter ID",
              voterPreview,
              handleFileChange("voterId", setVoterPreview),
            )}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[var(--border-card)] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-4 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
