import React from "react";
import bg from "../../../../../assets/PosterBackground/bg-3.jpg";

const formatPrice = (value = 0) => Number(value || 0).toLocaleString();

const AuctionPosterUnsoldLight = ({
  playerName = "Player Name",
  playerImage,
  tournamentName = "Tournament Name",
  basePrice = 0,
  finalPrice = 0,
  logo,
  teamName = "",
  playerRole = "",
  auctionStatus,
  tournamentLogo,
  batchId,
  displayOptions,
}) => {
  const isSold = auctionStatus === "SOLD";
  const showStatus = Boolean(displayOptions?.showAuctionStatus && auctionStatus);
  const showBasePrice = Boolean(displayOptions?.showBasePrice);
  const showFinalPrice = Boolean(displayOptions?.showSoldPrice && isSold);
  const showTeamName = Boolean(displayOptions?.showTeamName && isSold && teamName);
  const showBatchId = Boolean(displayOptions?.showBatchId && batchId);
  const showDetails = showBasePrice || showFinalPrice || showTeamName;
  const tournamentFontSize = tournamentName.length > 38 ? 11 : tournamentName.length > 28 ? 12 : 14;
  const roleFontSize = playerRole.length > 18 ? 10 : playerRole.length > 12 ? 11 : 12;

  const detailCell = (label, value, color, hasDivider = false) => (
    <div
      style={{
        minWidth: 0,
        height: 56,
        flex: 1,
        padding: "4px 12px",
        boxSizing: "border-box",
        borderLeft: hasDivider ? "1px solid #d1d5db" : "none",
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, height: 18, color, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, lineHeight: "18px", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ margin: "2px 0 0", height: 28, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color, fontSize: 14, fontWeight: 700, lineHeight: "28px" }}>
        {value}
      </p>
    </div>
  );

  return (
    <div
      data-poster-root="true"
      className="relative h-[500px] w-[500px] overflow-hidden"
      style={{ boxSizing: "border-box", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: 1.2 }}
    >
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${bg}')` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/0" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-gray-400 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-60 w-60 rounded-full bg-gray-300 blur-3xl" />
      </div>

      <div className="absolute left-0 top-0 flex h-[62px] w-full items-center justify-between bg-[#111d2f]">
        <div className="flex min-w-0 items-center gap-3 px-4 py-2">
          <img src={tournamentLogo} alt="tournament" className="h-10 w-10 shrink-0 object-contain" />
          <p
            className="m-0 w-[330px] truncate font-semibold uppercase text-gray-200"
            style={{ fontSize: tournamentFontSize, lineHeight: "22px" }}
          >
            {tournamentName}
          </p>
        </div>
        <img src={logo} alt="logo" className="mr-2 h-12 w-12 rounded-lg bg-gray-900 object-contain" />
      </div>

      {showStatus && (
        <div
          style={{
            position: "absolute",
            right: 24,
            top: 78,
            minWidth: 86,
            borderRadius: 999,
            background: isSold ? "#16a34a" : auctionStatus === "UNSOLD" ? "#dc2626" : "#2563eb",
            color: "#fff",
            padding: "7px 12px",
            textAlign: "center",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1,
            boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
          }}
        >
          {auctionStatus}
        </div>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="relative">
          <div className="h-44 w-44 overflow-hidden rounded-lg border-[4px] border-blue-500">
            <img src={playerImage} alt="player" className="h-full w-full object-cover" style={{ background: "#fff" }} />
          </div>
          {playerRole && (
            <div
              className="mt-3 rounded-full bg-blue-500 px-5 text-center font-bold uppercase text-white"
              style={{ minWidth: 168, height: 28, fontSize: roleFontSize, lineHeight: "28px", whiteSpace: "nowrap" }}
            >
              {playerRole}
            </div>
          )}
        </div>
        <div className="px-6">
          <h1 className="inline-block px-6 py-1 text-xl font-medium text-white font-bebas">{playerName}</h1>
          {showBatchId && <p className="m-0 text-sm font-medium text-gray-200">Batch ID: {batchId}</p>}
        </div>
      </div>

      {showDetails && (
        <div style={{ position: "absolute", left: 0, bottom: 40, width: 500, height: 76 }}>
          <div style={{ width: 500, height: 76, border: "1px solid #d1d5db", background: "rgba(243,244,246,0.88)", padding: "9px 24px", boxSizing: "border-box", boxShadow: "0 10px 24px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", height: 56, alignItems: "center", justifyContent: "center" }}>
              {showBasePrice && detailCell("Base Price", `\u20B9 ${formatPrice(basePrice)}`, "#1f2937")}
              {showFinalPrice && detailCell("Final Price", `\u20B9 ${formatPrice(finalPrice)}`, "#b91c1c", showBasePrice)}
              {showTeamName && detailCell("Sold To", teamName, "#1f2937", showBasePrice || showFinalPrice)}
            </div>
          </div>
        </div>
      )}

      <p className="absolute bottom-3 m-0 w-full text-center text-[10px] font-bold tracking-[0.3em] text-gray-300">
        POWERED BY CRICKBRO
      </p>
    </div>
  );
};

export default AuctionPosterUnsoldLight;
