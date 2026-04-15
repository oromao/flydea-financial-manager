"use client";

export type UsageEvent = 
  | "import_file"
  | "import_success"
  | "import_review"
  | "quick_add"
  | "category_correct"
  | "budget_create"
  | "close_month"
  | "view_insight"
  | "use_copilot"
  | "export_data";

interface UseMetricsOptions {
  event: UsageEvent;
  metadata?: Record<string, any>;
}

export function useMetrics() {
  const track = async ({ event, metadata }: UseMetricsOptions) => {
    try {
      await fetch("/api/metrics/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, metadata }),
      });
    } catch (e) {
      console.error("[Metrics] Track error:", e);
    }
  };

  return { track };
}

export async function trackEvent(event: UsageEvent, metadata?: Record<string, any>) {
  try {
    await fetch("/api/metrics/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, metadata }),
    });
  } catch (e) {
    console.error("[Metrics] Track error:", e);
  }
}