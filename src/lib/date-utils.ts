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

/**
 * Safely formats a date string/Date to dd/MM/yy.
 * Returns fallback on any invalid input — never throws.
 */
export function safeFormatDate(
  dateInput: string | Date | null | undefined,
  fmt: string = "dd/MM/yy",
  fallback: string = "—"
): string {
  if (!dateInput) return fallback;
  try {
    let d: Date;
    if (typeof dateInput === "string") {
      // Handle ISO strings (with or without time)
      const isoStr = dateInput.includes("T") ? dateInput.split("T")[0] : dateInput;
      // Validate the string looks like yyyy-MM-dd
      if (!/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return fallback;
      // Use UTC to avoid timezone shifts
      const [y, m, day] = isoStr.split("-").map(Number);
      d = new Date(Date.UTC(y, m - 1, day, 12, 0, 0));
    } else {
      d = dateInput;
    }
    if (isNaN(d.getTime())) return fallback;
    return format(d, fmt);
  } catch {
    return fallback;
  }
}

/**
 * Safely converts a date to timestamp for sorting.
 * Returns 0 on any invalid input — never throws.
 */
export function safeDateSortKey(
  dateInput: string | Date | null | undefined
): number {
  if (!dateInput) return 0;
  try {
    let d: Date;
    if (typeof dateInput === "string") {
      const isoStr = dateInput.includes("T") ? dateInput.split("T")[0] : dateInput;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return 0;
      const [y, m, day] = isoStr.split("-").map(Number);
      d = new Date(Date.UTC(y, m - 1, day, 12, 0, 0));
    } else {
      d = dateInput;
    }
    if (isNaN(d.getTime())) return 0;
    return d.getTime();
  } catch {
    return 0;
  }
}
