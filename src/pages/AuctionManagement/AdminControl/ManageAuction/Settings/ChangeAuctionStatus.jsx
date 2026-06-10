import React, { useState } from "react";
// import axios from "axios";
import { X } from "lucide-react";
import api from "../../../../../utils/api";
import { toast } from "react-toastify";

const STATUS_OPTIONS = [
  "scheduled",
  "ongoing",
  "paused",
  "completed",
  "cancelled",
];

const ChangeAuctionStatus = ({ isOpen, onClose, auctionId, onSuccess,auctionStatus }) => {
  const [status, setStatus] = useState(auctionStatus || "");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!status) {
      alert("Please select a status");
      return;
    }

    try {
      setLoading(true);

      await api.put(`/webSiteApi/auction/changeStatus/${auctionId}`, {
        status,
      });
      toast.success("Auction status updated successfully")

      if (onSuccess) onSuccess(status); // refresh parent if needed
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update auction status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] w-[400px] rounded-xl shadow-lg p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-red-500"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Change Auction Status
        </h2>

        {/* Dropdown */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Select Status</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option} className=" text-[var(--text-primary)] cursor-pointer">
              {option.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-[var(--bg-soft)]0"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeAuctionStatus;
