import React from "react";
import bg from "../../../../../assets/PosterBackground/bg-2.jpg";

const ellipsis = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const twoLineText = {
  overflow: "hidden",
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  whiteSpace: "normal",
  wordBreak: "break-word",
};

const formatPrice = (value = 0) => Number(value || 0).toLocaleString();
const titleCase = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
const nowrapText = {
  whiteSpace: "nowrap",
  wordBreak: "normal",
};

const AuctionPosterStadium = ({
  playerName = "Player Name",
  playerImage,
  tournamentName = "Tournament Name",
  basePrice = 0,
  finalPrice = 0,
  logo,
  teamLogo,
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
  const showPrice = showBasePrice || showFinalPrice;
  const showDetails = showPrice || showTeamName;
  const playerNameFontSize =
    playerName.length > 34 ? 11 : playerName.length > 26 ? 13 : playerName.length > 18 ? 16 : 20;
  const tournamentFontSize =
    tournamentName.length > 36 ? 12 : tournamentName.length > 24 ? 13 : 15;
  const teamNameFontSize =
    teamName.length > 26 ? 11 : teamName.length > 18 ? 12 : 14;

  return (
    <div
      data-poster-root="true"
      className="relative h-[500px] w-[500px] overflow-hidden"
      style={{
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        lineHeight: 1.2,
      }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bg}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/0 to-black/0" />
      <div className="absolute left-1/2 top-0 h-[200px] w-[300px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.3),transparent_70%)]" />

      <div
        className="absolute rounded-full px-4 py-2 backdrop-blur-sm"
        style={{ left: 24, top: 8, width: 452, height: 64 }}
      >
        <img
          src={tournamentLogo}
          alt="tournament"
          style={{
            position: "absolute",
            left: 16,
            top: 6,
            width: 48,
            height: 48,
            objectFit: "contain",
            border: "2px solid #eab308",
            borderRadius: 8,
          }}
        />
        <p
          style={{
            ...twoLineText,
            position: "absolute",
            left: 76,
            top: 12,
            width: 330,
            height: 42,
            margin: 0,
            color: "#eab308",
            fontSize: tournamentFontSize,
            fontWeight: 800,
            lineHeight: "20px",
          }}
        >
          {tournamentName}
        </p>
      </div>

      <div
        className="absolute rounded-2xl border border-white/20 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md"
        style={{
          left: 60,
          top: 90,
          width: 380,
          height: showDetails ? 350 : 250,
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 126,
            top: 24,
            width: 128,
            height: 128,
            border: "4px solid #eab308",
            borderRadius: 8,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <img
            src={playerImage}
            alt="player"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {playerRole && (
          <div
            style={{
              ...ellipsis,
              position: "absolute",
              left: 115,
              top: 142,
              width: 150,
              borderRadius: 999,
              background: "#eab308",
              color: "#000",
              padding: "4px 12px",
              textAlign: "center",
              fontSize: 10,
              fontWeight: 800,
              lineHeight: "14px",
            }}
          >
            {titleCase(playerRole)}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: 18,
            top: 168,
            width: 332,
            height: 66,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              ...nowrapText,
              margin: 0,
              color: "#fff",
              fontSize: playerNameFontSize,
              fontWeight: 800,
              letterSpacing: 0,
              lineHeight: "30px",
              textTransform: "uppercase",
            }}
          >
            {playerName}
          </h2>
          {showBatchId && (
            <p
              style={{
                margin: "2px 0 0",
                color: "#e5e7eb",
                fontSize: 13,
                fontWeight: 600,
                lineHeight: "22px",
              }}
            >
              {batchId}
            </p>
          )}
        </div>

        {showDetails && (
          <div
            className="rounded-lg border-l-4 border-r-4 border-yellow-500 bg-black/40"
            style={{
              position: "absolute",
              left: 24,
              bottom: 0,
              width: 332,
              height: showPrice && showTeamName ? 126 : 82,
              padding: "10px 18px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {showPrice && (
              <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
              {showBasePrice && (
              <div style={{ minWidth: 0, flex: 1, textAlign: showFinalPrice ? "left" : "center" }}>
                <p
                  style={{
                    margin: 0,
                    color: "#9ca3af",
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: "15px",
                  }}
                >
                  BASE PRICE
                </p>
                <p
                  style={{
                    ...ellipsis,
                    overflow: "visible",
                    textOverflow: "clip",
                    whiteSpace: "nowrap",
                    margin: "5px 0 0",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: 0,
                    lineHeight: "30px",
                  }}
                >
                  {"\u20B9"} {formatPrice(basePrice)}
                </p>
              </div>
              )}

            {showFinalPrice && (
              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                  textAlign: showBasePrice ? "right" : "center",
                  borderLeft: showBasePrice ? "1px solid rgba(234,179,8,0.45)" : "none",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#facc15",
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: "15px",
                  }}
                >
                  SOLD
                </p>
                <p
                  style={{
                    ...ellipsis,
                    overflow: "visible",
                    textOverflow: "clip",
                    whiteSpace: "nowrap",
                    margin: "5px 0 0",
                    color: "#facc15",
                    fontSize: 19,
                    fontWeight: 900,
                    letterSpacing: 0,
                    lineHeight: "32px",
                  }}
                >
                  {"\u20B9"} {formatPrice(finalPrice)}
                </p>
              </div>
            )}
              </div>
            )}

            {showTeamName && (
              <div style={{ display: "flex", width: "100%", minWidth: 0, alignItems: "center", justifyContent: "center", gap: 9 }}>
                {teamLogo && (
                  <img
                    src={teamLogo}
                    alt="team"
                    style={{ width: 30, height: 30, flexShrink: 0, objectFit: "contain", borderRadius: 8 }}
                  />
                )}
                <p
                  style={{
                    ...ellipsis,
                    margin: 0,
                    maxWidth: teamLogo ? 230 : 280,
                    height: 30,
                    color: "#fef08a",
                    fontSize: teamNameFontSize,
                    lineHeight: "30px",
                    fontWeight: 700,
                    position: "relative",
                    top: -2,
                  }}
                >
                  {teamName}
                </p>
              </div>
            )}
          </div>
        )}

        {showStatus && (
          <div
            style={{
              position: "absolute",
              right: 16,
              top: 16,
              borderRadius: 6,
              background: isSold ? "#16a34a" : auctionStatus === "UNSOLD" ? "#dc2626" : "#2563eb",
              color: "#fff",
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 800,
              lineHeight: "16px",
            }}
          >
            {auctionStatus}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 12,
          width: 500,
          textAlign: "center",
        }}
      >
        <img
          src={logo}
          alt="logo"
          style={{
            width: 48,
            height: 48,
            objectFit: "contain",
            borderRadius: 8,
            border: "1px solid #fff",
            background: "#111827",
            margin: "0 auto 4px",
            display: "block",
          }}
        />
        <p
          style={{
            margin: 0,
            color: "#e5e7eb",
            fontSize: 8,
            letterSpacing: 1.2,
            lineHeight: "11px",
          }}
        >
          POWERED BY CRICKBRO
        </p>
      </div>
    </div>
  );
};

export default AuctionPosterStadium;
