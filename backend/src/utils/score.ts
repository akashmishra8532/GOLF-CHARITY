export function validateStablefordScore(value: number) {
  if (!Number.isFinite(value)) throw new Error("Score must be a number");
  if (value < 1 || value > 45) throw new Error("Score must be in range 1-45");
}

export function getMonthRange(drawMonth: string) {
  // drawMonth: YYYY-MM
  const [yearStr, monthStr] = drawMonth.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month || month < 1 || month > 12) throw new Error("Invalid drawMonth format");

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start: new Date(start), end: new Date(end) };
}

