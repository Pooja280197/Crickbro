import React, { useEffect, useRef, useState } from "react";
import { X, Camera, AlertCircle, RotateCcw } from "lucide-react";
import QrScanner from "qr-scanner";

// Set the worker path to use CDN (prevents Vite dynamic import issues)
QrScanner.WORKER_PATH = 'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner-worker.min.js';

const BarcodeScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const qrScannerRef = useRef(null);

  const getErrorMessage = (err) => {
    const errorString = err?.message || err?.toString() || "";
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const isHTTPS = window.location.protocol === "https:";
    
    // HTTPS requirement
    if (errorString.includes("only accessible if the page is transferred via https")) {
      return {
        message: "HTTPS is required to access the camera in production.",
        userAction: isLocalhost 
          ? "Try accessing via http://localhost:3000 (HTTP is allowed locally)"
          : "Your page must be served over HTTPS to use the camera",
        canRetry: false,
      };
    }
    
    // Permission denied errors
    if (
      errorString.includes("Permission denied") ||
      errorString.includes("NotAllowedError") ||
      errorString.includes("PERMISSION_DENIED")
    ) {
      return {
        message: "Camera permission denied. Please enable camera access in your browser settings.",
        userAction: "Grant camera permission and try again",
        canRetry: true,
      };
    }
    
    // No camera found / Worker loading issues
    if (
      errorString.includes("NotFoundError") ||
      errorString.includes("No camera") ||
      errorString.includes("camera not found") ||
      errorString.includes("Failed to fetch") ||
      errorString.includes("worker")
    ) {
      return {
        message: "Camera not accessible. This could be a browser, permission, or device issue.",
        userAction: "1. Check camera permissions\n2. Try a different browser\n3. Ensure an HTTPS connection (in production)\n4. Restart your browser",
        canRetry: true,
      };
    }
    
    // Camera in use
    if (errorString.includes("NotReadableError") || errorString.includes("in use")) {
      return {
        message: "Camera is in use by another application. Close other apps using the camera.",
        userAction: "Close other camera apps and try again",
        canRetry: true,
      };
    }
    
    // Generic fallback
    return {
      message: errorString || "Failed to start camera. Please check camera permissions.",
      userAction: "Check camera permissions and try again",
      canRetry: true,
    };
  };

  const handleRetry = async () => {
    setError(null);
    setErrorDetails(null);
    setScanning(true);
    // Trigger startScanning again by re-running the effect
    if (videoRef.current) {
      startScanning();
    }
  };

  const findRearCameraIndex = (devices) => {
    const backLabels = ["back", "rear", "environment"];
    return devices.findIndex((device) => {
      const label = device?.label?.toLowerCase() || "";
      return backLabels.some((term) => label.includes(term));
    });
  };

  const startScanning = async () => {
    try {
      setError(null);
      setErrorDetails(null);

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          // When barcode is scanned, call onScan callback
          if (result?.data) {
            onScan(result.data);
            // Stop scanning and close
            if (qrScannerRef.current) {
              qrScannerRef.current.stop();
            }
            onClose();
          }
        },
        {
          onDecoded: (result) => {
            if (result?.data) {
              onScan(result.data);
              if (qrScannerRef.current) {
                qrScannerRef.current.stop();
              }
              onClose();
            }
          },
          preferredCamera: "rear",
          highlightCodeOutline: true,
          highlightScanRegion: true,
          maxScansPerSecond: 5,
        }
      );

      await qrScannerRef.current.start();

      const devices = await QrScanner.listCameras(true);
      setCameras(devices);

      if (devices.length > 0) {
        const rearIndex = findRearCameraIndex(devices);
        const selectedIndex = rearIndex !== -1 ? rearIndex : 0;
        setCurrentIndex(selectedIndex);

        const selectedCamera = devices[selectedIndex];
        if (selectedCamera?.id) {
          await qrScannerRef.current.setCamera(selectedCamera.id);
        }
      }

      setScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      const details = getErrorMessage(err);
      setError(details.message);
      setErrorDetails(details);
      setScanning(false);
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;

    startScanning();

    return () => {
      if (qrScannerRef.current) {
        try {
          qrScannerRef.current.stop();
          qrScannerRef.current.destroy();
        } catch (err) {
          console.warn("Error stopping scanner:", err);
        }
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0  bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="relative w-full max-w-md bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* Close + Switch Buttons */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {cameras.length > 1 && (
            <button
              onClick={async () => {
                if (!qrScannerRef.current || cameras.length < 2) return;
                try {
                  await qrScannerRef.current.stop();
                  const nextIndex = (currentIndex + 1) % cameras.length;
                  setCurrentIndex(nextIndex);
                  await qrScannerRef.current.setCamera(cameras[nextIndex].id);
                  await qrScannerRef.current.start();
                } catch (switchError) {
                  console.error("Switch camera error:", switchError);
                }
              }}
              className="bg-white/90 rounded-full p-2 hover:bg-white transition"
              aria-label="Switch camera"
            >
              <RotateCcw size={20} className="text-black" />
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-white/90 rounded-full p-2 hover:bg-white transition"
            aria-label="Close"
          >
            <X size={20} className="text-black" />
          </button>
        </div>

        {/* Header */}
        <div className="bg-gray-900 p-4 text-center border-b border-gray-700">
          <h2 className="text-white font-semibold flex items-center justify-center gap-2">
            <Camera size={18} />
            Scan Player Barcode
          </h2>
        </div>

        {/* Scanner Area */}
        <div className="relative w-full aspect-square bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-center p-6 space-y-4">
              <AlertCircle size={48} className="text-red-500 mx-auto" />
              <div>
                <p className="text-red-500 mb-2 text-sm font-semibold">{error}</p>
                {errorDetails?.userAction && (
                  <p className="text-gray-400 text-xs whitespace-pre-wrap">{errorDetails.userAction}</p>
                )}
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                {errorDetails?.canRetry && (
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                  >
                    <RotateCcw size={14} />
                    Retry
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ display: "block" }}
            />
          )}

          {/* Scanner Frame Overlay */}
          {scanning && !error && (
            <div className="absolute inset-0 border-4 border-green-500 pointer-events-none flex items-center justify-center">
              <div className="absolute inset-8 border-2 border-dashed border-green-500/50" />
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500" />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-900 p-4 text-center border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            {scanning ? "📷 Point camera at barcode / QR code to scan" : "Starting camera..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
