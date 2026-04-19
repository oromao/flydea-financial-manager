import { NextResponse, NextRequest } from "next/server";
import { AgentScheduler } from "@/infrastructure/services/AgentScheduler";

// Vercel cron secret - should be set in environment
const CRON_SECRET = process.env.CRON_SECRET || "development";

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const scheduler = new AgentScheduler();
    const result = await scheduler.runDueAgents();

    return NextResponse.json({
      success: true,
      executed: result.executed,
      failed: result.failed,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Cron job failed:", message);

    return NextResponse.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Allow manual triggering in development
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const scheduler = new AgentScheduler();
    const result = await scheduler.runDueAgents();

    return NextResponse.json({
      success: true,
      executed: result.executed,
      failed: result.failed,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Manual cron trigger failed:", message);

    return NextResponse.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
