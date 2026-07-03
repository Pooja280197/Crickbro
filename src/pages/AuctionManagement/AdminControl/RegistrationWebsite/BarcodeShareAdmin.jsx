import React, { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { Download, QrCode, Copy, Check, Link2 } from "lucide-react";
import crickbroLogo from "../../../../assets/Images/Logo.jpg";

const BarcodeShareAdmin = ({
    tournamentId,
    auctionId,
    tournamentName,
    city,
}) => {
    const templateRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [pageUrl, setPageUrl] = useState("");
    const [qrImageSrc, setQrImageSrc] = useState("");
    const [qrReady, setQrReady] = useState(false);
    const safeTournamentName = tournamentName || "Tournament Registration";

    // 🔗 Generate URL
    useEffect(() => {
        const url = `${window.location.origin}/landing-page/${tournamentId}/${auctionId}`;
        setPageUrl(url);
    }, [tournamentId, auctionId]);

    // 🔳 Generate QR locally to avoid API/CORS failures during download
    useEffect(() => {
        const loadQr = async () => {
            if (!pageUrl) {
                setQrImageSrc("");
                setQrReady(false);
                return;
            }

            try {
                setQrReady(false);
                const dataUrl = await QRCode.toDataURL(pageUrl, {
                    width: 500,
                    margin: 1,
                    errorCorrectionLevel: "H",
                });
                console.log("QR dataUrl ready, length:", dataUrl.length);
                setQrImageSrc(dataUrl);
                setQrReady(true);
            } catch (err) {
                console.error("QR Error", err);
                setQrImageSrc("");
                setQrReady(false);
            }
        };

        loadQr();
    }, [pageUrl]);

    // � Direct Canvas Creation (bypasses html2canvas issues)
    const generateCanvasImage = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 900;
        canvas.height = 1000;

        const drawRoundedRect = (x, y, w, h, r) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        };

        // Outer background
        const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGrad.addColorStop(0, "#001a36");
        bgGrad.addColorStop(0.55, "#03264c");
        bgGrad.addColorStop(1, "#001020");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const glowOne = ctx.createRadialGradient(130, 120, 10, 130, 120, 360);
        glowOne.addColorStop(0, "rgba(0, 194, 255, 0.28)");
        glowOne.addColorStop(1, "rgba(0, 194, 255, 0)");
        ctx.fillStyle = glowOne;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const glowTwo = ctx.createRadialGradient(780, 830, 10, 780, 830, 340);
        glowTwo.addColorStop(0, "rgba(255, 193, 7, 0.22)");
        glowTwo.addColorStop(1, "rgba(255, 193, 7, 0)");
        ctx.fillStyle = glowTwo;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Main card
        const cardX = 40;
        const cardY = 40;
        const cardW = canvas.width - 80;
        const cardH = canvas.height - 80;
        drawRoundedRect(cardX, cardY, cardW, cardH, 28);
        ctx.fillStyle = "rgba(2, 23, 48, 0.92)";
        ctx.fill();
        ctx.strokeStyle = "#075985";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Header strip
        const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + 140);
        headerGrad.addColorStop(0, "#06345f");
        headerGrad.addColorStop(0.55, "#042847");
        headerGrad.addColorStop(1, "#061a2f");
        drawRoundedRect(cardX, cardY, cardW, 140, 28);
        ctx.fillStyle = headerGrad;
        ctx.fill();

        ctx.fillStyle = "#ffc107";
        drawRoundedRect(cardX + 38, cardY + 34, 150, 32, 16);
        ctx.fill();
        ctx.fillStyle = "#07182b";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.fillText("REGISTRATION", cardX + 113, cardY + 55);

        // Fit tournament title in a single line inside header
        const titleText = safeTournamentName;
        let titleSize = 34;
        ctx.textAlign = "center";
        while (titleSize > 18) {
            ctx.font = `bold ${titleSize}px Arial`;
            if (ctx.measureText(titleText).width <= cardW - 240) {
                break;
            }
            titleSize -= 1;
        }
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(titleText, canvas.width / 2 + 55, cardY + 84);

        // Lightweight accent line
        ctx.strokeStyle = "#0ea5e9";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cardX + 38, cardY + 122);
        ctx.lineTo(cardX + cardW - 38, cardY + 122);
        ctx.stroke();

        let crickbroImg = null;
        try {
            crickbroImg = new Image();
            crickbroImg.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
                crickbroImg.onload = resolve;
                crickbroImg.onerror = reject;
                crickbroImg.src = crickbroLogo;
            });
        } catch (err) {
            console.error("Could not draw crickbro logo:", err);
        }

        // QR panel
        const qrPanelX = cardX + 36;
        const qrPanelY = cardY + 220;
        const qrPanelW = cardW - 72;
        const qrPanelH = 450;
        drawRoundedRect(qrPanelX, qrPanelY, qrPanelW, qrPanelH, 22);
        ctx.fillStyle = "rgba(4, 40, 71, 0.92)";
        ctx.fill();
        ctx.strokeStyle = "#0e7490";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#ffc107";
        ctx.font = "bold 21px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Scan QR Code", canvas.width / 2, qrPanelY + 34);

        const qrFrameSize = 320;
        const qrFrameX = canvas.width / 2 - qrFrameSize / 2;
        const qrFrameY = qrPanelY + 40;
        drawRoundedRect(qrFrameX, qrFrameY, qrFrameSize, qrFrameSize, 20);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#ffc107";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw QR Code
        if (qrImageSrc) {
            try {
                const qrImg = new Image();
                await new Promise((resolve, reject) => {
                    qrImg.onload = resolve;
                    qrImg.onerror = reject;
                    qrImg.src = qrImageSrc;
                });
                const qrSize = 250;
                ctx.drawImage(
                    qrImg,
                    canvas.width / 2 - qrSize / 2,
                    qrFrameY + (qrFrameSize - qrSize) / 2,
                    qrSize,
                    qrSize
                );
            } catch (err) {
                console.error("Could not draw QR code:", err);
                ctx.fillStyle = "#d1d5db";
                drawRoundedRect(canvas.width / 2 - 90, qrFrameY + 70, 180, 180, 10);
                ctx.fill();
                ctx.fillStyle = "#6b7280";
                ctx.font = "14px Arial";
                ctx.textAlign = "center";
                ctx.fillText("QR Failed", canvas.width / 2, qrFrameY + 165);
            }
        }

        // QR text and url
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 23px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Scan to Join Auction", canvas.width / 2, qrPanelY + 408);

        ctx.fillStyle = "#9fb3c8";
        ctx.font = "13px Arial";
        ctx.fillText(pageUrl, canvas.width / 2, qrPanelY + 438);

        // Bottom footer with icon visible below
        const footerY = cardY + cardH - 180;
        ctx.fillStyle = "#ffc107";
        ctx.font = "12px Arial";
        ctx.fillText("Powered by", canvas.width / 2, footerY + 6);

        if (crickbroImg) {
            ctx.drawImage(crickbroImg, canvas.width / 2 - 85, footerY + 12, 170, 100);
        }

        ctx.fillStyle = "#9fb3c8";
        ctx.font = "11px Arial";
        ctx.fillText("Crickbro Auction", canvas.width / 2, footerY + 132);

        return canvas;
    };

    // 🖼 Image Download
    const downloadImage = async () => {
        if (!qrReady) {
            alert("QR is still loading. Please try again in a moment.");
            return;
        }

        setDownloading(true);
        try {
            const canvas = await generateCanvasImage();
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `${safeTournamentName}-barcode.png`;
            link.click();
            console.log("Image downloaded successfully");
        } catch (err) {
            console.error("Image download failed:", err);
            alert("Image download failed: " + err.message);
        } finally {
            setDownloading(false);
        }
    };

    // 📄 PDF Download
    const downloadPDF = async () => {
        if (!qrReady) {
            alert("QR is still loading. Please try again in a moment.");
            return;
        }

        setDownloading(true);
        try {
            const canvas = await generateCanvasImage();
            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = 210;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${safeTournamentName}-barcode.pdf`);
            console.log("PDF downloaded successfully");
        } catch (err) {
            console.error("PDF download failed:", err);
            alert("PDF download failed: " + err.message);
        } finally {
            setDownloading(false);
        }
    };

    // 📋 Copy
    const copyLink = () => {
        navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const actionButtonClass =
        "group flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-xs font-extrabold text-[var(--text-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

    return (
        <div className="barcode-share-root relative z-60 w-full overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-yellow-400/10 blur-3xl" />
            {/* TEMPLATE */}
            <div
                ref={templateRef}
                className="barcode-share-template relative overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-main)] shadow-lg"
            >
                {/* 🔥 TOP */}
                <div className="barcode-share-header relative overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-r from-[#05264a] via-[#06345f] to-[#041a33] px-4 py-4 text-white">
                    <div className="barcode-share-header-glow absolute right-3 top-3 h-16 w-16 rounded-full bg-cyan-300/10 blur-2xl" />
                    <div className="flex items-center gap-3">
                        <div className="barcode-share-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
                            <QrCode size={22} className="!text-[#ffc107]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] !text-[#ffc107]">
                                Registration QR
                            </p>
                            <h2 className="barcode-share-title mt-1 truncate text-base font-extrabold leading-tight !text-white">
                                {safeTournamentName}
                            </h2>
                            {city && (
                                <p className="barcode-share-city mt-0.5 truncate text-[11px] font-semibold !text-slate-300">
                                    {city}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="barcode-share-body bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_34%),linear-gradient(135deg,var(--bg-card),var(--bg-main))] p-4">

                    {/* QR CARD */}
                    <div className="barcode-share-qr-card relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-white/[0.03] p-4 text-center shadow-inner">
                        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />

                        {/* QR */}
                        <div className="inline-block rounded-2xl border border-[var(--secondary)]/50 bg-white p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                            {qrImageSrc ? (
                                <img
                                    src={qrImageSrc}
                                    crossOrigin="anonymous"
                                    alt="QR"
                                    className="h-28 w-28 rounded-xl object-contain"
                                />
                            ) : (
                                <div className="flex h-28 w-28 animate-pulse items-center justify-center rounded-xl bg-[var(--secondary-lighter)] text-xs text-[var(--text-muted)]">
                                    Loading QR...
                                </div>
                            )}
                        </div>

                        {/* TEXT */}
                        <p className="mt-3 text-sm font-extrabold text-[var(--text-primary)]">
                            Scan to Join Auction
                        </p>

                        <div className="mt-2 flex items-start gap-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-left">
                            <Link2 size={13} className="mt-0.5 shrink-0 text-[var(--secondary)]" />
                            <p className="break-all text-[10px] font-semibold leading-relaxed text-[var(--text-secondary)]">
                                {pageUrl}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* BUTTONS */}
            <div className="relative mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                    onClick={downloadImage}
                    disabled={downloading || !qrReady}
                    className={actionButtonClass}
                >
                    <Download size={16} />
                    Download Image
                </button>

                <button
                    onClick={downloadPDF}
                    disabled={downloading || !qrReady}
                    className={actionButtonClass}
                >
                    <Download size={16} />
                    Download PDF
                </button>

                <button
                    onClick={copyLink}
                    className={`${actionButtonClass} ${
                        copied
                            ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300"
                            : ""
                    }`}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied!" : "Copy Link"}
                </button>
            </div>

            {downloading && (
                <p className="relative mt-2 text-center text-[11px] font-semibold text-[var(--secondary)]">
                    Processing download...
                </p>
            )}

            <style>{`
                [data-theme="light"] .barcode-share-root {
                    background: linear-gradient(135deg, #ffffff, #eef7ff) !important;
                    border-color: rgba(14, 165, 233, 0.24) !important;
                }
                [data-theme="light"] .barcode-share-template {
                    background: #ffffff !important;
                    border-color: rgba(14, 165, 233, 0.26) !important;
                }
                [data-theme="light"] .barcode-share-header {
                    background: linear-gradient(135deg, #ffffff 0%, #edf7ff 52%, #fff8df 100%) !important;
                    border-color: rgba(14, 165, 233, 0.22) !important;
                    color: #07182b !important;
                }
                [data-theme="light"] .barcode-share-header-glow {
                    background: rgba(255, 193, 7, 0.18) !important;
                }
                [data-theme="light"] .barcode-share-icon {
                    background: rgba(255, 193, 7, 0.16) !important;
                    border-color: rgba(255, 193, 7, 0.5) !important;
                }
                [data-theme="light"] .barcode-share-title {
                    color: #07182b !important;
                }
                [data-theme="light"] .barcode-share-city {
                    color: #405a78 !important;
                }
                [data-theme="light"] .barcode-share-body {
                    background: radial-gradient(circle at top right, rgba(14, 165, 233, 0.12), transparent 34%),
                        linear-gradient(135deg, #ffffff, #f3f8ff) !important;
                }
                [data-theme="light"] .barcode-share-qr-card {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(238, 247, 255, 0.92)) !important;
                    border-color: rgba(14, 165, 233, 0.24) !important;
                }
            `}</style>
        </div>
    );
};

export default BarcodeShareAdmin;
