import React, { useState } from "react";
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
    <div className="rounded-lg bg-white/10 border border-white/15 p-3 text-sm space-y-1">
      <div className="flex justify-between text-blue-100">
        <span>Registration Fee</span>
        <span>₹{base.toLocaleString()}</span>
      </div>
      {platform > 0 && (
        <div className="flex justify-between text-blue-100">
          <span>Platform Fee</span>
          <span>₹{platform.toLocaleString()}</span>
        </div>
      )}
      {gst > 0 && (
        <div className="flex justify-between text-blue-100">
          <span>GST ({tr?.teamGstPercentage}%)</span>
          <span>₹{gst.toLocaleString()}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-white border-t border-white/20 pt-1">
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
      id="team-registration-form"
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
          {/* Left Content */}
          <div className="registration-form-intro space-y-5 animate-fadeIn rounded-3xl p-5 md:p-7 bg-transparent shadow-none border-0 flex flex-col justify-center h-full">
            <div className="space-y-3 text-center lg:text-left">
              <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] mx-auto lg:mx-0 text-blue-700 bg-blue-100">
                Team Registration
              </span>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold leading-tight text-blue-900">
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

          {/* Right Form */}
          <div className="registration-form-card quick-form-card w-full max-w-2xl mx-auto rounded-3xl p-4 sm:p-5 md:p-6 border shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-white font-black text-2xl tracking-tight">
                  Registration
                </h2>
              </div>
              {isPaid && (
                <div className="hidden rounded-2xl bg-white/15 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15 sm:block">
                  Paid Entry
                </div>
              )}
            </div>
            <div className="registration-form-body space-y-4">
              {/* Logo Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr_1fr] gap-3 items-end">
                <div className="flex flex-col items-center sm:items-center justify-end">
                  <button
                    type="button"
                    className="relative w-20 h-20 mb-1 border-2 rounded-xl overflow-hidden transition hover:shadow-md border-blue-400/40 cursor-pointer"
                    onClick={() =>
                      document.getElementById("landing-team-logo-input")?.click()
                    }
                  >
                    <img
                      src={form.logoPreview || DUMMY_IMAGE}
                      alt="logo"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 p-1.5 rounded-full shadow-sm bg-blue-600">
                      <Upload className="w-3 h-3 text-white" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full py-2.5 text-sm font-bold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        .registration-form-card button[type="button"]:not(:disabled).bg-blue-600 {
          background: #3b82f6 !important;
          color: #ffffff !important;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.24);
          transform: none !important;
        }

        .registration-form-card button[type="button"]:not(:disabled).bg-blue-600:hover {
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

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
