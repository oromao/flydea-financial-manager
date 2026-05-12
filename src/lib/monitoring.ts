/**
 * Monitoring utilities for FlyDea Financial Manager.
 *
 * Provides lightweight metrics tracking, API response time measurement,
 * and structured error reporting. Designed for Vercel/Edge runtime.
 */

type MetricType = "counter" | "histogram" | "gauge";

interface Metric {
  name: string;
  type: MetricType;
  value: number;
  tags?: Record<string, string>;
  timestamp: number;
}

interface APIMetrics {
  path: string;
  method: string;
  statusCode: number;
  durationMs: number;
  userId?: string;
  error?: string;
}

interface ErrorReport {
  message: string;
  code?: string;
  severity: "low" | "medium" | "high" | "critical";
  context?: Record<string, unknown>;
  timestamp: string;
  stack?: string;
}

const metricsBuffer: Metric[] = [];
const MAX_BUFFER = 100;
const isDev = process.env.NODE_ENV === "development";

function flush(): void {
  if (metricsBuffer.length === 0) return;
  const batch = metricsBuffer.splice(0, MAX_BUFFER);

  if (isDev) {
    console.log("[Metrics] Flushing", batch.length, "metrics");
    return;
  }

  // In production, send to external metrics service
  // Ex: POST to custom endpoint, DataDog, New Relic, etc.
  console.log(
    JSON.stringify({
      type: "metrics_batch",
      service: "flydea-financial-manager",
      metrics: batch,
    })
  );
}

export function recordMetric(
  name: string,
  type: MetricType,
  value: number,
  tags?: Record<string, string>
): void {
  metricsBuffer.push({ name, type, value, tags, timestamp: Date.now() });
  if (metricsBuffer.length >= MAX_BUFFER) {
    flush();
  }
}

export function trackAPICall(metrics: APIMetrics): void {
  recordMetric("api_request_duration_ms", "histogram", metrics.durationMs, {
    path: metrics.path,
    method: metrics.method,
    status: String(metrics.statusCode),
  });

  recordMetric("api_request_total", "counter", 1, {
    path: metrics.path,
    method: metrics.method,
    status: String(metrics.statusCode),
  });

  if (metrics.error) {
    recordMetric("api_error_total", "counter", 1, {
      path: metrics.path,
      method: metrics.method,
      error: metrics.error,
    });
  }
}

export function trackEvent(
  event: string,
  tags?: Record<string, string>
): void {
  recordMetric("event_total", "counter", 1, { event, ...tags });
}

export function setGauge(name: string, value: number, tags?: Record<string, string>): void {
  recordMetric(name, "gauge", value, tags);
}

export function reportError(report: ErrorReport): void {
  if (isDev) {
    console.error(`[ErrorReport:${report.severity}] ${report.message}`, report.context ?? "");
    return;
  }

  console.error(
    JSON.stringify({
      type: "error_report",
      service: "flydea-financial-manager",
      ...report,
    })
  );
}

export function flushMetrics(): void {
  flush();
}

if (typeof setInterval !== "undefined") {
  setInterval(flush, 60_000);
}
