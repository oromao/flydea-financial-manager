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
    // If it's a string that looks like yyyy-MM-dd...
    if (typeof isoDate === "string") {
      // If it contains a T, it's a full ISO string. 
      // To avoid timezone shifts, we just take the first 10 characters if they match yyyy-mm-dd
      if (isoDate.includes("T")) {
        const datePart = isoDate.split("T")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          return datePart;
        }
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
        return isoDate;
      }
    }

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
