export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      aria-label="Loading"
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
      style={{ width: size, height: size }}
    />
  );
}

