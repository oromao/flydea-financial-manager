import { NextResponse, NextRequest } from "next/server";
import { AgentQueue } from "@/infrastructure/services/AgentQueue";

const CRON_SECRET = process.env.CRON_SECRET || "development";

/**
 * Daily agent processor (runs once per day via Vercel cron)
 * Processes all active agents in a queue with retry logic
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const queue = new AgentQueue();

    // Get metrics before processing
    const metricsBefore = await queue.getMetrics();

    // Enqueue all active agents
    const items = await queue.enqueueAllActive();

    // Process queue
    const result = await queue.processQueue(items);

    // Get metrics after processing
    const metricsAfter = await queue.getMetrics();

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        metrics: {
          before: metricsBefore,
          after: metricsAfter,
        },
        results: {
          executed: result.executed.length,
          failed: result.failed.length,
          queued: result.queued.length,
          agents: {
            executed: result.executed,
            failed: result.failed,
            queued: result.queued,
            errors: result.errors,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[AgentScheduler] Critical error:", message);

    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger for development/testing
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Manual trigger only in development" },
      { status: 405 }
    );
  }

  try {
    const queue = new AgentQueue();
    const items = await queue.enqueueAllActive();
    const result = await queue.processQueue(items);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        executed: result.executed.length,
        failed: result.failed.length,
        agents: result,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
