import React, { useState } from "react";
import { toast } from "react-toastify";
import { Save, Settings } from "lucide-react";
import { useDispatch } from "react-redux";
import { EditRules } from "../../../../../redux/actions";

const EditAuctionRules = ({ currentRules, auctionId }) => {
  const [form, setForm] = useState({
    budgetCap: currentRules?.budgetCap ?? "",
    maxPlayersPerTeam: currentRules?.maxPlayersPerTeam ?? "",
    minPlayersPerTeam: currentRules?.minPlayersPerTeam ?? "",

    maxForeignPlayers: currentRules?.maxForeignPlayers ?? "",
    minWicketKeepers: currentRules?.minWicketKeepers ?? "",
    maxWicketKeepers: currentRules?.maxWicketKeepers ?? "",

    biddingIncrement: currentRules?.biddingIncrement ?? "",
    highPriceIncrement: currentRules?.highPriceIncrement ?? "",
    minimumBid: currentRules?.minimumBid ?? "",

    rtmEnabled: currentRules?.rtmEnabled || false,
    maxRTMCardsPerTeam: currentRules?.maxRTMCardsPerTeam ?? "",

    unsoldPlayerReEntry: currentRules?.unsoldPlayerReEntry || false,
    acceleratedRoundAfter: currentRules?.acceleratedRoundAfter ?? "",

    maxReturnPlayersPerTeam: currentRules?.maxReturnPlayersPerTeam ?? "",
    maxPurchasePlayersPerTeam: currentRules?.maxPurchasePlayersPerTeam ?? "",
    minPurchasePlayersPerTeam: currentRules?.minPurchasePlayersPerTeam ?? "",
  });

  const dispatch = useDispatch();

  const handleInput = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const cleanedForm = {
        ...form,
        maxForeignPlayers:
          form.maxForeignPlayers === "" ? 0 : Number(form.maxForeignPlayers),
      };
      const res = await dispatch(EditRules(auctionId, cleanedForm));
      toast.success("Auction rules updated successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
        {/* HEADER */}
        <div className="border-b border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[var(--text-primary)]">
                Auction Rules
              </h1>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Configure team limits, bidding increments and auction options.
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-4 py-4">
          {/* INPUT GRID */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { key: "budgetCap", label: "Team Budget Cap" },
              { key: "maxPlayersPerTeam", label: "Max Players / Team" },
              { key: "minPlayersPerTeam", label: "Min Players / Team" },
              { key: "maxForeignPlayers", label: "Max Foreign Players" },
              { key: "minWicketKeepers", label: "Min Wicket Keepers" },
              { key: "maxWicketKeepers", label: "Max Wicket Keepers" },
              { key: "minimumBid", label: "Base Price / Minimum Bid(Default)" },
              { key: "biddingIncrement", label: "Bidding Increment(Default)" },
              { key: "highPriceIncrement", label: "Max Price Increment(Default)" },
              { key: "maxRTMCardsPerTeam", label: "Max RTM Cards / Team" },
              { key: "acceleratedRoundAfter", label: "Accelerated Round After (Players)" },
              { key: "maxReturnPlayersPerTeam", label: "Max Retain Players" },
              {
                key: "maxPurchasePlayersPerTeam",
                label: "Max Purchase Players / Team",
              },
              {
                key: "minPurchasePlayersPerTeam",
                label: "Min Purchase Players / Team",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="group rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 transition focus-within:border-[var(--border-primary)] focus-within:bg-[var(--bg-card)] focus-within:ring-2 focus-within:ring-[var(--accent-light)]"
              >
                <label className="mb-1 block text-[11px] font-semibold text-[var(--text-secondary)]">
                  {item.label}
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter value"
                  className="w-full bg-transparent text-sm font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
                  value={form[item.key] ?? ""}
                  onChange={(e) =>
                    handleInput(item.key, e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
            ))}
          </div>

          {/* SWITCHES */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* RTM */}
            <div className="flex min-h-11 items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">RTM Enabled</span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.rtmEnabled}
                onChange={(e) => handleInput("rtmEnabled", e.target.checked)}
              />
            </div>

            {/* Unsold */}
            <div className="flex min-h-11 items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Unsold Re-entry Allowed
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.unsoldPlayerReEntry}
                onChange={(e) =>
                  handleInput("unsoldPlayerReEntry", e.target.checked)
                }
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-[var(--border-card)] bg-[var(--bg-main)] p-3">
          <button
            onClick={handleSubmit}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-4 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)]"
          >
            <Save className="h-4 w-4" />
            Save Auction Rules
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAuctionRules;
