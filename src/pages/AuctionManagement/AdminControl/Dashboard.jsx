import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuctionOverviewDetails } from "../../../redux/actions";
import { useParams } from "react-router-dom";
import {
  Activity,
  Award,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  PieChart,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Pagination from "../../../components/Pagination";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getPercentage = (value, max) => {
  const safeMax = Number(max || 0);
  if (!safeMax) return 0;
  return Math.min(100, Math.round((Number(value || 0) / safeMax) * 100));
};

const StatCard = ({ title, value, icon: Icon, helper }) => (
  <div className="flex min-h-[100px] flex-col justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] transition hover:border-[var(--border-primary)]">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          {title}
        </p>
        <p className="mt-1 truncate text-xl font-bold leading-8 text-[var(--text-primary)]">
          {value}
        </p>
      </div>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <p className=" line-clamp-1 text-xs font-medium text-[var(--text-secondary)]">
      {helper || "Updated auction summary"}
    </p>
  </div>
);

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <section
    className={`rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] ${className}`}
  >
    <div className="mb-4 flex items-center gap-3">
      {Icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </h2>
    </div>
    {children}
  </section>
);

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between gap-4 border-b border-[var(--border-card)] py-2.5 last:border-b-0">
    <div className="flex min-w-0 items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />}
      <span className="truncate text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </span>
    </div>
    <span className="shrink-0 text-right text-xs font-semibold text-[var(--text-primary)]">
      {value}
    </span>
  </div>
);

const ProgressBar = ({ value, max }) => (
  <div className="h-2 w-full overflow-hidden rounded-full border border-[var(--border-card)] bg-[var(--secondary-lighter)]">
    <div
      className="h-full rounded-full bg-[var(--secondary)] transition-all duration-500"
      style={{ width: `${getPercentage(value, max)}%` }}
    />
  </div>
);

const SmallMetric = ({ label, value, helper }) => (
  <div className="rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-3">
    <p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p>
    <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">{value}</p>
    {helper && (
      <p className="mt-1 truncate text-[11px] font-medium text-[var(--text-secondary)]">
        {helper}
      </p>
    )}
  </div>
);

const StatusBadge = ({ status }) => (
  <span className="inline-flex items-center rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2.5 py-1 text-[11px] font-semibold capitalize text-[var(--primary)]">
    {status || "Unknown"}
  </span>
);

const MobileMetric = ({ label, value, highlight = false }) => (
  <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2">
    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
      {label}
    </p>
    <p
      className={`mt-1 truncate text-sm font-semibold ${
        highlight ? "text-[var(--primary)]" : "text-[var(--text-primary)]"
      }`}
    >
      {value}
    </p>
  </div>
);

const CategoryMobileCard = ({ category }) => {
  const soldPercentage = getPercentage(
    category?.soldPlayers,
    category?.totalPlayers,
  );

  return (
    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--text-primary)]">
            {category?.categoryName || "Unnamed Category"}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
            {category?.soldPlayers || 0} of {category?.totalPlayers || 0} sold
          </p>
        </div>
        <StatusBadge status={category?.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MobileMetric label="Base" value={formatCurrency(category?.baseAmount)} />
        <MobileMetric
          label="Max Bid"
          value={formatCurrency(category?.maxBid)}
          highlight
        />
        <MobileMetric label="Total" value={category?.totalPlayers || 0} />
        <MobileMetric label="Sold" value={`${category?.soldPlayers || 0} (${soldPercentage}%)`} highlight />
      </div>

      <div className="mt-3">
        <ProgressBar
          value={category?.soldPlayers}
          max={category?.totalPlayers}
        />
      </div>
    </div>
  );
};

