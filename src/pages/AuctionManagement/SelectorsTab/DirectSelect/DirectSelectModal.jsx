import React, { useState } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { updatePlayerDirectSelect } from "../../../../redux/actions";
import { toast } from "react-toastify";

const DUMMY_IMAGE_URL =
  "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";

const gradients = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-rose-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-blue-500",
  "from-violet-500 to-purple-500",
  "from-fuchsia-500 to-pink-500",
  "from-cyan-500 to-blue-500",
];

const getGradientByName = (name) => {
  const hash = name
    ?.split("")
    ?.reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

const isDummyImage = (imageUrl) => imageUrl === DUMMY_IMAGE_URL;

const getInitials = (name) => {
  if (!name) return "NA";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`?.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatRole = (role) => {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1)?.toLowerCase();
};

function DirectSelectModal({ selectedPlayers, selectorPlayers, onClose, auctionId, onSave }) {
  const dispatch = useDispatch();
  const [playerSelections, setPlayerSelections] = useState(
    selectedPlayers.reduce((acc, playerId) => {
      // Find current selection
      const playerData = selectorPlayers.find(p => p.player._id === playerId);
      const currentStatus = playerData?.directSelected;
      acc[playerId] = currentStatus === true ? "select" : currentStatus === false ? "not_select" : "select";
      return acc;
    }, {})
  );
  const [playerGrades, setPlayerGrades] = useState(
    selectedPlayers.reduce((acc, playerId) => {
      const playerData = selectorPlayers.find(p => p.player._id === playerId);
      acc[playerId] = playerData?.directSelectedGrade || null;
      return acc;
    }, {})
  );
  const [removedPlayers, setRemovedPlayers] = useState([]);

  const selectedPlayerDetails = selectorPlayers.filter(player =>
    selectedPlayers.includes(player.player._id) && !removedPlayers.includes(player.player._id)
  );

  const handleSelectionChange = (playerId, selection) => {
    setPlayerSelections(prev => ({
      ...prev,
      [playerId]: selection
    }));
  };

  const handleGradeChange = (playerId, grade) => {
    setPlayerGrades(prev => ({
      ...prev,
      [playerId]: grade
    }));
  };

  const handleRemovePlayer = (playerId) => {
    setRemovedPlayers(prev => [...prev, playerId]);
    setPlayerSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[playerId];
      return newSelections;
    });
  };

  const handleSave = async () => {
    try {
      const updates = Object.entries(playerSelections).map(([playerId, status]) => ({
        playerId,
        status: status === "select" ? "selected" : "not_selected",
        grade: playerGrades[playerId] || null
      }));

      // Add removed players with "removed" status
      const removedUpdates = removedPlayers.map(playerId => ({
        playerId,
        status: "removed"
      }));

      const allUpdates = [...updates, ...removedUpdates];

      console.log("Sending updates to backend:", { updates, removedUpdates, allUpdates, auctionId });

      const response = await dispatch(updatePlayerDirectSelect(auctionId, allUpdates));

      console.log("Backend response:", response);

      toast.success("Player selections saved successfully");
      onSave();
    } catch (error) {
      console.error("Save error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save selections";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
    <div className="bg-[var(--bg-card)] rounded-lg p-4 sm:p-6 max-w-full sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-bold flex-1 truncate">Players Direct Selection</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--secondary-lighter)] rounded-full flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {selectedPlayerDetails.map((player) => (
            <div key={player.player._id} className="border rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--secondary-lighter)] overflow-hidden flex-shrink-0">
                    {player?.player?.logo && !isDummyImage(player?.player?.logo) ? (
                      <img
                        src={player?.player?.logo}
                        alt={player.player?.batchId}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getGradientByName(
                          player?.player?.batchId
                        )} text-[var(--text-dark)] font-bold text-xs sm:text-sm`}
                      >
                        {getInitials(player?.player?.batchId)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{player.player?.batchId}</h3>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                      <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                        {formatRole(player?.rating?.playerType || player?.player?.playerType)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 sm:flex-shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap">
                      <input
                        type="radio"
                        name={`selection-${player.player._id}`}
                        value="select"
                        checked={playerSelections[player.player._id] === "select"}
                        onChange={() => handleSelectionChange(player.player._id, "select")}
                        className="text-blue-600 w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm">Select</span>
                    </label>

                    <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap">
                      <input
                        type="radio"
                        name={`selection-${player.player._id}`}
                        value="not_select"
                        checked={playerSelections[player.player._id] === "not_select"}
                        onChange={() => handleSelectionChange(player.player._id, "not_select")}
                        className="text-red-600 w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm">Not Select</span>
                    </label>
                  </div>

                  <select
                    value={playerGrades[player.player._id] || ""}
                    onChange={(e) => handleGradeChange(player.player._id, e.target.value === "" ? null : e.target.value)}
                    className="w-full sm:w-auto px-2 py-1 border border-[var(--border-primary)] rounded text-xs sm:text-sm min-w-[72px]"
                    title="Select grade"
                  >
                    <option value="">Grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>

                  <button
                    onClick={() => handleRemovePlayer(player.player._id)}
                    className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove player"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-4 mt-6">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-soft)] text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DirectSelectModal;