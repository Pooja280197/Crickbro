

import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { useParams } from "react-router-dom";
import { connectAuctionSocket, disconnectSocket } from "../../../utils/SocketClient";
import { toast } from "react-toastify";
import PurchasedPlayerCard from "./PurchasedPlayerCard";
// import axios from "axios";

const BiddingPanel = () => {
  const { auctionId } = useParams();

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [bidAmount, setBidAmount] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [teamBiddingData, setTeamBiddingData] = useState(null);
  const [bidding, setBidding] = useState(false);
  const [socketInstance, setSocketInstance] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [purchasedPlayers, setPurchasedPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const dummyImage =
    "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";
  const BID_STEP = 250000;

  /* ---------- PLAYER ID ---------- */
  useEffect(() => {
    const storedPlayerId =
      localStorage.getItem("playerId") || sessionStorage.getItem("playerId");
    setPlayerId(storedPlayerId);
  }, []);

  const state = localStorage.getItem("selectedTeamId");

  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  /* ---------- SOCKET ---------- */
  useEffect(() => {
    if (!auctionId) return;

    const socket = connectAuctionSocket({
      auctionId,
      onSnapshot: (data) => {
        console.log("✅ FIRST SNAPSHOT", data);
        handleSocketData(data);
      },
      onUpdate: (data) => {
        console.log("📩 UPDATE", data);
        handleSocketData(data);
      },
      onDisconnect: (reason) => console.log("Socket disconnected:", reason),
      onError: (err) => console.error("Socket error:", err),
    });

    setSocketInstance(socket);

    return () => {
      disconnectSocket();
      setSocketInstance(null);
    };
  }, [auctionId]);

  /* ---------- PURCHASED PLAYERS ---------- */
  useEffect(() => {
    api
      .get(
        `/webSiteApi/auction/getAllPlayersAdmin/${auctionId}?teamId=${state}`,
      )
      .then((res) => {
        const data = res.data?.data?.data || [];
      
        setPurchasedPlayers(data);
      })
      .catch((err) => console.error(err));
  }, [auctionId,selectedTeam]);

  const remainingBudget =
    selectedTeam?.teamAuctionDetails?.remainingBudget || 0;

  /* ---------- SOCKET DATA HANDLER ---------- */
  const handleSocketData = (data) => {
    const payload = data && data.data ? data.data : data;

    if (!payload?.currentPlayer) return;

    const player = payload.currentPlayer;
    setCurrentPlayer(player);

    const bh = player.bidHistory || [];

    const formatBidTime = (val) => {
      if (!val) return "";
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      const secs = String(d.getSeconds()).padStart(2, "0");
      return `${hours}:${mins}:${secs}`;
    };

    const normalized = bh
      .map((b) => ({
        teamName: b.teamName,
        teamId: b.teamId,
        amount: Number(b.bidAmount ?? b.amount ?? 0),
        time: formatBidTime(b.bidTime || b.createdAt || b.time),
      }))
      .sort((a, c) => c.amount - a.amount)
      .slice(0, 12);

    setBidHistory(normalized);

    if (selectedTeam?.teamId) {
      const teamBidData = normalized.find(
        (b) => String(b.teamId) === String(selectedTeam.teamId),
      );
      if (teamBidData) {
        setTeamBiddingData({
          lastBidAmount: teamBidData.amount,
          lastBidTime: teamBidData.time,
          isCurrentBidder:
            String(player.highestBidder) === String(selectedTeam.teamId),
          isHighestBidder: normalized[0]?.teamId === selectedTeam.teamId,
        });
      } else {
        setTeamBiddingData(null);
      }
    }

    const increment = player.biddingIncrement || BID_STEP;
    setBidAmount(
      player.currentBid === 0 
        ? player.basePrice
        : player.currentBid + increment,
    );
  };

  /* ---------- TEAMS ---------- */
  useEffect(() => {
    if (!auctionId || !playerId) return;

    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/webSiteApi/auctionTeam/getTeamsByOwnerInAuction/${auctionId}?playerId=${playerId}`,
        );
        const teamData = response.data?.data?.data || [];
        setTeams(teamData);
        if (teamData.length > 0) setSelectedTeam(teamData[0]);
      } catch {
        toast.error("Failed to load teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [auctionId, playerId]);

  /* ---------- TEAM BID STATE ---------- */
  useEffect(() => {
    if (selectedTeam?.teamId && bidHistory.length > 0) {
      const teamBidData = bidHistory.find(
        (b) => String(b.teamId) === String(selectedTeam.teamId),
      );
      if (teamBidData) {
        setTeamBiddingData({
          lastBidAmount: teamBidData.amount,
          lastBidTime: teamBidData.time,
          isCurrentBidder:
            currentPlayer &&
            String(currentPlayer.highestBidder) === String(selectedTeam.teamId),
          isHighestBidder: bidHistory[0]?.teamId === selectedTeam.teamId,
        });
      } else {
        setTeamBiddingData(null);
      }
    }
  }, [selectedTeam, bidHistory, currentPlayer]);

  /* ---------- HELPERS ---------- */
  const formatMoney = (amount) => {
    if (!amount || isNaN(amount)) return "0";
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`;
    return amount.toString();
  };

  const handlePlaceBid = async () => {
    if (!selectedTeam || !currentPlayer || !bidAmount) {
      toast.error("Please fill all required fields");
      return;
    }

    const increment = currentPlayer.biddingIncrement || BID_STEP;
    const minBid =
      (currentPlayer.currentBid || currentPlayer.basePrice) ;

    if (bidAmount < minBid) {
      toast.error(`Minimum bid is ₹${formatMoney(minBid)}`);
      return;
    }

    try {
      setBidding(true);
      await api.post(`/webSiteApi/auction/placeBid/${auctionId}`, {
        playerId: currentPlayer.playerId,
        teamId: selectedTeam.teamId,
        bidAmount,
      });
      toast.success("Bid placed successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to place bid");
    } finally {
      setBidding(false);
    }
  };


  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="auction-management-theme flex h-screen items-center justify-center bg-[var(--bg-main)]">
        <div className="text-[var(--text-secondary)]">Loading auction dashboard...</div>
      </div>
    );
  }

  return (
    <div className="auction-management-theme min-h-screen bg-[var(--bg-main)] p-4 text-[var(--text-primary)]">
      {/* Compact Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {selectedTeam && (
            <>
              <img
                src={selectedTeam.teamLogo}
                alt={selectedTeam.teamName}
                className="h-12 w-12 rounded-lg border-2 border-[var(--border-primary)] object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">
                  {selectedTeam.teamName}
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  {selectedTeam.teamCode} • Auction 
                </p>
              </div>
            </>
          )}
        </div>

        {/* Team Switcher */}
        {teams.length > 1 && (
          <div className="professional-scrollbar flex gap-2 overflow-x-auto">
            {teams.map((team) => (
              <button
                key={team.teamId}
                onClick={() => setSelectedTeam(team)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedTeam?.teamId === team.teamId
                    ? "bg-[var(--secondary)] text-[#102033] shadow-sm"
                    : "border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
                }`}
              >
                {team.teamName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - Player & Bidding */}
        <div className="lg:col-span-8 space-y-4">
          {/* Current Player Card */}
          <div className="overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
            <div className="border-b border-[var(--border-card)] bg-[var(--bg-main)] p-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
                <span className="h-5 w-2 rounded bg-[var(--primary)]"></span>
                Current Player
              </h2>
            </div>
            
            {currentPlayer ? (
              <div className="p-2">
                <div className="flex items-start gap-2">
                  {/* Player Image/Initials */}
                  <div className="relative">
                    {currentPlayer.profilePicture &&
                    currentPlayer.profilePicture !== dummyImage ? (
                      <img
                        src={currentPlayer.profilePicture}
                        alt={currentPlayer.name}
                        className="h-20 w-20 rounded-lg border-2 border-[var(--border-primary)] object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-[var(--border-primary)] bg-[var(--accent-light)] text-2xl font-bold text-[var(--primary)]">
                        {getInitials(currentPlayer.name)}
                      </div>
                    )}
                    
                    {/* Sold/Unsold Badge */}
                    {currentPlayer.status === "sold" && (
                      <div className="absolute -top-2 -right-2 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-md rotate-6">
                        SOLD
                      </div>
                    )}
                    {currentPlayer.status === "unsold" && (
                      <div className="absolute -top-2 -right-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-md rotate-6">
                        UNSOLD
                      </div>
                    )}
                  </div>

                  {/* Player Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <h3 className="truncate text-xl font-bold text-[var(--text-primary)]">
                        {currentPlayer.name}
                      </h3>
                      <span className="rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-1 text-sm text-[var(--primary)]">
                        {currentPlayer.categoryName}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                        <p className="mb-1 text-sm text-[var(--text-secondary)]">Base Price</p>
                        <p className="text-lg font-bold text-emerald-400">
                          ₹{formatMoney(currentPlayer.basePrice)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                        <p className="mb-1 text-sm text-[var(--text-secondary)]">Current Bid</p>
                        <p className="text-lg font-bold text-[var(--primary)]">
                          ₹{formatMoney(currentPlayer.currentBid || currentPlayer.basePrice)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                        <p className="mb-1 text-sm text-[var(--text-secondary)]">Increment</p>
                        <p className="text-lg font-bold text-[var(--primary)]">
                          ₹{formatMoney(currentPlayer.biddingIncrement || BID_STEP)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bidding Actions */}
                {currentPlayer.status === "bidding" && selectedTeam && (
                  <div className="mt-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-2">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-1 flex justify-between">
                        <p className="mb-1 text-xl text-[var(--text-secondary)]">Next Bid Amount</p>
                        <p className="text-xl font-bold text-[var(--text-primary)]">
                          ₹{formatMoney(bidAmount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePlaceBid}
                          disabled={bidding || bidAmount > remainingBudget}
                          className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
                            bidAmount <= remainingBudget && !bidding
                              ? "bg-[var(--secondary)] text-[#102033] hover:bg-[var(--secondary-strong)]"
                              : "cursor-not-allowed bg-[var(--secondary-lighter)] text-[var(--text-secondary)]"
                          }`}
                        >
                          {bidding ? "Placing..." : "Place Bid"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-[var(--text-secondary)]">Waiting for next player...</p>
              </div>
            )}
          </div>

          {/* Bid History & Purchased Players Tabs */}
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
            <div className="border-b border-[var(--border-card)] bg-[var(--bg-main)]">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === "overview" ? "border-b-2 border-[var(--primary)] text-[var(--primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                >
                  Bid History
                </button>
                <button
                  onClick={() => setActiveTab("purchased")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === "purchased" ? "border-b-2 border-[var(--primary)] text-[var(--primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                >
                  Purchased Players ({purchasedPlayers.length})
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {activeTab === "overview" ? (
                <div className="professional-scrollbar max-h-80 space-y-2 overflow-y-auto">
                  {bidHistory.length === 0 ? (
                    <p className="py-8 text-center text-[var(--text-secondary)]">No bids yet</p>
                  ) : (
                    bidHistory.map((bid, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          idx === 0
                            ? "border border-amber-500/30 bg-amber-500/10"
                            : idx % 2 === 0
                            ? "border border-[var(--border-card)] bg-[var(--bg-main)]"
                            : "border border-[var(--border-card)] bg-[var(--bg-card)]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                            idx === 0 ? "bg-amber-500/20" : "bg-[var(--bg-main)]"
                          }`}>
                            <span className={`font-bold ${idx === 0 ? "text-amber-400" : "text-[var(--text-secondary)]"}`}>
                              {idx + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{bid.teamName}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{bid.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[var(--text-primary)]">
                            ₹{formatMoney(bid.amount)}
                          </p>
                          {idx === 0 && (
                            <p className="text-xs text-amber-400 font-semibold">Highest</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {purchasedPlayers.map((player, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3 transition-colors hover:border-[var(--border-primary)]"
                    >
                      <div className="flex items-start gap-2">
                        {player?.player?.profilePicture && player?.player?.profilePicture !== dummyImage ? (
                          <img
                            src={player?.player?.profilePicture}
                            alt={player?.player?.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                            {getInitials(player?.player?.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">{player?.player?.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{player?.player?.categoryName}</p>
                          <p className="mt-1 text-sm font-bold text-emerald-400">
                            ₹{formatMoney(player?.finalPrice || player?.basePrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Team Info & Status */}
        <div className="lg:col-span-4 space-y-4">
          {/* Team Budget Card */}
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
              <span className="h-5 w-2 rounded bg-emerald-500"></span>
              Team Budget
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[var(--text-secondary)]">Remaining Budget</span>
                  <span className={`text-lg font-bold ${
                    remainingBudget > 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    ₹{formatMoney(remainingBudget)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--bg-main)]">
                  <div 
                    className={`h-full rounded-full ${
                      remainingBudget > 0 ? "bg-emerald-500" : "bg-red-500"
                    }`}
                    style={{ 
                      width: `${Math.min(100, (remainingBudget / (selectedTeam?.teamAuctionDetails?.initialBudget || 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                  <p className="text-xs text-[var(--text-secondary)]">Initial</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    ₹{formatMoney(selectedTeam?.teamAuctionDetails?.initialBudget)}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                  <p className="text-xs text-[var(--text-secondary)]">Spent</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    ₹{formatMoney(selectedTeam?.teamAuctionDetails?.purseSpent)}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                  <p className="text-xs text-[var(--text-secondary)]">Squad Size</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {selectedTeam?.teamAuctionDetails?.currentSquadSize} / {selectedTeam?.teamAuctionDetails?.maxPlayers}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                  <p className="text-xs text-[var(--text-secondary)]">Avg. Price</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {selectedTeam?.teamAuctionDetails?.currentSquadSize > 0
                      ? `₹${formatMoney(selectedTeam?.teamAuctionDetails?.purseSpent / selectedTeam?.teamAuctionDetails?.currentSquadSize)}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bidding Status */}
          {selectedTeam && currentPlayer && (
            <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
                <span className="h-5 w-2 rounded bg-amber-500"></span>
                Bidding Status
              </h3>
              
              {teamBiddingData ? (
                <div className="space-y-4">
                  {teamBiddingData.isHighestBidder && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <span className="text-2xl">👑</span>
                        </div>
                        <div>
                          <p className="font-bold text-emerald-300">Highest Bidder!</p>
                          <p className="text-sm text-emerald-300/70">You're in the lead</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {teamBiddingData.isCurrentBidder && !teamBiddingData.isHighestBidder && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="text-2xl">⚡</span>
                        </div>
                        <div>
                          <p className="font-bold text-amber-300">Outbid!</p>
                          <p className="text-sm text-amber-300/70">Increase your bid</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-secondary)]">Your Last Bid</span>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        ₹{formatMoney(teamBiddingData.lastBidAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-secondary)]">Bid Time</span>
                      <span className="font-mono text-sm text-[var(--text-primary)]">
                        {teamBiddingData.lastBidTime}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-main)]">
                    <span className="text-2xl">📋</span>
                  </div>
                  <p className="text-[var(--text-secondary)]">No bids placed yet</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Be the first to bid!</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
              <span className="h-5 w-2 rounded bg-[var(--primary)]"></span>
              Auction Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                <p className="text-xs text-[var(--text-secondary)]">Next Bid</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  ₹{formatMoney(
                    currentPlayer 
                      ? (currentPlayer.currentBid || currentPlayer.basePrice) + 
                        (currentPlayer.biddingIncrement || BID_STEP)
                      : 0
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                <p className="text-xs text-[var(--text-secondary)]">Bids Today</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">{bidHistory.length}</p>
              </div>
              <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                <p className="text-xs text-[var(--text-secondary)]">Active Teams</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {[...new Set(bidHistory.map(b => b.teamId))].length}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                <p className="text-xs text-[var(--text-secondary)]">Status</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {currentPlayer?.status || "Waiting"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingPanel;
