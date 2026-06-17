import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../../../../utils/api";
import { shots } from "../../../../data/shots";
import {
  fetchSessionPlayersForBallRating,
  ratePlayerBallByBall,
  fetchSlotList,
} from "../../../../redux/actions";

/* ═══════════════════════════ CONSTANTS ═══════════════════════════════════════*/

const SHOT_META = {
  straightDrive: { shotType: "straight_drive", zone: "straight",      region: "Straight Drive", angle: 270 },
  coverDrive:    { shotType: "cover_drive",    zone: "cover",         region: "Cover Drive",    angle: 311 },
  offDrive:      { shotType: "off_drive",      zone: "off_drive",     region: "Off Drive",      angle: 343 },
  squareCut:     { shotType: "cut",            zone: "cut",           region: "Square Cut",     angle: 11  },
  upperCut:      { shotType: "cut",            zone: "upper_cut",     region: "Upper Cut",      angle: 39  },
  lateCut:       { shotType: "cut",            zone: "third_man",     region: "Third Man",      angle: 69  },
  pullShot:      { shotType: "pull",           zone: "mid_wicket",    region: "Mid Wicket",     angle: 115 },
  hookShot:      { shotType: "hook",           zone: "fine_leg",      region: "Fine Leg",       angle: 141 },
  sweepShot:     { shotType: "sweep",          zone: "square_leg",    region: "Square Leg",     angle: 168 },
  reverseSweep:  { shotType: "reverse_sweep",  zone: "reverse_sweep", region: "Reverse Sweep",  angle: 191 },
  paddleSweep:   { shotType: "sweep",          zone: "paddle_sweep",  region: "Paddle Sweep",   angle: 213 },
  onDrive:       { shotType: "on_drive",       zone: "on_drive",      region: "On Drive",       angle: 242 },
  flickShot:     { shotType: "flick",          zone: "flick",         region: "Flick Shot",     angle: 261 },
  legGlance:     { shotType: "glance",         zone: "leg_glance",    region: "Leg Glance",     angle: 276 },
  loftedDrive:   { shotType: "loft",           zone: "loft",          region: "Lofted Drive",   angle: 289 },
  insideOut:     { shotType: "cover_drive",    zone: "inside_out",    region: "Inside Out",     angle: 312 },
};

const BALL_TYPES = [
  { value: "normal",   label: "Normal"   },
  { value: "wide",     label: "Wide"     },
  { value: "no_ball",  label: "No Ball"  },
  { value: "leg_bye",  label: "Leg Bye"  },
  { value: "bye",      label: "Bye"      },
  { value: "free_hit", label: "Free Hit" },
];

const WICKET_TYPES = [
  { value: "caught",     label: "Caught"     },
  { value: "bowled",     label: "Bowled"     },
  { value: "lbw",        label: "LBW"        },
  { value: "run_out",    label: "Run Out"    },
  { value: "stumped",    label: "Stumped"    },
  { value: "hit_wicket", label: "Hit Wicket" },
];

// Pitch map definitions ─────────────────────────────────────────────────────
const PITCH_ROWS = [
  { key: "short",       label: "Short",    color: "#f59e0b", selColor: "#fde68a" },
  { key: "good_length", label: "Good Len", color: "#16a34a", selColor: "#bbf7d0" },
  { key: "full",        label: "Full",     color: "#65a30d", selColor: "#d9f99d" },
  { key: "yorker",      label: "Yorker",   color: "#2563eb", selColor: "#bfdbfe" },
  { key: "full_toss",   label: "Full Toss",color: "#dc2626", selColor: "#fecaca" },
];

const PITCH_COLS = [
  { key: "outside_off", label: "Wide Off"  },
  { key: "on_stump",    label: "Stumps"    },
  { key: "outside_leg", label: "Wide Leg"  },
];

const EMPTY_BALL = {
  selectedShot: null,
  selectedZone: null,
  batsmanRating: 6,
  bowlerRating: 6,
  ballType: "normal",
  runsScored: 0,
  boundary: null,
  isWicket: false,
  wicketType: null,
  notes: "",
};

const SHOT_BY_ZONE = Object.entries(SHOT_META).reduce((acc, [id, meta]) => {
  if (meta?.zone) acc[meta.zone] = { id, name: meta.region || id };
  return acc;
}, {});

const ZONE_LABELS = {
  outside_off: "Wide Off",
  on_stump: "Stumps",
  outside_leg: "Wide Leg",
  short: "Short",
  good_length: "Good Len",
  full: "Full",
  yorker: "Yorker",
  full_toss: "Full Toss",
};

const getPitchColor = (length) => PITCH_ROWS.find((r) => r.key === length)?.color || "#16a34a";

const toShotSelection = (event) => {
  const zone = event?.wagonWheel?.zone;
  const byZone = zone ? SHOT_BY_ZONE[zone] : null;
  if (byZone) return byZone;
  if (event?.shotType) {
    const fromType = Object.entries(SHOT_META).find(([, meta]) => meta.shotType === event.shotType);
    if (fromType) {
      const [id, meta] = fromType;
      return { id, name: meta.region || id };
    }
  }
  return null;
};

const toZoneSelection = (event) => {
  const line = event?.bowlingZone?.line;
  const length = event?.bowlingZone?.length;
  if (!line || !length) return null;
  return {
    line,
    length,
    label: `${ZONE_LABELS[length] || length.replace(/_/g, " ")} / ${ZONE_LABELS[line] || line.replace(/_/g, " ")}`,
    color: getPitchColor(length),
  };
};

const toEditableBall = (event) => ({
  selectedShot: toShotSelection(event),
  selectedZone: toZoneSelection(event),
  batsmanRating: Number(event?.batsmanRating ?? event?.rating ?? 6),
  bowlerRating: Number(event?.bowlerRating ?? event?.rating ?? 6),
  ballType: event?.ballType || "normal",
  runsScored: Number(event?.runsScored ?? 0),
  boundary: event?.boundary ?? null,
  isWicket: Boolean(event?.isWicket || event?.wicket),
  wicketType: event?.wicket?.outType || event?.wicketType || null,
  notes: event?.notes || "",
});

const normalizeFieldLabel = (value) => String(value || "").trim().toLowerCase();

const toSavedSelectorRating = (playerRow) => {
  const selectorRatings = Array.isArray(playerRow?.rating?.ratings) ? playerRow.rating.ratings : [];
  if (!selectorRatings.length) return null;
  return selectorRatings[selectorRatings.length - 1] || null;
};

const buildSavedMetaMap = (playerRows = []) =>
  playerRows.reduce((acc, row) => {
    const playerId = String(row?.player?._id || "").trim();
    if (!playerId) return acc;

    const saved = toSavedSelectorRating(row);
    acc[playerId] = {
      comments: String(saved?.comments || ""),
      field: Array.isArray(saved?.field) ? saved.field : [],
    };
    return acc;
  }, {});

