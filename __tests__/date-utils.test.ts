import { describe, it, expect } from "vitest";
import { toLocalDateInput, toUtcMidnight } from "../src/lib/date-utils";

// ── toLocalDateInput ───────────────────────────────────────────────────────────

describe("toLocalDateInput", () => {
  it("returns empty string for null", () => {
    expect(toLocalDateInput(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(toLocalDateInput(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(toLocalDateInput("")).toBe("");
  });

  it("converts ISO date string to yyyy-MM-dd", () => {
    expect(toLocalDateInput("2025-04-18T00:00:00.000Z")).toBe("2025-04-18");
  });

  it("preserves yyyy-MM-dd strings as-is", () => {
    expect(toLocalDateInput("2025-04-18")).toBe("2025-04-18");
  });

  it("handles Date objects", () => {
    const d = new Date(2025, 3, 18); // April 18, 2025 local time
    const result = toLocalDateInput(d);
    expect(result).toBe("2025-04-18");
  });

  it("returns empty string for invalid date string", () => {
    expect(toLocalDateInput("not-a-date")).toBe("");
  });

  it("returns empty string for invalid Date object", () => {
    expect(toLocalDateInput(new Date("invalid"))).toBe("");
  });

  it("handles leap year correctly", () => {
    expect(toLocalDateInput("2024-02-29")).toBe("2024-02-29");
  });

  it("handles year-end boundary", () => {
    expect(toLocalDateInput("2025-12-31")).toBe("2025-12-31");
  });

  it("handles year-start boundary", () => {
    expect(toLocalDateInput("2025-01-01")).toBe("2025-01-01");
  });
});

// ── toUtcMidnight ──────────────────────────────────────────────────────────────

describe("toUtcMidnight", () => {
  it("creates a Date at midnight UTC from yyyy-MM-dd string", () => {
    const d = toUtcMidnight("2025-04-18");
    expect(d.getUTCFullYear()).toBe(2025);
    expect(d.getUTCMonth()).toBe(3); // April = 3 (0-indexed)
    expect(d.getUTCDate()).toBe(18);
    expect(d.getUTCHours()).toBe(0);
    expect(d.getUTCMinutes()).toBe(0);
    expect(d.getUTCSeconds()).toBe(0);
    expect(d.getUTCMilliseconds()).toBe(0);
  });

  it("handles January 1st", () => {
    const d = toUtcMidnight("2025-01-01");
    expect(d.getUTCFullYear()).toBe(2025);
    expect(d.getUTCMonth()).toBe(0);
    expect(d.getUTCDate()).toBe(1);
  });

  it("handles December 31st", () => {
    const d = toUtcMidnight("2025-12-31");
    expect(d.getUTCFullYear()).toBe(2025);
    expect(d.getUTCMonth()).toBe(11);
    expect(d.getUTCDate()).toBe(31);
  });

  it("handles leap day", () => {
    const d = toUtcMidnight("2024-02-29");
    expect(d.getUTCFullYear()).toBe(2024);
    expect(d.getUTCMonth()).toBe(1);
    expect(d.getUTCDate()).toBe(29);
  });

  it("returns a Date instance", () => {
    expect(toUtcMidnight("2025-06-15")).toBeInstanceOf(Date);
  });

  it("avoids timezone shift vs new Date(string)", () => {
    const fromUtil = toUtcMidnight("2025-01-15");
    // In UTC-3 timezone, new Date("2025-01-15") would give Jan 14 local time
    // but our util should give Jan 15 UTC
    expect(fromUtil.getUTCDate()).toBe(15);
    expect(fromUtil.getUTCMonth()).toBe(0);
  });

  it("produces time 0:00:00.000 UTC", () => {
    const d = toUtcMidnight("2025-06-15");
    expect(d.getTime()).toBe(Date.UTC(2025, 5, 15, 0, 0, 0, 0));
  });
});
