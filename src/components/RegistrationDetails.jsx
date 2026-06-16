import React, { useCallback, useEffect, useState } from "react";
import { MapPin, Calendar, Clock, X, Loader2, AlertCircle, Download } from "lucide-react";
import api from "../utils/api";
import logo from "/Crickbro_auction_logo-1.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode"

const RegistrationDetails = ({ auctionId, onClose, playerId }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationLinkCopied, setLocationLinkCopied] = useState(false);
  /** 'not_found' | null */
  const [notFound, setNotFound] = useState(false);
  const [qr, setQr] = useState("");


  const resolvedPlayerId =
    playerId ||
    sessionStorage.getItem("playerId") ||
    localStorage.getItem("playerId");

  const fetchDetails = useCallback(async () => {
    if (!auctionId || !resolvedPlayerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const response = await api.get(
        `/webSiteApi/auction/playerRegistrationDetails/${auctionId}/${resolvedPlayerId}`,
      );
      const data = response?.data?.data ?? response?.data;
      if (data) {
        setDetails(data);
      } else {
        setDetails(null);
        setNotFound(true);
      }
    } catch (err) {
      console.error("Error fetching registration details:", err);
      const status = err?.response?.status;
      if (status === 404) {
        setDetails(null);
        setNotFound(true);
      } else if (status === 401) {
        setError(
          "Please log in again (same account you used to register) to view these details.",
        );
      } else if (status === 403) {
        setError(
          "You can only view your own registration. Check that you are logged in as the correct player.",
        );
      } else {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Could not load registration details",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [auctionId, resolvedPlayerId]);

  // ✅ QR GENERATE
  useEffect(() => {
    if (details?.player?.batchId) {
      QRCode.toDataURL(
        JSON.stringify({
          batchId: details.player.batchId,
          playerId: details.player._id,
        })
      )
        .then(setQr)
        .catch(console.error);
    } else {
      setQr("");
    }
  }, [details]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // 🟢 Proxy image to bypass CORS
  const proxyImage = (url) => {
    if (!url) return "";
    return `https://images.weserv.nl/?url=${url.replace(/^https?:\/\//, "")}`;
  };

  const copyToClipboard = async (text) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setLocationLinkCopied(true);
      window.setTimeout(() => setLocationLinkCopied(false), 1500);
    } catch (copyError) {
      console.error("Copy failed", copyError);
    }
  };

  const downloadPass = async () => {
    const element = document.getElementById("registration-pass");
    if (!element || !details) return;

    await new Promise((resolve) => setTimeout(resolve, 350));

    const clone = element.cloneNode(true);
    clone.removeAttribute("id");
    clone
      .querySelectorAll("button, .registration-pass-action, .hidden")
      .forEach((node) => node.remove());

    const captureWidth = element.offsetWidth || element.scrollWidth;
    Object.assign(clone.style, {
      position: "absolute",
      left: "-10000px",
      top: "0",
      width: `${captureWidth}px`,
      maxWidth: `${captureWidth}px`,
      maxHeight: "none",
      height: "auto",
      overflow: "visible",
      overflowX: "visible",
      overflowY: "visible",
      boxShadow: "none",
      borderRadius: "16px",
    });

    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: clone.scrollWidth,
        height: clone.scrollHeight,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "l" : "p",
        unit: "px",
        format: [canvas.width, canvas.height],
        compress: true,
      });

      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${details?.player?.name || "player"}-Registration-Pass.pdf`);
    } catch (err) {
      console.error("Failed to download registration pass:", err);
    } finally {
      clone.remove();
    }
  };

  const isTrial = details?.session && details?.slot;
  const payStatusNorm = String(details?.paymentDetails?.status || "").toLowerCase();
  const isPaid = payStatusNorm === "completed";
  const registrationComplete = Boolean(details);
  const isFreeRegistration =
    !details?.auction?.playerRegistrationPaid ||
    (Number(details?.auction?.registrationFee || 0) === 0 &&
      Number(details?.auction?.platformFee || 0) === 0);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        id="registration-pass"
        className="relative w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl rounded-2xl overflow-hidden shadow-2xl bg-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="registration-pass-action absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-white/90 rounded-full p-2 shadow-md hover:bg-white"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} color="black" />
        </button>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-gray-600">
            <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-3" />
            <p className="text-sm">Loading your registration…</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-gray-800 font-medium mb-2">{error}</p>
            <button
              type="button"
              onClick={fetchDetails}
              className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && notFound && !error && (
          <div className="p-8 text-center">
            <p className="text-gray-800 font-medium mb-2">
              Registration not found yet
            </p>
            <p className="text-sm text-gray-600 mb-4">
              If you just completed payment, wait a few seconds for confirmation
              (or check your internet) and try again. Your bank SMS will have
              the Razorpay payment ID if you need support.
            </p>
            <button
              type="button"
              onClick={fetchDetails}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              Refresh
            </button>
          </div>
        )}

        {!loading && !error && !notFound && details && (
          <>
            <div className="bg-gray-100 p-5 sm:p-6 rounded-b-3xl border-b border-gray-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 bg-white rounded-3xl p-4 shadow-sm border border-gray-200">
                    {details?.tournament?.logo ? (
                      <img
                        src={proxyImage(details.tournament.logo)}
                        alt="Tournament Logo"
                        crossOrigin="anonymous"
                        className="w-20 h-20 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-slate-200 text-xs text-slate-600 text-center px-2">
                        Tournament Logo
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        Tournament
                      </p>
                      <h2 className="text-xl font-bold text-slate-900">
                        {details?.tournament?.name}
                      </h2>
                      {/* {details?.auction?.auctionName && (
                    <p className="text-sm text-slate-600 mt-1">
                      {details.auction.auctionName}
                    </p>
                  )} */}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white rounded-3xl p-4 shadow-sm border border-gray-200">
                    <img
                      src={logo}
                      alt="CrickBro"
                      className="w-20 h-20 object-contain rounded-xl"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        Powered by
                      </p>
                      <h2 className="text-xl font-bold text-slate-900">
                        CrickBro
                      </h2>
                    </div>
                  </div>
                </div>

                {registrationComplete && (
                  <button
                    type="button"
                    onClick={downloadPass}
                    className="registration-pass-action inline-flex items-center justify-center rounded-full bg-red-600 p-3 text-white shadow-sm transition hover:bg-red-700"
                    aria-label="Download registration pass"
                    title="Download registration pass"
                  >
                    <Download size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="p-2 sm:p-3 space-y-3 sm:space-y-4">
              <div className="grid gap-2 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                    <div className="flex-shrink-0 w-full sm:w-52 h-52 rounded-3xl overflow-hidden bg-slate-100 flex items-center justify-center">
                      {details?.player?.profilePicture ? (
                        <img
                          src={proxyImage(details.player.profilePicture)}
                          alt="Player"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center px-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                          Player image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Player details</p>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight break-words">
                          {details?.player?.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 capitalize">
                          {details?.player?.playerRole || '-'}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {details?.player?.countryCode || ''} {details?.player?.mobile || '-'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Batch ID</p>
                          <p className="mt-1 font-medium text-slate-900">{details?.player?.batchId || '-'}</p>
                          {qr && (
                            <img
                              src={qr}
                              alt="QR Code"
                              className="mx-auto mt-3 w-32 h-32"
                            />
                          )}
                        </div>
                        {/* <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Mobile</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {details?.player?.countryCode || ''} {details?.player?.mobile || '-'}
                      </p>
                    </div> */}
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Location</p>
                          <p className="mt-1 font-medium text-slate-900">
                            {details?.player?.location || details?.player?.city || details?.player?.address || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">Tournament & auction</h3>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Duration</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {formatDate(details?.tournament?.startDate)} - {formatDate(details?.tournament?.endDate)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Venue</p>
                      <p className="mt-2 font-medium text-slate-900">{details?.tournament?.cityTown || '-'}</p>
                    </div>
                    {details?.auction?.auctionStartedAt && (
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Auction date</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {formatDate(details.auction.auctionStartedAt)}
                          {details.auction.auctionEndedAt ? ` - ${formatDate(details.auction.auctionEndedAt)}` : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(details?.session || details?.slot) && (
                <div className="space-y-3">
                  {details?.session && (
                    <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-900">Session details</h3>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Session</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{details.session.name || '-'}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Date</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(details.session.slotDate)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Time</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{details.session.slotStartTime || '--'} - {details.session.slotEndTime || '--'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {details?.slot && (
                    <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-900">Slot details</h3>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Name</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{details.slot.slotName || '-'}</p>
                        </div>
                        <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Description</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{details.slot.description || '-'}</p>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Venue</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{details.slot.location?.venue || '-'}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Place</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{details.slot.location?.city || '-'}, {details.slot.location?.state || '-'}, {details.slot.location?.country || '-'}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-2 sm:col-span-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Address</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{details.slot.location?.address || '-'}{details.slot.location?.pincode ? ` - ${details.slot.location.pincode}` : ''}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-2 sm:col-span-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Map / location link</p>
                              <p className="mt-1 truncate text-sm font-medium text-slate-900">{details.slot.location?.link || '-'}</p>
                            </div>
                            {details.slot.location?.link && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(details.slot.location.link)}
                                className="registration-pass-action shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                              >
                                {locationLinkCopied ? "Copied" : "Copy"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                  Registration completed
                </p>
                <p className="mt-2 text-sm text-emerald-900">
                  Your registration has been received and is complete.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
      {/* <div
        id="pdf-pass"
        style={{
          width: "900px",
          position: "absolute",
          top: "0",
          left: "0",
          fontFamily: "Arial",
          background: "#0b1220",
          color: "white",
          overflow: "hidden",
        }}
      >
     
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-25deg)",
            fontSize: "80px",
            fontWeight: "bold",
            color: "rgba(255,255,255,0.05)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          CRICKBRO AUCTION
        </div>

      
        <div style={{ position: "relative", zIndex: 1 }}>
       
          <div
            style={{
              padding: "20px 30px",
              borderBottom: "2px solid rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>🏏 PLAYER ENTRY PASS</h2>
              <p style={{ margin: 0, opacity: 0.7 }}>
                {details?.tournament?.name}
              </p>
            </div>

            <div
              style={{
                background: "#ff3b3b",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              {details?.auction?.auctionName}
            </div>
          </div>

        
          <div style={{ display: "flex", padding: "30px", gap: "30px" }}>
          
            <div
              style={{
                width: "260px",
                background: "#111827",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h3>{details?.player?.name}</h3>

              <p style={{ opacity: 0.7 }}>{details?.player?.playerRole}</p>

              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  background: "#1f2937",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                <p>Batch ID: {details?.player?.batchId}</p>

                {details?.player?.jerseyNumber && (
                  <p>Jersey No: {details?.player?.jerseyNumber}</p>
                )}

                {details?.player?.jerseyName && (
                  <p>Jersey Name: {details?.player?.jerseyName}</p>
                )}
              </div>

              <div
                style={{
                  marginTop: "15px",
                  background: "#ff3b3b",
                  padding: "8px",
                  textAlign: "center",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                {isTrial ? "TRIAL ENTRY" : "AUCTION ENTRY"}
              </div>
            </div>

         
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  paddingBottom: "10px",
                }}
              >
                DETAILS
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginTop: "20px",
                  fontSize: "14px",
                }}
              >
                <div>
                  <strong>City</strong>
                  <p>{details?.tournament?.cityTown}</p>
                </div>

                <div>
                  <strong>Dates</strong>
                  <p>
                    {formatDate(details?.tournament?.startDate)} -{" "}
                    {formatDate(details?.tournament?.endDate)}
                  </p>
                </div>

                {details?.session && (
                  <>
                    <div>
                      <strong>Trial Date</strong>
                      <p>{formatDate(details?.session?.slotDate)}</p>
                    </div>

                    <div>
                      <strong>Time</strong>
                      <p>
                        {details?.session?.slotStartTime} -{" "}
                        {details?.session?.slotEndTime}
                      </p>
                    </div>
                  </>
                )}

                {details?.slot && (
                  <div>
                    <strong>Venue</strong>
                    <p>{details?.slot?.location?.venue}</p>
                  </div>
                )}

                <div>
                  <strong>Contact</strong>
                  <p>
                    {details?.player?.countryCode}
                    {details?.player?.mobile}
                  </p>
                </div>
              </div>

        
              {details?.slot && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "12px",
                    background: "#1f2937",
                    borderRadius: "8px",
                  }}
                >
                  <strong>Venue Address</strong>
                  <p style={{ marginTop: "5px", fontSize: "13px" }}>
                    {details?.slot?.location?.address},{" "}
                    {details?.slot?.location?.city},{" "}
                    {details?.slot?.location?.state} -{" "}
                    {details?.slot?.location?.pincode}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "12px",
              fontSize: "12px",
              background: "#020617",
              opacity: 0.8,
            }}
          >
            This is a system-generated cricket entry pass • Valid for event
            entry
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default RegistrationDetails;
