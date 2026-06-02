export default function Loader({ text = "Loading...", fullScreen = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center font-main ${fullScreen ? "fixed inset-0 bg-[var(--secondary-dark)]/80 z-50" : "py-10"}`}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--secondary-light)] border-t-[var(--secondary)]"></div>

      <p className="mt-3 text-sm text-[var(--secondary-dark)] opacity-80">
        {text}
      </p>
    </div>
  );
}
