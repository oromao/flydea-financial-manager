export function safeDate(value: unknown, fallback = ""): Date | string {
  if (!value || value === null || value === undefined) return fallback;
  try {
    const d = new Date(value as string);
    if (isNaN(d.getTime())) return fallback;
    return d;
  } catch {
    return fallback;
  }
}

export function formatDate(value: unknown, pattern = "dd/MM/yyyy", fallback = "—"): string {
  const d = safeDate(value);
  if (typeof d === "string") return fallback;
  try {
    return new Intl.DateTimeFormat("pt-BR").format(d);
  } catch {
    return fallback;
  }
}

export function safeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || isNaN(Number(value))) return fallback;
  return Number(value);
}