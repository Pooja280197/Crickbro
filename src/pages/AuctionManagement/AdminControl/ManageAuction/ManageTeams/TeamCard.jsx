import React, { useState } from "react";
import {
  Check,
  Eye,
  MapPin,
  Clock,
  Trophy,
  Target,
  Zap,
  X,
} from "lucide-react";

export default function TeamCard({
  team,
  isSelected = false,
  onSelect,
  showActions = true,
}) {
  const [imageError, setImageError] = useState(false);
  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(team.id);
    }
  };

  return (
    <>
      <div
        className="flex flex-col items-center gap-2 w-full max-w-[140px] font-main">
        <div className="relative w-full flex justify-center">
          {showActions && (
            <div
              onClick={handleSelect}
              className={`absolute -top-1 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
                isSelected
                  ? "bg-[var(--primary)] border-white text-white shadow-md"
                  : "bg-white border-[var(--secondary-light)] text-[var(--secondary)] hover:border-[var(--secondary)]"
              }`}
            >
              <Check className="w-4 h-4" />
            </div>
          )}
          <div
            className={`w-20 h-20 rounded-full overflow-hidden shadow-lg cursor-pointer transition-all ${
              isSelected
                ? "ring-4 ring-[var(--primary)] shadow-[var(--primary-light)]"
                : "ring-2 ring-[var(--secondary-light)] hover:ring-[var(--secondary)]"
            }`}
          >
            {!imageError && team?.image ? (
              <img
                src={team?.image}
                alt={team?.name}
                className="w-20 h-20 object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[var(--secondary)] text-white text-xl font-bold"></div>
            )}
          </div>
        </div>
        <p className="text-xs font-semibold text-[var(--secondary-dark)] text-center w-full px-1">
          {team.name}
        </p>
      </div>
    </>
  );
}
