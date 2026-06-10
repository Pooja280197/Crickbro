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

  const fieldBase =
    "w-full rounded-lg border bg-[var(--bg-main)] p-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15 sm:p-3";
  const fieldClass = (error) =>
    `${fieldBase} ${error ? "border-red-500" : "border-[var(--border-primary)]"}`;

  return (
    <div className="fixed inset-0 z-[120000] flex items-center justify-center overflow-y-auto bg-black/50 p-3 pt-4 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xl sm:max-h-[88vh]">
        {/* Header - Fixed at top */}
        <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-[var(--border-card)] bg-[var(--bg-card)] p-3 text-[var(--text-primary)] sm:p-4">
        
          <div>
            <h3 className="text-base sm:text-lg font-semibold">
              {isEditing ? "Edit Session" : "Create Session"}
            </h3>
            {slotName && (
              <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                Slot: {slotName}
              </div>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 hover:bg-[var(--secondary-lighter)] rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-[var(--bg-main)] p-3 [scrollbar-color:var(--border-primary)_var(--bg-main)] [scrollbar-width:thin] sm:p-5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border-primary)] [&::-webkit-scrollbar-track]:bg-[var(--bg-main)] [&::-webkit-scrollbar]:w-2">
          {/* Session Name */}
          <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-sm">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={sessionData.name || ""}
              onChange={handleChange}
              className={fieldClass(errors.name)}
              placeholder="Enter session name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Responsive Grid Layout */}
          <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-sm">
            <div className="mb-4 border-b border-[var(--border-card)] pb-3">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                Session Schedule
              </h4>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Set date, time, access status, and player capacity.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Date
              </label>
              <input
                name="slotDate"
                type="date"
                value={formatDateForInput(sessionData.slotDate) || ""}
                onChange={handleChange}
                className={`${fieldBase} border-[var(--border-primary)]`}
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Start Time
              </label>
              <input
                name="slotStartTime"
                type="time"
                value={sessionData.slotStartTime || ""}
                onChange={handleChange}
                className={`${fieldBase} border-[var(--border-primary)]`}
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                End Time
              </label>
              <input
                name="slotEndTime"
                type="time"
                value={sessionData.slotEndTime || ""}
                onChange={handleChange}
                className={`${fieldBase} border-[var(--border-primary)]`}
              />
            </div>

            {/* Session Status */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Session Status
              </label>
              <select
                value={sessionData.status}
                name="status"
                onChange={handleChange}
                className={`${fieldBase} border-[var(--border-primary)]`}
              >
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Session Access */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Session Access
              </label>
              <select
                value={sessionData.lockStatus}
                name="lockStatus"
                onChange={handleChange}
                className={`${fieldBase} border-[var(--border-primary)]`}
              >
                <option value="unlocked">Unlock</option>
                <option value="locked">Lock</option>
              </select>
            </div>

            {/* Session Size */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
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
                className={`w-full p-2.5 sm:p-3 rounded-lg bg-[var(--bg-card)] border ${
                  errors.slotSize ? "border-red-500" : "border-[var(--border-primary)]"
                } focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15 outline-none transition text-sm`}
                placeholder="Max players"
              />
              {errors.slotSize && (
                <p className="text-red-500 text-xs mt-1">{errors.slotSize}</p>
              )}
            </div>
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
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-[var(--border-card)] bg-[var(--bg-soft)] sticky bottom-0">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-soft)] transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-[linear-gradient(135deg,var(--secondary),var(--secondary-strong))] text-[#102033] rounded-lg hover:opacity-90 transition text-sm font-semibold shadow-sm"
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
