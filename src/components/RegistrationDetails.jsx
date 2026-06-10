import React, { useCallback, useEffect, useState, useRef } from "react";
import { MapPin, Calendar, Clock, X, Loader2, AlertCircle, Download } from "lucide-react";
import JsBarcode from "jsbarcode";
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
  const barcodeRef = useRef(null);
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
    }
  }, [details]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Generate barcode for batch ID
  useEffect(() => {
    if (barcodeRef.current && details?.player?.batchId) {
      try {
        JsBarcode(barcodeRef.current, details.player.batchId, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
        });
      } catch (err) {
        console.error("Error generating barcode:", err);
      }
    }
  }, [details?.player?.batchId]);

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

    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      ignoreElements: (el) =>
        el.tagName === "BUTTON" || el.closest(".hidden"),
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let remainingHeight = imgHeight;
    let position = margin;

    pdf.addImage(imgData, "JPEG", margin, position, usableWidth, imgHeight);
    remainingHeight -= pageHeight - margin * 2;

    while (remainingHeight > 0) {
      position = remainingHeight - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", margin, position, usableWidth, imgHeight);
      remainingHeight -= pageHeight - margin * 2;
    }

    pdf.save(`${details?.player?.name || "player"}-Registration-Pass.pdf`);
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
        className="relative w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl rounded-2xl overflow-hidden shadow-2xl bg-[var(--bg-card)] text-[var(--text-primary)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] p-2 text-[var(--text-primary)] shadow-md hover:bg-[var(--accent-light)]"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-[var(--text-secondary)]">
            <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-3" />
            <p className="text-sm">Loading your registration…</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-[var(--text-primary)] font-medium mb-2">{error}</p>
            <button
              type="button"
              onClick={fetchDetails}
              className="mt-4 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)]"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && notFound && !error && (
          <div className="p-8 text-center">
            <p className="text-[var(--text-primary)] font-medium mb-2">
              Registration not found yet
            </p>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              If you just completed payment, wait a few seconds for confirmation
              (or check your internet) and try again. Your bank SMS will have
              the Razorpay payment ID if you need support.
            </p>
            <button
              type="button"
              onClick={fetchDetails}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)]"
            >
              Refresh
            </button>
          </div>
        )}

        {!loading && !error && !notFound && details && (
          <>
            <div className="rounded-b-3xl border-b border-[var(--border-card)] bg-[var(--bg-main)] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-sm">
                    {details?.tournament?.logo ? (
                      <img
                        src={proxyImage(details.tournament.logo)}
                        alt="Tournament Logo"
                        crossOrigin="anonymous"
                        className="w-20 h-20 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-[var(--bg-main)] text-xs text-[var(--text-secondary)] text-center px-2">
                        Tournament Logo
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">
                        Tournament
                      </p>
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        {details?.tournament?.name}
                      </h2>
                      {/* {details?.auction?.auctionName && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {details.auction.auctionName}
                    </p>
                  )} */}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-sm">
                    <img
                      src={logo}
                      alt="CrickBro"
                      className="w-20 h-20 object-contain rounded-xl"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">
                        Powered by
                      </p>
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        CrickBro
                      </h2>
                    </div>
                  </div>
                </div>

                {registrationComplete && (
                  <button
                    type="button"
                    onClick={downloadPass}
                    className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] p-3 text-white shadow-sm transition hover:bg-[var(--primary-dark)]"
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
                <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                    <div className="flex-shrink-0 w-full sm:w-52 h-52 rounded-3xl overflow-hidden bg-[var(--bg-main)] flex items-center justify-center">
                      {details?.player?.profilePicture ? (
                        <img
                          src={proxyImage(details.player.profilePicture)}
                          alt="Player"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center px-4 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-secondary)]">
                          Player image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Player details</p>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight break-words">
                          {details?.player?.name}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--text-secondary)] capitalize">
                          {details?.player?.playerRole || '-'}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {details?.player?.countryCode || ''} {details?.player?.mobile || '-'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="rounded-2xl bg-[var(--bg-main)] p-3">
                          <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Batch ID</p>
                          <p className="mt-1 font-medium text-[var(--text-primary)]">{details?.player?.batchId || '-'}</p>
                          {qr && (
                            <img
                              src={qr}
                              alt="QR Code"
                              className="mx-auto mt-3 w-32 h-32"
                            />
                          )}
                        </div>
                        {/* <div className="rounded-2xl bg-[var(--bg-main)] p-3">
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Mobile</p>
                      <p className="mt-1 font-medium text-[var(--text-primary)]">
                        {details?.player?.countryCode || ''} {details?.player?.mobile || '-'}
                      </p>
                    </div> */}
                        <div className="rounded-2xl bg-[var(--bg-main)] p-3">
                          <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Location</p>
                          <p className="mt-1 font-medium text-[var(--text-primary)]">
                            {details?.player?.location || details?.player?.city || details?.player?.address || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-sm">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Tournament & auction</h3>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--text-secondary)]">
                    <div className="rounded-2xl bg-[var(--bg-main)] p-3">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">Duration</p>
                      <p className="mt-1 font-medium text-[var(--text-primary)]">
                        {formatDate(details?.tournament?.startDate)} - {formatDate(details?.tournament?.endDate)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[var(--bg-main)] p-3">
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Venue</p>
                      <p className="mt-2 font-medium text-[var(--text-primary)]">{details?.tournament?.cityTown || '-'}</p>
                    </div>
                    {details?.auction?.auctionStartedAt && (
                      <div className="rounded-2xl bg-[var(--bg-main)] p-3">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">Auction date</p>
                        <p className="mt-1 font-medium text-[var(--text-primary)]">
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
                    <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-sm">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">Session details</h3>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-2xl bg-[var(--bg-main)] p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">Session</p>
                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{details.session.name || '-'}</p>
                        </div>
                        <div className="rounded-2xl bg-[var(--bg-main)] p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">Date</p>
                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{formatDate(details.session.slotDate)}</p>
                        </div>
                        <div className="rounded-2xl bg-[var(--bg-main)] p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">Time</p>
                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{details.session.slotStartTime || '--'} - {details.session.slotEndTime || '--'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {details?.slot && (
                    <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-sm">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">Slot details</h3>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-2xl bg-[var(--bg-main)] p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">Name</p>
                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{details.slot.slotName || '-'}</p>
                        </div>
                        <div className="sm:col-span-2 rounded-2xl bg-[var(--bg-main)] p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">Description</p>
                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{details.slot.description || '-'}</p>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-2xl bg-[var(--bg-main)] p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">Venue</p>
                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{details.slot.location?.venue || '-'}</p>
                        </div>
                        <div className="rounded-2xl bg-[var(--bg-main)] p-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">Place</p>
                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{details.slot.location?.city || '-'}, {details.slot.location?.state || '-'}, {details.slot.location?.country || '-'}</p>
                        </div>
                        <div className="rounded-2xl bg-[var(--bg-main)] p-2 sm:col-span-2">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">Address</p>
                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{details.slot.location?.address || '-'}{details.slot.location?.pincode ? ` - ${details.slot.location.pincode}` : ''}</p>
                        </div>
                        <div className="rounded-2xl bg-[var(--bg-main)] p-2 sm:col-span-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">Map / location link</p>
                              <p className="mt-1 truncate text-sm font-medium text-[var(--text-primary)]">{details.slot.location?.link || '-'}</p>
                            </div>
                            {details.slot.location?.link && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(details.slot.location.link)}
                                className="shrink-0 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] shadow-sm transition hover:bg-[var(--accent-light)]"
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
    </div>
  );
};

export default RegistrationDetails;
