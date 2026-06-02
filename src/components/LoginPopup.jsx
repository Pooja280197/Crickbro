import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "/Crickbro_auction_logo-1.png";
import cricketImg from "../assets/Images/cricket_bat.png";
import { useLoginPopup } from "../context/LoginPopupContext";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp } from "../redux/actions";

export default function LoginPopup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    loginPopupOpen,
    closeLoginPopup,
    afterLoginCallback,
    setAfterLoginCallback,
  } = useLoginPopup();

  const [step, setStep] = useState("mobile");
  const [loginDetails, setLoginDetails] = useState({
    mobile: "",
    countryCode: "+91",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef([]);
  const hasHandledLogin = useRef(false);

  const loading = useSelector((state) => state.loading.sendOtp);
  const error = useSelector((state) => state.error.sendOtp);
  const verifyData = useSelector((state) => state.data.verify);
  // const verifyLoading = useSelector((state) => state.loading.verify);

  useEffect(() => {
    if (!verifyData?.token || hasHandledLogin.current) return;

    hasHandledLogin.current = true;

    // Small delay to ensure Redux state and localStorage are fully synced
    // before closing popup and allowing navigation
    setTimeout(() => {
      if (afterLoginCallback) {
        afterLoginCallback();
        setAfterLoginCallback(null);
      }

      closeLoginPopup();
    }, 100);
  }, [verifyData, afterLoginCallback, navigate, closeLoginPopup]);

  useEffect(() => {
    let interval;

    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [step, timer]);

  //   const otpData = useSelector((state) => state.data.sendOtp);

  const handleChange = (e) => {
    setLoginDetails({ ...loginDetails, [e.target.name]: e.target.value });
  };

  /* ---------------- MOBILE SUBMIT ---------------- */
  const handleSendOtp = (e) => {
    e.preventDefault();

    if (loginDetails.mobile.length !== 10) {
      // toast.error("Enter a valid mobile number");
      return;
    }
    dispatch(
      sendOtp({
        key: "sendOtp",
        payload: loginDetails,
      }),
    );
    setStep("otp");
    setTimer(30); // start timer
    setCanResend(false);
  };

  const handleResendOtp = () => {
    dispatch(
      sendOtp({
        key: "sendOtp",
        payload: loginDetails,
      }),
    );

    setTimer(30);
    setCanResend(false);
  };

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  /* ---------------- OTP HANDLING ---------------- */
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const handleVerifyOtp = () => {
    const finalOtp = otp.join("");
    if (finalOtp.length < 6) return;

    const data = {
      mobile: loginDetails.mobile,
      countryCode: loginDetails.countryCode,
      otp: finalOtp,
      fcm_token: "hello",
    };

    dispatch(
      verifyOtp({
        key: "verifyOtp",
        payload: data,
      }),
    );
    setOtp(["", "", "", "", "", ""]);
    setLoginDetails({ mobile: "", countryCode: "+91" });
  };

  if (!loginPopupOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4 font-main">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={closeLoginPopup}
          className="absolute top-4 right-4 z-20 btn-icon text-[var(--secondary)] hover:bg-[var(--border-card)]/40 transition"
        >
          <X size={22} />
        </button>

        {/* LEFT BRAND / IMAGE PANEL */}
        <div className="hidden md:flex w-1/2 relative bg-[var(--bg-deep)]">
          <img
            src={cricketImg}
            alt="Cricket Auction"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/40 to-transparent p-10 flex flex-col justify-end">
            <h2 className="text-3xl font-heading font-bold uppercase tracking-wide text-[var(--text-primary)]">
              Win The Auction
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-xs font-main">
              Create teams • Bid live • Manage players seamlessly
            </p>
            <div className="mt-6 h-1 w-24 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full animate-pulse" />
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-[var(--bg-section)]/95 border-l border-[var(--border-card)]">
          {/* Logo + Brand */}
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="CrickBro"
              className="h-14 w-14 rounded-full mx-auto mb-4 shadow-lg border-2 border-[var(--secondary)]"
            />
            <h1 className="text-2xl font-heading font-bold uppercase tracking-wide text-[var(--text-primary)]">
              CrickBro Auction
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1 font-main">
              India’s smart cricket auction platform
            </p>
          </div>

          {/* MOBILE STEP */}
          {step === "mobile" && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1 font-semibold">
                  Mobile Number
                </label>

                <div className="flex flex-col gap-3">
                  <select
                    name="countryCode"
                    value={loginDetails.countryCode}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-main"
                  >
                    <option value="+91">🇮🇳 India (+91)</option>
                    <option value="+1">🇺🇸 USA (+1)</option>
                    <option value="+44">🇬🇧 UK (+44)</option>
                  </select>

                  <input
                    type="tel"
                    name="mobile"
                    maxLength={10}
                    value={loginDetails.mobile}
                    onChange={handleChange}
                    placeholder="Enter 10-digit number"
                    className="px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-main"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold shadow-sm shadow-[rgba(8,186,247,0.22)] hover:opacity-95 transition-colors"
              >
                {loading ? "Sending OTP..." : "Get OTP"}
              </button>

              <p className="text-xs text-center text-[var(--text-secondary)]/80 font-main">
                Secure login for Admins, Owners & Players
              </p>
            </form>
          )}

          {/* OTP STEP */}
          {step === "otp" && (
            <div className="space-y-7">
              <div className="text-center">
                <h2 className="text-xl font-heading font-bold text-[var(--text-primary)]">
                  Verify OTP
                </h2>
                <p className="text-sm text-[var(--text-secondary)]/80 mt-1 font-main">
                  Sent to {loginDetails.countryCode} {loginDetails.mobile}
                </p>
              </div>

              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="h-12 w-11 text-center text-lg font-semibold rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-main"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold shadow-sm shadow-[rgba(8,186,247,0.22)] hover:opacity-95 transition-colors"
              >
                Verify & Continue
              </button>

              <div className="text-center text-sm font-main">
                {!canResend ? (
                  <p className="text-[var(--text-secondary)]/80">
                    Resend OTP in <span className="font-semibold">{timer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-[var(--secondary)] font-semibold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => setStep("mobile")}
                className="text-sm text-[var(--text-secondary)]/80 hover:text-[var(--primary)] text-center font-main"
              >
                Change mobile number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
