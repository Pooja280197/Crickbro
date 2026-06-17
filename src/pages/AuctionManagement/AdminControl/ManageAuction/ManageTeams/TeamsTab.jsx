import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addTeamToAuction,
  fetchAuctionDetails,
  getAllAuctionTeam,
  getAuctionTeams,
  updateAuctionTeam,
} from "../../../../../redux/actions";
import Loader from "../../../../../components/Loader";
import TeamCard from "../../../../../components/TeamCard";
import EnhancedTeamCard from "./TeamCard";
import { toast } from "react-toastify";
import api from "../../../../../utils/api";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Pencil,
  Search,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";

const tabs = [
  { key: "addTeam", label: "Add/Remove Team" },
  { key: "auctionTeams", label: "Teams Added to Auction" },
];

const panelClass =
  "rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]";
const inputClass =
  "h-10 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)]";
const primaryButtonClass =
  "inline-flex h-10 min-w-[132px] items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-4 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)] disabled:cursor-not-allowed disabled:opacity-60";
const outlineButtonClass =
  "inline-flex h-10 min-w-[132px] items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-4 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-50";
const iconTileClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]";

const TeamsTab = ({ auctionId }) => {
  const dispatch = useDispatch();
  const tournamentId = useSelector((state) => state.tournamentId);
  const [activeTab, setActiveTab] = useState("addTeam");
  const [searchAuctionTeam, setSearchAuctionTeam] = useState("");
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [viewTeam, setViewTeam] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    initialBudget: "",
    remainingBudget: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [auctionTeamPage, setAuctionTeamPage] = useState(1);
  const [auctionTeamLimit, setAuctionTeamLimit] = useState(16);

  const isTeamsLoading = useSelector((state) => state.loading?.allAuctionTeams);
  const auctionTeamLoading = useSelector(
    (state) => state.loading?.auctionTeams,
  );

  const tournamentTeamData = useSelector(
    (state) => state.data?.allAuctionTeams || {},
  );

  const auctionTeamData = useSelector(
    (state) => state.data?.auctionTeams?.data || {},
  );

  const tournamentTeam = tournamentTeamData || [];
  const auctionTeam = auctionTeamData?.data || [];
  const totalAuctionPages = auctionTeamData?.pages || 1;
  const totalAuctionTeams = auctionTeamData?.total || 0;

  const filteredTournamentTeams = useMemo(() => {
    if (!Array.isArray(tournamentTeam)) return [];

    return tournamentTeam.filter((item) => {
      const team = item?.teamId;
      return team?.name
        ?.toLowerCase()
        .includes(searchAuctionTeam.toLowerCase());
    });
  }, [searchAuctionTeam, tournamentTeam]);

  const filteredAuctionTeams = useMemo(() => {
    if (!Array.isArray(auctionTeam)) return [];

    return auctionTeam.filter((item) => {
      const teamName = item?.teamDoc?.name || item?.teamName || "";
      return teamName.toLowerCase().includes(searchAuctionTeam.toLowerCase());
    });
  }, [auctionTeam, searchAuctionTeam]);

  useEffect(() => {
    if (!Array.isArray(tournamentTeam)) return;

    const alreadyAdded = tournamentTeam
      .filter((item) => item.auctionTeam === true)
      .map((item) => item.teamId._id);

    setSelectedTeam(alreadyAdded);
  }, [tournamentTeam]);

  useEffect(() => {
    if (!auctionId) return;

    dispatch(getAllAuctionTeam(tournamentId));
    dispatch(getAuctionTeams(auctionId, 1, auctionTeamLimit));
    dispatch(fetchAuctionDetails(auctionId));
  }, [auctionId, auctionTeamLimit, dispatch, tournamentId]);

  useEffect(() => {
    if (viewTeam) {
      setEditForm({
        initialBudget: viewTeam.initialBudget || "",
        remainingBudget: viewTeam.remainingBudget || "",
      });
    }
  }, [viewTeam]);

  useEffect(() => {
    if (!auctionId) return;

    if (activeTab === "addTeam") {
      dispatch(getAllAuctionTeam(tournamentId));
    } else {
      dispatch(getAuctionTeams(auctionId, auctionTeamPage, auctionTeamLimit));
    }

    dispatch(fetchAuctionDetails(auctionId));
  }, [
    activeTab,
    auctionId,
    auctionTeamLimit,
    auctionTeamPage,
    dispatch,
    tournamentId,
  ]);

  useEffect(() => {
    setAuctionTeamPage(1);

    if (activeTab === "auctionTeams") {
      setAuctionTeamLimit(16);
    }
  }, [activeTab]);

  const handleEditTeam = async () => {
    if (!viewTeam || !editForm) return;

    const initialBudget = Number(editForm.initialBudget);
    const remainingBudget = Number(editForm.remainingBudget);

    if (remainingBudget > initialBudget) {
      toast.error("Remaining budget cannot be greater than Initial budget");
      return;
    }

    setIsUpdating(true);

    try {
      const updateData = {
        initialBudget,
        remainingBudget,
      };

      await dispatch(updateAuctionTeam(updateData, auctionId, viewTeam.teamId));
      await dispatch(getAuctionTeams(auctionId, auctionTeamPage, auctionTeamLimit));

      setViewTeam((prev) => ({
        ...prev,
        initialBudget,
        remainingBudget,
      }));

      setEditMode(false);
      setViewTeam(null);
    } catch (error) {
      console.error("Failed to update team:", error);
      toast.error("Failed to update team");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getFileNameFromHeaders = (headers) => {
    const contentDisposition = headers?.["content-disposition"] || "";
    const match = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
    return match?.[1] || null;
  };

  const handleDownloadAuctionTeamsExcel = async () => {
    if (!auctionId) return;

    try {
      setDownloadingExcel(true);

      const response = await api.get(
        `/webSiteApi/auction/exportAuctionTeamsExcel/${auctionId}`,
        { responseType: "blob" },
      );

      const fileName =
        getFileNameFromHeaders(response.headers) ||
        `auction_teams_${auctionId}.xlsx`;

      const blob = new Blob([response.data], {
        type:
          response.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.setAttribute("download", fileName);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Auction teams excel downloaded");
    } catch (error) {
      console.error("Failed to download teams excel:", error);
      toast.error("Failed to download excel");
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleToggleAll = () => {
    const visibleIds = filteredTournamentTeams
      .map((item) => item?.teamId?._id)
      .filter(Boolean);

    if (visibleIds.length === 0) return;

    const allVisibleSelected = visibleIds.every((id) =>
      selectedTeam.includes(id),
    );

    setSelectedTeam((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds])),
    );
  };

  const budgetFields = [
    { key: "initialBudget", label: "Initial Budget" },
    { key: "remainingBudget", label: "Remaining Budget" },
  ];

  const readOnlyFields = [
    { key: "maxPlayers", label: "Max Players" },
    { key: "minPlayers", label: "Min Players" },
    { key: "maxForeignPlayers", label: "Foreign Players" },
    { key: "rtmCardsAvailable", label: "RTM Cards" },
  ];

  const renderTeamGrid = () => {
    if (activeTab === "addTeam" && isTeamsLoading) {
      return <Loader text="Loading Teams..." />;
    }

    if (activeTab === "auctionTeams" && auctionTeamLoading) {
      return <Loader text="Loading Auction Teams..." />;
    }

    if (activeTab === "addTeam") {
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
          {filteredTournamentTeams.map((item) => {
            const team = item.teamId;
            if (!team?._id) return null;

            return (
              <TeamCard
                key={team._id}
                team={{
                  id: team._id,
                  name: team.name,
                  type: team.playerRole,
                  image: team.logo,
                }}
                isAdded={item.auctionTeam === true}
                isSelected={selectedTeam.includes(team._id)}
                onSelect={(id) =>
                  setSelectedTeam((prev) =>
                    prev.includes(id)
                      ? prev.filter((x) => x !== id)
                      : [...prev, id],
                  )
                }
                showActions
              />
            );
          })}
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
          {filteredAuctionTeams.map((item) => {
            const team = item.teamDoc;

            return (
              <EnhancedTeamCard
                key={item.teamId}
                player={{
                  id: item.teamId,
                  name: team?.name || item.teamName,
                  image: team?.logo,
                }}
                showActions
                onView={() => {
                  setViewTeam(item);
                  setEditMode(false);
                }}
              />
            );
          })}
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-[var(--border-card)] pt-4 sm:flex-row">
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            Page {auctionTeamPage} of {totalAuctionPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuctionTeamPage((prev) => Math.max(prev - 1, 1))}
              disabled={auctionTeamPage === 1}
              className={outlineButtonClass}
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <button
              onClick={() =>
                setAuctionTeamPage((prev) =>
                  prev < totalAuctionPages ? prev + 1 : prev,
                )
              }
              disabled={auctionTeamPage === totalAuctionPages}
              className={outlineButtonClass}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="w-full space-y-4 p-3 sm:p-4">
      <div className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-col gap-4 border-b border-[var(--border-card)] bg-[var(--bg-card)] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className={iconTileClass}>
              <Users size={18} />
            </div>
            <div className="min-w-0">
             
              <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                Teams setup
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                Select tournament teams, review auction teams, and update budget details.
              </p>
            </div>
          </div>

          <div className="ml-auto flex w-full flex-wrap gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-1 sm:w-auto lg:justify-end">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`min-h-9 flex-1 rounded-md px-3 text-sm font-semibold transition sm:flex-none ${
                  activeTab === tab.key
                    ? "bg-[var(--secondary)] text-[#102033] shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:p-5">
         

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              />
              <input
                type="text"
                placeholder="Search team..."
                value={searchAuctionTeam}
                onChange={(e) => setSearchAuctionTeam(e.target.value)}
                className={`${inputClass} w-full pl-9`}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {activeTab === "addTeam" ? (
                <>
                  <button
                    onClick={handleToggleAll}
                    className={`${outlineButtonClass} w-full sm:w-auto`}
                  >
                    <CheckCircle2 size={16} />
                    {filteredTournamentTeams.every((item) =>
                      selectedTeam.includes(item?.teamId?._id),
                    ) && filteredTournamentTeams.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>

                  <button
                    onClick={() => {
                      dispatch(addTeamToAuction(auctionId, selectedTeam)).then(() => {
                        dispatch(getAllAuctionTeam(tournamentId));
                        dispatch(getAuctionTeams(auctionId, 1, auctionTeamLimit));
                        setAuctionTeamPage(1);
                        setActiveTab("auctionTeams");
                      });
                    }}
                    disabled={selectedTeam.length === 0}
                    className={`${primaryButtonClass} w-full sm:w-auto`}
                  >
                    <ShieldCheck size={16} />
                    Update Teams ({selectedTeam.length})
                  </button>
                </>
              ) : (
                <>
                  <select
                    value={auctionTeamLimit}
                    onChange={(e) => {
                      setAuctionTeamLimit(Number(e.target.value));
                      setAuctionTeamPage(1);
                    }}
                    className={`${inputClass} bg-[var(--bg-card)] text-[var(--text-primary)]`}
                  >
                    <option value={16}>16 Teams</option>
                    <option value={32}>32 Teams</option>
                    <option value={64}>64 Teams</option>
                  </select>

                  <button
                    onClick={handleDownloadAuctionTeamsExcel}
                    disabled={downloadingExcel}
                    className={`${primaryButtonClass} w-full sm:w-auto`}
                  >
                    {downloadingExcel ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {downloadingExcel ? "Downloading..." : "Download Excel"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`${panelClass} p-3 sm:p-4`}>
        <div className="max-h-[calc(100vh-22rem)] min-h-[360px] overflow-y-auto pr-1 professional-scrollbar">
          {renderTeamGrid()}
        </div>
      </div>

      {viewTeam &&
        createPortal(
          (
        <div
          className="fixed inset-0 z-[2147483647] isolate flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => {
            if (!editMode) setViewTeam(null);
          }}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                    {viewTeam.teamDoc?.logo ? (
                      <img
                        src={viewTeam.teamDoc.logo}
                        className="h-full w-full object-contain p-1"
                        alt={viewTeam.teamName}
                      />
                    ) : (
                      <ShieldCheck size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                        {viewTeam.teamName}
                      </h3>
                      <span className="rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--primary)]">
                        Auction team
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                      Budget and squad rule details
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setViewTeam(null);
                    setEditMode(false);
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                  aria-label="Close team details"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-13rem)] space-y-4 overflow-y-auto bg-[var(--bg-main)] p-4 professional-scrollbar sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {budgetFields.map((field) => (
                  <div
                    key={field.key}
                    className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3"
                  >
                    <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      {field.label}
                    </label>

                    {editMode ? (
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--text-secondary)]">
                          ₹
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={editForm[field.key] ?? ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setEditForm((prev) => ({
                              ...prev,
                              [field.key]: value,
                            }));
                          }}
                          className={`${inputClass} w-full pl-8`}
                          placeholder="Enter amount"
                        />
                      </div>
                    ) : (
                      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                        {formatCurrency(viewTeam[field.key])}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3">
                <div className="mb-3 flex items-center gap-2">
                  <div className={iconTileClass}>
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                      Squad Rules
                    </h4>
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      Player limits configured for this auction team
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {readOnlyFields.map((field) => (
                    <div
                      key={field.key}
                      className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        {field.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                        {viewTeam[field.key] ?? "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {editMode && (
                <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] p-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Updating these values will directly change the team's auction budget.
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-[var(--border-card)] pt-4 sm:flex-row sm:justify-end">
                {!editMode ? (
                  <>
                    <button
                      onClick={() => {
                        setViewTeam(null);
                        setEditMode(false);
                      }}
                      className={outlineButtonClass}
                    >
                      Close
                    </button>

                    <button
                      onClick={() => setEditMode(true)}
                      className={`${primaryButtonClass} w-full sm:w-auto`}
                    >
                      <Pencil size={16} />
                      Edit Budget
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditForm({
                          initialBudget: viewTeam.initialBudget || "",
                          remainingBudget: viewTeam.remainingBudget || "",
                        });
                      }}
                      disabled={isUpdating}
                      className={outlineButtonClass}
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleEditTeam}
                      disabled={isUpdating}
                      className={`${primaryButtonClass} w-full sm:w-auto`}
                    >
                      {isUpdating ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Wallet size={16} />
                      )}
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
          ),
          document.body,
        )}
    </div>
  );
};

export default TeamsTab;
