import React, { useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
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
    <div className="min-h-screen bg-[var(--color-primary)] flex justify-center px-2 py-3">
      <div className="w-full  card-glass flex flex-col">
        {/* HEADER */}
        <div className="py-3 text-center border-b border-gray-500/80">
          <h1 className="text-base font-oswald tracking-wide text-crickbroYellow">
            Auction Rules
          </h1>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-3 font-inter">
          {/* INPUT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="px-3 py-2 rounded-lg bg-white/5 border border-gray-500/40 focus-within:border-crickbroPurple transition"
              >
                <label className="block text-[11px] text-gray-800 mb-1">
                  {item.label}
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter value"
                  className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-white/30"
                  value={form[item.key] ?? ""}
                  onChange={(e) =>
                    handleInput(item.key, e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
            ))}
          </div>

          {/* SWITCHES */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* RTM */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-gray-800">RTM Enabled</span>
              <input
                type="checkbox"
                className="accent-crickbroPurple"
                checked={form.rtmEnabled}
                onChange={(e) => handleInput("rtmEnabled", e.target.checked)}
              />
            </div>

            {/* Unsold */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-gray-800">
                Unsold Re-entry Allowed
              </span>
              <input
                type="checkbox"
                className="accent-crickbroPurple"
                checked={form.unsoldPlayerReEntry}
                onChange={(e) =>
                  handleInput("unsoldPlayerReEntry", e.target.checked)
                }
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleSubmit}
            className="w-full btn-primary py-2 text-sm"
          >
            Save Auction Rules
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAuctionRules;
