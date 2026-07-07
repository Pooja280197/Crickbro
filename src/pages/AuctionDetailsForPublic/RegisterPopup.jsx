import React, { useEffect, useRef, useState } from "react";
import {
  fetchProfile,
  fetchSlotList,
  fetchSlotSessions,
} from "../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Clock,
  Upload,
  User,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  X,
} from "lucide-react";
import {
  isValidJerseySize,
  normalizeJerseySize,
  JERSEY_SIZE_HINT,
} from "../../utils/jerseySizes";

const DUMMY_IMAGE =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

const PLAYER_ROLES = [
  { value: "batsman", label: "Batsman" },
  { value: "bowler", label: "Bowler" },
  { value: "all-rounder", label: "All-Rounder" },
  // { value: "wicketkeeper", label: "Wicketkeeper" },
  // { value: "right-hand batsman", label: "Right-Hand Batsman" },
  // { value: "left-hand batsman", label: "Left-Hand Batsman" },
  { value: "wicketkeeper-batsman", label: "Wicketkeeper-Batsman" },
  // { value: "right-arm fast bowler", label: "Right-Arm Fast Bowler" },
  // { value: "left-arm fast bowler", label: "Left-Arm Fast Bowler" },
  // { value: "right-arm spinner", label: "Right-Arm Spinner" },
  // { value: "left-arm spinner", label: "Left-Arm Spinner" },
];

const getRoleFeeKey = (role) => {
  const value = String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (value.includes("wicketkeeper") || value === "keeper")
    return "wicketKeeper";
  if (value.includes("allrounder")) return "allRounder";
  if (value.includes("bowler")) return "bowler";
  return "batsman";
};

const formatRoleFee = (fee) => {
  const amount = Number(fee || 0);
  return `₹${amount.toLocaleString("en-IN")}`;
};

const COUNTRY_CODES = [
  { code: "+91", label: "IND", flag: "🇮🇳" },
  { code: "+1", label: "USA", flag: "🇺🇸" },
  { code: "+44", label: "UK", flag: "🇬🇧" },
  { code: "+61", label: "AUS", flag: "🇦🇺" },
];

const DEFAULT_PLAYER_REGISTRATION_FIELDS = {
  profilePicture: true,
  name: true,
  role: true,
  mobileNumber: true,
  location: true,
  email: false,
  dateOfBirth: false,
  gender: false,
  jerseyNumber: true,
  jerseyName: true,
  jerseySize: true,
  lowerSize: false,
  adharCard: false,
  voterId: false,
};

