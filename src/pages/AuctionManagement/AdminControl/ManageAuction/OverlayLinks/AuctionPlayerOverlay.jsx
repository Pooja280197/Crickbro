
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { connectAuctionSocket, disconnectSocket } from "../../../../../utils/SocketClient";
import icon from "../../../../../assets/Images/profile-icon.jpg";
import logo from "/Crickbro_auction_logo.png";
import api from "../../../../../utils/api";

export default function AuctionOverlayExactLive() {
  const { auctionId } = useParams();

  const [player, setPlayer] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [tournament, setTournament] = useState(null);
  const DUMMY_IMAGE_URL =
    "https://crickbro.s3.ap-south-1.amazonaws.com/uploads/dummyImage.png";
  const isDummyImage = (url) => url === DUMMY_IMAGE_URL;

  const formatMoney = (amount) => {
    if (!amount || isNaN(amount)) return "0";
    return amount.toLocaleString("en-IN");
  };

  const handleSocketData = (data) => {
    const payload = data?.data || data;
    if (!payload?.currentPlayer) return;

    setPlayer(payload.currentPlayer);
    setBidHistory(payload.currentPlayer.bidHistory || []);
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

  // if (!player) return null;

  const status = (player?.status || "").toLowerCase();
  const isSold = status === "sold";
  const isUnsold = status === "unsold";

  const top3Bids = [...bidHistory]
    .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))
    .slice(0, 3);

const isPlaceholder = isDummyImage(player?.profilePicture);

  return (
    <div className="bg-transparent w-full">

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

      {/* MAIN OVERLAY */}
      {player ? (
        <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none px-4 pb-3">

          <div className="w-full  flex items-end gap-4">

            {/* LEFT CARD */}
            <div
              className="flex-1 min-w-[250px] max-w-[35%] p-4 rounded-xl text-center"
              style={{ backgroundColor: "#121252", color: "#FFF9EC" }}
            >
              <div className="font-extrabold uppercase text-[clamp(16px,2vw,28px)]">
                {player.name || "PLAYER"}
              </div>

              <div className="opacity-90 capitalize text-[clamp(12px,1.2vw,16px)]">
                {player.role}
              </div>

              <div className="text-[#f9a513] mt-1 text-[clamp(12px,1.2vw,16px)]">
                Base Price ₹ {formatMoney(player.basePrice)}
              </div>

              <div className="mt-3 text-[clamp(12px,1vw,14px)]">
                {isSold ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 uppercase">
                    SOLD TO {player.soldToName || player.highestBidderName || "TEAM"}
                  </span>
                ) : isUnsold ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-400/40 uppercase">
                    UNSOLD
                  </span>
                ) : null}
              </div>
            </div>

            {/* CENTER PLAYER */}
            <div className="flex flex-col items-center flex-[1.2]">

              {/* IMAGE */}
              <div className="relative">
                <img
                  src={isPlaceholder ? icon : player.profilePicture}
                  alt={player.name}
                  className={`
            w-[clamp(120px,10vw,220px)]
            h-[clamp(120px,10vw,220px)]
            border border-[#f9a513]
            rounded-xl
            ${isPlaceholder ? "object-contain" : "object-cover"}
          `}
                />

                {(isSold || isUnsold) && (
                  <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 px-3 py-1 rounded-full text-[clamp(10px,0.9vw,12px)] font-semibold uppercase tracking-wide shadow-lg"
                    style={{
                      backgroundColor: isSold ? "rgba(16, 185, 129, 0.92)" : "rgba(239, 68, 68, 0.92)",
                      color: "white",
                    }}
                  >
                    {isSold ? "SOLD" : "UNSOLD"}
                  </div>
                )}
              </div>

              <div className="text-[#f9a513] font-semibold mt-2 text-[clamp(10px,1vw,14px)]">
                {player.batchId}
              </div>

              {/* <div className="font-extrabold uppercase text-[#121252] text-[clamp(16px,2vw,26px)]">
              {player.name || "PLAYER"}
            </div>

            <div className="opacity-80 text-[#121252] capitalize text-[clamp(12px,1.2vw,16px)]">
              {player.role}
            </div> */}

              {/* BID */}
              <div className="mt-0 text-xl uppercase  text-white">
                {isSold ? "Final Price" : "Current Bid"}
              </div>
              <div
                className="mt-2 px-6 py-1 font-extrabold rounded text-[clamp(16px,2vw,28px)]"
                style={{ backgroundColor: "#f9a513", color: "#151657" }}
              >
                ₹ {formatMoney(isSold ? player.finalPrice || player.currentBid : player.currentBid)}
              </div>
            </div>

            {/* RIGHT CARD */}
            <div
              className="flex-1 min-w-[250px] max-w-[35%] p-4 rounded-xl"
              style={{ backgroundColor: "#121252", color: "#FFF9EC" }}
            >
              {/* <div className="uppercase opacity-70 mb-1 text-[clamp(10px,1vw,14px)]">
              Top Bids
            </div> */}

              {top3Bids.map((bid, i) => (
                <div
                  key={i}
                  className="flex justify-between font-semibold text-[clamp(14px,1.6vw,20px)]"
                  style={{
                    color:
                      bid.teamId === player.highestBidder
                        ? "#f9a513"
                        : "#FFF9EC",
                  }}
                >
                  <span className="truncate">
                    {bid.teamName ||
                      (player.status === "sold"
                        ? player.highestBidderName
                        : "—")}
                  </span>
                  <span>₹ {formatMoney(bid.bidAmount)}</span>
                </div>
              ))}
            </div>
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
