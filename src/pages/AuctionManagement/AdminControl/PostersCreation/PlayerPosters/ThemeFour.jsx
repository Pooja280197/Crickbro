import React from "react";

const formatPrice = (value = 0) => Number(value || 0).toLocaleString();
const titleCase = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

const AuctionPosterModern = ({
  playerName = "Player Name",
  playerImage,
  tournamentName = "Premier League",
  basePrice = 0,
  finalPrice = 0,
  tournamentLogo,
  teamLogo,
  teamName = "",
  playerRole = "",
  auctionStatus,
  logo,
  batchId,
  displayOptions,
}) => {
  const playerNameFontSize =
    playerName.length > 34 ? 11 : playerName.length > 26 ? 13 : playerName.length > 20 ? 15 : 22;
  const tournamentFontSize =
    tournamentName.length > 36 ? 14 : tournamentName.length > 26 ? 16 : 18;
  const teamNameFontSize =
    teamName.length > 30 ? 12 : teamName.length > 22 ? 14 : teamName.length > 16 ? 16 : 20;
  const roleText = titleCase(playerRole);
  const isSold = auctionStatus === "SOLD";
  const showStatus = Boolean(displayOptions?.showAuctionStatus && auctionStatus);
  const showBasePrice = Boolean(displayOptions?.showBasePrice);
  const showFinalPrice = Boolean(displayOptions?.showSoldPrice && isSold);
  const showTeamName = Boolean(displayOptions?.showTeamName && isSold && teamName);
  const showBatchId = Boolean(displayOptions?.showBatchId && batchId);

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
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0f172a] to-[#1e293b]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(126,34,206,0.28),transparent_36%),radial-gradient(circle_at_88%_82%,rgba(250,204,21,0.16),transparent_34%)]" />
      <div className="absolute left-0 top-0 h-[78px] w-full bg-black/20" />

      <img
        src={tournamentLogo}
        alt="logo"
        style={{
          position: "absolute",
          left: 22,
          top: 18,
          width: 42,
          height: 42,
          objectFit: "contain",
          borderRadius: 4,
        }}
      />
      <p
        style={{
          position: "absolute",
          left: 76,
          top: 25,
          width: 298,
          margin: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "#facc15",
          fontSize: tournamentFontSize,
          fontWeight: 800,
          lineHeight: "28px",
        }}
      >
        {tournamentName}
      </p>

      <img
        src={logo}
        alt="brand"
        style={{
          position: "absolute",
          right: 26,
          top: 14,
          width: 54,
          height: 42,
          objectFit: "contain",
          borderRadius: 8,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 24,
          top: 118,
          width: 170,
          height: 188,
          border: "3px solid #facc15",
          borderRadius: 16,
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

      {showStatus && (
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 105,
            width: 120,
            height: 34,
            transform: "rotate(-28deg)",
            background: isSold ? "#16a34a" : auctionStatus === "UNSOLD" ? "#dc2626" : "#2563eb",
            color: "#fff",
            fontSize: 14,
            fontWeight: 900,
            lineHeight: "34px",
            textAlign: "center",
            letterSpacing: 0.4,
          }}
        >
          {auctionStatus}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: 214,
          top: 122,
          width: 252,
          height: 188,
        }}
      >
        <h1
          style={{
            margin: 0,
            color: "#fff",
            fontSize: playerNameFontSize,
            fontWeight: 700,
            letterSpacing: 0,
            lineHeight: "34px",
            overflow: "visible",
            textOverflow: "clip",
            whiteSpace: "nowrap",
          }}
        >
          {playerName}
        </h1>

        {showBatchId && (
          <p
            style={{
              margin: "8px 0 0",
              color: "#e5e7eb",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 0,
              lineHeight: "30px",
              overflow: "visible",
              textOverflow: "clip",
              whiteSpace: "nowrap",
            }}
          >
            Batch ID: {batchId}
          </p>
        )}

        {roleText && (
          <div
            style={{
              marginTop: 16,
              width: 260,
              height: 38,
              border: "1px solid rgba(250,204,21,0.55)",
              borderRadius: 999,
              background: "rgba(250,204,21,0.18)",
              color: "#fde047",
              fontSize: roleText.length > 18 ? 13 : 15,
              fontWeight: 800,
              lineHeight: "38px",
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {roleText}
          </div>
        )}

        {showBasePrice && (
          <div
            style={{
              marginTop: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#d1d5db",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 13,
                fontWeight: 800,
                lineHeight: "18px",
              }}
            >
              BASE PRICE
            </p>
            <p
              style={{
                margin: 0,
                color: "#fff",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: 0,
                lineHeight: "34px",
              }}
            >
              {"\u20B9"} {formatPrice(basePrice)}
            </p>
          </div>
        )}
      </div>

      {(showTeamName || showFinalPrice) && (
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 330,
            width: 452,
            height: 92,
            border: "1px solid rgba(34,211,238,0.35)",
            borderRadius: 18,
            background: "rgba(255,255,255,0.1)",
            boxSizing: "border-box",
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: showFinalPrice && showTeamName ? "space-between" : "center",
            gap: 14,
          }}
        >
          {showFinalPrice && (
            <div style={{ minWidth: 0, width: showTeamName ? 160 : "100%", textAlign: showTeamName ? "left" : "center" }}>
              <p
                style={{
                  margin: 0,
                  color: "#4ade80",
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: "18px",
                }}
              >
                FINAL PRICE
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  color: "#4ade80",
                  fontSize: 28,
                  fontWeight: 900,
                  lineHeight: "34px",
                }}
              >
                {"\u20B9"} {formatPrice(finalPrice)}
              </p>
            </div>
          )}

          {showTeamName && (
            <div
              style={{
                minWidth: 0,
                flex: showFinalPrice ? 1 : "0 1 100%",
                display: "flex",
                alignItems: "center",
                justifyContent: showFinalPrice ? "flex-end" : "center",
                gap: 8,
              }}
            >
              {teamLogo && (
                <img
                  src={teamLogo}
                  alt="team"
                  style={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />
              )}
              <p
                style={{
                  margin: 0,
                  color: "#fde047",
                  height: 34,
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: teamNameFontSize,
                  fontWeight: 800,
                  lineHeight: "34px",
                  maxWidth: showFinalPrice ? 210 : 340,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
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

      <p
        style={{
          position: "absolute",
          left: 0,
          bottom: 16,
          width: 500,
          margin: 0,
          color: "#d1d5db",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2,
          lineHeight: "14px",
          textAlign: "center",
        }}
      >
        POWERED BY CRICKBRO
      </p>
    </div>
  );
};

export default AuctionPosterModern;
