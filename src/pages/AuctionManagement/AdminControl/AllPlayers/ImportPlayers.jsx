import React, { useRef, useState } from "react";
// import axios from "axios";
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
        className="px-4 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
      >
        Import Players
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white shadow-lg shadow-gray-800 p-6 animate-scaleIn">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Upload Players via Excel
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* DEMO FILE */}
            <div className="mb-4 text-sm">
              <p className="mb-1 text-gray-400">Download demo Excel format:</p>
              <a
                href="/public/File.xlsx"
                download
                className="text-blue-600 underline"
              >
                Download Demo Excel
              </a>
            </div>

            {/* FILE UPLOAD */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current.click()}
              className="w-full mb-2 px-4 py-2 border rounded-lg "
            >
              Choose Excel File
            </button>

            {file && (
              <p className="text-sm text-gray-600 mb-4 truncate">
                Selected: {file.name}
              </p>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!file}
                className={`px-4 py-2 rounded-lg text-white ${
                  file
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportPlayers;