const TeamMobileCard = ({ team }) => {
  const utilization = getPercentage(team?.purseSpent, team?.initialBudget);

  return (
    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--text-primary)]">
            {team?.teamName || "Unnamed Team"}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
            Squad: {team?.currentSquadSize || 0}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2.5 py-1 text-[11px] font-semibold text-[var(--primary)]">
          {utilization}%
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MobileMetric
          label="Initial"
          value={formatCurrency(team?.initialBudget)}
        />
        <MobileMetric
          label="Spent"
          value={formatCurrency(team?.purseSpent)}
        />
        <MobileMetric
          label="Remaining"
          value={formatCurrency(team?.remainingBudget)}
          highlight
        />
        <MobileMetric label="Squad" value={team?.currentSquadSize || 0} />
      </div>

      <div className="mt-3">
        <ProgressBar value={team?.purseSpent} max={team?.initialBudget} />
      </div>
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
  const teams = teamStatistics?.teams || [];
  const categories = categoryStatistics?.categories || [];
  const totalTeams = teams.length;
  const totalPages = Math.ceil(totalTeams / itemsPerPage);
  const paginatedTeams = teams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    dispatch(AuctionOverviewDetails(auctionId));
  }, [auctionId, dispatch]);

  if (Loading) {
    return (
      <div className="flex min-h-[calc(100vh-108px)] items-center justify-center">
        <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-6 py-5 text-center shadow-[var(--shadow-card)]">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[var(--secondary)]" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Loading auction dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-108px)] bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="space-y-5 p-4 lg:p-6">
        <header className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    Dashboard
                  </p>
                  <h1 className="truncate text-xl font-bold leading-7 text-[var(--text-primary)] lg:text-2xl">
                    {auctionInfo?.auctionName || "Auction Dashboard"}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs font-medium text-[var(--text-secondary)] sm:flex-row sm:flex-wrap sm:items-center">
              <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-card)] px-3 py-2">
                <Calendar className="h-3.5 w-3.5 text-[var(--primary)]" />
                Started: {formatDate(auctionInfo?.auctionStartedAt)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-card)] px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
                Ends: {formatDate(auctionInfo?.auctionEndedAt)}
              </span>
              <StatusBadge status={auctionInfo?.auctionStatus} />
            </div>
          </div>
        </header>

        <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(paymentStatistics?.auctionSales?.totalSaleAmount)}
            icon={DollarSign}
            helper="Auction sale amount"
          />
          <StatCard
            title="Total Players"
            value={playerStatistics?.totalPlayers || 0}
            icon={Users}
            helper={`${playerStatistics?.soldPlayers || 0} sold, ${playerStatistics?.unsoldPlayers || 0} unsold`}
          />
          <StatCard
            title="Highest Sale"
            value={formatCurrency(paymentStatistics?.auctionSales?.highestSale)}
            icon={TrendingUp}
            helper={`Average ${formatCurrency(paymentStatistics?.auctionSales?.averageSalePrice)}`}
          />
          <StatCard
            title="Teams"
            value={totalTeams}
            icon={Award}
            helper="Active participants"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard title="Auction Information" icon={Briefcase}>
              <div>
                <InfoRow
                  label="Auction Type"
                  value={auctionInfo?.auctionType?.charAt(0)?.toUpperCase() + auctionInfo?.auctionType?.slice(1) || "N/A"}
                  icon={Target}
                />
                <InfoRow
                  label="Platform Fee"
                  value={formatCurrency(auctionInfo?.platformFee)}
                  icon={DollarSign}
                />
                <InfoRow
                  label="Registration Fee"
                  value={formatCurrency(auctionInfo?.registrationFee)}
                  icon={DollarSign}
                />
              </div>

              {auctionInfo?.trailTypeAuction && (
                <div className="mt-4 rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      Trial Slots
                    </span>
                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                      {slotAndSessionStatistics?.activeSlots || 0}/
                      {slotAndSessionStatistics?.totalSlots || 0} active
                    </span>
                  </div>
                  <ProgressBar
                    value={slotAndSessionStatistics?.activeSlots}
                    max={slotAndSessionStatistics?.totalSlots}
                  />
                </div>
              )}
            </SectionCard>

            <SectionCard title="Player Breakdown" icon={Users}>
              <div className="grid grid-cols-2 gap-3">
                <SmallMetric
                  label="Sold"
                  value={playerStatistics?.soldPlayers || 0}
                  helper={`of ${playerStatistics?.totalPlayers || 0}`}
                />
                <SmallMetric
                  label="Unsold"
                  value={playerStatistics?.unsoldPlayers || 0}
                  helper="remaining"
                />
              </div>
              <div className="mt-3">
                <InfoRow
                  label="Foreign Players"
                  value={playerStatistics?.foreignPlayers || 0}
                />
                <InfoRow
                  label="Reentry Players"
                  value={playerStatistics?.reentryPlayers || 0}
                />
                <InfoRow
                  label="Available Players"
                  value={playerStatistics?.availablePlayers || 0}
                />
              </div>
            </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-5 ">
            <SectionCard title="Category Overview" icon={PieChart}>
              <div className="space-y-3 md:hidden">
                {categories.length > 0 ? (
                  categories.map((cat, idx) => (
                    <CategoryMobileCard
                      key={cat.categoryId || idx}
                      category={cat}
                    />
                  ))
                ) : (
                  <p className="rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-4 text-center text-sm font-medium text-[var(--text-secondary)]">
                    No categories found.
                  </p>
                )}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[620px] text-left sm:min-w-[720px]">
                  <thead>
                    <tr className="border-b border-[var(--border-card)] text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Base</th>
                      <th className="px-3 py-3">Max Bid</th>
                      <th className="px-3 py-3">Total</th>
                      <th className="px-3 py-3">Sold</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-card)] text-xs">
                    {categories.map((cat, idx) => {
                      const soldPercentage = getPercentage(
                        cat.soldPlayers,
                        cat.totalPlayers,
                      );
                      return (
                        <tr
                          key={cat.categoryId || idx}
                          className="transition hover:bg-[var(--secondary-lighter)]"
                        >
                          <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">
                            {cat.categoryName}
                          </td>
                          <td className="px-3 py-3 text-[var(--text-secondary)]">
                            {formatCurrency(cat.baseAmount)}
                          </td>
                          <td className="px-3 py-3 font-medium text-[var(--text-primary)]">
                            {formatCurrency(cat.maxBid)}
                          </td>
                          <td className="px-3 py-3 text-[var(--text-secondary)]">
                            {cat.totalPlayers || 0}
                          </td>
                          <td className="px-3 py-3">
                            <span className="font-semibold text-[var(--primary)]">
                              {cat.soldPlayers || 0}
                            </span>
                            <span className="ml-1 text-[11px] text-[var(--text-secondary)]">
                              ({soldPercentage}%)
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={cat.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Team Performance" icon={Award}>
              <div className="space-y-3 md:hidden">
                {paginatedTeams.length > 0 ? (
                  paginatedTeams.map((team, idx) => (
                    <TeamMobileCard
                      key={team.teamId || idx}
                      team={team}
                    />
                  ))
                ) : (
                  <p className="rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] p-4 text-center text-sm font-medium text-[var(--text-secondary)]">
                    No teams found.
                  </p>
                )}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[680px] text-left sm:min-w-[760px]">
                  <thead>
                    <tr className="border-b border-[var(--border-card)] text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      <th className="px-3 py-3">Team</th>
                      <th className="px-3 py-3">Initial Budget</th>
                      <th className="px-3 py-3">Spent</th>
                      <th className="px-3 py-3">Remaining</th>
                      <th className="px-3 py-3">Squad</th>
                      <th className="px-3 py-3">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-card)] text-xs">
                    {paginatedTeams.map((team, idx) => {
                      const utilization = getPercentage(
                        team.purseSpent,
                        team.initialBudget,
                      );
                      return (
                        <tr
                          key={team.teamId || idx}
                          className="transition hover:bg-[var(--secondary-lighter)]"
                        >
                          <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">
                            {team.teamName}
                          </td>
                          <td className="px-3 py-3 text-[var(--text-secondary)]">
                            {formatCurrency(team.initialBudget)}
                          </td>
                          <td className="px-3 py-3 text-[var(--text-secondary)]">
                            {formatCurrency(team.purseSpent)}
                          </td>
                          <td className="px-3 py-3 font-semibold text-[var(--primary)]">
                            {formatCurrency(team.remainingBudget)}
                          </td>
                          <td className="px-3 py-3 text-[var(--text-secondary)]">
                            {team.currentSquadSize || 0}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-9 text-[11px] font-semibold text-[var(--text-secondary)]">
                                {utilization}%
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

              {totalTeams > 0 && (
                <div className="mt-4 border-t border-[var(--border-card)] pt-4">
                  <div className="text-center text-xs text-[var(--text-secondary)] sm:text-left">
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
              )}
            </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
