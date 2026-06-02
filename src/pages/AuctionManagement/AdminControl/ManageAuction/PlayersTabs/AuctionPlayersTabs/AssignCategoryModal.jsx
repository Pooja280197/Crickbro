
import api from "../../../../../../utils/api";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";

export default function AssignCategoryModal({
  isOpen,
  count,
  onClose,
  auctionId,
  selectedIds,
  fetchUnassignedPlayers,
  fetchAssignedPlayers,
  resetSelectedIds
}) {
  const [cat, setCat] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!isOpen || !auctionId) return;

    const handleGetCategory = async () => {
      try {
        const res = await api.get(
          `/webSiteApi/auctionCategory/listCategories?auctionId=${auctionId}`
        );
        setCategories(res?.data?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    handleGetCategory();
  }, [isOpen, auctionId]);

  const assignPlayerToCategory = () => {
    api
      .post(`/webSiteApi/auctionCategory/addPlayersToCategory/${cat}`, {
        auctionId,
        playerIds: selectedIds,
      })
      .then(() => {
        resetSelectedIds();
        fetchUnassignedPlayers();
        fetchAssignedPlayers();
        onClose();
        toast.success("Successfully Assigned!");
      })
      .catch((err) => {
        console.error("assign player error", err);
        toast.error("Failed to assign players");
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200000] animate-fadeIn">
      <div className="relative bg-white p-6 rounded-2xl shadow-xl w-[380px] animate-scaleIn border border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Assign <span className="text-green-600">{count}</span> Players
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Label */}
        <label className="text-gray-600 text-sm mb-1 block font-medium">
          Category
        </label>

        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="
              w-full border border-gray-300 
              rounded-xl px-4 py-3 
              text-gray-800 font-medium
              bg-white shadow-sm 
              focus:ring-2 focus:ring-green-500 
              focus:border-green-500 
              transition-all duration-300
              hover:border-gray-400
              cursor-pointer
            "
          >
            <option value="" className="text-gray-500">
              Select a category…
            </option>

            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Custom arrow */}
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            ▼
          </span>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-lg 
              border border-gray-300 
              text-gray-700 
              hover:bg-gray-100 
              transition shadow-sm
            "
          >
            Cancel
          </button>

          <button
            disabled={!cat}
            onClick={assignPlayerToCategory}
            className={`
              px-4 py-2 rounded-lg text-white transition shadow-sm
              ${cat
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"}
            `}
          >
            Assign
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
      `}</style>
    </div>
  );
}
