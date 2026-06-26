import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, X, Clock, AlertCircle } from "lucide-react";
import api from "../../../../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchSlotList, fetchSlotSessions } from "../../../../redux/actions";
import { toast } from "react-toastify";
import { normalizeJerseySize } from "../../../../utils/jerseySizes";

const COUNTRY_CODES = [
  { code: "+91", label: "IND", flag: "🇮🇳" },
  { code: "+1", label: "USA", flag: "🇺🇸" },
  { code: "+44", label: "UK", flag: "🇬🇧" },
  { code: "+61", label: "AUS", flag: "🇦🇺" },
];

// const PLAYER_ROLES = [
//   "Batsman",
//   "Bowler",
//   "All-Rounder",
//   // "Right-Hand Batsman",
//   // "Left-Hand Batsman",
//   "Wicketkeeper-Batsman",
//   // "Right-Arm Fast Bowler",
//   // "Left-Arm Fast Bowler",
//   // "Right-Arm Spinner",
//   // "Left-Arm Spinner",
// ];
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

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];

const AddPlayerManually = ({ isOpen, onClose, auctionId, auctionTypeTrial }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [form, setForm] = useState({
    countryCode: "+91",
    mobile: "",
    name: "",
    location: "",
    playerRole: "",
    gender: "",
    jerseyNumber: "",
    jerseyName: "",
    jerseySize: "",
    lowerSize: "",
    slotId: "",
    sessionId: "",
    dob: "",
    email: "",
    adharCard: null,
    voterId: null,
    playerId: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const profilePicInputRef = useRef(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [adharCardFile, setAdharCardFile] = useState(null);
  const [voterIdFile, setVoterIdFile] = useState(null);

  const [allSlots, setAllSlots] = useState([]);
  const [slotPage, setSlotPage] = useState(1);
  const [hasMoreSlots, setHasMoreSlots] = useState(true);
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const slotLoading = useSelector((state) => state?.loading?.slotList);
  const sessionLoading = useSelector((state) => state?.loading?.sessions);
  const slotsdata = useSelector((state) => state?.data?.slotList);
  const sessionsdata = useSelector((state) => state?.data?.sessions);
  const auctionSlots = slotsdata?.data;
  const sessions = sessionsdata?.sessions;
  const hasAvailableSessions =
    Boolean(selectedSlot) &&
    !sessionLoading &&
    Array.isArray(sessions) &&
    sessions.length > 0;
  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(fetchSlotList(auctionId));
  // }, [dispatch, auctionId]);

  useEffect(() => {
    if (isOpen && auctionId) {
      setSearch(""); // optional reset
      setSlotPage(1);
      setHasMoreSlots(true);
      setProfilePic(null);
      setProfilePicPreview("");
      setAdharCardFile(null);
      setVoterIdFile(null);
      setSelectedSlot("");
      setSelectedSession("");
      setForm({
        countryCode: "+91",
        mobile: "",
        name: "",
        location: "",
        playerRole: "",
        gender: "",
        jerseyNumber: "",
        jerseyName: "",
        jerseySize: "",
        lowerSize: "",
        slotId: "",
        sessionId: "",
        dob: "",
        email: "",
        adharCard: null,
        voterId: null,
        playerId: "",
      });
      if (auctionTypeTrial) {
        dispatch(fetchSlotList(auctionId, 1, 20));
      }
    }
  }, [isOpen, auctionId, auctionTypeTrial, dispatch]);

  useEffect(() => {
    if (slotsdata?.data) {
      setAllSlots((prev) => {
        if (slotPage === 1) {
          return slotsdata.data; // replace on new search
        }
        return [...prev, ...slotsdata.data]; // append for pagination
      });

      if (slotsdata.data.length < 20) {
        setHasMoreSlots(false);
      }
    }
  }, [slotsdata]);

  useEffect(() => {
    if (!auctionTypeTrial) return;
    if (!isOpen || !auctionId) return;

    const delay = setTimeout(() => {
      setSlotPage(1);
      setHasMoreSlots(true);

      dispatch(fetchSlotList(auctionId, 1, 20, search));
    }, 400);

    return () => clearTimeout(delay);
  }, [search, isOpen, auctionId, auctionTypeTrial, dispatch]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm.length >= 3) {
        handleSearch(searchTerm);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const fieldRefs = useRef({});

  const loadMoreSlots = async () => {
    if (!hasMoreSlots || slotLoading) return;

    const nextPage = slotPage + 1;
    setSlotPage(nextPage);

    await dispatch(fetchSlotList(auctionId, nextPage, 20, search));
  };

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 5;

    if (bottom) {
      loadMoreSlots();
    }
  };

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const registerFieldRef = (fieldName) => (el) => {
    if (el) fieldRefs.current[fieldName] = el;
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (profilePicPreview && profilePicPreview.startsWith("blob:")) {
      URL.revokeObjectURL(profilePicPreview);
    }
    setProfilePic(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.trim();
    setSearchTerm(value);
    setSelectedPlayer(null);
    if (!value) {
      setSearchResults([]);
    }
  };

  const handleSearch = async (value) => {
    try {
      const { data } = await api.get(`/webSiteApi/auction/searchPlayers`, {
        params: { search: value, page: 1, limit: 20 },
      });
      setSearchResults(data?.data?.players || []);
    } catch {
      setSearchResults([]);
    }
  };

  const fetchSessions = async (slotId, preserveSession = false) => {
    if (!preserveSession) {
      setSelectedSession("");
      update("sessionId", "");
    }
    try {
      await dispatch(fetchSlotSessions(slotId));
    } catch (error) {
      console.log("Error fetching sessions:", error);
      toast.error("Failed to fetch shift times");
    }
  };

  const handleSlotChange = (slotId) => {
    setSelectedSlot(slotId);
    update("slotId", slotId); // ✅ add this
    if (slotId) fetchSessions(slotId);
  };

  const handleSessionChange = (sessionId) => {
    setSelectedSession(sessionId);
    update("sessionId", sessionId); // ✅ add this
  };

  const normalizeGenderValue = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
    const nextSlotId = player.slotId || "";
    const nextSessionId = player.sessionId || "";
    setForm({
      countryCode: player.countryCode || "+91",
      mobile: player.mobile || "",
      name: player.name || "",
      location: player.location || "",
      playerRole: player.playerRole || "",
      gender: normalizeGenderValue(player.gender),
      jerseyNumber: player.jerseyNumber || "",
      jerseyName: player.jerseyName || "",
      jerseySize: player.jerseySize || "",
      lowerSize: player.lowerSize || "",
      slotId: nextSlotId,
      sessionId: nextSessionId,
      dob: player.dateOfBirth ? String(player.dateOfBirth).substring(0, 10) : (player.dob || ""),
      email: player.email || "",
      adharCard: player.adharCard || null,
      voterId: player.voterId || null,
      playerId: player._id || "",
    });
    setSelectedSlot(nextSlotId);
    setSelectedSession(nextSessionId);
    if (auctionTypeTrial && nextSlotId) {
      fetchSessions(nextSlotId, true);
    }
    setProfilePic(null);
    setProfilePicPreview(player.profilePicture || "");
    setAdharCardFile(null);
    setVoterIdFile(null);
    setSearchResults([]);
    setSearchTerm(player?.name || "");
  };

  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const h = Number(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${minute} ${ampm}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.mobile || form.mobile.length !== 10)
      newErrors.mobile = "10-digit mobile required";
    if (!form.name) newErrors.name = "Name required";
    if (auctionTypeTrial && form.slotId && hasAvailableSessions && !form.sessionId) {
      newErrors.selectedSession = "Select a session";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        countryCode: form.countryCode,
        mobile: form.mobile,
        name: form.name,
        location: form.location || "",
        playerRole: form.playerRole || "",
        gender: form.gender || "",
        jerseyNumber: form.jerseyNumber || "",
        jerseyName: form.jerseyName || "",
        jerseySize: form.jerseySize ? normalizeJerseySize(form.jerseySize) : "",
        lowerSize: form.lowerSize ? normalizeJerseySize(form.lowerSize) : "",
        ...(auctionTypeTrial && form.slotId ? { slotId: form.slotId } : {}),
        ...(auctionTypeTrial && form.sessionId ? { sessionId: form.sessionId } : {}),
        ...(form.dob ? { dob: form.dob } : {}),
        email: form.email || "",
        ...(typeof form.adharCard === "string" && form.adharCard ? { adharCard: form.adharCard } : {}),
        ...(typeof form.voterId === "string" && form.voterId ? { voterId: form.voterId } : {}),
        ...(selectedPlayer?._id ? { playerId: selectedPlayer._id } : {}),
      };

      if (profilePic || adharCardFile || voterIdFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, value);
        });
        if (profilePic) formData.append("profilePicture", profilePic);
        if (adharCardFile) formData.append("adharCard", adharCardFile);
        if (voterIdFile) formData.append("voterId", voterIdFile);

        await api.post(`/webSiteApi/auction/directAddPlayer/${auctionId}`, formData);
      } else {
        await api.post(`/webSiteApi/auction/directAddPlayer/${auctionId}`, payload);
      }

      toast.success("Player added successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      //   alert("Error adding player");
      toast.error("Failed to add player");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
      <div className="fixed inset-0 z-[120000] flex items-start justify-center overflow-y-auto bg-black/60 p-2 backdrop-blur-sm sm:p-4">
        <div className="flex max-h-[calc(100vh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] sm:max-h-[calc(100vh-2rem)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Add Player
                </h2>
                <p className="text-xs font-medium text-[var(--text-secondary)]">
                  Add a new player or select an existing profile.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-card)] text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-5 overflow-y-auto p-4 [scrollbar-color:var(--secondary)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--secondary)] [&_input]:rounded-lg [&_input]:border [&_input]:border-[var(--border-card)] [&_input]:bg-[var(--bg-main)] [&_input]:text-[var(--text-primary)] [&_input]:outline-none [&_input]:transition [&_input]:focus:border-[var(--border-primary)] [&_select]:rounded-lg [&_select]:border [&_select]:border-[var(--border-card)] [&_select]:bg-[var(--bg-main)] [&_select]:text-[var(--text-primary)] [&_select]:outline-none [&_select]:transition [&_select]:focus:border-[var(--border-primary)]">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Mobile / Name / Batch ID"
                value={searchTerm}
                onChange={handleSearchChange}
                className="h-10 w-full px-3 text-sm font-medium placeholder:text-[var(--text-secondary)]"
              />
              {searchResults.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
                  {searchResults.map((p) => (
                    <li
                      key={p._id}
                      className="cursor-pointer px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--secondary-lighter)]"
                      onClick={() => handleSelectPlayer(p)}
                    >
                      {p.name} - {p.mobile}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--secondary-lighter)] transition-colors hover:bg-[var(--accent-light)]"
                onClick={() => profilePicInputRef.current?.click()}
              >
                {profilePicPreview ? (
                  <img
                    src={profilePicPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-[var(--text-secondary)]">
                    <User className="w-8 h-8" />
                    <span className="text-xs mt-1">Add Photo</span>
                  </div>
                )}
              </div>
              <input
                ref={profilePicInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {profilePicPreview ? (
                  <button
                    type="button"
                    className="font-semibold text-red-500 hover:underline"
                    onClick={() => {
                      if (profilePicPreview.startsWith("blob:"))
                        URL.revokeObjectURL(profilePicPreview);
                      setProfilePic(null);
                      setProfilePicPreview("");
                    }}
                  >
                    Remove Photo
                  </button>
                ) : (
                  "Click to upload profile picture"
                )}
              </span>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[var(--text-secondary)]">
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <input
                  ref={registerFieldRef("name")}
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <input
                  ref={registerFieldRef("location")}
                  type="text"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Country Code</label>
                <select
                  value={form.countryCode}
                  onChange={(e) => update("countryCode", e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.label} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Mobile *</label>
                <input
                  type="text"
                  value={form.mobile}
                  onChange={(e) =>
                    update("mobile", e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={10}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-xs">{errors.mobile}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium">DOB</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => update("dob", e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Player Role *</label>
                <select
                  value={form.playerRole}
                  onChange={(e) => update("playerRole", e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                >
                  <option value="">Select role</option>
                  {PLAYER_ROLES.map((role) => (
                    <option key={role.label} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.playerRole && (
                  <p className="text-red-500 text-xs">{errors.playerRole}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Jersey Number</label>
                <input
                  type="text"
                  value={form.jerseyNumber}
                  onChange={(e) =>
                    update("jerseyNumber", e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Jersey Name</label>
                <input
                  type="text"
                  value={form.jerseyName}
                  onChange={(e) => update("jerseyName", e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Jersey Size</label>
                <select
                  value={form.jerseySize}
                  onChange={(e) => update("jerseySize", e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                >
                  <option value="">Select jersey size</option>
                  {SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Lower Size</label>
                <select
                  value={form.lowerSize}
                  onChange={(e) => update("lowerSize", e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                >
                  <option value="">Select lower size</option>
                  {SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Aadhaar Card</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAdharCardFile(file);
                    update("adharCard", file || form.adharCard || null);
                    e.target.value = null;
                  }}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
                {typeof form.adharCard === "string" && form.adharCard && !adharCardFile ? (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Aadhaar already uploaded</p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-medium">Voter ID</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setVoterIdFile(file);
                    update("voterId", file || form.voterId || null);
                    e.target.value = null;
                  }}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
                {typeof form.voterId === "string" && form.voterId && !voterIdFile ? (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Voter ID already uploaded</p>
                ) : null}
              </div>
              {auctionTypeTrial && (
              <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Trial Location
                </label>
                <div className="relative">
                  {/* Selected */}
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="h-10 w-full cursor-pointer rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
                  >
                    {selectedSlot
                      ? allSlots.find((s) => s._id === selectedSlot)?.slotName
                      : "Choose trial location"}
                  </div>

                  {/* Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Search location..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setSlotPage(1);
                          setHasMoreSlots(true);
                        }}
                        className="w-full rounded-none border-0 border-b border-[var(--border-card)] bg-[var(--bg-main)] p-2 text-sm font-medium outline-none"
                      />

                      {/* List */}
                      <div
                        className="max-h-32 min-h-[80px] overflow-y-auto [scrollbar-color:var(--secondary)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--secondary)]"
                        onScroll={handleScroll}
                      >
                        {allSlots.map((slot) => (
                          <div
                            key={slot._id}
                            onClick={() => {
                              handleSlotChange(slot._id);
                              setIsDropdownOpen(false);
                            }}
                            className="cursor-pointer p-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--secondary-lighter)]"
                          >
                            {slot.slotName}
                          </div>
                        ))}

                        {slotLoading && (
                          <div className="p-2 text-center text-sm text-[var(--text-muted)]">
                            Loading...
                          </div>
                        )}

                        {!slotLoading && allSlots.length === 0 && (
                          <div className="p-2 text-center text-sm text-[var(--text-muted)]">
                            No results found
                          </div>
                        )}

                        {!hasMoreSlots && (
                          <div className="p-2 text-center text-xs text-[var(--text-muted)]">
                            No more locations
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Selection */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[var(--primary)]" />
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Preferred Time
                    {hasAvailableSessions && <span className="text-red-500"> *</span>}
                  </label>
                </div>

                <select
                  ref={registerFieldRef("selectedSession")}
                  value={selectedSession}
                  onChange={(e) => handleSessionChange(e.target.value)}
                  disabled={!selectedSlot || sessionLoading}
                  className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {!selectedSlot
                      ? "Select location first"
                      : sessionLoading
                        ? "Loading available times..."
                        : sessions?.length > 0
                          ? "Choose trial time"
                          : "No times available"}
                  </option>
                  {sessions?.map((session) => (
                    <option key={session._id} value={session._id}>
                      {session.name} - {formatDate(session.slotDate)} (
                      {formatTime(session.slotStartTime)} -{" "}
                      {formatTime(session.slotEndTime)})
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

                {selectedSlot && !sessionLoading && sessions?.length === 0 && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      No shift times available for this location
                    </p>
                  </div>
                )}
              </div>
              </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 border-t border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-[var(--border-card)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--secondary-lighter)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (auctionTypeTrial && selectedSlot && sessionLoading)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                loading || (auctionTypeTrial && selectedSlot && sessionLoading)
                  ? "bg-[var(--secondary-lighter)] text-[var(--text-secondary)]"
                  : "bg-[var(--secondary)] text-[#102033] hover:bg-[var(--secondary-strong)]"
              }`}
            >
              {loading ? "Adding..." : "Add Player"}
            </button>
          </div>
        </div>
      </div>,
      document.body,
  );
};

export default AddPlayerManually;
