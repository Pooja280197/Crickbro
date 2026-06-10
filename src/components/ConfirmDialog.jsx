const ConfirmDialog = ({
  open,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {title}
        </h3>

        <p className="text-sm text-slate-400 mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-semibold ${
              danger
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-emerald-500 text-slate-900 hover:bg-emerald-600"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmDialog;
