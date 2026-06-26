import React from "react";
import PaymentSummary from "./PaymentSummary";
import { X } from "lucide-react";

const PaymentConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  paymentDetails,
  auctionDetails,
  player,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-card)] bg-[var(--bg-card)] p-4 sm:p-5">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Confirm Payment
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="professional-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[var(--bg-main)] p-4 [scrollbar-gutter:stable] sm:p-5">
            {/* Player Info */}
            {player && (
              <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4">
                <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-2">
                  Player Details
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-[var(--text-secondary)]">Name:</span>{" "}
                    <span className="font-medium text-[var(--text-primary)]">
                      {player.name}
                    </span>
                  </p>
                  <p>
                    <span className="text-[var(--text-secondary)]">Mobile:</span>{" "}
                    <span className="font-medium text-[var(--text-primary)]">
                      {player.countryCode} {player.mobile}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <PaymentSummary
              paymentDetails={paymentDetails}
              auctionDetails={auctionDetails}
            />

            {/* Terms */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700">
                By clicking "Proceed to Payment", you authorize the payment for registration. The transaction will be processed securely via Razorpay.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="shrink-0 border-t border-[var(--border-card)] bg-[var(--bg-card)] p-4 sm:p-5">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-[var(--border-card)] px-4 py-2.5 font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentConfirmationModal;
