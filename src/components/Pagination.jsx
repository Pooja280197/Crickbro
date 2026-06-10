import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
  showSummary = true,
  summaryPrefix = "Page",
  prevLabel = "Prev",
  nextLabel = "Next",
}) => {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const handlePrevious = () => {
    if (!isFirstPage && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isLastPage && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`ui-card-soft flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      {showSummary && (
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          {summaryPrefix}{" "}
          <span className="font-semibold text-[var(--text-primary)]">{currentPage}</span>
          {" of "}
          <span className="font-semibold text-[var(--text-primary)]">{totalPages}</span>
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isFirstPage}
          onClick={handlePrevious}
          className={`ui-btn-ghost ${
            isFirstPage
              ? "text-[var(--text-secondary)]"
              : "text-[var(--text-primary)]"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          {prevLabel}
        </button>

        <button
          type="button"
          disabled={isLastPage}
          onClick={handleNext}
          className={`ui-btn-ghost ${
            isLastPage
              ? "text-[var(--text-secondary)]"
              : "text-[var(--text-primary)]"
          }`}
        >
          {nextLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
