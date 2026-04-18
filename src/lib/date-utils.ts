import { format, parseISO } from "date-fns";

/**
 * Safely converts any ISO date/Date/null to a yyyy-MM-dd string
 * suitable for an <input type="date" /> value.
 * Returns "" on any failure — never throws.
 */
export function toLocalDateInput(
  isoDate: string | Date | null | undefined
): string {
  if (!isoDate) return "";
  try {
    const d = typeof isoDate === "string" ? parseISO(isoDate) : isoDate;
    if (isNaN(d.getTime())) return "";
    return format(d, "yyyy-MM-dd");
  } catch {
    return "";
  }
}

/**
 * Converts a yyyy-MM-dd string to a UTC midnight Date.
 * Avoids timezone shifts that occur with new Date("yyyy-MM-dd").
 */
export function toUtcMidnight(dateInput: string): Date {
  const [y, m, d] = dateInput.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}
