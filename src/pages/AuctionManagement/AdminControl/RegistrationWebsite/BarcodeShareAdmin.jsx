import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { Download, QrCode, Copy, Check } from "lucide-react";
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
        bgGrad.addColorStop(0, "#f7f7ff");
        bgGrad.addColorStop(1, "#eef2ff");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Main card
        const cardX = 40;
        const cardY = 40;
        const cardW = canvas.width - 80;
        const cardH = canvas.height - 80;
        drawRoundedRect(cardX, cardY, cardW, cardH, 28);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#dbe2f7";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Header strip
        const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + 140);
        headerGrad.addColorStop(0, "#2d1b69");
        headerGrad.addColorStop(1, "#3f2d86");
        drawRoundedRect(cardX, cardY, cardW, 140, 28);
        ctx.fillStyle = headerGrad;
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
        ctx.fillStyle = "#e9ddff";
        ctx.fillText(titleText, canvas.width / 2, cardY + 84);

        // Lightweight accent line
        ctx.strokeStyle = "#ded2ff";
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
        ctx.fillStyle = "#f2f5ff";
        ctx.fill();
        ctx.strokeStyle = "#c7d2fe";
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
        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 23px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Scan to Join Auction", canvas.width / 2, qrPanelY + 408);

        ctx.fillStyle = "#6b7280";
        ctx.font = "13px Arial";
        ctx.fillText(pageUrl, canvas.width / 2, qrPanelY + 438);

        // Bottom footer with icon visible below
        const footerY = cardY + cardH - 180;
        ctx.fillStyle = "#8b5cf6";
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
        <div className="w-full z-60 bg-gradient-to-br from-indigo-50 to-purple-100 p-3 rounded-2xl shadow-xl border">
            {/* TEMPLATE */}
            <div
                ref={templateRef}
                className="bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-2xl border"
            >
                {/* 🔥 TOP */}
                <div className="bg-gradient-to-r from-indigo-900 via-purple-800 to-blue-900 text-white px-4 py-3">


                    <h2 className="text-base text-[var(--text-dark)] mt-1 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                        {tournamentName}
                    </h2>
                </div>

                {/* BODY */}
                <div className="p-3 bg-gradient-to-br from-gray-50 to-white">

                    {/* QR CARD */}
                    <div className="relative bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-50 border border-indigo-200 rounded-2xl p-3 text-center shadow-inner">

                        {/* QR */}
                        <div className="bg-[var(--bg-card)] p-2 rounded-xl shadow-md inline-block">
                            {qrImageSrc ? (
                                <img
                                    src={qrImageSrc}
                                    crossOrigin="anonymous"
                                    alt="QR"
                                    className="w-24 h-24 rounded-lg object-contain"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-[var(--secondary-lighter)] animate-pulse rounded-lg flex items-center justify-center text-xs text-[var(--text-muted)]">
                                    Loading QR...
                                </div>
                            )}
                        </div>

                        {/* TEXT */}
                        <p className="text-xs font-semibold text-[var(--text-primary)] mt-2">
                            Scan to Join Auction
                        </p>

                        <p className="text-[9px] text-[var(--text-secondary)] break-all mt-0.5 px-2">
                            {pageUrl}
                        </p>
                    </div>
                </div>
            </div>

            {/* BUTTONS */}
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                <button
                    onClick={downloadImage}
                    disabled={downloading || !qrReady}
                    className="w-full min-h-9 px-2 text-xs whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-1.5 rounded-lg flex items-center justify-center gap-1.5"
                >
                    <Download size={16} />
                    Download Image
                </button>

                <button
                    onClick={downloadPDF}
                    disabled={downloading || !qrReady}
                    className="w-full min-h-9 px-2 text-xs whitespace-nowrap bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-1.5 rounded-lg flex items-center justify-center gap-1.5"
                >
                    <Download size={16} />
                    Download PDF
                </button>

                <button
                    onClick={copyLink}
                    className="w-full min-h-9 px-2 text-xs whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg flex items-center justify-center gap-1.5"
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied!" : "Copy Link"}
                </button>
            </div>

            {downloading && (
                <p className="text-center text-[11px] text-yellow-600 mt-1">
                    Processing download...
                </p>
            )}
        </div>
    );
};

export default BarcodeShareAdmin;