"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type PageViewEvent = {
  type: "page_view";
  path: string;
  referrer: string;
  timestamp: number;
  sessionId: string;
};

type ActionEvent = {
  type: "action";
  action: string;
  label?: string;
  value?: number;
  path: string;
  timestamp: number;
  sessionId: string;
};

type ErrorEvent = {
  type: "error";
  message: string;
  code?: string;
  path: string;
  timestamp: number;
  sessionId: string;
};

type AnalyticsEvent = PageViewEvent | ActionEvent | ErrorEvent;

const STORAGE_KEY = "flydea_analytics_buffer";
const FLUSH_INTERVAL = 30_000;
const MAX_BUFFER_SIZE = 50;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = sessionStorage.getItem("flydea_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("flydea_session_id", sessionId);
  }
  return sessionId;
}

function getBuffer(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBuffer(events: AnalyticsEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_BUFFER_SIZE)));
  } catch {
    const trimmed = events.slice(-Math.floor(MAX_BUFFER_SIZE / 2));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}

async function flushBuffer(): Promise<void> {
  const buffer = getBuffer();
  if (buffer.length === 0) return;

  try {
    const res = await fetch("/api/metrics/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "analytics_batch",
        metadata: { events: buffer },
      }),
    });

    if (res.ok) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Silently fail — will retry on next flush
  }
}

export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPath = useRef(pathname);
  const sessionId = useRef(getSessionId());
  const sessionStart = useRef(Date.now());
  const flushTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      const event: PageViewEvent = {
        type: "page_view",
        path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
        referrer: document.referrer,
        timestamp: Date.now(),
        sessionId: sessionId.current,
      };
      const buffer = getBuffer();
      buffer.push(event);
      saveBuffer(buffer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    flushTimer.current = setInterval(flushBuffer, FLUSH_INTERVAL);
    return () => {
      if (flushTimer.current) clearInterval(flushTimer.current);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const duration = Date.now() - sessionStart.current;
      const buffer = getBuffer();
      buffer.push({
        type: "action",
        action: "session_end",
        value: duration,
        path: pathname,
        timestamp: Date.now(),
        sessionId: sessionId.current,
      } as ActionEvent);
      saveBuffer(buffer);

      const data = getBuffer();
      if (data.length > 0) {
        navigator.sendBeacon(
          "/api/metrics/usage",
          JSON.stringify({
            event: "analytics_batch",
            metadata: { events: data },
          })
        );
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pathname]);

  const trackAction = useCallback((action: string, label?: string, value?: number) => {
    const event: ActionEvent = {
      type: "action",
      action,
      label,
      value,
      path: pathname,
      timestamp: Date.now(),
      sessionId: sessionId.current,
    };
    const buffer = getBuffer();
    buffer.push(event);
    saveBuffer(buffer);
  }, [pathname]);

  const trackError = useCallback((message: string, code?: string) => {
    const event: ErrorEvent = {
      type: "error",
      message,
      code,
      path: pathname,
      timestamp: Date.now(),
      sessionId: sessionId.current,
    };
    const buffer = getBuffer();
    buffer.push(event);
    saveBuffer(buffer);
  }, [pathname]);

  const flush = useCallback(async () => {
    await flushBuffer();
  }, []);

  return { trackAction, trackError, flush };
}
