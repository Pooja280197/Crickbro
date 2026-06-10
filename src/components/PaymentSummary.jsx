import React from "react";
import { CreditCard, Info } from "lucide-react";

const PaymentSummary = ({ paymentDetails, auctionDetails }) => {
  if (!paymentDetails || !auctionDetails) return null;

  const {
    registrationFee = 0,
    platformFee = 0,
    gstEnabled = false,
    gstPercentage = 0,
    gstAmount = 0,
    amount = 0,
  } = paymentDetails;

  const subTotal = registrationFee + platformFee;

  return (
    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          Payment Breakdown
        </h3>
      </div>

      <div className="space-y-3">
        {/* Registration Fee */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--text-secondary)]">Registration Fee:</span>
          <span className="font-semibold text-[var(--text-primary)]">
            ₹{registrationFee.toFixed(2)}
          </span>
        </div>

        {/* Platform Fee */}
        {platformFee > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-secondary)]">Platform Fee:</span>
            <span className="font-semibold text-[var(--text-primary)]">
              ₹{platformFee.toFixed(2)}
            </span>
          </div>
        )}

        {/* Subtotal */}
        <div className="border-t border-[var(--border-card)] pt-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-secondary)]">Subtotal:</span>
            <span className="font-semibold text-[var(--text-primary)]">
              ₹{subTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* GST */}
        {gstEnabled && gstPercentage > 0 && (
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1">
              <span className="text-[var(--text-secondary)]">
                GST ({gstPercentage}%):
              </span>
            </div>
            <span className="font-semibold text-[var(--text-primary)]">
              ₹{gstAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Total Amount */}
        <div className="rounded-md border-t border-[var(--border-card)] bg-[var(--bg-card)] p-3 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-[var(--text-primary)]">
              Total Amount:
            </span>
            <span className="text-xl font-bold text-[var(--primary)]">
              ₹{amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="mt-4 rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
          <p className="text-xs text-[var(--text-primary)]">
            You will be redirected to the payment gateway after confirming.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
