import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addTeamToAuction,
  fetchAuctionDetails,
  getAllAuctionTeam,
  getAuctionTeams,
  updateAuctionTeam, // Assuming this action exists
} from "../../../../../redux/actions";
import Loader from "../../../../../components/Loader";
import TeamCard from "./TeamCard";
import EnhancedTeamCard from "./TeamCard";
import { toast } from "react-toastify";
import api from "../../../../../utils/api";

const tabs = [
  { key: "addTeam", label: "Add/Remove Team" },
  { key: "auctionTeams", label: "Teams Added to Auction" },
];

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

  const totalTournamentPages = tournamentTeamData?.pages || 1;
  const totalAuctionPages = auctionTeamData?.pages || 1;
  const totalAuctionTeams = auctionTeamData?.total || 0;

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
  }, [auctionId]);

  // Initialize edit form when viewTeam changes
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
  }, [auctionId, auctionTeamPage, auctionTeamLimit, activeTab, tournamentId]);

    useEffect(() => {
    setAuctionTeamPage(1);

    if (activeTab === "auctionTeams") {
      setAuctionTeamLimit(16); // always reset to 16
    }
  }, [activeTab]);

  const handleEditTeam = async () => {
    if (!viewTeam || !editForm) return;

    const initialBudget = Number(editForm.initialBudget);
    const remainingBudget = Number(editForm.remainingBudget);

    // 🔴 VALIDATIONS
    if (remainingBudget > initialBudget) {
      toast.error("Remaining budget cannot be greater than Initial budget");
      return;
    }

    setIsUpdating(true);

    try {
      const updateData = {
        initialBudget: Number(editForm.initialBudget),
        remainingBudget: Number(editForm.remainingBudget),
      };

      // Dispatch update action
      await dispatch(updateAuctionTeam(updateData, auctionId, viewTeam.teamId));

      // Refresh auction teams data
      await dispatch(getAuctionTeams(auctionId));

      // Update viewTeam with new data
      setViewTeam((prev) => ({
        ...prev,
        initialBudget: Number(editForm.initialBudget),
        remainingBudget: Number(editForm.remainingBudget),
      }));

      setEditMode(false);
      setViewTeam(null);

      // Show success message (you can add a toast notification here)
      // toast.success("Team updated successfully!");
    } catch (error) {
      console.error("Failed to update team:", error);
      // toast.error("Failed to update team");
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

  const renderContent = () => {
    if (activeTab === "addTeam" && isTeamsLoading) {
      return <Loader text="Loading Teams..." />;
    }

    if (activeTab === "auctionTeams" && auctionTeamLoading) {
      return <Loader text="Loading Auction Teams..." />;
    }

    const filteredAuctionTeam = Array.isArray(tournamentTeam)
      ? tournamentTeam?.filter((item) => {
          const player = item?.teamId;
          const matchesSearch = player?.name
            ?.toLowerCase()
            .includes(searchAuctionTeam.toLowerCase());
          return matchesSearch;
        })
      : [];

    switch (activeTab) {
      case "addTeam":
        return (
          <div className=" flex justify-center items-center px-2 ">
            <div className="w-full max-w-7xl h-[90vh]  card-glass flex flex-col animate-slideDown ">
              <div className="sticky top-0 z-20 px-5 py-3 border-b border-gray-200 bg-white">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between ">
                    <h2 className="text-lg font-oswald tracking-wide text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      All Teams
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center font-inter">
                    <input
                      type="text"
                      placeholder="Search team..."
                      value={searchAuctionTeam}
                      onChange={(e) => setSearchAuctionTeam(e.target.value)}
                      className="flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    />

                    <button
                      onClick={() => {
                        if (
                          selectedTeam.length === filteredAuctionTeam.length
                        ) {
                          setSelectedTeam([]);
                        } else {
                          setSelectedTeam(
                            filteredAuctionTeam.map((i) => i?.teamId?._id),
                          );
                        }
                      }}
                      className="px-3 py-2 rounded-lg text-xs border border-gray-500/40  hover:bg-white/5 transition bg-accent-gradient text-primary-darker shadow-md"
                    >
                      {selectedTeam.length === filteredAuctionTeam.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>

                    <button
                      // disabled={selectedTeam.length === 0}
                      onClick={() => {
                        dispatch(
                          addTeamToAuction(auctionId, selectedTeam),
                        ).then(() => {
                          dispatch(getAllAuctionTeam(tournamentId));
                          dispatch(
                            getAuctionTeams(auctionId, 1, auctionTeamLimit),
                          );
                          setAuctionTeamPage(1);
                          setActiveTab("auctionTeams");
                        });
                      }}
                        className={`w-full sm:w-auto px-3 py-2  rounded-lg text-xs font-semibold transition border border-gray-500/40 ${
                        selectedTeam.length >= 0
                          ? "bg-accent-gradient text-primary-darker shadow-md"
                          : "bg-gray-600 text-gray-300 "
                      }`}
                    >
                      Add Team ({selectedTeam.length})
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4 justify-items-center">
                  {filteredAuctionTeam.map((item) => {
                    const team = item.teamId;
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
              </div>
            </div>
          </div>
        );

      case "auctionTeams":
        return (
          <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4 py-6">
            <div className="w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col animate-slideDown border border-gray-200">
              <div className="sticky top-0 z-20 px-5 py-3 border-b border-white/10 bg-primary-darker/80 backdrop-blur">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                     <h2 className="text-base sm:text-lg font-oswald tracking-wide text-crickbroYellow flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent-gradient"></span>
                      All Auction Teams ({totalAuctionTeams})
                    </h2>

                     <select
                      value={auctionTeamLimit}
                      onChange={(e) => {
                        setAuctionTeamLimit(Number(e.target.value));
                        setAuctionTeamPage(1);
                      }}
                      className="sm:text-sm text-xs md:text-md w-full sm:w-auto px-2 py-1 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    >
                      <option value={16}>16 Teams</option>
                      <option value={32}>32 Teams</option>
                      <option value={64}>64 Teams</option>
                    </select>

                 <button
                      onClick={handleDownloadAuctionTeamsExcel}
                      disabled={downloadingExcel}
                      className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {downloadingExcel ? "Downloading..." : "Download Excel"}
                    </button>
                  </div>

                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Search team..."
                      value={searchAuctionTeam}
                      onChange={(e) => setSearchAuctionTeam(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-800 focus:border-crickbroPurple outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-4 pb-20 md:pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 justify-items-center">
                  {auctionTeam.map((item) => {
                    const team = item.teamDoc;

                    return (
                      <EnhancedTeamCard
                        key={item.teamId}
                        player={{
                          id: item.teamId,
                          name: team?.name || item.teamName,
                          image: team?.logo,
                        }}
                        showActions={true}
                        onView={() => {
                          setViewTeam(item);
                          setEditMode(false);
                        }}
                      />
                    );
                  })}
                </div>
                  <div className="flex justify-center items-center gap-3 mt-4">
                  <button
                    onClick={() =>
                      setAuctionTeamPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={auctionTeamPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <span className="text-sm font-medium">
                    Page {auctionTeamPage} of {totalAuctionPages}
                  </span>

                  <button
                    onClick={() =>
                      setAuctionTeamPage((prev) =>
                        prev < totalAuctionPages ? prev + 1 : prev,
                      )
                    }
                    disabled={auctionTeamPage === totalAuctionPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* View/Edit Modal */}
              {viewTeam && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm mt-20"
                  onClick={() => {
                    if (!editMode) setViewTeam(null);
                  }}
                >
                  <div
                    className="bg-white w-full max-w-md rounded-2xl p-6 text-gray-800 border border-gray-200 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={viewTeam.teamDoc?.logo}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full border"
                          alt={viewTeam.teamName}
                        />
                        <h3 className="text-lg sm:text-xl font-bold text-primary">
                          {viewTeam.teamName}
                        </h3>
                      </div>

                      <button
                        onClick={() => {
                          setViewTeam(null);
                          setEditMode(false);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                      >
                        ✕
                      </button>
                    </div>

                    {/* EDITABLE FIELDS */}
                    <div className="space-y-4 mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        Budget Details
                        {editMode && (
                          <span className="ml-2 text-xs text-yellow-600">
                            (Editing)
                          </span>
                        )}
                      </h4>

                      {["initialBudget", "remainingBudget"].map((field) => (
                        <div key={field} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600 capitalize">
                            {field.replace(/([A-Z])/g, " $1").trim()}
                          </label>

                          {editMode ? (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                ₹
                              </span>

                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={editForm[field] ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    "",
                                  );
                                  setEditForm((prev) => ({
                                    ...prev,
                                    [field]: value === "" ? "" : Number(value),
                                  }));
                                }}
                                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                placeholder="Enter amount"
                              />
                            </div>
                          ) : (
                            <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                              <p className="text-gray-900 font-medium">
                                {formatCurrency(viewTeam[field])}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* READ ONLY */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                      {[
                        "maxPlayers",
                        "minPlayers",
                        "maxForeignPlayers",
                        "rtmCardsAvailable",
                      ].map((field) => (
                        <div key={field}>
                          <label className="text-gray-500 text-xs capitalize">
                            {field.replace(/([A-Z])/g, " $1")}
                          </label>
                          <p className="mt-1 text-gray-900 font-medium">
                            {viewTeam[field] ?? "-"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* WARNING */}
                    {editMode && (
                      <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <p className="text-sm text-yellow-700">
                          Note: Editing these values will directly update the
                          team's auction budget.
                        </p>
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      {!editMode ? (
                        <>
                          <button
                            onClick={() => {
                              setViewTeam(null);
                              setEditMode(false);
                            }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition border border-gray-800/50"
                          >
                            Close
                          </button>

                          <button
                            onClick={() => setEditMode(true)}
                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-[var(--secondary)] rounded-lg text-sm font-medium transition border border-gray-800/50"
                          >
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
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition disabled:opacity-50"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={handleEditTeam}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full py-4 px-2 sm:px-4">
      <div className="border-b border-gray-700 ">
        <ul className="flex gap-8 ">
          {tabs.map((tab) => (
            <li
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative cursor-pointer pb-3 text-sm font-medium transition
                ${
                  activeTab === tab.key
                    ? "text-[var(--secondary)]"
                    : "text-gray-500 hover:text-[var(--secondary-light)]"
                }`}
            >
              {tab.label}

              {activeTab === tab.key && (
                <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-yellow-400 rounded-full" />
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 p-4 rounded-lg ">{renderContent()}</div>
    </div>
  );
};

export default TeamsTab;
