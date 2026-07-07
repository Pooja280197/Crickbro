import React, { useEffect, useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../../utils/api";
import { logoUrl } from "../../../config/env";
import {
  getRazorpayPaymentConfig,
  loadRazorpayScript,
} from "../../../utils/RazorPay";

const DUMMY_IMAGE =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

function calcAmount(tr) {
  const base = Number(tr?.teamRegistrationFee) || 0;
  const platform = Number(tr?.teamPlatformFee) || 0;
  const subtotal = base + platform;
  const gst = tr?.teamGstEnabled
    ? Math.ceil(subtotal * (Number(tr?.teamGstPercentage) || 0) / 100)
    : 0;
  return { base, platform, gst, total: subtotal + gst };
}

function AmountBreakdown({ tr }) {
  const { base, platform, gst, total } = calcAmount(tr);

  return (
    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm space-y-1">
      <div className="flex justify-between text-slate-600">
        <span>Registration Fee</span>
        <span>₹{base.toLocaleString()}</span>
      </div>
      {platform > 0 && (
        <div className="flex justify-between text-slate-600">
          <span>Platform Fee</span>
          <span>₹{platform.toLocaleString()}</span>
        </div>
      )}
      {gst > 0 && (
        <div className="flex justify-between text-slate-600">
          <span>GST ({tr?.teamGstPercentage}%)</span>
          <span>₹{gst.toLocaleString()}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-slate-900 border-t border-blue-200 pt-1">
        <span>Total Payable</span>
        <span>₹{total.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function TeamRegistrationForm({
  auctionId,
  tournamentId,
  teamRegistration,
  auctionName,
  onSuccess,
  pagedata,
  showSwitcher,
  activeTab,
  onSwitch,
}) {
  const isPaid = !!teamRegistration?.teamRegistrationPaid;

  const [form, setForm] = useState({
    teamName: "",
    teamOwner: "",
    mobileNumber: "",
    contactEmail: "",
    location: "",
    logo: null,
    logoPreview: null,
  });
  const [loading, setLoading] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [canExpandDescription, setCanExpandDescription] = useState(false);
  const descriptionPreviewRef = useRef(null);

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () =>
      setForm((p) => ({ ...p, logo: file, logoPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!auctionId || !tournamentId) {
      toast.error("Tournament or auction details are missing");
      return false;
    }
    if (!form.teamName.trim()) {
      toast.error("Team name is required");
      return false;
    }
    if (!form.teamOwner.trim()) {
      toast.error("Owner name is required");
      return false;
    }
    if (!form.mobileNumber.trim() || !/^\d{10}$/.test(form.mobileNumber.trim())) {
      toast.error("Valid 10-digit mobile number is required");
      return false;
    }
    return true;
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("tournamentId", tournamentId);
    formData.append("auctionId", auctionId);
    formData.append("teamName", form.teamName.trim());
    formData.append("teamOwner", form.teamOwner.trim());
    formData.append("mobileNumber", form.mobileNumber.trim());
    formData.append("contactEmail", form.contactEmail.trim());
    formData.append("location", form.location.trim());
    if (form.logo) formData.append("logo", form.logo);
    return formData;
  };

  const clearForm = () => {
    setForm({
      teamName: "",
      teamOwner: "",
      mobileNumber: "",
      contactEmail: "",
      location: "",
      logo: null,
      logoPreview: null,
    });
  };

  const handleFreeRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post(
        "/webSiteApi/auctionTeamRegistration/register",
        buildFormData(),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success("Team registered successfully!");
      clearForm();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePaidRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post(
        "/webSiteApi/auctionTeamRegistration/initiate-payment",
        buildFormData(),
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const data = res?.data?.data;
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: auctionName || "Team Registration",
        description: "Team Registration Fee",
        image: logoUrl,
        prefill: {
          name: form.teamOwner.trim(),
          contact: form.mobileNumber.trim(),
          email: form.contactEmail.trim() || undefined,
        },
        ...getRazorpayPaymentConfig(),
        handler: async (response) => {
          try {
            await api.post("/webSiteApi/auctionTeamRegistration/verify-payment", {
              registrationId: data.registrationId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            toast.success("Team registered & payment confirmed!");
            clearForm();
            onSuccess?.();
          } catch (verifyErr) {
            toast.warning(
              `Payment received (ID: ${response.razorpay_payment_id}), but confirmation failed. Contact support.`,
            );
          }
        },
        modal: {
          ondismiss: () => toast.info("Payment cancelled"),
        },
        theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => (isPaid ? handlePaidRegister() : handleFreeRegister());

  useEffect(() => {
    const preview = descriptionPreviewRef.current;
    if (!preview) return;

    const updateDescriptionOverflow = () => {
      const rootFontSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const collapsedMaxHeight = Math.min(
        Math.max(18 * rootFontSize, window.innerHeight * 0.42),
        28 * rootFontSize,
      );
      const contentHeight =
        preview.firstElementChild?.scrollHeight || preview.scrollHeight;
      const hasOverflow = contentHeight > collapsedMaxHeight + 12;
      setCanExpandDescription(hasOverflow);
      if (!hasOverflow) setIsDescriptionExpanded(false);
    };

    const frameId = window.requestAnimationFrame(updateDescriptionOverflow);
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateDescriptionOverflow)
        : null;
    resizeObserver?.observe(preview);
    if (preview.firstElementChild) resizeObserver?.observe(preview.firstElementChild);
    window.addEventListener("resize", updateDescriptionOverflow);
    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateDescriptionOverflow);
    };
  }, [pagedata?.description]);

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
    "--rf-primary": "#FBBF24",
    "--rf-accent": "#F59E0B",
    fontFamily:
      '"Inter", "Manrope", "Nunito Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  return (
    <div
      className="registration-form-section relative overflow-hidden"
      // style={formThemeStyle}
         style={{
        background: "linear-gradient(to bottom, #8e44ad, #1a1a2e)",
        borderTop: "2px solid rgba(255,255,255,0.15)",
        boxShadow: "inset 0 10px 25px rgba(0,0,0,0.4)",
        color: "#fff"
      }}
      id="team-registration-form"
    >
      {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 opacity-80" /> */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(37,99,235,0.06),transparent_28%)]" />
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 relative z-10">
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
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5 md:gap-8 items-start lg:items-center">
          {/* Left Content */}
          <div className="registration-form-intro space-y-4 animate-fadeIn rounded-2xl p-4 md:p-5 bg-transparent shadow-none border-0 flex flex-col justify-center h-full">
            <div className="space-y-3 text-center lg:text-left">
              {/* <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] mx-auto lg:mx-0 text-blue-700 bg-blue-100">
                Team Registration
              </span> */}
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold leading-tight text-blue-900">
                {pagedata?.tournamentTitle}
              </h1>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-blue-800">
                {pagedata?.tournamentName}
              </h2>
            </div>
            <div className="pt-1 text-center lg:text-left">
              <div
                ref={descriptionPreviewRef}
                className={`registration-description-preview ${
                  isDescriptionExpanded ? "is-expanded" : ""
                } ${canExpandDescription ? "has-overflow" : ""}`}
              >
                <div
                  className=" font-medium leading-7"
                  dangerouslySetInnerHTML={{
                    __html: pagedata?.description || "",
                  }}
                />
              </div>
              {pagedata?.description && canExpandDescription && (
                <button
                  type="button"
                  className="registration-description-button mt-3 inline-flex items-center justify-center rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                  onClick={() =>
                    setIsDescriptionExpanded((isExpanded) => !isExpanded)
                  }
                >
                  {isDescriptionExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>

          {/* Right Form */}
          <div className="registration-form-card quick-form-card w-full max-w-xl mx-auto lg:self-center rounded-2xl p-3.5 sm:p-4 border shadow-lg">
            <div className="registration-form-heading mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-xl tracking-tight">
                  Team Registration
                </h2>
              </div>
              {isPaid && (
                <div className="hidden rounded-full px-3 py-1.5 text-xs font-semibold sm:block">
                  Paid Entry
                </div>
              )}
            </div>
            <div className="registration-form-body space-y-2.5">
              {/* Logo Upload */}
              <div className="team-registration-primary-grid grid grid-cols-1 sm:grid-cols-[76px_1fr_1fr] gap-2.5 items-end">
                <div className="flex flex-col items-center sm:items-center justify-end">
                  <button
                    type="button"
                    className="relative w-16 h-16 mb-1 border-2 rounded-xl overflow-hidden transition hover:shadow-md border-blue-300 cursor-pointer bg-white"
                    onClick={() =>
                      document.getElementById("landing-team-logo-input")?.click()
                    }
                  >
                    <img
                      src={form.logoPreview || DUMMY_IMAGE}
                      alt="logo"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 p-1.5 rounded-full shadow-sm bg-yellow-500">
                      <Upload className="w-3 h-3 text-black" />
                    </span>
                  </button>
                  <input
                    id="landing-team-logo-input"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleLogoChange}
                  />
                  <p className="text-[10px] font-semibold text-gray-500">
                    Upload logo
                  </p>
                </div>

                {/* Team Name */}
                <div>
                  <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.teamName}
                    onChange={(e) => update("teamName", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    placeholder="Enter team name"
                  />
                </div>

                {/* Team Owner */}
                <div>
                  <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                    Team Owner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.teamOwner}
                    onChange={(e) => update("teamOwner", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    placeholder="Owner full name"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={form.mobileNumber}
                  onChange={(e) =>
                    update("mobileNumber", e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  placeholder="10-digit mobile"
                />
              </div>

              {/* Email & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => update("contactEmail", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-[var(--rf-label)] text-sm font-semibold mb-1 tracking-wide">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    placeholder="City"
                  />
                </div>
              </div>

              {isPaid && <AmountBreakdown tr={teamRegistration} />}

              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="w-full py-2.5 text-sm font-bold rounded-md bg-yellow-500 hover:bg-yellow-600 text-black transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : isPaid ? (
                  "Proceed to Payment"
                ) : (
                  "Register Team"
                )}
              </button>
            </div>
          </div>
        </div>
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

        .registration-intro-description {
          max-height: none;
          overflow-x: hidden;
          overflow-y: visible;
          padding-right: 0;
        }

        .registration-description-preview {
          position: relative;
          max-height: clamp(18rem, 42vh, 28rem);
          overflow: hidden;
        }

        .registration-description-preview.is-expanded {
          max-height: min(58vh, 460px);
          overflow-x: hidden;
          overflow-y: auto;
          padding-right: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: #93c5fd transparent;
        }

        .registration-description-preview.has-overflow::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 4.5rem;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(239, 246, 255, 0), var(--rf-section) 86%);
        }

        .registration-description-preview.is-expanded::after {
          display: none;
        }

        .registration-description-preview.is-expanded::-webkit-scrollbar {
          width: 6px;
        }

        .registration-description-preview.is-expanded::-webkit-scrollbar-track {
          background: transparent;
        }

        .registration-description-preview.is-expanded::-webkit-scrollbar-thumb {
          background: #93c5fd;
          border-radius: 999px;
        }

        .registration-description-button {
          color: #1d4ed8;
        }

        .registration-rich-text {
          color: #334155;
          font-family: inherit;
          font-synthesis: style;
          line-height: 1.65;
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .registration-rich-text * {
          max-width: 100%;
        }

        .registration-rich-text > :first-child {
          margin-top: 0 !important;
        }

        .registration-rich-text > :last-child {
          margin-bottom: 0 !important;
        }

        .registration-rich-text p {
          margin: 0.42rem 0;
        }

        .registration-rich-text h1,
        .registration-rich-text h2,
        .registration-rich-text h3,
        .registration-rich-text h4,
        .registration-rich-text h5,
        .registration-rich-text h6 {
          margin: 0.75rem 0 0.35rem;
          color: #1e3a8a;
          font-weight: 800;
          line-height: 1.18;
        }

        .registration-rich-text h1 { font-size: 1.65rem; }
        .registration-rich-text h2 { font-size: 1.42rem; }
        .registration-rich-text h3 { font-size: 1.18rem; }
        .registration-rich-text h4,
        .registration-rich-text h5,
        .registration-rich-text h6 { font-size: 1.02rem; }

        .registration-rich-text strong,
        .registration-rich-text b {
          color: #1f2937;
          font-weight: 800;
        }

        .registration-rich-text em,
        .registration-rich-text i,
        .registration-rich-text span[style*="italic"],
        .registration-rich-text span[style*="font-style:italic"],
        .registration-rich-text span[style*="font-style: italic"],
        .registration-rich-text [style*="font-style" i] {
          font-family: inherit !important;
          font-synthesis: style !important;
          font-style: oblique 14deg !important;
        }

        .registration-rich-text ul,
        .registration-rich-text ol {
          margin: 0.5rem 0;
          padding-left: 1.55rem;
        }

        .registration-rich-text ul {
          list-style: disc outside;
        }

        .registration-rich-text ol {
          list-style: decimal outside;
        }

        .registration-rich-text li {
          display: list-item;
          padding-left: 0.25rem;
          break-inside: avoid;
        }

        .registration-rich-text li > p:first-child {
          display: inline;
          margin: 0;
        }

        .registration-rich-text li > p:not(:first-child) {
          margin: 0.25rem 0 0;
        }

        .registration-rich-text li + li {
          margin-top: 0.22rem;
        }

        .registration-rich-text li::marker {
          color: #2563eb;
          font-weight: 800;
        }

        .registration-rich-text blockquote {
          margin: 0.65rem 0;
          border-left: 3px solid #93c5fd;
          padding-left: 0.75rem;
          color: #475569;
          font-style: italic;
        }

        .registration-rich-text a {
          color: #2563eb;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .registration-form-card {
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.96);
          border-color: #dbeafe;
          color: #0f172a;
          box-shadow: 0 16px 38px rgba(30, 64, 175, 0.12);
        }

        .registration-form-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          background: linear-gradient(180deg, rgba(239, 246, 255, 0.7), transparent 46%);
        }

        .registration-form-card > * {
          position: relative;
          z-index: 1;
        }

        .registration-form-card.quick-form-card {
          background: rgba(255, 255, 255, 0.97) !important;
          border-color: #bfdbfe !important;
          color: #0f172a !important;
          box-shadow: 0 16px 38px rgba(30, 64, 175, 0.12) !important;
          backdrop-filter: none !important;
        }

        .registration-form-card.quick-form-card::before {
          background: linear-gradient(180deg, rgba(239, 246, 255, 0.75), transparent 46%) !important;
          opacity: 1 !important;
          transform: none !important;
          animation: none !important;
        }

        .registration-form-switcher {
          background: var(--rf-card);
          border-color: var(--rf-card-border);
        }

        .registration-form-card label {
          color: #1e3a8a !important;
          font-size: 0.72rem !important;
          font-weight: 600 !important;
          letter-spacing: 0.01em !important;
          margin-bottom: 0.16rem !important;
        }

        .registration-form-card input:not([type="file"]),
        .registration-form-card select,
        .registration-form-card textarea {
          text-align: left !important;
          min-height: 34px;
          padding: 0.38rem 0.65rem !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.42rem !important;
          background: #f9fafb !important;
          color: #111827 !important;
          font-size: 0.82rem !important;
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
          color: #0f172a !important;
        }

        .registration-form-card p {
          color: #475569;
        }

        .registration-form-card .text-\[var\(--rf-primary\)\],
        .registration-form-card .text-blue-600 {
          color: #2563eb !important;
        }

        .registration-form-card .bg-\[var\(--rf-section-soft\)\] {
          background: #eff6ff !important;
          color: #1d4ed8 !important;
        }

        .registration-form-card button {
          border-radius: 0.45rem !important;
        }

        .registration-form-card button[type="button"] {
          min-height: 38px;
          padding-top: 0.45rem !important;
          padding-bottom: 0.45rem !important;
        }

        .registration-form-heading > div:last-child {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }

        .registration-form-card button[type="button"]:not(:disabled).bg-yellow-500 {
          background: #FBBF24 !important;
          color: #000000 !important;
          box-shadow: 0 8px 20px rgba(251, 191, 36, 0.24);
          transform: none !important;
        }

        .registration-form-card button[type="button"]:not(:disabled).bg-yellow-500:hover {
          background: #F59E0B !important;
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

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>

    </div>
  );
}
