/**
 * API Monitoring Middleware
 *
 * Wraps Next.js API route handlers with response time tracking
 * and structured error reporting.
 */

import { NextResponse } from "next/server";
import { trackAPICall, reportError } from "./monitoring";

type RouteHandler = (
  req: Request,
  context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

interface MonitoringOptions {
  path?: string;
  captureResponse?: boolean;
}

export function withMonitoring(
  handler: RouteHandler,
  options: MonitoringOptions = {}
): RouteHandler {
  return async (req, context) => {
    const start = performance.now();
    const url = new URL(req.url);
    const path = options.path ?? url.pathname;

    try {
      const response = await handler(req, context);
      const durationMs = Math.round(performance.now() - start);

      trackAPICall({
        path,
        method: req.method,
        statusCode: response.status,
        durationMs,
      });

      if (options.captureResponse && response.headers) {
        response.headers.set("X-Response-Time-MS", String(durationMs));
      }

      return response;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      trackAPICall({
        path,
        method: req.method,
        statusCode: 500,
        durationMs,
        error: errorMessage,
      });

      reportError({
        message: errorMessage,
        severity: "high",
        context: { path, method: req.method },
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }
  };
}
