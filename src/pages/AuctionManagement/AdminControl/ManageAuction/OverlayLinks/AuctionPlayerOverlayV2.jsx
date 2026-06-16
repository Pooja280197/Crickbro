

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { connectAuctionSocket, disconnectSocket } from "../../../../../utils/SocketClient";
import icon from "../../../../../assets/Images/profile-icon.jpg";
import logo from "/Crickbro_auction_logo.png";
import api from "../../../../../utils/api";

export default function AuctionPlayerOverlayLive() {
  const { auctionId } = useParams();
  const [player, setPlayer] = useState(null);
  const [isBidAnimating, setIsBidAnimating] = useState(false);
  const [tournament, setTournament] = useState(null);

  const DUMMY_IMAGE_URL =
    "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";
  const isDummyImage = (url) => url === DUMMY_IMAGE_URL;

  const COLORS = {
    primaryLight: "#195b58",
    primaryDark: "#151657",
    primaryDarker: "#121252",
    contrast: "#f9a513",
    ivory: "#FFF9EC",
    accent: "#5e62ff",
    neonGreen: "#00ff9d",
  };

  /* ---------------- MONEY FORMAT ---------------- */
  const formatMoney = (amount) => {
    if (!amount || isNaN(amount)) return "0";
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(2)}L`;
    return amount.toLocaleString("en-IN");
  };

  /* ---------------- SOCKET ---------------- */
  const handleSocketData = (data) => {
    const payload = data?.data || data;
    console.log("Socket Data:", payload);
    if (!payload?.currentPlayer) return;

    // Trigger bid animation when bid changes
    if (player?.currentBid !== payload.currentPlayer.currentBid) {
      setIsBidAnimating(true);
      setTimeout(() => setIsBidAnimating(false), 1000);
    }

    setPlayer(payload.currentPlayer);
  };

  useEffect(() => {
    if (!auctionId) return;

    const fetchAuction = async () => {
      try {
        const response = await api.get(`/webSiteApi/auction/getAuctionById/${auctionId}`);
        if (response.data.success) {
          const auctionData = response.data.data;
          setTournament(auctionData.tournamentId || auctionData.tournament);
        }
      } catch (error) {
        console.error('Error fetching auction:', error);
      }
    };

    fetchAuction();

    connectAuctionSocket({
      auctionId,
      onSnapshot: handleSocketData,
      onUpdate: handleSocketData,
      onError: console.error,
    });

    return () => disconnectSocket();
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return;
    connectAuctionSocket({
      auctionId,
      onSnapshot: handleSocketData,
      onUpdate: handleSocketData,
      onError: console.error,
    });
    return () => disconnectSocket();
  }, [auctionId]);

  // if (!player) return null;
  const status = (player?.status || "").toLowerCase();
  const isSold = status === "sold";
  const isUnsold = status === "unsold";

  const isPlaceholder = isDummyImage(player?.profilePicture);

  return (

    <div className="bg-transparent">
      {/* TOURNAMENT LOGO */}
      {tournament?.logo && (
        <div className="absolute top-4 left-6 z-50">
          <img
            className="w-[clamp(60px,6vw,120px)] h-auto"
            src={tournament.logo}
            alt="Tournament Logo"
          />
        </div>
      )}

      {/* TOURNAMENT NAME */}
      {tournament?.name && (
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 z-50 text-4xl font-bold text-white"
          style={{
            textShadow: `
             2px 2px 0 orange,
             -2px 2px 0 orange,
             2px -2px 0 orange,
             -2px -2px 0 orange,
             0px 2px 0 orange,
             2px 0px 0 orange,
             0px -2px 0 orange,
             -2px 0px 0 orange
           `
          }}
        >
          {tournament.name}
        </div>
      )}

      {/* APP LOGO */}
      <div className="absolute top-0 right-6 z-50">
        <img
          className="w-[clamp(100px,10vw,180px)] h-auto"
          src={logo}
          alt="App Logo"
        />
      </div>

      {player ? (
        <div className="fixed bottom-4 w-full flex justify-center px-4 z-50 pointer-events-none">
          <div className="w-full max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={player.playerId}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                {/* PLAYER IMAGE */}
                <div className="absolute -top-20 md:-top-24 left-1/2 -translate-x-1/2 z-20">
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-2 border-[#f9a513]/60 shadow-lg">
                      <img
                        src={isPlaceholder ? icon : player.profilePicture}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* STATUS BADGE */}
                    {isSold && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 text-xs px-2 py-1 rounded-full">
                        SOLD
                      </div>
                    )}
                    {isUnsold && (
                      <div className="absolute -bottom-2 -right-2 bg-red-500 text-xs px-2 py-1 rounded-full">
                        UNSOLD
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD */}
                <div className="bg-[#151657]/95 backdrop-blur-md border border-white/10 rounded-2xl pt-16 pb-2 px-4 shadow-xl">

                  {/* GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center md:text-left">

                    {/* BASE PRICE */}
                    <div className="bg-white/10 rounded-lg p-3 pt-6 text-center md:text-center">
                      <div className="text-md text-white uppercase">
                        Base Price
                      </div>
                      <div className="text-xl font-bold text-[#f9a513]">
                        ₹ {formatMoney(player.basePrice)}
                      </div>
                    </div>

                    {/* PLAYER INFO */}
                    <div className="bg-[#121252]/40 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-white">
                        {player.name}
                      </div>
                      <div className="text-md text-[#f9a513] uppercase">
                        {player.role}
                      </div>
                      {/* <div className="text-md text-[#f9a513] uppercase">
                      {player.categoryName}
                    </div> */}
                      <div className="text-xs text-white/70">
                        {player.batchId}
                      </div>
                    </div>

                    {/* CURRENT BID */}
                    <motion.div
                      className="bg-white/10 rounded-lg p-3 pt-6 text-center md:text-center"
                      style={{
                        boxShadow: isBidAnimating
                          ? "0 0 20px rgba(249,165,19,0.6)"
                          : "none",
                      }}
                    >
                      <div className="text-md text-white uppercase">
                        {isSold ? "Final Price" : "Current Bid"}
                      </div>

                      <motion.div
                        key={player.currentBid}
                        animate={{
                          scale: isBidAnimating ? [1, 1.1, 1] : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        className="text-xl font-bold"
                        style={{
                          color: isSold
                            ? "#00ff9d"
                            : isUnsold
                              ? "#ef4444"
                              : "#f9a513",
                        }}
                      >
                        ₹{" "}
                        {formatMoney(
                          isSold ? player.finalPrice : player.currentBid
                        )}
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* STATUS BAR */}
                  <div className="mt-3 text-center py-2 rounded-lg bg-[#121252]/60 text-sm">
                    {isSold && (
                      <span className="text-green-400">
                        SOLD TO {player.soldToName}
                      </span>
                    )}

                    {isUnsold && (
                      <span className="text-red-400">UNSOLD</span>
                    )}

                    {!isSold && !isUnsold && (
                      <span className="text-white/90">
                        {player.role?.replace(/-/g, " ")}
                        {player.location && ` • ${player.location}`}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-5 w-full text-center text-red-500 z-50">
          Waiting for auction data...
        </div>
      )}
    </div>
  );
}
