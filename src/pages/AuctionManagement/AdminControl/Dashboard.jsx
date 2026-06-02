import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuctionOverviewDetails } from "../../../redux/actions";
import { useParams } from "react-router-dom";
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Activity,
  Award,
  Target,
  PieChart,
  Briefcase,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Pagination from "../../../components/Pagination";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
}) => {
  return (
    <div className="relative group">
      <div className="relative rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[0_26px_72px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-main uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-2">
              {title}
            </p>
            <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
              {value}
            </p>
            {trend && (
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-secondary)] font-main">
                <TrendingUp className="w-3 h-3 text-[var(--secondary)]" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--secondary)]/15 text-[var(--secondary)] shadow-sm">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, children, icon: Icon, action }) => (
  <div className="relative group">
    <div className="relative rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[0_28px_80px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--secondary)]/15 text-[var(--secondary)] shadow-sm">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h2 className="text-base font-heading font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
        </div>
        {action && action}
      </div>
      {children}
    </div>
  </div>
);

const StatItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-2">
      {Icon && (
        <Icon className="w-4 h-4 text-[var(--secondary)]" />
      )}
      <span className="text-sm text-[var(--text-secondary)] font-main">
        {label}
      </span>
    </div>
    <span className="text-sm font-semibold text-[var(--text-primary)]">
      {value}
    </span>
  </div>
);

