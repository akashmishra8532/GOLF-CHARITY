import type React from "react";
export function Alert({
  variant = "error",
  title,
  children,
}: {
  variant?: "error" | "success" | "info";
  title?: string;
  children: React.ReactNode;
}) {
  const colors =
    variant === "success"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : variant === "info"
      ? "bg-sky-50 text-sky-800 border-sky-200"
      : "bg-rose-50 text-rose-800 border-rose-200";

  return (
    <div className={`rounded-xl border px-4 py-3 ${colors}`}>
      {title ? <div className="font-semibold">{title}</div> : null}
      <div className="text-sm">{children}</div>
    </div>
  );
}

