import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPerformance, fetchProfile } from "../redux/actions";
import {
  Calendar,
  MapPin,
  Trophy,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Activity,
  X,
  Star,
  Target,
} from "lucide-react";
import Loader from "../components/Loader";
import Header from "../components/Header";
import EditProfile from "../components/EditProfile";
// import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const formatLabel = (value) => {
  if (!value) return "N/A";
  if (typeof value === "object") {
    return value.name || value.title || value.label || "N/A";
  }
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getDisplayText = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") {
    return value.name || value.title || value.label || value.city || fallback;
  }
  return String(value);
};

const panelClass =
  "rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]";
const statCardClass =
  "rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[0_8px_22px_rgba(16,32,51,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--border-primary)] hover:shadow-[0_16px_34px_rgba(16,32,51,0.14)]";
const iconTileClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]";
const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-4 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)]";
const outlineButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]";

const isSessionCompleted = (item) => {
  const sessionStatus = item?.session?.status?.toLowerCase?.() || "";
  return sessionStatus === "completed";
};

// Auction Detail Modal Component
const AuctionDetailModal = ({
  item,
  onClose,
  getStatusColor,
  getPlayerTypeColor,
  formatDate,
  formatCurrency,
}) => {
  if (!item) return null;

  const [showWheel, setShowWheel] = useState(false);
  const canShowRating = isSessionCompleted(item);
  const selectorRatings = Array.isArray(item.playersRatings?.ratings)
    ? item.playersRatings.ratings
    : [];
  const battingStats =
    item.battingStats ||
    item.playerPerformance?.battingStats ||
    item.stats?.battingStats ||
    item.stats?.batting ||
    {};
  const bowlingStats =
    item.bowlingStats ||
    item.playerPerformance?.bowlingStats ||
    item.stats?.bowlingStats ||
    item.stats?.bowling ||
    {};

  const derivedBallCount = selectorRatings.reduce(
    (maxBalls, rating) =>
      Math.max(
        maxBalls,
        Number(rating?.totalBalls || rating?.events?.length || 0),
      ),
    0,
  );
  const derivedRuns = selectorRatings.reduce((maxRuns, rating) => {
    const ratingRuns = (rating?.events || []).reduce(
      (sum, event) => sum + Number(event?.runsScored || 0),
      0,
    );
    return Math.max(maxRuns, ratingRuns);
  }, 0);
  const derivedFours = selectorRatings.reduce((maxCount, rating) => {
    const count = (rating?.events || []).filter(
      (event) => Number(event?.boundary || 0) === 4,
    ).length;
    return Math.max(maxCount, count);
  }, 0);
  const derivedSixes = selectorRatings.reduce((maxCount, rating) => {
    const count = (rating?.events || []).filter(
      (event) => Number(event?.boundary || 0) === 6,
    ).length;
    return Math.max(maxCount, count);
  }, 0);

  const runs = Number((battingStats?.runs ?? derivedRuns) || 0);
  const ballsFaced = Number(
    (battingStats?.ballsFaced ?? derivedBallCount) || 0,
  );
  const fours = Number((battingStats?.fours ?? derivedFours) || 0);
  const sixes = Number((battingStats?.sixes ?? derivedSixes) || 0);
  const selectorCount = selectorRatings.length;
  const latestSelectorComment = selectorRatings.find(
    (rating) => rating?.comments,
  )?.comments;
  const boundaryRuns = fours * 4 + sixes * 6;
  const otherRuns = Math.max(runs - boundaryRuns, 0);
  const estimatedDots = Math.max(ballsFaced - (fours + sixes), 0);
  const totalWheelValue = boundaryRuns + otherRuns + estimatedDots;
  const wheelSlices = [
    {
      label: "Boundary Runs",
      value: boundaryRuns,
      color: "#2563eb",
      text: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Running Runs",
      value: otherRuns,
      color: "#16a34a",
      text: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Dot Balls",
      value: estimatedDots,
      color: "#f59e0b",
      text: "text-amber-700",
      bg: "bg-amber-50",
    },
  ];

  let current = 0;
  const gradientParts = wheelSlices
    .map((slice) => {
      const start = totalWheelValue
        ? (current / totalWheelValue) * 360
        : current;
      current += slice.value;
      const end = totalWheelValue ? (current / totalWheelValue) * 360 : current;
      return `${slice.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Auction Details
              </h3>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center text-white/90 text-xs mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatDate(item.auction?.endedAt || item.createdAt)}</span>
              <span className="mx-2">•</span>
              <MapPin className="w-3 h-3 mr-1" />
              <span>
                {getDisplayText(item.tournament?.cityTown, "Location N/A")}
              </span>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-5 bg-slate-50 max-h-[80vh] overflow-y-auto">
            {/* Tournament & Auction Info */}
            {item.tournament && (
              <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
                <div className="flex items-center gap-3">
                  {item.tournament?.logo ? (
                    <img
                      src={item.tournament.logo}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-indigo-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">
                      {item.tournament?.name || "Tournament"}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {item.auction?.name || "Auction"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500 capitalize">
                        {item.tournament?.tournamentType || "N/A"}
                      </span>
                      {item.tournament?.startDate && (
                        <>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            {formatDate(item.tournament.startDate)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Player Performance */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Player Role</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${getPlayerTypeColor(item.playersRatings?.playerType)}`}
                  >
                    {item.playersRatings?.playerType || "N/A"}
                  </span>
                  {canShowRating ? (
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm font-semibold">
                        {item.playersRatings?.avgRating || "0"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Session not completed
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Auction Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}
                >
                  {item.status === "sold"
                    ? "✅ Sold"
                    : item.status === "unsold"
                      ? "❌ Unsold"
                      : item.status === "available"
                        ? "⏳ Available"
                        : "📅 Scheduled"}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  Selector Ratings
                </h4>
                {canShowRating && (
                  <div className="inline-flex items-center bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold">
                    Avg Rating: {item.playersRatings?.avgRating || 0}/10
                  </div>
                )}
              </div>

              {!canShowRating ? (
                <p className="text-xs text-slate-500">
                  Rating session complete hone ke baad selector ratings visible
                  hongi.
                </p>
              ) : selectorRatings.length > 0 ? (
                <div className="space-y-2">
                  {selectorRatings.map((rating, idx) => (
                    <div
                      key={`${rating.selectorId?._id || idx}`}
                      className="border border-slate-200 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {rating.selector?.name ||
                              rating.selectorId?.name ||
                              `Selector ${idx + 1}`}
                          </p>
                          <p className="text-[11px] text-slate-500 capitalize">
                            {rating.playerType ||
                              item.playersRatings?.playerType ||
                              "Player"}
                          </p>
                          {rating.selector?.mobile && (
                            <p className="text-[11px] text-slate-500 mt-1">
                              Contact: {rating.selector.mobile}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold text-xs">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {rating.rating ?? 0}/10
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-slate-50 rounded-md px-2 py-2 border border-slate-100">
                          <p className="text-[10px] text-slate-500">
                            Total Balls
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {rating.totalBalls || rating.events?.length || 0}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-md px-2 py-2 border border-slate-100">
                          <p className="text-[10px] text-slate-500">
                            Avg Rating
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {rating.avgRating ?? rating.rating ?? 0}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-md px-2 py-2 border border-slate-100">
                          <p className="text-[10px] text-slate-500">
                            Wickets Seen
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {
                              (rating.events || []).filter(
                                (event) => event?.isWicket,
                              ).length
                            }
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-md px-2 py-2 border border-slate-100">
                          <p className="text-[10px] text-slate-500">
                            Boundaries
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {
                              (rating.events || []).filter(
                                (event) => Number(event?.boundary || 0) > 0,
                              ).length
                            }
                          </p>
                        </div>
                      </div>

                      {Array.isArray(rating.field) &&
                        rating.field.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {rating.field.map((fieldItem, fieldIdx) => (
                              <span
                                key={`${fieldItem?.key || fieldItem?.label || fieldIdx}`}
                                className="text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-full"
                              >
                                {(
                                  fieldItem?.key ||
                                  fieldItem?.label ||
                                  "Metric"
                                ).toString()}
                                : {fieldItem?.value ?? "NA"}
                              </span>
                            ))}
                          </div>
                        )}

                      {rating.comments && (
                        <p className="mt-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-md px-2 py-1">
                          {rating.comments}
                        </p>
                      )}

                      {Array.isArray(rating.events) &&
                        rating.events.length > 0 && (
                          <div className="mt-3 border-t border-slate-100 pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-slate-800">
                                Ball By Ball Details
                              </p>
                              <span className="text-[11px] text-slate-500">
                                {rating.events.length} balls rated
                              </span>
                            </div>

                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                              {rating.events.map((event, eventIdx) => (
                                <div
                                  key={`${rating.selectorId || idx}-${event.ballNumber || eventIdx}`}
                                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                        Ball {event.ballNumber || eventIdx + 1}
                                      </span>
                                      {event.ballType && (
                                        <span className="text-[11px] text-slate-600">
                                          {formatLabel(event.ballType)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-[11px]">
                                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                        Runs {event.runsScored ?? 0}
                                      </span>
                                      {event.rating != null && (
                                        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                                          Rating {event.rating}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-600">
                                    <div>Boundary: {event.boundary || 0}</div>
                                    <div>
                                      Shot: {formatLabel(event.shotType)}
                                    </div>
                                    <div>
                                      Batsman: {event.batsmanRating ?? "N/A"}
                                    </div>
                                    <div>
                                      Bowler: {event.bowlerRating ?? "N/A"}
                                    </div>
                                  </div>

                                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600">
                                    <div>
                                      Bowling Zone:{" "}
                                      {formatLabel(event.bowlingZone?.line)} /{" "}
                                      {formatLabel(event.bowlingZone?.length)}
                                    </div>
                                    <div>
                                      Wagon:{" "}
                                      {formatLabel(event.wagonWheel?.zone)} /{" "}
                                      {formatLabel(event.wagonWheel?.region)}
                                    </div>
                                  </div>

                                  {(event.batsman?.name ||
                                    event.bowlers?.length ||
                                    event.fielder?.name) && (
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-600">
                                      <div>
                                        Batsman: {event.batsman?.name || "N/A"}
                                      </div>
                                      <div>
                                        Bowlers:{" "}
                                        {event.bowlers
                                          ?.map((bowler) => bowler.name)
                                          .join(", ") || "N/A"}
                                      </div>
                                      <div>
                                        Fielder:{" "}
                                        {event.fielder?.name ||
                                          event.wicket?.fielder?.name ||
                                          "N/A"}
                                      </div>
                                    </div>
                                  )}

                                  {event.isWicket && (
                                    <div className="mt-2 text-[11px] font-medium text-red-600">
                                      Wicket:{" "}
                                      {formatLabel(event.wicket?.outType)}
                                      {event.wicket?.isDirectHit
                                        ? " • Direct Hit"
                                        : ""}
                                    </div>
                                  )}

                                  {Array.isArray(event.field) &&
                                    event.field.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {event.field.map(
                                          (fieldItem, fieldIdx) => (
                                            <span
                                              key={`${fieldItem?.key || fieldItem?.label || fieldIdx}`}
                                              className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-full"
                                            >
                                              {(
                                                fieldItem?.key ||
                                                fieldItem?.label ||
                                                "Field"
                                              ).toString()}
                                              :{" "}
                                              {fieldItem?.value ??
                                                fieldItem?.numberValue ??
                                                fieldItem?.stringValue ??
                                                "NA"}
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    )}

                                  {event.notes && (
                                    <p className="mt-2 text-[11px] text-slate-700 bg-white border border-slate-200 rounded-md px-2 py-2">
                                      {event.notes}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Selector-wise rating details are not available for this
                  auction.
                </p>
              )}
            </div>

            {/* Price Details */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">
                Price Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Base Price</p>
                  <p className="text-lg font-bold text-slate-800">
                    {formatCurrency(item.basePrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Sold Price</p>
                  {item.soldPrice ? (
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(item.soldPrice)}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">Not Sold</p>
                  )}
                </div>
                {item.soldToTeam && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Sold To Team</p>
                    <p className="text-sm font-medium text-blue-600">
                      {getDisplayText(item.soldToTeam)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  Session Details
                </h4>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                  {item.session?.status || "No session"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Session Name</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.session?.name || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Session Date</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(item.session?.slotDate)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Timing</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.session?.slotStartTime || "--"} -{" "}
                    {item.session?.slotEndTime || "--"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Selectors</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectorCount}
                  </p>
                </div>
              </div>

              {latestSelectorComment && (
                <p className="mt-3 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                  Latest Selector Note: {latestSelectorComment}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  Batting and Bowling Snapshot
                </h4>
                <button
                  type="button"
                  onClick={() => setShowWheel((prev) => !prev)}
                  className="text-xs px-3 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
                >
                  {showWheel ? "Hide Wagon Wheel" : "Show Wagon Wheel"}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Runs</p>
                  <p className="text-lg font-bold text-slate-900">{runs}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Balls</p>
                  <p className="text-lg font-bold text-slate-900">
                    {ballsFaced}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Wickets</p>
                  <p className="text-lg font-bold text-slate-900">
                    {Number(bowlingStats?.wickets || 0)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Economy</p>
                  <p className="text-lg font-bold text-slate-900">
                    {Number(
                      bowlingStats?.economyRate || bowlingStats?.economy || 0,
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              {showWheel && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex justify-center">
                    <div
                      className="w-40 h-40 rounded-full border-8 border-white shadow-inner"
                      style={{
                        background: totalWheelValue
                          ? `conic-gradient(${gradientParts})`
                          : "conic-gradient(#e2e8f0 0deg 360deg)",
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    {wheelSlices.map((slice) => {
                      const pct = totalWheelValue
                        ? ((slice.value / totalWheelValue) * 100).toFixed(1)
                        : "0.0";
                      return (
                        <div
                          key={slice.label}
                          className={`flex items-center justify-between px-3 py-2 rounded-md ${slice.bg}`}
                        >
                          <span className={`text-xs font-medium ${slice.text}`}>
                            {slice.label}
                          </span>
                          <span className={`text-xs font-bold ${slice.text}`}>
                            {slice.value} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                    <p className="text-[11px] text-slate-500">
                      Wheel shows estimated run distribution using available
                      batting numbers.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Re-entry Count</p>
                <p className="text-sm font-medium">{item.reentryCount || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Bid History</p>
                <p className="text-sm font-medium">
                  {item.bidHistory || 0} bids
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Foreign Player</p>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${item.isForeign ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-600"}`}
                >
                  {item.isForeign ? "Yes" : "No"}
                </span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Category</p>
                <p className="text-sm font-medium">
                  {item.category?.name || "General"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PlayerProfile({ theme, onToggleTheme }) {
  const playerId = localStorage.getItem("playerId");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading?.profile || null);
  const profile = useSelector((state) => state.data?.profile || null);
  const performance = useSelector((state) => state.data?.myPerformance || null);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);

  const auctionHistory = Array.isArray(performance?.data)
    ? performance.data
    : [];
  const completedSessionAuctions = auctionHistory.filter((item) =>
    isSessionCompleted(item),
  );
  const soldItems = auctionHistory.filter((item) => item?.status === "sold");
  const soldRate = auctionHistory.length
    ? ((soldItems.length / auctionHistory.length) * 100).toFixed(1)
    : "0.0";
  const highestSold = soldItems.reduce(
    (max, item) => Math.max(max, Number(item?.soldPrice || 0)),
    0,
  );
  const averageSoldPrice = soldItems.length
    ? soldItems.reduce((acc, item) => acc + Number(item?.soldPrice || 0), 0) /
      soldItems.length
    : 0;
  const averageCardRating = completedSessionAuctions.length
    ? (
        completedSessionAuctions.reduce(
          (acc, item) => acc + Number(item?.playersRatings?.avgRating || 0),
          0,
        ) / completedSessionAuctions.length
      ).toFixed(1)
    : null;
  const totalSelectorEntries = completedSessionAuctions.reduce(
    (acc, item) =>
      acc +
      (Array.isArray(item?.playersRatings?.ratings)
        ? item.playersRatings.ratings.length
        : 0),
    0,
  );

  // Helper Functions
  const getStatusColor = (status) => {
    const colors = {
      available:
        "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]",
      sold: "border-emerald-200 bg-emerald-50 text-emerald-700",
      unsold: "border-red-200 bg-red-50 text-red-700",
      scheduled:
        "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)]",
      ongoing:
        "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]",
    };
    return (
      colors[status?.toLowerCase()] ||
      "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)]"
    );
  };

  const getPlayerTypeColor = (type) => {
    const colors = {
      batsman:
        "border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]",
      bowler:
        "border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)]",
      allrounder: "border border-emerald-200 bg-emerald-50 text-emerald-700",
      wicketkeeper:
        "border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)]",
    };
    return (
      colors[type?.toLowerCase()] ||
      "border border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)]"
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const performanceCards = [
    {
      label: "Participations",
      value: performance?.summary?.totalParticipations || 0,
      hint: "Total auctions",
      icon: Users,
      tone: "text-[var(--primary)]",
    },
    {
      label: "Sold",
      value: performance?.summary?.sold || 0,
      hint: "Successful bids",
      icon: TrendingUp,
      tone: "text-emerald-600",
    },
    {
      label: "Unsold",
      value: performance?.summary?.unsold || 0,
      hint: "Not picked",
      icon: Clock,
      tone: "text-red-600",
    },
    {
      label: "Earnings",
      value: formatCurrency(performance?.summary?.totalEarnings || 0),
      hint: "All auctions",
      icon: DollarSign,
      tone: "text-[var(--primary)]",
    },
    {
      label: "Avg Rating",
      value: averageCardRating ?? "--",
      hint: averageCardRating ? "Selector trend" : "After session",
      icon: Activity,
      tone: "text-[var(--secondary)]",
    },
  ];

  const insightCards = [
    { label: "Sold Rate", value: `${soldRate}%`, tone: "text-emerald-600" },
    {
      label: "Highest Price",
      value: formatCurrency(highestSold),
      tone: "text-[var(--primary)]",
    },
    {
      label: "Average Price",
      value: formatCurrency(averageSoldPrice),
      tone: "text-[var(--text-primary)]",
    },
    {
      label: "Selector Entries",
      value: totalSelectorEntries,
      tone: "text-[var(--primary)]",
    },
  ];

  useEffect(() => {
    if (playerId) {
      dispatch(fetchProfile(playerId));
      dispatch(fetchPerformance(playerId));
    }
  }, [playerId, dispatch]);

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        <Loader text="Loading Profile..." fullScreen="false" />
      </div>
    );
  }

  const handleEditProfile = async (profileData, isMultipart = true) => {
    const token = localStorage.getItem("token");
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Only set multipart header if actually sending files
      // axios automatically sets this for FormData
      if (!isMultipart) {
        config.headers["Content-Type"] = "application/json";
      }

      const response = await api.post(
        "/webSiteApi/players/updatePlayerProfile",
        profileData,
        config,
      );

      dispatch(fetchProfile(playerId));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-sans text-[var(--text-primary)]">
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      <section className="border-b border-[var(--border-card)] bg-[var(--bg-main)]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className={`${panelClass} overflow-hidden`}>
            <div className="relative bg-[var(--bg-main)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative">
                    <img
                      src={profile.profilePicture}
                      className="h-20 w-20 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-card)] object-cover shadow-[var(--shadow-card)]"
                      alt="Profile"
                    />
                    {profile.age && (
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[var(--secondary)] px-2 py-1 text-[10px] font-bold text-[#102033] shadow-sm">
                        {profile.age} yrs
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--primary)]">
                      Player Profile
                    </p>
                    <h1 className="mt-1 truncate text-2xl font-black text-[var(--text-primary)]">
                      {profile.name}
                    </h1>
                    <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                      {profile.location || "Location not set"} •{" "}
                      {profile.gender || "Gender not set"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.playerRoleBooleans &&
                        Object.entries(profile.playerRoleBooleans)
                          .filter(([, value]) => value)
                          .map(([role]) => (
                            <span
                              key={role}
                              className="rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1 text-[11px] font-bold capitalize text-[var(--primary)]"
                            >
                              {role.replace(/-/g, " ")}
                            </span>
                          ))}
                      {profile.jerseyNumber && (
                        <span className="rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-1 text-[11px] font-bold text-[var(--text-secondary)]">
                          Jersey {profile.jerseyNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  className={primaryButtonClass}
                  onClick={() => {
                    setIsEditModalOpen(true);
                  }}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="border-t border-[var(--border-card)] bg-[var(--bg-card)] p-2">
              <div className="flex gap-2 overflow-x-auto professional-scrollbar">
                {[
                  { key: "profile", label: "My Profile" },
                  { key: "performance", label: "My Performance" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`h-10 min-w-[132px] rounded-lg px-4 text-sm font-semibold transition ${
                      activeTab === tab.key
                        ? "bg-[var(--secondary)] text-[#102033] shadow-sm"
                        : "bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      {activeTab === "profile" ? (
        <>
          <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {profile.playerSummary?.slice(0, 5).map((item, index) => (
                <div key={index} className={statCardClass}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    {item?.label || "Stat"}
                  </p>
                  <p className="mt-1 text-xl font-black text-[var(--text-primary)]">
                    {item?.value?.toString() || "0"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Career Summary
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {profile.playerSummary?.map((item, index) => (
                <div key={index} className={statCardClass}>
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    {item?.label || "Stat"}
                  </p>
                  <p className="mt-1 text-xl font-black text-[var(--text-primary)]">
                    {item?.value?.toString() || "0"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {performance?.summary && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">
                My Auction Performance
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {performanceCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className={statCardClass}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[var(--text-secondary)]">
                            {card.label}
                          </p>
                          <p
                            className={`mt-1 truncate text-xl font-black ${card.tone}`}
                          >
                            {card.value}
                          </p>
                          <p className="mt-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                            {card.hint}
                          </p>
                        </div>
                        <div className={iconTileClass}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {insightCards.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2"
                  >
                    <p className="text-xs font-semibold text-[var(--text-secondary)]">
                      {item.label}
                    </p>
                    <p className={`mt-1 text-base font-black ${item.tone}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Auction History
              </h2>
              <span className="rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                {auctionHistory.length} auctions
              </span>
            </div>

            {auctionHistory.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {auctionHistory.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsModalOpen(true);
                    }}
                    className="group flex cursor-pointer flex-col gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[0_8px_22px_rgba(16,32,51,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--border-primary)] hover:shadow-[0_16px_34px_rgba(16,32,51,0.14)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-bold capitalize ${getStatusColor(item.status)} transition-transform group-hover:scale-105`}
                      >
                        {item.status === "sold"
                          ? "Sold"
                          : item.status === "unsold"
                            ? "Unsold"
                            : item.status === "available"
                              ? "Available"
                              : item.status === "ongoing"
                                ? "Ongoing"
                                : "Scheduled"}
                      </span>
                      <div className="flex items-center text-[11px] font-medium text-[var(--text-secondary)]">
                        <Calendar className="mr-1 h-4 w-4 text-[var(--primary)]" />
                        {formatDate(item.createdAt)}
                      </div>
                    </div>

                    <div>
                      <h3 className="truncate text-base font-black text-[var(--text-primary)]">
                        {item.tournament?.name || "Tournament"}
                      </h3>
                      <p className="mt-1 truncate text-[11px] font-medium text-[var(--text-secondary)]">
                        {item.auction?.name || "Auction"}
                        {item.tournament?.cityTown &&
                          ` • ${getDisplayText(item.tournament.cityTown)}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${getPlayerTypeColor(item.playersRatings?.playerType)}`}
                      >
                        {item.playersRatings?.playerType || "Player"}
                      </span>
                      <div className="flex items-center">
                        {isSessionCompleted(item) ? (
                          <>
                            <Star className="mr-1 h-4 w-4 fill-[var(--secondary)] text-[var(--secondary)]" />
                            <span className="text-[11px] font-bold text-[var(--text-primary)]">
                              {item.playersRatings?.avgRating || "0"}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border-card)] pt-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                          Base
                        </span>
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          {formatCurrency(item.basePrice)}
                        </p>
                      </div>
                      {item.soldPrice ? (
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                            Sold
                          </span>
                          <p className="text-sm font-black text-[var(--primary)]">
                            {formatCurrency(item.soldPrice)}
                          </p>
                          {item.soldToTeam && (
                            <p className="max-w-[120px] truncate text-[10px] font-medium text-[var(--text-secondary)]">
                              to {getDisplayText(item.soldToTeam)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                            Status
                          </span>
                          <p className="text-sm font-semibold text-[var(--text-secondary)]">
                            Not sold
                          </p>
                        </div>
                      )}
                    </div>

                    {item.reentryCount > 0 && (
                      <div>
                        <span className="rounded-full border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-1 text-[10px] font-bold text-[var(--text-secondary)]">
                          Re-entered {item.reentryCount}{" "}
                          {item.reentryCount === 1 ? "time" : "times"}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--primary)]">
                      <Target className="h-3.5 w-3.5" />
                      View details
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${panelClass} p-8 text-center`}>
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)]">
                  <Trophy className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
                  No Auction History
                </h3>
                <p className="mx-auto max-w-sm text-xs font-medium text-[var(--text-secondary)]">
                  You haven't participated in any auctions yet. Once you
                  register for auctions, your performance will appear here.
                </p>
                <button
                  className={`${primaryButtonClass} mt-4`}
                  onClick={() => {
                    navigate("/auction");
                  }}
                >
                  Browse Auctions
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isModalOpen && selectedItem && (
        <AuctionDetailModal
          item={selectedItem}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          getStatusColor={getStatusColor}
          getPlayerTypeColor={getPlayerTypeColor}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}

      <EditProfile
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditPlayer(null);
        }}
        editData={editPlayer}
        onSubmit={handleEditProfile}
        profile={profile}
      />
    </div>
  );
}
