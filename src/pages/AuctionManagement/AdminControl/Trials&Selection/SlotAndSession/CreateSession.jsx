import React, { useEffect, useState } from "react";

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

const CreateSession = ({
  isOpen,
  onClose,
  sessionData = {
    name: "",
    slotDate: "",
    slotStartTime: "",
    slotEndTime: "",
    slotSize: "",
    status: "scheduled",
    lockStatus: "unlocked",
  },
  onSessionChange,
  onSave,
  isEditing = false,
  slotName = "",
}) => {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) setErrors({});
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!sessionData.name?.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (
      sessionData.slotStartTime &&
      sessionData.slotEndTime &&
      sessionData.slotStartTime >= sessionData.slotEndTime
    ) {
      newErrors.time = "Start time must be earlier than end time";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    onSessionChange(e);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200 bg-white flex items-center justify-between text-gray-800 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base sm:text-lg font-semibold">
              {isEditing ? "Edit Session" : "Create Session"}
            </h3>
            {slotName && (
              <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Slot: {slotName}
              </div>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-800 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* Session Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={sessionData.name || ""}
              onChange={handleChange}
              className={`w-full p-2.5 sm:p-3 rounded-lg bg-white border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition text-sm sm:text-base`}
              placeholder="Enter session name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                name="slotDate"
                type="date"
                value={formatDateForInput(sessionData.slotDate) || ""}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 rounded-lg bg-white border border-gray-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition text-sm"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                name="slotStartTime"
                type="time"
                value={sessionData.slotStartTime || ""}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 rounded-lg bg-white border border-gray-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition text-sm"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                name="slotEndTime"
                type="time"
                value={sessionData.slotEndTime || ""}
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 rounded-lg bg-white border border-gray-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition text-sm"
              />
            </div>

            {/* Session Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Status
              </label>
              <select
                value={sessionData.status}
                name="status"
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 rounded-lg bg-white border border-gray-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Session Access */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Access
              </label>
              <select
                value={sessionData.lockStatus}
                name="lockStatus"
                onChange={handleChange}
                className="w-full p-2.5 sm:p-3 rounded-lg bg-white border border-gray-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition text-sm"
              >
                <option value="unlocked">Unlock</option>
                <option value="locked">Lock</option>
              </select>
            </div>

            {/* Session Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Size <span className="text-red-500">*</span>
              </label>
              <input
                name="slotSize"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={sessionData.slotSize || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    onSessionChange(e);
                  }
                }}
                className={`w-full p-2.5 sm:p-3 rounded-lg bg-white border ${
                  errors.slotSize ? "border-red-500" : "border-gray-300"
                } focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition text-sm`}
                placeholder="Max players"
              />
              {errors.slotSize && (
                <p className="text-red-500 text-xs mt-1">{errors.slotSize}</p>
              )}
            </div>
          </div>

          {/* Time Error Message */}
          {errors.time && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.time}</p>
            </div>
          )}
        </div>

        {/* Sticky Footer Buttons */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-[var(--color-button-primary)] text-white rounded-lg hover:opacity-90 transition text-sm font-medium"
            >
              {isEditing ? "Save Changes" : "Create Session"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSession;