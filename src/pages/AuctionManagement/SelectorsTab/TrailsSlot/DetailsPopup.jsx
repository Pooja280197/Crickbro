const DetailsPopup = ({ slot, onClose }) => {
  if (!slot) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative h-full w-full overflow-y-auto">
        <div className="min-h-full flex justify-center items-start p-4 pt-16 pb-10 mt-10">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6">

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {slot.slotName}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Slot Code:{" "}
                <span className="text-gray-700 font-medium">
                  {slot.slotCode}
                </span>
              </p>
            </div>

            {/* Slot Meta */}
            <div className="grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2 border border-gray-200">
              <p>
                <b className="text-gray-600">Type:</b> {slot.slotType}
              </p>
              <p>
                <b className="text-gray-600">Country:</b>{" "}
                {slot.location?.country}
              </p>
              <p className="sm:col-span-2">
                <b className="text-gray-600">Venue:</b>{" "}
                {slot.location?.venue}, {slot.location?.city},{" "}
                {slot.location?.state}
              </p>
            </div>

            {/* Match Status */}
            <div className="mt-4">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  slot.slotMatched
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {slot.slotMatched ? "Slot Matched" : "Not Matched"}
              </span>
            </div>

            {/* Sessions */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-gray-700">
                Sessions
              </h4>

              <div className="space-y-3">
                {slot.sessions.map((s) => (
                  <div
                    key={s.sessionId}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                  >
                    <p className="text-sm font-semibold text-gray-800">
                      {s.sessionName}
                    </p>

                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p>
                        📅 {new Date(s.slotDate).toLocaleDateString()}
                      </p>
                      <p>
                        ⏰ {s.slotStartTime} – {s.slotEndTime}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs text-yellow-700">
                        {s.status}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs ${
                          s.lockStatus === "locked"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {s.lockStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
export default DetailsPopup;