const parseSavedFieldValue = (fieldConfig, savedField) => {
  if (!savedField) return undefined;

  const fieldType = String(fieldConfig?.fieldType || "input").toLowerCase();
  const valueType = String(fieldConfig?.type || "string").toLowerCase();
  const options = Array.isArray(fieldConfig?.options) ? fieldConfig.options.filter(Boolean) : [];

  const hasNumberValue = savedField?.numberValue !== undefined && savedField?.numberValue !== null;
  const hasStringValue = savedField?.stringValue !== undefined && savedField?.stringValue !== null;
  const rawString = hasStringValue ? String(savedField.stringValue).trim() : "";

  if (fieldType === "checkbox") {
    if (!options.length) {
      if (!hasStringValue) return Boolean(savedField?.numberValue);
      return rawString.toLowerCase() === "true";
    }

    if (!rawString) return [];
    return rawString
      .split(",")
      .map((value) => value.trim())
      .filter((value) => options.includes(value));
  }

  if (valueType === "number") {
    if (hasNumberValue) {
      const n = Number(savedField.numberValue);
      return Number.isFinite(n) ? n : undefined;
    }
    const parsed = Number(rawString);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (!hasStringValue && hasNumberValue) return String(savedField.numberValue);
  return rawString;
};

const toCustomFieldValueMap = (fieldsConfig = [], savedFieldArray = [], getFieldIdFn, getFieldLabelFn) => {
  if (!Array.isArray(fieldsConfig) || !Array.isArray(savedFieldArray)) return {};

  const savedByLabel = new Map();
  savedFieldArray.forEach((savedField) => {
    const key = normalizeFieldLabel(savedField?.label);
    if (key) savedByLabel.set(key, savedField);
  });

  return fieldsConfig.reduce((acc, field, idx) => {
    const fieldLabel = getFieldLabelFn(field, idx);
    const savedField = savedByLabel.get(normalizeFieldLabel(fieldLabel));
    const parsedValue = parseSavedFieldValue(field, savedField);
    if (parsedValue !== undefined) {
      acc[getFieldIdFn(field, idx)] = parsedValue;
    }
    return acc;
  }, {});
};

const getPlayerExistingBall = (players, playerId) => {
  if (!playerId) return null;
  const matched = players.find((p) => p?.player?._id === playerId || p?.auctionPlayerId === playerId);
  const existing = matched?.existingRating || matched?.ballByBallRating || matched?.ratingData;
  const events = existing?.events || matched?.events || [];
  return events.length ? events[events.length - 1] : null;
};

const ratingColor = (r) => {
  if (!r) return "text-[var(--text-muted)]";
  if (r <= 3) return "text-red-600 font-bold";
  if (r <= 6) return "text-yellow-600 font-bold";
  return "text-green-600 font-bold";
};

const isPlayerSessionLocked = (playerRow) =>
  String(playerRow?.session?.lockStatus || "").trim().toLowerCase() === "locked";

const ratingBadge = (r) => {
  if (!r) return "bg-[var(--secondary-lighter)] text-[var(--text-muted)] border-[var(--border-card)]";
  if (r <= 3) return "bg-red-100 text-red-700 border-red-200";
  if (r <= 6) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-green-100 text-green-700 border-green-200";
};

/* ═══════════════════════════ WAGON WHEEL SVG ═════════════════════════════════*/

function WagonWheelPanel({ selected, onSelect }) {
  const CX = 148, CY = 148;
  const scale = (v, from, to) => v * (to / from);

  return (
    <svg viewBox="0 0 296 296" className="w-full max-w-[296px] drop-shadow-lg select-none">
      {/* Field */}
      <circle cx={CX} cy={CY} r="142" fill="#1b5e20" />
      <circle cx={CX} cy={CY} r="142" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeDasharray="8 4" />
      <circle cx={CX} cy={CY} r="90"  fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3" />
      {/* Pitch */}
      <rect x="136" y="60" width="24" height="120" fill="#d2b48c" rx="4" />
      <line x1="136" y1="84"  x2="160" y2="84"  stroke="white" strokeWidth="2" strokeDasharray="3 2" />
      <line x1="136" y1="156" x2="160" y2="156" stroke="white" strokeWidth="2" strokeDasharray="3 2" />
      {/* Batsman */}
      <circle cx={CX} cy={CY} r="16" fill="rgba(255,255,0,0.12)" stroke="rgba(255,255,0,0.6)" strokeWidth="2" strokeDasharray="4 3" />
      {/* Shots */}
      {shots.map((shot) => {
        const sx = scale(shot.x, 400, 296);
        const sy = scale(shot.y, 400, 296);
        const isSel = selected?.id === shot.id;
        return (
          <g key={shot.id} onClick={() => onSelect(shot)} style={{ cursor: "pointer" }}>
            <line
              x1={CX} y1={CY} x2={sx} y2={sy}
              stroke={isSel ? "#ef4444" : "rgba(156,163,175,0.5)"}
              strokeWidth={isSel ? 16 : 12}
              strokeLinecap="round"
              opacity={isSel ? 1 : 0.65}
            />
            <circle cx={sx} cy={sy} r={isSel ? 7 : 5}
              fill={isSel ? "#ef4444" : "white"}
              stroke={isSel ? "#5c0505" : "rgba(156,163,175,0.7)"}
              strokeWidth="2"
            />
            {isSel && (
              <text
                x={sx + (sx > CX + 8 ? 10 : sx < CX - 8 ? -10 : 0)}
                y={sy + (sy > CY ? 14 : -9)}
                fontSize="9" fill="#ef4444" fontWeight="bold"
                textAnchor={sx > CX + 8 ? "start" : sx < CX - 8 ? "end" : "middle"}
              >
                {shot.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════ PITCH MAP SVG ═══════════════════════════════════*/

function PitchMapPanel({ selected, onSelect }) {
  const gridX = 66, gridY = 42, colW = 58, rowH = 46;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 244 300" className="w-full max-w-[250px] drop-shadow-lg select-none">
        {/* Background */}
        <rect width="244" height="300" rx="10" fill="#14532d" />

        {/* Column headers */}
        {PITCH_COLS.map((col, ci) => (
          <text key={ci}
            x={gridX + ci * colW + colW / 2} y={26}
            textAnchor="middle" fontSize="9.5" fill="hsl(198, 14%, 86%)" fontWeight="bold"
          >
            {col.label}
          </text>
        ))}

        {/* Rows */}
        {PITCH_ROWS.map((row, ri) => (
          <g key={ri}>
            {/* Row label */}
            <text
              x={gridX - 4} y={gridY + ri * rowH + rowH / 2 + 1}
              textAnchor="end" dominantBaseline="middle"
              fontSize="9" fill="hsl(198, 14%, 86%)" fontWeight={ri === 1 ? "bold" : "normal"}
            >
              {row.label}
            </text>

            {/* Cells */}
            {PITCH_COLS.map((col, ci) => {
              const x = gridX + ci * colW;
              const y = gridY + ri * rowH;
              const isSel = selected?.line === col.key && selected?.length === row.key;
              return (
                <g key={ci}
                  onClick={() => onSelect({ line: col.key, length: row.key, label: `${row.label} / ${col.label}`, color: row.color })}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={x + 2} y={y + 2} width={colW - 4} height={rowH - 4} rx="4"
                    fill={isSel ? row.selColor : row.color}
                    stroke={isSel ? "#ffffff" : "rgba(255,255,255,0.15)"}
                    strokeWidth={isSel ? 2.5 : 1}
                    opacity={isSel ? 1 : 0.72}
                  />
                  {isSel && (
                    <text
                      x={x + colW / 2} y={y + rowH / 2 + 1}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize="11" fill="#1a1a1a" fontWeight="bold"
                    >
                      ✓
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ))}

        {/* Crease line */}
        <line
          x1={gridX} y1={gridY + PITCH_ROWS.length * rowH + 3}
          x2={gridX + PITCH_COLS.length * colW} y2={gridY + PITCH_ROWS.length * rowH + 3}
          stroke="white" strokeWidth="2" strokeDasharray="5 3" opacity="0.65"
        />
        {/* Stumps */}
        {[-8, 0, 8].map((ox) => (
          <line key={ox}
            x1={gridX + PITCH_COLS.length * colW / 2 + ox}
            y1={gridY + PITCH_ROWS.length * rowH + 3}
            x2={gridX + PITCH_COLS.length * colW / 2 + ox}
            y2={gridY + PITCH_ROWS.length * rowH + 15}
            stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
          />
        ))}
        {/* Batsman label */}
        <text
          x={gridX + (PITCH_COLS.length * colW) / 2}
          y={gridY + PITCH_ROWS.length * rowH + 28}
          textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" letterSpacing="1"
        >
          BATSMAN END
        </text>
      </svg>

      {selected && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border"
          style={{ backgroundColor: selected.color + "22", borderColor: selected.color + "66", color: selected.color }}
        >
          <span className="font-bold">⚡</span>
          <span className="font-medium">{selected.label}</span>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="ml-1 opacity-60 hover:opacity-100 text-xs"
          >✕</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ PLAYER PICKER ═══════════════════════════════════*/

function PlayerPicker({ players, value, onSelect, placeholder, theme = "gray" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  const getPlayerDisplayName = (playerObj) => {
    const name = String(playerObj?.name || "").trim();
    const batchId = String(playerObj?.batchId || "").trim();
    return batchId ? `${batchId} - ${name}` : name;
  };

  const filtered = players.filter((p) => {
    const query = String(q || "").trim().toLowerCase();
    if (!query) return true;

    const name = String(p?.player?.name || "").toLowerCase();
    const batchId = String(p?.player?.batchId || "").toLowerCase();
    const mobile = String(p?.player?.mobile || "").toLowerCase();

    return name.includes(query) || batchId.includes(query) || mobile.includes(query);
  });

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const themeBtn =
    "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full text-left text-sm border rounded-xl px-3 py-2.5 font-medium transition truncate ${themeBtn}`}
      >
        {value ? (
          <span className="flex items-center gap-2">
            {value.player?.logo && (
              <img src={value.player.logo} className="w-5 h-5 rounded-full object-cover flex-shrink-0" alt="" />
            )}
            {getPlayerDisplayName(value.player)}
          </span>
        ) : (
          <span className="opacity-50">{placeholder}</span>
        )}
      </button>
      {open && (
        <div className="absolute z-[80] mt-1 w-full min-w-[220px] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl shadow-2xl max-h-56 overflow-y-auto">
          <input
            autoFocus
            className="sticky top-0 w-full px-3 py-2 text-sm border-b border-[var(--border-card)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
            placeholder="Search player..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {filtered.map((p) => {
            const locked = isPlayerSessionLocked(p);
            return (
              <button
                key={p.auctionPlayerId}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
                  locked ? "opacity-50 cursor-not-allowed bg-[var(--bg-main)]" : "text-[var(--text-primary)] hover:bg-[var(--accent-light)]"
                }`}
                onClick={() => {
                  if (locked) {
                    toast.error("Session is locked. Rating is not allowed for this player.");
                    return;
                  }
                  onSelect(p); setOpen(false); setQ("");
                }}
              >
                {p.player?.logo && (
                  <img src={p.player.logo} className="w-6 h-6 rounded-full object-cover flex-shrink-0" alt="" />
                )}
                <span className="flex-1 truncate">{getPlayerDisplayName(p.player)}</span>
                {locked ? (
                  <span className="text-xs text-red-400 flex-shrink-0 font-medium">🔒</span>
                ) : p.player?.role ? (
                  <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{p.player.role}</span>
                ) : null}
              </button>
            );
          })}
          {!filtered.length && (
            <p className="px-3 py-3 text-sm text-[var(--text-muted)] text-center">No players found</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ RATING SLIDER ════════════════════════════════════*/

function RatingSlider({ value, onChange, theme }) {
  const accent = "#4f46e5";
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 1;
  const sliderPercent = Math.max(0, Math.min(100, ((safeValue - 1) / 9) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-secondary)]">Rating</span>
        <span className={`font-bold text-sm px-2 py-0.5 rounded-full border ${ratingBadge(value)}`}>
          {value} / 10
        </span>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full cursor-pointer bg-transparent"
        style={{
          accentColor: accent,
          background: `linear-gradient(to right, ${accent} 0%, ${accent} ${sliderPercent}%, #d1d5db ${sliderPercent}%, #d1d5db 100%)`,
        }}
      />
      <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
        <span>1 Poor</span><span>5 Avg</span><span>10 Excellent</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════ MAIN PAGE ═══════════════════════════════════════*/

const BallByBallRating = ({ auctionId, slot, session, onBack }) => {
  const dispatch = useDispatch();
  const auctionDetails = useSelector((state) => state.data?.auctionDetails || null);
  const slotList = useSelector((state) => state.data?.slotList?.data || []);

  const [players, setPlayers]                 = useState([]);
  const [loadingPlayers, setLoadingPlayers]   = useState(true);
  const [batsman, setBatsman]                 = useState(null);
  const [bowler, setBowler]                   = useState(null);
  const [ball, setBall]                       = useState({ ...EMPTY_BALL });
  const [events, setEvents]                   = useState([]);
  const [batsmanComments, setBatsmanComments]         = useState("");
  const [batsmanCustomFields, setBatsmanCustomFields]   = useState({});
  const [playerSavedMeta, setPlayerSavedMeta]           = useState({});
  const [submitting, setSubmitting]                     = useState(false);
  const [bowlerPool, setBowlerPool]                     = useState([]); // all added bowlers
  const [bowlerMetaByPlayer, setBowlerMetaByPlayer]     = useState({}); // { playerId: { comments, customFields } }
  const [filterSlotId, setFilterSlotId]       = useState(slot?.slotId || "");
  const [filterSessionId, setFilterSessionId] = useState(session?.sessionId || "");

  // Derived — always up to date with Redux slotList
  const filterSlotSessions = React.useMemo(() => {
    const found = slotList.find((s) => String(s?._id || "") === String(filterSlotId));
    return Array.isArray(found?.sessions) ? found.sessions : [];
  }, [slotList, filterSlotId]);

  // Track balls per player: { playerId: { batsman: [...], bowler: [...] } }
  const [playerBalls, setPlayerBalls]             = useState({});
  const [editingBallIdx, setEditingBallIdx]       = useState(null);
  const [viewRecordsConfig, setViewRecordsConfig] = useState(null); // { role: "batsman"|"bowler", player }
  const [deleteConfirm, setDeleteConfirm]         = useState(null); // { idx, label }

  /* Fetch slot list for filter dropdowns */
  useEffect(() => {
    if (auctionId) dispatch(fetchSlotList(auctionId, 1, 200, ""));
  }, [auctionId]);

  /* Load players when slot/session filter changes */
  useEffect(() => {
    if (!filterSlotId) return;
    setLoadingPlayers(true);
    setBatsman(null);
    setBowler(null);
    setBowlerPool([]);
    setBowlerMetaByPlayer({});
    setEvents([]);
    dispatch(fetchSessionPlayersForBallRating(auctionId, filterSlotId, filterSessionId || undefined))
      .then((res) => {
        const fetchedPlayers = res?.data?.data?.data || [];
        setPlayers(fetchedPlayers);
        setPlayerSavedMeta(buildSavedMetaMap(fetchedPlayers));
      })
      .catch(() => {})
      .finally(() => setLoadingPlayers(false));
  }, [auctionId, filterSlotId, filterSessionId]);

  const getCurrentSelectorId = () => String(localStorage.getItem("playerId") || "").trim();
  const configuredRatingFields = Array.isArray(auctionDetails?.ratingField) ? auctionDetails.ratingField : [];

  const handleFilterSlotChange = (newSlotId) => {
    setFilterSlotId(newSlotId);
    setFilterSessionId("");
  };

  const getFieldId = (field, idx) => String(field?._id || field?.id || field?.label || `field-${idx}`);
  const getFieldLabel = (field, idx) => String(field?.label || `Field ${idx + 1}`);

  const filterFieldsForRole = (role) => configuredRatingFields.filter((field) => {
    const appliesTo = String(field?.appliesTo || "all").toLowerCase();
    if (!appliesTo || appliesTo === "all") return true;
    if (role === "batsman") return appliesTo === "batsman" || appliesTo === "allrounder";
    if (role === "bowler") return appliesTo === "bowler" || appliesTo === "allrounder";
    return false;
  });

  const batsmanRatingFields = filterFieldsForRole("batsman");
  const bowlerRatingFields = filterFieldsForRole("bowler");

  const setCustomFieldValue = (role, fieldKey, nextValue, bowlerPlayerId) => {
    if (role === "batsman") {
      setBatsmanCustomFields((prev) => ({ ...prev, [fieldKey]: nextValue }));
      return;
    }
    if (bowlerPlayerId) {
      setBowlerMetaByPlayer((prev) => ({
        ...prev,
        [bowlerPlayerId]: {
          ...prev[bowlerPlayerId],
          customFields: { ...(prev[bowlerPlayerId]?.customFields || {}), [fieldKey]: nextValue },
        },
      }));
    }
  };

  // bowlerPlayerId is required when role === "bowler" so fields are stored per-bowler
  const renderCustomFieldInput = (field, idx, role, valueMap, bowlerPlayerId) => {
    const fieldKey = getFieldId(field, idx);
    const fieldLabel = getFieldLabel(field, idx);
    const fieldType = String(field?.fieldType || "input").toLowerCase();
    const valueType = String(field?.type || "string").toLowerCase();
    const options = Array.isArray(field?.options) ? field.options.filter(Boolean) : [];
    const value = valueMap[fieldKey];
    const inputBaseClass = "w-full text-sm border rounded-xl px-3 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none";
    const themedInputClass = `${inputBaseClass} border-[var(--border-card)] focus:border-[var(--border-primary)]`;

    if (fieldType === "dropdown") {
      return (
        <select
          value={value ?? ""}
          onChange={(e) => setCustomFieldValue(role, fieldKey, e.target.value, bowlerPlayerId)}
          className={themedInputClass}
        >
          <option value="">Select {fieldLabel}</option>
          {options.map((opt, optIdx) => (
            <option key={`${fieldKey}-opt-${optIdx}`} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (fieldType === "radio") {
      return (
        <div className="flex flex-wrap gap-3 pt-1">
          {options.map((opt, optIdx) => (
            <label key={`${fieldKey}-radio-${optIdx}`} className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <input
                type="radio"
                name={`${role}-${fieldKey}`}
                checked={value === opt}
                onChange={() => setCustomFieldValue(role, fieldKey, opt, bowlerPlayerId)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    if (fieldType === "checkbox") {
      const selectedValues = Array.isArray(value) ? value : [];
      if (options.length) {
        return (
          <div className="flex flex-wrap gap-3 pt-1">
            {options.map((opt, optIdx) => {
              const checked = selectedValues.includes(opt);
              return (
                <label key={`${fieldKey}-chk-${optIdx}`} className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selectedValues, opt]
                        : selectedValues.filter((item) => item !== opt);
                      setCustomFieldValue(role, fieldKey, next, bowlerPlayerId);
                    }}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        );
      }

      return (
        <label className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] pt-1">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setCustomFieldValue(role, fieldKey, e.target.checked, bowlerPlayerId)}
          />
          <span>{fieldLabel}</span>
        </label>
      );
    }

    return (
      <input
        type={valueType === "number" ? "number" : "text"}
        value={value ?? ""}
        onChange={(e) => setCustomFieldValue(role, fieldKey, valueType === "number" ? Number(e.target.value) : e.target.value, bowlerPlayerId)}
        placeholder={`Enter ${fieldLabel}`}
        className={themedInputClass}
      />
    );
  };

  const toDynamicFieldPayload = (fieldsConfig, valueMap) => {
    if (!Array.isArray(fieldsConfig)) return [];

    return fieldsConfig
      .map((field, idx) => {
        const fieldKey = getFieldId(field, idx);
        const label = getFieldLabel(field, idx);
        const type = String(field?.type || "string").toLowerCase() === "number" ? "number" : "string";
        const raw = valueMap?.[fieldKey];

        if (raw === undefined || raw === null || raw === "") return null;

        if (type === "number") {
          const numberValue = Number(raw);
          if (!Number.isFinite(numberValue)) return null;
          return { label, type: "number", numberValue };
        }

        const stringValue = Array.isArray(raw)
          ? raw.filter((v) => v !== undefined && v !== null && String(v).trim() !== "").join(", ")
          : typeof raw === "boolean"
            ? (raw ? "true" : "false")
            : String(raw);

        if (!String(stringValue).trim()) return null;
        return { label, type: "string", stringValue };
      })
      .filter(Boolean);
  };

  const mapLoadedEvent = (event, selectedPlayer, idx) => ({
    ballNumber: event.ballNumber || idx + 1,
    batsmanId: event?.batsman?._id || event?.batsmanId || selectedPlayer?.player?._id,
    batsmanName: event?.batsman?.name || selectedPlayer?.player?.name || "—",
    bowlerIds: Array.isArray(event?.bowlerIds)
      ? event.bowlerIds
          .map((id) => (id && typeof id === "object" ? String(id._id || id) : id ? String(id) : null))
          .filter(Boolean)
      : (Array.isArray(event?.bowlers) ? event.bowlers : [])
          .map((b) => String(b?._id || "").trim())
          .filter(Boolean),
    bowlerName: event?.bowler?.name || event?.bowlerName || event?.bowlers?.[0]?.name || "—",
    ballType: event.ballType || "normal",
    runsScored: event.runsScored ?? 0,
    boundary: event.boundary ?? 0,
    isWicket: event.isWicket || false,
    wicketType: event.wicket?.outType || null,
    shotType: event.shotType || null,
    wagonWheel: event.wagonWheel || {},
    bowlingZone: event.bowlingZone || {},
    batsmanRating: event.batsmanRating ?? event.rating ?? 6,
    bowlerRating: event.bowlerRating ?? event.rating ?? 6,
    notes: event.notes || "",
    _fromDb: true,
  });

  const loadExistingRatingsForPlayer = async (selectedPlayer) => {
    const playerId = String(selectedPlayer?.player?._id || "");
    if (!playerId) return;

    try {
      const url = `/webSiteApi/auctionSelector/getSessionPlayerBallRatings/${filterSlotId || slot.slotId}/${filterSessionId || session.sessionId}`;
      const response = await api.get(url, {
        params: { playerId, _ts: Date.now() }
      });

      const dataArr = response?.data?.data?.data || [];
      if (!dataArr.length) return;

      const selectorId = getCurrentSelectorId();
      if (!selectorId) return;

      const matchingRows = dataArr.filter((row) => {
        const rowPlayerId = String(row?.playerId || row?.player?._id || "");
        return rowPlayerId === playerId;
      });

      if (!matchingRows.length) return;

      const myRatings = matchingRows
        .flatMap((row) => (Array.isArray(row?.ratings) ? row.ratings : []))
        .filter((rating) => String(rating?.selector?._id || rating?.selectorId || "") === selectorId);

      if (myRatings.length) {
        const latest = myRatings[myRatings.length - 1] || {};
        setPlayerSavedMeta((prev) => ({
          ...prev,
          [playerId]: {
            comments: String(latest?.comments || prev?.[playerId]?.comments || ""),
            field: Array.isArray(prev?.[playerId]?.field) ? prev[playerId].field : [],
          },
        }));
      }

      const loadedEvents = myRatings.flatMap((rating) =>
        (rating.events || []).map((event, idx) => mapLoadedEvent(event, selectedPlayer, idx))
      );

      // New batsman context should refresh recorded balls list.
      setEvents(loadedEvents);
    } catch (err) {
      console.log("Error loading existing ratings:", err?.message);
    }
  };

  const applySavedMetaForRole = (selectedPlayer, role) => {
    const playerId = String(selectedPlayer?.player?._id || "").trim();
    if (!playerId) {
      if (role === "batsman") {
        setBatsmanComments("");
        setBatsmanCustomFields({});
      } else {
        setBowlerComments("");
        setBowlerCustomFields({});
      }
      return;
    }

    const saved = playerSavedMeta[playerId] || { comments: "", field: [] };
    const fieldsConfig = role === "batsman" ? batsmanRatingFields : bowlerRatingFields;
    const valueMap = toCustomFieldValueMap(fieldsConfig, saved.field, getFieldId, getFieldLabel);

    if (role === "batsman") {
      setBatsmanComments(saved.comments || "");
      setBatsmanCustomFields(valueMap);
      return;
    }

    // Bowler: update per-player meta map
    setBowlerMetaByPlayer((prev) => ({
      ...prev,
      [playerId]: { comments: saved.comments || "", customFields: valueMap },
    }));
  };

  /* Handle batsman selection - load existing ratings directly into Ball Details */
  const handleBatsmanSelect = async (selectedBatsman) => {
    setBatsman(selectedBatsman);
    setEditingBallIdx(null);
    setBall({ ...EMPTY_BALL });
    setEvents([]);
    applySavedMetaForRole(selectedBatsman, "batsman");
    await loadExistingRatingsForPlayer(selectedBatsman);
  };

  /* Add a bowler to the pool; auto-activate if first one */
  const handleAddBowlerToPool = (selectedBowler) => {
    const playerId = String(selectedBowler?.player?._id || "").trim();
    if (!playerId) return;
    if (bowlerPool.some((b) => String(b.player?._id) === playerId)) return;
    setBowlerPool((prev) => [...prev, selectedBowler]);
    setBowler((cur) => cur ?? selectedBowler); // activate if none active
    applySavedMetaForRole(selectedBowler, "bowler");
  };

  const removeBowlerFromPool = (playerId) => {
    const pid = String(playerId || "");
    setBowlerPool((prev) => {
      const remaining = prev.filter((b) => String(b.player?._id) !== pid);
      setBowler((cur) =>
        String(cur?.player?._id) === pid ? (remaining[0] ?? null) : cur
      );
      return remaining;
    });
  };

  const handleRuns = (r) =>
    setBall((b) => ({ ...b, runsScored: r, boundary: r === 4 ? 4 : r === 6 ? 6 : null }));

  /* Add or update ball for current player */
  const addBall = () => {
    if (!batsman && !bowler) { toast.error("Please select a batsman or bowler."); return; }
    if (!ball.selectedShot) { toast.error("Please select the batsman's shot on the wagon wheel."); return; }
    if (!ball.selectedZone) { toast.error("Please select the bowler's pitch zone."); return; }

    const meta  = SHOT_META[ball.selectedShot.id] || {};
    const power = ball.boundary === 6 ? 95 : ball.boundary === 4 ? 75 : ball.runsScored > 0 ? 55 : 30;

    const ballRecord = {
      ballNumber:    1,
      batsmanId:     batsman?.player?._id,
      batsmanName:   batsman?.player?.name,
      bowlerIds:     [bowler?.player?._id],
      bowlerName:    bowler?.player?.name,
      ballType:      ball.ballType,
      runsScored:    ball.runsScored,
      boundary:      ball.boundary,
      isWicket:      ball.isWicket,
      wicket:        ball.isWicket ? { outType: ball.wicketType } : null,
      shotType:      meta.shotType || null,
      wagonWheel:    { zone: meta.zone, angle: meta.angle, power, region: meta.region || ball.selectedShot.name },
      bowlingZone:   { line: ball.selectedZone.line, length: ball.selectedZone.length },
      batsmanRating: ball.batsmanRating,
      bowlerRating:  ball.bowlerRating,
      notes:         ball.notes,
    };

    // Store in playerBalls structure
    setPlayerBalls((pb) => {
      const updated = { ...pb };
      const batsmanId = batsman?.player?._id;
      const bowlerId = bowler?.player?._id;

      if (batsmanId) {
        updated[batsmanId] = updated[batsmanId] || { batsman: [], bowler: [] };
        updated[batsmanId].batsman = [...(updated[batsmanId].batsman || []), ballRecord];
      }

      if (bowlerId) {
        updated[bowlerId] = updated[bowlerId] || { batsman: [], bowler: [] };
        updated[bowlerId].bowler = [...(updated[bowlerId].bowler || []), ballRecord];
      }

      return updated;
    });

    // Also add to events for submit
    setEvents((ev) => [...ev, { ...ballRecord, ballNumber: ev.length + 1 }]);
    
    toast.success(`✅ Ball added! ${batsman?.player?.name ?? "—"} ${ball.batsmanRating}/10 | ${bowler?.player?.name ?? "—"} ${ball.bowlerRating}/10`);
    setBall({ ...EMPTY_BALL });
  };

  /* Delete event row with confirmation */
  const deleteEvent = (idx) => {
    const event = events[idx];
    setDeleteConfirm({
      idx,
      label: `Ball #${event.ballNumber || idx + 1} — ${event.batsmanName || "?"}${
        event.wagonWheel?.region ? ` (${event.wagonWheel.region})` : ""
      }`,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm === null) return;
    setEvents((ev) =>
      ev.filter((_, i) => i !== deleteConfirm.idx).map((e, i) => ({ ...e, ballNumber: i + 1 }))
    );
    toast.info("Ball record deleted.");
    setDeleteConfirm(null);
  };

  /* Submit — sends separate requests per unique batsman & per unique bowler */
  const handleSubmit = async () => {
    if (!events.length) { toast.error("Please add at least one ball before submitting."); return; }
    const activeSlotId = filterSlotId || slot.slotId;
    const activeSessionId = filterSessionId || session.sessionId;
    if (!activeSessionId) {
      toast.error("Please select a session before submitting ratings.");
      return;
    }
    const selectorId = localStorage.getItem("playerId");

    const newEvents = events.filter((e) => !e._fromDb);
    const shouldReplace = newEvents.length === 0;
    const sourceEvents = shouldReplace ? events : newEvents;

    const toEventPayload = (event, currentPlayerId, index) => {
      const isBatsmanForPlayer = String(event?.batsmanId || "") === String(currentPlayerId);
      const isBowlerForPlayer = (event?.bowlerIds || []).some((id) => String(id) === String(currentPlayerId));

      let effectiveRating = event?.rating;
      if (isBatsmanForPlayer && !isBowlerForPlayer) {
        effectiveRating = event?.batsmanRating ?? event?.rating ?? 5;
      } else if (isBowlerForPlayer && !isBatsmanForPlayer) {
        effectiveRating = event?.bowlerRating ?? event?.rating ?? 5;
      } else if (isBatsmanForPlayer && isBowlerForPlayer) {
        const b1 = Number(event?.batsmanRating);
        const b2 = Number(event?.bowlerRating);
        const parts = [b1, b2].filter((v) => Number.isFinite(v));
        effectiveRating = parts.length ? Number((parts.reduce((s, v) => s + v, 0) / parts.length).toFixed(2)) : (event?.rating ?? 5);
      }

      const { batsmanName, bowlerName, wicketType, _fromDb, ...rest } = event;
      return {
        ...rest,
        ballNumber: index + 1,
        rating: Number.isFinite(Number(effectiveRating)) ? Number(effectiveRating) : 5,
      };
    };

    // Build one request per affected player (prevents overwrite on same player).
    const playerBuckets = new Map();

    sourceEvents.forEach((event) => {
      const involvedPlayers = [event?.batsmanId, ...(event?.bowlerIds || [])]
        .map((id) => String(id || "").trim())
        .filter(Boolean);

      involvedPlayers.forEach((pid) => {
        if (!playerBuckets.has(pid)) {
          playerBuckets.set(pid, { events: [], hasBat: false, hasBowl: false });
        }

        const bucket = playerBuckets.get(pid);
        const isBat = String(event?.batsmanId || "") === pid;
        const isBowl = (event?.bowlerIds || []).some((id) => String(id) === pid);

        bucket.hasBat = bucket.hasBat || isBat;
        bucket.hasBowl = bucket.hasBowl || isBowl;
        bucket.events.push(event);
      });
    });

    if (!playerBuckets.size) {
      toast.error("No valid player events found to save.");
      return;
    }

    const submissionTasks = [];
    const submittedMetaByPlayer = {};

    playerBuckets.forEach((bucket, playerId) => {
      const resolvedPlayerType = bucket.hasBat && bucket.hasBowl
        ? "allrounder"
        : bucket.hasBat
          ? "batsman"
          : "bowler";

      const bowlerMeta = bowlerMetaByPlayer[playerId] || { comments: "", customFields: {} };
      const comments = resolvedPlayerType === "bowler" ? (bowlerMeta.comments || "") : batsmanComments;
      const batsmanFieldPayload = toDynamicFieldPayload(batsmanRatingFields, batsmanCustomFields);
      const bowlerFieldPayload = toDynamicFieldPayload(bowlerRatingFields, bowlerMeta.customFields || {});
      const fieldPayload = resolvedPlayerType === "allrounder"
        ? [...batsmanFieldPayload, ...bowlerFieldPayload]
        : resolvedPlayerType === "bowler"
          ? bowlerFieldPayload
          : batsmanFieldPayload;
      const payloadEvents = bucket.events.map((event, i) => toEventPayload(event, playerId, i));

      submittedMetaByPlayer[playerId] = {
        comments: String(comments || ""),
        field: fieldPayload,
      };

      submissionTasks.push(() =>
        dispatch(ratePlayerBallByBall(activeSlotId, activeSessionId, {
          selectorId,
          playerId,
          playerType: resolvedPlayerType,
          comments,
          field: fieldPayload,
          replaceEvents: shouldReplace,
          events: payloadEvents,
        }))
      );
    });

    setSubmitting(true);
    try {
      // Run sequentially to avoid last-write-wins race on same player.
      for (const runTask of submissionTasks) {
        await runTask();
      }
      setPlayerSavedMeta((prev) => ({ ...prev, ...submittedMetaByPlayer }));
      toast.success(`${sourceEvents.length} ball(s) saved — all players rated!`);
      onBack();
    } catch {
      toast.error("Submit failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── RENDER ────────────────────────────────────────────────────────────── */
  const selectedBatsmanId = String(batsman?.player?._id || "");
  const batsmanRecordCount = selectedBatsmanId
    ? events.filter((e) => String(e?.batsmanId || "") === selectedBatsmanId).length
    : 0;

  const getBowlerRecordCount = (pid) => {
    const p = String(pid || "");
    return p ? events.filter((e) => (e?.bowlerIds || []).some((id) => String(id) === p)).length : 0;
  };

  const bowlerDisplayName = (playerObj) => {
    const nm = String(playerObj?.name || "").trim();
    const bid = String(playerObj?.batchId || "").trim();
    return bid ? `${bid} - ${nm}` : nm;
  };

  const activeViewRecords = viewRecordsConfig
    ? (() => {
        const pid = String(viewRecordsConfig.player?.player?._id || "");
        if (viewRecordsConfig.role === "batsman")
          return events.filter((e) => String(e?.batsmanId || "") === pid);
        return events.filter((e) => (e?.bowlerIds || []).some((id) => String(id) === pid));
      })()
    : [];
  const activeViewTitle = viewRecordsConfig
    ? viewRecordsConfig.role === "batsman"
      ? `${viewRecordsConfig.player?.player?.name || "Batsman"} — All Batting Records`
      : `${bowlerDisplayName(viewRecordsConfig.player?.player) || "Bowler"} — All Bowling Records`
    : "";

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col">

      {/* Delete Confirmation Popup */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-card)] w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🗑️</span>
              <div>
                <p className="font-semibold text-[var(--text-primary)] text-sm">Delete Ball Record?</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{deleteConfirm.label}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border-card)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--bg-soft)] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto w-full px-2 sm:px-3 md:px-5 py-4 sm:py-6 space-y-4 sm:space-y-5">

        {/* Slot / Session Filter */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[var(--text-secondary)]">🔍 Filter by Slot / Session</span>
              {filterSessionId && (() => {
                const sess = filterSlotSessions.find((s) => String(s._id) === String(filterSessionId));
                const isLocked = String(sess?.lockStatus || "").trim().toLowerCase() === "locked";
                return isLocked ? (
                  <span className="text-xs font-medium text-red-600 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">🔒 Session Locked — Rating blocked</span>
                ) : null;
              })()}
            </div>
            {typeof onBack === "function" && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-primary)] text-[var(--text-primary)] text-xs font-medium hover:bg-[var(--secondary-lighter)] transition"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={filterSlotId}
              onChange={(e) => handleFilterSlotChange(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-xl text-sm bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition"
            >
              <option value="">-- Select Slot --</option>
              {slotList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.slotName || "Unnamed Slot"}
                </option>
              ))}
            </select>
            <select
              value={filterSessionId}
              onChange={(e) => setFilterSessionId(e.target.value)}
              disabled={!filterSlotId}
              className="w-full px-3 py-2 border border-[var(--border-primary)] rounded-xl text-sm bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Select Session --</option>
              {filterSlotSessions.map((s) => {
                const isLocked = String(s?.lockStatus || "").trim().toLowerCase() === "locked";
                return (
                  <option key={s._id} value={s._id}>
                    {s.name || "Unnamed Session"}{isLocked ? " 🔒" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Player Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Batsman */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏏</span>
                <span className="text-[var(--primary)] font-semibold text-sm">Batsman</span>
              </div>
              {batsman && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--primary)] border border-[var(--border-primary)]">
                    {batsmanRecordCount} record{batsmanRecordCount !== 1 ? "s" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewRecordsConfig({ role: "batsman", player: batsman })}
                    disabled={batsmanRecordCount === 0}
                    className="w-7 h-7 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--accent-light)] disabled:opacity-40 disabled:cursor-not-allowed"
                    title="View batting records"
                  >
                    👁
                  </button>
                </div>
              )}
            </div>
            {loadingPlayers ? (
              <div className="text-sm text-[var(--text-secondary)] py-1">Loading…</div>
            ) : (
              <>
                <PlayerPicker
                  players={players}
                  value={batsman}
                  onSelect={handleBatsmanSelect}
                  placeholder="— select batsman —"
                  theme="indigo"
                />
              </>
            )}
          </div>

          {/* Bowler Pool */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎳</span>
              <span className="text-[var(--primary)] font-semibold text-sm">Bowlers</span>
              {bowlerPool.length > 0 && (
                <span className="text-xs text-[var(--primary)] bg-[var(--accent-light)] border border-[var(--border-primary)] px-2 py-0.5 rounded-full">
                  {bowlerPool.length} added
                </span>
              )}
              {bowler && (
                <span className="text-xs text-[#102033] bg-[var(--secondary)] px-2 py-0.5 rounded-full ml-auto">
                  ⚡ {bowlerDisplayName(bowler.player)}
                </span>
              )}
            </div>

            {/* Bowler chips */}
            {bowlerPool.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {bowlerPool.map((p) => {
                  const isActive = String(bowler?.player?._id) === String(p.player?._id);
                  const pid = String(p.player?._id || "");
                  const recCount = getBowlerRecordCount(pid);
                  const bName = bowlerDisplayName(p.player);
                  return (
                    <div
                      key={p.auctionPlayerId || pid}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition select-none ${
                        isActive
                          ? "bg-[var(--secondary)] text-[#102033] border-[var(--secondary)] shadow-sm"
                          : "bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-card)] hover:border-[var(--border-primary)] hover:text-[var(--text-primary)]"
                      }`}
                      onClick={() => setBowler(p)}
                      title={`Click to set ${bName} as active bowler`}
                    >
                      <span className="truncate max-w-[110px]">{bName}</span>
                      {recCount > 0 && (
                        <span className={`text-[10px] ${isActive ? "text-[#102033]" : "text-[var(--primary)]"}`}>({recCount})</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setViewRecordsConfig({ role: "bowler", player: p }); }}
                        className={`opacity-60 hover:opacity-100 transition ${isActive ? "text-[#102033]" : "text-[var(--primary)]"}`}
                        title="View records"
                      >👁</button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeBowlerFromPool(p.player?._id); }}
                        className={`opacity-60 hover:opacity-100 transition ${isActive ? "text-[#102033]" : "text-[var(--primary)]"}`}
                        title="Remove"
                      >✕</button>
                    </div>
                  );
                })}
              </div>
            )}

            {loadingPlayers ? (
              <div className="text-sm text-[var(--text-secondary)] py-1">Loading…</div>
            ) : (
              <PlayerPicker
                players={players.filter((p) =>
                  !bowlerPool.some((b) => String(b.player?._id) === String(p.player?._id))
                )}
                value={null}
                onSelect={handleAddBowlerToPool}
                placeholder="+ Add bowler to pool…"
                theme="emerald"
              />
            )}
          </div>
        </div>

        {viewRecordsConfig && (
          <div className="fixed inset-0 z-40 bg-black/45 flex items-end sm:items-center justify-center p-2 sm:p-4">
            <div className="w-full max-w-xl bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border-card)] flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">👁 {activeViewTitle}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Total {activeViewRecords.length} record{activeViewRecords.length !== 1 ? "s" : ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewRecordsConfig(null)}
                  className="w-8 h-8 rounded-full border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-primary)]"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto divide-y divide-[var(--border-card)]">
                {activeViewRecords.length ? activeViewRecords.map((ev, i) => (
                  <div key={`view-${viewRecordsConfig?.role}-${i}`} className="px-4 py-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">Ball #{ev.ballNumber || i + 1}</span>
                      <span className="text-[var(--text-secondary)]">{ev._fromDb ? "Saved" : "New"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 mt-2">
                      <span className="text-[var(--text-secondary)]">Batsman</span>
                      <span className="text-right text-[var(--text-primary)] truncate">{ev.batsmanName || "—"}</span>
                      <span className="text-[var(--text-secondary)]">Bowler</span>
                      <span className="text-right text-[var(--text-primary)] truncate">{ev.bowlerName || "—"}</span>
                      <span className="text-[var(--text-secondary)]">Shot</span>
                      <span className="text-right text-[var(--text-primary)] truncate">{ev.wagonWheel?.region || "—"}</span>
                      <span className="text-[var(--text-secondary)]">Zone</span>
                      <span className="text-right text-[var(--text-primary)] truncate">{ev.bowlingZone ? `${ev.bowlingZone.length?.replace(/_/g, " ")} / ${ev.bowlingZone.line?.replace(/_/g, " ")}` : "—"}</span>
                      {viewRecordsConfig?.role === "batsman" ? (
                        <>
                          <span className="text-[var(--text-secondary)]">Bat Rating</span>
                          <span className={`text-right font-bold ${ratingColor(ev.batsmanRating)}`}>{ev.batsmanRating ?? "—"}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[var(--text-secondary)]">Bowl Rating</span>
                          <span className={`text-right font-bold ${ratingColor(ev.bowlerRating)}`}>{ev.bowlerRating ?? "—"}</span>
                        </>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="px-4 py-6 text-sm text-[var(--text-secondary)] text-center">No records found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dual Wagon Wheel / Pitch Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ── Batsman Side ── */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-3 sm:p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-[var(--primary)] font-semibold text-sm">
                🏏 {batsman ? batsman.player?.name : "Shot Direction"}
              </h3>
              {ball.selectedShot && (
                <span className="text-xs bg-[var(--accent-light)] text-[var(--primary)] border border-[var(--border-primary)] px-2 py-0.5 rounded-full font-medium">
                  {ball.selectedShot.name}
                </span>
              )}
            </div>

            <div className="flex justify-center">
              <WagonWheelPanel
                selected={ball.selectedShot}
                onSelect={(s) => setBall((b) => ({ ...b, selectedShot: s }))}
              />
            </div>

            <RatingSlider
              value={ball.batsmanRating}
              onChange={(v) => setBall((b) => ({ ...b, batsmanRating: v }))}
              theme="indigo"
            />
          </div>

          {/* ── Bowler Side ── */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-3 sm:p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-[var(--primary)] font-semibold text-sm">
                🎳 {bowler ? bowler.player?.name : "Bowling Zone"}
              </h3>
              {ball.selectedZone && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: ball.selectedZone.color + "22", color: ball.selectedZone.color }}
                >
                  {ball.selectedZone.label}
                </span>
              )}
            </div>

            <div className="flex justify-center">
              <PitchMapPanel
                selected={ball.selectedZone}
                onSelect={(z) => setBall((b) => ({ ...b, selectedZone: z }))}
              />
            </div>

            <RatingSlider
              value={ball.bowlerRating}
              onChange={(v) => setBall((b) => ({ ...b, bowlerRating: v }))}
              theme="emerald"
            />
          </div>
        </div>

        {/* Ball Details */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-3 sm:p-4 space-y-3 shadow-sm">
          <h3 className="text-[var(--text-primary)] font-semibold text-sm">Ball Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {/* Ball Type */}
              <div>
                <p className="text-xs text-[var(--text-secondary)] mb-1.5">Ball Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {BALL_TYPES.map((bt) => (
                    <button
                      key={bt.value}
                      type="button"
                      onClick={() => setBall((b) => ({ ...b, ballType: bt.value }))}
                      className={`px-2.5 py-1 text-xs rounded-full border font-medium transition ${
                        ball.ballType === bt.value
                          ? "bg-[var(--secondary)] text-[#102033] border-[var(--secondary)]"
                          : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-card)] hover:border-[var(--border-primary)]"
                      }`}
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Runs */}
              <div>
                <p className="text-xs text-[var(--text-secondary)] mb-1.5">Runs</p>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 1, 2, 3, 4, 6].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRuns(r)}
                      className={`w-9 h-9 rounded-full text-xs font-bold border transition ${
                        ball.runsScored === r
                          ? r === 4 ? "bg-blue-600 text-white border-blue-600"
                          : r === 6 ? "bg-orange-500 text-white border-orange-500"
                          : "bg-[var(--secondary)] text-[#102033] border-[var(--secondary)]"
                          : "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-card)] hover:border-[var(--border-primary)]"
                      }`}
                    >
                      {r === 4 ? "4◈" : r === 6 ? "6✦" : r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Wicket */}
              <div>
                <p className="text-xs text-[var(--text-secondary)] mb-1.5">Wicket</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ball.isWicket}
                      onChange={(e) =>
                        setBall((b) => ({ ...b, isWicket: e.target.checked, wicketType: e.target.checked ? "bowled" : null }))
                      }
                      className="rounded"
                    />
                    <span className="text-xs font-medium text-[var(--text-primary)]">🏏 W</span>
                  </label>
                  {ball.isWicket &&
                    WICKET_TYPES.map((wt) => (
                      <button
                        key={wt.value}
                        type="button"
                        onClick={() => setBall((b) => ({ ...b, wicketType: wt.value }))}
                        className={`px-2.5 py-1 text-xs rounded-full border transition ${
                          ball.wicketType === wt.value
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-card)] hover:border-red-500/40"
                        }`}
                      >
                        {wt.label}
                      </button>
                    ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setBall({ ...EMPTY_BALL })}
                  className="w-full sm:w-auto md:w-full lg:w-auto flex-shrink-0 px-4 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-main)] hover:bg-[var(--accent-light)] text-[var(--text-primary)] font-semibold text-sm transition"
                  title="Form clear karo nayi rating ke liye"
                >
                  🔄 Clear
                </button>
                <button
                  type="button"
                  onClick={addBall}
                  className="w-full sm:w-auto md:w-full lg:w-auto flex-shrink-0 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-[var(--text-dark)] font-semibold text-sm transition flex items-center justify-center gap-1"
                >
                  + Add Ball
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !events.length}
                  className="w-full sm:w-auto md:w-full lg:w-auto flex-shrink-0 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--text-dark)] font-semibold text-sm transition"
                >
                  {submitting ? "Saving…" : `Submit ${events.length} Ball${events.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Events Table */}
        {events.length > 0 && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[var(--bg-soft)] px-4 py-3 border-b border-[var(--border-card)] flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Recorded Balls ({events.length})</span>
            </div>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-xs min-w-[760px]">
                <thead className="bg-[var(--secondary-lighter)] text-[var(--text-secondary)] uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Batsman</th>
                    <th className="px-3 py-2 text-left">Shot</th>
                    <th className="px-3 py-2 text-center">Bat ⭐</th>
                    <th className="px-3 py-2 text-left">Bowler</th>
                    <th className="px-3 py-2 text-left">Zone</th>
                    <th className="px-3 py-2 text-center">Bowl ⭐</th>
                    <th className="px-3 py-2 text-center">Runs</th>
                    <th className="px-3 py-2 text-center">W</th>
                    <th className="px-3 py-2 text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-card)]">
                  {events.map((ev, i) => (
                    <tr key={i} className="hover:bg-[var(--bg-soft)] transition">
                      <td className="px-3 py-2 font-medium text-[var(--text-secondary)]">{ev.ballNumber}</td>
                      <td className="px-3 py-2 text-[var(--text-primary)] max-w-[80px] truncate">{ev.batsmanName}</td>
                      <td className="px-3 py-2 text-[var(--text-secondary)] max-w-[80px] truncate">{ev.wagonWheel?.region || "—"}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`font-bold ${ratingColor(ev.batsmanRating)}`}>{ev.batsmanRating}</span>
                      </td>
                      <td className="px-3 py-2 text-[var(--text-primary)] max-w-[80px] truncate">{ev.bowlerName}</td>
                      <td className="px-3 py-2 text-[var(--text-secondary)] text-[10px]">
                        {ev.bowlingZone ? `${ev.bowlingZone.length?.replace(/_/g, " ")} / ${ev.bowlingZone.line?.replace(/_/g, " ")}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`font-bold ${ratingColor(ev.bowlerRating)}`}>{ev.bowlerRating}</span>
                      </td>
                      <td className="px-3 py-2 text-center font-medium">
                        {ev.boundary === 4 ? <span className="text-blue-600">4◈</span>
                         : ev.boundary === 6 ? <span className="text-orange-500">6✦</span>
                         : ev.runsScored}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {ev.isWicket ? <span className="text-red-600 font-bold">W</span> : <span className="text-[var(--text-muted)]">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => deleteEvent(i)}
                          className="text-[var(--text-muted)] hover:text-red-500 transition text-base"
                        >✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-[var(--border-card)]">
              {events.map((ev, i) => (
                <div key={`m-${i}`} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">Ball #{ev.ballNumber}</span>
                    <button
                      type="button"
                      onClick={() => deleteEvent(i)}
                      className="text-[var(--text-muted)] hover:text-red-500 transition text-base"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-[var(--text-secondary)]">Batsman</div>
                    <div className="text-[var(--text-primary)] font-medium text-right truncate">{ev.batsmanName || "—"}</div>
                    <div className="text-[var(--text-secondary)]">Bowler</div>
                    <div className="text-[var(--text-primary)] font-medium text-right truncate">{ev.bowlerName || "—"}</div>
                    <div className="text-[var(--text-secondary)]">Shot</div>
                    <div className="text-[var(--text-primary)] text-right truncate">{ev.wagonWheel?.region || "—"}</div>
                    <div className="text-[var(--text-secondary)]">Zone</div>
                    <div className="text-[var(--text-primary)] text-right truncate">
                      {ev.bowlingZone ? `${ev.bowlingZone.length?.replace(/_/g, " ")} / ${ev.bowlingZone.line?.replace(/_/g, " ")}` : "—"}
                    </div>
                    <div className="text-[var(--text-secondary)]">Ratings</div>
                    <div className="text-right">
                      <span className={`font-bold ${ratingColor(ev.batsmanRating)}`}>{ev.batsmanRating}</span>
                      <span className="text-[var(--text-muted)] mx-1">/</span>
                      <span className={`font-bold ${ratingColor(ev.bowlerRating)}`}>{ev.bowlerRating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments + Submit */}
        {events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-[var(--primary)] mb-2">🏏 Batsman Comments</p>
              <textarea
                value={batsmanComments}
                onChange={(e) => setBatsmanComments(e.target.value)}
                placeholder={`Overall comments about ${batsman?.player?.name || "batsman"}…`}
                rows={2}
                className="w-full text-sm border border-[var(--border-card)] rounded-xl px-3 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-primary)] resize-none"
              />
              {batsmanRatingFields.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--border-card)] space-y-2">
                  <p className="text-xs font-semibold text-[var(--primary)]">Custom Fields</p>
                  {batsmanRatingFields.map((field, idx) => {
                    const fieldKey = getFieldId(field, idx);
                    return (
                      <div key={`batsman-custom-${fieldKey}`}>
                        <p className="text-xs text-[var(--text-secondary)] mb-1">{getFieldLabel(field, idx)}</p>
                        {renderCustomFieldInput(field, idx, "batsman", batsmanCustomFields)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="space-y-3">
              {bowlerPool.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4 shadow-sm">
                  <p className="text-xs text-[var(--text-secondary)] text-center py-2">Koi bowler pool mein nahi hai</p>
                </div>
              ) : (
                bowlerPool.map((p) => {
                  const pid = String(p.player?._id || "");
                  const bName = bowlerDisplayName(p.player);
                  const meta = bowlerMetaByPlayer[pid] || { comments: "", customFields: {} };
                  return (
                    <div key={pid} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4 shadow-sm">
                      <p className="text-xs font-semibold text-[var(--primary)] mb-2">🎳 {bName}</p>
                      <textarea
                        value={meta.comments}
                        onChange={(e) =>
                          setBowlerMetaByPlayer((prev) => ({
                            ...prev,
                            [pid]: { ...prev[pid], comments: e.target.value },
                          }))
                        }
                        placeholder={`Overall comments about ${p.player?.name || "bowler"}…`}
                        rows={2}
                        className="w-full text-sm border border-[var(--border-card)] rounded-xl px-3 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-primary)] resize-none"
                      />
                      {bowlerRatingFields.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-card)] space-y-2">
                          <p className="text-xs font-semibold text-[var(--primary)]">Custom Fields</p>
                          {bowlerRatingFields.map((field, idx) => {
                            const fieldKey = getFieldId(field, idx);
                            return (
                              <div key={`bowler-custom-${pid}-${fieldKey}`}>
                                <p className="text-xs text-[var(--text-secondary)] mb-1">{getFieldLabel(field, idx)}</p>
                                {renderCustomFieldInput(field, idx, "bowler", meta.customFields, pid)}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BallByBallRating;