const ProgressBar = ({ value, max }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="w-full bg-[var(--background)] border border-[var(--secondary-light)] rounded-full h-2">
      <div
        className="bg-[var(--secondary)] rounded-full h-2 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const Dashboard = () => {
  const { auctionId } = useParams();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const Loading = useSelector((state) => state?.loading?.auctionOverview);
  const DashboardDetails = useSelector((state) => state?.data?.auctionOverview);

  const {
    auctionInfo,
    playerStatistics,
    paymentStatistics,
    categoryStatistics,
    teamStatistics,
    slotAndSessionStatistics,
  } = DashboardDetails || {};

  const itemsPerPage = 5;

  const totalTeams = teamStatistics?.teams?.length || 0;

  const totalPages = Math.ceil(totalTeams / itemsPerPage);

  const paginatedTeams = teamStatistics?.teams?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    dispatch(AuctionOverviewDetails(auctionId));
  }, [auctionId, dispatch]);

  if (Loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--secondary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] animate-pulse">
            Loading auction dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-main">
      <div className="relative z-10 p-4 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
                <Briefcase className="w-6 h-6 text-[var(--secondary)]" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-[var(--text-primary)]">
                {auctionInfo?.auctionName || "Auction Dashboard"}
              </h1>
            </div>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)] sm:flex-row sm:flex-wrap sm:gap-4">
              <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Calendar className="w-4 h-4 text-[var(--secondary)]" />
                Started:{" "}
                {auctionInfo?.auctionStartedAt
                  ? new Date(auctionInfo.auctionStartedAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )
                  : "N/A"}
              </span>
              <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Clock className="w-4 h-4 text-[var(--secondary)]" />
                Ends:{" "}
                {auctionInfo?.auctionEndedAt
                  ? new Date(auctionInfo.auctionEndedAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )
                  : "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 ${
                auctionInfo?.isBiddingActive
                  ? "bg-[var(--secondary)]/15 text-[var(--secondary)] border-[var(--secondary)]/25"
                  : "bg-[var(--secondary)]/15 text-[var(--secondary)] border-[var(--secondary)]/25"
              }`}
            >
              <span className="flex items-center gap-2 text-[var(--text-primary)]">
                <Activity className="w-4 h-4 text-[var(--secondary)]" />
                {auctionInfo?.auctionStatus || "Unknown"}
              </span>
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`₹${paymentStatistics?.auctionSales?.totalSaleAmount?.toLocaleString() || 0}`}
            icon={DollarSign}
          />
          <StatCard
            title="Total Players"
            value={playerStatistics?.totalPlayers || 0}
            icon={Users}
            trend={`${playerStatistics?.soldPlayers || 0} sold, ${playerStatistics?.unsoldPlayers || 0} unsold`}
          />
          <StatCard
            title="Highest Sale"
            value={`₹${paymentStatistics?.auctionSales?.highestSale?.toLocaleString() || 0}`}
            icon={TrendingUp}
            trend={`Average: ₹${paymentStatistics?.auctionSales?.averageSalePrice?.toLocaleString() || 0}`}
          />
          <StatCard
            title="Teams"
            value={teamStatistics?.teams?.length || 0}
            icon={Award}
            trend="Active participants"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Auction Info & Player Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Auction Information" icon={Briefcase}>
              <div className="space-y-3">
                <StatItem
                  label="Auction Type"
                  value={auctionInfo?.auctionType || "N/A"}
                  icon={Target}
                />
                <StatItem
                  label="Platform Fee"
                  value={`₹${auctionInfo?.platformFee?.toLocaleString() || 0}`}
                  icon={DollarSign}
                />
                <StatItem
                  label="Registration Fee"
                  value={`₹${auctionInfo?.registrationFee?.toLocaleString() || 0}`}
                  icon={DollarSign}
                />
                {auctionInfo?.trailTypeAuction && (
                  <div className="pt-3 mt-3 border-t border-[var(--border-card)]">
                    <StatItem
                      label="Total Slots"
                      value={slotAndSessionStatistics?.totalSlots || 0}
                      icon={Activity}
                      highlight
                    />
                    <StatItem
                      label="Active Slots"
                      value={slotAndSessionStatistics?.activeSlots || 0}
                      icon={Activity}
                    />
                    <ProgressBar
                      value={slotAndSessionStatistics?.activeSlots || 0}
                      max={slotAndSessionStatistics?.totalSlots || 1}
                      color="emerald"
                    />
                  </div>
                )}
              </div>
            </Card>

            <Card title="Player Breakdown" icon={Users}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-section)] p-4 shadow-sm">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Sold</p>
                    <p className="text-2xl font-heading font-bold text-[var(--secondary)]">
                      {playerStatistics?.soldPlayers || 0}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      of {playerStatistics?.totalPlayers || 0}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-section)] p-4 shadow-sm">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Unsold</p>
                    <p className="text-2xl font-heading font-bold text-[var(--secondary)]">
                      {playerStatistics?.unsoldPlayers || 0}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">remaining</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <StatItem
                    label="Foreign Players"
                    value={playerStatistics?.foreignPlayers || 0}
                  />
                  <StatItem
                    label="Reentry Players"
                    value={playerStatistics?.reentryPlayers || 0}
                  />
                  <StatItem
                    label="Available Players"
                    value={playerStatistics?.availablePlayers || 0}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Tables and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Categories Table */}
            {/* Categories Table / Cards */}
            <Card title="Category Overview" icon={PieChart}>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Base Amount</th>
                      <th className="pb-3">Max Bid</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Sold</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>

                  <tbody className="text-sm">
                    {categoryStatistics?.categories?.map((cat, idx) => (
                      <tr
                        key={cat.categoryId || idx}
                        className="group/row text-[var(--text-primary)]"
                      >
                        <td className="py-3 font-medium">{cat.categoryName}</td>

                        <td className="py-3">
                          ₹{cat.baseAmount?.toLocaleString()}
                        </td>

                        <td className="py-3">
                          ₹{cat.maxBid?.toLocaleString()}
                        </td>

                        <td className="py-3">{cat.totalPlayers}</td>

                        <td className="py-3">
                          <span className="text-[var(--secondary)] font-medium">
                            {cat.soldPlayers}
                          </span>

                          <span className="text-[var(--text-secondary)] text-xs ml-1">
                            (
                            {Math.round(
                              (cat.soldPlayers / cat.totalPlayers) * 100,
                            )}
                            %)
                          </span>
                        </td>

                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cat.status === "active"
                                ? "bg-[var(--secondary)]/15 text-[var(--secondary)]"
                                : "bg-[var(--text-secondary)]/15 text-[var(--text-secondary)]"
                            }`}
                          >
                            {cat.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                {categoryStatistics?.categories?.map((cat, idx) => {
                  const soldPercentage = Math.round(
                    (cat.soldPlayers / cat.totalPlayers) * 100,
                  );

                  return (
                    <div
                      key={cat.categoryId || idx}
                      className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] p-4 space-y-4"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                            {cat.categoryName}
                          </h3>

                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            {cat.soldPlayers} sold of {cat.totalPlayers}
                          </p>
                        </div>

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            cat.status === "active"
                              ? "bg-[var(--secondary)]/15 text-[var(--secondary)]"
                              : "bg-[var(--bg-section)] text-[var(--text-secondary)]"
                          }`}
                        >
                          {cat.status}
                        </span>
                      </div>

                      {/* Amounts */}
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Base Amount</span>

                          <span className="font-medium">
                            ₹{cat.baseAmount?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Max Bid</span>

                          <span className="font-medium text-[var(--primary)]">
                            ₹{cat.maxBid?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Total Players</span>

                          <span className="font-medium">
                            {cat.totalPlayers}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Sold Players</span>

                          <span className="font-medium text-emerald-500">
                            {cat.soldPlayers}
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                          <span>Sold Ratio</span>
                          <span>{soldPercentage}%</span>
                        </div>

                        <ProgressBar
                          value={cat.soldPlayers}
                          max={cat.totalPlayers}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            {/* Teams Table */}
            {/* Teams Table / Cards */}
            <Card title="Team Performance" icon={Award}>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      <th className="pb-3">Team</th>
                      <th className="pb-3">Initial Budget</th>
                      <th className="pb-3">Spent</th>
                      <th className="pb-3">Remaining</th>
                      <th className="pb-3">Squad</th>
                      <th className="pb-3">Utilization</th>
                    </tr>
                  </thead>

                  <tbody className="text-sm">
                    {paginatedTeams?.map((team, idx) => {
                      const utilization =
                        (team.purseSpent / team.initialBudget) * 100;

                      return (
                        <tr
                          key={team.teamId || idx}
                          className="group/row text-[var(--secondary)]"
                        >
                          <td className="py-3 font-medium">{team.teamName}</td>

                          <td className="py-3">
                            ₹{team.initialBudget?.toLocaleString()}
                          </td>

                          <td className="py-3">
                            ₹{team.purseSpent?.toLocaleString()}
                          </td>

                          <td className="py-3">
                            <span className="text-[var(--secondary)] font-medium">
                              ₹{team.remainingBudget?.toLocaleString()}
                            </span>
                          </td>

                          <td className="py-3">{team.currentSquadSize}</td>

                          <td className="py-3 w-[180px]">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[var(--text-secondary)] w-10">
                                {Math.round(utilization)}%
                              </span>

                              <ProgressBar
                                value={team.purseSpent}
                                max={team.initialBudget}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                {paginatedTeams?.map((team, idx) => {
                  const utilization =
                    (team.purseSpent / team.initialBudget) * 100;

                  return (
                    <div
                      key={team.teamId || idx}
                      className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] p-4 space-y-4"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                          {team.teamName}
                        </h3>

                        <span className="text-xs bg-[var(--secondary)]/15 text-[var(--secondary)] px-2 py-1 rounded-full">
                          {Math.round(utilization)}%
                        </span>
                      </div>

                      {/* Budget Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Initial Budget</span>

                          <span className="font-medium">
                            ₹{team.initialBudget?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Spent</span>

                          <span className="font-medium text-red-500">
                            ₹{team.purseSpent?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Remaining</span>

                          <span className="font-medium text-emerald-500">
                            ₹{team.remainingBudget?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Squad Size</span>

                          <span className="font-medium">
                            {team.currentSquadSize}
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                          <span>Budget Usage</span>
                          <span>{Math.round(utilization)}%</span>
                        </div>

                        <ProgressBar
                          value={team.purseSpent}
                          max={team.initialBudget}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Pagination */}
              {/* Pagination */}
              <div className="mt-6 border-t pt-4">
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] text-center sm:text-left">
                  Showing{" "}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>
                  {" - "}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {Math.min(currentPage * itemsPerPage, totalTeams)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {totalTeams}
                  </span>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  showSummary={false}
                  className="mt-4"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
