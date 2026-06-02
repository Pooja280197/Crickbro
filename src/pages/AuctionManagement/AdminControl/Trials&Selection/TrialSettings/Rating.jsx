import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { UpateRating } from "../../../../../redux/actions";
import { useDispatch } from "react-redux";

/* Reusable slider component */
const RatingInput = ({ label, value, setValue }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-800/70">
        <span>{label}</span>
        <span className="font-semibold text-crickbroYellow">{value}/10</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => value > 0 && setValue(value - 1)}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          −
        </button>

        <input
          type="range"
          min={0}
          max={10}
          value={value}
          onChange={(e) => setValue(+e.target.value)}
          className="w-full accent-crickbroPurple cursor-pointer"
        />

        <button
          type="button"
          onClick={() => value < 10 && setValue(value + 1)}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          +
        </button>
      </div>
    </div>
  );
};

/* Toggle Switch Component */
const ToggleSwitch = ({ enabled, setEnabled, label }) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10">
      <span className="text-sm text-gray-800">{label}</span>

      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
          enabled ? "bg-green-500" : "bg-gray-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

/* Date Input Component */
const DateInput = ({ label, value, onChange }) => {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-800/70">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-800 focus:border-crickbroPurple outline-none"
      />
    </div>
  );
};

/* MAIN POPUP */
export default function Rating({ onClose, auctionId, details, fetch }) {
  const dispatch = useDispatch();

  // Skill ratings
  const [allrounder, setAllrounder] = useState(0);
  const [batsman, setBatsman] = useState(0);
  const [bowler, setBowler] = useState(0);
  const [keeper, setKeeper] = useState(0);

  // Trial settings
  const [trailTypeAuction, setTrailTypeAuction] = useState(false);
  const [trailStart, setTrailStart] = useState("");
  const [trailEnd, setTrailEnd] = useState("");

  // Loading state for API call
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!details) return;

    // Rating
    setAllrounder(details.ratingToSelectPlayers?.allrounder || 0);
    setBatsman(details.ratingToSelectPlayers?.batsman || 0);
    setBowler(details.ratingToSelectPlayers?.bowler || 0);
    setKeeper(details.ratingToSelectPlayers?.wicketkeeper || 0);

    // Trial settings
    setTrailTypeAuction(details.trailTypeAuction || false);

    if (details.trailStart) {
      setTrailStart(details.trailStart.slice(0, 10));
    }
    if (details.trailEnd) {
      setTrailEnd(details.trailEnd.slice(0, 10));
    }
  }, [details]);

  // Set default dates if not provided
  const setDefaultDates = () => {
    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() + 1);

    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultStart.getDate() + 25);

    setTrailStart(defaultStart.toISOString().slice(0, 10));
    setTrailEnd(defaultEnd.toISOString().slice(0, 10));
  };

  // Prepare data for API
  const prepareTrailSettings = () => {
    return {
      trailTypeAuction,
      trailStart: trailStart ? new Date(trailStart).toISOString() : "",
      trailEnd: trailEnd ? new Date(trailEnd).toISOString() : "",
      ratingToSelectPlayers: {
        allrounder,
        batsman,
        bowler,
        wicketkeeper: keeper,
      },
    };
  };

  // Validate form data
  const validateForm = () => {
    if (!trailStart || !trailEnd) {
      alert("❌ Please select both start and end dates");
      return false;
    }

    const startDate = new Date(trailStart);
    const endDate = new Date(trailEnd);

    if (startDate >= endDate) {
      alert("❌ End date must be after start date");
      return false;
    }

    return true;
  };

  // Handle API POST request using Axios
  const handleSave = async () => {
    if (!auctionId) {
      alert("❌ Auction ID is required");
      return;
    }
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const trailSettings = prepareTrailSettings();
      // Make API call using Axios
      const response = await dispatch(UpateRating(auctionId, trailSettings));
      if (response.status === 200) {
        toast.success("Trial settings updated successfully!");
        fetch();
      } else {
        throw new Error("Failed to update trial settings");
      }
    } catch (error) {
      console.error("Error saving trial settings:", error);

      // Provide more specific error message
      if (axios.isAxiosError(error)) {
        if (error.response) {
          alert(
            `❌ Server error: ${error.response.status} - ${
              error.response.data?.message || "Unknown error"
            }`
          );
        } else if (error.request) {
          alert("❌ No response from server. Please check your connection.");
        } else {
          alert(`❌ Error: ${error.message}`);
        }
      } else {
        alert("❌ Failed to save trial settings. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="z-50 flex items-center justify-center backdrop-blur">
      <div className="w-full border rounded-lg bg-gray-50 border-gray-300 shadow-lg relative px-5 py-4 max-h-[90vh] overflow-y-auto scrollbar-hide">
       

        {/* HEADER */}
        <h2 className="text-base font-oswald tracking-wide text-crickbroYellow mb-1">
          Set the Rating
        </h2>

        {/* INFO */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-gray-800/70 mb-4">
          Set the trial settings here. Players will be sorted and selected based
          on these ratings. Only players meeting the minimum ratings for each
          skill will be eligible for selection.
        </div>

        {/* RATINGS */}
        <div className="space-y-4 mb-6">
          <RatingInput
            label="Allrounder"
            value={allrounder}
            setValue={setAllrounder}
          />
          <RatingInput label="Batsman" value={batsman} setValue={setBatsman} />
          <RatingInput label="Bowler" value={bowler} setValue={setBowler} />
          <RatingInput
            label="Wicket Keeper"
            value={keeper}
            setValue={setKeeper}
          />
        </div>

        {/* TRIAL SETTINGS */}
        {/* <div className="border-t border-white/10 pt-4 space-y-3">
          <ToggleSwitch
            label="Trial Type Auction"
            enabled={trailTypeAuction}
            setEnabled={setTrailTypeAuction}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DateInput
              label="Trial Start"
              value={trailStart}
              onChange={setTrailStart}
            />
            <DateInput
              label="Trial End"
              value={trailEnd}
              onChange={setTrailEnd}
            />
          </div>
        </div> */}

        {/* SUMMARY */}
        <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white/80">
          <div className="grid grid-cols-2 gap-2">
            <span>
              Allrounder: <b>{allrounder}</b>
            </span>
            <span>
              Batsman: <b>{batsman}</b>
            </span>
            <span>
              Bowler: <b>{bowler}</b>
            </span>
            <span>
              Keeper: <b>{keeper}</b>
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3  border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 btn-primary py-2 text-xs"
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
