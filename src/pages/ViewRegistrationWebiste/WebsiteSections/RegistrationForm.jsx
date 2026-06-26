import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronRight,
  User,
  CreditCard,
  Lock,
  MapPin,
  Phone,
  Mail,
  Check,
  Upload,
  Eye,
  LocateFixed,
  Map as MapIcon,
  X,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useContent } from "../../../context/ContentContext";
import {
  EnrollPlayer,
  fetchProfile,
  fetchSlotList,
  fetchSlotSessions,
  fetchUserRole,
  isValidMongoObjectId,
  sendOtp,
  verifyOtp,
} from "../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";
import api from "../../../utils/api";
import {
  recoverPaidAuctionRegistration,
  resolveAuctionRegistrationPollIds,
  waitForAuctionRegistrationViaWebhook,
} from "../../../utils/auctionRegisterPayment";
import { logoUrl } from "../../../config/env";
import {
  getRazorpayPaymentConfig,
  loadRazorpayScript,
} from "../../../utils/RazorPay";
import PaymentConfirmationModal from "../../../components/PaymentConfirmationModal";
import RegistrationDetails from "../../../components/RegistrationDetails";
import {
  isValidJerseySize,
  normalizeJerseySize,
  JERSEY_SIZE_HINT,
} from "../../../utils/jerseySizes";

const DUMMY_IMAGE =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

