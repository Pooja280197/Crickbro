import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Clock, X, Loader2, AlertCircle, Download, Phone, Key } from "lucide-react";
import QRCode from "qrcode";
import api from "../../../../../utils/api";
import logo from "/Crickbro_auction_logo-1.png";
import html2pdf from "html2pdf.js";
import { sendOtp, verifyOtp } from "../../../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";

const EntryPass = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState("mobile"); // "mobile", "otp", "pass", "not-registered"
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationLinkCopied, setLocationLinkCopied] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [qr, setQr] = useState("");

  const otpLoading = useSelector((state) => state.loading.sendOtp);
  const otpError = useSelector((state) => state.error.sendOtp);
  const verifyLoading = useSelector((state) => state.loading.verify);
  const verifyError = useSelector((state) => state.error.verify);

  useEffect(() => {
    let interval;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    if (details?.player?.batchId) {
      QRCode.toDataURL(
        JSON.stringify({
          batchId: details.player.batchId,
          playerId: details.player._id,
        }),
      )
        .then(setQr)
        .catch(console.error);
    } else {
      setQr("");
    }
  }, [details]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile.trim()) {
      setError("Please enter mobile number");
      return;
    }

    setError(null);
    const result = await dispatch(sendOtp({
      key: "sendOtp",
      payload: { mobile: mobile.trim(), countryCode: "+91" }
    }));

    if (result.ok) {
      setStep("otp");
      setTimer(30);
      setCanResend(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    const result = await dispatch(sendOtp({
      key: "sendOtp",
      payload: { mobile: mobile.trim(), countryCode: "+91" }
    }));

    if (result.ok) {
      setTimer(30);
      setCanResend(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter complete OTP");
      return;
    }

    setError(null);
    const result = await dispatch(verifyOtp({
      payload: { mobile: mobile.trim(), countryCode: "+91", otp: otpString }
    }));

    if (result.ok) {
      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        checkRegistration(result.data?.newPlayer?._id);
      }, 100);
    }
  };

  const checkRegistration = async (playerId) => {
    setLoading(true);
    try {
      // Get playerId from localStorage as it's stored there after OTP verification
      const storedPlayerId = localStorage.getItem("playerId") || sessionStorage.getItem("playerId");
      const finalPlayerId = storedPlayerId || playerId;

      console.log("Checking registration with playerId:", finalPlayerId, "from storage:", storedPlayerId, "from response:", playerId);

      if (!finalPlayerId) {
        setError("Player ID not found. Please try again.");
        setLoading(false);
        return;
      }

      const response = await api.get(
        `/webSiteApi/auction/playerRegistrationDetails/${auctionId}/${finalPlayerId}`,
      );
      const data = response?.data?.data ?? response?.data;
      if (data) {
        setDetails(data);
        setStep("pass");
      } else {
        setStep("not-registered");
      }
    } catch (err) {
      console.error("Error checking registration:", err);
      if (err?.response?.status === 404) {
        setStep("not-registered");
      } else {
        setError("Failed to check registration. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const proxyImage = (url) => {
    if (!url) return "";
    return `https://images.weserv.nl/?url=${url.replace(/^https?:\/\//, "")}`;
  };

  const copyToClipboard = async (text) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setLocationLinkCopied(true);
      window.setTimeout(() => setLocationLinkCopied(false), 1500);
    } catch (copyError) {
      console.error("Copy failed", copyError);
    }
  };

  const downloadPass = async () => {
    const element = document.getElementById("entry-pass");
    if (!element || !details) return;

    const prev = {
      maxHeight: element.style.maxHeight,
      height: element.style.height,
      overflow: element.style.overflow,
      overflowY: element.style.overflowY,
      overflowX: element.style.overflowX,
    };

    element.style.maxHeight = "none";
    element.style.height = "auto";
    element.style.overflow = "visible";
    element.style.overflowY = "visible";
    element.style.overflowX = "visible";

    await new Promise((resolve) => setTimeout(resolve, 350));

    const opt = {
      margin: 10,
      filename: `${details?.player?.name || "player"}-Entry-Pass.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      pagebreak: { mode: ["css", "legacy"] },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: 0,
        scrollX: 0,
        windowHeight: element.scrollHeight,
        ignoreElements: (el) => el.tagName === "BUTTON" || el.closest(".fixed") || el.closest(".hidden"),
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } finally {
      element.style.maxHeight = prev.maxHeight;
      element.style.height = prev.height;
      element.style.overflow = prev.overflow;
      element.style.overflowY = prev.overflowY;
      element.style.overflowX = prev.overflowX;
    }
  };

  const isTrial = details?.session && details?.slot;
  const payStatusNorm = String(details?.paymentDetails?.status || "").toLowerCase();
  const isPaid = payStatusNorm === "completed";
  const registrationComplete = Boolean(details);

  if (step === "mobile") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img src={logo} alt="CrickBro" className="w-16 h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl font-bold text-gray-900">Entry Pass</h1>
            <p className="text-gray-600 mt-2">Enter your mobile number to get your entry pass</p>
          </div>

          <form onSubmit={handleSendOtp}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-12 pr-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img src={logo} alt="CrickBro" className="w-16 h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
            <p className="text-gray-600 mt-2">
              Enter the 6-digit OTP sent to +91 {mobile}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  maxLength={1}
                  inputMode="numeric"
                />
              ))}
            </div>

            {(error || verifyError) && (
              <div className="text-red-600 text-sm text-center">
                {error || verifyError}
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={verifyLoading || otp.join("").length !== 6}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifyLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend OTP in {timer} seconds
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>

            <button
              onClick={() => setStep("mobile")}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
            >
              Change Mobile Number
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "not-registered") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Registered</h1>
          <p className="text-gray-600 mb-8">
            You are not registered for this tournament. Please register first to get your entry pass.
          </p>
          {/* <button
            onClick={() => navigate(`/landing-page/${auctionId}`)}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700"
          >
            Go to Registration
          </button> */}
        </div>
      </div>
    );
  }

  if (step === "pass") {
    return (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={() => navigate(-1)}
      >
        <div
          id="entry-pass"
          className="relative w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl rounded-2xl overflow-hidden shadow-2xl bg-white max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-white/90 rounded-full p-2 shadow-md hover:bg-white"
            onClick={() => navigate(-1)}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-gray-600">
              <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-3" />
              <p className="text-sm">Loading your entry pass…</p>
            </div>
          )}

          {!loading && details && (
            <>
              <div className="bg-gray-100 p-5 sm:p-6 rounded-b-3xl border-b border-gray-200">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 bg-white rounded-3xl p-4 shadow-sm border border-gray-200">
                      {details?.tournament?.logo ? (
                        <img
                          src={proxyImage(details.tournament.logo)}
                          alt="Tournament Logo"
                          crossOrigin="anonymous"
                          className="w-20 h-20 object-contain rounded-xl"
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-slate-200 text-xs text-slate-600 text-center px-2">
                          Tournament Logo
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                          Tournament
                        </p>
                        <h2 className="text-xl font-bold text-slate-900">
                          {details?.tournament?.name}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white rounded-3xl p-4 shadow-sm border border-gray-200">
                      <img
                        src={logo}
                        alt="CrickBro"
                        className="w-20 h-20 object-contain rounded-xl"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                          Powered by
                        </p>
                        <h2 className="text-xl font-bold text-slate-900">
                          CrickBro
                        </h2>
                      </div>
                    </div>
                  </div>

                  {registrationComplete && (
                    <button
                      type="button"
                      onClick={downloadPass}
                      className="inline-flex items-center justify-center rounded-full bg-red-600 p-3 text-white shadow-sm transition hover:bg-red-700"
                      aria-label="Download entry pass"
                      title="Download entry pass"
                    >
                      <Download size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2 sm:p-3 space-y-3 sm:space-y-4">
                <div className="grid gap-2 lg:grid-cols-[1.25fr_0.75fr]">
                  <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                      <div className="flex-shrink-0 w-full sm:w-52 h-52 rounded-3xl overflow-hidden bg-slate-100 flex items-center justify-center">
                        {details?.player?.profilePicture ? (
                          <img
                            src={proxyImage(details.player.profilePicture)}
                            alt="Player"
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center px-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                            Player image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Player details</p>
                          <h3 className="text-xl font-bold text-slate-900 leading-tight break-words">
                            {details?.player?.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600 capitalize">
                            {details?.player?.playerRole || '-'}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {details?.player?.countryCode || ''} {details?.player?.mobile || '-'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Batch ID</p>
                            <p className="mt-1 font-medium text-slate-900">{details?.player?.batchId || '-'}</p>
                            {qr && (
                              <img
                                src={qr}
                                alt="QR Code"
                                className="mx-auto mt-3 w-32 h-32"
                              />
                            )}
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Location</p>
                            <p className="mt-1 font-medium text-slate-900">
                              {details?.player?.location || details?.player?.city || details?.player?.address || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">Tournament & auction</h3>
                    <div className="mt-3 grid gap-2 text-sm text-slate-700">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Duration</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {formatDate(details?.tournament?.startDate)} - {formatDate(details?.tournament?.endDate)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Venue</p>
                        <p className="mt-2 font-medium text-slate-900">{details?.tournament?.cityTown || '-'}</p>
                      </div>
                      {details?.auction?.auctionStartedAt && (
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Auction date</p>
                          <p className="mt-1 font-medium text-slate-900">
                            {formatDate(details.auction.auctionStartedAt)}
                            {details.auction.auctionEndedAt ? ` - ${formatDate(details.auction.auctionEndedAt)}` : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {(details?.session || details?.slot) && (
                  <div className="space-y-3">
                    {details?.session && (
                      <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-900">Session details</h3>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-2xl bg-slate-50 p-2">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Session</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{details.session.name || '-'}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-2">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Date</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(details.session.slotDate)}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-2">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Time</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{details.session.slotStartTime || '--'} - {details.session.slotEndTime || '--'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {details?.slot && (
                      <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-900">Slot details</h3>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-2xl bg-slate-50 p-2">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Name</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{details.slot.slotName || '-'}</p>
                          </div>
                          <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-2">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Description</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{details.slot.description || '-'}</p>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 p-2">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Venue</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{details.slot.location?.venue || '-'}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-2">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Place</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{details.slot.location?.city || '-'}, {details.slot.location?.state || '-'}, {details.slot.location?.country || '-'}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-2 sm:col-span-2">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Address</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{details.slot.location?.address || '-'}{details.slot.location?.pincode ? ` - ${details.slot.location.pincode}` : ''}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-2 sm:col-span-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Map / location link</p>
                                <p className="mt-1 truncate text-sm font-medium text-slate-900">{details.slot.location?.link || '-'}</p>
                              </div>
                              {details.slot.location?.link && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(details.slot.location.link)}
                                  className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                                >
                                  {locationLinkCopied ? "Copied" : "Copy"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                    Registration completed
                  </p>
                  <p className="mt-2 text-sm text-emerald-900">
                    Your registration has been received and is complete. Show this pass at the venue.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default EntryPass;