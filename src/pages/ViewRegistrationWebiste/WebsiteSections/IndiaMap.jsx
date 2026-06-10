import React, { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { fetchAllSlots } from "../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { City } from "country-state-city";
import {
  ChevronDown,
  ExternalLink,
  MapPin,
  Search,
  Trophy,
} from "lucide-react";
import regBg1 from "../../../assets/Images/regBg1.png";

const geoUrl =
  "https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States";

const cityCoordinateOverrides = {
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

const normalizePlaceName = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const coordinateOverridesByName = Object.entries(cityCoordinateOverrides).reduce(
  (lookup, [name, coordinates]) => {
    lookup[normalizePlaceName(name)] = coordinates;
    return lookup;
  },
  {},
);

const indiaCitiesByName = City.getCitiesOfCountry("IN").reduce(
  (lookup, city) => {
    const key = normalizePlaceName(city.name);
    const longitude = Number(city.longitude);
    const latitude = Number(city.latitude);

    if (!key || !Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return lookup;
    }

    lookup[key] = [
      ...(lookup[key] || []),
      {
        coordinates: [longitude, latitude],
        stateCode: city.stateCode,
      },
    ];
    return lookup;
  },
  {},
);

const getDirectSlotCoordinates = (location = {}) => {
  const rawLongitude = location.longitude ?? location.lng;
  const rawLatitude = location.latitude ?? location.lat;

  if (
    rawLongitude === undefined ||
    rawLongitude === null ||
    rawLongitude === "" ||
    rawLatitude === undefined ||
    rawLatitude === null ||
    rawLatitude === ""
  ) {
    return null;
  }

  const longitude = Number(rawLongitude);
  const latitude = Number(rawLatitude);

  return Number.isFinite(longitude) && Number.isFinite(latitude)
    ? [longitude, latitude]
    : null;
};

const resolveCityCoordinates = (city, slots) => {
  const matchingSlot = slots.find(
    (slot) =>
      normalizePlaceName(slot?.location?.city) === normalizePlaceName(city),
  );
  const directCoordinates = getDirectSlotCoordinates(matchingSlot?.location);

  if (directCoordinates) return directCoordinates;

  const normalizedCity = normalizePlaceName(city);
  const cityMatches = indiaCitiesByName[normalizedCity] || [];
  const stateCode = String(matchingSlot?.location?.state || "").toUpperCase();
  const stateMatch = cityMatches.find(
    (match) => String(match.stateCode).toUpperCase() === stateCode,
  );

  return (
    stateMatch?.coordinates ||
    coordinateOverridesByName[normalizedCity] ||
    cityMatches[0]?.coordinates ||
    null
  );
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

  const cities = useMemo(
    () => [
      ...new Set(
        slots.map((slot) => slot?.location?.city?.trim()).filter(Boolean),
      ),
    ],
    [slots],
  );

  const resolvedCityCoordinates = useMemo(
    () =>
      cities.reduce((lookup, city) => {
        lookup[city] = resolveCityCoordinates(city, slots);
        return lookup;
      }, {}),
    [cities, slots],
  );

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
    <section
      className="relative isolate w-full overflow-hidden py-10 md:py-14"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(2, 6, 23, 0.97) 0%, rgba(8, 47, 73, 0.92) 48%, rgba(15, 23, 42, 0.96) 100%), url(${regBg1})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        fontFamily:
          '"Inter", "Manrope", "Nunito Sans", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.07),_transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300 backdrop-blur-sm">
              <Trophy size={13} />
              Trial Locations
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
              Find Your Nearest Cricket Trial
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
              Explore available trial cities, choose a venue, and take the next
              step towards the auction.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="min-w-[112px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center shadow-lg backdrop-blur-md">
              <p className="text-2xl font-black text-white">{cities.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-200">
                Cities
              </p>
            </div>
            <div className="min-w-[112px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center shadow-lg backdrop-blur-md">
              <p className="text-2xl font-black text-amber-400">{slots.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-200">
                Venues
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="group relative min-h-[430px] overflow-hidden rounded-3xl border border-white/20 bg-white/95 p-3 shadow-[0_24px_70px_rgba(2,6,23,0.45)] md:p-5">
            <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-blue-600 via-sky-400 to-amber-400" />
            <div className="absolute left-5 top-5 z-10 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700 shadow-sm backdrop-blur">
              Select a marker
            </div>
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
                      fill="#E0F2FE"
                      stroke="#94A3B8"
                      style={{
                        default: { outline: "none" },
                        hover: {
                          fill: "#BAE6FD",
                          outline: "none",
                          cursor: "pointer",
                        },
                      }}
                    />
                  ))
                }
              </Geographies>

              {cities.map((city) => {
                const coords = resolvedCityCoordinates[city];
                if (!coords) return null;

                return (
                  <Marker key={city} coordinates={coords}>
                    <circle
                      r={selectedCity === city ? 12 : 8}
                      fill={selectedCity === city ? "#F59E0B" : "#2563EB"}
                      stroke="#fff"
                      strokeWidth={3}
                      onClick={() => setSelectedCity(city)}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.2s",
                        filter: "drop-shadow(0 3px 5px rgba(15, 23, 42, 0.35))",
                      }}
                    />
                    <text
                      textAnchor="middle"
                      y={-15}
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        fill: "#0F172A",
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

          <div className="h-full rounded-3xl border border-white/20 bg-white/10 p-4 shadow-[0_24px_70px_rgba(2,6,23,0.38)] backdrop-blur-xl md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-950/30">
                <MapPin size={21} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white md:text-xl">
                  Choose Your Trial City
                </h3>
                <p className="text-xs text-blue-200">
                  Search or select a marker from the map
                </p>
              </div>
            </div>

            <div className="relative mb-5">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={selectedCity || searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                  setSelectedCity(null);
                }}
                onClick={() => setIsOpen(!isOpen)}
                placeholder="Search and select city..."
                className="w-full rounded-2xl border border-white/30 py-3.5 pl-11 pr-11 text-sm font-semibold text-slate-800 shadow-lg outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20"
              />
              <ChevronDown
                size={18}
                className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />

              {isOpen && (
                <div className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <button
                        type="button"
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setSearchTerm("");
                          setIsOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <MapPin size={15} />
                        {city}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      No city found
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedLocations.length > 0 ? (
              <div className="max-h-[390px] overflow-y-auto pr-1 text-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-extrabold text-white">
                    {selectedCity} Trial Venues
                  </h4>
                  <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950">
                    {selectedLocations.length} available
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedLocations.map((slot, index) => (
                    <article
                      key={index}
                      className="group relative overflow-hidden rounded-2xl border border-sky-300/20 bg-slate-950/55 p-4 shadow-[0_12px_32px_rgba(2,6,23,0.22)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/40 hover:bg-slate-950/70"
                    >
                      <div className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-sky-400 to-blue-600" />
                      <div className="mb-3 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-400/10 text-sky-300 shadow-inner">
                          <MapPin size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-bold leading-5 tracking-tight text-white md:text-base">
                            {slot.location.venue || `Trial Venue ${index + 1}`}
                          </p>
                          <div className="mt-2 flex items-start gap-2 text-[13px] font-medium leading-5 text-blue-100/90">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                            <p>{slot.location.address || "Address not available"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                        <p className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-100">
                          Pincode{" "}
                          <span className="ml-1 text-xs font-bold tracking-normal text-white">
                            {slot.location.pincode || "Not available"}
                          </span>
                        </p>
                        {slot.location.link && (
                          <a
                            href={slot.location.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:border-sky-300/40 hover:bg-sky-400/20 hover:text-white"
                          >
                            Open in Google Maps
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/25 bg-slate-950/20 px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sky-300">
                  <MapPin size={25} />
                </div>
                <p className="font-bold text-white">Your trial journey starts here</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-blue-200">
                  Select a city to see its venue, address, pincode, and map
                  directions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndiaMap;
