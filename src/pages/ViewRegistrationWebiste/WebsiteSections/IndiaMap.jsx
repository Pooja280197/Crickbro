import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { fetchAllSlots, fetchSlotList } from "../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const geoUrl =
  "https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States";

const cityCoordinates = {
  // Existing...
  Indore: [75.8577, 22.7196],
  Bhopal: [77.4126, 23.2599],
  Ujjain: [75.7849, 23.1765],
  Gwalior: [78.1828, 26.2183],
  Jabalpur: [79.9864, 23.1815],
  Mumbai: [72.8777, 19.076],
  Pune: [73.8567, 18.5204],
  Nagpur: [79.0882, 21.1458],
  Nashik: [73.7898, 19.9975],
  Delhi: [77.1025, 28.7041],
  "New Delhi": [77.209, 28.6139],
  Noida: [77.391, 28.5355],
  Gurgaon: [77.0266, 28.4595],
  Faridabad: [77.3178, 28.4089],
  Ahmedabad: [72.5714, 23.0225],
  Surat: [72.8311, 21.1702],
  Vadodara: [73.1812, 22.3072],
  Rajkot: [70.8022, 22.3039],
  Jaipur: [75.7873, 26.9124],
  Udaipur: [73.7125, 24.5854],
  Jodhpur: [73.0243, 26.2389],
  Kota: [75.8648, 25.2138],
  Lucknow: [80.9462, 26.8467],
  Kanpur: [80.3319, 26.4499],
  Varanasi: [82.9739, 25.3176],
  Agra: [78.0081, 27.1767],
  Bangalore: [77.5946, 12.9716],
  Mysore: [76.6394, 12.2958],
  Mangalore: [74.856, 12.9141],
  Hyderabad: [78.4867, 17.385],
  Warangal: [79.5941, 17.9689],
  Chennai: [80.2707, 13.0827],
  Coimbatore: [76.9558, 11.0168],
  Madurai: [78.1198, 9.9252],
  Kolkata: [88.3639, 22.5726],
  Howrah: [88.31, 22.5958],
  Durgapur: [87.3119, 23.5204],
  Patna: [85.1376, 25.5941],
  Ranchi: [85.3096, 23.3441],
  Bhubaneswar: [85.8245, 20.2961],
  Chandigarh: [76.7794, 30.7333],
  Amritsar: [74.8723, 31.634],
  Ludhiana: [75.8573, 30.901],
  Dehradun: [78.0322, 30.3165],
  Shimla: [77.1734, 31.1048],
  Srinagar: [74.7973, 34.0837],

  // 🔥 Added Cities
  Thane: [72.9781, 19.2183],
  NaviMumbai: [73.0297, 19.033],
  Aurangabad: [75.3433, 19.8762],
  Solapur: [75.9064, 17.6599],
  Kolhapur: [74.2433, 16.705],
  Amravati: [77.75, 20.9374],
  Nanded: [77.321, 19.1383],

  Ghaziabad: [77.4538, 28.6692],
  Meerut: [77.7064, 28.9845],
  Aligarh: [78.088, 27.8974],
  Bareilly: [79.43, 28.367],
  Moradabad: [78.7733, 28.8386],
  Prayagraj: [81.8463, 25.4358],

  Jamshedpur: [86.2029, 22.8046],
  Gaya: [85.0, 24.7955],
  Muzaffarpur: [85.3876, 26.1209],

  Raipur: [81.6296, 21.2514],
  Bilaspur: [82.1409, 22.0797],
  Durg: [81.2849, 21.1904],

  Panaji: [73.8278, 15.4909],

  Trivandrum: [76.9366, 8.5241],
  Kochi: [76.2673, 9.9312],
  Kozhikode: [75.7804, 11.2588],

  Visakhapatnam: [83.2185, 17.6868],
  Vijayawada: [80.648, 16.5062],
  Guntur: [80.4365, 16.3067],
  Tirupati: [79.4192, 13.6288],

  Guwahati: [91.7362, 26.1445],
  Shillong: [91.8933, 25.5788],
  Imphal: [93.9368, 24.817],
  Aizawl: [92.7176, 23.7271],

  Siliguri: [88.3953, 26.7271],
  Asansol: [86.9842, 23.6739],

  Pondicherry: [79.8083, 11.9416],

  Rohtak: [76.5762, 28.8955],
  Hisar: [75.7217, 29.1492],
  Karnal: [76.9905, 29.6857],

  Ajmer: [74.6399, 26.4499],
  Bikaner: [73.3119, 28.0229],

  Satna: [80.8322, 24.5854],
  Rewa: [81.2961, 24.5362],
  Sagar: [78.7378, 23.8388],
  Ratlam: [75.0367, 23.3315],
};

