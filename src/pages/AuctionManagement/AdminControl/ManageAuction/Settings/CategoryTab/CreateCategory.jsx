import React, { useState, useEffect } from "react";

const CreateCategory = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    baseAmount: "",
    biddingIncrement: "",
    maxBid: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        baseAmount: initialData.baseAmount?.toString() || "",
        biddingIncrement: initialData.biddingIncrement?.toString() || "",
        maxBid: initialData.maxBid?.toString() || "",
      });
    } else {
      setForm({
        name: "",
        description: "",
        baseAmount: "",
        biddingIncrement: "",
        maxBid: "",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["baseAmount", "biddingIncrement", "maxBid"].includes(name)) {
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Category name is required";

    if (!form.baseAmount.trim()) {
      newErrors.baseAmount = "Base amount is required";
    } else if (Number(form.baseAmount) <= 0) {
      newErrors.baseAmount = "Base amount must be positive";
    }

    if (!form.biddingIncrement.trim()) {
      newErrors.biddingIncrement = "Bid increment is required";
    } else if (Number(form.biddingIncrement) <= 0) {
      newErrors.biddingIncrement = "Bid increment must be positive";
    }

    if (!form.maxBid.trim()) {
      newErrors.maxBid = "Maximum bid is required";
    } else if (Number(form.maxBid) <= 0) {
      newErrors.maxBid = "Maximum bid must be positive";
    }

    if (
      form.baseAmount &&
      form.maxBid &&
      Number(form.maxBid) <= Number(form.baseAmount)
    ) {
      newErrors.maxBid = "Max bid must be greater than base amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.({
        ...form,
        baseAmount: Number(form.baseAmount),
        biddingIncrement: Number(form.biddingIncrement),
        maxBid: Number(form.maxBid),
      });
      onClose?.();
    } catch (error) {
      setErrors({ submit: "Failed to save category. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-lg bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl shadow-2xl border border-[var(--border-card)] overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        
        {/* HEADER - Fixed at top */}
        <div className="p-4 sm:p-6 border-b border-[var(--border-card)] flex items-center justify-between bg-[var(--bg-card)] flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold">
            {initialData ? "Edit Category" : "Create Category"}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl sm:text-2xl transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--secondary-lighter)]"
            disabled={isSubmitting}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* BODY - Scrollable area */}
        <div className="professional-scrollbar flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 [scrollbar-gutter:stable] sm:space-y-6 sm:p-6">
          
          {/* CATEGORY NAME */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1.5 sm:mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full p-2.5 sm:p-3 text-sm sm:text-base rounded-lg bg-[var(--bg-card)] border ${
                errors.name ? "border-red-500" : "border-[var(--border-primary)]"
              } focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition disabled:bg-[var(--bg-soft)] disabled:cursor-not-allowed`}
              placeholder="Enter category name"
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-red-500 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1.5 sm:mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition min-h-[80px] sm:min-h-[100px] disabled:bg-[var(--bg-soft)] disabled:cursor-not-allowed"
              placeholder="Optional description"
              disabled={isSubmitting}
            />
          </div>

          {/* AMOUNTS */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            
            {/* Base Amount */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1.5 sm:mb-2">
                Base Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm sm:text-base">
                  ₹
                </span>
                <input
                  type="text"
                  name="baseAmount"
                  inputMode="decimal"
                  value={form.baseAmount}
                  onChange={handleChange}
                  className={`w-full p-2.5 sm:p-3 pl-7 sm:pl-8 text-sm sm:text-base rounded-lg bg-[var(--bg-card)] border ${
                    errors.baseAmount ? "border-red-500" : "border-[var(--border-primary)]"
                  } focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition disabled:bg-[var(--bg-soft)] disabled:cursor-not-allowed`}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.baseAmount}
                  aria-describedby={errors.baseAmount ? "baseAmount-error" : undefined}
                />
              </div>
              {errors.baseAmount && (
                <p id="baseAmount-error" className="text-red-500 text-xs mt-1">
                  {errors.baseAmount}
                </p>
              )}
            </div>

            {/* Bid Increment */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1.5 sm:mb-2">
                Bid Increment <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm sm:text-base">
                  ₹
                </span>
                <input
                  type="text"
                  name="biddingIncrement"
                  inputMode="decimal"
                  value={form.biddingIncrement}
                  onChange={handleChange}
                  className={`w-full p-2.5 sm:p-3 pl-7 sm:pl-8 text-sm sm:text-base rounded-lg bg-[var(--bg-card)] border ${
                    errors.biddingIncrement ? "border-red-500" : "border-[var(--border-primary)]"
                  } focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition disabled:bg-[var(--bg-soft)] disabled:cursor-not-allowed`}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.biddingIncrement}
                  aria-describedby={errors.biddingIncrement ? "biddingIncrement-error" : undefined}
                />
              </div>
              {errors.biddingIncrement && (
                <p id="biddingIncrement-error" className="text-red-500 text-xs mt-1">
                  {errors.biddingIncrement}
                </p>
              )}
            </div>

            {/* Maximum Bid */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1.5 sm:mb-2">
                Maximum Bid <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm sm:text-base">
                  ₹
                </span>
                <input
                  type="text"
                  name="maxBid"
                  inputMode="decimal"
                  value={form.maxBid}
                  onChange={handleChange}
                  className={`w-full p-2.5 sm:p-3 pl-7 sm:pl-8 text-sm sm:text-base rounded-lg bg-[var(--bg-card)] border ${
                    errors.maxBid ? "border-red-500" : "border-[var(--border-primary)]"
                  } focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition disabled:bg-[var(--bg-soft)] disabled:cursor-not-allowed`}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.maxBid}
                  aria-describedby={errors.maxBid ? "maxBid-error" : undefined}
                />
              </div>
              {errors.maxBid && (
                <p id="maxBid-error" className="text-red-500 text-xs mt-1">
                  {errors.maxBid}
                </p>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs sm:text-sm">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* ACTIONS - Fixed at bottom */}
        <div className="p-4 sm:p-6 border-t border-[var(--border-card)] bg-[var(--bg-card)] flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 bg-[var(--secondary-lighter)] text-[var(--text-primary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--secondary-lighter)] transition disabled:opacity-50 font-medium text-sm sm:text-base"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2.5 sm:py-2 bg-[var(--color-button-primary)] text-[var(--text-dark)] rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : initialData ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
