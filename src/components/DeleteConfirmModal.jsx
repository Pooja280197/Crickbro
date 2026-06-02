import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const DeleteConfirmModal = ({
  open,
  title = "Delete Item",
  description = "Are you sure you want to delete this? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl font-main"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <h2 className="text-lg font-heading font-bold text-[var(--secondary-dark)]">
            {title}
          </h2>

          <p className="text-sm text-[var(--secondary-dark)] mt-2">
            {description}
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accent-light)] hover:text-[var(--secondary-dark)] disabled:opacity-50 font-semibold transition-colors"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-white hover:bg-[var(--primary)] disabled:opacity-50 font-semibold transition-colors"
            >
              {loading ? "Deleting..." : confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
