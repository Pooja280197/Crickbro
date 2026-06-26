import React, { useRef } from "react";
import bg from "../../../../../assets/PosterBackground/bg-1.jpg";

const textEllipsis = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const formatPrice = (value = 0) => `${Number(value || 0).toLocaleString()}`;

const getTournamentFontSize = (value = "") => {
  const length = String(value || "").length;
  if (length > 40) return 9;
  if (length > 28) return 10;
  return 11;
};

const getNameFontSize = (value = "") => {
  const length = String(value || "").length;
  if (length > 34) return 9;
  if (length > 26) return 10;
  if (length > 18) return 12;
  return 17;
};

const AuctionPoster = ({
  playerName = "Player Name",
  playerImage,
  tournamentName = "Tournament Name",
  basePrice = 0,
  finalPrice = 0,
  logo,
  teamLogo,
  tournamentLogo,
  teamName = "",
  playerRole = "",
  auctionStatus,
  batchId,
  displayOptions,
}) => {
  const posterRef = useRef(null);
  const isSold = auctionStatus === "SOLD";
  const showStatus = Boolean(displayOptions?.showAuctionStatus && auctionStatus);
  const showBasePrice = Boolean(displayOptions?.showBasePrice);
  const showFinalPrice = Boolean(displayOptions?.showSoldPrice && isSold);
  const showTeamName = Boolean(displayOptions?.showTeamName && isSold && teamName);
  const showBatchId = Boolean(displayOptions?.showBatchId && batchId);
  const showPriceRow = showBasePrice || showFinalPrice;
  const showDetailsPanel = showPriceRow || showTeamName;

  return (
    <div className="flex flex-col items-center">
      <div
        data-poster-root="true"
        ref={posterRef}
        className="relative h-[500px] w-[500px] overflow-hidden bg-[#111d2f]"
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          lineHeight: 1.25,
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bg}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-black/0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,215,0,0.25),transparent_70%)]" />

        <div className="pointer-events-none absolute inset-4 rounded-2xl border border-yellow-500/30" />
        <div className="pointer-events-none absolute inset-5 rounded-xl border border-white/10" />
        <div className="absolute left-6 top-6 h-12 w-12 rounded-tl-xl border-l-2 border-t-2 border-yellow-500/60" />
        <div className="absolute right-6 top-6 h-12 w-12 rounded-tr-xl border-r-2 border-t-2 border-yellow-500/60" />
        <div className="absolute bottom-6 left-6 h-12 w-12 rounded-bl-xl border-b-2 border-l-2 border-yellow-500/60" />
        <div className="absolute bottom-6 right-6 h-12 w-12 rounded-br-xl border-b-2 border-r-2 border-yellow-500/60" />

        <div
          className="absolute rounded-lg bg-black/40"
          style={{ left: 24, top: 24, width: 452, height: 56 }}
        >
          <img
            src={tournamentLogo}
            alt="tournament"
            style={{
              position: "absolute",
              left: 16,
              top: 8,
              width: 40,
              height: 40,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 68,
              top: 5,
              width: 300,
              height: 46,
              display: "flex",
              alignItems: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                width: "100%",
                color: "#f3f4f6",
                fontFamily:
                  "Verdana, Arial, Helvetica, sans-serif",
                fontSize: getTournamentFontSize(tournamentName),
                fontWeight: 700,
                letterSpacing: 0.2,
                lineHeight: "26px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {tournamentName}
            </p>
          </div>
          <img
            src={logo}
            alt="crickbro"
            style={{
              position: "absolute",
              right: 12,
              top: 4,
              width: 48,
              height: 48,
              objectFit: "contain",
              borderRadius: 8,
              background: "#111827",
            }}
          />
        </div>

        <div
          className="absolute"
          style={{ left: 154, top: 96, width: 192, height: 192 }}
        >
          <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500" />
          <img
            src={playerImage}
            alt="player"
            style={{
              position: "absolute",
              left: 8,
              top: 8,
              width: 176,
              height: 176,
              objectFit: "cover",
              borderRadius: 8,
              border: "4px solid #facc15",
              background: "#fff",
              zIndex: 2,
            }}
          />
          {playerRole && (
            <div
              style={{
                ...textEllipsis,
                position: "absolute",
                left: 16,
                bottom: -2,
                width: 160,
                zIndex: 3,
                borderRadius: 999,
                background: "#eab308",
                color: "#000",
                padding: "5px 12px",
                textAlign: "center",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.8,
                lineHeight: "18px",
                textTransform: "uppercase",
                boxShadow: "0 8px 18px rgba(0,0,0,0.22)",
              }}
            >
              {playerRole}
            </div>
          )}
        </div>

        {showStatus && (
          <div
            style={{
              position: "absolute",
              right: 42,
              top: 96,
              minWidth: 82,
              borderRadius: 999,
              background: isSold ? "#16a34a" : auctionStatus === "UNSOLD" ? "#dc2626" : "#2563eb",
              color: "#fff",
              padding: "7px 12px",
              textAlign: "center",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1.2,
              lineHeight: "16px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            }}
          >
            {auctionStatus}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: 58,
            top: 292,
            width: 384,
            height: 54,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              width: "100%",
              color: "#111827",
              fontSize: getNameFontSize(playerName),
              fontWeight: 900,
              lineHeight: "28px",
              letterSpacing: 0,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {playerName}
          </h1>
          {showBatchId && (
            <p
              style={{
                margin: "1px 0 0",
                width: "100%",
                color: "#1f2937",
                fontSize: 11,
                fontWeight: 700,
                lineHeight: "20px",
                whiteSpace: "nowrap",
              }}
            >
              {batchId}
            </p>
          )}
        </div>

        {showDetailsPanel && (
          <div
            className="absolute rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-black/60 via-black/80 to-black/60"
            style={{
              left: 60,
              bottom: 28,
              width: 380,
              height: showPriceRow && showTeamName ? 116 : showPriceRow ? 78 : 62,
              padding: showPriceRow ? "12px 24px" : "10px 24px",
              boxSizing: "border-box",
            }}
          >
            {showPriceRow && (
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                justifyContent: "center",
                height: 52,
              }}
            >
              {showBasePrice && (
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#9ca3af",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 1.4,
                      lineHeight: "16px",
                      textTransform: "uppercase",
                    }}
                  >
                    Base Price
                  </p>
                  <p
                    style={{
                      ...textEllipsis,
                      margin: "3px 0 0",
                      width: "100%",
                      color: "#fff",
                      fontSize: 17,
                      fontWeight: 800,
                      lineHeight: "30px",
                    }}
                  >
                    {"\u20B9"} {formatPrice(basePrice)}
                  </p>
                </div>
              )}

              {showBasePrice && showFinalPrice && (
                <div
                  className="bg-gradient-to-b from-transparent via-yellow-500 to-transparent"
                  style={{
                    flex: "0 0 2px",
                    margin: "1px 18px",
                    width: 2,
                    height: 50,
                  }}
                />
              )}

              {showFinalPrice && (
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#facc15",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      lineHeight: "16px",
                      textTransform: "uppercase",
                    }}
                  >
                    Sold
                  </p>
                  <p
                    style={{
                      ...textEllipsis,
                      margin: "1px 0 0",
                      width: "100%",
                      color: "#facc15",
                      fontSize: 19,
                      fontWeight: 900,
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  height: 42,
                  marginTop: showPriceRow ? 8 : 0,
                }}
              >
                {teamLogo && (
                  <img
                    src={teamLogo}
                    alt="team"
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "contain",
                      borderRadius: 8,
                      flex: "0 0 auto",
                    }}
                  />
                )}
                <p
                  style={{
                    margin: 0,
                    maxWidth: 210,
                    height: 40,
                    color: "#facc15",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    lineHeight: "40px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    position: "relative",
                    top: -3,
                  }}
                >
                  {teamName}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-3 w-full text-center">
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 3,
            }}
          >
            POWERED BY CRICKBRO
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuctionPoster;
