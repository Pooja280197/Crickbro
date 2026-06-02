import React, { useState } from "react";
import { Users, Phone, Mail, MapPin, Upload, Loader2 } from "lucide-react";
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
    <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-sm space-y-1">
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
      <div className="flex justify-between font-bold text-indigo-700 border-t border-indigo-200 pt-1">
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

  return (
    <div
      className="relative"
      style={{
        background:
          "linear-gradient(135deg, var(--color-header-1) 0%, var(--color-header-2) 100%)",
      }}
      id="team-registration-form"
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
          <div className="text-white space-y-6">
            <div className="space-y-4">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold italic leading-tight text-[var(--background)]">
                {pagedata?.tournamentTitle}
              </h1>
              <h2
                className="text-2xl sm:text-4xl md:text-6xl font-bold italic"
                style={{ color: "var(--color-crickbroYellow)" }}
              >
                {pagedata?.tournamentName}
              </h2>
            </div>
            <div className="space-y-3 pt-4">
              <p className="text-lg md:text-xl font-semibold">
                {pagedata?.description}
              </p>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white/10 backdrop-blur-md w-full max-w-lg mx-auto rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-xl">
            <h2 className="text-[var(--color-text)] text-center font-bold text-2xl sm:text-3xl mb-4 sm:mb-6 font-oswald tracking-wide">
              Team Registration
            </h2>
            <div className="space-y-4">
              {/* Logo Upload */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 cursor-pointer bg-white/20 flex items-center justify-center"
                  onClick={() => document.getElementById("landing-team-logo-input")?.click()}
                >
                  <img
                    src={form.logoPreview || DUMMY_IMAGE}
                    alt="logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label
                  htmlFor="landing-team-logo-input"
                  className="flex items-center gap-1 text-xs text-white/80 cursor-pointer hover:text-white"
                >
                  <Upload className="w-3 h-3" /> Upload Team Logo
                </label>
                <input
                  id="landing-team-logo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>

              {/* Team Name */}
              <div className="space-y-1">
                <label className="block text-white text-sm font-semibold tracking-wide">
                  Team Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.teamName}
                    onChange={(e) => update("teamName", e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/90 border border-white/30 focus:ring-2 focus:ring-white/50 outline-none text-slate-800"
                    placeholder="Enter team name"
                  />
                </div>
              </div>

              {/* Team Owner */}
              <div className="space-y-1">
                <label className="block text-white text-sm font-semibold tracking-wide">
                  Team Owner <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.teamOwner}
                    onChange={(e) => update("teamOwner", e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/90 border border-white/30 focus:ring-2 focus:ring-white/50 outline-none text-slate-800"
                    placeholder="Owner full name"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="space-y-1">
                <label className="block text-white text-sm font-semibold tracking-wide">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={form.mobileNumber}
                    onChange={(e) => update("mobileNumber", e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/90 border border-white/30 focus:ring-2 focus:ring-white/50 outline-none text-slate-800"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              {/* Email & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-white text-sm font-semibold tracking-wide">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => update("contactEmail", e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/90 border border-white/30 focus:ring-2 focus:ring-white/50 outline-none text-slate-800"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-white text-sm font-semibold tracking-wide">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => update("location", e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/90 border border-white/30 focus:ring-2 focus:ring-white/50 outline-none text-slate-800"
                      placeholder="City"
                    />
                  </div>
                </div>
              </div>

              {isPaid && <AmountBreakdown tr={teamRegistration} />}

              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </div>
  );
}
