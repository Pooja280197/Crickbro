const SlotCard = ({ slot, onClick }) => {
  const session =
    slot.sessions && slot.sessions.length > 0 ? slot.sessions[0] : null;

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[var(--color-primary)]"
    >
      {/* Accent Left Bar */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[var(--color-primary)] opacity-0 transition group-hover:opacity-100" />

      {/* Title */}
      <h3 className="truncate text-base font-semibold text-gray-800">
        Slot Name -{slot.slotName}
      </h3>

      {session && (
        <div className="mt-3 space-y-1.5">
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <span>📅</span>
            Date -{new Date(session.slotDate).toLocaleDateString()}
          </p>

          <p className="flex items-center gap-2 text-sm text-gray-500">
            <span>⏰</span>
            Timing - {session.slotStartTime} – {session.slotEndTime}
          </p>

          <span
            className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              session.status === "ongoing"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            Status - {session.status}
          </span>
        </div>
      )}

      {/* CTA */}
      <div className="mt-4 flex items-center justify-end text-xs font-medium text-[var(--color-primary)] transition group-hover:translate-x-1">
        View details →
      </div>
    </div>
  );
};

export default SlotCard;