const IndiaMap = () => {
  const { auctionId } = useParams();
  const dispatch = useDispatch();
  // const allSlots = useSelector((state) => state.data.allSlots);
  const slotsdata = useSelector((state) => state?.data?.allSlots);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    dispatch(fetchAllSlots(auctionId));
  }, [auctionId]);

  const slots = slotsdata || [];

  const cities = [
    ...new Set(
      slots.map((slot) => slot?.location?.city?.trim()).filter(Boolean),
    ),
  ];

  const selectedLocations = slots.filter(
    (slot) =>
      slot?.location?.city?.trim().toLowerCase() ===
      selectedCity?.toLowerCase(),
  );

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // console.log(allSlots, "slots");

  return (
    <div className="w-full mt-12 px-4 md:px-8">
      {/* Heading */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8">
          Cricket Trial Locations
        </h2>

        <div className="grid md:grid-cols-2 gap-10 items-start mb-4">
          {/* LEFT → MAP */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-2xl border border-gray-200 p-5 transition-transform hover:scale-[1.02]">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 1000,
                center: [82, 22],
              }}
              style={{ width: "100%", height: "auto" }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#F3F4F6"
                      stroke="#CBD5E1"
                      style={{
                        default: { outline: "none" },
                        hover: {
                          fill: "#A5B4FC",
                          outline: "none",
                          cursor: "pointer",
                        },
                      }}
                    />
                  ))
                }
              </Geographies>

              {cities.map((city) => {
                const normalizedCity = Object.keys(cityCoordinates).find(
                  (c) => c.toLowerCase() === city.toLowerCase(),
                );
                const coords = cityCoordinates[normalizedCity];
                if (!coords) return null;

                return (
                  <Marker key={city} coordinates={coords}>
                    <circle
                      r={selectedCity === city ? 12 : 8}
                      fill={selectedCity === city ? "#4F46E5" : "#EF4444"}
                      stroke="#fff"
                      strokeWidth={2}
                      onClick={() => setSelectedCity(city)}
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                    />
                    <text
                      textAnchor="middle"
                      y={-15}
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        fill: "#111827",
                        textShadow: "0 0 3px rgba(0,0,0,0.2)",
                      }}
                    >
                      {city}
                    </text>
                  </Marker>
                );
              })}
            </ComposableMap>
          </div>

          {/* RIGHT → CITY LIST + DETAILS */}
          <div className="bg-white shadow-2xl border border-gray-200 rounded-2xl p-6 h-full">
            <h3 className="text-xl font-semibold mb-5 text-gray-800">
              Select a Trial City
            </h3>

            {/* City Buttons */}
            <div className="mb-6 relative">
              {/* Input box */}
              <input
                type="text"
                value={selectedCity || searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                  setSelectedCity(null);
                }}
                onClick={() => setIsOpen(!isOpen)}
                placeholder="Search & Select City..."
                className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />

              {/* Dropdown */}
              {isOpen && (
                <div className="absolute w-full bg-white border rounded-xl shadow-lg mt-2 max-h-60 overflow-y-auto z-50">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <div
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setSearchTerm("");
                          setIsOpen(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-indigo-100 text-sm"
                      >
                        {city}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      No city found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Location Details */}
            {selectedLocations.length > 0 ? (
              <div className="border-t pt-5 text-sm max-h-[350px] overflow-y-auto pr-2">
                <h4 className="font-semibold text-base mb-4 text-gray-900">
                  📍 {selectedCity} Trial Venues ({selectedLocations.length})
                </h4>

                <div className="space-y-4">
                  {selectedLocations.map((slot, index) => (
                    <div
                      key={index}
                      className="border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 shadow-sm transition"
                    >
                      <p>
                        <strong>Venue:</strong> {slot.location.venue}
                      </p>
                      <p>
                        <strong>Address:</strong> {slot.location.address}
                      </p>
                      <p>
                        <strong>Pincode:</strong> {slot.location.pincode}
                      </p>
                      {slot.location.link && (
                        <a
                          href={slot.location.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 underline hover:text-indigo-800"
                        >
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Select a city to view trial venues.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaMap;
