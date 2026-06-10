import React, { useState } from "react";
import { X, Users, Phone, Mail, MapPin, Upload, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { logoUrl } from "../../config/env";
import { loadRazorpayScript, getRazorpayPaymentConfig } from "../../utils/RazorPay";

const DUMMY_IMAGE =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

// ── helpers ──────────────────────────────────────────────────────────────────
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
    <div className="space-y-1 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3 text-sm">
      <div className="flex justify-between text-[var(--text-secondary)]">
        <span>Registration Fee</span>
        <span>₹{base.toLocaleString()}</span>
      </div>
      {platform > 0 && (
        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>Platform Fee</span>
          <span>₹{platform.toLocaleString()}</span>
        </div>
      )}
      {gst > 0 && (
        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>GST ({tr?.teamGstPercentage}%)</span>
          <span>₹{gst.toLocaleString()}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-[var(--border-card)] pt-1 font-bold text-[var(--primary)]">
        <span>Total Payable</span>
        <span>₹{total.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TeamRegistrationPopup({
  isOpen,
  onClose,
  auctionId,
  tournamentId,
  teamRegistration, // auction.teamRegistration object
  auctionName,
  onSuccess,
}) {
  const isPaid = teamRegistration?.teamRegistrationPaid;

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

  if (!isOpen) return null;

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
    if (!form.teamName.trim()) { toast.error("Team name is required"); return false; }
    if (!form.teamOwner.trim()) { toast.error("Owner name is required"); return false; }
    if (!form.mobileNumber.trim() || !/^\d{10}$/.test(form.mobileNumber.trim())) {
      toast.error("Valid 10-digit mobile number is required");
      return false;
    }
    return true;
  };

  // ── FREE registration ────────────────────────────────────────────────────
  const handleFreeRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tournamentId", tournamentId);
      formData.append("auctionId", auctionId);
      formData.append("teamName", form.teamName.trim());
      formData.append("teamOwner", form.teamOwner.trim());
      formData.append("mobileNumber", form.mobileNumber.trim());
      formData.append("contactEmail", form.contactEmail.trim());
      formData.append("location", form.location.trim());
      if (form.logo) formData.append("logo", form.logo);

      await api.post("/webSiteApi/auctionTeamRegistration/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Team registered successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── PAID registration ────────────────────────────────────────────────────
  const handlePaidRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Step 1: initiate-payment → get Razorpay order
      const formData = new FormData();
      formData.append("tournamentId", tournamentId);
      formData.append("auctionId", auctionId);
      formData.append("teamName", form.teamName.trim());
      formData.append("teamOwner", form.teamOwner.trim());
      formData.append("mobileNumber", form.mobileNumber.trim());
      formData.append("contactEmail", form.contactEmail.trim());
      formData.append("location", form.location.trim());
      if (form.logo) formData.append("logo", form.logo);

      const res = await api.post("/webSiteApi/auctionTeamRegistration/initiate-payment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res?.data?.data;
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      // Step 2: open Razorpay
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
          // Step 3: verify payment
          try {
            await api.post("/webSiteApi/auctionTeamRegistration/verify-payment", {
              registrationId: data.registrationId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            toast.success("Team registered & payment confirmed!");
            onSuccess?.();
            onClose();
          } catch (verifyErr) {
            toast.warning(
              `Payment received (ID: ${response.razorpay_payment_id}), but confirmation failed. Contact support.`
            );
            onClose();
          }
        },
        modal: {
          ondismiss: () => toast.info("Payment cancelled"),
        },
        theme: { color: "#1769E0" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-card)] bg-[var(--bg-main)] px-6 py-4">
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-bold">Register Your Team</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Logo upload */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-[var(--border-card)] bg-[var(--bg-main)]"
              onClick={() => document.getElementById("team-logo-input").click()}
            >
              <img
                src={form.logoPreview || DUMMY_IMAGE}
                alt="logo"
                className="w-full h-full object-cover"
              />
            </div>
            <label
              htmlFor="team-logo-input"
              className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              <Upload className="w-3 h-3" /> Upload Team Logo
            </label>
            <input
              id="team-logo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          {/* Team Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Team Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Enter team name"
                value={form.teamName}
                onChange={(e) => update("teamName", e.target.value)}
                className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>
          </div>

          {/* Owner Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter owner name"
              value={form.teamOwner}
              onChange={(e) => update("teamOwner", e.target.value)}
              className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            />
          </div>

          {/* Mobile */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={form.mobileNumber}
                onChange={(e) => update("mobileNumber", e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Email (optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="email"
                placeholder="team@example.com"
                value={form.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
                className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Location (optional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="City / Area"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>
          </div>

          {/* Amount breakdown (paid only) */}
          {isPaid && <AmountBreakdown tr={teamRegistration} />}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-[var(--border-card)] bg-[var(--bg-main)] px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--border-card)] py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPaid ? "Pay & Register" : "Register Team"}
          </button>
        </div>
      </div>
    </div>
  );
}
