import React from "react";
import bg from "../../../../../assets/PosterBackground/bg-4.png";

const formatPrice = (value = 0) => Number(value || 0).toLocaleString();
const titleCase = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

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
  const tournamentFontSize =
    tournamentName.length > 38 ? 10 : tournamentName.length > 28 ? 12 : 14;
  const playerNameFontSize =
    playerName.length > 34 ? 12 : playerName.length > 26 ? 14 : playerName.length > 18 ? 18 : 24;
  const teamNameFontSize =
    teamName.length > 28 ? 12 : teamName.length > 20 ? 14 : teamName.length > 14 ? 16 : 18;
  const roleText = titleCase(playerRole);

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
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/20" />

      <div
        style={{
          position: "absolute",
          left: 30,
          top: 16,
          width: 440,
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <img
            src={tournamentLogo}
            alt="tournament"
            style={{
              width: 42,
              height: 42,
              objectFit: "contain",
              borderRadius: 8,
              flexShrink: 0,
            }}
          />
          <p
            style={{
              margin: 0,
              width: 270,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "#2c1742",
          fontSize: tournamentFontSize,
          fontWeight: 900,
          lineHeight: "28px",
              textShadow: "0 1px 2px rgba(0,0,0,0.35)",
            }}
          >
            {tournamentName}
          </p>
        </div>

        {showStatus && (
          <div
            style={{
              width: 92,
              height: 30,
              borderRadius: 999,
              background: isSold
                ? "linear-gradient(135deg, #22c55e, #15803d)"
                : auctionStatus === "UNSOLD"
                  ? "linear-gradient(135deg, #ef4444, #991b1b)"
                  : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 900,
            letterSpacing: 4,
            lineHeight: "32px",
            textAlign: "center",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            }}
          >
            {auctionStatus}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: 160,
          top: 84,
          width: 180,
          height: 174,
          borderRadius: 18,
          overflow: "hidden",
          background: "#fff",
          border: "1px solid rgba(201,168,76,0.45)",
          boxShadow: "0 14px 35px rgba(0,0,0,0.28)",
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
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 44,
            background: "linear-gradient(transparent, rgba(0,0,0,0.5))",
          }}
        />
      </div>

      {roleText && (
        <div
          style={{
            position: "absolute",
            left: 160,
            top: 246,
            width: 180,
            height: 28,
            borderRadius: 999,
            background: "linear-gradient(135deg, #c9a84c, #facc15, #c9a84c)",
            color: "#111827",
            fontSize: roleText.length > 16 ? 10 : 12,
            fontWeight: 900,
            letterSpacing: 3,
            lineHeight: "28px",
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {roleText.toUpperCase()}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: 100,
          top: 284,
          width: 300,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#fff",
            fontSize:
              playerName.length > 34 ? 11 : playerName.length > 26 ? 13 : playerNameFontSize,
            fontWeight: 500,
            lineHeight: "34px",
            letterSpacing: 0,
            textShadow: "0 2px 8px rgba(0,0,0,0.55)",
            whiteSpace: "nowrap",
          }}
        >
          {playerName}
        </h2>
        {showBatchId && (
          <p
            style={{
              margin: "0",
              color: "#f3f4f6",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: "28px",
              whiteSpace: "nowrap",
            }}
          >
            Batch ID: {batchId}
          </p>
        )}
      </div>

      {(showTeamName || showBasePrice || showFinalPrice) && (
        <div
          style={{
            position: "absolute",
            left: 30,
            bottom: 40,
            width: 440,
            height: showTeamName && (showBasePrice || showFinalPrice) ? 112 : 76,
            borderRadius: 14,
            border: "1px solid rgba(201,168,76,0.25)",
            background: "rgba(20,16,30,0.55)",
            boxSizing: "border-box",
            padding: "10px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {showTeamName && (
            <div style={{ display: "flex", width: "100%", minWidth: 0, alignItems: "center", justifyContent: "center", gap: 10 }}>
              {teamLogo && (
                <img src={teamLogo} alt="team" style={{ width: 30, height: 30, flexShrink: 0, objectFit: "contain", borderRadius: 8 }} />
              )}
              <p style={{ margin: 0, maxWidth: teamLogo ? 330 : 380, overflow: "hidden", textOverflow: "ellipsis", color: "#fde047", fontSize: teamNameFontSize, fontWeight: 900, lineHeight: "30px", whiteSpace: "nowrap" }}>
                {teamName}
              </p>
            </div>
          )}

          {(showBasePrice || showFinalPrice) && (
            <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
          {showBasePrice && (
            <div style={{ flex: 1, minWidth: 0, textAlign: showFinalPrice ? "left" : "center" }}>
              <p
                style={{
                  margin: 0,
                  color: "#d1d5db",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                  lineHeight: "20px",
                }}
              >
                BASE PRICE
              </p>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 900,
                  lineHeight: "34px",
                }}
              >
                {"\u20B9"}{formatPrice(basePrice)}
              </p>
            </div>
          )}

          {showFinalPrice && (
            <div style={{ flex: 1, minWidth: 0, borderLeft: showBasePrice ? "1px solid rgba(201,168,76,0.35)" : "none", textAlign: showBasePrice ? "right" : "center" }}>
              <p
                style={{
                  margin: 0,
                  color: "#c9a84c",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                  lineHeight: "20px",
                }}
              >
                FINAL PRICE
              </p>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: 900,
                  lineHeight: "36px",
                }}
              >
                {"\u20B9"}{formatPrice(finalPrice)}
              </p>
            </div>
          )}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 12,
          width: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <img
          src={logo}
          alt="logo"
          style={{ width: 32, height: 24, objectFit: "contain", opacity: 0.8 }}
        />
        <p
          style={{
            margin: 0,
            color: "#fff",
            fontSize: 10,
            fontWeight: 900,
            lineHeight: "18px",
          }}
        >
          POWERED BY CRICKBRO
        </p>
      </div>
    </div>
  );
};

export default AuctionPosterStadium;
