import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
// import axios from "axios";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { importPlayer } from "../../../../redux/actions";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const ImportPlayers = ({ auctionId }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload an Excel file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      await dispatch(importPlayer(auctionId, formData));
      toast.success("Players uploaded successfully ✅");
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload players ❌");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {/* OPEN POPUP BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
      >
        <Upload className="h-3.5 w-3.5 text-[var(--primary)]" />
        Import Players
      </button>

      {/* MODAL */}
      {open &&
        createPortal(
        <div className="fixed inset-0 z-[120000] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4">
          <div className="w-full max-w-md overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-[var(--border-card)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Import Players
                  </h2>
                  <p className="text-xs font-medium text-[var(--text-secondary)]">
                    Upload an Excel file to add players.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-card)] text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              {/* DEMO FILE */}
              <a
                href="/public/File.xlsx"
                download
                className="flex items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
              >
                <span>Download sample Excel format</span>
                <Download className="h-4 w-4 text-[var(--primary)]" />
              </a>

              {/* FILE UPLOAD */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-6 text-center transition hover:border-[var(--border-primary)] hover:bg-[var(--secondary-lighter)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                  <Upload className="h-5 w-5" />
                </span>
                <span className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                  Choose Excel File
                </span>
                <span className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                  Supports .xlsx and .xls
                </span>
              </button>

              {file && (
                <div className="flex items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] px-3 py-2">
                  <FileSpreadsheet className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                  <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                    {file.name}
                  </p>
                </div>
              )}

              {/* ACTION BUTTONS */}
            </div>
            <div className="flex justify-end gap-2 border-t border-[var(--border-card)] px-4 py-3">
              <button
                onClick={handleClose}
                className="rounded-lg border border-[var(--border-card)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--secondary-lighter)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!file}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  file
                    ? "bg-[var(--secondary)] text-[#102033] hover:bg-[var(--secondary-strong)]"
                    : "bg-[var(--secondary-lighter)] text-[var(--text-secondary)]"
                }`}
              >
                Upload Players
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default ImportPlayers;
