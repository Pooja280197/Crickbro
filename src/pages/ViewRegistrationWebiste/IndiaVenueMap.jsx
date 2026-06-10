import { useState } from "react";
import indiaMap from "../../assets/india.svg";
import { venues } from "../../data/VenueData";

const IndiaVenueMap = () => {
  const [activeVenue, setActiveVenue] = useState(null);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* MAP */}
      <img
        src={indiaMap}
        alt="India Map"
        className="w-full h-auto"
      />

      {/* MARKERS */}
      {venues.map((venue) => (
        <div
          key={venue.id}
          className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${venue.x}%`,
            top: `${venue.y}%`,
          }}
          onMouseEnter={() => setActiveVenue(venue)}
          onMouseLeave={() => setActiveVenue(null)}
          onClick={() => setActiveVenue(venue)}
        >
          <div className="relative">
            <span className="text-2xl">🚩</span>
            <span className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" />
          </div>
        </div>
      ))}

      {/* INFO CARD */}
      {activeVenue && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl p-4 w-72 z-50">
          <h3 className="text-lg font-bold">{activeVenue.name}</h3>
          <p className="text-sm text-gray-600">
            {activeVenue.city}, {activeVenue.state}
          </p>
          <p className="text-sm mt-2">
            🏟 Capacity: {activeVenue.capacity}
          </p>
        </div>
      )}
    </div>
  );
};

export default IndiaVenueMap;
