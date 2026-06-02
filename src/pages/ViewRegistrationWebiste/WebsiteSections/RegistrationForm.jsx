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
import { useContent } from "../../contexts/ContentContext";
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
      className="bg-white/10 backdrop-blur-md 
                    w-full max-w-sm mx-auto
                    rounded-xl 
                    p-6
                    border border-green-400/30 
                    shadow-lg text-white space-y-5"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-400" />
        </div>

        <h2 className="text-2xl font-bold text-green-400">
          🎉 Already registered
        </h2>

        <p className="text-sm text-gray-300">
          You are on the list for this auction. Open details for trial slot,
          payment status, and your pass.
        </p>
      </div>

      <div className="bg-white/5 rounded-lg p-4 text-sm space-y-2">
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
          className="flex-1 py-2.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm"
        >
          View registration details
        </button>
        {auctionId ? (
          <Link
            to={`/viewAuction/${auctionId}`}
            className="flex-1 py-2.5 rounded-md border-2 border-white/80 text-white font-semibold text-sm text-center hover:bg-white/10 transition"
          >
            Go to auction
          </Link>
        ) : null}
      </div>
    </div>
  );
};

const RegisterationForm = ({ pagedata, showSwitcher, activeTab, onSwitch }) => {
  const { auctionId } = useParams();
  const formRef = useRef(null);
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
  // const playerId = sessionStorage.getItem("playerId") || "";

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

  //   useEffect(()=>{
  //  if(localStorage.getItem("token")){
  //       setIsOtpVerified(true)
  //       dispatch(fetchProfile(localStorage.getItem("playerId")));
  //     }

  //       if (playerId) {
  //         dispatch(fetchUserRole(auctionId, playerId));
  //       }
  //   },[localStorage.getItem("token"),playerId])

  // useEffect(() => {
  //   if (pagedata?.showTrialLocations) {
  //     dispatch(fetchSlotList(auctionId));
  //   }
  // }, [auctionId, pagedata?.showTrialLocations]);

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
      theme: { color: "#10b981" },
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

  return (
    <div
      className="relative "
      style={{
        background: "linear-gradient(to bottom, #8e44ad, #1a1a2e)",
        borderTop: "2px solid rgba(255,255,255,0.15)",
        boxShadow: "inset 0 10px 25px rgba(0,0,0,0.4)",
        color: "#fff",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10">
        {showSwitcher && (
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm p-1">
              <button
                type="button"
                onClick={() => onSwitch("player")}
                className={`rounded-lg px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === "player"
                    ? "bg-white text-[var(--primary)]"
                    : "text-white hover:bg-white/20"
                }`}
              >
                Player Register
              </button>
              <button
                type="button"
                onClick={() => onSwitch("team")}
                className={`rounded-lg px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === "team"
                    ? "bg-white text-[var(--primary)]"
                    : "text-white hover:bg-white/20"
                }`}
              >
                Team Register
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-3">
              {/* Tournament Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold italic leading-tight text-[var(--background)]">
                {pagedata?.tournamentTitle}
              </h1>

              {/* Tournament Name (Adjusted Size) */}
              <h2
                className="text-2xl sm:text-3xl md:text-5xl font-bold italic leading-tight"
                style={{ color: "var(--color-crickbroYellow)" }}
              >
                {pagedata?.tournamentName}
              </h2>
            </div>

            {/* Description with <br> support */}
            <div className="pt-3">
              <p
                className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-gray-100"
                dangerouslySetInnerHTML={{
                  __html: pagedata?.description || "",
                }}
              />
            </div>
          </div>

          {/* Right Form */}
          {isAlreadyRegistered ? (
            <AlreadyRegisteredCard
              profile={profileForRegisteredCard}
              auctionId={auctionId}
              onViewDetails={() => setShowRegistrationDetails(true)}
            />
          ) : (
            <div
              ref={formRef}
              className="bg-white/10 backdrop-blur-md w-full max-w-lg mx-auto rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-xl"
            >
              <h2 className="text-[var(--color-text)] text-center font-bold text-3xl mb-6 font-oswald tracking-wide">
                Registration
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Verification Section */}
                <div>
                  {!isOtpVerified && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-white text-sm font-semibold mb-2 tracking-wide">
                          Mobile Number <span className="text-red-400">*</span>
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            ref={registerFieldRef("countryCode")}
                            name="countryCode"
                            value={loginDetails.countryCode}
                            onChange={handleLoginChange}
                            disabled={isOtpVerified}
                            className="w-full sm:w-24 px-2 py-1 text-sm text-gray-900 rounded-lg bg-white/10 border border-gray-300"
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
                            className="flex-1 px-2 py-1 text-sm text-white rounded-lg bg-white/10 border border-gray-300 w-full"
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
                                : "bg-green-600 hover:bg-green-700"
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
                          <p className="text-red-400 text-xs mt-1">
                            {errors.mobile}
                          </p>
                        )}
                      </div>

                      {/* OTP Field - Only show if OTP sent but not verified */}
                      {isOtpSent && !isOtpVerified && (
                        <div className="space-y-2">
                          <label className="block text-white text-sm font-semibold mb-2 tracking-wide">
                            Enter OTP <span className="text-red-400">*</span>
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              ref={registerFieldRef("otp")}
                              placeholder="6 digit OTP"
                              value={otp}
                              maxLength={6}
                              onChange={(e) => handleOtpChange(e.target.value)}
                              className="w-full px-2 py-1 text-sm text-black text-center rounded-lg"
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
                            <p className="text-red-400 text-xs mt-1">
                              {errors.otp}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Verified Badge */}
                      {isOtpVerified && (
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                          <Check className="w-3 h-3" />
                          <span>Mobile number verified successfully</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Registration Form Fields - Only enabled after OTP verification */}
                  {/* <div
                    className={`space-y-3 transition-all duration-300 mb-2 ${isOtpVerified ? "opacity-100" : "opacity-40 pointer-events-none"}`}
                  > */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-5 mt-2">
                    {/* Profile Image */}
                    {isFieldEnabled("profilePicture") && (
                      <div className="flex flex-col items-center">
                        <div
                          className={`relative w-24 h-24 mb-1 border-2 rounded-md overflow-hidden ${
                            errors.profilePicture
                              ? "border-red-500"
                              : "border-emerald-400/40"
                          }`}
                        >
                          {getPreviewImage() ? (
                            <img
                              src={getPreviewImage()}
                              alt="profile"
                              className="w-full h-full object-cover "
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center border-2 border-emerald-400/40">
                              <User className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <label
                            ref={registerFieldRef("profilePicture")}
                            tabIndex={-1}
                            className={`absolute -bottom-1 -right-1 p-1.5 rounded-full cursor-pointer ${isOtpVerified ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"}`}
                          >
                            <Upload className="w-3 h-3 text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              disabled={!isOtpVerified}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                update("profilePicture", file);
                                e.target.value = null;
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-[10px] font-semibold text-gray-400">
                          Upload photo
                        </p>
                        {errors.profilePicture && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.profilePicture}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col w-full">
                      {/* Full Name */}
                      {isFieldEnabled("name") && (
                        <div className="mb-2">
                          <label className="block text-white text-sm font-semibold mb-1 tracking-wide">
                            Full Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            ref={registerFieldRef("name")}
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleFormChange}
                            placeholder="Full name"
                            // required
                            disabled={!isOtpVerified}
                            className="w-full px-3 py-2.5 text-sm rounded-md bg-white/35 border border-white/25 text-gray-50 placeholder:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                          {errors.name && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.name}
                            </p>
                          )}
                          {/* <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={
                          isOtpVerified ||
                          isSendingOtp ||
                          loginDetails.mobile.length !== 10
                        }
                        className={`px-2 py-1 text-xs rounded-md text-white transition-colors ${
                          isOtpVerified ||
                          loginDetails.mobile.length !== 10 ||
                          isSendingOtp
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {isSendingOtp
                          ? "Sending..."
                          : isOtpVerified
                            ? "✓ Verified"
                            : "Send OTP"}
                      </button> */}
                        </div>
                      )}
                      {/* </div> */}

                      {/* Player Role */}
                      {isFieldEnabled("role") && (
                        <div className="mb-2">
                          <label className="block text-white text-sm font-semibold mb-1 tracking-wide">
                            Player Role<span className="text-red-400">*</span>
                          </label>
                          <select
                            ref={registerFieldRef("playerRole")}
                            value={form.playerRole}
                            onChange={(e) =>
                              update("playerRole", e.target.value)
                            }
                            disabled={!isOtpVerified}
                            className="w-full px-3 py-2.5 text-sm rounded-md bg-white/35 border border-white/25 text-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value="" className="text-gray-600">
                              Select role
                            </option>
                            {PLAYER_ROLES.map((role) => (
                              <option
                                key={role.label}
                                value={role.value}
                                className="text-gray-600"
                              >
                                {getRoleOptionLabel(role)}
                              </option>
                            ))}
                          </select>
                          {errors.playerRole && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.playerRole}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Location */}
                    </div>
                  </div>
                  {isFieldEnabled("location") && (
                    <div className="mb-2">
                      <label className="block text-white text-sm font-semibold mb-1 tracking-wide">
                        Location<span className="text-red-400">*</span>
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          padding: "6px",
                          gap: "6px",
                          width: "100%",
                          maxWidth: "100%",
                          overflow: "hidden",
                        }}
                      >
                        {/* 📍 GPS ICON */}
                        <span
                          onClick={handleGeo}
                          style={{
                            cursor: "pointer",
                            fontSize: 0,
                            width: "32px",
                            height: "32px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: "0 0 32px",
                            color: "#fff",
                          }}
                          title="Use current location"
                        >
                          <LocateFixed size={18} />
                          📍
                        </span>

                        {/* INPUT */}
                        <input
                          ref={registerFieldRef("location")}
                          value={value}
                          onChange={(e) => {
                            setValue(e.target.value);
                            update("location", e.target.value);
                          }}
                          placeholder="Enter location"
                          style={{
                            flex: "1 1 auto",
                            minWidth: 0,
                            border: "none",
                            outline: "none",
                            color: "#fff",
                            background: "transparent",
                            fontSize: "14px",
                          }}
                        />

                        {/* 🗺️ MAP ICON */}
                        <span
                          onClick={handlePickOnMap}
                          style={{
                            cursor: "pointer",
                            fontSize: 0,
                            width: "32px",
                            height: "32px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: "0 0 32px",
                            color: "#fff",
                          }}
                          title="Pick on map"
                        >
                          <MapIcon size={18} />
                          🗺️
                        </span>
                      </div>
                      {loading && (
                        <p style={{ fontSize: "12px" }}>Fetching location...</p>
                      )}
                      {showMap && (
                        <div
                          style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1000,
                          }}
                        >
                          <div
                            style={{
                              width: "90%",
                              maxWidth: "500px",
                              background: "#fff",
                              padding: "10px",
                              borderRadius: "10px",
                            }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <button
                                type="button"
                                onClick={() => setShowMap(false)}
                                title="Close map"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "999px",
                                  border: "1px solid #d1d5db",
                                  background: "#fff",
                                  color: "#111827",
                                  cursor: "pointer",
                                }}
                              >
                                <X size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={handleMapCurrentLocation}
                                title="Use current location"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "999px",
                                  border: "1px solid #d1d5db",
                                  background: "#fff",
                                  color: "#111827",
                                  cursor: "pointer",
                                }}
                              >
                                <Eye size={18} />
                              </button>
                            </div>

                            <MapContainer
                              center={
                                coords
                                  ? [coords.lat, coords.lng]
                                  : [22.7196, 75.8577]
                              }
                              zoom={13}
                              style={{ height: "300px", width: "100%" }}
                            >
                              <MapCenter />
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <MapClickHandler />
                            </MapContainer>
                          </div>
                        </div>
                      )}
                      {/* <input
                        ref={registerFieldRef("location")}
                        type="text"
                        placeholder="City"
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        disabled={!isOtpVerified}
                        className="w-full px-3 py-2.5 text-sm rounded-md bg-white/35 border border-white/25 placeholder:text-gray-200 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                      /> */}
                      {errors.location && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.location}
                        </p>
                      )}
                    </div>
                  )}

                  {(isFieldEnabled("email") ||
                    isFieldEnabled("dateOfBirth") ||
                    isFieldEnabled("gender")) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {isFieldEnabled("email") && (
                        <div>
                          <label className="block min-h-2 text-white text-sm font-semibold mb-1 tracking-wide leading-5">
                            Email
                          </label>
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            disabled={!isOtpVerified}
                            className="w-full px-3 py-2.5 text-sm rounded-md bg-white/35 border border-white/25 placeholder:text-gray-200 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                          {errors.email && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      )}

                      {isFieldEnabled("dateOfBirth") && (
                        <div>
                          <label className="block min-h-2 text-white text-sm font-semibold mb-1 tracking-wide leading-5">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={form.dateOfBirth}
                            onChange={(e) =>
                              update("dateOfBirth", e.target.value)
                            }
                            disabled={!isOtpVerified}
                            className="w-full px-3 py-2.5 text-sm rounded-md bg-white/35 border border-white/25 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                      )}

                      {isFieldEnabled("gender") && (
                        <div>
                          <label className="block min-h-2 text-white text-sm font-semibold mb-1 tracking-wide leading-5">
                            Gender
                          </label>
                          <select
                            value={form.gender}
                            onChange={(e) => update("gender", e.target.value)}
                            disabled={!isOtpVerified}
                            className="w-full px-3 py-2.5 text-sm rounded-md bg-white/35 border border-white/25 text-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value="" className="text-gray-700">
                              Select gender
                            </option>
                            <option value="male" className="text-gray-700">
                              Male
                            </option>
                            <option value="female" className="text-gray-700">
                              Female
                            </option>
                            <option value="other" className="text-gray-700">
                              Other
                            </option>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 items-end">
                      {isFieldEnabled("jerseyNumber") && (
                        <div>
                          <label className="block min-h-10 text-white text-sm font-semibold mb-1 tracking-wide leading-5">
                            Jersey Number<span className="text-red-400">*</span>
                          </label>
                          <input
                            ref={registerFieldRef("jerseyNumber")}
                            type="number"
                            placeholder="e.g. 10"
                            value={form.jerseyNumber}
                            onChange={(e) =>
                              update("jerseyNumber", e.target.value)
                            }
                            disabled={!isOtpVerified}
                            className="w-full px-3 py-2.5 text-sm rounded-md bg-white/35 border border-white/25 placeholder:text-gray-200 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                          {errors.jerseyNumber && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.jerseyNumber}
                            </p>
                          )}
                        </div>
                      )}
                      {isFieldEnabled("jerseyName") && (
                        <div>
                          <label className="block min-h-10 text-white text-sm font-semibold mb-1 tracking-wide leading-5">
                            Jersey Name<span className="text-red-400">*</span>
                          </label>
                          <input
                            ref={registerFieldRef("jerseyName")}
                            type="text"
                            placeholder="Name on jersey"
                            value={form.jerseyName}
                            onChange={(e) =>
                              update("jerseyName", e.target.value)
                            }
                            disabled={!isOtpVerified}
                            className="w-full px-3 py-2.5 text-sm rounded-md bg-white/35 border border-white/25 placeholder:text-gray-200 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                          {errors.jerseyName && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.jerseyName}
                            </p>
                          )}
                        </div>
                      )}
                      {isFieldEnabled("jerseySize") && (
                        <div>
                          <label className="block min-h-10 text-white text-sm font-semibold mb-1 tracking-wide leading-5">
                            Jersey Size<span className="text-red-400">*</span>
                          </label>
                          <select
                            ref={registerFieldRef("jerseySize")}
                            value={form.jerseySize}
                            onChange={(e) =>
                              update("jerseySize", e.target.value)
                            }
                            disabled={!isOtpVerified}
                            className="w-full px-3 py-2.5 text-sm rounded-md bg-white/35 border border-white/25 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value="" className="text-gray-800">
                              Select jersey size
                            </option>
                            {[
                              "S",
                              "M",
                              "L",
                              "XL",
                              "XXL",
                              "3XL",
                              "4XL",
                              "5XL",
                            ].map((s) => (
                              <option
                                key={s}
                                value={s}
                                className="text-gray-800"
                              >
                                {s}
                              </option>
                            ))}
                          </select>
                          {errors.jerseySize && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.jerseySize}
                            </p>
                          )}
                        </div>
                      )}
                      {isFieldEnabled("lowerSize") && (
                        <div>
                          <label className="block min-h-10 text-white text-sm font-semibold mb-1 tracking-wide leading-5">
                            Lower Size
                          </label>
                          <select
                            ref={registerFieldRef("lowerSize")}
                            value={form.lowerSize}
                            onChange={(e) =>
                              update("lowerSize", e.target.value)
                            }
                            disabled={!isOtpVerified}
                            className="w-full px-3 py-2.5 text-sm rounded-md bg-white/35 border border-white/25 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value="" className="text-gray-800">
                              Select lower size
                            </option>
                            {[
                              "S",
                              "M",
                              "L",
                              "XL",
                              "XXL",
                              "3XL",
                              "4XL",
                              "5XL",
                            ].map((s) => (
                              <option
                                key={s}
                                value={s}
                                className="text-gray-800"
                              >
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {(isFieldEnabled("adharCard") ||
                    isFieldEnabled("voterId")) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {isFieldEnabled("adharCard") && (
                        <div>
                          <label className="block text-white text-sm font-semibold mb-1 tracking-wide">
                            Aadhaar Card
                          </label>
                          <label
                            className={`w-full flex items-center rounded-md overflow-hidden border ${isOtpVerified ? "border-white/25 cursor-pointer" : "border-white/15 cursor-not-allowed opacity-60"}`}
                          >
                            <span className="px-3 py-2 text-sm font-semibold bg-emerald-500/90 text-white whitespace-nowrap">
                              Choose File
                            </span>
                            <span className="px-3 py-2 text-sm text-gray-100 bg-white/25 flex-1 truncate">
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
                          {typeof form.adharCard === "string" &&
                          form.adharCard ? (
                            <p className="text-emerald-300 text-xs mt-1">
                              Aadhaar already uploaded
                            </p>
                          ) : null}
                        </div>
                      )}
                      {isFieldEnabled("voterId") && (
                        <div>
                          <label className="block text-white text-sm font-semibold mb-1 tracking-wide">
                            Voter ID
                          </label>
                          <label
                            className={`w-full flex items-center rounded-md overflow-hidden border ${isOtpVerified ? "border-white/25 cursor-pointer" : "border-white/15 cursor-not-allowed opacity-60"}`}
                          >
                            <span className="px-3 py-2 text-sm font-semibold bg-emerald-500/90 text-white whitespace-nowrap">
                              Choose File
                            </span>
                            <span className="px-3 py-2 text-sm text-gray-100 bg-white/25 flex-1 truncate">
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
                          {typeof form.voterId === "string" && form.voterId ? (
                            <p className="text-emerald-300 text-xs mt-1">
                              Voter ID already uploaded
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trial Locations - Conditional */}
                  {pagedata?.showTrialLocations && (
                    <>
                      <div>
                        <label className="block text-white text-sm font-semibold mb-1 tracking-wide">
                          Select Slot
                          {/* <span className="text-red-400">*</span> */}
                        </label>
                        <div className="relative">
                          {/* Input */}
                          <input
                            type="text"
                            value={isOpen ? search : selectedSlotLabel}
                            placeholder="Search location..."
                            onFocus={() => setIsOpen(true)}
                            onChange={(e) => {
                              setSearch(e.target.value);
                              setSelectedSlot("");
                            }}
                            className="w-full px-3 py-2 rounded-md bg-white/40 text-white"
                          />

                          {/* Dropdown */}
                          {isOpen && (
                            <div
                              className="absolute w-full mt-1 bg-white text-black rounded-md shadow-lg max-h-48 overflow-y-auto z-50"
                              onScroll={handleScroll}
                            >
                              {slots.length === 0 ? (
                                <div className="p-2 text-sm text-gray-500">
                                  No locations found
                                </div>
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
                                    className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                                  >
                                    {slot.slotName}
                                  </div>
                                ))
                              )}

                              {slotLoading && (
                                <div className="p-2 text-center text-sm">
                                  Loading...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {errors.selectedSlot && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.selectedSlot}
                          </p>
                        )}
                      </div>

                      {selectedSlot && (
                        <div>
                          <label className="block text-white text-sm font-semibold mb-1 tracking-wide mt-[10px]">
                            Select session
                            {Array.isArray(sessions) && sessions.length > 0 ? (
                              <span className="text-red-400"> *</span>
                            ) : null}
                          </label>
                          <select
                            ref={registerFieldRef("selectedSession")}
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            disabled={
                              !isOtpVerified || !selectedSlot || sessionLoading
                            }
                            className="w-full px-2 py-1 text-sm rounded-md bg-white/40 border border-gray-700 text-white focus:ring-1 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
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
                              <option
                                key={session._id}
                                value={session._id}
                                className="text-gray-600"
                                // className="bg-gray-800"
                              >
                                {getSessionOptionLabel(session)}
                              </option>
                            ))}
                          </select>
                          {errors.selectedSession && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.selectedSession}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      !isOtpVerified ||
                      (pagedata?.showTrialLocations &&
                        (!selectedSlot ||
                          sessionLoading ||
                          (Array.isArray(sessions) &&
                            sessions.length > 0 &&
                            !selectedSession)))
                    }
                    className={`w-full py-2 text-xs font-bold rounded-md transition-all duration-300 mt-[10px] ${
                      !isOtpVerified ||
                      (pagedata?.showTrialLocations &&
                        (!selectedSlot ||
                          sessionLoading ||
                          (Array.isArray(sessions) &&
                            sessions.length > 0 &&
                            !selectedSession)))
                        ? "bg-gray-400 cursor-not-allowed text-gray-700"
                        : "bg-yellow-500 hover:bg-yellow-600 text-black transform hover:scale-[1.02]"
                    }`}
                  >
                    {isOtpVerified
                      ? "⚡ REGISTER NOW"
                      : "Verify OTP to Continue"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Floating Register Button */}
      <div className="fixed bottom-8 right-0 md:right-8 z-40">
        <button
          onClick={() => {
            formRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
          className="px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base flex items-center gap-2 transition-all transform hover:scale-110 shadow-lg"
          style={{
            backgroundColor: "var(--color-crickbroYellow)",
            color: "#000",
          }}
        >
          <span>⚡</span>
          REGISTER NOW
        </button>
      </div>

      <style>{`
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
