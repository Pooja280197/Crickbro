import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, History } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { connectAuctionSocket, disconnectSocket } from "../../../../../utils/SocketClient";

export default function LiveAuctionForAudience() {
  const [mode, setMode] = useState("video"); // video | full
  const location = useLocation();

  // If a `status` query param is present, drive initial layout from it
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = (params.get("status") || "").toLowerCase();
    if (
      status === "full" ||
      status === "fullscreen" ||
      status === "fullscrien"
    ) {
      setMode("full");
    } else if (status === "player" || status === "playercard") {
      setMode("video");
    }
  }, [location.search]);

  const { auctionId } = useParams();
  const params = new URLSearchParams(location.search);
  const statusParam = (params.get("status") || "").toLowerCase();
  const hideModeSwitch = !!statusParam;

  // socket-driven player and history
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [bidHistoryState, setBidHistoryState] = useState([]);
  const [socketInstance, setSocketInstance] = useState(null);

  // Handler for socket payloads — normalize and update local state
  const handleSocketData = (data) => {
    const payload = data && data.data ? data.data : data;
    if (!payload) return;

    const player = payload.currentPlayer || null;
    if (!player) {
      setCurrentPlayer(null);
      setBidHistoryState([]);
      return;
    }

    setCurrentPlayer(player);

    const bh = Array.isArray(player.bidHistory)
      ? player.bidHistory
      : [];

    const formatBidTime = (val) => {
      if (!val) return "";
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      const day = String(d.getDate()).padStart(2, "0");
      const month = d.toLocaleString("en-IN", { month: "short" });
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      const secs = String(d.getSeconds()).padStart(2, "0");
      return `${day} ${month} ${year}, ${hours}:${mins}:${secs}`;
    };

    const normalized = bh
      .map((b) => ({
        teamName: b.teamName || b.team || "-",
        teamId: b.teamId ?? b.team ?? null,
        amount: Number(b.bidAmount ?? b.amount ?? 0),
        time: formatBidTime(b.bidTime || b.createdAt || b.time),
      }))
      .sort((a, c) => (c.amount ?? 0) - (a.amount ?? 0))
      .slice(0, 10);

    setBidHistoryState(normalized);
  };

  // Connect to socket
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
      onDisconnect: (reason) =>
        console.log("Socket disconnected:", reason),
      onError: (err) => console.error("Socket error:", err),
    });

    setSocketInstance(socket);

    return () => {
      disconnectSocket();
      setSocketInstance(null);
    };
  }, [auctionId]);

  return (
    <div className="w-full h-screen bg-[#071320] text-white relative overflow-hidden">
      {/* MODE SWITCH BUTTONS */}
      {!hideModeSwitch && (
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          <button
            onClick={() => setMode("video")}
            className={`px-3 py-1 rounded-lg text-sm ${
              mode === "video" ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            Video
          </button>
          <button
            onClick={() => setMode("full")}
            className={`px-3 py-1 rounded-lg text-sm ${
              mode === "full" ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            Full
          </button>
        </div>
      )}

      {hideModeSwitch && (
        <div className="absolute top-4 right-4 z-50 px-3 py-1 bg-indigo-700/90 rounded-xl text-sm font-semibold">
          Mode forced: {mode === "full" ? "FULLSCREEN" : mode.toUpperCase()}
        </div>
      )}

      {/* BACKGROUND VIDEO */}
      {mode === "video" && (
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted className="w-full h-full object-cover opacity-60">
            <source src="/sample-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#071320] via-[#071320]/50 to-transparent"></div>
        </div>
      )}

      {/* ================= FULL MODE ================= */}
      {mode === "full" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 h-screen gap-4 p-4 lg:p-6 relative z-10 overflow-y-auto overflow-x-hidden">
          {/* LEFT - PLAYER CARD */}
          <div className="flex items-start justify-center">
            {!currentPlayer ? (
              <div className="text-center mt-10">
                <div className="text-6xl mb-4 opacity-50">⏳</div>
                <p className="text-2xl font-bold text-slate-300">
                  Waiting for player...
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500/50 rounded-3xl p-6 shadow-2xl w-full flex flex-col h-full"
              >
                {/* PLAYER IMAGE */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-400 bg-[#0f1724]">
                      {currentPlayer.profilePicture ? (
                        <img
                          src={currentPlayer.profilePicture}
                          alt={currentPlayer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-12 h-12 opacity-70" />
                        </div>
                      )}
                    </div>

                    {currentPlayer.status === "sold" && (
                      <div className="absolute inset-0 bg-green-600/70 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold -rotate-12">
                          SOLD
                        </span>
                      </div>
                    )}

                    {currentPlayer.status === "unsold" && (
                      <div className="absolute inset-0 bg-red-600/60 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold -rotate-12">
                          UNSOLD
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* PLAYER INFO */}
                <div className="text-center mb-3">
                  <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                    {currentPlayer.name}
                    <Trophy className="text-yellow-400 w-6 h-6" />
                  </h1>
                  <p className="text-slate-400 text-xl">
                    {currentPlayer.role || "Player"}
                  </p>
                  {currentPlayer.batchId && (
                    <p className="text-red-700 text-xl font-semibold mt-1">
                      BatchId: {currentPlayer.batchId}
                    </p>
                  )}
                </div>

                {/* BASE PRICE */}
                <div className="bg-slate-700/50 rounded-xl p-2 border border-slate-600 text-center">
                  <p className="text-xs text-slate-400 mb-1">Base Price</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    ₹{currentPlayer.basePrice?.toLocaleString()}
                  </p>
                </div>

                {/* BID STATUS */}
                {currentPlayer.status === "sold" ? (
                  <div className="space-y-3 mt-4">
                    <div className="bg-gradient-to-r from-emerald-600/30 to-green-600/30 rounded-xl p-4 border-2 border-emerald-400">
                      <p className="text-slate-300 text-xs mb-1">Final Selling Price</p>
                      <p className="text-3xl font-bold text-emerald-300">
                        ₹{(currentPlayer?.currentBid ?? currentPlayer?.basePrice).toLocaleString()}
                      </p>
                    </div>

                    {currentPlayer?.highestBidderName && (
                      <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl p-4 border-2 border-blue-400">
                        <p className="text-slate-300 text-xs mb-2">Sold To</p>
                        <p className="text-xl font-bold text-blue-200">
                          {currentPlayer.highestBidderName}
                        </p>
                      </div>
                    )}
                  </div>
                ) : currentPlayer.status === "unsold" ? (
                  <div className="mt-4 bg-gradient-to-r from-red-600/30 to-pink-600/30 rounded-xl p-4 border-2 border-red-400 text-center">
                    <p className="text-lg font-bold text-red-200">Player Not Sold</p>
                    <p className="text-slate-300 mt-1 text-xs">Unsold in this round</p>
                  </div>
                ) : (
                  <div className="mt-4 bg-gradient-to-r from-sky-600/30 to-cyan-600/30 rounded-xl p-4 border-2 border-sky-400">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-slate-300 text-xs mb-1">Current Bid</p>
                        <p className="text-2xl font-bold text-sky-300">
                          ₹{(currentPlayer?.currentBid ?? currentPlayer?.basePrice).toLocaleString()}
                        </p>
                      </div>

                      {currentPlayer?.highestBidderName && (
                        <div className="text-right">
                          <p className="text-slate-300 text-xs">Highest Bidder</p>
                          <p className="text-xl font-bold text-sky-300">
                            {currentPlayer.highestBidderName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* RIGHT - TOP BIDS */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-amber-300">
              <History />
              Top 4 Bids
            </h2>

            <div className="space-y-3">
              {bidHistoryState.slice(0, 4).map((bid, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    i === 0
                      ? "bg-yellow-500/30 border-yellow-400"
                      : "bg-slate-700/50 border-slate-600"
                  }`}
                >
                  <p className="font-bold">{bid.teamName}</p>
                  <p className="text-xl text-emerald-400">
                    ₹{bid.amount}
                  </p>
                  <p className="text-xs text-slate-400">{bid.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIDEO MODE FOOTER */}
      {mode === "video" && (
        <motion.div
          initial={{ y: 200 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-0 left-0 right-0 p-4 z-50 flex justify-center pointer-events-none"
        >
          {!currentPlayer ? (
            <div className="text-center bg-slate-900/90 backdrop-blur-xl px-8 py-6 rounded-2xl border-2 border-purple-500/40 shadow-2xl pointer-events-auto">
              <div className="text-4xl mb-2 opacity-50">⏳</div>
              <p className="text-lg font-bold text-slate-300">
                Waiting for player...
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-7xl bg-gradient-to-br from-slate-900/98 to-slate-950/98 backdrop-blur-2xl border-3 border-purple-500/60 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative pointer-events-auto"
            >
              {/* 3-COLUMN LAYOUT */}
              <div className="grid grid-cols-3 gap-8 p-6 items-center">

                {/* ================= LEFT - BASE PRICE ================= */}
                <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-2 border-purple-400/50 rounded-2xl p-6 text-center shadow-xl backdrop-blur-sm">
                  <p className="text-purple-300 text-xs font-bold tracking-widest uppercase mb-3">
                    Base Price
                  </p>
                  <p className="text-4xl font-bold text-emerald-400 drop-shadow-lg">
                    ₹{currentPlayer?.basePrice?.toLocaleString() || "-"}
                  </p>
                </div>

                {/* ================= CENTER - PLAYER ================= */}
                <div className="flex flex-col items-center -mt-8">
                  {/* Player Avatar */}
                  <div className={`relative w-40 h-40 rounded-full border-[6px] overflow-hidden shadow-2xl mb-4 transition-all duration-300
                    ${currentPlayer?.status === "sold"
                      ? "border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.6)]"
                      : currentPlayer?.status === "unsold"
                      ? "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)]"
                      : "border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.6)]"
                    } bg-slate-950`}>
                    
                    {currentPlayer?.profilePicture ? (
                      <img
                        src={currentPlayer.profilePicture}
                        className="w-full h-full object-cover"
                        alt={currentPlayer.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <Users className="w-16 h-16 text-purple-300 opacity-70" />
                      </div>
                    )}

                    {/* SOLD/UNSOLD OVERLAY */}
                    {currentPlayer?.status === "sold" && (
                      <div className="absolute inset-0 bg-green-600/80 rounded-full flex items-center justify-center backdrop-blur-md">
                        <span className="text-white font-black text-xl -rotate-12 tracking-wider drop-shadow-lg">SOLD</span>
                      </div>
                    )}
                    {currentPlayer?.status === "unsold" && (
                      <div className="absolute inset-0 bg-red-600/80 rounded-full flex items-center justify-center backdrop-blur-md">
                        <span className="text-white font-black text-xl -rotate-12 tracking-wider drop-shadow-lg">UNSOLD</span>
                      </div>
                    )}
                  </div>

                  {/* Player Name & Details */}
                  <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-2 border-purple-400/50 rounded-2xl px-8 py-5 shadow-2xl backdrop-blur-sm w-full">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-white text-center drop-shadow-lg">
                        {currentPlayer?.name || "-"}
                      </h2>
                      <Trophy className="text-yellow-400 w-7 h-7 drop-shadow-lg" />
                    </div>
                    <p className="text-slate-300 text-xl mt-2 text-center font-medium">
                      {currentPlayer?.role || "Player"}
                    </p>
                    {currentPlayer?.batchId && (
                      <div className="flex justify-center mt-2">
                        <p className="text-red-700 text-xl font-bold text-center bg-purple-950/50 px-3 py-1 rounded-full">
                          BatchId: {currentPlayer.batchId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ================= RIGHT - CURRENT BID ================= */}
                <div className={`bg-gradient-to-br rounded-2xl p-6 text-center shadow-xl border-2 backdrop-blur-sm transition-all duration-300
                  ${currentPlayer?.status === "sold"
                    ? "from-emerald-900/40 to-green-900/40 border-emerald-400/50"
                    : currentPlayer?.status === "unsold"
                    ? "from-red-900/40 to-pink-900/40 border-red-400/50"
                    : "from-sky-900/40 to-cyan-900/40 border-sky-400/50"
                  }`}>
                  <p className={`text-xs font-bold tracking-widest uppercase mb-3
                    ${currentPlayer?.status === "sold"
                      ? "text-emerald-300"
                      : currentPlayer?.status === "unsold"
                      ? "text-red-300"
                      : "text-sky-300"
                    }`}>
                    {currentPlayer?.status === "sold" 
                      ? "Final Price" 
                      : currentPlayer?.status === "unsold"
                      ? "Not Sold"
                      : "Current Bid"
                    }
                  </p>
                  <p className={`text-4xl font-bold drop-shadow-lg
                    ${currentPlayer?.status === "sold"
                      ? "text-emerald-300"
                      : currentPlayer?.status === "unsold"
                      ? "text-red-300"
                      : "text-sky-300"
                    }`}>
                    ₹{(currentPlayer?.currentBid ?? currentPlayer?.basePrice)?.toLocaleString() || "-"}
                  </p>
                  
                  {currentPlayer?.highestBidderName && currentPlayer?.status !== "unsold" && (
                    <div className="mt-4 pt-3 border-t border-white/20">
                      <p className="text-slate-300 text-xs uppercase tracking-wide mb-1">
                        {currentPlayer?.status === "sold" ? "Sold to" : "Leading"}
                      </p>
                      <p className="text-white text-base font-bold drop-shadow">
                        {currentPlayer.highestBidderName}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
