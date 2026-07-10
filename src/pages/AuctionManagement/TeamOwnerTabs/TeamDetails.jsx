// import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Activity,
  ArrowRight,
  BadgeIndianRupee,
  CircleDollarSign,
  Gavel,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPurchasedPlayers, fetchTeamsData } from "../../../redux/actions";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const Panel = ({ title, icon: Icon, children, action }) => (
  <section className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border-card)] bg-[var(--secondary-lighter)] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
      </div>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

const StatCard = ({ label, value, helper, icon: Icon }) => (
  <div className="flex min-h-[108px] flex-col justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-sm transition hover:border-[var(--border-primary)]">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          {label}
        </p>
        <p className="mt-2 truncate text-lg font-bold text-[var(--text-primary)]">
          {value}
        </p>
      </div>
      {Icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
    {helper && (
      <p className="truncate text-[11px] font-medium text-[var(--text-secondary)]">
        {helper}
      </p>
    )}
  </div>
);

const InfoTile = ({ label, value }) => (
  <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3 transition hover:border-[var(--border-primary)]">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">  
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
      {value || "-"}
    </p>
  </div>
);

const TeamDetails = ({ auctionId, playerId }) => {
  const dispatch = useDispatch();
 
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("team-details");
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);


  const loading = useSelector((state) => state.loading?.TeamData || false);

  const teamsData = useSelector((state) => state.data?.TeamData?.data || null);
  const purchasedPlayers = useSelector((state) => state.data?.PurchasedPlayers?.data || null);
  
  // Handle both single team and array of teams
  const teams = Array.isArray(teamsData) ? teamsData : teamsData ? [teamsData] : null;

  useEffect(() => {
    if (!auctionId || !playerId) return;

    const fetchTeams = async () => {
      try {
        await dispatch(fetchTeamsData(auctionId));
      } catch (err) {
        setError("Failed to load team details");
      }
    };

    fetchTeams();
  }, [auctionId,dispatch, playerId]);

  const team = teams?.[selectedTeamIndex];
  const selectedTeamId = team?.teamId;


  useEffect(() => {
    if (!selectedTeamId) return; // Wait until teamId is available

     const fetchPlayers = async () => {
      try {
        await dispatch(fetchPurchasedPlayers(auctionId,selectedTeamId));
      } catch (err) {
        setError("Failed to load team details");
      }
    };   
      fetchPlayers()
  }, [auctionId,dispatch,selectedTeamId]);

  if (loading)
    return (
      <div className="flex min-h-[calc(100vh-108px)] items-center justify-center p-4">
        <div className="inline-flex items-center gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-5 py-4 shadow-[var(--shadow-card)]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border-card)] border-b-[var(--primary)]"></div>
          <span className="text-sm font-medium text-[var(--text-secondary)]">Loading team details...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-[calc(100vh-108px)] items-center justify-center p-4">
        <div className="inline-flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
            <span className="text-red-500 text-sm">!</span>
          </div>
          <span className="text-red-600">{error}</span>
        </div>
      </div>
    );


  const details = team?.teamAuctionDetails;
  const budgetUsage = Math.min(
    100,
    ((details?.purseSpent || 0) / (details?.initialBudget || 1)) * 100,
  );

  // Handle live bidding navigation
  const handleLiveBiddingClick = () => {
    // navigate(`/team-bidding/${auctionId}`,{state:selectedTeamId});
    localStorage.setItem("selectedTeamId", selectedTeamId);
    window.open(`/team-bidding/${auctionId}`, "_blank");
  };

  // Team Selector Component (Button-based)
  const TeamSelector = () => {
    if (!teams || teams.length <= 1) return null;

    return (
      <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-2 shadow-[var(--shadow-card)]">
        <select
          value={selectedTeamIndex}
          onChange={(event) => setSelectedTeamIndex(Number(event.target.value))}
          className="h-11 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] md:hidden"
        >
          {teams.map((t, index) => (
            <option key={t.teamId} value={index}>
              {t.teamName} {t.teamCity ? `- ${t.teamCity}` : ""}
            </option>
          ))}
        </select>

        <div className="hidden gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden">
          {teams.map((t, index) => (
            <button
              key={t.teamId}
              onClick={() => setSelectedTeamIndex(index)}
              className={`flex min-h-12 w-[220px] flex-none min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${
                selectedTeamIndex === index
                  ? "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)] shadow-sm"
                  : "border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--secondary-lighter)]"
              }`}
            >
              <img
                src={t.teamLogo}
                alt={t.teamName}
                className="h-8 w-8 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-bold">{t.teamName}</p>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {t.teamCity}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Tab Navigation Component
  const TabNavigation = () => (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-1 shadow-[var(--shadow-card)]">
      <nav className="flex min-w-max items-center gap-1">
        {[
          ["team-details", "Team Details", Trophy],
          ["my-wallet", "My Wallet", Wallet],
          ["live-bidding", "Live Bidding", Gavel],
          ["players", "Players", Users],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
              activeTab === key
                ? "bg-[var(--secondary)] text-[#102033] shadow-sm"
                : "text-[var(--text-secondary)] hover:bg-[var(--secondary-lighter)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );

  // Team Details Tab
  const TeamDetailsTab = () => (
    <div className="space-y-4">
      <Panel title="Team Overview" icon={Trophy}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Squad Size" value={details?.currentSquadSize || 0} helper={`Allowed ${details?.minPlayers || 0}-${details?.maxPlayers || 0}`} icon={Users} />
          <StatCard label="Budget Left" value={formatCurrency(details?.remainingBudget)} helper={`Initial ${formatCurrency(details?.initialBudget)}`} icon={Wallet} />
          <StatCard label="RTM Available" value={details?.rtmCardsAvailable || 0} helper={`${details?.rtmCardsUsed || 0} used`} icon={ShieldCheck} />
          <StatCard label="Average Spend" value={formatCurrency(details?.currentSquadSize > 0 ? Math.round((details?.purseSpent || 0) / details.currentSquadSize) : 0)} helper="Per player" icon={BadgeIndianRupee} />
        </div>
      </Panel>

      <Panel title="Team Owner(s)" icon={Users}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {team?.owners?.length ? team.owners.map((owner) => (
            <div
              key={owner?._id}
              className="flex items-center gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3"
            >
              <img
                src={owner?.logo}
                alt={owner?.name}
                className="h-12 w-12 rounded-lg border border-[var(--border-card)] object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {owner?.name || "-"}
                </p>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {owner?.email || owner?.mobile || "No contact available"}
                </p>
              </div>
            </div>
          )) : (
            <div className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] p-4 text-sm text-[var(--text-secondary)] md:col-span-2">
              No owner information available.
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Team Rules & Requirements" icon={Activity}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <InfoTile label="Squad Composition" value={`Min ${details?.minPlayers || 0} - Max ${details?.maxPlayers || 0} players`} />
          <InfoTile label="Foreign Players" value={`Max ${details?.maxForeignPlayers || 0} overseas players`} />
          <InfoTile label="Wicket Keepers" value={`Min ${details?.minWicketKeepers || 0} - Max ${details?.maxWicketKeepers || 0}`} />
          <InfoTile label="Purchase Limits" value={`Min ${details?.minPurchasePlayers || 0} - Max ${details?.maxPurchasePlayers || 0}`} />
          <InfoTile label="Return Players" value={`Max ${details?.maxReturnPlayers || 0} players`} />
          <InfoTile label="Team Status" value={team?.isOwner ? "You are an owner" : "Viewing as spectator"} />
        </div>
      </Panel>
    </div>
  );

  // My Wallet Tab
  const MyWalletTab = () => (
    <div className="space-y-4">
      <Panel title="Budget Overview" icon={Wallet}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <StatCard label="Initial Budget" value={formatCurrency(details?.initialBudget)} helper="Starting amount" icon={BadgeIndianRupee} />
          <StatCard label="Purse Spent" value={formatCurrency(details?.purseSpent)} helper={`${(((details?.purseSpent || 0) / (details?.initialBudget || 1)) * 100).toFixed(1)}% spent`} icon={CircleDollarSign} />
          <StatCard label="Remaining Budget" value={formatCurrency(details?.remainingBudget)} helper={`${(((details?.remainingBudget || 0) / (details?.initialBudget || 1)) * 100).toFixed(1)}% remaining`} icon={Wallet} />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-[var(--text-secondary)]">
            <span>Budget Utilization</span>
            <span>
              {formatCurrency(details?.purseSpent)} / {formatCurrency(details?.initialBudget)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--secondary-lighter)]">
            <div
              className="h-full rounded-full bg-[var(--secondary)] transition-all"
              style={{
                width: `${Math.min(100, ((details?.purseSpent || 0) / (details?.initialBudget || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-5">
          <InfoTile
            label="Average Cost Per Player"
            value={formatCurrency(details?.currentSquadSize > 0 ? Math.round((details?.purseSpent || 0) / details.currentSquadSize) : 0)}
          />
        </div>
      </Panel>

      <Panel title="RTM Cards Status" icon={ShieldCheck}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard label="Available" value={details?.rtmCardsAvailable || 0} icon={ShieldCheck} />
          <StatCard label="Used" value={details?.rtmCardsUsed || 0} icon={Activity} />
        </div>
      </Panel>
    </div>
  );

  // Live Bidding Tab
  const LiveBiddingTab = () => (
    <div className="space-y-4">
      <Panel title="Live Bidding" icon={Gavel}>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
            <Gavel className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Ready for Live Bidding?
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Join the admin panel to bid in real time, track your purse, and use RTM cards when required.
          </p>
          <button
            onClick={handleLiveBiddingClick}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--secondary)] px-5 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)] sm:w-auto"
          >
            Go to Live Bidding
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </Panel>
    </div>
  );

  // Players Tab
  const PlayersTab = () => {
    const players = purchasedPlayers || [];

    const totalSpent = players?.reduce(
      (sum, p) => sum + (p.finalPrice || p.currentBid || 0),
      0
    );

    const indianCount = players?.filter((p) => !p.isForeign).length;
    const foreignCount = players?.filter((p) => p.isForeign).length;

    const avgRating = players?.length
      ? (
          players?.reduce(
            (sum, p) =>
              sum + (p.rating?.avgRating ?? p.rating?.avgRatingComputed ?? 0),
            0
          ) / players.length
        ).toFixed(1)
      : 0;

    return (
      <div className="space-y-4">
        <Panel
          title={`Squad Players (${players?.length})`}
          icon={Users}
          action={
            <span className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]">
              Spent: {formatCurrency(totalSpent)}
            </span>
          }
        >
            {/* Header */}
            {/* Players Grid */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {players?.length ? players.map((p) => (
                <div
                  key={p.playerId}
                  className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3 transition hover:border-[var(--border-primary)]"
                >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">
                          {p.player?.name}
                        </h4>
                        <span className="mt-1 inline-flex rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
                          {p.playerRole || "Player"}
                        </span>
                      </div>

                      {/* Rating (if available) */}
                      {(p.rating?.avgRating ?? p.rating?.avgRatingComputed) ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--secondary)]">★</span>
                          <span className="font-semibold text-[var(--text-secondary)]">
                            {p.rating?.avgRating ?? p.rating?.avgRatingComputed}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* BOTTOM SECTION */}
                    <div className="mt-4 border-t border-[var(--border-card)] pt-3">
                      <div className="text-xs text-[var(--text-secondary)]">
                        Bought Price
                      </div>
                      <div className="font-bold text-[var(--text-primary)]">
                        {formatCurrency(p.finalPrice || p.currentBid || 0)}
                      </div>
                    </div>
                </div>
              )) : (
                <div className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] p-6 text-center text-sm text-[var(--text-secondary)] md:col-span-2 xl:col-span-3">
                  No players purchased yet.
                </div>
              )}
            </div>

            {/* SUMMARY SECTION */}
            <div className="mt-6 border-t border-[var(--border-card)] pt-4">
              <h4 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
                Squad Summary
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Players" value={players?.length} icon={Users} />
                <StatCard label="Indian Players" value={indianCount} icon={Users} />
                <StatCard label="Foreign Players" value={foreignCount} icon={Users} />
                <StatCard label="Average Rating" value={avgRating} icon={Activity} />
              </div>
            </div>
        </Panel>
      </div>
    );
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-108px)] space-y-4 bg-[var(--bg-main)] p-3 text-[var(--text-primary)] sm:p-4 lg:p-5">
      {/* Team Selector */}
      {TeamSelector()}

      {/* Team Header */}
      <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 items-center gap-4">
            <img
              src={team?.teamLogo}
              alt={team?.teamName}
              className="h-16 w-16 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] object-cover"
            />
            <div className="min-w-0">
          
              <h1 className="mt-1 truncate text-2xl font-bold text-[var(--text-primary)]">
                {team?.teamName}
              </h1>
              <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                {team?.teamCity || "City not available"}
              </p>
            </div>
          </div>

          {/* <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
              <span>Budget Utilization</span>
              <span>{budgetUsage.toFixed(1)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--secondary-lighter)]">
              <div
                className="h-full rounded-full bg-[var(--secondary)]"
                style={{ width: `${budgetUsage}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <InfoTile label="Remaining" value={formatCurrency(details?.remainingBudget)} />
              <InfoTile label="Squad" value={details?.currentSquadSize || 0} />
            </div>
          </div> */}
        </div>
      </div>

      {/* Tab Navigation */}
      {TabNavigation()}

      {/* Tab Content */}
      <div>
        {activeTab === "team-details" && TeamDetailsTab()}
        {activeTab === "my-wallet" && MyWalletTab()}
        {activeTab === "live-bidding" && LiveBiddingTab()}
        {activeTab === "players" && PlayersTab()}
      </div>
    </div>
  );
};

export default TeamDetails;
