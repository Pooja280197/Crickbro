import React, { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { Download, QrCode, Copy, Check } from "lucide-react";
import crickbroLogo from "../../../../../assets/Images/Logo.jpg";

const EntryBarcode = ({
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

    // 🔗 Generate URL
    useEffect(() => {
        const url = `${window.location.origin}/entry-pass/${auctionId}`;
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
                    width: 800,  // Increased for better quality
                    margin: 2,   // Increased margin for better scanning
                    color: {
                        dark: "#000000",
                        light: "#FFFFFF"
                    },
                    errorCorrectionLevel: "H",  // Highest error correction
                    type: "image/png",
                    quality: 0.95,
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
        ctx.fillStyle = "#f5f8fc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Main card
        const cardX = 40;
        const cardY = 40;
        const cardW = canvas.width - 80;
        const cardH = canvas.height - 80;
        drawRoundedRect(cardX, cardY, cardW, cardH, 28);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#d8e2ef";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Header strip
        drawRoundedRect(cardX, cardY, cardW, 140, 28);
        ctx.fillStyle = "#102033";
        ctx.fill();

        // Fit tournament title in a single line inside header
        const titleText = tournamentName || "Tournament";
        let titleSize = 34;
        ctx.textAlign = "center";
        while (titleSize > 18) {
            ctx.font = `bold ${titleSize}px Arial`;
            if (ctx.measureText(titleText).width <= cardW - 120) {
                break;
            }
            titleSize -= 1;
        }
        ctx.fillStyle = "#f4b400";
        ctx.fillText(titleText, canvas.width / 2, cardY + 84);

        // Lightweight accent line
        ctx.strokeStyle = "#f4b400";
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
        ctx.fillStyle = "#f8fbff";
        ctx.fill();
        ctx.strokeStyle = "#d8e2ef";
        ctx.lineWidth = 2;
        ctx.stroke();

        const qrFrameSize = 320;
        const qrFrameX = canvas.width / 2 - qrFrameSize / 2;
        const qrFrameY = qrPanelY + 40;
        drawRoundedRect(qrFrameX, qrFrameY, qrFrameSize, qrFrameSize, 20);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw QR Code - use full frame size for maximum quality
        if (qrImageSrc) {
            try {
                const qrImg = new Image();
                qrImg.crossOrigin = "anonymous";
                await new Promise((resolve, reject) => {
                    qrImg.onload = resolve;
                    qrImg.onerror = reject;
                    qrImg.src = qrImageSrc;
                });
                // Draw QR at full frame size for better scanning
                const qrSize = qrFrameSize - 4;  // Slight padding from frame
                ctx.drawImage(
                    qrImg,
                    qrFrameX + 2,
                    qrFrameY + 2,
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
        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 23px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Scan to Join Auction", canvas.width / 2, qrPanelY + 408);

        ctx.fillStyle = "#6b7280";
        ctx.font = "13px Arial";
        ctx.fillText(pageUrl, canvas.width / 2, qrPanelY + 438);

        // Bottom footer with icon visible below
        const footerY = cardY + cardH - 180;
        ctx.fillStyle = "#1769e0";
        ctx.font = "12px Arial";
        ctx.fillText("Powered by", canvas.width / 2, footerY + 6);

        if (crickbroImg) {
            ctx.drawImage(crickbroImg, canvas.width / 2 - 85, footerY + 12, 170, 100);
        }

        ctx.fillStyle = "#9ca3af";
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
            link.download = `${tournamentName || "tournament"}-barcode.png`;
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
            pdf.save(`${tournamentName || "tournament"}-barcode.pdf`);
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

    return (
        <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* TEMPLATE */}
            <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
                <div className="border-b border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                            <QrCode className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                Entry Barcode
                            </h3>
                            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                                Share this QR with players and visitors for entry pass access.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div
                        ref={templateRef}
                        className="mx-auto max-w-sm overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-sm"
                    >
                        <div className="bg-[#102033] px-4 py-4 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--secondary)]">
                                Official Entry Pass
                            </p>
                            <h2 className="mt-1 truncate text-base font-semibold text-white">
                                {tournamentName || "Tournament"}
                            </h2>
                            {city && (
                                <p className="mt-1 truncate text-xs text-white/70">
                                    {city}
                                </p>
                            )}
                        </div>

                        <div className="bg-[var(--bg-main)] p-4">
                            <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 text-center shadow-sm">
                                <div className="inline-flex rounded-xl border border-[var(--border-card)] bg-white p-3 shadow-sm">
                                    {qrImageSrc ? (
                                        <img
                                            src={qrImageSrc}
                                            crossOrigin="anonymous"
                                            alt="Entry pass QR code"
                                            className="h-40 w-40 rounded-lg object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-40 w-40 animate-pulse items-center justify-center rounded-lg bg-[var(--secondary-lighter)] text-xs text-[var(--text-muted)]">
                                            Loading QR...
                                        </div>
                                    )}
                                </div>

                                <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                                    Scan to download entry pass
                                </p>
                                <p className="mx-auto mt-1 max-w-xs break-all text-[11px] leading-4 text-[var(--text-secondary)]">
                                    {pageUrl}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Barcode Actions
                </h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Download a branded copy or share the entry-pass link directly.
                </p>

                <div className="mt-4 space-y-2">
                    <button
                        onClick={downloadImage}
                        disabled={downloading || !qrReady}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-4 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Download size={16} />
                        Download Image
                    </button>

                    <button
                        onClick={downloadPDF}
                        disabled={downloading || !qrReady}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Download size={16} />
                        Download PDF
                    </button>

                    <button
                        onClick={copyLink}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "Copied!" : "Copy Link"}
                    </button>
                </div>

                <div className="mt-4 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        Entry URL
                    </p>
                    <p className="mt-1 break-all text-xs font-medium text-[var(--text-primary)]">
                        {pageUrl || "-"}
                    </p>
                </div>

                {downloading && (
                    <p className="mt-3 text-center text-xs font-medium text-[var(--primary)]">
                        Processing download...
                    </p>
                )}
            </div>
        </div>
    );
};

export default EntryBarcode;