const PLAYER_ROLES = [
  { value: "batsman", label: "Batsman" },
  { value: "bowler", label: "Bowler" },
  { value: "all-rounder", label: "All-Rounder" },
  { value: "wicketkeeper-batsman", label: "Wicketkeeper-Batsman" },
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

/** checkAuctionUserRole only returns auctionPlayer: boolean — slot/payment come from playerRegistrationDetails */
const AlreadyRegisteredCard = ({ profile, onViewDetails, auctionId }) => {
  return (
    <div
      className="bg-white/80 backdrop-blur-md 
                    w-full max-w-sm mx-auto
                    rounded-xl 
                    p-6
                    border border-blue-400/30 
                    shadow-lg text-gray-800 space-y-5"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Check className="w-8 h-8 text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-blue-700">
          🎉 Already registered
        </h2>

        <p className="text-sm text-gray-600">
          You are on the list for this auction. Open details for trial slot,
          payment status, and your pass.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
        <p>
          <strong>Name:</strong> {profile?.name}
        </p>
        <p>
          <strong>Mobile:</strong> {profile?.mobile}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <button
          type="button"
          onClick={onViewDetails}
          className="flex-1 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
        >
          View registration details
        </button>
        {auctionId ? (
          <Link
            to={`/viewAuction/${auctionId}`}
            className="flex-1 py-2.5 rounded-md border-2 border-blue-600 text-blue-700 font-semibold text-sm text-center hover:bg-blue-50 transition"
          >
            Go to auction
          </Link>
        ) : null}
      </div>
    </div>
  );
};

const RegisterationForm = ({
  pagedata,
  showSwitcher,
  activeTab,
  onSwitch,
}) => {
  const { auctionId } = useParams();
  const formRef = useRef(null);
  const profileInputRef = useRef(null);
  const fieldRefs = useRef({});
  const [currentStep, setCurrentStep] = useState("details");
  const [loginDetails, setLoginDetails] = useState({
    mobile: "",
    countryCode: "+91",
  });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [paymentConfirmationOpen, setPaymentConfirmationOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showRegistrationDetails, setShowRegistrationDetails] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [slots, setSlots] = useState([]);
  const [hasMore, setHasMore] = useState(true);
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
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedSlotLabel, setSelectedSlotLabel] = useState("");
  const [value, setValue] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const playerId = localStorage.getItem("playerId") || "";

  const { content } = useContent();
  const dispatch = useDispatch();
  const ProfileData = useSelector((state) => state.data?.profile || null);
  const slotLoading = useSelector((state) => state?.loading?.slotList);
  const sessionLoading = useSelector((state) => state?.loading?.sessions);
  const slotsdata = useSelector((state) => state?.data?.slotList);
  const sessionsdata = useSelector((state) => state?.data?.sessions);
  const auctionSlots = slotsdata?.data;
  const sessions = sessionsdata?.sessions;
  const registrationFieldConfig = useMemo(
    () => ({
      ...DEFAULT_PLAYER_REGISTRATION_FIELDS,
      ...(pagedata?.auctionId?.playerRegistrationFiels ||
        pagedata?.playerRegistrationFiels ||
        {}),
    }),
    [pagedata],
  );
  const isFieldEnabled = (field) => !!registrationFieldConfig?.[field];
  const auctionFeeType =
    pagedata?.auctionId?.feeType || pagedata?.feeType || "default";
  const auctionRoleBasedFees =
    pagedata?.auctionId?.roleBasedFees || pagedata?.roleBasedFees || {};
  const isRoleBasedFee = auctionFeeType === "roleBased";
  const getRoleOptionLabel = (role) => {
    if (!isRoleBasedFee) return role.label;
    const feeKey = getRoleFeeKey(role.value);
    return `${role.label} - ${formatRoleFee(auctionRoleBasedFees?.[feeKey])}`;
  };
  const userRole = useSelector((state) => state.data?.userRole);
  const isAlreadyRegistered = Boolean(userRole?.auctionPlayer);

  /** Redux profile lags after register/pay; merge form + login so card shows name immediately */
  const profileForRegisteredCard = useMemo(
    () => ({
      ...(ProfileData && typeof ProfileData === "object" ? ProfileData : {}),
      name:
        (ProfileData?.name && String(ProfileData.name).trim()) ||
        (form.name && String(form.name).trim()) ||
        "",
      mobile: ProfileData?.mobile || loginDetails.mobile || form.mobile || "",
    }),
    [ProfileData, form.name, form.mobile, loginDetails.mobile],
  );

  const steps = [{ id: "details", label: "Registration ", icon: User }];

  const getAddressPart = (addr, keys) => {
    for (const key of keys) {
      const value = addr?.[key];
      if (value && String(value).trim()) return String(value).trim();
    }

    return "";
  };

  const normalizeCity = (addr) => {
    return (
      addr.city ||
      addr.town ||
      addr.village ||
      addr.state_district || // 🔥 important for India
      addr.county ||
      ""
    );
  };
  // 🧼 clean address
  const getShortAddress = (addr) => {
    const city = getAddressPart(addr, ["city", "town", "village"]);
    const district = getAddressPart(addr, [
      "state_district",
      "county",
      "district",
    ]);
    const state = getAddressPart(addr, ["state"]);

    const parts = [city || normalizeCity(addr), district, state].filter(
      (part, index, list) =>
        part &&
        list.findIndex((item) => item.toLowerCase() === part.toLowerCase()) ===
          index,
    );

    return parts.join(", ");
  };

  // 🌍 reverse geocode
  const reverseGeocode = async (lat, lng) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
    );

    const data = await res.json();
    return getShortAddress(data.address || {});
  };

  // 📍 current location
  const setLocationFromCoords = async (lat, lng) => {
    const text = await reverseGeocode(lat, lng);

    setCoords({ lat, lng });
    setValue(text);
    update("location", text);
  };

  const getCurrentLocation = async () => {
    if (!window.isSecureContext) {
      alert("Current location works only on HTTPS domains.");
      return;
    }

    if (!navigator.geolocation) {
      alert("Location is not supported on this browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await setLocationFromCoords(
            position.coords.latitude,
            position.coords.longitude,
          );
        } catch (error) {
          console.error("Failed to fetch location address:", error);
          alert("Could not fetch address for your location.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoading(false);
        alert("Please allow location permission and try again.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleGeo = () => {
    getCurrentLocation();
  };

  const handlePickOnMap = () => {
    setShowMap(true);
    getCurrentLocation();
  };

  const handleMapCurrentLocation = () => {
    getCurrentLocation();
  };

  const MapCenter = () => {
    const map = useMap();

    useEffect(() => {
      if (!coords) return;
      map.setView([coords.lat, coords.lng], map.getZoom());
    }, [map, coords]);

    return null;
  };

  useEffect(() => {
    if (isOtpVerified && !form.location) {
      getCurrentLocation();
    }
  }, [isOtpVerified]);

  // 🗺️ map click
  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        setLoading(true);
        const { lat, lng } = e.latlng;

        await setLocationFromCoords(lat, lng);
        setLoading(false);
        setShowMap(false);
      },
    });

    return coords ? <Marker position={coords} /> : null;
  };

  const getSelectedRole = (roleBooleans = {}) => {
    return (
      Object.keys(roleBooleans).find((r) => roleBooleans[r] === true) || ""
    );
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

  useEffect(() => {
    if (ProfileData && isOtpVerified) {
      const populated = {
        profilePicture: ProfileData?.profilePicture || null,
        name: ProfileData?.name || "",
        mobile: ProfileData?.mobile || "",
        countryCode: ProfileData?.countryCode || "+91",
        location: ProfileData?.location || "",
        playerRole: ProfileData?.playerRole || "",
        email: ProfileData?.email || "",
        dateOfBirth: ProfileData?.dateOfBirth
          ? ProfileData.dateOfBirth.substring(0, 10)
          : "",
        gender: ProfileData?.gender || "",
        jerseyNumber: ProfileData?.jerseyNumber || "",
        jerseyName: ProfileData?.jerseyName || "",
        jerseySize: ProfileData?.jerseySize || "",
        lowerSize: ProfileData?.lowerSize || "",
        adharCard: ProfileData?.adharCard || null,
        voterId: ProfileData?.voterId || null,
      };

      setForm(populated);
      setValue(populated.location);
      setLoginDetails((prev) => ({
        ...prev,
        mobile: ProfileData?.mobile || prev.mobile,
        countryCode: ProfileData?.countryCode || prev.countryCode,
      }));
    }
  }, [ProfileData, isOtpVerified]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (
      scrollHeight - scrollTop <= clientHeight + 20 &&
      hasMore &&
      !slotLoading
    ) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedPlayerId = localStorage.getItem("playerId");

    if (token && isValidMongoObjectId(storedPlayerId)) {
      setIsOtpVerified(true);
      dispatch(fetchProfile(storedPlayerId));
    }
  }, []);

  useEffect(() => {
    if (!pagedata?.showTrialLocations || !auctionId) return;

    dispatch(fetchSlotList(auctionId, page, 20, search));
  }, [auctionId, page, search, pagedata?.showTrialLocations, dispatch]);

  useEffect(() => {
    if (!slotsdata?.data) return;

    setSlots((prev) => {
      const updated =
        page === 1 ? slotsdata.data : [...prev, ...slotsdata.data];

      setHasMore(updated.length < slotsdata.total);

      return updated;
    });
  }, [slotsdata]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const registerFieldRef = (fieldName) => (element) => {
    if (element) {
      fieldRefs.current[fieldName] = element;
    }
  };

  const scrollToRegistrationForm = () => {
    const target = formRef.current;
    if (!target) return;

    const headerOffset = 96;
    const getScrollParent = (element) => {
      let parent = element.parentElement;

      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        const canScroll = /(auto|scroll|overlay)/.test(
          `${style.overflow}${style.overflowY}`,
        );

        if (canScroll && parent.scrollHeight > parent.clientHeight) {
          return parent;
        }

        parent = parent.parentElement;
      }

      return document.scrollingElement || document.documentElement;
    };

    const scrollParent = getScrollParent(target);
    const isPageScroller =
      scrollParent === document.documentElement ||
      scrollParent === document.body;

    if (isPageScroller) {
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth",
      });

      return;
    }

    const parentTop = scrollParent.getBoundingClientRect().top;
    const targetTop =
      target.getBoundingClientRect().top -
      parentTop +
      scrollParent.scrollTop -
      headerOffset;

    scrollParent.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: "smooth",
    });
  };

  const focusFirstInvalidField = (validationErrors) => {
    const priority = [
      "mobile",
      "otp",
      "profilePicture",
      "name",
      "playerRole",
      "location",
      "jerseyNumber",
      "jerseyName",
      "jerseySize",
      "lowerSize",
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
      if (target?.focus && !target?.disabled) {
        target.focus();
      }
    }
  };

  // Image preview (string or File)
  const getPreviewImage = () => {
    if (!form.profilePicture) return null;
    if (typeof form.profilePicture === "string") return form.profilePicture;
    return URL.createObjectURL(form.profilePicture);
  };

  const formatUploadFileName = (value) => {
    if (!value) return "No file selected";
    if (typeof File !== "undefined" && value instanceof File) {
      const name = value.name || "Selected file";
      return name.length > 18 ? `${name.slice(0, 15)}...` : name;
    }
    if (typeof value === "string" && value.trim()) return "Already uploaded";
    return "No file selected";
  };

  const handleOtpChange = (value) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 6) return;
    setOtp(value);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (loginDetails.mobile.length !== 10) {
      toast.error("Enter a valid 10 digit mobile number");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await dispatch(
        sendOtp({
          key: "sendOtp",
          payload: loginDetails,
        }),
      );

      if (!res?.ok) {
        toast.error(res?.error?.message || "Failed to send OTP");
        setIsSendingOtp(false);
        return;
      }

      toast.success("OTP sent successfully");
      setIsOtpSent(true);
      setIsSendingOtp(false);
    } catch (error) {
      toast.error("Something went wrong while sending OTP");
      setIsSendingOtp(false);
    }
  };

  useEffect(() => {
    if (ProfileData?._id && auctionId) {
      dispatch(fetchUserRole(auctionId, ProfileData._id));
    }
  }, [ProfileData?._id, auctionId]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter 6 digit OTP");
      return;
    }

    setIsVerifying(true);
    const data = {
      mobile: loginDetails.mobile,
      countryCode: loginDetails.countryCode,
      otp,
      fcm_token: "hello",
    };

    try {
      const res = await dispatch(
        verifyOtp({
          key: "verifyOtp",
          payload: data,
        }),
      );

      if (!res?.ok) {
        toast.error(res?.error?.message || "Invalid OTP");
        setIsVerifying(false);
        return;
      }

      toast.success("OTP verified successfully");
      setIsOtpVerified(true);

      // Set verified mobile number in form
      setForm((prev) => ({
        ...prev,
        mobile: loginDetails.mobile,
        countryCode: loginDetails.countryCode,
      }));

      const pid = localStorage.getItem("playerId");
      if (isValidMongoObjectId(pid)) {
        dispatch(fetchProfile(pid));
      }

      setIsVerifying(false);
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      setIsVerifying(false);
    }
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
    if (Number.isNaN(h) || minute === undefined) return "";
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

    if (!hasDate && !hasTimeRange) return sessionName;
    if (hasDate && hasTimeRange) {
      return `${sessionName} - ${formattedDate} (${startTime} - ${endTime})`;
    }
    if (hasDate) return `${sessionName} - ${formattedDate}`;
    return `${sessionName} (${startTime} - ${endTime})`;
  };

  const enrollPlayer = async (formData) => {
    const playerId = localStorage.getItem("playerId");

    try {
      const response = await dispatch(EnrollPlayer(auctionId, formData));
      const resData = response?.data?.data;

      // console.log(resData, "ENROLL RESPONSE");

      if (!resData?.paymentRequired) {
        toast.success("Successfully Registered For The Tournament");
        dispatch(fetchUserRole(auctionId, playerId));
        if (isValidMongoObjectId(playerId)) {
          dispatch(fetchProfile(playerId));
        }
        setShowRegistrationDetails(true);
        return;
      }

      // Show payment confirmation modal instead of directly opening Razorpay
      setPaymentData(resData);
      setPaymentConfirmationOpen(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || error?.message || "Enrollment Failed",
      );
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!paymentData) return;

    try {
      await openRazorpay(paymentData);
      setPaymentConfirmationOpen(false);
    } catch (error) {
      console.error("Error opening Razorpay:", error);
      toast.error("Failed to open payment gateway");
    }
  };

  const openRazorpay = async (data) => {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    const options = {
      key: data.paymentDetails.razorpayKeyId || "rzp_test_SEMjn2EKQHa5FH",
      amount: data.paymentDetails.amount,
      currency: data.paymentDetails.currency,
      order_id: data.paymentDetails.orderId,
      name: data.auctionDetails.auctionName,
      description: "Auction Registration Fee",
      image: logoUrl,
      prefill: {
        name: data.player.name,
        contact: data.player.mobile,
      },
      ...getRazorpayPaymentConfig(),
      handler: async function (response) {
        await verifyPayment(response, data);
      },
      modal: {
        ondismiss: function () {
          toast.info("Payment cancelled");
        },
      },
      theme: { color: "#3b82f6" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (response, data) => {
    const { auctionId: aid, playerId: pid } = resolveAuctionRegistrationPollIds(
      data,
      auctionId,
    );
    const paymentRef = response?.razorpay_payment_id || "";

    if (!aid || !pid) {
      toast.error(
        "Could not confirm registration (missing auction or player). Save your payment ID and contact support.",
      );
      dispatch(fetchUserRole(auctionId, localStorage.getItem("playerId")));
      setShowRegistrationDetails(true);
      return;
    }

    try {
      toast.info(
        "Payment received. Confirming registration (this may take a few seconds)…",
      );
      const recovered = await recoverPaidAuctionRegistration({
        response,
        data,
        routeAuctionId: auctionId,
      });
      if (recovered.ok) {
        toast.success("Registration completed successfully");
        dispatch(fetchUserRole(aid, pid));
        if (isValidMongoObjectId(pid)) {
          dispatch(fetchProfile(pid));
        }
        setShowRegistrationDetails(true);
        return;
      }

      const result = await waitForAuctionRegistrationViaWebhook({
        auctionId: aid,
        playerId: pid,
      });

      if (result.authError) {
        toast.error(
          result.reason === "unauthorized"
            ? "Session expired. Log in again, then open registration details to confirm status."
            : "Could not verify registration for this account. Ensure you are logged in as the registering player.",
        );
      } else if (result.ok) {
        toast.success("Registration completed successfully 🎉");
      } else {
        const recoveredAfterPoll = await recoverPaidAuctionRegistration({
          response,
          data,
          routeAuctionId: auctionId,
        });
        if (recoveredAfterPoll.ok) {
          toast.success("Registration completed successfully");
          dispatch(fetchUserRole(aid, pid));
          if (isValidMongoObjectId(pid)) {
            dispatch(fetchProfile(pid));
          }
          setShowRegistrationDetails(true);
          return;
        }
        toast.warning(
          `Registration is still processing. Payment ID: ${paymentRef || "—"}. Refresh the page in a minute or contact support if this persists.`,
        );
      }

      dispatch(fetchUserRole(aid, pid));
      if (isValidMongoObjectId(pid)) {
        dispatch(fetchProfile(pid));
      }
      setShowRegistrationDetails(true);
    } catch (error) {
      console.error("Registration confirmation failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Could not confirm registration. If payment was deducted, save your Razorpay payment ID and contact support.",
      );
      dispatch(fetchUserRole(aid, pid));
      if (isValidMongoObjectId(pid)) {
        dispatch(fetchProfile(pid));
      }
      setShowRegistrationDetails(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isOtpVerified) {
      if (isOtpSent) {
        newErrors.otp = "Please verify OTP first";
      } else {
        newErrors.mobile = "Please verify mobile number first";
      }
      setErrors(newErrors);
      toast.error("Please verify OTP first");
      setTimeout(() => focusFirstInvalidField(newErrors), 0);
      return false;
    }

    if (
      isFieldEnabled("profilePicture") &&
      (!form.profilePicture || form.profilePicture === DUMMY_IMAGE)
    ) {
      newErrors.profilePicture = "Profile image is required";
    }

    if (isFieldEnabled("name") && (!form.name || form.name.trim().length < 3)) {
      newErrors.name = "Full name must be at least 3 characters";
    }

    if (
      isFieldEnabled("mobileNumber") &&
      (!loginDetails.mobile || loginDetails.mobile.length !== 10)
    ) {
      newErrors.mobile = "Valid mobile number is required";
    }

    if (isFieldEnabled("role") && !form.playerRole) {
      newErrors.playerRole = "Please select a player role";
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

    if (isFieldEnabled("jerseyNumber") && !form.jerseyNumber) {
      newErrors.jerseyNumber = "Jersey number is required";
    }

    if (
      isFieldEnabled("jerseyNumber") &&
      form.jerseyNumber &&
      (form.jerseyNumber < 0 || form.jerseyNumber > 999)
    ) {
      newErrors.jerseyNumber = "Jersey number must be between 0 and 999";
    }

    if (
      isFieldEnabled("jerseyName") &&
      (!form.jerseyName || form.jerseyName.trim().length < 2)
    ) {
      newErrors.jerseyName = "Jersey name must be at least 2 characters";
    }

    if (isFieldEnabled("jerseySize") && !form.jerseySize) {
      newErrors.jerseySize = "Please select jersey size";
    }

    if (
      isFieldEnabled("jerseySize") &&
      form.jerseySize &&
      !isValidJerseySize(form.jerseySize)
    ) {
      newErrors.jerseySize = `Jersey size must be one of: ${JERSEY_SIZE_HINT}`;
    }

    if (pagedata?.showTrialLocations) {
      if (!selectedSlot) {
        newErrors.selectedSlot = "Please select a trial location";
      }
      const hasSessions = Array.isArray(sessions) && sessions.length > 0;
      if (selectedSlot && hasSessions && !selectedSession) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) return;

    const hasImageFile =
      form.profilePicture && typeof form.profilePicture !== "string";
    const hasAdharCardFile =
      form.adharCard && typeof form.adharCard !== "string";
    const hasVoterIdFile = form.voterId && typeof form.voterId !== "string";
    const hasAnyFileUpload = hasImageFile || hasAdharCardFile || hasVoterIdFile;

    const basePayload = {
      auctionId,
      mobile: String(loginDetails.mobile || form.mobile),
      countryCode: loginDetails.countryCode || form.countryCode || "+91",
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
    if (isFieldEnabled("jerseyNumber"))
      basePayload.jerseyNumber = String(form.jerseyNumber || "");
    if (isFieldEnabled("jerseyName"))
      basePayload.jerseyName = String(form.jerseyName || "");
    if (isFieldEnabled("jerseySize"))
      basePayload.jerseySize = normalizeJerseySize(form.jerseySize);
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

    if (pagedata?.showTrialLocations) {
      basePayload.slotId = selectedSlot;
      basePayload.sessionId = selectedSession;
    }

    if (hasAnyFileUpload) {
      const formData = new FormData();
      Object.entries(basePayload).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (hasImageFile && isFieldEnabled("profilePicture")) {
        formData.append("profilePicture", form.profilePicture);
      }
      if (hasAdharCardFile && isFieldEnabled("adharCard")) {
        formData.append("adharCard", form.adharCard);
      }
      if (hasVoterIdFile && isFieldEnabled("voterId")) {
        formData.append("voterId", form.voterId);
      }
      enrollPlayer(formData);
      return;
    }

    enrollPlayer(basePayload);
  };

  const formThemeStyle = {
    "--rf-section": "#f0f9ff",
    "--rf-section-soft": "#e0f2fe",
    "--rf-card": "#ffffff",
    "--rf-card-border": "#bfdbfe",
    "--rf-title": "#1e3a8a",
    "--rf-text": "#475569",
    "--rf-label": "#1e40af",
    "--rf-input": "#f8fafc",
    "--rf-input-highlight": "#dbeafe",
    "--rf-input-text": "#0f172a",
    "--rf-placeholder": "#94a3b8",
    "--rf-primary": "#3b82f6",
    "--rf-accent": "#2563eb",
    fontFamily:
      '"Inter", "Manrope", "Nunito Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  return (
    <div
      className="registration-form-section relative overflow-hidden"
      style={formThemeStyle}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(37,99,235,0.06),transparent_28%)]" />
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 relative z-10">
        {showSwitcher && (
          <div className="flex items-center justify-center mb-6">
            <div className="registration-form-switcher inline-flex rounded-2xl border border-blue-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => onSwitch("player")}
                className={`rounded-lg px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === "player"
                    ? "bg-[var(--rf-primary)] text-white shadow-sm"
                    : "text-[var(--rf-text)] hover:bg-[var(--rf-section-soft)]"
                }`}
              >
                Player Register
              </button>
              <button
                type="button"
                onClick={() => onSwitch("team")}
                className={`rounded-lg px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === "team"
                    ? "bg-[var(--rf-primary)] text-white shadow-sm"
                    : "text-[var(--rf-text)] hover:bg-[var(--rf-section-soft)]"
                }`}
              >
                Team Register
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 md:gap-10 items-start">
          {/* Left Content - Centered with no border */}
          <div className="registration-form-intro space-y-5 animate-fadeIn rounded-3xl p-5 md:p-7 bg-transparent shadow-none border-0 flex flex-col justify-center h-full">
            <div className="space-y-3 text-center lg:text-left">
              <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] mx-auto lg:mx-0 text-blue-700 bg-blue-100">
                Player Registration
              </span>
              <h1 className={`text-lg  sm:text-xl md:text-2xl font-semibold  leading-tight text-blue-900`}>
                {pagedata?.tournamentTitle}
              </h1>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-blue-800">
                {pagedata?.tournamentName}
              </h2>
            </div>
            <div className="pt-1 text-center lg:text-left">
              <div
                className="text-sm sm:text-base font-medium leading-7 text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: pagedata?.description || "",
                }}
              />
            </div>
          </div>

          {/* Right Form - Compact with multi-column layout */}
          <div
            id="registration-form"
            ref={formRef}
            className="scroll-mt-24 w-full max-w-2xl mx-auto"
          >
            {isAlreadyRegistered ? (
              <AlreadyRegisteredCard
                profile={profileForRegisteredCard}
                auctionId={auctionId}
                onViewDetails={() => setShowRegistrationDetails(true)}
              />
            ) : (
              <div
                className="registration-form-card quick-form-card w-full rounded-3xl p-4 sm:p-5 md:p-6 border shadow-xl"
                style={{
                  // background:
                  //   "radial-gradient(circle at 12% 8%, rgba(96, 165, 250, 0.2), transparent 30%), radial-gradient(circle at 88% 12%, rgba(14, 165, 233, 0.16), transparent 26%), linear-gradient(145deg, #020617 0%, #082f49 42%, #0b4a7a 100%)",
                  borderColor: "rgba(125, 211, 252, 0.24)",
                  boxShadow:
                    "0 24px 60px rgba(2, 6, 23, 0.36), inset 0 1px 0 rgba(125, 211, 252, 0.18)",
                }}
              >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  {/* <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                    Quick Form
                  </p> */}
                  <h2 className="text-white font-black text-2xl tracking-tight">
                    Registration
                  </h2>
                </div>
                <div className="hidden rounded-2xl bg-white/15 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15 sm:block">
                  OTP Secure
                </div>
              </div>
              <form onSubmit={handleSubmit} className="registration-form-body space-y-4">
                {/* OTP Verification Section */}
                <div>
                  {!isOtpVerified && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[var(--rf-label)] text-sm font-semibold mb-2 tracking-wide">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            ref={registerFieldRef("countryCode")}
                            name="countryCode"
                            value={loginDetails.countryCode}
                            onChange={handleLoginChange}
                            disabled={isOtpVerified}
                            className="w-full sm:w-24 px-2 py-1 text-sm text-gray-900 rounded-lg bg-gray-50 border border-gray-300"
                          >
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                          </select>
                          <input
                            ref={registerFieldRef("mobile")}
                            type="tel"
                            name="mobile"
                            value={loginDetails.mobile}
                            onChange={handleLoginChange}
                            placeholder="10-digit number"
                            required
                            pattern="[0-9]{10}"
                            maxLength="10"
                            disabled={isOtpVerified}
                            className="flex-1 px-2 py-1 text-sm text-gray-900 rounded-lg bg-gray-50 border border-gray-300 w-full"
                          />
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={
                              isOtpVerified ||
                              isSendingOtp ||
                              loginDetails.mobile.length !== 10
                            }
                            className={`w-full sm:w-auto px-2 py-1 text-sm font-semibold rounded-lg text-white transition-colors ${
                              isOtpVerified ||
                              loginDetails.mobile.length !== 10 ||
                              isSendingOtp
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {isSendingOtp
                              ? "Sending..."
                              : isOtpVerified
                                ? "✓ Verified"
                                : "Send OTP"}
                          </button>
                        </div>
                        {errors.mobile && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.mobile}
                          </p>
                        )}
                      </div>

                      {/* OTP Field - Only show if OTP sent but not verified */}
                      {isOtpSent && !isOtpVerified && (
                        <div className="space-y-2">
                          <label className="block text-[var(--rf-label)] text-sm font-semibold mb-2 tracking-wide">
                            Enter OTP <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              ref={registerFieldRef("otp")}
                              placeholder="6 digit OTP"
                              value={otp}
                              maxLength={6}
                              onChange={(e) => handleOtpChange(e.target.value)}
                              className="w-full px-2 py-1 text-sm text-black text-center rounded-lg bg-gray-50 border border-gray-300"
                            />
                            <button
                              type="button"
                              disabled={otp.length !== 6 || isVerifying}
                              onClick={handleVerifyOtp}
                              className={`px-2 py-1 text-sm text-white rounded-md transition-colors whitespace-nowrap ${
                                otp.length === 6 && !isVerifying
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "bg-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {isVerifying ? "Verifying..." : "Verify OTP"}
                            </button>
                          </div>
                          {errors.otp && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.otp}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Verified Badge */}
                      {isOtpVerified && (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <Check className="w-3 h-3" />
                          <span>Mobile number verified successfully</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Registration Form Fields - Multi-column compact layout */}
                  <div className="mt-4 space-y-4">
                    {/* Row 1: Profile Picture + Name + Role (3 columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr_1fr] gap-3 items-end">
                      {isFieldEnabled("profilePicture") && (
                        <div className="flex flex-col items-center sm:items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (isOtpVerified) {
                                profileInputRef.current?.click();
                              }
                            }}
                            disabled={!isOtpVerified}
                            className={`relative w-20 h-20 mb-1 border-2 rounded-xl overflow-hidden transition hover:shadow-md ${
                              errors.profilePicture
                                ? "border-red-500"
                                : "border-blue-400/40"
                            } ${isOtpVerified ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                            title={
                              isOtpVerified
                                ? "Upload player photo"
                                : "Verify OTP to upload photo"
                            }
                          >
                            {getPreviewImage() ? (
                              <img
                                src={getPreviewImage()}
                                alt="profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <span
                              className={`absolute bottom-1 right-1 p-1.5 rounded-full shadow-sm ${isOtpVerified ? "bg-blue-600" : "bg-gray-400"}`}
                            >
                              <Upload className="w-3 h-3 text-white" />
                            </span>
                          </button>
                          <input
                            ref={(element) => {
                              profileInputRef.current = element;
                              registerFieldRef("profilePicture")(element);
                            }}
                            type="file"
                            accept="image/*"
                            disabled={!isOtpVerified}
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              if (file) {
                                update("profilePicture", file);
                              }
                              e.target.value = null;
                            }}
                            className="sr-only"
                          />
                          <p className="text-[10px] font-semibold text-gray-500">
                            Upload photo
                          </p>
                          {errors.profilePicture && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.profilePicture}
                            </p>
                          )}
                        </div>
                      )}

                      {isFieldEnabled("name") && (
                        <div>
                          <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            ref={registerFieldRef("name")}
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleFormChange}
                            placeholder="Full name"
                            disabled={!isOtpVerified}
                            className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                          {errors.name && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.name}
                            </p>
                          )}
                        </div>
                      )}

                      {isFieldEnabled("role") && (
                        <div>
                          <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                            Player Role <span className="text-red-500">*</span>
                          </label>
                          <select
                            ref={registerFieldRef("playerRole")}
                            value={form.playerRole}
                            onChange={(e) => update("playerRole", e.target.value)}
                            disabled={!isOtpVerified}
                            className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value="" className="text-gray-600">
                              Select role
                            </option>
                            {PLAYER_ROLES.map((role) => (
                              <option key={role.label} value={role.value} className="text-gray-600">
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
                    </div>

                    {/* Row 2: Location (full width) */}
                    {isFieldEnabled("location") && (
                      <div>
                        <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2 w-full">
                          <button
                            type="button"
                            onClick={handleGeo}
                            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Use current location"
                          >
                            <LocateFixed size={18} className="text-blue-600" />
                          </button>
                          <input
                            ref={registerFieldRef("location")}
                            value={value}
                            onChange={(e) => {
                              setValue(e.target.value);
                              update("location", e.target.value);
                            }}
                            placeholder="Enter location"
                            className="flex-1 px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                          />
                          <button
                            type="button"
                            onClick={handlePickOnMap}
                            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Pick on map"
                          >
                            <MapIcon size={18} className="text-blue-600" />
                          </button>
                        </div>
                        {loading && <p className="text-xs mt-1 text-gray-500">Fetching location...</p>}
                        {errors.location && (
                          <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                        )}
                      </div>
                    )}

                    {/* Row 3: Email, DOB, Gender (3 columns) */}
                    {(isFieldEnabled("email") || isFieldEnabled("dateOfBirth") || isFieldEnabled("gender")) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {isFieldEnabled("email") && (
                          <div>
                            <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                              Email
                            </label>
                            <input
                              type="email"
                              placeholder="you@example.com"
                              value={form.email}
                              onChange={(e) => update("email", e.target.value)}
                              disabled={!isOtpVerified}
                              className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 placeholder:text-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                          </div>
                        )}

                        {isFieldEnabled("dateOfBirth") && (
                          <div>
                            <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              value={form.dateOfBirth}
                              onChange={(e) => update("dateOfBirth", e.target.value)}
                              disabled={!isOtpVerified}
                              className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </div>
                        )}

                        {isFieldEnabled("gender") && (
                          <div>
                            <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                              Gender
                            </label>
                            <select
                              value={form.gender}
                              onChange={(e) => update("gender", e.target.value)}
                              disabled={!isOtpVerified}
                              className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <option value="" className="text-gray-700">Select gender</option>
                              <option value="male" className="text-gray-700">Male</option>
                              <option value="female" className="text-gray-700">Female</option>
                              <option value="other" className="text-gray-700">Other</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Row 4: Jersey Details (4 columns) */}
                    {(isFieldEnabled("jerseyNumber") || isFieldEnabled("jerseyName") || isFieldEnabled("jerseySize") || isFieldEnabled("lowerSize")) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {isFieldEnabled("jerseyNumber") && (
                          <div>
                            <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                              Jersey # <span className="text-red-500">*</span>
                            </label>
                            <input
                              ref={registerFieldRef("jerseyNumber")}
                              type="number"
                              placeholder="e.g. 10"
                              value={form.jerseyNumber}
                              onChange={(e) => update("jerseyNumber", e.target.value)}
                              disabled={!isOtpVerified}
                              className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 placeholder:text-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                            {errors.jerseyNumber && <p className="text-red-500 text-xs mt-1">{errors.jerseyNumber}</p>}
                          </div>
                        )}
                        {isFieldEnabled("jerseyName") && (
                          <div>
                            <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                              Jersey Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              ref={registerFieldRef("jerseyName")}
                              type="text"
                              placeholder="Name on jersey"
                              value={form.jerseyName}
                              onChange={(e) => update("jerseyName", e.target.value)}
                              disabled={!isOtpVerified}
                              className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 placeholder:text-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                            {errors.jerseyName && <p className="text-red-500 text-xs mt-1">{errors.jerseyName}</p>}
                          </div>
                        )}
                        {isFieldEnabled("jerseySize") && (
                          <div>
                            <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                              Jersey Size <span className="text-red-500">*</span>
                            </label>
                            <select
                              ref={registerFieldRef("jerseySize")}
                              value={form.jerseySize}
                              onChange={(e) => update("jerseySize", e.target.value)}
                              disabled={!isOtpVerified}
                              className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <option value="" className="text-gray-800">Select size</option>
                              {["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map((s) => (
                                <option key={s} value={s} className="text-gray-800">{s}</option>
                              ))}
                            </select>
                            {errors.jerseySize && <p className="text-red-500 text-xs mt-1">{errors.jerseySize}</p>}
                          </div>
                        )}
                        {isFieldEnabled("lowerSize") && (
                          <div>
                            <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                              Lower Size
                            </label>
                            <select
                              ref={registerFieldRef("lowerSize")}
                              value={form.lowerSize}
                              onChange={(e) => update("lowerSize", e.target.value)}
                              disabled={!isOtpVerified}
                              className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <option value="" className="text-gray-800">Select size</option>
                              {["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map((s) => (
                                <option key={s} value={s} className="text-gray-800">{s}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Row 5: Document Uploads (2 columns) */}
                    {(isFieldEnabled("adharCard") || isFieldEnabled("voterId")) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isFieldEnabled("adharCard") && (
                          <div>
                            <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                              Aadhaar Card
                            </label>
                            <label
                              className={`w-full flex items-center rounded-md overflow-hidden border ${isOtpVerified ? "border-gray-300 cursor-pointer" : "border-gray-200 cursor-not-allowed opacity-60"}`}
                            >
                              <span className="px-3 py-2 text-sm font-semibold bg-blue-600 text-white whitespace-nowrap">
                                Choose File
                              </span>
                              <span className="px-3 py-2 text-sm text-gray-600 bg-gray-50 flex-1 truncate">
                                {formatUploadFileName(form.adharCard)}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={!isOtpVerified}
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  update("adharCard", file);
                                  e.target.value = null;
                                }}
                                className="hidden"
                              />
                            </label>
                            {typeof form.adharCard === "string" && form.adharCard && (
                              <p className="text-blue-600 text-xs mt-1">Aadhaar already uploaded</p>
                            )}
                          </div>
                        )}
                        {isFieldEnabled("voterId") && (
                          <div>
                            <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                              Voter ID
                            </label>
                            <label
                              className={`w-full flex items-center rounded-md overflow-hidden border ${isOtpVerified ? "border-gray-300 cursor-pointer" : "border-gray-200 cursor-not-allowed opacity-60"}`}
                            >
                              <span className="px-3 py-2 text-sm font-semibold bg-blue-600 text-white whitespace-nowrap">
                                Choose File
                              </span>
                              <span className="px-3 py-2 text-sm text-gray-600 bg-gray-50 flex-1 truncate">
                                {formatUploadFileName(form.voterId)}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={!isOtpVerified}
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  update("voterId", file);
                                  e.target.value = null;
                                }}
                                className="hidden"
                              />
                            </label>
                            {typeof form.voterId === "string" && form.voterId && (
                              <p className="text-blue-600 text-xs mt-1">Voter ID already uploaded</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Trial Locations Section */}
                    {pagedata?.showTrialLocations && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                            Select Slot
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={isOpen ? search : selectedSlotLabel}
                              placeholder="Search location..."
                              onFocus={() => setIsOpen(true)}
                              onChange={(e) => {
                                setSearch(e.target.value);
                                setSelectedSlot("");
                              }}
                              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-900"
                            />
                            {isOpen && (
                              <div
                                className="absolute w-full mt-1 bg-white text-gray-900 rounded-md shadow-lg max-h-48 overflow-y-auto z-50 border border-gray-200"
                                onScroll={handleScroll}
                              >
                                {slots.length === 0 ? (
                                  <div className="p-2 text-sm text-gray-500">No locations found</div>
                                ) : (
                                  slots.map((slot) => (
                                    <div
                                      key={slot._id}
                                      onClick={() => {
                                        setSelectedSlot(slot._id);
                                        setSelectedSlotLabel(slot.slotName);
                                        setIsOpen(false);
                                        setSearch("");
                                        handleSlotChange(slot._id);
                                      }}
                                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                    >
                                      {slot.slotName}
                                    </div>
                                  ))
                                )}
                                {slotLoading && <div className="p-2 text-center text-sm">Loading...</div>}
                              </div>
                            )}
                          </div>
                          {errors.selectedSlot && <p className="text-red-500 text-xs mt-1">{errors.selectedSlot}</p>}
                        </div>

                        {selectedSlot && (
                          <div>
                            <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                              Select session
                              {Array.isArray(sessions) && sessions.length > 0 && <span className="text-red-500"> *</span>}
                            </label>
                            <select
                              ref={registerFieldRef("selectedSession")}
                              value={selectedSession}
                              onChange={(e) => setSelectedSession(e.target.value)}
                              disabled={!isOtpVerified || !selectedSlot || sessionLoading}
                              className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <option value="" className="text-gray-600">
                                {!selectedSlot
                                  ? "Select location first"
                                  : sessionLoading
                                    ? "Loading shifts…"
                                    : sessions?.length > 0
                                      ? "Select shift"
                                      : "No shifts for this location"}
                              </option>
                              {sessions?.map((session) => (
                                <option key={session._id} value={session._id} className="text-gray-600">
                                  {getSessionOptionLabel(session)}
                                </option>
                              ))}
                            </select>
                            {errors.selectedSession && <p className="text-red-500 text-xs mt-1">{errors.selectedSession}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={
                        !isOtpVerified ||
                        (pagedata?.showTrialLocations &&
                          (!selectedSlot ||
                            sessionLoading ||
                            (Array.isArray(sessions) && sessions.length > 0 && !selectedSession)))
                      }
                      className={`w-full py-2.5 text-sm font-bold rounded-md transition-all duration-300 ${
                        !isOtpVerified ||
                        (pagedata?.showTrialLocations &&
                          (!selectedSlot ||
                            sessionLoading ||
                            (Array.isArray(sessions) && sessions.length > 0 && !selectedSession)))
                          ? "bg-gray-400 cursor-not-allowed text-gray-700"
                          : "bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-[1.02]"
                      }`}
                    >
                      {isOtpVerified ? "⚡ REGISTER NOW" : "Verify OTP to Continue"}
                    </button>
                  </div>
                </div>
              </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Register Button */}
      <div className="fixed bottom-5 right-3 md:right-6 z-40">
        <a
          href="#registration-form"
          onClick={scrollToRegistrationForm}
          className="px-4 md:px-5 py-2.5 md:py-3 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-xl"
          style={{
            backgroundColor: "var(--rf-primary)",
            color: "#fff",
          }}
        >
          <span>⚡</span>
          REGISTER NOW
        </a>
      </div>

      <style>{`
        .registration-form-section {
          background: linear-gradient(180deg, var(--rf-section) 0%, var(--rf-section-soft) 100%);
          color: var(--rf-text);
        }

        .registration-form-intro {
          background: transparent;
          border-color: transparent;
          box-shadow: none;
        }

        .registration-form-intro span {
          background: var(--rf-section-soft);
          color: var(--rf-primary);
        }

        .registration-form-intro h1,
        .registration-form-intro h2 {
          color: var(--rf-title);
        }

        .registration-form-intro p {
          color: var(--rf-text);
        }

        .registration-form-card {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 12% 8%, rgba(96, 165, 250, 0.18), transparent 30%),
            radial-gradient(circle at 88% 12%, rgba(14, 165, 233, 0.14), transparent 26%),
            linear-gradient(145deg, #020617 0%, #082f49 42%, #0b4a7a 100%);
          border-color: rgba(125, 211, 252, 0.22);
          color: #eaf4ff;
          box-shadow:
            0 24px 60px rgba(2, 6, 23, 0.34),
            inset 0 1px 0 rgba(125, 211, 252, 0.16);
        }

        .registration-form-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(120deg, rgba(255, 255, 255, 0.08), transparent 36%),
            linear-gradient(180deg, rgba(125, 211, 252, 0.08), transparent 55%);
        }

        .registration-form-card > * {
          position: relative;
          z-index: 1;
        }

        .registration-form-card.quick-form-card {
          background:
            radial-gradient(circle at 12% 8%, rgba(96, 165, 250, 0.2), transparent 30%),
            radial-gradient(circle at 88% 12%, rgba(14, 165, 233, 0.16), transparent 26%),
            linear-gradient(145deg, #020617 0%, #082f49 42%, #0b4a7a 100%) !important;
          border-color: rgba(125, 211, 252, 0.24) !important;
          color: #eaf4ff !important;
          box-shadow:
            0 24px 60px rgba(2, 6, 23, 0.36),
            inset 0 1px 0 rgba(125, 211, 252, 0.18) !important;
          backdrop-filter: none !important;
        }

        .registration-form-card.quick-form-card::before {
          background:
            linear-gradient(120deg, rgba(255, 255, 255, 0.08), transparent 36%),
            linear-gradient(180deg, rgba(125, 211, 252, 0.08), transparent 55%) !important;
          opacity: 1 !important;
          transform: none !important;
          animation: none !important;
        }

        .registration-form-switcher {
          background: var(--rf-card);
          border-color: var(--rf-card-border);
        }

        .registration-form-card label {
          color: #eef6ff !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          letter-spacing: 0.01em !important;
          margin-bottom: 0.25rem !important;
        }

        .registration-form-card input:not([type="file"]),
        .registration-form-card select,
        .registration-form-card textarea {
          text-align: left !important;
          min-height: 40px;
          padding: 0.55rem 0.75rem !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.45rem !important;
          background: #f9fafb !important;
          color: #111827 !important;
          font-size: 0.875rem !important;
          outline: none !important;
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }

        .registration-form-card input:not([type="file"]):focus,
        .registration-form-card select:focus,
        .registration-form-card textarea:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }

        .registration-form-card input::placeholder,
        .registration-form-card textarea::placeholder {
          color: #9ca3af !important;
        }

        .registration-form-card select option {
          background: #ffffff;
          color: #111827;
        }

        .registration-form-card h2,
        .registration-form-card h3 {
          color: #ffffff !important;
        }

        .registration-form-card p {
          color: #dbeafe;
        }

        .registration-form-card .text-\[var\(--rf-primary\)\],
        .registration-form-card .text-blue-600 {
          color: #bfdbfe !important;
        }

        .registration-form-card .bg-\[var\(--rf-section-soft\)\] {
          background: rgba(255, 255, 255, 0.14) !important;
          color: #ffffff !important;
        }

        .registration-form-card button {
          border-radius: 0.5rem !important;
        }

        .registration-form-card button[type="submit"]:not(:disabled) {
          background: #3b82f6 !important;
          color: #ffffff !important;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.24);
          transform: none !important;
        }

        .registration-form-card button[type="submit"]:not(:disabled):hover {
          background: #2563eb !important;
        }

        .registration-form-card button:disabled,
        .registration-form-card input:disabled,
        .registration-form-card select:disabled {
          opacity: 0.56 !important;
        }

        @media (min-width: 1024px) {
          .registration-form-intro {
            position: sticky;
            top: 6rem;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.6s ease-out;
        }
      `}</style>

      <PaymentConfirmationModal
        isOpen={paymentConfirmationOpen}
        onClose={() => setPaymentConfirmationOpen(false)}
        onConfirm={handlePaymentConfirmation}
        paymentDetails={paymentData?.paymentDetails}
        auctionDetails={paymentData?.auctionDetails}
        player={paymentData?.player}
      />

      {showRegistrationDetails && (
        <RegistrationDetails
          onClose={() => setShowRegistrationDetails(false)}
          auctionId={auctionId}
          playerId={
            sessionStorage.getItem("playerId") ||
            localStorage.getItem("playerId")
          }
        />
      )}
    </div>
  );
};

export default RegisterationForm;