const RegisterPopup = ({
  isOpen,
  onClose,
  onConfirm,
  auctionId,
  isTrialType,
  playerRegistrationFiels,
  feeType = "default",
  roleBasedFees = {},
}) => {
  const dispatch = useDispatch();
  const ProfileData = useSelector((state) => state.data?.profile || null);
  const slotLoading = useSelector((state) => state?.loading?.slotList);
  const sessionLoading = useSelector((state) => state?.loading?.sessions);
  const slotList = useSelector((state) => state?.data?.slotList);
  const sessionsdata = useSelector((state) => state?.data?.sessions);
  // const auctionSlots = slotsdata?.data;
  const sessions = sessionsdata?.sessions;
  const fieldRefs = useRef({});

  // const slotList = data?.slotList || {};
  const auctionSlots = slotList?.data || [];
  const total = slotList?.total || 0;
  // const slotLoading = loading?.slotList;

  const [form, setForm] = useState({
    profilePicture: null,
    name: "",
    mobile: "",
    countryCode: "+91",
    location: "",
    playerRole: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    jerseyNumber: "",
    jerseyName: "",
    jerseySize: "",
    lowerSize: "",
    adharCard: null,
    voterId: null,
  });

  const registrationFieldConfig = {
    ...DEFAULT_PLAYER_REGISTRATION_FIELDS,
    ...(playerRegistrationFiels || {}),
    profilePicture: true,
    name: true,
    mobileNumber: true,
    role: true,
  };
  const isFieldEnabled = (field) => !!registrationFieldConfig?.[field];
  const isRoleBasedFee = feeType === "roleBased";
  const getRoleOptionLabel = (role) => {
    if (!isRoleBasedFee) return role.label;
    const feeKey = getRoleFeeKey(role.value);
    return `${role.label} - ${formatRoleFee(roleBasedFees?.[feeKey])}`;
  };

  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [errors, setErrors] = useState({});
  const [allSlots, setAllSlots] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const availableSessions = Array.isArray(sessions) ? sessions : [];
  const isSessionRequired = Boolean(
    isTrialType && selectedSlot && availableSessions.length > 0,
  );
  const isConfirmDisabled = Boolean(
    isTrialType &&
    (!selectedSlot ||
      sessionLoading ||
      (isSessionRequired && !selectedSession)),
  );

  // const slotLoading = loading?.slotList;

  useEffect(() => {
    dispatch(fetchProfile(localStorage.getItem("playerId")));
    dispatch(fetchSlotList(auctionId, 1, 20));
  }, [dispatch, auctionId]);

  const getSelectedRole = (roleBooleans = {}) => {
    return (
      Object.keys(roleBooleans).find((r) => roleBooleans[r] === true) || ""
    );
  };
  useEffect(() => {
    const delay = setTimeout(() => {
      dispatch(fetchSlotList(auctionId, 1, 20, search));
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    if (!auctionSlots) return;

    if (page === 1) {
      setAllSlots(auctionSlots); // reset on new search
    } else {
      setAllSlots((prev) => [...prev, ...auctionSlots]); // append
    }
  }, [auctionSlots]);

  useEffect(() => {
    if (ProfileData) {
      const populated = {
        profilePicture: ProfileData?.profilePicture || null,
        name: ProfileData?.name || "",
        mobile: ProfileData?.mobile || "",
        countryCode: ProfileData?.countryCode || "+91",
        location: ProfileData?.location || "",
        playerRole: ProfileData?.playerRole || "",
        email: ProfileData?.email || "",
        dateOfBirth: ProfileData?.dateOfBirth || "",
        gender: ProfileData?.gender || "",
        jerseyNumber: ProfileData?.jerseyNumber || "",
        jerseyName: ProfileData?.jerseyName || "",
        jerseySize: ProfileData?.jerseySize || "",
        lowerSize: ProfileData?.lowerSize || "",
        adharCard: ProfileData?.adharCard || null,
        voterId: ProfileData?.voterId || null,
      };

      setForm(populated);
    }
  }, [ProfileData, auctionId, dispatch]);

  if (!isOpen) return null;

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const registerFieldRef = (fieldName) => (element) => {
    if (element) {
      fieldRefs.current[fieldName] = element;
    }
  };

  const focusFirstInvalidField = (validationErrors) => {
    const priority = [
      "profilePicture",
      "name",
      "location",
      "jerseyNumber",
      "jerseyName",
      "jerseySize",
      "lowerSize",
      "mobile",
      "playerRole",
      "selectedSlot",
      "selectedSession",
    ];

    const firstErrorField = priority.find((field) => validationErrors[field]);
    if (!firstErrorField) return;

    const target = fieldRefs.current[firstErrorField];
    if (target?.scrollIntoView) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (target?.focus) {
      target.focus();
    }
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) update("mobile", value);
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      isFieldEnabled("profilePicture") &&
      (!form.profilePicture || form.profilePicture === DUMMY_IMAGE)
    ) {
      newErrors.profilePicture = "Profile image is required";
    }

    if (isFieldEnabled("name") && (!form.name || form.name.trim().length < 3)) {
      newErrors.name = "Full name must be at least 3 characters";
    }

    if (isFieldEnabled("role") && !form.playerRole) {
      newErrors.playerRole = "Please select player role";
    }

    if (
      isFieldEnabled("mobileNumber") &&
      (!form.mobile || form.mobile.length !== 10)
    ) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (
      isFieldEnabled("location") &&
      (!form.location || form.location.trim().length < 2)
    ) {
      newErrors.location = "Location is required";
    }

    if (
      isFieldEnabled("email") &&
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (
      isFieldEnabled("jerseyNumber") &&
      form.jerseyNumber &&
      (Number(form.jerseyNumber) < 0 || Number(form.jerseyNumber) > 999)
    ) {
      newErrors.jerseyNumber = "Jersey number must be between 0 and 999";
    }

    if (
      isFieldEnabled("jerseyName") &&
      form.jerseyName &&
      form.jerseyName.trim().length < 2
    ) {
      newErrors.jerseyName = "Jersey name must be at least 2 characters";
    }

    if (
      isFieldEnabled("jerseySize") &&
      form.jerseySize &&
      !isValidJerseySize(form.jerseySize)
    ) {
      newErrors.jerseySize = `Jersey size must be one of: ${JERSEY_SIZE_HINT}`;
    }

    if (isTrialType) {
      if (!selectedSlot) {
        newErrors.selectedSlot = "Please select a trial location";
      }
      if (isSessionRequired && !selectedSession) {
        newErrors.selectedSession = "Please select a trial time slot";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields");
      setTimeout(() => focusFirstInvalidField(newErrors), 0);
      return false;
    }

    return true;
  };

  const getPreviewImage = () => {
    if (!form.profilePicture) return null;
    if (typeof form.profilePicture === "string") return form.profilePicture;
    return URL.createObjectURL(form.profilePicture);
  };

  const fetchSessions = async (slotId) => {
    setSelectedSession("");
    try {
      await dispatch(fetchSlotSessions(slotId));
    } catch (error) {
      console.log("Error fetching sessions:", error);
      toast.error("Failed to fetch shift times");
    }
  };

  const handleSlotChange = (slotId) => {
    setSelectedSlot(slotId);
    setSelectedSession("");
    if (slotId) {
      fetchSessions(slotId);
    }
  };

  const handleSubmit = () => {
    const isValid = validateForm();
    if (!isValid) return;

    const hasProfileImageFile =
      form.profilePicture && typeof form.profilePicture !== "string";
    const hasAdharCardFile =
      form.adharCard && typeof form.adharCard !== "string";
    const hasVoterIdFile = form.voterId && typeof form.voterId !== "string";
    const hasAnyFileUpload =
      hasProfileImageFile || hasAdharCardFile || hasVoterIdFile;

    const basePayload = {
      auctionId,
      mobile: String(form.mobile || ""),
      countryCode: form.countryCode || "+91",
    };

    if (isFieldEnabled("name")) basePayload.name = String(form.name || "");
    if (isFieldEnabled("location"))
      basePayload.location = String(form.location || "");
    if (isFieldEnabled("role"))
      basePayload.playerRole = String(form.playerRole || "");
    if (isFieldEnabled("email")) basePayload.email = String(form.email || "");
    if (isFieldEnabled("dateOfBirth"))
      basePayload.dateOfBirth = String(form.dateOfBirth || "");
    if (isFieldEnabled("gender"))
      basePayload.gender = String(form.gender || "");
    if (isFieldEnabled("jerseyNumber") && form.jerseyNumber) {
      basePayload.jerseyNumber = String(form.jerseyNumber);
    }
    if (isFieldEnabled("jerseyName") && form.jerseyName?.trim()) {
      basePayload.jerseyName = String(form.jerseyName);
    }
    if (isFieldEnabled("jerseySize") && form.jerseySize) {
      basePayload.jerseySize = normalizeJerseySize(form.jerseySize);
    }
    if (isFieldEnabled("lowerSize"))
      basePayload.lowerSize = String(form.lowerSize || "");

    if (
      isFieldEnabled("adharCard") &&
      typeof form.adharCard === "string" &&
      form.adharCard.trim()
    ) {
      basePayload.adharCard = form.adharCard;
    }

    if (
      isFieldEnabled("voterId") &&
      typeof form.voterId === "string" &&
      form.voterId.trim()
    ) {
      basePayload.voterId = form.voterId;
    }

    if (isTrialType) {
      basePayload.slotId = selectedSlot;
      if (selectedSession) {
        basePayload.sessionId = selectedSession;
      }
    }

    if (hasAnyFileUpload) {
      const formData = new FormData();
      Object.entries(basePayload).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (hasProfileImageFile && isFieldEnabled("profilePicture")) {
        formData.append("profilePicture", form.profilePicture);
      }
      if (hasAdharCardFile && isFieldEnabled("adharCard")) {
        formData.append("adharCard", form.adharCard);
      }
      if (hasVoterIdFile && isFieldEnabled("voterId")) {
        formData.append("voterId", form.voterId);
      }

      onConfirm(formData);
      return;
    }

    onConfirm(basePayload);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (time) => {
    if (!time || typeof time !== "string" || !time.includes(":")) return "";
    const [hour, minute] = time.split(":");
    const h = Number(hour);
    if (Number.isNaN(h) || !minute) return "";
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${minute} ${ampm}`;
  };

  const getSessionOptionLabel = (session) => {
    const sessionName = session?.name || "Session";
    const formattedDate = formatDate(session?.slotDate);
    const startTime = formatTime(session?.slotStartTime);
    const endTime = formatTime(session?.slotEndTime);

    const hasDate = Boolean(formattedDate);
    const hasTimeRange = Boolean(startTime && endTime);
    const hasPartialTime = Boolean(startTime || endTime);

    if (!hasDate && !hasPartialTime) return sessionName;
    if (hasDate && hasTimeRange) {
      return `${sessionName} - ${formattedDate} (${startTime} - ${endTime})`;
    }
    if (hasDate) return `${sessionName} - ${formattedDate}`;
    if (hasTimeRange) return `${sessionName} (${startTime} - ${endTime})`;
    if (startTime) return `${sessionName} (${startTime})`;
    if (endTime) return `${sessionName} (${endTime})`;
    return sessionName;
  };

  console.log("sessions", availableSessions);
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-card)] bg-[var(--bg-main)] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-[var(--text-primary)]">
                  Player Registration
                </h2>
                <p className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">
                  Fill your details for auction registration
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-2 transition-colors hover:bg-[var(--accent-light)]"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* Form Content */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[var(--bg-main)] p-3 [scrollbar-color:var(--border-primary)_transparent] [scrollbar-width:thin] sm:p-4">
            {/* Profile Picture */}
            {isFieldEnabled("profilePicture") && (
              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4">
                <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-3 text-center sm:mb-0 sm:text-left">
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      Profile Photo
                    </p>
                    <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                      Upload a clear player image for registration.
                    </p>
                  </div>
                  <div
                    className={`relative h-20 w-20 rounded-xl border-2 ${
                      !form.profilePicture ||
                      form.profilePicture === DUMMY_IMAGE
                        ? "border-red-500"
                        : "border-[var(--border-primary)]"
                    }`}
                  >
                    {getPreviewImage() ? (
                      <img
                        src={getPreviewImage()}
                        alt="profile"
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-xl bg-[var(--accent-light)]">
                        <User className="w-10 h-10 text-[var(--text-secondary)]" />
                      </div>
                    )}
                    <label className="absolute -bottom-2 -right-2 cursor-pointer rounded-lg bg-[var(--primary)] p-2 text-white shadow-md transition-all hover:scale-105 hover:bg-[var(--color-button-primary-hover)]">
                      <span
                        ref={registerFieldRef("profilePicture")}
                        tabIndex={-1}
                      />
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          update("profilePicture", e.target.files[0]);
                          e.target.value = null;
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                {errors.profilePicture && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.profilePicture}
                  </p>
                )}
              </div>
            )}

            {/* Name & Location */}
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 md:grid-cols-2">
              {isFieldEnabled("name") && (
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    ref={registerFieldRef("name")}
                    type="text"
                    placeholder="Enter your full name"
                    className={`h-10 w-full rounded-lg border px-3 text-sm ${
                      !form.name
                        ? "border-red-500"
                        : "border-[var(--border-card)]"
                    } bg-[var(--bg-main)] text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20`}
                    value={form.name}
                    onChange={(e) => {
                      update("name", e.target.value);
                    }}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
              )}

              {isFieldEnabled("location") && (
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    ref={registerFieldRef("location")}
                    type="text"
                    placeholder="Your city"
                    className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>
              )}
            </div>

            {(isFieldEnabled("email") ||
              isFieldEnabled("dateOfBirth") ||
              isFieldEnabled("gender")) && (
              <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 md:grid-cols-3">
                {isFieldEnabled("email") && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                )}

                {isFieldEnabled("dateOfBirth") && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      value={form.dateOfBirth}
                      onChange={(e) => update("dateOfBirth", e.target.value)}
                    />
                  </div>
                )}

                {isFieldEnabled("gender") && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                      Gender
                    </label>
                    <select
                      className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      value={form.gender}
                      onChange={(e) => update("gender", e.target.value)}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Jersey Details */}
            {(isFieldEnabled("jerseyNumber") ||
              isFieldEnabled("jerseyName") ||
              isFieldEnabled("jerseySize") ||
              isFieldEnabled("lowerSize")) && (
              <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 md:grid-cols-3">
                {isFieldEnabled("jerseyNumber") && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                      Jersey Number
                    </label>
                    <input
                      ref={registerFieldRef("jerseyNumber")}
                      type="number"
                      placeholder="e.g. 10"
                      className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      value={form.jerseyNumber}
                      onChange={(e) => update("jerseyNumber", e.target.value)}
                    />
                    {errors.jerseyNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.jerseyNumber}
                      </p>
                    )}
                  </div>
                )}
                {isFieldEnabled("jerseyName") && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                      Jersey Name
                    </label>
                    <input
                      ref={registerFieldRef("jerseyName")}
                      type="text"
                      placeholder="Name on jersey"
                      className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      value={form.jerseyName}
                      onChange={(e) => update("jerseyName", e.target.value)}
                    />
                    {errors.jerseyName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.jerseyName}
                      </p>
                    )}
                  </div>
                )}
                {isFieldEnabled("jerseySize") && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                      Jersey Size
                    </label>
                    <select
                      ref={registerFieldRef("jerseySize")}
                      className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      value={form.jerseySize}
                      onChange={(e) => update("jerseySize", e.target.value)}
                    >
                      <option value="">Select jersey size</option>
                      {["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ),
                      )}
                    </select>
                    {errors.jerseySize && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.jerseySize}
                      </p>
                    )}
                  </div>
                )}
                {isFieldEnabled("lowerSize") && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                      Lower Size
                    </label>
                    <select
                      ref={registerFieldRef("lowerSize")}
                      className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      value={form.lowerSize}
                      onChange={(e) => update("lowerSize", e.target.value)}
                    >
                      <option value="">Select lower size</option>
                      {["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                )}
              </div>
            )}

            {(isFieldEnabled("adharCard") || isFieldEnabled("voterId")) && (
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 md:grid-cols-2">
                {isFieldEnabled("adharCard") && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                      Aadhaar Card
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)]"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        update("adharCard", file);
                        e.target.value = null;
                      }}
                    />
                    {typeof form.adharCard === "string" && form.adharCard ? (
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Aadhaar already uploaded
                      </p>
                    ) : null}
                  </div>
                )}
                {isFieldEnabled("voterId") && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                      Voter ID
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)]"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        update("voterId", file);
                        e.target.value = null;
                      }}
                    />
                    {typeof form.voterId === "string" && form.voterId ? (
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Voter ID already uploaded
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Number */}
            {isFieldEnabled("mobileNumber") && (
              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3">
                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                  <Phone className="w-4 h-4" />
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <select
                    ref={registerFieldRef("countryCode")}
                    className="h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    value={form.countryCode}
                    onChange={(e) => update("countryCode", e.target.value)}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label} ({c.code})
                      </option>
                    ))}
                  </select>

                  <input
                    ref={registerFieldRef("mobile")}
                    type="text"
                    placeholder="10-digit mobile number"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    value={form.mobile}
                    onChange={handleMobileChange}
                    inputMode="numeric"
                    readOnly
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                )}
              </div>
            )}

            {/* Player Role */}
            {isFieldEnabled("role") && (
              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3">
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                  Player Role
                </label>
                <select
                  ref={registerFieldRef("playerRole")}
                  className={`h-10 w-full rounded-lg border px-3 text-sm ${
                    !form.playerRole
                      ? "border-red-500"
                      : "border-[var(--border-card)]"
                  } bg-[var(--bg-main)] text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20`}
                  value={form.playerRole}
                  onChange={(e) => {
                    update("playerRole", e.target.value);
                  }}
                >
                  <option value="">Select your role</option>
                  {PLAYER_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {getRoleOptionLabel(role)}
                    </option>
                  ))}
                </select>
                {errors.playerRole && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.playerRole}
                  </p>
                )}
              </div>
            )}

            {/* Trial Preference Section */}
            {isTrialType && (
              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--primary)]" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Trial Preference
                  </h3>
                </div>
                <p className="mb-3 text-xs font-medium text-[var(--text-secondary)]">
                  Select where and when you want to give your trials
                </p>

                {/* Location Selection */}
                {/* <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Trial Location
                  </label>
                  
                  <div className="relative">
                    <select
                      ref={registerFieldRef("selectedSlot")}
                      value={selectedSlot}
                      onChange={(e) => handleSlotChange(e.target.value)}
                      disabled={slotLoading}
                      className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-2.5 text-[var(--text-primary)] outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">
                        {slotLoading
                          ? "Loading locations..."
                          : "Choose trial location"}
                      </option>
                      {!slotLoading && auctionSlots?.length === 0 && (
                        <option disabled>No locations available</option>
                      )}
                      {auctionSlots?.map((slot) => (
                        <option key={slot._id} value={slot._id}>
                          {slot.slotName}
                        </option>
                      ))}
                    </select>
                    {errors.selectedSlot && (
                      <p className="text-red-500 text-xs mt-1">{errors.selectedSlot}</p>
                    )}
                  </div>
                </div> */}
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                    Trial Location
                  </label>

                  <div className="relative">
                    {/* Input */}
                    <input
                      ref={registerFieldRef("selectedSlot")}
                      type="text"
                      placeholder="Choose or search location..."
                      value={search}
                      onFocus={() => setDropdownOpen(true)}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                        dispatch(
                          fetchSlotList(auctionId, 1, 20, e.target.value),
                        );
                      }}
                      className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />

                    {/* Dropdown */}
                    {dropdownOpen && (
                      <div
                        className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]"
                        onScroll={(e) => {
                          const bottom =
                            e.target.scrollHeight - e.target.scrollTop <=
                            e.target.clientHeight + 5;

                          if (
                            bottom &&
                            !slotLoading &&
                            allSlots.length < total
                          ) {
                            const nextPage = page + 1;
                            setPage(nextPage);
                            dispatch(
                              fetchSlotList(auctionId, nextPage, 20, search),
                            );
                          }
                        }}
                      >
                        {allSlots.map((slot) => (
                          <div
                            key={slot._id}
                            onClick={() => {
                              setSelectedSlot(slot._id);
                              setSearch(slot.slotName);
                              setDropdownOpen(false);
                              setSelectedSession("");
                              fetchSessions(slot._id);
                            }}
                            className="cursor-pointer p-2 text-[var(--text-primary)] hover:bg-[var(--accent-light)]"
                          >
                            {slot.slotName}
                          </div>
                        ))}

                        {slotLoading && (
                          <p className="p-2 text-xs text-center">Loading...</p>
                        )}

                        {!slotLoading && allSlots.length === 0 && (
                          <p className="p-2 text-sm text-[var(--text-secondary)]">
                            No locations found
                          </p>
                        )}
                      </div>
                    )}

                    {/* Error */}
                    {errors.selectedSlot && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.selectedSlot}
                      </p>
                    )}
                  </div>
                </div>
                {/* Session Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-[var(--primary)]" />
                    <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                      Preferred Time
                    </label>
                  </div>

                  <select
                    ref={registerFieldRef("selectedSession")}
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    disabled={!selectedSlot || sessionLoading}
                    className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {!selectedSlot
                        ? "Select location first"
                        : sessionLoading
                          ? "Loading available times..."
                          : availableSessions.length > 0
                            ? "Choose trial time"
                            : "No times available"}
                    </option>
                    {/* {availableSessions.map((session) => (
                      <option key={session._id} value={session._id}>
                        {session.name} - {formatDate(session.slotDate)} (
                        {formatTime(session.slotStartTime)} -{" "}
                        {formatTime(session.slotEndTime)})
                      </option>
                    ))} */}

                    {availableSessions?.map((session) => (
                      <option
                        key={session._id}
                        value={session._id}
                  
                      >
                        {getSessionOptionLabel(session)}
                      </option>
                    ))}
                  </select>
                  {errors.selectedSession && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.selectedSession}
                    </p>
                  )}

                  {/* Status Messages */}
                  {!selectedSlot && (
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Please select a location first
                    </p>
                  )}

                  {sessionLoading && selectedSlot && (
                    <p className="text-sm text-[var(--primary)] mt-2 animate-pulse">
                      Loading available times...
                    </p>
                  )}

                  {selectedSlot &&
                    !sessionLoading &&
                    availableSessions.length === 0 && (
                      <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600">
                          No shift times available for this location
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="shrink-0 border-t border-[var(--border-card)] bg-[var(--bg-card)] p-4">
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-lg border border-[var(--border-card)] px-4 py-2.5 font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                disabled={isConfirmDisabled}
                className={`flex-1 rounded-lg px-4 py-2.5 font-semibold transition-all ${
                  isConfirmDisabled
                    ? "cursor-not-allowed bg-[var(--bg-main)] text-[var(--text-muted)]"
                    : "bg-[var(--primary)] text-white shadow-md hover:bg-[var(--primary-strong)] hover:shadow-lg"
                }`}
                onClick={handleSubmit}
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPopup;
