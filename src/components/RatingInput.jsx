const RatingInput = ({
  label,
  value,
  setValue,
}) => {
  return (
    <div className="space-y-1 font-main">
      <div className="flex justify-between">
        <span className="font-semibold text-[var(--secondary-dark)]">{label}</span>
        <span className="text-sm text-[var(--secondary)]">{value}/10</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => value > 0 && setValue(value - 1)}
          className="w-8 h-8 rounded-full bg-[var(--secondary-light)] hover:bg-[var(--secondary)] text-[var(--secondary-dark)] hover:text-white flex items-center justify-center font-bold transition-colors"
        >
          -
        </button>

        <input
          type="range"
          min={0}
          max={10}
          value={value}
          onChange={(e) => setValue(+e.target.value)}
          className="w-full cursor-pointer accent-[var(--primary)]"
        />

        <button
          type="button"
          onClick={() => value < 10 && setValue(value + 1)}
          className="w-8 h-8 rounded-full bg-[var(--secondary-light)] hover:bg-[var(--secondary)] text-[var(--secondary-dark)] hover:text-white flex items-center justify-center font-bold transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default RatingInput;